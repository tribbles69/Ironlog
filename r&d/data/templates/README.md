# Coach plan templates — DRAFT for Aaron to read

Coach spec §3 says the slot lists and the per-goal numbers get read before any
code. This is that read. The JSON files beside this one are the source; the
tables below are generated from them (`patterns.json`, `goals.json` and one
file per split). Change the JSON, not this page.

## How a plan is built

1. **Days tapped → split** (spec §2): 1 full body, 2 upper/lower, 3 PPL,
   4 ULUL, 5 PPLUL, 6 PPL ×2.
2. Each day is **eight slots in training order**. Session length keeps the
   first N: 30 min → 4, 45 → 5, 60 → 6, 90 → 8. **✂ marks the last slot
   kept at 45 min.** The main slot is never cut.
3. A slot is a **pattern** plus a **role**. The first candidate in the
   pattern's list that is at that day's place, isn't on the go-easy list and
   breaks no rule is picked; the rest are the Swap list. Your **priority
   lifts** jump to the front of any pattern they fit (e.g. trap bar deadlift
   in *Deadlift*).
4. **Role + goal → reps and RIR**; **role + experience → sets** (tables
   below).
5. **2+ years** gets the **A/B fortnight**: A weeks the heavy lift, B weeks
   the column on the right. Everyone else does the A column every week.
6. **Rules**, re-checked after every fill and swap: one main lift a day;
   squat and leg press never in one session; trap bar and leg press never in
   one session. A candidate that would break one is skipped.
7. **Strongman** adds one event slot (carry, load or press) straight after
   the main lift on the marked event day, replacing the last slot kept.
   **Powerlifting** pins the main lifts to the competition barbell lifts.

## Reps and RIR per goal

Where RIR shows two numbers, 2+ years gets the first, everyone else the
second. Under 6 months never goes below RIR 2.

| Goal | Main | Secondary | Accessory | Finisher |
|---|---|---|---|---|
| Strength | 3–5 @ 2 | 5–8 @ 2 | 6–10 @ 2 | 10–15 @ 1/2 |
| Size | 6–10 @ 2 | 8–12 @ 2 | 10–15 @ 1/2 | 12–20 @ 1/2 |
| Strongman | as Strength, + one event slot (3 sets) | | | |
| Powerlifting meet | as Strength, competition lifts as main | | | |
| General fitness | 8–12 @ 2/3 | 8–12 @ 2/3 | 10–15 @ 2/3 | 12–20 @ 2/3 |

## Sets per slot

| Experience | Main | Secondary | Accessory | Finisher | A/B weeks | AMRAP |
|---|---|---|---|---|---|---|
| Under 6 months | 3 | 2 | 2 | 2 | no | no |
| 6 months–2 years | 3 | 3 | 3 | 2 | no | no |
| 2+ years | 4 | 3 | 3 | 3 | yes | yes |

## Your two test cases

- **Aaron** — 5 days, gym, 45 min, strongman, 2+ years, priority trap bar
  and OHP: the PPLUL below at 5 slots a day. Lower's main becomes trap bar
  (priority, and strongman ranks it first), with the event slot after it;
  B-week Lower is hip thrust. Legs B is leg press, which never meets the trap
  bar or squat. OHP is the Upper main; strongman puts the log first where
  the gym has one.
- **Chelsea** — under 6 months: the A column every week, 3 / 2 / 2 / 2
  sets, RIR 2 or more, no AMRAPs, weights blank until her first RIR sets.

## Questions for you

1. **45 minutes = 5 exercises.** Your PPLUL fits about 8–12 in 45 with
   supersets. Should the coach pair accessories into supersets so 45 min
   holds 7, or keep it simple at 5 for now?
2. **Beginners and barbells.** Chelsea's squat and bench default to the
   barbell (the first candidate). Start under-6-month lifters on machines and
   dumbbells instead (leg press, DB bench), moving to the bar later?
3. **Reps and RIR** — the table above is the spec's starting set plus a
   secondary and finisher row. Change anything?
4. **6 days** repeats PPL with OHP, pulldown and leg press as the second
   round's mains. Fine, or would you rather 6 days be something else?
5. **Home.** Every pattern ends with a dumbbell, band or bodyweight option, so
   a home day always fills — but a home lower day has no heavy squat or
   hinge without a barbell. Acceptable?

## The splits

### 1 day — Full body

