# Planned cardio and mobility (roadmap 000-F1)

Written 2026-11-27 on request: "a cardio overhaul allowing them to be
planned alongside, within and separately from other gym sessions. Allow the
same for planned flexibility sessions too." **Agreed 2026-11-27** — decisions in §8.

Why now: plans are lift-only. A timed cardio row in `program.json` loses its
target on install (`training.js` `installProgram` gives a planned time to
isometric holds only), and the HR-zone session, interval timer and mobility
player can only be started by hand from Train. So "10 min bike on Monday and
Thursday" or "Cossack squats in the leg-day warm-up" can't be planned.

## 1. Three placements

Each works the same for cardio and mobility.

| Placement | What it is | Example |
|---|---|---|
| **Within** | An add-on inside a planned lift session, placed `start` (warm-up) or `end` (finisher) | 2 × 8 Cossack squats per side before Smith squats; 8 min row intervals after upper |
| **Alongside** | Its own planned session on the **same day** as a lift session | Bike before work on Monday, push at 2pm |
| **Separately** | Its own planned session on a **day with no lift** | Saturday 30 min walk; Sunday stretch routine |

Alongside and separately are the same object. The only difference is whether
a lift is planned that day, which the calendar and Home show (§5).

## 2. Data

### Separate sessions (alongside / separately)

A planned workout with the `kind` it already gets when it is logged:

```js
{ id, date, status: 'planned', prog?, name, kind: 'cardio',
  plan: { machine: 'stationary-bike',          // CARDIO_MACHINES id
          mode: 'steady' | 'zone' | 'intervals',
          min: 20,                              // steady / zone: target minutes
          zone: 'z2',                           // zone only: a cardio-spec preset or {lo, hi}
          iv: { preset?, work, rest, rounds, warm, cool },   // intervals only, interval-timer-spec §5 shape
          slot?: 'am' | 'pm' } }               // optional label, ordering only

{ id, date, status: 'planned', prog?, name, kind: 'mobility',
  plan: { routine: 'evening-stretch' } }       // one of the lifter's routine ids
```

**Start** opens the existing setup with these values filled in (cardio
setup, interval setup or the mobility player). On finish the planned record
**becomes** the logged one: same id and date, the usual `cardio` / `mobility`
object, `status: 'completed'`. It isn't a second record next to it, so
nothing downstream changes (cardio-spec → Decisions, mobility-spec §1).

### Add-ons within a lift session

**As built (0.100.0):** add-ons live in their own list on the workout,
`w.addons`, never in `exercises`. Code that walks lifts (PRs, volume, weekly
sets, recovery, autoreg, backfill) never sees them, so none of it needed
changing. (The first draft put them in `exercises` behind an `isBlock` check
in every walker; a separate list is the safer version of the same idea.)

```js
w.addons = [
  { id, kind: 'cardio', at: 'start' | 'end', name?, plan: { ...as above... },
    done?, skipped?, result?: { wid, sec, distKm, avgHr, inZoneSec, hrSec, rounds? } | { sec, asPlanned: true } },
  { id, kind: 'mobility', at: 'start' | 'end', name?, rid?,
    plan: { routine: 'id' } | { name, items: [{ id, dose? }] },
    done?, skipped?, result?: { n, total } },    // result written at Finish
]
```

- In a program file an add-on is written inside `exercises`, as an entry
  with `cardio` or `mobility` instead of `name` (§4). `installProgram`
  lifts it out into `addons`. Before the first lift it's a warm-up (`start`),
  after one it's a finisher (`end`), unless `at` says otherwise.
- `items` lists mobility-library ids (`MOBILITY_LIBRARY`) with an optional
  dose. The first time one runs it becomes one of the lifter's own routines
  (`S.routines`, `fromPlan: true`, found again by its contents), so ticks,
  swaps and the guided player work as they do for any routine.
- A lift exercise can still be planned as a warm-up the normal way (e.g.
  `Cossack Squat` with `type: 'warmup'` sets). An add-on is for things logged
  as a drill or as cardio, not as sets × kg.

## 3. In the live session

- An add-on is a card before the first exercise (warm-up) or after the last
  (finisher): **▶ Run**, **✓ Done as planned**, **Skip**.
