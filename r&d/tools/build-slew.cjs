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

   Usage:  node "r&d/tools/build-slew.cjs" [path-to-slew-v2]
*/
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
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
  console.error('\nPass the path: node "r&d/tools/build-slew.cjs" ../slew-v2');
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

const header = `/* GENERATED — do not edit. Regenerate with: node "r&d/tools/build-slew.cjs"
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

/* ---- slew-video.js: the plate tracker, for bar path from video (roadmap 04a,
   r&d/specs/bar-path-spec.md). Plate detection and tracking are pure canvas
   maths; only Slew's pose route needs MediaPipe, and that is not reached from
   here. videoAnalysis.ts imports the pose engine, so its two small pure helpers
   (fillGaps, horizontalDrift) live in Ironlog instead of being imported. Loaded
   by the app on first use, never in the shell's critical path. */
const VOUT = path.join(ROOT, 'slew-video.js');
const VENTRY = `export { PlateTracker, searchPlateInClip } from './src/capture/video/plateTracker';
export { detectPlate, detectPlateCandidates, toGrayscale, trackCircle, STANDARD_PLATE_DIAMETER_M } from './src/capture/video/plateDetect';
export { calibrateFromPlate } from './src/capture/video/calibration';
`;
const ventryPath = path.join(slew, '.ironlog-video-entry.ts');
fs.writeFileSync(ventryPath, VENTRY);
let vjs;
try {
  const r = cp.spawnSync(esbuild, [ventryPath, '--bundle', '--format=iife', '--global-name=SlewVideo',
    '--target=es2020', '--platform=browser', '--legal-comments=none'],
    { encoding: 'utf8', cwd: slew, shell: process.platform === 'win32' });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(r.stderr || `esbuild exited ${r.status}`);
  vjs = r.stdout;
} finally {
  fs.unlinkSync(ventryPath);
}
if (/mediapipe|pose_landmarker|\.task\b|PoseLandmarker/i.test(vjs)) {
  throw new Error('slew-video.js reached MediaPipe — check the video entry point');
}
fs.writeFileSync(VOUT, `/* GENERATED — do not edit. Regenerate with: node "r&d/tools/build-slew.cjs"
 *
 * Slew's barbell-plate detector and tracker (no MediaPipe), bundled from
 * ${path.basename(slew)}/src/capture/video. Exposes one global: SlewVideo.
 * Loaded on first use of Bar path from video.
 *
 * Built ${new Date().toISOString().slice(0, 10)}.
 */
${vjs}
if (typeof globalThis !== "undefined") globalThis.SlewVideo = SlewVideo;
`);
const vexpect = ['PlateTracker', 'searchPlateInClip', 'detectPlate', 'detectPlateCandidates', 'toGrayscale', 'trackCircle', 'STANDARD_PLATE_DIAMETER_M', 'calibrateFromPlate'];
const vctx = vm.createContext({});
vm.runInContext(fs.readFileSync(VOUT, 'utf8'), vctx);
const vmissing = vexpect.filter(k => typeof vctx.SlewVideo?.[k] === 'undefined');
if (vmissing.length) throw new Error('slew-video.js is missing exports: ' + vmissing.join(', '));
console.log(`slew-video.js ${(fs.statSync(VOUT).size / 1024).toFixed(1)} kB  ·  ${vexpect.length} exports verified`);
