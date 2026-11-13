# Module split

`index.html` was one 1.59 MB file. It is now a 5.9 kB shell that loads native
ES modules from `js/`. Pure refactor: no behaviour change, no stored-data
change, no build step. Branch `refactor/modules`, cut from main at `54ce89b`
(0.96.5, `ironlog-v163`), 12 Nov 2026.

**Status: done on the branch, in a PR, not merged.** Every step below is
ticked. What is left is for a person: a look on a real phone (sensors, camera,
bar path, the update prompt from an installed 0.96.5), and the merge.

The first half of this file is how it ended. From "Baseline" down it is the
plan as it was written before any code moved, kept because it explains why
things are where they are; line numbers there are `index.html` at `54ce89b`.

## Untangle (0.98.1, 13 Nov 2026)

The split left one knot: every file but `data.js` and `main.js` sat in a
single import cycle, `core.js` included (it read `S` from `database.js`), and
every feature imported `ui.js` for `toast`, `modal` and `render`, while `ui.js`
imported every feature. Phase 1 of ROADMAP E17 cut the layers out of it.
Pure moves, no behaviour change; `module-map.cjs --sync` wrote every import.

- **`js/state.js`** (new): `DEFAULT_STATE`, `S`, `setState` — out of
  `database.js`. Imports nothing. `database.js`'s three `S = …` became
  `setState(…)`.
- **`js/kit.js`** (new): from `ui.js` — `selectOnFocus`, `a11yPass` and its
  observer, `toast`, the modal stack, `confirmDlg`, `bar`, `chart`,
  `chartMulti`, `SERIES_COLORS`; the router state (`page`, `calCursor`,
  `calSelected`, `analytics*`, with setters), `go`, `calSwitch`; debug mode's
  `debugOn`, `why`, `trace`, `traceText`, `openWhy`, `copyText`,
  `cardioWhyLast`; the What's-new flags; `DISCLAIMER` and `FAQ`.
  `render()` and `applySkin()` are hooks (`shell`) that `ui.js` fills in at
  load with `renderPage` and `drawSkin`. `WHY` is a registry in the kit that
  `ui.js` fills with its explainers.
- **`js/core.js`** now imports only `state.js`, and took the pure helpers
  that lived in features: `addDaysISO`, `LB_PER_KG`, `fmtSec`, `parseTime`,
  `fmtM`, `capLabel`, `median`, `lenU`, `dlen`, `toCm`, `checkinFor`, `setLine`.

| | before | after |
|---|---|---|
| modules in the big cycle | 11 (everything but `data`, `main`) | 9 (the features) |
| `state`, `core`, `kit`, `ui` | in the cycle | each its own layer |
| files importing `ui.js` | 11 | 1 (`main.js`) |

Checked: `check-version`, `lint-scope`, `module-map --check`, smoke 56/56,
and `baseline.js` on both seeds against main — the same CSV fingerprints and
the same click signatures (both the 276- and 278-click empty runs occur on
main too; which one you get depends on bug 4.8, the coach closing mid-frame).

### Phases 2–4 (0.98.2)

Same rules, same checks. Four new files, and four more layers out of the knot.

- **`js/loading.js`** (phase 2) — from `workout.js`: warm-up ramps, plates,
  bars, collars, inventory, `loadFor` / `roundLoadFor`, places and kit, and
  the Plates, Ramp and Places sheets.
- **`js/movement.js`** (phase 3) — from `exercises.js`: the movement page,
  the equipment / role / modifier pickers, pain and fatigue notes, the PR-pool
  notice, Check exercise data. Into `exercises.js`: `EX_MUSCLE` (from
  `stats.js`), `sidesText` (from `workout.js`), `priorityKeys`, `shortLift`
  (from `events.js`), `isMainLift`, `HEAVY_BARS` (from `workout.js`).
  `exercises.js` now imports only `core` and `state`.
- **`js/io.js`** and **`js/sync.js`** (phase 4) — from `database.js`: boot
  `load`, clear and erase, the data migrations, every import, both exports and
  import undo (`io.js`, kept in database.js's original order because some of
  its constants are read at load); the Drive sync job, the summary file and the
  sync line (`sync.js`). `database.js` keeps storage, `save` / `flush`, the
  Drive calls and `mergeSync`, and imports only `state`, `core` and `kit`.

