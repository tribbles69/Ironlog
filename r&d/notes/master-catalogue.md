# Master exercise catalogue — what went into the catalogue (0.98.0, 13 Nov 2026)

Source: Aaron's research, `master-catalogue-research.md` (base exercises × modifiers,
20 sections). This note records what was taken from it, how it was mapped onto the
existing schema, and what was left out on purpose.

## Mapping rules used

- **Base exercise → movement; implement → equipment; named ROM/setup variant → its
  own movement** (the §3.3 rule in `specs/exercise-system-phase1.md`): pin squat,
  board press, floor press, silver dollar and Viking deadlift are movements.
- **Synonyms → aliases** on one movement, per the research's reconciliation table.
  Aliases stay import/search only, never identity. Every new movement is
  `verified: false`.
- **Power vs squat catch, hang vs block start** are kept separate (power clean /
  clean / hang clean / block clean), as the research says.
- **Holds use `metric: time`; carries, pulls and walks use `carry`.**
- The schema did not change. The research's `pattern`, `discipline_tags`,
  `log_type` and `level` fields were not added; see "Not done" below.

## Added

- 156 movements (127 → 283). Grouped by category in the picker:
  legs 29, olympic 21, plyometrics 18, strongman 16, core 15, calisthenics 12,
  arms 10, shoulders 9, cardio 9, neck 7, back 5, chest 5.
- 4 categories: `olympic`, `plyometrics`, `calisthenics`, `neck`.
- 9 equipment values (with icon, label and title in `js/exercises.js`):
  `cambered_bar`, `swiss_bar`, `medicine_ball`, `rings` (rings / suspension),
  `circus_dumbbell`, `viking_press`, `tyre`, `neck_harness`, `implement`
  (strongman odd kit: car-deadlift frame, power stairs, Hercules pillars,
  shield, duck-walk implement, battle ropes, heavy bag).
- New equipment on existing movements: cambered bar (back squat, good morning,
  bench), Swiss bar (bench, OHP), axle (bench), kettlebell (OHP), rings (push-up,
  pull-up, inverted row, chest dip, fly), band (seated row).
- New aliases on existing movements, e.g. Smith Squat → back squat/smith,
  Klokov Press → behind-the-neck press, Yates Row, Cable Pullover, Scott Curl,
  Bayesian Curl, Ring Dip, Touch and Go Bench.
- Two aliases moved to the movement they actually name: **Keg Toss** (was on
  keg load) and **Truck Pull** (was on sled drag). **Suitcase Carry** now pins the
  unilateral farmers carry leaf.
- Exercise search in the picker also matches aliases.

## Not done, on purpose

- **Mobility and stretching (§20)** — those live in the Mobility routines
  (`data/routines/`), not the lift catalogue. Separate pass.
- **Progression levels** (front lever tuck → full, planche, etc.) — one movement
  each for now, level in the note. Needs a `level` axis or modifier before PRs
  can be kept per level.
- **Trap bar high vs low handles** — not split. A `splitsPR: true` modifier would
  move existing PRs into a new pool, so it needs Aaron's say first.
- **Complexes** (e.g. power clean + front squat) — the research says store them as
  ordered lists of movements; that is a logging feature, not catalogue data.
- **Long-tail named variants** (Kroc row, cyclist squat, Spoto, Larsen…) stay as
  aliases or modifiers on their parent, as the research recommends.
- Neck movements have no muscle-map credit: the map has no neck region.
