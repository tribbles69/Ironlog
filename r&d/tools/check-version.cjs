// Checks the version numbers agree before a commit:
//   version.json "version"  ==  APP_VERSION (js/core.js; index.html before the module split)
//   version.json "sw"       ==  VERSION in sw.js
//   and CHANGELOG.md's top entry is that version.
// If APP_VERSION lags, the running app reports the old version, never matches
// version.json, and the "Update available" sheet comes back on every launch.
//
// And, since the app is several files (r&d/notes/module-split.md), that the
// files agree with each other:
//   every js/*.js, and every other file index.html or a module loads, is
//     precached in sw.js — one left out works online and fails in a basement
//   every precached file exists
//   every `import { x } from './y.js'` names something y.js exports — a wrong
//     one is not an error in one feature, it is a blank page
//   every module parses
// Run:  node "r&d/tools/check-version.cjs"
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { fileWith, rel } = require('./app-source.cjs');
const root = path.join(__dirname, '..', '..');
const rd = f => fs.readFileSync(path.join(root, f), 'utf8');
const vj = JSON.parse(rd('version.json'));
const appFile = fileWith(/const APP_VERSION = '/, 'APP_VERSION');
const app = (fs.readFileSync(appFile, 'utf8').match(/const APP_VERSION = '([^']+)'/) || [])[1];
const sw = (rd('sw.js').match(/const VERSION = '([^']+)'/) || [])[1];
const log = (rd('CHANGELOG.md').match(/^## (\d+\.\d+\.\d+)/m) || [])[1];
const bad = [];
if (app !== vj.version) bad.push(`${rel(appFile)} APP_VERSION ${app} ≠ version.json ${vj.version}`);
if (sw !== vj.sw) bad.push(`sw.js VERSION ${sw} ≠ version.json sw ${vj.sw}`);
if (log !== vj.version) bad.push(`CHANGELOG.md top entry ${log} ≠ version.json ${vj.version}`);

/* ---- the files ---- */
const assets = new Set([...rd('sw.js').match(/const ASSETS = \[([\s\S]*?)\];/)[1].matchAll(/'\.\/([^']*)'/g)].map(m => m[1]));
for (const a of assets) if (a && !fs.existsSync(path.join(root, a))) bad.push(`sw.js precaches ${a}, which does not exist`);
const jsDir = path.join(root, 'js');
/* js/*.js, and the hand-written module that sits at the root beside the generated Slew bundles */
const mods = (fs.existsSync(jsDir) ? fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort().map(f => 'js/' + f) : [])
  .concat(['slew-reps.js'].filter(f => fs.existsSync(path.join(root, f))));
const html = rd('index.html');
const loaded = new Set(mods);
for (const m of html.matchAll(/<(?:script|link)\b[^>]*?\b(?:src|href)="([^"#?:]+\.(?:js|css|json))"/g)) loaded.add(m[1]);
for (const f of loaded) if (!assets.has(f)) bad.push(`${f} is loaded by the app but not precached in sw.js`);
if (mods.length) {
  const entry = (html.match(/<script type="module" src="([^"]+)"/) || [])[1];
  if (!entry) bad.push('index.html has no <script type="module" src=…>');
  const exportsOf = {};
  for (const f of mods) {
    const t = fs.readFileSync(path.join(root, f), 'utf8');
    const ex = exportsOf[f] = new Set();
    for (const m of t.matchAll(/^export\s+(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/gm)) ex.add(m[1]);
    for (const m of t.matchAll(/^export\s+class\s+([A-Za-z_$][\w$]*)/gm)) ex.add(m[1]);
    /* `export const a = 1, b = 2` and `export const { a, b } = …`: the names before the first `=` at depth 0 of each declarator, first line only (as lint-scope reads them) */
    for (const m of t.matchAll(/^export\s+(?:const|let|var)\s+([^\n]*)/gm)) {
      let d = 0, cur = ''; const parts = [];
      for (const ch of m[1]) { if ('([{'.includes(ch)) d++; else if (')]}'.includes(ch)) d--; if (ch === ',' && d === 0) { parts.push(cur); cur = ''; continue; } cur += ch; }
      parts.push(cur);
      for (const p of parts) { const lhs = p.split('=')[0].trim(); if (/^[A-Za-z_$][\w$]*$/.test(lhs)) ex.add(lhs); else if (/^[{[]/.test(lhs)) for (const id of lhs.matchAll(/([A-Za-z_$][\w$]*)/g)) ex.add(id[1]); }
    }
    for (const m of t.matchAll(/^export\s*\{([^}]*)\}/gm)) m[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop()).filter(Boolean).forEach(n => ex.add(n));
  }
  /* The engine side stands alone: nothing at the root may import from the app. */
  for (const f of mods.filter(f => !f.startsWith('js/'))) if (/^import\s/m.test(fs.readFileSync(path.join(root, f), 'utf8'))) bad.push(`${f} has an import — the Slew side takes nothing from Ironlog`);
  for (const f of ['slew-core.js', 'slew-video.js']) if (/^\s*import\s|\brequire\(/m.test(rd(f))) bad.push(`${f} imports something — it is a closed bundle`);
  for (const f of mods) {
    const file = path.join(root, f);
    const t = fs.readFileSync(file, 'utf8');
    for (const m of t.matchAll(/^import\s*(?:\{([^}]*)\}|\*\s+as\s+[\w$]+|[\w$]+)\s*from\s*'([^']+)'/gm)) {
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(f), m[2]));
      if (!fs.existsSync(path.join(root, target))) { bad.push(`${f} imports ${m[2]}, which does not exist`); continue; }
      if (!assets.has(target)) bad.push(`${target} is imported by ${f} but not precached in sw.js`);
      const ex = exportsOf[target];
      if (m[1] && ex) for (const n of m[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]).filter(Boolean)) if (!ex.has(n)) bad.push(`${f} imports ${n} from ${m[2]}, which does not export it`);
    }
    try { cp.execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); }
    catch (e) { bad.push(`${f} does not parse:\n    ${String(e.stderr).split('\n').slice(0, 5).join('\n    ')}`); }
  }
}
if (bad.length) { console.error('Mismatch:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log(`Versions agree: ${vj.version} / ${vj.sw}` + (mods.length ? `; ${mods.length} modules parse, their imports resolve, ${loaded.size} loaded files are precached` : ''));
