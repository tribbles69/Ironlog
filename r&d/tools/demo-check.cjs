#!/usr/bin/env node
/* Check every exercise demo and draw a contact sheet — no browser needed.

   For each mapped movement, every equipment it lists, at 11 points through
   the rep:
     error  the pose throws, has NaN in it, or puts the body through the floor
     warn   a hand can't reach its target (the IK clamped it), the bar leaves
            midfoot on a pattern that promises it, or a foot floats
   Then coverage: catalogue movements with no figure yet, and equipment with
   no variant note.

   The sheet is one HTML file with every figure at the start, middle and end
   of the rep (both skins with --98). Open it in any browser; with Playwright
   installed, --png also screenshots it.

   Run from the repo root:
       node "r&d/tools/demo-check.cjs"                       everything
       node "r&d/tools/demo-check.cjs" lunge front-squat     just these (id or id:equipment)
       node "r&d/tools/demo-check.cjs" --out sheet.html --98 --png
   Exit code 1 if anything is an error.
*/
const fs = require('fs');
const os = require('os');
const path = require('path');
const { engine, ROOT } = require('./demo-engine.cjs');

const args = process.argv.slice(2);
const flag = f => args.includes(f);
const opt = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const want = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');
const out = opt('--out') || path.join(os.tmpdir(), 'ironlog-demo-sheet.html');

const E = engine();
const cat = JSON.parse(fs.readFileSync(path.join(ROOT, 'r&d/data/exercises.json'), 'utf8')).movements;
const byId = new Map(cat.map(m => [m.id, m]));
const errs = [], warns = [];
const hasNaN = s => /NaN|undefined|Infinity/.test(s);

/* ---------- checks ---------- */
for (const id of Object.keys(E.DEMO_MAP)) {
  const m = byId.get(id);
  if (!m) { errs.push(`${id}: not in the catalogue`); continue; }
  const d = E.demoFor(m);
  for (const eq of m.equipment) {
    const tag = `${id}:${eq}`;
    let drift = 0, reach = 0, sink = 0, float = Infinity;
    try {
      for (let i = 0; i <= 10; i++) {
        const p = i / 10, P = E.demoPose(d, eq, p);
        const svg = E.demoSVG(d, eq, p, 0.5, { muscles: true, path: true }, m, []);
        if (hasNaN(svg)) { errs.push(`${tag}: NaN at p=${p}`); break; }
        const segs = Object.entries(P.segs);
        segs.forEach(([k, [a, b, w]]) => { sink = Math.max(sink, -Math.min(a.y, b.y) - w / 2); });
        /* the near (planted) foot only: a rear foot on a bench or legs up on
           a Larsen press are meant to be off the floor */
        const foot = P.segs.foot;
        if (/stand|split|bench/.test(P.g('base')) && foot && !P.g('legsUp')) float = Math.min(float, Math.abs(Math.min(foot[0].y, foot[1].y) - foot[2] / 2));
        const mode = P.g('arms');
        if (!P.B.front && (P.B.armsTo || mode === 'hold' || mode === 'target')) {
          const tgt = P.B.armsTo || (mode === 'hold' ? P.B.bar : E.demoTarget(P.B, P.g('hand'), p));
          if (tgt && P.hand) reach = Math.max(reach, Math.hypot(tgt.x - P.hand.x, tgt.y - P.hand.y));
        }
        if (P.g('path') === 'midfoot' && P.bar && /barbell|trap/.test(P.draw) && P.g('solve') === 'midfoot') drift = Math.max(drift, Math.abs(P.bar.x - E.DEMO_MID));
      }
      E.demoBox(d, eq);
    } catch (e) { errs.push(`${tag}: throws — ${e.message}`); continue; }
    if (sink > 0.02) errs.push(`${tag}: goes ${(sink * 100).toFixed(0)} cm through the floor`);
    if (reach > 0.02) warns.push(`${tag}: hand ${(reach * 100).toFixed(0)} cm short of its target (arm too short for the pose)`);
    if (drift > 0.03) warns.push(`${tag}: bar ${(drift * 100).toFixed(0)} cm off midfoot`);
    if (float !== Infinity && float > 0.03) warns.push(`${tag}: a foot is ${(float * 100).toFixed(0)} cm off the floor`);
  }
}

/* ---------- coverage ---------- */
const unmapped = {};
cat.filter(m => !E.DEMO_MAP[m.id] && m.category !== 'cardio').forEach(m => { (unmapped[m.category] = unmapped[m.category] || []).push(m.id); });
const noNote = [];
for (const id of Object.keys(E.DEMO_MAP)) {
  const m = byId.get(id); if (!m) continue;
  const pv = (E.DEMO_TEXT.pattern[E.DEMO_MAP[id].pattern] || {}).variants || {}, mv = (E.DEMO_TEXT.movement[id] || {}).variants || {};
  const missing = m.equipment.filter(e => e !== m.defaultEquipment && !pv[e] && !mv[e]);
  if (missing.length) noNote.push(`${id} (${missing.join(', ')})`);
}

