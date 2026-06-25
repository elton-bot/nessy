// Nessy sync server — authoritative household state, shared by every device.
// Runs the SAME pure reducer as the client (src/domain/reducer.ts), so the ERP
// rules can never drift between server and app.
import express from 'express'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { reducer, type Action } from '../src/domain/reducer'
import { buildSeed } from '../src/domain/seed'
import type { HouseholdState } from '../src/domain/types'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
mkdirSync(DATA_DIR, { recursive: true })

interface Stored { version: number; state: HouseholdState; activity: Activity[] }
interface Activity { actor: string; type: string; at: number }

const file = (id: string) => join(DATA_DIR, `${id.replace(/[^a-z0-9_-]/gi, '')}.json`)
const cache = new Map<string, Stored>()

function load(id: string): Stored {
  if (cache.has(id)) return cache.get(id)!
  let stored: Stored
  if (existsSync(file(id))) {
    stored = JSON.parse(readFileSync(file(id), 'utf8'))
  } else {
    stored = { version: 1, state: buildSeed(), activity: [] }
    writeFileSync(file(id), JSON.stringify(stored))
  }
  cache.set(id, stored)
  return stored
}

function persist(id: string, stored: Stored) {
  cache.set(id, stored)
  writeFileSync(file(id), JSON.stringify(stored))
}

const app = express()
app.use(express.json({ limit: '2mb' }))

app.get('/api/household/:id', (req, res) => {
  const s = load(req.params.id)
  res.json({ version: s.version, state: s.state })
})

app.get('/api/household/:id/version', (req, res) => {
  const s = load(req.params.id)
  res.json({ version: s.version })
})

app.get('/api/household/:id/activity', (req, res) => {
  const s = load(req.params.id)
  res.json({ activity: s.activity.slice(0, 12) })
})

app.post('/api/household/:id/action', (req, res) => {
  const id = req.params.id
  const { action, actor } = req.body as { action: Action; actor?: string }
  if (!action || typeof action.type !== 'string') {
    return res.status(400).json({ error: 'invalid action' })
  }
  const prev = load(id)
  const nextState = reducer(prev.state, action)
  const activity: Activity[] = [
    { actor: actor || 'Someone', type: action.type, at: Date.now() },
    ...prev.activity,
  ].slice(0, 50)
  const next: Stored = { version: prev.version + 1, state: nextState, activity }
  persist(id, next)
  res.json({ version: next.version, state: next.state })
})

const PORT = Number(process.env.PORT) || 5181
app.listen(PORT, () => console.log(`nessy sync server on :${PORT}`))
