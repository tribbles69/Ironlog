# Art and audio pass (roadmap 00-D2)

The list comes first, as the roadmap asks: every placeholder or weak asset,
what it should become, and which tool makes it. Then what was actually
generated, what it cost, and what was left.

Connectors (checked 11 Nov 2026): **Higgsfield** — connected, Basic plan,
79.75 credits at the start. **ElevenLabs** — connected, voices list. ffmpeg
is installed on this machine and does the cutting and compressing.

## 1. The list

### Art

| # | Asset | Now | Should become | Tool | Decision |
|---|---|---|---|---|---|
| A1 | Muscle-map skin (`skins/template.png`) | Placeholder: one orange, darker each tier | A goblin that turns into an orc muscle by muscle — a second skin beside the template, same 11 × 12 sheet | Higgsfield (figures) + ffmpeg (cut to the sheet's own muscle shapes) | **Do first** |
| A2 | PR share card background (E2) | Flat dark canvas with drawn text | A textured background behind the numbers | Higgsfield | Do if credits allow |
| A3 | Welcome screen (C1) | Text only | One illustration at the top | Higgsfield | Do if credits allow |
| A4 | In-app Home / About card (D14) | Text only | Small banner | Higgsfield | Lowest; the About card is already long |
| A5 | App icons (`icon-*.png`) | Drawn barbell mark | — | — | **Leave.** It's a logo, not a placeholder; changing it changes the installed app's face |
| A6 | Exercise demo figures (E14) | Drawn stick figures from data | — | — | **Leave.** They're data-driven and animated; generated art can't replace them |
| A7 | Equipment icons, nav icons | Inline SVG | — | — | **Leave.** Consistent and tiny |

### Audio

| # | Asset | Now | Should become | Tool | Decision |
|---|---|---|---|---|---|
| S1 | Interval timer voice (02) | The phone's speech voice | Recorded cues | ElevenLabs | **Do.** Every phrase is from a short fixed list |
| S2 | HR-zone cardio voice (D15) | The phone's speech voice | Recorded cues | ElevenLabs | **Not possible as recordings** — see below |
| S3 | Mobility hold voice (E5) | The phone's speech voice | Recorded cues | ElevenLabs | **Not possible as recordings** — see below |
| S4 | `Cue` beeps (rest timer, holds, count-in) | Web Audio tones | Cleaner beeps "if they're worth it" | ElevenLabs sound | **Leave.** Generated tones need a file and a decode; the built-in ones are instant, work offline from the first launch and are already distinct (pitch and length differ per cue) |

**Why S2 and S3 can't be recordings.** A recording has to exist for the
exact words. Cardio says things like "Heart rate climbing. Speed down to
7.9" — the number is worked out on the spot. Mobility says "Pigeon Pose,
modified. Floor · Left side · set 2 of 3" — built from the exercise, the
position, the side and the set. Recording the fixed halves and letting the
phone's voice say the rest would switch voices mid-sentence, which is worse
than one plain voice throughout. So the rule used here is: **a session is
either all recorded or all the phone's voice.** Intervals can be all
recorded; the other two can't without a way to speak numbers, and that
means either several hundred number clips or text-to-speech at run time on
the lifter's own key. Listed for Aaron under "Left".

### S1 — the interval phrases

Built in `ivAnnounce`. 36 clips cover every built-in preset and any custom
timer with up to 12 rounds and a rest of 10, 15, 20, 30 or 45 seconds, 1
minute, 1 minute 30, 2 or 3 minutes:

- "Go. Round one" … "Go. Round twelve" (12), followed by "of two" … "of
  twelve" (11) — the two halves are played back to back.
- "Last round. Go." (1)
- "Rest. 10 seconds" and the eight other rests (9)
- "Warm-up." · "Cool-down." · "Intervals done. Finish when you're ready." (3)

A timer outside that (13+ rounds, an odd rest) uses the phone's voice for
the whole session.

## 2. What was made

### S1 — interval timer voice (0.95.0)

- **Voice:** ElevenLabs "Alice — Clear, Engaging Educator", one of the
  stock (premade) voices: British, clear, unhurried. Not a cloned or
  community voice and not modelled on a named person.
- **Model:** `eleven_multilingual_v2`. Three generations, 777 credits of the
  30,000 a month: rounds (315), rests and the start/finish lines (404), and
  a re-take of warm-up and cool-down (58).
- **Why a re-take:** as single words, "Warm-up." and "Cool-down." came out
  clipped to a fifth of a second. Re-recorded as "Warm-up. Nice and easy."
  and "Cool-down. Ease it off."
- **"of 8" was dropped from the recording.** The phone's voice says "Go.
  Round 3 of 8". Recorded, that needs either 78 separate clips or two
  halves stuck together, which sounds stuck together. The recording says
  "Go. Round three." The total is on the screen, and "Last round. Go!"
  still marks the end.
- **Files:** `audio/intervals.mp3` — one mono MP3, 24 kHz, 40 kbit/s,
  171 KB, 25 cues back to back; cached by `sw.js` so it works offline. The
  three raw takes are in `r&d/data/voice/`. `r&d/tools/build-voice.cjs`
  rebuilds the file from them and prints the `IV_VOICE` table for
  `index.html`.
- **In the app:** fetched when the interval sheet opens. A session uses the
  recording for every cue if all its cues exist (every built-in preset
  does), otherwise the phone's voice for every cue. The Voice on/off switch
  on the timer governs both. If the file is missing or won't decode, the
  phone's voice speaks, as before.
- **Checked:** every preset is covered; a 25-second rest or 14 rounds
  correctly falls back; each of the 25 slices has sound in it and silence
  after it; a Tabata run plays 17 cues with the phone's voice used for none.
  ElevenLabs' own word timings confirm the phrases are in the order cut.
- **Not checked: nobody has listened to them.** That's A4 item 25.
- **Licence:** generated on the Starter plan, which carries the commercial
  licence (Aaron, roadmap 00-D2); ElevenLabs' terms let output made while
  subscribed be used after the plan ends.
