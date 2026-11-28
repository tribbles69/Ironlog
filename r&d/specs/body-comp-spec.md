# Ironlog — Body composition page

Roadmap E4. Written against 0.49.1. Grep `BODY COMP`.

## Where

**Stats → Body**, a fourth tab after Exercises, Rankings and Muscles. The 98
skin's View menu gets a *Body* item that opens it.

The page has four sections, top to bottom:
1. Bodyweight
2. Body fat
3. Measurements
4. Photos

Each section has an add button.

## 1. Bodyweight

**No second store.** Bodyweight is the check-in weight, `ci.weight`, the
same number `bodyweightKg()` gives DOTS.
- *Log weight* opens today's check-in.
- **Chart:** the raw weigh-ins as a faint line, plus the **7-day rolling
  average**. Each day's average is the mean of the weigh-ins in the 7 days
  ending that day.
- **Figures:**
  - latest weigh-in;
  - 7-day average;
  - the change in the average over 7 and 30 days, where there's data that
    far back.

## 2. Body fat (caliper tests)

`S.calipers = [{ id, date, method, sex, age, mm: { site: [readings] }, mt }]`

Only the raw readings, sex and age are stored. Everything else is worked
out when shown, so a corrected formula corrects history.

**Readings:**
- 1–3 per site, averaged; each 2–80 mm.
- Age comes from the profile's date of birth. With none, it's asked on the
  form and kept on the test.
- Sex comes from the profile, and can be changed per test.

**Methods:** Siri, `BF% = 495 / BD − 450`; S = sum of site means in mm.

| method | sites | body density (BD) |
|---|---|---|
| **Jackson–Pollock 3**, men | chest, abdomen, thigh | 1.10938 − 0.0008267·S + 0.0000016·S² − 0.0002574·age |
| **Jackson–Pollock 3**, women | triceps, suprailiac, thigh | 1.0994921 − 0.0009929·S + 0.0000023·S² − 0.0001392·age |
| **Jackson–Pollock 7**, men | chest, midaxillary, triceps, subscapular, abdomen, suprailiac, thigh | 1.112 − 0.00043499·S + 0.00000055·S² − 0.00028826·age |
| **Jackson–Pollock 7**, women | same seven | 1.097 − 0.00046971·S + 0.00000056·S² − 0.00012828·age |
| **Durnin–Womersley 4** | biceps, triceps, subscapular, suprailiac | c − m·log10(S), with c and m by age band below |

**Durnin–Womersley 1974 age bands (c, m):**

| age | men | women |
|---|---|---|
| 17–19 | 1.1620, 0.0630 | 1.1549, 0.0678 |
| 20–29 | 1.1631, 0.0632 | 1.1599, 0.0717 |
| 30–39 | 1.1422, 0.0544 | 1.1423, 0.0632 |
| 40–49 | 1.1620, 0.0700 | 1.1333, 0.0612 |
| 50+ | 1.1715, 0.0779 | 1.1339, 0.0645 |

Under 17 uses the 17–19 band and says so. The constants were checked against
the published equations. **Before relying on a number, compare one test
with a hand calculation** (r&d/notes).

**Shown per test:**
- **BF%**, to one decimal;
- the **sum of skinfolds in mm**, always next to the %. For adaptive lifters
  and anyone the population equations don't fit, the raw sum is the more
  honest trend;
- **fat and lean mass**, from the nearest check-in weight within 3 days.
  With none, it's left out rather than guessed.

A result outside 3–50% is shown with a "check the readings" note.

**Chart:** BF% and the skinfold sum (mm) over time, one line each for the
method in use. Methods aren't mixed on one line.

The form shows a one-line "where to pinch" for each site.

## 3. Measurements

`S.measures = [{ id, date, cm: { site: value }, custom: { name: value }, mt }]`

- **Stored in cm.** Shown in cm, or in inches when Settings units are lb.
- **Any subset per entry.** The standard sites:
  - neck, chest, waist, hips;
  - upper arm L/R, forearm L/R, thigh L/R, calf L/R;
  - custom sites by name. Names used before are offered again.
- **Latest table:** each site's newest value, its change since the previous
  entry that had it, and its change since the first.
- **Chart:** pick a site. L and R sites are drawn as two lines.

## 4. Progress photos

**Kept on the device only:**
- They're stored outside `S` in IndexedDB: the index at
  `ironlog.photos` (`[{ id, date, pose, w, h }]`) and each image at
  `ironlog.photo.<id>`.
- They're never in the JSON export, the CSV or Drive sync. The page says so.

**Adding a photo:** poses are front, back, left side and right side. Images
are downscaled to 1280 px on the long side, JPEG quality 0.85.

**Browsing:** photos are grouped by date, as thumbnails. Tap one to view it
full size, with *Delete*.

**Compare:** pick a pose and two dates, and see them side by side.

## Records and sync

- `measures` and `calipers` are ordinary collections:
  - defaulted in `DEFAULT_STATE`;
  - in the JSON export and import;
  - in Drive sync (`SYNC_SETS`, keyed by id, stamped `mt`).
- There's no schema version to bump. `load()` and import already merge new
  collections in from `DEFAULT_STATE`.
- Every entry can be edited or deleted from its row.

## Not in this change

- Tape-based body-fat estimates (US Navy) and BMI.
- Bioimpedance or smart-scale import.
- The Tools-page calculators that read these (D11).
