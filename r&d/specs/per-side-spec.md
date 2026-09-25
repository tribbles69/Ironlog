# Ironlog — Per-side logging for unilateral lifts

Roadmap D4. Written against 0.45.0. Grep `PER-SIDE`.

## Which lifts

Leaves whose execution is **unilateral** (split squat, single-arm row,
single-leg press…) and whose kind is plain reps.
- **Alternating** leaves are left out. Both sides do the same work in one
  set, so there's nothing to compare.
- Holds, carries and timed work are left out.

## Turning it on

- A **⇆ Each side** button under the set table switches the entry into
  per-side mode, and switches it back.
- The choice is remembered per variant (`S.settings.sidesOn[exKey]`), so the
  next session of that lift opens the same way.
- Turning it on gives every open set a left and right equal to its current
  weight and reps. Turning it off keeps the weight and reps and drops the
  sides. Done sets are never changed.

## What's stored

```
s.sides = { L: { w, r }, R: { w, r }, at: [w, r] }
```

- **`s.w` and `s.r` stay the counted side's weight and reps**, so every
  existing consumer is unchanged: PRs, e1RM, volume, stall checks, CSV,
  sync.
- **The counted side is the weaker one**: the lower e1RM from its weight,
  its reps and the set's RIR. On a tie it's the fewer reps, then left.
  That's the roadmap's default, and a PR then means both sides did at least
  that much.
- **A side left empty doesn't count.** Only one side filled means that
  side is counted. Neither filled means reps 0.
- **Volume** stays the counted side × reps, as a unilateral set was logged
  before: per side, not doubled.

### Keeping the two in step (`sideSync`)

Other paths still write `s.w` and `s.r` directly: the step buttons, Prev,
Copy down, autoregulation, voice, and editing a finished session. `at`
holds the `[w, r]` last written by the sync.
- When `s.w` no longer matches `at`, it was changed from outside, and both
  sides take the new weight.
- The same goes for `s.r` and reps.
- Then the counted side is picked again, and `s.w`, `s.r` and `at` are
  written.

The sync runs:
- whenever a live card draws;
- after every edit to a side;
- on every set when a session finishes or an edited one is saved.

## The live set

In per-side mode, each set row's Reps cell shows the counted reps and is
read-only. A row under the set holds:

> **L** [reps] &nbsp; **R** [reps] &nbsp; ⚖ different weights

- *Different weights* shows a weight box for each side, prefilled with the
  set weight.
- The weaker side is underlined. The main weight box sets both sides.
- A missed side (e.g. L 8, R 6) is just logged. RIR stays one number for
  the set.
- **Prev** copies last time's sides when last time had them.

## Where it shows

- **Set text** (summary, detail, share card, history): "20 kg × 7 (L 8 ·
  R 7)", and with different weights "(L 22.5×8 · R 20×7)".
- **The variant page** gets an **Imbalance** section for a unilateral
  variant with per-side sets:
  - Per session: the gap between the sides' best e1RMs, as a % of the
    stronger side, and which side was weaker.
  - The last 12 sessions as a list, with a line: "Right weaker in 5 of the
    last 6 · average gap 7%".
  - A gap under 3% reads as even.

## Not in this change

- Choosing to count the stronger side or the average (the setting would
  need to recompute stored sets).
- Per-side RIR.
- Per-side logging for alternating lifts, holds or carries.
- Imbalance on the Stats page.
