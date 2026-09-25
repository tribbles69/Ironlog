# Muscle shares to check (roadmap D7)

The recovery heatmap and the share card both split each set across muscles
using these shares. There are three sources:
- **Hand-set:** from `EX_MUSCLE` in `index.html`, found by the lift's name or
  one of its aliases.
- **Derived (via a name):** from the generated exercise database.
- **Derived (catalogue):** the catalogue's primary muscles weighted 1 and its
  secondary muscles 0.4. This is a placeholder.

This list is every lift in the installed program (`program.json`), with the
most working sets first. Check each line and correct any wrong numbers in
`EX_MUSCLE`; adding a lift there makes it hand-set. Tick a line once it's
checked. The recovery map stays provisional until the top of this list
is checked.

| ✓ | lift | working sets in program | source | shares |
|---|---|---|---|---|
| [ ] | Calf Raise (standing) <br><sub>as Smith Calf Raise</sub> | 427 | hand-set (via “Calf Raise”) | Calves 100% |
| [ ] | Bench Press <br><sub>as Machine Chest Press, Flat DB Press</sub> | 350 | hand-set | Chest 48%, Triceps 28%, Front delts 24% |
| [ ] | Deadlift <br><sub>as Hex Deadlift</sub> | 349 | hand-set | Lower back 28%, Glutes 24%, Hamstrings 22%, Traps 13%, Forearms 13% |
| [ ] | Back Squat | 342 | hand-set | Quads 40%, Glutes 25%, Lower back 15%, Hamstrings 12%, Abs 8% |
| [ ] | Lateral Raise <br><sub>as DB Lat Raise, Cable Lat Raise</sub> | 271 | hand-set | Side delts 100% |
| [ ] | Face Pull | 247 | hand-set | Upper back 60%, Side delts 40% |
| [ ] | Seated Row <br><sub>as Seated Cable Row</sub> | 242 | hand-set (via “Cable Row”) | Lats 38%, Upper back 38%, Biceps 24% |
| [ ] | Leg Curl | 206 | hand-set | Hamstrings 100% |
| [ ] | Shrug <br><sub>as Barbell Shrug, Smith Shrug</sub> | 201 | hand-set | Traps 80%, Forearms 20% |
| [ ] | Overhead Press <br><sub>as Strict Press, Smith Shoulder Press</sub> | 194 | hand-set | Front delts 45%, Triceps 28%, Side delts 17%, Abs 10% |
| [ ] | Lat Pulldown | 162 | hand-set | Lats 58%, Biceps 26%, Upper back 16% |
| [ ] | Leg Extension | 144 | hand-set | Quads 100% |
| [ ] | Triceps Pushdown <br><sub>as Rope Pushdown, Tricep Bar Pushdown</sub> | 138 | **derived** (via “Triceps Pushdown”) | Triceps 100% |
| [ ] | Hammer Curl <br><sub>as DB Hammer Curl, Cable Hammer Curl</sub> | 106 | hand-set | Biceps 60%, Forearms 40% |
| [ ] | Leg Press <br><sub>as Sled Leg Press</sub> | 99 | hand-set | Quads 55%, Glutes 28%, Hamstrings 17% |
| [ ] | Hip Thrust <br><sub>as Barbell Hip Thrust</sub> | 92 | hand-set | Glutes 62%, Hamstrings 26%, Quads 12% |
| [ ] | Hip Abduction | 88 | **derived** (catalogue) | Glutes 100% |
| [ ] | Close Grip Bench Press <br><sub>as Close Grip Bench</sub> | 73 | hand-set (via “Close Grip Bench”) | Triceps 48%, Chest 32%, Front delts 20% |
| [ ] | Crunch <br><sub>as Cable Crunch</sub> | 64 | **derived** (via “Cable Crunch”) | Abs 100% |
| [ ] | Back Extension | 64 | hand-set | Lower back 50%, Glutes 30%, Hamstrings 20% |
| [ ] | Romanian Deadlift | 60 | hand-set | Hamstrings 45%, Glutes 28%, Lower back 17%, Forearms 10% |
| [ ] | Biceps Curl <br><sub>as Barbell Curl</sub> | 58 | hand-set (via “Barbell Curl”) | Biceps 78%, Forearms 22% |
| [ ] | Overhead Triceps Extension <br><sub>as Overhead Tricep Extension</sub> | 58 | **derived** (catalogue) | Triceps 100% |
| [ ] | Side Bend <br><sub>as DB Side Bend</sub> | 58 | **derived** (catalogue) | Abs 71%, Lower back 29% |
| [ ] | Incline Bench Press <br><sub>as Incline Bench</sub> | 55 | hand-set (via “Incline Bench”) | Chest 38%, Front delts 36%, Triceps 26% |
| [ ] | Reverse Curl | 55 | **derived** (catalogue) | Forearms 83%, Biceps 17% |
| [ ] | Glute Kickback <br><sub>as Cable Kickback</sub> | 55 | **derived** (via “Glute Kickback”) | Glutes 70%, Hamstrings 30% |
| [ ] | Hip Adduction | 46 | **none** | — (no muscle map) |
| [ ] | Hanging Knee Raise | 39 | **derived** (catalogue) | Abs 100% |
| [ ] | Woodchopper <br><sub>as Cable Woodchopper</sub> | 28 | **derived** (catalogue) | Abs 100% |
| [ ] | Front Raise | 26 | **derived** (catalogue) | Front delts 71%, Chest 29% |
| [ ] | Pin Press <br><sub>as Bench Pin Press</sub> | 12 | **derived** (catalogue) | Chest 42%, Triceps 42%, Front delts 17% |

Generated 25 Sep 2026 from `program.json` against 0.49.0.
