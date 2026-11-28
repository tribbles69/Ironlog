#!/usr/bin/env node
/* Copy MediaPipe's pose runtime into pose/ for squat depth (roadmap 04b,
   r&d/specs/bar-path-spec.md §9).

   pose/ is an OPTIONAL download: nothing in it is precached by sw.js, and the
   app fetches it only when the lifter turns depth judging on (Settings). It is
   hosted here rather than fetched from a CDN on Aaron's call (2026-11-08):
   local-only, no third party sees a request — the same rule Slew follows.

   What goes in, all from slew-v2's installed @mediapipe/tasks-vision so the
   JS and the WASM are the same version:
     pose/vision.js                       the tasks-vision JS, as one IIFE (global MPVision)
     pose/vision_wasm_internal.{js,wasm}  the SIMD engine (every Chrome on Android since 2021)
     pose/pose_landmarker_lite.task       the lite model — the one Slew's accuracy gate passed
     pose/VERSION                         the tasks-vision version, which names the app's cache

   The non-SIMD engine (another 10.8 MB) is left out; a phone without SIMD is
   told depth judging isn't available.

   Usage:  node "r&d/tools/build-pose.cjs" [path-to-slew-v2]
*/
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'pose');
const slew = [process.argv[2], process.env.SLEW_PATH, path.resolve(ROOT, '..', 'slew-v2')]
  .filter(Boolean).find(p => fs.existsSync(path.join(p, 'node_modules', '@mediapipe', 'tasks-vision')));
if (!slew) { console.error('Could not find slew-v2 with @mediapipe/tasks-vision installed.'); process.exit(1); }

const tv = path.join(slew, 'node_modules', '@mediapipe', 'tasks-vision');
const version = JSON.parse(fs.readFileSync(path.join(tv, 'package.json'), 'utf8')).version;
const model = [path.join(slew, 'public', 'mediapipe', 'pose_landmarker_lite.task')].find(p => fs.existsSync(p));
if (!model) { console.error('pose_landmarker_lite.task not found in slew-v2/public/mediapipe'); process.exit(1); }

fs.mkdirSync(OUT, { recursive: true });

const esbuild = path.join(slew, 'node_modules', '.bin', process.platform === 'win32' ? 'esbuild.cmd' : 'esbuild');
const r = cp.spawnSync(esbuild, [path.join(tv, 'vision_bundle.mjs'), '--bundle', '--format=iife', '--global-name=MPVision',
  '--target=es2020', '--platform=browser', '--legal-comments=none', '--minify'],
  { encoding: 'utf8', cwd: slew, shell: process.platform === 'win32', maxBuffer: 64 * 1024 * 1024 });
if (r.status !== 0) { console.error(r.stderr || r.error); process.exit(1); }
fs.writeFileSync(path.join(OUT, 'vision.js'),
  `/* GENERATED — @mediapipe/tasks-vision ${version} (Apache-2.0), bundled by r&d/tools/build-pose.cjs. Global: MPVision. */\n${r.stdout}\nif (typeof globalThis !== "undefined") globalThis.MPVision = MPVision;\n`);

for (const f of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm']) fs.copyFileSync(path.join(tv, 'wasm', f), path.join(OUT, f));
fs.copyFileSync(model, path.join(OUT, 'pose_landmarker_lite.task'));
fs.writeFileSync(path.join(OUT, 'VERSION'), version + '\n');

let total = 0;
for (const f of fs.readdirSync(OUT)) { const s = fs.statSync(path.join(OUT, f)).size; total += s; console.log(`${(s / 1048576).toFixed(2).padStart(7)} MB  pose/${f}`); }
console.log(`${(total / 1048576).toFixed(2).padStart(7)} MB  total · tasks-vision ${version}`);
