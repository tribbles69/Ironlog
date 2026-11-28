# AI on your own key (roadmap D8)

Written 2026-11-01 when Aaron said to start D8. The groundwork every AI
feature (D9 coaching, the cardio trend coach) sits on.

## What exists before this

- `aiKey()` / `setAiKey()` keep the key in this origin's `localStorage`
  (`ironlog.anthropicKey`), never in `S`. Drive sync includes it only if the
  user ticks that box (B6).
- One AI feature: **voice logging's fallback** (`claudeParse` → Haiku 4.5)
  when the on-device grammar can't read a spoken set.
- **No server-side AI function is left.** The food tab's server function went
  with A1 (0.25.0); the repo has no `netlify/`, `api/` or functions folder.
  Nothing to remove; checked 2026-11-01.

## Rules

1. **No Ironlog AI server, ever.** Calls go from the phone straight to
   `api.anthropic.com` with the user's key (`anthropic-dangerous-direct-browser-access`).
2. **Optional.** The app is complete without a key. Each AI feature says what
   it needs and is greyed out (or falls back to the local path) until a key is
   added.
3. **One way in.** Every call goes through `aiCall({ feature, system, user,
   maxTokens })`. It checks the key and the cap, makes the call, reads
   `usage.input_tokens` / `usage.output_tokens`, prices them and records them
   against the feature. No feature calls `fetch` itself.
4. **Monthly cap, enforced on the device.** Settings → AI → *Monthly cap ($)*,
   default **$1.00**; 0 means no AI calls at all. Once this month's estimated
   spend reaches the cap, `aiCall` refuses (error `capped`) and the feature
   takes its no-key path, saying why. The count resets on the 1st. It's an
   **estimate from the token counts**, per device — the Anthropic console is
   the bill.
5. **Cost hints.** Each feature lists roughly what one use costs, from a
   typical token count × the price table. The price table (`AI_MODELS`) is one
   place to update.

## Model

**Claude Haiku 5.5** (`claude-haiku-5-5`, $0.10 / $0.50 per million input /
output tokens up to 100K prompt). Short structured jobs, so thinking is
turned off (`thinking: {type: "disabled"}` — allowed on Haiku 5.5 at the
default effort) and every call is small. Replaces Haiku 4.5 for voice
logging ($1 / $5 — ten times the price).

## Settings → AI — on your own key

- The key (password field, *Show*), a line on where it's kept and that only
  Anthropic sees it, and *Check key*: a 1-token call that says "Key works" or
  the API's error (bad key, no credit, rate limit). It's counted like any call.
- *Monthly cap ($)*.
- *This month:* calls, tokens in / out, estimated cost against the cap, and
  *Reset count* (for when the cap was hit by a test).
- The list of AI features: name, what it does, cost hint, and status —
  *On*, *Needs a key*, or *Paused — cap reached*.

## Storage

- Usage: `localStorage['ironlog.aiUsage']` =
  `{ month: 'YYYY-MM', calls, inTok, outTok, usd, by: { feature: { calls, inTok, outTok, usd } } }`.
  Device-only, like the key — it isn't training data.
- Cap: `S.settings.aiCap` (synced, so every device has the same cap; each
  device counts its own spend).

## Out of scope

D9's coach, the cardio trend coach, prompt caching (no prompt here is long
enough to cache yet), streaming.


## Model per feature (0.79.0, Aaron 2026-11-05)

`AI_MODELS` lists Haiku 5.5 ($0.10 / $0.50), Sonnet 5.5 ($2 / $10) and
Opus 5.5 ($4 / $20) per million tokens in / out (Haiku's rate is for
prompts under 100K tokens; every Ironlog call is far under). Each feature's
model is `S.settings.aiModels[featureId]` (synced with settings), read through
`aiModelFor()`; unset means Haiku. Settings → AI shows a picker per feature,
and the cost hint and usage pricing use the chosen model. `aiCall` sends
that model and records usage against the model the API reports.
