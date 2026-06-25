import { useState } from 'react'
import { useHousehold } from '../store/HouseholdStore'
import { CheckBox, Sheet, TextField, SelectField, useSheet } from '../ui/components'
import type { ShoppingCategory } from '../domain/types'

const CATEGORIES: ShoppingCategory[] = ['Groceries', 'Supplies', 'Household', 'Wishlist']
const FREQUENT = ['Milk', 'Bread', 'Eggs', 'Coffee beans', 'Dish soap']

export function Shopping() {
  const { state, dispatch } = useHousehold()
  const sheet = useSheet()

  const active = state.shopping.filter(i => !i.checked)
  const checked = state.shopping.filter(i => i.checked)
  const groups = CATEGORIES
    .map(c => ({ cat: c, items: active.filter(i => i.category === c) }))
    .filter(g => g.items.length > 0)

  const sourceTag = (s?: string) =>
    s === 'inventory' ? 'from Inventory' : s === 'grocery' ? 'from Pantry' : undefined

  return (
    <>
      <header className="appheader">
        <div><h1>Shopping</h1><div className="sub">{active.length} to buy · shared list</div></div>
        <button className="addbtn" onClick={sheet.openSheet}>+ Add</button>
      </header>

      <div className="content">
        {/* frequently purchased quick add (R4.5) */}
        <div className="section-label">Frequently purchased</div>
        <div className="chips" style={{ marginBottom: 14 }}>
          {FREQUENT.map(f => (
            <button key={f} className="chip"
              onClick={() => dispatch({ type: 'ADD_SHOPPING', name: f, category: 'Groceries' })}>
              <span className="plus">+</span> {f}
            </button>
          ))}
        </div>

        {active.length === 0 && <div className="empty">Your list is clear. Nice work! 🛒</div>}

        {groups.map(g => (
          <div className="card" key={g.cat}>
            <div className="card-title">{g.cat} <span className="badge neutral">{g.items.length}</span></div>
            {g.items.map(i => (
              <div className="row" key={i.id}>
                <CheckBox on={false} onClick={() => dispatch({ type: 'TOGGLE_SHOPPING', id: i.id })} />
                <div className="grow">
                  <div className="name">{i.name}{i.quantity > 1 ? ` ×${i.quantity}` : ''}</div>
                  {sourceTag(i.source) && <div className="meta">{sourceTag(i.source)}</div>}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* purchase history (R4.4) */}
        {checked.length > 0 && (
          <div className="card">
            <div className="card-title">
              Recently purchased
              <span className="link" onClick={() => dispatch({ type: 'CLEAR_PURCHASED' })}>Clear</span>
            </div>
            {checked.map(i => (
              <div className="row fade-done" key={i.id}>
                <CheckBox on onClick={() => dispatch({ type: 'TOGGLE_SHOPPING', id: i.id })} />
                <div className="grow"><div className="name strike">{i.name}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {sheet.open && <AddShoppingSheet onClose={sheet.closeSheet}
        onSave={(name, category, quantity) => { dispatch({ type: 'ADD_SHOPPING', name, category, quantity }); sheet.closeSheet() }} />}
    </>
  )
}

function AddShoppingSheet({ onClose, onSave }: {
  onClose: () => void; onSave: (name: string, category: ShoppingCategory, quantity: number) => void
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ShoppingCategory>('Groceries')
  const [quantity, setQuantity] = useState('1')
  const valid = name.trim().length > 0
  return (
    <Sheet title="Add to shopping list" onClose={onClose}>
      <TextField label="Item" value={name} onChange={setName} placeholder="e.g. Olive oil" />
      <div className="grid2">
        <SelectField label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
        <TextField label="Quantity" value={quantity} onChange={setQuantity} type="number" />
      </div>
      <div className="sheet-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!valid} style={{ opacity: valid ? 1 : .5 }}
          onClick={() => onSave(name.trim(), category, Math.max(1, parseInt(quantity) || 1))}>Add</button>
      </div>
    </Sheet>
  )
}
