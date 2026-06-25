import pg from 'pg'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { buildSeed } from '../src/domain/seed'
import type { HouseholdState } from '../src/domain/types'

const __dirname = dirname(fileURLToPath(import.meta.url))

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://nessy_app:nessy_dev_pw@localhost:5432/nessy'
// Managed Postgres (Render/Neon/Supabase) needs TLS; local Postgres does not.
const needsSsl = !/localhost|127\.0\.0\.1/.test(connectionString)

export const pool = new pg.Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
})

/** Run a transaction scoped to one household so every RLS policy applies. */
export async function withHousehold<T>(
  householdId: string,
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    // set_config(..., true) => LOCAL to this transaction; drives RLS policies.
    await client.query('SELECT set_config($1, $2, true)', ['app.household_id', householdId])
    const out = await fn(client)
    await client.query('COMMIT')
    return out
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

// ---------- password (PIN) hashing ----------
export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(pin, salt, 32).toString('hex')
  return `${salt}:${hash}`
}
export function verifyPin(pin: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const test = scryptSync(pin, salt, 32)
  const known = Buffer.from(hash, 'hex')
  return test.length === known.length && timingSafeEqual(test, known)
}

export const newToken = () => randomBytes(24).toString('hex')

// ---------- migration + demo seed ----------
const DEMO_HOUSEHOLD = 'reyes'
const DEMO_MEMBERS = ['Liza', 'Andre', 'Joaquin', 'Maria']
const DEMO_PIN = '1234'

export async function migrate() {
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(sql)
}

export async function seedDemo() {
  await pool.query(
    `INSERT INTO households (id, name) VALUES ($1, $2)
     ON CONFLICT (id) DO NOTHING`,
    [DEMO_HOUSEHOLD, 'The Reyes home'],
  )
  await withHousehold(DEMO_HOUSEHOLD, async (c) => {
    for (const name of DEMO_MEMBERS) {
      await c.query(
        `INSERT INTO members (household_id, name, pin_hash) VALUES ($1, $2, $3)
         ON CONFLICT (household_id, name) DO NOTHING`,
        [DEMO_HOUSEHOLD, name, hashPin(DEMO_PIN)],
      )
    }
    const existing = await c.query('SELECT 1 FROM household_state WHERE household_id = $1', [DEMO_HOUSEHOLD])
    if (existing.rowCount === 0) {
      const seed: HouseholdState = buildSeed()
      await c.query(
        `INSERT INTO household_state (household_id, version, state) VALUES ($1, 1, $2)`,
        [DEMO_HOUSEHOLD, JSON.stringify(seed)],
      )
    }
  })
}
