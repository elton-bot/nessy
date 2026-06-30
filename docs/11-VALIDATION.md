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

### It's already hosted (GitHub Pages)
Live at **https://elton-bot.github.io/nessy/** — published from the `gh-pages`
branch (contents of `landing/`). To update it after editing `landing/`:
```bash
git subtree split --prefix landing -b gh-pages-tmp
git push -f origin gh-pages-tmp:gh-pages && git branch -D gh-pages-tmp
```
The OG image (`og-image.png`, 1200×630) is in place, so the Facebook link preview
looks premium.

### ⚠️ Make lead-capture live BEFORE posting (one 30-second step)
The form uses **Web3Forms** (free, no account). Right now `WEB3FORMS_KEY` in the
page is a placeholder, so submissions are saved only in the visitor's browser —
**they do NOT reach you.** To go live:
1. Go to **https://web3forms.com**, enter your email, copy the **Access Key** it
   gives you (each signup then gets emailed to you).
2. Paste it into `WEB3FORMS_KEY` near the bottom of `landing/index.html`.
3. Re-publish (the two commands above).

*(Alternatives if you prefer leads in a DB: point the fetch at the Nessy backend
`/api/waitlist` once the app is deployed — endpoint + table already built; read
them at `/api/waitlist?key=<WAITLIST_KEY>`.)*

### Before posting — quick checklist
- [ ] **Web3Forms key set** and a test submission actually arrives in your email.
- [ ] Open https://elton-bot.github.io/nessy/ on your phone — looks right (mobile-first).
- [ ] Paste the link in a private chat first to confirm the FB-style preview image shows.

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
