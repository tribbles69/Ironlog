# Strength fitting test — spec

Status: **agreed in chat 2026-10-31, not built.** Roadmap item E12.
Reference workbook with every formula working: `r&d/data/fitting-test/strength-fitting-test.xlsx`
(tabs: Run sheet, Home screen, Ladder, Gym tests, Results, Rules). If this spec
and the workbook disagree, this spec wins; tell Aaron.

## 0. The idea

Colour analysis for training. Suit and colour consultants measure first, assign
a "type", then dress the type. Training apps skip the diagnosis and hand
everyone the same template. This test is the diagnosis: one hour, no true maxes,
and the output is a **profile type** plus **flags** that change the plan.

What already exists elsewhere: StrengthLevel / StrengthLog / Symmetric Strength
rank lifts, and Symmetric Strength flags a lagging lift, but none of them turns
the ranking into a plan. That loop is the point. Adaptive lifters are the gap:
no usable standards exist for them, so Ironlog's own data is the long-term edge.

## 1. Shape of the hour

Home 15 min + gym 45 min = 60. Gym block runs **least to most fatiguing**, so
one test doesn't spoil the next. 5 min general warm-up before the gym block,
not counted.

| # | Part | Where | Min |
|---|---|---|---|
| 1 | Home screen | Home | 15 |
| 2 | Power | Gym | 4 (0 with the speed rep option) |
| 3 | Strength rep ladder | Gym | 30 |
| 4 | Rep tolerance | Gym | 4 |
| 5 | Grip | Gym | 2 |
| 6 | Engine | Gym | 5 |

If a session runs short, test three ladder patterns instead of four (saves ~8 min).

Ground rules shown to the tester: never a true max; every set stops with reps
left; stop any set where form breaks or something hurts (it still counts);
be honest about reps in reserve — the whole test depends on it.

## 2. Part 1 — Home screen (15 min)

Reuse E5's `MOB_TESTS` / `S.mobTests` wherever a test exists; add what's missing.

| Test | Existing id | Record | Notes |
|---|---|---|---|
| Knee-to-wall | `k2w` | cm, L/R | Half-kneeling, heel down, furthest foot distance where knee still touches |
| Shoulder scratch | **new: `scratch`** | cm gap between fists, L/R (named by arm on top) | Overlap = 0. Lower is better. Not the same as `wallflex` |
| Overhead squat, broomstick | **new: `ohs`** | depth flat and depth heels raised: Full / Half / Quarter | 3 slow reps each; 2–3cm heel lift |
| Single-leg stand, eyes closed | `bal_ec` | seconds, L/R, best of 3 | Use the existing pad timer |
| Body | existing check-in / Health | bodyweight, height, inseam, arm length (fist to chest) | Bodyweight sets every starting load |
| Sex, age | settings | — | Pick which standards apply; age scales balance norms |

## 3. Part 2 — Power (4 min)

The seated med ball chest throw was **dropped** (Aaron's gym has no floor
space for it). Two options; the tester picks one and keeps it for retests.

- **A. Speed rep (default if the user has VBT):** phone on the trap bar via the
  D1 Measure flow, on ladder rung 1 of the hinge (50% bodyweight × 8), every rep
  pulled as fast as possible. Record best **peak velocity** (m/s) and the load.
  Costs no extra time or space. **Not scored** — no published norms; tracked
  against the user's own first test.
- **B. Jump and reach:** chalked fingertips, side-on to a wall, standing reach
  mark, then a no-run-up jump and slap. Best of 3, cm. Scored (§8). If jumping
  hurts or isn't safe for the user's joints, use A.

## 4. Part 3 — Strength rep ladder (30 min)

Replaces both a true 1RM test and a VBT load–velocity profile: works for anyone,
needs no known max, and adapts to beginners and advanced lifters alike.

**Rules**
1. Start at the pattern's bodyweight %.
2. Rung reps: **8 → 5 → 3 → 2 → 1**.
3. After each set the user enters **reps done** and **reps in reserve** (RIR,
   shown and typed as RIR; stored as RPE per the standing rule).