**Full body** (strongman event day)

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Squat | **main** | Back Squat | Leg Press (machine) |
| 2 | Bench press | secondary | Bench Press | Bench Press (machine) |
| 3 | Row | secondary | Seated Row (cable) | Lat Pulldown (cable) |
| 4 | Second hinge | secondary | Romanian Deadlift | same |
| 5 ✂ | Overhead press | accessory | Overhead Press | same |
| 6 | Pulldown / pull-up | accessory | Lat Pulldown (cable) | Seated Row (cable) |
| 7 | Abs | finisher | Crunch (cable) | same |
| 8 | Calves | finisher | Calf Raise (standing) (Smith) | same |

### 2 days — Upper / Lower

**Upper**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Bench press | **main** | Bench Press | Bench Press (machine) |
| 2 | Row | secondary | Seated Row (cable) | Lat Pulldown (cable) |
| 3 | Overhead press | secondary | Overhead Press | Overhead Press (Smith) |
| 4 | Pulldown / pull-up | accessory | Lat Pulldown (cable) | Seated Row (cable) |
| 5 ✂ | Lateral raise | accessory | Lateral Raise (cable) | same |
| 6 | Triceps | accessory | Triceps Pushdown (cable) | same |
| 7 | Biceps | accessory | Biceps Curl (DB) | same |
| 8 | Rear delts | accessory | Face Pull (cable) | same |

**Lower** (strongman event day)

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Squat | **main** | Back Squat | Leg Press (machine) |
| 2 | Deadlift | secondary | Deadlift | Hip Thrust |
| 3 | Single-leg | accessory | Bulgarian Split Squat (DB) | same |
| 4 | Hamstring curl | accessory | Leg Curl (machine) | same |
| 5 ✂ | Quads | accessory | Leg Extension (machine) | same |
| 6 | Calves | finisher | Calf Raise (standing) (Smith) | same |
| 7 | Abs | finisher | Crunch (cable) | same |
| 8 | Obliques | finisher | Side Bend (DB) | same |

### 3 days — Push / Pull / Legs

**Push**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Bench press | **main** | Bench Press | Bench Press (machine) |
| 2 | Overhead press | secondary | Overhead Press | Overhead Press (Smith) |
| 3 | Incline press | accessory | Incline Bench Press (DB) | same |
| 4 | Lateral raise | accessory | Lateral Raise (cable) | same |
| 5 ✂ | Triceps | accessory | Triceps Pushdown (cable) | same |
| 6 | Chest fly | accessory | Chest Fly (cable) | same |
| 7 | Overhead triceps | accessory | Overhead Triceps Extension (cable) | same |
| 8 | Abs | finisher | Crunch (cable) | same |

**Pull**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Deadlift | **main** | Deadlift | Hip Thrust |
| 2 | Row | secondary | Seated Row (cable) | Lat Pulldown (cable) |
| 3 | Pulldown / pull-up | secondary | Lat Pulldown (cable) | Seated Row (cable) |
| 4 | Shrug | accessory | Shrug | same |
| 5 ✂ | Rear delts | accessory | Face Pull (cable) | same |
| 6 | Biceps | accessory | Biceps Curl (DB) | same |
| 7 | Hammer curl | accessory | Hammer Curl (DB) | same |
| 8 | Obliques | finisher | Side Bend (DB) | same |

**Legs** (strongman event day)

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Squat | **main** | Back Squat | Leg Press (machine) |
| 2 | Single-leg | secondary | Bulgarian Split Squat (DB) | same |
| 3 | Hamstring curl | accessory | Leg Curl (machine) | same |
| 4 | Quads | accessory | Leg Extension (machine) | same |
| 5 ✂ | Glutes | accessory | Hip Abduction (machine) | same |
| 6 | Calves | finisher | Calf Raise (standing) (Smith) | same |
| 7 | Abs | finisher | Crunch (cable) | same |
| 8 | Adductors | accessory | Hip Adduction (machine) | same |

### 4 days — Upper / Lower / Upper / Lower

**Upper 1**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Bench press | **main** | Bench Press | Bench Press (machine) |
| 2 | Row | secondary | Seated Row (cable) | Lat Pulldown (cable) |
| 3 | Incline press | accessory | Incline Bench Press (DB) | same |
| 4 | Pulldown / pull-up | accessory | Lat Pulldown (cable) | Seated Row (cable) |
| 5 ✂ | Lateral raise | accessory | Lateral Raise (cable) | same |
| 6 | Triceps | accessory | Triceps Pushdown (cable) | same |
| 7 | Biceps | accessory | Biceps Curl (DB) | same |
| 8 | Rear delts | accessory | Face Pull (cable) | same |

