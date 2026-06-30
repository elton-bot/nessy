# Nessy — Validation Kit (run this before building Estate)

Goal: prove people will **pay** for the staffed-home ("Estate") wedge before
building it. Two tools: the **landing page** (`landing/index.html`) and the
**interview script** below. Success bar is in §4.

---

## 1. The landing page

`landing/index.html` is a self-contained page (no build step). It sells the
3 tiers, leads with the Estate/staff angle, and captures the validation signal:
home type, **whether they employ staff**, tier preference, and **willingness to
pay** — not just an email.

### Make lead-capture live (pick ONE — needed before you post)
The form posts to `WAITLIST_ENDPOINT` (top of the `<script>` in the HTML).
It's empty by default (saves to the browser only). Set it to one of:

- **Tally (easiest, free, ~5 min):** create a form at tally.so, or just use Tally
  as the destination — simplest is to point the button at a Tally form. Or use
  **Formspree**: create a form, paste its endpoint URL.
- **Google Apps Script (free, your Google acct):** a 10-line web app that appends
  to a Google Sheet; paste its `/exec` URL.
- **Nessy backend (integrated):** once the app is deployed, set it to
  `"/api/waitlist"` (endpoint already built; read leads at
  `/api/waitlist?key=<WAITLIST_KEY>`).

> For posting *this week*, Tally/Formspree is the no-friction choice. The Nessy
> backend option is there for when the app is live.

### Host it (pick ONE)
- **Netlify Drop / Cloudflare Pages / GitHub Pages** — drag the `landing/` folder
  in; free; gives a public URL in minutes. (GitHub Pages: it's already in your
  repo under `landing/`.)
- Or serve from the deployed Nessy app.

### Before posting — quick checklist
- [ ] `WAITLIST_ENDPOINT` set and a test submission lands in your sheet/DB.
- [ ] Add an `og-image.png` (1200×630) next to the HTML so the Facebook preview
      looks premium (a clean Nessy logo + tagline on the sand background). Without
      it, FB shows a bare link.
- [ ] Open the public URL on your phone — it should look right (it's mobile-first).

---

## 2. Posting in Facebook groups (wealthy households / staff)

- **Lead with the pain, not the product.** Don't open with "check out my app."
  Open with the relatable problem + a soft ask.
  > *"Quick one for households with helpers: how do you keep track of your staff's
  > tasks, attendance, and pay — notebook, group chat, or memory? I'm building a
  > simple app to put it all in one place and want to get it right. If this is a
  > headache for you, I'd love 10 minutes — or peek here: [link]."*
- **Respect group rules.** Many ban promo; ask admins or frame as research/feedback.
- **Tone matters with this audience.** Premium, calm, privacy-first — never
  "surveil your maid." Frame as *fairness + organization* (staff get clear tasks,
  on-time pay; owners get peace of mind).
- **Two audiences, two angles.** Owners → "run your home effortlessly." Staff →
  "clear tasks, logged attendance, get paid on time." Both are validation gold.
- **Seed 1:1s.** The form is quantitative; the interviews (below) are where the
  real insight is. Invite the warmest respondents to talk.
- **Track source.** Add `?g=groupname` to the link per group to see what converts
  (the form records `ref`).

---

## 3. The interview script (1 page — keep it to ~15 min)

Talk to **20–30** staffed/affluent households. Listen 80%, pitch 20%. Don't lead
the witness — ask how they do it *today* before showing anything.

**Warm-up**
1. Tell me about your home — who lives there, and who helps run it (staff)?
2. Walk me through a normal week of keeping the household running.

**Problem (the core — don't mention Nessy yet)**
3. How do you track groceries/supplies and what's running low today?
4. How do you handle home maintenance (aircon, pool, pest, etc.) — how do you
   remember what's due?
5. *(If staff)* How do you assign your helper/driver/nanny their work? How do you
   know it got done?
6. *(If staff)* How do you track their attendance, leave, and pay? Show me, if you
   can. **← watch for the notebook/spreadsheet/groupchat.**
7. What's the most annoying or time-consuming part of all this?
8. Have you tried any app or tool for it? What happened / why'd you stop?

**Value & willingness to pay (after they've described the pain)**
9. If one app handled all of this — household *and* staff — how would that change
   your week?
10. What's the single feature that would make you say "yes, I need this"?
11. **Would you pay for it? What feels fair per month?** *(Stay silent; let them
    answer. Then probe: "would $20 feel high, fair, or cheap?")*
12. *(If yes)* Could I put you on the founding-members list and follow up when
    it's ready? *(commitment signal)*

**Close**
13. Who else do you know who runs a busy/staffed home that I should talk to?

> Record verbatim quotes (esp. for Q7, Q10, Q11). Patterns across 20+ people beat
> any single opinion.

---

## 4. Decision gate (go / no-go)

After ~20–30 interviews + landing-page data, **green-light building Estate only
if most of these hold:**

| Signal | Pass bar |
|---|---|
| Pay-intent (Estate) | **≥ 1 in 3** staffed households say they'd pay **≥ $10/mo** |
| Magnet feature | A clear, repeated "must-have" (likely attendance, payroll, or task-proof) |
| Current pain | Most manage staff via notebook/chat/memory (i.e. real gap) |
| Landing signal | Healthy waitlist rate + Estate skew in the tier question |
| Reachability | You can find these households repeatably (which groups/channels worked) |

- **All/most pass →** build the Estate layer on the existing core (roles → staff →
  attendance → task-proof → leave → payroll), run 3–5 concierge pilots, then the
  beachhead launch.
- **Fail (esp. pay-intent) →** stop or pivot. Don't build into silence. You'll have
  spent days, not months — exactly the point of validating first.

See `docs/10-BUSINESS-PLAN.md` for the full strategy this gate feeds.