| | 0.98.0 | 0.98.1 | 0.98.2 |
|---|---|---|---|
| files in the big cycle | 11 of 13 | 9 of 15 | 9 of 19 |
| layers outside it | — | state, core, kit | + database, exercises, stats, loading |
| `workout.js` lines | 4,335 | 4,335 | 3,776 |
| `exercises.js` lines | 1,942 | 1,942 | 1,487 |
| `database.js` lines | 2,282 | 2,220 | 505 |

Checked: `check-version`, `lint-scope`, `module-map --check`, smoke 56/56,
`baseline.js` both seeds — CSV fingerprints identical to main, click
signatures the same as main's (276 / `7aee7caa81b76aec` empty, 757 /
`7df8355869e4dafd` migrated). Not covered by either test: a real Drive sync
round trip — `driveSync` moved verbatim, but check it on the phone.

### Phase 5 (0.98.3)

Same rules, same checks. Six new files; the cycle is down to the four screens.

- **`js/training.js`** — from `workout.js`: misses, last session and previous
  set, the bar-speed numbers a set carries, session totals and muscles,
  programs and backfill, rep ranges, per-side sets and the imbalance card,
  tempo, autoregulation, rest defaults, `shapeKind`. From `vbt.js`: the
  load-velocity day (`lvDay`, `lvFit`, `mvtFor`, `slewLiftFor`, `LV_SLACK`…)
  and `vbtRirText`. From `events.js`: `EVENT_TYPES`, `BLOCK_KINDS`,
  `activeBlock`. From `health.js`: the body-composition maths (`CAL_METHODS`,
  `caliperCalc`, `measSeries`, `DW_BANDS`, `weightNear`). From `coach.js`:
  `programName`. From `movement.js`: `prPoolMoves`. Also the share-card
  palette `CARD`.
- **`js/picker.js`** — `pickExercise`, from `workout.js`.
- **`js/ai.js`** and **`js/report.js`** — the AI half and the report half of
  `tools.js`.
- **`js/migrate.js`** — the data migrations and `healCustomMovements`, from
  `io.js`, so `sync.js` and `io.js` no longer import each other.
- **`js/rest.js`** — the rest timer, from `workout.js`.
- Smaller moves: video-clip recording and `saveBlob` into `kit.js`;
  `dropFood` into `core.js`; `customMovementFor`, `ensureCustomMovement`,
  `modsFromNote`, `leafForName` into `exercises.js`; Check exercise data into
  `io.js`.

| | 0.98.0 | 0.98.3 |
|---|---|---|
| js files | 13 | 26 |
| files in the cycle | 11 | 4 (`workout`, `health`, `coach`, `movement`) |
| largest file | `workout.js` 4,335 | `health.js` 3,444 (`workout.js` 2,882) |

Checked: `check-version`, `lint-scope`, `module-map --check`, no module
assigns another module's variable, smoke 56/56, `baseline.js` both seeds —
CSV fingerprints identical to main, click signatures main's own (276 /
`7aee7caa81b76aec` empty, 759 / `5dfe044c4c9f28a1` migrated).

**What is left, on purpose:** the four screens open each other — Train opens
the coach and the movement page, the coach installs programs and opens Health,
Health starts sessions. Breaking that would take hooks like the kit's `shell`
for every cross-screen call, more indirection than it is worth. CLAUDE.md
lists the layers; keep new code to them.

## How it ended

| File | Bytes | gzip | What |
|---|--:|--:|---|
| `index.html` | 5,861 | 2,154 | head, the skin script that runs before first paint, body markup, one CSS rule |
| `css/app.css` | 47,437 | 11,891 | base stylesheet |
| `css/skin98.css` | 27,006 | 7,176 | Windows 98 skin |
| `js/main.js` | 12,794 | 5,356 | boot. The entry point |
| `js/core.js` | 11,255 | 4,633 | helpers everything uses |
| `js/data.js` | 1,142 | 632 | reads `program-manifest.json` |
| `js/database.js` | 127,463 | 42,601 | storage, sync, migrations, import and export |
| `js/exercises.js` | 314,163 | 68,736 | library, leaf model, demos, modifiers |
| `js/stats.js` | 65,695 | 21,869 | standards, PRs, weekly sets, muscle map, Stats |
| `js/events.js` | 77,941 | 23,327 | meets, tests, blocks |
| `js/tools.js` | 38,912 | 14,268 | Tools, report, calculators, AI key |
| `js/vbt.js` | 91,199 | 31,292 | Measure, bar path, load-velocity profile |
| `js/health.js` | 238,008 | 72,496 | health, mobility, fitting test, vitals, cardio, body comp |
| `js/coach.js` | 170,524 | 54,642 | the coach |
| `js/workout.js` | 241,592 | 74,312 | calendar, Train, programs, autoregulation, rest timer |
| `js/ui.js` | 128,481 | 41,787 | toast, modal, charts, router, Home, Settings, 98 chrome |
| `slew-reps.js` | 13,435 | 5,770 | rep detection and RIR estimate on Slew (new file, code moved from the app) |
| `program-manifest.json` | 329 | | the shipped program's manifest (was an inline script) |
| **Total of the above** | **1,613,237** | **482,942** | was `index.html` alone: 1,589,430 / 465,020 |
| `slew-core.js`, `slew-video.js` | 28,845 / 17,853 | | unchanged, byte for byte |
| `program.json` | 38,364 | | unchanged |
| `sw.js` | 4,779 | | was 4,190: the precache list grew |

