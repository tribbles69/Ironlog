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

### B-022 · sev 3 · Home's "last 7 days" tiles cover eight days
Found: 2026-11-15, 0.99.1, nightly sweep
Where: js/stats.js `last7`; js/ui.js `viewHome` (`bw7`, `sessions7`)
Reproduce: add a check-in dated 7 days ago (sleep 4 h) and one today (sleep 8 h). `last7()` returns both (probe: `["2026-11-08","2026-11-15"]`), so "Sleep avg · last 7 days" shows 6 h, not 8 h. A session or weight 7 days ago is likewise counted in "Sessions · last 7 days" and the "/ 7d" bodyweight change. Today plus the previous 7 days is 8 days. `coach.js` and the BP card use `< 7` / `<= 6`.
Fix: use `daysBetween(...) <= 6` in `last7` and in the two `viewHome` filters (or relabel). Check nothing else leans on `last7`'s eight days.

### B-023 · sev 2 · Profile edits stick when the sheet is dismissed with Escape or a backdrop tap
Found: 2026-11-15, 0.99.1, nightly sweep
Where: js/ui.js `openProfile` (`collect`, `re`, `pfCancel`)
Reproduce: Profile, change Sex to Female (the sheet redraws via `re`), press Escape. The sheet closes and `S.settings.sex` is still "female" (probe: before `male`, after Escape `female`). Only the Cancel button restores `original`; Save never ran, but the next `save()` from anywhere writes the edit, so DOTS, category and calorie targets change without the user choosing Save.
Fix: give the modal an `onClose` that restores `original` unless Save was pressed (mind `re()`, which closes and reopens the sheet on every change).

### B-024 · sev 3 · Profile accepts a negative bodyweight
Found: 2026-11-15, 0.99.1, nightly sweep
Where: js/ui.js `openProfile` `collect` (`st.bodyweight = raw === '' ? 0 : toKg(+raw)`)
Reproduce: Profile, type -70 in Bodyweight and tab out. `S.settings.bodyweight` becomes -70 (probe). Height is clamped 0 to 260; bodyweight has no clamp. The fallback is then treated as a real value by DOTS and the calorie maths.
Fix: clamp to a sensible range (for example 0 to 400 kg) the way height is.

## Needs Aaron

(none)

## Sweeps

- **2026-11-15, 0.99.1 (nightly)** — rotation continued after health and coach:
  read movement, main and ui (Home, update check, What's new, Profile) for
  logic; no js/ file has changed on main since the 2026-11-13 sweep other than
  the 0.99.0/0.99.1 fix commits, whose touched areas in these modules were
  re-read. Stopped at: ui (middle of ui.js, Settings and skin chrome not read
  line by line). Tomorrow: finish ui, then main is done, wrap round to core,
  state, kit. Checks: check-version, lint-scope, validate-exercises,
  validate-mobility and module-map --check (typescript 5, scratch install) all
  pass; smoke 56/56 with no page errors (headless Chromium). Click-through of
  every page not run tonight. New: B-022 to B-024.

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
