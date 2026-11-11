# Bug sweep — November 2026 (roadmap 00-B1)

Audit of Ironlog **0.90.0** (`ironlog-v129`, main at `d2e79d6`), 11 Nov 2026.
Nothing was fixed in this step. Fixes are 00-B2, top of this list down, one
per version.

Each finding says where it is, how to reproduce it, a suggested fix, and how
sure it is:

- **Confirmed** — reproduced in the running app (local server, Chromium).
- **From the code** — read in the source, not run.

Tick a finding with its version when it ships.

## What was covered, and what wasn't

| Check | Result |
|---|---|
| `<script>` syntax check (roadmap rule 5) | 4 blocks, all OK |
| `r&d/tools/lint-scope.js` | no undeclared identifiers |
| `r&d/tools/check-version.cjs` | versions agree |
| `r&d/tools/build-demos.cjs --check` | ok, 10 patterns, 55 movements |
| `r&d/tools/validate-exercises.js` | **crashes** — finding 4.7 |
| `smoke.js` on an empty install, the migrated seed, and a real 0.5.0 state upgraded in place | 55 of 55 each |
| Click-through of every page, plus one level into each sheet, empty and migrated, both skins | ~470 clicks, no exceptions |
| Unlabelled-control scan, all pages and the main sheets | 9 controls — finding 4.3 |
| CSV export → import, 38 sessions including odd shapes | exact, key for key |
| kg / lb entry and RIR ↔ RPE on the live set table | stored correctly (225 lb → 102.058 kg, RIR 2 → RPE 8) |

**Read line by line:** storage, load/save, Drive sync and merge, migration,
clear data, PR engine, plausibility, weekly sets, rep range, autoregulation,
program install/remove, missed sessions, finish and edit session, JSON and CSV
in and out, other-app import, the whole bar-speed (Measure) path, boot,
`sw.js`, `slew-core.js`, `bump.cjs`, `check-version.cjs`, `vbt-sim.cjs`,
`serve.mjs`.

**Only exercised by the smoke test and click-through, not read in full:**
events and meet day, coach chat, cardio and intervals, mobility, fitting test,
health and vitals, body composition, daily clip, share cards, debug traces,
tools page, the exercise demos, `slew-video.js` and the rest of `r&d/tools`.
Bugs that need particular data in those areas could still be there. The
`index.html` script is 1.46 MB; roughly a fifth of its code was read closely.

Not testable from a desktop: sensors, camera, Bluetooth, notifications,
TalkBack itself, the Google sign-in. Those stay on A4.

---

## Severity 1 — data loss or corruption

### [ ] 1.1 Drive sync deletes things you removed and then added back — Confirmed
**Where:** `mergeSync` / `stampOf` (index.html ~1700–1753).
A deleted record leaves a tombstone with the time of the delete. A record
comes back only if its own timestamp is newer. Records with no timestamp
count as time 0, so they can never beat a tombstone.
No timestamp at all: `programs`, `customEx`, `exAliases`, `programStarts`,
`programNames`, check-ins, planned sessions, goals, meets, and the `coach`
keys (`plan`, `planProg`…).
**Reproduce (run in the app):** install the program, sync, remove the
program, sync, install it again, sync → all 23 planned sessions and the
program itself are gone (24 → 1 sessions in the test). Same shape:
delete today's check-in, sync, re-enter it, sync → gone. Coach → Forget
everything, sync, build a new plan, sync → the plan is gone.
**Fix:** when a record exists locally but is not in `known` (so it was created
here since the last sync), clear its tombstone instead of obeying it. That
needs no stored-data change. Also stamp check-ins, goals, meets and planned
sessions with `mt` when they're saved.

### [ ] 1.2 Importing a JSON backup replaces the whole log with no question and no checks — Confirmed
**Where:** `importJSONFile` (~20015); callers in Settings, the 98 File menu,
and the share target (~4764).
Any JSON file that has a `workouts` key is accepted and written over
everything, straight away. No "this replaces N sessions" prompt, no shape
check, no copy kept.
**Reproduce:** Settings → Import JSON → pick an old or wrong file. The
current log is gone on the next save (400 ms).
**Fix:** validate first (arrays are arrays, settings is an object), show
what's in the file against what's on the phone, ask before replacing, and
keep the previous state under a second storage key until the next export.

