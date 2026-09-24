# Ironlog

Powerlifting / strength training log. An installable web app (PWA) — the repo
root *is* the app; everything else lives in `r&d/`.

```
index.html              the app (single file)
sw.js                   offline cache + update handling
manifest.webmanifest    name, icon, "open full screen"
version.json            how a running app notices a new build
program.json            bundled training program
slew-core.js            VBT velocity engine (generated — see r&d/tools)
icon-*.png              app icons
r&d/                    roadmap, specs, notes, data sources, build tools — not used by the app
CLAUDE.md               entry point for coding agents
```

What's being built next: **`r&d/ROADMAP.md`**.

# Install on Android

The app files above must sit in the **same folder** on the host, and the host
must serve over **https** (service workers refuse to run otherwise).

## Putting it online (from the phone is fine)

**GitHub Pages** — best if you want to keep changing it.

1. github.com → new repository → name it `ironlog`, set it **Public**, create.
2. Add file → Upload files → select all the app files above → Commit.
3. Settings → Pages → Source: *Deploy from a branch*, Branch: `main`, folder `/ (root)` → Save.
4. Wait a minute or two. Your URL is `https://<username>.github.io/ironlog/`.

**Netlify Drop** — fastest if you just want it live now: app.netlify.com/drop,
upload the zip, done. Updating means re-uploading.

## Installing it

Open the URL in Chrome → ⋮ menu → **Install app** (or *Add to Home screen*).
You'll get an icon, no browser bars, and it opens with no signal.

Once installed, Android grants persistent storage, so the log won't be cleared
when the phone is low on space.

## Updating it

Replace `index.html` (and whatever else changed) on the host, and bump
`VERSION` at the top of `sw.js` — that string is what tells the installed app
something is new. On the next launch it downloads the update in the background
and swaps it in, showing "Update ready — restarting". Mid-workout it waits until
you next open the app, so a live session never gets pulled out from under you.

## Your data

The log is stored in IndexedDB on the device — it is not sent anywhere and there
is no account. Two consequences:

- Uninstalling the app, or clearing site data for the domain, wipes it.
- It doesn't sync to another device.

Settings (⚙) → **Export** writes a `.json` backup you can keep in Drive; Import
restores it. Worth doing after a meet, or any time you'd be annoyed to lose it.

---

# Food logging (removed)

Food logging left Ironlog in 0.25.0 for its own app. The Food tab, the CoFID
and curated food tables, `parse-food.js` (the Netlify food function) and
`r&d/tools/build-foods.cjs` are out of the app. The function, the tables and
the build tool are kept for the food app in `r&d/food-handover/`.

A food log logged before then isn't lost: it stays on the device, unshown,
until it's saved from Settings → Data → **Save old food log** (JSON for the
food app, or CSV) and removed from Settings → **Clear data**.

The optional Anthropic API key in Settings is now only used by voice set
logging, as a fallback when the built-in grammar can't read what was said.
It's held on the device and sent nowhere but Anthropic.

---

# Exercise database

`EX_DB` in index.html holds 736 movements from free-exercise-db (public
domain), remapped onto Ironlog's 15 muscle keys.

    "Barbell Deadlift": {
      "eq":   "Barbell",          equipment
      "m":    {"erectors":0.7,…}, muscle shares, summing to 1
      "cat":  "strength",
      "mech": "compound"
    }

Three layers, in order of trust:

1. `EX_MUSCLE` — 53 lifts, hand-tuned shares. Always wins.
2. `EX_EQ`     — equipment for those 53, because the source names them
                 differently ("Barbell Squat" vs "Back Squat").
3. `EX_DB`     — the other 724. Equipment is reliable; muscle shares are
                 derived from primary/secondary lists (70/30) and are a
                 placeholder worth correcting on anything you train often.

`exInfo(name)` merges the three. `tuned: true` means the shares are
hand-set rather than derived.

The picker still *browses* the curated LIB so the list stays short;
typing a query searches all 736. Picking one adds it to `customEx` so it
persists. The body heatmap now scores any of them, not just the 53.

Regenerate with build-exercise-db.py if the upstream source updates.
