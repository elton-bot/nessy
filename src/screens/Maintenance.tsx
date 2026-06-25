import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHousehold } from '../store/HouseholdStore'
import { Icon } from '../ui/components'
import { selectUpcomingMaintenance, maintState, daysUntil } from '../domain/selectors'
import type { MaintenanceItem } from '../domain/types'

function fmt(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function DueBadge({ m }: { m: MaintenanceItem }) {
  const st = maintState(m)
  const d = daysUntil(m.nextDue)!
  if (st === 'overdue') return <span className="badge overdue">{Math.abs(d)}d overdue</span>
  if (st === 'soon') return <span className="badge due">{d === 0 ? 'due today' : `in ${d}d`}</span>
  return <span className="badge scheduled">in {d}d</span>
}

export function Maintenance() {
  const { state, dispatch } = useHousehold()
  const nav = useNavigate()
  const [expanded, setExpanded] = useState<string | null>(null)
  const items = selectUpcomingMaintenance(state)

  return (
    <>
      <header className="appheader">
        <div>
          <h1>Maintenance</h1>
          <div className="sub" onClick={() => nav('/more')} style={{ cursor: 'pointer' }}>‹ More</div>
        </div>
      </header>

      <div className="content">
        {items.map(m => {
          const open = expanded === m.id
          return (
            <div className="card" key={m.id}>
              <div className="row" style={{ padding: 0, border: 'none' }} onClick={() => setExpanded(open ? null : m.id)}>
                <span className="iconchip" style={{ background: 'var(--amber-50)', color: 'var(--amber)' }}><Icon.tools size={20} /></span>
                <div className="grow">
                  <div className="name">{m.name}</div>
                  <div className="meta">{m.vendor}{m.room ? ` · ${m.room}` : ''} · ${m.estimatedCost}</div>
                </div>
                <DueBadge m={m} />
              </div>

              <div className="meta" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--surface-2)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Last: {fmt(m.lastService)}</span>
                <span>Next: {fmt(m.nextDue)}</span>
              </div>

              {open && (
                <div style={{ marginTop: 8 }}>
                  <div className="section-label" style={{ margin: '6px 0' }}>Service history</div>
                  {m.history.length === 0 && <div className="meta">No history yet.</div>}
                  {m.history.map((h, idx) => (
                    <div className="meta" key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                      <span>{fmt(h.date)}{h.note ? ` · ${h.note}` : ''}</span>
                      {h.cost != null && <span>${h.cost}</span>}
                    </div>
                  ))}
                </div>
              )}

              <button className="btn primary" style={{ marginTop: 12, padding: 11 }}
                onClick={() => dispatch({ type: 'MARK_SERVICED', id: m.id })}>
                Mark serviced today
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}
