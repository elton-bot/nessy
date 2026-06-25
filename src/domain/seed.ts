import type { HouseholdState } from './types'
import { dayISO as day } from './dates'

// Dates relative to today (local calendar days) so expiry / due states look live.

let n = 0
const id = (p: string) => `${p}_${++n}`

export function buildSeed(): HouseholdState {
  return {
    household: { name: 'The Reyes home', members: ['Liza', 'Andre', 'Joaquin', 'Maria'] },
    rooms: [
      'Master Bedroom', 'Guest Bedroom', 'Kitchen', 'Pantry', 'Laundry Room',
      'Garage', 'Living Room', 'Bathroom', 'Garden', 'Pool Area',
    ],
    taskFilter: 'Today',

    inventory: [
      // Linen
      { id: id('inv'), name: 'Queen bedsheets', category: 'Linen', quantity: 6, room: 'Master Bedroom', location: 'Closet shelf 1', condition: 'Good', lastWashed: day(-5), replaceEveryDays: 540 },
      { id: id('inv'), name: 'Pillowcases', category: 'Linen', quantity: 12, room: 'Master Bedroom', location: 'Closet shelf 1', condition: 'Good', lastWashed: day(-5) },
      { id: id('inv'), name: 'Bath towels', category: 'Linen', quantity: 8, room: 'Bathroom', location: 'Linen cabinet', condition: 'Worn', lastWashed: day(-2) },
      { id: id('inv'), name: 'Comforter', category: 'Linen', quantity: 3, room: 'Guest Bedroom', location: 'Closet shelf 2', condition: 'New', lastWashed: day(-20) },
      // Kitchen
      { id: id('inv'), name: 'Dinner plates', category: 'Kitchen', quantity: 12, room: 'Kitchen', location: 'Upper cabinet', condition: 'Good' },
      { id: id('inv'), name: 'Drinking glasses', category: 'Kitchen', quantity: 10, room: 'Kitchen', location: 'Upper cabinet', condition: 'Good' },
      { id: id('inv'), name: 'Non-stick pan', category: 'Kitchen', quantity: 2, room: 'Kitchen', location: 'Lower cabinet', condition: 'Worn' },
      { id: id('inv'), name: 'Cutlery sets', category: 'Kitchen', quantity: 8, room: 'Kitchen', location: 'Drawer 2', condition: 'Good' },
      // Supplies (with minStock — some below)
      { id: id('inv'), name: 'Laundry detergent', category: 'Supplies', quantity: 1, room: 'Laundry Room', location: 'Shelf', minStock: 2 },
      { id: id('inv'), name: 'Trash bags', category: 'Supplies', quantity: 1, room: 'Kitchen', location: 'Under sink', minStock: 3 },
      { id: id('inv'), name: 'Dishwashing liquid', category: 'Supplies', quantity: 4, room: 'Kitchen', location: 'Under sink', minStock: 2 },
      { id: id('inv'), name: 'Toilet tissue', category: 'Supplies', quantity: 6, room: 'Bathroom', location: 'Cabinet', minStock: 8 },
    ],

    groceries: [
      { id: id('gro'), name: 'Milk', location: 'Refrigerator', quantity: 1, unit: 'L', expiry: day(2), minStock: 2 },
      { id: id('gro'), name: 'Eggs', location: 'Refrigerator', quantity: 10, unit: 'pcs', expiry: day(9) },
      { id: id('gro'), name: 'Chicken breast', location: 'Freezer', quantity: 2, unit: 'kg', expiry: day(30) },
      { id: id('gro'), name: 'Yogurt', location: 'Refrigerator', quantity: 2, unit: 'cups', expiry: day(-1) },
      { id: id('gro'), name: 'Rice', location: 'Pantry', quantity: 5, unit: 'kg', minStock: 2 },
      { id: id('gro'), name: 'Pasta', location: 'Pantry', quantity: 1, unit: 'box', expiry: day(120), minStock: 2 },
      { id: id('gro'), name: 'Tomato sauce', location: 'Pantry', quantity: 3, unit: 'cans', expiry: day(200) },
      { id: id('gro'), name: 'Frozen peas', location: 'Freezer', quantity: 1, unit: 'bag', expiry: day(60) },
    ],

    shopping: [
      { id: id('shop'), name: 'Bananas', category: 'Groceries', quantity: 1, checked: false, source: 'manual' },
      { id: id('shop'), name: 'Bread', category: 'Groceries', quantity: 2, checked: false, source: 'manual' },
      { id: id('shop'), name: 'Paper towels', category: 'Supplies', quantity: 2, checked: false, source: 'manual' },
      { id: id('shop'), name: 'Light bulbs', category: 'Household', quantity: 4, checked: false, source: 'manual' },
    ],

    purchases: [
      { id: id('pur'), name: 'Coffee beans', category: 'Groceries', purchasedAt: day(-3) },
      { id: id('pur'), name: 'Hand soap', category: 'Supplies', purchasedAt: day(-3) },
    ],

    tasks: [
      { id: id('task'), title: 'Water the plants', assignee: 'Liza', schedule: 'Daily', room: 'Garden', dueDate: day(0), done: false },
      { id: id('task'), title: 'Feed the dog', assignee: 'Joaquin', schedule: 'Daily', room: 'Kitchen', dueDate: day(0), done: false },
      { id: id('task'), title: 'Change bedsheets', assignee: 'Andre', schedule: 'Weekly', room: 'Master Bedroom', dueDate: day(0), done: false },
      { id: id('task'), title: 'Take out trash', assignee: 'Joaquin', schedule: 'Daily', room: 'Kitchen', dueDate: day(0), done: false },
      { id: id('task'), title: 'Clean bathrooms', assignee: 'Liza', schedule: 'Weekly', room: 'Bathroom', dueDate: day(2), done: false },
      { id: id('task'), title: 'Weekly deep cleaning', assignee: 'Andre', schedule: 'Weekly', room: 'Living Room', dueDate: day(3), done: false },
      { id: id('task'), title: 'Mow the lawn', assignee: 'Andre', schedule: 'Monthly', room: 'Garden', dueDate: day(6), done: false },
    ],

    maintenance: [
      { id: id('mnt'), name: 'Air conditioning service', vendor: 'CoolAir Co.', lastService: day(-95), nextDue: day(-5), estimatedCost: 120, room: 'Living Room', history: [{ date: day(-95), note: 'Cleaned filters', cost: 110 }] },
      { id: id('mnt'), name: 'Pool maintenance', vendor: 'AquaPros', lastService: day(-10), nextDue: day(1), estimatedCost: 80, room: 'Pool Area', history: [{ date: day(-10), note: 'Chlorine + skim', cost: 80 }] },
      { id: id('mnt'), name: 'Pest control', vendor: 'BugBusters', lastService: day(-60), nextDue: day(20), estimatedCost: 95, room: 'Garage', history: [{ date: day(-60), cost: 95 }] },
      { id: id('mnt'), name: 'Water tank cleaning', vendor: 'PureFlow', lastService: day(-150), nextDue: day(40), estimatedCost: 200, room: 'Garage', history: [{ date: day(-150), cost: 190 }] },
    ],
  }
}
