#!/usr/bin/env node
/* Inline docs/exercises.json into index.html as the EXERCISE_CATALOGUE line.

   The catalogue is core: identity resolution runs on every screen, so a failed
   fetch would be fatal rather than degraded. It is inlined for that reason,
   where the 343 KB program — needed only on demand — is extracted to
   program.json instead. 65 KB in, 343 KB out.

   Run from the repo root after editing docs/exercises.json:
       node tools/build-catalogue.cjs
   Then bump APP_VERSION and sw.js VERSION.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const SRC = path.join(ROOT, 'docs/exercises.json');

const cat = JSON.parse(fs.readFileSync(SRC, 'utf8'));
if (!Array.isArray(cat.movements) || !cat.movements.length) throw new Error('no movements in docs/exercises.json');
if (!cat.vocabularies) throw new Error('no vocabularies in docs/exercises.json');

let idx = fs.readFileSync(INDEX, 'utf8');
const nl = idx.includes('\r\n') ? '\r\n' : '\n';
const re = /^const EXERCISE_CATALOGUE = .*;$/m;
const line = 'const EXERCISE_CATALOGUE = ' + JSON.stringify(cat) + ';';

if (!re.test(idx)) throw new Error('EXERCISE_CATALOGUE line not found in index.html');
idx = idx.replace(re, () => line);
fs.writeFileSync(INDEX, idx);

console.log(`inlined ${cat.movements.length} movements (${(line.length / 1024).toFixed(1)} KB) into index.html`);
console.log('now bump APP_VERSION and sw.js VERSION');
