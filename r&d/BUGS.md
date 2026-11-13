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

### B-010 · sev 2 · Session volume counts one side of a per-side lift
Found: 2026-11-13, 0.98.3, module bug pass (workout, stats, training)
Where: js/workout.js `finishWorkout` (summary.volume), `saveEdit`, summary
breakdown and share card; js/stats.js `statsFor` (`volume`, per-session `vol`);
js/training.js backfill; js/health.js cardio/fitting summary
Reproduce: log a session with a dumbbell or other per-side lift (loadConventionFor
→ per_side). One test session read 1130 on the summary, 1750 from `totalVolume`
and 680 on the movement page, against 1360 counted per side. Every place that
does `(s.w || 0) * (s.r || 0)` disagrees with `setVolume`.
Fix: route them all through `setVolume(leaf, s)` (as training.js line ~103 already
does) with the plain product only as the no-leaf fallback. Old summaries keep the
stored figure unless recomputed — say so in the changelog or recompute on read.

### B-011 · sev 2 · Escape and closeAllModals skip a modal's onClose
Found: 2026-11-13, 0.98.3, module bug pass (kit, main, sync)
Where: js/main.js Escape keydown handler; js/kit.js `closeAllModals`
Reproduce: from the code. Escape calls `closeModal()` and closeAllModals just
removes the nodes, so `onClose` never runs. Worst case: the sync "Records missing
on this phone" modal resolves its promise in `onClose: () => pickIt(true)` — with
Escape it never resolves and sync stays busy until reload. Also leaves the coach
state (`CO`) set, and camera, balance and hold timers running.
Fix: have closeModal/closeAllModals call the top modal's `onClose` once (guarded
so a button that already resolved doesn't run it twice).

### B-012 · sev 2 · No way to change equipment or handles on a logged entry
Found: 2026-11-13, 0.98.3, module bug pass (workout edit screen)
Where: js/migrate.js trap-handle note (line ~164); 0.98.0 changelog;
js/workout.js edit screen
Reproduce: the 0.98.0 migration note and changelog say to change low-handle trap
bar entries "from the exercise's handle chip". That chip only exists in a live
session; the edit screen for a finished workout has no leaf chips, so past entries
can't be switched. My mistake in 0.98.0.
Fix: add the equipment/attachment chips to the edit screen (same component as the
live session), or reword the note to the workaround until then.

### B-013 · sev 3 · Cambered bar and Swiss bar get no plate maths
Found: 2026-11-13, 0.98.3, module bug pass (loading, exercises)
Where: js/loading.js `BAR_EQUIPMENT`, `BAR_PRESETS`, `BAR_FOR`; js/exercises.js
`HEAVY_BARS`
Reproduce: from the code. `cambered_bar` and `swiss_bar` came in with 0.98.0 but
none of these lists know them: no bar weight, no plate loader, never a main lift.
Fix: add both (cambered ~20–25 kg, Swiss ~15–20 kg as presets) to all four lists.

### B-014 · sev 3 · "@8" in a note is read as RIR 8
Found: 2026-11-13, 0.98.3, module bug pass (training)
Where: js/training.js `targetRirFor`
Reproduce: a program note like "5×5 @8" (RPE notation) gives a target of RIR 8,
so the next load comes out far too light.
Fix: treat `@n` as RPE (`10 − n`), or drop the `@` pattern and keep "rir n" and
"stop n shy".

### B-015 · sev 3 · "Beyond any recorded lift" fires on real loads over 500 kg
Found: 2026-11-13, 0.98.3, module bug pass (stats)
Where: js/stats.js `PLAUS.maxKg` / plausibility check
Reproduce: log a 520 kg leg press or a silver dollar / Viking deadlift (records
580–670 kg) — the warning says it's beyond any recorded lift.
Fix: per-movement ceiling (or a higher cap for machines and partials), and soften
the wording.

### B-016 · sev 3 · "Looks like a lb figure" on an ordinary dumbbell jump
Found: 2026-11-13, 0.98.3, module bug pass (stats)
Where: js/stats.js plausibility (lb heuristic, line ~796)
Reproduce: best dumbbell press 30 kg, log 40 kg — warned it looks like lb.
Any 30%+ jump at light loads trips it.
Fix: only flag when the figure is near best × 2.2 (say 1.9–2.5×), not any
big jump.

### B-017 · sev 3 · Live PR toast repeats for a lighter later set
Found: 2026-11-13, 0.98.3, module bug pass (workout)
Where: js/workout.js `toggleSetDone` PR toast (line ~1866)
Reproduce: from the code. The toast compares with history only, not with sets
already done this session, so a second set that beats the old best but not the
first set toasts "PR" again.
Fix: include this session's done sets when working out the best to beat.

### B-018 · sev 3 · Rest ±15 s lands on the wrong exercise after reordering
Found: 2026-11-13, 0.98.3, module bug pass (rest, workout)
Where: js/rest.js `adjustRest` (`S.active.rest.ei`); js/workout.js exercise
up/down/delete
Reproduce: start a rest, move that exercise up or delete one above it, press
+15 — the new rest length is saved onto a different exercise.
Fix: update `rest.ei` when exercises move or are deleted (or store the exercise id).

### B-019 · sev 3 · Coach plate answer assumes a 20 kg bar
Found: 2026-11-13, 0.98.3, module bug pass (coach)
Where: js/coach.js `coAnsPlates`
Reproduce: "plates for 140" always works it out on a 20 kg bar, ignoring the bar
you've set up, collars, or a trap/SSB lift. The plate loader it links to is right.
Fix: use `barFor` (and collars) for the lift in context, and name that bar.

