# Ironlog — found bugs

The running list of known, **non-critical** bugs, kept so they can be fixed
together in one batch rather than one at a time mid-feature.

**Critical bugs don't go here — fix them straight away.** Critical means: data
loss or corruption, the app won't open or a page white-screens, sync or import
damages a log, or a core flow (logging a set, finishing a session) is blocked.

## For agents

- **Found a bug while doing something else?** If it isn't critical, don't fix
  it in the middle of your feature: add it to **Open** below and carry on.
  Mention it in your summary and PR description ("logged B-012 to BUGS.md").
- **Doing a bug sweep?** Write each finding here. A big sweep can have its own
  note in `r&d/notes/` for the detail (like `bug-sweep-2026-11.md`), but every
  finding still gets a one-entry line here so this file is the one list.
- **Asked to "clear the bug list" / "fix the bugs"?** Work Open top to bottom
  (severity first, then oldest). Group fixes into as few versions as makes
  sense — one bump and one changelog entry for the batch is fine — but keep
  one commit per bug so each can be reverted alone. Move each fixed entry to
  **Fixed** with its version.
- Anything that needs Aaron's call goes under **Needs Aaron** with the
  question spelled out, not in Open.
- Check a bug is still real before fixing it; if it's gone, move it to Fixed
  with "not reproducible" and the version you checked against.

## Entry format

```
### B-001 · sev 3 · short title
Found: 2026-11-12, 0.97.0, while <what you were doing>
Where: js/file.js `functionName`
Reproduce: steps, or "from the code"
Fix: suggested fix
```

IDs run on and are never reused. Severity:

| Sev | Meaning |
|---|---|
| 2 | Wrong result a user would notice (bad number, wrong PR, missing data on screen) |
| 3 | Annoyance or edge case (layout glitch, odd shape of data, console error) |
| 4 | Tools, dev-only or cosmetic |

(Severity 1 is critical — not listed, fixed on the spot.)

---

## Open

Entries B-038 to B-058 are from the maths audit of 2026-11-16; the probes and
sources behind each are in `r&d/notes/maths-audit-2026-11.md`.

### B-038 · sev 2 · Autoregulation can't move a set once reps + RIR reach 12
Found: 2026-11-16, 0.99.3, maths audit
Where: js/core.js `e1rm`, js/loading.js `loadFor` (the cap at 12), read by js/training.js `sessionE1`, `applyAuto`, `applyAutoRir`, `autoAdjust`
Reproduce: from the code. Past the cap every set is worth 1.4 × its weight whatever the reps or RIR: 50 × 12 @ RIR 1, 50 × 15 @ RIR 4 and 50 × 20 @ RIR 0 all read e1RM 70, and the load read back off 70 is 50. So `autoAdjust` after 50 × 12 @ RIR 5 against a target of RIR 3 returns null and the next set stays 50 (control: 100 × 5 @ RIR 5 against target 2 moves it to 107.5). A plan with no weights gives 12 @ RIR 1 and 15 @ RIR 1 the same load. In the shipped program 91 of 439 RIR-targeted sets are past the cap (12 @ 1, 15 @ 1, 12 @ 2, 10 @ 3), and in an Accumulation run-in block (8–12 reps, RIR 3) a set of 9 can no longer be read as easier than the target, and from 10 reps the target itself is past the cap. Stall detection on those lifts only sees the weight.
Fix: let the estimate keep counting past 12 for planning (plain Epley to 20 or so, or cap the reps but not the reserve), with `loadFor` its exact inverse. Whatever is chosen, the Tools tables and the debug trace say "capped at 12" and need the same change.

### B-039 · sev 2 · More reps at the same weight is not a PR past 12 reps
Found: 2026-11-16, 0.99.3, maths audit
Where: js/stats.js `beatsBest`, `statsFor` (best is by e1RM alone), js/core.js `e1rm`
Reproduce: from the code. 30 × 12, then 30 × 15, then 30 × 20 on later days: all three are e1RM 42, so neither later session is a PR and the live tick shows no star. The same with a reserve logged: 30 × 10 @ RIR 2 then 30 × 12 @ RIR 2. Control: 100 × 5 then 100 × 6 is a PR.
Fix: when a set ties the best e1RM, fall back to the rep record at that weight (`byRep` already holds it), or compare uncapped for PR purposes.

