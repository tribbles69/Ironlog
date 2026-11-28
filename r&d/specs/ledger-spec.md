# E16 — The Honest Ledger

Asked for by Aaron, 2026-11-09 (from a pirate-council brainstorm). How far you
are from a record, on numbers you can trust.

## What it is

Four parts. The fourth turned out to exist already.

1. **Record targets.** A lift goal can be marked as a record. You type in the
   record figure (Ironlog never fetches it), plus where it's from and the date
   you checked it. The goal row then shows a **Record** chip, the gap in kg,
   and the source. If the check date is more than 180 days old it asks you to
   re-check, since records move.
2. **Projected range.** Every lift goal (record or not) gets a rough date
   range for when you'd hit it at your recent rate. Hidden until there's enough
   history (§2).
3. **Typo guard.** Already in Ironlog as `plausibility()` / `plausDlg`
   (live sets, edits, voice). Nothing new to build. It asks "does this look
   right?" and never blocks, so a real big lift can always be logged.
4. **Trust labels on sensor numbers.** Bar speed from Measure and from video
   carry a chip: **unchecked** until you've checked that source against a
   transducer or another trusted device, then **checked**. Settings → Sensor
   trust holds the two switches and the date each was checked
   (`r&d/notes/vbt-validation.md` is how to do the check).

## 1. Data

On a goal (lift type only):

```
record: { source: "WDC 90kg 16\" trap bar", checked: "2026-11-09" }   // optional
```

On settings:

```
sensorChecked: { motion: "2026-12-01" | null, video: null }
```

Both ride along in the existing JSON export, import and Drive backup, which
copy goals and settings whole. No schema bump: an absent field means "not a
record" / "unchecked".

## 2. Projection

`projectGoal(g)` — lift goals only, from `statsFor(key).series` (best e1RM per
session, dated by the session).

- Window: sessions in the last 26 weeks.
- Needs **at least 4 sessions spanning at least 6 weeks**, otherwise
  "not enough history yet" (no line drawn, no date).
- Least-squares line of e1RM against days. Rate = slope, ± its standard error.
- Gap = target − current (`goalCurrent`). Done if gap ≤ 0.
- Rate ≤ 0: "not climbing over the last N weeks", no date.
- Earliest = today + gap / (rate + SE). Latest = today + gap / (rate − SE),
  or "open-ended" if rate − SE ≤ 0.
- Past 5 years: "more than 5 years at this rate".
- Always says it's a straight line and that gains slow near your limit, so the
  later date is the one to plan on.

The working shows in debug mode (`why('proj')`).

## 3. Things it must never do

- Fetch or publish record figures, or anyone else's numbers.
- Say or hint that a federation will accept a lift.
- Draw a projection without the history in §2.
- Touch `prKey` / `splitsPR`.
