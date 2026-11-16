# Maths audit — November 2026

Done 2026-11-16 against main at 0.99.3 (4bcb23e), plus the unmerged PR #86
(`e16-honest-ledger` @ a4c0d30) for the goal projection. Find and log only:
nothing in the app was changed. Every finding is in `r&d/BUGS.md` as B-038 to
B-058.

## Result

| # | Area | Formula matches its source? | Bugs |
|---|---|---|---|
| 1 | e1RM | Yes: Epley on reps + RIR. The cap at 12 is the app's own, and it causes two bugs | B-038, B-039, B-054 |
| 2 | Autoregulation | Window, median, stall and target RIR do what the spec says | B-038, B-043, B-046, B-047, B-048 |
| 3 | PRs | Pools, same-day order and holds work as written | B-039, B-043, B-044, B-045, B-050, B-051, B-058 |
| 4 | Bar speed | Load-velocity fit is correct least squares. The RIR model is the app's own and unvalidated | B-042, B-049 |
| 5 | Goal projection (PR #86) | Slope and standard error are correct. The gap is taken from the wrong number | B-055, B-056 |
| 6 | Scoring and standards | DOTS and IPF GL match to the last digit. No Wilks in the app. The standards table has no source and half of it is unreachable | B-040, B-053 |
| 7 | Body composition and cardio | Every caliper equation, Siri, Mifflin, Katch–McArdle, Butt, FFMI, Tanaka and Karvonen match | B-041, B-052, B-057 |

Seven sev 2, twelve sev 3, two questions for Aaron.

## How it was checked

The app's own modules were loaded in Node 22 (a copy of `js/`, `slew-core.js`
and `slew-reps.js` with a `package.json` of `{"type":"module"}` and a few
lines of `document` / `localStorage` stubs), state was set by hand on `S`, and
the exported functions were called directly. So every "got" below is what the
shipped code returns, not a re-implementation. Expected values were worked by
hand or from an independent one-line version of the published formula.

Sources marked **(checked)** were opened on 2026-11-16. Those marked
**(not re-read)** are the standard reference for the formula; the paper itself
was not opened, and the coefficients were compared with at least one
independent published listing instead.

---

## 1. e1RM

**Code:** `js/core.js` `e1rm(kg, reps, rpe)`, `e1Rir(rpe)`; inverse
`js/loading.js` `loadFor(e1, reps, rir)`.

**What it does:** Epley, `kg × (1 + n ÷ 30)`, with `n = reps + RIR`, capped at
12. One rep at RIR 0 returns the weight itself. RIR is stored as RPE
(`RIR = 10 − RPE`). RIR 6 and up count as 5; no RIR, or an RPE above 10,
counts as 0.

**Sources:**
- Epley's formula, `1RM = w × (1 + r ÷ 30)`. It comes from a 1985 poundage
  chart, not a study (arXiv 2603.17495, §2, checked).
- Accuracy: LeSuer et al. 1997, *J Strength Cond Res* 11(4):211–213 — all the
  common equations correlate above 0.95 with a tested max and all
  under-read the deadlift (as summarised in arXiv 2603.17495, checked).
  Epley and Brzycki agree at 10 reps; below 10 Epley reads slightly higher.
- Adding reps in reserve to the rep count is the RIR-based RPE scale
  (Zourdos et al. 2016; Helms et al. 2016 — not re-read). The practical
  yardstick is the Reactive Training Systems %1RM chart (not re-read).

**Probe:**

| Input | Expected | Got |
|---|---|---|
| 100 × 5, no RIR | 100 × (1 + 5/30) = 116.67 | 116.67 |
| 100 × 5 @ RIR 2 | 100 × (1 + 7/30) = 123.33 | 123.33 |
| 100 × 1 | 100 | 100.00 |
| 100 × 1 @ RIR 1 | 106.67 | 106.67 |
| 100 × 5 @ RIR 5, 6, 10, 13 | all 133.33 (capped at 5) | 133.33 each |
| 100 × 5 @ RPE 11 | 116.67 (off the scale: 0) | 116.67 |
| RPE as text `"8"` / `""` | 123.33 / 116.67 | 123.33 / 116.67 |
| 0 kg, or 0 reps | 0 | 0 |
| 100 × 12 / × 15 / × 20 | 140 / 150 / 166.67 by plain Epley | **140 / 140 / 140** |
| 100 × 10 @ RIR 2 / RIR 5, 100 × 8 @ RIR 4 | 140 / 150 / 140 | **140 / 140 / 140** |

Against the RTS chart (percent of 1RM for reps at an RPE; app = `loadFor(100, r, rir)`):

