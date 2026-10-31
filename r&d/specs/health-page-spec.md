# Health page (roadmap D13)

Written 2026-10-31. Health is its own bottom-bar tab since D12
(`page = 'health'`, `viewHealth()`). This item turns it from "Stats → Body
moved over" into the page for the body.

## Layout, top to bottom

1. **Title** — *Health*, one line under it.
2. **Summary row** — three tiles, each a button that scrolls to its card:
   - **Bodyweight:** the 7-day average, and its change over the last 7 days
     (from `bwSeries()`). Empty: "No weigh-ins".
   - **Body fat:** the latest complete caliper test's % and the skinfold sum
     beside it, and the change since the previous test **of the same method**
     (mixing JP3 and JP7 would compare different equations). Empty: "No
     tests".
   - **Waist:** the latest waist and its change since the previous one (waist
     is the measurement most people track). Falls back to the most recently
     measured site when there's no waist. Empty: "No measurements".
3. **The body cards, unchanged** — bodyweight, calipers, measurements, photos
   (`viewBody()` / `wireBody()`). Each card gets an `id` so the tiles can
   scroll to it. No second copy of the data, no schema change.
4. **Physique** — two buttons into the Tools calculators that use this data
   (D11): *FFMI* and *Max muscular potential*. They prefill from here.
5. **Recovery** — one line linking to the recovery heatmap. It stays on
   Stats → Muscles (D7) — it's training load, and it sits better next to the
   strength map. Revisit if Aaron wants it here.

## Later items that land here

- E5 mobility **tests** (ROM, balance, forward-fold benchmark) — a card of
  their own between Measurements and Photos.
- E6 supplements and blood work.
Nothing is shown for these until they exist: no empty placeholders.

## Rules

- Old routes: `analyticsTab === 'body'` and the 98 *View → Health* both land
  here (done in D12).
- C4: the tiles are real buttons with a label naming the card they open;
  axe-clean in both skins.
- Data stays on the device; JSON export and Drive sync are unchanged (photos
  stay out of both, as before).
