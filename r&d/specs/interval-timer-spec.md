# Interval timer (roadmap 02)

Added 2026-11-08. Work / rest intervals with an optional warm-up and
cool-down, audio and vibration cues, screen kept on, saved presets, logged as
a cardio session. Replaces INTVL on Aaron's phone.

## 1. Where it starts

**Train → ⏱ Intervals**, beside Cardio and Mobility. Blocked while another
session is live, like Cardio.

## 2. Setup sheet

- **Presets** (one tap fills the fields): Tabata 8 × 0:20 / 0:10; 30 / 30 ×
  10; 1 min on / 1 off × 10; Run intervals 6 × 1:00 / 1:30; Sprints 10 ×
  0:15 / 0:45; 4 × 4 min (4:00 / 3:00). All but Tabata have a warm-up and
  cool-down. Then the lifter's own.
- **Fields:** work, rest (m:ss or plain seconds), rounds (1–50), warm-up,
  cool-down. 0:00 skips a warm-up, rest or cool-down. Work is 5 s to 30 min.
- A line totals it: "8 × 0:20 / 0:10 — 3:50 in all" (no rest after the
  last round, §3).
- **Doing it on:** the cardio machine list (`CARDIO_MACHINES`), default
  Other. It decides which exercise it logs as, and on a treadmill or outdoors
  the distance works as in a normal cardio session.
- **Voice** on/off.
- **Save as preset** asks for a name (default the shape, "6 × 1:00 /
  1:30"). Saved presets live in `settings.ivPresets` (max 20, synced and in
  export). **Delete preset** shows when a saved one is selected and untouched.
- The last setup is remembered in `settings.ivLast`.

## 3. The schedule

Warm-up → work, rest, work, rest … work → cool-down. **No rest after the last
round** — it would only be dead time before the cool-down.

## 4. Running it

It is a **cardio session** (`kind: 'cardio'`) with `cardio.iv = { plan,
phases, idx, roundsDone }`. That reuses everything the cardio session has:
the pause-aware timestamp clock, Awake, pause / resume, discard, resume after
a reload, heart rate (connect from the session; recorded and charted) and the
safety ceiling cue if one was set. **No HR zone** is set, so the HR coach never
talks over the intervals.

A big card under the timer bar shows the phase (Warm-up / Work / Rest /
Cool-down / Done) coloured by phase, the time left in it, a progress bar,
"round 3 of 8", the total time left, and what's next.

Cues (`Cue`, and `say()` when voice is on):
- **Work starts:** high long beep + long buzz; voice "Go. Round 3 of 8" (last:
  "Last round. Go").
- **Rest / warm-up / cool-down starts:** low long beep + double buzz; voice
  "Rest. 30 seconds" / "Warm-up" / "Cool-down".
- **3-2-1:** a short tick and buzz in each of the last three seconds of any
  phase longer than 5 s.
- **All done:** the done chime; voice "Intervals done. Finish when you're
  ready". The clock keeps running until **Finish** — the lifter may keep
  walking it off.

If the screen slept or the phone lagged, the clock still reads true
(timestamps); on catch-up only the phase it's now in is announced.

## 5. What's logged

The usual cardio record, plus `cardio.iv = { plan, roundsDone }` where plan is
`{ name, work, rest, rounds, warm, cool }`. The session is named
"Intervals · <machine>". History, the calendar and the session summary show
"⏱ Tabata · 8 × 0:20 / 0:10 · 8 of 8 rounds".

## 6. Not in this version

- HR targets per phase (e.g. "rest until HR drops under 130").
- Mixed sets (different work lengths in one session), pyramids.
- Background audio with the screen locked — Awake keeps it on; a locked phone
  may miss cues (same limit as the rest timer, A4).
