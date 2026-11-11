#!/usr/bin/env node
/* Build a figure skin for the muscle map from twelve character pictures
   (roadmap 00-D2, r&d/skins/README.md).

   The sheet is 11 × 12 cells of 240 × 480: six tier rows for the front, six
   for the back; column 1 is the whole body, the rest are one muscle each.
   A figure skin has one picture per tier and view. Every cell in a row is cut
   from that row's picture:
     - the base cell is the figure itself, background removed;
     - a muscle cell is the same figure seen through that muscle's shape, which
       is read from the alpha of skins/template.png — so the shapes, and the
       tap areas, are exactly the template's.
   Stack a tier-0 body with a tier-4 chest and you get a goblin with an orc's
   chest: the transformation happens muscle by muscle.

   Each figure is fitted to the template body first: background flood-filled
   out from the edges, then scaled so its height and its width at upper-arm
   level match the template silhouette (a broad orc is narrowed, a thin goblin
   widened), so the muscle shapes land on the muscles.

   Usage:  node "r&d/tools/build-skin.cjs" <src-dir> <out-name>
           node "r&d/tools/build-skin.cjs" "r&d/skins/goblin-src" goblin
   <src-dir> holds front-0.png … front-5.png and back-0.png … back-5.png
   (0 = not ranked … 5 = elite), any size at 1:2. Writes skins/<out-name>.webp.
   Needs ffmpeg on the PATH.
*/
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const [srcDir, outName] = process.argv.slice(2);
if (!srcDir || !outName) { console.error('usage: build-skin.cjs <src-dir> <out-name>'); process.exit(1); }
const CW = 240, CH = 480, COLS = 11, ROWS = 12, W = CW * COLS, H = CH * ROWS;
const BIG = { maxBuffer: 1 << 30 };
const decode = (file, w, h) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', file, ...(w ? ['-vf', `scale=${w}:${h}:flags=lanczos`] : []), '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], BIG);
const dims = file => execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]).toString().trim().split(',').map(Number);

const tpl = decode(path.join(ROOT, 'skins', 'template.png'));
if (tpl.length !== W * H * 4) { console.error('skins/template.png is not 2640 × 5760'); process.exit(1); }
const tplA = (row, col, x, y) => tpl[((row * CH + y) * W + col * CW + x) * 4 + 3];

/* The template silhouette: top, bottom, and the outer edges at upper-arm level. */
function silhouette(row) {
  let top = CH, bot = 0;
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) if (tplA(row, 0, x, y) > 128) { if (y < top) top = y; if (y > bot) bot = y; }
  const band = [Math.round(top + (bot - top) * 0.30), Math.round(top + (bot - top) * 0.40)];
  let l = CW, r = 0;
  for (let y = band[0]; y <= band[1]; y++) for (let x = 0; x < CW; x++) if (tplA(row, 0, x, y) > 128) { if (x < l) l = x; if (x > r) r = x; }
  return { top, bot, l, r };
}

/* One figure, background removed, fitted to the silhouette, as a 240 × 480 RGBA cell. */
function fitFigure(file, sil) {
  const [w, h] = dims(file), px = decode(file), n = w * h;
  const a = new Uint8Array(n).fill(255);
  const white = i => px[i * 4] >= 232 && px[i * 4 + 1] >= 232 && px[i * 4 + 2] >= 232;
  // flood the background in from every edge pixel
  const stack = [];
  const seed = i => { if (a[i] && white(i)) { a[i] = 0; stack.push(i); } };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
  while (stack.length) {
    const i = stack.pop(), x = i % w, y = (i - x) / w;
    if (x > 0) seed(i - 1); if (x < w - 1) seed(i + 1); if (y > 0) seed(i - w); if (y < h - 1) seed(i + w);
  }
  // peel the pale fringe the outline's anti-aliasing leaves against the background
  for (let pass = 0; pass < 2; pass++) {
    const kill = [];
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (!a[i]) continue;
      if (!(a[i - 1] && a[i + 1] && a[i - w] && a[i + w])) { const lum = (px[i * 4] * 3 + px[i * 4 + 1] * 6 + px[i * 4 + 2]) / 10; if (lum > 120) kill.push(i); }
    }
    kill.forEach(i => { a[i] = 0; });
  }
  // the figure's own top, bottom and width at upper-arm level
  let top = h, bot = 0;
  for (let y = 0; y < h; y++) { let any = false; for (let x = 0; x < w; x += 2) if (a[y * w + x]) { any = true; break; } if (any) { if (y < top) top = y; bot = y; } }
  const b0 = Math.round(top + (bot - top) * 0.30), b1 = Math.round(top + (bot - top) * 0.40);
  let l = w, r = 0;
  for (let y = b0; y <= b1; y++) for (let x = 0; x < w; x++) if (a[y * w + x]) { if (x < l) l = x; if (x > r) r = x; }
  // source = centre + (dest − centre) × scale
  const sy = (bot - top) / (sil.bot - sil.top), sx = (r - l) / (sil.r - sil.l);
  const cxS = (l + r) / 2, cxD = (sil.l + sil.r) / 2;
  const out = Buffer.alloc(CW * CH * 4);
  const TAPS = 3;
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
    let R = 0, G = 0, B = 0, A = 0;
    for (let ty = 0; ty < TAPS; ty++) for (let tx = 0; tx < TAPS; tx++) {
      const u = Math.round(cxS + (x + (tx + 0.5) / TAPS - cxD) * sx), v = Math.round(top + (y + (ty + 0.5) / TAPS - sil.top) * sy);
      if (u < 0 || v < 0 || u >= w || v >= h) continue;
      const i = v * w + u; if (!a[i]) continue;
      R += px[i * 4]; G += px[i * 4 + 1]; B += px[i * 4 + 2]; A++;
    }
    const o = (y * CW + x) * 4;
    if (A) { out[o] = R / A; out[o + 1] = G / A; out[o + 2] = B / A; out[o + 3] = Math.round(A / (TAPS * TAPS) * 255); }
  }
  return { cell: out, sx: sx * CW / w, sy: sy * CH / h };
}

const sheet = Buffer.alloc(W * H * 4);
['front', 'back'].forEach((view, vi) => {
  for (let tier = 0; tier < 6; tier++) {
    const row = vi * 6 + tier, file = path.join(srcDir, `${view}-${tier}.png`);
    if (!fs.existsSync(file)) { console.error('missing ' + file); process.exit(1); }
    const { cell, sx, sy } = fitFigure(file, silhouette(row));
    for (let col = 0; col < COLS; col++) for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      const s = (y * CW + x) * 4, fa = cell[s + 3];
      if (!fa) continue;
      const alpha = col === 0 ? fa : Math.round(fa * tplA(row, col, x, y) / 255);
      if (!alpha) continue;
      const d = ((row * CH + y) * W + col * CW + x) * 4;
      sheet[d] = cell[s]; sheet[d + 1] = cell[s + 1]; sheet[d + 2] = cell[s + 2]; sheet[d + 3] = alpha;
    }
    console.log(`${view} tier ${tier}: width × ${sx.toFixed(2)}, height × ${sy.toFixed(2)} of a straight fit`);
  }
});
const dest = path.join(ROOT, 'skins', `${outName}.webp`);
execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-i', '-',
  '-c:v', 'libwebp', '-quality', '82', '-compression_level', '6', '-preset', 'drawing', dest], { input: sheet, ...BIG });
console.log(`skins/${outName}.webp  ${(fs.statSync(dest).size / 1024).toFixed(0)} KB`);
