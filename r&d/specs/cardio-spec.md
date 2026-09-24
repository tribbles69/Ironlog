# Ironlog — Cardio session: HR-zone treadmill coaching

Roadmap item 3. Written against 0.18.0. Line numbers drift — grep.

---

## The problem

The gym treadmill (Technogym) has no control API. Ironlog can read heart rate
live but can't touch the belt, so **Aaron is the actuator**: the app watches HR
against a target zone and tells him when to change speed (or incline), and he
confirms each change so the app knows the real speed.

Today cardio is a `treadmill` entry with one timed set — duration only, no HR,
no speed, no distance.

---

## Decisions

**A cardio session is a normal workout, not a new store.** It is `S.active`
while live and a completed workout afterwards, carrying `kind: 'cardio'` and a
`cardio` object. It also carries one ordinary `treadmill` entry with one timed
set (`sec` = moving time), so the calendar, streaks, history, the share card,
export/import and the edit modal all keep working without a second path.
Nothing downstream needs to know about `cardio` unless it wants the extra
detail.

**The control loop is plain JS, no AI.** One pure function
(`cardioDecide`) takes the config and the live state and returns a cue or
nothing. The UI only delivers what it returns. Everything testable lives there.

**Timestamps, never tick counts.** Elapsed time, distance and time-in-zone are
advanced from `Date.now()` differences, so a throttled tick loses nothing.

**Speed and incline are what Aaron confirms, never what the app assumed.** A
cue sets a *pending* target; the recorded speed only changes when he taps
**Done** (or uses the +/− buttons). An ignored cue changes nothing and is
repeated at the next check.

**Local only.** HR comes over Web Bluetooth straight to the phone; nothing is
sent anywhere.

---

## Heart rate in

- Web Bluetooth, standard Heart Rate Service `heart_rate` (`0x180D`),
  measurement characteristic `heart_rate_measurement` (`0x2A37`). Flags bit 0
  picks uint8 vs uint16 for the value. A value of 0 (no skin contact) is
  ignored.
- Works in Chrome on Android (and desktop Chrome) over HTTPS, with chest straps
  and watches that broadcast HR. Not Safari/iOS, not Apple Watch. Where
  `navigator.bluetooth` is missing, the session says so and runs manual.
- Pairing is started by a tap (**Connect HR**) — `requestDevice` needs a user
  gesture.
