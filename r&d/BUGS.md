# Ironlog — found bugs

The running list of known, **non-critical** bugs, kept so they can be fixed
together in one batch rather than one at a time mid-feature.

**Critical bugs don't go here — fix them straight away.** Critical means: data
loss or corruption, the app won't open or a page white-screens, sync or import
damages a log, or a core flow (logging a set, finishing a session) is blocked.

## For agents

- **Found a bug while doing something else?** If it isn't critical, don't fix
  it in the middle of your feature: add it to **Open** below and carry on.
  Mention it in your summary and PR description ("logged B-012 to BUGS.md").
- **Doing a bug sweep?** Write each finding here. A big sweep can have its own
  note in `r&d/notes/` for the detail (like `bug-sweep-2026-11.md`), but every
  finding still gets a one-entry line here so this file is the one list.
- **Asked to "clear the bug list" / "fix the bugs"?** Work Open top to bottom
  (severity first, then oldest). Group fixes into as few versions as makes
  sense — one bump and one changelog entry for the batch is fine — but keep
  one commit per bug so each can be reverted alone. Move each fixed entry to
  **Fixed** with its version.
- Anything that needs Aaron's call goes under **Needs Aaron** with the
  question spelled out, not in Open.
- Check a bug is still real before fixing it; if it's gone, move it to Fixed
  with "not reproducible" and the version you checked against.

## Entry format

```
### B-001 · sev 3 · short title
Found: 2026-11-12, 0.97.0, while <what you were doing>
Where: js/file.js `functionName`
Reproduce: steps, or "from the code"
Fix: suggested fix
```

IDs run on and are never reused. Severity:

| Sev | Meaning |
|---|---|
| 2 | Wrong result a user would notice (bad number, wrong PR, missing data on screen) |
| 3 | Annoyance or edge case (layout glitch, odd shape of data, console error) |
| 4 | Tools, dev-only or cosmetic |

(Severity 1 is critical — not listed, fixed on the spot.)

---

## Open

### B-035 · sev 2 · A save that fell back to localStorage is ignored on the next open
Found: 2026-11-16, 0.99.1, nightly sweep
Where: js/database.js `storePut` and `storeGet`
Reproduce: from the code. `storePut` writes localStorage only when the IndexedDB write throws (quota, a blocked or transiently failing DB). `storeGet` then reads IndexedDB first and returns it whenever it holds anything (`if (v != null) return v`), so on the next launch, with IndexedDB answering again, the older IndexedDB log wins and the sessions saved to localStorage in between are dropped; the next save overwrites IndexedDB for good. The stale localStorage copy is also never cleared after a later successful IndexedDB write.
Fix: stamp each saved log with a write time (or `S.savedAt`) and have `storeGet` take the newer of the two; after a successful IndexedDB put, remove the localStorage copy.

### B-036 · sev 3 · `idb()` reports a write as done before the transaction commits
Found: 2026-11-16, 0.99.1, nightly sweep
Where: js/database.js `idb`
Reproduce: from the code. The promise resolves on the request's `onsuccess`; there is no `tx.oncomplete`. A transaction that aborts after that (quota exceeded at commit, the tab being killed) rejects a promise that has already resolved, so `storePut` sets `STORAGE_OK = true` and skips the localStorage fallback and the "Storage is not responding" toast.
Fix: for `readwrite`, resolve on `tx.oncomplete` (with the request result) and keep `onabort` rejecting.

### B-037 · sev 3 · Modifier picker's Cancel still keeps the adopted tempo
Found: 2026-11-16, 0.99.1, nightly sweep
Where: js/movement.js `openModPicker` (calls `adoptTempo(e)` from js/training.js before the sheet opens)
Reproduce: from the code. On an exercise with a typed modifier such as `x:3-0-1 tempo` (or tempo text in its notes) and no `e.tempo`, open Modifiers and tap Cancel. `adoptTempo` has already set `e.tempo` and removed the `x:` tag from `e.mods` on the live entry, and the next `save()` writes that, so Cancel did not cancel.
Fix: run `adoptTempo` on a copy, or fold the adopted values into the local `sel` / `tp` only, and write to `e` in `#mdOk`.

