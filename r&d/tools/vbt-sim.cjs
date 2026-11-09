#!/usr/bin/env node
/* Simulated sets through Measure's pipeline: Slew.MotionCapture → integration
   → Slew.analyse. Compares Slew.integrateMotion with Ironlog's vbtIntegrate
   (read out of index.html, so this tests what ships) and fails if any set
   loses reps or gains phantom ones.

   Synthetic only: smooth velocity profiles, gaussian sensor noise, an optional
   constant offset and slow wander. It shows the mechanism, not real-world
   accuracy — tune on raw traces (Settings → Bar-speed debug → export) for that.

   Usage:  node "r&d/tools/vbt-sim.cjs" [-v]
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
const src = html.match(/const VBT_VZERO[\s\S]*?\nfunction vbtIntegrate\(motion\) \{[\s\S]*?\n\}\n/);
if (!src) { console.error('vbtIntegrate not found in index.html'); process.exit(1); }
vm.runInContext(src[0] + 'globalThis.vbtIntegrate = vbtIntegrate;', ctx);
const { Slew, vbtIntegrate } = ctx;

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
function count(motion, spec, integrate) {
  const prof = Slew.defaultProfile(spec.lift || 'Overhead press');
  return Slew.analyse(integrate(motion), { targetHz: 60, minRom: prof.minRom }).reps;
}

const SETS = [
  ['OHP 16-rep AMRAP', { reps: 16, rom: 0.45, con: 0.8, ecc: 0.7, top: 0.5, bottom: 0.1, slow: 0.6 }],
  ['OHP dead stop on pins', { reps: 9, rom: 0.45, con: 0.9, ecc: 0.8, top: 0.4, bottom: 1.2 }],
  ['Incline heavy grind', { reps: 5, rom: 0.4, con: 2.4, ecc: 1.2, top: 0.8, bottom: 0.2, slow: 0.4, lift: 'Bench press' }],
  ['Incline grind, no pause', { reps: 5, rom: 0.4, con: 2.0, ecc: 1.0, top: 0.1, bottom: 0.1, slow: 0.5, lift: 'Bench press' }],
  ['Incline light 17', { reps: 17, rom: 0.4, con: 0.8, ecc: 0.8, top: 0.4, bottom: 0.1, lift: 'Bench press' }],
  ['Incline warm-up 10', { reps: 10, rom: 0.4, con: 0.5, ecc: 0.6, top: 0.2, bottom: 0.05, lift: 'Bench press' }],
  ['Smith squat slow 3', { reps: 3, rom: 0.5, con: 1.6, ecc: 1.4, top: 1.5, bottom: 0.1, lift: 'Squat (Smith)' }],
  ['Long rest, then 3', { reps: 3, rom: 0.45, con: 1.0, ecc: 1.0, top: 0.6, bottom: 0.2, lead: 12, tail: 8 }],
];
const CONDS = [['clean', { noise: 0.08 }], ['noisy', { noise: 0.2 }], ['offset', { noise: 0.1, offset: 0.05 }], ['wander', { noise: 0.1, offset: 0.03, wander: 0.08 }]];

let was = 0, now = 0, total = 0, bad = 0;
for (const [cn, c] of CONDS) for (const [name, spec] of SETS) {
  const m = record(spec, c);
  const a = count(m, spec, x => Slew.integrateMotion(x)).length;
  const reps = count(m, spec, vbtIntegrate), b = reps.length;
  was += Math.min(a, spec.reps); now += Math.min(b, spec.reps); total += spec.reps;
  const worse = b < a, extra = b > spec.reps;
  if (worse || extra) bad++;
  if (verbose || worse || extra) console.log(`${worse ? 'WORSE ' : extra ? 'EXTRA ' : '      '}${cn.padEnd(7)}${name.padEnd(26)} Slew ${a}/${spec.reps}  Ironlog ${b}/${spec.reps}  ${reps.map(r => r.concentric.meanVelocity.toFixed(2)).join('/')}`);
}
console.log(`Reps found: Slew.integrateMotion ${was}/${total}, vbtIntegrate ${now}/${total}`);
if (bad) { console.error(`${bad} set(s) worse or over-counted`); process.exit(1); }