### B-020 · sev 4 · Time fields accept 1:75
Found: 2026-11-13, 0.98.3, module bug pass (core, health)
Where: js/core.js `parseTime`; js/health.js `parseKnob`
Reproduce: type "1:75" — accepted as 2:15. Same for "2:99" in cardio setup.
Fix: reject seconds/minutes ≥ 60 after the first part.

### B-021 · sev 4 · Thousands separator read as a decimal
Found: 2026-11-13, 0.98.3, module bug pass (io, coach)
Where: js/io.js `impNum`; js/coach.js `coAnsConvert`
Reproduce: "1,000 lb in kg" → 1 lb; an imported weight of "1,200" → 1.2, and "1,200.5" → 0.
Fix: treat a comma followed by exactly three digits as a thousands separator.

### B-005 · sev 2 · DOTS for women over 150 kg bodyweight is too high
Found: 2026-11-12, 0.97.0, bug sweep
Where: js/core.js `dots` — `clamp(bwKg, 40, 210)` for both sexes
Reproduce: confirmed in the app — `dots(400, 180, 'female')` gives 318.8;
with the official women's clamp it's 308.3. Gets worse with bodyweight
(210 kg → 378.5). Feeds Stats, the profile, meet day, the coach and the
points calculator.
Fix: the women's formula is bounded 40–150 kg, men's 40–210. Clamp by sex.

### B-006 · sev 3 · IPF age category goes by birthday, not calendar year
Found: 2026-11-12, 0.97.0, bug sweep
Where: js/core.js `ageCategory`, called with `ageFrom(dob)` in the profile
(js/ui.js)
Reproduce: confirmed — someone who's 23 now but turns 24 in December shows as
Junior; IPF puts them in Open for the whole year. Same at every boundary
(Sub-junior → Junior, Masters bands).
Fix: compute the category from `currentYear − birthYear`, not exact age. Also
check the 2026 IPF rulebook changes (age categories were amended March 2026).

### B-007 · sev 3 · Caliper preview shows a body-fat % with no age entered
Found: 2026-11-12, 0.97.0, bug sweep
Where: js/health.js `openCaliper` → `caliperCalc` uses `t.age || 0`
Reproduce: with no date of birth in the profile, open a new caliper test and
fill the sites — the live result shows a figure worked out at age 0 (JP3,
10/20/15 mm: 10.3% shown vs 13.6% at age 30). Save then refuses for lack of
an age, so nothing wrong is stored, but the number on screen is wrong.
Fix: when there's no age, show "Enter your age to see the result" instead.

### B-008 · sev 3 · Meet placing: ties don't go to the lighter lifter
Found: 2026-11-12, 0.97.0, bug sweep
Where: js/events.js `predictPlacing`
Reproduce: from the code — the comment says ties go to the lighter lifter, but
`filter(l => l.total >= total)` always puts you below anyone on the same total,
whatever either bodyweight. Only the hard-coded West Midlands 93 kg field uses
it today, where Aaron would be the heavier lifter anyway, so the result happens
to be right there.
Fix: compare bodyweights on a tie (yours from `bodyweightKg()` or the meet's
target), and give "You" a bodyweight on the ladder.

### B-009 · sev 3 · "Moved X places" can say no change after two tests on one day
Found: 2026-11-12, 0.97.0, bug sweep
Where: js/events.js `meetCard` — `prevTotal = testedTotalAsOf(dates[1])`
Reproduce: from the code — `dates` is one entry per tested session, so two test
sessions on the same day make `dates[1]` today as well, and the "previous"
total is the current one: always 0 places moved.
Fix: take the latest test date strictly before the newest one
(`dates.find(d => d < dates[0])`).

### B-001 · sev 3 · Closing the coach straight after a message throws
Found: 2026-11-12, 0.96.5, during the module split (sweep 4.8)
Where: js/coach.js `coBubble`, `coTyped`
Reproduce: open Coach, press a chip and Close in the same instant —
`Cannot read properties of null (reading 'bg')` in the console. Nothing lost.
Fix: take `const co = CO` before the frame/wait and return if it's gone.

### B-002 · sev 3 · CSV round trip drops extra leaf keys on an exercise with no sets
Found: 2026-11-12, 0.96.5, during the module split (sweep 4.9)
Where: js/io.js `workoutsToCSV` / `csvToWorkouts` (moved from database.js in 0.98.3)
Reproduce: see `r&d/notes/bug-sweep-2026-11.md` 4.9. No real log affected today.
Fix: in the no-sets branch pass `{ ...ex, leaf: leafPlain ? ex.leaf : null }`
as the sets branch does.

### B-003 · sev 4 · Exercise validator has seven checks for the old 77-week program
Found: 2026-11-11, 0.90.0 (sweep 4.7)
Where: r&d/tools/validate-exercises.js
Reproduce: `node "r&d/tools/validate-exercises.js"` — seven checks fail against
the WDC program that ships now.
Fix: rewrite them for the current program, or delete them.

### B-004 · sev 4 · VBT sim tools fail on a Windows CRLF checkout
Found: 2026-11-12, 0.96.5 (sweep 4.10)
Where: r&d/tools/vbt-sim.cjs, vbt-rir.cjs — regex ends `\n\}\n`
Reproduce: checkout with `core.autocrlf=true`, run either tool → "not found".
Also check they still find the code now it's in `js/vbt.js`, not `index.html`.
Fix: `.gitattributes` with `* text=auto eol=lf`, or `\r?\n` in the patterns.

## Needs Aaron

(none)

## Sweeps

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

- Everything from the November sweep up to 0.96.5 — see
  `r&d/notes/bug-sweep-2026-11.md`.
