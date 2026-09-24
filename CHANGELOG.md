# Ironlog changelog

What changed in each version, newest first, in plain English. The version is
the one shown in Settings.

**How to keep this up to date:** every version bump adds an entry at the top —
version, date, and a few bullets on what a user would notice (new, changed,
fixed). Technical detail belongs in the commit message, not here.

Entries before 0.23.0 were written afterwards from the commit history
(24 Sep 2026). Where a commit didn't record its version number, that's said
rather than guessed.

---

## 0.28.0 — 24 Sep 2026
- **Strongman and loaded carries.** Carries (farmers, yoke, sandbag, keg,
  sled push and drag, ruck, Conan's wheel) log weight, distance and time
  together. The ⏱ button times the run.
- **Medleys and loading races** log the heaviest implement, how many, the
  distance and your time.
- **Stone series.** From an exercise's ⋯ menu, mark each stone made or missed
  and add the series time. Made stones still count as lifts.
- **Max reps in a time cap.** Also in the ⋯ menu: "max reps in 1 min", or the
  furthest carry in a set time. These keep their own records and don't
  affect your e1RM.
- New lifts and implements: log press, atlas stones, keg and sandbag loads,
  axle press and deadlift.
- **PRs everywhere.** Fastest, furthest, most reps and best series all show
  as gold PRs: live, in the session summary and on the calendar. Best holds
  now show there too.

## 0.27.1 — 24 Sep 2026
- **Fixed:** after closing the keyboard with Back, or tapping somewhere
  else, a weight or reps box stayed selected, so the next tap on the keyboard
  could type into it. Fields now let go when you're done with them.

## 0.27.0 — 24 Sep 2026
- **Backup reminder.** If your last backup is more than two weeks old, Home
  shows a card to save a copy. "Not now" hides it for a week; it never shows
  during a workout.
- **Storage protection.** Ironlog asks Chrome to protect its storage so it
  isn't cleared when the phone runs low on space. Settings → Data shows whether
  it's protected, how much space the log uses, and when you last backed up.

## 0.26.0 — 24 Sep 2026
- **What's new.** After an update, Ironlog shows what changed since you last
  opened it — once, and never in the middle of a workout.
- The full list is always in **Settings → What's new** (and Help in the
  Windows 98 skin).

## 0.25.0 — 24 Sep 2026
- **The Food tab is gone** — food logging is moving to its own app. The bottom
  bar is back to five tabs.
- If you had a food log, it isn't lost: **Settings → Data → Save old food log**
  still saves it (for the new app, or as a spreadsheet). Once saved, remove it
  from **Settings → Clear data**.
- Check-ins no longer ask for calories, and the profile no longer sets food
  targets. Your maintenance-calorie estimate is still shown there.
- The optional API key in Settings is now only used by voice set logging.
- The app is about a quarter smaller to download.

## 0.24.0 — 24 Sep 2026
- **Export food log.** Food logging is moving out of Ironlog into its own app.
  A notice on the Food tab (and a button in Settings → Data) saves your whole
  food log — every entry, your daily targets and goal — as a file the new app
  will import, or as a spreadsheet (CSV).
- Nothing is removed yet. The Food tab goes in a later update.

## 0.23.0 — 24 Sep 2026
- **Muscle map skins.** The body map is now painted from an image sheet with
  every muscle at every rank, so any artwork can be used. Ships with a
  placeholder skin (orange, darker as the rank goes up).
- You can import your own skin sheet from the Skin button on the map.
- Tapping a muscle follows the shape of the artwork.

## 0.22.3 — 24 Sep 2026
- **Stats page split into tabs:** Exercises (search and list, the default),
  Rankings, and Muscles. Totals stay at the top.
- The Summary / Graph / Records sub-tabs added to the movement page in 0.22.2
  are gone again (they were a misunderstanding); that page is one scroll.

## 0.22.2 — 24 Sep 2026
- **Fixed:** charts with several lines drew every line in the same colour.
  Each variant now has its own colour, and the legend matches in the 98 skin.

