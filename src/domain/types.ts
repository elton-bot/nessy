export type ID = string

export type Room =
  | 'Master Bedroom' | 'Guest Bedroom' | 'Kitchen' | 'Pantry'
  | 'Laundry Room' | 'Garage' | 'Living Room' | 'Bathroom'
  | 'Garden' | 'Pool Area'

export type Condition = 'New' | 'Good' | 'Worn' | 'Replace'

export type InventoryCategory = 'Linen' | 'Kitchen' | 'Supplies'

export interface InventoryItem {
  id: ID
  name: string
  category: InventoryCategory
  quantity: number
  room: Room
  location?: string
  condition?: Condition
  minStock?: number
  lastWashed?: string
  replaceEveryDays?: number
  purchaseDate?: string
}

export type GroceryLocation = 'Pantry' | 'Refrigerator' | 'Freezer'

export interface GroceryItem {
  id: ID
  name: string
  location: GroceryLocation
  quantity: number
  unit?: string
  expiry?: string
  minStock?: number
}

export type ShoppingCategory = 'Groceries' | 'Supplies' | 'Household' | 'Wishlist'

export interface ShoppingItem {
  id: ID
  name: string
  category: ShoppingCategory
  quantity: number
  checked: boolean
  source?: 'manual' | 'inventory' | 'grocery'
}

export interface PurchaseRecord {
  id: ID
  name: string
  category: string
  purchasedAt: string
}

export type Schedule = 'Daily' | 'Weekly' | 'Monthly' | 'Custom'
export type TaskFilter = 'Today' | 'Upcoming' | 'All'

export interface Task {
  id: ID
  title: string
  assignee: string
  schedule: Schedule
  room?: Room
  dueDate: string
  done: boolean
  lastCompleted?: string
}

export interface MaintenanceHistoryEntry {
  date: string
  note?: string
  cost?: number
}

export interface MaintenanceItem {
  id: ID
  name: string
  vendor?: string
  lastService?: string
  nextDue: string
  estimatedCost?: number
  room?: Room
  history: MaintenanceHistoryEntry[]
}

export interface HouseholdState {
  household: { name: string; members: string[] }
  rooms: Room[]
  inventory: InventoryItem[]
  groceries: GroceryItem[]
  shopping: ShoppingItem[]
  purchases: PurchaseRecord[]
  tasks: Task[]
  maintenance: MaintenanceItem[]
  taskFilter: TaskFilter
}