### [ ] 1.3 A bad import can lock the app on "Loading your log…" for good — Confirmed
**Where:** `load` (~2010) and `boot` (~21206).
`load` merges whatever was stored over the defaults, so a `null` collection
stays `null`; the first render then throws inside `boot`, which has no error
handling, and the loading veil never comes off. Nothing in the app can be
reached, including Export.
**Reproduce:** import `{"workouts":[],"checkins":null,"settings":{}}`, reload.
Stuck on the veil: `TypeError … reading 'find'` at `checkinFor`.
**Fix:** normalise in `load` (any collection that isn't the right type goes
back to its default; the same function used by import in 1.2). Wrap `boot` in
a try/catch that shows a rescue screen: the error, "Save a copy of my data"
(the raw stored string), and "Start fresh".

### [ ] 1.4 Unreadable stored data is silently replaced by an empty log — From the code
**Where:** `load` catch (~2039) and `storeGet` (~1532).
If the stored JSON won't parse, `load` returns an empty state and the next
save writes it over the original. If IndexedDB fails to *read* (blocked, a
transient error), `storeGet` falls back to localStorage, finds nothing, and
the app starts as a fresh install; the next save then goes to IndexedDB if it
has recovered, over the real log.
**Fix:** tell a failed read apart from "nothing stored". On a failed read or
parse, don't save over it: keep the raw string under a rescue key and show
the rescue screen from 1.3.

### [ ] 1.5 Restoring an older JSON backup, then syncing, deletes newer sessions from Drive — From the code
**Where:** `importJSONFile` doesn't touch the sync bookkeeping
(`ironlog.sync` → `known`).
After the import, anything Drive knew about that isn't in the file looks
"deleted on this phone". Up to 5 records (or under a quarter) go without the
safety prompt, and the tombstones then delete them on other phones too.
**Reproduce:** connected to Drive; import a backup from last week; Sync.
**Fix:** on import (and on Erase all data), clear `known` so the next sync is
a plain merge with nothing treated as deleted.

### [ ] 1.6 Custom exercises aren't in the Drive backup or the CSV — Confirmed (display), From the code (sync)
**Where:** `SYNC_SETS` / `SYNC_MAPS` (~1687) leave out `customMovements`;
the CSV carries only the leaf.
Sessions sync, but the definitions of exercises the catalogue didn't know
don't. On a new phone after a Drive restore they show as raw ids
(`custom-smoke-test-movement`) with no name.
**Fix:** add `customMovements` to the synced sets (keyed by id). On load,
import and sync, rebuild a missing custom movement from the entry's
`legacyName`.

### [ ] 1.7 An update can restart the app while you're editing — From the code
**Where:** service-worker block (~21259) and `applyUpdate` (~3041).
With no workout running, a new version reloads the page 1.4 s after it
downloads. An open Edit session sheet, a half-typed check-in or a fitting
test step in a sheet is lost. `applyUpdate` also doesn't flush the pending
save before it reloads.
**Fix:** don't auto-restart while a sheet is open (show the toast and wait,
as for a live workout); `await flush()` before every reload.

### [ ] 1.8 Finishing a plan session drops its link to the plan — Confirmed
**Where:** `finishWorkout` (~7566): `prog` is only kept when the session has
a `block`.
A planned session from a program with no block names is saved without
`prog`, so the program's "Completed" count never moves for it. `loads` and
session-level fields other than the ones listed are dropped too.
**Reproduce:** start a planned session that has `prog` but no `block`,
finish it → the saved session has no `prog`.
**Fix:** keep `prog` whenever it's there. (Stored data: adds a field to new
sessions only. Old ones could be relinked by id prefix — **ask Aaron
first**.)

---

## Severity 2 — white screens and crashes

