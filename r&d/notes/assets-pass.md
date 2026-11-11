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

Built in `ivAnnounce`. 25 clips cover every built-in preset and any custom
timer with up to 12 rounds and a rest of 10, 15, 20, 30 or 45 seconds, 1
minute, 1 minute 30, 2 or 3 minutes:

- "Go. Round one" … "Go. Round twelve" (12). The first plan added "of two" …
  "of twelve" as second halves; section 2 says why those were dropped.
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

### A1 — the goblin-to-orc muscle-map skin (0.95.1)

- **What it is:** a second skin, **Goblin to orc**, beside the template
  (Stats → Muscles → Skin ▾). A muscle nobody has trained is pale goblin; as
  its score climbs through the tiers it turns greener and more muscled, up
  to a scarred orc at Elite. Because each muscle has its own tier, a strong
  chest on weak legs is an orc's chest on a goblin's legs.
- **How it was made:** twelve figures from Higgsfield (`flux_3_image`, 1:2,
  1k) — front and back at each of the six tiers — each generated against
  the template's own body outline as a reference image, so they share a
  pose. `r&d/tools/build-skin.cjs` then removes each background, fits the
  figure to the template silhouette (height, and width at upper-arm
  level), and cuts every cell of the sheet from it: column 1 is the whole
  figure, the others are the same figure seen through the template's muscle
  shapes. So the muscle shapes and the tap areas are exactly the
  template's.
- **Credits:** 13 images at 2 credits = **26** (two tests, eleven more; one
  test was kept as a tier, one was re-done with matching shorts). Balance
  after: about 53 of 79.75.
- **Files:** `skins/goblin.webp` (2640 × 5760, 325 KB). Not precached: it's
  fetched the first time it's picked, then kept. The twelve source figures
  are in `r&d/skins/goblin-src/`; the prompts are below.
- **The template is still the default.** Making the goblin the default
  changes everyone's muscle map without asking. **Aaron's call.**
