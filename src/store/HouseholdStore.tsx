import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react'
import type { HouseholdState } from '../domain/types'
import { reducer, type Action } from '../domain/reducer'
import { loadState, saveState } from './persistence'
import {
  login as apiLogin, logout as apiLogout, me as apiMe,
  fetchSnapshot, postAction, subscribe, type Me,
} from './sync'

export type SyncStatus = 'connecting' | 'synced' | 'offline'

type Internal = { state: HouseholdState; version: number }
type Meta = Action | { type: '__REPLACE'; snapshot: Internal }

function metaReducer(s: Internal, a: Meta): Internal {
  if (a.type === '__REPLACE') return a.snapshot
  return { state: reducer(s.state, a), version: s.version } // optimistic
}

interface Ctx {
  state: HouseholdState
  dispatch: (a: Action) => void
  status: SyncStatus
  me: Me | null
  authLoading: boolean
  actor: string
  login: (name: string, pin: string) => Promise<string | null>
  logout: () => Promise<void>
}
const HouseholdContext = createContext<Ctx | null>(null)

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const [internal, rawDispatch] = useReducer(metaReducer, undefined, () => ({ state: loadState(), version: 0 }))
  const [status, setStatus] = useState<SyncStatus>('connecting')
  const [meState, setMe] = useState<Me | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const versionRef = useRef(0)
  const pendingRef = useRef(0)
  const unsubRef = useRef<(() => void) | null>(null)
  versionRef.current = internal.version

  const replace = (snapshot: Internal) => {
    versionRef.current = snapshot.version
    rawDispatch({ type: '__REPLACE', snapshot })
  }

  const refresh = async () => {
    if (pendingRef.current > 0) return
    const snap = await fetchSnapshot()
    if (snap) { if (snap.version !== versionRef.current) replace(snap); setStatus('synced') }
    else setStatus('offline')
  }

  // Bootstrap once authenticated: load snapshot + subscribe to realtime.
  const bootstrap = async () => {
    const snap = await fetchSnapshot()
    if (snap) { replace(snap); setStatus('synced') } else setStatus('offline')
    unsubRef.current?.()
    unsubRef.current = subscribe(
      (v) => { if (v > versionRef.current) refresh() },   // SSE push
      () => setStatus('offline'),
    )
  }

  // On load: am I already logged in?
  useEffect(() => {
    let alive = true
    apiMe().then(async (m) => {
      if (!alive) return
      if (m) { setMe(m); await bootstrap() }
      setAuthLoading(false)
    })
    return () => { alive = false; unsubRef.current?.() }
  }, [])

  // Fallback poll (covers environments where SSE is dropped by a proxy).
  useEffect(() => {
    if (!meState) return
    const t = setInterval(refresh, 6000)
    return () => clearInterval(t)
  }, [meState])

  useEffect(() => { saveState(internal.state) }, [internal.state])

  const login = async (name: string, pin: string): Promise<string | null> => {
    const m = await apiLogin(name, pin)
    if (!m) return 'Wrong name or PIN'
    setMe(m); await bootstrap(); return null
  }

  const logout = async () => {
    unsubRef.current?.()
    await apiLogout()
    setMe(null); setStatus('connecting')
  }

  const dispatch = (action: Action) => {
    rawDispatch(action) // optimistic — instant UI
    pendingRef.current += 1
    postAction(action).then(snap => {
      pendingRef.current -= 1
      if (snap) { replace(snap); setStatus('synced') } else setStatus('offline')
    })
  }

  return (
    <HouseholdContext.Provider value={{
      state: internal.state, dispatch, status,
      me: meState, authLoading, actor: meState?.member ?? '',
      login, logout,
    }}>
      {children}
    </HouseholdContext.Provider>
  )
}

export function useHousehold(): Ctx {
  const ctx = useContext(HouseholdContext)
  if (!ctx) throw new Error('useHousehold must be used inside HouseholdProvider')
  return ctx
}
