# Ironlog — Autoregulated programming (RIR-driven)

Roadmap item 4. Written against 0.20.0. Line numbers drift — grep.

---

## What it does

The program says *what* to do — exercises, sets, reps, and the shape of the
session (a top set and lighter back-offs, say). **RIR decides the load.** Each
exercise has one working number, and the day's weights come from it and the
target RIR, not from a week-by-week table.

## Decisions (Aaron, 2026-09-24)

- **Override normal weeks only.** Sessions from an installed program whose
  block is a normal training block get their weights set by autoregulation
  when started. Deload, prep, peak, test, meet, taper, opener, recovery,
  light, speed/technique and holiday blocks keep the planned weights — those
  weeks are shaped on purpose.
- **Adjust set to set.** A working set logged easier or harder than the target
  RIR re-sets the weight of the remaining sets of that exercise.

## The model

**The working number is an e1RM, not a weight.** One flat number per exercise
that covers any rep target: the day's load for `r` reps at `t` RIR is the
inverse of the app's own `e1rm()` —
`load = e1 / (1 + min(r + t, 12) / 30)`. So a 5s week and an 8s week come off
the same number, and "one flat mid-point working weight" is simply that
number read at the session's reps. It is also exactly what VBT's daily e1RM
(item 7) produces, so that plugs in as a second input to the same number
(`autoE1()` is the one place to blend it).

**Derived at read time, never stored.** Like PRs: from history, so edits,
deletes and imports are reflected with no bookkeeping.

- **Session estimate:** the median `e1rm(w, r, rpe)` of the session's
  completed working sets that have RIR logged. Sets with no RIR can't
  autoregulate and don't count (a set without RIR reads as RIR 0 and would
  drag the number down). Backfilled sessions don't count — they're the plan's
  prescription, not a report.
- **Working e1:** weighted mean of the last 3 session estimates, newest
  weighted 3 : 2 : 1, skipping off days.
- **No history yet:** the plan's weights stand, and set-to-set adjustment
  still works from the first RIR-logged set.

**Target RIR** per exercise, whole numbers: from the program note ("stop 1
shy" → 1, "stop 2 shy" → 2, "RIR 2" / "@2") else **2**. Shown as the RIR
field's placeholder.

## Starting a session

`startPlanned` → for a normal-block program session, each loaded rep-based
exercise gets `e.auto = { t, e1, planTop }`:

- `top` = heaviest planned working set. Day top load = `load(e1, top.r, t)`.
- Every working set keeps the plan's ratio to the top:
  `w = round(dayTop × planned w / planned top)`, rounded to 2.5 kg (2 kg for
  dumbbells and kettlebells). Sets carry `auto: true` and `planW`.
- Timed, isometric and bodyweight (w = 0) exercises are left alone.

## Set to set

When a working set of an `e.auto` exercise is ticked **with RIR logged**:

- day e1 = median e1 of the RIR-logged sets done so far this session;
- each remaining undone set still marked `auto` is re-set from it, with the
  plan's ratio, the change capped at ±7.5 % per step;
- a toast says what moved ("Next sets → 140 kg · last set RIR 3, target 1").

Typing a weight into a pending set clears its `auto` — a manual weight is
never overwritten.

## Off days

A **"nope"** toggle on the live session (and in Edit on a finished one) marks
it `off: true`. Off sessions are **excluded from progression** — they never
feed the working e1 or the stall check — and **don't reset the stall counter**:
they're invisible to it, so the window just reaches past them. In-session
adjustment still runs on an off day (that's when it's most useful).

## Stall detection

From the last 5 non-off sessions with an estimate: **stalled** when none of
the last four beats the first by more than 1 %. Shown on the live exercise
card ("Stalled · 5 sessions") with a nudge to deload or swap a variation.
Flag only — it never changes weights on its own.

## RIR whole numbers

RIR input rounds to whole numbers on entry (live and edit). Storage stays RPE
via `rirToRpe`, as ever.

## Not in this change

- VBT input (item 7) — `autoE1()` is the hook.
- Changing `program.json` itself. The plan keeps its weights; they're the
  fallback and they still drive the fixed blocks.
