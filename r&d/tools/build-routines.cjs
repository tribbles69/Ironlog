#!/usr/bin/env node
/* Inline r&d/data/routines/*.json into index.html as the BUILTIN_ROUTINES line.

   Built-in mobility routines (roadmap E5). Small, and needed offline the
   moment someone taps Mobility, so they're inlined like the exercise
   catalogue rather than fetched.

   Run from the repo root after editing a routine:
       node "r&d/tools/build-routines.cjs"
   Then bump APP_VERSION and sw.js VERSION.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const INDEX = path.join(ROOT, 'index.html');
const DIR = path.join(ROOT, 'r&d/data/routines');

const routines = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort()
  .map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const ids = new Set();
routines.forEach(r => {
  if (!r.id || !Array.isArray(r.zones) || !r.zones.length) throw new Error(`routine without id or zones: ${r.name}`);
  if (ids.has(r.id)) throw new Error(`duplicate routine id ${r.id}`);
  ids.add(r.id);
  const items = new Set();
  r.zones.forEach(z => z.items.forEach(it => {
    if (!it.id) throw new Error(`${r.id}: item without id: ${it.name}`);
    if (items.has(it.id)) throw new Error(`${r.id}: duplicate item id ${it.id}`);
    items.add(it.id);
  }));
});

let idx = fs.readFileSync(INDEX, 'utf8');
const re = /^const BUILTIN_ROUTINES = .*;$/m;
if (!re.test(idx)) throw new Error('BUILTIN_ROUTINES line not found in index.html');
const line = 'const BUILTIN_ROUTINES = ' + JSON.stringify(routines) + ';';
idx = idx.replace(re, () => line);
fs.writeFileSync(INDEX, idx);
console.log(`inlined ${routines.length} routine(s) (${(line.length / 1024).toFixed(1)} KB) into index.html`);
