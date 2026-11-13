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

1. Take the **first unchecked item, top to bottom** — section 00, then 0, A, B,
   C, D, E — unless Aaron says otherwise.
   Within a section, the **order on the page** is the order of work; item
   numbers are labels and don't always run in sequence (D12 was moved up
   2026-10-31, D8–D9 moved to the end of D; E5 and the new D16 moved ahead of
   D8 the same day; E1–E2 were done early at Aaron's request, 0.63.0).

   **Where things stand (2026-11-01, 0.66.0):** everything in A–D is built
   except D9. A4 and A6 are waiting on Aaron. Aaron asked for E11 and
   E12 next (E11 shipped 0.64.0, E12's first build 0.65.0); D8 shipped 0.66.0.
   D9 finished in 0.73.0.

   **Where the section-00 sweep got to (2026-11-11, 0.90.17, branch
   `fix/bug-sweep-2026-11`):** 00-B1 is done — the ranked list is
   `r&d/notes/bug-sweep-2026-11.md`. 00-B2: every severity 1 and 2 finding
   is fixed, and every 3 and 4 that needs no decision (0.90.1–0.90.17).
   Aaron's calls on 3.4, 3.6, 3.7, 3.10, the relink part of 1.8 and 4.5
   shipped 0.96.0–0.96.5 (branch `ccr-66354ca4-ybhg0b`). 00-V1 to 00-V4 shipped 0.91.0–0.93.1 and
   00-D1 0.94.0–0.94.4; 00-D2 part done 0.95.0–0.95.1 (branch
   `design/assets-2026-11`, which holds all of it). **Next:** A4 items 21–26, then what's left of 00-D2, then section 0 and E3.

   **Beta (2026-11-13, 0.99.1):** section **000** comes first — feature
   freeze until 1.0; only bug fixes and phone checks. New ideas go in its
   parked list.

   **Next up (2026-11-11, Aaron):** section **00** (bug fixes, then VBT, then design)
   comes before everything else, in page order. Then what's left of section
   **0** (01–03 shipped; 04c moved into 00). After those, carry on from
   **E3**.
   **Bugs** aren't roadmap items: non-critical ones go in `r&d/BUGS.md` as
   they're found and get cleared in a batch when Aaron asks ("fix the bugs").
2. **Check the code before trusting a status here.** Some items were marked from
   memory of planning chats, not from the code. If something is already built,
   tick it, note the version, and move on.
3. If an item links a spec in `r&d/specs/`, the spec wins over the summary here.
   Items marked "write a spec first" need the spec written and agreed before
   building.
4. One feature per commit. Every shipped change bumps `version.json`, the
   `VERSION` / cache name in `sw.js`, or installed PWAs keep serving the old
   shell, **and `APP_VERSION` in `js/core.js`**, or the app reports the old
   version and the update sheet never goes away (0.75.1–0.77.1 shipped
   without it) — **and adds an entry to the changelog** (see CLAUDE.md).
   Use `node "r&d/tools/bump.cjs" X.Y.Z` (does all three); then
   `node "r&d/tools/check-version.cjs"` checks they and the changelog agree.
5. Before committing, syntax-check the code — a template-literal typo in any
   module white-screens the whole app. Since 0.97.0 the app is `js/*.js`
   (`r&d/notes/module-split.md`), and `node "r&d/tools/check-version.cjs"`
   parses every module and checks every import resolves. The inline scripts
   left in `index.html`:
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
- [x] Composed exercise model (movement + equipment + laterality, PRs per variant,
      parent page rolls up variants) — specs `r&d/specs/exercise-system.md` and
      `r&d/specs/exercise-system-phase1.md`. Confirmed in the code 2026-11-01:
      the model and migration shipped 0.7.0, the workout page on it 0.22.0, any
      equipment for any movement 0.53.0 (B9). Leaf keys, `allExercises()`,
      `variantLabel()` and the axis picker are what everything since builds on.
- ~~PR detection against history~~ — not a bug (Aaron's logging error, 2026-09-24).

---

## 000. 1.0 beta — feature freeze (Aaron, 2026-11-13)

**From 0.99.1 Ironlog is in beta: no new features until 1.0.** Only bug fixes,
data safety and the phone checks in A4. Everything else on this page waits,
in the order it is in now, until 1.0 ships.

**What is allowed in the beta**
- Fixes for anything on `r&d/BUGS.md` (version 0.99.x).
- Wording, layout and accessibility fixes to what exists.
- A4 phone checks, and fixes for what they turn up.
- Not allowed: new screens, new settings, new data fields, new calculations.
  If a fix needs one of those, it is a feature — park it and ask Aaron.

**Ideas during the beta** go in the list below, not into the code. They're
picked up in order after 1.0.

**When it is 1.0**
1. Nothing at severity 2 open on `r&d/BUGS.md`.
2. Three training sessions in a row logged with nothing new added to the
   bug list (Aaron's sessions; the debrief is where they get noticed).
3. One Google Drive sync, one JSON export and one CSV export checked on the
   real log.
4. The A4 items that touch logging (rest timer, Measure, sync) checked on the
   phone.
Then: `node "r&d/tools/bump.cjs" 1.0.0`, a changelog entry that says what 1.0
means, and tick this section. Fixes after that are 1.0.1, 1.0.2; the next
feature is 1.1.0.

### Ideas parked for after 1.0
(added during the beta; Aaron added all of P1–P8 on 2026-11-13, in this
order. Each needs a short spec before building.)

- [ ] **P1. Send a lift to the strength records site.** A record attempt in
  Ironlog packages video, weight, bodyweight, date and division as a
  submission for Aaron's records registry (`areas: strength-records-site`).
- [ ] **P2. Record-attempt planner** for the WDC trap bar and Viking deadlift
  records: attempts from bar speed and recent singles, gap to the record.
  Builds on C2's attempt plan.
- [ ] **P3. Native wrapper** — this is E3 (Capacitor, Health Connect in and
  out, Wear OS rest countdown and set ticking).
- [ ] **P4. Supersets and circuits** — out of `r&d/notes/backlog.md`: one rest
  timer across paired exercises, PRs for every exercise in the group
  (Blast #87, A5).
- [ ] **P5. Logn's calm rests and cool-down** — this is E15.
- [ ] **P6. Dark mode, Metro and Ceefax themes** — this is E10.
- [ ] **P7. Hands-free set logging:** say "180 for 3, 2 in the tank" between
  sets; local parsing first, AI only as the fallback.
- [ ] **P8. Coach view:** a read-only page built from the Drive backup that a
  coach or training partner can open. Must stay inside the no-server rule.

---

## 00. Top priority — bug fixes, then VBT (added 2026-11-10, Aaron)

Aaron asked for these at the top, in this order: bugs first, then VBT. Planned
as a **Fable 5.2 sweep** during the 9–16 Nov launch week, so the allowance is
limited: do the audit (00-B1) first and write it down, so Opus can carry on
from the list if the Fable allowance runs out. Same rules as everywhere — one
fix per commit, version bump, changelog entry.

### Bug fixes

### [x] 00-B1. Whole-app bug audit — done 2026-11-11 against 0.90.0 (`r&d/notes/bug-sweep-2026-11.md`; about a fifth of `index.html` read line by line, the rest click-tested — the note says which)
Read all of `index.html`, `slew-core.js`, `slew-video.js`, `sw.js` and the
`r&d/tools` scripts. Write every bug found to
`r&d/notes/bug-sweep-2026-11.md`, ranked by severity:
1. **Data loss or corruption** — IndexedDB writes, migrations, JSON/CSV
   export → import round trip (B7), Drive sync merge (B6), tombstones.
2. **White screens and crashes** — run the `<script>` syntax check (rule 5
   above), unguarded nulls on a fresh install with no data.
3. **Wrong numbers** — PRs, e1RM, volume, weekly sets (01), RIR ↔ RPE,
   unit conversion (kg stored, never lbs).
4. **Broken or confusing UI** — both skins, TalkBack labels (C4).
Note for each: where it is, how to reproduce, and a suggested fix. Don't fix
anything in this step — the list is the deliverable.

### [ ] 00-B2. Fix the audit's findings, top of the list down — **0.90.1–0.90.17 shipped**: all of severity 1 and 2, and what needs no decision in 3 and 4 (the gripper step is 0.90.11). Left open for Aaron's calls: 3.4, 3.6, 3.7, 3.10, part of 1.8, 4.5 (`r&d/notes/bug-sweep-2026-11.md`)
One fix per version. Severity 1 and 2 before anything else. Anything that
would change existing PR numbers or stored data gets flagged to Aaron first
(as D10 was). Known small one to include: the rep-range "add weight" step
assumes 2.5 kg, which a fixed-rating gripper can't do (E13).

### VBT

### [x] 00-V1. Tilt correction for Measure — shipped 0.91.0 (each sample re-read against the phone's own gravity; 9 Nov still 80 of 81 but those traces have no 3-axis data so they only prove the fallback; 11 Nov 65 of 65 with steadier range of motion; before/after in `r&d/notes/vbt-validation.md`; **Aaron: A4 item 21** — a heavy day recorded with debug on is what would really test it)
0.90.0 started recording the phone's full 3-axis readings so the phone
tilting as the bar rolls could be corrected later. Use Aaron's saved
bar-speed debug traces (`r&d/data/vbt/` — start with its README) to correct for tilt, then re-check rep counts and
speeds against the 9 Nov push day (80 of 81 reps found in 0.90.0 — must not
get worse). Record before/after in `r&d/notes/vbt-validation.md`.

### [x] 00-V2. Bar-speed RIR accuracy — shipped 0.92.0, **not validated** (the traces hold only two typed RIRs — the rest were the sensor's own estimates written back into the set; the two worst misreads are fixed, 35 × 17 from RIR 12 to ~3 and a 40 kg warm-up from 0.2 to ~4; estimates are now only written into a set when observed or calibrated, and sensor-filled RIRs are marked; `r&d/notes/vbt-validation.md`, `r&d/tools/vbt-rir.cjs`; **Aaron: A4 item 23** — type your RIR on measured sets so there's something to check against)
Changelog 0.89.0 says bar-speed RIR is still a rough guide. Compare the
estimated RIR against the RIR Aaron logged on the same sets (debug traces and
history), find where it's off (lift, set length, pocket vs bar mode) and tune
it. Keep showing it as an estimate; still hide it when reps were missed.

### [x] 00-V3. Record video in the app (04c, moved up from section 0) — shipped 0.93.0 (● Record on the first screen of ▶ Video and Tools → Bar path; rear camera, straight into the existing trim → bar path → squat depth flow; on the device only; spec `r&d/specs/bar-path-spec.md` §10; tested with a simulated camera only — **Aaron: A4 item 24**)
Finish part c of item 04: record the side-on clip inside Ironlog rather than
picking it from the gallery, then run it through the existing bar path (04a)
and squat depth (04b) flow. On the device only, no uploads. Check on phone —
add an A4 checklist item.

### [x] 00-V4. Validation (Aaron + code) — code side shipped 0.93.1 (the bar-speed export lists every measured set, sensor and video; `r&d/tools/vbt-validate.cjs` writes a sheet to fill in with the reference device's speeds and turns it into the results-table rows: MCV bias, limits of agreement, RIR error; steps in `r&d/notes/vbt-validation.md` → Filling the results table. **The sets with a reference device are still Aaron's to do**, and the e1RM-in-range check isn't built)
Whatever `r&d/notes/vbt-validation.md` still needs on the code side to compare
Measure and video against a known device. The sets themselves are Aaron's to
film and log.

### Design (added 2026-11-11, Aaron)

Aaron asked for a design pass in the same sweep, after the VBT items. He's
happy for the agent to make the UI and menu changes it judges best — no
sign-off needed per change — within the rules below.

### [x] 00-D1. UI and menu pass — shipped 0.94.0–0.94.4 (40 px tap areas on small buttons; Home leads with today's session; Stats / Skip-or-move labels; a jump row in Settings; empty states with actions; what and why in `r&d/notes/design-pass-2026-11.md`, with eight things left for Aaron to decide. **The axe check was not run** — loading it was blocked in the session; a script checked names, contrast and tap size instead. Aaron: run axe once, or OK an agent loading it)
Go through every page, sheet and menu in both skins and improve what's
cluttered, inconsistent or hard to reach: layout, spacing, hierarchy, labels,
menu structure, empty states, onboarding. Write what you changed and why to
`r&d/notes/design-pass-2026-11.md` as you go.
- **Don't slow down logging.** The live workout screen keeps its 1–2 tap set
  logging (B2) and 40 px controls; nothing new between a set and the tick.
- Keep the agreed nav (Home · Calendar · Train · Stats · Health, Coach in the
  middle, Tools in the top bar) unless there's a strong reason; if you change
  it, say why in the note and keep the old routes working (D12).
- Every change passes C4: TalkBack labels, contrast, re-run the axe check in
  both skins.
- No features removed. If something seems pointless, list it in the note for
  Aaron instead of deleting it.
- Ship in small versions (one area per version) with changelog entries, so
  anything Aaron dislikes can be rolled back on its own.

### [ ] 00-D2. Art and audio (was E16) — **part shipped 0.95.0–0.95.1**: recorded voice for the interval timer (25 cues, 171 KB, phone voice as fallback), a goblin-to-orc muscle-map skin beside the template, and the welcome picture. List, prompts, spend (26 Higgsfield credits, 777 ElevenLabs) and what's left in `r&d/notes/assets-pass.md`. **Left:** PR card backgrounds, and cardio and mobility voice — their cues are built from numbers and exercise names on the spot, so they can't be recordings without a way to speak numbers. Nobody has listened to the audio yet (A4 item 25) or seen the skin on a phone (item 26)
After 00-D1, so the art fits the new layout: go through the app and replace
placeholder or weak art and audio with generated assets. Aaron has connected
**Higgsfield** (images; skip video, it's costly) and **ElevenLabs** (voice,
sound). Both are MCP connectors on Aaron's account — check they show in
`/mcp`; if not, list what's needed and carry on with the rest.
- **Make a list first** in `r&d/notes/assets-pass.md`: every placeholder or
  weak asset (art, icons, sounds, spoken cues), what it should become, and
  which tool makes it, then generate it — Aaron is happy for this pass to
  spend the credits (Higgsfield ~80 credits on Basic; ElevenLabs Starter
  30k/month). Check the cost before big batches and stop before running out.
- **Art (Higgsfield):** the muscle-map skins first — the shipped
  `skins/template.png` is a placeholder; Aaron's idea is a goblin that turns
  into an orc muscle by muscle. One cell per muscle per tier, matching the
  sheet layout in `r&d/skins/`, so it drops in as a normal skin. Then PR share
  card backgrounds (E2), the welcome screen (C1) and the in-app Home (D14).
- **Audio (ElevenLabs):** recorded voice cues for the interval timer (02),
  HR-zone cardio (D15) and mobility holds (E5), in place of the phone's speech
  voice; cleaner beeps for `Cue` if they're worth it.
- **ElevenLabs is on the Starter plan (Aaron, 2026-11-11)**, which includes
  the commercial licence. Audio generated while subscribed can be shipped and
  stays licensed even after the plan is cancelled, so no placeholders and no
  redo before launch. Generate everything while the plan is active. Higgsfield
  (Basic, paid) art is the same: commercial use allowed, no attribution.
- **Keep the app light and offline:** compress everything, cache it in
  `sw.js`, and keep the phone's speech voice as the fallback so any cue whose
  wording changes still works without new recordings. Large packs can be an
  optional download, like squat depth (04b).
- Generated art and voices must be safe to ship in a free app (check each
  tool's licence terms) and must not imitate a real person's voice or an
  existing brand or character.


---

## 0. Next up — extras from the app audit (added 2026-11-08)

From the Hub's `roadmaps/ironlog-from-audit.md`: the audit items Ironlog
doesn't have yet. Once these are in, the matching third-party apps can come off
Aaron's phone. Check the code first in case any part already exists.

### [x] 01. Weekly sets per muscle against a target range — shipped 0.83.0 (spec `r&d/specs/weekly-sets-spec.md`; main muscle 1 set, helpers ½ (share ≥ 0.20), drops ½, RIR 5+ and warm-ups left out; card + 8-week chart + editable range on Stats → Muscles; **Aaron: check the default ranges suit you**)
(Tonnage's MEV / MRV landmarks.) Count hard sets per muscle per week, using the
muscle shares Ironlog already has (`EX_DB`, D7), against a target range the
lifter can edit (MEV → MAV → MRV), with sensible defaults per muscle. Show it
on Stats → Muscles: under / in range / over for the current week, and a trend.
Warm-ups stay out (B3). Decide how fractional shares count (e.g. a set counts
fully for primary muscles, half for secondary) and write it down.

### [x] 02. Interval timer — shipped 0.84.0 (spec `r&d/specs/interval-timer-spec.md`; Train → ⏱ Intervals; runs as a cardio session with `cardio.iv` on top, no HR zone so nothing talks over it; six built-in presets plus your own in `settings.ivPresets`; **Aaron: run one at the gym — A4 item 17**)
(INTVL.) Build run / rest intervals — work, rest, rounds, optional warm-up and
cool-down — with audio and vibration cues from `Cue` and the screen kept on
with `Awake`. Starts from **Train → Cardio** next to the HR-zone session;
saved presets; logs as a cardio session in the calendar and history.

### [x] 03. Daily one-second progress clip — shipped 0.85.0 (spec `r&d/specs/progress-clip-spec.md`, browser check in §1: canvas + MediaRecorder, MP4 where supported, joins in real time ~1 s per clip; Health → Daily clip; ghost of the last clip as the pose reminder; on the device only; **Aaron: A4 item 18** — the camera couldn't be tested from here)
(1 Second Everyday.) Extends E4's progress photos: record or pick a one-second
clip a day, kept on the device only like the photos, and join them into a
timelapse of the bulk and cut that can be played and saved. Same pose
reminder as the photos so clips line up. Check what the browser can do for
joining clips on the phone (MediaRecorder / canvas) before writing the spec.

### [ ] 04. Video bar-path tracing and depth judging — **04a shipped 0.86.0** (spec `r&d/specs/bar-path-spec.md`, agreed 2026-11-08: Slew's plate tracker bundled as `slew-video.js`, no MediaPipe; ▶ Video on a lift and Tools → Bar path; rim measured on still frames for the scale; **Aaron: A4 item 19, then the video section of `r&d/notes/vbt-validation.md`**). **04b shipped 0.87.0** (squat depth: MediaPipe lite pose hosted in `pose/`, 16.6 MB optional download, deep / high / too close to call; plus three bar-path fixes, spec §9 and §12; **Aaron: A4 item 20**). Still to do: **04c** record in the app — **moved to 00-V3** (2026-11-10)
(VBTgo, Metric, PDC Performance.) **Write a spec first.** Record or pick a
side-on video of a set; track the bar end through it to draw the bar path,
and give velocity per rep from the video as a second source next to D1's
motion-sensor Measure. Depth judging for squats (hip crease below the top of
the knee) as a later part. All processing on the device; no uploads.
Label results as estimates, like D1.

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
8. **Cardio machines (0.59.0):** run a short session on each machine you
   use (bike, rower, elliptical, stairs…). Are the cue steps sensible — not
   too timid, not too big — and do the limits match the machine? Note any
   number that felt wrong; they all live in `CARDIO_MACHINES`.
9. **Mobility (0.60.0–0.61.0):** run the morning routine from Train →
   Mobility. Do the hold countdowns, side switches and ticks behave with the
   screen on? Are the **five hypermobility swaps** (wrists, pigeon, deep squat,
   forward fold, prone quad) the right calls? Try the balance test on Health:
   does holding the pad time it, and does it switch legs?
10. **Fit (0.62.1):** the app opens at the right size, pinch-zoom is off, and
    nothing runs off the right edge in either skin (Settings footer, 98 top
    bar).
11. **Coach report (0.63.0):** Tools → Coach report → *Share text* opens the
    share sheet (or copies); *PDF* → Save as PDF prints only the report, not
    the app behind it.
12. **PR card (0.63.0):** after a session with a PR, *↗ Share* on the PR
    opens the share sheet with the image; *Save image* saves it.
13. **Debug mode (0.64.0):** Settings → Debug mode on. Tap a few **how?**
    buttons (Stats → Rankings, a PR, Tools → e1RM) and *Copy trace*. Every
    sheet should end in a green tick, not a red ✗.
14. **Fitting test (0.65.0):** run the home screen at least (Health → Fitting
    test). Are the inputs quick enough mid-test, does the balance timer fill
    the boxes, and does the profile line read right? The full hour is planned
    for the Christmas test day.
15. **AI key (0.66.0):** Settings → AI → paste your key → *Check key* should
    say it works. Then say a set the grammar can't read and see whether
    Claude fills it in; *This month* should count the call.
16. **Coach (0.67.0):** tap the middle Coach button and run the setup as
    yourself, then as Chelsea would (under 6 months). Does the plan look like
    a sane relative of your PPLUL? Swap a lift, Accept, and check the
    calendar. Then Coach settings → Forget everything and try a home setup.
17. **Interval timer (0.84.0):** Train → ⏱ Intervals → Tabata. Are the beeps
    and buzzes loud and clear over gym noise, does the 3-2-1 land right, and
    does the voice talk over music sensibly? Lock the screen for one round —
    what still fires? Check the logged session reads right in history.
18. **Daily clip (0.85.0):** Health → Daily clip → Record today. Does the
    camera open (allow it), is the crop what you expect, and does the ghost
    help line up on day two? Try Flip camera and From gallery. After a few
    days: Timelapse → Save video → Share — does it open in your gallery /
    Instagram? (MP4 if the phone's Chrome supports it, else WebM.)
19. **Bar path from video (0.86.0):** film a squat, bench and deadlift set
    side-on (phone propped at plate height, 2–3 m). In the workout, ▶ Video →
    pick the clip → trim → is the green circle on the plate, and does it sit
    on the rim? Does the path look like the bar? Compare the speeds with
    ◉ Measure on the same set if you can, and try one clip filmed ~30° off
    square to see how much it reads short. Try Save with bar path → Share.
20. **Squat depth (0.87.0):** Settings → Squat depth from video → Download
    (16.6 MB, on Wi-Fi). Film a few squats side-on, whole body in frame, some
    deep and one deliberately high. Do the calls match what a judge would say?
    Is the hip–knee–ankle drawing on the right leg? Note any "too close to
    call" you'd have given a clear light either way — the 3 cm offset and the
    ±2.5 cm band are first guesses (`POSE.offsetCm`, `POSE.bandCm`).
21. **Tilt correction (0.91.0):** Settings → turn **Bar-speed debug** on,
    then Measure a normal push day and a pull or leg day with real weights,
    logging the true rep count on every set. Export the traces and add the
    file to `r&d/data/vbt/`. The 9 Nov push day had no 3-axis readings, so
    tilt correction has only been checked on the 5 kg accessory day. Watch
    for: a first rep going missing (the new "over within 1.8 s of Start is
    setup" rule), and whether ranges of motion look the same rep to rep.
    Also answer the front-raise question in `r&d/notes/vbt-validation.md`.
26. **Goblin skin (0.95.1):** Stats → Muscles → Skin ▾ → **Goblin to orc**. Does it load, do taps still land on the right muscle, and do you like it — with your real scores, in both Strength and Recovery? Should it be the default? Also look at the picture on the welcome sheet (a fresh install shows it).
25. **Interval voice (0.95.0):** Train → ⏱ Intervals → Tabata with Voice on. Listen to a full run: is every call clear over gym noise and music, the right words at the right moment, and not cut off? (Nobody has heard these yet — they were checked by waveform and word timings only.) Then set a 25-second rest and check the phone's own voice takes over for the whole session.
24. **Record in the app (0.93.0):** in a workout, ▶ Video → **● Record**.
    Does the rear camera open (allow it), is the picture the right way up,
    and does the screen stay on? Record a set with the phone propped
    side-on, tap Stop, and check the trim sliders cover the whole clip and
    the plate is found as it is from a gallery clip. Is the motion smooth
    enough — compare the speeds with the same set filmed in the phone's own
    camera app. Try ⟲ Flip, and a clip over a minute.
23. **Bar-speed RIR (0.92.0):** with Bar-speed debug on, Measure your
    working sets for a couple of weeks and **type your own RIR on every
    one** before looking at the sensor's. Ironlog no longer fills the box
    unless it saw a missed rep or the lift is calibrated. Take one set per
    main lift to failure. Then export the traces: `node
    "r&d/tools/vbt-rir.cjs" <file>` prints the sensor's RIR beside yours.
22. **Bug-sweep fixes (0.90.1–0.90.17):** import an old JSON backup — the
    **Replace your log?** sheet should show both counts, and Settings → Data
    should then offer **Undo import**. Change a rep in Edit session and tap
    outside the sheet: it should ask before discarding. Sync to Drive from
    the phone once and check nothing goes missing (the merge was only run
    with two simulated phones).

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

### [x] A7. Stats: main-lift chart shows on every tab (bug) — fixed 0.52.4
Added 2026-10-31. On the Stats/Analytics page the headline tiles (sessions,
volume, PRs) and the **e1RM trend · main lifts** card (`mainLiftChart()`, which
picks the top 3 lifts via `mainLiftKeys()`) render *above* the
Exercises / Rankings / Muscles / Body switch in `viewAnalytics()`, so the same
top-3 lifts appear on every tab.
- Show the tiles and main-lift chart on the **Exercises** tab only (move the
  `${mainLiftChart()}` call, and the tiles, inside the `analyticsTab ===
  'exercises'` branch).
- Each other tab opens with its own content; nothing above the switch except
  the page title.
- If D13 moves Body out of Stats, drop the Body tab here at the same time.

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
**Parked in 0.49.1:** the step buttons (±weight, ±rep) and Copy down are hidden (`FAST_BAR = false` in `index.html`) while Aaron designs a replacement. Prev fill and tick-to-log still work.
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

### [x] B4. Plate loader and warm-up ramp from the set — shipped 0.31.0 (on the Tools page too since D11, 0.56.0)
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

### [x] B9. Let any equipment be picked for any movement — shipped 0.53.0 (spec 1a updated; the Check exercise data report and JSON/Drive import never rejected these leaves, so only the picker and the name importer changed)
Added 2026-10-31. Today the equipment picker (`openAxisPicker`) greys **and
disables** equipment a movement doesn't list — spec 1a in
`r&d/specs/exercise-system.md`. Aaron's call: grey is fine as a hint, but it
must still be selectable. If someone wants to bench press with a kettlebell,
that's up to them. Update spec 1a to say so.
- Unlisted equipment stays **greyed and sorted below** the usual options, but
  tappable. Picking one asks nothing and blocks nothing; a small "unusual
  combo" note at most.
- The result is a normal leaf (e.g. Bench Press / Kettlebell): its **own PR
  pool**, history, stats and variant-strip entry like any other. Nothing
  merges it into the standard variant.
- Muscle shares fall back to the movement's own shares; equipment doesn't
  change them.
- Settings → **Check exercise data**, CSV/JSON import, Drive sync and the
  importers (B8) must accept these leaves instead of flagging them as invalid.
- The places filter (D6) still applies on top: equipment that isn't at the
  current place shows "not at …" as now, and stays selectable too.
- Execution and attachment axes stay as they are unless Aaron asks for the
  same there.

---

## C. Competition — the edge nobody else has

### [x] C1. Welcome / first-run screen — shipped 0.36.0 (strongman and para choices open their event types since 0.37.0 / 0.38.0)
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

### [x] C5. Adaptation modifiers and pain / fatigue notes — shipped 0.40.0 (**the adaptation list is provisional: check it with adaptive lifters**, then edit `group: "adaptation"` entries in `r&d/data/exercises.json`)
Extends the modifier chips. Structured modifiers such as **seated, strapped,
assisted, one-sided set-up** that annotate a set **without** splitting the PR
leaf, plus an optional quick pain/fatigue flag on a set or session. Validate the
list with adaptive lifters (Aaron's community) before finalising.

### [x] C6. Training blocks counting down to a meet — shipped 0.41.0 (spec: `r&d/specs/blocks-spec.md`)
Block templates (e.g. accumulation → intensification → peak → taper) laid out
backwards from an event date in C2, feeding the autoregulated programming.

---

## D. Strong additions

### [x] D1. VBT overhaul — two modes plus calibration — code shipped 0.42.0 (spec: `r&d/specs/vbt-overhaul-spec.md`) **(check on phone; validation against a transducer still to do — `r&d/notes/vbt-validation.md`)**
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

### [x] D2. Strength library seeding — shipped 0.43.0 (Larsen, TruSquat, pendulum new; SSB, trap bar and belt squat as equipment with aliases; strongman implements from B1)
(Blast #38.) Larsen press, TruSquat, SSB, trap bar, belt squat, pendulum squat,
plus the strongman implements from B1 — as movement + equipment leaves. Check
`EX_DB` for what's already there. Can be done alongside B1.

### [x] D3. Structured tempo — shipped 0.45.0 (spec `r&d/specs/tempo-spec.md`; four counts with X, picker boxes and presets, picked up from notes, line on the active set with time under tension, Measure shows real down/up times)
(Blast #110.) Extends the modifier chips: a four-digit tempo (eccentric–pause–
concentric–pause, e.g. 3-1-1-0) rather than a text chip; shown on the active
set; doesn't split the PR leaf. VBT Measure can fill in the real concentric
time.

### [x] D4. Per-side logging for unilateral lifts — shipped 0.46.0 (spec `r&d/specs/per-side-spec.md`; decision taken: the weaker side counts for PRs, the roadmap default; imbalance section on the variant page)
(Blast #79.) Left and right reps (and weight if different) on one set for
unilateral leaves; imbalance trend on the variant page. **Open decision:** which
side counts for PRs (default: the weaker side).

### [x] D5. Rep range + RIR suggestion — shipped 0.47.0 (spec `r&d/specs/rep-range-spec.md`; double progression from note, menu or planner; up / build / below verdict; Use fills next weight on non-autoregulated entries)
(Blast #99.) Optional rep range per exercise in a program; hitting the top of
the range at the target RIR suggests more load next time. Works alongside the
autoregulated programming, doesn't replace it.

### [x] D6. Equipment profiles — shipped 0.48.0 (spec `r&d/specs/places-spec.md`; places with kit and optional own bars/plates, 📍 switcher on the session, picker greys, swap on planned sessions, voice adds respect it — the only AI use today)
(Blast #41, #107.) Named places ("Home", "Gym") with their kit and plate
inventory (shared with B4); the picker greys what isn't available there, and
any program or AI suggestion respects it.

### [x] D7. Recovery / fatigue heatmap on the skins — shipped 0.49.0, **provisional** (spec `r&d/specs/recovery-spec.md`; Strength / Recovery switch on the muscle map, picker dots; muscle shares for the program's lifts listed in `r&d/notes/muscle-shares-check.md` — trust once that list is checked)
(Blast #117 — Blast users call it the feature they miss most.) Extend the body
heatmap to show which muscle groups are fresh vs fatigued. Also show it where
exercises are picked when building a session or program. Only trust it once
muscle shares for commonly trained lifts have been checked — derived shares are
placeholders.

### [x] D12. Layout rework — Home · Calendar · Train · Stats · Health — shipped 0.54.0 (spec `r&d/specs/layout-spec.md`; the cardio machine picker came with D15 in 0.59.0, the Mobility start and Home mobility line with E5 in 0.60.0)
Decided 2026-10-31. **Do this before D13 (Health) and E5 (Mobility)** — they
need somewhere to live. Write `r&d/specs/layout-spec.md` first; it covers both
skins (the 98 menu bar mirrors the same pages).

Bottom bar goes from Home · Calendar · Workout · Stats · Events to:
**Home · Calendar · Train · Stats · Health.** Still five tabs.
- **Workout → Train,** with three starts: **Lift** (today's *Start empty
  workout* / planned sessions), **Cardio** (opens the machine picker, D15) and
  **Mobility** (pick a routine, E5). A mobility routine is a session kind like
  cardio: it shows in the calendar and history and has its own player.
- **Events → into Calendar.** An event is a dated item on the calendar
  (blocks already count down to it, C6); opening it gives the full meet-day
  tools from C2/C3 unchanged. Add an "Add event" entry on the Calendar page and
  keep a list of upcoming events there. When an event is close (say ≤ 14
  days), Home shows a countdown card that opens meet-day. Nothing in C2/C3
  is removed — only where it's reached from.
- **Health gets the freed slot** (D13). Stats goes back to training only:
  Exercises / Rankings / Muscles; the Body tab leaves (with A7's fix).
- **Tools (D11) goes in the top bar** next to profile and settings, so the
  default skin can reach it too (today only the 98 menu has it).
- **Home** adds a line for today's mobility routine (e.g. "Morning stretch
  8 / 25", tap to resume) alongside the check-in and today's training.
- **Old routes keep working:** `go('meets')` opens Calendar's events,
  `go('workout')` opens Train, `analyticsTab === 'body'` opens Health — like
  the existing `food → home` redirect in `go()`. A live session still resumes
  from Train exactly as it does from Workout now.
- C4 rules: nav labels, `aria-current`, 40 px targets; re-run the axe check
  in both skins.

### [x] D10. Fix `prKey` / `splitsPR`, with band and chain fields — shipped 0.55.0 (`exKey` on `prKey`; `chainKg` / `bandKg` per entry; what moved is shown once after the update and in Check exercise data — **Aaron: read that notice on the phone**)
`prKey()` is dead code, so chains, bands, slingshot and equipped currently share
a PR pool with the raw lift. Real bug, but fixing it **changes existing PR
numbers** — do it on its own, deliberately, and tell Aaron what moved. Add band
tension and chain weight fields at the same time (Blast #112, recast for
accommodating resistance).

### [x] D11. Tools page (calculators) — shipped 0.56.0 (spec `r&d/specs/calculators-spec.md`; adaptive TDEE left out — no food intake to read since A1; Butt constants checked against secondary sources only)
The 98 skin's menu bar already has a Tools menu; the default skin gets a top-bar Tools button (D12). Every
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

### [x] D13. Health page — everything about the body in one place — shipped 0.57.0 (spec `r&d/specs/health-page-spec.md`; recovery map stays on Stats → Muscles with a link from Health; mobility and balance tests added 0.61.0 (E5), blood pressure and glucose 0.62.0 (D16); E6 still to land here)
Added 2026-10-31. A page of its own (not a tab under Stats) for health and
body data. Write `r&d/specs/health-page-spec.md` before building.
- **Moves in from Stats → Body (E4):** bodyweight with the 7-day average,
  caliper tests (JP3 / JP7 / DW4, raw skinfold sum beside the %), measurements
  (L/R and custom sites), progress photos. Reuse `viewBody()` and the existing
  stores — no second copy of the data, no schema change just for the move.
- **Grows into the home for:** E6 supplements and blood work, E5 ROM and
  balance tests, the recovery heatmap (D7) if it reads better here, and D11's
  physique calculators (prefilled from this data).
- Top of the page: latest bodyweight, latest BF% / skinfold sum, and the
  trend since the last check, each tapping through to its full history.
- Way in: its own bottom-bar tab (D12). Old links to Stats → Body go here.
- Also holds the mobility **tests** from E5 (ROM, balance, forward-fold
  benchmark); the routines themselves run from Train.
- Same rules as everywhere: C4 accessibility, both skins, data stays on the
  device and is in JSON export / Drive sync.

### [x] D14. A proper landing page — shipped 0.58.0 as the **in-app Home** (Aaron, 2026-10-31: not a separate public site; spec `r&d/specs/home-landing-spec.md`). App URL, scope and service worker untouched
Added 2026-10-31. A public page that explains what Ironlog is before someone
installs it: who it's for (powerlifting, strongman, strengthlifting, adaptive
lifters), the free / local-only / bring-your-own-AI-key model, a few
screenshots, and a clear **Install** button with Android steps.
- **Check with Aaron first** that this means the public site, not the in-app
  Home page.
- The app currently *is* the site root (`index.html`), so moving it would break
  installed PWAs (`start_url` / service worker scope). Spec the URL layout
  before building — e.g. landing page at a separate path or a sibling page,
  app untouched — and keep existing installs working.
- Plain static HTML/CSS, fast, no tracking. Links to the changelog, privacy /
  data note and the GitHub repo.

### [x] D15. More cardio machines for the HR-zone session — shipped 0.59.0 (spec `r&d/specs/cardio-spec.md` → Machines; one `CARDIO_MACHINES` table; step sizes and limits for everything but the treadmill are first guesses — gym check on A4)
Added 2026-10-31. The HR cardio session (0.19.0, `r&d/specs/cardio-spec.md`)
is treadmill-only: its cues are speed and incline (`CARDIO_DEF`, `CARDIO`
limits in km/h and %). Add other machines, each with its own thing to cue.
Update the spec first — its "Other machines" note is where this was parked.
- **Pick the machine at setup** (Train → Cardio, D12); each logs as its own exercise leaf (check
  `EX_DB` for existing cardio entries before adding new ones) with HR trace,
  duration and whatever the machine reads out.
- **What gets cued, per machine** (the knob the lifter turns by hand — none of
  these have a control API either):
  - Exercise bike / spin bike — resistance level, or cadence (rpm)
  - Air / assault bike — rpm or watts
  - Rower — stroke rate (spm) or 500 m split
  - Ski erg — stroke rate or split
  - Elliptical / cross-trainer — resistance and incline, or strides per minute
  - Stair climber / stepper — level or steps per minute
  - Walking / running outdoors — pace (no incline)
  - **Other** — a plain "harder / easier" cue for anything not listed
- Same engine for all: settle period, smoothed HR, hysteresis, hard HR ceiling,
  voice + beeps (`Cue`), screen awake (`Awake`). Only the cue wording, the
  step size and the limits change per machine — keep them in one table, not
  per-machine code paths.
- Remember the last setup **per machine** in `settings.cardio`, so a bike
  session doesn't load treadmill speeds.
- Optional manual readouts at the end (distance, kcal, avg watts) — never
  required.
- Real-gym check per machine goes on the A4 list.

### [x] E5. Mobility training — moved up 2026-10-31 (Aaron); routines shipped 0.60.0, tests and balance test 0.61.0 (spec `r&d/specs/mobility-spec.md`; five hypermobility swaps proposed and on by default — **Aaron: check them**; "loaded-stretch drills as lifting sets" and more saved routines still to come; the stretch and mobility library `r&d/data/mobility.json` — 101 items — landed with 0.98.0 with a library browser and custom routines — spec §3)
Write `r&d/specs/mobility-spec.md` before building.
- Routines start from **Train → Mobility**; tests and their charts live on
  **Health** (D12, D13).
- **Starting point (added 2026-10-31):** Aaron's daily morning routine,
  transcribed to `r&d/data/routines/morning-stretch.json` — 8 zones, 25
  stretches (the sheet says 24; it lists 25), ~30 min. Ship it as the first
  built-in routine and use it to shape the data model:
  - zones with an estimated time each; items with targets, position, cue text
  - dose types: hold (s), hold range (60–90 s), hold × sets, hold × reps
    (chin tuck 5 s × 8), plain reps (cat-cow), per side, and a follow-on
    ("then both knees 30 s")
  - a **flag** line for priority items, an **alt** swap (pigeon → lying glute
    stretch), and a **benchmark** that feeds the ROM tests below (standing
    forward fold reach: knee → mid-shin → ankle → toes → floor, weekly)
  - tick-off per stretch as it's done, like the sheet's checkboxes, and a
    record of the routine done that day
  - **Review the content against the hypermobility rule below before it
    ships:** most of it is passive static stretching (pigeon, prone quad,
    wrist stretches, deep squat hold), which this item says to go easy on.
    Aaron decides what stays, gets an alt, or becomes a loaded version.
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
- **Balance test** (added 2026-10-26 at Aaron's request): single-leg stand,
  eyes closed. Press and hold a big pad when the foot lifts, release when it
  touches down; time shown to 0.1 s. Pick the standing leg, auto-switch after
  each attempt, ignore anything under 1 s, buzz on start and stop (reuse `Cue`,
  `Awake`). Best per leg, history charted per side, left/right imbalance shown
  like D4. Optional eyes-open mode as a separate test. A working prototype of
  the interaction exists as a standalone artifact ("Stork Stand").

### [x] D16. Blood pressure and blood glucose on Health — shipped 0.62.0 (spec `r&d/specs/health-page-spec.md` → Vitals)
Added 2026-10-31 at Aaron's request — for diabetic lifters especially. Write
the spec into `r&d/specs/health-page-spec.md` first.
- **Blood pressure:** systolic / diastolic, optional pulse, arm and note;
  several readings a day. Charted, with the latest and a 7-day average.
- **Blood glucose:** stored in mmol/L (Aaron's call), shown in mmol/L or
  mg/dL by a setting. Each reading has a context: fasting, before a meal,
  2 h after, bedtime, other.
- **Reference bands (Aaron's call: NHS):** BP coloured against the NHS
  bands (low, ideal, raised, high). Glucose against targets the lifter sets
  per context, with NHS general targets as the defaults, and a low under 4
  always flagged. Labelled as reference, not advice: a diabetes team may set
  other targets.
- Same rules as Health: on the device, in JSON export and Drive sync, C4.

### [x] D8. AI on the user's own key — shipped 0.66.0 (spec `r&d/specs/ai-key-spec.md`; every call through `aiCall`, Claude Haiku 5.5, monthly cap default $1 per device, usage meter and per-feature cost hints in Settings → AI; no server-side AI function was left to remove)
No Ironlog AI server and no paid tier.
- A Settings field for the user's own Anthropic API key, stored only on the
  device, with a clear note on what it's used for and roughly what it costs.
- Calls go straight from the device to the API. Per-feature cost hint and a
  monthly cap the app enforces locally.
- Every AI feature is optional and hidden or greyed until a key is added.
- Remove any server-side AI function left after A1.

### [x] D9. Coach — template plans, then AI coaching — **all parts shipped by 0.73.0**; **parts 0–1 shipped 0.67.0** (Coach button, chat setup, memory, plan builder with preview/swap/accept; kit in two taps and the fitting-test invite added 2026-11-02). 0.67.1 asks for sex, date of birth and bodyweight when missing; 0.68.0 asks whether to build a plan at all and adds **Bring in a plan** (the Ironlog plan format, `r&d/specs/plan-format.md`, written by the lifter's own AI or by Claude on their key). 0.69.0 makes the chat local-first (Aaron: "build up as much automated chat as you can"): digest, debrief, weekly review, data-built Ask chips, a typed-question matcher, "remember …" notes, AI only as the fallback; 0.70.0 adds conversation (context, small talk, quick sums, situations). 0.71.0 adds suggested changes (swap a stalled lift, add a set, lighter week — apply and undo). 0.72.0 adds Tailor it (Claude on the lifter's key, swaps and ±1 sets only, re-checked locally). 0.73.0 adds the cardio trend coach, built locally (HR slope over 90 s, a minute's projection, the smallest step early; a switch on cardio setup) instead of a Haiku call a minute — no AI needed
**Spec: `r&d/specs/coach-spec.md`** (planned 2026-11-01 — the spec wins over
this summary). Uses D8 for the AI parts.
- **Build first: a raised Coach button mid-nav opening a chat with its own small memory (`S.coach`: setup done?, answers, notes), and the template plan builder run inside that chat, no AI.** Setup questions (goal,
  date, place, tap the training days — the count picks the split: 1 full
  body · 2 upper/lower · 3 PPL · 4 ULUL · 5 PPLUL · 6 PPLPPL — session length,
  experience, priority lifts (skipped under 6 months), go-easy list), then a
  preview with swaps and Accept. Output is a normal `loads: "rir"` program.
  Aaron tests it on himself and on Chelsea (new lifter).
- Then: a local **training digest**, AI **session debrief** and **weekly
  review**, optional **Tailor it** (slot swaps only, re-checked locally), and
  **Ask the coach**. Nothing changes a plan without the user accepting it.
- Logging stays tightly scoped structured calls, separate from any chat.
- Hard system-prompt boundaries so the coach can't drift off-topic; no medical
  or injury advice.
- Cap or summarise conversation history; use prompt caching — it's the user's
  money.
- Optional cardio trend coach: a Haiku call about once a minute looking at HR
  *trend*, pre-empting drift out of zone.

---

## E. Later — little demand found

### [x] E1. Coach share report — shipped 0.63.0 (spec `r&d/specs/share-spec.md`; Tools → Share → Coach report: 4 / 8 / 12 weeks or custom, as share text, PDF via print, or JSON)
A read-only report (JSON / text / PDF) of a training block for a coach. No
accounts, no server.

### [x] E2. Share cards — shipped 0.63.0 (session cards were already in; added the PR card, 1080×1350, from the session-complete sheet and the Stats PR timeline; spec `r&d/specs/share-spec.md`)
A PR or session summary as an image to post (hunchback_hercules-friendly).
Optional; no social feed.

### [ ] E3. Native wrapper project
One project, only if Aaron decides to go native: Capacitor wrapper for the Play
Store, **Health Connect** (bodyweight, HR, body-comp scans in; sessions out —
Blast #58, #12), and a **Wear OS companion** (current set and rest countdown on
the watch, tick sets from the wrist). A PWA can't do any of these.

### [x] E4. Body composition page — shipped 0.50.0 (spec `r&d/specs/body-comp-spec.md`; Stats → Body: bodyweight with 7-day average from check-ins, JP3 / JP7 / DW4 calipers with Siri and the raw sum, measurements with L/R and custom sites, progress photos on the device only; **check one caliper result by hand**)
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

### [ ] E6. Supplements and blood work
Supplement schedule, reminders and adherence history, viewable alongside
training. Blood work results over time. No drug dosing or cycle-planning
features.

### [ ] E7. Small extras
- Machine settings note or photo per variant, e.g. "seat 4, pad 6" (Blast #29).
- Swap an exercise across past sessions, with a preview (Blast #69).
- OLED true-black — moved into E10.
- Setting for the workout timer at the top or bottom — machine phone holders
  cover the bottom (Blast #108).
- Custom trackers: unit + target, e.g. water, sleep (Blast #59, #15).

### [ ] E8. Chat front door (rethink first)
Log and get coaching through a messaging app (WhatsApp or similar — **not
Telegram**) plus voice. **Conflicts with the no-server model** — a messaging bot
needs a server to receive messages. Rethink before building.

### [ ] E9. Only if there's nothing else to do
Strava (Blast #115) · Whoop (#111) · translations (#116, #85) · reorder and sort
routines (#80, #9) · separate muscle heads for arms (#63) · ~~picture
instructions (#21)~~ (E14) · suspension trainer, rings and jump rope exercises (#105,
#93, #40).

### [ ] E10. More themes — dark mode, Frutiger Metro, Ceefax
Added 2026-09-27 at Aaron's request. Ironlog already has two skins (default and
98) — check how they're switched and styled before adding more, and turn that
into a proper theme layer (colour/type tokens per theme) so a new theme is one
block of CSS, not edits scattered through `index.html`.
- **Dark mode:** a dark version of the default look, with **Auto** (follow the
  phone's system setting) as an option. Include an **OLED true-black** variant
  (Blast #77, was in E7).
- **Frutiger Metro:** Windows 8 / Windows Phone "Metro" era — flat solid-colour
  live tiles, big thin lowercase headings, one bold accent colour, no gradients
  or shadows, edge-to-edge panels. Home as a tile grid is the showpiece.
- **Ceefax:** BBC teletext look — black background, the eight teletext colours,
  chunky monospace/block font, double-height headers, page numbers ("P100")
  in the header bar, block-mosaic graphics for charts where practical.
- **Every theme must still pass C4:** contrast (WCAG AA), 40 px workout
  controls, TalkBack labels — re-run the axe check per theme. Ceefax's font
  and colours need particular care for readability mid-set.
- Theme choice in Settings (and on the welcome screen, C1); stored in
  `settings`, applied before first paint so there's no flash of the wrong theme.
- Muscle map skins (0.23.0) are separate from themes — check they read well on
  dark backgrounds.

### [x] E11. Debug mode — show the working — shipped 0.64.0 (spec `r&d/specs/debug-mode-spec.md`; Aaron's call: every calculation listed below in the first build; fitting-test scores join with E12)
Added 2026-10-31 at Aaron's request, after seeing a step-by-step scoring trace
for the strength fitting test's home screen. Goal: any number the app works out
can show how it got there, so a wrong-looking result can be checked or reported.
- **A Settings toggle, off by default.** When on, calculated values get a small
  "show working" tap that opens the trace: the inputs, which value was picked
  (e.g. the worse side), the formula with the numbers filled in, any cutoffs or
  thresholds passed and missed, and the result.
- **Start where results get questioned:** PR detection (`prKey` — which entry
  beat which; read-only, see D10), estimated 1RM, strength tiers and standards,
  mobility and balance test scores (E5), RIR ↔ RPE conversion, rep-range
  verdicts (D5), VBT velocity, velocity loss and estimated RIR (D1), the
  recovery heatmap (D7), DOTS, caliper body fat (E4), and cardio HR-zone cues
  (D15).
- **One shared trace helper**, so every calculation records steps in the same
  shape (label, value, note) instead of each feature building its own debug UI.
  No cost when debug is off.
- **Read-only:** never changes data. A "copy trace" button puts it on the
  clipboard as plain text, for pasting into a bug report or a Claude chat.
- Trace sheets follow C4 (labels, contrast, text size).

### [x] E12. Strength fitting test — first build shipped 0.65.0 (results and flags only; decisions in spec §13: Ironlog's STD standards, heaviest set at ≤ 3 RIR for the ladder e1RM, lives on Health) **(check on phone; the plan side of §9 and the open cutoffs in §12 are still to do)**
Added 2026-10-31 at Aaron's request. **Spec: `r&d/specs/fitting-test-spec.md`**
(reference workbook with working formulas: `r&d/data/fitting-test/strength-fitting-test.xlsx`).
Colour analysis for training: a one-hour test (15 min home, 45 min gym, no true
maxes) that ranks every lift and physical quality, assigns a profile type and
raises flags that change the plan.
- **Home screen:** knee-to-wall, shoulder scratch (new test), broomstick overhead
  squat flat and heels raised (new), eyes-closed single-leg stand, body
  measurements. Reuses E5's tests and Health charts; retested every 2 weeks.
- **Gym:** power (speed rep via D1 Measure, or jump and reach), a four-pattern
  **RIR rep ladder** (8 → 5 → 3 → 2 → 1, jumps of +50 / +25 / +10% bodyweight
  by reps left) giving an estimated 1RM per pattern, a leg press rep-tolerance
  set, a bodyweight bar hold and a 500m row with 60 s HR recovery.
- **Scoring:** every test scores 0–5 against five cutoffs, with sources marked
  sourced or estimated. Strength uses bodyweight multiples plus a new
  **variation factor** table (trap bar high handles ×1.15) so trap bar and
  Smith lifts stop ranking against the barbell lift.
- **Results:** tiers, strongest / lagging pattern, weakest area overall, volume
  tolerance, a one-line profile type, and flags at score ≤ 2 or a left/right
  gap over 30%. Every score traceable in debug mode (E11).
- **Open before building** (spec §12): one standards source for Stats and the
  test, where it lives in the app, and how ladder sets pick the e1RM. The plan
  changes the profile drives are not specified yet — first build shows results
  and flags only.

### [x] E13. Grippers and finger extension bands — shipped 0.75.0 (Aaron asked 2026-11-02)
Two new movements in `r&d/data/exercises.json`: **Gripper Close** (equipment
`gripper`) and **Finger Extension** (equipment `extension_band`, or a normal
resistance band). Both default to one hand and are `loadOverride: per_side`, so
the weight is the gripper's (or band's) rating per hand. Reps log as normal;
timed holds use the existing isometric toggle ("Log as isometric hold"), with
records per rating. Grip kit is pocket kit (`POCKET_KIT`): never flagged as
missing at a place. Not done: gripper presets by brand/rating (lb → kg), and
the rep-range "add weight" step still assumes 2.5 kg, which a fixed-rating
gripper can't do.

### [x] E14. Exercise demos on the Info tab — shipped 0.80.0 (spec `r&d/specs/exercise-demo-spec.md`; Aaron asked 2026-11-05)
Animated side-view outline figure (inline SVG, one engine, patterns as data —
ten patterns, 43 movements mapped), effort-tinted primary muscles, bar path,
phase labels and controls; setup / cues / mistakes / variant note text in
original wording; **Your notes** per movement (`S.exNotes`, synced). Covers
Blast #21 (picture instructions, was in E9). Later: front-view toggle and
replaying the lifter's own VBT tempo.
**0.80.1:** demos moved to data (`r&d/data/demos/`, `build-demos.cjs`) with a
pose editor (`r&d/tools/demo-lab.html`) and a checker/contact sheet
(`demo-check.cjs`) — spec §8. Front raise added through the lab (44 mapped).
**0.81.0:** first batch through the tools — face pull, upright row, rear-delt
row, Y-raise, straight-arm pulldown, pullover, concentration, spider and drag
curls, sissy squat, hack squat (55 mapped). Engine gained `heel` (heel lift),
a standing `backPad` and per-variant `skip`.
Next: batch 2 needs small tweaks (leg curl/extension, hanging raises, dead
hang, step-up, pendulum, TruSquat, stone/keg/sandbag loads); calf raises are
now cheap thanks to `heel`. Then one engine change per family: plank
(push-ups, planks, ab wheel), floor (sit-up, bridge, hip thrust), shrug, leg
press, posterior-chain benches, dips. Cross-body moves (flyes, pec deck,
rear-delt fly, hip ab/adduction) wait for the front-view toggle.

### [ ] E15. Logn's cool-down and calm rests in Ironlog (Aaron asked 2026-11-09)
Bring the parts of **Logn** (`tribbles69/logn`, Aaron's standalone calm/focus
PWA) that earn their place into Ironlog. Logn's README already names the plan:
Downshift becomes the rest-timer and cool-down screen, Lock-in the pre-set
screen. **Check with Aaron first which modes have worked for him in Logn** —
its home screen's Cool-down comparison (pulse drop and control-pause change
per setup) is the evidence. Then write a spec (`r&d/specs/calm-spec.md`).
- **Cool-down after a session:** an offer on the session-complete sheet —
  box breathing (4·4·4·4, or the 3 s ease-in) over the Drift "Silk" visual,
  or Downshift's breath pacer (4/6, 4/8, double sigh, box). Vibration and
  sound carry the pattern so eyes can stay shut. Watch HR from Ironlog's
  existing Web Bluetooth code (no second implementation), logged as a short
  trace with its low point against the session.
- **Calm rest (option):** a breath pacer on the rest timer, off by default,
  that never hides the countdown or delays the rest-end alert.
- **Lock-in before a heavy single (option):** fixation-then-tracking drill
  from the active set.
- **HRV check on Health:** Logn's camera (fingertip + torch, RMSSD) and RR
  interval check, compared against the last 7; could feed D7 recovery and
  the Coach's readiness later. Port Logn's fix for a saturated torch image
  (logn #4).
- Logn's design rules come with it: no flicker or strobing, dark and dim,
  screen kept awake (`Awake`). Offer an import of Logn's JSON export so its
  history isn't lost. Logn stays a standalone app either way.

### [ ] E16. Art and audio pass — moved to **00-D2** (2026-11-11)

---

### [x] E17. Untangle the modules (Aaron, 2026-11-13) — **done, 0.98.1–0.98.3**
After the module split, almost every file imported every other one in a
circle. Make the layers real, so a file can be read, edited and bug-checked
with only what is below it. Pure refactors: no behaviour change, checked each
time with `module-map --check`, smoke and `baseline.js` on both seeds against
main. What moved, and the numbers: `r&d/notes/module-split.md` → Untangle.
- [x] **Phase 1 (0.98.1):** `state.js` and `kit.js` split out; `core.js`
  imports only `state.js`; nothing but `main.js` imports `ui.js`.
- [x] **Phase 2 (0.98.2):** `js/loading.js` — plates, bars, ramps, places and
  kit out of `workout.js`.
- [x] **Phase 3 (0.98.2):** the exercise screens to `js/movement.js`; muscle
  shares, side text, priority and main lifts into `exercises.js`, which now
  imports only `core` and `state`.
- [x] **Phase 4 (0.98.2):** `js/io.js` (load, migrations, import, export) and
  `js/sync.js` (the Drive sync job) out of `database.js`, which now imports
  only `state`, `core` and `kit`.
- [x] **Phase 5 (0.98.3):** `training.js`, `picker.js`, `ai.js`, `report.js`,
  `migrate.js`, `rest.js`. The cycle is the four screens that open each other
  (workout, health, coach, movement), left on purpose; CLAUDE.md has the
  layer list new code must keep to.

## Parked
See **`r&d/notes/backlog.md`** — sleep/recovery strip on sessions,
sleeves/wraps/belt as gear, supersets and circuits. Each has its reasoning
written down.
