# Exercise demos — animated figure and description on the Info tab

Added 2026-11-05 at Aaron's request. The squat prototype (side-view outline
mannequin) was approved in a planning chat as "perfect"; this spec turns it
into one engine that every mapped movement uses. Where this spec and the
roadmap disagree, this spec wins.

## 1. Where it lives

Movement page (`openMovementPage`, reached from `openExDetail`) → **Info** tab.
Order on the tab:

1. **Figure** (if the movement is mapped to a pattern) with its controls and
   phase label.
2. **Description**: Setup · The movement · Common mistakes · Variant note ·
   Your notes.
3. The existing chips, equipment, execution, attachment and muscle lists,
   unchanged.

The variant chip strip above the tabs already picks a leaf (`focus`). The
figure's equipment and the variant note follow that leaf's `equipment`.

## 2. The figure

### 2.1 Drawing
- Inline SVG built in code. **No video, GIF, image files or libraries.** Works
  fully offline (nothing to cache beyond `index.html`).
- **Side view**, lifter facing right, ground line under the feet. One
  exception: the lateral raise is drawn **from the front**, because the
  movement happens across the body and a side view would read as a front
  raise. (A front-view toggle for other patterns is later work, §7.)
- **Outline mannequin**: capsule segments — torso, thigh, shin, foot, upper
  arm, forearm — plus a head circle. Drawn in two passes (all outlines, then
  all fills) so the body reads as one silhouette, not overlapping tubes.
- Only the near-side limbs are drawn in side view (they cover the far ones).
- Colours come from the app's CSS variables only (`--txt`, `--dim`,
  `--dim2`, `--line`, `--line2`, `--card2`, `--blue`, `--gold`, `--red`), so
  both skins (default and Win98) and any later theme (E10) work without
  per-skin code.

### 2.2 Kinematics
- Forward kinematics from a **fixed ankle** (standing patterns) — shin angle,
  then thigh angle, then torso angle, all measured from vertical. Seated,
  lying and hanging patterns root at the hip, the back on the bench, or the
  hands on the bar.
- **Keyframes per pattern** give joint angles (or a hand/hip target) at the
  start (`p = 0`) and the far end (`p = 1`) of the movement; frames between
  are eased. A small set of named **solvers** fill in what keyframes
  shouldn't fix by hand:
  - `barOverMidfoot` — the torso angle is solved every frame so the bar (on
    the back, in the front rack, or in the hands) stays over midfoot. This is
    what makes the squat and the deadlift look right at every depth.
  - `ik` — two-link inverse kinematics for an arm (shoulder → hand target)
    or a leg (hip → foot), with a chosen bend direction.
- Squat (approved): shin lean 0 → 38°, thigh 0 → 108° from vertical (hip
  crease below the top of the knee), torso solved by `barOverMidfoot`.

### 2.3 Equipment
Drawn from the focused leaf's equipment:
- **Barbell / axle / Smith / SSB / trap bar**: bar end-on plus a plate
  circle (the plate is see-through so the figure stays readable). Smith adds
  the vertical rail. SSB adds the forward handles. Trap bar puts the hands at
  the sides.
- **Dumbbells / kettlebell**: a small bell in the near hand.
- **Cable**: a line from the hand to the pulley, pulley circle, and a stack.
- **Machine / plate-loaded machine**: a handle or pad where the pattern
  needs it, and the seat or bench.
- **Bench / seat / box / pad**: drawn by the pattern where the body rests on
  one.
- Equipment the pattern has no drawing for falls back to the movement's
  default equipment's drawing, with the variant note saying what differs.

### 2.4 Muscles and effort
- The movement's **primary** muscles (`m.primary` from the exercise
  database) are tinted on the matching segment side (quads on the front of
  the thigh, hamstrings on the back, erectors along the back of the torso…).
  Muscle names with no region are skipped silently.
