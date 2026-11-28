#!/usr/bin/env node
/* Cut recorded voice takes into the interval timer's cue sprite (roadmap 00-D2).

   Each take is one ElevenLabs generation: a list of phrases with a long pause
   between them. This finds the pauses, cuts the phrases out in order, lays
   them end to end with a short gap, and writes
     audio/intervals.mp3   one mono MP3 holding every cue
   and prints the IV_VOICE line for index.html: cue id -> [start, length] in
   seconds. Needs ffmpeg on the PATH.

   Usage:  node "r&d/tools/build-voice.cjs" "r&d/data/voice/intervals-take1-rounds.mp3" "r&d/data/voice/intervals-take2-rests.mp3" "r&d/data/voice/intervals-take3-warm-cool.mp3"
   The phrase order below must match the order they were spoken in.
*/
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.resolve(__dirname, '..', '..');
const TAKES = [
  ['go1', 'go2', 'go3', 'go4', 'go5', 'go6', 'go7', 'go8', 'go9', 'go10', 'go11', 'go12'],
  ['rest10', 'rest15', 'rest20', 'rest30', 'rest45', 'rest60', 'rest90', 'rest120', 'rest180', 'last', '_warm', '_cool', 'done'],   // _ = spoken in this take but not used: one-word cues came out clipped
  ['warm', 'cool'],
];
const files = process.argv.slice(2);
if (files.length !== TAKES.length) { console.error(`give ${TAKES.length} takes, in order`); process.exit(1); }
const ff = (args, opt = {}) => execFileSync('ffmpeg', ['-hide_banner', '-nostdin', ...args], { stdio: ['ignore', 'pipe', 'pipe'], ...opt });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ironlog-voice-'));
const RATE = 24000, GAP = 0.25, PAD = 0.06;
const parts = [], index = {};
let at = 0;
files.forEach((file, ti) => {
  const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim();
  const log = String(require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-i', file, '-af', 'silencedetect=noise=-38dB:d=0.7', '-f', 'null', '-'], { encoding: 'utf8' }).stderr || '');
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map(m => +m[1]), ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map(m => +m[1]);
  // speech runs between the silences; a silence at the very start or end is trimmed off
  const cuts = []; let from = 0;
  starts.forEach((s, i) => { if (s > from + 0.15) cuts.push([from, s]); from = ends[i] != null ? ends[i] : dur; });
  if (dur > from + 0.15) cuts.push([from, dur]);
  if (cuts.length !== TAKES[ti].length) { console.error(`${path.basename(file)}: found ${cuts.length} phrases, expected ${TAKES[ti].length}`); process.exit(1); }
  cuts.forEach(([a, b], i) => {
    const id = TAKES[ti][i], out = path.join(tmp, `${id}.wav`), len = (b - a) + 2 * PAD;
    if (id.startsWith('_')) return;
    ff(['-y', '-ss', Math.max(0, a - PAD).toFixed(3), '-t', len.toFixed(3), '-i', file, '-ac', '1', '-ar', String(RATE),
      '-af', `afade=t=in:d=0.02,afade=t=out:st=${(len - 0.04).toFixed(3)}:d=0.04,apad=pad_dur=${GAP}`, out]);
    const real = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim();
    index[id] = [+at.toFixed(3), +len.toFixed(3)];
    at += real;
    parts.push(out);
  });
});
const list = path.join(tmp, 'list.txt');
fs.writeFileSync(list, parts.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n'));
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
const dest = path.join(ROOT, 'audio', 'intervals.mp3');
ff(['-y', '-f', 'concat', '-safe', '0', '-i', list, '-ac', '1', '-ar', String(RATE), '-c:a', 'libmp3lame', '-b:a', '40k', dest]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`audio/intervals.mp3  ${(fs.statSync(dest).size / 1024).toFixed(0)} KB, ${at.toFixed(1)} s, ${Object.keys(index).length} cues`);
console.log('const IV_VOICE = ' + JSON.stringify(index) + ';');
