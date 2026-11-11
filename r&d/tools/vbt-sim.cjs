#!/usr/bin/env node
/* Measure's rep detection, old against new. Compares Slew.integrateMotion with
   Ironlog's vbtIntegrate + vbtDropBlips (read out of index.html, so this tests
   what ships) and fails if any set loses reps or gains phantom ones.

   Synthetic sets: smooth velocity profiles through the real MotionCapture,
   gaussian noise, constant offset, slow wander. Shows the mechanism only.

   Real sets: pass an export from Settings → Bar-speed debug. Each trace's
   logged reps are the answer (traces not attached to a set are skipped
   unless --truth gives every count in order).

   Usage:  node "r&d/tools/vbt-sim.cjs" [-v]
           node "r&d/tools/vbt-sim.cjs" --traces ironlog-vbt-raw.json [--truth 8,16,9] [-v]
*/
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const verbose = process.argv.includes('-v');

let NOW = 0;
const ctx = { console, Math, Number, Object, Array, JSON, Infinity, crypto: { randomUUID: () => 'x' },
  performance: { now: () => NOW }, window: { addEventListener() {}, removeEventListener() {} } };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'slew-core.js'), 'utf8'), ctx);
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const src = html.match(/const VBT_HP_V[\s\S]*?\nfunction vbtSummary\(reps\) \{[\s\S]*?\n\}\n/);
if (!src) { console.error('vbtIntegrate … vbtSummary not found in index.html'); process.exit(1); }
vm.runInContext(src[0] + 'globalThis.vbtIntegrate = vbtIntegrate; globalThis.vbtDropBlips = vbtDropBlips; globalThis.VBT_MIN_ROM = VBT_MIN_ROM; globalThis.vbtTiltMotion = vbtTiltMotion;', ctx);
const { Slew, vbtIntegrate, vbtDropBlips, VBT_MIN_ROM, vbtTiltMotion } = ctx;
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };

let seed = 1;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());

/* One phase's velocity: raised-cosine ramps either side of a cruise; area = rom. */
function phase(rom, T, ramp) {
  const ta = T * ramp, tc = T - 2 * ta, vc = rom / (tc + ta);
  return t => t < ta ? vc * (1 - Math.cos(Math.PI * t / ta)) / 2 : t < ta + tc ? vc : t < T ? vc * (1 + Math.cos(Math.PI * (t - ta - tc) / ta)) / 2 : 0;
}
function buildSet({ reps, rom, con, ecc, top, bottom, ramp = 0.3, lead = 1.5, tail = 1.5, slow = 0 }) {
  const segs = [[lead, () => 0]];
  for (let i = 0; i < reps; i++) {
    const c = con * (1 + slow * i / reps);
    segs.push([c, phase(rom, c, ramp)], [top, () => 0]);
    if (i < reps - 1) { const e = phase(rom, ecc, ramp); segs.push([ecc, t => -e(t)], [bottom, () => 0]); }
  }
  segs.push([tail, () => 0]);
  return [t => { let s = 0; for (const [d, f] of segs) { if (t < s + d) return f(t - s); s += d; } return 0; }, segs.reduce((a, [d]) => a + d, 0)];
}
function record(spec, { hz = 100, noise = 0.08, offset = 0, wander = 0 }) {
  seed = 1;
  const [vf, T] = buildSet(spec);
  const cap = new Slew.MotionCapture({ ...Slew.DEFAULT_MOTION_CONFIG });
  cap.reset();
  let vPrev = 0;
  for (let t = 0; t < T; t += 1 / hz) {
    NOW = t * 1000;
    const v = vf(t), a = (v - vPrev) * hz; vPrev = v;
    cap.onMotion({
      accelerationIncludingGravity: { x: gauss() * noise, y: gauss() * noise, z: 9.81 + a + gauss() * noise },
      acceleration: { x: gauss() * noise, y: gauss() * noise, z: a + offset + wander * Math.sin(t / 7) + gauss() * noise },
    });
  }
  return cap.samples.slice();
}
function count(motion, minRom, integrate, ironlog) {
  if (!ironlog) return Slew.analyse(integrate(motion), { targetHz: 60, minRom }).reps;
  const reps = Slew.analyse(integrate(motion), { targetHz: 60, minRom: Math.min(minRom, VBT_MIN_ROM) }).reps;
  return vbtDropBlips(reps, minRom);   // as Measure does
}
const oldWay = m => count(m.motion, m.minRom, x => Slew.integrateMotion(x), false);
const newWay = m => count(m.motion, m.minRom, vbtIntegrate, true);
/* As Measure runs since 0.91.0: tilt-corrected where the trace has the phone's
   3-axis readings (exports from 0.90.0 on), otherwise the same as newWay. */
const tiltWay = m => count(vbtTiltMotion(m.motion, m.xyz).motion, m.minRom, vbtIntegrate, true);

