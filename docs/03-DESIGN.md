# Nessy — Visual & UI Design (Step 3)

Mobile-first, warm, calm, "home" feeling — not a cold enterprise dashboard.
"Simple enough for families, powerful enough for luxury homes."

## 1. Brand & tone
- Friendly, organized, reassuring. Rounded geometry, soft shadows, generous spacing.
- Warm sage/teal primary (home, calm, growth) with a warm sand background.
- One accent per state: amber = attention, red = overdue/expired, green = good.

## 2. Design tokens

```css
/* Color */
--bg:        #F6F4EF;   /* warm sand canvas */
--surface:   #FFFFFF;
--surface-2: #F0EEE8;
--ink:       #1F2421;   /* near-black green */
--ink-2:     #5B635E;   /* secondary text */
--line:      #E6E3DB;

--brand:     #2F7E76;   /* sage teal */
--brand-700: #245E58;
--brand-50:  #E4F0EE;

--amber:     #D9952A;   --amber-50: #FaF1DF;
--red:       #C5523F;   --red-50:   #F8E6E2;
--green:     #4F9A5B;   --green-50: #E6F2E8;

/* Radius */
--r-sm: 10px; --r-md: 16px; --r-lg: 22px; --r-pill: 999px;
/* Shadow */
--shadow: 0 6px 20px rgba(31,36,33,.06), 0 1px 2px rgba(31,36,33,.05);
/* Spacing scale (4pt) */ 4 8 12 16 20 24 32
/* Type */
--font: -apple-system, "SF Pro Text", Inter, system-ui, sans-serif;
H1 28/700, H2 20/700, Title 17/600, Body 15/500, Caption 13/500, Micro 11/600(caps)
```

## 3. Layout system (N1)
- Fixed **phone shell** 390×844, rounded 44px, subtle bezel — frames the app for
  desktop preview *and* mirrors a real device for the simulation step.
- **Status bar** (time, signal) + **app header** (screen title + contextual action).
- **Scrollable content** with 16px gutters, 16px vertical rhythm between cards.
- **Bottom tab bar** (fixed): Home · Inventory · Shopping · Tasks · More.
  Tap targets ≥44px (N2). Active tab = brand color + filled icon.

## 4. Core components
- **Card** — white surface, radius-lg, --shadow, 16px padding.
- **StatTile** — dashboard quick metric: icon chip + number + label, tappable.
- **ListRow** — left icon/badge, title + meta line, right control (qty stepper / check / chevron).
- **QtyStepper** — − [n] + pill, 44px targets (R2.5, R3).
- **Badge/Pill** — status (Low, Expired, Due, Overdue, Good) in state colors.
- **SegmentedTabs** — in-screen category switch (Inventory Linen/Kitchen/Supplies; Tasks Today/Upcoming/All).
- **FAB / header "+"** — opens **AddSheet** (bottom sheet form) for R2.6/R3.5/R4.3/R5.4.
- **QuickAction chips** — dashboard row (R1.7).
- **EmptyState** — never shown thanks to seed data, but defined.

## 5. Screen blueprints

### Dashboard (R1)
1. Greeting "Good morning, the Reyes household" + date + weather pill (R1.1/R1.6).
2. Announcement banner (dismissible) (R1.8).
3. 2×2 StatTiles: Today's Tasks · Bills/Upcoming Maintenance · Low Stock · Shopping (R1.2–1.5).
4. "Today's tasks" mini-list (top 3, checkable) (R1.2).
5. "Upcoming maintenance" card (R1.3).
6. "Low stock" card with per-item "Add to list" (R1.4 → R4).
7. Quick actions chips (R1.7).

### Inventory (R2)
- SegmentedTabs Linen / Kitchen / Supplies.
- ListRows: name, room·location meta, condition badge, QtyStepper.
- Supplies show "x / min y" and a **Low** badge + "Add to list" when under min.
- Linen rows show last-washed.
- Header "+" → AddSheet.

### Grocery & Pantry (R3)
- SegmentedTabs Pantry / Refrigerator / Freezer.
- Rows: name, qty, expiry pill (green/amber/red), QtyStepper.
- Low/expiring rows show "Add to list".

### Shopping (R4)
- Grouped by category. Checkable ListRows with qty.
- Checked items animate to a "Recently purchased" section (history).
- "Frequently purchased" quick-add chips. Header "+".
- Source tag (from Inventory / Pantry) shown subtly.

### Tasks (R5)
- SegmentedTabs Today / Upcoming / All.
- Rows: checkbox, title, assignee avatar + room + cadence pill.
- Completing animates check; recurring shows "next: <date>".

### Maintenance (R6)
- Rows/cards: name, vendor, next-due pill (Overdue/Due soon/Scheduled), est. cost.
- Tap → last service + history; "Mark serviced" action.

## 6. Accessibility & motion (N2)
- Contrast ≥ 4.5:1 for text; state never by color alone (badge has a label).
- 44px min targets; 150–200ms ease transitions; reduced-motion respected.

A rendered mockup of the Dashboard accompanies this doc (see chat) and is the
visual target the built screens must match.
