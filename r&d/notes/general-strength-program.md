# General-strength PPLUL (parked, not wired into the app)

`r&d/data/program-general-strength.json`, built by `r&d/tools/build-general-strength.py`.
A second programme alongside the 77-week powerlifting one, for when the focus moves
from competition lifts to general strength. Nothing in the app loads it yet.

## Shape
- 18 weeks, 90 sessions, Mon–Fri PPLUL, written in weeks/days (install asks for a start date).
- Main lifts: Trap Bar Deadlift, Smith Squat, Strict Press. Their three-lift total is the
  strength score, so `priority` is set to those three.
- A weeks heavy (3×3 @ RIR 2 for weeks 1–4 of each block, then 3×2 @ RIR 1).
  B weeks technique (paused Smith squat, trap bar paused below the knee, OHP volume),
  3×3 then 4×3 @ RIR 4.
- Mobility warm-ups from week 5 (goblet holds heels raised; light external rotations + wall slides).
- Test weeks 9 and 18: singles @ RIR 1, same bar, plates and shoes each time.
- Bench and conventional deadlift are out; DB/machine pressing and RDL variants stay as accessories.

## Before it can be installed
1. **Catalogue aliases.** Three names don't resolve and would become custom movements,
   splitting PR history. Add to `r&d/data/exercises.json`, then run `build-catalogue.cjs`:
   - `Smith Squat` → back-squat, equipment smith
   - `Smith Close Grip Bench` → close-grip-bench, equipment smith
   - `Smith Hip Thrust` → hip-thrust, equipment smith
2. **Second programme in Settings.** `loadProgram()` only fetches `program.json` and
   `PROGRAM_MANIFEST` describes one programme. Needs a list of manifests and a fetch by id.
   Moving the JSON to the repo root at that point makes it deployable.

Note-text gotcha: exercise notes are scanned for modifier keywords (`modsFromNote`).
"seated", "supported", "brace", "banded" etc. tag modifiers, so the superset notes say
"cable row" rather than "Seated Cable Row".
