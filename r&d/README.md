# r&d — everything that isn't the app

Nothing in here is loaded by Ironlog at runtime. The app is the repo root:
`index.html`, `js/`, `css/`, the three `slew-*.js` engine files, and the data and
assets they load. `notes/module-split.md` says what is in which file.
The changelog isn't here: it's `CHANGELOG.md` at the root, because the app
loads it for What's new.
Quote the folder name in the shell: `cd "r&d"`.

| Folder | What's in it |
| --- | --- |
| `ROADMAP.md` | What's being built next, in order, and the standing rules. Start here. |
| `BUGS.md` | Known non-critical bugs, logged as they're found and fixed together in batches. |
| `specs/` | Feature specs, written before building. A spec wins over the roadmap summary. |
| `notes/` | Audits, the parked backlog, anything written down for reference. |
| `data/` | Source data that gets built into the app — `exercises.json` is inlined into `js/exercises.js` by `tools/build-catalogue.cjs`, `demos/` (exercise demo figures and text) by `tools/build-demos.cjs`. `mobility.json` (the stretch and mobility library) by `tools/build-mobility.cjs`. Edit here, not in `js/`. |
| `tools/` | Build and check scripts, run from the repo root (see below). |
| `food-handover/` | Food logging left the app in 0.25.0: the food parser function, the food tables and their build tool, kept for the separate food app. Not loaded by Ironlog. |
| `skins/` | Muscle map skin paint guide (`paint-guide.png`, `.ora`) and the authoring notes. The shipped skin is `/skins/template.png`. |
| `patches/` | Ready-made fixes to apply with `git apply`. Delete a patch once it's applied. |

## Tools

All run from the repo root.

| Command | Does |
| --- | --- |
| `node "r&d/tools/serve.mjs"` | Local server on http://localhost:5178 |
| `node "r&d/tools/bump.cjs" 0.17.0` | Bumps `APP_VERSION` (`js/core.js`), `sw.js` and `version.json` together. `--cache` bumps the service-worker cache alone, for a change to the files that no user would notice |
| `node "r&d/tools/check-version.cjs"` | Checks those three and the changelog's top entry agree — and that every module parses, every `import` names a real `export`, every file the app loads is precached in `sw.js`, and the engine files import nothing |
| `node "r&d/tools/lint-scope.js"` | Finds undeclared identifiers, each module checked on its own (so a missing import shows) |
| `NODE_PATH=../slew-v2/node_modules node "r&d/tools/module-map.cjs"` | The map of the modules: who imports what, and what runs at load. `--sync` regenerates every file's import block, `export`s and setters; `--check` says if they are out of step; `--deps <name>` lists who reads and writes one name. Needs the TypeScript parser, borrowed from `slew-v2` |
| `node "r&d/tools/validate-exercises.js"` | Checks `data/exercises.json` against the program and the phase 1 spec |
| `node "r&d/tools/validate-mobility.cjs"` | Checks `data/mobility.json` (the stretch and mobility library) and that every built-in routine item is in it |
| `node "r&d/tools/build-catalogue.cjs"` | Inlines `data/exercises.json` into `js/exercises.js` |
| `node "r&d/tools/build-demos.cjs"` | Validates `data/demos/` and inlines the exercise demos into `js/exercises.js` (`--check` validates only) |
| `node "r&d/tools/demo-check.cjs" --98 --png` | Poses every demo with every equipment, flags broken ones, writes a contact sheet |
| `r&d/tools/demo-lab.html` | Pose editor for exercise demos — open via `serve.mjs`, Save & build writes `data/demos/movements/` |
| `node "r&d/tools/build-mobility.cjs"` | Validates `data/mobility.json` and inlines it into `js/health.js` as `MOBILITY_LIBRARY` |
| `node "r&d/tools/build-routines.cjs"` | Inlines `data/routines/*.json` (built-in mobility routines) into `js/health.js` |
| `python3 "r&d/tools/build-program.py"` | Rebuilds `program.json` (RIR-only, no weights) from `data/hunchback-pplul-77wk.txt`; prints the manifest, which goes in `program-manifest.json` |
| `NODE_PATH=$(npm root -g) node "r&d/tools/skin-sheet.mjs"` | Redraws the shipped template skin and the paint guide (needs Playwright) |
| `node "r&d/tools/build-slew.cjs" ../slew-v2` | Regenerates `slew-core.js` and `slew-video.js` (the plate tracker for bar path, 04a) from the Slew source |
| `node "r&d/tools/build-pose.cjs" ../slew-v2` | Copies MediaPipe's lite pose model and SIMD engine into `pose/` (squat depth, 04b — an optional 16.6 MB download, never precached) |

The build tools find their line by pattern (`tools/app-source.cjs`), so they
follow the code if it moves to another file.

Runtime smoke test, in the browser console on the running app (served by `serve.mjs`, which adds `'unsafe-eval'` to the app's CSP locally so these `eval` loaders work — the deployed app blocks eval):
`fetch('r&d/tools/smoke.js').then(r => r.text()).then(eval).then(smoke)`

Click-through of every page and a CSV round trip, with a fingerprint to compare
before and after a change (dev server only — it wipes the stored log first):

```js
for (const f of ['smoke', 'baseline']) await fetch(`r&d/tools/${f}.js`).then(r => r.text()).then(t => (0, eval)(t));
await baseline.wipe(); location.reload();      // then load the two scripts again
await baseline({ seeds: ['empty'] });          // wipe and reload again, then ['migrated']
```

What the numbers should be is in `notes/module-split.md`.