About 24 kB (1.5%) more in total: import blocks, `export` keywords, file
headers and the preload hints. Compressed it is 18 kB more (3.9%), because
sixteen files compress a little worse than one. A first visit makes about 20
requests where it made a handful; after that everything comes from the service
worker's cache as before.

**What changed in the code.** Nothing was rewritten. Each move cut whole
top-level statements out, in their existing order, and pasted them into the
new file. The edits are:

- `export` in front of 489 declarations another file uses, plus the ones only
  the smoke test reaches. Generated.
- An import block at the top of each file. Generated.
- Eight one-line setters, and the nine assignments that now call them:
  `setState`, `setBootFailed`, `setInstallEvt` (database), `setPage`,
  `setWhatsNewArmed`, `setCalSelected`, `setCardioWhyLast` (ui), `setTick`
  (workout). An imported variable can't be assigned to.
- `await loadBundledData();` in `bootApp`, for the program manifest.
- One CSS rule stays inline in `index.html` (see step 14).

**What did not go to plan.**

- `slew-core.js` and `slew-video.js` were going to become modules. They did
  not: the app checks `window.Slew` before offering Measure and loads the
  video tracker on first use, so that a failed load costs one feature and not
  the app. Making them imports would have changed that. They are untouched.
  `r&d/notes/slew-api.md` has the contract.
- The click-through's fingerprint is not as repeatable as first measured. On
  the same build it gives one of two results: 278 clicks
  (`d7184bd0505d7901`) or 276 (`7aee7caa81b76aec`) on an empty install, and
  742 (`4fa1f3242605ca1d`) or 740 (`72f87cea28aef01d`) on the migrated seed.
  The difference is two buttons in Settings that are there or not depending
  on something outside the page's control; main does the same. Every step
  matched one of the two for each seed, and all four were seen on main-equivalent
  code. Not chased further.
- The mover had two bugs, both caught by the checks before a commit: the
  generated import block rode along with the first statement moved, and a
  generated setter was left behind when its variable moved. Fixed in
  `module-map.cjs`.
- `build-program-wdc.py` now writes `program-manifest.json`. Python is not
  installed on the machine this was done on, so that edit has not been run.

**Decisions taken where the brief left a choice** (the questions at the end of
this file; Aaron said go ahead without answering them one by one, so each took
the recommendation given there):

1. "Bundled program data" was read as the program manifest → `program-manifest.json`.
2. The other generated data (exercise database, demos, coach templates,
   routines, the `WHY` text: about 260 kB) stays in its module. Not done.
3. Stylesheets moved out (step 14).
4. One cache bump per commit (v164–v181), one app version at the end (0.97.0).
5. Opening `index.html` from disk no longer works; it has to be served.
6. Ironlog's rep detection sits beside the engine in `slew-reps.js`; not pushed upstream.

**Rules for working in it now** are in `CLAUDE.md`. The short version: run
`module-map.cjs --sync` after adding or moving a top-level name, never use
another module's values at load time, and add every new file to `sw.js`.

---

# The plan, as written before the moves

## Baseline (main at 54ce89b, 12 Nov 2026)

| Check | Result |
|---|---|
| `smoke.js`, seeds `empty`, `migrated`, `program` | 55 of 55 each, no page errors |
| Click-through, empty install (`baseline.js`) | 278 clicks, 0 errors, signature `d7184bd0505d7901`, the same on two runs |
| Click-through, migrated seed | 740–742 clicks. 0 errors on one run; on the other, bug 4.8 (coach closed mid-frame) four times |
| CSV round trip, 36 sessions of the migrated seed | exact, key order aside |
| CSV round trip, fixed 6-session fixture of odd shapes | CSV `063f725ef6769c7b` (3,204 chars, 16 rows), read back `0643e100392e2c29`, one known difference (bug 4.9) |
| `vbt-sim.cjs` | Slew 163/480, Ironlog 453/480 |
| `lint-scope.js` | no undeclared identifiers |
| `check-version.cjs` | 0.96.5 / ironlog-v163 agree |
| `build-demos.cjs --check` | ok, 10 patterns, 57 movements |
| `validate-exercises.js` | 6 checks fail — the stale ones in bug log 4.7, unchanged |
| Main script parsed as a module (`node --check` on a `.mjs` copy) | parses: nothing in it needs sloppy mode |

