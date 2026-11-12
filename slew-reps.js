/* Rep detection and the RIR estimate, on top of slew-core.js.

   The engine side of bar speed, with slew-core.js and slew-video.js. Like
   them it takes nothing from Ironlog: no imports, no app state, no DOM.
   Samples, a load and a lift's profile go in; reps, their velocities and a
   RIR estimate come out. The contract is r&d/notes/slew-api.md.

   Needs one global, `Slew` (slew-core.js, loaded by index.html before any
   module). Hand-written, unlike the two generated bundles: this is where the
   tuning against real traces lives (r&d/notes/vbt-validation.md), and
   r&d/tools/vbt-sim.cjs and vbt-rir.cjs run this file itself.

   Moved here whole from index.html in the module split
   (r&d/notes/module-split.md); nothing in it changed. */

/* Acceleration → displacement for Measure. Replaces Slew.integrateMotion.
   Slew only removes drift where MotionCapture marks the bar still, and then
   zeroes the speed there. On real sets that fails two ways (9 raw traces,
   9 Nov 2026, r&d/notes/vbt-validation.md):
   - the phone's vertical acceleration averages −0.1 to −0.24 m/s² over a set
     that starts and ends at rest, and an OHP set is "still" only 2–8% of the
     time, so drift ran for 20–50 s uncorrected: 0 of 16 reps found;
   - "still" is judged from acceleration alone, and steady motion has none,
     so the middle of a slow rep could be zeroed away.
   Reps go up and down; drift doesn't. So: integrate, strip the slow part of
   the speed (high-pass VBT_HP_V Hz), zero it where the bar really rests,
   integrate again and strip the slow part of the position (VBT_HP_X Hz).
   Zero-phase Butterworth, as Slew filters. Real traces: 77 of 81 reps
   (Slew 36). Synthetic (r&d/tools/vbt-sim.cjs): no set worse, no extra reps.
   Very slow reps read short on range — a guide, as all of this is. */
const VBT_HP_V = 0.15, VBT_HP_X = 0.05, VBT_FS = 60;
/* Tilt correction (00-V1). Slew reads "vertical" against a gravity direction
   it only updates while the bar is still. But the phone turns as the bar rolls
   in the hands, and on any lift that moves in an arc (a curl turned it 117°,
   an overhead press 81°), so mid-rep the old "down" is wrong: gravity leaks
   into the reading and real vertical movement leaks out of it. The phone
   already knows where down is at every sample — its own gyro-fused gravity is
   the with-gravity reading minus the linear one — so each sample's linear
   acceleration is projected onto that instead. 11 Nov 2026 traces (5 kg bar,
   11 sets): range of motion steadied (overhead press 44–58 cm, was 17–40) and
   two miscounted sets came right. r&d/notes/vbt-validation.md.
   xyz: { lx, ly, lz, gx, gy, gz } one row per motion sample. Returns the
   motion with `a` replaced, and the share of samples it could re-read; under
   90% (a phone with no linear reading) the motion comes back untouched. */
