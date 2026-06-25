import type { HouseholdState, GroceryItem, InventoryItem, Task, MaintenanceItem } from './types'
import { parseLocal, todayDate } from './dates'

export const daysUntil = (isoDate?: string): number | undefined => {
  if (!isoDate) return undefined
  const d = parseLocal(isoDate)
  return Math.round((d.getTime() - todayDate().getTime()) / 86_400_000)
}

export const isToday = (isoDate: string) => daysUntil(isoDate) === 0
export const isTodayOrPast = (isoDate: string) => (daysUntil(isoDate) ?? 99) <= 0

// R2.7 / R3.4 / R1.4 — anything under its minimum stock
export interface LowStockRow { id: string; name: string; have: number; min: number; kind: 'inventory' | 'grocery' }
export function selectLowStock(s: HouseholdState): LowStockRow[] {
  const rows: LowStockRow[] = []
  for (const i of s.inventory) if (i.minStock != null && i.quantity < i.minStock)
    rows.push({ id: i.id, name: i.name, have: i.quantity, min: i.minStock, kind: 'inventory' })
  for (const g of s.groceries) if (g.minStock != null && g.quantity < g.minStock)
    rows.push({ id: g.id, name: g.name, have: g.quantity, min: g.minStock, kind: 'grocery' })
  return rows
}

// R3.3 — expired / expiring within 3 days
export type ExpiryState = 'expired' | 'soon' | 'ok'
export function expiryState(g: GroceryItem): ExpiryState {
  const d = daysUntil(g.expiry)
  if (d == null) return 'ok'
  if (d < 0) return 'expired'
  if (d <= 3) return 'soon'
  return 'ok'
}
export function selectExpiring(s: HouseholdState): GroceryItem[] {
  return s.groceries.filter(g => expiryState(g) !== 'ok')
}

// R1.2 / R5.3
export function selectTodayTasks(s: HouseholdState): Task[] {
  return s.tasks.filter(t => !t.done && isTodayOrPast(t.dueDate))
}
export function selectFilteredTasks(s: HouseholdState): Task[] {
  if (s.taskFilter === 'Today') return s.tasks.filter(t => isTodayOrPast(t.dueDate) || t.done && isToday(t.lastCompleted ?? ''))
    .filter(t => isTodayOrPast(t.dueDate))
  if (s.taskFilter === 'Upcoming') return s.tasks.filter(t => !t.done && (daysUntil(t.dueDate) ?? 0) > 0)
  return s.tasks
}

// R1.3 — soonest-due maintenance
export function selectUpcomingMaintenance(s: HouseholdState): MaintenanceItem[] {
  return [...s.maintenance].sort((a, b) => (daysUntil(a.nextDue)! - daysUntil(b.nextDue)!))
}
export type MaintState = 'overdue' | 'soon' | 'scheduled'
export function maintState(m: MaintenanceItem): MaintState {
  const d = daysUntil(m.nextDue) ?? 99
  if (d < 0) return 'overdue'
  if (d <= 7) return 'soon'
  return 'scheduled'
}
export function selectMaintenanceDueCount(s: HouseholdState): number {
  return s.maintenance.filter(m => maintState(m) !== 'scheduled').length
}

// R1.5
export function selectShoppingCount(s: HouseholdState): number {
  return s.shopping.filter(i => !i.checked).length
}

export const lowStockInventory = (i: InventoryItem) =>
  i.minStock != null && i.quantity < i.minStock