- Tint is an **effort colour** mixed from `--gold` (easy) to `--red`
  (hardest), and its strength rises through the hard part of the rep:
  low at the easy end, climbing through the eccentric, highest just after
  the turnaround (the sticking region), then falling off to lockout.

### 2.5 Bar path
- **Dashed vertical line over midfoot** for patterns where that's the cue
  (squat, hinge, overhead press).
- A **fading trail** of the bar (or the hand, for dumbbells and cables) for
  every pattern.

### 2.6 Phase label and tempo
- A short label under the figure, one per phase, e.g. squat: *Brace* ·
  *Sit down between your heels* · *Depth* · *Drive up*.
- Timeline: hold at the start (brace, 0.5 s) → move to the far end → short
  pause (0.35 s) → move back. The **eccentric takes about 1.8 s and the
  concentric about 1.2 s**, whichever direction each is for the pattern
  (a squat lowers first; a deadlift, row or curl lifts first).

### 2.7 Controls
- **Pause / play**, **Slow** (about 0.35× speed), **Muscles** on/off,
  **Bar path** on/off, and a **depth scrub** slider (dragging it pauses and
  sets the position). All are buttons with `aria-pressed` or a labelled
  range, ≥ 40 px touch targets (C4).
- Control choices persist for the rest of the app session, not in `S`.
- `prefers-reduced-motion`: the figure opens paused at mid-rep.
- The animation loop stops itself when its SVG leaves the page (tab switch,
  variant switch, closing the sheet) — no timers left running.

### 2.8 One engine, patterns as data
`DEMO_PATTERNS` holds each pattern: base (stand / seat / bench / hang /
front), keyframes, solvers, which direction is concentric, phase labels,
bar-path style and the equipment it knows how to draw.
`DEMO_MAP` maps **movement id → pattern** (plus small per-movement pose
overrides, e.g. box squat stops at the box, sumo has a more upright torso).

First ten patterns:

| Pattern | Movements (first pass) |
|---|---|
| squat | back-squat, box-squat, front-squat, goblet-squat |
| hinge | deadlift, sumo-deadlift, romanian-deadlift, stiff-leg-deadlift, rack-pull, good-morning |
| press (horizontal) | bench-press, incline-bench-press, decline-bench-press, close-grip-bench, larsen-press, pin-press |
| overhead | overhead-press, push-press, behind-neck-press, arnold-press, log-press |
| row | bent-over-row, single-arm-row, seated-row, chest-supported-row |
| vertical pull | lat-pulldown, pull-up, chin-up |
| lateral raise | lateral-raise (front view) |
| curl | biceps-curl, hammer-curl, reverse-curl, zottman-curl, preacher-curl, incline-curl |
| triceps extension | triceps-pushdown, overhead-triceps-extension, skull-crusher, triceps-kickback |
| lunge / split squat | split-squat, lunge, reverse-lunge, bulgarian-split-squat |

**Anything unmapped shows no figure** rather than a wrong one. Cardio,
carries, core and most strongman movements stay unmapped for now.

## 3. Description

Under the figure:

- **Setup** — 1–2 lines.
- **The movement** — 3 cues.
- **Common mistakes** — 2–3.
- **Variant note** — what the focused variant chip changes (Smith, dumbbells,
  cable, machine, SSB…). Hidden when there's nothing to say.
- **Your notes** — free text, saved per movement (all its variants share
  one note), on the device.

Rules:
- Audience: beginners and experienced lifters. Plain cues, technically
  correct.
- **Original wording only.** Nothing copied or closely paraphrased from
  ExRx or any other site.
- Text is written **per pattern**, with **per-movement overrides** where the
  movement genuinely differs (front squat, sumo, RDL, incline bench…) and
  short **variant notes** per equipment, per pattern or per movement.
- Coverage: every mapped movement gets its pattern's text at least; the
  ones listed in §2.8 get their own where needed. The catalogue has 125
  movements (not 736 — the rest are search-only names), so "the ~100 most
  logged" is effectively everything trainable with a pattern. Unmapped
  movements show only Your notes.
