import React, { createContext, useContext, useEffect, useReducer } from 'react'
import type {
  HouseholdState, InventoryItem, GroceryItem, ShoppingItem, Task,
  MaintenanceItem, TaskFilter, ShoppingCategory,
} from '../domain/types'
import { buildSeed } from '../domain/seed'
import { todayISO, addDaysISO } from '../domain/dates'
import { loadState, saveState, clearState } from './persistence'

const uid = () => Math.random().toString(36).slice(2, 9)
const cadenceDays: Record<Task['schedule'], number> = { Daily: 1, Weekly: 7, Monthly: 30, Custom: 7 }

type Action =
  | { type: 'ADJUST_INVENTORY_QTY'; id: string; delta: number }
  | { type: 'ADD_INVENTORY'; item: Omit<InventoryItem, 'id'> }
  | { type: 'ADJUST_GROCERY_QTY'; id: string; delta: number }
  | { type: 'ADD_GROCERY'; item: Omit<GroceryItem, 'id'> }
  | { type: 'ADD_SHOPPING'; name: string; category: ShoppingCategory; quantity?: number; source?: ShoppingItem['source'] }
  | { type: 'TOGGLE_SHOPPING'; id: string }
  | { type: 'CLEAR_PURCHASED' }
  | { type: 'ADD_TASK'; task: Omit<Task, 'id' | 'done'> }
  | { type: 'COMPLETE_TASK'; id: string }
  | { type: 'SET_TASK_FILTER'; filter: TaskFilter }
  | { type: 'ADD_MAINTENANCE'; item: Omit<MaintenanceItem, 'id' | 'history'> }
  | { type: 'MARK_SERVICED'; id: string; intervalDays?: number }
  | { type: 'RESET_SEED' }

function reducer(state: HouseholdState, action: Action): HouseholdState {
  switch (action.type) {
    case 'ADJUST_INVENTORY_QTY':
      return { ...state, inventory: state.inventory.map(i =>
        i.id === action.id ? { ...i, quantity: Math.max(0, i.quantity + action.delta) } : i) }

    case 'ADD_INVENTORY':
      return { ...state, inventory: [{ ...action.item, id: uid() }, ...state.inventory] }

    case 'ADJUST_GROCERY_QTY':
      return { ...state, groceries: state.groceries.map(g =>
        g.id === action.id ? { ...g, quantity: Math.max(0, g.quantity + action.delta) } : g) }

    case 'ADD_GROCERY':
      return { ...state, groceries: [{ ...action.item, id: uid() }, ...state.groceries] }

    case 'ADD_SHOPPING': {
      const exists = state.shopping.find(
        i => !i.checked && i.name.toLowerCase() === action.name.toLowerCase())
      if (exists) return state // dedupe
      const item: ShoppingItem = {
        id: uid(), name: action.name, category: action.category,
        quantity: action.quantity ?? 1, checked: false, source: action.source ?? 'manual',
      }
      return { ...state, shopping: [item, ...state.shopping] }
    }

    case 'TOGGLE_SHOPPING': {
      const target = state.shopping.find(i => i.id === action.id)
      if (!target) return state
      const nowChecked = !target.checked
      const shopping = state.shopping.map(i => i.id === action.id ? { ...i, checked: nowChecked } : i)
      let purchases = state.purchases
      if (nowChecked) {
        purchases = [{ id: uid(), name: target.name, category: target.category, purchasedAt: todayISO() }, ...purchases]
      }
      return { ...state, shopping, purchases }
    }

    case 'CLEAR_PURCHASED':
      return { ...state, shopping: state.shopping.filter(i => !i.checked) }

    case 'ADD_TASK':
      return { ...state, tasks: [{ ...action.task, id: uid(), done: false }, ...state.tasks] }

    case 'COMPLETE_TASK':
      return { ...state, tasks: state.tasks.map(t => {
        if (t.id !== action.id) return t
        if (t.schedule === 'Daily' || t.schedule === 'Weekly' || t.schedule === 'Monthly') {
          // recurring: reschedule next occurrence (R5.5)
          return { ...t, done: false, lastCompleted: todayISO(),
            dueDate: addDaysISO(todayISO(), cadenceDays[t.schedule]) }
        }
        return { ...t, done: true, lastCompleted: todayISO() }
      }) }

    case 'SET_TASK_FILTER':
      return { ...state, taskFilter: action.filter }

    case 'ADD_MAINTENANCE':
      return { ...state, maintenance: [{ ...action.item, id: uid(), history: [] }, ...state.maintenance] }

    case 'MARK_SERVICED':
      return { ...state, maintenance: state.maintenance.map(m => {
        if (m.id !== action.id) return m
        const t = todayISO()
        const interval = action.intervalDays ?? 90
        return {
          ...m, lastService: t, nextDue: addDaysISO(t, interval),
          history: [{ date: t, cost: m.estimatedCost }, ...m.history],
        }
      }) }

    case 'RESET_SEED':
      clearState()
      return buildSeed()

    default:
      return state
  }
}

interface Ctx { state: HouseholdState; dispatch: React.Dispatch<Action> }
const HouseholdContext = createContext<Ctx | null>(null)

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  useEffect(() => { saveState(state) }, [state])
  return <HouseholdContext.Provider value={{ state, dispatch }}>{children}</HouseholdContext.Provider>
}

export function useHousehold(): Ctx {
  const ctx = useContext(HouseholdContext)
  if (!ctx) throw new Error('useHousehold must be used inside HouseholdProvider')
  return ctx
}
