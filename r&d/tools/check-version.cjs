// Checks the three version numbers agree before a commit:
//   version.json "version"  ==  APP_VERSION in index.html
//   version.json "sw"       ==  VERSION in sw.js
//   and CHANGELOG.md's top entry is that version.
// If APP_VERSION lags, the running app reports the old version, never matches
// version.json, and the "Update available" sheet comes back on every launch.
// Run:  node "r&d/tools/check-version.cjs"
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..');
const rd = f => fs.readFileSync(path.join(root, f), 'utf8');
const vj = JSON.parse(rd('version.json'));
const app = (rd('index.html').match(/const APP_VERSION = '([^']+)'/) || [])[1];
const sw = (rd('sw.js').match(/const VERSION = '([^']+)'/) || [])[1];
const log = (rd('CHANGELOG.md').match(/^## (\d+\.\d+\.\d+)/m) || [])[1];
const bad = [];
if (app !== vj.version) bad.push(`index.html APP_VERSION ${app} ≠ version.json ${vj.version}`);
if (sw !== vj.sw) bad.push(`sw.js VERSION ${sw} ≠ version.json sw ${vj.sw}`);
if (log !== vj.version) bad.push(`CHANGELOG.md top entry ${log} ≠ version.json ${vj.version}`);
if (bad.length) { console.error('Version mismatch:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log(`Versions agree: ${vj.version} / ${vj.sw}`);