4. Next load = previous load + jump from the table, rounded to the plate step
   (default 2.5kg; respect D6 equipment profiles).
5. Stop at 0–2 RIR or after rung 5. Rest 2–3 min.

| RIR after the set (at least) | Next jump |
|---|---|
| 5 | +50% bodyweight |
| 3 | +25% bodyweight |
| 1 | +10% bodyweight, or stop |
| 0 | stop |

Why jump size scales with RIR: a fixed +50% jump is fine for a strong lifter and
dangerous for a novice (Aaron's trap bar max is ~220% bodyweight; someone at
120% would go from "8 easy" at 100% to a failed rep at 150%).

**Patterns, defaults, starting loads**

| Pattern | Default exercise | Start | Time |
|---|---|---|---|
| Hinge | Trap bar deadlift (same handle height every time) | 50% BW | 9 min |
| Squat | Smith machine squat (heel lift if ankles flagged) | 40% BW | 9 min |
| Press | Bench press, or landmine press (count the weaker arm) | 25% BW | 8 min |
| Pull | Seated cable row | 30% BW | 4 min |

Users may pick a different variation per pattern; it must be the same one at
every retest. Log Smith and cable loads the same way every time.

**Estimated 1RM per set:** Epley adjusted for reps left —
`e1RM = load × (1 + (reps + RIR) / 30)`. Pattern result = the best set's e1RM
(the workbook takes the max; the lower-rep sets are the more trustworthy, so
consider weighting them when built — Aaron to decide).

Worked example (93kg bodyweight, hinge): 47.5 × 8 @ 6 RIR → 92.5 × 5 @ 5 →
140 × 3 @ 3 → 162.5 × 2 @ 1, stop. e1RM 178.8kg = 1.92× BW.

Ladder sets are real sets: log them as a normal session so history and PRs see
them, tagged as fitting-test sets.

## 5. Part 4 — Rep tolerance (4 min)

Leg press at ~75% of a working max (or ~1.5× the last squat-ladder load), feet
shoulder-width, knees to ~90°, reps until exactly 1 RIR. Record load and reps.
This is a **type**, not a rank:

| Reps | Volume tolerance |
|---|---|
| ≤ 8 | Low — heavy, low-rep work suits |
| 9–14 | Average |
| ≥ 15 | High — suits volume |

(VBT velocity loss across this set would confirm it, if measured.)

## 6. Part 5 — Grip (2 min)

Barbell loaded to bodyweight at knee height, double overhand, no straps, no
hook. Stand up, time until it slips or goes down. If a bodyweight bar isn't safe
to stand up, a dead hang is the fallback (note the swap).

## 7. Part 6 — Engine (5 min)

500m row, damper 5, as fast as can be held. Record time, HR at the finish, HR
60 s later. **HR drop = finish − 60 s.** Without a monitor, record time only.
Use the D15 cardio HR source where available.

## 8. Scoring — every test 0–5

Every scored test has five cutoffs. **Score = how many cutoffs the value
reaches** (`>=` for higher-better, `<=` for lower-better). Same scale for
everything, so lifts, mobility, balance and fitness compare directly and the
lowest score is what the plan fixes first.

| Score | Strength label | Other tests label |
|---|---|---|
| 0 | Below beginner | Very poor |
| 1 | Beginner | Poor |
| 2 | Novice | Below average |
| 3 | Intermediate | Average |
| 4 | Advanced | Good |
| 5 | Elite | Excellent |

### 8a. Strength

Judged value = e1RM ÷ bodyweight ÷ **variation factor**, against the standard
for the user's sex.

**Use Ironlog's existing `STD` table / `stdFor()`** so the test and the Stats
rankings never disagree. The workbook uses StrengthLog / Strength Level figures
for the four patterns instead; they're close but not identical. Aaron to pick
one source for both. Workbook figures, for reference (multiple of BW, ratios
taken at 80kg men / 60kg women):