### B-040 · sev 2 · Rankings judge dumbbell lifts on the barbell row, and half the standards table is unreachable
Found: 2026-11-16, 0.99.3, maths audit
Where: js/stats.js `STD`, `stdFor`, `rankFor` (looks the row up by `leafName`, which is the movement name)
Reproduce: from the code. At 80 kg bodyweight a dumbbell bench with 40 kg a hand ranks on "Bench Press": 0.50× = Beginner, score 20. The table's own "Dumbbell Bench" row would call 0.50× Intermediate. A one-arm dumbbell overhead press is judged on the barbell row the same way. 23 of the 47 rows have a name no movement carries, so they are never used: High Bar Squat, Low Bar Squat, Pause Squat, Safety Bar Squat, Pause Bench, Close Grip Bench, Incline Bench, Spoto Press, Dumbbell Bench, Dumbbell Shoulder Press, Conventional Deadlift, Deficit Deadlift, Block Pull, Barbell Row, Pendlay Row, Dumbbell Row, Cable Row, Barbell Curl, Dumbbell Curl, Skullcrusher, Tricep Pushdown, Calf Raise, Farmers Walk. So curls, rows, close-grip and incline bench and calf raises show no rank at all. A Smith or safety-bar squat and a high-handle trap bar deadlift rank on the barbell rows unadjusted, while the fitting test divides the trap bar lift by 1.15 first.
Fix: key the table on movement id plus equipment (or a leaf-to-row map), give per-hand equipment its own rows, and reuse the fitting test's variation factors.

### B-041 · sev 2 · TDEE tool treats a blank age as age 0
Found: 2026-11-16, 0.99.3, maths audit
Where: js/core.js `bmrMifflin` (`!(age >= 0)` lets null through: `null >= 0` is true), reached from js/tools.js `openTool('tdee')`
Reproduce: Tools → TDEE with no date of birth in the profile, or clear the Age box: 80 kg, 180 cm, male shows resting 1930 kcal, which is the age-0 figure. At 30 it is 1780, so maintenance at "moderate" reads 2992 instead of 2759. The note under the result asks for "bodyweight, height and age" only when everything is missing.
Fix: `if (!(kg > 0) || !(cm > 0) || age == null || !(age >= 0)) return 0;`

### B-042 · sev 2 · Bar-speed RIR says "6+" on a set that ended below the lifter's own failure speed
Found: 2026-11-16, 0.99.3, maths audit
Where: slew-reps.js `vbtEstimateSet` (the own-limit branch needs `last > profile.v0Observed`, and there is no branch for at or under it)
Reproduce: from the code. Bench, stored failure speed 0.25 m/s, reps 0.23 / 0.23 / 0.22 / 0.20: the set lost 13%, so done = (0.13 ÷ 0.50)^0.75 = 36% and reps left = 4 × 0.64 ÷ 0.36 = 7, shown as "RIR 6+". The bar was already slower than the speed this lifter fails at. Heavy sets start near the limit and lose little speed, so this is the usual shape of a hard triple.
Fix: when the lifter's limit is known and the last rep is at or under it, return RIR 0 to 1 as an observed estimate; more generally let closeness to the limit bound the velocity-loss figure from above.

### B-043 · sev 2 · Weighted pull-ups and dips: e1RM, PRs and targets use the added weight alone
Found: 2026-11-16, 0.99.3, maths audit
Where: js/core.js `e1rm`, js/stats.js `historyFor` / `beatsBest`, js/training.js `applyAuto` — for leaves loaded on top of bodyweight (pull-up, chin-up, push-up, inverted row, dip with `plate`)
Reproduce: from the code, bodyweight 80 kg. +20 × 5 then +22.5 × 3: the app reads 23.3 then 24.8 and stars the second as a PR; counting the body, 100 × 5 is 116.7 and 102.5 × 3 is 112.8, so it was not one. An autoregulated target for 8 @ RIR 2 off +20 × 5 comes out at +17.5; with bodyweight in the sum it is +7.5.
Fix: for bodyweight-plus-load leaves run the estimate on bodyweight + added and subtract bodyweight afterwards (bodyweight from the nearest check-in), or leave them out of autoregulation until that exists.