- **Disconnects:** the HR tile shows *Lost*; cues stop by themselves because
  there is no fresh HR (samples older than 10 s don't count). The app retries
  `gatt.connect()` on the same device three times (2 s, 4 s, 8 s) and offers a
  **Reconnect** button throughout. A reload mid-session keeps the session but
  not the Bluetooth link — reconnect with one tap.
- **No HR device:** the session is a manual cardio log — clock, speed and
  incline buttons, distance. No cues.

Smoothing: raw samples are kept in memory for 60 s. The control loop uses the
**20 s mean** (`hr20`); the ceiling check uses the **5 s mean** (`hr5`) so one
spiky reading can't trigger it but a real surge is caught fast.

---

## Setup

A modal from the Workout page (**Start cardio session**). Remembered in
`settings.cardio` for next time:

| field | default | notes |
|---|---|---|
| speed | 5.0 km/h | starting speed |
| incline | 1.0 % | starting incline |
| cue | `speed` | what the cues change: `speed` or `incline` |
| zone preset | `z2` | `z2` easy / fat loss 60–70 %, `z3` aerobic 70–80 %, `z4` threshold 80–90 %, or `custom` |
| maxHr | blank | measured max. Blank → Tanaka estimate (208 − 0.7 × age) from the profile's date of birth, labelled as an estimate |
| restHr | blank | if set, presets use heart-rate reserve (Karvonen): rest + pct × (max − rest); otherwise pct × max |
| lo / hi | from preset | editable; editing either switches the preset to custom |
| ceiling | 92 % of max, else hi + 20 | hard cap |
| interval | 30 s | how often the zone is checked |
| voice | on | spoken cues (SpeechSynthesis) |

Settle period (150 s), hysteresis (3 bpm) and response wait (45 s) are
constants in code, not settings — nobody should need to tune them mid-gym.

---

## Control loop — `cardioDecide(cfg, st)`

Called once a second. `st.el` is moving time in seconds (pauses excluded).

1. **Ceiling first.** If `hr5 > ceiling` and the last ceiling cue was ≥ 15 s
   ago: cue *"Heart rate high — slow down to X"*, X = speed − 0.5 (floor
   1.0 km/h). Always speed, whatever `cue` says, and ignores settle, interval
   and response wait.
2. **Settle.** No other cues for the first 150 s.
3. **Interval.** Only check every `interval` seconds.
4. **Response wait.** No cue within 45 s of the last confirmed change — HR
   takes that long to answer a new speed.
5. **Fresh HR** required (`hr20` from samples in the last 20 s, newest ≤ 10 s
   old). None → silent.
6. **Hysteresis.** Below `lo − 3` → cue up; above `hi + 3` → cue down; else
   silent. Inside the zone is always silent.
7. **Step scales with the miss**, measured from the zone edge (not the
   hysteresis edge):
   - speed: `0.05 km/h per bpm`, rounded to 0.1, clamped 0.1–0.5
   - incline: `0.2 % per bpm`, rounded to 0.5, clamped 0.5–2.0
   - bounds: speed 1.0–20.0 km/h, incline 0–15 %. At a bound → silent.
8. The cue says the actual target: *"Set speed to 5.6"*.

Every check (cue or not) moves `lastCheck`. A confirmed change moves
`lastChange`. An unconfirmed cue stays pending and is simply re-issued at the
next check with a fresh target.

---

## Cues

- Web Audio beep through `Cue` (respects the Sound setting): two rising tones
  for up, two falling for down, three fast for the ceiling. Vibration via
  `Cue.buzz` (respects Vibration).
- Voice: `speechSynthesis`, cancelled before each new line so cues never queue
  up behind each other. Own toggle in setup.
- On screen: a big banner with the target and a **Done** button.
- Big **−/+** buttons for speed (0.1 km/h) and incline (0.5 %). Any manual
  change counts as a confirmed change and clears the pending cue. Taps within
  5 s of each other merge into one logged change.
- **Wake Lock** for the whole session (`Awake.hold('cardio')`).
- **Pause** stops the clock, distance and cues (treadmill stopped); HR keeps
  showing.

---

## Saved to the session

```js
{
  kind: 'cardio', ...workout fields,
  exercises: [{ leaf: treadmill, sets: [{ w: 0, r: null, sec: movingSec, done: true, setType: 'working' }] }],
  cardio: {
    cfg: { lo, hi, ceiling, cue, interval, maxHr, restHr, preset },
    startSpeed, startIncline,
    hr: [[t, bpm], ...],          // t = moving seconds; one sample per 5 s
    changes: [{ t, speed, incline, cued }],
    summary: { sec, distKm, avgHr, maxHr, inZoneSec, hrSec },
  }
}
```

- `hr` sampled every 5 s keeps an hour to ~720 points.
- Distance = ∫ speed dt over moving time, accumulated per tick.
- Time in zone counts only seconds with fresh HR inside `[lo, hi]` (no
  hysteresis); `hrSec` is seconds with fresh HR at all, so the percentage is
  honest when the strap dropped out.

**Display:** the completed-session card shows distance, average HR and % in
zone, and an HR trace with the zone shaded. The session view adds the full
chart, max HR and the list of speed/incline changes.

---

## Not in this change

- The premium Haiku trend coach (roadmap "Later") — only once this loop is
  proven in the gym.
- Other machines. Bike/rower/elliptical have no speed to cue; the session is
  treadmill-only for now.
- HR on lifting sessions.

## Verification

- `cardioDecide` table-tested in the page: settle, interval, hysteresis edges,
  step scaling and clamps, bounds, ceiling bypassing everything, response wait.
- A simulated HR feed (`HR.feed(bpm)`) drives a whole session headless:
  cues, Done, +/−, pause, disconnect/stale HR, finish, card and chart render.
- On a real phone: pairing a strap, cue audio + voice with the screen on,
  disconnect/reconnect.
