# Nessy — Multi-user Sync (backend)

Turns the single-device prototype into a **shared household**: every family
member's device sees the same live state.

## Design
- **Shared reducer.** `src/domain/reducer.ts` is pure (no React, no browser APIs)
  so the *identical* ERP logic runs on the client and on the server. The rules
  can never drift between devices.
- **Authoritative server.** `server/index.ts` (Express, run with `tsx`) holds the
  household state in a file-backed store (`server/data/<id>.json`) plus a version
  number and an activity log.
  - `GET  /api/household/:id` → `{ version, state }`
  - `GET  /api/household/:id/version` → `{ version }` (cheap poll)
  - `GET  /api/household/:id/activity` → recent `{ actor, type, at }`
  - `POST /api/household/:id/action` `{ action, actor }` → applies the shared
    reducer, bumps version, appends activity, returns the new snapshot.
- **Client sync** (`src/store/HouseholdStore.tsx` + `src/store/sync.ts`):
  - On load, fetches the server snapshot (falls back to the localStorage cache
    when offline).
  - Every dispatch applies **optimistically** for instant UI, then POSTs the
    action and reconciles with the authoritative snapshot.
  - **Polls** `/version` every 2.5 s; when the server is ahead (another member
    changed something) it pulls the new snapshot. This is what makes other
    devices' changes appear live.
  - A **member switcher** ("acting as …") tags each action with who did it; a
    status dot shows connecting / synced / offline.
- **Offline resilience.** localStorage still caches the latest state, so the app
  keeps working with no server and re-syncs when it returns.

## Run
```bash
npm install
npm run server     # http://localhost:5181  (authoritative state)
npm run dev        # http://localhost:5180  (proxies /api → 5181)
```

## Proven in simulation (see screenshots in chat)
1. App loaded "Synced · shared household", acting as Liza.
2. Three actions were POSTed to the backend **as other members** (Andre completes
   "Feed the dog", Andre adds "Olive oil", Joaquin services the AC) — i.e. their
   phones.
3. Within one poll cycle, Liza's running simulation updated with **no local
   input**: Tasks today 4→3, Maintenance due 2→1, To buy 4→5, and the activity
   feed showed all three members' actions.
4. Reverse direction: a "+ Add" tap in the simulation reached the server
   (version 4→5, activity logged "Liza → ADD_SHOPPING").

## Production notes (beyond the prototype)
Swap the file store for Postgres with row-level security keyed by `household_id`;
add auth (one account per member) and replace polling with WebSockets/SSE for
instant push. The action-based API is already a command log, so real-time sync
and an audit trail come naturally.
