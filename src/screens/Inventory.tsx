import { useState } from 'react'
import { useHousehold } from '../store/HouseholdStore'
import {
  Icon, Stepper, Segmented, Sheet, TextField, SelectField, useSheet,
} from '../ui/components'
import { lowStockInventory, daysUntil } from '../domain/selectors'
import type { InventoryCategory, Condition, Room } from '../domain/types'

const CATEGORIES: InventoryCategory[] = ['Linen', 'Kitchen', 'Supplies']
const CONDITIONS: Condition[] = ['New', 'Good', 'Worn', 'Replace']

function washedLabel(iso?: string) {
  if (!iso) return undefined
  const d = -(daysUntil(iso) ?? 0)
  return d <= 0 ? 'washed today' : `washed ${d}d ago`
}

export function Inventory() {
  const { state, dispatch } = useHousehold()
  const [cat, setCat] = useState<InventoryCategory>('Linen')
  const sheet = useSheet()
  const items = state.inventory.filter(i => i.category === cat)

  return (
    <>
      <header className="appheader">
        <div><h1>Inventory</h1><div className="sub">{state.inventory.length} items tracked</div></div>
        <button className="addbtn" onClick={sheet.openSheet}>+ Add</button>
      </header>

      <div className="content">
        <Segmented options={CATEGORIES} value={cat} onChange={setCat} />

        <div className="card">
          {items.length === 0 && <div className="empty">No {cat.toLowerCase()} items yet.</div>}
          {items.map(i => {
            const low = lowStockInventory(i)
            return (
              <div className="row" key={i.id}>
                <div className="grow">
                  <div className="name">
                    {i.name}{' '}
                    {low && <span className="badge low">Low</span>}
                    {i.condition === 'Replace' && <span className="badge low">Replace</span>}
                  </div>
                  <div className="meta">
                    {i.room}{i.location ? ` · ${i.location}` : ''}
                    {i.category === 'Supplies' && i.minStock != null ? ` · min ${i.minStock}` : ''}
                    {i.condition && i.category !== 'Supplies' ? ` · ${i.condition}` : ''}
                    {washedLabel(i.lastWashed) ? ` · ${washedLabel(i.lastWashed)}` : ''}
                  </div>
                </div>
                {low
                  ? <button className="addbtn" onClick={() => dispatch({ type: 'ADD_SHOPPING', name: i.name, category: 'Supplies', source: 'inventory' })}>+ List</button>
                  : null}
                <Stepper value={i.quantity}
                  onDec={() => dispatch({ type: 'ADJUST_INVENTORY_QTY', id: i.id, delta: -1 })}
                  onInc={() => dispatch({ type: 'ADJUST_INVENTORY_QTY', id: i.id, delta: +1 })} />
              </div>
            )
          })}
        </div>
      </div>

      {sheet.open && <AddInventorySheet defaultCat={cat} rooms={state.rooms} onClose={sheet.closeSheet}
        onSave={item => { dispatch({ type: 'ADD_INVENTORY', item }); sheet.closeSheet() }} />}
    </>
  )
}

function AddInventorySheet({ defaultCat, rooms, onClose, onSave }: {
  defaultCat: InventoryCategory; rooms: Room[]; onClose: () => void
  onSave: (item: { name: string; category: InventoryCategory; quantity: number; room: Room; condition: Condition; minStock?: number; location?: string }) => void
}) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<InventoryCategory>(defaultCat)
  const [quantity, setQuantity] = useState('1')
  const [room, setRoom] = useState<Room>(rooms[0])
  const [condition, setCondition] = useState<Condition>('Good')
  const [minStock, setMinStock] = useState('')
  const valid = name.trim().length > 0

  return (
    <Sheet title="Add inventory item" onClose={onClose}>
      <TextField label="Name" value={name} onChange={setName} placeholder="e.g. Bath towels" />
      <div className="grid2">
        <SelectField label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
        <TextField label="Quantity" value={quantity} onChange={setQuantity} type="number" />
      </div>
      <div className="grid2">
        <SelectField label="Room" value={room} onChange={setRoom} options={rooms} />
        {category === 'Supplies'
          ? <TextField label="Min stock" value={minStock} onChange={setMinStock} type="number" placeholder="e.g. 2" />
          : <SelectField label="Condition" value={condition} onChange={setCondition} options={CONDITIONS} />}
      </div>
      <div className="sheet-actions">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!valid} style={{ opacity: valid ? 1 : .5 }}
          onClick={() => onSave({
            name: name.trim(), category, quantity: Math.max(0, parseInt(quantity) || 1),
            room, condition, minStock: category === 'Supplies' && minStock ? parseInt(minStock) : undefined,
          })}>Add item</button>
      </div>
    </Sheet>
  )
}
