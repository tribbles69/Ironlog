# Ironlog — Backup and sync to your own Google Drive

Roadmap B6. Written against 0.32.0. Line numbers drift — grep `DRIVE SYNC`.

## What it is

One JSON file, **`Ironlog backup.json`**, in the user's own Google Drive. Each
device that connects merges its log with the file and writes the result back.
No Ironlog server or account is involved: the browser talks to Google directly.

## Decisions

**Scope: `drive.file`.** Ironlog can see only files it created — not the rest
of the Drive. It's a non-sensitive scope, so the Google app needs no security
review. The UI says this in one sentence before the user signs in.

**Sign-in: Google Identity Services token client**, loaded from
`accounts.google.com/gsi/client` only when the user taps Connect or Sync. The
access token is kept in memory for its hour and never stored. With no server
there's no refresh token, so a later sync may show Google's account chooser
again. That is the cost of having no backend.

- **Automatic sync** happens only while a token from this session is still
  valid: after finishing or editing a session.
- **Otherwise**, the user taps *Sync now*.

**What syncs:** workouts, check-ins, goals, meets, imports, custom exercises,
programs, exercise aliases, program start dates, and settings.

**Readable summary** (0.78.0, Aaron 2026-11-05): after each successful
write, `Ironlog summary.md` (text/markdown) is rewritten beside the backup —
the last 28 days via `reportData(..., { warm, notes, vbt })` / `reportText`,
plus check-ins, goals and the next 7 planned days (`driveSummaryText`). Its
id is kept as `summaryId` in the sync meta. It is output only: never read
back or merged, and a failure to write it never fails the sync. Purpose:
open on a phone, and let Claude read training through the Drive connector
(the 1 MB+ backup is too large for that). Its format follows
`shared-summary-spec.md`, the cross-app convention for Aaron's apps.

**Backup on Done** (0.78.0, Aaron 2026-11-05): tapping Done on the
session-complete sheet runs `driveSync(true)` (`finishBackup`) when connected,
unless sync meta `autoFinish` is false (Settings checkbox) or a sync finished
in the last two minutes. The tap is the user gesture GIS needs; GIS is
preloaded when the sheet opens so the gesture hasn't expired by the time
`requestAccessToken` runs. The home backup reminder uses 3 days instead of
14 while Drive is connected.

**What never syncs:**
- the workout in progress;
- device-only bookkeeping (`lastSeenVersion`, backup reminder state);
- the AI key, unless *Include my AI key* is ticked. It lives in localStorage,
  outside the state, so leaving it out is the default by construction.

**File format:**

```
{ format: 'ironlog-sync', v: 1, app, savedAt, data: {…collections, settings[, aiKey]}, tomb: { <collection>: { <id>: ms } } }
```

A file with a higher `v` than this build understands is refused ("update
Ironlog first"). It is never merged or overwritten.

## Merge — never loses local data

Records are keyed by `id`:
- check-ins by `date`;
- custom exercises and programs by value;
- aliases and program starts by map key.

1. **Deletions.** The device remembers which keys existed after its last sync
   (`known`, in localStorage, device-only). A key that was known but is now
   gone was deleted here, and gets a tombstone. Deletions made elsewhere
   arrive as the file's tombstones.
2. **Union.** For every key on either side that isn't tombstoned:
   - if only one side has it, keep that one;
   - if both have it, keep the newer by `mt || edited || end || start`;
   - on a tie, local wins.
3. **Tombstones vs edits.** A tombstone removes a record only if it is newer
   than the record's stamp. An edit made after the deletion survives.
4. **Settings.** Local settings win, except on a device with no sessions and
   no check-ins (a new phone), where the file's settings are taken.
   Two exceptions since 0.96.5 (bug sweep 4.5): **places** (`settings.places`,
   keyed by id) and the **bar-speed calibration** (`settings.slewProfiles`,
   keyed by lift) sync record by record, like a collection — deletes,
   tombstones and newest-wins by `mt`, which saving either now stamps. They
   travel as `data.places` and `data.slewProfiles` in the file (and still
   inside `data.settings`, for older versions). A file without them is read
   from its `settings`. If the place this phone is "at" was deleted on
   another, it lets go of it. Everything else in settings stays per phone.
5. **Safety valve.** If this device would delete more than 5 records and more
   than a quarter of what it knew, it asks before writing:
   - *Remove from Drive too*, or
   - *Put them back*, which restores them from the file.

   The same check stops a wiped phone from emptying the file. If the device
   has no sessions at all, it never writes tombstones: that's a restore, not
   a deletion.

**First connect:** the merge runs with an empty `known` list. So:
- a device with data and an existing file unions the two;
- a device with data and no file creates the file;
- an empty device pulls everything down.

Nothing local is ever overwritten.

A successful sync counts as a backup for the reminder card (A3).

## Setup (once, by whoever deploys the app)

The Google client ID is tied to the web address the app is served from. To
set it up:

1. In [Google Cloud Console](https://console.cloud.google.com/), create a
   project (e.g. *Ironlog*).
2. *APIs & Services → Library* → enable **Google Drive API**.
3. *OAuth consent screen*:
   - User type **External**; app name *Ironlog*; your email as support and
     developer contact.
   - Add the scope `.../auth/drive.file`.
   - While in *Testing*, add your Google account under **Test users**. Or
     publish it: `drive.file` needs no verification.
4. *Credentials → Create credentials → OAuth client ID*:
   - type **Web application**;
   - **Authorised JavaScript origins**: the app's origin, e.g.
     `https://<username>.github.io` (no path, no trailing slash). Add
     `http://localhost:5178` for testing.
   - No redirect URIs are needed.
5. Copy the client ID (`….apps.googleusercontent.com`) into either:
   - `GOOGLE_CLIENT_ID` in `index.html`, then commit and deploy; or
   - Settings → Google Drive → *Advanced: client ID* on each device, for
     testing without a deploy.

A client ID is public by design; it is not a secret.

## Not in this change

- Dropbox and other providers.
- Background sync with no tap, which needs a server or a refresh token.
- Per-field merging within one session: the newer whole session wins.
