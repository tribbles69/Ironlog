# Ironlog roadmap

The single list of what's being built next, in order. Written for Aaron and for
any agent (Claude Code etc.) picking up work cold.

**Who it's for:** powerlifters, strongman and strengthlifters, adaptive lifters
especially. Ironlog has to earn its keep for one user first — Aaron — before it
competes with anything.

**Model:** the app is free and genuinely complete (logging, comp prep, VBT).
Premium (~£5/month) is AI features and cloud sync. Things that cost nothing per use
(export, meet tooling) stay free.

---

## How to work from this file

Paths here are from the repo root. The folder is `r&d` — **quote it in the
shell** (`cd "r&d"`), since an unquoted `&` backgrounds the command.

1. Take the **first unchecked item under "Now"** unless Aaron says otherwise.
   If everything under "Now" is done, carry on down the file in order: "Next",
   then the ranked Blast section, then "Later".
2. **Check the code before trusting a status here.** Some items were marked from
   memory of planning chats, not from the code. If something is already built,
   tick it, note the version, and move on.
3. If an item links a spec in `r&d/specs/`, the spec wins over the summary here.
4. One feature per commit. Every shipped change bumps `version.json` **and**
   the `VERSION` / cache name in `sw.js`, or installed PWAs keep serving the old
   shell.
5. Before committing, syntax-check every `<script>` block — a template-literal
   typo white-screens the single-file app:
   ```bash
   node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');[...h.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].forEach((m,i)=>{try{new Function(m[1]);console.log(i,'OK')}catch(e){console.log(i,'ERR',e.message)}})"
   ```
6. When an item ships, tick it here with the version number. Don't reorder
   priorities without asking Aaron.

**Standing rules (don't break these):**
- RIR is what's shown and typed; **RPE is what's stored** and what all effort
  maths uses, via `rirToRpe` / `rpeToRir`. Don't store RIR.
- Weights are kg.
- Local-first: the device is the source of truth; any server is a sync target.
- AI is a fallback, never the first path. Local tables/databases answer first.
- Never fix `prKey` / `splitsPR` as a side effect of another feature (see Later).

---

## Done (as far as known — verify)

- [x] Installable PWA with offline cache and safe mid-workout updates
- [x] IndexedDB storage, JSON export/import
- [x] Food tab: CoFID + curated local tables first, Haiku fallback via server-side
      function (key never on the phone)
- [x] Exercise database (`EX_DB`, 736 movements) with muscle shares; body heatmap
- [x] RPE → RIR switch across display, inputs and voice logging
- [x] Muscle map skins (0.23.0): the body is painted from a skin sheet, one cell per
      muscle per tier, so any art works. Only the placeholder `skins/template.png`
      ships (darker orange per tier) until proper art is made; custom sheets
      importable. Guide and paint files in `r&d/skins/`
- [x] Slew VBT built in: per-exercise **Measure** flow (phone motion sensor →
      per-rep velocity, velocity loss, estimated RIR) — `slew-core.js`
- [ ] Composed exercise model (movement + equipment + laterality, PRs per variant,
      parent page rolls up variants) — specs in `r&d/specs/exercise-system.md` and
      `r&d/specs/exercise-system-phase1.md`. **Status unconfirmed — check how far
      phase 1 got before building anything that depends on it.**

---

## Now

### 0. ~~Fix: "Log a test" can't save anything~~ — [x] shipped 0.16.3
`openTestLog` now logs the big three only (squat, bench, deadlift, pinned to
the priority-lift variants, no picker, no ramp ▲ button) and sends entries with
`leaf`, so `logTest` keeps them. Applied from the 0.16.3 patch (now deleted).

### 1. ~~Isometric holds~~ — [x] shipped 0.17.0
Spec: **`r&d/specs/isometrics-spec.md`**. Built with option A (best hold per
weight). Shared helpers for item 2 and the cardio session: `Cue` (Web Audio
beeps + vibration, gated by the new Sound / Vibration settings) and `Awake`
(refcounted Wake Lock). Old "1 rep + note" holds are deliberately not migrated.

Per-entry `iso: true` flag (not a new movement or leaf axis), own PR pool via an
`exKey` suffix, reuse the set's `sec` field, three hold modes (manual / planned
countdown / test-to-failure count-up), Web Audio count-in beeps, Wake Lock,
timestamp-based timing so backgrounding doesn't break it. Test-mode holds get
RIR 0 automatically.

