# SLEW — the engine's contract

SLEW is the bar-speed engine Ironlog's Measure runs on. It is three files at
the repo root, and none of them takes anything from Ironlog: no imports, no
`S`, no DOM, no storage.

| File | What it is | How it is loaded | Exposes |
|---|---|---|---|
| `slew-core.js` | Slew's metrics engine and sensor capture, bundled from `slew-v2/src/{core,capture/sensor}` by `r&d/tools/build-slew.cjs`. **Generated, do not edit.** | `<script src>` in `index.html`, before any module | global `Slew` |
| `slew-video.js` | Slew's plate detector and tracker (bar path from video), bundled from `slew-v2/src/capture/video`. **Generated, do not edit.** | by the app on first use of bar path (`loadSlewVideo` in `js/vbt.js`) | global `SlewVideo` |
| `slew-reps.js` | Rep detection tuned on real traces, and the bar-speed RIR estimate. Hand-written. Calls only `Slew`. | `import` from `js/vbt.js` | named exports |

`r&d/tools/check-version.cjs` fails if any of the three gains an import.

The two bundles stay classic scripts with a global each, on purpose. The app
checks `window.Slew` before offering Measure and loads the video tracker only
when asked, so if either file fails to load the rest of the app still works.
A static `import` would turn that into a blank page.

Written 12 Nov 2026 from the code as it stood at 0.96.5, when `slew-reps.js`
was split out of `index.html` (`r&d/notes/module-split.md`). Nothing in the
engine changed in that move.

## In one line

**In:** motion samples from the phone, the load on the bar, and settings (the
lift's profile). **Out:** reps, each with its velocities, a set summary, and
a RIR estimate.

## Inputs

### Samples

`Slew.MotionCapture` produces them; anything that makes the same shape will do
(the simulator and the saved traces do).

```js
motion: [{ t, a, still }, …]
```

| Field | Unit | Meaning |
|---|---|---|
| `t` | ms | time since capture started |
| `a` | m/s² | vertical acceleration, gravity and bias removed, up positive |
| `still` | boolean | the capture judged the bar at rest at this sample |

Optional, for the tilt correction — the phone's own three-axis readings, one
entry per sample, in the same order:

```js
xyz: { lx, ly, lz, gx, gy, gz }     // arrays; l = linear acceleration, g = acceleration including gravity
```

Ironlog collects these by subclassing `Slew.MotionCapture` (`vbtCaptureClass`
in `js/vbt.js`). Without them, or where under 90% of samples have a linear
reading, the motion is used as it is.

### Load

`loadKg`, kilograms, on the bar. Optional. With it `Slew.analyse` adds
`meanPower` and `peakPower` (watts) to each rep; nothing else depends on it.

### Settings: the lift's profile

One object per lift. `Slew.defaultProfile(liftId)` gives the population
figures; Ironlog overlays what it has learned for this lifter (`slewProfile`
in `js/vbt.js`, stored under `S.vbt`).

| Field | Unit | Meaning |
|---|---|---|
| `v0` | m/s | mean concentric velocity at 0 RIR (population guess) |
| `slope` | m/s per rep | velocity gained per extra rep in reserve |
| `vlF` | 0–1 | share of velocity lost from the opening reps to failure |
| `vlFCal` | boolean | `vlF` is this lifter's, measured (Ironlog's addition) |
| `minRom` | m | reps with less travel are not counted |
| `scale` | × | range-of-motion trim applied to the displacement |
| `romRef` | m | expected full range; 0 = unset |
| `v0Observed` | m/s | 0-RIR velocity measured on a set this lifter failed, on this phone; absent until one is |

Constants inside `slew-reps.js`, not settings:

| Name | Value | Meaning |
|---|---|---|
| `VBT_HP_V`, `VBT_HP_X` | 0.15 Hz, 0.05 Hz | high-pass corners for velocity and position (drift removal) |
| `VBT_FS` | 60 Hz | rate the motion is resampled to |
| `VBT_MIN_ROM` | 0.04 m | floor for rep travel during detection |
| `VBT_SETUP_MS` | 1800 ms | a "rep" finished this soon after Start is the bar being set up |
| `VBT_RIR` | `{ minReps: 3, minLoss: 0.08, shape: 0.75, cap: 6, recent: 5, failLoss: 0.15 }` | the RIR estimate's thresholds |

## The pipeline

This is what Measure does with a recording (`openVbtRecord`, `js/vbt.js`),
and what `vbt-sim.cjs` and `vbt-rir.cjs` replay:

```js
const tilted  = vbtTiltMotion(motion, xyz);                    // slew-reps
const samples = vbtIntegrate(tilted.motion);                   // slew-reps
const scaled  = samples.map(s => ({ ...s, x: s.x * (profile.scale || 1) }));
const out     = Slew.analyse(scaled, { targetHz: 60, minRom: Math.min(profile.minRom, VBT_MIN_ROM), loadKg });
const found   = vbtDropBlips(out.reps, profile.minRom);        // slew-reps
const reps    = Slew.withRpe(found, profile);
const est     = vbtEstimateSet(reps, profile, failure);        // slew-reps; failure = out.failure, see below
const summary = vbtSummary(reps);                              // slew-reps
```

