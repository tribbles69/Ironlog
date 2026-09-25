# Ironlog — Rep range with an RIR check (double progression)

Roadmap D5. Written against 0.46.0. Grep `REP RANGE`.

## What it is

An exercise can carry a rep range, `e.range = [lo, hi]`, e.g. 8–12.
- Keep the weight until every working set reaches the top of the range at
  the target RIR or easier.
- Then add weight, and start again from the bottom of the range.

This works alongside autoregulation and doesn't replace it:
- **Autoregulated entries** (`e.auto`): the loads already come from the
  working e1RM. The range only adds its verdict, and never offers to change
  weights.
- **Everything else:** the verdict can fill in next time's weight, with one
  tap.

## Where a range comes from

In order, when a session starts (`adoptRange`) or when a card draws:
1. **The entry's own `e.range`.** Planned, repeated and program sessions
   copy it.
2. **The program note**, e.g. "3×8-12", "8–12 reps", "10 to 15 reps". It
   needs "reps" or a sets×reps form. A bare "5-3" isn't taken, and a
   four-count tempo ("3-1-1-0") never is.
3. **The range remembered for the variant** (`S.settings.rangeBy[exKey]`).
   It's saved whenever you set one in the exercise ⋯ menu.

It's set or cleared in:
- the **⋯ menu** of a live exercise: "Rep range", typed "8-12", blank to
  clear, kept for next time;
- the **planner**: a Rep range box per exercise.

A range is valid when 1 ≤ lo < hi ≤ 30.

## The verdict (`rangeVerdict`)

**Which sets:** a session's working sets of that entry, meaning ticked,
weighted, with reps, and not warm-ups, drops or AMRAPs. The verdict looks at
the sets at the **heaviest weight used**. Back-off sets at a lighter weight
don't hold progress back.

**Target RIR:** `targetRirFor(e, block RIR)`, as autoregulation uses it.

| verdict | when | says |
|---|---|---|
| **up** | every set at that weight reached `hi`, and every one with RIR logged is at the target RIR or more | add weight next time, and go back to `lo` reps |
| **build** | not *up*, and the first set at that weight reached `lo` | same weight, add reps |
| **below** | the first set at that weight fell short of `lo` | stay until you reach `lo`, or drop the weight |

- Reaching the top at a lower RIR than the target (a grind) is *build*: the
  reps got there, but not at the effort the plan asked for.
- Sets with no RIR logged are judged on reps alone, and the line says "no
  RIR logged".

**Next weight on *up*:**
- the heaviest weight + 2.5%, rounded to loadable (`roundLoadFor`);
- at least one step: 2 kg for dumbbells and kettlebells (per hand), 2.5 kg
  otherwise.

## Where it shows

- **The live card**, a line under the PR banner: "8–12 reps · target RIR 2",
  then one of:
  - **While there are open working sets**, the verdict from the last session
    of this variant: "Last time 40 kg — top of the range → try 42.5 kg × 8".
    For *up* on a non-autoregulated entry there's a **Use** button. It sets
    the open working sets to that weight with `lo` reps, and clears their
    `auto` marks.
  - **Once all working sets are ticked**, today's verdict: "Top of the
    range at RIR 2 → next time 42.5 kg".
- **The finish summary**: a *Next time* section with one line per ranged
  exercise.

## Not in this change

- Per-set ranges (e.g. a top set at 4–6 and back-offs at 8–10).
- Automatically writing the new weight into future planned sessions. The
  lifter takes it with Use.
- Ranges on holds, carries and timed work.
