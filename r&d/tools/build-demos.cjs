#!/usr/bin/env node
/* Inline r&d/data/demos/ into index.html as the DEMO_PATTERNS, DEMO_MAP and
   DEMO_TEXT lines (exercise demos, spec r&d/specs/exercise-demo-spec.md).

     r&d/data/demos/patterns.json          the movement patterns + their text
     r&d/data/demos/movements/<id>.json    one file per mapped movement:
                                           { pattern, o?: overrides, text? }

   Adding a movement is one new file in movements/ and a run of this script
   (the demo lab can write the file for you). Validation runs first: an
   unknown key is an error, because a typo like "thighs" would otherwise do
   nothing and look like a bug in the engine.

   Run from the repo root:
       node "r&d/tools/build-demos.cjs"            build
       node "r&d/tools/build-demos.cjs" --check    validate only, write nothing
       node "r&d/tools/build-demos.cjs" --format   also rewrite the JSON files in house style
   Then node "r&d/tools/demo-check.cjs", bump, changelog.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const INDEX = path.join(ROOT, 'index.html');
const DIR = path.join(ROOT, 'r&d/data/demos');
const MOVES = path.join(DIR, 'movements');
const CATALOGUE = path.join(ROOT, 'r&d/data/exercises.json');

/* Every key the engine reads. Keep in step with the spec's key reference. */
const KEYS = new Set([
  'base', 'concentric', 'path', 'labels',
  'shin', 'thigh', 'torso', 'solve', 'barX', 'hold',
  'arms', 'elbow', 'hand', 'upperArm', 'foreArm',
  'frontX', 'rear', 'rearToe', 'rearBench', 'hipKF',
  'thighA', 'shinA', 'kneePad', 'backPad', 'footPlate',
  'incline', 'legsUp', 'rootFrom', 'rootTo', 'abduct', 'elbowBend',
  'draw', 'rail', 'ssb', 'plateR', 'anchor', 'box', 'pins', 'preacher', 'chestPad',
]);
const ENUMS = {
  base: ['stand', 'split', 'seat', 'bench', 'hang', 'front'],
  concentric: ['go', 'back'],
  path: ['midfoot', null],
  solve: ['midfoot', null],
  hold: ['back', 'front', 'goblet', 'hands'],
  arms: ['hold', 'target', 'angles'],
  elbow: ['down', 'up', 'fwd', 'back'],
  draw: ['barbell', 'trap', 'log', 'dumbbell', 'kettlebell', 'plate', 'cable', 'band', 'belt', 'none'],
};
const TEXT_KEYS = new Set(['setup', 'cues', 'mistakes', 'variants']);

/* House style: objects one key per line, short arrays of plain values on one
   line — so a keyframe reads [0, 38], not five lines. */
function fmt(v, ind = '') {
  const flat = x => x === null || typeof x !== 'object' || (Array.isArray(x) && x.every(y => y === null || typeof y !== 'object' || (Array.isArray(y) && y.every(z => typeof z !== 'object'))));
  const line = x => Array.isArray(x) ? `[${x.map(line).join(', ')}]` : JSON.stringify(x);
  if (Array.isArray(v) && flat(v)) {
    const one = line(v);
    if (one.length <= 100 || v.every(x => typeof x !== 'string')) return one;
  }
  if (Array.isArray(v)) return `[\n${v.map(x => ind + '  ' + fmt(x, ind + '  ')).join(',\n')}\n${ind}]`;
  if (v && typeof v === 'object') {
    const ks = Object.keys(v);
    if (!ks.length) return '{}';
    return `{\n${ks.map(k => `${ind}  ${JSON.stringify(k)}: ${fmt(v[k], ind + '  ')}`).join(',\n')}\n${ind}}`;
  }
  return JSON.stringify(v);
}

