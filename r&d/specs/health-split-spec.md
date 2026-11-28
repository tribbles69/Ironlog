# Health split and the Hub data layer — 000-F2

**Status: draft (2026-11-28).** Agreed so far: Health leaves Ironlog for its
own app **before 1.0**; apps share data through a **Hub folder in the user's
own Google Drive**; Ironlog reads bodyweight from the Hub with a **local
fallback**. The open calls are in §9 — build nothing past F2a until the owner
has answered them.

The shared format itself lives in the Hub repo: `tribbles69/Hub` →
`hub-format.md`. If this spec and that file disagree, `hub-format.md` wins on
the format and this spec wins on what Ironlog does.

---

## 1. Why

Ironlog's Health tab (D13, D16, E4) is body data, not training. A separate
Health app can be used by people who don't lift, can grow (E6 supplements and
blood work, a symptom log) without making Ironlog heavier, and gives the other
apps (pre-session brief, Stamina Meter, Kraftur, food) one place to read body
data from. Ironlog is going APK while the other apps are PWAs, and a PWA
can't talk to an Android app directly, so the apps meet in the user's Drive
instead. Same rules as now: no server of ours, the user's data in the user's
storage.

## 2. What moves and what stays

`js/health.js` (3,786 lines) holds more than body data. Only the body and
vitals parts move.

| Moves to the Health app | Stays in Ironlog |
|---|---|
| Bodyweight log and 7-day average (the `weight` on check-ins) | Check-in readiness: sleep, energy, soreness, stress, notes (§9 Q1) |
| Calipers — JP3 / JP7 / DW4, Siri, raw sum (`S.calipers`) | Mobility routines, player, library (E5) |
| Measurements, L/R and custom (`S.measures`) | Mobility, ROM and balance tests (E5) |
| Progress photos and the daily clip (03) | Strength fitting test (E12) |
| Blood pressure (`S.bp`) and glucose (`S.glucose`) (D16) | Cardio, intervals, add-ons (D15, 02, 000-F1) |
| The Health summary card | Recovery map (D7), FFMI / potential calculators on Tools (read Hub data, §5) |
| E6 supplements and blood work — built in Health, never in Ironlog | DOTS, IPF GL, weight classes — all through `bodyweightKg()` |

## 3. The Hub data layer (summary — full format in `hub-format.md`)

- A folder **`Hub`** in the user's Drive, created by whichever app connects
  first. Each app publishes **one file, `Hub/<app>.json`**: the STANDARDS
  backup envelope plus a `shared` block.
- **Only the owning app writes its file. Everyone else only reads it.** No
  merges between apps, so no conflicts between apps.
- `shared` is a **published, documented subset**, not the app's whole log.
  Ironlog's own sync file (B6) is untouched and stays private to Ironlog.
- Every reader keeps a local copy of what it last read (`hub.cache`), so the
  app works offline and shows "as of <date>".
- **One Google Cloud project for every Hub app.** `drive.file` only shows a
  project the files it made, so Health and Ironlog must use the same OAuth
  client (or clients in the same project) or they can't see each other's files.
  Every app's origin goes on the client's authorised JavaScript origins: the
  Cloudflare Pages addresses and, once E3 lands, the Capacitor origin.
- Health data is sensitive: Health publishes **bodyweight and body fat only**
  by default. BP, glucose, photos and blood work are never published unless
  the user turns that on, per item (§9 Q4).

## 4. Ironlog's bodyweight

Most bodyweight reads go through `bodyweightKg()` and its dated version in
`js/core.js` (DOTS, IPF GL, weight classes, BMR, strength standards). **Not
all do** — these read `S.checkins[].weight` directly and must move onto one
`bwSeries()` helper in `core.js` first (F2b): `coach.js` (276 writes a weight,
813–999 monthly trend), `events.js` 465, `report.js` 29, `training.js`
1152–1154, `sync.js` 38 (summary text). After that, `bwSeries()` is the one
place the source changes.

- The series = **Hub `health.shared.bodyweight` ∪ local check-in weights**,
  joined by date. Same date in both: the newer `mt` wins.
