# Ironlog — Structured tempo

Roadmap D3. Written against 0.44.2. Grep `STRUCTURED TEMPO`.

## What it is

A tempo is four counts on an exercise entry, `e.tempo = "3-1-1-0"`:
1. **down**: the eccentric, in seconds;
2. **bottom pause**;
3. **up**: the concentric;
4. **top pause**.

Each count is a digit 0–9, or **X**, meaning as fast as possible.

- It belongs to the entry (the exercise in this session), like the modifier
  chips, not to single sets.
- It **never splits the PR leaf**: `exKey` ignores it, as it ignores
  modifiers. A 3-1-1-0 squat counts toward the same PRs as any squat. The
  tempo is on the record so the lifter can see why the number was lower.
- The existing *Slow eccentric* modifier stays. It's a tag for when the
  exact counts weren't set.

## Parsing (`parseTempo`)

These are accepted, and stored normalised as `d-d-d-d`:
- `3-1-1-0`, `3110`, `31X0`, `3/1/1/0`, `3 1 1 0`;
- three counts (`3-0-1`), which get a top pause of 0;
- a lower-case `x`.

It's refused (no tempo) when:
- any count isn't a digit or X;
- there are fewer than three counts or more than four;
- all four counts are 0.

## Where it comes from

- **The modifier picker.** A *Tempo* section at the top has:
  - four one-character boxes: Down, Pause, Up, Top;
  - presets: 3-1-1-0, 3-0-1-0, 4-0-1-0, 2-1-X-0, 5-0-1-0, 3-3-X-0;
  - *No tempo*.

  Blank boxes count as 0 once any box is filled.
- **Notes and typed modifiers, when a session starts** (`adoptTempo`). An
  entry with no tempo takes one from its note, or from a modifier the lifter
  typed (e.g. "3-0-1 tempo"); that typed modifier is then dropped as a
  duplicate. The note must look like a tempo, not a set scheme ("5-3-1" is a
  program), so it needs one of:
  - an X;
  - four counts;
  - the word "tempo".
- **Repeat and planned sessions** copy the entry, so the tempo comes along.
  A new session of the same lift doesn't inherit it. Tempo work is a choice,
  like the other modifiers.

## Where it shows

- **The chip row** (live session and edit): a *Tempo 3-1-1-0* chip before
  the modifiers. Tapping opens the picker.
- **On the active set**, under the set table:

  > **3 · 1 · 1 · 0** down 3 · pause 1 · up 1 — set 2: 5 reps ≈ 25 s under tension

  - One rep = the sum of the counts, with X counted as 1 s. Time under
    tension is reps × that. With no reps entered yet, it says per rep.
- **Summary, session detail and history lines:** "tempo 3-1-1-0" with the
  modifiers.
- **Full share card:** the tempo after the exercise name.
- **CSV:** the tempo is added to the readable `modifiers` column. The value
  itself round-trips in `exercise_extra`, as any new entry field does, so
  the file format doesn't change.

## VBT fills in the real time

- Slew already times each rep's concentric, and the eccentric when it saw
  one. `packVbt` now keeps both per rep, in seconds to 0.1: `con` and `ecc`.
- On an entry with a tempo:
  - the VBT strip adds each measured set's mean down and up times;
  - the tempo line shows the latest measured set against the plan: "measured
    set 1: down 2.4 s · up 0.8 s".
- **Honest flag:** down more than 1 s shorter than planned shows in gold,
  "faster down than planned". A concentric slower than planned is not
  flagged: slowing under load is expected, and X is intent, not a target.
- Sets measured before this change have no timings and show nothing.

## Not in this change

- A metronome or audio pacer for the counts.
- Tempo on individual sets.
- Tempo-adjusted e1RM or PR lines.