- **Open decision:** best hold *per weight* (default, mirrors `byRep`) vs a
  single `kg × sec` hold-volume figure. Build the default unless Aaron says
  otherwise.
- The audio module built here (beeps, gesture unlock, sound/vibration settings)
  is reused by the rest timer and the cardio session below — build it as a
  shared helper.

### 2. ~~Rest timer upgrade~~ — [x] shipped 0.18.0
There was no rest timer at all, only the `restDefault` setting — built from
scratch on `Cue` / the shared audio helper from item 1. Main vs accessory is a
heuristic (`isMainLift`: priority lifts + heavy-bar compounds); per-exercise
rest lives in `settings.restBy` from the exercise's ⋯ menu. Background
notification is opt-in from Settings and best effort.
- **Auto-start** when a set is ticked done.
- **End alert:** beep + vibration, respecting the Sound/Vibration settings.
  Optional short warning a few seconds before the end.
- **Per-exercise defaults** — longer for main compound lifts, shorter for
  accessories — overridable per session with quick +/− 15 s buttons.
- Timestamp-based, so it stays correct when the phone is locked or the app is
  backgrounded; keep a visible countdown on the active workout.
- If the platform allows, a notification when rest ends while the app isn't in
  the foreground. Don't block the feature on it.

### 3. ~~Cardio session — HR-zone treadmill coaching~~ — [x] shipped 0.19.0
Spec: **`r&d/specs/cardio-spec.md`** (wins over the notes below). The plain
loop is built; the premium Haiku trend coach below is still to do. Needs a
real-gym check: strap pairing, cue audio/voice, disconnect/reconnect.

New session type. The treadmill (Technogym) has no control API, so **Aaron is
the actuator**: Ironlog reads heart rate live and tells him when to change
speed.

**Heart rate in:**
- Web Bluetooth (Chrome on Android) to the standard **Heart Rate Service**
  (`0x180D`, measurement characteristic `0x2A37`). Works with chest straps
  (Polar, Garmin HRM) and watches that broadcast HR. Apple Watch won't.
- Connection must be started by a tap (Web Bluetooth needs a user gesture).
  Handle disconnects mid-session: pause cues, show it clearly, offer reconnect.
- No HR device → the session still works as a plain manual cardio log.

**Setup screen:** starting speed (km/h), incline (%), target zone, cue interval.
Zone can be entered as bpm directly or as a preset (e.g. fat loss) from max HR —
let Aaron enter a measured max and resting HR rather than relying on 220-age.

**Control loop (plain JS, no AI needed):**
- **Settle period** — no cues for the first ~2–3 minutes while HR climbs.
- Every ~30 s, compare smoothed HR (rolling average, not a single reading) to
  the zone.
- **Hysteresis** — a few bpm of buffer outside each zone edge, so HR sitting on
  the boundary doesn't cause a cue every check.
- Below zone → "increase speed", above → "decrease speed", inside → **silent**.
- Say the actual target: "set speed to 5.5". Step size scales with how far out
  of zone HR is, capped (e.g. 0.5 km/h max per cue). After a change, wait for HR
  to respond before cueing again.
- **Hard ceiling:** above a max-HR cap, cue "slow down" immediately regardless
  of interval.
- Option to cue incline instead of speed (useful for incline walking).

**Cues:** Web Audio beep + `SpeechSynthesis` voice line. Big on-screen
+/− buttons so Aaron confirms each change — the app needs to know the real
speed, since it can't read the treadmill. Wake Lock for the whole session.

**Saved to the session:** HR trace, speed/incline changes with timestamps,
time-in-zone, average HR, duration, distance (from speed × time). Show the HR
trace as a chart on the session card.

**Later (premium, optional):** a Haiku call about once a minute looking at HR
*trend* rather than the instant reading — pre-empting drift out of zone and
varying the coaching language. Only once the plain loop works.

