/* GENERATED — do not edit. Regenerate with: node "r&d/tools/build-slew.cjs"
 *
 * Slew's barbell-plate detector and tracker (no MediaPipe), bundled from
 * slew-v2/src/capture/video. Exposes one global: SlewVideo.
 * Loaded on first use of Bar path from video.
 *
 * Built 2026-11-08.
 */
"use strict";
var SlewVideo = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // .ironlog-video-entry.ts
  var ironlog_video_entry_exports = {};
  __export(ironlog_video_entry_exports, {
    PlateTracker: () => PlateTracker,
    STANDARD_PLATE_DIAMETER_M: () => STANDARD_PLATE_DIAMETER_M,
    calibrateFromPlate: () => calibrateFromPlate,
    detectPlate: () => detectPlate,
    detectPlateCandidates: () => detectPlateCandidates,
    searchPlateInClip: () => searchPlateInClip,
    toGrayscale: () => toGrayscale,
    trackCircle: () => trackCircle
  });

  // src/capture/video/plateDetect.ts
  var STANDARD_PLATE_DIAMETER_M = 0.45;
  var MIN_SCORE = 0.35;
  var TRACK_MIN_SCORE = 0.25;
  var CANDIDATE_MIN_SCORE = 0.18;
  function peakNeighbourhood(acc, cw, ch) {
    return topPeaks(acc, cw, ch, 1, 2)[0] ?? null;
  }
  function topPeaks(acc, cw, ch, count, suppressCells) {
    const work = Int32Array.from(acc);
    const out = [];
    for (let k = 0; k < count; k++) {
      let bestVotes = -1;
      let bestI = -1;
      for (let i = 0; i < work.length; i++) {
        if (work[i] > bestVotes) {
          bestVotes = work[i];
          bestI = i;
        }
      }
      if (bestI < 0 || bestVotes <= 0) break;
      const px = bestI % cw;
      const py = bestI / cw | 0;
      let sum = 0;
      let wx = 0;
      let wy = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const x = px + dx;
          const y = py + dy;
          if (x < 0 || y < 0 || x >= cw || y >= ch) continue;
          const v = acc[y * cw + x];
          sum += v;
          wx += v * x;
          wy += v * y;
        }
      }
      if (sum > 0) out.push({ x: wx / sum, y: wy / sum, sum });
      for (let dy = -suppressCells; dy <= suppressCells; dy++) {
        for (let dx = -suppressCells; dx <= suppressCells; dx++) {
          const x = px + dx;
          const y = py + dy;
          if (x < 0 || y < 0 || x >= cw || y >= ch) continue;
          work[y * cw + x] = 0;
        }
      }
    }
    return out;
  }
  function detectPlateCandidates(gray, w, h, opts, topK = 4) {
    const { minR, maxR, edgeThreshold = 0.22, cellSize = 2 } = opts;
    if (maxR <= minR || minR < 4) return [];
    const { gx, gy, mag, maxMag } = sobel(gray, w, h);
    if (maxMag <= 0) return [];
    const thresh = maxMag * edgeThreshold;
    const cw = Math.ceil(w / cellSize);
    const ch = Math.ceil(h / cellSize);
    const rStep = Math.max(1, Math.round((maxR - minR) / 20));
    const found = [];
    for (let r = minR; r <= maxR; r += rStep) {
      const acc = new Int32Array(cw * ch);
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          const m = mag[i];
          if (m < thresh) continue;
          const nx = gx[i] / m;
          const ny = gy[i] / m;
          for (const sign of [1, -1]) {
            const cx = x + sign * nx * r;
            const cy = y + sign * ny * r;
            if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
            const ci = (cy / cellSize | 0) * cw + (cx / cellSize | 0);
            acc[ci] = (acc[ci] ?? 0) + 1;
          }
        }
      }
      const norm = 2 * Math.PI * r;
      const suppress = Math.max(2, Math.round(r / cellSize / 2));
      for (const peak of topPeaks(acc, cw, ch, 2, suppress)) {
        const score = peak.sum / norm;
        if (score < CANDIDATE_MIN_SCORE) continue;
        found.push({ cx: peak.x * cellSize, cy: peak.y * cellSize, r, score });
      }
    }
    found.sort((a, b) => b.score - a.score);
    const kept = [];
    for (const c of found) {
      if (kept.some((k) => Math.hypot(k.cx - c.cx, k.cy - c.cy) < Math.max(k.r, c.r) * 0.7)) {
        continue;
      }
      kept.push(c);
      if (kept.length >= topK) break;
    }
    return kept;
  }
  function sobel(gray, w, h) {
    const gx = new Float32Array(w * h);
    const gy = new Float32Array(w * h);
    const mag = new Float32Array(w * h);
    let maxMag = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const tl = gray[i - w - 1], tc = gray[i - w], tr = gray[i - w + 1];
        const ml = gray[i - 1], mr = gray[i + 1];
        const bl = gray[i + w - 1], bc = gray[i + w], br = gray[i + w + 1];
        const sx = tr + 2 * mr + br - tl - 2 * ml - bl;
        const sy = bl + 2 * bc + br - tl - 2 * tc - tr;
        const m = Math.sqrt(sx * sx + sy * sy);
        gx[i] = sx;
        gy[i] = sy;
        mag[i] = m;
        if (m > maxMag) maxMag = m;
      }
    }
    return { gx, gy, mag, maxMag };
  }
  function toGrayscale(rgba, w, h) {
    const out = new Uint8Array(w * h);
    for (let i = 0, p = 0; i < out.length; i++, p += 4) {
      out[i] = (rgba[p] * 299 + rgba[p + 1] * 587 + rgba[p + 2] * 114) / 1e3;
    }
    return out;
  }
  function detectPlate(gray, w, h, opts) {
    const { minR, maxR, edgeThreshold = 0.25, cellSize = 2 } = opts;
    if (maxR <= minR || minR < 4) return null;
    const { gx, gy, mag, maxMag } = sobel(gray, w, h);
    if (maxMag <= 0) return null;
    const thresh = maxMag * edgeThreshold;
    const cw = Math.ceil(w / cellSize);
    const ch = Math.ceil(h / cellSize);
    const rStep = Math.max(1, Math.round((maxR - minR) / 24));
    const radii = [];
    for (let r = minR; r <= maxR; r += rStep) radii.push(r);
    let best = null;
    for (let ri = 0; ri < radii.length; ri++) {
      const r = radii[ri];
      const acc = new Int32Array(cw * ch);
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          const m = mag[i];
          if (m < thresh) continue;
          const nx = gx[i] / m;
          const ny = gy[i] / m;
          for (const sign of [1, -1]) {
            const cx = x + sign * nx * r;
            const cy = y + sign * ny * r;
            if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
            const ci = (cy / cellSize | 0) * cw + (cx / cellSize | 0);
            acc[ci] = (acc[ci] ?? 0) + 1;
          }
        }
      }
      const peak = peakNeighbourhood(acc, cw, ch);
      if (!peak) continue;
      const score = peak.sum / (2 * Math.PI * r);
      if (!best || score > best.score) {
        best = { cx: peak.x * cellSize, cy: peak.y * cellSize, r, score };
      }
    }
    if (!best || best.score < MIN_SCORE) return null;
    return best;
  }
  function trackCircle(gray, w, h, r, prevCx, prevCy, searchPx, edgeThreshold = 0.25) {
    const { gx, gy, mag, maxMag } = sobel(gray, w, h);
    if (maxMag <= 0) return null;
    const thresh = maxMag * edgeThreshold;
    const x0 = Math.max(0, Math.floor(prevCx - searchPx));
    const x1 = Math.min(w - 1, Math.ceil(prevCx + searchPx));
    const y0 = Math.max(0, Math.floor(prevCy - searchPx));
    const y1 = Math.min(h - 1, Math.ceil(prevCy + searchPx));
    const aw = x1 - x0 + 1;
    const ah = y1 - y0 + 1;
    if (aw <= 0 || ah <= 0) return null;
    const acc = new Int32Array(aw * ah);
    const bandLo = Math.max(0, Math.floor(prevCy - searchPx - r - 2));
    const bandHi = Math.min(h - 1, Math.ceil(prevCy + searchPx + r + 2));
    for (let y = Math.max(1, bandLo); y < Math.min(h - 1, bandHi); y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const m = mag[i];
        if (m < thresh) continue;
        const nx = gx[i] / m;
        const ny = gy[i] / m;
        for (const sign of [1, -1]) {
          const cx = x + sign * nx * r;
          const cy = y + sign * ny * r;
          if (cx < x0 || cx > x1 || cy < y0 || cy > y1) continue;
          const ci = (cy - y0 | 0) * aw + (cx - x0 | 0);
          acc[ci] = (acc[ci] ?? 0) + 1;
        }
      }
    }
    const peak = peakNeighbourhood(acc, aw, ah);
    if (!peak) return null;
    const score = peak.sum / (2 * Math.PI * r);
    if (score < TRACK_MIN_SCORE) return null;
    return { cx: peak.x + x0, cy: peak.y + y0, r, score };
  }

  // src/capture/video/plateTracker.ts
  var WORK_HEIGHT = 288;
  var MIN_R_FRAC = 0.04;
  var MAX_R_FRAC = 0.26;
  var LOST_LIMIT = 4;
  var PlateTracker = class {
    constructor() {
      __publicField(this, "canvas", null);
      __publicField(this, "ctx", null);
      __publicField(this, "lockedRadius", null);
      __publicField(this, "last", null);
      __publicField(this, "lostFrames", 0);
      __publicField(this, "w", 0);
      __publicField(this, "h", 0);
      /** Radii observed while locked, for the calibration median. */
      __publicField(this, "radiiPx", []);
      __publicField(this, "confirmed", false);
    }
    /**
     * Lock the tracker to a plate the user has confirmed.
     *
     * A confirmed circle is better evidence than anything the detector can
     * establish on its own, so this skips acquisition entirely: the radius is
     * taken as given and every frame goes straight to the cheap local search.
     * Coordinates are normalised so the caller never has to know the work-surface
     * resolution.
     */
    seed(cxNorm, cyNorm, rNorm, video) {
      this.surface(video);
      this.lockedRadius = rNorm * this.h;
      this.last = { cx: cxNorm * this.w, cy: cyNorm * this.h, r: this.lockedRadius, score: 1 };
      this.lostFrames = 0;
      this.confirmed = true;
    }
    surface(video) {
      const scale = WORK_HEIGHT / video.videoHeight;
      const w = Math.max(2, Math.round(video.videoWidth * scale));
      const h = Math.max(2, Math.round(video.videoHeight * scale));
      if (!this.canvas || this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas = new OffscreenCanvas(w, h);
        this.ctx = this.canvas.getContext("2d", { alpha: false, willReadFrequently: true });
        this.w = w;
        this.h = h;
      }
      return this.canvas;
    }
    /**
     * Process one frame.
     *
     * `expectedY` is the pose tracking point in normalised coords. The bar sits
     * at roughly that height, so it is used to reject circles found somewhere
     * implausible — a wall clock, a fan, the lifter's head. Without that
     * constraint the detector will happily lock onto the wrong round thing and
     * report a confident, wrong scale.
     */
    process(video, expectedY) {
      const surface = this.surface(video);
      const ctx = this.ctx;
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, surface.width, surface.height);
      const rgba = ctx.getImageData(0, 0, surface.width, surface.height).data;
      const gray = toGrayscale(rgba, this.w, this.h);
      let found = null;
      if (this.lockedRadius !== null && this.last) {
        found = trackCircle(
          gray,
          this.w,
          this.h,
          this.lockedRadius,
          this.last.cx,
          this.last.cy,
          Math.max(12, this.lockedRadius * 0.9)
        );
        if (!found) {
          this.lostFrames++;
          if (this.lostFrames >= LOST_LIMIT && !this.confirmed) {
            this.lockedRadius = null;
            this.last = null;
            this.lostFrames = 0;
          }
        }
      }
      if (!found && this.lockedRadius === null) {
        found = detectPlate(gray, this.w, this.h, {
          minR: Math.round(this.h * MIN_R_FRAC),
          maxR: Math.round(this.h * MAX_R_FRAC)
        });
        if (found && !this.plausible(found, expectedY)) found = null;
        if (found) {
          this.lockedRadius = found.r;
          this.lostFrames = 0;
        }
      }
      if (!found) return null;
      this.last = found;
      this.lostFrames = 0;
      this.radiiPx.push(found.r);
      return {
        cx: found.cx / this.w,
        cy: found.cy / this.h,
        r: found.r / this.h,
        score: found.score
      };
    }
    /**
     * The bar is near the pose tracking point. A circle far from it is something
     * else in the gym, not the plate.
     */
    plausible(c, expectedY) {
      if (expectedY === null) return true;
      const normY = c.cy / this.h;
      return Math.abs(normY - expectedY) < 0.25;
    }
    /** Median radius in work-image pixels, and the spread around it. */
    radiusStats() {
      if (this.radiiPx.length < 5) return null;
      const sorted = [...this.radiiPx].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      if (median <= 0) return null;
      const p10 = sorted[Math.floor(sorted.length * 0.1)];
      const p90 = sorted[Math.floor(sorted.length * 0.9)];
      return { median, spread: (p90 - p10) / median, count: sorted.length };
    }
    /** Scale factor from work-image pixels back to source-video pixels. */
    get workScale() {
      return this.h > 0 ? this.h : 1;
    }
    /** True when the tracker is following a plate the user confirmed. */
    get isConfirmed() {
      return this.confirmed;
    }
  };
  function candidatesInFrame(video) {
    const scale = WORK_HEIGHT / video.videoHeight;
    const w = Math.max(2, Math.round(video.videoWidth * scale));
    const h = Math.max(2, Math.round(video.videoHeight * scale));
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
    if (!ctx) return [];
    ctx.drawImage(video, 0, 0, w, h);
    const gray = toGrayscale(ctx.getImageData(0, 0, w, h).data, w, h);
    return detectPlateCandidates(
      gray,
      w,
      h,
      { minR: Math.round(h * MIN_R_FRAC), maxR: Math.round(h * MAX_R_FRAC) },
      4
    ).map((c) => ({ cx: c.cx / w, cy: c.cy / h, r: c.r / h, score: c.score }));
  }
  async function searchPlateInClip(video, fromS, toS, frameCount = 10, onProgress) {
    const seekTo = (t) => new Promise((resolve) => {
      if (Math.abs(video.currentTime - t) < 0.02) return resolve();
      const done = () => resolve();
      video.addEventListener("seeked", done, { once: true });
      video.currentTime = t;
    });
    const span = Math.max(1e-3, toS - fromS);
    const groups = [];
    for (let i = 0; i < frameCount; i++) {
      const t = fromS + span * (i + 0.5) / frameCount;
      await seekTo(t);
      onProgress?.((i + 1) / frameCount);
      for (const c of candidatesInFrame(video)) {
        const g = groups.find(
          (q) => Math.abs(q.r - c.r) < Math.max(q.r, c.r) * 0.25 && Math.abs(q.cx - c.cx) < Math.max(q.r, c.r) * 1.2
        );
        if (g) {
          const n = g.seen;
          g.cx = (g.cx * n + c.cx) / (n + 1);
          g.r = (g.r * n + c.r) / (n + 1);
          g.score = Math.max(g.score, c.score);
          g.cy = c.cy;
          g.minY = Math.min(g.minY, c.cy);
          g.maxY = Math.max(g.maxY, c.cy);
          g.seen = n + 1;
          if (c.score > g.bestScore) {
            g.bestScore = c.score;
            g.bestCx = c.cx;
            g.bestCy = c.cy;
            g.bestR = c.r;
            g.bestT = t;
          }
        } else {
          groups.push({
            cx: c.cx,
            cy: c.cy,
            r: c.r,
            score: c.score,
            seen: 1,
            minY: c.cy,
            maxY: c.cy,
            bestScore: c.score,
            bestCx: c.cx,
            bestCy: c.cy,
            bestR: c.r,
            bestT: t
          });
        }
      }
    }
    const ranked = groups.map((g) => {
      const travel = g.maxY - g.minY;
      const consistency = g.seen / frameCount;
      const rank = consistency * 1 + Math.min(travel / 0.15, 1) * 1.6 + g.score * 0.6;
      return {
        // Shown at the frame it was best seen in, not at its average position —
        // the average is nowhere in particular for a moving object.
        cx: g.bestCx,
        cy: g.bestCy,
        r: g.bestR,
        atTime: g.bestT,
        score: g.score,
        seenIn: g.seen,
        travel,
        rank
      };
    });
    ranked.sort((a, b) => b.rank - a.rank);
    return ranked.filter((c) => c.seenIn >= 2).slice(0, 4);
  }

  // src/capture/video/calibration.ts
  function calibrateFromPlate(radiusPx, plateDiameterM, agreementSpread) {
    if (!Number.isFinite(radiusPx) || radiusPx < 6) return null;
    const diameterPx = radiusPx * 2;
    const metresPerPixel = plateDiameterM / diameterPx;
    const confidence = Math.max(0, Math.min(1, 1 - agreementSpread * 2));
    return {
      metresPerPixel,
      method: "plate-diameter",
      confidence,
      spanPx: diameterPx,
      framesUsed: 0
    };
  }
  return __toCommonJS(ironlog_video_entry_exports);
})();

if (typeof globalThis !== "undefined") globalThis.SlewVideo = SlewVideo;
