#!/usr/bin/env node
/* Bump the app version in the three places that must agree.

     index.html    const APP_VERSION = 'x.y.z'
     sw.js         const VERSION = 'ironlog-vN'      (N + 1)
     version.json  what the running app fetches to notice a new build

   Doing this by hand went wrong twice: once the bump silently failed because
   the branch was a version behind, and once index.html and sw.js were served
   briefly disagreeing. One command, or the mistake comes back.

   Usage:  node tools/bump.cjs 0.13.0
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const next = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(next || '')) {
  console.error('usage: node tools/bump.cjs <x.y.z>');
  process.exit(1);
}

const IDX = path.join(ROOT, 'index.html');
const SW = path.join(ROOT, 'sw.js');
const VER = path.join(ROOT, 'version.json');

let idx = fs.readFileSync(IDX, 'utf8');
const cur = (idx.match(/const APP_VERSION = '([^']+)'/) || [])[1];
if (!cur) throw new Error('APP_VERSION not found in index.html');
if (cur === next) throw new Error(`index.html is already ${next}`);

let sw = fs.readFileSync(SW, 'utf8');
const swCur = (sw.match(/const VERSION = 'ironlog-v(\d+)'/) || [])[1];
if (!swCur) throw new Error('sw.js VERSION not found');
const swNext = `ironlog-v${+swCur + 1}`;

idx = idx.replace(/const APP_VERSION = '[^']+'/, `const APP_VERSION = '${next}'`);
sw = sw.replace(/const VERSION = 'ironlog-v\d+'/, `const VERSION = '${swNext}'`);

fs.writeFileSync(IDX, idx);
fs.writeFileSync(SW, sw);
fs.writeFileSync(VER, JSON.stringify({ version: next, sw: swNext }) + '\n');

// read back, so a silent no-op replace cannot pass
const check = {
  index: (fs.readFileSync(IDX, 'utf8').match(/const APP_VERSION = '([^']+)'/) || [])[1],
  sw: (fs.readFileSync(SW, 'utf8').match(/const VERSION = '([^']+)'/) || [])[1],
  json: JSON.parse(fs.readFileSync(VER, 'utf8')),
};
if (check.index !== next || check.sw !== swNext || check.json.version !== next || check.json.sw !== swNext) {
  throw new Error('verification failed: ' + JSON.stringify(check));
}
console.log(`${cur} -> ${next}   sw ironlog-v${swCur} -> ${swNext}   version.json written`);
