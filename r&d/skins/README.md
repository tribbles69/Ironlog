# Muscle map skins

The muscle map (Analytics → Muscles) is painted from a **skin sheet**: one PNG
holding every muscle at every tier, already in position on the body. The app
picks one cell per muscle from the lifter's scores and stacks them, so any art
works: flat colours, a goblin that turns into an orc muscle by muscle, and so on.

**Status:** only the placeholder ships — `skins/template.png`, one orange that
gets darker each tier. Proper art comes later and replaces or joins it.
Anyone can also import their own sheet from the **Skin ▾** button on the map.

## Files

| File | What it is |
| --- | --- |
| `/skins/template.png` | The shipped skin (transparent PNG). Loaded by the app, cached by `sw.js`. |
| `r&d/skins/paint-guide.png` | Same grid on a light background with labels and outlines — for the artist. |
| `r&d/skins/paint-guide.ora` | Layered version for Krita / GIMP: *paint here*, *template skin (reference)*, *guides*. |
| `r&d/tools/skin-geometry.mjs` | The grid layout and the muscle shapes. The one source of truth. |
| `r&d/tools/skin-sheet.mjs` | Draws all three image files from the geometry. |

## The grid

2640 × 5760: **11 columns × 12 rows** of 240 × 480 cells.

- **Top 6 rows: front view. Bottom 6 rows: back view.**
- **Rows are tiers**, top to bottom: Not ranked, Beginner, Novice,
  Intermediate, Advanced, Elite. Reading down a column shows one muscle's
  whole journey.
- **Columns are layers**, and also the paint order (later columns sit on top):

  | Col | Front       | Back        |
  |----:|-------------|-------------|
  | 1   | Base        | Base        |
  | 2   | Traps       | Traps       |
  | 3   | Abs         | Upper back  |
  | 4   | Quads       | Lats        |
  | 5   | Calves      | Lower back  |
  | 6   | Chest       | Glutes      |
  | 7   | Front delts | Hamstrings  |
  | 8   | Side delts  | Calves      |
  | 9   | Biceps      | Side delts  |
  | 10  | Forearms    | Triceps     |
  | 11  | *(empty)*   | Forearms    |

- **Base** is the body itself — head, hands, feet, the skin between muscles.
  It follows the lifter's *overall* tier (average of all muscle scores), so a
  real skin can evolve the head and body too. The template keeps it neutral.

Template colours (keep `SHADES` in `skin-sheet.mjs` and
`SKIN_TEMPLATE_COLORS` in `index.html` in step):

| Tier | Colour |
| --- | --- |
| Not ranked | `#4a5263` |
| Beginner | `#ffc9b8` |
| Novice | `#ff9a7a` |
| Intermediate | `#ff5c35` |
| Advanced | `#c43a15` |
| Elite | `#7a1f08` |

## Brief for an artist

1. Open `paint-guide.ora` in Krita or GIMP (or put `paint-guide.png` on a
   bottom layer in anything else).
2. Paint every cell on the *paint here* layer. The filled shape in each cell
   shows where that muscle sits; stay roughly inside it so the layers line up.
   The art decides the final shape — tap targets are read from the paint, not
   the guide.
3. Leave everything outside a muscle **transparent**. Cells are stacked on top
   of each other, so an opaque background in one cell hides the rest.
4. Row 1 (Not ranked) should look empty or unfinished rather than weak.
5. **Hide the guides layer** and export PNG with alpha, same size (or exactly
   double: 5280 × 11520 — don't go bigger, phones struggle).

## Shipping a new skin

1. Put the PNG in `/skins/`.
2. Add it to `BODY_SKINS` in `index.html` (`legend` only for flat-colour skins).
3. Add the path to `ASSETS` in `sw.js`.
4. Bump the version with `node "r&d/tools/bump.cjs" x.y.z`.

The app reads cell size as width ÷ 11 and height ÷ 12, and rejects sheets
whose cells aren't 1:2.

## Regenerating

```bash
NODE_PATH=$(npm root -g) node "r&d/tools/skin-sheet.mjs"
```

If you change the layer list in `skin-geometry.mjs`, change `SKIN_LAYOUT` in
`index.html` to match — they're the same contract, and every existing sheet
breaks with it.

## Later, maybe

The ChatGPT mockup had a 60-muscle "individual" grid. Not worth it yet: muscle
shares in `EX_MUSCLE` only go to the 15 groups above, so finer cells would all
show the same tier. Revisit if the exercise data gets finer.
