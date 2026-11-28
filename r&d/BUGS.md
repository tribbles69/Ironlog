# Ironlog — found bugs

The running list of known, **non-critical** bugs, kept so they can be fixed
together in one batch rather than one at a time mid-feature.

**Critical bugs don't go here — fix them straight away.** Critical means: data
loss or corruption, the app won't open or a page white-screens, sync or import
damages a log, or a core flow (logging a set, finishing a session) is blocked.

## For agents

- **Found a bug while doing something else?** If it isn't critical, don't fix
  it in the middle of your feature: add it to **Open** below and carry on.
  Mention it in your summary and PR description ("logged B-012 to BUGS.md").
- **Doing a bug sweep?** Write each finding here. A big sweep can have its own
  note in `r&d/notes/` for the detail (like `bug-sweep-2026-11.md`), but every
  finding still gets a one-entry line here so this file is the one list.
- **Asked to "clear the bug list" / "fix the bugs"?** Work Open top to bottom
  (severity first, then oldest). Group fixes into as few versions as makes
  sense — one bump and one changelog entry for the batch is fine — but keep
  one commit per bug so each can be reverted alone. Move each fixed entry to
  **Fixed** with its version.
- Anything that needs the owner's call goes under **Needs the owner** with the
  question spelled out, not in Open.
- Check a bug is still real before fixing it; if it's gone, move it to Fixed
  with "not reproducible" and the version you checked against.

## Entry format

```
### B-001 · sev 3 · short title
Found: 2026-11-12, 0.97.0, while <what you were doing>
Where: js/file.js `functionName`
Reproduce: steps, or "from the code"
Fix: suggested fix
```

IDs run on and are never reused. Severity:

| Sev | Meaning |
|---|---|
| 2 | Wrong result a user would notice (bad number, wrong PR, missing data on screen) |
| 3 | Annoyance or edge case (layout glitch, odd shape of data, console error) |
| 4 | Tools, dev-only or cosmetic |

(Severity 1 is critical — not listed, fixed on the spot.)

---

## Open

### B-262 · sev 4 · `lint-scope.js` does not check code inside top-level object literals
Found: 2026-11-28, 0.100.3, while fixing B-211
Where: r&d/tools/lint-scope.js (collects what each top-level *function* declares and reads); the `WHY` explainers in js/ui.js live in `Object.assign(WHY, { … })`
Reproduce: from the run: with `inc()` used in `WHY.range` and not imported into ui.js, lint-scope reported "no undeclared identifiers found"; check-version passed too. It would have thrown the first time the rep-range "how?" opened in debug mode.
Fix: also walk arrow functions and methods inside top-level object literals (or at least the `WHY` block).

## Needs the owner

### B-057 · sev 2 · Zone 2 moves about 20 bpm when a resting heart rate is entered
Found: 2026-11-16, 0.99.3, maths audit
Where: js/health.js `HR_ZONES`, `zoneBpm`
Reproduce: from the code. Max 187 (Tanaka at 30): "Zone 2 · easy" is 112–131 with no resting HR and 136–149 with a resting HR of 60. The same 60–70% is applied to max HR in one case and to heart-rate reserve in the other, and those are different intensities: 136–149 is 73–80% of max. ACSM's table puts 64–76% of max level with 40–59% of reserve (moderate), and 60–89% of reserve as vigorous.
Fix: Question for the owner — which Zone 2 is meant? Either keep 60–70% of max and use 40–59%-style reserve bands when a resting HR is known, or keep the Karvonen 60–70% and raise the %-of-max bands to match. Both are in common use; the app shouldn't switch between them on an optional field.

### B-026 · sev 2 · Ironlog shares its storage with every other site on tribbles69.github.io
Found: 2026-11-13, 0.99.1, security and privacy check
Where: hosting — browsers keep localStorage / IndexedDB per origin (scheme + host), not per path
Reproduce: from any other page on https://tribbles69.github.io/ (another repo's Pages site, or r&d/tools/demo-lab.html in this one), `localStorage.getItem('ironlog.anthropicKey')` and `indexedDB.open('ironlog')` read Ironlog's key, log, photos and clips. The same is true for anyone who self-hosts on their own username.github.io.
Fix: give Ironlog an origin of its own — a custom subdomain on GitHub Pages, or e.g. a Cloudflare Pages ironlog.pages.dev. Question for the owner: which address? Moving origin doesn't move anyone's data: users need a Drive sync or export first, so the old address should show a "we've moved — sync or export, then open the new one" screen for a while. The README's self-hosting steps should tell people to use a repo/domain that hosts nothing else.

### B-139 · sev 2 · Sync keeps only the newer copy of a session edited on two phones
Found: 2026-11-23, 0.99.6, Haiku swarm sweep
Where: js/database.js `mergeSync` → `pick` (whole record, newest `stampOf` wins), as `r&d/specs/drive-sync-spec.md` merge step 2 says
Reproduce: from the code. Phone A logs a set on a session at 10:00 without syncing; phone B edits the same session at 10:05 and syncs; when A syncs, its set is gone.
Question for the owner: it's the spec's rule, so this is a design call. Keep it (rare for one lifter), or merge sessions set by set?

### B-140 · sev 3 · Voice card logs a 0 kg set when the weight box is cleared
Found: 2026-11-23, 0.99.6, Haiku swarm sweep
Where: js/workout.js `confirmVoiceSet` `#vsGo` (`+''` is 0, no check)
Reproduce: from the code. Clear the weight, tap Log set: a weighted lift is logged at 0 kg as done.
Question for the owner: is that meant for bodyweight moves? If not, ask for a weight when the lift is loaded.

### B-136 · sev 3 · An ignored "failed rep" is still taken out of the rep count
Found: 2026-11-23, 0.99.6, Haiku swarm sweep
Where: js/vbt.js `trustFailure`; slew-core.js `analyse` (already removed the flagged rep)
Reproduce: from the code. A fast set with a partial last rep: the note says the failure was ignored, but the rep stays out and the "missed rep" chip is hidden.
Fix: when the failure isn't trusted, put the rep back (or have Slew return it).
Blocked on Slew: `Slew.analyse` drops the flagged rep (`allReps.slice(0, failedRepIndex)`) and returns only the kept reps, and `slew-core.js` is generated from Slew's repo (do not edit). Question for the owner: change Slew's `analyse` to also return all reps (or the dropped one), then rebuild with `build-slew.cjs`?

### B-138 · sev 3 · "Looking for the plate" can hang forever on a seek that never finishes
Found: 2026-11-23, 0.99.6, Haiku swarm sweep
Where: slew-video.js `searchPlateInClip` → `seekTo` (no timeout, unlike `bpSeek` in vbt.js)
Reproduce: from the code.
Fix: the same timeout `bpSeek` uses.
Blocked on Slew: `slew-video.js` is generated from Slew's repo (do not edit). Question for the owner: add a timeout to `searchPlateInClip`'s `seekTo` in Slew (as `bpSeek` has), then rebuild with `build-slew.cjs`?

## Sweeps

