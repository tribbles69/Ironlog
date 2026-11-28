# Ironlog — Events page: a meet-day companion

Roadmap C2. Written against 0.36.0. Grep `EVENT_TYPES`, `meetCard`,
`openMeetDay`.

## Already there (not changed)

- **Event types** (`EVENT_TYPES`): powerlifting, strengthlifting, single
  lift. Each declares its lifts and scoring.
- **Several events at once**, each with a countdown, goal total, progress and
  predicted placing.
- **Attempt plan per lift:**
  - It follows your latest tested single (`attemptsFor`), or is pinned to
    the hand-entered numbers.
  - Opener = tested × `openerPct` (90% by default). Third = the higher of the
    goal and the test. Second sits 55% of the way between.

## What C2 adds

### 1. Attempt strategies

Each event has `m.strategy`:

| | opener | second | third |
|---|---|---|---|
| **conservative** | opener % − 3 | 50% of the way | the lower of the goal and the base |
| **standard** (default) | opener % | 55% of the way | the higher of the goal and the base (today's rule) |
| **aggressive** | opener % + 2 | 60% of the way | the higher of the goal and base × 1.025 |

- **The base** is the latest tested single. With no test, it's the best e1RM
  of the last 12 weeks (working sets only), cut to the platform % in
  Settings. The card says which one was used.
- **Standard** is today's behaviour exactly, so no existing plan moves.
- **Pinned** plans ignore strategy, as now.

### 2. Bodyweight against the class, on the run-in

The weight class is parsed from `m.wclass`: "83kg" and "83" both mean a
limit of 83; "120+" means no limit. The card shows:
- the latest bodyweight;
- the distance to the limit (or to `bwTarget` when set);
- the change over the last 14 days of check-ins;
- the weekly change still needed.

It goes gold when you're over and the trend isn't getting you there by meet
day.

### 3. Meet day (`openMeetDay`)

A **Meet day** button on each upcoming event card opens a full-screen sheet
with three tabs. Everything is stored on the event as `m.day`, so it survives
a closed app mid-meet.

**Warm-ups.** Pick the lift, then enter:
- the flight start time (clock);
- lifters in the flight, and your place in the order;
- minutes per attempt (1 by default).

The opener time is start + (place − 1) × minutes. The ramp to the opener
comes from `warmupRamp`, rounded to loadable plates as in B4. It is scheduled
backwards from the opener using each step's rest, and shown as clock times
with the plates for each step.

**Attempts.** For each lift, three attempts:
- the weight, prefilled from the plan and editable, since the next attempt is
  often chosen on the day;
- three light buttons, each tapping through none → white → red;
- two or more whites make a good lift. Two or more reds, or any red with no
  more than one white, make a no-lift.

Live figures:
- each lift's best good attempt;
- a subtotal, then the total;
- **DOTS** (powerlifting) and **IPF GL**, classic coefficients, from the
  weigh-in bodyweight entered at the top (falling back to the latest
  bodyweight);
- a missed lift shows as a bomb-out warning until the next attempt lands.

**Checklist.**
- Rack heights: squat rack, squat safeties, bench uprights, bench safeties
  (free text, e.g. "7 / in 2").
- A gear list with defaults: singlet, belt, knee sleeves, wrist wraps,
  shoes, deadlift socks, chalk, ID / membership card, food and drink.
  Items can be added or removed; ticks are kept per event.

**After the meet:** *Save results as tested singles* writes one `tested`
session, dated to the event, holding the best good lift of each lift. Openers
for the next event then follow it.

### 4. Strongman shows (new event type `strongman`)

`scored: 'points'`, no fixed lifts. The event holds `m.events`:
`[{ id, name, key?, rule, w, target, cap }]`, where `key` is an optional
leafKey (so prep can read your history) and `rule` is one of:

| rule | means | target |
|---|---|---|
| `max` | heaviest (log for max, deadlift for max) | — |
| `reps` | most reps at `w` in `cap` s | — |
| `time` | fastest over `target` m at `w` (carries, medleys) | metres |
| `distance` | furthest at `w` in `cap` s | — |
| `hold` | longest hold at `w` | — |

**The card** lists each event with its rule in words and your best from
history for that leaf and shape:
- the heaviest set, or e1RM for `max`;
- the most reps (for a capped entry, only in that cap);
- the fastest carry at that weight and distance;
- the longest hold at that weight.

It also shows when you last trained it, so the run-in can be steered at
exactly those events.

**Meet day** has one row per event: your result (weight, reps, distance or
time, as the rule asks) and your placing. Points = field size + 1 − placing,
with the field size entered once. Total points are shown.

Strongman can be added from *Add event*, and the welcome's "Strongman" choice
now opens it.

### 5. Para powerlifting (roadmap C3, added in 0.38.0)

This is an event type (`para`) using the WPPO rules as the roadmap lists them.

- **Bench press only.** The class is picked from the WPPO list for your sex in
  the profile:
  - men: 49, 54, 59, 65, 72, 80, 88, 97, 107, 107+ kg;
  - women: 41, 45, 50, 55, 61, 67, 73, 79, 86, 86+ kg.
- **Attempts are planned in whole kilograms** (`attemptRound`). On meet day
  there are three attempts plus an optional **record attempt**, with its
  own lights.
- **Warnings, which never block:**
  - an attempt can't be lighter than the one before;
  - a para attempt is whole kilograms;
  - after a good lift the next is at least +1 kg;
  - a record attempt is at least +0.5 kg over the best good lift.
- **Results:** the best lift, and the total of good lifts (the sum of the
  good attempts among the three). The record attempt counts toward neither.
  *Save results as tested singles* uses it when it was good and heavier.
- No DOTS or GL.

## Not in this change

- Other lifters' attempts or a live scoreboard.
- Equipped GL coefficients.
- Automatic next-attempt picks.