**Lower 1**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Squat | **main** | Back Squat | Leg Press (machine) |
| 2 | Second hinge | secondary | Romanian Deadlift | same |
| 3 | Single-leg | accessory | Bulgarian Split Squat (DB) | same |
| 4 | Hamstring curl | accessory | Leg Curl (machine) | same |
| 5 ✂ | Quads | accessory | Leg Extension (machine) | same |
| 6 | Calves | finisher | Calf Raise (standing) (Smith) | same |
| 7 | Abs | finisher | Crunch (cable) | same |
| 8 | Obliques | finisher | Side Bend (DB) | same |

**Upper 2**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Overhead press | **main** | Overhead Press | Overhead Press (Smith) |
| 2 | Pulldown / pull-up | secondary | Lat Pulldown (cable) | Seated Row (cable) |
| 3 | Close-grip press | secondary | Close Grip Bench Press | same |
| 4 | Row | accessory | Seated Row (cable) | Lat Pulldown (cable) |
| 5 ✂ | Lateral raise | accessory | Lateral Raise (cable) | same |
| 6 | Rear delts | accessory | Face Pull (cable) | same |
| 7 | Overhead triceps | accessory | Overhead Triceps Extension (cable) | same |
| 8 | Hammer curl | accessory | Hammer Curl (DB) | same |

**Lower 2** (strongman event day)

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Deadlift | **main** | Deadlift | Hip Thrust |
| 2 | Hip thrust | secondary | Hip Thrust | Romanian Deadlift |
| 3 | Single-leg | accessory | Bulgarian Split Squat (DB) | same |
| 4 | Hamstring curl | accessory | Leg Curl (machine) | same |
| 5 ✂ | Glutes | accessory | Hip Abduction (machine) | same |
| 6 | Calves | finisher | Calf Raise (standing) (Smith) | same |
| 7 | Obliques | finisher | Side Bend (DB) | same |
| 8 | Quads | accessory | Leg Extension (machine) | same |

### 5 days — Push / Pull / Legs / Upper / Lower

Reference: Aaron's 77-week PPLUL (r&d/data/hunchback-pplul-77wk.txt).

**Push**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Bench press | **main** | Bench Press | Bench Press (machine) |
| 2 | Incline press | secondary | Incline Bench Press (DB) | same |
| 3 | Triceps | accessory | Triceps Pushdown (cable) | same |
| 4 | Lateral raise | accessory | Lateral Raise (cable) | same |
| 5 ✂ | Chest fly | accessory | Chest Fly (cable) | same |
| 6 | Abs | finisher | Crunch (cable) | same |
| 7 | Overhead triceps | accessory | Overhead Triceps Extension (cable) | same |
| 8 | Rear delts | accessory | Face Pull (cable) | same |

**Pull**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Row | **main** | Seated Row (cable) | Lat Pulldown (cable) |
| 2 | Shrug | secondary | Shrug | same |
| 3 | Pulldown / pull-up | secondary | Lat Pulldown (cable) | Seated Row (cable) |
| 4 | Biceps | accessory | Biceps Curl (DB) | same |
| 5 ✂ | Rear delts | accessory | Face Pull (cable) | same |
| 6 | Hammer curl | accessory | Hammer Curl (DB) | same |
| 7 | Abs | finisher | Crunch (cable) | same |
| 8 | Lateral raise | accessory | Lateral Raise (cable) | same |

**Legs**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Squat | **main** | Back Squat | Leg Press (machine) |
| 2 | Quads | accessory | Leg Extension (machine) | same |
| 3 | Hamstring curl | accessory | Leg Curl (machine) | same |
| 4 | Calves | finisher | Calf Raise (standing) (Smith) | same |
| 5 ✂ | Abs | finisher | Crunch (cable) | same |
| 6 | Adductors | accessory | Hip Adduction (machine) | same |
| 7 | Glutes | accessory | Hip Abduction (machine) | same |
| 8 | Single-leg | accessory | Bulgarian Split Squat (DB) | same |

**Upper**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Overhead press | **main** | Overhead Press | Overhead Press (Smith) |
| 2 | Close-grip press | secondary | Close Grip Bench Press | same |
| 3 | Row | accessory | Seated Row (cable) | same |
| 4 | Overhead triceps | accessory | Overhead Triceps Extension (cable) | same |
| 5 ✂ | Lateral raise | accessory | Lateral Raise (cable) | same |
| 6 | Rear delts | accessory | Face Pull (cable) | same |
| 7 | Biceps | accessory | Biceps Curl (DB) | same |
| 8 | Abs | finisher | Crunch (cable) | same |