Clicks per page, empty / migrated: Tools 13 / 13, Profile 6 / 6, Settings
62 / 63, Home 27 / 17, Calendar 41 / 58, Train 12 / 464, Coach 3 / 5,
Stats 21 / 23, Health 93 / 93.

The click-through and the CSV check did not exist as scripts; the sweep on
11 Nov did them by hand. They are now `r&d/tools/baseline.js`, so the same
check runs after every move:

```js
// in the page, on the dev server (node "r&d/tools/serve.mjs")
for (const f of ['smoke', 'baseline']) await fetch(`r&d/tools/${f}.js`).then(r => r.text()).then(t => (0, eval)(t));
await baseline.wipe(); location.reload();        // then load the two scripts again
await baseline({ seeds: ['empty'] });            // wipe + reload again, then ['migrated']
for (const seed of ['empty', 'migrated', 'program']) await smoke({ seed });
```

Wipe before each click-through pass. The service worker serves cached files
first, so without it the page under test is the cached one; and the
click-through presses everything, so a second pass on the same install is a
different pass. The empty-seed signature is repeatable on the same day
(labels can carry the date). The migrated pass has live timers and varies by
a few clicks; compare errors and clicks per page.

Not covered by any of this, same as the sweep: sensors, camera, Bluetooth,
notifications, Google sign-in, and a real phone. Bar path from video and
squat depth load a file on first use (`slew-video.js`, `pose/`), which the
click-through skips. Those need a look on a phone before merge.

### File sizes before

| File | Bytes | gzip |
|---|--:|--:|
| `index.html` | 1,589,430 | 465,020 |
| — of which main script (lines 1433–22199) | 1,510,022 | 445,442 |
| — base stylesheet | 47,225 | 11,764 |
| — Windows 98 stylesheet | 25,956 | 6,781 |
| — head, body markup, the two small scripts | ~5,000 | |
| `slew-core.js` | 28,845 | |
| `slew-video.js` | 17,853 | |
| `program.json` | 38,364 | |
| `sw.js` | 4,190 | |

## What is in index.html

Three inline scripts and one loaded by `src`:

- **Lines 17–27**, in the head: reads the skin from `localStorage` before
  first paint. Stays inline in the shell. It has to run before anything
  renders and a module is deferred.
- **`<script src="slew-core.js">`**: the generated Slew bundle, a global `Slew`.
- **Lines 1424–1432**: `PROGRAM_MANIFEST` and `PROGRAM_NAMES`, generated by
  `build-program-wdc.py`. This is the bundled program data that moves to JSON.
- **Lines 1433–22199**: the app. 1,316 top-level statements: 983 functions,
  272 `const`, 58 `let`, 1 `var`, no classes, 20 statements that run at load.

No inline `onclick=` attributes anywhere (one `onerror="this.remove()"` on
an image, which needs nothing from the app). Nothing reads app names off
`window`. No `eval`, no `new Function`. `this` only appears inside object
methods. So nothing depends on the script being a classic one, except the
test tools (see "Tools").

## Modules

Nine modules from the brief, plus four the code needs: `core` (helpers
everything uses), `vbt` (Ironlog's side of bar speed), `data` (the program
manifest) and `main` (boot). Sizes are the code as it stands.

