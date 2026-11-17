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

### B-059 · sev 3 · A note's "RPE 8." or "@8." with a full stop after the number is not read as a target RIR
Found: 2026-11-17, 0.99.3, nightly sweep (review of the B-030 change)
Where: js/training.js `noteRir` (the regex added in 0.99.3: `(?![\d%.])`)
Reproduce: in the page, `(await import('/js/training.js')).noteRir(text)` gives `null` for "Work up to RPE 8.", "top set @8.", "RPE 8.5." and "@3." (full stop right after the number), but `{rir:2}` for "RPE 8 then", "@8, then back off" and "RIR 2.". So a program or exercise note that ends its sentence on the number silently falls back to the default target RIR instead of the one written. (0.99.2 and earlier read all of these.) The `.` was added to the lookahead to stop "@8.5" being cut to "@8", but it also blocks a plain full stop.
Fix: let the lookahead refuse a dot only when a digit follows it: `(?![\d%]|\.\d)`. Add the four strings above to whatever test covers B-030. Numbering note: B-038 to B-058 are in use on the open PRs #109 and #110, so tonight's ID starts at B-059.


## Needs Aaron

### B-026 · sev 2 · Ironlog shares its storage with every other site on tribbles69.github.io
Found: 2026-11-13, 0.99.1, security and privacy check
Where: hosting — browsers keep localStorage / IndexedDB per origin (scheme + host), not per path
Reproduce: from any other page on https://tribbles69.github.io/ (another repo's Pages site, or r&d/tools/demo-lab.html in this one), `localStorage.getItem('ironlog.anthropicKey')` and `indexedDB.open('ironlog')` read Ironlog's key, log, photos and clips. The same is true for anyone who self-hosts on their own username.github.io.
Fix: give Ironlog an origin of its own — a custom subdomain on GitHub Pages, or e.g. a Cloudflare Pages ironlog.pages.dev. Question for Aaron: which address? Moving origin doesn't move anyone's data: users need a Drive sync or export first, so the old address should show a "we've moved — sync or export, then open the new one" screen for a while. The README's self-hosting steps should tell people to use a repo/domain that hosts nothing else.

### B-027 · sev 2 · Public repo holds Aaron's personal training and health details
Found: 2026-11-13, 0.99.1, security and privacy check
Where: `r&d/data/hunchback-pplul-77wk.txt`, `r&d/data/routines/morning-stretch.json` (and the copy built into js/health.js, shown to every user as "Priority for kyphosis"), `r&d/data/vbt/ironlog-vbt-raw-2026-11-11.json`, Chelsea named in `r&d/specs/coach-spec.md`, `r&d/data/templates/README.md`, `r&d/ROADMAP.md`, `r&d/tools/smoke.js`
Reproduce: the repo is public and GitHub Pages serves all of `r&d/` too
Fix: question for Aaron — make the repo private (Pages from a private repo needs a paid GitHub plan, or host elsewhere, see B-026), and/or strip these: generic wording for the stretch flags ("priority for upper-back posture"), "a new lifter" instead of Chelsea, move personal data files out of the repo. Anything already pushed stays in git history unless the history is rewritten.

## Sweeps

- **2026-11-17, 0.99.3 (nightly)** — rotation: the 11-16 run stopped at
  database line 140, so tonight the **rest of database** (Drive calls, merge,
  save / flush, backup nudge), **exercises** (muscle shares, `leafMuscles`,
  option lists, leaf and set helpers; the demo-drawing code and the bundled
  catalogue data were not read) and **stats** (standards, recovery,
  weekly sets, `statsFor`, PRs, plausibility, goals) were read. Also read every
  js change since the last sweep: the 0.99.3 fixes B-028 to B-037 (`confirmDlg`,
  Profile cancel, Welcome unit switch, bodyweight clamp, modifier picker,
  storage fallback, hold toast, `noteRir`, last-7 tiles). Tomorrow carries on
  with **ai**, then **loading**, **training**. Checks: check-version,
  lint-scope, validate-exercises, validate-mobility and module-map --check
  (TypeScript 5.6.3 in a scratch folder) pass; smoke 56/56, no page errors
  (headless Chromium). The click-through of every page was not run tonight.
  Probes: all 283 catalogue movements give muscle shares that sum to 1, except
  hip adduction and five neck movements, which have none (the map has no such
  muscle, so they never count toward weekly sets or recovery; not logged as a
  bug); every STD lift has hand-set shares. Not logged, noted: `fatigueMap`
  drops a completed session that has no start/end time and is dated today
  before 12:00 (`woTime` falls back to noon). New: B-059.
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
  B-030 and B-032 are in their entries. New: B-028 to B-032 (numbered after
  B-022 to B-027, which are taken by the security pass).
- **2026-11-13, 0.99.1 — security and privacy** — 266 script-injection payloads
  written into every user text field (sessions, notes, goals, events, custom
  exercises, places, plans, coach notes), then smoke 56/56 plus every
  session, goal, event and movement screen opened: nothing ran, 48 showed as
  plain text. Coach replies go in as textContent. Network: only the app's own
  files, api.anthropic.com, Google Drive and Google sign-in; no trackers or
  CDNs. Drive token in memory only, revoked on disconnect, drive.file scope.
  Erase everything clears IDB (photos, clips, undo copy) and localStorage.
  No secrets in the current tree. New: B-022 to B-027. Detail:
  `r&d/notes/security-audit-2026-11.md`.
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

- B-037 · Modifier picker's Cancel still keeps the adopted tempo — 0.99.3
- B-036 · `idb()` reports a write as done before the transaction commits — 0.99.3
- B-035 · A save that fell back to localStorage is ignored on the next open — 0.99.3
- B-034 · Profile accepts a negative bodyweight — 0.99.3
- B-033 · Home's "last 7 days" tiles cover eight days — 0.99.3
- B-032 · Welcome: switching units after Back leaves the old number — 0.99.3
- B-031 · "Best hold" toast repeats for a shorter hold later in the session — 0.99.3
- B-030 · "@1" / "@2" notes no longer read as target RIR — 0.99.3
- B-029 · Profile edits stick when closed with ✕, backdrop or Escape — 0.99.3
- B-028 · Cancel on a confirm with `onNo` also closes the sheet beneath it — 0.99.3
- B-025 · CSV export cells starting = + - @ run as formulas in Excel / Sheets — 0.99.2
- B-024 · No notice of what each AI feature sends to Anthropic — 0.99.2
- B-023 · AI key note says "sent nowhere but Anthropic" while Drive backup can include it — 0.99.2
- B-022 · No Content-Security-Policy: one missed esc() could send the log or AI key anywhere — 0.99.2
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
