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
- **Trap bar handles (Aaron, 13 Nov 2026):** high and low handles are the
  attachment axis on a trap bar (`attachmentKind` `trap_handle`,
  `attachmentApplies.trap_bar`), so they are separate leaves with separate PRs,
  on deadlift, rack pull, RDL, shrug, deadlift hold and jump squat. Default is
  high. Migration `trap-handles-0.98.0` marks every earlier trap bar leaf high
  handles ("my personal PRs are high handle"), and re-runs on Drive merge and
  CSV import. The fitting test's trap_high / trap_low variations point at the
  two leaves.
- **Mobility library:** `data/mobility.json`, 101 stretches and drills (the 25
  Full Body Stretch items under their routine ids, plus 76 from §20 and the
  mobility drills of §19), with style, region, joints, default dose and an
  `endRange` flag plus an active `swap` for passive end-range work. Checked by
  `tools/validate-mobility.cjs`. Not in the app yet — a routine builder or a
  library browser in the Mobility player would use it.

## Not done, on purpose

- **Progression levels** (front lever tuck → full, planche, etc.) — one movement
  each for now, level in the note. Needs a `level` axis or modifier before PRs
  can be kept per level.
- **Complexes** (e.g. power clean + front squat) — the research says store them as
  ordered lists of movements; that is a logging feature, not catalogue data.
- **Long-tail named variants** (Kroc row, cyclist squat, Spoto, Larsen…) stay as
  aliases or modifiers on their parent, as the research recommends.
- Neck movements have no muscle-map credit: the map has no neck region.
