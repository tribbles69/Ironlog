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

### B-059 · sev 3 · A note's "RPE 8." or "@8." with a full stop after the number is not read as a target RIR
Found: 2026-11-17, 0.99.3, nightly sweep (review of the B-030 change)
Where: js/training.js `noteRir` (the regex added in 0.99.3: `(?![\d%.])`)
Reproduce: in the page, `(await import('/js/training.js')).noteRir(text)` gives `null` for "Work up to RPE 8.", "top set @8.", "RPE 8.5." and "@3." (full stop right after the number), but `{rir:2}` for "RPE 8 then", "@8, then back off" and "RIR 2.". So a program or exercise note that ends its sentence on the number silently falls back to the default target RIR instead of the one written. (0.99.2 and earlier read all of these.) The `.` was added to the lookahead to stop "@8.5" being cut to "@8", but it also blocks a plain full stop.
Fix: let the lookahead refuse a dot only when a digit follows it: `(?![\d%]|\.\d)`. Add the four strings above to whatever test covers B-030. Numbering note: B-038 to B-058 are in use on the open PRs #109 and #110, so tonight's ID starts at B-059.

### B-060 · sev 2 · Backfilling planned sessions turns holds and carries into empty "completed" sessions
Found: 2026-11-18, 0.99.3, nightly sweep
Where: js/training.js `backfillPlanned` (marks a set done only if `s.r > 0 || s.sec > 0`) and `rirOnlySession` (only looks at rep lifts)
Reproduce: in the page, push a planned session dated two days ago whose only exercise is a planned hold (`iso: true`, `sec: null`, `target: 45`, as `installProgram` builds it) and another whose only exercise is a carry (`m: 40`, `r: 0`, `w: 30`), then `backfillPlanned(7)`. It returns 2; both sessions become `status: 'completed'`, `source: 'backfill'` with `exercises: []`. A planned hold has no `sec` and a carry has no reps, so no set passes the test, every set is filtered out, and the plan's content is gone. They show in the log as empty completed sessions and `removeProgram` can no longer clear them (it only removes planned ones). In a mixed session the hold and carry sets are dropped while the rep sets stay.
Fix: count a hold as done when it has a `target` (log `sec` as the target), and a carry when `m > 0`; or leave a session alone when it has no set that backfill can mark done (treat it like `rirOnlySession`). Never write a completed session with no exercises.

### B-061 · sev 3 · Lifters on lb: opening the warm-up sheet or saving a place nudges bar and plate weights off their kg values
Found: 2026-11-18, 0.99.3, nightly sweep
Where: js/loading.js `openRamp` (`upd`: `S.settings.barKg = toKg(bar)`, where `bar` comes from the `nice(dw(...))` field, rounded to 0.1) and `openPlaceEdit` save (`toKg(+el.value)` on plate fields shown with `dw(x.kg, 2)`, and on bar fields shown with `nice(dw(b.kg))`)
Reproduce: with units set to lb, the 20 kg bar shows as 44.1, and `toKg(44.1)` is 20.0034 kg. In the Warm-up sheet, typing in any of Target, Reps or Bar makes `upd` save that into `S.settings.barKg` (20 → 20.0034), and from then on `loadableNear(60, 20.0034, mainPlates())` returns 60.0034, so "Add to workout" puts warm-ups and the work set in at weights a few thousandths of a kg off. Saving a place with its own plates does the same to every plate: 25 kg shows as 55.12 and is stored as 25.0020, 1.25 kg as 1.2519, 20 kg as 19.9989. The plate colours (`PLATE_COLOR[p.kg]` is an exact-key lookup) then fall back to grey, and the greedy plate maths' 1e-9 tolerances see weights that don't match. kg lifters are not affected (the round trip is exact).
Fix: only write a field back when the lifter changed it (compare against the value the box was drawn with, and keep the original kg when it is unchanged), or snap on the way in: round plates and bars to 0.01 kg after `toKg` (and match `PLATE_COLOR` by `Math.round(kg * 100) / 100`).

