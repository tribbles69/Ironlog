# Food handover

Food logging left Ironlog in 0.25.0 (roadmap A1) for its own app. What the food
app needs to pick it up, kept here rather than deleted — none of it is loaded by
Ironlog:

- `parse-food.js` — the Netlify function that parsed food text with Claude
  Haiku server-side. The exercise-system spec (§9) keeps it as the parser
  contract: POST `{ text }` → `[{ name, serving, meal, kcal, protein, carbs, fats, fiber }]`.
- `food-tables.js` — the curated `LOCAL_FOODS` rows and the CoFID `FOOD_DB`
  table, exactly as they were.
- `build-foods.cjs` — regenerates `FOOD_DB` from the current CoFID release. It
  still targets `index.html`; point it at `food-tables.js` before using it.

The food log export the new app should import is Ironlog's
`format: 'ironlog-food-log'`, `formatVersion: 1` (see `foodExportData()` in
`index.html`): `{ exportedAt, appVersion, units, targets, goal, entries[] }`, each
entry `{ id, date, meal, name, serving, kcal, protein, carbs, fat, fibre, source }`.
The parser, lookup and UI code itself is in git history: the parent of the
0.25.0 commit.
