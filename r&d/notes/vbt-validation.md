# VBT validation — phone sensor against a reference

Roadmap D1. The research on phone and camera VBT accuracy is mixed. The app
labels every velocity number a guide. Before velocity-estimated RIR is
presented as more than that, it has to be checked against a reference device
on real sets, and the error recorded here.

## Protocol

1. **Reference device:** a linear position transducer (GymAware, Vitruve, Tendo)
   or a validated app, clipped to the same bar. Record its make and model.
2. **Phone:** strapped to the bar near the sleeve. Record the placement.
   Note pocket sets separately; they aren't expected to agree.
3. **Lifts and sets:** squat, bench and deadlift.
   - For each lift, a warm-up ramp of 5 sets at 40–90% with 2 reps each.
   - Then 3 working sets taken to RIR 3, 1 and 0.
4. **Record for each set:**
   - load;
   - the reference's mean concentric velocity (MCV) for each rep;
   - Ironlog's MCV for each rep;
   - stated RIR against Ironlog's estimated RIR;
   - for profile mode, the reference-derived e1RM against Ironlog's e1RM
     range.
5. **Report:**
   - the MCV bias and limits of agreement (Bland–Altman);
   - the RIR mean absolute error;
   - the share of days when the true e1RM (from a tested single within 3
     days) falls inside Ironlog's range.

## Results

| date | lift | device | sets | MCV bias (m/s) | LoA (m/s) | RIR MAE | e1RM in range |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |

Until this table has real rows, velocity-estimated RIR stays a guide.

## Video (bar path, roadmap 04a, 0.86.0)

Same protocol, with a side-on clip of each set analysed by Bar path from video
(r&d/specs/bar-path-spec.md). Record the camera distance, height and angle.
Also film one set from 0°, 15° and 30° off square to measure the cosine error.
Video numbers stay out of calibration, the profile and readiness until this is
filled in.

Synthetic check only so far (spec §12): ROM 49–50 cm for a true 50 cm, peak
0.95–0.97 m/s for a true 0.98.

### Results (video)

_None yet._

## Rep detection on real traces (0.89.0)

9 raw sensor traces, Mon 9 Nov 2026, Wk 4 Push, phone on the bar, 59 Hz
(Settings → Bar-speed debug export). Reps counted against the logged reps;
the 35 × 16 OHP AMRAP wasn't attached to a set, so its 16 came from Aaron.

| set | did | Slew.integrateMotion | vbtIntegrate (0.89.0) |
|---|---|---|---|
| OHP 20 × 8 (warm-up) | 8 | 1 | 8 |
| OHP 35 × 16 (60 s AMRAP) | 16 | 0 | 13 |
| OHP 35 × 9 | 9 | 1 | 8 |
| Smith incline 20 × 10 (warm-up) | 10 | 9 | 10 |
| Smith incline 30 × 8 (warm-up) | 8 | 1 | 8 |
| Smith incline 40 × 3 (warm-up) | 3 | 3 | 3 |
| Smith incline 60 × 5 | 5 | 2 | 5 |
| Smith incline 55 × 5 | 5 | 2 | 5 |
| Smith incline 35 × 17 | 17 | 17 | 17 |
| **total** | **81** | **36** | **77**, no extra reps |

What was wrong: vertical acceleration averaged −0.1 to −0.24 m/s² over sets
that start and end at rest, and MotionCapture marked the bar still only 2–8 %
of the time on the OHP sets, so drift ran uncorrected for 20–50 s. Fix:
high-pass the integrated speed (0.15 Hz) and position (0.05 Hz), zero-phase.
Lifting off the hooks read as a 11–16 cm rep against ~30 cm working reps;
reps under 0.6 × the set's median range are dropped.

