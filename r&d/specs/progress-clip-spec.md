# Daily one-second progress clip (roadmap 03)

Added 2026-11-08. One second of video a day, kept on the phone, joined into a
timelapse of the bulk and cut that can be played and saved. Replaces
1 Second Everyday on Aaron's phone. Extends E4's progress photos and shares
their rules: **on this device only, never in JSON export, CSV or Drive sync.**

## 1. What the browser can do (checked 2026-11-08, before this spec)

- **Capture:** `getUserMedia` (camera) and `MediaRecorder`, both in Chrome on
  Android. Picking a video from the gallery is a plain `<input type=file
  accept=video/*>`.
- **Joining on the phone:** draw each clip into one `<canvas>` in turn and
  record `canvas.captureStream()` with `MediaRecorder`. Tested in Chrome 152:
  three 1 s clips → one 3.1 s file in 3.1 s. It runs in **real time** — about
  a second per clip, so a year is ~6 minutes — and only while the page is
  visible (`requestAnimationFrame` stops in the background), so the screen is
  held on (`Awake`) and the sheet says to keep Ironlog open.
- **Format:** MP4 (H.264) where `MediaRecorder.isTypeSupported` says so
  (Chrome 126+, shareable to the gallery and social apps), else WebM. Feature-
  detected, never assumed. A browser with neither says so on the card.
- **Not used:** WebCodecs + a muxer would encode faster than real time but
  needs a muxing library (no libraries — single file). ffmpeg.wasm is ~30 MB.
  Revisit if long timelapses get annoying.

## 2. One frame for every clip

Every clip — camera or gallery — is **re-recorded through one canvas at
480 × 640 (3:4 portrait), 30 fps, ~1.5 Mbps**, cropped to fill (centred).
So every clip has the same size and the timelapse is just playback, with no
scaling decisions. A clip is ~150–300 KB; a year is roughly 60–110 MB of
IndexedDB, shown on the card.

## 3. Storage

Like photos: blobs in IndexedDB under `ironlog.clip.<id>`, an index under
`ironlog.clips` = `[{ id, date, type, kb, src: 'cam' | 'pick' }]`.
**One clip per day:** a new one for a day replaces the old (the toast says
"replaced"). Settings kept: `clipFacing` (front / back camera), `clipGhost`.

## 4. Health → Daily clip card

Under Progress photos. Shows whether today's is in, the count, the streak
(consecutive days ending today or yesterday), storage used, and the last 14
days as small day tiles (filled = has a clip, tap to play it, delete from
there). Buttons: **● Record today**, **From gallery**, **▶ Timelapse**.

## 5. Recording

A sheet with the live camera, cropped to exactly what will be recorded, front
camera mirrored on screen (the clip itself isn't).
- **Ghost (the pose reminder):** a 35 % still from the latest earlier clip over
  the camera, so the lifter lines up the same spot, distance and pose. On by
  default, toggle remembered. Hidden while recording.
- **Flip camera.** **Date** (defaults to today; can backfill a missed day).
- **Record:** 3-2-1 (`Cue.countIn`, big numbers), one second recorded, done
  chime. Then it loops the clip: **Keep it** or **Try again**.

## 6. From gallery

Pick a video; a slider picks the start second (preview updates); **Use this
second** plays that second into the canvas recorder. The date defaults to the
file's modified date (never after today). Then Keep / Try again as above.

## 7. Timelapse

Range: All / Last 30 days / Last 90 days / This year; "Date on it" toggle
(date stamped bottom-left). **Play** runs it in the sheet; **Save video**
records it while it plays (progress bar, Stop), then offers **Share** (Web
Share with a file, where supported) and **Save to phone** (download), named
`ironlog-clips-<first>-to-<last>.mp4`. Needs at least two clips.

## 8. Not in this version

- Reminder notifications (a PWA can't schedule one reliably without a server).
- Music on the timelapse, speed control, more than one clip a day.
- Clips in Drive sync — deliberately off, like photos.
