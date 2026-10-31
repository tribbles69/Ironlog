# Mobility (roadmap E5)

Written 2026-10-31, when Aaron moved E5 ahead of D8–D9. In two parts:
**routines** (0.60.0) and **tests** on Health (0.61.0).

## 1. Routines

### Data
Built-in routines live in `r&d/data/routines/*.json` and are inlined into
`index.html` as `BUILTIN_ROUTINES` by `r&d/tools/build-routines.cjs` (edit the
JSON, run the tool, bump). The first is Aaron's **Full Body Stretch**
(`morning-stretch.json`): 8 zones, 25 items, ~30 min.

- **Routine:** `id`, `name`, `subtitle`, `estMin`, `zones[]`.
- **Zone:** `n`, `name`, `estMin`, `items[]`.
- **Item:** `id` (stable — ticks key on it), `name`, `targets[]`, `position`,
  `cue`, optional `flag` (priority line), `alt` (an easier swap in words),
  `note`, `test` (feeds a Health test), `joints[]` and `swap`.
- **Doses:** `hold` (s), `holdRange` [lo, hi], `hold` + `reps` (5 s × 8),
  `reps`, `sets`, `perSide`, `positions[]` (each one done in turn),
  `then` ({ name, hold } after both sides).

### Hypermobility review
Aaron chose "propose swaps" (2026-10-31). Five passive end-range items carry
an active or loaded `swap`, **on by default** and switchable per item in the
player (*Swap* / *Original*, stored in `settings.mobility.swaps[itemId]`):

| original | swap | why |
|---|---|---|
| Prone Quad Stretch | Active prone knee bend, 5 s × 8 each side | own control, no hand pulling the knee |
| Wrist Flexor & Extensor Stretch | Wrist circles and light wrist curls, 10 each side | strength through range |
| Pigeon Pose | 90/90 hip switches, 8 each side | active rotation, no sinking into the joint |
| Deep Squat Hold | Goblet squat hold, 20 s × 3 | loaded and braced at the bottom |
| Standing Forward Fold (daily hang) | Slow Romanian deadlift, 8 × 2 | length under load; the weekly reach test is unchanged |

**Go easy on** (player → Options): joints the lifter wants to protect, in
`settings.mobility.protect`. No joints are protected by default (Aaron's
call). An item tagged with a protected joint uses its swap if it has one,
and is otherwise skipped and shown as skipped. Skipped items leave the total.

### The session record
Ticking an item writes today's session straight into `S.workouts`:
`{ kind: 'mobility', status: 'completed', name, date, exercises: [],
mobility: { routine, done: { itemId: true | 'swap' }, total }, start, end,
mt, summary.mins }`. It is **not** `S.active`, so a stretch never blocks
starting a lift, and a part-done day still shows in the calendar.
Unticking the last item removes the day. Export, CSV (`session_extra`) and
Drive sync carry it like any session.

### Player
- **List:** zones and items, a tick per item (40 px), dose, flag, a *How*
  fold with the cue, why a swap is used, and the targets. A progress bar
  shows n / total.
- **Guided:** runs hands-free from the first unticked item, or from any
  item's ▶. Each item gets a 5 s count-in, then its steps: holds count down,
  rep steps wait for *Done*, "Switch sides" is spoken at a side change. A
  finished item ticks itself, and the next starts after 10 s (*Start now*
  skips the wait). *Pause*, *Skip*, *Back to the list*. `Cue` beeps and
  buzzes, `speechSynthesis` speaks (Options → Spoken cues), `Awake` keeps
  the screen on.
- Past days open read-mostly from history: ticks can be fixed, there's no
  guided run.

### Where it shows
- **Train → 🧘 Mobility** (the picker opens straight into the routine while
  there's only one).
- **Home:** "🧘 Full Body Stretch · 8 / 25 today", with Start / Resume, while
  any mobility session exists in the last 14 days.
- **Calendar:** a purple dot; the day panel and history show a mobility
  card, and its View opens the player for that day.
- Mobility days don't count as training sessions (Home's 7-day count, Stats
  totals, the recovery map).

## 2. Tests (0.61.0) — on Health
Spec'd with the build; see section 2 when it lands.
