# Coach — plans, reviews and AI coaching (roadmap D9)

Written 2026-11-01 from a planning chat with Aaron. Builds on D8
(`r&d/specs/ai-key-spec.md`): every AI call goes through `aiCall`, on the
user's own key, under the monthly cap.

## The idea in one line

**Ironlog's own maths does the analysis; the AI only explains it and makes
personal adjustments.** Most of the coach works with no key at all. That keeps
it fast, free for most people, and stops the AI inventing numbers.

## Parts, in build order

0. **Coach button, chat sheet and coach memory** — local, no AI (§0).
   *Build first, with part 1.*
1. **Plan builder from templates**, run inside the coach chat — local, no AI
   (§1–§4). *Build first.*
2. **Training digest** — local summary every AI feature reads (§5).
3. **Session debrief** — AI, on the session summary (§6).
4. **Weekly / block review** — AI, a card on Home / Stats (§6).
5. **Tailor it** — optional AI pass over a template plan (§4).
6. **Ask the coach** — scoped chat (§7).
7. **Cardio trend coach** — optional, as in the roadmap (§8).

Aaron will test part 1 on himself (experienced) and on Chelsea (new to
training), so both paths must be right in the first build.

---

## 0. The Coach button and its memory (added 2026-11-01)

**One way in:** a raised round **Coach** button in the middle of the bottom
bar, between Train and Stats, so the bar reads
Home · Calendar · Train · **◉** · Stats · Health (three either side). In the
98 skin it's a **Coach** menu. It opens the coach chat sheet. Everything in
this spec starts from there; other entry points (session summary, Home
card) open the same chat at the right spot.

**The chat is the setup.** The §1 questions are asked *in the chat* as coach
bubbles with tap-answer chips (day picker, time chips etc.) — no typing and
**no AI**, so it works without a key and costs nothing. Free-text chat
(§7) needs a key; without one the input says so and the chips still work.

**Coach memory** — a small record the coach checks every time it opens, so
it never asks the same thing twice. Stored as `S.coach` in the app's own
data (not a cookie): on the device, in JSON export and in Drive sync, so a
new phone remembers too.

```
S.coach = {
  setupDone: true,            // false → chat opens straight into §1
  setupAt: '2026-11-01',
  answers: { goal, eventDate, where, days: ['mon',…], dayPlace: {mon:'gym'},
             minutes, experience, priority: [leafKey…], easy: [joint…] },
  planId: '…',                // the plan the setup produced, if accepted
  notes: ['Hates lunges'],    // things the user asked the coach to remember
  summary: '…',               // rolling short summary of past chats (AI)
  lastDebrief: '…', lastReview: '…'
}
```