- **Cardio ▶ Run** opens the cardio or interval setup with the plan filled
  in. Start **parks** the lift: it moves to `S.parked` and the cardio becomes
  `S.active` as usual, so the existing player, its reload recovery and its
  record all work unchanged. The cardio record is saved as normal (marked
  `addonOf`, with no `prog`, so it isn't counted twice). Finish or Discard
  brings the lift back as `S.active`. Finish writes the numbers onto the
  add-on. Nothing else can start while a lift is parked. `S.parked` is
  local, like `S.active`, and the data migrations scan it too.
- **Mobility ▶ Run** opens the routine player (a modal; it never blocks).
  Ticks log the day's mobility session as usual. The card reads its progress
  from that session. **✓ Done as planned** ticks every item.
- **Cardio ✓ Done as planned** records the planned minutes with no heart
  rate (`asPlanned`). It doesn't create a separate cardio record.
- At Finish each add-on is saved as it ended. A mobility add-on that's only
  part done keeps its count and isn't marked done.

## 4. In the plan formats

### Full program files (`workouts`, the shape `installProgram` takes)

- `workouts[]` items may carry `kind: 'cardio' | 'mobility'`, `slot` and a
  `plan` (§2) instead of `exercises`.
- `exercises[]` items may be add-ons: `{ "cardio": {plan} | "machine", "at" }`
  or `{ "mobility": {plan} | [ids] | "routine id", "name", "at" }`. A
  workout may also give `addons` directly.
- Cardio plans: `machine` is a `CARDIO_MACHINES` id. Common names are
  understood (`normMachine`, e.g. `rowing-machine` → `rower`). `iv` is
  `{ work, rest, rounds, warm, cool, name?, preset? }` in seconds.

### `ironlog-plan` v1 (plan-format.md)

Kept at version 1, since these are additions and old plans still read the same:

```json
"days": [
  { "name": "Push", "exercises": [
      { "mobility": ["cossack-mob", "weighted-ankle-mob"], "at": "start" },
      { "name": "Bench Press", "sets": 3, "reps": 5, "rir": 2 },
      { "cardio": "rowing-machine", "intervals": "30/30 x 10", "at": "end" } ] },
  { "name": "Morning bike", "kind": "cardio", "cardio": "stationary-bike", "minutes": 20, "zone": "z2" },
  { "name": "Stretch", "kind": "mobility", "routine": "evening-stretch" }
],
"weekdays": ["mon", "mon", "thu", "thu", "sun"]
```

- A weekday may repeat. That is how two sessions on one day are written
  (alongside). They run in list order; `"slot": "am"` / `"pm"` sets the order
  explicitly.
- `"intervals"` accepts a preset name ("Tabata", "4 × 4 min") or
  `"work/rest x rounds"`.
- Unknown machine, routine or drill → the check screen flags it and offers
  Other cardio / the nearest library match, like unknown exercises today.
- Update `planFormatText()` and this file's mirror in plan-format.md together.

## 5. Where it shows

- **Calendar:** cardio days get the cardio dot and mobility days the purple
  dot, as logged ones do now, plus the planned dot while it's planned. A
  day with a lift and a separate cardio session shows both. An add-on shows
  only inside its lift session.
- **Home and Train → today:** every planned session for today in slot order,
  each with its own Start: "AM · 🚲 Bike · 20 min Z2 · Start" above "PM ·
  Push · Start". Starting one doesn't hide the others. Cardio can't be live
  at the same time as a lift (as now). Mobility never blocks anything (as now).
- **Skip / Move** work on planned cardio and mobility like on planned lifts.
- **Backfill** (flipping past planned sessions to completed) **leaves cardio
  and mobility alone**, because there's no honest number to fill in. They
  stay planned and become skips.

## 6. Counting

- Logged cardio and mobility count as they do now (mobility doesn't count as
  a training session; cardio does).
- **Adherence** gets a line per kind: "Lifts 9 / 10 · Cardio 3 / 4 ·
  Mobility 5 / 7". Add-ons count towards their kind, not towards the lift.
  A done session counts whenever it was done; a planned one counts once its
  day has passed. On the program sheet (`adherenceText`).
- The coach's suggested changes and Tailor it don't touch add-ons or
  cardio/mobility sessions in v1.

## 7. Built in this order (shipped together in 0.100.0)

1. `installProgram` carrying `kind`, `plan` and add-ons; planned cardio/mobility on the
   calendar, Home and Train with Start filling the setups. **Separate
   sessions work end to end after this step.**
2. Add-ons in the live session: card, ✓ / Skip, then ▶ Run with the player as
   a layer (mobility guided first, then intervals, then HR-zone).
3. `ironlog-plan` additions, `planFormatText()`, the check screen.
4. Adherence lines; export / CSV / Drive sync round-trip checked with a plan holding add-ons and side sessions.
5. ~~The shipped plan: morning bike/row sessions and a leg-day warm-up.~~
   Done in 0.100.1; since 0.100.7 the app ships no plan at all (the
   maintainer's is a plan file kept outside the repo).

## 8. Decisions (2026-11-27)

1. **Pre-1.0**, as a base feature (section 000).
2. **The full player runs inside a lift session in the first build** (§3):
   mobility guided, intervals and HR-zone.
3. **A skipped planned cardio or mobility session counts against adherence**
   the same as a skipped lift.
