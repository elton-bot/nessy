# Nessy — System Design (Step 2)

## 1. Stack decision

| Concern | Choice | Why |
|---|---|---|
| App type | SPA, mobile-first | Phase-1 is mobile; prototype must run + be simulated in-browser |
| Framework | React 18 + TypeScript | Type-safe domain model, component model fits modules |
| Build | Vite | Fast dev server, trivial preview for the mobile simulation step |
| Routing | React Router v6 | Tab + stack navigation per module |
| State | React Context + reducer, one `HouseholdStore` | Single source of truth enables the cross-module ERP flows |
| Persistence | `localStorage` (debounced) | Survives reload (N6); no backend needed (N5 privacy-by-design) |
| Styling | CSS variables design tokens + plain CSS modules | Full control of mobile look; no heavy UI dep |
| Icons | Inline SVG set | No network; crisp at mobile scale |

A real production Nessy would swap the persistence layer for a synced backend
(Supabase/Postgres + per-household row-level security) without touching the
domain model or UI — see §6.

## 2. Domain model (TypeScript types)

```ts
type ID = string;
type Room = 'Master Bedroom' | 'Guest Bedroom' | 'Kitchen' | 'Pantry'
  | 'Laundry Room' | 'Garage' | 'Living Room' | 'Bathroom' | 'Garden' | 'Pool Area';

type Condition = 'New' | 'Good' | 'Worn' | 'Replace';

interface InventoryItem {       // Linen + Kitchen + Supplies (R2)
  id: ID; name: string;
  category: 'Linen' | 'Kitchen' | 'Supplies';
  quantity: number;
  room: Room; location?: string;        // cabinet/shelf
  condition?: Condition;
  minStock?: number;                    // Supplies (R2.4)
  lastWashed?: string;                  // Linen (R2.3) ISO date
  replaceEveryDays?: number;            // Linen replacement reminder
  purchaseDate?: string;
}

interface GroceryItem {          // Pantry/Fridge/Freezer (R3)
  id: ID; name: string;
  location: 'Pantry' | 'Refrigerator' | 'Freezer';
  quantity: number; unit?: string;
  expiry?: string;                      // ISO date (R3.2/3.3)
  minStock?: number;
}

interface ShoppingItem {         // (R4)
  id: ID; name: string;
  category: 'Groceries' | 'Supplies' | 'Household' | 'Wishlist';
  quantity: number;
  checked: boolean;
  source?: 'manual' | 'inventory' | 'grocery';  // provenance for ERP flow
}

interface PurchaseRecord { id: ID; name: string; category: string; purchasedAt: string; }

interface Task {                 // (R5)
  id: ID; title: string;
  assignee: string;
  schedule: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  room?: Room;
  dueDate: string;                      // ISO
  done: boolean;
  lastCompleted?: string;
}

interface MaintenanceItem {      // (R6)
  id: ID; name: string;
  vendor?: string;
  lastService?: string; nextDue: string;   // ISO
  estimatedCost?: number;
  room?: Room;
  history: { date: string; note?: string; cost?: number }[];
}

interface HouseholdState {
  household: { name: string; members: string[] };
  inventory: InventoryItem[];
  groceries: GroceryItem[];
  shopping: ShoppingItem[];
  purchases: PurchaseRecord[];
  tasks: Task[];
  maintenance: MaintenanceItem[];
  rooms: Room[];
}
```

## 3. State architecture

- One `HouseholdProvider` wraps the app and exposes `{ state, dispatch }` plus
  typed action creators.
- **Reducer actions** (the API surface):
  `ADJUST_INVENTORY_QTY`, `ADD_INVENTORY`, `ADD_GROCERY`, `ADJUST_GROCERY_QTY`,
  `ADD_SHOPPING`, `TOGGLE_SHOPPING`, `ADD_TASK`, `COMPLETE_TASK`, `SET_TASK_FILTER`,
  `ADD_MAINTENANCE`, `MARK_SERVICED`, `RESET_SEED`.
- **Derived selectors** (pure, memoized) compute the cross-module views so screens
  stay dumb:
  - `selectLowStock(state)` → supplies/groceries under `minStock` (R1.4, R2.7, R3.4)
  - `selectTodayTasks(state)` → tasks due today, not done (R1.2, R5.3)
  - `selectUpcomingMaintenance(state)` → soonest `nextDue` (R1.3)
  - `selectExpiring(state)` → groceries expired / ≤3 days (R3.3)
  - `selectShoppingCount(state)` → unchecked shopping items (R1.5)

## 4. Cross-module flows (implementation)

| Flow | Mechanism |
|---|---|
| Inventory/grocery below min → shopping | "Add to list" button dispatches `ADD_SHOPPING` with `source`; dedupe by name |
| Low stock → dashboard | `selectLowStock` reads live state; no copy, always current |
| Complete task → dashboard count | `COMPLETE_TASK` flips `done` + sets `lastCompleted`; recurring tasks get `dueDate` advanced by cadence |
| Mark serviced → maintenance + history | `MARK_SERVICED` sets `lastService=today`, pushes history, advances `nextDue` |
| Check shopping item → history | `TOGGLE_SHOPPING` when checked appends `PurchaseRecord` |

## 5. Routing & navigation (N1)

```
/                 Dashboard
/inventory        Inventory (tabs: Linen / Kitchen / Supplies)
/grocery          Grocery & Pantry
/shopping         Shopping
/tasks            Tasks
/maintenance      Maintenance
```
Bottom tab bar with 5 primary tabs (Home, Inventory, Shopping, Tasks, More→Grocery/Maintenance)
inside a fixed 390px "phone" shell for the mobile simulation.

## 6. Extensibility (vision Phase 2/3 + future modules)

- **Backend swap:** replace `localStorage` load/save with a repository interface
  (`HouseholdRepo`) → Postgres + row-level security keyed by `household_id`. Domain
  types unchanged.
- **New modules** (Bills, Pets, Assets, Family Hub, Staff) = add a slice to
  `HouseholdState`, a route, and selectors. The reducer + provider pattern scales.
- **AI Assistant** consumes the same selectors (e.g. "how many clean towels?" =
  query over `inventory`).
- **Sync/multi-user:** reducer actions are already serializable → can become a
  command log for real-time sync.

## 7. Folder structure

```
nessy/
  docs/                 01-PLAN .. 06-SIMULATION
  src/
    domain/             types.ts, seed.ts, selectors.ts
    store/              HouseholdStore.tsx (provider + reducer), persistence.ts
    ui/                 tokens.css, components/ (Card, StatTile, Icon, Sheet, TabBar…)
    screens/            Dashboard, Inventory, Grocery, Shopping, Tasks, Maintenance
    App.tsx, main.tsx
  index.html
```
