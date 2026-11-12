# Ironlog — notes for agents

Read **`r&d/ROADMAP.md`** first. It lists what to build next, in order, plus the
standing rules (RIR shown / RPE stored, kg, local-first, version bumps in
`version.json`, `sw.js` **and `APP_VERSION` in `js/core.js`** — `r&d/tools/bump.cjs` does all
three, `r&d/tools/check-version.cjs` verifies — and the syntax check before
committing).

**Bugs:** non-critical bugs you find — on a sweep or while building something
else — go in **`r&d/BUGS.md`**, not fixed mid-feature. Critical ones (data
loss, app won't open, a core flow blocked) get fixed straight away. When Aaron
says "fix the bugs" / "clear the bug list", work that file top down. Its own
header has the rules.

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
| `js/core.js` | helpers everything uses: `$`, dates, units, `e1rm`, `esc`, `APP_VERSION` |
| `js/database.js` | storage, Drive sync, migrations, import and export — kept together |
| `js/exercises.js` | exercise library, leaf model, demos, modifiers |
| `js/workout.js` | calendar, Train, programs, autoregulation, rest timer |
| `js/stats.js` | standards, PRs, weekly sets, muscle map, the Stats page |
| `js/health.js` | health, mobility, fitting test, vitals, cardio, body comp |
| `js/events.js` | meets, tests, run-in blocks |
| `js/coach.js` | the coach |
| `js/vbt.js` | bar speed: Measure, bar path, load-velocity profile |
| `js/tools.js` | Tools sheet, report, calculators, AI key |
| `js/ui.js` | toast, modal, charts, router, Home, Settings, Windows 98 skin |
| `js/data.js` | bundled data (`program-manifest.json`) |
| `css/app.css`, `css/skin98.css` | the two stylesheets |
| `slew-core.js`, `slew-video.js`, `slew-reps.js` | the bar-speed engine. Takes nothing from Ironlog: `r&d/notes/slew-api.md` |

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
