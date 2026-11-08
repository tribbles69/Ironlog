# Video bar-path tracing and depth judging (roadmap 04)

**Status: agreed 2026-11-08 — Aaron took the recommended answer to all five
decisions in §11 ("Yes, build 04a").** 04a is being built; 04b and 04c wait.

Record or pick a side-on video of a set, track the bar end through it, draw
the bar path and give velocity per rep as a second source next to D1's
motion-sensor Measure. Depth judging for squats comes later. All processing on
the device, no uploads, results labelled as estimates. Replaces VBTgo, Metric
and PDC Performance on Aaron's phone.

## 1. What already exists — most of this is built, in Slew

Aaron's Slew app (`slew-v2`) already has a working video mode. Its README
records why each piece is the way it is. Reused here:

| Slew file | What it does | Needs MediaPipe? |
|---|---|---|
| `src/capture/video/plateDetect.ts` (387 lines, tested) | Finds a barbell plate as a circle: gradient-directed Hough transform, no OpenCV. 6.9 ms/frame to find, **1.0 ms/frame** to track once the radius is locked. | No |
| `src/capture/video/plateTracker.ts` (329 lines) | Detect-then-track state machine; `searchPlateInClip` samples 10 frames and ranks candidates by **vertical travel** (a plate moves, a wall clock doesn't), "Show another". A user-confirmed plate is never dropped. | No — pose is only an optional hint to reject circles far from the body; a confirmed plate doesn't need it |
| `src/capture/video/calibration.ts` (tested) | `calibrateFromPlate`: scale from the plate's diameter (450 mm). `calibrateFromSpans`: scale from body height via pose (fallback). | Plate: no. Spans: yes |
| `src/capture/video/videoAnalysis.ts` | Steps the clip **by seeking, never by playing** (Slew lesson: playback drops frames and misreports "no lifter"); builds the path, `horizontalDrift`, `fillGaps`, then the metrics. | Yes, as written — the pose path is mixed in |
| `src/core` → `Slew.analyse(samples)` | Rep detection, mean/peak velocity, ROM, velocity loss, RIR estimate from a position-over-time trace. | No — **already in Ironlog's `slew-core.js`** |

Ironlog left Slew's video mode out on purpose (`build-slew.cjs`): MediaPipe's
WASM and models are ~76 MB in Slew's tree (~16 MB for the lite model plus
one WASM build, per Slew's README), against Ironlog's ~1.5 MB offline shell.
**The plate path doesn't need MediaPipe at all.** That's what makes a first
build possible without the download.

## 2. Phases

- **04a — bar path and velocity from the plate** (this spec, first build).
  Pick a video from the gallery, trim it, confirm the plate, track it, show
  the path and per-rep numbers, and attach them to a set. No pose, no download.
- **04b — squat depth** (§9). Needs pose, so an **optional one-time
  download** of the lite pose model, only for people who turn it on.
- **04c — record in the app** (§10). The phone's own camera app records at
  a higher, steadier frame rate than a browser, so gallery comes first.

## 3. Bringing the code in

Bundle, don't hand-port, the same rule `build-slew.cjs` already follows: the
same tested code ships. Extend `r&d/tools/build-slew.cjs` with a second entry
that exports `plateDetect`, `plateTracker` (minus nothing — `expectedY` is
passed `null`), `calibrateFromPlate` and the pure helpers from
`videoAnalysis.ts` (`horizontalDrift`, `fillGaps`). Output to `slew-video.js`
at the root, loaded **on first use** (not in the shell's critical path), and
cached by `sw.js` like the other root files. Expected size: tens of kB.

The pose-mixed `analyseVideo` is **not** bundled. Ironlog gets a small
plate-only driver (~150 lines) that does the same seek loop and hands the
trace to `Slew.analyse`.

## 4. Filming guide (shown before picking, and in Help)

- **Side-on, square to the bar**: the camera looks straight at the plate face.
  Any angle shortens the path and the speed (cosine error; ~3.5 % at 15°,
  ~13 % at 30°) — the app can't fully correct this, so it says so.
- Phone **at plate height**, about 2–3 m away, propped or on a tripod — not
  hand-held. Whole rep in frame, with room above and below.
- The **near plate in view**, not hidden by a rack upright or a spotter.
- Good light; 30 fps or more (60 fps is better for fast lifts).
- One set per clip. Trim off the walk-out and re-rack (§5).

## 5. Flow (04a)

Where it starts:
- On the live workout, an exercise's ⋯ → **Bar path from video** (next to
  Measure). Results attach to that exercise's next set, like Measure.
- **Tools → Bar path** for any clip, outside a session; results can be saved
  to a past set from there, or just viewed.

Steps:
1. **Pick** a video (`<input type=file accept=video/*>`).
2. **Trim**: start and end handles over a scrubbable preview. Slew found this
   matters: walk-out and re-rack move the bar enough to count as reps.
3. **Find the plate**: `searchPlateInClip` over the trimmed range (10 frames);
   the best candidate is circled. **That's it** / **Show another** /
   **Tap the plate** (tap seeds a search near the tap).
4. **Plate size**: 450 mm by default (every 20 / 25 kg steel and competition
   bumper, and most 10 kg+ bumpers). A picker for 400 / 350 / other mm for
   smaller plates, remembered per place (D6).
5. **Track**: seek through the trim at 30 steps a second, `PlateTracker` with
   the confirmed radius. Progress bar; runs whether or not the page is in
   front (seeking, not playing). Frames where the plate isn't found are gaps,
   filled by `fillGaps` if short (≤ 0.2 s), otherwise the rep is flagged.
6. **Analyse**: plate centre y → metres via the plate scale → `Slew.analyse`
   → reps with mean / peak concentric velocity, ROM, durations, velocity
   loss, estimated RIR (same engine and RIR rules as Measure).
7. **Result sheet** (§6). **Attach to set** / **Done**.

## 6. Results

- **The path**, drawn over a still from the bottom of the first rep: one
  colour per rep, top marked, the lowest point of each rep dotted. A vertical
  reference line through the start. Scrub to any frame with the path so far.
- Per rep: mean and peak concentric velocity (m/s), ROM (cm), concentric time,
  and **horizontal drift** (cm, the path's widest sideways travel — the
  number lifters ask for: a deadlift drifting forward, a bench J-curve).
- Set: best and mean velocity, velocity loss %, estimated RIR — all marked
  "estimate · from video".
- **Confidence**: share of frames with the plate found, radius steadiness
  (a rigid plate shouldn't change size: spread over 15 % lowers confidence),
  gap count. Low confidence says why ("plate hidden for 0.6 s at rep 3").
- Debug mode (E11): **how?** shows the scale (plate px → m), frames found,
  gaps filled, and the velocity sum for a rep.
- **Save with bar path** (optional): renders the trimmed clip with the path
  drawn on, through the same canvas + MediaRecorder route as the daily clip
  (03), for sharing. Real time.

## 7. Stored on the set

`s.vbt` exactly as Measure stores it (`packVbt` shape: scalars, never
samples), with `mode: 'video'`, `place: 'video'`, `rate` = analysis rate,
plus a small `path` field: per rep, up to ~40 `[x, y]` points in cm relative
to the start, rounded to 0.1 cm (≈ 1–2 kB a set). **The video itself is not
kept** — the user still has it in their gallery. The set's history view draws
the stored path.

## 8. Video velocity next to sensor velocity

Following Slew's rule: **comparable, not interchangeable.** A set measured by
video shows "from video"; the sensor's shows "from sensor".
- Video sets **don't feed** D1's personal MVT calibration, the load-velocity
  profile or readiness until validated (§12), because the two sources have
  different errors (perspective and frame rate here; drift and placement
  there).
- They do show in the VBT panel, history, and the per-rep chart.

## 9. Squat depth (04b, later)

Rule judged: the hip crease lower than the top of the knee at the bottom
(IPF / most federations, side view).
- Needs the pose model. **Optional download** when the lifter turns on depth
  judging (Settings → Video): MediaPipe lite pose (~16 MB with WASM),
  stored by the service worker in its own cache, never in the app shell.
  Bundled from Slew's `poseEngine.ts`.
- At each rep's lowest bar point (from 04a), compare hip and knee landmarks
  in the side view. Pose gives joint centres, not the crease and the top of
  the knee, so the call is **deep / high / too close to call**, with a band
  of ± ~3 cm around parallel as "too close to call". Labelled a guide, never a
  white light.
- Also unlocks Slew's body-height calibration (`calibrateFromSpans`) for
  bar paths **without a visible plate** (a body-point proxy, marked lower
  confidence) — e.g. a safety-bar squat with the plate hidden.

## 10. Recording in the app (04c, later)

`getUserMedia` at the highest frame rate the phone offers, with a framing
guide (a level line and a plate-height marker), saving the raw clip to the
gallery as well. Browsers on Android often cap or vary the frame rate, which
is why gallery-first.

## 11. Decisions for Aaron (before building)

**Answered 2026-11-08: yes to all five as recommended** — plate-only first;
depth later as an optional download; video stays out of calibration, profile
and readiness; the video isn't kept (path and numbers only, optional share
render); entry points are the exercise card and Tools → Bar path.

1. **Plate-only first build.** No plate in view → no result (it says so and
   points at the filming guide). OK, or do you want the pose download from
   day one so body-tracking works without a plate?
2. **Depth judging needs a ~16 MB optional download** (04b). Worth it, or
   drop depth?
3. **Video velocities stay out of calibration, profile and readiness** until
   validated (§8). Agree?
4. **Don't keep the video**, just the path and numbers on the set; an
   optional "Save with bar path" video to share. Agree?
5. **Entry points**: the exercise ⋯ menu on a live workout, plus Tools → Bar
   path. Anywhere else (e.g. a past set in history)?

## 12. Validation

Before video numbers are presented as more than a guide: film sets that are
also measured by a linear transducer (or the phone-on-bar sensor and, ideally,
a transducer). Record the mean-velocity bias and limits of agreement in
`r&d/notes/vbt-validation.md` under a "Video" heading, and test the cosine
error claim by filming one set from 0°, 15° and 30°.

## 13. Effort

04a: bundling plus the plate-only driver, trim and confirm UI, result sheet,
stored path and history drawing — about the size of D1's Measure flow.
04b and 04c are each smaller once 04a exists.
