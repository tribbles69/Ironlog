# Security and privacy check — 13 Nov 2026 (0.99.1 → 0.99.2)

Question: is a user's data safe, including when they host Ironlog themselves?

## What was checked, and held

- **Script injection.** Every user-typed string in a migrated log (266 fields:
  session names and notes, exercise notes, goals, events, custom movements,
  places, programs, coach notes, alias keys) was replaced with
  `P<n>"'><img src=x onerror=__x(n)>`. Smoke 56/56, then every session (edit,
  share, missed), goal, event, event day, movement page, places, tools,
  coach, profile, settings, import-removal and exercise-check screen opened.
  0 executed; 48 seen as text. A control payload inserted directly did run
  (pre-CSP), so the detector works. Same rendering path covers JSON import,
  Drive merge and plan import. Coach / AI replies are set with textContent.
- **Network.** Only: the app's own files, `pose/` (self-hosted MediaPipe),
  api.anthropic.com (user's key), www.googleapis.com + accounts.google.com
  (Drive, only after the user connects). No analytics, fonts or CDNs.
- **Drive.** `drive.file` scope (only the files Ironlog creates); access token
  held in memory, revoked on disconnect; mass-delete guard on merge.
  A self-hoster's copy can't use Aaron's client ID — Google ties it to his
  origin — so they enter their own in Settings.
- **AI key.** Separate localStorage key; not in JSON/CSV export or the Drive
  summary file. Only in the Drive backup if "Include my AI key" is ticked.
- **Erase everything.** Clears the IndexedDB store (log, photos, clips, import
  undo copy), the log / VBT / usage localStorage keys, the sync link (and
  revokes the token), optionally the key. Says the Drive file is kept.
- **Repo.** No API keys, tokens or private keys in the current tree (history
  not scanned: shallow clone).

## Fixed in 0.99.2

- **CSP** (`index.html` meta). script-src self + the skin script's hash +
  GIS client + `'wasm-unsafe-eval'` (pose model); connect-src self,
  Anthropic, googleapis, GIS; frame-src GIS; style-src self + inline (style
  attributes everywhere) + GIS; img/media blob: data:; object-src none;
  form-action none. Even with a missed `esc()`, no script from elsewhere and
  no request to anywhere else. Inline `on*=` handlers are blocked, so the one
  (`onerror` on the welcome image) became `data-drop-broken` with a listener
  in main.js. `check-version.cjs` now fails if the inline script's hash
  drifts or an inline handler appears. `serve.mjs` adds `'unsafe-eval'`
  locally so the console eval loaders for smoke / baseline keep working.
  Google sign-in couldn't be exercised here (no network to Google from the
  sandbox): check Drive connect once on the phone after deploy.
- **AI key copy** and a warning on the Drive "include key" box; advice to set
  a spend limit on the Anthropic account (the in-app cap can't stop a leaked
  key).
- **"What gets sent to Anthropic"** in Settings → AI, per feature, from the
  actual `aiCall` payloads in coach.js / workout.js. Keep it in step when a
  feature's payload changes.
- **CSV formula guard**: string cells starting = + - @ tab CR (and not a plain
  number) get a leading `'`; the Ironlog CSV importer takes it off again, so
  the round trip is exact.

## Open (BUGS.md → Needs Aaron)

- B-026 shared github.io origin.
- B-027 personal data in the public repo.
