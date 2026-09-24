/* Builds the muscle map skin sheets.

     NODE_PATH=$(npm root -g) node "r&d/tools/skin-sheet.mjs"

   Writes:
     skins/template.png          the shipped placeholder skin: one colour per
                                 tier, darker as the rank rises
     r&d/skins/paint-guide.png   the same, on a labelled grid with outlines —
                                 for artists; not loaded by the app
     r&d/skins/paint-guide.ora   layered version (paint here / template skin /
                                 guides) for Krita or GIMP

   Needs Playwright (Chromium) to rasterise, and Python + Pillow for the .ora. */
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
import { execFileSync } from 'child_process';
import * as G from './skin-geometry.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { CELL_W: W, CELL_H: H, TIERS, LAYOUT, REGIONS, SILHOUETTE, LABEL } = G;

/* One hue (Ironlog orange), getting darker each tier. 'none' is a flat grey
   so an untested muscle reads as empty rather than weak. Keep in step with
   SKIN_TEMPLATE_COLORS in index.html (the legend uses it). */
export const SHADES = {
  none: '#4a5263', Beginner: '#ffc9b8', Novice: '#ff9a7a', Intermediate: '#ff5c35',
  Advanced: '#c43a15', Elite: '#7a1f08',
};
const BODY = '#232a36', BODY_EDGE = '#39424f';

const silhouette = fill => `<g fill="${fill}">${SILHOUETTE.join('')}</g>`;
const head = fill => `<ellipse cx="120" cy="38" rx="22" ry="28" fill="${fill}"/>`;

/* The shipped skin. Base is the same at every tier — a real skin can evolve
   the body with the overall rank; the template keeps it neutral. */
function templateSkin(view, layer, tier) {
  if (layer === 'base') {
    // outline under the fill, so only the outer edge shows
    return `<g stroke="${BODY_EDGE}" stroke-width="3">${silhouette(BODY)}${head(BODY)}</g>${silhouette(BODY)}${head(BODY)}`;
  }
  const c = SHADES[tier];
  return `<g fill="${c}" stroke="#11151b" stroke-opacity=".55" stroke-width="1.4" stroke-linejoin="round">${REGIONS[view][layer]}</g>`;
}

/* The paint guide: every cell labelled, the whole body outlined, the cell's
   own region filled in its tier shade. */
function paintGuide(view, layer, tier) {
  const others = Object.entries(REGIONS[view]).filter(([k]) => k !== layer).map(([, d]) => d).join('');
  const target = layer === 'base'
    ? `${silhouette('#8d97a8')}${head('#8d97a8')}`
    : `<g fill="${SHADES[tier]}" stroke="#39414f" stroke-width="1">${REGIONS[view][layer]}</g>`;
  return `<rect width="${W}" height="${H}" fill="#f4f5f7"/>
    <g fill="none" stroke="#b6bcc7" stroke-width="1" stroke-dasharray="3 3">${SILHOUETTE.join('')}<ellipse cx="120" cy="38" rx="22" ry="28"/></g>
    <g fill="none" stroke="#d3d8df" stroke-width="1">${others}</g>
    ${target}
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" fill="none" stroke="#8a93a3"/>
    <text x="8" y="17" font-family="sans-serif" font-size="12" font-weight="700" fill="#39414f">${view.toUpperCase()} · ${LABEL[layer]}</text>
    <text x="8" y="32" font-family="sans-serif" font-size="11" fill="#5d6675">${tier === 'none' ? 'Not ranked' : tier}</text>`;
}

function sheetSvg(drawCell) {
  const { w, h } = G.sheetSize();
  let cells = '';
  for (const view of ['front', 'back']) for (const layer of LAYOUT[view]) for (const tier of TIERS) {
    const { x, y } = G.cellOrigin(view, layer, tier);
    cells += `<svg x="${x}" y="${y}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="hidden">${drawCell(view, layer, tier)}</svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${cells}</svg>`;
}

async function render(page, drawCell, path) {
  const { w, h } = G.sheetSize();
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<html><body style="margin:0;background:transparent">${sheetSvg(drawCell)}</body></html>`);
  await page.screenshot({ path, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
  console.log('wrote', path);
}

mkdirSync('skins', { recursive: true });
mkdirSync('r&d/skins', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
await render(page, templateSkin, 'skins/template.png');
await render(page, paintGuide, 'r&d/skins/paint-guide.png');
await browser.close();

/* OpenRaster: a zip of PNG layers that Krita and GIMP open directly. */
const { w, h } = G.sheetSize();
execFileSync('python3', ['-c', `
import zipfile, io
from PIL import Image
w, h = ${w}, ${h}
blank = io.BytesIO(); Image.new('RGBA', (w, h), (0,0,0,0)).save(blank, 'PNG')
thumb = io.BytesIO(); im = Image.open('r&d/skins/paint-guide.png'); im.thumbnail((256,256)); im.save(thumb, 'PNG')
stack = f'''<?xml version="1.0" encoding="UTF-8"?>
<image w="{w}" h="{h}" version="0.0.5"><stack>
<layer name="paint here" src="data/paint.png" x="0" y="0" opacity="1" visibility="visible"/>
<layer name="template skin (reference)" src="data/template.png" x="0" y="0" opacity="0.5" visibility="hidden"/>
<layer name="guides - hide before export" src="data/guides.png" x="0" y="0" opacity="1" visibility="visible"/>
</stack></image>'''
with zipfile.ZipFile('r&d/skins/paint-guide.ora', 'w') as z:
    z.writestr(zipfile.ZipInfo('mimetype'), 'image/openraster')
    z.writestr('stack.xml', stack, zipfile.ZIP_DEFLATED)
    z.writestr('data/paint.png', blank.getvalue())
    z.write('r&d/skins/paint-guide.png', 'data/guides.png')
    z.write('skins/template.png', 'data/template.png')
    z.writestr('Thumbnails/thumbnail.png', thumb.getvalue())
print('wrote r&d/skins/paint-guide.ora')
`], { stdio: 'inherit' });
