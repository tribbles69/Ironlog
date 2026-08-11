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