### B-028 · sev 3 · Cancel on a confirm that has an `onNo` also closes the sheet beneath it
Found: 2026-11-14, 0.99.1, nightly sweep
Where: js/kit.js `confirmDlg` (with `modal`'s backdrop handler)
Reproduce: open any sheet, then `confirmDlg('x', () => {}, 'Yes', () => {})` on top of it and tap Cancel. The Cancel button has both its own handler (`closeModal(); onNo()`) and `data-close`, so the click bubbles to the modal's handler, which calls `dismissModal()` and pops the next sheet down too, running its `onClose`. Probe: with a welcome sheet, an "Under" sheet and the confirm open (stack 3), Cancel leaves a stack of 1 and Under's `onClose` ran. Without `onNo` it is fine (stack 2). Today only the on-device speech-model prompt in workout.js passes `onNo`, and nothing sits under it, so nobody has hit it yet.
Fix: when `onNo` is given, leave `data-close` off the Cancel button (or stop the click propagating in its handler). Better still, let `onNo` be the modal's `onClose` and drop the extra handler.

### B-029 · sev 3 · Profile edits stick when the sheet is closed with ✕, the backdrop or Escape
Found: 2026-11-14, 0.99.1, nightly sweep
Where: js/ui.js `openProfile`
Reproduce: open Profile, change Sex or Date of birth (each change writes straight into `S.settings` so the derived figures redraw), then close with ✕ instead of Cancel. Probe: sex male to female and dob set, closed with ✕, `S.settings` still says female and 1990-05-05, and the next `save()` for any reason writes them to storage. The comment on the sheet says the values are put back on cancel, but only the Cancel button does it.
Fix: pass `onClose` to the sheet to restore `original` (the 0.99.0 kit now runs `onClose` on ✕, backdrop and Escape). `re()` uses `closeModal()`, which does not run it, so the redraw won't undo anything. Save must skip the restore.

### B-030 · sev 3 · A note like "@1" or "@2" is no longer read as target RIR, and the comment still says it is
Found: 2026-11-14, 0.99.1, nightly sweep
Where: js/training.js `noteRir`, `targetRirFor`
Reproduce: `noteRir('@2')` returns null and `noteRir('@1')` is null; before 0.99.0 both were RIR 2 and 1. A note "@1" now falls back to the block or default RIR 2, so autoregulation aims at the wrong effort. The comment above (`"@2" in the program note`) is still left over the new function. Also `noteRir('RPE 8.5')` gives RIR 2 where the header says whole numbers only (10 − 8.5 = 1.5), and `noteRir('3x5 @ 8 reps')` reads as RPE 8.
Fix: decide what "@N" means. If it is RIR for N under 5 and RPE from 5 up, say so in the comment and keep the old behaviour for 0–4. Delete the stale line. Round half-RPE explicitly or ignore it.

### B-031 · sev 3 · The "Best hold" toast repeats for a shorter hold later in the same session
Found: 2026-11-14, 0.99.1, nightly sweep
Where: js/workout.js `toggleSetDone` (timed branch)
Reproduce: from the code. 0.99.0 (B-017) made the rep-set PR toast also compare against sets ticked earlier today (`beatsSession`), but the timed branch only does it when there is no history: `!recs.n ? !peers.length : holdBeats(recs, ...)`. With a 50 s history best, a 60 s hold gives "★ Best hold", and a 55 s hold in the same session gives it again.
Fix: also require the hold to beat the earlier same-pool holds today (same weight, longer `sec`), the way `beatsSession` does for reps.

### B-032 · sev 3 · Welcome: switching units after Back leaves the old number, saved in the new unit
Found: 2026-11-14, 0.99.1, nightly sweep
Where: js/ui.js `openWelcome` step 2
Reproduce: Welcome, About you, type 80 (kg), Next, Back (the box is refilled with 80 from the saved kilos), tap Pounds, Next. Probe: the box still shows 80, `S.settings.bodyweight` ends up 36.29 kg (80 read as lb), units "lb". Bodyweight feeds DOTS, calories and standards.
Fix: when the unit toggles, convert the number in the box (`nice(dw(...))` after setting units), or clear it.

### B-033 · sev 3 · Home's "last 7 days" tiles cover eight days
Found: 2026-11-15, 0.99.1, nightly sweep
Where: js/stats.js `last7`; js/ui.js `viewHome` (`bw7`, `sessions7`)
Reproduce: add a check-in dated 7 days ago (sleep 4 h) and one today (sleep 8 h). `last7()` returns both (probe: `["2026-11-08","2026-11-15"]`), so "Sleep avg · last 7 days" shows 6 h, not 8 h. A session or weight dated 7 days ago is likewise counted in "Sessions · last 7 days" and the "/ 7d" bodyweight change. Today plus the previous 7 days is 8 days; `coach.js` and the BP card use `< 7` / `<= 6`.
Fix: use `daysBetween(...) <= 6` in `last7` and in the two `viewHome` filters (or relabel). Check nothing else leans on `last7`'s eight days.

### B-034 · sev 3 · Profile accepts a negative bodyweight
Found: 2026-11-15, 0.99.1, nightly sweep
Where: js/ui.js `openProfile` `collect` (`st.bodyweight = raw === '' ? 0 : toKg(+raw)`)
Reproduce: Profile, type -70 in Bodyweight and tab out. `S.settings.bodyweight` becomes -70 (probe). Height is clamped 0 to 260; bodyweight has no clamp, so the fallback feeds DOTS and the calorie maths a negative number.
Fix: clamp to a sensible range (for example 0 to 400 kg) the way height is.

## Needs Aaron

(none)

## Sweeps

- **2026-11-16, 0.99.1 (nightly)** — rotation: kit's remainder, exercises and
  database were due; tonight **database** (storage section) was read in
  depth, plus movement again (modifier picker). Stopped at: database line 140,
  so tomorrow carries on with the rest of database, then exercises, stats.
  Also re-read the 0.99.1 diff (DOTS clamp, `yearAge`, meet tie-break and
  placing delta); probes in the page gave the intended numbers (Junior at the
  year you turn 19 to 23, women's DOTS flat above 150 kg). Checks:
  check-version, lint-scope, validate-exercises, validate-mobility and
  module-map --check (TypeScript 5) pass; smoke 56/56, no page errors. The
  click-through of every page timed out in this run and was not completed.
  New: B-035 to B-037.
- **2026-11-15, 0.99.1 (nightly)** — rotation wraps: main was last night's
  stop, so tonight **state** and **kit** read for logic (nothing new in either;
  `chartMulti` draws a flipped axis if every value is the same negative
  number, but no real series is negative). Also re-read movement and ui
  (Home, update check, What's new, Profile) and main's boot and rescue path;
  B-029 reproduced independently by pressing Escape on the Profile sheet.
  Stopped at: kit (first 200 lines in depth), so tomorrow carries on with the
  rest of kit, then exercises, database. Checks: check-version, lint-scope,
  validate-exercises, validate-mobility and module-map --check (TypeScript 5)
  pass; smoke 56/56, no page errors (headless Chromium). Click-through of
  every page not run tonight. New: B-033, B-034.
- **2026-11-14, 0.99.1 (nightly)** — rotation stopped at **main** (core, kit,
  loading, training, stats, io, sync, rest, workout, coach, health were done on
  11-13; tonight movement, ui, main, so tomorrow wraps to **state**). Also read
  the whole 0.98.3 to 0.99.1 diff for every js file changed since the last
  sweep (the B-001 to B-021 fixes) and the callers of the new `dismissModal`,
  `closeAllModals({quiet})`, `entryVolume`, `noteRir`, `yearAge` and
  `openAxisPickerFor`. Checks: check-version, lint-scope, validate-exercises,
  validate-mobility all pass; module-map --check passes (needs TypeScript 5 —
  the 7.x that `npm install typescript` pulls now has no `ScriptTarget` and
  the tool throws; installed 5.6.3 in a scratch folder); smoke 56/56 with no
  page errors; each of the five pages opens with no page errors. One
  automated click-everything loop had the headless renderer crash once; it did
  not repeat per click or per page, so not logged. Probes behind B-028, B-029,
  B-030 and B-032 are in their entries. New: B-028 to B-032 (numbered after B-022 to B-027, which are taken by the
  open security PR #106).
- **2026-11-13, 0.98.3** — module by module after the E17 split: core, kit,
  loading, training, stats, io, sync, rest, workout, coach, health read for
  logic; module-map --check, lint-scope, eslint, check-version and validators
  pass (B-003 still); smoke 56/56; monkey clicker 4 configs × 1200–1500 random
  actions, 0 errors, no NaN on screen; full click-through on empty, migrated kg,
  migrated lb and program installs in both skins (757–759 clicks each), no new
  errors; scripted mixed session to cross-check volume. New: B-010 to B-021.
  Nothing fixed in this pass.
- **2026-11-12, 0.97.0** — checks and tools all pass except the known B-003;
  smoke test 55/55 on empty and migrated installs; click-through of every
  page (276 + 742 clicks), no new errors beyond B-001; CSV round trip shows
  only B-002. Read line by line: events and meet day, calculators and AI key,
  caliper/body-comp, BP and glucose bands, cardio zone control loop, fitting
  test scoring, core helpers. Formulas checked against sources: DOTS, IPF GL,
  Jackson–Pollock 3/7, Durnin–Womersley, Siri, Katch–McArdle, Casey Butt,
  normalised FFMI, Tanaka, Karvonen. New: B-005 to B-009.

## Fixed

Most recent first: `- B-000 · title — 0.00.0`

- B-009 · "Moved X places" can say no change after two tests on one day — 0.99.1
- B-008 · Meet placing: ties don't go to the lighter lifter — 0.99.1
- B-007 · Caliper preview shows a body-fat % with no age entered — 0.99.1
- B-006 · IPF age category goes by birthday, not calendar year — 0.99.1
- B-005 · DOTS for women over 150 kg bodyweight is too high — 0.99.1
- B-004 · VBT sim tools fail on a Windows CRLF checkout — 0.99.1
- B-003 · Exercise validator has seven checks for the old 77-week program — 0.99.1
- B-002 · CSV round trip drops extra leaf keys on an exercise with no sets — 0.99.1
- B-021 · Thousands separator read as a decimal — 0.99.0
- B-020 · Time fields accept 1:75 — 0.99.0
- B-019 · Coach plate answer assumes a 20 kg bar — 0.99.0
- B-018 · Rest ±15 s lands on the wrong exercise after reordering — 0.99.0
- B-017 · Live PR toast repeats for a lighter later set — 0.99.0
- B-016 · "Looks like a lb figure" on an ordinary dumbbell jump — 0.99.0
- B-015 · "Beyond any recorded lift" fires on real loads over 500 kg — 0.99.0
- B-014 · "@8" in a note is read as RIR 8 — 0.99.0
- B-013 · Cambered bar and Swiss bar get no plate maths — 0.99.0
- B-012 · No way to change equipment or handles on a logged entry — 0.99.0
- B-011 · Escape and closeAllModals skip a modal's onClose — 0.99.0
- B-010 · Session volume counts one side of a per-side lift — 0.99.0
- B-001 · Closing the coach straight after a message throws — 0.99.0
- Everything from the November sweep up to 0.96.5 — see
  `r&d/notes/bug-sweep-2026-11.md`.