| Module | Size | Names | Exports | What goes in it (line ranges) |
|---|--:|--:|--:|---|
| `js/core.js` | 8 kB | 36 | 35 | `$`, `uid`, `clamp`, RIR↔RPE, dates, units (`U`, `toKg`, `wt`…), `e1rm`, `dots`, `esc`, bodyweight and BMR (2145–2317); `APP_VERSION` (2378); `Cue`, `Awake` (2870–2947) |
| `js/database.js` | 104 kB | 149 | 57 | **Storage, sync and migrations, together.** IndexedDB, `S`, `load`/`save`/`flush`, backup and storage cards, Drive sync and merge (1433–2144); clear and erase data, custom-movement healing, `migrateToV2` (3208–3449); migration dry run (3593–3695); other-app CSV import (11115–11843); JSON export/import, `DATA_MIGRATIONS`, `runDataMigrations`, undo import (20590–20871); Ironlog CSV out and back (21659–21815) |
| `js/exercises.js` | 288 kB | 159 | 80 | `EX_DB`, muscles per exercise (2318–2377); library, catalogue, leaf model, metrics, records, hold times (2381–2869); names, icons, axis picker (2948–3156); set roles and feel (3450–3592); exercise demos, movement page (8832–9555); modifiers, exercise check (14912–15196) |
| `js/stats.js` | 55 kB | 92 | 51 | standards, ranks, muscle scores, recovery, weekly sets, muscle map and skins, history, PRs, plausibility, tested maxes (3696–4648); streak, goals (6207–6282); the Stats page (8661–8831) |
| `js/events.js` | 70 kB | 64 | 18 | test log, event types, meets, attempts, meet day, strongman, run-in blocks, add event (9556–10794) |
| `js/tools.js` | 34 kB | 46 | 17 | Tools sheet, training report (5339–5537); calculators (6048–6206); AI key and usage, leftover food export (13879–14103) |
| `js/health.js` | 218 kB | 207 | 58 | Health page (5296–5338); check-in (6283–6404); mobility, mobility tests, fitting test (15488–16466); blood pressure, glucose (18396–18625); cardio, heart-rate strap, intervals (18626–19786); body comp, measurements, photos, clips (20872–21658) |
| `js/vbt.js` | 87 kB | 77 | 25 | Slew profile, Measure, rep detection on top of Slew, RIR estimate (11844–12376); bar path from video, squat depth (12377–13118); load-velocity profile, calibration (13119–13382) |
| `js/coach.js` | 158 kB | 165 | 10 | coach templates, plan builder, chat, answers, plan import (16467–18395) |
| `js/workout.js` | 210 kB | 237 | 84 | calendar and planner (6405–6716); Train page, missed sessions, set table, bar-speed strip, warm-up ramp, plates, finish, share cards, summary (6719–8439); edit a session (8440–8658); programs, backfill (10795–11114); set done, hold timer, places, rep range, per-side, tempo (14250–14911); autoregulation, rest timer (15197–15487); active-workout wiring, voice set entry (19787–20589) |
| `js/ui.js` | 115 kB | 76 | 39 | update check (3157–3207); focus, a11y pass, toast, modal, charts, router, welcome, help, What's new, Home (4649–5295); debug trace and the `WHY` text (5538–6047); Profile, Settings (13383–13878); page event wiring (14106–14249); Windows 98 chrome (21816–22000) |
| `js/main.js` | 10 kB | 4 | 0 | nav and top-bar handlers, Escape, field blur, `bootApp`, `bootRescue`, service-worker registration (22001–22199). The entry point: `<script type="module" src="js/main.js">` |
| `js/data.js` + `program-manifest.json` | <1 kB | 2 | 2 | `PROGRAM_MANIFEST`, `PROGRAM_NAMES` (1430–1431) |

`exercises` is big because 153 kB of it is two generated data lines
(`EX_DB` 92 kB, `EXERCISE_CATALOGUE` 61 kB) and another 51 kB is demo data.
See question 2.

Some placements are judgement calls, made to keep the brief's nine names
rather than add more: other-app import and CSV sit in `database` (they read
and write the log); the calendar and programs sit in `workout`; Settings and
Profile sit in `ui`; the fitting test and cardio sit in `health`; AI key
sits in `tools`. Any of them can go elsewhere by editing the plan file and
rerunning the map.

## Dependency graph

How many names each module (row) takes from each other module (column):

| imports ↓ from → | core | database | exercises | stats | events | tools | health | vbt | coach | workout | ui | data |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| **core** | · | 1 | | | | | | | | | | |
| **database** | 13 | · | 22 | 2 | 2 | 5 | 1 | | 1 | 7 | 10 | 2 |
| **exercises** | 13 | 4 | · | 6 | | | | | | 14 | 11 | |
| **stats** | 18 | 4 | 24 | · | 2 | | | | | 1 | 14 | |
| **events** | 19 | 4 | 17 | 6 | · | | | | | 7 | 10 | |
| **tools** | 20 | 3 | 9 | 3 | 3 | · | 6 | 2 | | 6 | 5 | |
| **health** | 23 | 4 | 10 | 4 | 1 | | · | 1 | 3 | 3 | 15 | |
| **vbt** | 12 | 2 | 5 | 2 | 1 | | 3 | · | | 8 | 9 | |
| **coach** | 20 | 2 | 16 | 13 | 5 | 4 | 16 | 1 | · | 23 | 14 | 2 |
| **workout** | 25 | 13 | 64 | 17 | 6 | 4 | 7 | 18 | 1 | · | 16 | 1 |
| **ui** | 27 | 31 | 20 | 32 | 16 | 11 | 37 | 10 | 8 | 39 | · | 1 |
| **main** | 4 | 18 | | | | 1 | | | 1 | | 14 | |

