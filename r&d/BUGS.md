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