## 0.22.1 — 24 Sep 2026
- **Fixed Liftoff import:** hand-picked exercises were all being merged into
  one broken exercise called "[object Object]", and some matches lost their
  equipment (e.g. Smith shrugs landing on barbell shrugs).
- Smarter matching: 59 of 65 names in Aaron's export now match automatically.
- The import review lists every name and where it will land, problems first.
- **Undo an import:** Settings → Remove imported sessions.

## 0.22.0 — 24 Sep 2026
- **Modifiers** (e.g. comp pause, comp stance) now show as chips on a set and
  can be edited. They annotate the set without splitting its PR history.
- The movement page shows stats for whichever variant you pick.
- Tapping an exercise name in a live session opens its page.
- **Settings → Check exercise data:** a read-only report of anything in your
  history that doesn't resolve cleanly.

## 0.21.0 — 24 Sep 2026
- **Autoregulated programming.** In normal training blocks, the day's weights
  come from your recent RIR-logged sets rather than a fixed plan.
- Weights adjust set to set as you log RIR (never more than 7.5% a step, and
  never over a weight you typed yourself).
- **Stall flag** when an exercise hasn't improved over five sessions.
- **Off day** toggle: a bad day doesn't count against your progression.
- RIR is whole numbers only.

## 0.20.0 — 24 Sep 2026
- Cardio cues now apply automatically, with an Undo, instead of needing a
  Done tap each time.
- **Warm-up ramp** from a starting speed up to your target speed.
- Coaching aims for the middle of the heart-rate zone.
- The heart-rate graph is now the main thing on screen.

## 0.19.0 — 24 Sep 2026
- **New: cardio session with heart-rate coaching.** Connect a Bluetooth heart
  rate strap or watch; the app tells you when to change treadmill speed or
  incline to stay in your zone, with beeps and a spoken cue.
- Zones from presets or typed bpm; a hard heart-rate ceiling always wins.
- Works as a plain cardio log with no strap.
- Saved with a heart-rate trace, time in zone, distance and averages.

## 0.18.0 — 24 Sep 2026
- **New: rest timer.** Starts when you tick a set, counts down in the header
  with −15 / +15 / Skip, and beeps and vibrates at the end.
- Longer rest for main lifts, shorter for accessories; any exercise can have
  its own rest time.
- Survives locking the phone. Optional background notification.

## 0.17.0 — 24 Sep 2026
- **New: isometric holds.** Any exercise can be logged as a hold, with its own
  records kept separate from rep sets.
- Hold timer with countdown or to-failure modes and count-in beeps.
- New Sound and Vibration settings.
- Liftoff sets that were only seconds now import as holds.

## 0.16.3 — 24 Sep 2026
- **Fixed:** "Log a test" didn't save anything. It now logs squat, bench and
  deadlift only.

## 15 Sep 2026 — no version bump
- **Fixed:** unreadable black-on-black text inside dialogs in the Windows 98
  skin, across 17 dialogs.

## 0.16.1 — 14 Sep 2026
- **New: Windows 98 skin** (Settings → Skin). Grey bevelled windows, title
  bar, menus and a green LCD readout. Purely a look; nothing else changes.

## 5 Sep 2026 — versions around 0.14–0.16 (numbers not all recorded)
- **VBT built in (from Slew):** strap the phone to the bar, tap Measure, and get
  per-rep bar speed, range of motion, velocity loss and an effort estimate.
  Sets taken to failure calibrate it to you.
- **Profile page:** sex, date of birth, height, activity and goal in one place,
  with age category, DOTS, BMR and calorie targets worked out live.
- **0.14.0 — Timed exercises** (planks, hangs, carries, cardio machines) can
  now actually be logged by time. Before this, sessions with them could fail
  to save or quietly drop them.
- **0.14.0 — Equipment icons** in the exercise picker, tappable.
- Version went briefly to 1.13.1, then back to the 0.x line.

## 0.13.x — 5 Sep 2026
- **Update check:** the app tells you when a newer version is available, and
  Settings has "Check for update". A way out of a stuck or broken build.