476 names cross a module boundary. The full lists, by module, are in
`module-split-map.json`.

**It is not a tree, and this plan doesn't try to make it one.** 28 pairs of
modules import from each other (`ui ⇄ workout` 39/16, `exercises ⇄ workout`
14/64, `database ⇄ ui` 10/31, and so on). The app was written as one scope:
a page renders, opens a modal, saves, and calls `render()` again. Untangling
that would mean changing how code calls code, which is not a pure refactor.

Cycles between ES modules are allowed, and are safe as long as no module
*uses* another's binding while it is still loading. That was checked for
every top-level statement, following calls through functions:

- `ui`: `let calSelected = today()` (4864) calls into `core` at load. `core`
  has no load-time needs of its own, so it loads first. Fine.
- `database`: the `visibilitychange` and `pagehide` listeners (2141–2142) only
  name `flush`, which is its own; it runs later, on the event.
- `main`: everything at load (nav handlers, `boot()`). It is the entry
  point, so every other module has finished loading before its body runs.

Nothing else reads across a boundary at load. All other cross-module use is
inside function bodies, which run after `boot()`. **This property has to be
kept**: a new top-level `const X = somethingFromAnotherModule()` can throw
"Cannot access before initialization" depending on import order. The
`module-map.cjs` output lists these under "LOAD-TIME READS"; the list should
stay as short as it is now.

## Globals that become exports

Every top-level name used from another module becomes an `export` on its
declaration. 476 of the 1,316 today. Per module: `exports` in
`module-split-map.json`. The busiest are what you'd expect: `S`, `save`,
`render`, `$`, `esc`, `modal`, `closeModal`, `toast`, `today`, `U`, `wt`,
`exFull`, `exKey`, `bust`.

Another 49 names are used by `smoke.js` and by nothing outside their own
module (`finishWorkout`, `coachBuild`, `HR`, `planParse`…). They get
exported too, so the smoke test can still reach them.

### State that is assigned from another module

An imported binding is read-only: `import { page }` then `page = 'home'` is
an error. Of the 57 top-level `let`s that get reassigned, 8 are assigned
from outside the module that will own them:

| Name | Owner | Assigned from | Becomes |
|---|---|---|---|
| `S` | database | main (`bootApp`: the loaded state) | `setState(v)` in database |
| `bootFailed` | database | main | `setBootFailed(v)` |
| `installEvt` | database | ui (the install button clears it) | `setInstallEvt(v)` |
| `page` | ui | main | `setPage(v)` |
| `whatsNewArmed` | ui | main | `setWhatsNewArmed(v)` |
| `calSelected` | ui | workout (calendar day picked) | `setCalSelected(v)` — or move the three calendar cursors (4863–4864) to `workout`, which removes the need |
| `cardioWhyLast` | ui | health (and `smoke.js`) | `setCardioWhyLast(v)` — or move it to `health` with the cardio code |
| `tick` | workout | ui (router clears the timer) | `setTick(v)` |

Each setter is one line (`export function setPage(v) { page = v; }`) and each
outside assignment `x = v` becomes `setX(v)`. Reads don't change: an imported
`let` is a live view of the owner's variable. Mutating what a name points to
(`S.workouts.push(…)`, `HR.samples = …`) needs nothing.

`S` deserves a second look when it moves. It is replaced wholesale in four
places: `eraseEverything`, `applyImportedState`, `undoImport` (all
`database`) and `bootApp` (`main`). `module-map.cjs --deps S` lists them.

## Things that change underneath, and why they should not show

- **Strict mode.** Modules are always strict; the script today is not. The
  whole script parses as a module, there is no `with`, no `arguments.callee`,
  no assignment to an undeclared name (`lint-scope` is clean), and no
  free-standing `this`. The remaining risk is a silent failure that strict
  mode turns into a throw: writing to a read-only property or a frozen
  object. None found by reading; the smoke test and click-through are the
  check.
- **Load timing.** A module runs after the document is parsed, as the script
  at the end of `<body>` does now. The skin script in the head stays inline.