export function vbtTiltMotion(motion, xyz) {
  const n = motion.length;
  if (!xyz || !xyz.lx || xyz.lx.length !== n || !n) return { motion, used: 0 };
  const out = new Array(n);
  let bias = 0, ok = 0;
  for (let i = 0; i < n; i++) {
    const m = motion[i], lx = xyz.lx[i], ly = xyz.ly[i], lz = xyz.lz[i], gx = xyz.gx[i], gy = xyz.gy[i], gz = xyz.gz[i];
    if (lx == null || ly == null || lz == null || gx == null || gy == null || gz == null) { out[i] = m; continue; }
    const dx = gx - lx, dy = gy - ly, dz = gz - lz, g = Math.hypot(dx, dy, dz);
    if (!(g > 7 && g < 12.5)) { out[i] = m; continue; }       // not gravity-sized: the phone's fusion hasn't settled
    const aV = (lx * dx + ly * dy + lz * dz) / g;
    if (m.still) bias += (aV - bias) * 0.05;                    // the same slow zero Slew keeps while the bar rests
    out[i] = { t: m.t, a: aV - bias, still: m.still };
    ok++;
  }
  const used = Math.round(ok / n * 100) / 100;
  return used >= 0.9 ? { motion: out, used } : { motion, used: 0 };
}
function vbtLowPass(x, fc, fs) {
  if (x.length < 4) return [...x];
  const wc = Math.tan(Math.PI * fc / fs), k1 = Math.SQRT2 * wc, k2 = wc * wc;
  const a0 = k2 / (1 + k1 + k2), a1 = 2 * a0, a2 = a0, b1 = 2 * (k2 - 1) / (1 + k1 + k2), b2 = (1 - k1 + k2) / (1 + k1 + k2);
  const pass = inp => {
    const o = new Array(inp.length);
    let x1 = inp[0], x2 = x1, y1 = x1, y2 = x1;
    for (let i = 0; i < inp.length; i++) {
      const yi = a0 * inp[i] + a1 * x1 + a2 * x2 - b1 * y1 - b2 * y2;
      o[i] = yi; x2 = x1; x1 = inp[i]; y2 = y1; y1 = yi;
    }
    return o;
  };
  return pass(pass(x).reverse()).reverse();
}
export function vbtIntegrate(motion) {
  const n = motion.length;
  if (n < 2) return [];
  const t0 = motion[0].t, span = motion[n - 1].t - t0, dtMs = 1000 / VBT_FS, dt = 1 / VBT_FS;
  const a = [], still = [], ts = [];
  for (let t = 0, j = 0; t <= span; t += dtMs) {   // uniform rate first — the filters need it
    while (j < n - 2 && motion[j + 1].t - t0 < t) j++;
    const p = motion[j], q = motion[j + 1] || p, gap = q.t - p.t, f = gap > 0 ? (t - (p.t - t0)) / gap : 0;
    a.push(p.a + (q.a - p.a) * f); still.push(p.still && q.still); ts.push(t0 + t);
  }
  const m = a.length;
  let v = new Array(m).fill(0);
  for (let i = 1; i < m; i++) v[i] = v[i - 1] + (a[i] + a[i - 1]) / 2 * dt;
  const vSlow = vbtLowPass(v, VBT_HP_V, VBT_FS);
  v = v.map((x, i) => still[i] ? 0 : x - vSlow[i]);
  let x = new Array(m).fill(0);
  for (let i = 1; i < m; i++) x[i] = x[i - 1] + (v[i] + v[i - 1]) / 2 * dt;
  const xSlow = vbtLowPass(x, VBT_HP_X, VBT_FS);
  return x.map((y, i) => ({ t: ts[i], x: y - xSlow[i], conf: still[i] ? 1 : 0.85 }));   // confidence falls while unanchored — that is where drift hides
}
/* Which of Slew's reps are real. Slew is asked for reps down to VBT_MIN_ROM
   (4 cm) — the 9 Nov AMRAP's slow late reps read 14–17 cm through the drift
   filter and the lift's 15 cm floor threw them away; calf raises travel 5–8 cm.
   Then, in a set of 4+, a rep under 0.6 of the set's median travel is a
   lift-off from the hooks or a fidget (11–16 cm against ~30 cm on the 9 Nov
   warm-ups; genuine reps never fell below 0.71). A set of 1–3 has no median
   worth trusting, so it keeps the lift's own floor. 9 Nov traces: 80 of 81
   reps, none extra. */
export const VBT_MIN_ROM = 0.04, VBT_SETUP_MS = 1800;
export function vbtDropBlips(reps0, liftMinRom) {
  /* In a set of 4+, a "rep" that is already over 1.8 s after Start is the bar
     being got into position: nobody taps the phone, takes the bar and finishes
     a rep that fast (11 Nov squat: the bar going onto the back read as a 39 cm
     rep ending at 1.5 s; the earliest real first rep on either day ended at
     2.7 s). */
  const early = r => r.tEnd < VBT_SETUP_MS || ((r.quality && r.quality.flags) || []).includes('clipped-start');
  const reps = reps0.length >= 4 && early(reps0[0]) ? reps0.slice(1) : reps0;
  if (reps.length < 4) return reps.filter(r => r.rom >= (liftMinRom || 0)).map((r, i) => ({ ...r, index: i + 1 }));
  const s = reps.map(r => r.rom).sort((x, y) => x - y), med = s[Math.floor(s.length / 2)];
  return reps.filter(r => r.rom >= 0.6 * med).map((r, i) => ({ ...r, index: i + 1 }));
}
export function vbtSummary(reps) {
  if (!reps.length) return { repCount: 0, bestMeanVelocity: 0, velocityLoss: 0, confidence: 0 };
  const best = Math.max(...reps.map(r => r.concentric.meanVelocity)), last = reps[reps.length - 1].concentric.meanVelocity;
  return { repCount: reps.length, bestMeanVelocity: best, velocityLoss: best > 0 ? (best - last) / best * 100 : 0,
    confidence: reps.reduce((x, r) => x + r.quality.confidence, 0) / reps.length };
}

/* A missed rep or a near-stall means the last finished rep was at the limit —
   so it can't have been moving fast. Pin and dead-stop presses fool the
   detector: re-racking or lifting the bar off the pins after the set reads as a
   part-rep, and a set at 0.68 m/s came out as RIR 0. When the last finished rep
   was more than about three reps' worth of speed above the limit, the evidence
   is dropped and the estimate falls back to the speed trend. Dropped evidence
   also never calibrates the limit (attachVbt reads est.measuredV0). */
