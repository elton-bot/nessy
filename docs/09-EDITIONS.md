# Nessy — Two Editions: Home vs Home+Staff ("with maid")

## 1. The two editions

| | **Nessy Home** (without maid) | **Nessy Home+** (with maid / staff) |
|---|---|---|
| Who | Families who do the housework themselves | Households that employ help — maid, and optionally driver, nanny, cook, gardener |
| Vision target | Primary: families, couples, homeowners | Secondary: luxury homes, villas, estates, multi-gen homes |
| Mental model | Shared family organizer | Family organizer **+ a lightweight household-staff operations tool** |
| Status today | **Already built** (current prototype) | This plan: the delta on top |

The current prototype already *is* Nessy Home. So this plan is mostly: **(a)** how the two editions coexist, and **(b)** the "with maid" delta.

## 2. Core recommendation: one codebase, two editions — not two apps

Build **one app** with an `edition` (or plan tier) on the household, not two separate products.

Why:
- The ERP core (inventory, grocery, shopping, tasks, maintenance, dashboard) is **100% shared**. Two codebases = double the maintenance for one shared engine.
- Households **evolve**: a family hires a maid next year. They should flip a setting, not migrate apps and lose their data.
- It maps cleanly to **pricing tiers** (Home = free/cheap, Home+ = paid).
- The architecture already supports it: per-household state + members. "Staff" is a new kind of member with a restricted role, gated by edition.

What the user experiences still feels like "two versions": the Staff modules, staff logins, and staff dashboard only exist in Home+. A plain family never sees any of it.

> Decision to confirm: edition as a **toggle the owner can switch anytime** (recommended) vs a **fixed choice at signup**. Recommended: switchable — "Do you have household staff?" in settings flips Home ⇄ Home+.

## 3. What is identical in both editions

Everything already built: Dashboard, Inventory, Grocery & Pantry, Shopping, Tasks, Maintenance, Rooms, the Postgres + RLS + auth + realtime backend. Home+ **adds to** this; it removes nothing.

## 4. The "with maid" delta — what Home+ adds

The difference is not just "one more module." It introduces a **second class of user** (staff) with restricted access, and the workflows around managing them.

### 4.1 Roles & access (the foundational change)
Three roles within a household:
- **Owner / Manager** — full access (family adults). Manages everything incl. staff & finances.
- **Family member** — household member, no staff-management or finance powers (existing behavior).
- **Staff** — the maid/driver/etc. **Restricted** account: sees only their own tasks, schedule, and attendance. **Never sees household finances, bills, or other members' private data.**

This is the privacy backbone: a maid using the app must not see the family's bills or budgets.

### 4.2 Staff profiles (new module: "Staff")
Per staff member: name, **position** (Maid / Driver / Nanny / Cook / Gardener / Caregiver), photo, contact + emergency contact, employment type (live-in / daily / part-time), start date, status (active / on-leave / ended), assigned rooms/areas.

### 4.3 Attendance
Clock in / clock out (staff taps in the app, or owner logs it). Daily attendance log, hours, late/absent flags, monthly summary. Feeds payroll (days worked).

### 4.4 Task assignment + verification (extends existing Tasks)
- Tasks can be assigned to **staff**, not just family.
- **Proof of completion**: staff marks done, optionally with a photo.
- **Review flow**: owner sees "completed — pending review" → approves or sends back with a note. (Family-edition tasks stay one-tap-done; verification is a Home+ option.)

### 4.5 Leave requests
Staff requests leave (date range, reason) → owner approves/declines. Leave shows on the shared calendar and reduces expected attendance.

### 4.6 Payroll (light)
Salary/rate, pay cycle, days worked (from attendance), advances/loans, deductions, **payslip** generation, payment history. Intentionally lightweight — a record-keeping aid, not full accounting/tax compliance.

### 4.7 Staff-facing experience (restricted app view)
When a Staff role logs in, the app is a **different, simpler shell**:
- Tabs: **My Tasks · My Schedule · Attendance (clock in/out) · Leave**.
- No dashboard finances, no inventory edit rights (maybe read-only "what to restock"), no other members.
- Big, simple, photo-friendly task cards.