- Squat text (approved): Setup — bar on upper back, hands just outside
  shoulders, feet about shoulder-width, toes out 15–30°, big breath and brace
  before every rep. Movement — break at hips and knees together and sit
  between your heels; knees over toes, bar over midfoot; full depth is hip
  crease below top of knee, drive up chest and hips together. Mistakes — hips
  shooting up first, heels lifting, knees caving, losing brace at the bottom.
  Barbell note — set safety arms just below your bottom position; on the
  Smith the bar's fixed so feet can go further forward.
- No medical or injury advice (same line as the coach, D9).

## 4. Data

- `S.exNotes`: `{ movementId: { text, mt } }`. Added to `DEFAULT_STATE`,
  JSON export/import (whole state, already), and **Drive sync** as a
  `SYNC_MAPS` entry (newest `mt` wins; clearing the note deletes the key, so
  the delete syncs as a tombstone).
- No schema bump: a missing `exNotes` is read as `{}`.
- Patterns, the movement map and all the text are **data in
  `r&d/data/demos/`**, inlined into `index.html` as the `DEMO_PATTERNS`,
  `DEMO_MAP` and `DEMO_TEXT` lines by `r&d/tools/build-demos.cjs` (since
  0.80.1) — the app is still one file and needs nothing extra cached. Never
  edit those three lines by hand. See §8.

## 5. Accessibility (C4)
- The SVG is `role="img"` with a label naming the movement and that it's an
  animation; the description text carries the actual instructions, so the
  figure is never the only source.
- Controls labelled; pressed state on toggles; range has a label.
- Your notes textarea has a visible label.

## 6. Build order
1. Engine + squat; headless phone-width screenshot (both skins) for Aaron.
2. The other nine patterns, the mapping and the text.
3. Version bump, changelog, PR.

## 7. Later (not in this build)
- Front-view toggle (knees caving on the squat, bar path on the bench).
- Replay the lifter's own VBT tempo and range of motion on the figure.
- More patterns (hip thrust, leg press, carries, push-up, fly, calf raise).

## 8. Adding or changing a movement

Everything is data; the engine only changes when a movement needs something
it can't draw yet (a new base, hold or piece of kit).

### Files
- `r&d/data/demos/patterns.json` — the patterns, each with its `text`.
- `r&d/data/demos/movements/<movement-id>.json` — one per movement with a
  figure. The id must exist in `r&d/data/exercises.json`.

```json
{
  "pattern": "curl",
  "o": { "upperArm": [4, 90], "foreArm": [8, 96], "labels": ["…", "…", "…", "…"] },
  "text": { "setup": "…", "cues": ["…", "…", "…"], "mistakes": ["…", "…"], "variants": { "cable": "…" } }
}
```
`o` (overrides) and `text` are optional: a file with only `pattern` borrows
everything. Text that's missing falls back to the pattern's — but a
movement that moves differently from its pattern (a front raise built on
the curl) needs its own cues, or it shows the wrong ones.

### Three ways in
1. **Demo Lab** (desktop): `node "r&d/tools/serve.mjs"`, open
   `http://localhost:5178/r%26d/tools/demo-lab.html`. Pick the movement and
   a pattern to start from, drag the pose sliders, set the phase labels and
   text, watch it play in either skin, then **Save & build**. It runs the
   app's own engine, so the preview is what the Info tab draws. A file the
   build rejects is not saved.
2. **By hand or by Claude**: write the JSON file, then
   `node "r&d/tools/build-demos.cjs"`.
3. **A new pattern**: add it to `patterns.json` (needs `base`, `labels`,
   `eq._` and its `text`), then movements as above.