**Lower** (strongman event day)

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Deadlift | **main** | Deadlift | Hip Thrust |
| 2 | Second hinge | secondary | Romanian Deadlift | same |
| 3 | Hamstring curl | accessory | Leg Curl (machine) | same |
| 4 | Glutes | accessory | Hip Abduction (machine) | same |
| 5 ✂ | Calves | finisher | Calf Raise (standing) (Smith) | same |
| 6 | Obliques | finisher | Side Bend (DB) | same |
| 7 | Single-leg | accessory | Bulgarian Split Squat (DB) | same |
| 8 | Adductors | accessory | Hip Adduction (machine) | same |

### 6 days — Push / Pull / Legs × 2

**Push 1**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Bench press | **main** | Bench Press | Bench Press (machine) |
| 2 | Overhead press | secondary | Overhead Press | Overhead Press (Smith) |
| 3 | Incline press | accessory | Incline Bench Press (DB) | same |
| 4 | Lateral raise | accessory | Lateral Raise (cable) | same |
| 5 ✂ | Triceps | accessory | Triceps Pushdown (cable) | same |
| 6 | Chest fly | accessory | Chest Fly (cable) | same |
| 7 | Abs | finisher | Crunch (cable) | same |
| 8 | Overhead triceps | accessory | Overhead Triceps Extension (cable) | same |

**Pull 1**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Deadlift | **main** | Deadlift | Hip Thrust |
| 2 | Row | secondary | Seated Row (cable) | Lat Pulldown (cable) |
| 3 | Pulldown / pull-up | accessory | Lat Pulldown (cable) | Seated Row (cable) |
| 4 | Shrug | accessory | Shrug | same |
| 5 ✂ | Biceps | accessory | Biceps Curl (DB) | same |
| 6 | Rear delts | accessory | Face Pull (cable) | same |
| 7 | Obliques | finisher | Side Bend (DB) | same |
| 8 | Hammer curl | accessory | Hammer Curl (DB) | same |

**Legs 1**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Squat | **main** | Back Squat | Leg Press (machine) |
| 2 | Single-leg | secondary | Bulgarian Split Squat (DB) | same |
| 3 | Hamstring curl | accessory | Leg Curl (machine) | same |
| 4 | Quads | accessory | Leg Extension (machine) | same |
| 5 ✂ | Calves | finisher | Calf Raise (standing) (Smith) | same |
| 6 | Abs | finisher | Crunch (cable) | same |
| 7 | Glutes | accessory | Hip Abduction (machine) | same |
| 8 | Adductors | accessory | Hip Adduction (machine) | same |

**Push 2**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Overhead press | **main** | Overhead Press | Overhead Press (Smith) |
| 2 | Incline press | secondary | Incline Bench Press (DB) | same |
| 3 | Close-grip press | secondary | Close Grip Bench Press | same |
| 4 | Lateral raise | accessory | Lateral Raise (cable) | same |
| 5 ✂ | Overhead triceps | accessory | Overhead Triceps Extension (cable) | same |
| 6 | Chest fly | accessory | Chest Fly (cable) | same |
| 7 | Abs | finisher | Crunch (cable) | same |
| 8 | Rear delts | accessory | Face Pull (cable) | same |

**Pull 2**

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Pulldown / pull-up | **main** | Lat Pulldown (cable) | Seated Row (cable) |
| 2 | Row | secondary | Seated Row (cable) | Lat Pulldown (cable) |
| 3 | Rear delts | accessory | Face Pull (cable) | same |
| 4 | Hammer curl | accessory | Hammer Curl (DB) | same |
| 5 ✂ | Shrug | accessory | Shrug | same |
| 6 | Biceps | accessory | Biceps Curl (DB) | same |
| 7 | Obliques | finisher | Side Bend (DB) | same |
| 8 | Lateral raise | accessory | Lateral Raise (cable) | same |

**Legs 2** (strongman event day)

| # | Slot | Role | A week / everyone | B week (2+ years) |
|---|---|---|---|---|
| 1 | Machine squat | **main** | Leg Press (machine) | Back Squat |
| 2 | Second hinge | secondary | Romanian Deadlift | same |
| 3 | Hip thrust | accessory | Hip Thrust | same |
| 4 | Hamstring curl | accessory | Leg Curl (machine) | same |
| 5 ✂ | Quads | accessory | Leg Extension (machine) | same |
| 6 | Calves | finisher | Calf Raise (standing) (Smith) | same |
| 7 | Adductors | accessory | Hip Adduction (machine) | same |
| 8 | Abs | finisher | Crunch (cable) | same |