### 4. ~~Autoregulated programming (RIR-driven)~~ — [x] shipped 0.21.0
Spec: **`r&d/specs/autoreg-spec.md`**. Normal program blocks get loads from a
per-exercise working e1RM (derived from RIR-logged history) at the session's
reps and target RIR; deload/prep/peak/test/meet weeks keep the plan. Set-to-set
adjustment, stall flag, off-day toggle. `autoE1()` is where item 7's VBT e1RM
plugs in.
- Programs carry **one flat mid-point working weight per exercise**, not a
  week-by-week progression; RIR decides what the day's load does.
- RIR is whole numbers only, no half steps.
- **Stall detection** from the last 5 sessions of an exercise.
- **"Off week" / nope button** on a session: excludes it from progression
  calculations but does *not* reset the rolling stall counter. For days when
  work (custodian job) has flattened him.
- Design this so the VBT daily e1RM (item 7) can plug in later as a second
  input for the day's working weight.

### 5. ~~PR detection against history~~ — not a bug
Dropped 2026-09-24: Aaron confirmed the Smith calf raise PR was a logging
error on his side, not the app. Nothing to fix. Kept below for the record.
PRs are being flagged that aren't PRs (e.g. Smith calf raise 135 kg × 10 on
12 Aug 2026, well under his real best — imported Liftoff history isn't being
consulted). Check whether the composed exercise model migration already fixed
this; if not, fix it. Test against the full imported history.

---

## Next

**Order (approved by Aaron 2026-09-24):** build **B1 (loaded carries, sleds and
medleys)** and then **B3 (last session inline and fast entry)** first — full
detail in the Blast section below — then carry on with item 7.

### 6. ~~Workout page: finish the exercise-model UI~~ — [x] shipped 0.22.0
Greyed-not-hidden picker, equipment icons in the list and the movement page
(tabs, variant strip, primary headline, one line per variant) were already
built. Added: modifier chips (live + edit; splitsPR ones greyed until item 14),
per-variant stats for the variant picked in the strip, exercise name → its
movement page, and Settings → **Check exercise data** (read-only report over
every session plus an optional Liftoff CSV; Copy report). **Still to do:** run
that check on the phone against the real log and CSV — it can't be run here.
Make the workout page clearly better than the competition. Depends on the
composed model being in place.
- Equipment picker shows invalid equipment **greyed, not hidden**.
- Per-variant stats strip; parent exercise page rolling up variants.
- **Modifiers layer** — technique, tempo, stance/grip, range of motion (e.g.
  "comp pause", "slow eccentric", "comp stance") as structured modifiers that
  annotate a set **without** splitting the PR leaf. These currently live as free
  text in notes.
- Run the migration dry-run against all logged sessions and the Liftoff CSV:
  every entry must resolve to a leaf, no orphans, no PRs moving that shouldn't.

### 7. VBT overhaul — two modes plus calibration
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
  the day's working weight from the day's e1RM. Feeds item 4.
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

### 8. Welcome / first-run screen
More important than login. Sets units, lifts, event goals; explains data stays
on the device.

### 9. Events page (replaces Meets)
Pick the event type (powerlifting meet, strongman, other) and queue several
events at once. Keep the focus on strength sports.

---

## From Blast's issue tracker (ranked 2026-09-24)

Ideas taken from the open issues of a competing app,
<https://github.com/madmustachecompany/Blast-Workout-App/issues>, ranked from
"would be amazing" down to "only if there's nothing else to do". `#n` is the
Blast issue number, for the original request.

- **Priority approved by Aaron (2026-09-24):** B1 and B3 go first in "Next".
  The rest of this section comes after "Next" and before "Later", worked top to
  bottom in the order below.
- Where an idea overlaps a numbered item elsewhere, it **extends that item** —
  build it there, don't make a second copy. If that item is in "Later", this
  ranking pulls the overlapping part forward; leave the rest of the item where
  it is.
- Check the code first: some of these may already partly exist.

### Tier 1 — would be amazing

