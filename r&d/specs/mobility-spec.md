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
One store, `S.mobTests`: `{ id, date, test, side: 'L' | 'R' | null, v, mt }`
(in `DEFAULT_STATE`, JSON export and `SYNC_SETS`). The tests live in one
table, `MOB_TESTS`:

| id | test | value | sides | better |
|---|---|---|---|---|
| `fold` | Forward fold reach — the routine's weekly benchmark | scale: knee, mid-shin, ankle, toes, floor, palms flat (stored as 0–5) | — | higher |
| `k2w` | Knee to wall | cm | L/R | higher |
| `slr` | Straight-leg raise | degrees, typed or by the phone | L/R | higher |
| `thomas` | Thomas test | scale: thigh above / level / below | L/R | higher |
| `wallflex` | Wall shoulder flexion | cm gap, 0 = touching | — | lower |
| `bal_ec` / `bal_eo` | Balance, eyes closed / open | seconds | L/R | higher |

- **Health → Mobility tests card** (after the body cards): each test's latest
  left / right, a chart of the picked test (best per day and side), the
  left/right gap on the latest day both were tested ("Left 25% behind"), and
  how to do it.
- **Log a test:** pick the test, date, a value per side (either may be
  blank). The straight-leg raise can use the phone as an inclinometer:
  `deviceorientation` beta, **Zero** with the leg flat, **Capture** per
  side. iOS asks for motion permission; with no sensor, type the number.
- **Balance test** (from the "Stork Stand" prototype): eyes closed / open,
  pick the standing leg, then **hold the pad while the foot is up** and let
  go when it touches down. Pointer capture, so a sliding thumb doesn't end
  it; Space / Enter work too. Timed to 0.1 s, under 1 s is ignored, buzz on
  start and stop, the leg switches after each counted attempt, and every
  counted attempt is saved straight away. Today's best per leg is shown.
  Screen kept awake.

## 3. Library and custom routines (0.98.0)

### Data
`r&d/data/mobility.json` — the stretch and mobility library, the mobility
counterpart of `exercises.json`; inlined into `js/health.js` as
`MOBILITY_LIBRARY` by `r&d/tools/build-mobility.cjs`, checked by
`r&d/tools/validate-mobility.cjs`. 104 items: the 25 Full Body Stretch items
under their routine ids (`inRoutine`), their five swaps as items, and the rest
of the master research (§20, the mobility drills of §19).

- **Item:** `id` (permanent), `name`, `region`, `style` (`static`, `active`,
  `dynamic`, `pnf`, `loaded`, `release`), `targets[]`, `joints[]` (the Go easy
  on list, `MOB_JOINTS`), the routine dose fields, `position`, `cue`,
  `aliases[]`, `endRange: true` for passive end-range work, and `swap` — the id
  of an active or loaded alternative in the library.

### Custom routines
`S.routines: [{ id: 'r-…', name, items: [{ id, dose? }], mt }]`, synced by
Drive like the other collections. Items are library ids in order; `dose` is
set only when the lifter changed it (`hold`, `reps`, `sets`, `perSide` —
it replaces the library's dose). A routine is **resolved against the library
each time it opens** (`resolveCustom`): one zone, the estimate summed from the
doses, and each `endRange` item's library swap turned into a player swap, on
by default (the hypermobility rule; *Original* switches it per item, and that
choice is shared with every routine because it keys on the item id). Its
sessions are ordinary mobility sessions; deleting a routine leaves the days
it logged.

### Where it shows
- **Train → Mobility** is now always a list: every routine (built-in, then
  yours with ✎), **＋ New routine** and **📚 Stretch library**.
- **Library:** search (name, aliases, targets), Area and Style chips, *Hide
  passive end-range*. Rows show dose, area, style, an end-range tag, whether a
  protected joint makes it swap or skip, and a *How* fold.
- **Editor:** name, the stretches in order (↑ ↓ ✕), a *Dose* fold per item, *＋
  Add from the library* (the library in pick mode: ＋ / ✓ per row, Done hands
  the picks back, new ones at the end), Save, Delete (two taps). Closing with
  unsaved changes asks first.
- **Home** shows the routine done most recently, not always the built-in one.