### B-055 · sev 2 · PR #86 (not merged): goal projection measures the gap from the wrong number
Found: 2026-11-16, branch `e16-honest-ledger` @ a4c0d30, maths audit
Where: index.html on that branch, `projectGoal` (gap = target − `goalCurrent`, rate from the last 26 weeks of per-session best e1RM)
Reproduce: from the code. `goalCurrent` is a true single if one was ever logged, else the all-time best e1RM; the rate is the slope of recent estimates. (a) A 150 single two years ago, estimates now 170 → 179 over six weeks, target 200: the projection divides 50 kg by the rate and says 233 days; the line is already at 179, which is 98 days. (b) Best-ever 180 from last year, coming back 140 → 155, target 185: it divides 5 kg and says 14 days; from the line it is 84.
Fix: project from the fitted line's value today to the target (same units as the slope), and show the goal's own "current" beside it. Fix before merging.

### B-044 · sev 3 · Assisted pull-up on a machine: more assistance reads as a PR
Found: 2026-11-16, 0.99.3, maths audit
Where: js/stats.js `beatsBest`, js/core.js `e1rm` — pull-up and chin-up offer `machine` and `resistance_band`, where the number is help, not load
Reproduce: from the code. 30 kg assistance × 8, then 40 kg × 8 (easier): starred as a PR. Then 20 kg × 8 (harder): no PR.
Fix: mark assisted leaves so a lower number wins, or keep them out of e1RM and rank by reps at a given assistance.

### B-045 · sev 3 · The same lift entered twice in a session gives two PR rows
Found: 2026-11-16, 0.99.3, maths audit
Where: js/stats.js `prsFor` (one row per entry, not per key)
Reproduce: from the code. History 100 × 5; one session with Back Squat 110 × 5 and a second Back Squat entry at 105 × 5: the PR list has both.
Fix: keep the best row per `exKey` (as `e1Changes` already does with its `seen` set).

### B-046 · sev 3 · Set-to-set adjustment can't move a light set, and overshoots its 7.5% cap just above that
Found: 2026-11-16, 0.99.3, maths audit
Where: js/training.js `autoAdjust` (clamp to ±7.5%, then round to the step)
Reproduce: from the code, a set logged at RIR 5 against a target of 0 (wants +14%). Barbell at 10 or 15 kg: next set unchanged, because 7.5% is under half a 2.5 kg step for anything below 16.7 kg. At 16 kg it goes to 17.5 (+9.4%), at 17.5 to 20 (+14.3%), at 20 to 22.5 (+12.5%). Dumbbells in 2 kg steps: stuck below 13.3 kg, 14 → 16 (+14.3%).
Fix: allow at least one step when the uncapped change is a step or more, and say in the spec that the cap is "7.5% or one step, whichever is larger".

### B-047 · sev 3 · Autoregulated targets round to 2.5 kg whatever the place can load
Found: 2026-11-16, 0.99.3, maths audit
Where: js/loading.js `roundLoadFor` → js/core.js `roundBar`; `loadableNear` (used by the warm-up ramp) is not used here
Reproduce: from the code. Working e1RM 131.56, 5 @ RIR 2 is 106.67 exact: the target is 107.5, but a place whose smallest plates are 5s can build 100 or 110. On a 7 kg bar the target 22.5 can't be built (22 can). Cables and stack machines get 2.5 kg steps too (37 → 37.5).
Fix: for barbell-type leaves round with `loadableNear(kg, barFor(leaf), inventory())`; leave stack machines to a per-machine step when there is one.

### B-048 · sev 3 · Target RIR from a note: common spellings missed, tempo and pause read as RIR
Found: 2026-11-16, 0.99.3, maths audit
Where: js/training.js `noteRir`
Reproduce: from the code. "2 RIR", "RIR: 3" and "leave 2 in the tank" give nothing (the target falls back to the block or 2). "pause @ 3 sec" and "tempo @3-1-1-0" read as RIR 3. "RIR 10" reads as 1, "rpe 9-10" as 1.
Fix: accept a number before "RIR" and a colon after it; don't read "@n" when it is followed by sec, s or a dash-digit; take two digits after "RIR" and clamp.