- **More files.** About 14 requests instead of one on a first visit, all
  precached by the service worker afterwards. `index.html` gets a
  `<link rel="modulepreload">` per module so they download in parallel.
- **The update.** Precaching is all-or-nothing (`cache.addAll`), and the
  worker never refreshes a cached file in place, so a phone can't end up
  with half the old modules and half the new. Every module must be in
  `ASSETS` in `sw.js`; a missing one would still work online and fail in a
  basement. A check for that is part of step 0.
- **Opening `index.html` by double-click stops working.** `serve.mjs` says
  the file can be opened straight from disk. Browsers refuse to load modules
  from `file://`. The deployed app and the dev server are unaffected.
  (`program.json` already fails to load from `file://`.) Question 5.

## Tools

Twelve tools read or patch `index.html` by pattern. Each has to follow its
code, in the same commit as the move:

| Tool | Finds | Follows it to |
|---|---|---|
| `bump.cjs`, `check-version.cjs` | `const APP_VERSION = '…'` | `js/core.js`. `check-version` also gains: every `js/*.js` and the JSON are in `sw.js` `ASSETS`; every `import { x } from './y.js'` names something `y.js` exports (a wrong one is a blank page in the browser) |
| `lint-scope.js` | all inline scripts as one scope | each `js/*.js` as its own scope, with its imports counted as declared |
| `build-catalogue.cjs` | `const EXERCISE_CATALOGUE = …;` line | `js/exercises.js` |
| `build-demos.cjs`, `demo-engine.cjs`, `demo-check.cjs`, `demo-lab.html` | `DEMO_PATTERNS` / `DEMO_MAP` / `DEMO_TEXT` lines and the demo functions | `js/exercises.js` |
| `build-routines.cjs` | `const BUILTIN_ROUTINES = …;` | `js/health.js` |
| `build-coach-templates.cjs` | `const COACH_TPL = …` | `js/coach.js` |
| `build-program-wdc.py`, `build-program.py` | print a `PROGRAM_MANIFEST` line to paste | write `program-manifest.json` |
| `vbt-sim.cjs`, `vbt-rir.cjs`, `vbt-validate.cjs` | `const VBT_HP_V … function vbtSummary` cut out by regex and run in a `vm` | import the Slew engine files directly (step 9) |
| `validate-exercises.js`, `build-skin.cjs`, `build-voice.cjs` | to check when their code moves | |
| `smoke.js`, `baseline.js` | app names as globals, by `eval` in the page | see below |

**The smoke test** uses 129 app names as bare globals. Once the script is a
module there are none. The plan: `smoke.js` keeps its body as it is and gains
a short header that imports every module (`await import('../../js/ui.js')`…;
the browser hands back the same instances the app is running), puts their
exports behind one lookup object, and runs the body inside it. No test hook
is added to the app. Its two bare assignments (`cardioWhyLast = …`, lines
625 and 628) become calls to the setter. `baseline.js` already looks names
up this way (`app()` at its top).

## Order of the moves

One commit each. After every one: the full baseline, `node --check` on every
`js/*.js`, new files added to `ASSETS` in `sw.js`, cache version bumped
(question 4), `module-split-plan.json` and this checklist updated.

- [x] **0. Tools first, no app change.** `check-version.cjs` learns the
  `ASSETS` and import/export checks; `lint-scope.js` learns `js/*.js`;
  `module-map.cjs` learns to print the `import` and `export` lines for a
  module, so no list is typed by hand.
- [x] **1. The script becomes a module, whole.** Lines 1433–22199 move
  unchanged to `js/app.js`, loaded with `<script type="module">`, with one
  generated `export { … }` at the end for the names the smoke test needs.
  `smoke.js` gets its header. This is the step that proves strict mode,
  deferred loading and the test harness, with a diff that is a pure move.
  If anything is going to behave differently, it shows here, before any
  untangling.
- [x] **2. `program-manifest.json` + `js/data.js`** (question 1).
- [x] **3. `js/core.js`.** Needs nothing at load; everything needs it.
- [x] **4. `js/database.js`.** Storage, sync, migrations in one move. First
  setters (`setState`, `setBootFailed`, `setInstallEvt`).
- [x] **5. `js/exercises.js`.** `build-catalogue`, `build-demos` and the demo
  tools follow.
- [x] **6. `js/stats.js`.**
- [x] **7. `js/events.js`.**
- [x] **8. `js/tools.js`.**
- [x] **9. Slew stands alone** (next section), then **`js/vbt.js`**. Two
  commits. `vbt-sim`, `vbt-rir`, `vbt-validate` follow.
