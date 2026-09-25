# Ironlog — Recovery heatmap on the skins

Roadmap D7. Written against 0.48.0. Grep `RECOVERY`.

## What it is

The Muscle map on Stats gains a second mode:
- **Strength** (as before): each muscle painted by its rank tier.
- **Recovery**: each muscle painted by how much recent training is still in
  it, from fresh to smashed.

The same skin sheet paints both, using the tier rows as intensity:
- fresh is the unpainted ("none") row;
- the five tiers step up to the most fatigued.

The body itself (the `base` layer) keeps its strength tier in both modes.

The mode is remembered in `S.settings.mapMode`. It defaults to Recovery
when you've trained in the last 7 days.

## The model (`fatigueMap`)

Derived at read time, never stored. It covers the completed sessions of the
**last 7 days**, plus the ticked sets of the live session. Cardio is left
out.

**Per set:** the effort, scaled by the time since and by each muscle's
share:

- **Effort by RIR:**

  | RIR | effort |
  |---|---|
  | 0–1 | 1.0 |
  | 2 | 0.85 |
  | 3 | 0.7 |
  | 4+ | 0.55 |
  | not logged | 0.8 |

  - Warm-ups count 0.
  - Drop sets count × 0.6.
  - Holds, carries and timed sets count when logged, at their RIR, else 0.8.
- **Muscle share:** `exMuscles(name)`, the same shares the share card and
  strength map use.
- **Decay:** `exp(−hours / τ)`.
  - **Large muscles** (quads, hamstrings, glutes, lower back, lats, chest,
    upper back): τ = 36 h, so about 13% is left after 3 days.
  - **Small muscles** (delts, arms, forearms, traps, calves, abs): τ = 24 h.

  A session's time is its end, else its start, else noon on its date.

**Fatigue F** is the sum over sets: roughly "hard sets still in the
muscle".

| F | level | word |
|---|---|---|
| < 0.5 | 0 | fresh |
| 0.5–1.25 | 1 | lightly worked |
| 1.25–2.25 | 2 | recovering |
| 2.25–3.25 | 3 | tired |
| 3.25–4.5 | 4 | fatigued |
| ≥ 4.5 | 5 | smashed |

Calibration: eight hard quad sets (squat plus leg press) read smashed right
after, tired the next day, recovering on day 2, and fresh after about 3½
days.

**Fresh in:** `τ · ln(F / 0.5)` hours.

## Honesty about the shares

Most of the shares come from a hand-set table (`EX_MUSCLE`) covering the
common barbell, dumbbell and cable lifts. Everything else is derived from the
catalogue's primary and secondary muscles, which is a placeholder.
- If a muscle's fatigue comes mostly (over 30%) from derived shares, its
  tap text says "estimate — muscle split not checked".
- The card says how many of the week's lifts use derived shares.
- `r&d/notes/muscle-shares-check.md` lists the lifts in the installed
  program and the lifter's recent history, with their current shares and
  whether they're hand-set, so they can be checked. The roadmap item stays
  "provisional" until that's done.

## Where it shows

- **Stats → Muscles → Muscle map.** Recovery shows even with no bodyweight
  or ranked lifts yet. The map has:
  - A **Strength / Recovery** switch.
  - In Recovery, a legend: Fresh · Light · Recovering · Tired · Fatigued ·
    Smashed.
  - Tapping a muscle gives, e.g., "Quads · tired · fresh in ~31 h — Back
    Squat (Tue), Leg Press (Tue)".
- **The exercise picker** (live session and planner): a line at the top such
  as "Still tired: Quads, Glutes · Recovering: Lower back". Each lift has a dot
  for its most-worked primary muscle: green fresh, gold recovering (1–2), red
  tired or worse (3+). The dot's label says which muscle.

## Not in this change

- Personal recovery rates, or learning τ from performance.
- Sleep, soreness or `feel` feeding the model (C5 data could later).
- Recovery on Home.