### Then, every time
```bash
node "r&d/tools/build-demos.cjs"      # validates; unknown keys are errors
node "r&d/tools/demo-check.cjs" --98 --png   # poses every movement × equipment, writes a contact sheet
```
`demo-check` fails on NaN, a body through the floor, or a throw, and warns
when a hand can't reach its target, the bar leaves midfoot, or the planted
foot floats. It also lists movements still without a figure and equipment
with no variant note. Look at the sheet before shipping — the checks catch
broken maths, not ugly poses. Then bump, changelog, PR as usual.

### Key reference
A key is looked up: movement `o.eq[equipment]` → movement `o` → pattern
`eq[equipment]` → pattern `eq._` → pattern. Angles are degrees from
vertical, forward (the way the lifter faces) positive. A keyframe is a
number (fixed), `[start, end]`, or stops `[[p, v], …]` for a curve
(p 0 = start, 1 = far end).

| Key | Meaning |
|---|---|
| `base` | `stand` (FK from a fixed ankle) · `split` (both feet planted, legs by IK) · `seat` · `bench` (lying, head left) · `hang` (from a bar) · `front` (front view) |
| `concentric` | `go`: start → far end is the hard way (deadlift, curl). `back`: lower first (squat, bench) |
| `labels` | 4 phase labels: start (hold) · going · far end (pause) · coming back |
| `path` | `midfoot` draws the dashed midfoot line |
| `shin`, `thigh` | stand: shin lean, and thigh angle (hip behind the knee is positive) |
| `torso` | torso lean (negative = leaning back) |
| `solve` | `midfoot`: torso solved each frame so the hold point is over midfoot (ignores `torso`) |
| `barX` | nudge for the solver's target, metres |
| `hold` | where the load sits: `back` · `front` (rack) · `goblet` · `hands` (straight arms) · `null` (nothing held) |
| `arms` | `hold` (hands to the hold point) · `target` (hands follow `hand`) · `angles` (`upperArm`, `foreArm`) |
| `elbow` | which way the IK bends: `down` · `up` · `fwd` · `back` |
| `hand` | targets `[[anchor, a, b], [anchor, a, b]]` or stops `[[p, anchor, a, b], …]`. Anchors: `root` (shoulder joint +dx, +dy) · `chest` (a = fraction hip→shoulder, b = distance off the chest) · `mid` (over midfoot +dx, b above the shoulder joint) · `world` (x, y) |
| `upperArm`, `foreArm` | arm angles from straight down, in world space (180 = straight up) |
| `frontX`, `rear`, `rearToe`, `rearBench`, `hipKF` | split: front ankle x, rear ankle [x, y], rear toe [x, y], bench under the rear foot, hip targets (as `hand`) |
| `thighA`, `shinA`, `kneePad`, `backPad`, `footPlate` | seat: thigh above horizontal, shin from vertical, and the kit |
| `incline`, `legsUp` | bench: back-pad angle; Larsen legs |
| `rootFrom`, `rootTo` | hang: shoulder offset from the bar at the start and the end |
| `abduct`, `elbowBend` | front: arm angle out to the side; elbow bend |
| `draw` | `barbell` · `trap` · `log` · `dumbbell` · `kettlebell` · `plate` · `cable` · `band` · `belt` · `none` |
| `rail`, `ssb`, `plateR`, `anchor` | Smith rail; SSB handles; plate radius (m); cable/band anchor `[x, y]`, `above` or `across` |
| `box`, `pins`, `preacher`, `chestPad`, `backPad` | kit: box height (m); pins (a height, or `true` = at the start of the hand path); preacher pad; chest pad; back pad (seat, or a sled behind a standing lifter) |
| `heel` | stand: degrees the heel lifts, pivoting on the toes (keyframe) |
| `skip` | `true` (usually per equipment): no figure for that variant, because it's a different lift the pattern can't show |

Body proportions (metres, a 1.75 m lifter): shin 0.44, thigh 0.43, torso
0.52, upper arm 0.30, forearm to the bar 0.30.
