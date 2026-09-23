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

1. Take the **first unchecked item under "Now"** unless Aaron says otherwise.
2. **Check the code before trusting a status here.** Some items were marked from
   memory of planning chats, not from the code. If something is already built,
   tick it, note the version, and move on.
3. If an item links a spec in `docs/`, the spec wins over the summary here.
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
- [x] Slew VBT built in: per-exercise **Measure** flow (phone motion sensor →
      per-rep velocity, velocity loss, estimated RIR) — `slew-core.js`
- [ ] Composed exercise model (movement + equipment + laterality, PRs per variant,
      parent page rolls up variants) — specs in `docs/exercise-system.md` and
      `docs/exercise-system-phase1.md`. **Status unconfirmed — check how far
      phase 1 got before building anything that depends on it.**

---

## Now

### 1. Isometric holds
Spec: **`docs/isometrics-spec.md`** — ready to build.

Per-entry `iso: true` flag (not a new movement or leaf axis), own PR pool via an
`exKey` suffix, reuse the set's `sec` field, three hold modes (manual / planned
countdown / test-to-failure count-up), Web Audio count-in beeps, Wake Lock,
timestamp-based timing so backgrounding doesn't break it. Test-mode holds get
RIR 0 automatically.

- **Open decision:** best hold *per weight* (default, mirrors `byRep`) vs a
  single `kg × sec` hold-volume figure. Build the default unless Aaron says
  otherwise.
- The audio module built here (beeps, gesture unlock, sound/vibration settings)
  is reused by the cardio session below — build it as a shared helper.

### 2. Cardio session — HR-zone treadmill coaching
New session type. The treadmill (Technogym) has no control API, so **Aaron is
the actuator**: Ironlog reads heart rate live and tells him when to change
speed. No spec yet — write one in `docs/cardio-spec.md` before building.

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

### 3. Autoregulated programming (RIR-driven)
- Programs carry **one flat mid-point working weight per exercise**, not a
  week-by-week progression; RIR decides what the day's load does.
- RIR is whole numbers only, no half steps.
- **Stall detection** from the last 5 sessions of an exercise.
- **"Off week" / nope button** on a session: excludes it from progression
  calculations but does *not* reset the rolling stall counter. For days when
  work (custodian job) has flattened him.

### 4. PR detection against history
PRs are being flagged that aren't PRs (e.g. Smith calf raise 135 kg × 10 on
12 Aug 2026, well under his real best — imported Liftoff history isn't being
consulted). Check whether the composed exercise model migration already fixed
this; if not, fix it. Test against the full imported history.

---

## Next

### 5. Workout page: finish the exercise-model UI
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

### 6. VBT calibration
- Opt-in **"Calibrate — 8 min"** flow per variant: incremental load ramp to
  build the individual load-velocity profile and fatigue-rate scalar.
- Don't test MVT directly — use a population prior table, blended with personal
  data as sets accumulate (shrinkage).
- Silently harvest calibration data from near-failure sets.
- Cross-lift transfer only for the fatigue scalar, not the full profile.
- Flag pocket-mode sets as lower confidence and exclude them from MVT
  calibration.
- Never gate first run on calibration. Personal calibration matters more than
  usual here — adaptive lifters won't match population norms.

### 7. Welcome / first-run screen
More important than login. Sets units, lifts, event goals; explains data stays
on the device.

### 8. Events page (replaces Meets)
Pick the event type (powerlifting meet, strongman, other) and queue several
events at once. Keep the focus on strength sports.

---

## Later

### 9. Cloud sync (premium)
Local-first with sync so data survives losing or changing a phone.
- Supabase, anonymous auth first; Google login deferred.
- Schema versioning, tombstone deletes.
- **First sign-in pushes local data up — never overwrites it.**

### 10. Server-side AI for all users (premium)
Aaron's own Anthropic key used server-side for everyone (e.g. Supabase Edge
Function), not a key per user. Non-negotiable: per-user budgets, rate limits,
abuse controls. Meter AI usage carefully at £5/month.

### 11. AI coaching
- Logging stays tightly scoped structured calls, separate from any chat.
- Hard system-prompt boundaries so the coach can't drift off-topic.
- Cap or summarise conversation history; use prompt caching. No unbounded
  history re-sent every turn.

### 12. Chat front door
Log and get coaching through a messaging app (WhatsApp or similar — **not
Telegram**) plus voice input. Builds on the existing voice logging.

### 13. Fix `prKey` / `splitsPR`
`prKey()` is dead code, so chains, bands, slingshot and equipped currently share
a PR pool with the raw lift. Real bug, but fixing it **changes existing PR
numbers** — do it on its own, deliberately, and tell Aaron what moved.

### 14. Supplements and blood work
Supplement schedule, reminders and adherence history inside Ironlog (not a
separate app), with the option to see it alongside training. Blood work results
tracking over time. No drug dosing or cycle-planning features.

### 15. Fatigue heat map
Extend the existing body heatmap to show which muscle groups are fresh vs
fatigued before planning a session. Only trust it once muscle shares for
commonly trained lifts have been checked — derived shares are placeholders.

---

## Parked
See **`docs/backlog.md`** — sleep/recovery strip on sessions, sleeves/wraps/belt
as gear, supersets and circuits. Each has its reasoning written down.