function main() {
  const args = process.argv.slice(2);
  const errs = [], warns = [];
  const cat = JSON.parse(fs.readFileSync(CATALOGUE, 'utf8')).movements;
  const byId = new Map(cat.map(m => [m.id, m]));
  const patterns = JSON.parse(fs.readFileSync(path.join(DIR, 'patterns.json'), 'utf8'));
  const checkKeys = (where, o, isPattern) => {
    Object.entries(o || {}).forEach(([k, v]) => {
      if (k === 'eq') {
        if (!v || typeof v !== 'object') return errs.push(`${where}: eq must be an object`);
        return Object.entries(v).forEach(([e, ov]) => checkKeys(`${where} eq.${e}`, ov));
      }
      if (k === 'text' && isPattern) return;
      if (!KEYS.has(k)) return errs.push(`${where}: unknown key "${k}"`);
      if (ENUMS[k] && !ENUMS[k].includes(v)) errs.push(`${where}: ${k} must be one of ${ENUMS[k].map(String).join(', ')} (got ${JSON.stringify(v)})`);
      if (k === 'labels' && (!Array.isArray(v) || v.length !== 4)) errs.push(`${where}: labels needs 4 phases (start, go, far end, back)`);
    });
  };
  const checkText = (where, t) => {
    if (!t) return;
    Object.keys(t).forEach(k => { if (!TEXT_KEYS.has(k)) errs.push(`${where}: unknown text key "${k}"`); });
    if (t.cues && t.cues.length !== 3) warns.push(`${where}: ${t.cues.length} cues (the spec says 3)`);
    if (t.mistakes && (t.mistakes.length < 2 || t.mistakes.length > 4)) warns.push(`${where}: ${t.mistakes.length} mistakes (the spec says 2–3)`);
  };

  Object.entries(patterns).forEach(([k, p]) => {
    const { text, ...rest } = p;
    checkKeys(`pattern ${k}`, rest, true);
    if (!rest.base) errs.push(`pattern ${k}: needs a base`);
    if (!rest.labels) errs.push(`pattern ${k}: needs labels`);
    if (!rest.eq || !rest.eq._) errs.push(`pattern ${k}: needs eq._ (what to draw by default)`);
    checkText(`pattern ${k} text`, text);
    if (!text || !text.setup) warns.push(`pattern ${k}: no setup text`);
  });

  const map = {}, mtext = {};
  const files = fs.readdirSync(MOVES).filter(f => f.endsWith('.json')).sort();
  files.forEach(f => {
    const id = f.replace(/\.json$/, '');
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(MOVES, f), 'utf8')); } catch (e) { return errs.push(`${f}: ${e.message}`); }
    const m = byId.get(id);
    if (!m) errs.push(`${f}: no movement with id "${id}" in exercises.json`);
    if (!patterns[d.pattern]) return errs.push(`${f}: unknown pattern "${d.pattern}"`);
    Object.keys(d).forEach(k => { if (!['pattern', 'o', 'text'].includes(k)) errs.push(`${f}: unknown top-level key "${k}" (overrides go in "o")`); });
    checkKeys(f, d.o);
    checkText(`${f} text`, d.text);
    if (m) {
      const mv = (d.text || {}).variants || {};
      Object.keys(mv).forEach(e => { if (!m.equipment.includes(e)) warns.push(`${f}: variant note for ${e}, which ${id} doesn't list`); });
    }
    map[id] = d.o && Object.keys(d.o).length ? { pattern: d.pattern, o: d.o } : { pattern: d.pattern };
    if (d.text && Object.keys(d.text).length) mtext[id] = d.text;
    if (args.includes('--format')) fs.writeFileSync(path.join(MOVES, f), fmt(d) + '\n');
  });
  if (args.includes('--format')) fs.writeFileSync(path.join(DIR, 'patterns.json'), fmt(patterns) + '\n');

  warns.forEach(w => console.log('warn  ' + w));
  if (errs.length) { errs.forEach(e => console.log('ERROR ' + e)); process.exit(1); }
  if (args.includes('--check')) return console.log(`ok: ${Object.keys(patterns).length} patterns, ${files.length} movements`);

  const pats = {}, ptext = {};
  Object.entries(patterns).forEach(([k, p]) => { const { text, ...rest } = p; pats[k] = rest; if (text) ptext[k] = text; });
  let idx = fs.readFileSync(INDEX, 'utf8');
  const put = (name, value) => {
    const re = new RegExp(`^const ${name} = .*;$`, 'm');
    if (!re.test(idx)) throw new Error(`${name} line not found in index.html`);
    idx = idx.replace(re, () => `const ${name} = ${JSON.stringify(value)};`);
  };
  put('DEMO_PATTERNS', pats);
  put('DEMO_MAP', map);
  put('DEMO_TEXT', { pattern: ptext, movement: mtext });
  fs.writeFileSync(INDEX, idx);
  console.log(`inlined ${Object.keys(pats).length} patterns and ${files.length} movements into index.html`);
}

module.exports = { fmt, KEYS, ENUMS };
if (require.main === module) main();
