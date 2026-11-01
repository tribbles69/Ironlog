# Debug mode — show the working (roadmap E11)

Written 2026-11-01 when Aaron asked for E11 and E12 together. Aaron's call:
**every calculation listed in the roadmap item, in the first build.**

## What it is

A Settings switch, **Debug mode**, off by default. When it's on, numbers the
app works out get a small **how?** button beside them. Tapping it opens a
sheet that walks through the sum:

- the **inputs** (with where each came from — a check-in, a setting, a set),
- what was **picked** (the best set, the worse side, the standard row),
- the **formula with the numbers in**,
- each **cutoff or threshold** passed or missed,
- the **result**, and a check line: *Matches what the app shows* — or, if
  the walk-through and the real function disagree, both numbers in red so the
  bug is obvious.

**Copy trace** puts the whole sheet on the clipboard as plain text for a bug
report or a Claude chat.

## Rules

- **Read-only.** Opening a trace never writes anything.
- **No cost when off.** `why()` returns an empty string and nothing is
  computed. Traces are built only when a **how?** is tapped, by an explainer
  that redoes the sum step by step and then calls the app's real function for
  the check line. The app's own maths isn't touched.
- **One shape.** Every explainer builds a trace with `tr.step(label, value,
  note)` (and `tr.head(text)` for a sub-heading, `tr.result(label, value)`,
  `tr.check(mine, app, fmt)`). One sheet draws them all — no per-feature debug
  UI.
- C4: the **how?** button has an accessible name ("Show the working for …"),
  is 24 px tall at least, and the sheet is a normal labelled dialog. Steps are
  a table with real header cells.

## What gets a trace, and where the button sits

| Kind | Calculation | Where |
|---|---|---|
| `e1` | Estimated 1RM: Epley, reps + RIR, capped at 12 | Movement page best, rankings rows, session-complete PRs, Tools → e1RM |
| `pr` | PR detection: the PR pool key (`exKey` → `prKey` modifiers), the session's best set, the best before that date, the comparison | Session-complete PRs, the movement page PR timeline |
| `rank` | Strength tier and score: bodyweight and its source, best e1RM, ratio, the `STD` row and female factor, each tier mark in kg, the 0–100 score sum | Stats → Rankings rows |
| `rir` | RIR ↔ RPE: `RIR = 10 − RPE`, and what effort maths uses | Tools → RPE ↔ RIR table |
| `range` | Rep-range verdict (D5): the range, where the target RIR came from, the top working weight, the sets at it, each rule, the next load | The range line on a live exercise |
| `vbt` | Per-set VBT (D1): each rep's mean velocity, best, velocity loss `(best − last) ÷ best`, Slew's estimated RIR and its reason | Each row of a measured set's VBT strip |
| `lv` | Day's e1RM from the load-velocity line (D1): points used and dropped, the fit, the MVT (prior, your observations, the shrink), where the line meets it, the range width | Under the load-velocity chart |
| `rec` | Recovery map (D7): each recent session's sets × effort × muscle share × decay, the sum, the level bands, hours to fresh | Tapping a muscle on the recovery map (opens the trace instead of the toast) |
| `dots` | DOTS and IPF GL: total, bodyweight, sex, the coefficients, the denominator | Tools → points, meet-day totals |
| `cal` | Caliper body fat (E4): mean per site, the sum, the density equation for the method, Siri, fat and lean mass | Each caliper test in Health → body fat history |
| `mob` | Mobility and balance tests (E5): best per day, latest per side, the left/right gap | The mobility tests card on Health |
| `cardio` | HR-zone cue (D15): the rule that fired (ceiling, warm-up, settle, interval, response wait, tolerance, step size and bounds) with the numbers | The live cardio screen, for the most recent check |
| `fit` | Fitting test scores (E12): judged value, side picked, each cutoff, score | Every score on the fitting test results |

The cardio check runs every second, so the live loop keeps only the **last
decision's inputs** (a shallow copy) and only while debug is on.

## Out of scope

- Editing anything from a trace.
- Traces for numbers that are only stored, not worked out (a typed weight).
