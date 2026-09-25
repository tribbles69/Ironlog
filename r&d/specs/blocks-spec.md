# Ironlog — Training blocks counting down to a meet

Roadmap C6. Written against 0.40.0. Grep `RUN-IN BLOCKS`.

## What it is

An event (C2) can carry a **run-in**: an ordered list of blocks with a kind
and a length in weeks, `m.blocks = [{ kind, weeks }]`.
- Dates are never stored. They are laid out **backwards from the meet**: the
  last block ends the day before the meet, and each block before it ends
  where the next starts. Moving the meet moves the plan.
- The first block may start in the past. That just means you're already in
  it.

## Block kinds

| kind | target RIR | reps | loads |
|---|---|---|---|
| accumulation | 3 | 8–12 | autoregulated |
| intensification | 2 | 3–6 | autoregulated |
| peak | 1 | 1–3 | the plan's weights |
| taper | — | the plan's, about half the sets | the plan's weights |
| deload | 4 | the plan's, lighter | the plan's weights |

## Templates

| name | blocks |
|---|---|
| 16 weeks | accumulation 6 · intensification 5 · peak 3 · taper 2 |
| 12 weeks | accumulation 4 · intensification 4 · peak 3 · taper 1 |
| 8 weeks | accumulation 3 · intensification 3 · peak 1 · taper 1 |
| Strongman 10 | accumulation 4 · intensification 3 · peak 2 · taper 1 |

Every template is editable: change a kind, change weeks (1–12), add, remove.

## The current block

`activeBlock(date)` returns the block that contains the date, from the
nearest upcoming event that has a run-in, with its week number.

## Feeding autoregulation (autoreg spec)

- **Loads.** `autoBlock(wo)` decides whether a planned session gets
  autoregulated loads. On a date inside a run-in:
  - **Peak, taper or deload:** never. The plan's weights stand, even if a
    program calls that week a normal block. The meet plan is the lifter's
    intent.
  - **Accumulation or intensification:** yes, for program sessions in a
    normal block (as before), and now also for your own planned sessions,
    which never had it before.
- **Target RIR.** `targetRirFor(e, blockRir)` takes the program note's RIR
  first, then the block's, then 2.

Outside any run-in, nothing changes.

## Where it shows

- **The event card** (powerlifting and strongman) has a *Run-in* section:
  - a timeline bar with a segment per block and a "today" marker;
  - the current block and "week 2 of 4";
  - the next change;
  - *Plan the run-in* / *Edit* opens the editor.
- **Home**, above today's session: "Intensification · week 2 of 4 · target
  RIR 2 · 38 days to State Champs".
- **The workout screen:** the same line, plus the block's guidance (for
  taper: "keep the weights, about half the sets").

## Not in this change

Generating the sessions themselves (exercises, days). That comes from an
installed program or your own plans. A calendar shading of blocks.