- **On open:** no `setupDone` → start the setup. Done → greet with a short
  status line from memory and the digest ("5-day PPLUL, week 3. Bench
  stalled 2 weeks.") plus suggested prompts and chips: *New plan*,
  *Change my answers*, *Review my week*, *Debrief last session*.
- **"Change my answers"** reopens the setup with every answer pre-filled;
  change one and go straight to the preview.
- **Notes:** the coach may *suggest* a note ("Remember that you can't do
  lunges?") — it's only saved when the user taps Yes. A user can also say
  "remember …".
- **Coach settings** (in the chat's ⋯): view and edit answers and notes,
  *Forget everything* (clears `S.coach` after a confirm; training data is
  untouched).
- **Size:** notes capped (about 20 short lines) and `summary` kept under
  ~300 words, since memory is sent with every AI call (cached).
- **Existing users** (like Aaron, who already has data): `setupDone` starts
  false, but the setup pre-fills everything it can from history, places and
  the installed program, so it's a quick confirm, not a quiz.

## 1. Setup questions

Asked in the coach chat (§0) the first time it opens, and again from
*Change my answers* or *New plan*. The welcome screen (C1) ends with a "Set
up your coach" button that opens it. Skip any question the app can already
answer from C1 or from history, and show the answer as a pre-filled step
instead.

| # | Question | Answers | What it drives |
|---|---|---|---|
| 1 | What are you training for? | Strength · Size · Strongman · Powerlifting meet · General fitness | Rep ranges, target RIR, which lifts are "main" (§3) |
| 2 | Got a date? *(meet and strongman only)* | Date · No event yet | With a date, the plan becomes a block counting down to it (C6, `blocks-spec.md`) |
| 3 | Where do you train? | Gym · Home · Both | The place's kit and plates (D6). A new place gets a quick kit checklist |
| 4 | Which days? | Tap weekdays | **The number of days tapped picks the split** (§2). Split name and week preview update live as you tap. With "Both", each tapped day gets a gym/home toggle |
| 5 | How long per session? | 30 · 45 · 60 · 90 min | Exercises per day: about 4 / 5 / 6 / 8, warm-ups included |
| 6 | How long have you trained properly? | Under 6 months · 6 months–2 years · 2+ years | Progression speed and plan version (§3). Asked before Q7 so Q7 can be skipped |
| 7 | Lifts you care most about? *(skipped for under 6 months)* | Pre-selected from Q1; add / remove | These go first in their session and get the most sets. Beginners get Q1's default main lifts |
| 8 | Anything to go easy on? | Joints-to-leave-alone list (E5) and adaptation chips (C5) | Swaps exercises before the preview |

Then **Preview → Accept** (or **Tailor it**, §4, when a key is set).

- There is **no separate "how many days" question** — tapping the days is the
  answer (Aaron, 2026-11-01).
- Q4 shows a gentle warning, not a block, when heavy lower days land back to
  back, and suggests a respaced week.
- Every answer can be changed from the preview without starting over.
- C4 rules: big targets, labels, works with TalkBack.

## 2. Splits

| Days tapped | Split | Notes |
|---|---|---|
| 1 | Full body | |
| 2 | Upper / Lower | Aaron's call (2026-11-01) — not full body ×2 |
| 3 | Push / Pull / Legs | |
| 4 | Upper / Lower / Upper / Lower | |
| 5 | Push / Pull / Legs / Upper / Lower | |
| 6 | PPL / PPL | Added so a 6-day pick isn't a dead end |
| 7 | Not offered as training days — the 7th tap shows "pick one rest day" | |

## 3. Templates

A template is data, not code: one JSON file per split in `r&d/data/templates/`
built into the app, like the morning-stretch routine.

- **Days are lists of slots**, not exercises. A slot is a movement pattern and
  a role, e.g. `{ pattern: "horizontal-press", role: "main" }`,
  `{ pattern: "triceps", role: "accessory" }`.
- **Filling a slot:** the app picks a leaf from `EX_DB` that fits the pattern,
  is available at that day's place (D6), isn't on the go-easy list (Q8), and
  prefers the user's priority lifts (Q7). Each slot keeps a short ranked list
  so the preview can offer **Swap** with sensible alternatives.
- **Session length** (Q5) trims slots from the end of the day: accessories go
  first, main slots never.
- **Goal** (Q1) sets reps and RIR per role. Starting values (to be checked
  with Aaron before shipping):
  - Strength: main 3–5 reps @ RIR 2, accessories 6–10 @ RIR 2
  - Size: main 6–10 @ RIR 2, accessories 10–15 @ RIR 1–2
  - Strongman: Strength, plus an event slot (carry, load or press medley
    from B1) on one day
  - Powerlifting meet: Strength with the competition lifts as main
  - General fitness: 8–12 @ RIR 2–3 everywhere
- **Experience** (Q6):
  - Under 6 months: one version every week, fewer sets, RIR never below 2,
    no AMRAPs, and slower load increases.
  - 6 months–2 years: the standard template.
  - 2+ years: the **A/B-week version** (heavy comp-lift week / accessory
    week, so two ultra-heavy lifts never land in one session). Aaron's own
    PPLUL is the reference for the 5-day A/B template.
- **Output is a normal program with `loads: "rir"`** (see
  `autoreg-spec.md` → Plans with no weights): no planned weights, each set
  has its target RIR `t`. Loads come from the working e1RM at start; a new
  user with no history gets blank weights that fill in after the first RIR
  set. No new program format.
- Installing a plan uses the existing path (`S.programs`); the old plan is
  kept, not overwritten.

## 4. Preview, accept and "Tailor it"

- **Preview:** the week as day cards — exercises, sets × reps @ RIR, place.
  Tap an exercise to **Swap** from its slot's ranked list.
- **Accept** installs it. **Nothing changes a plan without the user
  accepting it** — not a template, not the AI (Aaron, 2026-11-01).
- **Tailor it** (key set, optional): one Haiku 5.5 call. Input: the
  template plan plus the digest (§5). It may only return **slot swaps and
  set-count changes** as JSON, with a one-line reason each — e.g. move a
  lagging pattern from the fitting test (E12) or a stalled lift up the day.
  The app re-runs every local check on the result (kit, plates, go-easy
  list, session length, Aaron's rule that trap bar and leg press never share
  a day) and drops anything that fails. Shown as a diff on the preview.
- This also gives E12 its missing "plan side" (fitting-test spec §9): the
  profile's flags feed Tailor it, and with no key they at least re-rank slot
  picks locally.

## 5. Training digest (local)

One function, `coachDigest(weeks)`, builds a compact summary the AI features
share. No raw logs are ever sent.

- Per main lift: e1RM trend, best recent set, stall status (autoreg's
  5-session check), typed RIR against VBT-estimated RIR where measured.
- Volume per muscle per week (from muscle shares) and adherence (planned
  against done sessions).
- Bodyweight trend, the latest fitting-test profile and flags, pain/fatigue
  flags (C5), upcoming events and the current block, places and kit,
  go-easy list.
- Target size about 3–5k tokens. On Haiku 5.5 a typical call is roughly a
  tenth of a penny; the cost hint in Settings → AI says so.
- **Debug mode (E11) shows the exact digest sent.** That's also the plain
  "what goes to the AI" disclosure (Lift app lesson).

## 6. Debrief and review (AI)

- **Session debrief:** a button on the session summary. Compares the
  session to the plan, says which PRs are real, gives **one** thing for
  next time. Short.
- **Weekly / block review:** a card on Home (and Stats) once a week or at a
  block's end: what's moving, what's stalled and the likely reason, where
  volume is lopsided. May end with a suggested change, which goes through
  the same accept-only diff as §4.

## 7. Ask the coach

- A chat sheet with **suggested prompts built from the user's own data**
  (Lift app lesson), e.g. "Why has my bench stalled?".
- Hard system-prompt boundaries: training only. **No medical or injury
  advice** — pain or injury talk gets "stop and see a professional", and the
  coach doesn't programme around an injury beyond the user's own go-easy list.
- History capped and summarised; the system prompt and digest are
  prompt-cached once they're long enough to cache.
- Logging stays its own tightly scoped call, separate from chat (roadmap).

## 8. Cardio trend coach (optional)

As in the roadmap: a Haiku call about once a minute during HR cardio,
looking at the HR **trend** to pre-empt drift out of zone. Off by default;
the local cue engine still runs without it.

## Rules (all parts)

- Everything in §1–§4 works with **no key**. AI parts are greyed with
  "Needs a key" or "Paused — cap reached" (D8).
- Model: Claude Haiku 5.5 throughout, via `aiCall`. No bigger model for now.
- Data stays on the device; templates and installed plans are in JSON
  export and Drive sync.
- C4 accessibility in both skins.

## Testing

- **Aaron** (2+ years, Gym, 5 days, 45 min, strongman/strength, priority
  trap bar and OHP): the result should look like a sane relative of his
  PPLUL with no trap bar + leg press day.
- **Chelsea** (under 6 months): Q7 skipped, simple version, RIR ≥ 2, blank
  starting weights that fill in from her first sets.
- Both: change place to Home and check every exercise is doable with the
  home kit.

## Open (decide before building)

- Final rep / RIR numbers per goal (§3).
- Slot lists for each split — draft them in `r&d/data/templates/` and have
  Aaron read them before the code.
