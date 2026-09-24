#!/usr/bin/env node
/* One-off tidy-up (Sep 2026): everything that isn't the app moves into r&d/.
   The app itself stays at the repo root so the hosted URL, the service worker
   and the Netlify function keep working unchanged.

   Run from the repo root on a clean working tree:
       node reorganise.cjs
   It moves files with `git mv` (history is kept), rewrites every path that
   pointed at the old locations, checks the result, commits, and deletes
   itself. Then push. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
process.chdir(ROOT);
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const node = (...a) => execFileSync(process.execPath, a, { encoding: 'utf8' });
const read = f => fs.readFileSync(f, 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };

if (fs.existsSync('r&d')) { console.error('r&d/ already exists — already reorganised?'); process.exit(1); }
if (git('status', '--porcelain').split('\n').filter(l => l && !l.endsWith('reorganise.cjs')).length) {
  console.error('Working tree not clean — commit or stash first.'); process.exit(1);
}

/* ---- 1. moves ---- */
const MOVES = [
  ['ROADMAP.md',                     'r&d/ROADMAP.md'],
  ['docs/exercise-system.md',        'r&d/specs/exercise-system.md'],
  ['docs/exercise-system-phase1.md', 'r&d/specs/exercise-system-phase1.md'],
  ['docs/isometrics-spec.md',        'r&d/specs/isometrics-spec.md'],
  ['docs/audit-2026-09-03.md',       'r&d/notes/audit-2026-09-03.md'],
  ['docs/backlog.md',                'r&d/notes/backlog.md'],
  ['docs/exercises.json',            'r&d/data/exercises.json'],
  ['docs/patches',                   'r&d/patches'],
  ['tools',                          'r&d/tools'],
  ['serve.mjs',                      'r&d/tools/serve.mjs'],
];
for (const [from, to] of MOVES) {
  if (!fs.existsSync(from)) { console.log(`skip (missing): ${from}`); continue; }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  git('mv', from, to);
  console.log(`moved ${from} -> ${to}`);
}
const left = fs.existsSync('docs') ? fs.readdirSync('docs') : [];
if (left.length) { console.error('docs/ still has files, not sure where they go:', left); process.exit(1); }
if (fs.existsSync('docs')) fs.rmdirSync('docs');

