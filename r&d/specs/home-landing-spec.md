# Home as the landing page (roadmap D14)

Written 2026-10-31. **Aaron's decision (2026-10-31): D14 is the in-app Home,
not a separate public site.** The app stays at the site root and installed
PWAs are untouched — no `start_url`, scope or service-worker change.

## What it does

The first thing someone sees on Home explains Ironlog before they've used it,
the job a landing page would do. It's an **About card at the top of Home**,
shown when either:

- the app is running in a browser tab, not installed
  (`display-mode: standalone` false), **or**
- there are no completed sessions yet,

and the user hasn't hidden it. An installed app with a log never shows it.

## The card

- **Title:** *Ironlog — a free strength log*.
- **Who it's for:** powerlifting, strongman, strengthlifting, and adaptive
  and para lifters.
- **The model, three lines:** free with no paid tier; your log stays on your
  phone and backs up to your own Google Drive; AI is optional and runs on
  your own Anthropic key.
- **Install:**
  - Chrome has offered an install (`beforeinstallprompt` captured) → an
    **Install Ironlog** button that opens Chrome's prompt.
  - Not installed and no prompt available → the steps: *Android Chrome: ⋮
    menu → Install app (or Add to Home screen). iPhone Safari: Share → Add to
    Home Screen.*
  - Installed → no install line.
- **Links:** What's new (changelog), Help & privacy (the FAQ), and the source
  on GitHub (`github.com/tribbles69/Ironlog`, public).
- **Hide** — stores `settings.aboutHidden`; *Show the About card on Home* in
  Help & FAQ brings it back (`aboutHidden` cleared).

## Rules

- Never during a live session (same as the backup card).
- No tracking, no network calls of its own.
- C4: real buttons and links with names; axe-clean in both skins.
- Screenshots (from the roadmap's public-page idea) aren't needed inside the
  app itself.
