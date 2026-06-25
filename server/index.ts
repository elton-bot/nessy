// Nessy production sync server.
// Postgres-backed authoritative state, per-household RLS, PIN auth with session
// cookies, and realtime push over SSE driven by Postgres LISTEN/NOTIFY.
import express, { type Request, type Response, type NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import pg from 'pg'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { reducer, type Action } from '../src/domain/reducer'
import {
  pool, withHousehold, migrate, seedDemo, verifyPin, newToken,
} from './db'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SESSION_DAYS = 30
const COOKIE = 'nessy_session'

const app = express()
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())

// API responses must never be cached — otherwise a proxy/browser can serve a
// stale snapshot to the polling client and changes never cross devices.
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next() })

app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true }) }
  catch { res.status(503).json({ ok: false }) }
})

// ---------- auth ----------
interface Auth { householdId: string; member: string }

async function resolveSession(token?: string): Promise<Auth | null> {
  if (!token) return null
  const r = await pool.query(
    `SELECT household_id, member_name FROM sessions
     WHERE token = $1 AND expires_at > now()`,
    [token],
  )
  if (r.rowCount === 0) return null
  return { householdId: r.rows[0].household_id, member: r.rows[0].member_name }
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = await resolveSession(req.cookies?.[COOKIE])
  if (!auth) return res.status(401).json({ error: 'unauthenticated' })
  ;(req as any).auth = auth
  next()
}

app.post('/api/auth/login', async (req, res) => {
  const { household = 'reyes', name, pin } = req.body || {}
  if (!name || !pin) return res.status(400).json({ error: 'name and pin required' })
  try {
    const member = await withHousehold(household, async (c) => {
      const r = await c.query(
        `SELECT id, name, pin_hash FROM members WHERE household_id = $1 AND name = $2`,
        [household, name],
      )
      return r.rows[0]
    })
    if (!member || !verifyPin(String(pin), member.pin_hash)) {
      return res.status(401).json({ error: 'invalid credentials' })
    }
    const token = newToken()
    await pool.query(
      `INSERT INTO sessions (token, member_id, household_id, member_name, expires_at)
       VALUES ($1, $2, $3, $4, now() + ($5 || ' days')::interval)`,
      [token, member.id, household, member.name, String(SESSION_DAYS)],
    )
    res.cookie(COOKIE, token, {
      httpOnly: true, sameSite: 'lax', maxAge: SESSION_DAYS * 864e5,
      secure: process.env.NODE_ENV === 'production',
    })
    res.json({ householdId: household, member: member.name })
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'login failed' })
  }
})

app.post('/api/auth/logout', async (req, res) => {
  const token = req.cookies?.[COOKIE]
  if (token) await pool.query('DELETE FROM sessions WHERE token = $1', [token])
  res.clearCookie(COOKIE).json({ ok: true })
})

app.get('/api/auth/me', async (req, res) => {
  const auth = await resolveSession(req.cookies?.[COOKIE])
  if (!auth) return res.status(401).json({ error: 'unauthenticated' })
  res.json(auth)
})

// ---------- state ----------
async function loadSnapshot(householdId: string) {
  return withHousehold(householdId, async (c) => {
    const r = await c.query(
      'SELECT version, state FROM household_state WHERE household_id = $1',
      [householdId],
    )
    return r.rows[0] ? { version: r.rows[0].version, state: r.rows[0].state } : null
  })
}

app.get('/api/state', requireAuth, async (req, res) => {
  const { householdId } = (req as any).auth as Auth
  const snap = await loadSnapshot(householdId)
  if (!snap) return res.status(404).json({ error: 'no state' })
  res.json(snap)
})

app.get('/api/activity', requireAuth, async (req, res) => {
  const { householdId } = (req as any).auth as Auth
  const rows = await withHousehold(householdId, async (c) => {
    const r = await c.query(
      `SELECT actor, type, extract(epoch from at) * 1000 AS at
       FROM events WHERE household_id = $1 ORDER BY id DESC LIMIT 12`,
      [householdId],
    )
    return r.rows
  })
  res.json({ activity: rows.map(r => ({ actor: r.actor, type: r.type, at: Number(r.at) })) })
})

app.post('/api/action', requireAuth, async (req, res) => {
  const { householdId, member } = (req as any).auth as Auth
  const action = req.body?.action as Action
  if (!action || typeof action.type !== 'string') {
    return res.status(400).json({ error: 'invalid action' })
  }
  try {
    const snap = await withHousehold(householdId, async (c) => {
      const cur = await c.query(
        'SELECT version, state FROM household_state WHERE household_id = $1 FOR UPDATE',
        [householdId],
      )
      if (cur.rowCount === 0) throw new Error('no state')
      const next = reducer(cur.rows[0].state, action)
      const version = cur.rows[0].version + 1
      await c.query(
        'UPDATE household_state SET version = $2, state = $3, updated_at = now() WHERE household_id = $1',
        [householdId, version, JSON.stringify(next)],
      )
      await c.query(
        'INSERT INTO events (household_id, actor, type, payload) VALUES ($1, $2, $3, $4)',
        [householdId, member, action.type, JSON.stringify(action)],
      )
      // realtime fan-out signal (atomic with the write)
      await c.query("SELECT pg_notify('nessy_events', $1)",
        [JSON.stringify({ householdId, version })])
      return { version, state: next }
    })
    res.json(snap)
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'action failed' })
  }
})

// ---------- realtime: SSE backed by Postgres LISTEN/NOTIFY ----------
const subscribers = new Map<string, Set<Response>>()

function broadcast(householdId: string, version: number) {
  const set = subscribers.get(householdId)
  if (!set) return
  const line = `event: version\ndata: ${version}\n\n`
  for (const res of set) res.write(line)
}

app.get('/api/state/stream', requireAuth, (req, res) => {
  const { householdId } = (req as any).auth as Auth
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    // Disable proxy buffering (Render/nginx) — without this, SSE events are
    // buffered and never reach the client, which looks like "not syncing".
    'X-Accel-Buffering': 'no',
  })
  res.flushHeaders?.()
  res.write('retry: 3000\n\n')

  let set = subscribers.get(householdId)
  if (!set) { set = new Set(); subscribers.set(householdId, set) }
  set.add(res)

  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25_000)
  req.on('close', () => { clearInterval(heartbeat); set!.delete(res) })
})

async function startListener() {
  // dedicated client kept open for NOTIFY delivery
  const client = await pool.connect()
  client.on('notification', (msg: pg.Notification) => {
    try {
      const { householdId, version } = JSON.parse(msg.payload || '{}')
      if (householdId) broadcast(householdId, version)
    } catch { /* ignore */ }
  })
  await client.query('LISTEN nessy_events')
  console.log('listening for nessy_events')
}

// ---------- serve the built SPA (single-origin production) ----------
const distDir = join(__dirname, '..', 'dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(join(distDir, 'index.html'))
  })
}

const PORT = Number(process.env.PORT) || 5181
async function main() {
  await migrate()
  await seedDemo()
  await startListener()
  app.listen(PORT, () => console.log(`nessy on :${PORT}`))
}
main().catch(e => { console.error(e); process.exit(1) })
