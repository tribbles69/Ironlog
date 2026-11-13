# Ironlog — notes for agents

Read **`r&d/ROADMAP.md`** first. It lists what to build next, in order, plus the
standing rules (RIR shown / RPE stored, kg, local-first, version bumps in
`version.json`, `sw.js` **and `APP_VERSION` in `js/core.js`** — `r&d/tools/bump.cjs` does all
three, `r&d/tools/check-version.cjs` verifies — and the syntax check before
committing).

**Every version bump also adds an entry to the top of `CHANGELOG.md`** (repo root — the app shows it as What's new), in
the same commit: version, date, and a few plain-English bullets on what a user
would notice (new, changed, fixed). No code detail — that goes in the commit
message.

**Layout:** the repo root is the app — only files that get deployed live there.
Everything else (roadmap, specs, notes, data sources, build tools,
patches) is under `r&d/`; see `r&d/README.md` for the map. Keep it that way:
new specs go in `r&d/specs/`, new scripts in `r&d/tools/`, nothing new at the
root unless the app loads it. Quote the folder in the shell: `"r&d"`.

Where a spec exists, it wins over the roadmap summary.

**The app is native ES modules, with no build step.** `index.html` is a thin
shell (head, the skin script, the body markup); it loads `js/main.js`, which
imports the rest:

| File | What is in it |
|---|---|
| `js/main.js` | boot, the rescue screen, service-worker registration. The entry point |
| `js/state.js` | `S`, the whole log, and `DEFAULT_STATE`. Imports nothing. `setState` is the only way to replace `S` |
| `js/core.js` | helpers everything uses: `$`, dates, units, `e1rm`, `esc`, `APP_VERSION`, small formatters (`fmtSec`, `addDaysISO`, `checkinFor`…). Imports only `state.js` |
| `js/kit.js` | the UI kit: toast, modal, `confirmDlg`, charts, the a11y pass, the router state (`page`, `go`, `render`), debug mode's `why`/`openWhy`, the FAQ. Imports only `core.js` and `state.js` |
| `js/database.js` | storage (IndexedDB, localStorage), `save` / `flush`, backup cards, the Drive calls and `mergeSync`. Imports only `state`, `core`, `kit` |
| `js/io.js` | the log in and out: boot `load`, clear / erase, data migrations, Liftoff / Strong / Hevy / CSV / JSON import and undo, CSV and JSON export |
| `js/sync.js` | Drive sync, the job: `driveSync`, `autoSync`, the summary file, the Settings sync line |
| `js/exercises.js` | exercise library, leaf model, set model, muscle shares, demos, modifiers, priority and main lifts. Imports only `state`, `core` |
| `js/movement.js` | the exercise screens: movement page, equipment / role / modifier pickers, pain and fatigue notes, Check exercise data |
| `js/loading.js` | plates, bars, collars, inventory, warm-up ramps, load rounding, places and their kit |
| `js/workout.js` | calendar, Train, the live session, programs, autoregulation, rest timer, share cards, voice logging |
| `js/stats.js` | standards, PRs, weekly sets, muscle map, the Stats page |
| `js/health.js` | health, mobility, fitting test, vitals, cardio, body comp |
| `js/events.js` | meets, tests, run-in blocks |
| `js/coach.js` | the coach |
| `js/vbt.js` | bar speed: Measure, bar path, load-velocity profile |
| `js/tools.js` | Tools sheet, report, calculators, AI key |
| `js/ui.js` | the shell: draws the pages (Home, Settings, Profile, welcome, What's new), the `WHY` explainers, Windows 98 chrome. Only `main.js` imports it; it plugs `renderPage` and the skin into the kit's `shell` hooks |
| `js/data.js` | bundled data (`program-manifest.json`) |
| `css/app.css`, `css/skin98.css` | the two stylesheets |
| `slew-core.js`, `slew-video.js`, `slew-reps.js` | the bar-speed engine. Takes nothing from Ironlog: `r&d/notes/slew-api.md` |

**Layers (0.98.2, `r&d/notes/module-split.md` → Untangle):**
`state` → `core` → `kit` → `database` → `exercises` → `stats` → `loading` →
the features → `ui` → `main`. A file imports only from layers below it, never
above: nothing imports `ui.js` but `main.js`, and nothing from `state` up to
`loading` imports a feature. A feature that needs to redraw or change page
uses the kit's `render()` / `go()`, which call into `ui.js` through `shell`.
The features (workout, movement, events, health, coach, vbt, tools, io,
sync) still import each other — see ROADMAP E17. **When you add code, put it
in the lowest layer that has everything it needs**; if a low layer would have
to import a feature, the code belongs higher up.
`r&d/tools/module-map.cjs --json` shows who imports what.

Grep before editing; line numbers in specs drift, and specs written before
0.97.0 say `index.html` where they mean one of these.

**When you add, move or rename a top-level function or variable:**

- A name used in another file needs `export` where it is declared and an
  `import` where it is used. The import block at the top of each file is
  generated: run `NODE_PATH=../slew-v2/node_modules node "r&d/tools/module-map.cjs" --sync`
  rather than editing it by hand (it needs the TypeScript parser, borrowed
  from `slew-v2`). Without that, add the import by hand and let
  `check-version.cjs` and `lint-scope.js` confirm it.
- An imported variable is read-only. To assign to another module's `let`, call
  its setter (`setState`, `setPage`…); `--sync` writes one when it is missing.
- Don't make one module use another's `const` or call into it while the file is
  loading — only inside functions. The modules import each other in circles,
  which is fine until a top-level line needs something that hasn't loaded yet.
  `module-map.cjs` with no arguments lists these ("LOAD-TIME READS"); the list
  should stay as short as it is.
- A new file the app loads must be in `ASSETS` in `sw.js` (and a module in the
  `modulepreload` list in `index.html`). `check-version.cjs` fails if not.

Before committing: `node "r&d/tools/check-version.cjs"` (versions, every module
parses, every import resolves, every file is precached) and
`node "r&d/tools/lint-scope.js"`. For anything beyond a one-liner, the smoke
test and `r&d/tools/baseline.js` in the browser (`r&d/README.md`).

The app must be served to run (`node "r&d/tools/serve.mjs"`): browsers won't
load modules from a `file://` page.

**Exercise demos** (the animated figures on the Info tab) are data in
`r&d/data/demos/`, built into `js/exercises.js` by `r&d/tools/build-demos.cjs` —
never edit the `DEMO_PATTERNS` / `DEMO_MAP` / `DEMO_TEXT` lines by hand. To
add or change one, follow `r&d/specs/exercise-demo-spec.md` §8 and finish with
`r&d/tools/demo-check.cjs`.
