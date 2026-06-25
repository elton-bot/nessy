import { useEffect, useState } from 'react'
import { useHousehold } from '../store/HouseholdStore'
import { Avatar, Icon } from './components'
import { fetchActivity, type ActivityEntry } from '../store/sync'

const STATUS_LABEL = { connecting: 'Connecting…', synced: 'Synced', offline: 'Offline' } as const

export function SyncBar() {
  const { status, actor, setActor, state } = useHousehold()
  return (
    <div className="syncbar">
      <div className="syncchip">
        <span className={`dot ${status}`} />
        {STATUS_LABEL[status]} · shared household
      </div>
      <label className="memberselect">
        <Avatar name={actor} />
        <span>as</span>
        <select value={actor} onChange={e => setActor(e.target.value)} aria-label="Acting as">
          {state.household.members.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </label>
    </div>
  )
}

const VERB: Record<string, string> = {
  ADJUST_INVENTORY_QTY: 'updated inventory',
  ADD_INVENTORY: 'added an inventory item',
  ADJUST_GROCERY_QTY: 'updated the pantry',
  ADD_GROCERY: 'added a grocery item',
  ADD_SHOPPING: 'added to the shopping list',
  TOGGLE_SHOPPING: 'checked off shopping',
  CLEAR_PURCHASED: 'cleared purchased items',
  ADD_TASK: 'added a task',
  COMPLETE_TASK: 'completed a task',
  SET_TASK_FILTER: 'changed a filter',
  ADD_MAINTENANCE: 'added maintenance',
  MARK_SERVICED: 'marked maintenance serviced',
  RESET_SEED: 'reset the household',
}

function ago(ts: number) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export function ActivityCard() {
  const [items, setItems] = useState<ActivityEntry[]>([])
  useEffect(() => {
    let alive = true
    const load = () => fetchActivity().then(r => { if (alive && r) setItems(r.activity) })
    load()
    const t = setInterval(load, 2500)
    return () => { alive = false; clearInterval(t) }
  }, [])
  if (items.length === 0) return null
  return (
    <div className="card">
      <div className="card-title">Household activity <Icon.bell size={16} /></div>
      {items.slice(0, 5).map((a, i) => (
        <div className="activity-row" key={i}>
          <Avatar name={a.actor} />
          <span className="txt"><span className="who">{a.actor}</span> {VERB[a.type] || a.type.toLowerCase()}</span>
          <span className="when">{ago(a.at)}</span>
        </div>
      ))}
    </div>
  )
}
