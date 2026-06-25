import type { HouseholdState } from '../domain/types'
import type { Action } from '../domain/reducer'

export interface Snapshot { version: number; state: HouseholdState }
export interface Me { householdId: string; member: string }
export interface ActivityEntry { actor: string; type: string; at: number }

const opts: RequestInit = { credentials: 'include' }

async function jsonOrNull<T>(p: Promise<Response>): Promise<T | null> {
  try {
    const res = await p
    if (!res.ok) return null
    return (await res.json()) as T
  } catch { return null }
}

// auth
export const login = (name: string, pin: string, household = 'reyes') =>
  jsonOrNull<Me>(fetch('/api/auth/login', {
    ...opts, method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ household, name, pin }),
  }))
export const me = () => jsonOrNull<Me>(fetch('/api/auth/me', opts))
export const logout = () => fetch('/api/auth/logout', { ...opts, method: 'POST' })

// state
export const fetchSnapshot = () => jsonOrNull<Snapshot>(fetch('/api/state', opts))
export const fetchActivity = () =>
  jsonOrNull<{ activity: ActivityEntry[] }>(fetch('/api/activity', opts))
export const postAction = (action: Action) =>
  jsonOrNull<Snapshot>(fetch('/api/action', {
    ...opts, method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  }))

/** Subscribe to realtime version bumps via SSE. Returns an unsubscribe fn. */
export function subscribe(onVersion: (v: number) => void, onError: () => void): () => void {
  let es: EventSource | null = null
  try {
    es = new EventSource('/api/state/stream', { withCredentials: true })
    es.addEventListener('version', (e) => onVersion(Number((e as MessageEvent).data)))
    es.onerror = () => onError()
  } catch { onError() }
  return () => es?.close()
}