/* ---------- contact sheet ---------- */
const SKINS = {
  ironlog: '--dm-bg:#141821;--dm-ink:#a4adbd;--dm-body:#1e2431;--dm-kit:#858fa1;--dm-path:#4aa8ff;--line:#252c3a;--gold:#ffc542;--red:#ff4d4d;background:#0d0f14;color:#e8ecf3',
  win98: '--dm-bg:#fff;--dm-ink:#000;--dm-body:#fff;--dm-kit:#808080;--dm-path:#000080;--line:#808080;--gold:#ffe000;--red:#ff2020;background:#c0c0c0;color:#000',
};
const CSS = `body{font:13px system-ui,sans-serif;margin:16px}h1{font-size:18px}h2{font-size:14px;margin:18px 0 6px}
.row{display:flex;gap:6px;align-items:center;margin:4px 0}.row b{width:190px;flex:none;font-weight:600}
svg{width:150px;height:150px;background:var(--dm-bg);border:1px solid var(--line)}
.dm-plate{fill:#888;fill-opacity:.1;stroke:var(--dm-kit);stroke-width:.014}.dm-rim{fill:none;stroke:var(--dm-kit);stroke-width:.008}
.dm-bar{fill:var(--dm-ink)}.dm-mid{stroke:var(--dm-path);stroke-width:.009;stroke-dasharray:.04 .03;stroke-opacity:.7}
.dm-trail{stroke:var(--dm-path);stroke-width:.016;stroke-linecap:round}.dm-ground{stroke:var(--dm-kit);stroke-width:.012}
.dm-rail{stroke:var(--dm-kit);stroke-width:.02}.dm-cable{stroke:var(--dm-kit);stroke-width:.012;fill:none}
.dm-band{stroke:var(--dm-kit);stroke-width:.01;stroke-dasharray:.03 .015;fill:none}.dm-pad{fill:var(--line);stroke:var(--dm-kit);stroke-width:.01}
ul{margin:4px 0;padding-left:20px}.err{color:#ff4d4d}.warn{color:#e0a000}`;
const frames = (id, eq) => {
  const m = byId.get(id), d = m && E.demoFor(m);
  if (!d) return `<span>no figure</span>`;
  eq = eq || m.defaultEquipment;
  const box = E.demoBox(d, eq);
  return [0, 0.5, 1].map(p => {
    const svg = E.demoSVG(d, eq, p, p === 0.5 ? 0.6 : p === 1 ? 0.9 : 0.15, { muscles: true, path: true }, m, []);
    return `<svg viewBox="${box.x} ${box.y} ${box.w} ${box.h}"><g transform="scale(1,-1)"><line x1="${box.x}" y1="0" x2="${box.x + box.w}" y2="0" class="dm-ground"/>${svg}</g></svg>`;
  }).join('');
};
const list = want.length ? want : Object.keys(E.DEMO_MAP);
const skins = flag('--98') ? ['ironlog', 'win98'] : ['ironlog'];
const html = `<!doctype html><meta charset="utf-8"><title>Ironlog demo sheet</title><style>${CSS}</style>
${skins.map(s => `<div style="${SKINS[s]};padding:12px"><h1>Exercise demos — ${s} · start · middle · end</h1>
${list.map(spec => { const [id, eq] = spec.split(':'); return `<div class="row"><b>${spec}</b>${frames(id, eq)}</div>`; }).join('\n')}</div>`).join('')}
<div style="padding:12px"><h2>Problems</h2><ul>${errs.map(e => `<li class="err">${e}</li>`).join('')}${warns.map(w => `<li class="warn">${w}</li>`).join('')}${errs.length + warns.length ? '' : '<li>none</li>'}</ul>
<h2>No figure yet</h2><ul>${Object.entries(unmapped).map(([c, ids]) => `<li><b>${c}</b>: ${ids.join(', ')}</li>`).join('')}</ul>
<h2>Equipment with no variant note</h2><ul>${noNote.map(n => `<li>${n}</li>`).join('')}</ul></div>`;
fs.writeFileSync(out, html);

/* ---------- report ---------- */
errs.forEach(e => console.log('ERROR ' + e));
warns.forEach(w => console.log('warn  ' + w));
const nUn = Object.values(unmapped).reduce((s, a) => s + a.length, 0);
console.log(`${Object.keys(E.DEMO_MAP).length} movements mapped, ${nUn} without a figure (not counting cardio), ${noNote.length} with equipment lacking a variant note`);
console.log(`sheet: ${out}`);

if (flag('--png')) {
  let pw;
  try { pw = require('playwright'); } catch (e) { try { pw = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); } catch (e2) { console.log('--png needs Playwright (npm i -g playwright)'); } }
  if (pw) (async () => {
    const b = await pw.chromium.launch(fs.existsSync('/usr/bin/google-chrome') ? { executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] } : {});
    const pg = await b.newPage({ viewport: { width: 760, height: 800 } });
    await pg.goto('file://' + path.resolve(out));
    const png = out.replace(/\.html$/, '') + '.png';
    await pg.screenshot({ path: png, fullPage: true });
    await b.close();
    console.log(`png: ${png}`);
    process.exit(errs.length ? 1 : 0);
  })();
  else process.exit(errs.length ? 1 : 0);
} else process.exit(errs.length ? 1 : 0);
