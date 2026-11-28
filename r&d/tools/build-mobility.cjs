#!/usr/bin/env node
/* Inline r&d/data/mobility.json (the stretch and mobility library) into the app
   as the MOBILITY_LIBRARY line, beside BUILTIN_ROUTINES.

   Inlined rather than fetched for the same reason the routines are: Mobility
   has to work offline the moment it opens. Validates first.

   Run from the repo root after editing r&d/data/mobility.json:
       node "r&d/tools/build-mobility.cjs"
   Then bump APP_VERSION and sw.js VERSION.
*/
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const { fileWith, rel } = require('./app-source.cjs');
execFileSync(process.execPath, [path.join(__dirname, 'validate-mobility.cjs')], { stdio: ['ignore', 'ignore', 'inherit'] });

const lib = JSON.parse(fs.readFileSync(path.join(ROOT, 'r&d/data/mobility.json'), 'utf8'));
const re = /^(export )?const MOBILITY_LIBRARY = .*;$/m;
const FILE = fileWith(re, 'the MOBILITY_LIBRARY line');
const line = 'const MOBILITY_LIBRARY = ' + JSON.stringify(lib) + ';';
fs.writeFileSync(FILE, fs.readFileSync(FILE, 'utf8').replace(re, (m, ex) => (ex || '') + line));
console.log(`inlined ${lib.items.length} mobility items (${(line.length / 1024).toFixed(1)} KB) into ${rel(FILE)}`);
console.log('now bump APP_VERSION and sw.js VERSION');