| | 1@10 | 1@9 | 2@10 | 3@10 | 5@10 | 5@8 | 8@10 | 8@8 | 10@10 | 12@10 |
|---|---|---|---|---|---|---|---|---|---|---|
| App | 100 | 93.8 | 93.8 | 90.9 | 85.7 | 81.1 | 78.9 | 75.0 | 75.0 | 71.4 |
| Chart | 100 | 95.5 | 95.5 | 92.2 | 86.3 | 81.1 | 78.6 | 73.9 | 73.9 | 70.7 |

Within 1.7 points everywhere, exact at 5 @ RPE 8. That is a pass for the
range the app is built around.

**Verdict:** the formula is what it says it is. Three things to know:

- **The cap (B-038, B-039).** Past 12 effective reps every set is worth
  1.4 × its weight. It was put in because Epley drifts at high reps, but it
  also makes the estimate blind there: reps and RIR stop mattering. See §2
  and §3 for what that does.
- **RIR 6+ → 5** behaves as documented. The inverse does not apply the same
  cap (B-054): `loadFor(140, 5, 6)` = 102.44, which `e1rm` reads back as
  136.59.
- **A single is special-cased.** 100 × 1 is 100, but 100 × 1 at RIR 0.5
  would be 105 and 97.5 × 2 is 104. That step is in every Epley
  implementation; it is why a heavy double can out-score a heavier single.
  Not logged.

