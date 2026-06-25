import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react'
import type { HouseholdState } from '../domain/types'
import { reducer, type Action } from '../domain/reducer'
import { loadState, saveState, clearState } from './persistence'
import { fetchSnapshot, fetchVersion, postAction, HOUSEHOLD_ID } from './sync'

const POLL_MS = 2500
const MEMBER_KEY = 'nessy.member.v1'

export type SyncStatus = 'connecting' | 'synced' | 'offline'

type Internal = { state: HouseholdState; version: number }
type Meta = Action | { type: '__REPLACE'; snapshot: Internal }

function metaReducer(s: Internal, a: Meta): Internal {
  if (a.type === '__REPLACE') return a.snapshot
  // local optimistic apply; version unchanged until the server confirms
  return { state: reducer(s.state, a), version: s.version }
}

interface Ctx {
  state: HouseholdState
  dispatch: (a: Action) => void
  status: SyncStatus
  actor: string
  setActor: (m: string) => void
}
const HouseholdContext = createContext<Ctx | null>(null)

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const [internal, rawDispatch] = useReducer(metaReducer, undefined, () => ({ state: loadState(), version: 0 }))
  const [status, setStatus] = useState<SyncStatus>('connecting')
  const [actor, setActorState] = useState<string>(() => localStorage.getItem(MEMBER_KEY) || 'Liza')

  const versionRef = useRef(0)
  const pendingRef = useRef(0)
  versionRef.current = internal.version

  const replace = (snapshot: Internal) => {
    versionRef.current = snapshot.version
    rawDispatch({ type: '__REPLACE', snapshot })
  }

  // Initial load from the server (fall back to local cache when offline).
  useEffect(() => {
    let alive = true
    fetchSnapshot().then(snap => {
      if (!alive) return
      if (snap) { replace(snap); setStatus('synced') }
      else setStatus('offline')
    })
    return () => { alive = false }
  }, [])

  // Cache to localStorage for offline resilience (N6).
  useEffect(() => { saveState(internal.state) }, [internal.state])

  // Poll for changes made by other household members on other devices.
  useEffect(() => {
    const t = setInterval(async () => {
      if (pendingRef.current > 0) return
      const v = await fetchVersion()
      if (!v) { setStatus(s => (s === 'synced' ? 'offline' : s)); return }
      if (v.version > versionRef.current) {
        const snap = await fetchSnapshot()
        if (snap) replace(snap)
      }
      setStatus('synced')
    }, POLL_MS)
    return () => clearInterval(t)
  }, [])

  const setActor = (m: string) => { setActorState(m); localStorage.setItem(MEMBER_KEY, m) }

  const dispatch = (action: Action) => {
    rawDispatch(action)               // optimistic — instant UI
    if (action.type === 'RESET_SEED') clearState()
    pendingRef.current += 1
    postAction(action, actor).then(snap => {
      pendingRef.current -= 1
      if (snap) { replace(snap); setStatus('synced') }
      else setStatus('offline')       // kept optimistic + cached locally
    })
  }

  return (
    <HouseholdContext.Provider value={{ state: internal.state, dispatch, status, actor, setActor }}>
      {children}
    </HouseholdContext.Provider>
  )
}

export function useHousehold(): Ctx {
  const ctx = useContext(HouseholdContext)
  if (!ctx) throw new Error('useHousehold must be used inside HouseholdProvider')
  return ctx
}

export { HOUSEHOLD_ID }