| Pattern | Sex | Beg | Nov | Int | Adv | Elite | Source |
|---|---|---|---|---|---|---|---|
| Squat | M | 0.71 | 1.11 | 1.40 | 1.71 | 2.25 | StrengthLog squat |
| Squat | F | 0.40 | 0.80 | 1.12 | 1.42 | 1.95 | StrengthLog squat |
| Hinge | M | 0.91 | 1.39 | 1.78 | 2.15 | 2.70 | StrengthLog deadlift |
| Hinge | F | 0.63 | 1.07 | 1.35 | 1.72 | 2.25 | StrengthLog deadlift |
| Press | M | 0.68 | 0.93 | 1.13 | 1.36 | 1.79 | StrengthLog bench |
| Press | F | 0.37 | 0.55 | 0.70 | 0.85 | 1.25 | StrengthLog bench |
| Pull | M | 0.59 | 0.81 | 1.09 | 1.40 | 1.75 | Strength Level seated cable row |
| Pull | F | 0.35 | 0.53 | 0.75 | 1.03 | 1.32 | Strength Level seated cable row |

Real standards shift with bodyweight (lighter lifters need a higher multiple);
a single ratio is a simplification either way.

**Variation factors** (variation 1RM vs the barbell lift). This is new to
Ironlog — today a trap bar pull ranks against the conventional deadlift
standard, which the Lift app review (Oct 2026) listed as a thing to avoid.
Keep them in one table so they can be tuned; useful beyond this test.

| Variation | Factor | Basis |
|---|---|---|
| Trap bar, high handles | 1.15 | ECU study: high-handle hex bar 1RM ~15% above conventional |
| Trap bar, low handles | unknown | Needs data |
| Smith machine squat | 1.00 | Studies find the Smith 1RM higher, size unclear — tune |
| Landmine press | 1.00 | Unknown — tune |
| Bench press, seated cable row | 1.00 | Standards are for these lifts |

Also show **% of intermediate** (finer than the tier, used to pick strongest /
lagging pattern) and **next tier at (kg)**.

### 8b. Other tests

| Test | Judged value | Better | Sex | Cutoffs 1→5 | Basis |
|---|---|---|---|---|---|
| Ankles | worse side `k2w`, cm | higher | all | 4, 7, 10, 12.5, 15 | 12.5cm is the published normal (= score 4); other steps estimated |
| Shoulders | worse side `scratch`, cm | lower | all | 40, 27, 18, 9, 0 | FMS: within 1 hand (~18cm) good, 1.5 hands (~27cm) fair; rest estimated |
| Balance | worse leg `bal_ec` ÷ age norm | higher | all | 25%, 50%, 75%, 100%, 150% | Age norm = score 4 (table below) |
| Power | jump and reach, cm | higher | M | 21, 31, 41, 51, 61 | Topend Sports bands |
| Power | jump and reach, cm | higher | F | 11, 21, 31, 41, 51 | Topend Sports bands |
| Grip | bar hold, s | higher | all | 10, 20, 30, 45, 60 | **Estimate** — no published norms |
| Recovery | HR drop at 60 s, bpm | higher | all | 12, 15, 18, 22, 30 | < 12 is a clinical warning sign; 14–22 typical; top step estimated |
| Speed rep | peak m/s | — | — | not scored | Baseline only |

Balance age norms — eyes closed, mean of best of 3 (Springer et al. 2007):

| Age from | Men (s) | Women (s) |
|---|---|---|
| 18 | 16.9 | 13.1 |
| 40 | 12.0 | 13.5 |
| 50 | 8.6 | 7.9 |
| 60 | 5.1 | 3.6 |
| 70 | 2.6 | 3.7 |
| 80 | 1.8 | 2.1 |

Mark every cutoff in code with its basis (`sourced` / `estimated`) so the UI and
debug mode (E11) can say which is which.

## 9. Results

- **Strength:** per pattern — e1RM, × BW, score, tier, % of intermediate, next
  tier at kg.
- **Other tests:** value, score, rating, and the action if flagged.
- **Profile:**
  - Strength score = average of the pattern scores.
  - Strongest / lagging pattern = highest / lowest % of intermediate (needs 2+ patterns).
  - Weakest area overall = lowest score across patterns and other tests.
  - Volume tolerance from §5.
  - **Profile type**, one line: `<Strongest>-dominant, lagging <pattern>;
    <low|high> volume tolerance; work on <weakest area>` — e.g.
    "Pull-dominant, lagging squat; low volume tolerance; work on ankles".