**Edge cases:** zero weight or reps → 0. Negative weight → negative e1RM
(the set form doesn't accept one). 1000 kg × 5 → 1166.67, no overflow.
lb: everything is stored in kg; only display and rounding convert.

---

## 2. Autoregulation

**Code:** `js/training.js` `sessionE1`, `autoHistory`, `historyE1`, `autoE1`,
`stallFor`, `applyAuto`, `applyAutoRir`, `autoAdjust`, `noteRir`,
`targetRirFor`; `js/loading.js` `roundLoadFor`. Spec: `r&d/specs/autoreg-spec.md`.

**Source:** the app's own spec; there is no outside formula here beyond e1RM.

| Probe | Expected | Got |
|---|---|---|
| Three sessions, medians 123.33 / 129.50 / 135.67, weights 1 : 2 : 3 | (3 × 135.67 + 2 × 129.5 + 123.33) ÷ 6 = 131.56 | 131.56 |
| Add an off day, a backfill, a session with no RIR and one at RIR 6 | all four ignored: 123.33 | 123.33 |
| Stall, five sessions 100 / 100.9 / 101 / 100 / 99 | stalled (none beats 101.0) | stalled |
| 100 / 101.1 / 100 / 100 / 100 | not stalled | not stalled |
| Four sessions | no verdict | none |
| 100 / 95 / 90 / 85 / 80 | "stalled" (it is a flag, not a diagnosis) | stalled |
| Target RIR: none in the note, block says 3 / no block / note says "stop 1 shy" | 3 / 2 / 1 | 3 / 2 / 1 |
| `autoAdjust`: 100 × 5 @ RIR 5, target 2 | wants +9.5%, capped +7.5% → 107.5 | 107.5 |
| `autoAdjust`: 50 × 12 @ RIR 5, target 3 | should go up | **no change** (B-038) |

**The cap in autoregulation (B-038).** Everything at or past 12 effective
reps reads as 1.4 × weight, and the load read back off that is the weight
you started with:

| Set logged | e1RM | Next load for the same reps and target |
|---|---|---|
| 50 × 12 @ RIR 1 | 70 | 50 |
| 50 × 15 @ RIR 1 | 70 | 50 |
| 50 × 15 @ RIR 4 | 70 | 50 |
| 50 × 20 @ RIR 0 | 70 | 50 |
| 50 × 10 @ RIR 3 | 70 | 50 |

So a high-rep set never moves, however easy or hard it was logged. In the
shipped program 91 of 439 RIR-targeted sets sit past the cap (12 @ 1 ×55,
15 @ 1 ×22, 12 @ 2 ×6, 10 @ 3 ×6, 12 @ 3 ×2), and 12 @ RIR 1 and 15 @ RIR 1
are given the same weight (uncapped Epley would put the 15s about 9% lighter
than the app does).
The Accumulation block's own range, 8–12 at RIR 3, runs into it from 9 reps.

**The 7.5% step cap (B-046).** The cap is applied, then the result is
rounded to the plate step. A set at RIR 5 against a target of 0 wants +14%:

| Load | Next | Change |
|---|---|---|
| 10 kg barbell | 10 | 0% |
| 15 | 15 | 0% |
| 16 | 17.5 | +9.4% |
| 17.5 | 20 | +14.3% |
| 20 | 22.5 | +12.5% |
| 40 | 42.5 | +6.3% |
| 100 | 107.5 | +7.5% |
| 8 or 12 kg dumbbell | unchanged | 0% |
| 14 kg dumbbell | 16 | +14.3% |

Below 16.7 kg (13.3 kg for dumbbells) the set can't move within a session;
just above, one step is more than the cap. The next session's starting loads
are not capped, so this is a within-session effect only.

**Rounding to plates (B-047).** `roundLoadFor` rounds to 2.5 kg (5 lb for a
lb user; dumbbells 2 kg or 5 lb). It does not look at the bar or the plates
at the current place, though `loadableNear` exists and the warm-up ramp uses
it. Working e1RM 131.56, 5 @ RIR 2 = 106.67 → target 107.5; with 20 / 10 / 5
plates only, the bar can be 100 or 110. On a 7 kg bar, 22.5 can't be built.
Ties round up (101.25 → 102.5). lb user: 106.7 kg → 235 lb. Checked and
fine: kg dumbbells in 2 kg steps, lb dumbbells in 5 lb.

**Target RIR from notes (B-048).** Reads correctly: "stop 1 shy", "RIR 2",
"rir2", "@2", "@4", "@5" (→ 5), "@8" (→ 2), "@9.5" (→ 1), "RPE 8.5" (→ 2),
"RPE 10" (→ 0), "RPE8". Correctly ignored: "rpe 4", "@ 80%", "@100kg",
"@ 2.5kg", "3 sets @ 60", "5 @ 8 reps". Wrong: "2 RIR", "RIR: 3", "leave 2
in the tank" → nothing; "pause @ 3 sec", "tempo @3-1-1-0" → RIR 3;
"RIR 10" → 1; "rpe 9-10" → 1.

**Weighted bodyweight lifts (B-043).** Autoregulation runs on any rep lift
with a weight, including a pull-up with plates, where the weight is only the
added part. Off +20 × 5 at 80 kg bodyweight, 8 @ RIR 2 comes out at +17.5;
with the body counted it is +7.5.

**Passes:** median per session, 3 : 2 : 1 window, off days and backfills
left out, stall rule, block and note precedence, fixed blocks keeping the
plan, the bar-speed day estimate averaged in at half weight.

---

## 3. PRs

**Code:** `js/stats.js` `historyFor`, `statsFor`, `beatsBest`, `prsFor`,
`bestSingleInfo`; `js/exercises.js` `exKey`, `isBefore`, `holdRecords`,
`holdBeats`, `shapePRs`.

| Probe | Expected | Got |
|---|---|---|
| 100 × 5, then 100 × 6 | PR | PR |
| First ever session of a lift | not a PR ("first time") | no PR |
| Bodyweight pull-ups 8 → 9 → 9 | PR, then none | PR, none |
| lb user, 225 × 5 twice | no PR on the repeat | none |
| 30 × 12 → 30 × 15 → 30 × 20 | two PRs | **none** (B-039) |
| 30 × 10 @ RIR 2 → 30 × 12 @ RIR 2 | PR | **none** (B-039) |
| 100 × 5 @ RIR 0 → 90 × 5 @ RIR 5 | arguable | PR, 120.0 over 116.7 (B-058, for Aaron) |
| Two sessions one day, finish times 10:00 and 18:00, same 110 × 5 | first only | first only |
| The same, both imported with no times | first only | **both** (known: the comment on `isBefore` says so) |
| One session, Back Squat entered twice (110 × 5, 105 × 5) | one row | **two rows** (B-045) |
| Pull-up + 20 × 5, then + 22.5 × 3, bodyweight 80 | no PR: 116.7 vs 112.8 with the body counted | **PR**, 23.3 vs 24.8 (B-043) |
| Assisted pull-up, 30 kg help × 8 → 40 kg help × 8 | no PR (easier) | **PR** (B-044) |
| Holds 10 kg/30 s, 20 kg/10 s, then 15 kg/60 s | PR: heavier and longer than the first | **none** (B-050) |
| Then 10 kg/31 s | PR at 10 kg | PR |
| Backfilled 150 × 5, real 120 × 5, default settings | per the setting: backfill counts | best = backfill, e1RM 175, flagged `bestIsEst`; rank uses 175 (B-051) |
| The same with "count backfill" off | best = 120 × 5 | 120 × 5 |
| 140 × 1 then 130 × 5 | best single 140, best e1RM 151.67 | 140 / 151.67 |

**Pools** (`exKey`): equipment, execution and attachment each split the pool
(barbell and Smith squat are separate). Chains, bands, slingshot and
equipped split it, in sorted order (`#bands+chains` either way round). An
isometric hold and a time cap get their own (`|iso`, `|cap60`). Comp pause,
tempo and the other non-splitting modifiers share the plain lift's pool, as
the catalogue says they should. All as designed.

**Same-day duplicates:** ordered by finish time since bug sweep 3.6. Two
sessions with no time at all on one day still each see only earlier days, so
both can claim the same PR; that is written on `isBefore` as a known limit
and mostly affects imports. Not logged again.

---

## 4. Bar speed (Slew)

**Code:** `slew-core.js` `estimateSet`, `fitProfile`, `summarize`;
`slew-reps.js` `vbtEstimateSet`, `vbtSummary`; `js/training.js` `mvtFor`,
`lvLine`, `lvOutliers`, `lvFit`, `lvDay`.

### 4a. Velocity → velocity loss → RIR

**What it does:** loss = (reference − last rep) ÷ reference, where the
reference is the median of the first three reps. Then
`done = (loss ÷ loss-at-failure)^0.75` and `RIR = reps × (1 − done) ÷ done`.
Loss-at-failure is per lift (bench 0.50, squat 0.40, deadlift 0.32) until a
set to failure has been measured. Under 8% loss, or past RIR 6, no number.
When the lifter's own failure speed is known, the last five reps' slope
carried to that speed is averaged in.

**Sources:**
- González-Badillo et al. 2017, *Int J Sports Med* 38(3):217–225,
  doi:10.1055/s-0042-120324: in the bench press, velocity loss in a set
  tracks the percentage of possible reps done very closely, across 50–85%
  1RM (abstract checked; the paper's equations are behind a paywall and
  were **not** compared number for number).
- Rodríguez-Rosell et al. 2020, *J Strength Cond Res* 34(9):2537–2547
  (according to PubMed, [doi:10.1519/JSC.0000000000002881](https://doi.org/10.1519/JSC.0000000000002881);
  abstract checked): the same relationship in bench and squat (R² 0.97 and
  0.93); for a given velocity loss a smaller share of the reps has been done
  in the bench than in the squat; reps to failure vary a lot between people
  (CV 15–34%).

**What the model gives:**

| Velocity loss | Bench: % of reps done | Squat |
|---|---|---|
| 10% | 30 | 35 |
| 20% | 50 | 59 |
| 30% | 68 | 81 |
| 40% | 85 | 100 |
| 50% | 100 | 100 |

The direction matches the papers (bench behind squat at every loss). The
exponent 0.75 and the loss-at-failure constants are the app's own, and
`slew-reps.js` already says the model is not validated. Two limits the
papers imply and the model doesn't have: loss at failure is treated as one
number per lift whatever the load, and the research convention is to
measure velocity loss from the fastest rep, normally the first
(Sánchez-Medina & González-Badillo 2011 — not re-read).

| Probe (bench) | Got |
|---|---|
| 0.50/0.49/0.47/0.45/0.42/0.39/0.35/0.30 | loss 38.8%, RIR 1.7 (done = 0.776^0.75 = 0.827; 8 × 0.173 ÷ 0.827 = 1.7 ✓) |
| The same with a 0.60 first rep | card says "Velocity loss 50%", sentence says "You lost 39%", RIR 1.7 (B-049) |
| 0.50/0.50/0.49/0.49/0.48 | loss 4% → no number ✓ |
| A double | no number ✓ |
| Speeds up across the set | no number ✓ |
| A rep at 0 m/s | RIR 0, no NaN ✓ |
| Failure set 0.60/0.50/0.48/0.42/0.36/0.27 calibrates the lift, then is replayed | stored loss-at-failure 0.55, replay measures 0.46 → **RIR 0.9** on a set that was 0 (B-049) |
| Own failure speed 0.25; reps 0.23/0.23/0.22/0.20 | **"RIR 6+"** on a set already under the lifter's limit (B-042) |
| Failure-speed shrinkage, prior 0.16, one observation 0.25 | (3 × 0.16 + 0.25) ÷ 4 = 0.1825 ✓ |
| Ten observations of 0.25 | (0.48 + 2.5) ÷ 13 = 0.2292 ✓ |

Also seen, no user effect: Slew's own "profile" branch ignores the
lifter's measured limit, but Ironlog discards that branch's answer for sets
under three reps.

### 4b. Load-velocity profile

**What it does:** ordinary least squares of best-rep speed on load through
the day's warm-ups (bar readings only, at least three, spread of 15% or
more), outliers dropped where a heavier warm-up was more than 0.05 m/s
faster than a lighter one, then the load where the line meets the lift's
minimum velocity threshold. The ± is
`4 + (residual error ÷ |slope|) ÷ estimate × 100 + max(0, 80 − heaviest%) × 0.5`.

**Sources (not re-read):** González-Badillo & Sánchez-Medina 2010, *Int J
Sports Med* 31(5):347–352 (load and mean velocity are close to linear;
velocity at 1RM in the bench about 0.16–0.17 m/s); Jovanović & Flanagan
2014 and García-Ramos et al. 2018 for estimating 1RM from a line through a
few warm-ups. Banyard et al. 2017 found this over-predicts a free-weight
squat max, which is a reason to keep it a range.

| Probe | Expected | Got |
|---|---|---|
| Points on v = 1.2 − 0.008 kg (40/60/80/100) | a 1.2000, b −0.00800, zero residual | exact |
| Meets 0.16 m/s at | (1.2 − 0.16) ÷ 0.008 = 130 | 130.00, range 122.8–137.2 |
| 40/0.90, 60/0.70, 80/0.58, 100/0.40 | by hand: b = −16.2 ÷ 2000 = −0.00810, a = 1.2120, 1RM 129.88 | −0.00810, 1.2120, 129.88 |
| ± on that | 4 + 2.21 + 1.50 = 7.71% | 7.7% |
| Slow first warm-up (40/0.60 before 60/0.72) | dropped, line through the other three | dropped, exact line |
| Two points; 90/95/100 only; faster when heavier; pocket readings; three at one weight | no fit | no fit, each |
| Heaviest warm-up 46% of the estimate | wide range | ±20.9% |
| Heaviest warm-up already under the threshold | no estimate | none |
| lb user | points are stored in kg | same fit |

**Verdict:** the arithmetic is right. Whether a phone's speeds are right is
the open question in `r&d/notes/vbt-validation.md`, whose results table is
still empty.

---

## 5. Goal projection (PR #86, not merged)

**Code:** `projectGoal`, `projLine` in `index.html` on `e16-honest-ledger`
(the branch predates the module split). Spec: `r&d/specs/ledger-spec.md` on
that branch. The function was cut out of the branch and run as it stands.

**Source:** simple linear regression. Slope `b = Sxy ÷ Sxx`; standard error
of the slope `√(SSE ÷ (n − 2) ÷ Sxx)`.

| Probe | Expected | Got |
|---|---|---|
| e1RM 100 / 101 / 103 / 104 at days 0 / 14 / 28 / 42 | by hand: Sxx 980, Sxy 98, b = 0.1000; residuals 0.1, −0.3, 0.3, −0.1, SSE 0.2, SE = √(0.2 ÷ 2 ÷ 980) = 0.0101 | 0.1000, 0.0101 |
| 6 kg to go | 6 ÷ 0.1101 = 54.5 days, 6 ÷ 0.0899 = 66.7 days | 54 and 67 |
| Three sessions over 42 days | hidden | "not enough history" |
| Four sessions over 41 days | hidden | "not enough history" |
| Four sessions over 42 days | shown | shown |
| Three sessions in one week and one six weeks later | passes the gate | passes (the one late point sets the slope) |
| Flat or falling | no date | "not climbing" |
| Noisy, slope − SE ≤ 0 | later date open-ended | open-ended |
| Target already met | nothing | nothing |
| 9.7 kg at 0.22 kg a month | 3.7 years, inside the five-year limit | 1358 days |

The least squares, the standard error and the 4 sessions / 6 weeks gate are
all correct as specified.

**B-055, sev 2 — the gap.** The rate comes from recent per-session best
*estimates*; the gap is `target − goalCurrent`, and `goalCurrent` is a true
single if one was ever logged, otherwise the all-time best estimate. Those
are two different numbers, and neither is where the line is today.

| Case | App says | From the line's value today |
|---|---|---|
| Single of 150 two years ago; estimates 170 → 179 over six weeks; target 200 | 50 kg ÷ rate = 233 days | 21 kg → 98 days |
| Best ever 180 last year; coming back 140 → 155; target 185 | 5 kg → 14 days | 30 kg → 84 days |

**B-056, sev 3 — the range.**
- ±1 standard error on four points (two degrees of freedom) covers about
  58% of cases; a two-in-three range needs ±1.32 SE and a 95% range ±4.30.
- Four points exactly on a line give SE 0 and a range of a single day.
- The days are counted from today, even when the last session in the window
  was ten weeks ago.

The line already carries the right caveat ("a straight line, so plan on the
later date"). A further point for the spec, not a bug: per-session best
e1RM depends on what was trained that day (a week of singles reads lower
than a week of fives through Epley), so the slope picks up programming as
well as progress.

---

## 6. Scoring and standards

### DOTS — `js/core.js` `dots`

**Source (checked):** coefficients as listed by several independent
calculators and as quoted from OpenPowerlifting's `dots.rs`, including the
bodyweight clamps of 40–210 kg for men and 40–150 kg for women.
`DOTS = total × 500 ÷ (A + B·bw + C·bw² + D·bw³ + E·bw⁴)`.

| Input | Expected (independent) | Got |
|---|---|---|
| 600 kg at 90 kg, male | polynomial 773.2746 → 387.96 | 387.96 |
| 400 at 60, female | 443.42 | 443.42 |
| 500 at 35, male (clamped to 40) | 635.56 | 635.56 |
| 900 at 230, male (clamped to 210) | 446.06 | 446.06 |
| 500 at 160, female (clamped to 150) | 385.38 | 385.38 |
| Total 0, or bodyweight 0 | 0 | 0 |
| Sex not set | male coefficients | 387.96 |
| lb user, 1322.77 lb at 198.42 lb through the Points tool | 387.96 | 387.96 |

All ten coefficients match digit for digit.

### IPF GL — `js/events.js` `glPoints`

**Source (checked):** IPF, "The IPF GL Coefficients for Relative Scoring"
(March 2020). `points = total × 100 ÷ (A − B·e^(−C·bw))`. One mirror of the
PDF extracts the men's classic C as 0.09210; every calculator, and the
published worked example below, use 0.00921, which is what the app has.

| Input | Expected | Got |
|---|---|---|
| 550 at 82.5, men, classic | 76.37 (published worked example) | 76.37 |
| 400 at 60, women, classic | 90.42 | 90.42 |
| 180 at 90, men, bench only | 86.79 | 86.79 |
| 100 at 60, women, bench only | 85.91 | 85.91 |

The four classic sets (men and women, total and bench) match. The four
equipped sets are not in the app; an equipped lifter is scored on classic
coefficients, and the tool does label the result "classic". Edge: no
bodyweight floor, so 600 at 20 kg gives 172.9, and the women's bench
denominator goes negative under about 24 kg (the code returns 0).

### Wilks

Not in the app. The coach recognises the word and that is all.

### Age category

`ageCategory` on year-age: 14–18 sub-junior, 19–23 junior, 24–39 open,
40–49 / 50–59 / 60–69 / 70+ masters 1–4. Matches the IPF bands; boundaries
probed at every edge.

### Strength standards — `js/stats.js` `STD`, `rankFor`

**Source:** none. The table is the app's own bodyweight multiples
("the common able-bodied training tables", per its comment), so there is
nothing outside to check the figures against. The arithmetic was checked
instead.

| Probe (80 kg lifter, Back Squat marks 60/100/120/160/200) | Expected | Got |
|---|---|---|
| 40 × 1 | untrained, 0.5 ÷ 0.75 × 20 = 13.3 | 13.3 |
| 60 | Beginner, 20 | 20.0 |
| 100 / 120 / 160 | Novice 40 / Intermediate 60 / Advanced 80 | 40 / 60 / 80 |
| 199.9 | Advanced, 99.95 | 99.95 |
| 200, 300 | Elite, 100 | 100 |
| Female, 100 | marks × 0.80 = 48/80/96/128/160 → Intermediate 62.5 | 62.5 |
| No bodyweight | no rank | none |
| 100 × 12 and 100 × 20 | different | both e1RM 140, score 70 (the cap again) |

The scoring is right. **The lookup is not (B-040):** the row is found by
movement name, so a dumbbell bench (40 kg a hand = 0.50×) is judged on the
barbell row as Beginner, where the table's own Dumbbell Bench row says
Intermediate; and 23 of the 47 rows carry names no movement has, so they
are dead. Curls, rows, close-grip and incline bench and calf raises get no
rank.

A design note, not logged: plain bodyweight multiples are harder on heavier
lifters. A 2.0× squat is the same tier at 60 kg and 120 kg bodyweight,
while DOTS scores those two lifts 101 and 138.

### Fitting test — `js/health.js` `fitResults`, `fitStrength`, `fitOther`

**Sources:** Springer et al. 2007, *J Geriatr Phys Ther* 30(1):8–15
(checked: the eyes-closed best-of-three table matches the app's six rows
for men and women exactly). Vertical jump bands from Topend Sports and the
12 bpm heart-rate recovery line (Cole et al. 1999, *NEJM*) not re-read.
Strength is judged on the STD table above. Grip cutoffs are marked as the
app's own estimate.

| Probe (80 kg man, 30) | By hand | Got |
|---|---|---|
| Squat ladder 32×8@5, 72×5@3, 92×3@2, 100×2@1 | heaviest at RIR ≤ 3 is 100 × 2 @ 1 → 110 → 1.375× → Novice (2), 92% of intermediate, next tier at 120 | same |
| Trap bar, high handles, 138 × 5 @ RIR 1 | 165.6 ÷ 80 ÷ 1.15 = 1.800× → Novice (2), next at 184 | same |
| Ankles L 12.5 / R 9 | worse 9 → 2 | 2, flagged |
| Shoulders 18 / 27 | worse 27 → 2 | 2, flagged |
| Balance 16.9 / 8 s | 8 ÷ 16.9 = 47% → 1; sides 53% apart → flag | 1, both flags |
| Jump 41 cm | 3 | 3 |
| Hold 30 s | 3 | 3 |
| Heart rate 170 → 152 | drop 18 → 3 | 3 |
| Exactly on a cutoff (ankles 12.5, recovery 12) | counts as reached | 4, 1 |
| Heart rate rose after the row | 0 | 0 |
| No age | youngest norm band | used |
| No bodyweight | no strength score | none |

All pass.

---

## 7. Body composition and cardio

### Calipers — `js/training.js` `CAL_METHODS`, `DW_BANDS`, `siri`, `caliperCalc`

**Sources (coefficients checked against independent listings; papers not
re-read):** Jackson & Pollock 1978, *Br J Nutr* 40:497–504 (men, 3 and 7
sites); Jackson, Pollock & Ward 1980, *Med Sci Sports Exerc* 12:175–182
(women); Durnin & Womersley 1974, *Br J Nutr* 32:77–97 (four sites, by age
band); Siri 1961, `%fat = 495 ÷ density − 450`.

| Method | Input | Expected density / fat | Got |
|---|---|---|---|
| JP3 men | sum 60 mm, age 30 | 1.05782 / 17.95% | same |
| JP3 women | 60, 30 | 1.04402 / 24.13% | same |
| JP7 men | 100, 30 | 1.06535 / 14.63% | same |
| JP7 women | 100, 30 | 1.05178 / 20.63% | same |
| DW men 30–39 | 40, 30 | 1.05505 / 19.17% | same |
| DW women 30–39 | 40, 30 | 1.04105 / 25.48% | same |
| DW band edges, men, sum 40 | changes at 20, 30, 40, 50 | 16.5 → 16.2 → 19.2 → 21.5 → 22.9 at exactly those ages |
| Lean and fat at 80 kg, 17.95% | 65.64 / 14.36 | same |
| A site missing | no result | incomplete |
| Sum 6 mm | flagged as outside 3–50% | 1.3%, flagged |

Every coefficient and all ten Durnin–Womersley rows match. Sites match
(men: chest, abdomen, thigh; women: triceps, suprailiac, thigh).

Edge cases:
- **Age missing:** `caliperCalc` alone would use age 0 (14.55% instead of
  17.95%), but the form won't show or save a result without an age (B-007,
  fixed 0.99.1). Still holds.
- **Under 17:** the youngest band is used with a warning. Some listings
  carry a separate under-17 row; the 1974 paper's youngest groups are 17–19
  for men and 16–19 for women, so a 16-year-old woman gets the warning
  although she is inside the paper's range. Not logged.
- **Very large sums (B-052):** the Jackson–Pollock curves turn over. JP7
  men: 395 mm → 36.6%, 560 mm → 29.5%. The form allows 80 mm a site.
- **Units:** skinfolds are millimetres for everyone; weight goes through kg.

### TDEE, FFMI, muscular potential — `js/core.js` `bmrMifflin`, `js/tools.js`

**Sources (not re-read unless marked):** Mifflin et al. 1990, *Am J Clin
Nutr* 51:241–247; Katch–McArdle, `370 + 21.6 × lean kg`; Kouri et al. 1995,
*Clin J Sport Med* 5(4):223–228, normalised `FFMI + 6.1 × (1.8 − height m)`
(formula checked against independent listings); Casey Butt's maximum lean
mass, `H^1.5 × (√wrist ÷ 22.667 + √ankle ÷ 17.0104) × (1 + bf ÷ 224)`,
inches and pounds.

| Probe | Expected | Got |
|---|---|---|
| Mifflin, 80 kg, 180 cm, 30, male | 800 + 1125 − 150 + 5 = 1780 | 1780 |
| Female, 60 kg, 165 cm, 30 | 600 + 1031.25 − 150 − 161 = 1320 | 1320 |
| **Age blank** (Tools → TDEE) | "enter an age" | **1930**, the age-0 figure (B-041) |
| Bodyweight 0 | nothing | 0 |
| FFMI, 80 kg, 180 cm, 15% | lean 68.0, 20.99, normalised 20.99 | same expressions in the tool |
| FFMI, 62 kg, 157 cm, 15% | lean 52.7, 21.38, normalised 22.78 | same |
| Butt, 70 in, 7 in wrist, 9 in ankle, 10% | 179.3 lb | same expression in the tool |

Katch–McArdle, FFMI and Butt are computed inline in the tool, so they were
checked by reading the expressions against the formulas rather than by
calling a function. Kouri's sample was men only; the tool applies the same
adjustment to everyone and already carries a caveat for short-stature and
adaptive lifters.

### Heart rate — `js/health.js` `estMaxHr`, `zoneBpm`, `HR_ZONES`

**Sources:** Tanaka, Monahan & Seals 2001, *J Am Coll Cardiol*
37(1):153–156, `208 − 0.7 × age` (not re-read); Karvonen 1957,
`rest + % × (max − rest)` (not re-read); ACSM intensity table (checked, as
reproduced in PMC8581515 and PMC9830234).

| Probe | Expected | Got |
|---|---|---|
| Tanaka at 30 / 60 | 187 / 166 | 187 / 166 |
| Zone 2, max 187, no resting HR | 0.6–0.7 × 187 = 112–131 | 112–131 |
| Resting 60 | 60 + 0.6–0.7 × 127 = 136–149 | 136–149 |
| Resting ≥ max | falls back to % of max | 112–131 |
| No date of birth and no measured max | no zone | none |

Tanaka and Karvonen are both implemented correctly. **B-057 (for Aaron):**
the same 60–70% is applied to max HR or to reserve depending on whether a
resting HR was typed in, and those are not the same effort. 136–149 is
73–80% of max. In ACSM's table 64–76% of max sits level with 40–59% of
reserve (moderate), and 60–89% of reserve is vigorous. Both conventions are
in use for "Zone 2"; the app should pick one.

The cardio control loop (`cardioDecide`) was read in the 2026-11-12 sweep
and not re-probed here.

---

## Not covered, or covered thinly

- Bar-speed numbers against a reference device. Nothing here says the
  phone's speeds are right; `vbt-validation.md` is still empty.
- González-Badillo 2017's regression equations, number for number
  (paywalled).
- Rep detection and the signal filtering in `slew-reps.js` (not maths a
  lifter reads directly).
- Weekly hard sets, recovery and the muscle map. They are derived figures
  but don't tell anyone what to lift or how they rank.
- Blood pressure and glucose bands (covered 2026-11-12).
- Meet-day totals, lights and the placing predictor were read, not probed,
  apart from attempt rounding (B-053).

## Running the probes again

```
mkdir probe && cd probe
mkdir app && cp -r ../js ../slew-core.js ../slew-reps.js app/ && echo '{"type":"module"}' > app/package.json
# stub.mjs: globalThis.document / localStorage / window / navigator / MutationObserver no-ops
# then, in a .mjs:  import './stub.mjs';  const core = await import('./app/js/core.js'); ...
# slew-core.js is a classic script: vm.runInThisContext(source + ';globalThis.Slew = Slew;')
```

State is plain data: set `S.workouts`, `S.settings.bodyweight`,
`S.settings.units` and so on from `js/state.js`, call `bust()` from
`js/stats.js` after changing workouts, and call the exported functions.
The inputs in every table above are the whole probe.

## Sources opened on 2026-11-16

- DOTS coefficients and clamps: <https://inchcalculator.com/lifting-strength-calculator>, <https://coachway.io/tools/dots-calculator/>
- IPF GL coefficients: <https://benchpresschampion.com/FORMULES/FormuleGL.pdf> (IPF, March 2020), <https://vcalc.com/wiki/ipf-gl-formula>; worked example 76.37: <https://calcbee.pages.dev/calculators/health/strength/ipf-gl-points-calculator>
- Epley's origin and LeSuer 1997 summary: <https://arxiv.org/pdf/2603.17495>; Epley against Brzycki: <https://en.wikipedia.org/wiki/One-repetition_maximum>
- Velocity loss and reps done: <https://www.thieme-connect.de/products/ejournals/abstract/10.1055/s-0042-120324> (abstract); PubMed 31045753, <https://doi.org/10.1519/JSC.0000000000002881> (abstract)
- Single-leg stance norms: <https://geriatrictoolkit.missouri.edu/balance/Normative_Values_for_the_Unipedal_Stance_Test_Springer-JGPT.pdf>
- ACSM intensity table: <https://pmc.ncbi.nlm.nih.gov/articles/PMC8581515/table/T1>, <https://pmc.ncbi.nlm.nih.gov/articles/PMC9830234/table/table2-15598276211052277>
- Jackson–Pollock and Durnin–Womersley coefficients: <https://www.topendsports.com/testing/density-jackson-pollock.htm>, <https://www.topendsports.com/testing/density-durnin-womersley.htm>, <https://www.medicalalgorithms.com/predicting-body-density-and-percent-body-fat-of-adults-from-skinfold-thickness-using-the-equations-of-durnin-and-womersley>
- Normalised FFMI: <https://repstack.pages.dev/calculators/ffmi/>