Range of motion now reads consistently (OHP warm-up 42–47 cm, incline
34–38 cm). Not yet checked against a reference device, so speeds and RIR stay
a guide. Bar-speed RIR (Slew's estimator on population profiles) is still
unreliable on these sets: 35 × 17 read RIR 12 although it ended near failure
(44 % velocity loss). Tuning that is separate work.

Re-run: `node "r&d/tools/vbt-sim.cjs" --traces <export.json> -v`

## Tilt correction (00-V1, 0.91.0)

**What changed.** Slew reads "vertical" against a gravity direction it only
updates while the bar is still. The phone turns during a rep — the bar rolls
in the hands, and curls, raises and presses move in an arc — so mid-rep that
direction is stale. Measure now re-reads every sample against the phone's
own gravity at that instant (the with-gravity reading minus the linear one,
which the phone already fuses from its gyro): `vbtTiltMotion` in
`index.html`. It needs the 3-axis readings, which are now kept in memory for
every set (still only exported when Bar-speed debug is on).

**How far the phone turned** on the 11 Nov sets (5 kg bar, phone on the
bar): curl 117–119°, overhead press 63–81°, squat 77° (most of it getting the
bar onto the back), bent-over row 44–54°, front raise 49°, RDL 20–34°.

**Before and after**, `node "r&d/tools/vbt-sim.cjs" --traces
"r&d/data/vbt/ironlog-vbt-raw-2026-11-11.json" --truth
8,16,9,10,8,3,5,5,17,6,6,6,6,6,6,6,5,6,6,6 -v`:

| set (11 Nov, 5 kg) | did | 0.90.0 | 0.91.0 | range of motion 0.90.0 → 0.91.0 |
|---|---|---|---|---|
| Biceps curl 1 | 6 | 6 | 6 | 34–49 → 44–54 cm |
| Biceps curl 2 | 6 | 6 | 6 | 37–51 → 38–51 cm |
| RDL 1 | 6 | 6 | 6 | 33–40 → 35–42 cm |
| RDL 2 | 6 | **5** | 6 | 30–36 → 23–42 cm |
| Overhead press 1 | 6 | **7** | 6 | 17–40 → 44–58 cm |
| Overhead press 2 | 6 | 6 | 6 | 32–49 → 42–53 cm |
| Back squat | 6 | 6 | 6 | 26–57 → 35–53 cm |
| Front raise | 5 logged | **7** | **6** | 49–80 → 69–83 cm |
| Not logged (triceps extension?) | 6 | 6 | 6 | 66–89 → 66–80 cm |
| Bent-over row 1 | 6 | 6 | 6 | 33–40 → 34–41 cm |
| Bent-over row 2 | 6 | 6 | 6 | 29–39 → 31–37 cm |

- **9 Nov push day: 80 of 81, unchanged.** Those nine traces were recorded
  before 0.90.0 and carry no 3-axis readings, so the correction can't run on
  them; they go through exactly the 0.90.0 path. This shows the fallback is
  intact. It does **not** show what tilt correction does to heavy sets —
  that needs a new recording (A4 item 21).
- **11 Nov: 65 of 65 logged reps found** (0.90.0: 64), and sets with a wrong
  count went from three to one.
- **Front raise reads 6 against 5 logged.** The six are evenly spaced
  (every ~2.5 s), 69–83 cm, 1.1–1.4 m/s — they look like six real reps.
  Aaron: did you do six and log five?
- **Back squat** read 7 with tilt correction alone: getting the bar onto the
  back became a clean 39 cm "rep" ending 1.5 s after Start. New rule in
  `vbtDropBlips`: in a set of 4+, a first rep that is over within 1.8 s of
  Start is setup, not a rep (the earliest real first rep on either day
  ended at 2.7 s). One example only — watch for it dropping a real rep.
- Synthetic sets (`vbt-sim.cjs` with no arguments): 453 of 480, the same
  as before. They have no tilt in them, so they only guard the rest.

**Speeds went up on the arc lifts** (overhead press 1: 0.31–0.71 →
0.77–1.14 m/s) because the range of motion was being under-read. Nothing
here says the new speeds are right, only that they're consistent rep to rep.
The reference-device table above is still empty.

**Not covered:** a phone with no linear-acceleration reading falls back to
the old path (`tilt: 0` in the debug trace). Pocket mode goes through the
same correction; no pocket traces exist to check it against.

## Bar-speed RIR (00-V2, 0.92.0)

**What there is to check against: almost nothing.** The traces carry a
"logged RIR" for each set, but until 0.92.0 Measure wrote its own estimate
into an empty RIR box and nothing recorded that it had. So "RIR 9" on the
17-rep AMRAP, and the 0 / 4.5 / 9 on the 5 kg bar, are the sensor's own
guesses read back, not Aaron's ratings. Only two RIRs in the file can be
taken as typed: OHP 35 × 9 at RIR 1 (the sensor missed a rep there, so it
filled nothing) and incline 55 × 5 at RIR 1 (the sensor gave no estimate).
Two points can't tune anything. What follows fixes what was plainly wrong
and sets the app up to collect real ratings.

**Where the old estimate was off** (`node "r&d/tools/vbt-rir.cjs"`):

| set (9 Nov) | what it was | 0.91.0 | 0.92.0 |
|---|---|---|---|
| OHP 20 × 8 | warm-up | RIR 12 | 6+ |
| OHP 35 × 16 | 60 s AMRAP | 0 | 0 |
| OHP 35 × 9 | typed RIR 1 | 0 (missed rep seen) — hidden, the sensor found 8 of 9 | same |
| Incline 20 × 10 | warm-up | none | 6+ |
| Incline 30 × 8 | warm-up | 4.9 | 5.9 |
| Incline 40 × 3 | warm-up | **0.2** | 3.9 |
| Incline 60 × 5 | heavy, no RIR logged | 0.5 (near-stall seen) | same |
| Incline 55 × 5 | RIR 1 | none (speed didn't drop) | none |
| Incline 35 × 17 | AMRAP, close to failure | **12** | 2.9 |

- **By set length:** long sets were the worst (17 reps → RIR 12). The old
  method carried the whole set's average slow-down forward; reps slow
  gently for most of a set and sharply at the end.
- **By load:** heavier warm-ups read as near failure (40 × 3 → 0.2). The
  phone under-reads slow reps (incline at 40 kg came out at 0.17–0.24 m/s,
  slower than a warm-up triple really moves), and the old method compared
  that with a typical failure speed that knows nothing about this phone.
- **By lift / pocket vs bar:** not enough to say. Two lifts, all on the
  bar, one day.
- **False "missed rep":** on the 5 kg day a row that slowed 3% came out as
  an observed failure (putting the bar down). That would also have been
  stored as the lifter's failure speed for the lift.

**The new method** (`vbtEstimateSet` in `index.html`; Slew itself is
untouched):
1. A missed rep or near-stall still gives RIR 0 or 0.5, but for a set of
   three or more only if the set also lost at least 15% of its speed.
2. Otherwise the set is compared with itself. `done = (velocity loss ÷ loss
   at failure)^0.75`; `RIR = reps × (1 − done) ÷ done`. Loss at failure is
   the lift's `vlF` — the lifter's own once measured, else the population
   figure. This is the published shape (about half the possible reps done
   at 40% of the failure loss, 85% at 80%), not something fitted here.
3. If the lifter's own failure speed for the lift has been measured on this
   phone, the last five reps' slope carried to that speed is averaged in.
4. Under 8% loss, or fewer than three reps: no number. Over 6: shown as
   "6+".
5. Each rep's RIR now counts back from the set's, so the rep table and the
   set figure can't disagree.

**What gets written into the set.** Only an observed failure or near-stall,
or an estimate for a lift calibrated to the lifter. Anything else is shown
beside the set ("bar speed suggests RIR 3, a guide — type your own") and the
RIR box is left alone. A sensor-filled RIR is now marked (`rpeFrom: 'vbt'`
on the set; `rirFrom: 'sensor' | 'typed'` in the debug export), and the
coach's "logged vs bar speed" comparison ignores those.

**Still a guide.** The shape and the 8% / 15% / 6 limits are reasoned, not
measured. To check it: Measure working sets and **type your own RIR on
every one** (A4 item 23). Twenty typed sets across squat, bench and
deadlift, a few of them to failure, would give a real error figure — and the
sets to failure also calibrate `vlF` and the failure speed.