- **Flags:** any scored test at **≤ 2** adds its action to the plan:

| Test | Action |
|---|---|
| Ankles | Heel lift for squats, ankle mobility work |
| Shoulders | Overhead mobility work |
| Balance | Single-leg balance work, weaker side first |
| Power | Jumps and speed work |
| Grip | Holds and carries |
| Recovery | Conditioning work |

  Plus: left/right gap over **30%** on balance or knee-to-wall → unilateral work
  on the weaker side (same maths as E5's "Left 25% behind"); overhead squat
  only reaching full depth with heels raised → "ankle-limited", not hips;
  limited even with heels raised → look at hips too.
- Flags clear themselves once the score passes 2.
- The plan side ("what the profile type changes": exercise choice, rep ranges,
  fix weak points vs specialise — a full total rewards fixing weaknesses, a
  single-lift record rewards specialising) is **not specified yet**. First
  build shows results and flags only.

Earlier mock-up of the results screen: horizontal percentile bars per test,
lagging ones highlighted, the profile type as the headline, flags under it.

## 10. Retesting and Ironlog links

- **Home screen every 2 weeks** (cheap, fast-moving — the motivating part);
  results feed `S.mobTests` so E5's Health charts show the trend, left and right
  on the same chart so asymmetry visibly closes.
- **Full hour at the end of each training block** (C6 blocks) — shows whether
  the profile type itself has changed.
- Keep each test's history with the variation used; never compare across a
  changed variation without saying so.
- Aaron's first full run planned for the Christmas 2026 test day.

## 11. Where it lives (proposal — Aaron to confirm)

- Start: **Health → Fitting test** (guided, one part per screen, timers reused
  from E5 / isometrics, ladder screen that calculates the next load live).
- Results: a Health card with the profile type and flags; strength scores link
  to Stats rankings.
- The standards (strength, variation factors, other tests, age norms, flag
  thresholds) live in **one data table** in code or `r&d/data/`, so changing a
  cutoff never means touching logic.
- **Debug mode (E11):** every score shows its trace — judged value, which side
  was picked, each cutoff passed or missed, score. A working trace prototype was
  shown in chat for the home screen.

## 12. Open questions

- One standards source for Stats and the test: `STD` or StrengthLog/Strength Level?
- Adaptive standards: none exist. Collect anonymised opt-in results (e.g. via
  r/DisabledWeightlifting) to build them? Fits local-only only if it's an
  explicit export the user sends.
- Weight the lower-rep ladder sets when picking the pattern's e1RM?
- Real cutoffs for grip, the estimated mobility steps, and the Smith / landmine
  factors.
- Bodyweight-dependent ratios instead of one ratio per tier.

## Sources

- StrengthLog squat standards — https://www.strengthlog.com/squat-strength-standards-kg/
- StrengthLog deadlift standards — https://www.strengthlog.com/deadlift-strength-standards-kg/
- StrengthLog bench press standards — https://www.strengthlog.com/bench-press-strength-standards-kg/
- Strength Level seated cable row — https://strengthlevel.com/strength-standards/seated-cable-row/kg
- Hex bar vs conventional deadlift (Edith Cowan University) — https://ro.ecu.edu.au/ecuworkspost2013/4568
- Knee-to-wall normal value (Physiotutors) — https://www.physiotutors.com/wiki/weight-bearing-lunge-test
- FMS scoring criteria — https://www.curlbc.ca/wp-content/uploads/2021/03/FMS-Scoring-Criteria.pdf
- Single-leg stance norms (Springer et al. 2007) — https://geriatrictoolkit.missouri.edu/balance/Normative_Values_for_the_Unipedal_Stance_Test_Springer-JGPT.pdf
- Vertical jump norms (Topend Sports) — https://www.topendsports.com/testing/norms/vertical-jump.htm
- Heart rate recovery (Omni Calculator) — https://www.omnicalculator.com/sports/heart-rate-recovery
