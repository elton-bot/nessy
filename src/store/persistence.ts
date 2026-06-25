import type { HouseholdState } from '../domain/types'
import { buildSeed } from '../domain/seed'

const KEY = 'nessy.state.v1'

export function loadState(): HouseholdState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as HouseholdState
  } catch { /* fall through to seed */ }
  return buildSeed()
}

let timer: number | undefined
export function saveState(state: HouseholdState) {
  if (timer) clearTimeout(timer)
  timer = window.setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore quota */ }
  }, 200)
}

export function clearState() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