- [ ] **B1. Loaded carries, sleds and medleys** (#96, #109). A set shape with
  **weight + distance + time** together: farmers, yoke, sandbag carry, sled
  push/pull, rucking. Plus a **time-to-complete** mode for medleys and loading
  events (n implements, time). Own PR pools (best time for a given weight and
  distance; furthest distance at a weight). Feeds strongman in the Events page
  (item 9). **First in "Next".**
- [ ] **B2. Plate loader and warm-up ramp from the set** — extends item 19.
  Reachable by tapping a set's weight on the workout page, not only from Tools.
  Per-bar weights: SSB, trap bar, axle, log, deadlift bar, custom. kg plates
  including change plates and collars. One tap for a ramp to today's working
  weight (reuse `openRamp`).
- [ ] **B3. Last session inline and fast entry** (#113, #42, #43). Show last
  time's weight × reps @ RIR beside each set. Tap to fill; copy a value down to
  the remaining sets; +/− steppers (2.5 kg, 1 rep) so the system keyboard is
  rarely needed. Biggest single step towards "workout page ahead of the
  competition". **Second in "Next".**
- [ ] **B4. Rest-end alert reaches the watch** (#17, #64, #101) — mostly done by
  item 2. Remaining: confirm on Aaron's phone (Oppo Reno 8 + Galaxy Watch 7)
  that the background notification forwards to the watch and buzzes; if it's
  unreliable, say so in the setting.
- [ ] **B5. Recovery heatmap on the skins** (#117) — this is item 16. Blast users
  call it the feature they miss most. Also show it where exercises are picked
  when building a session or program, not only on its own page. Same caveat
  about muscle shares applies.
- [ ] **B6. Import from other apps** (#13). Strong, Hevy, FitNotes and a generic
  CSV, by generalising the Liftoff importer. Map to leaves via the exercise data
  check (item 6) and show a dry-run report before anything is written.

### Tier 2 — strong additions

- [ ] **B7. Strength library seeding** (#38). Larsen press, TruSquat, SSB, trap
  bar, belt squat, pendulum squat, sled, log, axle, yoke, stones, farmers
  handles, Conan's wheel — as movement + equipment leaves. Check `EX_DB` for
  what's already there.
- [ ] **B8. Structured tempo** (#110) — extends the modifiers layer (item 6).
  A four-digit tempo (eccentric–pause–concentric–pause, e.g. 3-1-1-0) rather
  than a text chip; shown on the active set; doesn't split the PR leaf. VBT
  Measure can fill in the real concentric time.
- [ ] **B9. Per-side logging for unilateral lifts** (#79). Left and right reps
  (and weight if different) on one set for unilateral leaves; imbalance trend on
  the variant page. **Open decision:** which side counts for PRs (default: the
  weaker side).
- [ ] **B10. Set roles and linked sets** (#70). Tag sets warm-up / top set /
  back-off / AMRAP / drop; group a drop-set chain so it reads as one. Warm-ups
  stay out of volume and PRs. Related to supersets in `r&d/notes/backlog.md`.
- [ ] **B11. Rep range + RIR suggestion** (#99). Optional rep range per exercise
  in a program; hitting the top of the range at the target RIR suggests more
  load next time. Works alongside item 4's autoregulation, doesn't replace it.
- [ ] **B12. Session summary and PR history** (#22, #19, #18). End-of-session
  screen: PRs hit, tonnage, e1RM change. Per-variant PR timeline on the movement
  page.
- [ ] **B13. Equipment profiles** (#41, #107). Named places ("Home", "Gym") with
  their kit; the picker greys what isn't available there, and any program or AI
  suggestion respects it.
- [ ] **B14. Health Connect** (#58, #12). Bodyweight and HR in, sessions out.
  Needs a native wrapper (Capacitor) — a PWA can't reach Health Connect. Only
  if the app gets wrapped.

### Tier 3 — nice when there's time

- [ ] **B15.** Machine settings note or photo per variant, e.g. "seat 4, pad 6"
  (#29). Stored locally.
- [ ] **B16.** Band tension and chain weight fields — goes with item 14 (#112,
  recast for accommodating resistance).
- [ ] **B17.** Swap an exercise across past sessions, with a preview — useful
  for cleaning up imports (#69).
- [ ] **B18.** OLED true-black theme (#77).
- [ ] **B19.** Setting for the workout timer at the top or bottom — machine
  phone holders cover the bottom (#108).
- [ ] **B20.** Custom trackers (unit + target: water, sleep, etc.) (#59, #15).
  Bodyweight against weight class belongs with item 18 / Events.
- [ ] **B21.** Progress photos, front/back/sides with side-by-side compare, kept
  on the device — could live on the body comp page (item 18) (#95, #11).
- [ ] **B22.** In-app help / FAQ, folded into the welcome screen (item 8) (#27).

### Tier 4 — only if there's nothing else to do

Strava (#115) · Whoop (#111) · translations (#116, #85) · reorder and sort
routines (#80, #9) · separate muscle heads for arms (#63) · picture
instructions (#21) · subscription status in Settings once premium exists (#20) ·
suspension trainer, rings and jump rope exercises (#105, #93, #40).

### Checks against Blast's bugs

Blast shipped these bugs; make sure Ironlog doesn't have them. Tick each once
checked.

- [ ] Every exercise in a superset/circuit gets its PRs (Blast #87) — once
  supersets exist.
- [ ] Max-weight and max-reps PRs agree at the same weight (#51).
- [ ] Nothing is ever stored as lbs; imported or synced weights are converted to
  kg (#60, #61).
- [ ] A started session can be discarded without logging it (#46).
- [ ] Several sessions on the same day all show in history and the calendar
  (#47).
- [ ] Number inputs lose focus when the keyboard is dismissed or you tap
  elsewhere (#49).

---

## Later

### 10. Cloud sync (premium)
Local-first with sync so data survives losing or changing a phone.
- Supabase, anonymous auth first; Google login deferred.
- Schema versioning, tombstone deletes.
- **First sign-in pushes local data up — never overwrites it.**

### 11. Server-side AI for all users (premium)
Aaron's own Anthropic key used server-side for everyone (e.g. Supabase Edge
Function), not a key per user. Non-negotiable: per-user budgets, rate limits,
abuse controls. Meter AI usage carefully at £5/month.

### 12. AI coaching
- Logging stays tightly scoped structured calls, separate from any chat.
- Hard system-prompt boundaries so the coach can't drift off-topic.
- Cap or summarise conversation history; use prompt caching. No unbounded
  history re-sent every turn.

### 13. Chat front door
Log and get coaching through a messaging app (WhatsApp or similar — **not
Telegram**) plus voice input. Builds on the existing voice logging.

### 14. Fix `prKey` / `splitsPR`
`prKey()` is dead code, so chains, bands, slingshot and equipped currently share
a PR pool with the raw lift. Real bug, but fixing it **changes existing PR
numbers** — do it on its own, deliberately, and tell Aaron what moved.

### 15. Supplements and blood work
Supplement schedule, reminders and adherence history inside Ironlog (not a
separate app), with the option to see it alongside training. Blood work results
tracking over time. No drug dosing or cycle-planning features.

### 16. Fatigue heat map
Extend the existing body heatmap to show which muscle groups are fresh vs
fatigued before planning a session. Only trust it once muscle shares for
commonly trained lifts have been checked — derived shares are placeholders.
(Pulled forward as Blast item B5.)

### 17. Mobility training
New session type alongside lifting and cardio. Aaron is treating flexibility
with the same seriousness as the lifts because it feeds them (squat depth,
overhead position, deadlift setup). Write `r&d/specs/mobility-spec.md` before
building.
- **Routines:** saved mobility routines (daily evening routine, pre-lift
  dynamic warm-up, "strength at length" accessory block) made of timed holds
  and rep-based drills, per side where relevant.
- **Guided player:** step-by-step with hold countdowns, side switches and
  contract-relax cues. Reuse the shared audio helper and the timestamp-based
  timing from isometric holds (item 1); Wake Lock throughout.
- **Hypermobility-aware:** exercises tagged by target area so a user can mark
  joints to leave alone (e.g. wrists) and have routines skip or swap them.
  Emphasis on loaded end-range work over passive stretching.
- **ROM tests over time:** monthly measurements — knee-to-wall (cm),
  straight-leg raise (degrees, optionally from the phone's inclinometer),
  Thomas test, wall shoulder flexion — charted per test and per side.
- Adherence streak alongside training; loaded-stretch drills (paused goblet
  squat, Cossack, paused RDL) log as normal lifting sets so PRs still work.

### 18. Body composition page
One page for bodyweight, tape measurements and skinfold (caliper) tests, each
with a chart. Write `r&d/specs/body-comp-spec.md` before building.
- **Bodyweight:** build on the existing check-in weight (`ci.weight`, read by
  `bodyweightKg()` for DOTS) — don't create a second bodyweight store. Chart
  with a 7-day rolling average over the raw points.
- **Measurements:** cm, any subset per entry — neck, chest, waist, hips, upper
  arm, forearm, thigh, calf — **left/right** where it applies, plus custom
  sites. Each site gets its own trend.
- **Caliper tests:** pick a protocol — Jackson-Pollock 3-site, JP 7-site,
  Durnin-Womersley 4-site. Enter mm per site, optionally 2–3 readings per site
  averaged. Body density from the protocol's equation (uses sex and age from
  settings), then Siri for body-fat %; fat mass / lean mass from the same day's
  weight.
- Always show the **raw sum of skinfolds** next to the %. The equations were
  built on typical populations, so for adaptive lifters the mm sum is the more
  honest trend line — present the % as an estimate.
- Charts via `chartMulti`: pick the metric, date range; same-day entries sit
  together. Everything lives in IndexedDB and goes through JSON export/import
  (schema bump + migration).

### 19. Tools page (calculators)
A **Tools** page — the 98 skin's menu bar already has a Tools menu, so that's
the way in. Every calculator **prefills from stored data** (bodyweight, height,
age, sex, BF% and measurements once item 18 exists), stays editable for
what-ifs, and saves nothing unless asked. Write `r&d/specs/calculators-spec.md`
before building. Reuse the maths that's already in the app — `bmrKcal` /
`suggestedTargets`, `e1rm`, `dots` — don't write second copies.
(The plate loader and warm-up ramp are pulled forward as Blast item B2.)

**Energy**
- **TDEE:** Mifflin-St Jeor (exists), plus Katch-McArdle when a BF% is known.
- **Adaptive TDEE:** back-calculated from logged Food intake and the bodyweight
  trend over the last 2–4 weeks (intake minus the energy in the weight change).
  Show it next to the formula figure — "formula says X, your data says Y" — and
  only once there are enough logged days to mean anything. This is the one no
  formula can give, and the app already has both inputs.

**Physique**
- **Max muscular potential (Casey Butt):** from height, wrist and ankle
  circumference → maximum lean body mass, and a table of the maximum bodyweight
  at each body-fat % (roughly 5–20%). Commonly given as
  `LBM_max(lb) = H^1.5 × (√W / 22.667 + √A / 17.0104) × (1 + BF% / 224)`
  with H, W, A in inches — **verify the constants against Butt's published
  formula before shipping**, then convert to kg / cm.
- **FFMI** and height-normalised FFMI from current weight and BF%, with where
  that sits against the potential figure.
- Label all of it as an estimate: these formulas come from drug-free elite
  bodybuilders of typical proportions, so for adaptive or short-stature lifters
  they're a rough ceiling, not a verdict.

**Strength**
- e1RM and a rep-max table from any set (existing `e1rm`), and a %1RM ↔ RIR
  chart.
- **Plate loader:** target kg → plates per side for the bar in use (20 kg bar,
  15 kg, custom), available plates and collars as a setting.
- DOTS / IPF GL points calculator (existing `dots`), and a warm-up ramp
  generator (reuse `openRamp`).

Can ship before item 18 using typed-in inputs; wire the prefills when body
comp lands.

---

## Parked
See **`r&d/notes/backlog.md`** — sleep/recovery strip on sessions, sleeves/wraps/belt
as gear, supersets and circuits. Each has its reasoning written down.