- [x] **10. `js/health.js`.** `build-routines` follows.
- [x] **11. `js/coach.js`.** `build-coach-templates` follows.
- [x] **12. `js/workout.js`.**
- [x] **13. `js/ui.js`.** What is left of `app.js` is boot: rename it
  `js/main.js`.
- [x] **14. Stylesheets out** (`css/app.css`, `css/skin98.css`), if wanted
  (question 3). `index.html` is then about 5 kB.
- [x] **15. Docs.** `CLAUDE.md`, `r&d/README.md` and the roadmap's standing
  rules say "the app is a single large `index.html`" and name the
  three-place version bump. Update them.
- [x] **16. PR** with file sizes before and after. Not merged.

Leaves first, the most tangled last, so each move's import list is mostly
things that have already settled. Each move is cut and paste of whole
top-level statements in their existing order, plus generated `import` and
`export` lines. No statement is edited except the eight assignments above.

## Slew as a standalone engine

`slew-core.js` and `slew-video.js` are already generated bundles of
`slew-v2` (`build-slew.cjs`). They take nothing from Ironlog today: each is
one closed function that sets a global (`Slew`, `SlewVideo`).

What is *not* standalone is Ironlog's own layer on top, which is where the
rep detection Aaron tuned actually lives (lines 12114–12300): the tilt
correction, the drift high-pass (`vbtIntegrate`), the blip filter, the set
summary and the RIR estimate (`vbtEstimateSet`). Those functions are pure —
samples and a profile in, reps and an estimate out, calling only `Slew` —
but they sit in the middle of the app and three tools cut them out by regex.

Proposed, pending question 1 of the Slew pair below:

- `slew-core.js` and `slew-video.js` keep their bundled bodies byte for byte
  and become modules: the `globalThis.Slew = Slew` line becomes an export.
  `build-slew.cjs` is changed to emit that, and the result compared with the
  committed file so the engine itself is provably untouched. (Rebuilding
  from today's `slew-v2` could pull in engine changes made since
  5 Sep / 8 Nov, so the footer is changed without a rebuild.)
- Ironlog's pure layer moves into the engine file's side of the line, so the
  contract in the brief — **samples, load, settings in; reps, velocities,
  RIR out** — is one import with no app state behind it. `js/vbt.js` keeps
  everything that touches `S`, the DOM, the sensors' permission prompts and
  the set table.
- `r&d/notes/slew-api.md` documents the contract at that step, from the
  code as moved.
- `vbt-sim.cjs` and friends import the same files the app does, instead of
  a regex over `index.html`. 453/480 must not move.

## Questions for Aaron

1. **"Bundled program data" → JSON.** `program.json` is already its own
   file. What is still bundled is the two-line manifest Settings shows
   (`PROGRAM_MANIFEST`, `PROGRAM_NAMES`). I've read the brief as: that moves
   to `program-manifest.json`. It is read synchronously in a few places, so
   it has to be loaded before first render: fetched once in `bootApp`
   (precached, so offline is fine). Is that the data you meant?
2. **The other generated data** — exercise database and catalogue (153 kB),
   demos (51 kB), `WHY` (29 kB), coach templates (17 kB), routines (10 kB):
   260 kB of the script. Not in the brief. Options: leave them in their
   modules (the plan above), or give them their own data modules so
   `exercises.js` is code you can read. I'd do the second as extra commits
   after step 13, since the build tools already own those lines.
3. **Stylesheets.** "Thin shell" suggests the 73 kB of CSS leaves too. It is
   not JavaScript and not in the module list, so I've made it optional step
   14. Yes or no?
4. **Version numbers.** Each move changes the files the service worker
   caches, so the cache version has to go up each commit (v164, v165…). The
   app version and `CHANGELOG.md` are for things a user would notice, and
   there are none. Proposal: bump only the cache version per commit, and one
   app version (0.97.0, "no visible change, the app is now several files")
   in the last commit. `check-version.cjs` passes either way.
5. **Opening from disk.** After this, double-clicking `index.html` shows a
   blank page; it has to be served. Fine?

And for the Slew step: should Ironlog's rep detection and RIR estimate live
**with the engine** (a third file beside the two generated ones, importing
only `slew-core.js`), or be **pushed upstream into `slew-v2`** and come back
through `build-slew.cjs`? The first is a pure move. The second changes the
engine's source and its tests, so I'd leave it for after this refactor.