/* Bar-speed RIR for a set (00-V2). Slew's own estimator stays as it is for
   a set that ends in a missed rep or a near-stall — that is observed, not
   estimated. For everything else it compared the phone's speed with a
   typical failure speed for the lift, either straight ("profile") or by
   carrying the whole set's average slow-down forward ("decay"). On the 9 Nov
   push day both went wrong: a 40 kg warm-up triple read RIR 0.2, because the
   phone under-reads slow heavy reps and a population failure speed knows
   nothing about this phone; a 17-rep AMRAP that lost 41% of its speed read
   RIR 12, because reps slow gently for most of a set and sharply at the end,
   so the average slope says there is a long way to go.

   What survives a mis-scaled phone is the set compared with itself: how much
   speed was lost from the opening reps to the last one. The share of the
   possible reps done rises with that loss in much the same way whatever the
   load — about half done at 40% of the loss seen at failure, 85% done at 80%
   of it. So: done = (loss ÷ loss-at-failure)^0.75, and reps left =
   reps × (1 − done) ÷ done. Loss-at-failure is the lift's vlF (the lifter's
   own once a set to failure has been measured, else the population figure).
   Where the lifter's own failure speed has been measured on this phone, the
   last five reps' slope carried to that speed is averaged in.

   Not validated: there are two typed RIRs in all the traces. So it says
   less, not more — under 8% loss or past 6 in reserve it gives no number,
   and `fill` says whether the estimate is strong enough to write into the
   set's RIR (observed, or calibrated to this lifter); otherwise it is shown
   beside the set and the RIR box is left for the lifter. */
const VBT_RIR = { minReps: 3, minLoss: 0.08, shape: 0.75, cap: 6, recent: 5, failLoss: 0.15 };
export function vbtEstimateSet(reps, profile, failure) {
  let base = Slew.estimateSet(reps, profile, failure);
  if (!base) return null;
  const observed = e => e.method === 'observed-failure' || e.method === 'observed-grind';
  /* A missed rep or near-stall is only believed when the set had slowed down
     as well. Putting the bar down after an easy set reads as a failed attempt
     (11 Nov: a 5 kg row, 3% slower by the end, came out as RIR 0), and that
     would also have been stored as the lifter's failure speed. A set of one
     or two has no slow-down to check, so the evidence stands. */
  let doubted = false;
  if (observed(base) && reps.length >= VBT_RIR.minReps && !(base.velocityLoss >= VBT_RIR.failLoss)) {
    base = Slew.estimateSet(reps, profile, undefined) || base;
    doubted = !observed(base);
  }
  if (observed(base)) return { ...base, fill: true };
  const n = reps.length, v = reps.map(r => r.concentric.meanVelocity), last = v[n - 1];
  const none = why => ({ ...base, rir: NaN, rpe: NaN, spread: NaN, method: 'unknown', fill: false,
    because: why + (doubted ? ' Something at the end looked like a missed rep, but the set had not slowed down, so it was left out.' : '') });
  if (n < VBT_RIR.minReps) return none('Too few reps to read effort from bar speed — it needs at least three to see you slowing down.');
  const loss = base.velocityLoss, vlF = profile.vlF > 0 ? profile.vlF : 0.45;
  if (!(loss >= VBT_RIR.minLoss)) return none(`Your bar speed barely dropped across this set (${Math.round(Math.max(0, loss) * 100)}%), so there was plenty in reserve — more than bar speed can put a number on.`);
  const done = Math.max(0.05, Math.min(1, (loss / vlF) ** VBT_RIR.shape));
  let rir = n * (1 - done) / done, method = 'velocity-loss';
  const own = profile.v0Observed > 0;   // this lifter's failure speed, measured on this phone
  let because = `You lost ${Math.round(loss * 100)}% of your bar speed over ${n} reps. Sets of this lift usually end at about ${Math.round(vlF * 100)}%${profile.vlFCal ? ' (yours, measured)' : ''}, which puts you about ${Math.round(done * 100)}% of the way to failure.`;
  if (own) {
    const k = Math.min(VBT_RIR.recent, n), tail = v.slice(n - k), mx = (k - 1) / 2, my = tail.reduce((a, b) => a + b, 0) / k;
    let num = 0, den = 0;
    tail.forEach((y, i) => { num += (i - mx) * (y - my); den += (i - mx) ** 2; });
    const slope = den > 0 ? num / den : 0;
    if (slope < -0.005 && last > profile.v0Observed) {
      rir = (rir + Math.min(12, (last - profile.v0Observed) / -slope)) / 2;
      method = 'velocity-loss+limit';
      because += ` Your last reps were slowing by ${Math.round(-slope * 1000)} mm/s each towards the ${profile.v0Observed.toFixed(2)} m/s you have failed at before; the two readings are averaged.`;
    }
  }
  if (base.romCut) rir = Math.max(0, rir - Math.max(0, Math.min(2, (base.romLoss - 0.12) * 6)));   // reps getting shorter: nearer the limit than speed alone says
  if (rir > VBT_RIR.cap) return { ...base, rir: VBT_RIR.cap, rpe: 10 - VBT_RIR.cap, atLeast: true, spread: NaN, method, fill: false,
    because: `You lost only ${Math.round(loss * 100)}% of your bar speed over ${n} reps — ${VBT_RIR.cap} or more in reserve.` };
  const spread = Math.max(1, rir * 0.5) * (own ? 0.7 : 1);
  return { ...base, rir, rpe: Math.max(1, Math.min(10, 10 - rir)), spread, method, because, fill: own };
}
