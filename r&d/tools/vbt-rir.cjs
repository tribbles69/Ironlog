#!/usr/bin/env node
/* Bar-speed RIR, old against new, on real traces (roadmap 00-V2).
   Slew.estimateSet (what shipped to 0.91.0) beside vbtEstimateSet (read out of
   index.html, so this tests what ships), through the same rep detection
   Measure uses. Uses population profiles: a trace does not carry the
   lifter's calibration.

   Usage:  node "r&d/tools/vbt-rir.cjs" [export.json]
*/
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const FILE = process.argv[2] || path.join(ROOT, 'r&d/data/vbt/ironlog-vbt-raw-2026-11-11.json');
const ctx = { console, Math, Number, Object, Array, JSON, Infinity, Date, crypto: { randomUUID: () => 'x' }, performance: { now: () => 0 }, window: { addEventListener() {}, removeEventListener() {} } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'slew-core.js'), 'utf8'), ctx);
const html = require('./app-source.cjs').source();   // index.html and js/*.js, as one classic script
const a = html.match(/const VBT_HP_V[\s\S]*?\nfunction vbtSummary\(reps\) \{[\s\S]*?\n\}\r?\n/);
const b = html.match(/const VBT_RIR = [\s\S]*?\nfunction vbtRirText/);
vm.runInContext('const nice = n => (Math.round(n * 10) / 10).toString(); const rpeToRir = r => r == null ? null : 10 - r;' + a[0] + b[0].replace(/\nfunction vbtRirText$/, '') + ';Object.assign(globalThis, { vbtIntegrate, vbtDropBlips, VBT_MIN_ROM, vbtTiltMotion, vbtEstimateSet });', ctx);
const { Slew, vbtIntegrate, vbtDropBlips, VBT_MIN_ROM, vbtTiltMotion, vbtEstimateSet } = ctx;
const d = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const f = e => !e ? '—' : Number.isFinite(e.rir) ? e.rir.toFixed(1) + (e.atLeast ? '+' : '') : 'none';
d.traces.forEach((t, i) => {
  if (!t.lift) return;
  const motion0 = t.t.map((x, j) => ({ t: x, a: t.a[j], still: t.still[j] === '1' }));
  const motion = vbtTiltMotion(motion0, t.xyz || null).motion;
  const profile = { ...Slew.defaultProfile(t.lift), ...t.profile };
  const out = Slew.analyse(vbtIntegrate(motion), { targetHz: 60, minRom: Math.min(profile.minRom, VBT_MIN_ROM) });
  const found = vbtDropBlips(out.reps, profile.minRom);
  if (!found.length) return;
  // trustFailure, with the population limit
  let fail = out.failure; const lastV = found[found.length - 1].concentric.meanVelocity;
  if ((fail.failedAttempt || fail.grind) && lastV > profile.v0 + 3 * (profile.slope || 0.05)) fail = { ...fail, failedAttempt: false, grind: false, terminalVelocity: undefined };
  const reps = Slew.withRpe(found, profile);
  const old = Slew.estimateSet(reps, profile, fail), neu = vbtEstimateSet(reps, profile, fail);
  const label = (t.logged ? `${t.logged.exercise} ${t.logged.w}x${t.logged.r}` : `${t.lift} (not attached)`).padEnd(34);
  console.log(`${String(i + 1).padStart(2)} ${label} loss ${(neu.velocityLoss * 100).toFixed(0).padStart(2)}%  old ${f(old).padStart(5)} (${old.method})  new ${f(neu).padStart(5)} (${neu.method}${neu.fill ? ', fills' : ''})  | logged RIR ${t.logged && t.logged.rir != null ? t.logged.rir + (t.logged.rirFrom ? ' (' + t.logged.rirFrom + ')' : '') : '—'}`);
});