Syntax check clean; smoke test and click-through found nothing on a fresh
install. What's here comes from imports and from the missing safety net.

### [ ] 2.1 Boot has no safety net
Same code as 1.3: any exception in `load`, the migration or the first render
leaves the veil up for good. Fixed by the rescue screen in 1.3. Listed here
so it isn't lost if 1.3 is narrowed.

### [ ] 2.2 Importing a backup made before 0.7.0 crashes every page until a reload — Confirmed
**Where:** `importJSONFile` doesn't run the v1 → v2 migration that `boot`
runs.
**Reproduce:** import a file whose exercises have `name` and no `leaf` →
`Cannot read properties of undefined (reading 'movement')` on every view.
A reload fixes it, because boot migrates.
**Fix:** run the same normalise-and-migrate step after an import (part of
1.2).

### [ ] 2.3 Import accepts `workouts` that isn't a list — Confirmed
`{"workouts":{}}` passes the check, then `S.workouts.filter is not a
function` everywhere, and on the next start `load` throws and falls back to
an empty log (1.4). Fixed by the validation in 1.2.

---

## Severity 3 — wrong numbers

### [ ] 3.1 Session summary shows "Reps NaN" and saves no volume when a carry or hold is in the session — Confirmed
**Where:** `finishWorkout` summary (~7568), `saveEdit` (~8400),
`backfillPlanned` (~10817), and the summary sheet's rep total.
Carries have no `r`, so `w × r` is NaN; the stored `summary.volume` becomes
`null` and the sheet shows `0kg` and `NaN` reps.
**Reproduce:** finish any session that includes a farmer's carry.
**Fix:** `s.w * (s.r || 0)` in the three sums and the rep total. (Recomputes
on the next finish or edit; stored summaries of old sessions stay as they
are unless Aaron wants them rebuilt.)

### [ ] 3.2 The rep-range "add weight" step assumes 2.5 kg (roadmap's known one, E13) — From the code
**Where:** `rangeNextLoad` (~14152), `roundLoadFor` (~14690).
A fixed-rating gripper, a finger band, a machine stack or a kettlebell can't
go up 2.5 kg. For a gripper the line reads "next time 42.5 kg".
**Fix:** for `gripper` / `extension_band`, say "move up a gripper" with no
number; leave the others to 3.3.

### [ ] 3.3 Dumbbell loads round to 2 kg even in lb — Confirmed
**Where:** `roundLoadFor` (~14691).
In lb the suggestion for a 20.3 kg dumbbell is 44.1 lb. Should be the
nearest 5 lb.
**Fix:** round in display units: 2 kg, or 5 lb.

### [ ] 3.4 Backfilling a plan that has no weights logs 0 kg sets as real ones — Confirmed
**Where:** `backfillPlanned` (~10802).
Since 0.51.0 the shipped program has no weights (RIR only). "Mark planned
sessions done at the prescribed loads" then writes every set at 0 kg. Those
count as bodyweight rep records, as hard sets in Weekly sets, and as
sessions in each lift's stats.
**Fix:** leave RIR-only sessions out of backfill and say why, or mark them
skipped (the Missed flow already exists). **Ask Aaron** before touching any
that are already backfilled — that's stored data.

### [ ] 3.5 Measure records the last set's weight, not the set being measured — From the code
**Where:** `openVbtRecord` (~11713): `ex.sets.filter(s => s.w > 0).slice(-1)`.
Measuring a warm-up while the top set is already typed uses the top set's
weight for power and in the debug trace (`kg`). The 9 Nov traces may carry
the wrong kg for warm-ups because of this — check before using them in
00-V2.
**Fix:** use the set the reading will attach to (first not-done set without
a reading), as `attachVbt` does.

### [ ] 3.6 Two sessions on the same day can both claim the same PR — From the code
**Where:** `prsFor` (~4287) reads history strictly *before* the session's
date, so a second session that day doesn't see the first.
**Fix:** compare by date then end time. **Would change which sessions show
a PR badge — ask Aaron.**

