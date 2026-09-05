#!/usr/bin/env node
/* Bundle Slew's metrics engine into slew-core.js.

   Slew is a separate app (Capacitor/Vite/TypeScript) that does velocity-based
   training. Its `src/core` is pure — no DOM, no Capacitor, no imports from
   capture — which is exactly what makes it portable into a single-file PWA.

   This BUNDLES rather than hand-porting on purpose. The engine carries 65 tests
   in Slew's own repo and a hand-transcription of 1,800 lines would be a new
   thing that merely resembles the tested one. What ships here is the same code.

   Sensor mode only. The entry point below never reaches src/capture/video, so
   MediaPipe's 76 MB of WASM and model weights stay out of the graph — they
   would be larger than this entire app by two orders of magnitude.

   The OUTPUT IS COMMITTED. Ironlog must build without Slew checked out next to
   it, and the deployed app must not depend on a directory on one laptop. Run
   this only when Slew's engine changes.

   Usage:  node tools/build-slew.cjs [path-to-slew-v2]
*/
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'slew-core.js');

const candidates = [
  process.argv[2],
  process.env.SLEW_PATH,
  path.resolve(ROOT, '..', 'slew-v2'),
  path.resolve(ROOT, '..', '..', 'slew-v2'),
].filter(Boolean);

const slew = candidates.find(p => fs.existsSync(path.join(p, 'src', 'core', 'index.ts')));
if (!slew) {
  console.error('Could not find slew-v2. Tried:\n  ' + candidates.join('\n  '));
  console.error('\nPass the path: node tools/build-slew.cjs ../slew-v2');
  process.exit(1);
}

const esbuild = path.join(slew, 'node_modules', '.bin', process.platform === 'win32' ? 'esbuild.cmd' : 'esbuild');
if (!fs.existsSync(esbuild)) {
  console.error(`esbuild not found at ${esbuild} — run npm install in slew-v2 first`);
  process.exit(1);
}

/* Narrow on purpose: what Ironlog actually calls, and nothing that would drag
   the video pipeline in behind it. */
const ENTRY = `export { analyse, detectFailure } from './src/core/index';
export { estimateSet, withRpe, bandFor, EFFORT_BANDS } from './src/core/rpe';
export { DEFAULT_PROFILES, EXERCISES, defaultProfile, fitProfile } from './src/core/profiles';
export { integrateMotion, analyseSensorSet, shouldFlipAxis } from './src/capture/sensor/sensorPipeline';
export { MotionCapture, DEFAULT_MOTION_CONFIG } from './src/capture/sensor/deviceMotion';
`;
const entryPath = path.join(slew, '.ironlog-entry.ts');
fs.writeFileSync(entryPath, ENTRY);

let js;
try {
  const r = cp.spawnSync(esbuild, [
    entryPath,
    '--bundle',
    '--format=iife',
    '--global-name=Slew',
    '--target=es2020',
    '--platform=browser',
    '--legal-comments=none',
    // a .cmd shim is not directly executable by CreateProcess
  ], { encoding: 'utf8', cwd: slew, shell: process.platform === 'win32' });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(r.stderr || `esbuild exited ${r.status}`);
  js = r.stdout;
} finally {
  fs.unlinkSync(entryPath);
}

if (/mediapipe|pose_landmarker|\.task\b/i.test(js)) {
  throw new Error('the bundle reached the video pipeline — check the entry point');
}

const header = `/* GENERATED — do not edit. Regenerate with: node tools/build-slew.cjs
 *
 * Slew's velocity-based training engine, sensor mode only, bundled from
 * ${path.basename(slew)}/src/{core,capture/sensor}. 65 tests pass in Slew's repo
 * against this source. Exposes one global: Slew.
 *
 * Built ${new Date().toISOString().slice(0, 10)}.
 */
`;
/* `var Slew` at the top level of a classic script is already a global, but the
   bundle opens with "use strict" and that is not true under an indirect eval —
   which is how the test harness loads it. Saying it explicitly costs nothing. */
const footer = '\nif (typeof globalThis !== "undefined") globalThis.Slew = Slew;\n';

fs.writeFileSync(OUT, header + js + footer);

// A bundle that does not parse, or that lost an export, must not ship.
const expect = ['analyse', 'analyseSensorSet', 'MotionCapture', 'estimateSet', 'withRpe', 'defaultProfile', 'DEFAULT_PROFILES', 'fitProfile', 'shouldFlipAxis', 'detectFailure'];
const sandbox = { window: { addEventListener() {}, removeEventListener() {} }, performance: { now: () => 0 } };
const vm = require('vm');
const ctx = vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(OUT, 'utf8'), ctx);
const missing = expect.filter(k => typeof ctx.Slew?.[k] === 'undefined');
if (missing.length) throw new Error('bundle is missing exports: ' + missing.join(', '));

console.log(`slew-core.js  ${(fs.statSync(OUT).size / 1024).toFixed(1)} kB  ·  ${expect.length} exports verified  ·  from ${slew}`);
