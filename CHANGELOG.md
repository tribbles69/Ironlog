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

## 0.96.1 — 11 Nov 2026
- **Changed: backfill leaves out sessions from a plan with no weights.** The program gives RIR, not kg, so "mark done at the prescribed loads" logged every set at 0 kg — and those counted as real sets, bodyweight records and sessions in each lift's stats. Settings → Backfill now says how many it's leaving out and why. Log them from the session, or mark them Missed.
- **Fixed: sessions already backfilled that way are now skipped**, not done. They show as missed on the calendar, and Undo there puts one back on your plan. Any you've edited since are left as they are. A copy of your log from before the change is kept on the phone.

## 0.96.0 — 11 Nov 2026
- **New: Landmine Press and Tibialis Raise are built-in exercises.** They were in the program but not in the exercise list, so installing the program made them your own custom exercises with no muscles, no demo and nothing on the muscle map. Now they have muscles (Weekly sets and recovery count them), an animated demo on the Info tab, and setup notes.
- **Changed: sets you'd already logged under the custom versions move across** to the built-in ones, so there's one history, not two. The landmine press is now logged per arm, as the program writes it. The empty custom exercises are removed. A copy of your log from before the move is kept on the phone.
- Tibialis raises count towards the lower leg on the muscle map (it shows that as Calves — there's no shin muscle on the map).
- Neither lift has a bar-speed profile: none of the Measure profiles fits an arc press or a toe raise, and a wrong profile gives a confident wrong RIR.

## 0.95.1 — 11 Nov 2026
- **New: a second muscle-map skin, Goblin to orc.** Stats → Muscles → Skin. Each muscle starts as pale goblin and turns into orc as its score climbs, so a strong chest on untrained legs is an orc's chest on a goblin's legs. The orange template is still there and is still what you get by default.
- **New: a picture on the welcome screen** — the six stages, goblin to orc.

## 0.95.0 — 11 Nov 2026
- **New: a recorded voice for the interval timer.** Round calls, rests, warm-up, cool-down and the finish are now spoken by a recorded voice instead of the phone's robot one. It covers every built-in preset and your own timers up to 12 rounds with the usual rest lengths; anything else uses the phone's voice for that session, as before. It works offline and adds 171 KB.
- The recorded voice says "Go. Round three" rather than "Round 3 of 8" — the total is on the screen.
- Cardio and mobility still use the phone's voice: what they say is built from numbers and exercise names on the spot, which can't be pre-recorded.

## 0.94.4 — 11 Nov 2026
- **Changed: empty screens point somewhere.** With nothing planned, Train now offers **Open the calendar** and **Ask the coach**. With nothing logged, Stats offers **Go to Train**.
- **Fixed:** the search box on Stats now has a name for screen readers.

## 0.94.3 — 11 Nov 2026
- **New: jump to a section in Settings.** Settings is long, so there's now a row of buttons at the top — Look & units, Timers, Places & kit, AI & extras, Program, Video, Data & backup — that takes you straight to that part. Nothing in Settings has moved.

## 0.94.2 — 11 Nov 2026
- **Changed: clearer labels.** The Stats page is now headed Stats (it said Analytics). On a session that hasn't happened yet, the Missed button now reads **Skip / move** — it only says Missed once the day has passed. It opens the same sheet.

## 0.94.1 — 11 Nov 2026
- **Changed: Home opens on today's session.** Today's training is now the first thing on Home, with Start right there, instead of below the check-in and the week's numbers. If you haven't logged anything yet, Home still starts with the introduction.
- **Fixed:** two sessions done on the same day ran into each other on Home.

## 0.94.0 — 11 Nov 2026
- **Changed: small buttons are easier to hit.** Start, Missed, Edit, the “+ Add” buttons, the ✕ on every sheet and the other small buttons now respond to a tap anywhere within a finger-sized area around them. They look the same and nothing has moved.

## 0.93.1 — 11 Nov 2026
- **Changed: the bar-speed export holds more.** Settings → Export raw traces now also lists every set you've measured in the last 60 days, by sensor or video, with each rep's speed and whether the RIR was yours or the sensor's. It's there so Measure can be checked against a proper bar-speed device. It works even with Bar-speed debug off.

## 0.93.0 — 11 Nov 2026
- **New: film your set inside Ironlog.** ▶ Video on a lift (and Tools → Bar path) now has a **● Record** button next to Choose video. Prop the phone side-on, tap Record, do the set, tap Stop, and it goes straight into the usual trim → bar path → squat depth steps. No need to film in the camera app and find the clip afterwards.
- The clip stays on your phone and is only kept if you save the finished bar-path video. ⟲ Flip switches between the back and front cameras. A recording stops itself after 3 minutes.

## 0.92.0 — 11 Nov 2026
- **Changed: bar-speed RIR is worked out differently.** It now reads how much speed you lost across the set, rather than comparing your speed with a typical lifter's. On the 9 Nov push day a 17-rep set taken close to failure had read RIR 12 and now reads about 3; a 40 kg warm-up triple had read RIR 0 and now reads about 4. It's still an estimate, and it hasn't been checked against enough real ratings yet.
- **Changed: Measure no longer types RIR in for you**, unless it saw a missed rep or a near-stall, or the lift has been calibrated to you. Otherwise it shows its figure next to the set ("bar speed suggests RIR 3") and leaves the box for you.
- **Changed: when your speed barely drops, it says "6+" or gives no number** instead of a precise-looking guess.
- **Fixed: putting the bar down after an easy set could read as a missed rep** and RIR 0.
- **Fixed: the rep-by-rep RIR column could disagree with the set's RIR.** It now counts back from it.
- Still hidden when the sensor found fewer reps than you logged.

## 0.91.0 — 11 Nov 2026
- **New: Measure corrects for the phone tilting.** The phone turns as the bar rolls in your hands, and a lot on curls, raises and presses, which made the bar's travel read short and uneven. Measure now tracks which way is down at every instant. On the 11 Nov accessory day, overhead press travel went from 17–40 cm rep to rep to a steady 44–58 cm, and two sets that had miscounted came out right.
- **Changed: speeds on those lifts read higher than before**, because the travel was being under-read. They're still a guide until checked against a proper device.
- **Fixed: getting the bar into position could count as a rep.** In a set of four or more, a "rep" that's already finished within about two seconds of tapping Start is left out.
- **Fixed: the "No reps found" message quoted the wrong minimum travel** (10 cm; it's 4 cm).
- Heavy sets haven't been checked with this yet. The 9 Nov push day recordings didn't include the extra sensor data, so they read exactly as before (80 of 81 reps).

## 0.90.17 — 11 Nov 2026
- **Fixed: updates could slip in without asking.** The app re-downloaded its files in the background on every launch, so a new version could be in use on the second launch even if you'd chosen "Later", or halfway through a workout. On a weak signal it could also end up with a mix of old and new files. A new version now arrives whole, and only through the update prompt.

## 0.90.16 — 11 Nov 2026
- **Fixed: "Erase all data" didn't erase everything.** It left progress photos, daily clips and bar-speed debug traces on the phone, and if Google Drive was connected the next sync put the whole log back. It now removes all of it, disconnects Drive on this phone, and tells you first exactly what will go. The backup file in your own Drive is never deleted. Your AI key is kept unless you tick the box.

## 0.90.15 — 11 Nov 2026
- **Fixed: Edit session threw your changes away without asking.** Cancel, the ✕, Back or a stray tap outside the sheet all discarded what you'd changed. If you've changed anything, it now asks first.

## 0.90.14 — 11 Nov 2026
- **Fixed: nine controls a screen reader couldn't name.** The calendar's month arrows, the plate "−" buttons and Google client ID box in Settings, and the five fields on your profile (sex, date of birth, height, bodyweight, activity) now announce what they are.

## 0.90.13 — 11 Nov 2026
- **Fixed: Measure used the wrong weight for warm-ups.** If your top set's weight was already typed in, a warm-up measured before it was recorded at the top set's weight, which threw off its power figure and the bar-speed debug file. Measure now uses the weight of the set the reading attaches to.

## 0.90.12 — 11 Nov 2026
- **Fixed: dumbbell suggestions in pounds.** If you work in lb, suggested dumbbell and kettlebell weights were still rounded to 2 kg, giving figures like 44.1 lb. They now round to the nearest 5 lb. Nothing changes if you work in kg.

## 0.90.11 — 11 Nov 2026
- **Fixed: rep ranges told you to add 2.5 kg to a gripper.** Grippers and bands only come in fixed ratings. At the top of the range Ironlog now says to move to the next gripper (or band) up, and the **Use** button isn't offered for them.

## 0.90.10 — 11 Nov 2026
- **Fixed: "Reps NaN" and 0 kg volume on the session summary.** A session that included a carry or a timed hold showed NaN for reps and lost its volume total. Sets without reps are now left out of those sums instead of breaking them. Share cards and the edit screen had the same fault.

## 0.90.9 — 11 Nov 2026
- **Fixed: finished sessions didn't count towards their plan.** A session started from a plan that has no named blocks (most coach-built and imported plans) lost its link to the plan when you finished it, so the plan's "Completed" count stayed at zero. New sessions now keep the link. Sessions already finished aren't changed.

## 0.90.8 — 11 Nov 2026
- **Fixed: an update could restart the app while you were typing.** With no workout running, a new version restarted the app a second after it downloaded, even with a sheet open, and whatever you'd typed into an edit or a check-in was lost. An update now waits while any sheet is open and applies the next time you open the app.
- **Fixed: the last change could be missed when updating.** Ironlog now finishes saving before it restarts for an update.
- **Fixed: the app reloaded itself a second after the very first launch**, which could cut off the welcome screen.

## 0.90.7 — 11 Nov 2026
- **Fixed: your own exercises lost their names on a new phone.** Exercises you'd created weren't part of the Google Drive backup, so after a restore they showed as codes like "custom-zercher-carry". They're now backed up with everything else.
- **Fixed: the same after a CSV import or an older restore.** Where a set points at one of your own exercises and its name record is missing, Ironlog rebuilds it from the name the set was logged with.

## 0.90.6 — 11 Nov 2026
- **Fixed: an exercise of your own could stop the app opening after an update.** If an update added an exercise with the same name as one you'd created yourself, Ironlog refused to load its exercise list. The built-in exercise now takes the name and yours keeps its history.

## 0.90.5 — 11 Nov 2026
- **Fixed: restoring an older backup could delete newer sessions from Google Drive.** After importing a backup, the next sync treated anything the backup didn't have as deleted, and removed it from Drive and from your other phones. Now the next sync after an import only adds: whatever is in Drive and not in the backup comes back onto the phone.

## 0.90.4 — 11 Nov 2026
- **Fixed: Drive sync deleted things you had removed and then added back.** Remove a program, sync, install it again, and the next sync wiped every planned session. The same happened to a check-in deleted and re-entered, a custom exercise name, and a coach plan rebuilt after "Forget everything". Anything you add back on this phone now stays.
- **Fixed: a changed check-in didn't reach your other phone.** Check-ins now record when they were last saved, so the newer one wins when two phones sync.

## 0.90.3 — 11 Nov 2026
- **Changed: Import JSON asks before it replaces your log.** It used to overwrite everything the moment you picked a file. It now shows what's on the phone next to what's in the file, warns if the file is older, and waits for **Replace**.
- **New: Undo import.** The log an import replaced is kept on the phone. Settings → Data shows an **Undo import** button until you use it or import again.
- **Fixed: a wrong file could wipe the log.** Any JSON file with the right-looking heading was accepted. Files that aren't Ironlog backups are now turned away with nothing changed.
- **Fixed: very old backups crashed every page until the app was restarted.** Backups from before 0.7.0 are now converted as they come in.

## 0.90.2 — 11 Nov 2026
- **Fixed: a log that couldn't be read was quietly replaced by an empty one.** If the saved log was damaged, or the phone's storage didn't answer for a moment at start-up, Ironlog opened as if new and then saved that empty log over the real one. It now stops at the rescue screen instead and writes nothing until you choose.

## 0.90.1 — 11 Nov 2026
- **Fixed: the app could get stuck on "Loading your log…" for good.** A backup file with a gap in it (a list missing or empty in the wrong way) could be imported and then stop the app opening at all. Ironlog now repairs those gaps when it opens.
- **New: a rescue screen.** If your log ever can't be opened, Ironlog now says so instead of hanging, changes nothing, and gives you a **Save a copy of my data** button before anything else.

## 0.90.0 — 9 Nov 2026
- **Fixed: Measure missed the slow last reps of a long set.** Reps that slowed right down near the end of an AMRAP read short and were thrown away as too small. On the 9 Nov push day it now finds all 16 reps of the OHP AMRAP (80 of 81 across the session).
- **New: short-range lifts can be measured.** Measure now counts reps down to 4 cm of travel, so calf raises and other short movements register. In a set of 4 or more, a "rep" much shorter than the rest (lifting the bar off the hooks, a fidget) is still left out. Sets of 1–3 keep the usual minimum.
- **Changed: Bar-speed debug keeps more detail.** It now records the phone's full 3-axis readings, so the phone tilting as the bar rolls can be corrected in a later update. It keeps the last 20 sets instead of 30, and drops the oldest when phone storage is full.

## 0.89.0 — 9 Nov 2026
- **Fixed: Measure missed most reps.** Heavy sets, dead-stop presses and long AMRAPs often came back as "found 1 of 9 reps", or none at all. The phone's reading drifts during a set, and it was only being corrected when the bar sat still, which on a press it hardly ever does. It now strips that drift out continuously. On one push day's recordings it found 77 of 81 reps, up from 36.
- **Fixed: speeds that climbed through a set.** The same drift made warm-up speeds rise rep after rep (0.37 → 0.94 m/s). They now hold steady or fade as they should.
- **Fixed: lifting the bar off the hooks no longer counts as a rep.**
- **Fixed: no more "RIR NaN".** A set whose speed never dropped now shows no bar-speed RIR instead of NaN.
- **Changed: no bar-speed RIR when the sensor missed reps.** If it found fewer reps than you logged, its RIR isn't shown in the summary, the set strip or the weekly coach notes.
- Bar-speed RIR itself is still a rough guide. Rep counts and speeds are what this fixes.

## 0.88.0 — 8 Nov 2026
- **Changed: Warm-ups are shorter.** The **▲ Warm-up** ramp is now three sets at most, counting the empty bar as one, e.g. 20 × 10, 50 × 6, 65 × 3 before 80 × 8. It used to give up to seven for a heavy single.
- **New: Add to workout.** In a workout, the warm-up sheet starts from your planned weight and reps and has an **Add to workout** button. It puts the warm-up sets in ahead of your working sets, marked W so they stay out of volume and PRs. Pressing it again replaces warm-ups you haven't done yet rather than adding more.
- Meet day still gives the full warm-up ladder to your opener.

## 0.87.0 — 8 Nov 2026
- **New: Squat depth from video.** Turn it on in **Settings → Squat depth from video**, a one-time 16.6 MB download from Ironlog itself (no other site). After that, a squat clip in **Bar path from video** marks each rep **✓ deep**, **✗ high** or **≈ too close to call**, with how many cm it was off.
- The bottom of the squat is shown with your hip, knee and ankle drawn on it. Depth calls are saved on the set. It's a guide, not a white light. Film side-on with your whole body in frame.
- **Fixed:** Bar path from video could read the frame before the one it meant to, and on a plain plate it could read range and speed several % high. It now measures the plate's outer edge properly and follows it, which on test clips puts range within 1 cm.

## 0.86.0 — 8 Nov 2026
- **New: Bar path from video.** On a lift in your workout, tap **▶ Video** and pick a side-on clip of the set from your gallery. It draws the bar's path and gives speed per rep, alongside the phone-on-bar **Measure**.
- Trim off the walk-out and re-rack, check the green circle is the plate (or tap it yourself), and it follows the plate through the set. You get each rep's speed, top speed, range of motion, how far the bar moved sideways and an estimated RIR. **Attach to set** saves it with the path.
- The plate is the ruler: a standard 20/25 kg plate or bumper is 450 mm across, and you can pick a smaller plate size. A filming guide shows how to set up: side-on, at plate height, phone propped up.
- **Save with bar path** makes a video of the set with the path drawn on, to share. The original video isn't kept.
- Numbers from video are marked as estimates and don't change your velocity calibration. Also in **Tools → Bar path from video** for any clip.

## 0.85.0 — 8 Nov 2026
- **New: Daily clip.** Health → **Daily clip** records one second of video a day. Tap **Record today**: it counts 3-2-1, records one second, and plays it back so you can keep it or try again.
- A faint **ghost** of your last clip sits over the camera so you can stand in the same spot and pose each day. You can turn it off, and flip between the front and back camera.
- **From gallery** takes any second out of a video you already have, and you can fill in a missed day.
- **Timelapse** plays them back to back with the date on each one, for all time, the last 30 or 90 days, or this year. **Save video** makes a video file you can share or save to your phone.
- The card shows the last 14 days, your streak and how much space the clips take. Like progress photos, clips stay on this phone and aren't in exports or Drive sync.

## 0.84.0 — 8 Nov 2026
- **New: Interval timer.** Train → **⏱ Intervals**. Set work, rest and rounds, with an optional warm-up and cool-down, or pick a preset: Tabata, 30/30, 1 on / 1 off, run intervals, sprints or 4 × 4 min.
- A big countdown shows each phase in its own colour, the round you're on and what's next. It beeps and buzzes at every change and ticks 3-2-1 before each one. The voice says "Go, round 3 of 8" and "Rest" (you can turn it off), and the screen stays on.
- **Save as preset** keeps your own sets of intervals, and the last one you used is remembered.
- It logs as a cardio session on the machine you pick, so it shows in the calendar and history with the rounds you finished. It records heart rate if you connect a strap.

## 0.83.0 — 8 Nov 2026
- **New: Weekly sets per muscle.** Stats → Muscles now counts your hard sets for each muscle this week (Monday to Sunday) and shows whether you're under, in range or over.
- Warm-ups and easy sets (5+ reps in reserve) don't count. A lift's main muscle gets a whole set, its helpers get half, and a drop set counts as half.
- Tap a muscle to see the last 8 weeks as a chart, which lifts made this week's number, and to set your own range (least / aim / most). The starting ranges are rough general figures.
- With debug mode on, **how?** lists every set that counted.

## 0.82.0 — 6 Nov 2026
- **New: Missed button on planned sessions.** On Home, Train and the calendar, tap **Missed**, pick why (sore, niggle, ill, work, family, gym busy, low energy or other), add a note if you like, then either **skip** it or **move** it to another day.
- The calendar marks missed days with a red dot and shows the reason. Tap **Undo** to put the session back on your plan.
- **New: Not logged.** Train lists planned sessions from the past week that have nothing logged, so you can do them today or say why they didn't happen.
- The coach counts skipped sessions as missed and tells you this week's reasons. A moved session doesn't count as missed.
- The Drive summary has a **Missed sessions** section with each reason and a tally.

## 0.81.0 — 5 Nov 2026
- **New exercise demos:** face pull, upright row, rear-delt row, Y-raise, straight-arm pulldown, pullover, concentration curl, spider curl, drag curl, sissy squat and hack squat — each with an animated figure, setup, cues, common mistakes and variant notes.
- The barbell hack squat (bar behind the legs) is a different lift from the machine one, so it shows no figure rather than a wrong one.

## 0.80.1 — 5 Nov 2026
- **New:** the front raise has an animated demo.
- **Fixed:** a dark box could appear behind the exercise figure when Bar path was on.
- Behind the scenes: new exercise demos are now much quicker to add, so more lifts will get figures soon.

## 0.80.0 — 5 Nov 2026
- **New: exercise demos.** Open any exercise's page → Info and most lifts now show an animated figure doing the movement, with the working muscles lighting up through the hard part of the rep, the bar path, and a short label for each phase. Pause it, slow it down, turn the muscles or bar path off, or drag the slider to any point in the rep.
- The figure changes with the variant you pick — barbell, Smith, dumbbells, cable, trap bar and so on.
- **New: how to do it.** Under the figure: setup, three cues, common mistakes, and a note on what your chosen variant changes.
- **New: Your notes** for each exercise, saved on your phone and included in backups and Drive sync.
- Covers squats, deadlifts and hinges, bench and overhead presses, rows, pulldowns and pull-ups, lateral raises, curls, triceps work and split squats/lunges. Exercises without a figure yet just show your notes.

## 0.79.0 — 5 Nov 2026
- **New: choose the AI model for each feature.** In Settings → AI, voice logging, the plan writer, Tailor it and coach questions can each use **Haiku** (the default, cheapest), **Sonnet** or **Opus**. The cost per use and how many you get for $1 update as you change them.
- Sonnet costs about 20× Haiku and Opus about 40×, so every use still costs a few pence at most. The bigger models are worth it for the plan writer, which reads messy plans and runs rarely.

## 0.78.1 — 5 Nov 2026
- **Fixed:** the coach report and the Drive summary showed **0kg** total volume whenever a carry or timed hold was in range. It now adds up properly, and per-side lifts count both sides, as the rest of the app does.

## 0.78.0 — 5 Nov 2026
- **New: a readable summary in your Google Drive.** Each time Ironlog syncs, it also writes **Ironlog summary.md** next to your backup. It covers the last four weeks in plain text: every session and set with RIR and bar speed, your check-ins (weight, sleep, energy, soreness, notes), your goals and the week ahead. Open it on your phone, or let Claude read it.
- Your full backup stays the same. The summary is just an easier way to read it.
- **New: back up when you finish.** If you're connected to Google Drive, tapping Done after a session now backs up straight away. Google may briefly flash its sign-in, and you can turn this off in Settings → Drive.
- The backup reminder on Home now shows after 3 days without a sync, instead of 14, when you're connected to Drive.

## 0.77.2 — 5 Nov 2026
- **Fixed:** the "Update available" sheet no longer keeps coming back after you update. Since 0.75.1 the app had been reporting its own version wrongly, so it never believed it was up to date.

## 0.77.1 — 5 Nov 2026
- **Missed reps are now flagged.** If the bar-speed sensor finds fewer reps than you logged, the set shows it (for example "1/5") and warns you that its speed and RIR aren't reliable. Ironlog also no longer fills in RIR or calibrates from a set like that.
- The "rpe-out-of-range" label that appeared on every rep is gone. It only meant your bar-speed profile isn't calibrated yet, so that's now said once at the bottom.
- **New: bar-speed debug.** In Settings you can keep the raw sensor traces from your last 30 measured sets and export them. They stay on your phone and aren't included in your backup. This is for fixing rep detection.

## 0.77.0 — 5 Nov 2026
- **New: everyday goals in the coach.** When it builds you a plan you can now pick **Lose weight**, **Get fitter and healthier**, **Build muscle / tone up** or **Move better, ease aches**, as well as the strength goals.
- **Lose weight** keeps you lifting with enough weight to hold onto muscle. It asks for a target weight and adds it to your goals, and the coach's food and weigh-in answers now talk about a steady deficit.
- **Move better, ease aches** uses moderate reps with plenty left in the tank.
- Questions read less like they're for athletes. For example, it asks about favourite exercises (or none) instead of which lifts you care about.
## 0.76.1 — 5 Nov 2026
- **Bar speed on old workouts.** When you open a past workout, any exercise you measured now shows the same bar-speed panel as during the session. Each set has its speed, RIR and per-rep bars, and you can tap a set for the full chart. The warm-up profile chart and e1RM range appear too, if you took one.

## 0.76.0 — 5 Nov 2026
- **New: bar speed per rep.** Every measured set now shows a small bar for each rep next to its speed. Tap the set to open a chart of every rep against your limit, with peak speed, range of motion, time up and RIR for each one.
- Gold bars are reps at RIR 1 or less. Faded bars are reps the sensor wasn't sure about, and short reps are labelled.
- It works in your workout history too. Tap a measured set to see its reps.

## 0.75.1 — 5 Nov 2026
- **Fixed: bar-speed RIR on pin and dead-stop presses.** Re-racking or lifting the bar off the pins after a set could read as a missed rep and log RIR 0 on an easy set. If the last rep was clearly fast, that's now ignored, and it can no longer skew your failure speed.
- **Fixed:** sets measured in warm-up profile mode now log their RIR on working sets, like any other measured set.
- **Fixed:** set numbers in the bar-speed list and the warm-up profile now match the set numbers in your log, with warm-ups shown as W and their weight.
- **Fixed:** if you correct a warm-up's weight after measuring it, the profile line now uses the corrected weight.
- **Fixed:** RIR values like 3.9000000000000004 now show as 3.9.

## 0.75.0 — 2 Nov 2026
- **New: grip work.** Two new exercises — **Gripper Close** and **Finger Extension** (extension bands). Find them in the exercise picker under arms, or by typing "gripper" or "extension band".
- Both are logged per hand: put your gripper's or band's rating in the weight box (in kg) and the reps.
- **Timed holds:** open the exercise's menu and tap *Log as isometric hold* to log crush holds or band holds in seconds instead of reps. Holds keep their own records, separate from your rep sets.
- Grippers and extension bands count as kit you carry, so they're never flagged as missing at a gym or place.

## 0.74.0 — 1 Nov 2026
- **The coach answers a lot more, still without AI.** New topics:
  - **Training:** rest between sets (from your rest timer), reps and sets for your goal and experience, how to progress, training to failure, session length, cardio and stretching.
  - **Your numbers:** your strength tier ("what's a good bench for my weight?"), DOTS and total (estimated if untested), goal progress, meet openers, your balance test and fitting test, when you last trained a muscle or lift, and how much you lifted this week.
  - **Situations:** "I slept badly", "I'm sore", "I'm ill", "going on holiday", "can I train two days in a row?", "skip today", "I want to train 4 days a week".
  - **General guidance:** protein for your bodyweight and creatine or caffeine. Clearly not medical or dietary advice.
  - **A glossary:** AMRAP, tempo, top set, back-off, drop set, superset, deload, e1RM, RPE, RIR, double progression, and the training blocks.
- **The coach can now move a session** a day later ("move my session to tomorrow"), or swap a named exercise in your upcoming sessions ("swap squat for leg press"). As always, nothing changes until you tap Apply, and Undo puts it back.
- "I hate lunges" offers to remember it, and to swap lunges out of your plan.
- **Fixed:** "when should I add weight" and "what's a good bench for my weight" no longer get the bodyweight answer, and "show my fitting test" no longer gets the event countdown.

## 0.73.0 — 1 Nov 2026
- **New: Trend coach for heart-rate cardio** (a switch on the cardio setup, off to start). It watches which way your heart rate is heading over the last 90 seconds. When you're still in your zone but on course to leave it within a minute, it nudges you early with the smallest step: "Heart rate climbing. Set speed to 7.9". No more waiting until you've already overshot.
- It works on every machine, follows the same limits as the regular cues, and needs no AI.

## 0.72.0 — 1 Nov 2026
- **New: Tailor it** (with your AI key). When the coach shows a new plan, *Tailor it with Claude* sends the plan and a summary of your log to Claude, which suggests a few changes, each with a reason. Examples: swap an incline press because chest volume is low, or add a set because a lift is lagging.
- **Claude is kept on a short leash.** It can only choose from each exercise's own swap list and move sets by one. Ironlog re-checks every suggestion against your kit, your go-easy list and same-day clashes, and drops anything that breaks a rule (it says how many).
- You see the changes as a before → after list: *Use these changes* or *Keep the original*. Nothing goes on your calendar until you accept the plan. A tailor costs about $0.0005 on Claude Haiku 5.5.

## 0.71.0 — 1 Nov 2026
- **The coach can now change your plan, but only when you tap Apply.** It offers three changes where your log points to them:
  - **Stalled lift:** swap it for a close variation for 6 weeks, then come back to it. Larsen or close-grip for bench; box, front or safety-bar squat for squat; sumo or trap bar for deadlift; push press for overhead press. It only picks kit your gym has.
  - **Low-volume muscle:** add a set to that muscle's accessory in each session for 2 weeks.
  - **Time for a deload:** make the next 7 days a lighter week, with half the sets and every set at RIR 3 or more.
- You'll see these on *Why has my … stalled?*, *Should I deload?*, *Am I doing enough volume?* and the weekly review. It works on any plan on your calendar: coach-built, imported, or the shipped program.
- Every change says how many sessions it touches first, and **Undo that** puts them straight back.

## 0.70.2 — 1 Nov 2026
- **Fixed:** the coach's answer panel took up most of the screen, and chat text showed through under it. The question chips are now single rows you swipe sideways, the panel covers the chat properly, and Coach settings moved into the Plan row, so the chat has room.
- The coach now answers kit questions: belt, sleeves, wrist and knee wraps, straps, chalk, shoes and singlet ("Do I need my belt?").
- The weekly review counts missed **days** on your coach's plan, so two programs planning the same day no longer double-count. A lift with no real change now reads "flat" instead of "▲ 0.0%".

## 0.70.1 — 1 Nov 2026
- **Fixed:** choosing "No plan — I'll just log" in the coach now ends the setup, instead of carrying on with plan questions. Choosing to bring in a plan goes straight to the import.
- If you already have a program on your calendar, the coach asks about that first: *Keep it*, *Build me a new one*, *Bring in a different one*, or *No plan*.
- If you skipped the plan questions and later tap *Build my plan*, the coach asks the ones it needs first.

## 0.70.0 — 1 Nov 2026
- **The coach is more conversational.** It keeps track of what you were talking about: "and squat?" or "what about deadlift?" asks the same question for another lift, "why?" explains its last answer, and "yes" takes the suggestion it just made. Replies vary, there's a short typing pause, and each answer offers sensible next questions.
- **New things to ask:**
  - "How heavy should I go on bench for 3?": the weight from your working e1RM and the RIR target, with a warm-up ramp and plates one tap away.
  - "Warm-up for squat", "plates for 140", "what's my max?", "any PRs lately?", "how many sessions this month?"
  - "I've only got 25 minutes": what to keep from today's session.
  - "I'm at home today": today's session with your home kit swapped in.
  - "Can't be bothered today", "I missed yesterday"
  - "100 lb in kg", "RPE 8 in RIR"
  - Hello, thanks, help, and "who are you?"
- **"My knee hurts"** gets: stop, and get it checked if it persists. The coach doesn't advise on injuries, but offers to go easy on that joint in your plan.

## 0.69.0 — 1 Nov 2026
- **The coach now talks, with no AI needed.** Ask it from chips built from your own training, or just type a question. It answers from your log:
  - what's today's session, with a readiness note from your check-in
  - how a lift is going, and why it's stalled, with likely reasons and what to try
  - whether to take a lighter week
  - your weakest area
  - how long to your event, and where you are in its blocks
  - your volume per muscle, your recovery, and your bodyweight trend
  - what's on your plan, and anything from Help & FAQ ("what does RIR mean?")
- **Coach debrief** after every session (a new button on the session summary): sets against the plan, effort against the RIR targets, real PRs, rep-range verdicts, stalls, pain flags, and **one thing for next time**.
- **Weekly review** on Home once a week: sessions done, PRs, how your main lifts moved, low-volume muscles, sleep and energy, bodyweight, your event, and **one focus for next week**.
- Type "remember …" and the coach offers to keep it as a note.
- With your AI key, a typed question the coach can't place goes to Claude, with your training numbers. Without a key, it says so and shows what it can answer.

## 0.68.0 — 1 Nov 2026
- **The coach asks first whether you want a plan:** *Build me a plan*, *I've got a plan — bring it in*, or *No plan — I'll just log*. If you bring your own, it skips the plan questions.
- **New: Bring in a plan** (from the coach, or Settings → Training program). Any plan works, from a coach, a spreadsheet or your notes:
  - **With your own AI app:** *Copy instructions for your AI* copies Ironlog's plan rules and exercise list. Paste them into ChatGPT, Claude or Gemini with your plan, then paste the reply back.
  - **With Claude here:** describe or paste the plan and Claude writes it, on your own AI key.
  - **From a file:** paste or load an Ironlog plan or program file.
- **Check the plan** shows every day before anything is saved. It also lists any exercise that isn't in Ironlog's list (added as your own) and anything it had to guess. Then pick a start date and put it on your calendar.
- Plans can use RIR targets (Ironlog works out the weights), fixed weights, rep ranges, warm-up, top and back-off sets, holds, carries and an alternating B week.
- Coach-built and imported plans now show their names in Settings instead of an ID.

## 0.67.1 — 1 Nov 2026
- The coach now asks for the basics the strength standards need, but only if your profile hasn't got them: which standards to use (men's or women's), your date of birth and your bodyweight. They're saved to your profile, and the bodyweight as today's check-in. Date of birth can be skipped.
- If you'd already set up the coach, it asks for whatever's missing before your next plan.

## 0.67.0 — 1 Nov 2026
- **New: the Coach** — a raised button in the middle of the bottom bar (a Coach menu in the 98 skin). The first time, it sets you up in a chat: your goal, any event date, where you train, which days (the number of days picks the split), session length, experience, the lifts you care about and anything to go easy on. Tap answers, no typing and no AI. It fills in what your log already knows, so you confirm rather than answer from scratch.
- **Kit in two taps:** for a gym, "is it a standard gym?"; for home, tap what you've got (dumbbells, barbell, rack, bench, kettlebells, bands, pull-up bar).
- It offers the **fitting test** before building, and uses it: your ladder lifts and their weights, an extra set on your lagging pattern, and moves for flagged ankles, shoulders, balance or grip.
- **Your plan:**
  - Splits from full body to six days. With 2+ years of training you get A/B weeks; newer lifters start on machines and dumbbells.
  - At 45 minutes and under, accessories are paired into supersets. Squat and leg press, or trap bar and leg press, never share a session.
  - You see the whole plan first and can **Swap** any exercise. Nothing goes on your calendar until you tap **Accept**.
- The coach remembers your answers (Coach settings → change them, or Forget everything). Debriefs, weekly reviews and chat come next, on your AI key.

## 0.66.0 — 1 Nov 2026
- **New: Settings → AI — on your own key.** Ironlog has no AI server: add your own Anthropic key and the phone calls Anthropic directly. **Check key** tells you straight away whether it works.
- **Monthly cap** (default $1): AI pauses for the rest of the month once this phone's estimated spend reaches it. Set it to 0 to turn AI off.
- **This month** shows calls, tokens and the estimated cost, and lists each AI feature with what one use costs and whether it's on.
- Voice logging's fallback now uses Claude Haiku 5.5: about a tenth of the old price, around $0.00006 a set. If AI can't help (no key, cap reached, offline, key refused), it says why instead of failing quietly.

## 0.65.0 — 1 Nov 2026
- **New: Strength fitting test** (Health → Fitting test). Find your type before training it. The **home screen** takes 15 minutes: knee to wall, shoulder scratch, overhead squat flat and with heels raised, and eyes-closed balance. The **full test** adds an hour at the gym: power, a rep ladder for hinge, squat, press and pull (never a true max), leg-press rep tolerance, a grip hold and a 500 m row.
- The rep ladder works out every next load from bodyweight and the reps you had left, and tells you when to stop.
- Every result scores 0–5 against the same strength standards as Stats → Rankings, so lifts, mobility and fitness compare directly. You get a one-line profile (e.g. "Press-dominant, lagging squat; average volume tolerance; work on ankles"), flags for anything scoring 2 or lower, and left/right gaps over 30%.
- Ladder sets are logged as a normal session, and home-screen results join your mobility tests on Health, including the new shoulder scratch and overhead squat tests. An unfinished test can be resumed. With debug mode on, every score shows its working.

## 0.64.0 — 1 Nov 2026
- **New: Debug mode** (Settings → Debug mode — show the working). Off by default. When it's on, worked-out numbers get a small **how?** button: tap it to see the inputs, the sum with the numbers in, and the result, plus a line saying whether it matches what the app shows.
- Covers estimated 1RM, PRs, strength tiers, RIR ↔ RPE, rep-range verdicts, bar speed and today's e1RM from VBT, the recovery map (tap a muscle), DOTS and IPF GL, caliper body fat, mobility tests and the cardio heart-rate cues.
- **Copy trace** puts the whole walk-through on the clipboard, ready to paste into a bug report. Debug mode never changes your data.

## 0.63.0 — 31 Oct 2026
- New: Coach report, under Tools → Share. Pick the last 4, 8 or 12 weeks (or your own dates) and get a read-only summary for a coach: sessions per week, volume, bodyweight and check-in averages, your main lifts' best estimated 1RM against before, PRs, and every session's sets. Send it as text in a message, save it as a PDF, or save the raw JSON. Warm-ups, notes and check-ins can each be left out.
- New: share a PR as an image. Each PR on the session-complete screen has a Share button, and so does each row of a lift's PR timeline in Stats. The card shows the lift, the number big, how much it beat your previous best, and your estimated 1RM line with the new PR in gold.

## 0.62.3 — 31 Oct 2026
- Goal bars now fill. A lift goal shows how much of the target you can already lift, so 175 of 200 is 88% rather than 0%. A small mark on the bar shows where you were when you set the goal, and the line underneath says how much you've gained since.
- Lift goals now say which lift they're for, with the equipment and its little icon, for example "Back Squat · Barbell".
- Bodyweight goals still count from where you started, because they can go up or down.

## 0.62.2 — 31 Oct 2026
- Clearer exercise lists when picking a lift for a goal, your priority lifts, or a single-lift meet. Each entry now says which version it is ("Bench Press — machine", "Deadlift — trap bar"), so you no longer get the same name three times. The lifts you've done are at the top under Your lifts, and the rest are grouped by body part.
- Goals no longer offer cardio machines as a 1RM lift.
- Fixed: in the Windows 98 skin, drop-down boxes showed a grey field with a big arrow in the middle. They're back to a black field with a small arrow on the right.

## 0.62.1 — 31 Oct 2026
- The app no longer zooms. Pinch and double-tap zoom are off, and it opens at the right size instead of slightly zoomed in. Text still follows your phone's font size setting.
- Fixed: the Settings buttons at the bottom no longer run off the right edge. They wrap onto a second line on narrow phones.
- Fixed: in the Windows 98 skin, the top bar no longer pushes the page wider than the screen. On narrow phones the clock drops the day name.

## 0.62.0 — 31 Oct 2026
- **Blood pressure on Health:** log readings with an optional pulse, arm
  and note. You get the latest, a 7-day average and a chart. Each reading is
  coloured against the NHS bands for home readings: low, ideal, raised or
  high.
- **Blood glucose on Health:** log readings in mmol/L (or mg/dL; switch it
  under Targets), noting when you took them: fasting, before a meal, 2 hours
  after, or bedtime. Each one is checked against your own targets, and the
  page shows the share in target over the last 14 days. Anything under 4 is
  always flagged as low.
- The glucose targets start at the NHS general ones. If your diabetes team
  gave you different targets, set those instead. It's all for reference,
  not medical advice.

## 0.61.0 — 31 Oct 2026
- **Mobility tests on Health:** forward fold reach (the weekly benchmark
  from your stretch routine), knee to wall, straight-leg raise, the Thomas
  test and wall shoulder flexion. Left and right are logged separately,
  with a chart and how far behind the weaker side is.
- **Straight-leg raise by phone:** lay the phone along your shin, zero it
  with the leg flat, raise the leg and capture the angle.
- **Balance test:** stand on one leg with your eyes closed (or open), hold
  the big pad while your foot is up and let go when it touches down. Timed
  to a tenth of a second. It switches legs for you and keeps your best for
  each leg.

## 0.60.0 — 31 Oct 2026
- **Mobility:** Train has a 🧘 Mobility button, and your Full Body Stretch
  (25 stretches, about 30 minutes) is built in. Tick stretches off as you
  go, or press *Start guided* to run it hands-free. It counts each hold
  down, says when to switch sides, waits for you on rep sets, and moves on to
  the next stretch by itself.
- **Hypermobility swaps:** five stretches that hang on the end of a joint
  are swapped by default for an active or loaded version. These are prone
  quad, the wrist stretches, pigeon, the deep squat hold and the forward
  fold. *Original* switches any of them back.
- **Go easy on** (Options in the routine): pick joints to protect, and
  their stretches use the swap or are skipped.
- Each day's stretching goes into your log. It shows on the calendar as a
  purple dot, and Home shows today's progress ("8 / 25") with a button to
  carry on. It never stops you starting a lifting session, and it doesn't
  count as a training session in your stats.

## 0.59.0 — 31 Oct 2026
- **Cardio on any machine:** pick the machine when you start a cardio
  session. Choices: treadmill, exercise bike, air bike, rower, ski erg,
  elliptical, stair climber, walking or running outdoors, or Other.
- Each one is cued in its own terms: resistance or cadence on a bike, stroke
  rate or split on a rower, pace outdoors. On *Other* the cues are just "go a
  little harder" or "ease off". The warm-up, the target zone and the heart
  rate ceiling work the same everywhere.
- Your setup is remembered per machine, so a bike session never starts at
  treadmill speeds.
- At the end you can type in what the machine's screen says (distance,
  calories, average watts). It's optional.
- Rower, ski erg, air bike, outdoor walk/run and "other cardio" are new
  exercises in the library.

## 0.58.0 — 31 Oct 2026
- **Home explains Ironlog** to anyone opening it in a browser or before the
  first logged session: who it's for, that it's free, that your log stays on
  your phone, and that AI is optional on your own key.
- **Install button:** when Chrome offers to install, Home has an *Install
  Ironlog* button. Otherwise it shows the steps for Android and iPhone.
- Links to What's new, Help & privacy, and the source on GitHub. *Hide* puts
  it away, and Help & FAQ can bring it back. Installed with a log, you won't
  see it.

## 0.57.0 — 31 Oct 2026
- **Health page:** three tiles at the top show your bodyweight (7-day
  average and weekly change), latest body fat with the skinfold sum, and
  your waist. Tap one to jump to its history.
- Body fat changes are compared only with your previous test of the same
  method, so JP3 and JP7 results aren't mixed.
- Health also links to the FFMI and muscular potential calculators, filled
  in from your numbers, and to the recovery map on Stats. If you add "wrist"
  and "ankle" as measurement sites, the potential calculator uses them.

## 0.56.0 — 31 Oct 2026
- **Tools** (the spanner in the top bar) now has calculators, each started
  from what you've logged and free to change for what-ifs. Nothing is saved:
  - e1RM and a rep-max table from any set
  - a %1RM ↔ RIR chart
  - DOTS and IPF GL points
  - an RPE ↔ RIR table
  - TDEE (Mifflin-St Jeor, plus Katch-McArdle when you know your body fat)
  - maximum muscular potential (Casey Butt)
  - FFMI
- The physique numbers are estimates, and the tools say so.

## 0.55.0 — 31 Oct 2026
- **Chains, bands, slingshot and equipped now have their own PRs.** Before,
  a bench with chains counted toward your raw bench PR. Now each gets a PR
  line, history and chart of its own. Pick them in the modifier sheet under
  *Own PR line*.
- **Chain weight and band tension:** when you tag chains or bands you can
  add how much (optional). It shows on the exercise.
- If any of your past sessions were tagged this way, a one-off note after
  the update lists what moved and how it changed the raw lift's best.
  Settings → Check exercise data lists it too.

## 0.54.0 — 31 Oct 2026
- **New layout:** the bottom bar is now Home · Calendar · Train · Stats ·
  Health.
- **Train** (was Workout) is where you start a lift or a cardio session. A
  session in progress resumes from there as before.
- **Events moved into Calendar:** use the Calendar | Events switch at the
  top. Event days show a gold dot on the calendar, and tapping the day opens
  the event. All the meet-day tools are unchanged.
- **Home shows a countdown** when an event is two weeks away or less, with a
  button straight to meet day.
- **Health** has its own tab. It holds what was Stats → Body (bodyweight,
  calipers, measurements, photos), and Stats is back to training only.
- **Tools** button in the top bar (the spanner): plate loader and warm-up
  ramp for now, with calculators to come.

## 0.53.0 — 31 Oct 2026
- **Any equipment for any movement:** equipment a lift doesn't usually use
  is still greyed and listed under "Unusual for …", but you can now pick it.
  A kettlebell bench press gets its own PRs, history and stats like any other
  variant.
- Importing from other apps now keeps unusual combinations like this instead
  of failing to match them; the dry run marks them as guesses so you can check.

## 0.52.4 — 31 Oct 2026
- **Stats:** the headline tiles and the main-lift e1RM chart now show on
  the Exercises tab only, so Rankings, Muscles and Body open with their own
  content.

## 0.52.3 — 26 Oct 2026
- **WDC Records, Legs:** Smith calf raises are now single leg on both A and
  B weeks, left leg first with the right matching its reps. They open per side
  so the left/right gap shows on the calf raise page. Remove and reinstall the
  program in Settings → Training program to pick it up (sessions you've
  already done stay as they are).
- Programs can now set a lift to single-sided when it allows it.

## 0.52.2 — 19 Oct 2026
- **WDC Records, A-week Legs:** hack squat swapped for Smith squat 4×5 (the
  gym has no hack squat). Leg press stays the B-week main lift. Reinstall
  fresh from today to pick it up.

## 0.52.1 — 19 Oct 2026
- **WDC Records:** back extensions are gone from A-week Friday. Your lower back
  already gets plenty from the two heavy pull days. To update sessions you've
  already installed, use Settings → Training program → Manage → Reinstall fresh
  from today (anything you've trained is kept).
- **WDC Records, Pull days:** A-week Pull drops the shrugs and the trap bar
  hold (the pull's lockout already out-loads a shrug) for a heavier
  chest-supported row and lat pulldowns. B-week Pull now starts with the grip
  hold while you're fresh, and the shrugs there go up to 12 reps.

## 0.52.0 — 19 Oct 2026
- **New program: WDC Records · A/B PPLUL.** Eight weeks built around the
  16 in trap bar and 21 in Viking deadlift records, with big back work, incline
  on A-week Monday and overhead press on A-week Thursday. It starts the week of
  19 Oct with the baseline tests, through to 11 Dec. Install it from
  Settings → Training program.
- Programs can now plan **holds** (timed or max time) and **carries** (with the
  distance filled in), and can say which equipment a lift uses — a trap bar
  rack pull and a Smith incline land as those, not the barbell defaults.
- **Old program, still removable.** Hunchback Hercules shows under the new one
  in Settings with a Remove button for its planned sessions. Anything you've
  trained stays.
- Fixed: exercises a program adds that aren't in the catalogue (Landmine Press,
  Tibialis Raise) now show their proper name.

## 0.51.1 — 6 Oct 2026
- **Warm-up profile ignores a rogue rep.** A warm-up that moved faster than a
  lighter one (a first set you didn't push, say) is left out of the line. It
  shows struck through, with a note saying why.
- If the remaining warm-ups barely slow down, no e1RM is shown instead of a
  silly one. Add a heavier warm-up to get a reading.

## 0.51.0 — 6 Oct 2026
- **Hunchback Hercules rebuilt fresh from the PDF.** Every session, set and
  note re-read from the source, so the odd sets and muddled notes from the old
  copy are gone (calf raises get their AMRAP set back, test and taper weeks
  have proper names, supersets are marked in the notes).
- **No weights in the plan — RIR decides.** Each set has its own target RIR,
  shown in the RIR box: top sets lower, back-offs higher, AMRAPs stop 1 shy,
  light and taper weeks easy. When you start a session the weights come from
  your recent RIR-logged lifts; with no history yet, log the first set with
  RIR and the rest of that lift follows from it.
- **Reinstall fresh from today** (Settings → Training program) swaps your
  planned sessions for a clean copy. Sessions you've trained and your meets
  are kept.
- Installing a program no longer adds sessions on dates already gone.

## 0.50.0 — 27 Sep 2026
- **New Body page** (Stats → Body; in Ironlog 98 it's also under View → Body)
  with four sections.
- **Bodyweight:** your check-in weigh-ins with a 7-day average line, plus the
  change over the last week and month.
- **Body fat from calipers:** Jackson–Pollock 3 or 7-site, or
  Durnin–Womersley 4-site.
  - Enter up to three readings per site and they're averaged. Each site
    says where to pinch.
  - You get the body-fat %, your raw skinfold total, and your lean and fat
    mass from the nearest weigh-in.
- **Measurements:** neck, chest, waist, hips, and left and right arms,
  forearms, thighs and calves, plus sites you name yourself.
  - They're in cm, or inches if you use lb.
  - A table shows your latest and the change, with a chart for each site.
- **Progress photos:** front, back and sides, with a side-by-side compare.
  They stay on your phone and are never exported or synced.
- Measurements and caliper tests are included in backups and Google Drive
  sync.

## 0.49.1 — 25 Sep 2026
- **More room for your sets.** The bar pinned at the top of a workout is now
  one slim row: the clock, sets done, 🎤 and Finish, plus the rest timer when
  it's running. The session name, Off day, Discard, place and "How it feels"
  scroll away with the page.
- **Ironlog 98:** the IRONLOG clock banner hides during a workout, since the
  pinned row already shows the time and sets. Settings and Profile are still
  in the Tools menu.
- **Put away for now:** the ±2.5 kg, ±rep and Copy down buttons under each
  exercise are hidden while their replacement is designed. "⇆ Each side"
  stays.

## 0.49.0 — 25 Sep 2026
- **Recovery heatmap.** The muscle map (Stats → Muscles) has a new Recovery
  view. It shows which muscles are fresh and which are still carrying the
  last few days' training, from Light to Smashed.
- **Tap a muscle** to see how tired it is, roughly when it'll be fresh, and
  which sessions it's from.
- **The exercise picker shows it too.** A line at the top lists what's still
  tired, and each lift has a coloured dot: green fresh, gold recovering, red
  tired.
- **Fixed:** some lifts had no muscle breakdown at all because their names
  didn't match, among them standing calf raises and seated cable rows. They
  now count in the heatmap and the full share image.
- It's a guide, based on your sets, RIR and time since. Some lifts still use
  estimated muscle splits, and the map says when.

## 0.48.0 — 25 Sep 2026
- **Places.** Set up where you train, such as Home, Gym or a hotel, with the
  kit each one has. Find it in Settings → Places, with presets to start
  from.
- **Plates per place.** A place can have its own bars and plates, so the
  plate calculator and warm-ups load from what's actually there.
- **Switch place from the session.** A 📍 button on the session says where
  you are and changes it.
- **The exercise picker greys what isn't there**, and picks equipment that
  is when you tap a lift.
- **Planned and program sessions offer a swap** when an exercise needs kit
  you don't have. For example, "Needs Barbell — not at Home" comes with a
  button to swap to dumbbells.

## 0.47.0 — 25 Sep 2026
- **Rep ranges.** Give an exercise a range like 8–12, from its ⋯ menu or the
  planner. Program notes such as "3×8-12" are picked up by themselves, and
  the range is remembered for that lift.
- **Know when to add weight.** Once every set hits the top of the range at
  your target RIR, Ironlog suggests the next weight and resets you to the
  bottom of the range. If you're still in the range, it tells you to beat
  last time's reps.
- **One tap to use it.** Next session, *Use* fills in the new weight and reps.
  On autoregulated lifts it only gives the verdict and leaves your weights
  alone.
- **The finish summary has a "Next time" list** for exercises with a range.

## 0.46.0 — 25 Sep 2026
- **Log each side on single-arm and single-leg lifts.** On lifts like split
  squats or one-arm rows, tap ⇆ Each side to enter left and right reps for
  every set. "Different weights" gives each side its own weight too. It
  stays on for that lift next time.
- **Your weaker side counts.** The set's reps, and your PRs, go by the weaker
  side, which is outlined as you type.
- **See your imbalance.** Pick a single-arm or single-leg version of a lift
  on its page to see, session by session, how far apart your sides were and
  which one was weaker.
- Sets show both sides, e.g. "20 kg × 7 (L 9 · R 7)", in the summary, the
  history and the share image.

## 0.45.0 — 25 Sep 2026
- **Tempo.** Give an exercise a tempo such as 3-1-1-0: seconds down, pause
  at the bottom, up, pause at the top. X means as fast as you can. Set it
  from the Tempo / modifier button, with presets or your own counts.
- **Shown on the set you're doing**, with the time under tension for that
  set's reps.
- **Picked up automatically** when an exercise's note or a modifier you typed
  says something like "tempo 3-0-1".
- **Measure shows your real tempo.** Measured sets now record how long each
  rep took going down and up, and flag it if you came down faster than
  planned.
- A tempo doesn't change your PRs: a tempo squat still counts as a squat.

## 0.44.2 — 25 Sep 2026
- **Cardio sessions get their own share image.** Time, distance, average
  speed, average and max heart rate, time in zone, and your heart-rate line
  over the zone — instead of a lifting card showing 0 kg and 0 reps.
- **Share or save when you finish.** The cardio "Session complete" screen now
  has a Share image button, like lifting sessions do.
- **See the image before you send it.** Sharing now shows a preview, with
  *Share* and a new *Save image* that puts it straight in your downloads.

## 0.44.1 — 25 Sep 2026
- **Heart rate now says why there's no number.** Instead of just "no
  signal", it tells you whether the watch is connected but sending nothing
  (it isn't broadcasting heart rate) or sending readings with no pulse
  (check it's snug on the wrist).
- **Watches that go quiet after connecting** get one automatic retry of the
  heart-rate feed.
- **Clearer Galaxy Watch help.** Samsung watches need a heart-rate broadcast
  app running on the watch; the help now says so and how to find one.

## 0.44.0 — 25 Sep 2026
- **Connect your smartwatch on the cardio setup screen.** A new Heart rate
  section shows what's connected and your live bpm before you start, and
  the connection carries straight into the session.
- **Watches that don't show up** can be found with "Not listed?", which
  shows every nearby Bluetooth device. If the one you pick isn't sending
  heart rate, Ironlog says so and how to fix it.
- **"Using a smartwatch"** explains how to turn on heart-rate broadcast on
  Garmin, Polar, Coros, Suunto, Wahoo, Amazfit and Wear OS watches. Apple
  Watch and Fitbit can't send heart rate to a browser.
- **Remembers your device:** next time, the setup screen reconnects to it
  by itself if it's on and nearby.

## 0.43.0 — 25 Sep 2026
- **New lifts:**
  - **Larsen Press** (feet-up bench) is now its own lift with its own
    PRs. It used to be counted as Bench Press.
  - **TruSquat** and **Pendulum Squat** are added.
- **More names recognised**, for picking exercises and importing from
  other apps:
  - SSB squat, SSB good morning and SSB split squat;
  - belt squat;
  - hex bar deadlift, trap bar shrug and trap bar RDL.

  Each lands on the right lift and bar.
- The strongman implements (log, axle, yoke, keg, sandbag, stones, farmers
  handles, sled, Conan's wheel) came in 0.28.0.
- **Heads-up:** sessions already logged as Bench Press stay Bench Press,
  including any that were really Larsen presses. Change them in Edit if you
  want them on the Larsen PRs.

## 0.42.0 — 25 Sep 2026
- **Warm-up profile: today's max from your warm-ups.** In Measure, pick
  "Warm-up profile" and measure 1–2 fast reps on each warm-up.
  - From three or more, Ironlog draws your load–speed line and shows
    today's estimated max as a **range**, e.g. 158–176 kg. The range
    tightens as your warm-ups get heavier.
  - It shows whether your bar speed is faster or slower than usual, and
    suggests today's working weight. "Use it" sets your working sets.
  - A chart shows today's points and line against your usual one.
- **Calibrate bar speed — about 8 minutes** (exercise ⋯ menu): a measured
  ramp builds your own velocity profile for that lift. An optional set to
  failure teaches it your limit speed and how fast you slow down. It's
  optional; everything works without it.
- **Calibration is steadier.** Your limit speed is now blended from all
  your near-failure sets instead of the last one. Lifts you haven't
  calibrated borrow how fast you slow down from the ones you have.
- **"On the bar" or "In a pocket".** Pocket readings are marked as rougher
  and never change your calibration or your profile.
- All bar-speed numbers are labelled as a guide. A phone isn't a lab device.

## 0.41.0 — 25 Sep 2026
- **Plan the run-in to a meet.** On an event, "Plan the run-in" lays
  training blocks out backwards from the meet date: accumulation,
  intensification, peak and taper, with an optional deload.
  - Start from a 16, 12 or 8-week template (or a strongman one), then change
    any block or its length.
  - Moving the meet date moves the whole plan.
- **Blocks steer your loads.**
  - During accumulation (target RIR 3) and intensification (RIR 2),
    planned sessions get their weights set from your RIR. That includes
    sessions you planned yourself, not just ones from a program.
  - Peak, taper and deload weeks keep the weights you planned.
- **See where you are.** The event card shows a timeline with a marker for
  today. Home and the workout screen show the current block, the week,
  the target RIR and rep range, and days to the meet.

## 0.40.0 — 25 Sep 2026
- **Adaptation modifiers.** The modifier picker has a new Adaptations
  section: seated, strapped in, grip aid / hand strap, assisted set-up,
  one-sided set-up, from wheelchair, prosthesis / orthosis, supported (chest
  or back), adapted range. They record how a lift was set up for you and
  never split your PRs. This is a first list, so tell us what's missing.
- **Flag pain or fatigue on a set.** Tap the set number: under "How it
  felt", mark pain or fatigue and add a short note. Flagged sets get a gold
  dot.
- **Flag the whole session** with "How it feels today…" on the workout, or
  "How it felt" when editing a past session.
- Flags show in the session summary, on the calendar, in the session view
  and in each lift's history. They never change a PR, volume or your plan.

## 0.39.0 — 25 Sep 2026
- **Easier to hit with chalky hands.** On the workout screen, the tick,
  set number, weight and reps boxes, steppers, ⋯ menu, and Finish and Off
  day buttons are all bigger, most of them at least 40 px.
- **Easier to read.** Small grey labels are brighter, and orange buttons use
  dark text, so everything meets the contrast standard for text. The 98
  skin's red text is a touch darker for the same reason.
- **Works with a screen reader.**
  - Every box and button says what it is, e.g. "Set 2 weight (kg)" or
    "Set 2 done".
  - Sheets are announced as dialogs, and focus goes back to where you were
    when they close.
  - Messages are read out, and the current tab is announced.
- **A short buzz when you tick a set**, as well as the one when rest ends
  (turn it off with Vibration in Settings).

## 0.38.0 — 25 Sep 2026
- **Para powerlifting.** A new event type for WPPO bench press meets:
  - **Classes:** pick your class from the WPPO list for your sex.
  - **Attempts:** planned in whole kilograms. Meet day adds an optional
    fourth **record attempt** with its own lights; it's marked clearly and
    never counts toward your result.
  - **Warnings** if an attempt goes down, isn't a whole kilogram, rises less
    than 1 kg after a good lift, or a record attempt is less than 0.5 kg over
    your best.
  - **Results:** your best lift and the total of your good lifts. A good
    record attempt is used when you save results as a tested single.
- Para powerlifting is also a choice on the welcome screen.

## 0.37.0 — 24 Sep 2026
- **Meet day.** Each event has a Meet day screen:
  - **Warm-ups:** enter when your flight starts and where you are in the
    order, and get your warm-ups with clock times and the plates for each
    step, timed to your opener.
  - **Attempts:** your three attempts per lift with the referees' lights,
    tapped white or red. Your best lifts, subtotal and total update as you
    go, with DOTS and IPF GL from your weigh-in.
  - **Checklist:** rack heights, and a packing list you can add to.
- **Save meet results as tested singles**, so your next event's openers
  follow what you actually hit.
- **Attempt strategies:** conservative, standard or aggressive. A lift with
  no tested single now plans from your best recent training (e1RM) instead
  of leaving the plan blank.
- **Bodyweight against your class:** the event card shows how far over or
  under you are, your two-week trend, and what you need per week to make it.
- **Strongman shows:** add a show with its events (max weight, max reps, a
  carry or medley for time, furthest distance, longest hold), see your best
  at each from training, and enter results and placings for points.

## 0.36.0 — 24 Sep 2026
- **A welcome for new users.** Three short steps the first time Ironlog
  opens:
  - how your data is handled (on your phone, backed up to your own Drive if
    you want, AI only with your own key) and a short safety note;
  - your units, sex and bodyweight;
  - what you're training for and your main lifts.

  Picking a meet type goes straight on to adding the event.
- **Already use Ironlog?** The welcome can restore your log from Google Drive
  or a backup file before anything else.
- **Help & FAQ**, from Settings or the 98 Help menu: short answers on backups,
  RIR, e1RM, PRs, set roles, fast logging, importing and the AI.

## 0.35.0 — 24 Sep 2026
- **Import from Strong, Hevy and FitNotes**, as well as Liftoff and any CSV
  with a date, exercise and weight or reps column. Settings → Data → Import
  CSV works out which app the file came from.
- Warm-ups, drop sets, failure sets, RPE or RIR, times, distances and notes
  come across. Each workout becomes its own session, even two on one day.
- Exercise names like "Bench Press (Barbell)" or "Farmer's Walk" match
  Ironlog's exercises automatically. Anything it isn't sure of is shown for
  you to check first.
- **See it before it happens.** A summary shows exactly what the import will
  add, skip or replace before anything is saved.
  - Dates that could be day/month or month/day ask you which.
  - Importing the same file twice skips what's already in.
- "Remove imported sessions" now takes out imports from any app.

## 0.34.1 — 24 Sep 2026
- **Google Drive backup is switched on.** Settings → Google Drive → Connect
  now works without any extra setup.

## 0.34.0 — 24 Sep 2026
- **Export sets as CSV** (Settings → Data): one row per set, for
  spreadsheets. Each row has the date, session, exercise, set type, kg, reps,
  RIR, time, distance and e1RM.
- **Import it back exactly.** "Import CSV" takes Ironlog's own CSV as well as
  Liftoff's. Nothing is lost on the way out and back in: notes, set roles,
  carries, stone series, summaries and cardio traces all survive. Sessions
  already on the phone are left alone.
- **Fixed:** importing a JSON backup on a phone with no old food log dropped
  the food log from the file. It's kept now.

## 0.33.0 — 24 Sep 2026
- **Back up and sync to your own Google Drive.** Settings → Google Drive →
  Connect. Your log goes into one file, "Ironlog backup.json", in your own
  Drive. Ironlog can only see that file, nothing else in your Drive, and
  nothing goes to any Ironlog server.
- **Two phones stay in step.** Each sync merges both ways. Sessions added,
  edited or deleted on either phone carry across. Connecting never
  overwrites what's already on the phone, and a new phone pulls everything
  down.
- **Protection against wipes.** If a phone suddenly has a lot fewer records
  than last time, Ironlog asks before removing them from Drive, and "Put them
  back" restores them.
- Your AI key stays out of the backup unless you tick the box to include it.
- A sync counts as a backup for the reminder card, and finishing a session
  syncs by itself while you're signed in.
- Needs a one-off Google setup for the web address the app runs from. Until
  that's done, Settings says so.

## 0.32.0 — 24 Sep 2026
- **e1RM vs last time.** The session summary shows today's best e1RM for
  each lift against last time: up, down or first.
- **PR timeline.** On a lift's page, under Stats, every PR the variant has
  had, newest first. Tap one to open that session. Holds, carries and
  time-cap PRs show there too.
- **Main-lift trend chart.** The top of the Stats page charts e1RM over
  the last year for your priority lifts, or your most-trained heavy lifts
  if you haven't picked any. Tap a lift below the chart to open it.

## 0.31.0 — 24 Sep 2026
- **The right bar, automatically.** The plate loader and warm-up ramp use
  the bar that matches the lift: trap bar, safety squat bar, axle or log. In
  Settings → Bars, add one from the presets (women's bar, deadlift bar, SSB,
  trap bar, axle, log) and set what it's for.
- **Collars.** Set your collar weight in Settings and it counts as part of
  the bar.
- **Warm-up ramps you can load.** Each step is rounded to a weight your
  plates can make, shows the plates per side, and sticks to 2.5 kg plates
  and up. "▲ Ramp to this" on the plate sheet builds a ramp to that set in
  one tap.
- **Fixed:** the plate loader can now make weights it used to call "not
  loadable", like 15 + 15 when there's only one 20.
- **Fixed:** saving Settings turned 1.25 kg plates into 1.3 kg, and in pounds
  the plate list was saved in the wrong unit.

## 0.30.0 — 24 Sep 2026
- **Set roles.** Tap a set's number to mark it as a warm-up, working set,
  top set, back-off, AMRAP or drop set. The number shows the role: T1, B2,
  A3, W.
- **Drop sets** hang off the set above them (↳) and read as one set. "Add a
  drop set after this" in the same menu starts the next drop about 20%
  lighter. Drop sets count toward volume but never toward a PR or e1RM.
- **AMRAP sets** ask for today's reps. They're never filled in from last
  time.
- Warm-ups still stay out of volume and PRs. The summary, session view,
  history and share image now show each set's role.
- **Changed:** tapping the set number used to switch warm-up on and off. It
  now opens the role menu.

## 0.29.0 — 24 Sep 2026
- **Last time, beside every set.** The Prev column shows last session's
  weight × reps and RIR for the same set, and its numbers sit greyed in the
  empty boxes.
- **One-tap sets.** Tick an empty set and it logs last time's numbers. Type
  just the weight and the reps come from last time. RIR is never copied:
  that's how today felt.
- **Tap Prev** to fill a set with last time's numbers so you can adjust them.
- **Steppers.** Under each exercise: −/+ 2.5 kg (5 lb) and −/+ 1 rep for the
  highlighted set, plus **Copy down** to copy it to the sets below. Tap a row
  to highlight it. No keyboard needed.

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