### B-049 · sev 3 · Bar speed uses two different "velocity loss" figures
Found: 2026-11-16, 0.99.3, maths audit
Where: slew-reps.js `vbtSummary` (best rep → last), slew-core.js `estimateSet` (median of the first three → last), `fitProfile` (best → last, stored as the lift's loss at failure)
Reproduce: from the code. Reps 0.60 / 0.49 / 0.47 / 0.45 / 0.42 / 0.39 / 0.35 / 0.30: the card says "Velocity loss 50%" and the sentence under it "You lost 39% of your bar speed". A set to failure 0.60 / 0.50 / 0.48 / 0.42 / 0.36 / 0.27 stores loss-at-failure 0.55 (best → last); the same set replayed is measured at 0.46 (median → last) and comes out as RIR 0.9, not 0.
Fix: one definition in all three places. The research convention is the fastest rep, which is normally the first.

### B-050 · sev 3 · A hold that is heavier and longer than an old record is not a PR if a heavier hold exists
Found: 2026-11-16, 0.99.3, maths audit
Where: js/exercises.js `holdBeats`
Reproduce: from the code. Holds of 10 kg for 30 s and 20 kg for 10 s, then 15 kg for 60 s: no PR, since it is the first hold at 15 kg and not the heaviest. It beats the 10 kg record on both counts. A later 10 kg for 31 s is a PR.
Fix: a hold is a PR when no earlier hold was at least as heavy and at least as long (the rule `holdBeatsSession` already uses within a session).

### B-051 · sev 3 · Rankings and "best" count backfilled sets, and the comment says they don't
Found: 2026-11-16, 0.99.3, maths audit
Where: js/stats.js `statsFor` (`prCountEst` defaults to on), `rankFor` comment ("backfilled sets are already excluded by statsFor"), r&d/specs/autoreg-spec.md ("Like PRs … backfilled sessions don't count")
Reproduce: from the code. A backfilled 150 × 5 and a real 120 × 5: best is the backfilled set (e1RM 175), the rank uses 175, and the real session is no PR. Autoregulation ignores the backfill (as its spec says). `rankFor` passes on only `estOnly` (every set a backfill), not `bestIsEst`.
Fix: correct the comment, and mark a rank whose best set is backfilled (`bestIsEst`) the way the PR list does.

### B-052 · sev 3 · Jackson–Pollock body fat goes down as skinfolds go up past the equation's range
Found: 2026-11-16, 0.99.3, maths audit
Where: js/training.js `CAL_METHODS` (the quadratics are right; nothing bounds the sum), js/health.js `openCaliper` (accepts up to 80 mm a site)
Reproduce: from the code. JP7 men, age 30: sum 395 mm gives 36.6%, 480 mm gives 34.7%, 560 mm (80 a site) gives 29.5%. The curve turns at 395 mm for men and 419 mm for women; JP3 women turns at 216 mm with the form allowing 240.
Fix: past the turning point show "outside the range this equation was built on" instead of a figure.

### B-053 · sev 3 · Meet attempts for a lb user round to 5 lb, not 2.5 kg
Found: 2026-11-16, 0.99.3, maths audit
Where: js/events.js `attemptsFor` → `attemptRound` → js/core.js `roundBar`
Reproduce: from the code, units lb. An opener worked out as 180 kg rounds to 395 lb, which is 179.17 kg — not a weight a kg meet loads.
Fix: round attempts in kg (2.5, or whole kg for para) whatever the display unit, then convert for display.

### B-054 · sev 3 · `loadFor` doesn't cap the reserve at 5 as `e1rm` does
Found: 2026-11-16, 0.99.3, maths audit
Where: js/loading.js `loadFor`, js/core.js `e1Rir`
Reproduce: from the code. `loadFor(140, 5, 6)` is 102.44, and `e1rm(102.44, 5, RIR 6)` reads back 136.59, not 140. Only reached by a target RIR of 6 or more ("stop 6 shy" in a note).
Fix: pass the reserve through the same cap in `loadFor`.

### B-058 · sev 3 · A lighter, easier set can be a PR
Found: 2026-11-16, 0.99.3, maths audit
Where: js/stats.js `beatsBest`, `historyFor` / `statsFor` (`best` by e1RM), js/workout.js `beatsSession` — RIR counts in full on both sides
Reproduce: from the code. History 100 × 5 @ RIR 0 (e1RM 116.7); then 90 × 5 logged at RIR 5 (e1RM 120.0) is starred as a PR.
Fix: Aaron's call, 2026-11-16: limit how much RIR counts toward a PR. For records only (the best set, `beatsBest`, the in-session check, rankings), count at most N reps in reserve; autoregulation and the Tools calculator keep the full figure. N still to be set (2 or 3). With N = 3 the example reads 114.0 and is no PR; with N = 2, 111.0. The same cap has to apply to the history side, or old high-RIR sets keep their inflated bests.

### B-056 · sev 3 · PR #86 (not merged): the projection's date range is narrower than it reads
Found: 2026-11-16, branch `e16-honest-ledger` @ a4c0d30, maths audit
Where: index.html on that branch, `projectGoal`, `projLine`
Reproduce: from the code. The slope and its standard error are right (hand check: 100, 101, 103, 104 at two-week gaps gives 0.1000 ± 0.0101 kg a day, 54 to 67 days for 6 kg). But ±1 standard error on four points covers about 58% of cases (a 95% range needs ±4.3), a perfectly straight four points gives a range of one day, and the dates count from today even when the last session was ten weeks ago.
Fix: widen by the t value for n − 2 (or say "about two times in three" and use 1.32 at n = 4), and count from the last session's date.

## Needs Aaron

### B-057 · sev 2 · Zone 2 moves about 20 bpm when a resting heart rate is entered
Found: 2026-11-16, 0.99.3, maths audit
Where: js/health.js `HR_ZONES`, `zoneBpm`
Reproduce: from the code. Max 187 (Tanaka at 30): "Zone 2 · easy" is 112–131 with no resting HR and 136–149 with a resting HR of 60. The same 60–70% is applied to max HR in one case and to heart-rate reserve in the other, and those are different intensities: 136–149 is 73–80% of max. ACSM's table puts 64–76% of max level with 40–59% of reserve (moderate), and 60–89% of reserve as vigorous.
Fix: question for Aaron — which Zone 2 is meant? Either keep 60–70% of max and use 40–59%-style reserve bands when a resting HR is known, or keep the Karvonen 60–70% and raise the %-of-max bands to match. Both are in common use; the app shouldn't switch between them on an optional field.

### B-026 · sev 2 · Ironlog shares its storage with every other site on tribbles69.github.io
Found: 2026-11-13, 0.99.1, security and privacy check
Where: hosting — browsers keep localStorage / IndexedDB per origin (scheme + host), not per path
Reproduce: from any other page on https://tribbles69.github.io/ (another repo's Pages site, or r&d/tools/demo-lab.html in this one), `localStorage.getItem('ironlog.anthropicKey')` and `indexedDB.open('ironlog')` read Ironlog's key, log, photos and clips. The same is true for anyone who self-hosts on their own username.github.io.
Fix: give Ironlog an origin of its own — a custom subdomain on GitHub Pages, or e.g. a Cloudflare Pages ironlog.pages.dev. Question for Aaron: which address? Moving origin doesn't move anyone's data: users need a Drive sync or export first, so the old address should show a "we've moved — sync or export, then open the new one" screen for a while. The README's self-hosting steps should tell people to use a repo/domain that hosts nothing else.

### B-027 · sev 2 · Public repo holds Aaron's personal training and health details
Found: 2026-11-13, 0.99.1, security and privacy check
Where: `r&d/data/hunchback-pplul-77wk.txt`, `r&d/data/routines/morning-stretch.json` (and the copy built into js/health.js, shown to every user as "Priority for kyphosis"), `r&d/data/vbt/ironlog-vbt-raw-2026-11-11.json`, Chelsea named in `r&d/specs/coach-spec.md`, `r&d/data/templates/README.md`, `r&d/ROADMAP.md`, `r&d/tools/smoke.js`
Reproduce: the repo is public and GitHub Pages serves all of `r&d/` too
Fix: question for Aaron — make the repo private (Pages from a private repo needs a paid GitHub plan, or host elsewhere, see B-026), and/or strip these: generic wording for the stretch flags ("priority for upper-back posture"), "a new lifter" instead of Chelsea, move personal data files out of the repo. Anything already pushed stays in git history unless the history is rewritten.

## Sweeps

- **2026-11-16, 0.99.3 — maths audit** — every formula that tells a lifter
  what to lift or how they rank, against its source, with numeric probes run
  on the shipped modules in Node: e1RM, autoregulation, PRs, bar speed, the
  goal projection on the unmerged PR #86, DOTS / IPF GL, the standards table,
  the fitting test, calipers, FFMI, TDEE and heart-rate zones. Matched their
  sources: DOTS, IPF GL, Jackson–Pollock 3 and 7, Durnin–Womersley, Siri,
  Mifflin-St Jeor, Katch–McArdle, Butt, normalised FFMI, Tanaka, Karvonen,
  the balance norms, the load-velocity fit and the projection's least squares.
  No Wilks in the app. New: B-038 to B-058 (seven sev 2, thirteen sev 3, one
  for Aaron; B-058 decided the same day). Nothing fixed. Detail: `r&d/notes/maths-audit-2026-11.md`.
- **2026-11-16, 0.99.1 (nightly)** — rotation: kit's remainder, exercises and
  database were due; tonight **database** (storage section) was read in
  depth, plus movement again (modifier picker). Stopped at: database line 140,
  so tomorrow carries on with the rest of database, then exercises, stats.
  Also re-read the 0.99.1 diff (DOTS clamp, `yearAge`, meet tie-break and
  placing delta); probes in the page gave the intended numbers (Junior at the
  year you turn 19 to 23, women's DOTS flat above 150 kg). Checks:
  check-version, lint-scope, validate-exercises, validate-mobility and
  module-map --check (TypeScript 5) pass; smoke 56/56, no page errors. The
  click-through of every page timed out in this run and was not completed.
  New: B-035 to B-037.
- **2026-11-15, 0.99.1 (nightly)** — rotation wraps: main was last night's
  stop, so tonight **state** and **kit** read for logic (nothing new in either;
  `chartMulti` draws a flipped axis if every value is the same negative
  number, but no real series is negative). Also re-read movement and ui
  (Home, update check, What's new, Profile) and main's boot and rescue path;
  B-029 reproduced independently by pressing Escape on the Profile sheet.
  Stopped at: kit (first 200 lines in depth), so tomorrow carries on with the
  rest of kit, then exercises, database. Checks: check-version, lint-scope,
  validate-exercises, validate-mobility and module-map --check (TypeScript 5)
  pass; smoke 56/56, no page errors (headless Chromium). Click-through of
  every page not run tonight. New: B-033, B-034.
- **2026-11-14, 0.99.1 (nightly)** — rotation stopped at **main** (core, kit,
  loading, training, stats, io, sync, rest, workout, coach, health were done on
  11-13; tonight movement, ui, main, so tomorrow wraps to **state**). Also read
  the whole 0.98.3 to 0.99.1 diff for every js file changed since the last
  sweep (the B-001 to B-021 fixes) and the callers of the new `dismissModal`,
  `closeAllModals({quiet})`, `entryVolume`, `noteRir`, `yearAge` and
  `openAxisPickerFor`. Checks: check-version, lint-scope, validate-exercises,
  validate-mobility all pass; module-map --check passes (needs TypeScript 5 —
  the 7.x that `npm install typescript` pulls now has no `ScriptTarget` and
  the tool throws; installed 5.6.3 in a scratch folder); smoke 56/56 with no
  page errors; each of the five pages opens with no page errors. One
  automated click-everything loop had the headless renderer crash once; it did
  not repeat per click or per page, so not logged. Probes behind B-028, B-029,
  B-030 and B-032 are in their entries. New: B-028 to B-032 (numbered after
  B-022 to B-027, which are taken by the security pass).
- **2026-11-13, 0.99.1 — security and privacy** — 266 script-injection payloads
  written into every user text field (sessions, notes, goals, events, custom
  exercises, places, plans, coach notes), then smoke 56/56 plus every
  session, goal, event and movement screen opened: nothing ran, 48 showed as
  plain text. Coach replies go in as textContent. Network: only the app's own
  files, api.anthropic.com, Google Drive and Google sign-in; no trackers or
  CDNs. Drive token in memory only, revoked on disconnect, drive.file scope.
  Erase everything clears IDB (photos, clips, undo copy) and localStorage.
  No secrets in the current tree. New: B-022 to B-027. Detail:
  `r&d/notes/security-audit-2026-11.md`.
- **2026-11-13, 0.98.3** — module by module after the E17 split: core, kit,
  loading, training, stats, io, sync, rest, workout, coach, health read for
  logic; module-map --check, lint-scope, eslint, check-version and validators
  pass (B-003 still); smoke 56/56; monkey clicker 4 configs × 1200–1500 random
  actions, 0 errors, no NaN on screen; full click-through on empty, migrated kg,
  migrated lb and program installs in both skins (757–759 clicks each), no new
  errors; scripted mixed session to cross-check volume. New: B-010 to B-021.
  Nothing fixed in this pass.
- **2026-11-12, 0.97.0** — checks and tools all pass except the known B-003;
  smoke test 55/55 on empty and migrated installs; click-through of every
  page (276 + 742 clicks), no new errors beyond B-001; CSV round trip shows
  only B-002. Read line by line: events and meet day, calculators and AI key,
  caliper/body-comp, BP and glucose bands, cardio zone control loop, fitting
  test scoring, core helpers. Formulas checked against sources: DOTS, IPF GL,
  Jackson–Pollock 3/7, Durnin–Womersley, Siri, Katch–McArdle, Casey Butt,
  normalised FFMI, Tanaka, Karvonen. New: B-005 to B-009.

## Fixed

Most recent first: `- B-000 · title — 0.00.0`

- B-037 · Modifier picker's Cancel still keeps the adopted tempo — 0.99.3
- B-036 · `idb()` reports a write as done before the transaction commits — 0.99.3
- B-035 · A save that fell back to localStorage is ignored on the next open — 0.99.3
- B-034 · Profile accepts a negative bodyweight — 0.99.3
- B-033 · Home's "last 7 days" tiles cover eight days — 0.99.3
- B-032 · Welcome: switching units after Back leaves the old number — 0.99.3
- B-031 · "Best hold" toast repeats for a shorter hold later in the session — 0.99.3
- B-030 · "@1" / "@2" notes no longer read as target RIR — 0.99.3
- B-029 · Profile edits stick when closed with ✕, backdrop or Escape — 0.99.3
- B-028 · Cancel on a confirm with `onNo` also closes the sheet beneath it — 0.99.3
- B-025 · CSV export cells starting = + - @ run as formulas in Excel / Sheets — 0.99.2
- B-024 · No notice of what each AI feature sends to Anthropic — 0.99.2
- B-023 · AI key note says "sent nowhere but Anthropic" while Drive backup can include it — 0.99.2
- B-022 · No Content-Security-Policy: one missed esc() could send the log or AI key anywhere — 0.99.2
- B-009 · "Moved X places" can say no change after two tests on one day — 0.99.1
- B-008 · Meet placing: ties don't go to the lighter lifter — 0.99.1
- B-007 · Caliper preview shows a body-fat % with no age entered — 0.99.1
- B-006 · IPF age category goes by birthday, not calendar year — 0.99.1
- B-005 · DOTS for women over 150 kg bodyweight is too high — 0.99.1
- B-004 · VBT sim tools fail on a Windows CRLF checkout — 0.99.1
- B-003 · Exercise validator has seven checks for the old 77-week program — 0.99.1
- B-002 · CSV round trip drops extra leaf keys on an exercise with no sets — 0.99.1
- B-021 · Thousands separator read as a decimal — 0.99.0
- B-020 · Time fields accept 1:75 — 0.99.0
- B-019 · Coach plate answer assumes a 20 kg bar — 0.99.0
- B-018 · Rest ±15 s lands on the wrong exercise after reordering — 0.99.0
- B-017 · Live PR toast repeats for a lighter later set — 0.99.0
- B-016 · "Looks like a lb figure" on an ordinary dumbbell jump — 0.99.0
- B-015 · "Beyond any recorded lift" fires on real loads over 500 kg — 0.99.0
- B-014 · "@8" in a note is read as RIR 8 — 0.99.0
- B-013 · Cambered bar and Swiss bar get no plate maths — 0.99.0
- B-012 · No way to change equipment or handles on a logged entry — 0.99.0
- B-011 · Escape and closeAllModals skip a modal's onClose — 0.99.0
- B-010 · Session volume counts one side of a per-side lift — 0.99.0
- B-001 · Closing the coach straight after a message throws — 0.99.0
- Everything from the November sweep up to 0.96.5 — see
  `r&d/notes/bug-sweep-2026-11.md`.
