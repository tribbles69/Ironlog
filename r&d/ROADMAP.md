# Ironlog roadmap

The single list of what's being built next, in order. Written for Aaron and for
any agent (Claude Code etc.) picking up work cold.

**Who it's for:** powerlifters, strongman and strengthlifters, adaptive lifters
especially. Ironlog has to earn its keep for one user first — Aaron — before it
competes with anything.

**Model (decided 2026-09-24): Ironlog is completely free.** A passion project
for the community, not a money-maker.
- **Everything is free, forever.** No paid tier, no paywalled features.
- **Local-only.** No Ironlog account and no Ironlog server holding user data.
  Backup/sync goes to the **user's own cloud drive** (Google Drive first), so
  their data sits in their storage, not ours (see B6).
- **AI runs on the user's own API key** (bring-your-own-key), entered on the
  device and used only from the device. Aaron doesn't pay for other people's AI
  usage. Every AI feature must be optional — the app is complete without a key.
- Optional support: donations (Ko-fi / GitHub Sponsors) and cosmetic
  muscle-map skin packs. Never gate a feature behind either.
- **Food logging is leaving Ironlog** for its own separate app (A1).

**Where the priorities come from (2026-09-24):** Aaron's own plans, the open
issues of a competing app (<https://github.com/madmustachecompany/Blast-Workout-App/issues>
— "Blast #n" below is the issue number), and desk research on what lifters ask
for in training apps. The research's main finding: people stay or leave over
the **basics** (fast logging, reliable timers, never losing data, no paywalls);
**competition tools** (meet day, strongman events, para powerlifting) are
where no other app does well. Hence the order: protect → basics → competition →
extras.

---

## How to work from this file

Paths here are from the repo root. The folder is `r&d` — **quote it in the
shell** (`cd "r&d"`), since an unquoted `&` backgrounds the command.

1. Take the **first unchecked item, top to bottom** — section A, then B, C, D,
   E — unless Aaron says otherwise.
2. **Check the code before trusting a status here.** Some items were marked from
   memory of planning chats, not from the code. If something is already built,
   tick it, note the version, and move on.
3. If an item links a spec in `r&d/specs/`, the spec wins over the summary here.
   Items marked "write a spec first" need the spec written and agreed before
   building.
4. One feature per commit. Every shipped change bumps `version.json` **and**
   the `VERSION` / cache name in `sw.js`, or installed PWAs keep serving the old
   shell — **and adds an entry to the changelog** (see CLAUDE.md).
5. Before committing, syntax-check every `<script>` block — a template-literal
   typo white-screens the single-file app:
   ```bash
   node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');[...h.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].forEach((m,i)=>{try{new Function(m[1]);console.log(i,'OK')}catch(e){console.log(i,'ERR',e.message)}})"
   ```
6. When an item ships, tick it here with the version number. Don't reorder
   priorities without asking Aaron.
7. Items marked **(check on phone)** can't be finished from here — do what can
   be done in code, then leave a short checklist for Aaron and move on.