- **Fixed:** warm-up sets had lost their gold styling and tapping W threw an
  error; voice-logged sets were skipping the sanity check.

## 0.12.1 — 5 Sep 2026
- **Fixed:** the Events page crashed for meets with a known field (including
  both bundled West Midlands meets).

## 0.12.0 — 5 Sep 2026
- **New event types:** strengthlifting (squat, press, deadlift) and
  single-lift meets (e.g. bench only).
- No DOTS shown for strengthlifting, since DOTS only applies to powerlifting
  totals.

## 0.11.0 — 5 Sep 2026
- **Meets become Events.** Each event has a type that decides which lifts are
  contested and how it's scored. Old meets carry on as powerlifting.

## 0.10.1 — 5 Sep 2026
- **Fixed:** "1 tbsp olive oil" logged as 100 g.
- Planner fields select their contents when tapped.
- Removed stray "PAGEBREAK" text from program notes.

## 0.10.0 — 5 Sep 2026
- Programs can be written in weeks and days and placed from a start date.
- Installing a program twice no longer duplicates sessions.

## 0.9.1 — 5 Sep 2026
- Old exercise names (Pause Bench, Safety Bar Squat, Dumbbell Row etc.) now map
  to the right movement and equipment instead of becoming custom exercises.
- Clear data can remove zero-rep junk sets.
- The plate calculator subtracts the Smith machine carriage (asks once).

## 0.9.0 — 5 Sep 2026
- **Exercise names are the movement; equipment is shown separately** ("Lateral
  Raise" + cable, not "Cable Lateral Raise").
- **Settings → Clear data:** targeted removal of imported, backfilled or
  planned sessions and unrecognised exercises.
- **Meets use tested singles only,** not estimates.
- **Fixed:** strength rankings and the muscle map had been empty since 0.7.0;
  logging a test threw an error.

## 0.8.0 — 5 Sep 2026
- **New exercise page** with Info, Statistics and History, and a strip to
  switch between variants. Each variant keeps its own graph line and records.
- **Fixed:** tapping a row in Stats did nothing.

## 0.7.1 — 5 Sep 2026
- **Fixed:** the 0.7.0 update turned warm-up sets into working sets. Weights
  and reps were kept; the W toggle re-marks them.

## 0.7.0 — 5 Sep 2026
- **New exercise model:** each exercise is a movement + equipment + how it's
  done, with its own PR history (barbell, dumbbell and machine bench are
  separate).
- Equipment and execution chips on the logging screen; options that don't fit
  are greyed rather than hidden.
- Dumbbell volume counts both hands.
- The bundled program is no longer installed automatically; the app is much
  smaller to download.

## 0.6.3 — 3 Sep 2026
- Tapping a weight, reps or RPE box selects the number so typing replaces it.
- The plate button sits beside the weight box instead of over it.
- **Fixed:** 112.5 kg displayed as "112.".

## 0.6.2 — 3 Sep 2026
- **Food parsing fixes:** "boiled chicken" no longer matches olive oil; nothing
  you type is dropped silently; items are logged in the order typed; a clear
  message when an AI key is needed.

## 0.6.1 — 3 Sep 2026
- **UK food database (CoFID, 2,848 foods)** checked on the phone before any AI
  call, so a normal day of food usually needs no API at all.

## 0.6.0 — 3 Sep 2026
- **Edit finished sessions:** name, date, every set, add/remove/reorder
  exercises.
- **Sanity check** on unlikely entries (e.g. 2250 for 225), always with "log
  anyway".
- **Share card** in two sizes: a quick square and a full breakdown with muscles
  worked.

## 0.4.2 — 3 Sep 2026
- Fixes from the 3 Sep audit: PRs worked out from history (a first-time
  exercise is no longer a PR), bodyweight sets (0 kg) can be logged, new
  settings get proper defaults, several Food tab fixes, editable food items and
  custom goal values.

## Before 0.4.2 — 11–29 Aug 2026
- Early builds uploaded by hand. No change notes were recorded.
