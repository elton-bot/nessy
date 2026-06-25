# Nessy — Your household, organized

A mobile-first **Household ERP** prototype: one place to run a home's inventory,
groceries, shopping, tasks, and maintenance — where an action in any module flows
through to the dashboard and the rest of the app.

This repository was built end-to-end in six steps; each has a document in `docs/`:

| Step | Doc |
|------|-----|
| 1. Requirements plan | [docs/01-PLAN.md](docs/01-PLAN.md) |
| 2. System design | [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) |
| 3. Visual / UI design | [docs/03-DESIGN.md](docs/03-DESIGN.md) |
| 4. Build | this app (`src/`) |
| 5. QA report | [docs/05-QA.md](docs/05-QA.md) |
| 6. Mobile simulation | [docs/06-SIMULATION.md](docs/06-SIMULATION.md) |

## Run

```bash
npm install
npm run dev      # http://localhost:5180/
```

Use a mobile viewport (~390×844). Reset the demo data anytime from **More →
Reset demo data**.

## Stack
React 18 + TypeScript + Vite, React Router, a single reducer-backed
`HouseholdStore` with derived selectors for the cross-module flows, localStorage
persistence, and a hand-built design-token UI. No backend — all data is local
(privacy by design).

## Scope
Phase-1 core modules: **Dashboard, Inventory, Grocery/Pantry, Shopping, Tasks,
Maintenance**, with a shared Rooms concept. Phase 2/3 and future modules (Bills,
Pets, Assets, Family Hub, Staff, AI Assistant) are intentionally out of scope;
the architecture leaves room for them.
