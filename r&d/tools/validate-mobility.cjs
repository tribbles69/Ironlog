#!/usr/bin/env node
/* Validates r&d/data/mobility.json, the stretch and mobility library, and checks
   it against the built-in routines (r&d/data/routines/*.json).

   Exits non-zero on any failure. Run from the repo root:
       node "r&d/tools/validate-mobility.cjs"
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'r&d/data/mobility.json'), 'utf8'));
const V = J.vocabularies, I = J.items;
const DIR = path.join(ROOT, 'r&d/data/routines');
const routines = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

let fail = 0;
const ok = (cond, label, detail) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + label + (!cond && detail ? '  ' + detail : ''));
  if (!cond) fail++;
};

ok(J.schemaVersion === 1, 'schemaVersion is 1');
const ids = I.map(x => x.id);
ok(new Set(ids).size === ids.length, `item ids unique (${ids.length})`);
ok(ids.every(id => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)), 'ids are lower-case slugs');

/* names and aliases resolve to one item, like the exercise catalogue */
const seen = new Map(), dupes = [];
I.forEach(x => [x.name, ...(x.aliases || [])].forEach(n => {
  const k = n.toLowerCase();
  if (seen.has(k) && seen.get(k) !== x.id) dupes.push(`${n} [${seen.get(k)} & ${x.id}]`);
  else seen.set(k, x.id);
}));
ok(dupes.length === 0, 'no case-insensitive name/alias collisions', dupes.slice(0, 5).join('; '));

const bad = [];
I.forEach(x => {
  if (!V.region.includes(x.region)) bad.push(`${x.id} region:${x.region}`);
  if (!V.style.includes(x.style)) bad.push(`${x.id} style:${x.style}`);
  (x.joints || []).forEach(j => !V.joints.includes(j) && bad.push(`${x.id} joint:${j}`));
  if (!Array.isArray(x.targets) || !x.targets.length) bad.push(`${x.id} no targets`);
  if (!x.cue) bad.push(`${x.id} no cue`);
  if (!(x.hold > 0 || x.reps > 0 || Array.isArray(x.holdRange))) bad.push(`${x.id} no dose`);
  if (x.swap && !ids.includes(x.swap)) bad.push(`${x.id} swap:${x.swap} not in library`);
  if (x.swap && I.find(y => y.id === x.swap).endRange) bad.push(`${x.id} swaps to another end-range item`);
});
ok(bad.length === 0, 'vocabulary, dose, cue and swap references valid', bad.slice(0, 6).join('; '));

/* the joints vocabulary is the app's Go easy on list */
const health = fs.readFileSync(path.join(ROOT, 'js/health.js'), 'utf8');
const mj = (health.match(/MOB_JOINTS = (\[.*?\]);/) || [])[1];
const appJoints = mj ? JSON.parse(mj.replace(/'/g, '"')).map(p => p[0]) : [];
ok(JSON.stringify(appJoints) === JSON.stringify(V.joints), 'joints match MOB_JOINTS in js/health.js', appJoints.join(','));

/* every built-in routine item is in the library under the same id and name */
const missing = [];
routines.forEach(r => r.zones.forEach(z => z.items.forEach(it => {
  const x = I.find(y => y.id === it.id);
  if (!x) missing.push(`${r.id}/${it.id}`);
  else if (x.name !== it.name) missing.push(`${r.id}/${it.id} name differs`);
})));
ok(missing.length === 0, 'every routine item is a library item', missing.slice(0, 5).join('; '));

console.log(`\n  ${I.length} items — ` + V.style.map(s => `${s} ${I.filter(x => x.style === s).length}`).join(', ') +
  ` — ${I.filter(x => x.endRange).length} end-range`);
console.log(fail ? `\n${fail} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
process.exit(fail ? 1 : 0);