- **Known rough edges:**
  - Where two neighbouring muscles are at different tiers the join is a
    hard edge between two pictures. That's the idea, but it is a cut-out,
    not painted art.
  - The figures wear shorts, so quads and glutes show cloth in the upper
    part of their shape. All tiers use the same dark brown so it doesn't
    flicker between tiers (tier 1's are a lighter brown).
  - In **Recovery** mode the map reuses the tier rows as "how tired", so a
    worked muscle shows as orc and a fresh one as goblin. It reads as
    darker = more worked, but the meaning is different from Strength mode.
  - The tier-0 and tier-1 front figures were swapped after generation: the
    one asked for as "scrawny" came out more defined than the "just started
    training" one.
- **Not checked:** on a phone, and with real scores rather than made-up
  ones.

**Prompts** (each with the template's base-cell silhouette, front or back,
as the reference image). Shared frame:

> Repaint the dark body silhouette in the reference image as a character,
> keeping EXACTLY the same pose, outline, proportions, size and position in
> the frame: standing upright facing the viewer [*or:* SEEN FROM BEHIND, back
> of the head, no face visible], arms hanging at the sides slightly away
> from the body, legs straight and slightly apart, full body from head to
> feet. The character is **[tier line]**, plain dark brown cloth shorts,
> bare feet. Original character design. Flat stylised 2D game art, bold
> clean shapes, simple cel shading, thick dark outline, clearly separated
> muscle groups. Plain pure white background, no shadow on the ground, no
> props, no text.

| Tier | Tier line |
|---|---|
| 0 Not ranked | a small scrawny goblin: pale yellow-green skin, thin limbs, soft undefined muscles, big pointed ears |
| 1 Beginner | a slim goblin who has just started training: light yellow-green skin, thin limbs with the first faint muscle lines |
| 2 Novice | a lean, athletic goblin: fresh green skin, wiry visible muscles |
| 3 Intermediate | a strong hobgoblin, halfway between goblin and orc: mid green skin, solid well-defined muscles, small lower tusks just showing |
| 4 Advanced | a powerful orc: rich dark green skin, big heavily defined muscles, tusks |
| 5 Elite | a huge battle-hardened orc champion: very deep green skin, massive heavily defined muscles with strong highlights, large tusks, old scars |

### A3 — welcome screen (0.95.1)

The six front figures side by side, goblin to orc, at the top of the first
welcome step with one line: "Start a goblin. Train your way to an orc."
Cut from the skin sheet (`skins/goblin-strip.webp`, 69 KB, precached), so it
cost no credits. It's decorative: empty alt text, and it removes itself if
it fails to load.

### Licence

Higgsfield on the paid Basic plan: commercial use allowed, no attribution
(Aaron, roadmap 00-D2). The figures are original designs from a generic
description — "goblin" and "orc" as folklore types, no named character,
game or artist in any prompt. The voice is a stock ElevenLabs voice.

## 3. Left

| # | What | Why it was left |
|---|---|---|
| A2 | PR share card background | The card draws white and orange text straight onto a flat dark canvas. A picture behind it needs the text contrast re-checked on every card layout, and the card is what people post — worth doing with Aaron looking at it. About 53 Higgsfield credits remain. |
| A4 | Home / About card art | The About card is already the longest thing on a new user's Home. The welcome sheet has the picture instead. |
| S2 | Cardio voice | Needs numbers spoken ("speed down to 7.9"). Options: record 0–20 in tenths and stitch (about 250 clips, and it will sound stitched), or generate speech at run time on the lifter's own ElevenLabs key — a new opt-in, like the AI key. |
| S3 | Mobility voice | Needs exercise names, positions, sides and set counts combined. Recording the 33 exercise names is cheap (about 700 credits); the rest needs the same answer as S2. |
| — | Goblin as the default skin | A choice about everyone's muscle map. |
| — | A level line and plate marker for in-app recording (00-V3) | Drawn guides, not generated art. |

## 4. Spend

| Tool | Used | Left |
|---|---|---|
| Higgsfield (Basic) | 26 credits | about 53 |
| ElevenLabs (Starter, 30,000 a month) | 777 credits, plus one free transcription used as a check | about 29,200 this month |

### A1 — the goblin-to-orc muscle-map skin (0.95.1)

- **What it is:** a second skin, **Goblin to orc**, beside the template
  (Stats → Muscles → Skin ▾). A muscle nobody has trained is pale goblin; as
  its score climbs through the tiers it turns greener and more muscled, up
  to a scarred orc at Elite. Because each muscle has its own tier, a strong
  chest on weak legs is an orc's chest on a goblin's legs.
- **How it was made:** twelve figures from Higgsfield (`flux_3_image`, 1:2,
  1k) — front and back at each of the six tiers — each generated against
  the template's own body outline as a reference image, so they share a
  pose. `r&d/tools/build-skin.cjs` then removes each background, fits the
  figure to the template silhouette (height, and width at upper-arm
  level), and cuts every cell of the sheet from it: column 1 is the whole
  figure, the others are the same figure seen through the template's muscle
  shapes. So the muscle shapes and the tap areas are exactly the
  template's.
- **Credits:** 13 images at 2 credits = **26** (two tests, eleven more; one
  test was kept as a tier, the other was re-done with matching shorts).
  Balance after: about 53 of 79.75.
- **Files:** `skins/goblin.webp` (2640 × 5760, 325 KB). Not precached: it's
  fetched the first time it's picked, then kept. The twelve source figures
  are in `r&d/skins/goblin-src/`; the prompts are below.
- **The template is still the default.** Making the goblin the default
  changes everyone's muscle map without asking. **Aaron's call.**
- **Known rough edges:**
  - Where two neighbouring muscles are at different tiers the join is a
    hard edge between two pictures. That's the idea, but it is a cut-out,
    not painted art.
  - The figures wear shorts, so quads and glutes show cloth in the upper
    part of their shape. The tiers use the same dark brown so it doesn't
    change colour between tiers (one tier's are a lighter brown).
  - In **Recovery** mode the map reuses the tier rows as "how tired", so a
    worked muscle shows as orc and a fresh one as goblin. It reads as
    darker = more worked, but the meaning differs from Strength mode.
  - The tier-0 and tier-1 front figures were swapped after generation: the
    one asked for as "scrawny" came out more defined than the "just started
    training" one.
- **Not checked:** on a phone, and with real scores rather than made-up
  ones.

**Prompts** (each with the template's base-cell silhouette, front or back,
as the reference image). Shared frame:

> Repaint the dark body silhouette in the reference image as a character,
> keeping EXACTLY the same pose, outline, proportions, size and position in
> the frame: standing upright facing the viewer [*or:* SEEN FROM BEHIND, back
> of the head, no face visible], arms hanging at the sides slightly away
> from the body, legs straight and slightly apart, full body from head to
> feet. The character is **[tier line]**, plain dark brown cloth shorts,
> bare feet. Original character design. Flat stylised 2D game art, bold
> clean shapes, simple cel shading, thick dark outline, clearly separated
> muscle groups. Plain pure white background, no shadow on the ground, no
> props, no text.

| Tier | Tier line |
|---|---|
| 0 Not ranked | a small scrawny goblin: pale yellow-green skin, thin limbs, soft undefined muscles, big pointed ears |
| 1 Beginner | a slim goblin who has just started training: light yellow-green skin, thin limbs with the first faint muscle lines |
| 2 Novice | a lean, athletic goblin: fresh green skin, wiry visible muscles |
| 3 Intermediate | a strong hobgoblin, halfway between goblin and orc: mid green skin, solid well-defined muscles, small lower tusks just showing |
| 4 Advanced | a powerful orc: rich dark green skin, big heavily defined muscles, tusks |
| 5 Elite | a huge battle-hardened orc champion: very deep green skin, massive heavily defined muscles with strong highlights, large tusks, old scars |

### A3 — welcome screen (0.95.1)

The six front figures side by side, goblin to orc, at the top of the first
welcome step with one line: "Start a goblin. Train your way to an orc."
Cut from the skin sheet (`skins/goblin-strip.webp`, 69 KB, precached), so it
cost no credits. It's decorative: empty alt text, and it removes itself if
it fails to load.

### Licence

Higgsfield on the paid Basic plan: commercial use allowed, no attribution
(Aaron, roadmap 00-D2). The figures are original designs from a generic
description — "goblin" and "orc" as folklore types, with no named
character, game or artist in any prompt. The voice is a stock ElevenLabs
voice.

## 3. Left

| # | What | Why it was left |
|---|---|---|
| A2 | PR share card background | The card draws white and orange text straight onto a flat dark canvas. A picture behind it needs the text contrast re-checked on every card layout, and the card is what people post — worth doing with Aaron looking at it. About 53 Higgsfield credits remain. |
| A4 | Home / About card art | The About card is already the longest thing on a new user's Home. The welcome sheet has the picture instead. |
| S2 | Cardio voice | Needs numbers spoken ("speed down to 7.9"). Options: record the numbers and stitch them (about 250 clips, and it will sound stitched), or generate speech at run time on the lifter's own ElevenLabs key — a new opt-in, like the AI key. |
| S3 | Mobility voice | Needs exercise names, positions, sides and set counts combined. Recording the 33 exercise names is cheap (about 700 credits); the rest needs the same answer as S2. |
| — | Goblin as the default skin | A choice about everyone's muscle map. |
| — | A level line and plate marker for in-app recording (00-V3) | Drawn guides, not generated art. |

## 4. Spend

| Tool | Used | Left |
|---|---|---|
| Higgsfield (Basic) | 26 credits | about 53 |
| ElevenLabs (Starter, 30,000 a month) | 777 credits, plus one free transcription used as a check | about 29,200 this month |
