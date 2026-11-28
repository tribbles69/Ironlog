# Master Exercise Catalogue: Base Exercises, Variations and Equipment Across All Training Disciplines

No single list can include "every exercise there is". The workable approach is a catalogue of roughly 400 base exercises grouped by movement pattern. Each base exercise is multiplied by a small, controlled set of modifiers (implement, grip, stance, range of motion, tempo, pause, laterality and added resistance), and that combination generates the several thousand named variations used in gyms, federations and training apps. This report gives that catalogue in a consistent structure: base exercise → variations → typical equipment → primary muscles/pattern. Synonyms are merged into one canonical entry, so the list can go straight into a training-log database.

## TL;DR

- **Build on base exercises plus modifiers, not a flat list.** ExRx.net, the main reference exercise library, organises by muscle and then by equipment class: barbell, cable, dumbbell, "Lever (plate loaded)", "Lever (selectorized)", sled, Smith, suspended, band-assisted, body weight and so on. Open datasets such as yuhonas/free-exercise-db (Unlicense; self-described "800+ exercises", with 876 entries in its dist/exercises.json per an October 2026 count by AIFitnessAPI) store each entry with fields for force, level, mechanic, equipment, primary/secondary muscles and category. Copy that schema, and treat a variation as a modifier attached to a parent exercise, not a separate entry.
- **Sport rulebooks fix the "anchor" exercises.** The IPF recognises the squat, bench press and deadlift, contested in that order. The IWF recognises the snatch and the clean & jerk, "executed with two hands" with a maximum of three attempts each. [powerlifting](https://www.powerlifting.sport/fileadmin/ipf/data/rules/technical-rules/english/IPF_Technical_Rules_Book_2016__1_.pdf) Strongman has no single rulebook, but a stable set of events recurs: log, axle, Viking press, yoke, farmer's walk, frame carry, Atlas stones, keg toss, Húsafell stone, Conan's wheel, vehicle pull, tyre flip, sandbag, power stairs, Hercules hold and duck walk. [Wikipedia](https://en.wikipedia.org/wiki/Strongman_%28strength_athlete%29)
- **Most "different" exercises are really naming duplicates.** Merge these under one canonical ID: skull crusher and lying triceps extension; Romanian deadlift (RDL) and its cousin the stiff-leg deadlift; inverted row, Australian row and bodyweight row; and air squat, bodyweight squat and squat. Keep three things genuinely separate: RDL versus stiff-leg deadlift (different start and knee angle), power versus squat (full) catches, and the hang versus block start positions.

## Key Findings

1. **The best organising axis is movement pattern, with muscle as a secondary tag.** Pattern families: squat, hinge, lunge/single-leg, horizontal push, vertical push, horizontal pull, vertical pull, carry, Olympic/ballistic, strongman, core (anti-extension, anti-rotation, anti-lateral-flexion, flexion, rotation), isolation, plyometric, conditioning, mobility, rehab. Muscle-based libraries such as ExRx file the same lift under several muscles (the barbell squat appears under quadriceps and gluteus maximus). [exrx](https://exrx.net/Lists/ExList/ThighWt) That is fine for browsing but produces duplicates in a database.
2. **Equipment is a variation, not a new exercise.** A "row" exists as barbell, dumbbell, cable, machine (plate-loaded and selectorised), Smith, landmine/T-bar, band, suspension and bodyweight versions. ExRx's own taxonomy shows this: the same base movement is listed under up to ten equipment headings.
3. **There are about eight variation types, and they combine.** Implement; grip (width, orientation, thickness); stance (width, foot position, split); range of motion (deficit, block/rack/pin, partial, box, floor); tempo (eccentric emphasis, slow, explosive); pause (bottom, mid-range, "halting"); laterality (bilateral, unilateral, alternating, isolateral machine); and accommodating resistance (bands, chains, reverse bands). Westside/conjugate programming, in which, as Westside Barbell's Louie Simmons put it, "the lifter switches a barbell exercise, always working up to a max single… we switch the core lift each week", is built almost entirely from these modifiers on three parent lifts.
4. **Some disciplines have codified progressions instead of variations.** For gymnastics strength and calisthenics skills, the variation *is* the progression. Front lever: tuck → advanced tuck → single-leg → straddle → half-lay → full. [Wikipedia](https://en.wikipedia.org/wiki/Front_lever) Planche: frog stand → tuck → advanced tuck → straddle → full. [Wikipedia](https://en.wikipedia.org/wiki/Planche_%28exercise%29) Store these as ordered levels.
5. **Conditioning, plyometrics and mobility need different logging fields.** These are logged by time, distance, calories, contacts or holds, not load × reps. Plyometric drills are commonly classified by direction (vertical, horizontal, lateral) and intensity, from low (ankle hops, jump rope) to high (depth jumps, bounding). [ptpioneer](https://www.ptpioneer.com/personal-training/certifications/study/plyometric-training/) [strengthandconditioningeducation](https://strengthandconditioningeducation.com/wp-content/uploads/2022/08/Plyometrics.pdf)

## Recommended Database Schema

Each record needs: `canonical_name`, `aliases[]`, `parent_exercise` (null for base exercises), `pattern`, `primary_muscles[]`, `secondary_muscles[]`, `equipment[]`, `modifiers{grip, stance, rom, tempo, pause, laterality, accommodating_resistance}`, `mechanic` (compound/isolation), `force` (push/pull/static/carry), `discipline_tags[]` (powerlifting, weightlifting, strongman, calisthenics, CrossFit, rehab), `log_type` (load×reps, reps, time, distance, calories, height, contacts, hold) and `level`.

**Equipment codes used below:** BB barbell · DB dumbbell · KB kettlebell · CB cable · MS machine, selectorised · MP machine, plate-loaded/lever · SM Smith machine · LM landmine · TB trap/hex bar · SSB safety squat bar · CAM cambered bar · EZ EZ-curl bar · AX axle/thick bar · SB sandbag · MB medicine ball · BD resistance band · SUS suspension trainer/rings · PB pull-up bar · PAR parallettes/dip bars · BX box/bench · BW bodyweight (no equipment) · SL sled/prowler · GHD glute-ham developer · RH reverse hyper · BS belt squat machine.

**Universal modifiers (apply to almost any strength exercise):** paused (1–3 s, specify position) · tempo (e.g. 3-1-1-0) · eccentric-only/negative · partial/top-half/bottom-half · 1¼ or 1½ reps · isometric hold · against bands · against chains · reverse-band · single-arm/single-leg · alternating · isolateral (machine) · deficit · from blocks/pins · banded/assisted.

---

## 1. Squat Pattern (knee- and hip-dominant, bilateral)

| Base exercise | Variations | Typical equipment | Primary muscles / pattern |
|---|---|---|---|
| **Back squat** | High-bar, low-bar, competition (IPF depth: hip crease below top of knee), pause, pin/Anderson (from pins), box squat (high/parallel/low box), tempo, half/quarter, 1¼, wide/narrow stance, heels-elevated, against bands/chains, reverse-band, Kabuki/Buffalo bar | BB, SSB, CAM, SM, rack | Quads, glutes, adductors; squat |
| **Front squat** | Clean-grip, cross-arm (bodybuilder), strap-grip, pause, box, tempo, heels-elevated; double-KB and DB front squat | BB, KB, DB, SM | Quads, glutes, upper back; squat |
| **Safety squat bar squat** | Standard, box, pause, hands-free, Hatfield (hands on rack), against bands | SSB | Quads, glutes, upper back |
| **Overhead squat** | Snatch-grip, pause, behind-neck press-in, single-arm (DB/KB) | BB, DB, KB, PVC | Quads, glutes, shoulders, trunk |
| **Zercher squat** | From floor, from rack, box | BB | Quads, glutes, upper back, biceps |
| **Goblet squat** | Heels-elevated, pause, cyclist (narrow, heels up), 1½ | DB, KB | Quads, glutes |
| **Bodyweight squat** (= air squat) | Prisoner, jump (see plyos), Hindu squat, wall sit (isometric), sumo | BW | Quads, glutes |
| **Sumo/plié squat** | DB, KB, BB, landmine | DB, KB, LM | Adductors, glutes, quads |
| **Hack squat** | Machine hack (sled), reverse hack, barbell (behind-legs) hack squat, pendulum squat | MP, BB | Quads |
| **Leg press** | 45°, horizontal/seated, vertical, lying, single-leg, feet high/low/wide/narrow | MP, MS | Quads, glutes |
| **Belt squat** | Standard, marching/walking, pause | BS, dip belt | Quads, glutes (no spinal load) |
| **Smith squat** | Feet-forward, front, box | SM | Quads, glutes |
| **Landmine squat** | Goblet-style, split | LM | Quads, glutes |
| **V-squat / pendulum / power squat machine** | Standard, partials | MP | Quads, glutes |
| **Sissy squat** | Bodyweight, sissy-bench, weighted | BW, sissy bench | Quads (rectus femoris) |
| **Spanish squat** | Isometric, dynamic | BD (heavy loop) | Quads; patellar-tendon rehab |
| **Cossack squat** | Bodyweight, goblet, BB | BW, KB, DB | Adductors, quads; lateral squat |
| **Jefferson squat** (straddle) | BB between legs | BB | Quads, glutes, adductors |
| **Thruster** (squat + press) | BB, DB, KB, wall-ball (see CrossFit) | BB, DB, KB | Squat + vertical push |

## 2. Hinge Pattern (hip-dominant)

| Base exercise | Variations | Typical equipment | Primary muscles / pattern |
|---|---|---|---|
| **Conventional deadlift** | Competition, pause (below knee), deficit (1–4"), block/rack pull (below/above knee), halting, tempo, against bands/chains, reverse-band, double-overhand, mixed, hook, snatch-grip, clean-grip, "touch-and-go" vs dead-stop | BB, AX, rack, blocks | Glutes, hamstrings, spinal erectors, lats, grip |
| **Sumo deadlift** | Competition, pause, deficit, block, wide/narrow sumo, against bands | BB | Glutes, adductors, quads, erectors |
| **Trap/hex bar deadlift** | High handles, low handles, deficit, jump (see plyos) | TB | Quads, glutes, erectors |
| **Romanian deadlift (RDL)** | BB, DB, KB, single-leg, B-stance (kickstand), deficit, snatch-grip, pause | BB, DB, KB, CB | Hamstrings, glutes; top-down hinge |
| **Stiff-leg deadlift** (SLDL) | From floor, deficit, DB | BB, DB | Hamstrings, glutes, erectors; floor-start, near-locked knees |
| **Single-leg RDL** | Unsupported, kickstand, landmine, cable, contralateral/ipsilateral load | DB, KB, LM, CB | Hamstrings, glutes, hip stability |
| **Good morning** | Standing, seated, bent-knee, Zercher, SSB, CAM ("giant cambered bar"), banded | BB, SSB, CAM, BD | Hamstrings, erectors |
| **Hip thrust** | BB, Smith, machine, single-leg, B-stance, banded, KB, paused | BB, SM, MP, BX, BD | Glutes |
| **Glute bridge** | Floor, single-leg, BB, banded, isometric hold, feet-elevated | BW, BB, BD | Glutes, hamstrings |
| **Kettlebell swing** | Russian (to chest), American (overhead), single-arm, double, hand-to-hand | KB | Glutes, hamstrings; ballistic hinge |
| **Cable pull-through** | Rope, band | CB, BD | Glutes, hamstrings |
| **Back extension / hyperextension** | 45°, 90°/horizontal, glute-biased (rounded upper back), weighted, single-leg, banded | Roman chair, GHD | Erectors, glutes, hamstrings |
| **Reverse hyperextension** | Strap, roller, bench-top version | RH, bench | Glutes, hamstrings, erectors |
| **Jefferson curl** | Bodyweight, light load (loaded spinal flexion) | BB, KB | Spinal flexion mobility |
| **Rack/block pull** | Pin heights 1–5, from blocks, axle | BB, AX | Lockout: glutes, erectors, traps |
| **Snatch-grip deadlift** | From floor, deficit | BB | Upper back, glutes, hamstrings |

**RDL vs stiff-leg deadlift (reconciled):** treat these as two separate canonical exercises. The RDL starts from the standing hip position ("works from the top down"). [thatfitfriend](https://thatfitfriend.com/stiff-leg-deadlift-vs-romanian-deadlift/) The bar is lowered only as far as hamstring flexibility allows, typically to about mid-shin. Coratella et al. (2022) describe the RDL as "performed with the knees slightly flexed", whereas the stiff-leg deadlift is performed "with the knees extended", and the stiff-leg deadlift starts each rep from the floor. Many gyms and apps use "stiff-leg" and "straight-leg deadlift" (ExRx's term) interchangeably, so log those two as aliases of each other, not of the RDL.

## 3. Lunge / Single-Leg Pattern

| Base exercise | Variations | Typical equipment | Primary muscles / pattern |
|---|---|---|---|
| **Forward lunge** | Stationary, walking, alternating, deficit | BW, DB, KB, BB, SB | Quads, glutes |
| **Reverse lunge** | Deficit, front-rack, overhead, landmine, Smith, cable | DB, BB, KB, LM, SM, CB | Glutes, quads |
| **Lateral lunge** (= side lunge) | Goblet, slide-board, Cossack (see squat) | DB, KB, slider | Adductors, glutes |
| **Curtsy lunge** | DB, BW | DB, BW | Glute medius, quads |
| **Split squat** | Static, front-foot elevated, rear-foot elevated (= Bulgarian split squat), Smith, safety-bar, landmine | BW, DB, BB, SSB, SM, LM | Quads, glutes |
| **Step-up** | Front, lateral, crossover, high-box, step-down (eccentric), Petersen step-up | BX, DB, BB, KB | Quads, glutes |
| **Pistol squat** (single-leg squat) | Box, assisted (TRX/pole), counter-weighted, elevated, shrimp squat, dragon squat | BW, KB, SUS | Quads, glutes, balance |
| **Skater squat** | Bodyweight, weighted | BW, DB | Quads, glutes |
| **Single-leg leg press** | — | MP | Quads, glutes |
| **Sled drag (backward)** | Backward walk, lateral | SL | Quads (knee-friendly) |

## 4. Horizontal Push

| Base exercise | Variations | Typical equipment | Primary muscles / pattern |
|---|---|---|---|
| **Bench press** | Competition (pause on chest, "press" command), touch-and-go, wide/medium/close grip, Larsen (feet up), spoto (pause 1" above chest), pin press, board press (1–5 boards), floor press, long-pause, tempo, against bands/chains, reverse-band, Slingshot, feet-up, Swiss/multi-grip bar, football bar, cambered bar, axle, bamboo bar | BB, multi-grip bar, AX, SM, boards | Pecs, anterior delts, triceps |
| **Incline bench press** | 15–45°, BB, DB, Smith, machine | BB, DB, SM, MP | Upper pecs, front delts |
| **Decline bench press** | BB, DB, Smith, machine | BB, DB, SM, MP | Lower pecs |
| **Dumbbell bench press** | Flat, incline, decline, neutral grip, single-arm, alternating, squeeze press | DB | Pecs, triceps |
| **Close-grip bench press** | BB, Smith, machine, JM press (hybrid) | BB, SM | Triceps, pecs |
| **Floor press** | BB, DB, KB, Swiss bar | BB, DB, KB | Lockout, triceps |
| **Chest press (machine)** | Seated, incline, decline, isolateral, standing cable | MS, MP, CB | Pecs |
| **Landmine press** | Half-kneeling, standing, single-arm, two-arm | LM | Upper pecs, front delts, serratus |
| **Push-up** | Standard, knee, incline, decline, wide, close/diamond, archer, pseudo-planche, ring, deficit (on parallettes), weighted (vest/plate), banded, clap/plyometric, Hindu, one-arm, Spiderman, hand-release | BW, PAR, SUS, vest, BD | Pecs, triceps, serratus, core |
| **Dip** (chest-biased) | Bar, ring, weighted, assisted (machine/band), Korean dip, straight-bar dip | PAR, SUS, dip belt, MS | Lower pecs, triceps |
| **Svend press / plate press** | Plate squeeze | Plate | Pecs (isometric adduction) |

## 5. Vertical Push

| Base exercise | Variations | Typical equipment | Primary muscles / pattern |
|---|---|---|---|
| **Overhead press** (= military press, strict press, shoulder press) | Standing, seated, behind-neck, pin/rack, Z-press (seated on floor), tempo, pause, against bands, axle, log | BB, AX, SM, MS | Delts, triceps, upper chest, trunk |
| **Push press** | BB, DB, KB, behind-neck, log, axle | BB, DB, KB | Delts, triceps + leg drive |
| **Jerk** (see §8) | Push, power, split, squat | BB | Ballistic vertical push |
| **Dumbbell shoulder press** | Seated, standing, neutral, single-arm, alternating, Arnold press | DB | Delts, triceps |
| **Kettlebell press** | Single, double, bottoms-up, see-saw, half-kneeling | KB | Delts, triceps, stabilisers |
| **Machine shoulder press** | Selectorised, plate-loaded, reclined, Viking-style lever, Smith | MS, MP, SM | Delts |
| **Handstand push-up** | Wall (chest/back to wall), freestanding, deficit, kipping, strict, parallette, pike push-up (scaled), elevated pike | BW, PAR | Delts, triceps |
| **Bradford press / Cuban press** | BB, DB | BB, DB | Delts, rotator cuff |
| **Bottoms-up press** | — | KB | Delts, grip, cuff stability |

## 6. Horizontal Pull (rows)

| Base exercise | Variations | Typical equipment | Primary muscles / pattern |
|---|---|---|---|
| **Barbell bent-over row** | Overhand, underhand (Yates row), Pendlay (from floor, dead-stop), seal row (chest-supported on bench), Kroc-style, pause | BB | Lats, mid-traps, rhomboids, rear delts |
| **Dumbbell row** | One-arm (bench-supported), Kroc row (high-rep, heavy), chest-supported incline, Helms row, tripod | DB | Lats, mid back |
| **T-bar row** | Landmine (V-handle), chest-supported machine, Meadows row (one-arm landmine) | LM, MP | Mid back, lats |
| **Seated cable row** | V-handle, wide bar, rope, single-arm, Kayak row | CB | Mid back, lats |
| **Machine row** | Chest-supported, high row, low row, isolateral | MS, MP | Mid back, lats |
| **Inverted row** (= Australian row, bodyweight row, ring row, TRX row) | Bar, rings, suspension, feet-elevated, weighted, underhand | PB/SM bar, SUS | Mid back, lats, biceps |
| **Kettlebell row** | Gorilla row, renegade row (from push-up position) | KB, DB | Back, core |
| **Face pull** (see rehab) | Rope, band, high/low anchor | CB, BD | Rear delts, external rotators |
| **Band row** | — | BD | Back |

## 7. Vertical Pull

| Base exercise | Variations | Typical equipment | Primary muscles / pattern |
|---|---|---|---|
| **Pull-up** (pronated) | Wide, shoulder-width, close, weighted (belt/vest/DB), band-assisted, machine-assisted, negative, L-sit, archer, typewriter, commando, towel, fat-grip, kipping, butterfly, chest-to-bar, one-arm progression | PB, dip belt, BD, MS (assisted) | Lats, biceps, mid back |
| **Chin-up** (supinated) | Close, weighted, assisted, negative | PB | Lats, biceps |
| **Neutral-grip pull-up** | Parallel bars, rings | PB, SUS | Lats, brachialis |
| **Lat pulldown** | Wide, close, V-handle, neutral, underhand, single-arm, behind-neck, kneeling, half-kneeling | CB, MS, MP | Lats, biceps |
| **Straight-arm pulldown** (= pullover, cable) | Rope, bar, single-arm | CB, BD | Lats, teres major |
| **Pullover** | DB, BB, machine (Nautilus) | DB, BB, MS | Lats, pecs |
| **Rope climb** | Legless, J-hook/S-wrap footlock, L-sit | Rope | Lats, biceps, grip |
| **Muscle-up** (see §13) | Bar, ring | PB, SUS | Pull + transition + dip |

## 8. Olympic Weightlifting and Derivatives

The IWF contests two lifts, **the snatch** and **the clean & jerk**. In the snatch the bar is "pulled in a single movement from the platform to the full extent of both arms above the head, while either splitting or bending the legs". In the clean & jerk, the clean is "most commonly performed with a squat clean and a split jerk". [squarespace](https://static1.squarespace.com/static/685dc165bd03a315d8339c73/t/68f8f945f97bfe18769f7c0d/1761147205709/IWF-TCRR-2025-as-of-01-June-2025.pdf) [Wikipedia](https://en.wikipedia.org/wiki/Clean_and_jerk)

| Base exercise | Variations | Typical equipment | Primary muscles / pattern |
|---|---|---|---|
| **Snatch** | Full/squat, power (caught above parallel), split, muscle, hang (high-hang/hip, mid-thigh, knee, below-knee), block (above/below knee), no-feet, no-contact, tall, drop snatch, pause, deficit, from riser | BB, bumper plates, blocks | Full body; triple extension |
| **Clean** | Squat, power, split, muscle, hang (positions as above), block, no-feet, pause, tall clean; DB, KB and MB clean | BB, DB, KB, MB, blocks | Full body |
| **Jerk** | Split, power, push, squat, behind-neck, from blocks/rack, jerk dip squat, jerk drive, pause-in-dip | BB, jerk blocks | Legs + delts/triceps |
| **Clean & jerk** | Power clean & jerk, clean + 2 jerks, etc. | BB | Full body |
| **Snatch/clean pull** | From floor, hang, block, deficit, halting (pause at knee/hip), segment/3-position, high-pull (with arm bend) | BB | Posterior chain, traps |
| **Snatch/clean deadlift** | Halting, slow eccentric, pause at knee | BB | Pulling posture |
| **Snatch balance** | Heaving, drop snatch, press-in snatch balance | BB | Receiving position |
| **Sots press** | BB (pressing from bottom of overhead squat) | BB | Overhead mobility/stability |
| **Snatch-grip push press / press** | Behind-neck | BB | Overhead strength |
| **Clean/snatch complexes** | e.g. Pull + Lift; Power + Hang Lift; Power Jerk + Jerk; Clean + Front Squat | BB | Logged as complex (e.g. 1+1+1) |
| **Muscle snatch / muscle clean** | — | BB | Turnover strength |

Catalyst Athletics' Greg Everett lists simple complexes such as "Snatch/Clean Pull + Snatch/Clean", "Power Jerk + Jerk" and "Power Snatch/Clean + Hang Snatch/Clean". [catalystathletics](https://www.catalystathletics.com/article/2045/Weightlifting-Complexes-Getting-Started-with-the-Basics/) Your app should support **complexes as an ordered list of exercise IDs with a rep scheme**, not as new exercises.

**Kettlebell sport/ballistics (related):** KB clean, KB snatch, long cycle (clean & jerk), KB jerk, KB high pull, double-KB variations.

## 9. Strongman Events and Implements

Strongman has no single international rulebook. The descriptions below come from the Strongman Champions League (SCL) rules and from contest-specific rules of US federations (USS, Strongman Corporation, Official Strongman Games).

| Base exercise | Variations | Typical equipment | Primary muscles / pattern |
|---|---|---|---|
| **Log press** (= log lift, log clean & press) | Max, for reps, clean once and press for reps, from pads/rack, log ladder; press style strict, push press, push/split jerk; continental/belt clean | Log (typically 10–14" diameter, neutral handles) | Delts, triceps, legs; clean + vertical push |
| **Axle press** (= fixed/rolling axle clean & press) | Continental clean, strict, push press, jerk, for reps | AX (≈2" thick bar), fixed or spinning | Delts, triceps, grip |
| **Axle deadlift** | Standard height, from 18" (Hummer tyre style), for reps; figure-8 straps sometimes allowed | AX, wagon wheels | Posterior chain, grip |
| **Viking press** | For reps, strict vs push press, single-arm (landmine "Viking" on rack) | Viking press lever arm (neutral handles, athlete faces away from pivot) | Delts, triceps |
| **Circus dumbbell** | One-arm clean & press, for reps; 2" or 2.5" handle | Circus DB | Delts, triceps, trunk |
| **Strongman deadlift** | Car deadlift, Hummer-tyre deadlift (18"), silver dollar (≈18"), elephant bar (long whippy bar), deadlift hold (for time), max, for reps | Car-DL frame, elephant bar, AX, wagon wheels | Posterior chain |
| **Yoke carry** (= super yoke) | Race, carry-and-drag, yoke + medley, "bale tote" | Yoke (crossbar + uprights) | Whole body; loaded carry |
| **Farmer's walk** | Handles, frame carry (single frame held in both hands), with turn, for distance/time | Farmer's handles, frame | Grip, traps, trunk |
| **Frame carry** (= timber carry when on ramp) | Flat, incline/ramp | Frame | Grip, trunk |
| **Atlas stones** | Load to platform (series of usually 5), stone over bar (for reps), stone to shoulder, natural stones, tacky vs no tacky | Concrete stones, platforms, stone over bar | Posterior chain, biceps, lap-and-load |
| **Keg toss** | Over bar (a 4.42 m wall per the official World's Strongest Man site, kegs "ranging in weight from 15kg to 24kg"; heights vary by year, e.g. 4.9 m in the 2014 final), for height, kegs in increasing weight | Kegs | Hip extension, triple extension |
| **Keg carry / keg load** | Bear-hug carry, load to platform | Kegs | Trunk, upper back |
| **Sandbag** | Carry (bear hug, shoulder), load over bar, to platform, to shoulder, toss over bar, sandbag steeplechase | SB | Trunk, posterior chain |
| **Húsafell stone carry** | Carried "high on the chest for a set distance"; for distance [strongmancl](https://strongmancl.com/rules/) | Húsafell stone/replica | Trunk, upper back, legs |
| **Conan's wheel** | For distance/degrees, Zercher-held arm | Conan's wheel | Trunk, legs, Zercher hold |
| **Vehicle pull** (truck, plane, tram) | Harness + rope (hand-over-hand assist), arm-over-arm (seated or standing), harness only | Harness, rope, vehicle | Legs, back, grip |
| **Sled pull/drag** | Forward, backward, harness, rope | SL | Legs, conditioning |
| **Tyre flip** | For reps, for distance, max weight | Tractor tyre | Posterior chain, triple extension |
| **Power stairs** | "minimum three implements" lifted step by step [strongmancl](https://strongmancl.com/rules/) | Power stair implements | Hip extension |
| **Hercules hold** (pillars) | For time, car hold | Pillars, chains | Grip, traps, lats |
| **Front hold** (= shield/sword hold) | "Weights held straight out in front" for time [strongmancl](https://strongmancl.com/rules/) | Shield, sword, plates | Anterior delts |
| **Duck walk** | Implement "suspended between the legs, over a set course" [Wikipedia](https://en.wikipedia.org/wiki/World's_Strongest_Man) | Duck-walk implement | Legs, grip |
| **Weight over bar** | 56 lb / 25 kg, one hand | Weight-over-bar weight | Ballistic hinge |
| **Dinnie stones / Inch dumbbell / Rolling Thunder** (odd lifts) | Lift, hold, carry | Historic stones, thick-handle DB (Inch: 2⅜" handle) | Grip, posterior chain |

## 10. Loaded Carries (non-competition)

| Base exercise | Variations | Typical equipment | Primary muscles / pattern |
|---|---|---|---|
| **Farmer's carry** | DB, KB, trap bar, single-arm (suitcase carry), fat-grip | DB, KB, TB | Grip, traps, trunk |
| **Suitcase carry** | Single-arm, march | DB, KB | Anti-lateral flexion |
| **Front-rack carry** | Double KB, BB | KB, BB | Trunk |
| **Overhead carry / waiter's walk** | Single-arm, double, bottoms-up | KB, DB, plate | Shoulder stability |
| **Bear-hug / Zercher carry** | Sandbag, stone, keg, BB Zercher | SB, BB | Trunk, upper back |
| **Mixed/offset carry** | Rack + overhead, rack + suitcase | KB | Trunk |

## 11. Isolation Exercises by Muscle Group

### Chest
| Base | Variations | Equipment |
|---|---|---|
| **Fly** | Flat, incline, decline, DB, cable (high-to-low, low-to-high, mid), single-arm, pec deck/machine fly, ring/suspension fly | DB, CB, MS, SUS |
| **Cable crossover** | Standing, lying, kneeling | CB |
| **Pec deck** | Fly-arm, pad-arm | MS |

### Shoulders
| Base | Variations | Equipment |
|---|---|---|
| **Lateral raise** | DB, cable (behind/in front of body), machine, lean-away, seated, partials, Y-raise, side-lying | DB, CB, MS, BD |
| **Front raise** | DB, BB, plate, cable, alternating | DB, BB, CB |
| **Rear-delt fly** (= reverse fly) | Bent-over DB, incline chest-supported, reverse pec deck, cable crossover reverse fly, band pull-apart | DB, MS, CB, BD |
| **Rear-delt row** | BB, DB, cable | BB, DB, CB |
| **Upright row** | BB, EZ, cable, DB, Smith | BB, EZ, CB, DB, SM |
| **Shrug** (traps) | BB, DB, trap bar, Smith, machine, cable, behind-back, overhead shrug | BB, DB, TB, SM, MS |
| **Y-T-W-I raises** | Prone bench, incline, floor | DB, plate, BW |

### Triceps
| Base | Variations | Equipment |
|---|---|---|
| **Lying triceps extension** (= skull crusher, French press when lying) | BB, EZ, DB, cable, decline, to forehead/behind head, JM press | EZ, BB, DB, CB |
| **Overhead triceps extension** (= French press seated/standing) | Single-arm DB, two-hand DB, EZ, cable rope, machine | DB, EZ, CB, MS |
| **Pushdown** | Rope, straight bar, V-bar, single-arm, reverse-grip, band | CB, BD |
| **Kickback** | DB, cable | DB, CB |
| **Bench dip** | Feet on floor/elevated, weighted | BX, BW |
| **Tate press** | DB | DB |

### Biceps / elbow flexors
| Base | Variations | Equipment |
|---|---|---|
| **Biceps curl** | BB, EZ, DB (alternating, simultaneous), cable, band, machine, 21s, drag curl, Bayesian (cable behind body), spider curl, incline DB, cheat curl | BB, EZ, DB, CB, MS, BD |
| **Preacher curl** (= Scott curl) | EZ, DB, machine, cable | EZ, DB, MS |
| **Hammer curl** | DB, rope cable, cross-body, neutral-grip bar | DB, CB |
| **Reverse curl** | EZ, BB, cable | EZ, BB |
| **Concentration curl** | DB, cable | DB |
| **Zottman curl** | DB | DB |

### Forearms (see also §17 Grip)
Wrist curl, reverse wrist curl, behind-the-back wrist curl, radial/ulnar deviation (leverage bar/sledgehammer), pronation/supination (leverage bar/DB), wrist roller. Equipment: BB, DB, CB, sledgehammer, wrist roller.

### Quadriceps
| Base | Variations | Equipment |
|---|---|---|
| **Leg extension** | Bilateral, single-leg, partials, pause, tibia-rotated | MS, MP, ankle weight, BD |
| **Reverse Nordic** | Bodyweight, band-assisted, machine-assisted | BW, BD |
| **Terminal knee extension (TKE)** | Band, cable | BD, CB |

### Hamstrings
| Base | Variations | Equipment |
|---|---|---|
| **Leg curl** | Lying, seated, standing single-leg, kneeling, cable, DB lying, band | MS, MP, CB, DB, BD |
| **Nordic hamstring curl** (= Nordic curl, inverse leg curl) | Bodyweight, band-assisted, machine-assisted, partner-held | BW, partner, Nordic bench |
| **Glute-ham raise (GHR)** | Bodyweight, weighted, banded | GHD |
| **Sliding/stability-ball leg curl** | Bilateral, single-leg, straight-hip | Slider, Swiss ball, SUS |

### Glutes and hip (abductors, external rotators)
| Base | Variations | Equipment |
|---|---|---|
| **Hip abduction** | Seated machine, standing cable, side-lying, banded clamshell, side-lying leg raise | MS, CB, BD, BW |
| **Glute kickback** | Cable, machine, band, quadruped donkey kick | CB, MS, BD |
| **Frog pump** | BW, DB | BW, DB |
| **Fire hydrant / clamshell** | Banded | BD, BW |
| **Lateral band walk / monster walk** | Above knee, ankle, foot | BD |

### Adductors
| Base | Variations | Equipment |
|---|---|---|
| **Hip adduction** | Seated machine, cable, side-lying | MS, CB |
| **Copenhagen plank / adduction** | Short-lever (knee), long-lever (ankle), dynamic | Bench, BW |
| **Adductor squeeze** | Ball, isometric | Ball |

### Calves and lower leg
| Base | Variations | Equipment |
|---|---|---|
| **Standing calf raise** | Machine, Smith, BB, DB single-leg, step, donkey calf raise, leg-press calf press | MS, SM, BB, DB, MP |
| **Seated calf raise** | Machine, DB on knee | MS, MP |
| **Tibialis raise** | Wall, tib bar, banded dorsiflexion | BW, tib bar, BD |

## 12. Core

| Category | Base exercises (variations) | Equipment |
|---|---|---|
| **Anti-extension** | Front plank (forearm, high, RKC, weighted, long-lever, shoulder taps); ab wheel rollout (kneeling, standing, banded); barbell rollout; body saw; stability-ball rollout/stir-the-pot; hollow-body hold/rock; dead bug (banded, weighted) | BW, ab wheel, BB, Swiss ball, slider |
| **Anti-rotation** | Pallof press (half-kneeling, tall-kneeling, standing, with overhead reach, iso hold); bird dog; renegade row; landmine anti-rotation | CB, BD, LM, DB |
| **Anti-lateral flexion** | Side plank (knee, straight, star, Copenhagen, with hip dip); suitcase carry; suitcase deadlift | BW, KB, DB |
| **Spinal flexion** | Crunch (floor, cable kneeling, machine, decline, reverse crunch); sit-up (GHD, decline, weighted, butterfly, V-up, jack-knife); toes-to-bar; hanging knee/leg raise; captain's-chair leg raise; dragon flag | BW, CB, MS, GHD, PB, decline bench |
| **Rotation / lateral flexion** | Russian twist; cable/band woodchop (high-low, low-high, horizontal); landmine rotation (= power twist); side bend (DB, cable, 45° back-extension side bend); windmill (KB); oblique crunch; MB rotational throw (see plyo) | CB, LM, DB, KB, MB |
| **Hip flexion** | Hanging leg raise, L-sit, psoas march (banded), cable/ankle-weight hip flexion, seated knee tuck | PB, PAR, BD, CB |
| **Integrated** | Turkish get-up (full, half, reverse, double-KB); bear crawl; mountain climber; GHD sit-up; plate/MB slams | KB, BW, GHD, MB |

## 13. Bodyweight / Calisthenics and Gymnastics Strength

| Base exercise | Variations / progressions | Typical equipment | Primary muscles / pattern |
|---|---|---|---|
| **Front lever** | Tuck → advanced tuck → single-leg → straddle → half-lay → full; front lever raises, front lever pull-ups/rows, ice-cream makers | PB, SUS | Lats, core; straight-arm pull | [Wikipedia](https://en.wikipedia.org/wiki/Front_lever) [superhumanstrength](https://superhumanstrength.org/en/blog/hardest-calisthenics-moves/) [titans-grip](https://www.titans-grip.com/tools/skill-progression/)
| **Back lever** | Skin-the-cat, German hang → tuck → advanced tuck → straddle → full | PB, SUS | Lats, biceps, pecs | [titans-grip](https://www.titans-grip.com/tools/skill-progression/)
| **Planche** | Planche lean → frog stand → tuck → advanced tuck → straddle → full; planche push-ups | BW, PAR, SUS | Delts, chest; straight-arm push |
| **Human flag** | Vertical flag → tuck → straddle → full | Vertical pole/stall bar | Lats, obliques, shoulders | [superhumanstrength](https://superhumanstrength.org/en/blog/hardest-calisthenics-moves/) [titans-grip](https://www.titans-grip.com/tools/skill-progression/)
| **Muscle-up** | Bar, ring, strict, kipping, chest-to-bar transition drills, band-assisted, weighted | PB, SUS, BD | Pull + transition + dip |
| **Handstand** | Wall (chest/back to wall), freestanding, tuck, straddle, one-arm, press to handstand (straddle, pike, tuck) | BW, PAR | Shoulders, balance |
| **L-sit / V-sit / manna** | Floor, parallettes, rings, tuck L-sit, straddle L-sit | PAR, SUS | Hip flexors, triceps, abs |
| **Ring strength** | Support hold (RTO), ring dip, ring push-up, iron cross (and band-assisted), Maltese, inverted hang | SUS (rings) | Straight-arm strength |
| **Elbow lever** | Two-arm, one-arm | BW, PAR | Wrist, core |
| **One-arm push-up / pull-up** | Archer, assisted, negative | BW, PB | — |
| **Dragon flag** | Tuck, straddle, full, negatives | Bench | Anterior core |
| **Skin the cat** | Bar, rings | PB, SUS | Shoulder mobility, lats |
| **Bar work** | Dead hang, active hang, scapular pull-ups, toes-to-bar, kipping swings | PB | Shoulders, grip |

Several calisthenics/gymnastics moves overlap with §4–§7 (push-up, dip, pull-up, inverted row, pistol squat, Nordic curl). In the database these are stored once, with a `calisthenics` tag.

## 14. Plyometrics, Jumps and Throws

The direction × intensity grid below follows the standard practice of classifying plyometrics by landing and direction.

| Category | Base exercises (variations) | Equipment |
|---|---|---|
| **Vertical, low intensity** | Pogo/ankle hops, jump rope (basic, double-under, crossover, boxer step), line hops, squat jump | BW, jump rope |
| **Vertical, medium** | Countermovement jump (with/without arm swing), tuck jump, pike jump, box jump (various heights, seated box jump, single-leg), hurdle hops, jump squat (loaded: trap bar, DB, BB) | BX, hurdles, TB, DB |
| **Vertical, high (shock)** | Depth jump, drop jump (and drop to second box), depth jump to box, single-leg depth jump | BX | [brianmac](https://www.brianmac.co.uk/plymo.htm) [nih](https://pmc.ncbi.nlm.nih.gov/articles/PMC4637913/) [strengthandconditioningeducation](https://strengthandconditioningeducation.com/wp-content/uploads/2022/08/Plyometrics.pdf)
| **Horizontal** | Broad jump (standing long jump), single-leg hop, triple jump, bounding (alternate-leg, uphill, resisted), skipping (A-skip, B-skip, power skip) | BW, sled/band for resisted |
| **Lateral/multidirectional** | Lateral bound (= skater jump), lateral box jump, lateral hurdle hops, zig-zag hops, 180°/360° jumps | BW, cones, hurdles |
| **Split/lunge** | Split squat jump (= jumping lunge), scissor jump | BW, DB |
| **Upper-body plyometrics** | Clap push-up, depth (drop) push-up, plyo push-up to box, medicine-ball chest pass, overhead throw, rotational scoop toss, slam, Smith/BB bench press throw, landmine push throw | BW, MB, SM, LM |
| **Throws (power)** | MB scoop throw, backward overhead throw (= OH back toss), shot-put throw, KB/MB slam, wall ball | MB, slam ball |

## 15. Cardio and Conditioning

| Base exercise | Variations | Equipment | Log type |
|---|---|---|---|
| **Running** | Easy, tempo, interval, fartlek, hill sprints, sprints (10–400 m), shuttle runs, treadmill, curved self-propelled treadmill | BW, treadmill | Distance/time/pace |
| **Walking / rucking** | Incline treadmill walk, ruck (weighted pack), sled walk | Treadmill, ruck | Distance/time |
| **Rowing** | Steady, intervals, 500 m/2 k test, sprint | Rowing ergometer | Distance/time/watts |
| **Ski erg** | Double-pole, alternating arm, intervals | SkiErg | Distance/calories |
| **Cycling** | Road, upright stationary, recumbent, spin, BikeErg, sprint intervals | Bike, cycle ergometer | Distance/time/watts |
| **Air/fan bike** (= assault bike, Echo bike, AirDyne) | Calorie sprints, intervals | Fan bike | Calories/time |
| **Sled push** (= prowler push) | High-handle, low-handle, heavy/light, sprint | SL | Distance/load |
| **Sled drag/pull** | Forward, backward, lateral, rope pull hand-over-hand | SL, harness, rope | Distance/load |
| **Stair climbing** | Stepmill, stair climber, stair runs | Stepmill | Time/floors |
| **Elliptical / cross-trainer** | — | Elliptical | Time/distance |
| **Swimming** | Freestyle, backstroke, breaststroke, butterfly, kick sets | Pool | Distance/time |
| **Jump rope** | Basic, double-unders, crossovers | Rope | Reps/time |
| **Battle ropes** | Alternating waves, double waves, slams, circles | Battle rope | Time |
| **Circuit drills** | Burpee (and burpee pull-up, burpee box jump-over), jumping jack, mountain climber, high knees, butt kicks, bear crawl, side shuffle, grapevine/carioca | BW | Reps/time |
| **Other machines** | Arm ergometer (UBE), VersaClimber/ladder mill, wave machine, rope-pull machine | Machines | Time/distance |
| **Combat conditioning** | Shadowboxing, heavy bag, sledgehammer tyre strikes | Bag, sledgehammer | Rounds/time |

## 16. Functional / CrossFit-Style Movements

CrossFit's nine foundational movements, as listed in the CrossFit Journal (Todd Widman, "A CrossFit Startup Guide: Part 2"), are "squat, front squat, overhead squat; shoulder press, push press, push jerk; deadlift, sumo deadlift high pull, and medicine ball clean". All except the last two are already catalogued above.

| Base exercise | Variations | Equipment | Notes |
|---|---|---|---|
| **Sumo deadlift high pull (SDHP)** | BB, KB | BB, KB | Hinge + upright pull |
| **Medicine-ball clean** | — | MB | Clean pattern teaching drill |
| **Wall ball** (= wall-ball shot) | 9 ft/10 ft target | MB (soft) | Squat + throw |
| **Thruster** | BB, DB, KB | BB, DB, KB | Front squat + press |
| **Cluster** | Squat clean + thruster | BB | — |
| **Devil press** | Single/double DB | DB | Burpee + DB snatch |
| **Man maker** | DB | DB | Push-up + row + clean + press |
| **Box jump-over / step-over** | Lateral, facing | BX | — |
| **Toes-to-bar / knees-to-elbows** | Strict, kipping | PB | Core |
| **Chest-to-bar / butterfly pull-up** | — | PB | Gymnastics pulling |
| **Bar/ring muscle-up** | Strict, kipping | PB, SUS | — |
| **GHD sit-up** | — | GHD | Hip flexors, abs |
| **Double-under** | Single-unders (scaled) | Jump rope | — |
| **Handstand walk** | Wall walk (scaled) | BW | — |
| **Rope climb** | Legless | Rope | — |
| **Dumbbell snatch / clean & jerk** | Alternating, single-arm | DB | — |
| **Sandbag clean / D-ball over shoulder** | — | SB, slam ball | — |
| **Burpee variants** | Bar-facing, lateral over bar, to target | BW, BB | — |

## 17. Grip Training

Grip is usually classified into **crush**, **pinch** and **support** grip, plus wrist/finger conditioning. [Wikipedia](https://en.wikipedia.org/wiki/Rolling_Thunder_%28exercise%29) [strongerwrestler](https://strongerwrestler.com/grip-training/)

| Category | Base exercises (variations) | Equipment |
|---|---|---|
| **Crush** | Gripper closes (full close, negative, timed hold, credit-card set); gripper "IronMind Captains of Crush" levels; towel wring | Torsion grippers, towel |
| **Pinch** | Plate pinch (2-plate, smooth side out, single-hand), pinch block lift (1-hand, 2-hand), hub lift, wide-pinch, blob lift, hex-DB head hold | Plates, pinch block, hub, blob |
| **Support** | Dead hang (one/two-arm, towel, fat-grip, ball), farmer's hold/walk, double-overhand deadlift holds, rack-pull holds, thick-bar holds, Rolling Thunder (rotating handle single-arm deadlift) | PB, AX, Fat Gripz, Rolling Thunder | [Wikipedia](https://en.wikipedia.org/wiki/Rolling_Thunder_%28exercise%29) [wellfitinsider](https://wellfitinsider.com/workout-tips/grip-strength-exercises/)
| **Wrist/forearm** | Wrist roller (flexion and extension), wrist curls, leverage bar/sledgehammer levering (radial/ulnar deviation, pronation/supination), rice-bucket training, finger extension with bands | Wrist roller, sledgehammer, rice bucket, BD | [bodybuilding-wizard](https://bodybuilding-wizard.com/best-grip-strengthening-exercises/) [lpgmuscle](https://lpgmuscle.com/blogs/news/grip-strength-training-tools-that-build-crushing-power) [strongerwrestler](https://strongerwrestler.com/grip-training/)
| **Thick-bar/odd-object** | Axle deadlift, thick-handle DB lifts (Inch DB), towel pull-ups, rope climbs, captain's ball/grip spheres | AX, towel, grip balls |
| **Bending/odd lifts** | Nail/bar bending, card tearing (specialist) | Steel bars |

## 18. Neck Training

Neck work should cover four directions: **flexion** (chin to chest), **extension**, **lateral flexion** (ear to shoulder) and **rotation**. [theneckflex](https://www.theneckflex.com/blogs/resources/how-to-get-a-bigger-thicker-neck-fast-the-complete-training-guide)

| Base exercise | Variations | Equipment |
|---|---|---|
| **Neck flexion** | Lying (on bench, plate on forehead), harness standing/seated, cable, band, 4-way machine, manual partner resistance, isometric | Plate, neck harness, CB, BD, 4-way neck machine | [strengthlog](https://www.strengthlog.com/neck-muscles-exercises-workout/) [bodybuilding-wizard](https://bodybuilding-wizard.com/neck-strengthening-exercises/) [pelank](https://pelank.com/sports-exercises/neck-exercises/)
| **Neck extension** | Prone lying, harness (standing/seated), cable, band, 4-way machine | As above |
| **Lateral neck flexion** | Side-lying, harness, cable, band, machine | As above |
| **Neck rotation** | Band, cable, manual, machine (rotary) | BD, CB |
| **Neck isometrics** | Multi-directional holds against hand, band, Iron Neck (perturbation) | Hand, BD, Iron Neck |
| **Neck bridge** | Wrestler's bridge (back), front bridge, bench-supported bridge | BW, mat |
| **Chin tuck / deep neck flexor** | Supine, standing, with towel | BW |
| **Shrug** (upper traps) | See §11 | BB, DB, TB |

## 19. Rehab / Prehab

| Region | Base exercises (variations) | Equipment |
|---|---|---|
| **Shoulder / rotator cuff** | External rotation (side-lying DB, band/cable at side, 90/90 band/cable, prone 90/90, elbow-on-knee), internal rotation (band/cable), face pull with external rotation, band pull-apart (pronated, supinated, diagonal), Y-T-W/I raises, scaption, wall slides (with band), serratus wall slide, push-up plus, scapular push-ups, Cuban rotation, sleeper stretch, isometric ER/IR (doorway), wand/stick ER, pendulum swings | BD, CB, DB, wall | [e3rehab](https://e3rehab.com/rotator-cuff-exercises/) [foundationalrehab](https://app.foundationalrehab.com/blog/exercises-for-rotator-cuff) [nexusphysicalrehab](https://nexusphysicalrehab.com/blog/rotator-cuff-strengthening-exercises/) [rickysinghmd](https://www.rickysinghmd.com/wp-content/themes/ypo-theme/pdf/rotator-cuff-tendinopathy.pdf)
| **Elbow / wrist** | Eccentric wrist extension (Tyler twist with FlexBar), eccentric wrist flexion, isometric holds, pronation/supination, grip isometrics | FlexBar, DB, BD |
| **Hip** | Clamshell, side-lying abduction, monster walk, hip airplane, 90/90 hip lift-offs, Copenhagen adduction, single-leg glute bridge, hip CARs | BD, BW, bench |
| **Knee** | TKE, Spanish squat, wall sit (isometric), step-down (eccentric), reverse Nordic, straight-leg raise, isometric leg extension, slant-board decline squat, backward sled drag, Poliquin step-up, quad set | BD, slant board, BX, SL |
| **Hamstring** | Nordic curl, isometric bridge holds, long-lever bridges, Razor curl, single-leg RDL, "Askling" L-protocol (extender, diver, glider) | BW, slider |
| **Ankle / foot** | Calf raise (slow, eccentric, bent-knee), tibialis raise, ankle ABCs, banded inversion/eversion/dorsiflexion, single-leg balance (eyes closed, unstable), short-foot, toe yoga, heel walks | BD, step, balance pad |
| **Spine / trunk** | McGill Big 3 (modified curl-up, side bridge, bird dog), cat-camel, dead bug, Pallof press, prone press-up (McKenzie), Jefferson curl (loaded flexion, advanced) | BW, CB, BD |
| **Neck** | Chin tucks, deep-neck-flexor endurance, isometrics (see §18) | BW, BD |

## 20. Mobility and Stretching

The main stretching types to log are **static** (active and passive), **dynamic**, **ballistic**, **PNF** (hold-relax, contract-relax, contract-relax-agonist-contract), **loaded progressive** and **self-myofascial release**. [acefitness](https://www.acefitness.org/fitness-certifications/ace-answers/exam-preparation-blog/2966/types-of-stretching/) [state](https://accessdl.state.al.us/AventaCourses/access_courses/kinesiology_ua_v21/02_unit/02-02/02-02_learn_text.htm) [sportydoctor](https://sportydoctor.com/types-of-stretching/) Log mobility as hold time or reps per side.

| Region | Static / PNF stretches | Dynamic / mobility drills | Equipment |
|---|---|---|---|
| **Hips** | Kneeling hip flexor (couch stretch), pigeon, 90/90, butterfly, frog, figure-4, standing/seated adductor | Leg swings (front-back, lateral), hip circles/CARs, walking lunge with rotation, world's greatest stretch, Cossack, Spiderman lunge, 90/90 transitions | BW, wall, BD |
| **Hamstrings** | Standing/seated toe touch, supine strap, single-leg forward fold, pancake | Inchworm, walking toe touch/Frankenstein kicks, banded hamstring floss | Strap, BD |
| **Quads** | Standing quad, prone quad, couch stretch | Butt kicks, heel-to-butt walk | BW, wall |
| **Calves / ankles** | Wall calf (straight and bent knee), step drop | Knee-to-wall ankle rocks, banded ankle distraction | Wall, step, BD |
| **Thoracic spine** | Child's pose with side reach, thread-the-needle | Open books, foam-roller extensions, quadruped rotation, cat-cow | Foam roller |
| **Shoulders / chest** | Doorway pec stretch, cross-body, sleeper, lat stretch on rack/bench, behind-head triceps | Arm circles, band dislocates (pass-throughs), wall slides, shoulder CARs, scapular push-ups | Doorway, BD, PVC |
| **Neck** | Upper-trap and levator scapulae stretches, chin tucks | Neck CARs | BW |
| **Wrists** | Prayer/reverse-prayer, kneeling wrist stretches | Wrist circles, rocking | BW |
| **Spine general** | Cobra/sphinx, supine twist, child's pose, hang (decompression) | Cat-cow, segmental rolls | BW, PB |
| **Splits / flexibility** | Front split, middle split, pancake, bridge (back) | Leg-swing progressions | BW, blocks |
| **Self-myofascial release** | Foam roll (quads, IT band, T-spine, lats, calves), lacrosse/massage ball (glutes, pecs, feet), percussion gun | Foam roller, ball, massage gun |
| **Yoga-based** | Downward dog, low lunge, pigeon, warrior series, sun salutation flows | Mat | — |

## Synonym and Duplicate Reconciliation Table

| Canonical name | Aliases to merge | Do *not* merge with |
|---|---|---|
| Lying triceps extension | Skull crusher, nose breaker, French press (lying) | JM press (hybrid; separate) |
| Overhead triceps extension | French press (seated/standing) | — |
| Romanian deadlift | RDL | Stiff-leg deadlift (floor start, straighter knees) |
| Stiff-leg deadlift | Straight-leg deadlift, SLDL | RDL |
| Overhead press | Military press, strict press, shoulder press (BB), OHP | Push press, jerk |
| Inverted row | Australian row, bodyweight row, ring row/TRX row (implement modifier) | — |
| Air squat | Bodyweight squat | — |
| Rear-foot-elevated split squat | Bulgarian split squat, RFESS | Split squat (both feet on floor) |
| Lateral bound | Skater jump | Skater squat |
| Nordic hamstring curl | Nordic curl, inverse leg curl, Russian leg curl, natural GHR (when using GHD) | Glute-ham raise (GHD-based; often aliased, but best stored separately) |
| Reverse fly | Rear-delt fly, reverse pec deck | Face pull |
| Straight-arm pulldown | Cable pullover, lat prayer | DB pullover |
| Fan bike | Assault bike, Echo bike, AirDyne, air bike | Upright bike |
| Sled push | Prowler push | Sled drag |
| Log press | Log lift, log clean & press | Axle press |
| Farmer's walk | Farmer's carry | Suitcase carry (single-arm) |
| Pendlay row | Dead-stop BB row from floor | Bent-over row (continuous) |
| Seal row | Chest-supported BB row on bench | Chest-supported DB row |
| Glute bridge | Hip bridge | Hip thrust (shoulders on bench; separate) |
| Pallof press | Anti-rotation press | — |
| Hang clean | High-hang/hip, mid-thigh, knee, below-knee (position modifier) | Block clean (bar rests on blocks) |
| Power clean/snatch | Catch above parallel | Squat (full) clean/snatch |
| Box squat | Westside box squat | Squat to box touch (pause modifier) |

## Recommendations

1. **Seed the database from a public-domain core, then extend it from this catalogue.** yuhonas/free-exercise-db (Unlicense; self-described "800+ exercises", with 876 entries and 1,746 image paths in its dist/exercises.json per an October 2026 count by AIFitnessAPI) already follows the force/level/mechanic/equipment/muscle schema. Add the strongman, gymnastics-progression, neck, grip, rehab and conditioning entries above, which general datasets cover poorly.
2. **Implement modifiers as structured fields, not free text.** Otherwise "paused 2-board close-grip bench press against chains" becomes a one-off string that can't be grouped for progress tracking. Store the parent (bench press), equipment (BB + boards + chains), grip (close), ROM (2-board) and pause (yes) separately, and generate the display name automatically.
3. **Use rulebook-defined names for competition lifts.** Lock "Competition Squat/Bench/Deadlift" to IPF standards and "Snatch / Clean & Jerk" to IWF standards so meet-prep logs are unambiguous. Label everything else as a variation.
4. **Support complexes, supersets and medleys natively** (e.g. "Power Snatch + Hang Snatch + OHS 2+1+1", "Yoke → Farmer's medley"). They are sequences of existing IDs, not new exercises.
5. **Give non-load activities their own log types.** Use time, distance, calories, watts, height, ground contacts, hold time and per-side reps for conditioning, plyometrics and mobility.

## Caveats

- **"Every exercise" is unbounded.** New implements and hybrids appear constantly (e.g. new specialty bars and machines). This catalogue covers the established base exercises and the dominant variation axes; long-tail named variations should be created as user-defined modifiers on a parent.
- **Strongman specifications vary by federation and contest.** Log diameters, bar heights, whether a Viking press may be set down, and strap/tacky allowances all change from contest to contest. Only the SCL publishes a short general rules page, and it notes events "can be changed always until the competition day". [strongmancl](https://strongmancl.com/rules/)
- **RDL vs stiff-leg definitions are inconsistent across sources.** Some coaching sites claim the knee angle is the same in both, while Coratella et al. (2022) describe the RDL as "performed with the knees slightly flexed" and the stiff-leg deadlift "with the knees extended". Most agree the defining difference is the start position (hip vs floor). The activation comparison rests on a small study: Coratella et al. (Int J Environ Res Public Health 2022;19(3):1903) tested 10 competitive bodybuilders at 80% 1-RM and found "the RD appeared to target the semitendinosus more than the SD, while the latter excited the gluteus maximus more". It should not be over-interpreted.
- **Muscle tags are simplified.** Primary muscles listed are the commonly accepted prime movers. EMG-based rankings vary with technique, load and individual anatomy.
- **Rehab entries are for reference, not prescription.** Their selection and dosing should be guided by a qualified clinician for any injury.