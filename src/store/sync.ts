import type { HouseholdState } from '../domain/types'
import type { Action } from '../domain/reducer'

export const HOUSEHOLD_ID = 'reyes'
const BASE = '/api/household'

export interface Snapshot { version: number; state: HouseholdState }

async function jsonOrNull<T>(p: Promise<Response>): Promise<T | null> {
  try {
    const res = await p
    if (!res.ok) return null
    return (await res.json()) as T
  } catch { return null }
}

export const fetchSnapshot = (id = HOUSEHOLD_ID) =>
  jsonOrNull<Snapshot>(fetch(`${BASE}/${id}`))

export const fetchVersion = (id = HOUSEHOLD_ID) =>
  jsonOrNull<{ version: number }>(fetch(`${BASE}/${id}/version`))

export interface ActivityEntry { actor: string; type: string; at: number }
export const fetchActivity = (id = HOUSEHOLD_ID) =>
  jsonOrNull<{ activity: ActivityEntry[] }>(fetch(`${BASE}/${id}/activity`))

export const postAction = (action: Action, actor: string, id = HOUSEHOLD_ID) =>
  jsonOrNull<Snapshot>(fetch(`${BASE}/${id}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, actor }),
  }))
