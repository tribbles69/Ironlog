# Raw VBT traces

Bar-speed debug exports from Aaron's phone (Settings → Debug mode, format
`ironlog-vbt-raw`, v2): the phone's full 3-axis readings at 60 Hz per set, what
Measure detected, and the set as logged. For roadmap **00-V1** (tilt
correction) and **00-V2** (bar-speed RIR accuracy). Add new exports here with
the date in the file name; don't edit the originals.

## ironlog-vbt-raw-2026-11-11.json — 20 traces

**9 Nov, Wk 4 · Push (9 traces):** overhead press (warm-up, 1 unlogged set,
set 2) and incline bench (three profile-mode warm-ups at 20/30/40 kg, sets
1–3). Heavier real working sets. Detected rep counts in these traces are low
(0–3 on most sets), so re-run them through the current `slew-core.js` before
comparing; 0.89–0.90 claim 80 of 81 reps on this day.

**11 Nov, Accessory day (11 traces):** recorded on purpose to teach Measure
each movement. **Home barbell, 5 kg**, every set phone on the bar, set mode.
Light weight, so speed is about movement shape, not effort.

| Time | Logged as | Logged reps | Detected | Lift profile in trace |
|---|---|---|---|---|
| 09:31 | Biceps Curl set 1 | 6 | 8 | none |
| 09:32 | Biceps Curl set 2 | 6 | 7 | none |
| 09:33 | Romanian Deadlift set 1 | 6 | 6 | Deadlift (conv.) |
| 09:34 | Romanian Deadlift set 2 | 6 | 8 | Deadlift (conv.) |
| 09:34 | Overhead Press set 1 | 6 | 7 | Overhead press |
| 09:35 | Overhead Press set 2 | 6 | 8 | Overhead press |
| 09:36 | Back Squat set 1 | 6 | 7 | Squat (free bar) |
| 09:36 | Front Raise (barbell) set 1 | 5 | 7 | none |
| 09:37 | **not logged** — probably the overhead triceps extension Aaron planned (check with him) | ? | 6 | none |
| 09:37 | Bent Over Row set 1 | 6 | 6 | Row / pulldown |
| 09:38 | Bent Over Row set 2 | 6 | 6 | Row / pulldown |

What this shows at a glance:
- **Over-counting on arcs and light loads:** curls, front raise, OHP and squat
  all detected more reps than were done. Straight-line pulls (RDL set 1, rows)
  were right. The arc moves (curl, front raise, triceps extension) rotate the
  phone the most, so they're the main test set for tilt correction.
- **No lift profile for curl, front raise or triceps extension** (`lift: null`)
  — Measure falls back to a default. Decide whether these need profiles or a
  generic "arc" mode.
- RIR values on this day (OHP @0, row @9 then @0, squat @4.5) were tapped in
  quickly and aren't real effort ratings — don't use them for 00-V2.
