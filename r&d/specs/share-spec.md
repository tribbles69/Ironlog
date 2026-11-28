# Coach report and PR cards (roadmap E1, E2)

Written 2026-10-31 when Aaron asked for E1 and E2 together. Both are about
getting training *out* of the phone, with no accounts and no server.

## E1. Coach report (0.63.0)

**Tools → Share → Coach report.** A read-only summary of a stretch of
training for a coach, physio or training partner.

### Range
Last 4 weeks (default), 8 weeks, 12 weeks, or *Custom* (from / to dates).
Only completed sessions inside the range count. Mobility days are listed as
a count, not as sessions.

### Options
- **Warm-ups** — off by default; a coach mostly wants working sets.
- **Notes** — on: session and set feel notes, exercise notes, check-in notes.
- **Check-ins** — on: bodyweight, sleep, energy, soreness averages.

### Content (same order in every format)
1. **Header:** "Training report", the handle if set, the range, the date it
   was made, "Weights in kg|lb · effort as RIR (reps in reserve)".
2. **Summary:** sessions, sessions per week, working sets, total volume,
   average session length; bodyweight first → last in range; averages of
   sleep, energy and soreness from check-ins.
3. **Main lifts:** each priority lift — best e1RM in the range, the best
   before the range, the change, and the top set in the range.
4. **PRs in the range** (from `prsFor`, so shapes — holds, carries — too).
5. **Session log**, oldest first: date, name, duration, then each exercise
   with its sets. Runs of identical sets collapse: `100 × 5 @ 2 RIR ×3`.
   Cardio sessions are one line (time, distance or machine readout, avg HR).

### Formats
- **Share text** — plain text through the share sheet; *Copy* where sharing
  isn't available. Fits a WhatsApp message to a coach.
- **PDF** — the report as a styled page in a hidden frame and the browser's
  Print → Save as PDF. Light, black on white, A4-friendly.
- **JSON** — `{ app, version, made, range, units, sessions, checkins,
  priority }`: the raw sessions (as stored) and check-ins in the range, for
  a coach with their own tools.

Nothing is stored; the report is built each time.

## E2. Share cards — PR card (0.63.0)

Session cards (Quick, Full detail, cardio) shipped earlier. E2 adds the
missing one: **a single PR as an image**.

- 1080 × 1350 (4:5, fits an Instagram post without cropping).
- Date; "★ PERSONAL RECORD" in gold; the lift's full name with its
  variant; the number large (`180 kg × 3`, or a hold / carry label); e1RM
  and the gain on the previous best; an e1RM history line for that lift with
  this PR's point in gold; the handle (Settings) or IRONLOG at the foot.
- **Where:** the session-complete sheet (a Share button on each PR) and the
  PR timeline in Stats (tap a row's ↗).
- Preview first, then *Share* or *Save image*, like session cards. The share
  and download plumbing is shared (`shareImage`).
