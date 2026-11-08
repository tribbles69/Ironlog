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
