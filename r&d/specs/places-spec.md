# Ironlog — Equipment profiles (places)

Roadmap D6. Written against 0.47.0. Grep `PLACES`.

## What it is

A **place** is a named set of kit, such as "Home" or "Gym":

```
S.settings.places = [{ id, name, kit: [equipment ids], bars?, plates?, collarKg? }]
S.settings.place = id | null      // the last one used
S.active.place   = id | null      // this session's
wo.place                          // kept on the finished session
```

- **No places set up** means everything is available, exactly as before.
- **Bodyweight** is always available.

## Kit

- The kit is the catalogue's equipment vocabulary: barbell, dumbbells,
  machine, cable, trap bar, strongman implements…
- New places start from a preset. Every preset is editable.

| preset | kit |
|---|---|
| Home gym | barbell, dumbbells, kettlebell, plates, bands |
| Commercial gym | barbell, dumbbells, kettlebell, trap bar, smith, machines, plate-loaded machines, cable, bands, plates |
| Hotel / travel | dumbbells, machines, cable, bands |
| Strongman gym | everything |

## Plates and bars (shared with B4)

- A place can have **its own bars, plates and collars**. A new one starts
  from a copy of the main inventory.
- Without its own, a place uses the **main inventory** in Settings.
- `bars()`, `inventory()` and `collarPair()` read from the current place, so
  every plate calculation (the ⋯ plates sheet, the warm-up ramp, meet day,
  rounding) follows it.
- Settings keeps editing the main inventory: `mainBars()` / `mainPlates()`.

## Choosing where you are

- Places are managed in **Settings → Places**.
- The live session header shows a **📍 place** button that switches this
  session's place. The choice is also remembered as the place for next time.
- A new session starts at the last place used.

## What respects it

- **The exercise picker** (*Add exercise*):
  - A note at the top reads "At Home — greyed needs kit that isn't here".
  - Equipment icons the place lacks are greyed, and tapping one says so.
  - A movement with none of its equipment here is greyed and sorted last in
    its group. It can still be picked, since plans change.
  - Tapping a row whose default equipment isn't here picks the first
    equipment that is.
- **The equipment axis picker** on a live card marks options "not at Home".
  They stay selectable.
- **Program, planned and repeated sessions:**
  - A card whose equipment isn't at this place shows "Needs Barbell — not at
    Home" and a **Swap to Dumbbells** button: the same movement, the first
    of its equipment that is here, keeping the execution when it's valid.
  - Swapping clears the open sets' weights and autoregulation marks, since a
    barbell load doesn't carry over to dumbbells. Reps, RIR targets and
    notes stay.
  - The header counts how many exercises need a swap.
- **AI and voice logging:** a set dictated for an exercise not yet in the
  session is added with equipment that's at this place.

## Not in this change

- Swapping to a different movement (e.g. leg press for squat) when no
  equipment of the same movement is available.
- Places on planned sessions ahead of time.
- Detecting the place from location.
