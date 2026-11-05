# Shared summary files: one readable record across Aaron's apps

Written 2026-11-05. Aaron plans a food app and a symptom / disability logger
alongside Ironlog, and wants one central record that he controls. That
record should let the pre-session brief judge a session from logged
symptoms, food and training together.

Ironlog's `Ironlog summary.md` (0.78.0, see `drive-sync-spec.md`) is the
first file to this format. This spec is for every app Aaron builds, so it
lives in Ironlog's r&d as the reference copy. Each new app links back to it.

## Principles

1. **The user owns the data.** Every file lives in the user's own Google
   Drive. There is no server, no account and no third party.
2. **Each app writes only its own files.** No app reads or edits another
   app's summary. Apps stay independent: any one can be rebuilt or dropped
   without touching the others.
3. **The summary is output, not storage.** Each app keeps its own source of
   truth (Ironlog: IndexedDB plus `Ironlog backup.json`). The summary is
   rewritten whole on every sync and never read back or merged.
4. **Readable by a person first.** Plain Markdown that can be opened on a
   phone. Being readable by Claude through the Drive connector follows from
   that.
5. **Small.** About 4 weeks, under roughly 50 KB. Full history stays in the
   app's backup.

## Where the files go

**v1 (now): Drive root, fixed names.** `<App> summary.md`, for example
`Ironlog summary.md`, `Food summary.md`, `Symptoms summary.md`.

The apps use the `drive.file` scope. That scope only lets an app see files
it created itself. So a shared folder made by one app is invisible to the
next, and each app that tried to create `My data/` would make its own copy.
Fixed names at the root avoid that, and the Drive connector finds them by
title.

**v2 (later, optional): a shared folder chosen by the user.** Each app asks
once, through the Google Picker, for the folder to write into. Picking a
folder grants that app access to it under `drive.file`, so every app writes
into the same `My data/` folder. Store the folder id beside the app's sync
metadata. Only do this if the root gets cluttered. The file names and
format below don't change.

## File format

```markdown
# <App> summary
Written <YYYY-MM-DD HH:MM> UTC by <App> <version>. Last <N> days. <One sentence of units and conventions.> The full record is "<backup file name>".

## <Section>
- <Ddd D Mon>: <fields as "name value" pairs separated by " · ">, “quoted free-text notes”
```

**Rules:**

- **Header:** the first line is `# <App> summary`. The second line must
  begin with `Written <timestamp> UTC`. Readers check that timestamp to
  decide whether the file is fresh enough, so every app writes it the same
  way.
- **Dates:**
  - Entries use the local date, written `Thu 5 Nov`.
  - Within a section, newest first, unless the section is a plan, which runs
    soonest first.
  - Use the same date for the same day in every app. That's the join key.
- **Fields:**
  - short lowercase names, value straight after (`sleep 7 h`, `energy 3`)
  - units written out
  - scales stated once in the header (for example "0–10, 10 worst")
- **Notes:** in curly quotes (“ ”) so they stand apart from fields.
- **No numbering.** No numbered lists or tables that depend on order.
  Readers match on dates and names.
- **Sensitive data:** write what the user logged, as logged. Never add
  inferred labels or diagnoses. The file is the user's own record.

## Sections each app is expected to write

| App | Sections |
|---|---|
| **Ironlog** (live) | Check-ins · Goals · Next 7 days (planned) · Training report (every session, every set, RIR, bar speed) |
| **Food** (planned) | Daily totals (kcal, protein, carbs, fat, water) · Meals (time, what, notes) · Targets |
| **Symptoms** (planned) | Daily entries (each symptom: severity on the stated scale, where, how long, notes) · Flares (start, end, triggers the user named) · Medication / aids as the user logged them |

## Who reads it

- **session-debrief** and **pre-session-brief** (Claude skills) read
  `Ironlog summary.md` today.
- Once the other files exist, the brief should read all three for today and
  yesterday and set the session's mode from the combined picture. For
  example: a symptom flare logged this morning, or food well under target
  after a long shift, means Amber before Aaron says anything.
- Joining is by date only. The brief should never treat a missing file as
  "nothing logged". Missing means unknown.

## Checklist for a new app

1. Keep the app's own data local-first, with its own backup file.
2. Add Drive sync with `drive.file` (copy Ironlog's `driveToken` /
   `driveWriteNamed`).
3. Write `<App> summary.md` on every sync, in the format above.
4. Write and back up on the app's natural "done" tap (see Ironlog's
   `finishBackup`), because there is no background renewal without a
   server.
5. Add the app's row to the table above. Update the brief skill to read the
   new file.
