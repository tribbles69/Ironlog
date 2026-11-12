#!/usr/bin/env node
/* Bump the app version in the three places that must agree.

     APP_VERSION   const APP_VERSION = 'x.y.z'   (js/core.js; index.html before the module split)
     sw.js         const VERSION = 'ironlog-vN'      (N + 1)
     version.json  what the running app fetches to notice a new build

   Doing this by hand went wrong twice: once the bump silently failed because
   the branch was a version behind, and once index.html and sw.js were served
   briefly disagreeing. One command, or the mistake comes back.

   Usage:  node "r&d/tools/bump.cjs" 0.13.0
           node "r&d/tools/bump.cjs" --cache     the service worker's cache only: the
                                                 files changed but nothing a user would
                                                 notice did, so the app version stays
*/
const fs = require('fs');
const path = require('path');
const { fileWith, rel } = require('./app-source.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const cacheOnly = process.argv[2] === '--cache';
const next = process.argv[2];
if (!cacheOnly && !/^\d+\.\d+\.\d+$/.test(next || '')) {
  console.error('usage: node "r&d/tools/bump.cjs" <x.y.z> | --cache');
  process.exit(1);
}

const IDX = fileWith(/const APP_VERSION = '/, 'APP_VERSION');
const SW = path.join(ROOT, 'sw.js');
const VER = path.join(ROOT, 'version.json');

let idx = fs.readFileSync(IDX, 'utf8');
const cur = (idx.match(/const APP_VERSION = '([^']+)'/) || [])[1];
if (!cur) throw new Error('APP_VERSION not found');
if (cur === next) throw new Error(`${rel(IDX)} is already ${next}`);
const want = cacheOnly ? cur : next;

let sw = fs.readFileSync(SW, 'utf8');
const swCur = (sw.match(/const VERSION = 'ironlog-v(\d+)'/) || [])[1];
if (!swCur) throw new Error('sw.js VERSION not found');
const swNext = `ironlog-v${+swCur + 1}`;

idx = idx.replace(/const APP_VERSION = '[^']+'/, `const APP_VERSION = '${want}'`);
sw = sw.replace(/const VERSION = 'ironlog-v\d+'/, `const VERSION = '${swNext}'`);

if (!cacheOnly) fs.writeFileSync(IDX, idx);
fs.writeFileSync(SW, sw);
fs.writeFileSync(VER, JSON.stringify({ version: want, sw: swNext }) + '\n');

// read back, so a silent no-op replace cannot pass
const check = {
  index: (fs.readFileSync(IDX, 'utf8').match(/const APP_VERSION = '([^']+)'/) || [])[1],
  sw: (fs.readFileSync(SW, 'utf8').match(/const VERSION = '([^']+)'/) || [])[1],
  json: JSON.parse(fs.readFileSync(VER, 'utf8')),
};
if (check.index !== want || check.sw !== swNext || check.json.version !== want || check.json.sw !== swNext) {
  throw new Error('verification failed: ' + JSON.stringify(check));
}
console.log(cacheOnly ? `cache only: sw ironlog-v${swCur} -> ${swNext}   app stays ${cur}   version.json written`
  : `${cur} -> ${next}   sw ironlog-v${swCur} -> ${swNext}   version.json written`);
