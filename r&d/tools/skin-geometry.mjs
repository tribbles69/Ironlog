/* Body-map skin geometry — the one place the sheet layout and the guide shapes
   are defined. Used by skin-sheet.mjs to draw the template and the built-in
   skins. The app only needs LAYOUT (mirrored in index.html as SKIN_LAYOUT).

   Coordinate space: one cell is 240 × 480, body centred on x = 120.
   Shapes are drawn for the viewer's LEFT half and mirrored, except those
   marked `centre`. */

export const CELL_W = 240, CELL_H = 480;

// Columns of the sheet, left to right. 'none' = no ranked lift trains it.
export const TIERS = ['none', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];

/* Rows of the sheet, top to bottom, and the draw order within a view
   (earlier rows are painted first, so later rows sit on top). `base` is the
   body itself — head, hands, feet, the skin between muscles — and is picked
   by the lifter's overall tier, so the head can evolve too. */
export const LAYOUT = {
  front: ['base', 'traps', 'abs', 'quads', 'calves', 'chest', 'fdelts', 'sdelts', 'biceps', 'forearms'],
  back:  ['base', 'traps', 'upperback', 'lats', 'erectors', 'glutes', 'hams', 'calves', 'sdelts', 'triceps', 'forearms'],
};

const M = 'transform="translate(240 0) scale(-1 1)"';
const mirror = d => `<path d="${d}"/><g ${M}><path d="${d}"/></g>`;
const centre = d => `<path d="${d}"/>`;

/* Base silhouette pieces shared by both views (head is drawn per skin). */
export const SILHOUETTE = [
  // neck
  centre('M106,62 L134,62 L136,92 L104,92 Z'),
  // torso (left half) — shoulder to hip
  mirror('M120,82 L100,84 C84,88 66,92 56,100 C46,110 46,128 48,140 L62,146 C66,176 72,204 76,224 C74,236 72,248 72,262 L120,270 Z'),
  // upper arm + forearm
  mirror('M56,100 C44,108 40,130 42,150 C42,172 44,190 42,204 C36,226 32,252 34,276 L50,278 C54,254 62,226 64,206 C68,186 70,160 66,140 Z'),
  // hand
  mirror('M34,274 C28,286 28,300 34,310 C40,314 48,310 50,300 C52,290 52,282 50,276 Z'),
  // leg
  mirror('M72,256 C64,292 66,332 74,360 C70,392 72,424 78,446 L100,448 C100,420 104,392 104,366 C110,330 116,296 120,268 Z'),
  // foot
  mirror('M78,444 C70,456 66,466 72,472 L104,472 C106,462 104,452 100,446 Z'),
];

/* Muscle regions. Keys match MUSCLES in index.html. */
export const REGIONS = {
  front: {
    traps:    mirror('M106,80 C98,86 86,92 72,96 L98,98 C104,94 108,88 110,82 Z'),
    chest:    mirror('M84,100 C98,96 112,98 119,102 L119,146 C106,154 88,152 76,140 C70,126 72,110 84,100 Z'),
    fdelts:   mirror('M74,96 C62,98 54,108 54,124 C56,132 60,136 64,136 C68,122 74,108 86,100 Z'),
    sdelts:   mirror('M66,96 C52,98 44,112 44,130 L54,132 C54,116 58,104 70,98 Z'),
    biceps:   mirror('M50,136 C44,152 44,176 48,194 C56,194 62,184 64,168 C66,156 66,146 62,138 Z'),
    forearms: mirror('M44,204 C36,226 34,250 36,272 L48,272 C52,252 58,230 62,208 C56,202 50,202 44,204 Z'),
    abs:      centre('M100,150 C112,155 128,155 140,150 L142,200 C140,226 134,240 120,248 C106,240 100,226 98,200 Z'),
    quads:    mirror('M76,254 C68,286 68,326 80,356 C88,360 96,360 102,356 C110,326 114,294 118,266 C104,264 88,260 76,254 Z'),
    calves:   mirror('M76,368 C70,392 72,420 80,442 L90,442 C88,420 92,396 96,370 C90,366 82,366 76,368 Z'),
  },
  back: {
    traps:    centre('M120,70 C110,80 94,90 72,96 C88,104 104,112 112,124 L120,150 L128,124 C136,112 152,104 168,96 C146,90 130,80 120,70 Z'),
    upperback:mirror('M72,100 C66,112 70,128 82,136 C94,140 106,134 112,126 C104,114 90,106 72,100 Z'),
    lats:     mirror('M76,136 C72,160 80,190 100,214 L112,220 L112,160 C104,150 92,142 76,136 Z'),
    erectors: mirror('M110,150 L119,152 L119,244 L106,242 C104,212 104,178 110,150 Z'),
    sdelts:   mirror('M68,94 C52,96 44,110 44,130 L56,134 C58,118 64,106 76,100 Z'),
    triceps:  mirror('M46,136 C40,154 42,178 48,196 C56,196 62,184 64,166 C64,154 62,144 58,138 Z'),
    forearms: mirror('M44,204 C36,226 34,250 36,272 L48,272 C52,252 58,230 62,208 C56,202 50,202 44,204 Z'),
    glutes:   mirror('M80,232 C72,250 74,274 90,286 C102,292 114,288 119,280 L119,244 C106,236 92,232 80,232 Z'),
    hams:     mirror('M76,288 C70,312 72,338 80,358 C88,362 96,362 102,358 C108,334 112,310 116,290 C104,294 88,294 76,288 Z'),
    calves:   mirror('M74,362 C62,384 66,414 80,436 L94,436 C100,414 102,388 98,364 C90,360 82,360 74,362 Z'),
  },
};

export const LABEL = {
  base: 'Base (body)', traps: 'Traps', upperback: 'Upper back', lats: 'Lats', erectors: 'Lower back',
  chest: 'Chest', fdelts: 'Front delts', sdelts: 'Side delts', biceps: 'Biceps', triceps: 'Triceps',
  forearms: 'Forearms', abs: 'Abs', glutes: 'Glutes', hams: 'Hamstrings', quads: 'Quads', calves: 'Calves',
};

/* Sheet: front block on top (one row per tier), back block below.
   Columns are layers. Width = widest block; the front block leaves its
   last column empty. */
export function sheetSize() {
  const cols = Math.max(LAYOUT.front.length, LAYOUT.back.length);
  return { cols, w: cols * CELL_W, h: 2 * TIERS.length * CELL_H };
}

export function cellOrigin(view, layer, tier) {
  const col = LAYOUT[view].indexOf(layer);
  const row = (view === 'back' ? TIERS.length : 0) + TIERS.indexOf(tier);
  return { x: col * CELL_W, y: row * CELL_H };
}