/* ---- 2. path rewrites ---- */
const RULES = [
  [/docs\/exercise-system-phase1\.md/g, 'r&d/specs/exercise-system-phase1.md'],
  [/docs\/exercise-system\.md/g,        'r&d/specs/exercise-system.md'],
  [/docs\/([a-z0-9-]+-spec\.md)/g,      'r&d/specs/$1'],
  [/docs\/audit-2026-09-03\.md/g,       'r&d/notes/audit-2026-09-03.md'],
  [/docs\/backlog\.md/g,                'r&d/notes/backlog.md'],
  [/docs\/exercises\.json/g,            'r&d/data/exercises.json'],
  [/docs\/patches\//g,                  'r&d/patches/'],
  [/node tools\/([\w.-]+)/g,            'node "r&d/tools/$1"'],   // quoted: & is special in a shell
  [/(?<![\w/&])tools\//g,               'r&d/tools/'],
];
const rewrite = f => {
  const before = read(f);
  let s = before;
  for (const [re, to] of RULES) s = s.replace(re, to);
  if (s !== before) { fs.writeFileSync(f, s); console.log(`paths updated: ${f}`); }
};
[
  'index.html', 'slew-core.js', 'README.md', 'r&d/ROADMAP.md', 'r&d/data/exercises.json',
  ...['specs', 'notes'].flatMap(d => fs.readdirSync(`r&d/${d}`).map(f => `r&d/${d}/${f}`)),
  ...fs.readdirSync('r&d/tools').map(f => `r&d/tools/${f}`),
].forEach(rewrite);   // r&d/patches/* deliberately untouched — rewriting a diff breaks it

/* Roadmap wording that isn't a bare path */
{
  const f = 'r&d/ROADMAP.md';
  let s = read(f);
  s = s.replace('links a spec in `docs/`', 'links a spec in `r&d/specs/`')
       .replace('## How to work from this file\n',
         '## How to work from this file\n\n' +
         'Paths here are from the repo root. The folder is `r&d` — **quote it in the\n' +
         'shell** (`cd "r&d"`), since an unquoted `&` backgrounds the command.\n');
  write(f, s);
}

/* Tools now live two levels down: their repo root is ../.. */
for (const f of fs.readdirSync('r&d/tools')) {
  const p = `r&d/tools/${f}`;
  let s = read(p);
  s = s.replace("path.resolve(__dirname, '..')", "path.resolve(__dirname, '..', '..')");
  write(p, s);
}
{
  const p = 'r&d/tools/serve.mjs';
  let s = read(p);
  s = s.replace("const ROOT = path.dirname(fileURLToPath(import.meta.url));",
                "const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');")
       .replace('// Optional local server: `node serve.mjs` then open http://localhost:5177',
                '// Optional local server: `node "r&d/tools/serve.mjs"` then open http://localhost:5178');
  write(p, s);
}

/* ---- 3. signposts ---- */
write('CLAUDE.md', `# Ironlog — notes for agents

Read **\`r&d/ROADMAP.md\`** first. It lists what to build next, in order, plus the
standing rules (RIR shown / RPE stored, kg, local-first, version bumps in both
\`version.json\` and \`sw.js\`, the script syntax check before committing).

**Layout:** the repo root is the app — only files that get deployed live there.
Everything else (roadmap, specs, notes, data sources, build tools, patches) is
under \`r&d/\`; see \`r&d/README.md\` for the map. Keep it that way: new specs go
in \`r&d/specs/\`, new scripts in \`r&d/tools/\`, nothing new at the root unless
the app loads it. Quote the folder in the shell: \`"r&d"\`.

Where a spec exists, it wins over the roadmap summary.

The app is a single large \`index.html\`. Grep before editing; line numbers in
specs drift.
`);

write('r&d/README.md', `# r&d — everything that isn't the app

Nothing in here is loaded by Ironlog at runtime. The app is the repo root.
Quote the folder name in the shell: \`cd "r&d"\`.

| Folder | What's in it |
| --- | --- |
| \`ROADMAP.md\` | What's being built next, in order, and the standing rules. Start here. |
| \`specs/\` | Feature specs, written before building. A spec wins over the roadmap summary. |
| \`notes/\` | Audits, the parked backlog, anything written down for reference. |
| \`data/\` | Source data that gets built into the app — \`exercises.json\` is inlined into \`index.html\` by \`tools/build-catalogue.cjs\`. Edit here, not in \`index.html\`. |
| \`tools/\` | Build and check scripts, run from the repo root (see below). |
| \`patches/\` | Ready-made fixes to apply with \`git apply\`. Delete a patch once it's applied. |

## Tools

All run from the repo root.

| Command | Does |
| --- | --- |
| \`node "r&d/tools/serve.mjs"\` | Local server on http://localhost:5178 |
| \`node "r&d/tools/bump.cjs" 0.17.0\` | Bumps \`APP_VERSION\`, \`sw.js\` and \`version.json\` together |
| \`node "r&d/tools/lint-scope.js"\` | Finds undeclared identifiers across all script blocks |
| \`node "r&d/tools/validate-exercises.js"\` | Checks \`data/exercises.json\` against the program and the phase 1 spec |
| \`node "r&d/tools/build-catalogue.cjs"\` | Inlines \`data/exercises.json\` into \`index.html\` |
| \`node "r&d/tools/build-foods.cjs"\` | Rebuilds the CoFID food table in \`index.html\` |
| \`node "r&d/tools/build-slew.cjs" ../slew-v2\` | Regenerates \`slew-core.js\` from the Slew source |

Runtime smoke test, in the browser console on the running app:
\`fetch('r&d/tools/smoke.js').then(r => r.text()).then(eval).then(smoke)\`
`);

{
  const f = 'README.md';
  let s = read(f);
  s = s.replace(/^# Ironlog — install on Android\n\nFive files\.[\s\S]*?```\n[\s\S]*?```\n/,
`# Ironlog

Powerlifting / strength training log. An installable web app (PWA) — the repo
root *is* the app; everything else lives in \`r&d/\`.

\`\`\`
index.html              the app (single file)
sw.js                   offline cache + update handling
manifest.webmanifest    name, icon, "open full screen"
version.json            how a running app notices a new build
program.json            bundled training program
slew-core.js            VBT velocity engine (generated — see r&d/tools)
parse-food.js           Netlify function: AI food parsing, keeps the API key server-side
icon-*.png              app icons
r&d/                    roadmap, specs, notes, data sources, build tools — not used by the app
CLAUDE.md               entry point for coding agents
\`\`\`

What's being built next: **\`r&d/ROADMAP.md\`**.

# Install on Android

The app files above must sit in the **same folder** on the host, and the host
must serve over **https** (service workers refuse to run otherwise).
`);
  s = s.replace('select all six files above', 'select all the app files above');
  write(f, s);
}

/* ---- 4. checks ---- */
const tracked = git('ls-files').split('\n').filter(f => f && !f.startsWith('r&d/patches/') && f !== 'reorganise.cjs' && !/\.png$/.test(f));
const real = [];
for (const f of tracked) {
  read(f).split('\n').forEach((line, i) => {
    const bare = line.replace(/r&d\/(tools|specs|notes|data|patches)\//g, '');
    if (/\bdocs\/|(^|[^\w\/-])tools\//.test(bare)) real.push(`${f}:${i + 1}: ${line.slice(0, 120)}`);
  });
}
if (real.length) { console.error('Stale paths left:\n' + real.join('\n')); process.exit(1); }

const snap = read('index.html');
node('r&d/tools/build-catalogue.cjs');
if (read('index.html') !== snap) { console.error('build-catalogue changed index.html — rewrite out of sync'); process.exit(1); }
node('r&d/tools/validate-exercises.js');
const h = read('index.html');
[...h.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].forEach((m, i) => { new Function(m[1]); });
console.log('checks passed: no stale paths, catalogue in sync, exercises valid, scripts parse');

/* ---- 5. commit ---- */
fs.unlinkSync(__filename);
git('add', '-A');
git('commit', '-q', '-m', 'Reorganise: app stays at root, everything else into r&d/');
console.log('\nCommitted. Now: git push');
