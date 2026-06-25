# Nessy — Mobile Simulation (Step 6)

The prototype was run and exercised in a **375×812 mobile viewport** (iPhone-class)
through the in-browser device simulator — real taps, real state, screenshots at
each step.

## How to run it yourself
```bash
cd nessy
npm install        # already done
npm run dev        # → http://localhost:5180/
```
Open in a browser and set a mobile viewport (DevTools device toolbar, ~390×844),
or just resize narrow — the phone shell renders with a device frame ≥430px wide.

## Simulation walkthrough (what was tapped, what happened)

1. **Dashboard load** — greeting, 4 stat tiles (Tasks 4 · Maintenance 2 · Low 5 ·
   To-buy 4), today's tasks, upcoming maintenance (AC "5d overdue"), low-stock
   card, quick actions. No console errors.
2. **Complete a task** — tapped "Water the plants" checkbox → daily task
   rescheduled to next day and left today's list; Tasks-today tile 4 → 3.
3. **Inventory → Supplies** — Low badges on detergent (1/min2), trash bags
   (1/min3), toilet tissue (6/min8); dishwashing liquid (4/min2) correctly not
   flagged. Steppers functional.
4. **Low stock → Shopping (ERP)** — tapped "+ List" on Laundry detergent → it
   appeared under Shopping ▸ Supplies tagged "from Inventory"; To-buy 4 → 5.
5. **Check off purchase** — tapped Bananas → moved to "Recently purchased"
   (strikethrough) and recorded; To-buy 5 → 4.
6. **Grocery → Refrigerator** — expiry states verified: Milk "in 2d" (amber) +
   Low, Eggs "in 9d" (neutral), Yogurt "expired 1d ago" (red).
7. **Add sheet** — opened the grocery bottom-sheet form; "Add item" stays
   disabled until Name is entered (validation works).
8. **Maintenance** — list sorted by soonest due; tapped "Mark serviced today" on
   AC → Last set to today, Next +90 days, card re-sorted to bottom ("in 90d"),
   history appended.
9. **Back to Dashboard** — Maintenance-due tile 2 → 1, upcoming-maintenance card
   re-pointed to "Pool · in 1d". Fully consistent with the actions taken.

## Result
The prototype behaves as a cohesive household ERP on a mobile viewport: actions
in one module propagate live to the dashboard and other modules. State persists
across reloads (localStorage). Reset anytime via **More → Reset demo data**.

## Known prototype limitations (by design)
- Single-device local data (no backend/auth/multi-user sync).
- Weather is static-mocked.
- Phase 2/3 + Future modules (Bills, Pets, Assets, Family Hub, Staff, AI
  Assistant) are out of scope — architecture leaves slots for them (see
  `02-ARCHITECTURE.md` §6).