### [ ] 3.7 e1RM drops when a set is logged easier than RIR 5 — From the code
**Where:** `e1rm` (~2116): RIR counts only for RPE 5–10.
100 × 5 at RIR 5 is worth 133 kg; at RIR 6 it's worth 117 kg. Also every
set tops out at 12 "effective reps", so 12 reps at RIR 0 and 12 at RIR 4
give the same number.
**Fix:** none suggested without a decision — any change moves existing PR
and e1RM numbers. **For Aaron to decide; not part of 00-B2 unless he says.**

### [ ] 3.8 Bar-speed RIR is unreliable on long sets
Already known (35 × 17 read RIR 12). Belongs to **00-V2**; listed so the
sweep is complete.

### [ ] 3.9 "No reps found" quotes the wrong minimum travel — From the code
**Where:** `vbtReviewDlg` (~11925) says the bar must travel at least 10 cm;
the real floor has been 4 cm since 0.90.0.

---

## Severity 4 — broken or confusing UI

### [ ] 4.1 Closing Edit session throws the edits away without asking — From the code
**Where:** `renderEditWorkout` (~8225). Back, Escape, a tap outside or
Cancel all discard. **Fix:** ask if anything changed.

### [ ] 4.2 "Erase all data" doesn't erase all data — From the code
**Where:** `#stWipe` (~13309).
It resets the log but leaves progress photos, daily clips, raw bar-speed
traces, the AI key and the Drive link. With Drive connected, the next sync
sees an empty phone and restores everything.
**Fix:** say exactly what goes; offer to also remove photos, clips and
traces; disconnect Drive (the file stays in the user's Drive) so it doesn't
come back by surprise.

### [ ] 4.3 Nine controls with no accessible label (C4) — Confirmed
Calendar `‹` `›` (`#calPrev`, `#calNext`); Settings plate-row `−` (`data-prm`)
and the Drive client ID box (`#stClientId`); Profile sex, date of birth,
height, bodyweight and activity (`#pfSex`, `#pfDob`, `#pfHeight`, `#pfBw`,
`#pfAct`) — their labels aren't tied to the fields.

### [ ] 4.4 The service worker updates the app behind the update prompt — From the code
**Where:** `sw.js` fetch handler (73–93).
Every launch re-fetches each file and writes it into the *current* cache.
So a new `index.html` is in use on the second launch whether or not the
update sheet was accepted, including mid-workout, and with a patchy signal
one file can be new while another is old. **Fix:** don't refresh files in
the versioned cache; only a new worker version brings new files.

### [ ] 4.5 Settings made on one phone never reach another — by the spec, worth a look
`drive-sync-spec.md` §4: local settings win except on an empty phone. So
bar-speed calibration, places, rest times and plates don't travel after the
first restore. Not a bug against the spec. **For Aaron:** sync at least
`slewProfiles` and `places`?

### [ ] 4.6 First launch reloads about a second in — From the code
The worker takes control on first install and the page reloads
(`controllerchange`), which can interrupt the welcome sheet. Known in a
comment at `load`. **Fix:** skip the reload when there was no controller
before.

### [ ] 4.7 Tools
- `validate-exercises.js` throws a TypeError at line 141 after its "zero
  orphans" check fails. It only knows `r&d/data/exercises.json`; the app also
  resolves names through the extended database, so *Tibialis Raise* and
  *Landmine Press* count as orphans there but resolve fine in the app.
  **Fix:** guard the null, and either add the two movements to the catalogue
  or teach the validator about the extended database.

---

## Order for 00-B2

1.3 + 2.1 (rescue screen and normalised load) → 1.2 + 2.2 + 2.3 (safe
import) → 1.1 (sync tombstones) → 1.5 → 1.4 → 1.6 → 1.7 → 1.8 → 3.1 → 3.2 →
3.3 → 3.5 → 3.9 → 4.x.

**Waiting on Aaron before any fix:** 3.4 (already-backfilled sessions),
3.6, 3.7, the relink part of 1.8, and the question in 4.5.
