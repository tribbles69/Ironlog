# Tools — calculators (roadmap D11)

Written 2026-10-31. The Tools sheet (`openTools`, top bar since D12, and the
98 skin's Tools menu) lists every tool. Each calculator opens its own sheet.

## Rules for every calculator

- **Prefilled from stored data**, every field still editable for what-ifs:
  bodyweight (`bodyweightKg()`), height, date of birth and sex (profile),
  latest body fat % (newest complete caliper test, `caliperCalc`), wrist and
  ankle (a measurement site named "wrist" / "ankle", custom sites included).
  A field with nothing stored starts empty and says where to add it.
- **Recomputes as you type.** Nothing is saved — there is no save button.
- **Display units** for weights (kg / lb) and lengths (cm / in), stored maths
  in kg / cm, as everywhere else.
- **One copy of the maths.** Reuse `e1rm`, `loadFor`, `dots`, `glPoints`,
  `rirToRpe` / `rpeToRir`, `caliperCalc`, `ACTIVITY`. The Mifflin-St Jeor
  formula moves out of `bmrKcal()` into `bmrMifflin(kg, cm, age, sex)`;
  `bmrKcal()` calls it, so the profile and the tool can't drift.
- C4: every input has a `<label>`, results sit in a polite live region.

## The list

**Lifting**
- Plate loader, warm-up ramp — the existing `openPlates` / `openRamp`.
- **e1RM and rep maxes** — weight × reps @ RIR → e1RM (`e1rm`), then a
  1–12 rep table at the chosen RIR via `loadFor`. Prefill: the most recent
  working set of your first main lift.
- **%1RM ↔ RIR chart** — reps 1–10 by RIR 0–4, `loadFor(100, reps, rir)`.
  The same model the app plans with (Epley plus RIR, capped at 12), and it
  says so.
- **DOTS / IPF GL** — total, bodyweight, sex, bench-only switch (GL only).
  Prefill: the priority-lift total (`priorityStats`) and bodyweight.
- **RPE ↔ RIR** — RPE 10 → 5 in halves against RIR, for coaches who think in
  RPE. Ironlog stores RPE and shows RIR; this table is the bridge.

**Energy**
- **TDEE** — Mifflin-St Jeor BMR always; **Katch-McArdle**
  (`370 + 21.6 × lean kg`) as well when a body fat % is filled in. Each times
  the activity multiplier (`ACTIVITY`).
- **Adaptive TDEE — left out.** It needs daily food intake, which now lives
  in a separate app (A1), and there's no link to it. Revisit if that app
  exports intake Ironlog can read.

**Physique** — all labelled as estimates: these formulas come from drug-free
elite bodybuilders of typical proportions, so for adaptive or short-stature
lifters they're a rough ceiling, not a verdict.
- **Max muscular potential (Casey Butt)** —
  `LBM_max(lb) = H^1.5 × (√W / 22.667 + √A / 17.0104) × (1 + BF% / 224)`,
  H height, W wrist (at the styloid process), A ankle (narrowest point), all
  in inches. Max bodyweight at that BF% = `LBM_max / (1 − BF%/100)`. Table at
  5, 8, 10, 12, 15 and 20 % body fat, converted to the user's units.
  *Constants checked 2026-10-31 against the commonly published form of
  Butt's formula (secondary sources: Henselmans, a copy of Butt's e-book);
  his primary text wasn't reachable — recheck if it turns up.*
- **FFMI** — fat-free mass = weight × (1 − BF%); `FFMI = FFM / h²` (m);
  normalised `FFMI + 6.1 × (1.8 − h)` (Kouri 1995). When wrist and ankle are
  known, also the Butt maximum lean mass at the same BF% and today's lean mass
  as a percentage of it.

## Not in this item

- Saving any result (goals, targets) — ask first if wanted.
- Tools from later items (mobility tests E5, etc.).
