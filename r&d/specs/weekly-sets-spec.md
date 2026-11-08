# Weekly sets per muscle (roadmap 01)

Added 2026-11-08. Counts hard sets per muscle per week and holds them against a
target range the lifter can edit, the way Tonnage and the RP volume landmarks
do (MEV → MAV → MRV). Lives on **Stats → Muscles**, under the muscle map.
Derived at read time from the log; the only thing stored is the lifter's own
target overrides.

## 1. What counts as a hard set

A set counts when all of these hold:
- the session is a completed lifting session (not cardio or mobility), or the
  live session (ticked sets only);
- the set is done, and has reps, a hold time or a distance (same test as the
  recovery map, D7);
- it is **not a warm-up** (B3);
- it isn't easy: logged at **RIR 5 or more** it doesn't count. A set with no
  RIR logged counts — most people don't log RIR on every set and the ones they
  skip are usually working sets.

A **drop set** after the first set of its chain counts **half**: the chain
reads as one set plus a bit (B3 groups it as one).

## 2. How a set is split between muscles

Each lift has muscle shares that add up to 1 (`leafMuscles`, the same table
the recovery map uses; catalogue-derived shares where nothing is hand-set).
Shares are turned into whole-set credit so the count reads like a coach would
count it:

| Muscle's share | Credit per set |
|---|---|
| the biggest share, or within 80 % of it | **1** (primary) |
| 0.20 or more | **½** (secondary) |
| under 0.20 | 0 |

Examples: bench press → chest 1, triceps ½, front delts ½. Back squat → quads
1, glutes ½. Incline bench → chest 1 and front delts 1 (near tie). Leg press →
quads 1, glutes ½, hamstrings 0. Both numbers (0.8 and 0.20) live in
`WEEKLY_SETS` so they can be tuned in one place.

## 3. The week

Monday to Sunday, the calendar's week (Monday-first). The current week is
partial: until Sunday an "under" reads **"under so far"**.

## 4. Targets

Per muscle, three numbers of hard sets a week:
- **MEV** — the least that tends to make progress;
- **MAV** — a sensible middle to aim for;
- **MRV** — past this most people can't recover.

Status: **under** (< MEV), **in range** (MEV to MRV), **over** (> MRV).
Defaults are rough general figures after the RP landmarks, rounded, and
labelled as a starting point:

| Muscle | MEV | MAV | MRV |
|---|---|---|---|
| Quads | 8 | 14 | 20 |
| Hamstrings | 6 | 12 | 20 |
| Glutes | 4 | 10 | 16 |
| Lower back | 2 | 6 | 12 |
| Lats | 8 | 14 | 22 |
| Upper back | 8 | 14 | 22 |
| Traps | 4 | 10 | 20 |
| Chest | 8 | 14 | 22 |
| Front delts | 0 | 6 | 12 |
| Side delts | 8 | 16 | 26 |
| Triceps | 6 | 12 | 18 |
| Biceps | 8 | 14 | 22 |
| Forearms | 2 | 8 | 16 |
| Abs | 4 | 10 | 20 |
| Calves | 8 | 12 | 20 |

Overrides live in `settings.volTargets` as `{ muscle: { mev, mav, mrv } }`
(only edited muscles), so they're in JSON export and Drive sync. Edits must
keep MEV ≤ MAV ≤ MRV; **Reset** puts a muscle back to the default.

## 5. On screen

A **Weekly sets** card on Stats → Muscles, after the muscle map:
- one row per muscle with any hard set in the last 8 weeks (the card is left
  out until there is one):
  name, this week's count, a bar with the range shaded and the count marked,
  the status word, and last week's count;
- tap a row → a sheet with an **8-week chart** (bars per week, the MEV–MRV
  band shaded, MAV marked), which lifts made this week's number, and the
  target editor;
- shows even without a bodyweight (rankings need one; this doesn't).

Debug mode (E11): a "how?" on each row lists every set that counted for that
muscle this week with its credit, and checks the total against the card.

## 6. Out of scope

Plan changes (the coach adding sets when a muscle is under) — later, through
the coach's suggested changes, never automatic.