/* Real traces */
if (arg('--traces')) {
  const d = JSON.parse(fs.readFileSync(arg('--traces'), 'utf8'));
  const truth = arg('--truth') ? arg('--truth').split(',').map(Number) : null;
  let was = 0, now = 0, tl = 0, total = 0, bad = 0, tilted = 0;
  const cm = reps => { const r = reps.map(x => x.rom * 100); return r.length ? `${Math.min(...r).toFixed(0)}–${Math.max(...r).toFixed(0)} cm` : '—'; };
  d.traces.forEach((t, i) => {
    const want = truth ? truth[i] : t.logged && t.logged.r;
    if (!(want > 0)) { console.log(`skip   trace ${i + 1} (${t.lift}, not attached to a set)`); return; }
    const m = { motion: t.t.map((x, j) => ({ t: x, a: t.a[j], still: t.still[j] === '1' })), minRom: t.profile.minRom, xyz: t.xyz || null };
    const a = oldWay(m).length, plain = newWay(m), reps = tiltWay(m), b = reps.length;
    if (m.xyz) tilted++;
    was += Math.min(a, want); now += Math.min(plain.length, want); tl += Math.min(b, want); total += want;
    const worse = b < Math.min(plain.length, want), extra = b > want;
    if (worse || extra) bad++;
    const label = t.logged ? `${t.logged.exercise} ${t.logged.set} ${t.logged.w}×${t.logged.r}` : `${t.lift} trace ${i + 1}`;
    if (verbose || worse || extra) console.log(`${worse ? 'WORSE ' : extra ? 'EXTRA ' : '      '}${label.padEnd(36)} Slew ${a}/${want}  no tilt ${plain.length}/${want} (${cm(plain)})  ${m.xyz ? 'tilt' : 'same'} ${b}/${want} (${cm(reps)})  ${reps.map(r => r.concentric.meanVelocity.toFixed(2)).join('/')}`);
  });
  console.log(`Reps found: Slew.integrateMotion ${was}/${total}, vbtIntegrate without tilt ${now}/${total}, as shipped ${tl}/${total} (${tilted} of ${d.traces.length} traces carry 3-axis readings)`);
  if (bad) console.error(`${bad} set(s) worse or over-counted`);
  process.exit(bad ? 1 : 0);
}

const SETS = [
  ['OHP 16-rep AMRAP', { reps: 16, rom: 0.45, con: 0.8, ecc: 0.7, top: 0.5, bottom: 0.1, slow: 0.6 }],
  ['OHP dead stop on pins', { reps: 9, rom: 0.45, con: 0.9, ecc: 0.8, top: 0.4, bottom: 1.2 }],
  ['Incline heavy grind', { reps: 5, rom: 0.4, con: 2.4, ecc: 1.2, top: 0.8, bottom: 0.2, slow: 0.4, lift: 'Bench press' }],
  /* KNOWN BAD: a perfectly constant-speed 2 s push. MotionCapture's bias
     tracking absorbs it before integration, so both versions read garbage
     (5–15 cm for 40). Reported, not failed. Real grinds (9 Nov 60×5, 55×5)
     read 5 of 5. */
  ['Incline grind, no pause', { reps: 5, rom: 0.4, con: 2.0, ecc: 1.0, top: 0.1, bottom: 0.1, slow: 0.5, lift: 'Bench press', known: true }],
  ['Incline light 17', { reps: 17, rom: 0.4, con: 0.8, ecc: 0.8, top: 0.4, bottom: 0.1, lift: 'Bench press' }],
  ['Incline warm-up 10', { reps: 10, rom: 0.4, con: 0.5, ecc: 0.6, top: 0.2, bottom: 0.05, lift: 'Bench press' }],
  ['Smith squat slow 3', { reps: 3, rom: 0.5, con: 1.6, ecc: 1.4, top: 1.5, bottom: 0.1, lift: 'Squat (Smith)' }],
  ['Long rest, then 3', { reps: 3, rom: 0.45, con: 1.0, ecc: 1.0, top: 0.6, bottom: 0.2, lead: 12, tail: 8 }],
  ['Single, long setup', { reps: 1, rom: 0.4, con: 1.5, ecc: 1, top: 1, bottom: 0.2, lead: 8, tail: 6, lift: 'Bench press' }],
  ['Calf raise 6 cm x 12', { reps: 12, rom: 0.06, con: 0.6, ecc: 0.6, top: 0.8, bottom: 0.3, lift: 'Machine (stack)' }],
  ['Calf raise 5 cm x 15, quick', { reps: 15, rom: 0.05, con: 0.4, ecc: 0.4, top: 0.3, bottom: 0.2, lift: 'Machine (stack)' }],
];
const CONDS = [['clean', { noise: 0.08 }], ['noisy', { noise: 0.2 }], ['offset', { noise: 0.1, offset: 0.05 }],
  ['wander', { noise: 0.1, offset: 0.03, wander: 0.08 }], ['bias', { noise: 0.15, offset: -0.2 }]];

let was = 0, now = 0, total = 0, bad = 0;
for (const [cn, c] of CONDS) for (const [name, spec] of SETS) {
  const m = { motion: record(spec, c), minRom: Slew.defaultProfile(spec.lift || 'Overhead press').minRom };
  const a = oldWay(m).length;
  const reps = newWay(m), b = reps.length;
  was += Math.min(a, spec.reps); now += Math.min(b, spec.reps); total += spec.reps;
  const worse = b < a, extra = b > spec.reps;
  if ((worse || extra) && !spec.known) bad++;
  if (verbose || worse || extra) console.log(`${spec.known && (worse || extra) ? 'KNOWN ' : worse ? 'WORSE ' : extra ? 'EXTRA ' : '      '}${cn.padEnd(7)}${name.padEnd(26)} Slew ${a}/${spec.reps}  Ironlog ${b}/${spec.reps}  ${reps.map(r => r.concentric.meanVelocity.toFixed(2)).join('/')}`);
}
console.log(`Reps found: Slew.integrateMotion ${was}/${total}, vbtIntegrate ${now}/${total}`);
if (bad) { console.error(`${bad} set(s) worse or over-counted`); process.exit(1); }