**Standing rules (don't break these):**
- RIR is what's shown and typed; **RPE is what's stored** and what all effort
  maths uses, via `rirToRpe` / `rpeToRir`. Don't store RIR.
- Weights are kg.
- Local-only: the device is the source of truth; the user's own cloud drive is
  a backup/sync target. No Ironlog server stores user data.
- AI is a fallback, never the first path. Local tables/databases answer first.
  AI only ever uses the user's own key.
- Never fix `prKey` / `splitsPR` as a side effect of another feature (see D10).
- Every free-text or icon-only control gets an accessible label (see C4).

---

## Done (as far as known — verify)

- [x] Installable PWA with offline cache and safe mid-workout updates
- [x] IndexedDB storage, JSON export/import
- [x] Food tab: CoFID + curated local tables first, Haiku fallback via
      server-side function. **Being removed — A1.**
- [x] Exercise database (`EX_DB`, 736 movements) with muscle shares; body heatmap
- [x] RPE → RIR switch across display, inputs and voice logging
- [x] Muscle map skins (0.23.0): the body is painted from a skin sheet, one cell
      per muscle per tier, so any art works. Only the placeholder
      `skins/template.png` ships (darker orange per tier) until proper art is
      made; custom sheets importable. Guide and paint files in `r&d/skins/`
- [x] Slew VBT built in: per-exercise **Measure** flow (phone motion sensor →
      per-rep velocity, velocity loss, estimated RIR) — `slew-core.js`
- [x] "Log a test" fix (0.16.3): `openTestLog` logs the big three only, pinned to
      the priority-lift variants, entries sent with `leaf`.
- [x] Isometric holds (0.17.0) — spec `r&d/specs/isometrics-spec.md`. Per-entry
      `iso: true`, own PR pool via an `exKey` suffix, `sec` field, manual /
      planned countdown / test-to-failure modes, best hold per weight. Built the
      shared `Cue` (Web Audio beeps + vibration, Sound/Vibration settings) and
      `Awake` (refcounted Wake Lock) helpers — reuse them.
- [x] Rest timer (0.18.0): auto-starts on set done, beep + vibration, per-exercise
      rest in `settings.restBy` (main vs accessory via `isMainLift`), ±15 s,
      timestamp-based, opt-in background notification. Real-phone check is A4.
- [x] Cardio session — HR-zone treadmill coaching (0.19.0) — spec
      `r&d/specs/cardio-spec.md`. Web Bluetooth Heart Rate Service, settle
      period, smoothed HR, hysteresis, speed/incline cues with voice, hard HR
      ceiling, HR trace saved. Real-gym check is A4. Optional AI trend coach →
      D9.
- [x] Autoregulated programming (0.21.0) — spec `r&d/specs/autoreg-spec.md`.
      One flat working weight per exercise, loads from a per-exercise working
      e1RM at the session's reps and target RIR, whole-number RIR, stall
      detection over the last 5 sessions, "off day" toggle that doesn't reset the
      stall counter. `autoE1()` is where D1's VBT e1RM plugs in.
- [x] Workout page on the composed exercise model (0.22.0): greyed-not-hidden
      equipment picker, equipment icons, movement page with variant strip and
      per-variant stats, **modifier chips** that annotate a set without
      splitting the PR leaf, Settings → **Check exercise data** report. Running
      that report on the real log is part of A4.
- [x] Changelog (24 Sep 2026): `CHANGELOG.md` (repo root since A2), backfilled from commit
      history.
- [ ] Composed exercise model (movement + equipment + laterality, PRs per variant,
      parent page rolls up variants) — specs `r&d/specs/exercise-system.md` and
      `r&d/specs/exercise-system-phase1.md`. **Status unconfirmed — check how far
      phase 1 got before building anything that depends on it.**
- ~~PR detection against history~~ — not a bug (Aaron's logging error, 2026-09-24).

---

## A. Do now — quick and protective

### [x] A1. Remove the Food tab — shipped 0.24.0 (export) + 0.25.0 (removal)
Decided 2026-09-24: food logging leaves Ironlog for its own separate app.
1. [x] **Shipped 0.24.0** (`openFoodExport`: JSON `format: 'ironlog-food-log'`
   v1, plus CSV; Food-tab notice and Settings → Data). **Export first, in its own shipped version:** a one-tap **Export food log**
   (JSON, plus CSV for spreadsheets) covering every logged food entry,
   saved/custom foods and daily targets, so nobody loses data. The future food
   app will import this file.
2. [x] **Shipped 0.25.0.** Aaron OK'd shipping it straight after step 1, so a
   leftover food log is **kept (unshown) until exported or removed** rather than
   dropped by the migration: Settings → Data → Save old food log, then Clear
   data → Old food log. An empty log and its targets are dropped on load.
   `parse-food.js`, the tables and `build-foods.cjs` moved to
   `r&d/food-handover/` (the exercise-system spec keeps the parser contract).
   **Then remove** in a following version: the Food tab and its bottom-nav slot
   (nav goes back to five tabs), `parse-food.js` and the server-side food
   function, the food lookup tables (CoFID + curated), and food settings.
   Schema bump + migration that drops food stores **only after** step 1 has
   shipped. Keep `bmrKcal` / `suggestedTargets` — D11 still uses them.
3. Check nothing else reads food data (e.g. the check-in or Home summary). If
   something does, remove that view rather than leave it broken.
4. Training data JSON export/import must keep working; old export files that
   still contain food data must import without errors (ignore the food part).

### [x] A2. "What's new" screen — shipped 0.26.0
Added 2026-09-24 at Aaron's request, straight after A1. Shows the changelog in
the app so Aaron (and users) can see what each update changed.
- **Move the changelog to the repo root** as `CHANGELOG.md` (the app loads it,
  so by the layout rule it lives at the root). Update `CLAUDE.md` and
  `r&d/README.md` to point at the new path. Cache it in `sw.js` like the shell.
- **After an update:** on the first open of a new version, show a sheet with
  every changelog entry newer than the last version the user saw, then store
  `settings.lastSeenVersion`. One tap dismisses it.
- **Never mid-workout:** if a session is live, wait until it's finished.
- **Fresh install:** don't show it — just record the current version.
- **Settings → What's new:** opens the full changelog any time.
- Render the changelog's simple markdown (`##` headings, `-` bullets, `**bold**`)
  with a small local renderer — no library. If the file can't be loaded
  (offline, first run), say so quietly; never block the app.
- Works in both skins and with TalkBack (heading structure, labelled close).

### [x] A3. Persistent storage and backup nudge — shipped 0.27.0
Chrome can clear a PWA's IndexedDB when the phone is short on space.
- Call `navigator.storage.persist()` (after the first logged session is a good
  moment) and show the result in Settings.
- Until B6 ships: a gentle reminder to export a backup if the last export is
  older than ~2 weeks, dismissable, never blocking a workout.

### [ ] A4. Real-phone checks (check on phone)
Everything shipped but never tested on Aaron's actual kit (Oppo Reno 8,
Galaxy Watch 7, Chrome):
- Rest timer: alert still fires with the screen locked and the app in the
  background; background notification forwards to the watch and buzzes it
  (Blast #17, #64, #101). If it's unreliable, say so in the setting.
- Cardio: HR strap/watch pairing, cue audio and voice, disconnect/reconnect.
  (A third-party Wear OS "heart rate broadcast" app may let the Galaxy Watch
  act as the HR source with no code changes — worth trying.)
- Run Settings → Check exercise data against the real log and the Liftoff CSV.

**Checklist for Aaron** (written 0.27.1 — nothing left to do in code until
these come back; report anything that fails):
1. **Rest timer, locked:** tick a set, lock the phone, wait out the rest. Does
   it beep/buzz? Repeat with Ironlog in the background (another app open).
2. **Rest notification:** Settings → Rest timer → *Notify me when rest ends in
   the background* → allow. Background the app during a rest: does a
   notification appear, and does it reach the Galaxy Watch and buzz it?
3. **Hold timer:** from a cold start, the count-in beeps on the first tap;
   screen stays on through a 60 s planned hold.
4. **Cardio:** pair the HR strap (or try a Wear OS "heart rate broadcast" app
   on the watch); check cue beeps + voice over the treadmill; turn the strap
   off mid-session and back on — does Reconnect work?
5. **Storage:** after a logged session, Settings → Data should say *Storage
   protected*.
6. **Exercise data:** Settings → Check exercise data, then *Check a Liftoff
   CSV*; Copy report and paste it to Claude.
7. **Focus:** type a weight, dismiss the keyboard with Back, type again — no
   stray digits in the field.

### [x] A5. Checks against Blast's bugs — checked 0.27.1 (superset item waits for B3)
Blast shipped these; make sure Ironlog doesn't have them. Tick each.
- [ ] Every exercise in a superset/circuit gets its PRs (Blast #87) — once
  supersets exist.
- [x] Max-weight and max-reps PRs agree at the same weight (#51) — PRs are
  derived at read time, so an edit can't leave a stale max; checked before and
  after editing a set.
- [x] Nothing is ever stored as lbs; imported or synced weights are converted to
  kg (#60, #61) — every weight input, the Liftoff import and voice logging go
  through `toKg` / `toKgFrom`; the unit setting is display-only.
- [x] A started session can be discarded without logging it (#46) — Discard on
  the live session (and cardio); a started plan stays planned.
- [x] Several sessions on the same day all show in history and the calendar
  (#47).
- [x] Number inputs lose focus when the keyboard is dismissed or you tap
  elsewhere (#49) — **fixed 0.27.1**: a tap on anything that isn't a form
  control blurs the field, and so does the keyboard closing.

### [ ] A6. Name check (Aaron, not code)
Search the UK trademark register (UKIPO) and the app stores for "Ironlog" before
promoting it. A rename is cheap now and expensive later.

---

## B. Core logging — what keeps people using it

### [x] B1. Loaded carries, sleds, medleys and strongman events — shipped 0.28.0
The biggest documented strongman gap (Blast #96, #109; research).
- A set shape with **weight + distance + time** together: farmers, yoke,
  sandbag carry, sled push/pull, rucking.
- **Time-to-complete** mode for medleys and loading races (n implements over a
  distance, time).
- **Stone series:** ascending implements, each made or missed, total time.
- **Max reps in a time cap** (e.g. log for 60 s) and max distance in a time cap.
- Implement types as equipment: log, axle, yoke, keg, sandbag, stones, farmers
  handles, sled, Conan's wheel (fits the movement + equipment model; see D2).
- Own PR pools: best time for a given weight and distance; furthest distance at
  a weight; most reps in a cap. PRs show up as PRs everywhere loads do.
- Feeds strongman events in C2.

### [x] B2. Last session inline and fast entry — shipped 0.29.0
The single most-requested general feature (Blast #113, #42, #43; research).
- Show last time's weight × reps @ RIR beside each set.
- Tap to fill; copy a value down to the remaining sets.
- +/− steppers (2.5 kg, 1 rep) so the system keyboard is rarely needed.
- Target: a routine set logged in 1–2 taps.

### [x] B3. Set roles and linked sets — shipped 0.30.0 (supersets still in the backlog)
Without these, volume and PR figures are wrong (Blast #70; research).
- Tag sets warm-up / top set / back-off / AMRAP / drop.
- Group a drop-set chain so it reads as one.
- Warm-ups stay out of volume and PRs.
- Related: supersets in `r&d/notes/backlog.md`.

### [x] B4. Plate loader and warm-up ramp from the set — shipped 0.31.0 (Tools page entry waits for D11)
(Blast #101; research.) Reachable by tapping a set's weight on the workout page,
and from the Tools page (D11).
- Target kg → plates per side.
- Per-bar weights: 20 kg bar, 15 kg, SSB, trap bar, axle, log, deadlift bar,
  custom.
- The user's own plate inventory, including change plates (0.25–2.5 kg) and
  collars.
- One tap for a ramp to today's working weight (reuse `openRamp`), rounded to
  loadable plates.

### [x] B5. Session summary and PR history — shipped 0.32.0
(Blast #22, #19, #18.)
- End-of-session screen: PRs hit (load, reps, **time and distance** PRs from
  B1), tonnage, e1RM change.
- Per-variant PR timeline on the movement page.
- An **e1RM trend chart** per main lift as a headline chart.

### [x] B6. Backup and sync to the user's own cloud drive — shipped 0.33.0 (spec: `r&d/specs/drive-sync-spec.md`; client ID built in from 0.34.1)
Losing data is a top reason people quit apps. Local-only: no Ironlog server or
account holds user data. Backup/sync writes to a file in the **user's own
Google Drive** (Dropbox etc. later), so data survives losing or changing a
phone.
- Sign-in is only to reach their own Drive. Use the narrowest scope that works
  (app-created files only), and say so plainly in the UI.
- Schema versioning, tombstone deletes; merging between two devices must never
  lose local data.
- **First connect pushes local data up — never overwrites it.** Restoring on a
  new phone pulls it down.
- The AI key (D8) is never included unless the user opts in.

### [x] B7. CSV export and exact round-trip import — shipped 0.34.0 (format: `r&d/specs/csv-format.md`)
- CSV export of training history for spreadsheet users (one row per set).
- Whatever Ironlog exports, Ironlog must import back with nothing lost — test
  export → wipe → import → compare.

### [x] B8. Import from other apps — shipped 0.35.0
(Blast #13; research.) Strong, Hevy, FitNotes and a generic CSV, by
generalising the Liftoff importer. Map to leaves via the exercise data check and
show a dry-run report before anything is written.

---

## C. Competition — the edge nobody else has

### [x] C1. Welcome / first-run screen — shipped 0.36.0 (strongman has no event type until C2)
- Sets units, lifts, event goals.
- Explains: data stays on the device, backs up to your own drive, AI is optional
  and uses your own key.
- A short **disclaimer**: general training information, not medical advice; the
  lifter is responsible for what they lift.
- Links to a short in-app help / FAQ (Blast #27).

### [x] C2. Events page — a real meet-day companion — shipped 0.37.0 (spec: `r&d/specs/events-spec.md`)
Builds on the existing Events page. Write `r&d/specs/events-spec.md` first.
- Pick the event type (powerlifting meet, strongman show, para powerlifting —
  C3, other) and queue several events at once.
- **Powerlifting:** attempt planning with conservative / standard / aggressive
  strategies from current e1RM; warm-up ladder to the opener, timed against the
  flight; rack heights and gear checklist; red/white lights per attempt; live
  subtotal, total and DOTS / IPF GL.
- **Strongman:** the show's event list with its rules (weight, reps, distance or
  time), prep peaking toward exactly those events, results entry and points.
- Bodyweight against weight class on the run-in.

### [x] C3. Para powerlifting mode — shipped 0.38.0 (rules as written here; events spec §5)
No app does this; Aaron's own niche. Check current WPPO rules before building.
- Bench press only; WPPO bodyweight classes (men 49, 54, 59, 65, 72, 80, 88, 97,
  107, 107+ kg; women 41, 45, 50, 55, 61, 67, 73, 79, 86, 86+ kg).
- Three attempts, plus an optional record attempt that doesn't count toward
  the result.
- Minimum 1 kg increases (0.5 kg only for record attempts).
- Results for best lift and for total of good lifts.
- Uses the C2 meet-day tools with these rules swapped in.

### [x] C4. Accessibility pass — code shipped 0.39.0 **(check on phone)**
Few competitors get this right; Hevy is rated near-unusable with a screen reader.
- Test the whole workout flow with TalkBack; label every control.
- Large touch targets on the active workout; no gesture-only actions.
- Haptic cues for rest end and set logged (reuse `Cue`).
- Voice logging (already built) stays a first-class input.

Done in code:
- axe-core (WCAG 2.1 A/AA plus best practice) now reports no violations on
  18 screens and sheets, in both skins.
- `a11yPass` labels set inputs and buttons by set number, ties visible labels
  to their fields, fills empty table headers, and marks pressed tabs and
  ticks.
- Modals are `role="dialog"`: focus moves to the title and returns to the
  opener on close. Toasts are a polite live region, and the nav marks the
  current page.
- Workout controls are mostly 40 px, and no smaller than 32 px except the
  22 px-wide plate and timer buttons. There are no gesture-only actions.
- `Cue.logged()` gives a short buzz on a ticked set. Rest end already buzzed.

**Checklist for Aaron (TalkBack on, Settings → Accessibility):**
1. Home → Workout → Start blank: swipe through, and every button is spoken
   with a name. No "unlabelled" or bare symbols like "check mark".
2. Add Bench Press: each set box reads e.g. "Set 1 weight (kg), edit box".
   Double-tap types into it.
3. Tick a set: "Set 1 done, pressed", and the phone buzzes.
4. Open ⋯: "Bench Press, dialog", and the title is read first. Close it and
   focus returns to ⋯.
5. The rest timer ends: buzz and beep, with the screen locked too.
6. Finish: the summary is read. Toasts ("PR — …") are spoken without moving
   focus.
7. Voice logging (🎤) still works with TalkBack on.
Note anything read badly or out of order.

### [ ] C5. Adaptation modifiers and pain / fatigue notes
Extends the modifier chips. Structured modifiers such as **seated, strapped,
assisted, one-sided set-up** that annotate a set **without** splitting the PR
leaf, plus an optional quick pain/fatigue flag on a set or session. Validate the
list with adaptive lifters (Aaron's community) before finalising.

### [ ] C6. Training blocks counting down to a meet
Block templates (e.g. accumulation → intensification → peak → taper) laid out
backwards from an event date in C2, feeding the autoregulated programming.

---

## D. Strong additions

### [ ] D1. VBT overhaul — two modes plus calibration
Write `r&d/specs/vbt-overhaul-spec.md` before building. Two modes, chosen per
exercise in a session:

**Per-set mode** (what Measure does now): velocity loss within a set →
estimated RIR for that set.

**Profile mode (new):** the warm-up ramp *is* the measurement.
- Log 3–5 warm-up sets at rising load, 1–2 fast reps each; use mean concentric
  velocity of the best rep per set.
- Fit a straight line of velocity against load (the load-velocity profile) and
  extrapolate to the lift's **minimum velocity threshold (MVT)**. The load where
  the line hits MVT is the **day's e1RM**.
- Show e1RM as a **range, not a single number** — phone sensors are noisier than
  a linear position transducer. Widen the range when the heaviest warm-up is far
  from max (roughly below 80%), since the line is extrapolating further.
- **Readiness:** compare today's warm-up velocities to the stored profile, so a
  fast day or a flat day is visible before the first working set, and suggest
  the day's working weight from the day's e1RM. Plugs into `autoE1()`.
- Chart it: today's points and line over the stored profile, MVT line marked.

**Calibration (underpins both modes):**
- MVT differs by lift and by person (lower on bench and deadlift than squat).
  Start from a **population prior table** per lift; don't test MVT directly.
  Blend in personal data as it accumulates (shrinkage).
- Opt-in **"Calibrate — 8 min"** flow per variant: an incremental load ramp to
  build the personal load-velocity profile and fatigue-rate scalar.
- Silently harvest calibration data from near-failure sets and profile-mode
  warm-ups.
- Cross-lift transfer only for the fatigue scalar, not the full profile.
- **Pocket-mode sets are lower confidence** — flag them, and exclude them from
  MVT calibration and profile fits.
- Never gate first run on calibration. Personal calibration matters more than
  usual here — adaptive lifters won't match population norms.

**Validation (from the research — phone/camera VBT accuracy is contested):**
before presenting velocity-estimated RIR as more than a guide, compare against a
known device (linear transducer or a validated app) on a batch of real sets and
record the error in `r&d/notes/`.

### [ ] D2. Strength library seeding
(Blast #38.) Larsen press, TruSquat, SSB, trap bar, belt squat, pendulum squat,
plus the strongman implements from B1 — as movement + equipment leaves. Check
`EX_DB` for what's already there. Can be done alongside B1.

### [ ] D3. Structured tempo
(Blast #110.) Extends the modifier chips: a four-digit tempo (eccentric–pause–
concentric–pause, e.g. 3-1-1-0) rather than a text chip; shown on the active
set; doesn't split the PR leaf. VBT Measure can fill in the real concentric
time.

### [ ] D4. Per-side logging for unilateral lifts
(Blast #79.) Left and right reps (and weight if different) on one set for
unilateral leaves; imbalance trend on the variant page. **Open decision:** which
side counts for PRs (default: the weaker side).

### [ ] D5. Rep range + RIR suggestion
(Blast #99.) Optional rep range per exercise in a program; hitting the top of
the range at the target RIR suggests more load next time. Works alongside the
autoregulated programming, doesn't replace it.

### [ ] D6. Equipment profiles
(Blast #41, #107.) Named places ("Home", "Gym") with their kit and plate
inventory (shared with B4); the picker greys what isn't available there, and
any program or AI suggestion respects it.

### [ ] D7. Recovery / fatigue heatmap on the skins
(Blast #117 — Blast users call it the feature they miss most.) Extend the body
heatmap to show which muscle groups are fresh vs fatigued. Also show it where
exercises are picked when building a session or program. Only trust it once
muscle shares for commonly trained lifts have been checked — derived shares are
placeholders.

### [ ] D8. AI on the user's own key
No Ironlog AI server and no paid tier.
- A Settings field for the user's own Anthropic API key, stored only on the
  device, with a clear note on what it's used for and roughly what it costs.
- Calls go straight from the device to the API. Per-feature cost hint and a
  monthly cap the app enforces locally.
- Every AI feature is optional and hidden or greyed until a key is added.
- Remove any server-side AI function left after A1.

### [ ] D9. AI coaching
Uses D8.
- Logging stays tightly scoped structured calls, separate from any chat.
- Hard system-prompt boundaries so the coach can't drift off-topic; no medical
  or injury advice.
- Cap or summarise conversation history; use prompt caching — it's the user's
  money.
- Optional cardio trend coach: a Haiku call about once a minute looking at HR
  *trend*, pre-empting drift out of zone.

### [ ] D10. Fix `prKey` / `splitsPR`, with band and chain fields
`prKey()` is dead code, so chains, bands, slingshot and equipped currently share
a PR pool with the raw lift. Real bug, but fixing it **changes existing PR
numbers** — do it on its own, deliberately, and tell Aaron what moved. Add band
tension and chain weight fields at the same time (Blast #112, recast for
accommodating resistance).

### [ ] D11. Tools page (calculators)
The 98 skin's menu bar already has a Tools menu, so that's the way in. Every
calculator **prefills from stored data** (bodyweight, height, age, sex, BF% and
measurements once E4 exists), stays editable for what-ifs, and saves nothing
unless asked. Write `r&d/specs/calculators-spec.md` before building. Reuse the
maths that's already in the app — `bmrKcal` / `suggestedTargets`, `e1rm`,
`dots`, `openRamp` — don't write second copies. The plate loader lives here too
(B4).

**Energy**
- **TDEE:** Mifflin-St Jeor (exists), plus Katch-McArdle when a BF% is known.
- **Adaptive TDEE:** back-calculated from daily food intake and the bodyweight
  trend over 2–4 weeks. Food logging now lives in a separate app (A1), so this
  needs daily intake imported from that app; if that link doesn't exist, leave
  it out.

**Physique**
- **Max muscular potential (Casey Butt):** from height, wrist and ankle
  circumference → maximum lean body mass, and a table of maximum bodyweight at
  each body-fat % (roughly 5–20%). Commonly given as
  `LBM_max(lb) = H^1.5 × (√W / 22.667 + √A / 17.0104) × (1 + BF% / 224)`
  with H, W, A in inches — **verify the constants against Butt's published
  formula before shipping**, then convert to kg / cm.
- **FFMI** and height-normalised FFMI, with where that sits against the
  potential figure.
- Label all of it as an estimate: these formulas come from drug-free elite
  bodybuilders of typical proportions, so for adaptive or short-stature lifters
  they're a rough ceiling, not a verdict.

**Strength**
- e1RM and a rep-max table from any set, and a %1RM ↔ RIR chart.
- DOTS / IPF GL points calculator.
- RPE ↔ RIR mapping table for coaches who think in RPE.

---

## E. Later — little demand found

### [ ] E1. Coach share report
A read-only report (JSON / text / PDF) of a training block for a coach. No
accounts, no server.

### [ ] E2. Share cards
A PR or session summary as an image to post (hunchback_hercules-friendly).
Optional; no social feed.

### [ ] E3. Native wrapper project
One project, only if Aaron decides to go native: Capacitor wrapper for the Play
Store, **Health Connect** (bodyweight, HR, body-comp scans in; sessions out —
Blast #58, #12), and a **Wear OS companion** (current set and rest countdown on
the watch, tick sets from the wrist). A PWA can't do any of these.

### [ ] E4. Body composition page
Write `r&d/specs/body-comp-spec.md` before building.
- **Bodyweight:** build on the existing check-in weight (`ci.weight`, read by
  `bodyweightKg()` for DOTS) — don't create a second store. 7-day rolling
  average over the raw points.
- **Measurements:** cm, any subset per entry — neck, chest, waist, hips, upper
  arm, forearm, thigh, calf — **left/right** where it applies, plus custom
  sites.
- **Caliper tests:** Jackson-Pollock 3-site, JP 7-site, Durnin-Womersley 4-site;
  mm per site (optionally 2–3 readings averaged); body density → Siri body-fat %;
  fat / lean mass from the same day's weight. Always show the **raw sum of
  skinfolds** next to the % — for adaptive lifters it's the more honest trend.
- **Progress photos** (Blast #95, #11): front/back/sides, side-by-side compare,
  kept on the device.
- Charts via `chartMulti`; IndexedDB + JSON export/import (schema bump).

### [ ] E5. Mobility training
Write `r&d/specs/mobility-spec.md` before building.
- Saved routines (evening routine, pre-lift warm-up, "strength at length"
  block) of timed holds and rep-based drills, per side where relevant.
- Guided player with hold countdowns, side switches, contract-relax cues —
  reuse `Cue`, isometric timing and `Awake`.
- Hypermobility-aware: mark joints to leave alone (e.g. wrists) and have
  routines skip or swap them. Loaded end-range work over passive stretching.
- ROM tests over time: knee-to-wall (cm), straight-leg raise (degrees,
  optionally via the phone's inclinometer), Thomas test, wall shoulder flexion —
  charted per test and side.
- Loaded-stretch drills log as normal lifting sets so PRs still work.

### [ ] E6. Supplements and blood work
Supplement schedule, reminders and adherence history, viewable alongside
training. Blood work results over time. No drug dosing or cycle-planning
features.

### [ ] E7. Small extras
- Machine settings note or photo per variant, e.g. "seat 4, pad 6" (Blast #29).
- Swap an exercise across past sessions, with a preview (Blast #69).
- OLED true-black theme (Blast #77).
- Setting for the workout timer at the top or bottom — machine phone holders
  cover the bottom (Blast #108).
- Custom trackers: unit + target, e.g. water, sleep (Blast #59, #15).

### [ ] E8. Chat front door (rethink first)
Log and get coaching through a messaging app (WhatsApp or similar — **not
Telegram**) plus voice. **Conflicts with the no-server model** — a messaging bot
needs a server to receive messages. Rethink before building.

### [ ] E9. Only if there's nothing else to do
Strava (Blast #115) · Whoop (#111) · translations (#116, #85) · reorder and sort
routines (#80, #9) · separate muscle heads for arms (#63) · picture
instructions (#21) · suspension trainer, rings and jump rope exercises (#105,
#93, #40).

---

## Parked
See **`r&d/notes/backlog.md`** — sleep/recovery strip on sessions,
sleeves/wraps/belt as gear, supersets and circuits. Each has its reasoning
written down.