### B-062 · sev 3 · `claudeParse` fails when Claude's lead-in sentence contains a "["
Found: 2026-11-19, 0.99.3, nightly sweep
Where: js/ai.js `claudeParse`
Reproduce: stub `fetch` to answer `Here is your plan [as asked]: {"name":"X","days":[1,2]}` and call `claudeParse` — it throws `badjson`. The salvage takes the first `[` or `{` anywhere as the start and the last `]` or `}` as the end, so here it slices from the `[` in the prose to the closing `}`, which isn't JSON. Hits plan writer, tailor and voice parsing whenever the model adds a lead-in containing a bracket.
Fix: when the reply doesn't start with JSON, try the `{`…`}` slice and the `[`…`]` slice separately and keep the one that parses.

### B-063 · sev 3 · Home's "/ 7d" bodyweight change uses an 8-day window and counts future check-ins
Found: 2026-11-19, 0.99.3, nightly sweep (sibling of B-033, which fixed the tiles but not this line)
Where: js/ui.js `viewHome` — `bw7 = bws.filter(c => daysBetween(c.date, today()) <= 7)`
Reproduce: `daysBetween` of today−7 is 7 and of today−8 is 8 (probe in the page), so the window is 8 calendar days under a "/ 7d" label. A check-in dated in the future gives a negative number, passes `<= 7`, and is also taken as `bwNow` (the last entry), so a weight entered for tomorrow shows as today's weight with a wrong delta.
Fix: `<= 6 && >= 0` like `last7()` and `sessions7`, and take `bwNow` from check-ins dated today or earlier.

### B-064 · sev 4 · The doc comment for `holdRecords` sits above `isBefore`, not above the function
Found: 2026-11-19, 0.99.3, nightly sweep
Where: js/exercises.js, the block before `isBefore` / `holdRecords`
Reproduce: from the code — "Completed working holds for a key…" is followed by the "History before a session" comment and `isBefore`, so `holdRecords` has no comment and `isBefore` appears to document two things.
Fix: move the hold-records comment down to sit directly above `holdRecords`.

### B-065 · sev 2 · Editing a meet and pressing Save throws away its run-in blocks
Found: 2026-11-21, 0.99.5, nightly sweep
Where: js/events.js `openMeet` (the `rec` object built in the `#mSave` handler lists `lifts$`, `prog`, `strategy`, `attemptsLocked` and `day` but not `blocks`)
Reproduce: in the page, set `S.meets = [{ id:'m1', type:'powerlifting', name:'Test', date:'2027-03-01', wclass:'83kg', lifts:{squat:200,bench:130,deadlift:240}, attempts:{}, pct:{o:90,s:95}, blocks:[{kind:'accumulation',weeks:6},{kind:'peak',weeks:2}] }]`, call `openMeet('m1')`, change only the notes and click Save. `S.meets[0].blocks` is `undefined` afterwards and the keys are `id,name,date,fed,loc,wclass,bwTarget,notes,type,lifts$,lifts,attempts,pct,prog`. The run-in card goes back to "Plan the run-in", `activeBlock` finds nothing, so the Train page stops giving block RIR and rep targets. Any edit to a powerlifting or strengthlifting event (a date change, a new goal) does this. The strongman editor is fine: it clones the event and keeps `blocks`.
Fix: build `rec` from a copy of the existing event (`{ ...existing, ...changedFields }`) so any field the form doesn't own survives, or add `...(m.blocks ? { blocks: m.blocks } : {})` next to the `day` line. A copy is safer: the next field someone adds to a meet would be dropped the same way.

### B-066 · sev 3 · "Save results as tested singles" can be pressed again and logs the meet twice
Found: 2026-11-21, 0.99.5, nightly sweep
Where: js/events.js `openMeetDay` (`#mdTests` handler: `d.saved = true` only changes the label)
Reproduce: in the page, open a meet's Meet day on Attempts, give the opener two white lights, tap the save button. The label turns to "✓ Saved as tested singles" but the button is still enabled; tapping it again adds a second "Squat test" session (`S.workouts` goes 1 → 2, both with the same set). Each copy counts in session counts, volume and the test list. Editing an attempt after saving and pressing it again is the same: another session, the first one is not replaced.
Fix: when `d.saved` is true, either disable the button or have the handler replace the earlier test sessions (store their ids on `d`, e.g. `d.savedIds`, and remove them before logging again).

