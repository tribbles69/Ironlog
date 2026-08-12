# Ironlog — install on Android

Five files. They must all sit in the **same folder** on the host, and the host
must serve over **https** (service workers refuse to run otherwise).

```
index.html                 the app
sw.js                      offline cache + update handling
manifest.webmanifest       name, icon, "open full screen"
icon-192.png
icon-512.png
icon-maskable-512.png      the round/squircle version Android uses
```

## Putting it online (from the phone is fine)

**GitHub Pages** — best if you want to keep changing it.

1. github.com → new repository → name it `ironlog`, set it **Public**, create.
2. Add file → Upload files → select all six files above → Commit.
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

# Food tab — setup

The nutrition tab works offline for manual entry with no setup. Parsing
needs the serverless function, which needs a host that can run one, so
this is the part that moves Ironlog from GitHub Pages to Netlify.

## 1. Get an API key

console.anthropic.com → API Keys → Create Key. It starts with `sk-ant-`
and is shown once. Add a payment method and set a spend cap while you're
there — Settings → Limits.

Haiku costs $1 per million input tokens and $5 per million output. A meal
parse is roughly a third of a penny, so five a day is well under 50p a
month.

## 2. Deploy

Drag this whole folder onto app.netlify.com/drop, or connect the repo.
`netlify.toml` already points at the function.

Then: Site configuration → Environment variables → add

    ANTHROPIC_API_KEY = sk-ant-...

Redeploy after adding it. The key stays on Netlify and is never sent to
the phone.

## 3. Install

Open the Netlify URL in Chrome → ⋮ → Install app.

Your existing log does not come with you — IndexedDB is per-origin, so
the netlify.app address starts empty. Before you switch: open the old
install, Settings ⚙ → Export, then Import on the new one.

## Files

    netlify.toml                     publish + functions config
    netlify/functions/parse-food.js  the only server-side code

## If parsing fails

The app falls back to manual entry and says why. Common causes:

- `ANTHROPIC_API_KEY is not set` — added but not redeployed
- `upstream 401` — key wrong or revoked
- `upstream 400` — usually no credit on the account
- offline — expected; use *Enter manually*

Netlify → Logs → Functions shows the real error.