> Decision to confirm: do maids get **their own login** (recommended — unlocks attendance, task verification, self-service leave) or does the owner just **track them** with no staff login (simpler, but loses the staff-facing value)? Recommended: staff logins, because that's what makes Home+ a real product vs a glorified checklist.

## 5. Architecture impact (small, because the base supports it)

Reuses the existing per-household + members + RLS design.

```
households   + edition: 'home' | 'home_plus'         -- gates the staff features
members      + role: 'owner' | 'member' | 'staff'    -- drives access + which shell loads
             + (staff fields below when role='staff')

NEW tables (all household-scoped, same RLS pattern as today):
  staff_profiles(id, household_id, member_id, position, employment_type,
                 start_date, status, salary, pay_cycle, ...)
  attendance(id, household_id, staff_id, date, clock_in, clock_out, status)
  leave_requests(id, household_id, staff_id, start, end, reason, status)
  payroll_records(id, household_id, staff_id, period, days_worked, gross,
                  deductions, advances, net, paid_at)
tasks        + assignee_kind: 'member' | 'staff'
             + verification: 'none' | 'pending' | 'approved'
             + proof_photo_url?
```

Access control = two layers:
1. **RLS (already there)** isolates each household's rows.
2. **Role checks (new)** inside the household: staff role → API rejects reads of finances/bills, and only returns their own tasks/attendance. Add a column/feature allow-list per role.

Edition gating: `household.edition === 'home_plus'` enables the Staff/Attendance/Payroll routes, the "assign to staff" option, and staff-role logins. In `home`, those routes/UX simply don't render.

The shared pure reducer extends with staff actions (`CLOCK_IN`, `REQUEST_LEAVE`, `APPROVE_TASK`, `RECORD_PAYROLL`, …) — same pattern, so client and server stay in lockstep.

## 6. Access matrix (who sees what in Home+)

| Capability | Owner/Manager | Family member | Staff |
|---|---|---|---|
| Dashboard (full) | ✅ | ✅ | ❌ (own summary only) |
| Inventory / Grocery / Shopping | ✅ | ✅ | read-only / assigned only |
| Tasks — all | ✅ | ✅ | ❌ (only own) |
| Tasks — complete own | ✅ | ✅ | ✅ (+ proof) |
| Maintenance | ✅ | ✅ | ❌ |
| **Bills / budgets / finances** | ✅ | ✅ | **❌ never** |
| Staff profiles / payroll | ✅ | ❌ | ❌ (own payslip only) |
| Attendance — clock self | — | — | ✅ |
| Approve tasks / leave / payroll | ✅ | ❌ | ❌ |

## 7. Pricing & positioning — 3 tiers (LOCKED)

- **Nessy Lite** — Free, limited. Funnel / solo & small households. Caps on items, modules, members; no staff.
- **Nessy Home** — Standard, paid. Full family ERP, all core modules, unlimited members, sync. (Current build.)
- **Nessy Estate** — Premium, paid. Everything in Home **+ the staff-operations layer** (staff logins, attendance, task verification, leave, payroll). Targets affluent homes, villas, estates.

Goal: one product spanning **solo living → small family → big family → huge estate**, with the edition/tier adapting the experience.

## 8. Phased rollout

1. **Phase A — Roles foundation.** Add `role` to members + `edition` to household; build the access-control layer and the owner-side "Staff" module (profiles only). Ship the Home+ toggle. *(No staff logins yet — owners can already track staff.)*
2. **Phase B — Staff app + attendance + task verification.** Staff-role restricted shell, clock in/out, assign-to-staff, proof + review flow.
3. **Phase C — Leave + payroll.** Leave requests/approvals, payroll & payslips.
4. **Phase D — Polish.** Staff performance notes, multi-staff scheduling, AI assistant queries spanning staff ("who's on leave Friday?").

## 9. Decisions — LOCKED

1. **One app + edition toggle.** ✅
2. **Staff get their own (restricted) logins.** ✅
3. **Tier names:** Nessy Lite (free) · Nessy Home (standard) · Nessy Estate (premium). ✅
4. **Payroll:** simple record-keeping (no tax/statutory math). ✅
5. **Staff types:** all from the start (Maid, Driver, Nanny, Cook, Gardener, Caregiver). ✅

Business viability assessed before build → see `docs/10-BUSINESS-PLAN.md`.