### B-067 · sev 3 · Lifters on lb: saving an event nudges goal, attempt and target weights off their kg values
Found: 2026-11-21, 0.99.5, nightly sweep (sibling of B-061)
Where: js/events.js `openMeet` save (`attVal` reads every goal, opener and second field with `toKg(+el.value)`, and `#mBw`), `openStrongmanMeet` save (`smBw`); the fields are drawn with `dw(x)` rounded to 0.1
Reproduce: with units set to lb, goal squat 200 kg is drawn as 440.9; open the event, change only the notes, Save: `S.meets[0].lifts.squat` is 199.9889, bench 130 becomes 129.9996, deadlift 240 becomes 239.9957, and an opener of 215 kg is saved as 215.0028. Every untouched field is rewritten from its rounded display value. The stored kg figures no longer match the round numbers the event was seeded with (and any goal compared exactly against a tested single is off by up to a few grams). kg lifters are not affected.
Fix: same as B-061: write a field back only when its box was changed (compare with the value it was drawn with), or round kg to 0.01 after `toKg`.

### B-068 · sev 3 · Bar path from video names the last weighted set's load, but the result attaches to the next unfinished set
Found: 2026-11-21, 0.99.5, nightly sweep
Where: js/vbt.js `openBarPath` (`lastW`, shown in `stepPick` and passed to `bpAnalyse` as `loadKg`), against `attachVbt` (`findIndex(s => !s.done && !s.vbt)`)
Reproduce: from the code. With a warm-up of 60 kg still to do and the 140 kg top set already typed in, the pick screen says "For Back Squat at 140 kg — the result attaches to its next set", the clip is analysed with `loadKg: 140`, and `attachVbt` puts it on the 60 kg warm-up. `openVbtRecord` was fixed for exactly this in "bug sweep 3.5" (`tgt = ex.sets.find(s => !s.done && !s.vbt)`); the video path was not.
Fix: use the same `tgt` rule in `openBarPath` for both the text and `loadKg`.

## Needs Aaron

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

- **2026-11-21, 0.99.5 (nightly)** — rotation: the 11-20 run ended with
  **picker** next, so tonight **picker**, **events** and **vbt** were read in
  full (events: meet cards, placing predictor, run-in, meet day, strongman,
  editors; vbt: Measure, bar path from video, depth, load-velocity, calibrate).
  Also read every js change since the last sweep: the 0.99.4 BP reference
  lines (`chartMulti` refs, health BP card) and the 0.99.5 version bump. Tomorrow
  wraps to **core**, then **state**, **kit**. Checks: check-version, lint-scope,
  validate-exercises, validate-mobility and module-map --check (TypeScript 5.6.3
  in a scratch folder) pass; smoke 56/56, no page errors (headless Chromium);
  Home, Calendar, Train, Stats, Health and Events open with no page errors, and
  every events sheet (meet day, run-in, add event, test log, priority, strongman
  editor) opens and closes clean. Probes in the page: meet edit and save with
  run-in blocks (B-065), meet day double save (B-066), lb save of goal and
  attempt weights (B-067). Not logged, noted: the "Lifters in flight" box on
  the meet-day warm-up tab is stored but not used in the clock times;
  `testLog`'s comparator returns -1 for equal dates (it happens to give newest
  first in Chromium). No open nightly PR existed, so this is a new one.
  New: B-065 to B-068.

