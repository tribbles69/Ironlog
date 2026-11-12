#!/usr/bin/env node
/* Inline r&d/data/exercises.json into index.html as the EXERCISE_CATALOGUE line.

   The catalogue is core: identity resolution runs on every screen, so a failed
   fetch would be fatal rather than degraded. It is inlined for that reason,
   where the 343 KB program — needed only on demand — is extracted to
   program.json instead. 65 KB in, 343 KB out.

   Run from the repo root after editing r&d/data/exercises.json:
       node "r&d/tools/build-catalogue.cjs"
   Then bump APP_VERSION and sw.js VERSION.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const { fileWith, rel } = require('./app-source.cjs');
const SRC = path.join(ROOT, 'r&d/data/exercises.json');

const cat = JSON.parse(fs.readFileSync(SRC, 'utf8'));
if (!Array.isArray(cat.movements) || !cat.movements.length) throw new Error('no movements in r&d/data/exercises.json');
if (!cat.vocabularies) throw new Error('no vocabularies in r&d/data/exercises.json');

/* the line is in js/exercises.js since the module split; found by pattern, so it follows the code */
const re = /^(export )?const EXERCISE_CATALOGUE = .*;$/m;
const INDEX = fileWith(re, 'the EXERCISE_CATALOGUE line');
let idx = fs.readFileSync(INDEX, 'utf8');
const line = 'const EXERCISE_CATALOGUE = ' + JSON.stringify(cat) + ';';

idx = idx.replace(re, (m, ex) => (ex || '') + line);
fs.writeFileSync(INDEX, idx);

console.log(`inlined ${cat.movements.length} movements (${(line.length / 1024).toFixed(1)} KB) into ${rel(INDEX)}`);
console.log('now bump APP_VERSION and sw.js VERSION');
