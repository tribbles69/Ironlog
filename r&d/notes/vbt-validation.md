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
