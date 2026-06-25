# Nessy — Your household, organized

A mobile-first **Household ERP**: one place to run a home's inventory, groceries,
shopping, tasks, and maintenance — where an action in any module flows through to
the dashboard and every family member's device.

## Deploy (one click)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/elton-bot/nessy)

Click → **Apply**. Render provisions Postgres + the web service, runs the
migration, and seeds a demo household. Log in as any member with PIN **1234**.
Details in [docs/08-DEPLOY.md](docs/08-DEPLOY.md).

This repository was built end-to-end in six steps; each has a document in `docs/`:

| Step | Doc |
|------|-----|
| 1. Requirements plan | [docs/01-PLAN.md](docs/01-PLAN.md) |
| 2. System design | [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) |
| 3. Visual / UI design | [docs/03-DESIGN.md](docs/03-DESIGN.md) |
| 4. Build | this app (`src/`) |
| 5. QA report | [docs/05-QA.md](docs/05-QA.md) |
| 6. Mobile simulation | [docs/06-SIMULATION.md](docs/06-SIMULATION.md) |
| +. Multi-user sync backend | [docs/07-SYNC.md](docs/07-SYNC.md) |

## Run

```bash
npm install
npm run server   # http://localhost:5181  authoritative shared state
npm run dev      # http://localhost:5180  the app (proxies /api → 5181)
```

Use a mobile viewport (~390×844). Switch the acting family member from the
dashboard header; changes sync across devices sharing the household. Reset the
demo data anytime from **More → Reset demo data**.

## Stack
React 18 + TypeScript + Vite, React Router, a single reducer-backed
`HouseholdStore` with derived selectors for the cross-module flows. The reducer
is a **pure shared module** run identically on the client and on an Express sync
server, so a household stays consistent across every member's device. localStorage
provides an offline cache; an optimistic-dispatch + polling client keeps devices
live. See [docs/07-SYNC.md](docs/07-SYNC.md).

## Scope
Phase-1 core modules: **Dashboard, Inventory, Grocery/Pantry, Shopping, Tasks,
Maintenance**, with a shared Rooms concept. Phase 2/3 and future modules (Bills,
Pets, Assets, Family Hub, Staff, AI Assistant) are intentionally out of scope;
the architecture leaves room for them.
