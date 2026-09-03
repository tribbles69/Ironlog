#!/usr/bin/env node
/* Regenerate the FOOD_DB line in index.html from CoFID.

   CoFID is McCance & Widdowson's The Composition of Foods Integrated Dataset,
   published by the Office for Health Improvement and Disparities under the
   Open Government Licence v3. Crown copyright.

   Usage:
     node tools/build-foods.cjs            download the current CoFID and rebuild
     node tools/build-foods.cjs file.xlsx  rebuild from a local copy

   It rewrites the single `const FOOD_DB = "…";` line in index.html in place and
   leaves everything else untouched, so the diff is one line. Remember to bump
   APP_VERSION and sw.js VERSION afterwards. */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const PAGE = 'https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid';

function sh(cmd, args) { return execFileSync(cmd, args, { maxBuffer: 1 << 28 }); }

/* Only the proximates sheet is needed: energy and the four macros. */
function readSheet(xdir, wantName) {
  const wb = fs.readFileSync(path.join(xdir, 'xl/workbook.xml'), 'utf8');
  const rels = fs.readFileSync(path.join(xdir, 'xl/_rels/workbook.xml.rels'), 'utf8');
  const relMap = {};
  for (const m of rels.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) relMap[m[1]] = m[2];
  let target = null;
  for (const m of wb.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)) {
    if (m[1] === wantName) target = relMap[m[2]];
  }
  if (!target) throw new Error('sheet not found: ' + wantName);

  const shared = [];
  const ssPath = path.join(xdir, 'xl/sharedStrings.xml');
  if (fs.existsSync(ssPath)) {
    for (const m of fs.readFileSync(ssPath, 'utf8').matchAll(/<si>([\s\S]*?)<\/si>/g)) {
      let s = '';
      for (const t of m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)) s += t[1];
      shared.push(s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                   .replace(/&quot;/g, '"').replace(/&apos;/g, "'"));
    }
  }

  const xml = fs.readFileSync(path.join(xdir, 'xl', target.replace(/^\/?xl\//, '')), 'utf8');
  const rows = [];
  for (const rm of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = [];
    for (const cm of rm[1].matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cm[1], inner = cm[2];
      const refM = /r="([A-Z]+)\d+"/.exec(attrs);
      const col = refM ? refM[1].split('').reduce((a, ch) => a * 26 + (ch.charCodeAt(0) - 64), 0) - 1 : cells.length;
      const vm = /<v>([\s\S]*?)<\/v>/.exec(inner);
      let v = '';
      if (/t="(inlineStr|str)"/.test(attrs)) { const t = /<t[^>]*>([\s\S]*?)<\/t>/.exec(inner); v = t ? t[1] : (vm ? vm[1] : ''); }
      else if (vm) v = /t="s"/.test(attrs) ? (shared[+vm[1]] ?? '') : vm[1];
      cells[col] = v;
    }
    rows.push(cells);
  }
  return rows;
}

let xlsx = process.argv[2];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cofid-'));
if (!xlsx) {
  console.log('finding the current CoFID release…');
  const html = sh('curl', ['-sSL', '--max-time', '60', PAGE]).toString();
  const url = (html.match(/https:\/\/assets\.publishing\.service\.gov\.uk\/[^"]+\.xlsx/g) || [])
    .find(u => /Integrated_Dataset/i.test(u));
  if (!url) throw new Error('could not find the CoFID spreadsheet link on ' + PAGE);
  console.log('downloading ' + url);
  xlsx = path.join(tmp, 'cofid.xlsx');
  sh('curl', ['-sSL', '--max-time', '300', '-o', xlsx, url]);
}

const xdir = path.join(tmp, 'x');
fs.mkdirSync(xdir, { recursive: true });
sh('unzip', ['-o', '-q', xlsx, '-d', xdir]);

const rows = readSheet(xdir, '1.3 Proximates');
const hdr = (rows[0] || []).map(x => String(x || '').toLowerCase().replace(/\s+/g, ' ').trim());
const cName = hdr.findIndex(h => h.includes('food name'));
const cKcal = hdr.findIndex(h => /kcal/.test(h));
const cProt = hdr.findIndex(h => h.includes('protein'));
const cCarb = hdr.findIndex(h => /^carbohydrate/.test(h));
const cFat = hdr.findIndex(h => /^fat\b/.test(h));
const cFib = hdr.findIndex(h => /aoac/.test(h));
if ([cName, cKcal, cProt, cCarb, cFat].some(i => i < 0)) throw new Error('unexpected CoFID columns: ' + JSON.stringify(hdr.slice(0, 14)));

/* CoFID writes "Tr" for trace, "N" for not measured and "(12)" for estimated. */
const num = v => {
  const s = String(v == null ? '' : v).replace(/[^\d.\-]/g, '');
  if (!s) return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
};
const r1 = n => n == null ? '' : String(Math.round(n * 10) / 10);

const out = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i] || [];
  const name = String(r[cName] || '').trim();
  const kcal = num(r[cKcal]);
  if (!name || kcal == null) continue;
  out.push([name, String(Math.round(kcal)), r1(num(r[cProt])), r1(num(r[cCarb])), r1(num(r[cFat])), r1(num(r[cFib]))].join('\t'));
}
console.log(out.length + ' foods');

let idx = fs.readFileSync(INDEX, 'utf8');
const re = /const FOOD_DB = "(?:[^"\\]|\\.)*";/;
if (!re.test(idx)) throw new Error('FOOD_DB line not found in index.html');
idx = idx.replace(re, 'const FOOD_DB = ' + JSON.stringify(out.join('\n')) + ';');
fs.writeFileSync(INDEX, idx);
console.log('rewrote FOOD_DB in index.html — now bump APP_VERSION and sw.js VERSION');