### Swap lists (pattern → ranked candidates)

| Pattern | Candidates, first pick first |
|---|---|
| Squat | Back Squat · Back Squat (SSB) · Back Squat (Smith) · Front Squat · Goblet Squat (DB) |
| Machine squat | Leg Press (machine) · Hack Squat (machine) · Pendulum Squat (machine) · Back Squat (belt squat) · Goblet Squat (DB) |
| Deadlift | Deadlift · Deadlift (trap bar) · Sumo Deadlift · Romanian Deadlift (DB) |
| Second hinge | Romanian Deadlift · Deadlift (trap bar) · Romanian Deadlift (DB) · Stiff Leg Deadlift · Good Morning · Back Extension (bodyweight) |
| Hip thrust | Hip Thrust · Hip Thrust (machine) · Hip Thrust (Smith) · Glute Bridge (DB) |
| Single-leg | Bulgarian Split Squat (DB) · Reverse Lunge (DB) · Split Squat (DB) · Step Up (DB) · Split Squat (bodyweight) |
| Quads | Leg Extension (machine) · Sissy Squat (bodyweight) · Split Squat (bodyweight) |
| Hamstring curl | Leg Curl (machine) · Glute Ham Raise (bodyweight) · Nordic Curl (bodyweight) · Leg Curl (band) |
| Glutes | Hip Abduction (machine) · Glute Kickback (cable) · Hip Abduction (band) · Glute Bridge (bodyweight) |
| Adductors | Hip Adduction (machine) · Hip Adduction (cable) · Side Lunge (DB) |
| Calves | Calf Raise (standing) (Smith) · Calf Raise (standing) (machine) · Calf Raise (seated) (machine) · Calf Raise (standing) (DB) · Calf Raise (standing) (bodyweight) |
| Bench press | Bench Press · Bench Press (DB) · Bench Press (machine) · Push Up (bodyweight) |
| Chest press | Bench Press (machine) · Bench Press (DB) · Bench Press (Smith) · Larsen Press · Push Up (bodyweight) |
| Incline press | Incline Bench Press (DB) · Incline Bench Press · Incline Bench Press (machine) · Incline Push Up (bodyweight) |
| Close-grip press | Close Grip Bench Press · Pin Press · Larsen Press · Triceps Dip (bodyweight) |
| Overhead press | Overhead Press · Overhead Press (DB) · Overhead Press (machine) · Arnold Press (DB) |
| Machine shoulder press | Overhead Press (Smith) · Overhead Press (machine) · Overhead Press (DB) · Arnold Press (DB) |
| Chest fly | Chest Fly (cable) · Pec Deck (machine) · Chest Fly (DB) · Push Up (bodyweight) |
| Lateral raise | Lateral Raise (cable) · Lateral Raise (DB) · Lateral Raise (machine) · Lateral Raise (band) |
| Rear delts | Face Pull (cable) · Rear Delt Fly (machine) · Rear Delt Fly (DB) · Face Pull (band) |
| Triceps | Triceps Pushdown (cable) · Skull Crusher · Triceps Dip (bodyweight) · Triceps Pushdown (band) |
| Overhead triceps | Overhead Triceps Extension (cable) · Overhead Triceps Extension (DB) · Skull Crusher (DB) · Overhead Triceps Extension (band) |
| Row | Seated Row (cable) · Chest Supported Row (machine) · Bent Over Row · Single Arm Row (DB) · Inverted Row (bodyweight) |
| Pulldown / pull-up | Lat Pulldown (cable) · Pull Up (bodyweight) · Chin Up (bodyweight) · Pull Up (band) |
| Shrug | Shrug · Shrug (Smith) · Shrug (trap bar) · Shrug (DB) |
| Biceps | Biceps Curl (DB) · Biceps Curl (cable) · Preacher Curl (machine) · Biceps Curl · Biceps Curl (band) |
| Hammer curl | Hammer Curl (DB) · Hammer Curl (cable) · Reverse Curl · Hammer Curl (band) |
| Abs | Crunch (cable) · Hanging Knee Raise (bodyweight) · Ab Wheel Rollout (bodyweight) · Plank (bodyweight) |
| Obliques | Side Bend (DB) · Woodchopper (cable) · Pallof Press (cable) · Side Plank (bodyweight) |
| Carry event | Farmers Carry · Yoke Carry · Sandbag Carry · Farmers Carry (DB) |
| Loading event | Atlas Stone · Sandbag Load · Keg Load |
| Press event | Log Press · Overhead Press (axle) · Push Press · Push Press (DB) |
