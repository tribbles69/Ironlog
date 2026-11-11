#!/usr/bin/env node
/* Measure and video against a reference device (roadmap 00-V4,
   r&d/notes/vbt-validation.md → Protocol).

   Ironlog's side comes from Settings → Export raw traces (format
   ironlog-vbt-raw, v3 or later: it lists every measured set of the last 60
   days under "readings", sensor and video). The reference device's side is a
   CSV you fill in, one row per set:

     at,date,exercise,set,source,kg,reps,ironlog_mps,ref_device,ref_mps,true_rir,e1rm_tested_kg

   - ref_mps: the device's mean concentric velocity for each rep, in order,
     separated by spaces ("0.62 0.58 0.55").
   - true_rir: leave as exported unless the RIR on the set was the sensor's
     own (those come out blank — type what it really was, or leave blank).
   - e1rm_tested_kg: optional, a tested single within 3 days, for the e1RM
     range check (not computed yet — the column is kept for it).

   Usage:
     node "r&d/tools/vbt-validate.cjs" --template export.json > reference.csv
     node "r&d/tools/vbt-validate.cjs" export.json reference.csv

   Prints, per lift and source: reps compared, MCV bias (Ironlog − reference),
   Bland–Altman limits of agreement (bias ± 1.96 SD), and the RIR mean
   absolute error against typed RIRs — then the same as rows for the results
   table in the note.
*/
const fs = require('fs');
const args = process.argv.slice(2);
const template = args[0] === '--template';
const files = template ? args.slice(1) : args;
if (!files[0] || (!template && !files[1])) {
  console.error('usage: vbt-validate.cjs --template export.json > reference.csv\n       vbt-validate.cjs export.json reference.csv');
  process.exit(1);
}
const exp = JSON.parse(fs.readFileSync(files[0], 'utf8'));
if (exp.format !== 'ironlog-vbt-raw') { console.error('not an Ironlog bar-speed export'); process.exit(1); }
if (!Array.isArray(exp.readings)) { console.error('this export has no "readings" (made before 0.93.1) — export again from the app'); process.exit(1); }

const cell = v => { const s = v == null ? '' : String(v); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const HEAD = ['at', 'date', 'exercise', 'set', 'source', 'kg', 'reps', 'ironlog_mps', 'ref_device', 'ref_mps', 'true_rir', 'e1rm_tested_kg'];

if (template) {
  const rows = [HEAD, ...exp.readings.map(r => [r.at, r.date, r.exercise, r.set, r.source + (r.place === 'pocket' ? '-pocket' : ''), r.w, r.r,
    r.v.map(x => x.toFixed(2)).join(' '), '', '', r.rirFrom === 'typed' ? r.rir : '', ''])];
  process.stdout.write(rows.map(r => r.map(cell).join(',')).join('\n') + '\n');
  process.exit(0);
}

function parseCSV(text) {
  const rows = []; let row = [], f = '', q = false;
  const t = text.replace(/^﻿/, '');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  const h = rows[0].map(x => x.trim());
  return rows.slice(1).filter(r => r.some(x => x.trim() !== '')).map(r => Object.fromEntries(h.map((k, i) => [k, (r[i] || '').trim()])));
}
const ref = parseCSV(fs.readFileSync(files[1], 'utf8'));
const byAt = new Map(exp.readings.map(r => [String(r.at), r]));
const nums = s => String(s || '').split(/[\s;/]+/).map(Number).filter(x => Number.isFinite(x) && x > 0);
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const sd = a => { if (a.length < 2) return NaN; const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); };

const groups = new Map();   // "lift · source" -> { diffs, rirErr, sets, device, mismatched }
const group = k => groups.get(k) || groups.set(k, { diffs: [], rirErr: [], sets: 0, devices: new Set(), mismatched: 0, dates: new Set() }).get(k);
let skipped = 0;
ref.forEach(row => {
  const r = byAt.get(row.at);
  const rv = nums(row.ref_mps);
  if (!r) { skipped++; return; }
  const g = group(`${r.lift || r.exercise} · ${row.source || r.source}`);
  if (rv.length) {
    g.sets++; g.dates.add(r.date); if (row.ref_device) g.devices.add(row.ref_device);
    /* Reps are paired in order. If the counts differ, a rep was missed or
       invented and pairing would compare different reps — so that set is
       counted as mismatched and left out of the speed figures. */
    if (rv.length !== r.v.length) g.mismatched++;
    else r.v.forEach((v, i) => g.diffs.push(v - rv[i]));
  }
  const tr = row.true_rir === '' ? NaN : Number(row.true_rir);
  if (Number.isFinite(tr) && r.est && Number.isFinite(r.est.rir) && !r.est.atLeast && r.v.length >= r.r) g.rirErr.push(Math.abs(r.est.rir - tr));
});

if (!groups.size) { console.log('Nothing to compare: no row in the reference file matched a reading in the export (matched on the "at" column).'); process.exit(0); }
const f3 = x => Number.isFinite(x) ? (x >= 0 ? '+' : '') + x.toFixed(3) : '—';
const table = [];
for (const [k, g] of groups) {
  const bias = g.diffs.length ? mean(g.diffs) : NaN, s = sd(g.diffs);
  const loa = Number.isFinite(s) ? `${f3(bias - 1.96 * s)} to ${f3(bias + 1.96 * s)}` : '—';
  const mae = g.rirErr.length ? mean(g.rirErr).toFixed(1) + ` (n=${g.rirErr.length})` : '—';
  console.log(`${k}\n   sets with reference speeds ${g.sets}${g.mismatched ? `, ${g.mismatched} left out (rep counts differ)` : ''} · reps compared ${g.diffs.length}\n   MCV bias ${f3(bias)} m/s · limits of agreement ${loa} m/s · RIR mean absolute error ${mae}`);
  table.push(`| ${[...g.dates].sort().join(', ') || '—'} | ${k} | ${[...g.devices].join(', ') || '—'} | ${g.sets} | ${f3(bias)} | ${loa} | ${mae} | — |`);
}
if (skipped) console.log(`\n${skipped} reference row(s) matched no reading in the export and were skipped.`);
console.log('\nRows for r&d/notes/vbt-validation.md → Results:\n');
console.log('| date | lift | device | sets | MCV bias (m/s) | LoA (m/s) | RIR MAE | e1RM in range |\n|---|---|---|---|---|---|---|---|');
table.forEach(r => console.log(r));
