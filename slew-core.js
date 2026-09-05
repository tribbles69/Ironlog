/* GENERATED — do not edit. Regenerate with: node tools/build-slew.cjs
 *
 * Slew's velocity-based training engine, sensor mode only, bundled from
 * slew-v2/src/{core,capture/sensor}. 65 tests pass in Slew's repo
 * against this source. Exposes one global: Slew.
 *
 * Built 2026-09-05.
 */
"use strict";
var Slew = (() => {
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

  // .ironlog-entry.ts
  var ironlog_entry_exports = {};
  __export(ironlog_entry_exports, {
    DEFAULT_MOTION_CONFIG: () => DEFAULT_MOTION_CONFIG,
    DEFAULT_PROFILES: () => DEFAULT_PROFILES,
    EFFORT_BANDS: () => EFFORT_BANDS,
    EXERCISES: () => EXERCISES,
    MotionCapture: () => MotionCapture,
    analyse: () => analyse,
    analyseSensorSet: () => analyseSensorSet,
    bandFor: () => bandFor,
    defaultProfile: () => defaultProfile,
    detectFailure: () => detectFailure,
    estimateSet: () => estimateSet,
    fitProfile: () => fitProfile,
    integrateMotion: () => integrateMotion,
    shouldFlipAxis: () => shouldFlipAxis,
    withRpe: () => withRpe
  });

  // src/core/signal/filters.ts
  function butterworthLowPass(x, cutoffHz, fs) {
    if (x.length < 4) return [...x];
    const wc = Math.tan(Math.PI * cutoffHz / fs);
    const k1 = Math.SQRT2 * wc;
    const k2 = wc * wc;
    const a0 = k2 / (1 + k1 + k2);
    const a1 = 2 * a0;
    const a2 = a0;
    const b1 = 2 * (k2 - 1) / (1 + k1 + k2);
    const b2 = (1 - k1 + k2) / (1 + k1 + k2);
    const pass = (input) => {
      const out = new Array(input.length);
      let x1 = input[0] ?? 0;
      let x2 = x1;
      let y1 = x1;
      let y2 = x1;
      for (let i = 0; i < input.length; i++) {
        const xi = input[i] ?? 0;
        const yi = a0 * xi + a1 * x1 + a2 * x2 - b1 * y1 - b2 * y2;
        out[i] = yi;
        x2 = x1;
        x1 = xi;
        y2 = y1;
        y1 = yi;
      }
      return out;
    };
    const forward = pass(x);
    const backward = pass([...forward].reverse());
    return backward.reverse();
  }
  function derivative(x, dt) {
    const n = x.length;
    const out = new Array(n).fill(0);
    if (n < 2) return out;
    out[0] = ((x[1] ?? 0) - (x[0] ?? 0)) / dt;
    out[n - 1] = ((x[n - 1] ?? 0) - (x[n - 2] ?? 0)) / dt;
    for (let i = 1; i < n - 1; i++) {
      out[i] = ((x[i + 1] ?? 0) - (x[i - 1] ?? 0)) / (2 * dt);
    }
    return out;
  }

  // src/core/repDetect.ts
  function detectReps(samples, opts) {
    const { fs, minRom = 0.1, velocityThreshold = 0.05, minConcentricMs = 150 } = opts;
    if (samples.length < fs * 0.3) return [];
    const x = samples.map((s) => s.x);
    const smoothed = butterworthLowPass(x, Math.min(6, fs / 4), fs);
    const v = derivative(smoothed, 1 / fs);
    const dir = v.map(
      (vi) => vi > velocityThreshold ? 1 : vi < -velocityThreshold ? -1 : 0
    );
    const runs = [];
    let cur = dir[0] ?? 0;
    let start = 0;
    for (let i = 1; i < dir.length; i++) {
      if (dir[i] !== cur) {
        runs.push({ dir: cur, start, end: i - 1 });
        cur = dir[i] ?? 0;
        start = i;
      }
    }
    runs.push({ dir: cur, start, end: dir.length - 1 });
    const merged = mergeShortStills(runs, Math.round(fs * 0.6));
    const reps = [];
    for (let i = 0; i < merged.length; i++) {
      const run = merged[i];
      if (run.dir !== 1) continue;
      const durationMs = (run.end - run.start) / fs * 1e3;
      if (durationMs < minConcentricMs) continue;
      const rom = (smoothed[run.end] ?? 0) - (smoothed[run.start] ?? 0);
      const flags = [];
      if (rom < minRom) {
        continue;
      }
      let eccentricStart;
      for (let j = i - 1; j >= 0 && j >= i - 2; j--) {
        const prev = merged[j];
        if (prev.dir === -1) {
          eccentricStart = prev.start;
          break;
        }
      }
      if (run.start === 0) flags.push("clipped-start");
      if (run.end === smoothed.length - 1) flags.push("clipped-end");
      const confSlice = samples.slice(run.start, run.end + 1);
      const meanConf = confSlice.reduce((a, s) => a + s.conf, 0) / Math.max(1, confSlice.length);
      if (meanConf < 0.6) flags.push("low-landmark-confidence");
      reps.push({
        ...eccentricStart !== void 0 ? { eccentricStart } : {},
        concentricStart: run.start,
        concentricEnd: run.end,
        flags
      });
    }
    return reps;
  }
  function mergeShortStills(runs, maxStillFrames) {
    const out = [];
    for (let i = 0; i < runs.length; i++) {
      const run = runs[i];
      const prev = out[out.length - 1];
      const next = runs[i + 1];
      const length = run.end - run.start + 1;
      if (run.dir === 0 && length <= maxStillFrames && prev !== void 0 && next !== void 0 && prev.dir === next.dir && prev.dir !== 0) {
        prev.end = next.end;
        i++;
        continue;
      }
      out.push({ ...run });
    }
    return out;
  }

  // src/core/metrics.ts
  var GRAVITY = 9.80665;
  function computeReps(samples, bounds, opts) {
    const { fs, loadKg } = opts;
    const x = samples.map((s) => s.x);
    const smoothed = butterworthLowPass(x, Math.min(6, fs / 4), fs);
    const v = derivative(smoothed, 1 / fs);
    return bounds.map((b, i) => {
      const concentric = phaseMetrics(smoothed, v, b.concentricStart, b.concentricEnd, fs);
      let eccentric;
      if (b.eccentricStart !== void 0) {
        eccentric = phaseMetrics(smoothed, v, b.eccentricStart, b.concentricStart, fs);
      }
      const rom = Math.abs((smoothed[b.concentricEnd] ?? 0) - (smoothed[b.concentricStart] ?? 0));
      const flags = [...b.flags];
      if (rom < 0.15) flags.push("short-rom");
      const confSlice = samples.slice(b.concentricStart, b.concentricEnd + 1);
      const meanConf = confSlice.reduce((a, s) => a + s.conf, 0) / Math.max(1, confSlice.length);
      const confidence = Math.max(0, Math.min(1, meanConf - flags.length * 0.12));
      const rep = {
        index: i + 1,
        tStart: samples[b.eccentricStart ?? b.concentricStart]?.t ?? 0,
        tEnd: samples[b.concentricEnd]?.t ?? 0,
        rom,
        concentric,
        ...eccentric ? { eccentric } : {},
        quality: { confidence, flags }
      };
      if (loadKg !== void 0 && loadKg > 0) {
        rep.meanPower = loadKg * GRAVITY * concentric.meanVelocity;
        rep.peakPower = loadKg * GRAVITY * concentric.peakVelocity;
      }
      return rep;
    });
  }
  function phaseMetrics(displacement, velocity, start, end, fs) {
    let peakVelocity = 0;
    let peakIdx = start;
    for (let i = start; i <= end; i++) {
      const mag = Math.abs(velocity[i] ?? 0);
      if (mag > peakVelocity) {
        peakVelocity = mag;
        peakIdx = i;
      }
    }
    const gate = Math.max(0.03, peakVelocity * 0.1);
    let j1 = start;
    let j2 = end;
    while (j1 < end && Math.abs(velocity[j1] ?? 0) < gate) j1++;
    while (j2 > j1 && Math.abs(velocity[j2] ?? 0) < gate) j2--;
    if (j2 - j1 < 3) {
      j1 = start;
      j2 = end;
    }
    const n = Math.max(1, j2 - j1);
    const duration = n / fs * 1e3;
    const dx = Math.abs((displacement[j2] ?? 0) - (displacement[j1] ?? 0));
    const meanVelocity = duration > 0 ? dx / (duration / 1e3) : 0;
    return {
      duration,
      meanVelocity,
      peakVelocity,
      timeToPeak: (peakIdx - j1) / fs * 1e3
    };
  }
  function summarize(reps) {
    if (reps.length === 0) {
      return { repCount: 0, bestMeanVelocity: 0, velocityLoss: 0, confidence: 0 };
    }
    const best = Math.max(...reps.map((r) => r.concentric.meanVelocity));
    const last = reps[reps.length - 1].concentric.meanVelocity;
    const velocityLoss = best > 0 ? (best - last) / best * 100 : 0;
    const confidence = reps.reduce((a, r) => a + r.quality.confidence, 0) / reps.length;
    return {
      repCount: reps.length,
      bestMeanVelocity: best,
      velocityLoss,
      confidence
    };
  }

  // src/core/signal/resample.ts
  function resampleUniform(samples, targetHz) {
    if (samples.length < 2) return [...samples];
    const first = samples[0];
    const last = samples[samples.length - 1];
    const dtMs = 1e3 / targetHz;
    const out = [];
    let j = 0;
    for (let t = first.t; t <= last.t; t += dtMs) {
      while (j < samples.length - 2 && samples[j + 1].t < t) j++;
      const a = samples[j];
      const b = samples[j + 1] ?? a;
      const span = b.t - a.t;
      const frac = span > 0 ? (t - a.t) / span : 0;
      out.push({
        t: t - first.t,
        x: a.x + (b.x - a.x) * frac,
        // Confidence interpolates too — a gap between two low-confidence frames
        // should not silently become a high-confidence sample.
        conf: a.conf + (b.conf - a.conf) * frac
      });
    }
    return out;
  }

  // src/core/failure.ts
  function detectFailure(samples, bounds, repRoms, opts) {
    const {
      fs,
      minAttemptFraction = 0.25,
      maxAttemptFraction = 0.75,
      stallVelocity = 0.06
    } = opts;
    const none = {
      failedAttempt: false,
      grind: false,
      minConcentricVelocity: Number.POSITIVE_INFINITY
    };
    if (bounds.length === 0 || samples.length < fs * 0.5) return none;
    const x = samples.map((s) => s.x);
    const smoothed = butterworthLowPass(x, Math.min(6, fs / 4), fs);
    const v = derivative(smoothed, 1 / fs);
    let failedRepIndex;
    let attemptFraction;
    let completedBounds = bounds;
    let completedRoms = repRoms;
    if (bounds.length >= 3) {
      const others = [...repRoms.slice(0, -1)].sort((a, b) => a - b);
      const otherMedian = others[Math.floor(others.length / 2)] ?? 0;
      const lastRomDetected = repRoms[repRoms.length - 1] ?? 0;
      const frac = otherMedian > 0 ? lastRomDetected / otherMedian : 1;
      if (frac >= minAttemptFraction && frac <= maxAttemptFraction) {
        failedRepIndex = bounds.length - 1;
        attemptFraction = frac;
        completedBounds = bounds.slice(0, -1);
        completedRoms = repRoms.slice(0, -1);
      }
    }
    if (completedBounds.length === 0) return none;
    const sortedRoms = [...completedRoms].sort((a, b) => a - b);
    const normalRom = sortedRoms[Math.floor(sortedRoms.length / 2)] ?? 0;
    if (normalRom <= 0) return none;
    const last = completedBounds[completedBounds.length - 1];
    const inset = Math.max(1, Math.round((last.concentricEnd - last.concentricStart) * 0.2));
    let minV = Number.POSITIVE_INFINITY;
    for (let i = last.concentricStart + inset; i <= last.concentricEnd - inset; i++) {
      const vi = v[i] ?? 0;
      if (vi < minV) minV = vi;
    }
    if (!Number.isFinite(minV)) minV = Number.POSITIVE_INFINITY;
    const grind = minV < stallVelocity;
    const lastRom = Math.abs(
      (smoothed[last.concentricEnd] ?? 0) - (smoothed[last.concentricStart] ?? 0)
    );
    const lastDurationS = (last.concentricEnd - last.concentricStart) / fs;
    const terminalVelocity = lastDurationS > 0 ? lastRom / lastDurationS : 0;
    const tailStart = last.concentricEnd;
    let failedAttempt = failedRepIndex !== void 0;
    if (!failedAttempt && tailStart < smoothed.length - Math.round(fs * 0.3)) {
      let lowest = smoothed[tailStart] ?? 0;
      let peak = lowest;
      let peakIdx = tailStart;
      for (let i = tailStart; i < smoothed.length; i++) {
        const xi = smoothed[i] ?? 0;
        if (xi < lowest) {
          lowest = xi;
          peak = xi;
          peakIdx = i;
        } else if (xi > peak) {
          peak = xi;
          peakIdx = i;
        }
      }
      const rise = peak - lowest;
      const frac = rise / normalRom;
      let descentAfterPeak = 0;
      for (let i = peakIdx; i < smoothed.length; i++) {
        descentAfterPeak = Math.max(descentAfterPeak, peak - (smoothed[i] ?? 0));
      }
      if (frac >= minAttemptFraction && frac <= maxAttemptFraction && descentAfterPeak > rise * 0.5) {
        failedAttempt = true;
        attemptFraction = frac;
      }
    }
    return {
      failedAttempt,
      grind,
      minConcentricVelocity: minV,
      ...attemptFraction !== void 0 ? { attemptFraction } : {},
      ...failedRepIndex !== void 0 ? { failedRepIndex } : {},
      ...failedAttempt || grind ? { terminalVelocity } : {}
    };
  }

  // src/core/index.ts
  function analyse(samples, opts = {}) {
    const { targetHz = 60, loadKg, minRom } = opts;
    const uniform = resampleUniform(samples, targetHz);
    const bounds = detectReps(uniform, {
      fs: targetHz,
      ...minRom !== void 0 ? { minRom } : {}
    });
    const allReps = computeReps(uniform, bounds, {
      fs: targetHz,
      ...loadKg !== void 0 ? { loadKg } : {}
    });
    const failure = detectFailure(
      uniform,
      bounds,
      allReps.map((r) => r.rom),
      { fs: targetHz }
    );
    const reps = failure.failedRepIndex !== void 0 ? allReps.slice(0, failure.failedRepIndex).map((r, i) => ({ ...r, index: i + 1 })) : allReps;
    return { reps, summary: summarize(reps), fs: targetHz, failure };
  }

  // src/core/rpe.ts
  var clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  function decaySlope(velocities) {
    const n = velocities.length;
    if (n < 3) return null;
    const mx = (n - 1) / 2;
    const my = velocities.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - mx) * (velocities[i] - my);
      den += (i - mx) ** 2;
    }
    if (den <= 0) return null;
    return num / den;
  }
  function estimateSet(reps, profile, evidence) {
    if (reps.length === 0) return null;
    const velocities = reps.map((r) => r.concentric.meanVelocity);
    const last = reps[reps.length - 1];
    const lastV = last.concentric.meanVelocity;
    const opening = [...velocities.slice(0, 3)].sort((a, b) => a - b);
    const vRef = opening[Math.floor(opening.length / 2)];
    const velocityLoss = vRef > 0 ? clamp((vRef - lastV) / vRef, 0, 1) : 0;
    const romBest = Math.max(...reps.slice(0, 3).map((r) => r.rom));
    const romLoss = romBest > 0 ? (romBest - last.rom) / romBest : 0;
    const romCut = romLoss > 0.12;
    let rir;
    let method;
    let spread;
    let because;
    let measuredV0;
    if (evidence?.failedAttempt) {
      rir = 0;
      method = "observed-failure";
      spread = 0.2;
      measuredV0 = evidence.terminalVelocity ?? lastV;
      because = "You tried another rep and did not complete it, so the last rep you finished was a true 0 reps in reserve.";
    } else if (evidence?.grind) {
      rir = 0.5;
      method = "observed-grind";
      spread = 0.7;
      measuredV0 = evidence.terminalVelocity ?? lastV;
      because = `The last rep nearly stalled on the way up (down to ${evidence.minConcentricVelocity.toFixed(2)} m/s), so you were within about a rep of failure.`;
    } else {
      const slope = decaySlope(velocities);
      const vTerm = profile.v0Observed ?? profile.v0;
      const measuredTerm = profile.v0Observed !== void 0;
      if (slope !== null && slope < -5e-3 && lastV > vTerm) {
        rir = clamp((lastV - vTerm) / -slope, 0, 12);
        method = "decay-extrapolation";
        spread = clamp(rir * 0.35 + 0.5, 0.5, 4) * (measuredTerm ? 1 : 1.8);
        because = `You slowed by ${Math.abs(slope * 1e3).toFixed(0)} mm/s per rep. Carrying that on reaches ` + (measuredTerm ? "the speed you actually failed at before" : "a typical failure speed (not yet measured for you)") + ` in about ${rir.toFixed(1)} more reps.`;
      } else if (slope !== null && slope >= -5e-3 && reps.length >= 3) {
        rir = Number.NaN;
        method = "unknown";
        spread = Number.NaN;
        because = "Your bar speed did not drop across this set, so there is nothing to extrapolate from. Take a set closer to failure and Slew can measure your limit directly.";
      } else {
        rir = clamp((lastV - profile.v0) / (profile.slope || 0.05), 0, 10);
        method = "profile";
        spread = profile.cal ? 1.4 : 2.5;
        because = profile.cal ? "Estimated from your saved profile \u2014 too few reps here to read a trend." : "Estimated from population defaults, which have not been checked against you yet.";
      }
    }
    if (!Number.isNaN(rir) && romCut) {
      rir = clamp(rir - clamp((romLoss - 0.12) * 6, 0, 2), 0, 12);
    }
    return {
      rir,
      rpe: Number.isNaN(rir) ? Number.NaN : clamp(10 - rir, 1, 10),
      method,
      spread,
      velocityLoss,
      romCut,
      romLoss,
      ...measuredV0 !== void 0 ? { measuredV0 } : {},
      because
    };
  }
  function withRpe(reps, profile, evidence) {
    if (evidence?.failedAttempt) {
      const n = reps.length;
      return reps.map((rep, i) => ({
        ...rep,
        rir: n - 1 - i,
        rpe: clamp(10 - (n - 1 - i), 1, 10)
      }));
    }
    const whole = estimateSet(reps, profile, evidence);
    if (whole && Number.isNaN(whole.rpe)) return reps.map((r) => ({ ...r }));
    return reps.map((rep, i) => {
      const isLast = i === reps.length - 1;
      const est = estimateSet(
        reps.slice(0, i + 1),
        profile,
        isLast ? evidence : void 0
      );
      if (!est || Number.isNaN(est.rpe)) return { ...rep };
      return {
        ...rep,
        rpe: Number(est.rpe.toFixed(1)),
        rir: Number(est.rir.toFixed(1)),
        ...est.method === "profile" && !profile.cal ? {
          quality: {
            confidence: rep.quality.confidence * 0.6,
            flags: [...rep.quality.flags, "rpe-out-of-range"]
          }
        } : {}
      };
    });
  }
  var EFFORT_BANDS = [
    [9.5, "to failure"],
    [8.5, "near limit"],
    [7.5, "hard"],
    [6.5, "working"],
    [0, "submaximal"]
  ];
  function bandFor(rpe) {
    if (Number.isNaN(rpe)) return "not enough evidence";
    for (const [min, label] of EFFORT_BANDS) if (rpe >= min) return label;
    return "submaximal";
  }

  // src/core/profiles.ts
  var DEFAULT_PROFILES = {
    "Goblet squat": { v0: 0.32, slope: 0.06, vlF: 0.45, romRef: 0.4, scale: 1, minRom: 0.15 },
    "Squat (free bar)": { v0: 0.3, slope: 0.075, vlF: 0.4, romRef: 0.49, scale: 1, minRom: 0.18 },
    "Squat (Smith)": { v0: 0.3, slope: 0.075, vlF: 0.4, romRef: 0.49, scale: 1, minRom: 0.18 },
    "Bench press": { v0: 0.16, slope: 0.045, vlF: 0.5, romRef: 0, scale: 1, minRom: 0.1 },
    "Deadlift (conv.)": { v0: 0.16, slope: 0.05, vlF: 0.32, romRef: 0.4, scale: 1, minRom: 0.2 },
    "Deadlift (trap)": { v0: 0.18, slope: 0.05, vlF: 0.32, romRef: 0.42, scale: 1, minRom: 0.18 },
    "Overhead press": { v0: 0.19, slope: 0.05, vlF: 0.45, romRef: 0, scale: 1, minRom: 0.15 },
    "Row / pulldown": { v0: 0.25, slope: 0.06, vlF: 0.45, romRef: 0, scale: 1, minRom: 0.12 },
    "Machine (stack)": { v0: 0.2, slope: 0.06, vlF: 0.45, romRef: 0, scale: 1, minRom: 0.1 }
  };
  var EXERCISES = Object.keys(DEFAULT_PROFILES);
  function defaultProfile(id) {
    return { ...DEFAULT_PROFILES[id] };
  }
  function fitProfile(velocities, statedRpe, current) {
    const n = velocities.length;
    if (n < 2) return null;
    const endRir = 10 - statedRpe;
    const xs = [];
    for (let i = 0; i < n; i++) xs.push(endRir + (n - 1 - i));
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = velocities.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - mx) * (velocities[i] - my);
      den += (xs[i] - mx) ** 2;
    }
    if (den <= 0) return null;
    const slope = num / den;
    const v0 = my - slope * mx;
    if (!(slope > 5e-3 && slope < 0.2)) return null;
    if (!(v0 > 0.02 && v0 < 1.2)) return null;
    const next = {
      ...current,
      slope: Number(slope.toFixed(4)),
      v0: Number(v0.toFixed(3)),
      cal: Date.now()
    };
    if (statedRpe >= 10) {
      const best = Math.max(...velocities);
      const last = velocities[n - 1];
      if (best > 0) {
        next.vlF = Number(Math.max(0.15, Math.min(0.75, (best - last) / best)).toFixed(3));
      }
    }
    return next;
  }

  // src/capture/sensor/sensorPipeline.ts
  function integrateMotion(motion) {
    const n = motion.length;
    if (n < 2) return [];
    const velocity = new Array(n).fill(0);
    for (let i = 1; i < n; i++) {
      const prev = motion[i - 1];
      const cur = motion[i];
      if (cur.still) {
        velocity[i] = 0;
        continue;
      }
      const dt = Math.max(2e-3, Math.min(0.08, (cur.t - prev.t) / 1e3));
      velocity[i] = velocity[i - 1] + (cur.a + prev.a) / 2 * dt;
    }
    let runStart = -1;
    for (let i = 0; i < n; i++) {
      const still = motion[i].still;
      if (!still && runStart < 0) {
        runStart = i;
      } else if (still && runStart >= 0) {
        const residual = velocity[i - 1] ?? 0;
        const span = i - runStart;
        if (span > 1) {
          for (let j = runStart; j < i; j++) {
            velocity[j] = velocity[j] - residual * (j - runStart) / span;
          }
        }
        runStart = -1;
      }
    }
    const out = new Array(n);
    let x = 0;
    out[0] = { t: motion[0].t, x: 0, conf: 1 };
    for (let i = 1; i < n; i++) {
      const dt = Math.max(2e-3, Math.min(0.08, (motion[i].t - motion[i - 1].t) / 1e3));
      x += (velocity[i] + velocity[i - 1]) / 2 * dt;
      out[i] = {
        t: motion[i].t,
        x,
        // Confidence falls while unanchored — that is where drift hides.
        conf: motion[i].still ? 1 : 0.85
      };
    }
    return out;
  }
  function analyseSensorSet(motion, opts) {
    const { exercise, profile, loadKg, targetHz = 60 } = opts;
    const samples = integrateMotion(motion);
    const scale = profile.scale || 1;
    const scaled = samples.map((s) => ({ ...s, x: s.x * scale }));
    const { reps: raw, summary } = analyse(scaled, {
      targetHz,
      minRom: profile.minRom,
      ...loadKg !== void 0 && loadKg > 0 ? { loadKg } : {}
    });
    const reps = withRpe(raw, profile);
    const sourceRate = motion.length > 1 ? (motion.length - 1) / ((motion[motion.length - 1].t - motion[0].t) / 1e3 || 1) : 0;
    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      lift: exercise,
      ...loadKg !== void 0 && loadKg > 0 ? { load: loadKg } : {},
      reps,
      summary,
      provenance: {
        mode: "sensor",
        sampleRate: targetHz,
        sourceRate
      }
    };
  }
  function shouldFlipAxis(samples) {
    let up = 0;
    let down = 0;
    for (let i = 1; i < samples.length; i++) {
      const d = samples[i].x - samples[i - 1].x;
      if (d > 0) up += d;
      else down -= d;
    }
    return down > up * 1.15;
  }

  // src/capture/sensor/deviceMotion.ts
  var DEFAULT_MOTION_CONFIG = {
    flip: 1,
    restMs: 180,
    stillG: 0.6
  };
  var norm = (v) => {
    const m = Math.hypot(v.x, v.y, v.z) || 1;
    return { x: v.x / m, y: v.y / m, z: v.z / m };
  };
  var dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
  var clamp2 = (x, a, b) => Math.max(a, Math.min(b, x));
  var MotionCapture = class {
    constructor(cfg = { ...DEFAULT_MOTION_CONFIG }, onStatus, onError) {
      this.cfg = cfg;
      this.onStatus = onStatus;
      this.onError = onError;
      __publicField(this, "listening", false);
      __publicField(this, "t0", 0);
      __publicField(this, "lastT", 0);
      __publicField(this, "gravity", null);
      __publicField(this, "bias", 0);
      __publicField(this, "restBuf", []);
      __publicField(this, "restSince", 0);
      __publicField(this, "atRest", true);
      __publicField(this, "evCount", 0);
      __publicField(this, "evT0", 0);
      __publicField(this, "samples", []);
      __publicField(this, "handler", (e) => {
        try {
          this.onMotion(e);
        } catch (err) {
          this.stop();
          this.onError?.(
            `Motion handler failed: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      });
    }
    /**
     * iOS requires a user-gesture-initiated permission request; Android exposes
     * the sensor with no prompt. Returns a human-readable reason on failure so
     * the UI never has to invent one.
     */
    static async requestPermission() {
      const DME = globalThis.DeviceMotionEvent;
      if (typeof DME === "undefined") {
        return { granted: false, reason: "This device or browser exposes no motion sensor." };
      }
      if (typeof DME.requestPermission !== "function") {
        return { granted: true };
      }
      try {
        const res = await DME.requestPermission();
        return res === "granted" ? { granted: true } : {
          granted: false,
          reason: "Motion access denied. Enable it in Settings \u2192 Safari \u2192 Motion & Orientation."
        };
      } catch {
        return {
          granted: false,
          reason: "Could not request motion access \u2014 open Slew directly in the browser, not inside another app."
        };
      }
    }
    start() {
      if (this.listening) return;
      this.reset();
      window.addEventListener("devicemotion", this.handler, { passive: true });
      this.listening = true;
    }
    stop() {
      if (!this.listening) return;
      window.removeEventListener("devicemotion", this.handler);
      this.listening = false;
    }
    reset() {
      this.samples.length = 0;
      this.t0 = 0;
      this.lastT = 0;
      this.gravity = null;
      this.bias = 0;
      this.restBuf = [];
      this.restSince = 0;
      this.atRest = true;
      this.evCount = 0;
      this.evT0 = 0;
    }
    setFlip(flip) {
      this.cfg = { ...this.cfg, flip };
    }
    onMotion(e) {
      const now = performance.now();
      if (!this.t0) this.t0 = now;
      if (!this.evT0) this.evT0 = now;
      this.evCount++;
      this.lastT = now;
      const inc = e.accelerationIncludingGravity;
      if (!inc || inc.x == null) {
        this.onStatus?.({ hz: 0, verticalAccel: 0, still: true, samples: this.samples.length });
        return;
      }
      const incVec = { x: inc.x ?? 0, y: inc.y ?? 0, z: inc.z ?? 0 };
      const linRaw = e.acceleration;
      const haveLin = !!(linRaw && linRaw.x != null);
      if (!this.gravity) this.gravity = { ...incVec };
      const lin = haveLin ? { x: linRaw.x ?? 0, y: linRaw.y ?? 0, z: linRaw.z ?? 0 } : {
        x: incVec.x - this.gravity.x,
        y: incVec.y - this.gravity.y,
        z: incVec.z - this.gravity.z
      };
      const mag = Math.hypot(lin.x, lin.y, lin.z);
      this.restBuf.push(mag);
      if (this.restBuf.length > 12) this.restBuf.shift();
      const quiet = this.restBuf.length > 6 && Math.max(...this.restBuf) < this.cfg.stillG;
      const aV = dot(lin, norm(this.gravity)) * this.cfg.flip;
      if (quiet) {
        if (!this.restSince) this.restSince = now;
        const k = 0.06;
        this.gravity.x += (incVec.x - this.gravity.x) * k;
        this.gravity.y += (incVec.y - this.gravity.y) * k;
        this.gravity.z += (incVec.z - this.gravity.z) * k;
        this.bias += (aV - this.bias) * 0.05;
        if (now - this.restSince > this.cfg.restMs) this.atRest = true;
      } else {
        this.restSince = 0;
        this.atRest = false;
      }
      this.samples.push({
        t: now - this.t0,
        a: aV - this.bias,
        still: this.atRest
      });
      const hz = this.evCount / ((now - this.evT0) / 1e3 || 1);
      this.onStatus?.({
        hz,
        verticalAccel: aV - this.bias,
        still: this.atRest,
        samples: this.samples.length
      });
    }
    /** Mean sample rate, Hz. */
    get rate() {
      const span = (this.lastT - this.t0) / 1e3;
      return span > 0 ? this.samples.length / span : 0;
    }
    /** Clamped delta used when resampling irregular sensor timing. */
    static safeDt(prev, now) {
      return clamp2((now - prev) / 1e3, 2e-3, 0.08);
    }
  };
  return __toCommonJS(ironlog_entry_exports);
})();

if (typeof globalThis !== "undefined") globalThis.Slew = Slew;