- **2026-11-28, 0.100.0 (nightly Haiku swarm, 5 agents)** — rotation carried on from the 11-27 entry: **main.js + sw.js**, **migrate.js**, **sync.js**, **ai.js**, each in full. js files changed on main since the 11-27 sweep (0.100.0, planned cardio and mobility): coach, core, health, io, migrate, state, sync, training, ui, workout; a fifth agent took the changed lines of the eight not in tonight's four. **Tomorrow carries on with report.js, picker.js, rest.js, state.js + data.js.** Per slice (returned: logged / false or unconfirmed / true but not logged / already known): main + sw 5: 5 / 0 / 0 / 0 (the cached `dbPromise` retry is folded into B-227, the rescue-key overwrite shares B-234); migrate 6: 1 / 2 (a failure between dry and real run; the healCustomMovements comment is right) / 3 (trap-handle recheck keeps this phone's value over an incoming old key; side effects hang on `r.note` but every path saves anyway; the sync recheck omits two migrations, which only matters with a pre-0.96.4 build still syncing) / 0; sync 4: 3 / 0 / 1 ("Next 7 days" lists today plus seven) / 0; ai 4: 3 / 1 (the "short structured jobs" comment) / 0 / 0; changed lines 8: 6 / 1 (a mobility add-on reading the day's session is what spec §3 says) / 1 (backfilled lifts leave add-ons undone, in line with spec §5) / 0 = 27 returned, 18 logged, 4 false or unconfirmed, 5 true but not logged, 0 already known. 16 entries from the swarm plus 1 from the checks: B-226 to B-242 (**two sev 1: B-226, B-227**; two sev 2, nine sev 3, four sev 4). Tokens: main + sw 172,396; migrate 159,683; sync 174,578; ai 120,798; changed lines 207,595; total 835,050. The changed-lines agent ran `git status` and `git log` against its instructions; nothing was altered. Probes in headless Chromium with outside requests blocked or stubbed: B-226 to B-233, B-235, B-236, B-238, B-240 and the migration half of B-234 run in the page; B-241 partly; B-237, B-242 and the rescue half of B-234 from the code; B-239 run in Node. Checks: check-version (0.100.0 / ironlog-v195), lint-scope and validate-mobility pass; **validate-exercises crashes** (B-239); smoke 56/56 on the program seed, no page errors (headless Chromium via Playwright). `add_repo` was not offered; the existing checkout was used. PR #122 (fix/bug-pass-6) is still open and now conflicts with main; it does not cover these. Entries are on the open nightly PR #123.

- **2026-11-27, 0.99.8 (nightly Haiku swarm, 4 agents)** — rotation carried on from the 11-26 entry: **events.js**, **training.js**, **loading.js**, **movement.js**, each in full. **Tomorrow carries on with main.js + sw.js, migrate.js, sync.js, ai.js.** No js file has changed on main since the 11-26 sweep (nothing on main since 11-23), so no fifth agent. Per slice (returned: logged / false / true but not logged / already known): events 5: 5 / 0 / 0 / 0; training 4: 2 / 0 / 2 (the "Last time" set and rep-range hint read backfilled sessions, which AUTO leaves out: a design call; `backfillWindow` reaches one day further for an hour after midnight in the week after a clock change) / 0; loading 5: 4 / 0 / 0 / 1 (bar boxes rounded to 1 dp: B-069, fixed on PR #122); movement 4: 2 / 0 / 1 (a drop set added in the edit sheet and saved with no reps is not kept, as at finish) / 1 (same-day sort order) = 18 returned, 13 logged (B-213 to B-225: five sev 2, four sev 3, four sev 4), 0 false, 3 true but not logged, 2 already known. Two details inside logged findings were wrong and left out (the 210 s meet rest never reaches the warm-up table; the movement page's variant tab does name unlisted equipment). Tokens: events 206,334; training 215,572; loading 194,128; movement 161,437; total 777,471. Probes in headless Chromium with outside requests blocked: B-213 to B-224 run in the page (parts marked "from the code" in B-219, B-220 and B-222, and the program-install note in B-213, read, not run); B-225 from the code. Checks: check-version (0.99.8 / ironlog-v194), lint-scope, validate-exercises and validate-mobility pass; smoke 56/56 on the program seed, no page errors. `add_repo` was not offered; the existing checkout was used. Entries are on the open nightly PR #123.

- **2026-11-26, 0.99.8 (nightly Haiku swarm, 4 agents)** — rotation carried on from the 11-24 entry: **coach.js part 2** (line 992 to the end), **ui.js**, **exercises.js**, **vbt.js**. **Tomorrow carries on with events.js, training.js, loading.js, movement.js.** No js file changed on main since the 11-25 sweep, so no fifth agent. Per slice (returned findings: logged / false or unconfirmed / true but not logged; already known): coach 2 10: 7 / 1 ("I feel dead" does not reach the deadlift) / 2 ("rir 12" prints "RPE −2"; an offered change is worked out again on Apply, edge only); ui 7: 7 / 0 / 0 (the bars-and-plates half of one is B-069, left to PR #122); exercises 5: 2 / 2 (both CSV parsers skip a blank exercise name; the custom-movement id clash is contrived and the duplicate-name path does not happen) / 1 (`shapePRs` at finish counts later-dated sessions, but a live session is dated the day it started); vbt 7: 4 / 1 (the trace comment is right about the export) / 2 (per-rep RIR stops at 9 because RPE is clamped at 1; `loadSlewVideo` keeps a rejected load only if the file loads and then throws) = 29 returned, 20 logged as 19 entries (B-194 to B-212: three sev 2, twelve sev 3, four sev 4; two stale-comment findings share B-212), 4 false or unconfirmed, 5 true but not logged. Tokens: coach 2 197,775; ui 253,103; exercises 228,371; vbt 201,970; total 881,219. Probes in headless Chromium with network requests blocked or stubbed: B-194 to B-211 each run in the page (B-202's "chest press" and "back squat" cases read from the code); B-212 from the code. Checks: check-version (0.99.8 / ironlog-v194), lint-scope, validate-exercises and validate-mobility pass; smoke 56/56 on the program seed, no page errors. `add_repo` was not offered; the existing checkout was used. Entries are on the open nightly PR #123.

- **2026-11-25, 0.99.8 (nightly Haiku swarm, 4 agents — repeated last night's slices)** — the run started from main, which does not yet hold PR #123, so it did not see the 11-24 entry saying the rotation had moved on and re-swept **health.js part 1**, **workout.js part 1**, **workout.js part 2** and **coach.js part 1**. Most findings matched B-164 to B-180 and were not logged again (B-168 remove exercise, B-171 voice toast name, B-173 mobility tally, B-174 future-dated readings, B-178 week 9 of 8, B-180 tailor after reopen); the swarm's cost was largely wasted. **Tomorrow carries on from the 11-24 entry: coach.js part 2 (992 to the end), then ui.js, exercises.js, vbt.js.** (Future runs: read the open nightly PR's Sweeps entry, not only main's.) No js file changed on main since the last sweep, so no fifth agent. Per slice (returned / logged / already known): health 1 5/3/1 (+1 dropped as already B-174), workout 1 6/3/1 (+1 dropped, +1 low-confidence), workout 2 7/4/2 (stale comments left to B-163), coach 1 8/4/1 (+2 dropped: tailor clash check was dropped yesterday as a prompt rule, tailor-after-reopen is B-180) = 26 returned, 13 logged (B-181 to B-193: ten sev 3, three sev 4), the rest already known or not confirmed. Tokens: health 1 231,555; workout 1 203,759; workout 2 193,847; coach 1 205,726; total 834,887. Findings were checked by reading the code and its callers; `wt(0)` = "0kg" and `rirToRpe(12)` = -2 read from the source, not run. Checks: check-version (0.99.8 / ironlog-v194), lint-scope, validate-exercises and validate-mobility pass; smoke 56/56 on the program seed, no page errors (headless Chrome). `add_repo` was not offered; the existing checkout was used. Entries go onto the open nightly PR #123 and are numbered after B-180.

- **2026-11-24, 0.99.8 (nightly Haiku swarm, 4 agents)** — rotation: the 11-23 swarm cut stopped at the start, so tonight began at **health.js part 1** (lines 1 to 1700), **workout.js part 1** (1 to 1478), **workout.js part 2** (1479 to the end) and **coach.js part 1** (1 to 991). Tomorrow carries on with **coach.js part 2** (992 to the end), then ui.js, exercises.js, vbt.js. No js file changed on main since the 11-23 sweep (last js commit is before it), so no fifth agent. Per slice (returned / logged): health 4/4, workout 1 6/4, workout 2 6/5, coach 1 6/4 = 22 returned, 17 logged (B-164 to B-180); 5 not logged: two true but trivial or latent (a set at RIR 10 shows no RIR in the summary row and Prev cell because `rpe 0` is falsy; `toggleSetDone` fills last time's values before the "Enter reps first" return, so state changes without a save until the next render), one low-confidence (the share card's star on both blocks of a lift done twice), two on coach.js `coTailorCheck` dropped as prompt rules rather than bugs (main-lift rule not enforced in code; clash check uses the original keys of other slots). Tokens: health 234,957; workout 1 197,033; workout 2 193,677; coach 1 203,097; total 828,764. Findings were checked by reading the code and its callers; probed: `ex.sets.length = 2.5` throws RangeError in Node; the full-body slot list read from `COACH_TPL`. Nothing was run in a browser beyond smoke. Checks: check-version (0.99.8 / ironlog-v194), lint-scope, validate-exercises and validate-mobility pass; smoke 56/56 on the program seed with no page errors (headless Chrome). `add_repo` was not offered; the existing checkout was used. PR #122 (fix/bug-pass-6, open) clears B-069 and B-141 to B-163; these entries are numbered after it and do not touch those.

- **2026-11-23 evening, 0.99.8 (Haiku swarm, cut short)** — a run of the new
  one-agent-per-file swarm, started by hand to measure its cost. 29 slices
  (health, workout and coach split in two); 20 ran at once (the session's
  cap) and the run was stopped early: 8 finished (health part 2,
  io, stats, database, kit, core, tools, slew-reps), 12 stopped partway and
  were not resumed, 8 never started. Tokens: the 8 finished used 1.29M
  (142k–199k each, about 162k on average), so a full nightly swarm is about
  4.7M; the nightly task was cut to 4 agents a night on rotation, starting at
  health.js part 1. Checked by Opus against the code: 43 findings returned,
  30 confirmed and logged as B-141 to B-163, 4 true but latent or trivial and
  not logged (core.js `w`/`wt` dec > 1 cut to 1 dp, `rpeToRir('')` = 10,
  `Cue.countIn` buzzes can't be cancelled; tilt share rounding at 89.5%),
  9 dropped as unconfirmed or intended. Per slice (returned / logged):
  health 2 5/5, io 7/7, stats 6/3, database 8/6, kit 4/3, core 3/0, tools 4/3,
  slew-reps 6/3. Two regressions from 0.99.7 found: B-141 (from B-083) and
  B-151 (a gap in B-075). Docs only, no code run beyond a Node probe of
  `guessUnit`. Rotation: tonight starts at health.js part 1.
- **2026-11-23, 0.99.6 (Haiku swarm)** — ten Claude Haiku agents, one per area
  (workout ×2, health ×2, coach/ai/report, ui/kit/main/picker/rest,
  exercises/movement/loading, io/migrate/sync/database/state, vbt + Slew,
  stats/events/training/core/tools/sw), read-only. 73 findings. Each was checked
  against the code by Opus; none were run in a browser. 1 false positive
  (deleting a session does clear the stats cache: `renderPage` calls `bust()`),
  1 duplicate between agents, 2 already known (B-041; the same-day sort order in
  the sweep notes). Logged B-072 to B-140; B-072 to B-075 are critical.
- **2026-11-23, 0.99.6 (nightly)** — rotation: the 11-22 run ended with **kit**
  and said tomorrow carries on with **exercises**, **database**, **stats**.
  Tonight **database** (storage, `storeGet` / `storePut` fallback, `mergeSync`,
  Drive calls, `save` / `flush`) and **stats** (standards and ranks, recovery
  `fatigueMap`, weekly sets, skins, `historyFor` / `statsFor`, PR engine,
  plausibility, goals, analytics page) were read in full; **exercises** lines
  158 to 560 were read (catalogue, leaf keys, load convention, holds, strongman
  shapes and their records) and the rest (names and icons, the demo engine,
  muscle table, custom movements) only skimmed by function. No js file has
  changed on main since the 11-22 run, so there was no diff to add. Carries on
  next with **ai**, **loading**, **training**. Checks: check-version,
  lint-scope, validate-exercises, validate-mobility and module-map --check
  (TypeScript 5.6.3 in a scratch folder) pass; smoke 56/56, no page errors
  (headless Chromium). The click-through of every page beyond smoke's views was
  not done. Not logged, noted: `fatigueMap`'s `woTime` falls back to noon on the
  session's date for a completed session with no `start` or `end` (a CSV
  import), so one dated today is left out of the recovery map until after noon
  (probed: a no-time session today, read at 08:00, gives an empty map); the
  skin import file input is not cleared, so choosing the same file twice does
  nothing. The repo was already cloned here and `add_repo` was not offered, so
  the existing checkout was used. This entry went onto the open nightly PR
  rather than a new one.
  New: none.

- **2026-11-22, 0.99.6 (nightly)** — rotation: the 11-21 run ended with vbt and
  said tomorrow wraps to **core**, **state**, **kit**; all three were read in
  full (core: units, e1RM, DOTS, bodyweight, profile, formatters, sound and
  wake lock; state: the defaults and `setState`; kit: modals and `closeAllModals`,
  `confirmDlg`, a11y pass, `chart` / `chartMulti`, router state, debug trace,
  clip helpers). Also every js file changed on main since the last sweep, which is
  the 0.99.6 fix commit: ai (`claudeParse`), events (meet edit, meet day,
  strongman), exercises, loading (`toKgSnap`), training (`backfillPlanned`), ui
  (Home bodyweight) and vbt (`openBarPath`). Carries on next with **exercises**,
  **database**, **stats**. Checks: check-version, lint-scope, validate-exercises,
  validate-mobility and module-map --check (TypeScript 5.6.3 in a scratch folder)
  pass; smoke 56/56, no page errors (headless Chromium). Probes in the page:
  `loadPlates` with a snapped lb inventory at 135 / 225 / 315 lb (B-069); `dw` of
  the snapped plate sizes (B-069); `noteRir("Work up to RPE 8.")` still null (B-059,
  still open, fixed on PR #112). The click-through of every page beyond smoke's
  views was not done. Not logged, noted: `claudeParse` returns a lone object
  instead of the array when a lead-in contains `[...]` and the reply is a
  one-element array (rare). An open PR (#112) already holds fixes for B-038 to
  B-054 and B-059; no open nightly PR existed, so this is a new one.
  New: B-069 to B-071.

- **2026-11-21, 0.99.5 (nightly)** — rotation: the 11-20 run ended with
  **picker** next, so tonight **picker**, **events** and **vbt** were read in
  full (events: meet cards, placing predictor, run-in, meet day, strongman,
  editors; vbt: Measure, bar path from video, depth, load-velocity, calibrate).
  Also read every js change since the last sweep: the 0.99.4 BP reference
  lines (`chartMulti` refs, health BP card) and the 0.99.5 version bump. Tomorrow
  wraps to **core**, then **state**, **kit**. Checks: check-version, lint-scope,
  validate-exercises, validate-mobility and module-map --check (TypeScript 5.6.3
  in a scratch folder) pass; smoke 56/56, no page errors (headless Chromium);
  Home, Calendar, Train, Stats, Health and Events open with no page errors, and
  every events sheet (meet day, run-in, add event, test log, priority, strongman
  editor) opens and closes clean. Probes in the page: meet edit and save with
  run-in blocks (B-065), meet day double save (B-066), lb save of goal and
  attempt weights (B-067). Not logged, noted: the "Lifters in flight" box on
  the meet-day warm-up tab is stored but not used in the clock times;
  `testLog`'s comparator returns -1 for equal dates (it happens to give newest
  first in Chromium). No open nightly PR existed, so this is a new one.
  New: B-065 to B-068.

- **2026-11-20, 0.99.3 (nightly)** — this run again started from a checkout
  without the 11-17 to 11-19 sweeps (`git fetch` showed the open PR #111), so
  it re-read database (Drive merge, Drive calls, save and flush), exercises
  (volume convention, `holdRecords`, `isBefore`, set numbering), stats (ranks,
  hard sets, `statsFor`, PRs, plausibility, goals, `last7`) and the whole
  0.99.3 diff. Both things it found were already listed: `noteRir` with a full
  stop (B-059; probed `"RPE 8."`, `"keep @8."`, `"@1."` → null) and Home's
  `bw7` eight-day window (B-063). Nothing new. Checks: check-version,
  lint-scope, validate-exercises, validate-mobility and module-map --check
  (TypeScript 5.6.3) pass; smoke 56/56, no page errors. The click-through was
  not completed (the Welcome sheet blocks the clicks on a fresh profile).
  Rotation unchanged: tomorrow carries on with **picker**, then **events**,
  **vbt**. New: none.

- **2026-11-19, 0.99.3 (nightly)** — this run started from a checkout that did
  not have the 11-17 and 11-18 sweeps, so it re-read the same ground:
  **database** (line 95 to the end), **exercises**, **stats** and **ai**, plus
  the 0.99.3 diff. The rotation is unchanged: tomorrow carries on with
  **picker**, then **events**, **vbt**. The `noteRir` full-stop bug ("RPE 8.")
  was found again here and is B-059 (already fixed on PR #112), so not
  re-logged. Probes in the page: `claudeParse` with a stubbed fetch (B-062),
  `daysBetween` at −8, −7 and +3 days (B-063). CSV formula guard round trip,
  the storage fallback mark and `holdBeatsSession` read correct. Checks:
  check-version, lint-scope, validate-exercises, validate-mobility and
  module-map --check (TypeScript 5.6.3) pass; smoke 56/56, no page errors.
  The click-through of every page crashed the headless renderer on the first
  taps and was not completed. New: B-062 to B-064.
- **2026-11-18, 0.99.3 (nightly)** — rotation: the 11-17 run stopped at
  stats, so tonight **ai**, **loading** and **training** were read in full
  (ai: key, cap, usage, `aiCall`, `claudeParse`; loading: ramps, plate maths,
  nearest loadable, bars, places and their editor; training: missed sessions,
  programs and backfill, rep ranges, per-side, tempo, autoregulation, event
  types and run-in blocks, load-velocity day and outliers, caliper maths, the
  imbalance card). No js file has changed on main since the 11-16 sweep
  (main's code is still 0.99.3; the fixes are on the open PRs #110 and #112,
  which were not reviewed). Tomorrow carries on with **picker**, then
  **events**, **vbt**. Checks: check-version, lint-scope, validate-exercises,
  validate-mobility and module-map --check (TypeScript 5.6.3 in a scratch
  folder) pass; smoke 56/56, no page errors (headless Chromium); a click
  through Home, Calendar, Train, Stats and Health and the first tabs on each
  gave no page errors. Probes in the page: backfill of a hold-only and a
  carry-only session (B-060), and the lb round trip of a bar and plates
  (B-061). Not logged, noted: the first week of a weekday-laid program
  starting mid-week puts later days before earlier ones (documented "first
  such weekday on or after the start"); `removeProgram` keeps
  `S.programStarts[id]`, so a reinstall without a date reuses the old start.
  New: B-060, B-061.
- **2026-11-17, 0.99.3 (nightly)** — rotation: the 11-16 run stopped at
  database line 140, so tonight the **rest of database** (Drive calls, merge,
  save / flush, backup nudge), **exercises** (muscle shares, `leafMuscles`,
  option lists, leaf and set helpers; the demo-drawing code and the bundled
  catalogue data were not read) and **stats** (standards, recovery,
  weekly sets, `statsFor`, PRs, plausibility, goals) were read. Also read every
  js change since the last sweep: the 0.99.3 fixes B-028 to B-037 (`confirmDlg`,
  Profile cancel, Welcome unit switch, bodyweight clamp, modifier picker,
  storage fallback, hold toast, `noteRir`, last-7 tiles). Tomorrow carries on
  with **ai**, then **loading**, **training**. Checks: check-version,
  lint-scope, validate-exercises, validate-mobility and module-map --check
  (TypeScript 5.6.3 in a scratch folder) pass; smoke 56/56, no page errors
  (headless Chromium). The click-through of every page was not run tonight.
  Probes: all 283 catalogue movements give muscle shares that sum to 1, except
  hip adduction and five neck movements, which have none (the map has no such
  muscle, so they never count toward weekly sets or recovery; not logged as a
  bug); every STD lift has hand-set shares. Not logged, noted: `fatigueMap`
  drops a completed session that has no start/end time and is dated today
  before 12:00 (`woTime` falls back to noon). New: B-059.
- **2026-11-16, 0.99.3 — maths audit** — every formula that tells a lifter
  what to lift or how they rank, against its source, with numeric probes run
  on the shipped modules in Node: e1RM, autoregulation, PRs, bar speed, the
  goal projection on the unmerged PR #86, DOTS / IPF GL, the standards table,
  the fitting test, calipers, FFMI, TDEE and heart-rate zones. Matched their
  sources: DOTS, IPF GL, Jackson–Pollock 3 and 7, Durnin–Womersley, Siri,
  Mifflin-St Jeor, Katch–McArdle, Butt, normalised FFMI, Tanaka, Karvonen,
  the balance norms, the load-velocity fit and the projection's least squares.
  No Wilks in the app. New: B-038 to B-058 (seven sev 2, thirteen sev 3, one
  for the owner; B-058 decided the same day). Nothing fixed. Detail: `r&d/notes/maths-audit-2026-11.md`.
- **2026-11-16, 0.99.1 (nightly)** — rotation: kit's remainder, exercises and
  database were due; tonight **database** (storage section) was read in
  depth, plus movement again (modifier picker). Stopped at: database line 140,
  so tomorrow carries on with the rest of database, then exercises, stats.
  Also re-read the 0.99.1 diff (DOTS clamp, `yearAge`, meet tie-break and
  placing delta); probes in the page gave the intended numbers (Junior at the
  year you turn 19 to 23, women's DOTS flat above 150 kg). Checks:
  check-version, lint-scope, validate-exercises, validate-mobility and
  module-map --check (TypeScript 5) pass; smoke 56/56, no page errors. The
  click-through of every page timed out in this run and was not completed.
  New: B-035 to B-037.
- **2026-11-15, 0.99.1 (nightly)** — rotation wraps: main was last night's
  stop, so tonight **state** and **kit** read for logic (nothing new in either;
  `chartMulti` draws a flipped axis if every value is the same negative
  number, but no real series is negative). Also re-read movement and ui
  (Home, update check, What's new, Profile) and main's boot and rescue path;
  B-029 reproduced independently by pressing Escape on the Profile sheet.
  Stopped at: kit (first 200 lines in depth), so tomorrow carries on with the
  rest of kit, then exercises, database. Checks: check-version, lint-scope,
  validate-exercises, validate-mobility and module-map --check (TypeScript 5)
  pass; smoke 56/56, no page errors (headless Chromium). Click-through of
  every page not run tonight. New: B-033, B-034.
- **2026-11-14, 0.99.1 (nightly)** — rotation stopped at **main** (core, kit,
  loading, training, stats, io, sync, rest, workout, coach, health were done on
  11-13; tonight movement, ui, main, so tomorrow wraps to **state**). Also read
  the whole 0.98.3 to 0.99.1 diff for every js file changed since the last
  sweep (the B-001 to B-021 fixes) and the callers of the new `dismissModal`,
  `closeAllModals({quiet})`, `entryVolume`, `noteRir`, `yearAge` and
  `openAxisPickerFor`. Checks: check-version, lint-scope, validate-exercises,
  validate-mobility all pass; module-map --check passes (needs TypeScript 5 —
  the 7.x that `npm install typescript` pulls now has no `ScriptTarget` and
  the tool throws; installed 5.6.3 in a scratch folder); smoke 56/56 with no
  page errors; each of the five pages opens with no page errors. One
  automated click-everything loop had the headless renderer crash once; it did
  not repeat per click or per page, so not logged. Probes behind B-028, B-029,
  B-030 and B-032 are in their entries. New: B-028 to B-032 (numbered after
  B-022 to B-027, which are taken by the security pass).
- **2026-11-13, 0.99.1 — security and privacy** — 266 script-injection payloads
  written into every user text field (sessions, notes, goals, events, custom
  exercises, places, plans, coach notes), then smoke 56/56 plus every
  session, goal, event and movement screen opened: nothing ran, 48 showed as
  plain text. Coach replies go in as textContent. Network: only the app's own
  files, api.anthropic.com, Google Drive and Google sign-in; no trackers or
  CDNs. Drive token in memory only, revoked on disconnect, drive.file scope.
  Erase everything clears IDB (photos, clips, undo copy) and localStorage.
  No secrets in the current tree. New: B-022 to B-027. Detail:
  `r&d/notes/security-audit-2026-11.md`.
- **2026-11-13, 0.98.3** — module by module after the E17 split: core, kit,
  loading, training, stats, io, sync, rest, workout, coach, health read for
  logic; module-map --check, lint-scope, eslint, check-version and validators
  pass (B-003 still); smoke 56/56; monkey clicker 4 configs × 1200–1500 random
  actions, 0 errors, no NaN on screen; full click-through on empty, migrated kg,
  migrated lb and program installs in both skins (757–759 clicks each), no new
  errors; scripted mixed session to cross-check volume. New: B-010 to B-021.
  Nothing fixed in this pass.
- **2026-11-12, 0.97.0** — checks and tools all pass except the known B-003;
  smoke test 55/55 on empty and migrated installs; click-through of every
  page (276 + 742 clicks), no new errors beyond B-001; CSV round trip shows
  only B-002. Read line by line: events and meet day, calculators and AI key,
  caliper/body-comp, BP and glucose bands, cardio zone control loop, fitting
  test scoring, core helpers. Formulas checked against sources: DOTS, IPF GL,
  Jackson–Pollock 3/7, Durnin–Womersley, Siri, Katch–McArdle, Casey Butt,
  normalised FFMI, Tanaka, Karvonen. New: B-005 to B-009.

## Fixed

Most recent first: `- B-000 · title — 0.00.0`

- B-263 · `build-program.py` crashes: the old program.json it reads has no `priority` — 0.100.7 (not applicable: the builder and program.json left the repo; the app ships no program)
- B-027 · Public repo held personal training and health details — 0.100.5 (app wording made generic, names removed, personal files moved out of the repo; git history rewritten afterwards)
- B-240 · Plan import: AM / PM order is lost when another day sits between the two sessions in the list — 0.100.4
- B-238 · Voice logging: a reply with a sentence after the JSON is thrown away — 0.100.4
- B-237 · Plan writer: a reply that takes over 90 s is reported as offline and not counted against the cap — 0.100.4
- B-236 · The 90 s AI timeout stops once the reply's headers arrive, so a stalled reply body never times out — 0.100.4
- B-232 · Plan import: a warm-up whose drills are all unknown installs as the 30-minute stretch routine — 0.100.4
- B-206 · Bring in a plan: "Check the plan" opens after the sheet was closed while Claude was writing — 0.100.4
- B-205 · Coach: "Make next week lighter" leaves sets with no target RIR at the usual effort — 0.100.4
- B-204 · Coach tells lb lifters to add 2.5 kg — 0.100.4
- B-203 · Coach: "should I change my bench to a lighter weight?" is treated as an exercise swap — 0.100.4
- B-202 · Coach: "when did I last do leg press" answers about legs in general — 0.100.4
- B-201 · Coach: "1h" and "1hr" are not read as an hour — 0.100.4
- B-200 · Coach: "Hey, should I deload?" is answered as a greeting — 0.100.4
- B-193 · Coach "why has it stalled" escapes the lift name twice — 0.100.4
- B-188 · Coach: Forget everything also drops the accepted plan's link to its calendar program — 0.100.4
- B-187 · Coach: Change my answers → plan choice does not bring in or drop the plan, and "Build my plan" then overwrites it — 0.100.4
- B-186 · Coach: "Your volume" and "weak spots" never list a muscle with no sets this week — 0.100.4
- B-180 · Coach: a Tailor reply that arrives after the sheet was closed and reopened is applied to the new plan — 0.100.4
- B-179 · Coach: swapping an exercise leaves the partner's "superset with" note and its own variant label stale, and saves them — 0.100.4
- B-178 · Coach greeting says "week 9 of 8" once a plan has run its length — 0.100.4
- B-177 · Coach: the grip flag drops calves on a 60 or 90 minute full-body day, though the change list says they stay in — 0.100.4
- B-215 · Backfill logs unweighted lifts at 0 kg when the same session has a weighted one — 0.100.4
- B-196 · Settings says bodyweight is never sent to Anthropic, but a typed coach question sends this week's and last week's average weigh-in — 0.100.4
- B-192 · Repeating a session keeps the old AUTO target on each exercise — 0.100.4
- B-191 · A typed RIR outside 0–10 is stored as an impossible RPE — 0.100.4
- B-190 · Calendar month header counts mobility days as sessions — 0.100.4
- B-172 · Double-tapping Log a set starts two speech recognisers — 0.100.4
- B-185 · Voice logging: "225 by 5" with an exercise already open does not use that exercise — 0.100.4
- B-184 · Voice logging: "pounds" and "kilos" after a spelled-out weight are ignored — 0.100.4
- B-183 · Voice-logged set: the confirmation toast shows the stored RPE as "@ 8" when you said 2 RIR — 0.100.4
- B-171 · Voice-logged set's toast names the exercise you asked for, not the one it was logged under — 0.100.4
- B-170 · Voice-logged set decides the PR star without bodyweight — 0.100.4
- B-169 · Voice-logged set creates a second card for an exercise with chains, bands, equipped or a time cap — 0.100.4
- B-168 · Remove exercise deletes ticked sets with no confirmation — 0.100.4
- B-189 · A bodyweight set reads "0kg × 8" on the calendar card and the session summary — 0.100.4
- B-167 · Calendar entry headline picks a different best set from the PR and the summary — 0.100.4
- B-166 · Repeat on a program day copies `prog`, so the program counts the repeat as another day done — 0.100.4
- B-165 · Closing the Session complete sheet with ✕, Escape or the backdrop leaves the live session on screen; Finish then throws — 0.100.4
- B-164 · Plan workout: a fractional Sets count throws and Save plan does nothing — 0.100.4
- B-229 · Repeat on a lift with warm-up or finisher add-ons saves them as already done, with last time's numbers — 0.100.4
- B-225 · Stale comment above the plate maths says greedy is always optimal — 0.100.4
- B-224 · Movement page History stops at 40 sessions without saying — 0.100.4
- B-223 · Movement page Info tab marks no equipment for a variant on unlisted equipment — 0.100.4
- B-222 · Single-lift event forgets a chosen variant's execution or attachment — 0.100.4
- B-220 · Para event in lb: typed attempts always warn "Para attempts are whole kilograms" — 0.100.4
- B-219 · Warm-up sheet's Bar box: clearing it saves a "20" bar as your usual one, and a bar that isn't in your list is forgotten — 0.100.4
- B-218 · A lb lifter who hasn't listed plates gets a kg plate set: 135, 225 and 315 lb are "Not loadable" — 0.100.4
- B-207 · Plate inventory accepts fractions of a pair, and the plate maths loads half a plate — 0.100.4
- B-199 · The Backfill note says backfilled sessions can't set a PR; by default they do — 0.100.4
- B-198 · Bar path: Back during "Looking for the plate" is overridden when the search finishes — 0.100.4
- B-197 · Closing Measure with ✕ or a backdrop tap mid-set leaves the motion sensor recording — 0.100.4
- B-231 · "Done as planned" on an interval add-on records 0:00 — 0.100.4
- B-181 · Thomas test and the overhead squat tests always save a result, even for a side or test you skipped — 0.100.4
- B-182 · A lift goal with no name is named with the raw exercise key — 0.100.4
- B-176 · lb users: opening and saving a check-in or goal changes the stored kg — 0.100.4
- B-175 · Glucose targets typed in mg/dL come back different — 0.100.4
- B-174 · A future-dated blood pressure, glucose or mobility-test reading becomes "Latest" while the averages ignore it — 0.100.4
- B-230 · Planned stretch: tick, untick, tick again leaves the plan on the calendar and the done session outside the program — 0.100.4
- B-173 · Mobility sheet reads "22 / 22" and Done today while stretches are unticked, after a protected joint turns items into skips — 0.100.4
- B-217 · Warm-up sheet shows a 90 s rest as 2:30 — 0.100.4
- B-216 · A "+" weight class with "kg" on it is treated as an upper limit — 0.100.4
- B-214 · Saving the meet form untouched replaces your planned openers and seconds with the worked-out ones — 0.100.4
- B-195 · Bar path: closing the sheet while the camera is still opening leaves the camera on and the screen awake — 0.100.4
- B-242 · Comments say an update waits for the next launch; it is applied about 1.4 s after download when the app is idle — 0.100.4
- B-241 · Home "Backup now" says Synced when it did nothing because a sync was already running — 0.100.4
- B-239 · `validate-exercises.js` crashes on the current program file — 0.100.4
- B-212 · Stale comments and an unused function in exercises.js and vbt.js — 0.100.4
- B-211 · Debug "how?" for rep ranges prints a 2.5 step in lb, where the app steps 5 lb — 0.100.4
- B-210 · Debug "how?" for bar speed still uses the old velocity-loss rule and reports a mismatch — 0.100.4
- B-209 · Debug "how?" for DOTS prints a sum that does not work out in lb — 0.100.4
- B-221 · A rest time in a note ("@ 4 min") is read as the target effort — 0.100.4
- B-208 · lb users: saving the Profile or passing the welcome step untouched changes the stored bodyweight — 0.100.4
- B-235 · Sync now says "2 sessions came in" after you delete two sessions — 0.100.4
- B-233 · An update applied from one window reloads another window that has a sheet open — 0.100.4
- B-243 · A log set aside by the rescue screen or a migration can't be got back from inside the app — 0.100.4
- B-234 · A second rescue, or a migration run again, overwrites the earlier set-aside copy — 0.100.4
- B-213 · After Erase all, Events can't see your priority lifts, and saving Priority lifts untouched sets all three to Biceps Curl — 0.100.4
- B-194 · A plan note like "no bands" or "raw, unequipped" puts the lift on a separate PR line; "brace hard" tags it Prosthesis / orthosis — 0.100.4
- B-228 · Importing a backup while a Drive sync is running removes the missing sessions from Drive and other phones, without asking — 0.100.4
- B-163 · Stale and misleading comments and API notes — 0.100.3
- B-162 · Saving a 21st interval preset drops the oldest without saying — 0.100.3
- B-161 · Sync tombstones are never pruned, so the Drive file grows with every deletion — 0.100.3
- B-160 · A CSV "Duration (min)" of 300 or more is read as seconds — 0.100.3
- B-159 · Re-recording today's clip deletes the old one before the new index is saved — 0.100.3
- B-158 · The Body tab treats a future-dated check-in as your latest weight — 0.100.3
- B-157 · Cardio summary keeps a typed machine distance after the box is cleared — 0.100.3
- B-156 · A muscle's "This week" breakdown includes sessions dated after this week — 0.100.3
- B-155 · A bodyweight goal reads 900% when there is no weigh-in — 0.100.3
- B-154 · Tools' DOTS / IPF GL sheet fills in a partial total when a priority lift is untested — 0.100.3
- B-153 · Calendar stays on yesterday when the app is left open past midnight — 0.100.3
- B-152 · Help's "How do I log faster?" describes the − / + bar and Copy down, which are switched off — 0.100.3
- B-151 · A coach change made before the first save of a session isn't stamped for sync — 0.100.3
- B-150 · Drive sync keeps this phone's program start dates, aliases and program names even when the other phone changed them — 0.100.3
- B-149 · Erase all and Undo import leave a localStorage copy of the undo snapshot — 0.100.3
- B-148 · "Remove imported sessions" brings back backfills you've cleared since — 0.100.3
- B-147 · "Unrecognised exercises" clean-up deletes custom movements used by goals or priority lifts — 0.100.3
- B-146 · Liftoff and CSV import default to Kilograms for a log kept in pounds — 0.100.3
- B-145 · A backup import whose migration fails says "nothing was changed", but the log has already been replaced in memory — 0.100.3
- B-071 · A check-in dated ahead becomes the "current" bodyweight in DOTS, plate targets and TDEE — 0.100.3
- B-070 · Meet day "Save results" again with every attempt cleared drops the earlier test session and leaves "saved" on — 0.100.3
- B-144 · Daily clip: closing the sheet while the camera permission prompt is open leaves the camera on — 0.100.3
- B-143 · Drive sync: deleting your last session (or removing every import) brings them all back — 0.100.3
- B-142 · Importing a backup onto a phone with no sessions replaces goals, meets and settings without asking, and with no undo — 0.100.3
- B-141 · Recovery map: "Light" and "Recovering" look the same, and the darkest shade never shows — 0.100.3
- B-069 · lb lifters: the 0.99.6 plate snap makes ordinary weights "Not loadable" and shows plates as 10.01 lb, 2.49 lb — 0.100.3
- B-227 · "Start with an empty log" while storage is failing overwrites the real log once storage comes back — 0.100.2
- B-226 · Closing the cardio "Session complete" sheet with ✕ in the middle of a lift leaves the cardio screen up, and its Discard deletes the lift's logged sets — 0.100.2
- B-056 · PR #86 (not merged): the projection's date range is narrower than it reads — closed with PR #86 (not merged; parked as roadmap P9, fix when rebuilt)
- B-055 · PR #86 (not merged): goal projection measures the gap from the wrong number — closed with PR #86 (not merged; parked as roadmap P9, fix when rebuilt)
- B-059 · A note's "RPE 8." or "@8." with a full stop after the number is not read as a target RIR — 0.99.8
- B-054 · `loadFor` doesn't cap the reserve at 5 as `e1rm` does — 0.99.8
- B-053 · Meet attempts for a lb user round to 5 lb, not 2.5 kg — 0.99.8
- B-052 · Jackson–Pollock body fat goes down as skinfolds go up past the equation's range — 0.99.8 (held at the turning point and flagged)
- B-051 · Rankings and "best" count backfilled sets, and the comment says they don't — 0.99.8 (comment corrected; EST chip when the best set is a backfill)
- B-050 · A hold that is heavier and longer than an old record is not a PR if a heavier hold exists — 0.99.8
- B-049 · Bar speed uses two different "velocity loss" figures — 0.99.8 (fastest of the first three reps → last, in the card, the estimate and calibration (`vbtLoss`))
- B-048 · Target RIR from a note: common spellings missed, tempo and pause read as RIR — 0.99.8 ("rpe 9-10" still reads RIR 1, on purpose)
- B-047 · Autoregulated targets round to 2.5 kg whatever the place can load — 0.99.8 (snaps to the lifter's own plate list only; the built-in list is unchanged)
- B-046 · Set-to-set adjustment can't move a light set, and overshoots its 7.5% cap just above that — 0.99.8 (the cap, or one plate step when a step is bigger)
- B-045 · The same lift entered twice in a session gives two PR rows — 0.99.8
- B-044 · Assisted pull-up on a machine: more assistance reads as a PR — 0.99.8 (estimate runs on bodyweight − help; needs a bodyweight on file)
- B-043 · Weighted pull-ups and dips: e1RM, PRs and targets use the added weight alone — 0.99.8 (estimate runs on bodyweight + added (`bodyLoad`, `recOf`); these lifts are left out of autoregulation)
- B-042 · Bar-speed RIR says "6+" on a set that ended below the lifter's own failure speed — 0.99.8 (RIR 0–1, shown not filled)
- B-041 · TDEE tool treats a blank age as age 0 — 0.99.8
- B-040 · Rankings judge dumbbell lifts on the barbell row, and half the standards table is unreachable — 0.99.8 (`stdRowFor` maps the leaf to a row; 37 of 47 rows reachable; high-handle trap bar ÷ 1.15)
- B-039 · More reps at the same weight is not a PR past 12 reps — 0.99.8 (ties on e1RM go to the set worth more reps (`recGt`))
- B-038 · Autoregulation can't move a set once reps + RIR reach 12 — 0.99.8 (planning counts reps + RIR to 30 (`e1plan`, `loadFor`); records keep 12)
- B-058 · A lighter, easier set can be a PR — 0.99.8 (records count at most 2 RIR: `e1pr`)
- B-137 · Tilt-corrected bar speed mixes corrected and uncorrected samples — 0.99.7
- B-135 · Bar path "Show another" can paint and bind the previous candidate — 0.99.7
- B-134 · Bar path: Stop then "That's it" quickly can leave two tracking loops running — 0.99.7
- B-133 · Saving a bar-path video: if playback fails, the recorder keeps running — 0.99.7
- B-132 · Bar path from video doesn't drop part-reps the way live Measure does — 0.99.7
- B-131 · Bar speed stores the limit speed from a different measure than the rep speeds — 0.99.7
- B-130 · Session "Hard / Moderate / Light" reads one step easy when no set has an RIR — 0.99.7
- B-129 · Any failed body-map skin load switches your chosen skin to Template and saves it — 0.99.7
- B-128 · Mobility test: the tilt listener leaks if the sheet closes during the iOS permission prompt — 0.99.7
- B-127 · Mobility guide: Skip after Pause leaves the button reading "Resume" — 0.99.7
- B-126 · Interval setup: a field below its limit keeps what was typed while the summary shows the clamped value — 0.99.7
- B-125 · Cardio setup accepts a heart-rate ceiling inside the zone — 0.99.7
- B-124 · Heart-rate trend is fitted over 60 s, but the screen says 90 s — 0.99.7
- B-123 · Body measurements drift for lb users each time the sheet is saved — 0.99.7
- B-122 · Modifier sheet nudges chain and band weights on Done — 0.99.7
- B-121 · An imported AMRAP set with no reps prints "× null" — 0.99.7
- B-120 · Muscle shares from the exercise database don't add up to 1 — 0.99.7
- B-119 · A save that fails in `flush` isn't retried — 0.99.7
- B-118 · Storage failure is only reported once per app load — 0.99.7
- B-117 · Generic CSV import: a "time" column holding clock times turns lifts into holds — 0.99.7
- B-116 · Import: an exercise done in two blocks keeps only the first block's notes — 0.99.7
- B-115 · Windows 98 skin adds another document click listener each time it's switched on — 0.99.7
- B-114 · "Count estimated PRs" in Settings isn't saved if the sheet is closed with ✕ — 0.99.7
- B-113 · "Update ready — restarting" can be shown and then the app doesn't restart — 0.99.7
- B-112 · Settings: emptying the bar or plate list and saving brings the old list back — 0.99.7
- B-111 · The AI spend cap can be passed by calls running at the same time — 0.99.7
- B-110 · An AI call that stalls leaves its spinner or disabled button up — 0.99.7
- B-109 · Training report counts cardio sessions as training sessions — 0.99.7
- B-108 · Coach answers about the wrong lift when a short word matches ("leg press" → overhead press) — 0.99.7
- B-107 · Coach's +1 set for a lagging pattern applies only in A weeks — 0.99.7
- B-106 · Coach reads "I've only got 1 hour" as 1 minute — 0.99.7
- B-105 · Coach: a lift question containing "show" gets the event answer — 0.99.7
- B-104 · Coach "yes" does nothing after an answer whose first chip is an action — 0.99.7
- B-103 · Planner nudges planned weights off their kg values for lb users — 0.99.7
- B-102 · Session summary's gold "top set" ignores RIR; the PR beside it doesn't — 0.99.7
- B-101 · A planned session can still be skipped or moved while it's the live session — 0.99.7
- B-100 · Voice: a number word in the exercise name is read as the weight — 0.99.7
- B-099 · Voice: "100 and a half" reads as 100 — 0.99.7
- B-098 · Set boxes accept negative weights and fractional reps — 0.99.7
- B-097 · Voice PR toast ignores earlier sets in the same session — 0.99.7
- B-096 · Warm-up sheet on a non-barbell lift saves its Bar box as the barbell default — 0.99.7
- B-095 · Repeat a mobility session opens an empty lift session that can only be discarded — 0.99.7
- B-094 · Repeat a session copies last time's bar-speed readings onto the new sets — 0.99.7
- B-093 · Interval cardio stopped during a rest or cool-down logs one round too few — 0.99.7
- B-092 · Bodyweight "30 days" and "/ 7 d" change can compare against a weigh-in months old — 0.99.7
- B-091 · Custom movements whose names have no Latin letters all share one id — 0.99.7
- B-090 · Import with a per-row unit column: tapping Pounds converts the weights a second time — 0.99.7
- B-089 · CSV import: a quote inside an unquoted field swallows the rest of the file — 0.99.7
- B-088 · Boot rescue "Start with an empty log" loops when a localStorage fallback copy exists — 0.99.7
- B-087 · Coach's points answer counts a priority lift you've never logged as 0 kg, without saying — 0.99.7
- B-086 · Repeat a cardio session: the clock reads NaN and no heart rate is recorded — 0.99.7
- B-085 · Editing a session: converting an exercise to Hold, then saving, deletes the exercise — 0.99.7
- B-084 · Dumbbell, cable and machine warm-ups get a 20 kg "bar" step — 0.99.7
- B-083 · Muscle map and muscle-group ranks are one tier higher than the lift ranks — 0.99.7
- B-082 · Mobility swaps keep the original hold time, so a rep-based swap runs as many long holds — 0.99.7
- B-081 · Repeat a session carries over last time's RIR in every box — 0.99.7
- B-080 · "− Set" removes the last set even when it's ticked, with no confirm — 0.99.7
- B-079 · Voice: "squat" or "bench" attaches to whichever squat or bench is already in the session, marked sure — 0.99.7
- B-078 · Voice card names the exercise, but "Log set" says "Pick the exercise first" — 0.99.7
- B-077 · Voice logging fails silently once the session has any exercise — 0.99.7
- B-076 · Settings: switching kg ↔ lb and saving reads the plate, bar and collar boxes in the new unit — 0.99.7
- B-075 · Drive sync never merges coach memory: the local copy always wins — 0.99.7
- B-074 · "Remove imported sessions" also deletes custom exercises that haven't been logged yet — 0.99.7
- B-073 · "Unrecognised exercises" and "Zero-rep sets" clean-ups delete every mobility session and all custom movements — 0.99.7
- B-072 · Removing a program, or replacing it with a coach plan, deletes its meets, past ones included — 0.99.7
- B-068 · Bar path from video names the last weighted set's load, but the result attaches to the next unfinished set — 0.99.6
- B-067 · Lifters on lb: saving an event nudges goal, attempt and target weights off their kg values — 0.99.6
- B-066 · "Save results as tested singles" can be pressed again and logs the meet twice — 0.99.6
- B-065 · Editing a meet and pressing Save throws away its run-in blocks — 0.99.6
- B-064 · The doc comment for `holdRecords` sits above `isBefore`, not above the function — 0.99.6
- B-063 · Home's "/ 7d" bodyweight change uses an 8-day window and counts future check-ins — 0.99.6
- B-062 · `claudeParse` fails when Claude's lead-in sentence contains a "[" — 0.99.6
- B-061 · Lifters on lb: opening the warm-up sheet or saving a place nudges bar and plate weights off their kg values — 0.99.6
- B-060 · Backfilling planned sessions turns holds and carries into empty "completed" sessions — 0.99.6
- B-037 · Modifier picker's Cancel still keeps the adopted tempo — 0.99.3
- B-036 · `idb()` reports a write as done before the transaction commits — 0.99.3
- B-035 · A save that fell back to localStorage is ignored on the next open — 0.99.3
- B-034 · Profile accepts a negative bodyweight — 0.99.3
- B-033 · Home's "last 7 days" tiles cover eight days — 0.99.3
- B-032 · Welcome: switching units after Back leaves the old number — 0.99.3
- B-031 · "Best hold" toast repeats for a shorter hold later in the session — 0.99.3
- B-030 · "@1" / "@2" notes no longer read as target RIR — 0.99.3
- B-029 · Profile edits stick when closed with ✕, backdrop or Escape — 0.99.3
- B-028 · Cancel on a confirm with `onNo` also closes the sheet beneath it — 0.99.3
- B-025 · CSV export cells starting = + - @ run as formulas in Excel / Sheets — 0.99.2
- B-024 · No notice of what each AI feature sends to Anthropic — 0.99.2
- B-023 · AI key note says "sent nowhere but Anthropic" while Drive backup can include it — 0.99.2
- B-022 · No Content-Security-Policy: one missed esc() could send the log or AI key anywhere — 0.99.2
- B-009 · "Moved X places" can say no change after two tests on one day — 0.99.1
- B-008 · Meet placing: ties don't go to the lighter lifter — 0.99.1
- B-007 · Caliper preview shows a body-fat % with no age entered — 0.99.1
- B-006 · IPF age category goes by birthday, not calendar year — 0.99.1
- B-005 · DOTS for women over 150 kg bodyweight is too high — 0.99.1
- B-004 · VBT sim tools fail on a Windows CRLF checkout — 0.99.1
- B-003 · Exercise validator has seven checks for the old 77-week program — 0.99.1
- B-002 · CSV round trip drops extra leaf keys on an exercise with no sets — 0.99.1
- B-021 · Thousands separator read as a decimal — 0.99.0
- B-020 · Time fields accept 1:75 — 0.99.0
- B-019 · Coach plate answer assumes a 20 kg bar — 0.99.0
- B-018 · Rest ±15 s lands on the wrong exercise after reordering — 0.99.0
- B-017 · Live PR toast repeats for a lighter later set — 0.99.0
- B-016 · "Looks like a lb figure" on an ordinary dumbbell jump — 0.99.0
- B-015 · "Beyond any recorded lift" fires on real loads over 500 kg — 0.99.0
- B-014 · "@8" in a note is read as RIR 8 — 0.99.0
- B-013 · Cambered bar and Swiss bar get no plate maths — 0.99.0
- B-012 · No way to change equipment or handles on a logged entry — 0.99.0
- B-011 · Escape and closeAllModals skip a modal's onClose — 0.99.0
- B-010 · Session volume counts one side of a per-side lift — 0.99.0
- B-001 · Closing the coach straight after a message throws — 0.99.0
- Everything from the November sweep up to 0.96.5 — see
  `r&d/notes/bug-sweep-2026-11.md`.
