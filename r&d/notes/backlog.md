# Backlog

Things deliberately deferred, with enough context to pick up cold. Not a wish
list — each of these was raised, understood, and parked for a reason.

## Physio / rehab plans (Aaron, 2026-11-14 — after 1.0)

Let someone scan a physio's exercise sheet (or type it in) and follow it in
Ironlog. Prompted by a Wibbi sheet from Heartlands Hospital physio: three
squat variations, a dose (sets × reps × days/week) on only one of them.
Parked because new ideas wait until after 1.0.

**Before building: run a deep research pass on physio / rehab exercises**, the
same way the gym exercise library was researched, to seed a rehab exercise
database (names as physios and Wibbi-style sheets write them, standard doses,
regressions/progressions, mapping to existing `EX_DB` / mobility leaves).

Shape agreed in chat:
- **Scan → check → save.** Photo of the sheet; AI (user's own key) pulls out
  exercise names, sets, reps, holds, frequency. The lifter confirms each line.
  AI never invents a missing dose — it shows "not specified, ask your physio".
- **Its own "Rehab" plan type**, separate from training plans: no autoreg or
  progression logic touching it. The physio sets the dose.
- **Pain / difficulty score** after each session, and a one-page summary to
  show the physio at the next appointment (adherence, pain trend).
- **Reminders** matching the sheet's frequency (e.g. 5 days/week).
- **Privacy:** keep only the extracted exercises, not the photo (it carries
  hospital details and a client ID). The AI disclosure says the image goes to
  Anthropic to be read.
- Clear line: it's for following a plan a professional gave you, not for
  making one up.
- Fits alongside the Mobility start and the mobility database (`r&d/data/mobility.json`);
  holds reuse the isometric timing.

## Sleep and recovery on the workouts

Check-ins already collect sleep hours and quality, energy, soreness, stress and
bodyweight (`S.checkins`), and none of it is ever shown next to training. The
idea is a recovery strip on the session — what you slept the night before, how
you rated yourself — and eventually the relationship between that and how the
session actually went.

Worth doing carefully: "you slept badly so you lifted badly" is a correlation
that will look causal on a card, and with one lifter's data it will usually be
noise. Show the numbers next to each other before showing any conclusion.

## Sleeves, wraps and belt as gear

Knee sleeves, knee wraps and a belt recorded on a lift. The identity model
already has the machinery: `prKey` is `leafKey#sortedSplittingModifiers`, so a
modifier with `splitsPR: true` gives wrapped squats their own PR line without
touching the raw one.

The open question is the one section 8.1 of the exercise spec parked: which of
these are identity and which are notes. Wraps clearly split a PR. A belt
probably should not — almost every working set is belted, and splitting on it
would halve every history for no gain.

## Supersets and circuits

Group exercises so they are logged and rested as a block — A1/A2 alternating,
rest after the pair rather than after each. Touches the active workout render,
the rest timer, and the way `exercises[]` is a flat list with no grouping.

The data change is small (a `group` key on the entry); the interface change is
not, because the set table is per-exercise and a superset wants to interleave.