- **2026-11-20, 0.99.3 (nightly)** — this run again started from a checkout
  without the 11-17 to 11-19 sweeps (`git fetch` showed the open PR #111), so
  it re-read database (Drive merge, Drive calls, save and flush), exercises
  (volume convention, `holdRecords`, `isBefore`, set numbering), stats (ranks,
  hard sets, `statsFor`, PRs, plausibility, goals, `last7`) and the whole
  0.99.3 diff. Both things it found were already listed: `noteRir` with a full
  stop (B-059; probed `"RPE 8."`, `"keep @8."`, `"@1."` → null) and Home's
  `bw7` eight-day window (B-063). Nothing new. Checks: check-version,
  lint-scope, validate-exercises, validate-mobility and module-map --check
  (TypeScript 5.6.3) pass; smoke 56/56, no page errors. The click-through was
  not completed (the Welcome sheet blocks the clicks on a fresh profile).
  Rotation unchanged: tomorrow carries on with **picker**, then **events**,
  **vbt**. New: none.

- **2026-11-19, 0.99.3 (nightly)** — this run started from a checkout that did
  not have the 11-17 and 11-18 sweeps, so it re-read the same ground:
  **database** (line 95 to the end), **exercises**, **stats** and **ai**, plus
  the 0.99.3 diff. The rotation is unchanged: tomorrow carries on with
  **picker**, then **events**, **vbt**. The `noteRir` full-stop bug ("RPE 8.")
  was found again here and is B-059 (already fixed on PR #112), so not
  re-logged. Probes in the page: `claudeParse` with a stubbed fetch (B-062),
  `daysBetween` at −8, −7 and +3 days (B-063). CSV formula guard round trip,
  the storage fallback mark and `holdBeatsSession` read correct. Checks:
  check-version, lint-scope, validate-exercises, validate-mobility and
  module-map --check (TypeScript 5.6.3) pass; smoke 56/56, no page errors.
  The click-through of every page crashed the headless renderer on the first
  taps and was not completed. New: B-062 to B-064.
- **2026-11-18, 0.99.3 (nightly)** — rotation: the 11-17 run stopped at
  stats, so tonight **ai**, **loading** and **training** were read in full
  (ai: key, cap, usage, `aiCall`, `claudeParse`; loading: ramps, plate maths,
  nearest loadable, bars, places and their editor; training: missed sessions,
  programs and backfill, rep ranges, per-side, tempo, autoregulation, event
  types and run-in blocks, load-velocity day and outliers, caliper maths, the
  imbalance card). No js file has changed on main since the 11-16 sweep
  (main's code is still 0.99.3; the fixes are on the open PRs #110 and #112,
  which were not reviewed). Tomorrow carries on with **picker**, then
  **events**, **vbt**. Checks: check-version, lint-scope, validate-exercises,
  validate-mobility and module-map --check (TypeScript 5.6.3 in a scratch
  folder) pass; smoke 56/56, no page errors (headless Chromium); a click
  through Home, Calendar, Train, Stats and Health and the first tabs on each
  gave no page errors. Probes in the page: backfill of a hold-only and a
  carry-only session (B-060), and the lb round trip of a bar and plates
  (B-061). Not logged, noted: the first week of a weekday-laid program
  starting mid-week puts later days before earlier ones (documented "first
  such weekday on or after the start"); `removeProgram` keeps
  `S.programStarts[id]`, so a reinstall without a date reuses the old start.
  New: B-060, B-061.
- **2026-11-17, 0.99.3 (nightly)** — rotation: the 11-16 run stopped at
  database line 140, so tonight the **rest of database** (Drive calls, merge,
  save / flush, backup nudge), **exercises** (muscle shares, `leafMuscles`,
  option lists, leaf and set helpers; the demo-drawing code and the bundled
  catalogue data were not read) and **stats** (standards, recovery,
  weekly sets, `statsFor`, PRs, plausibility, goals) were read. Also read every
  js change since the last sweep: the 0.99.3 fixes B-028 to B-037 (`confirmDlg`,
  Profile cancel, Welcome unit switch, bodyweight clamp, modifier picker,
  storage fallback, hold toast, `noteRir`, last-7 tiles). Tomorrow carries on
  with **ai**, then **loading**, **training**. Checks: check-version,
  lint-scope, validate-exercises, validate-mobility and module-map --check
  (TypeScript 5.6.3 in a scratch folder) pass; smoke 56/56, no page errors
  (headless Chromium). The click-through of every page was not run tonight.
  Probes: all 283 catalogue movements give muscle shares that sum to 1, except
  hip adduction and five neck movements, which have none (the map has no such
  muscle, so they never count toward weekly sets or recovery; not logged as a
  bug); every STD lift has hand-set shares. Not logged, noted: `fatigueMap`
  drops a completed session that has no start/end time and is dated today
  before 12:00 (`woTime` falls back to noon). New: B-059.
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
