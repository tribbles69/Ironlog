# r&d — everything that isn't the app

Nothing in here is loaded by Ironlog at runtime. The app is the repo root.
Quote the folder name in the shell: `cd "r&d"`.

| Folder | What's in it |
| --- | --- |
| `ROADMAP.md` | What's being built next, in order, and the standing rules. Start here. |
| `specs/` | Feature specs, written before building. A spec wins over the roadmap summary. |
| `notes/` | Audits, the parked backlog, anything written down for reference. |
| `data/` | Source data that gets built into the app — `exercises.json` is inlined into `index.html` by `tools/build-catalogue.cjs`. Edit here, not in `index.html`. |
| `tools/` | Build and check scripts, run from the repo root (see below). |
| `food-handover/` | Food logging left the app in 0.25.0: the food parser function, the food tables and their build tool, kept for the separate food app. Not loaded by Ironlog. |
| `skins/` | Muscle map skin paint guide (`paint-guide.png`, `.ora`) and the authoring notes. The shipped skin is `/skins/template.png`. |
| `patches/` | Ready-made fixes to apply with `git apply`. Delete a patch once it's applied. |

## Tools

All run from the repo root.

| Command | Does |
| --- | --- |
| `node "r&d/tools/serve.mjs"` | Local server on http://localhost:5178 |
| `node "r&d/tools/bump.cjs" 0.17.0` | Bumps `APP_VERSION`, `sw.js` and `version.json` together |
| `node "r&d/tools/lint-scope.js"` | Finds undeclared identifiers across all script blocks |
| `node "r&d/tools/validate-exercises.js"` | Checks `data/exercises.json` against the program and the phase 1 spec |
| `node "r&d/tools/build-catalogue.cjs"` | Inlines `data/exercises.json` into `index.html` |
| `NODE_PATH=$(npm root -g) node "r&d/tools/skin-sheet.mjs"` | Redraws the shipped template skin and the paint guide (needs Playwright) |
| `node "r&d/tools/build-slew.cjs" ../slew-v2` | Regenerates `slew-core.js` from the Slew source |

Runtime smoke test, in the browser console on the running app:
`fetch('r&d/tools/smoke.js').then(r => r.text()).then(eval).then(smoke)`
