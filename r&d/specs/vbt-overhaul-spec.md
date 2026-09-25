# Ironlog — VBT overhaul: two modes plus calibration

Roadmap D1. Written against 0.41.0. Grep `VBT PROFILE`, `openVbtRecord`,
`slewProfile`.

## What exists (kept)

**Measure** (`openVbtRecord`) records a set from the phone's motion sensor
through the bundled Slew engine (`slew-core.js`). It then:
- estimates RIR from within-set velocity loss (`Slew.estimateSet`) and
  attaches the packed result to a set (`s.vbt`);
- uses per-lift **profile buckets** (`SLEW_LIFT`): Slew's population defaults
  `{ v0, slope, vlF, … }`, where `v0` is the bar speed at 0 RIR — the
  **minimum velocity threshold (MVT)** — and `vlF` is the fatigue-rate
  scalar;
- stores personal overrides in `S.settings.slewProfiles[liftId]`;
- calibrates by observation: a set taken to failure stores
  `v0Observed`, which replaces the old value outright.

## Two modes, chosen per exercise in a session (`e.vbtMode`)

The Measure sheet opens with a mode switch, remembered on the entry:

- **This set (effort)**: per-set mode, exactly what Measure does now.
- **Warm-up profile**: the warm-up ramp *is* the measurement.

### Profile mode

- **Points.** Each measured warm-up set adds one point to `e.lvp.points`:
  `{ kg, v }`, where `v` is the mean concentric velocity of the best rep and
  `kg` is the set's load. The recording goes to the next unticked warm-up
  set, or the next unticked set if there are no warm-ups.
- **Fit.** A least-squares line `v = a + b·kg` over the usable points: at
  least 3, spanning at least 15% of load, and `b < 0`. The **day's e1RM** is
  where the line meets the lift's MVT: `(MVT − a) / b`.
- **A range, not a number.** The half-width, as a percentage of the e1RM, is:
  - 4 (sensor floor);
  - plus the fit's scatter, converted to load: residual SE ÷ |b| as % of e1;
  - plus 0.5 per percentage point that the heaviest warm-up sits below 80%
    of e1 (extrapolation).

  So a ramp that stops at 60% reads wide, and one to 85% reads tight.
- **Readiness.** Against the stored profile for this variant
  (`S.settings.lvProfiles[leafKey]`), compare predicted speed at today's
  heaviest warm-up load:
  - **faster than usual** above +5%;
  - **slower than usual** below −5%;
  - otherwise **normal**.

  The day's e1RM is also shown against the stored one.
- **Working weight.** For the first unticked working set: the load from the
  middle of the day's e1RM at its reps and target RIR (`loadFor`), rounded to
  loadable plates. *Use it* sets that set and scales the other open working
  sets in proportion, like autoregulation does.
- **Plugs into `autoE1()`.** While the live session holds a day's e1RM for a
  key, `autoE1(key)` is the average of the history e1RM and the day's. It's
  half-weighted because phone sensors are noisy. So set-to-set adjustment
  and everything else built on the working number use it.
- **Chart.** Load (x) against velocity (y), with:
  - today's points (pocket points hollow);
  - the fitted line;
  - the stored profile line, dashed;
  - the MVT as a horizontal line;
  - the e1RM range as a band where the line meets it.
- **Saved at finish.** The day's fit blends into `lvProfiles[key]` as a
  running mean of `a` and `b`, with the effective count capped at 5, so the
  profile tracks the lifter rather than freezing.

## Calibration (underpins both modes)

- **MVT by lift** starts from the population prior: Slew's `v0` per
  bucket, lower on bench and deadlift than squat. MVT is never tested
  directly.
- **Shrinkage.** Each observed failure velocity joins
  `slewProfiles[lift].v0Obs`, which keeps the last 10. The MVT used is
  `(3·prior + Σ obs) / (3 + n)`, written back as `v0Observed`, so Slew's own
  estimator uses it too. One odd set no longer replaces everything.
- **Calibrate — 8 min** (exercise ⋯ menu, lifts with a profile bucket).
  - A guided ramp at about 40 / 55 / 70 / 80 / 88% of the current e1RM, 2–3
    fast reps each, each step measured.
  - It builds the personal load-velocity profile for the variant and writes
    it to `lvProfiles` at full weight (count 3).
  - An optional last step is a set to failure: it adds an MVT observation,
    and a fatigue scalar `vlF` via `Slew.fitProfile`.
  - The current e1RM comes from `autoE1`, else the best e1RM; if neither
    exists, you enter a rough max.
- **Silent harvesting:**
  - near-failure sets add MVT observations, as before but now shrunk;
  - profile-mode warm-ups update `lvProfiles` at finish.
- **Cross-lift transfer, fatigue scalar only.** A bucket with no personal
  `vlF` takes its population `vlF` × the mean ratio (personal ÷ population)
  from the lifter's other calibrated buckets. MVT and the load-velocity line
  never transfer.
- **Pocket mode is lower confidence.** The Measure sheet asks *On the bar* or
  *In a pocket*:
  - pocket is the default for machines and cables;
  - it's stored as `v.place`, and confidence is × 0.6;
  - pocket sets never add MVT observations and never enter a profile fit.
    They're shown, but hollow.
- **Never gate first run.** Everything works on the population priors, and
  the UI says "population profile" until personal data exists. This matters
  for adaptive lifters, who won't match population norms.

## Honesty

Every VBT number is labelled a guide. The e1RM is always a range.
`r&d/notes/vbt-validation.md` holds the validation protocol and an empty
results table.

Velocity-estimated RIR must not be presented as more than a guide until a
batch of real sets has been compared against a linear transducer or a
validated app, and the error recorded.

## Not in this change

- Camera VBT.
- Bluetooth transducers.
- Using VBT to auto-fill RIR beyond what Measure already does.
