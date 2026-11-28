# Ironlog — Loaded carries, sleds, medleys and strongman events

Roadmap B1. Written against 0.27.1. Line numbers drift — grep.

---

## The problem

Ironlog logs weight × reps, or a duration. Strongman is mostly neither: a yoke
run is a weight carried a distance in a time; a medley is several implements
over a course against the clock; a stone series is five stones, each made or
missed, and a total time; "max reps in 60 s" is reps under a clock. Today all of
that goes in notes, so none of it is charted or beaten.

## Decisions

**Shapes, not new identity.** How a set is recorded is a property of the
movement (`metric` in the catalogue) or, for the two modes that apply to any
lift, of the entry — the same rule the isometric flag set (`iso`). No new leaf
axis; implements are **equipment**, which the leaf model already has.

| shape | where it comes from | set fields | PR pool |
|---|---|---|---|
| reps | default | `w`, `r`, `rpe` | the leaf (unchanged) |
| time | `metric: 'time'`, or `e.iso` | `w`, `sec` | the leaf / `|iso` |
| **carry** | `metric: 'carry'` | `w`, `m` (metres), `sec` | the leaf |
| **race** | `metric: 'race'` | `w` (heaviest), `n` (implements), `m`, `sec` | the leaf |
| **reps in a cap** | `e.cap` = seconds, on a reps or carry lift | reps: `w`, `r` · carry: `w`, `m` | `leaf|cap60` — its own pool |
| **stone series** | `e.series` on a reps lift | `w`, `r` 1 = made / 0 = missed · `e.seriesSec` | made stones are singles in the leaf's pool; the series has its own record |

Absent fields mean "not recorded", as with `r: null` on holds. Distances are in
**metres**, weights in kg, times in seconds — stored; shown as m:ss.

**Records are derived at read time**, like every other PR:

- carry — *fastest* time for the same weight **and** distance; *furthest*
  distance at a weight (any time). A set with only a time and no distance (old
  farmers-carry logs) still counts toward the longest-hold record it had.
- race — fastest time for the same heaviest weight, implement count and
  distance.
- cap — most reps (or furthest distance) at a weight in the same cap.
- series — most stones made in a series; ties go to the faster time.

A new PR is a beaten record, or the first result at a heavier weight than any
before (the hold rule). First-ever results are "first time", not PRs.

**PRs show up everywhere loads do**: the live banner and tick toast, the
session summary, the calendar/session card chips and `summary.prs`. `prsFor`
gains these alongside reps, so a yoke PR is a gold chip like a bench PR.

**None of these reach e1RM, autoregulation, stall detection or plausibility**
— a 60 s AMRAP or a stone series is not a rep max.

## Equipment (implements)

Added to the vocabulary, with icons: `log`, `axle`, `yoke`, `keg`, `sandbag`,
`stone`, `farmers_handles`, `sled`, `conan_wheel`. No attachments. Farmers
handles load per side (two implements), like dumbbells.

## Movements

- **Carries** (`metric: 'carry'`): Farmers Carry (was `time`; gains
  `farmers_handles`), Yoke Carry, Sandbag Carry, Keg Carry, Sled Push (was
  `time`; gains `sled`), Sled Drag (was an alias of Sled Push), Ruck, Conan's
  Wheel.
- **Loads** (reps, series-capable): Atlas Stone, Keg Load, Sandbag Load.
- **Presses/pulls**: Log Press (`log`); `axle` added to Overhead Press and
  Deadlift (aliases *Axle Press*, *Axle Deadlift*).
- **Races** (`metric: 'race'`): Loading Race, Medley.

Existing timed farmers/sled logs keep working: a carry set with a time and no
distance reads as before.

## Logging

- Carry row: `kg · m · time`. Race row: `kg · n · m · time`. Inputs in one
  flex cell so the table keeps its columns.
- **Time cap** (exercise menu, reps and carry lifts): *Log as max reps in…*
  60 s default, editable. Reps rows lose RIR (it's max effort); carry rows lose
  time (it's the cap).
- **Stone series** (exercise menu, reps lifts): rows become `kg · made/missed`;
  a *Series time* field sits under the table. Missed stones are kept (they're
  part of the series) but never count as lifts.
- The hold timer (⏱) works on carry and race rows: count up, stop, the time
  lands in the row.

## Not in this change

Strongman as an event type with its own scoring (C2). Per-side logging (D4).
Structured tempo (D3).
