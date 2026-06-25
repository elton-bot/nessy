import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHousehold } from '../store/HouseholdStore'
import { Stepper, Segmented, Sheet, TextField, SelectField, useSheet } from '../ui/components'
import { expiryState, daysUntil } from '../domain/selectors'
import type { GroceryLocation } from '../domain/types'

const LOCATIONS: GroceryLocation[] = ['Pantry', 'Refrigerator', 'Freezer']

function ExpiryPill({ iso }: { iso?: string }) {
  if (!iso) return <span className="badge neutral">no expiry</span>
  const d = daysUntil(iso)!
  if (d < 0) return <span className="badge expired">expired {Math.abs(d)}d</span>
  if (d <= 3) return <span className="badge soon">{d === 0 ? 'today' : `in ${d}d`}</span>
  return <span className="badge ok">in {d}d</span>
}

export function Grocery() {
  const { state, dispatch } = useHousehold()
  const nav = useNavigate()
  const [loc, setLoc] = useState<GroceryLocation>('Refrigerator')
  const sheet = useSheet()
  const items = state.groceries.filter(g => g.location === loc)

  return (
    <>
      <header className="appheader">
        <div>
          <h1>Grocery &amp; Pantry</h1>
          <div className="sub" onClick={() => nav('/more')} style={{ cursor: 'pointer' }}>‹ More</div>
        </div>
        <button className="addbtn" onClick={sheet.openSheet}>+ Add</button>
      </header>

      <div className="content">
        <Segmented options={LOCATIONS} value={loc} onChange={setLoc} />
        <div className="card">
          {items.length === 0 && <div className="empty">Nothing in the {loc.toLowerCase()} yet.</div>}
          {items.map(g => {
            const st = expiryState(g)
            const low = g.minStock != null && g.quantity < g.minStock
            return (
              <div className="row" key={g.id}>
                <div className="grow">
                  <div className="name">
                    {g.name} {low && <span className="badge low">Low</span>}
                  </div>
                  <div className="meta">
                    {g.quantity}{g.unit ? ` ${g.unit}` : ''} · <ExpirySpan iso={g.expiry} />
                  </div>
                </div>
                {(st !== 'ok' || low) &&
                  <button className="addbtn" onClick={() => dispatch({ type: 'ADD_SHOPPING', name: g.name, category: 'Groceries', source: 'grocery' })}>+ List</button>}
                <Stepper value={g.quantity}
                  onDec={() => dispatch({ type: 'ADJUST_GROCERY_QTY', id: g.id, delta: -1 })}
                  onInc={() => dispatch({ type: 'ADJUST_GROCERY_QTY', id: g.id, delta: +1 })} />
              </div>
            )
          })}
        </div>
        <ExpiryPillLegendNote />
      </div>

      {sheet.open && <AddGrocerySheet defaultLoc={loc} onClose={sheet.closeSheet}
        onSave={item => { dispatch({ type: 'ADD_GROCERY', item }); sheet.closeSheet() }} />}
    </>
  )
}

// inline expiry text with color
function ExpirySpan({ iso }: { iso?: string }) {
  if (!iso) return <span>no expiry</span>
  const d = daysUntil(iso)!
  const color = d < 0 ? 'var(--red)' : d <= 3 ? 'var(--amber-700)' : 'var(--ink-2)'
  const label = d < 0 ? `expired ${Math.abs(d)}d ago` : d === 0 ? 'expires today' : `expires in ${d}d`
  return <span style={{ color, fontWeight: d <= 3 ? 700 : 500 }}>{label}</span>
}

function ExpiryPillLegendNote() {
  return (
    <div className="section-label" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>
      Expired & expiring (≤3 days) items show a “+ List” shortcut to add them to Shopping.
    </div>
  )
}

function AddGrocerySheet({ defaultLoc, onClose, onSave }: {
  defaultLoc: GroceryLocation; onClose: () => void
  onSave: (item: { name: string; location: GroceryLocation; quantity: number; unit?: string; expiry?: string; minStock?: number }) => void
}) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState<GroceryLocation>(defaultLoc)
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('')
  const [expiry, setExpiry] = useState('')
  const valid = name.trim().length > 0
  return (
    <Sheet title="Add grocery item" onClose={onClose}>
      <TextField label="Name" value={name} onChange={setName} placeholder="e.g. Milk" />
      <div className="grid2">
        <SelectField label="Location" value={location} onChange={setLocation} options={LOCATIONS} />
        <TextField label="Quantity" value={quantity} onChange={setQuantity} type="number" />
      </div>
      <div className="grid2">
        <TextField label="Unit" value={unit} onChange={setUnit} placeholder="L, pcs, kg…" />
        <TextField label="Expiry date" value={expiry} onChange={setExpiry} type="date" />
      </div>
      <div className="sheet-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!valid} style={{ opacity: valid ? 1 : .5 }}
          onClick={() => onSave({
            name: name.trim(), location, quantity: Math.max(0, parseInt(quantity) || 1),
            unit: unit.trim() || undefined, expiry: expiry || undefined,
          })}>Add item</button>
      </div>
    </Sheet>
  )
}
