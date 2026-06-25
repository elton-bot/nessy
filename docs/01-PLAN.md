# Nessy — Requirements Plan (Step 1)

> Mobile-first Household ERP. This plan translates the product vision into a
> buildable Phase-1 prototype scope, with explicit, testable requirements that
> Step 5 (QA) checks against.

## 1. Goal & success criteria

Build a runnable, mobile-first prototype of Nessy's **Phase-1 core modules** that a
family could navigate to manage their household. Success = every requirement
below is demonstrable in the running app on a mobile-sized viewport.

**Out of scope for the prototype** (vision Phase 2/3 + Future Modules):
Tablet/web layouts, Staff, AI Assistant, Pets, Family Hub, Bills, Asset Registry,
real backend/auth/sync, push notifications. These are stubbed or deferred and
called out so the architecture leaves room for them.

## 2. Phase-1 modules (from the vision doc)

The vision's own Phase 1 list: **Dashboard, Inventory, Grocery, Shopping, Tasks,
Maintenance**. These are the prototype's six screens, plus a Rooms cross-cut.

## 3. Functional requirements (testable)

IDs are referenced by the QA checklist in `05-QA.md`.

### R1 — Home Dashboard
- R1.1 Shows a personalized greeting + today's date.
- R1.2 "Today's tasks" summary with count and quick list (top 3).
- R1.3 "Upcoming maintenance" card (next due item + date).
- R1.4 "Low stock alerts" card driven by supplies/pantry below minimum.
- R1.5 "Shopping reminders" — count of items on the shopping list.
- R1.6 Weather widget (mocked, static is acceptable for prototype).
- R1.7 Quick actions row (e.g. Add task, Add to shopping, Add item).
- R1.8 Household announcement banner (optional, mocked).

### R2 — Inventory (Linen + Kitchen + Supplies)
- R2.1 Browse items grouped by category (Linen, Kitchen, Supplies).
- R2.2 Each item shows quantity, room/location, condition.
- R2.3 Linen items track last-washed + replacement reminder fields.
- R2.4 Supplies track current stock vs minimum stock; below-min flagged.
- R2.5 Adjust quantity inline (+/−).
- R2.6 Add a new inventory item (category, name, qty, room, condition).
- R2.7 Items below minimum surface to Dashboard R1.4 and can be added to Shopping.

### R3 — Grocery & Pantry
- R3.1 Browse pantry/fridge/freezer items by storage location.
- R3.2 Each item shows quantity, expiration date, location.
- R3.3 Expiry highlighting: expired / expiring-soon (≤3 days) visual states.
- R3.4 Low-stock items can auto-add to the shopping list.
- R3.5 Add a grocery item with expiry + location.

### R4 — Shopping
- R4.1 Shared shopping list with checkable items.
- R4.2 Items grouped by store category (Groceries, Supplies, etc.).
- R4.3 Add an item manually.
- R4.4 Check off an item → moves to purchase history.
- R4.5 "Frequently purchased" / quick-add suggestions.
- R4.6 Items pushed from Inventory (R2.7) and Grocery (R3.4) appear here.

### R5 — Household Tasks
- R5.1 List tasks with assignee, schedule (daily/weekly/monthly/custom), room.
- R5.2 Mark a task complete → records completion + updates Dashboard count.
- R5.3 Filter: Today / Upcoming / All.
- R5.4 Add a task (title, assignee, schedule, room).
- R5.5 Recurring tasks show their cadence; completing a recurring task reschedules
  the next occurrence (simple prototype logic).

### R6 — Home Maintenance
- R6.1 List maintenance items with last-service + next-due dates and vendor.
- R6.2 Visual state for overdue / due-soon.
- R6.3 Service history (at least last service shown; list acceptable).
- R6.4 Estimated cost displayed.
- R6.5 Mark serviced → updates last-service to today + schedules next due.

### R7 — Rooms (cross-cut)
- R7.1 A Rooms reference exists; inventory/tasks/maintenance reference a room.
- R7.2 Room names come from a shared list (Master Bedroom, Kitchen, etc.).

## 4. Non-functional / UX requirements

- N1 Mobile-first: designed for a 375–430px viewport; bottom tab navigation.
- N2 Beautiful & intuitive: consistent design system, clear hierarchy, large tap targets (≥44px).
- N3 Automation-before-manual: low-stock → shopping, expiry alerts, recurring reschedule happen without manual bookkeeping.
- N4 Fast: client-only state, instant interactions; data seeded so screens are never empty.
- N5 Privacy-by-design posture: all data local to the device/session (no network).
- N6 Persistence within a session (localStorage) so changes survive reloads.

## 5. Cross-module data flows (the "ERP" glue — key to test)

1. **Inventory below-min → Dashboard low-stock → Shopping.** (R2.7, R1.4, R4.6)
2. **Pantry expiry/low → Dashboard + Shopping.** (R3.3/3.4, R1.4, R4.6)
3. **Task completion → Dashboard today-count drops.** (R5.2, R1.2)
4. **Maintenance due → Dashboard upcoming card.** (R6.2, R1.3)
5. **Shopping check-off → purchase history; (optional) restock inventory.** (R4.4)

These flows are what makes Nessy an ERP rather than six separate lists. QA
prioritizes them.

## 6. Build plan / sequencing (maps to the user's 6 steps)

1. **Plan** — this document.
2. **System design** — `02-ARCHITECTURE.md`: stack, data model, state, routing.
3. **UI/visual design** — `03-DESIGN.md`: tokens, components, screen layouts + a rendered mockup.
4. **Build** — Vite + React + TS app implementing R1–R7 + N1–N6.
5. **QA** — `05-QA.md`: tick every Rx/Nx against the running app; fix gaps.
6. **Mobile simulation** — run the app, drive it at mobile dimensions, screenshot each module.

## 7. Acceptance

Prototype is "done" when: all R-requirements demonstrable, all five cross-module
flows work, the app runs without errors at mobile viewport, and the QA checklist
passes (or every non-pass is explicitly justified).