- No Hub connection, or nothing in it: local only, exactly as today.
- The check-in keeps a quick **weight** box as the fallback (stored as now).
  When Health is connected, the box shows the Hub weight with "from Health"
  and editing it says the change is local to Ironlog.
- A weight typed in Ironlog is **not** written into Health (only Health writes
  its file). Health can import Ironlog's local weights once (§6).
- Debug mode (E11): the `bodyweightKg` trace says which source each number
  came from.

## 5. Other readers inside Ironlog

- Tools → FFMI and Max muscular potential prefill BF % and measurements from
  the Hub, then local, then blank.
- Report (`report.js`) and Coach (`coach.js`) read bodyweight through
  `bodyweightKg()`; anything that reads `S.calipers` / `S.measures` directly
  moves to a small `hubBody()` helper that does Hub-then-local.
- The 5th tab (§9 Q2) shows a read-only summary from the Hub with **Open
  Health** (opens the app's URL).

## 6. Moving people's data (same pattern as A1 food)

1. **Export first, in its own shipped version:** Settings → Data → **Move to
   Health** writes one file in Health's import format (`app: "health"`
   envelope) holding check-in weights, calipers, measures, BP, glucose.
   Photos and clips go in a second, optional file (they're large).
2. Health's welcome screen offers **Bring in from Ironlog**.
3. **Then remove** in a following version: the moved screens go. Leftover data
   is **kept, unshown, until moved or cleared** (Settings → Data → Clear data →
   Old health data), never dropped by a migration.
4. Ironlog JSON / CSV import and Drive sync must still accept old files that
   contain these stores, and offer **Move to Health** rather than failing.
5. Old routes keep working: `go('health')` and links to Health open the new
   5th tab.

## 7. Health app — v0.1

- Own **private** repo, PWA, follows Hub `STANDARDS.md` (envelope export, CSV,
  `r&d/ROADMAP.md`, `r&d/DATA.md`, `CLAUDE.md`, version bump rules).
- Screens: Home summary · Weight · Body fat · Measurements · Photos + daily
  clip · Blood pressure · Glucose · Settings. Lifted from `health.js`
  (`viewBody`, `wireBody`, `bpCard`, `gluCard`, `wireVitals`, the caliper maths
  and `BP_BANDS` / glucose bands) so numbers match Ironlog exactly — check by
  running the same inputs through both.
- Drive: its own sync file (copy Ironlog's B6 pattern) **plus** it publishes
  `Hub/health.json` after every change.
- Hosted on Cloudflare Pages like the rest.

## 8. Build order — one version each

- [ ] **F2a. Format** — `hub-format.md` in the Hub repo, STANDARDS updated
  (Drive Hub replaces the same-origin rule). This spec.
- [ ] **F2b. Ironlog reads the Hub** — `js/hub.js` (find folder, read
  `<app>.json`, cache, "as of"); `bodyweightKg()` merge (§4); `hubBody()`
  (§5). No screens removed. Works with nothing in the Hub.
- [ ] **F2c. Health app v0.1** — new repo (§7), import, publishes
  `Hub/health.json`.
- [ ] **F2d. Move to Health export** in Ironlog (§6.1).
- [ ] **F2e. Ironlog removal** (§6.3–6.5), the 5th tab (§9 Q2). Bump the 1.0
  checklist: one Drive sync and the Hub read checked on the real log.
- [ ] **F2f (can be after 1.0).** Ironlog publishes `Hub/ironlog.json`
  (sessions summary, main-lift e1RMs) for the pre-session brief and other apps.

## 9. Open — owner to answer before F2b

1. **Check-in readiness** (sleep, energy, soreness, stress): stay in Ironlog
   (proposed — they feed training readiness and the planned readiness score),
   or move to Health?
2. **The 5th tab:** proposed **Body** — Hub summary + fitting test + mobility
   tests. Or put the tests under Train and give the slot to something else?
3. **Photos and the daily clip:** move to Health (proposed), or stay?
4. **Sharing BP / glucose to other apps:** off by default, a switch per item
   (proposed)?
5. **Name and repo** for the Health app.