| Step | Function | Takes | Gives |
|---|---|---|---|
| 1 | `vbtTiltMotion(motion, xyz)` | motion, optional 3-axis readings | `{ motion, used }` — `a` re-read against where down really was at each sample; `used` is the share of samples re-read (0 = not applied) |
| 2 | `vbtIntegrate(motion)` | motion | `[{ t, x, conf }]` at 60 Hz: displacement in metres, up positive, drift removed |
| 3 | `Slew.analyse(samples, opts)` | displacement samples; `{ targetHz, minRom, loadKg }` | `{ reps, summary, fs, failure }` |
| 4 | `vbtDropBlips(reps, minRom)` | reps, the lift's minimum travel | reps with the set-up blip and part-reps removed, renumbered from 1 |
| 5 | `Slew.withRpe(reps, profile)` | reps, profile | the same reps with a per-rep `rpe` |
| 6 | `vbtEstimateSet(reps, profile, failure)` | reps, profile, failure evidence | the set's RIR estimate, or `null` for no reps |
| 7 | `vbtSummary(reps)` | reps | `{ repCount, bestMeanVelocity, velocityLoss, confidence }` |

`vbtLowPass` is internal to step 2 and not exported.

One step sits outside the engine because it needs the lifter's history.
Between 4 and 6, Ironlog's `trustFailure` (`js/vbt.js`) discards a "missed
rep" when the last finished rep was moving too fast to have been near the
limit, using the lifter's stored minimum velocity for the lift. The engine
takes whatever failure evidence it is handed.

## Outputs

### Reps and velocities

```js
rep: {
  index,                 // 1-based
  tStart, tEnd,          // ms from capture start
  rom,                   // m
  concentric: { duration, meanVelocity, peakVelocity, timeToPeak },   // ms, m/s, m/s, ms
  eccentric,             // same shape, when detected
  meanPower, peakPower,  // W, only with a load
  rpe,                   // 6–10, from step 5
  quality: { confidence, flags },   // 0–1; flags such as 'short-rom', 'clipped-start', 'integration-drift'
}
```

`vbtSummary`'s `velocityLoss` is a **percentage** (best rep to last rep).
`vbtEstimateSet`'s `velocityLoss` is a **fraction**, 0–1 (opening reps to
last rep). They are different measures with the same name.

### Failure evidence

From `Slew.analyse`: `{ failedAttempt, grind, minConcentricVelocity,
attemptFraction, terminalVelocity, … }`. Observed, not estimated: a rep was
tried and missed, or the last one nearly stalled.

### RIR

`vbtEstimateSet` returns Slew's own `SetEstimate` with Ironlog's fields added:

| Field | Meaning |
|---|---|
| `rir`, `rpe` | reps in reserve after the last rep, and 10 − that. `NaN` when it declines to give a number |
| `atLeast` | `true` when `rir` is a floor: shown as "RIR 6+" |
| `spread` | ± uncertainty, in reps |
| `method` | `observed-failure`, `observed-grind`, `velocity-loss`, `velocity-loss+limit`, or `unknown` |
| `velocityLoss` | 0–1, opening reps to last rep |
| `romCut`, `romLoss` | reps were getting shorter, and by how much |
| `measuredV0` | the lifter's failure speed was measured in this set; Ironlog writes it back to the profile |
| `because` | one or two sentences saying how the number was reached, shown to the lifter |
| `fill` | `true` when the estimate is strong enough to write into the set's RIR box: observed, or calibrated to this lifter. Otherwise it is shown beside the set and the box is left alone |

When it gives no number (`method: 'unknown'`): fewer than three reps, or
under 8% of speed lost. Past 6 in reserve it reports 6 with `atLeast`.

Ironlog shows RIR and stores RPE (`rirToRpe`, `rpeToRir` in `js/core.js`).
The engine reports both and knows nothing about that rule.

## Video: `SlewVideo`

Separate from the above; it produces a bar path, not reps. `js/vbt.js`
(`bpTrack`, `bpAnalyse`) drives it with frames from a canvas.

`PlateTracker`, `searchPlateInClip`, `detectPlate`, `detectPlateCandidates`,
`toGrayscale`, `trackCircle`, `calibrateFromPlate`,
`STANDARD_PLATE_DIAMETER_M` (0.45). Greyscale frames in; a plate centre and
radius per frame out; `calibrateFromPlate` turns the plate's pixel diameter
into metres per pixel. Squat depth uses MediaPipe from `pose/`, which is not
part of SLEW.

## What `Slew` exposes

`MotionCapture`, `DEFAULT_MOTION_CONFIG`, `analyse`, `analyseSensorSet`,
`integrateMotion`, `detectFailure`, `estimateSet`, `withRpe`, `fitProfile`,
`defaultProfile`, `DEFAULT_PROFILES`, `EXERCISES`, `EFFORT_BANDS`, `bandFor`,
`shouldFlipAxis`. `build-slew.cjs` checks the ones Ironlog needs are present
after a rebuild.

`Slew.integrateMotion` and `Slew.estimateSet` are what `vbtIntegrate` and
`vbtEstimateSet` replaced for Measure. `vbt-sim.cjs` scores the two
integrators side by side: 163 of 480 synthetic reps for Slew's, 453 of 480
for `vbtIntegrate`. That number is the regression check for any change here.

## Using it outside Ironlog

```html
<script src="slew-core.js"></script>
<script type="module">
  import { vbtTiltMotion, vbtIntegrate, vbtDropBlips, vbtSummary, vbtEstimateSet, VBT_MIN_ROM } from './slew-reps.js';
  // … the pipeline above
</script>
```

In Node, as the tools do: run `slew-core.js` in a `vm` context with stubs for
`window.addEventListener` and `performance.now`, then `slew-reps.js` in the
same context with its `export` keywords removed (`plain()` in
`r&d/tools/app-source.cjs`).

## Open

Whether `slew-reps.js` should move upstream into `slew-v2` and come back
through `build-slew.cjs`, so that Slew the app gets the same rep detection.
That changes the engine's source and its 65 tests, so it was left out of the
refactor.
