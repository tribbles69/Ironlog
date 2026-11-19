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

### B-038 · sev 2 · A note that ends "RPE 8." or "@8." is not read as a target RIR
Found: 2026-11-19, 0.99.3, nightly sweep
Where: js/training.js `noteRir` (the 0.99.2 B-030 rewrite)
Reproduce: import `/js/training.js` in the page and call `noteRir` — "RPE 8" → RIR 2, "@8" → 2, "rpe 8, rest" → 2, but "Work to RPE 8." → null and "keep @8. then back off" → null. The new `(?![\d%.])` lookahead refuses any number followed by a full stop, so a sentence-ending period (very common in a note) makes the whole match fail. `targetRirFor` then silently falls back to the block RIR or 2, so "@9." (RIR 1) or "RPE 7." (RIR 3) drive autoregulation off the wrong target. Worked before 0.99.2.
Fix: only refuse a full stop that starts a decimal, i.e. `(?!\d|%|\.\d)` instead of `(?![\d%.])`; add "RPE 8." and "@8. then" to the probe list.

### B-039 · sev 3 · `claudeParse` fails when Claude's lead-in sentence contains a "["
Found: 2026-11-19, 0.99.3, nightly sweep
Where: js/ai.js `claudeParse`
Reproduce: stub `fetch` to answer `Here is your plan [as asked]: {"name":"X","days":[1,2]}` and call `claudeParse` — it throws `badjson`. The salvage takes the first `[` or `{` anywhere as the start and the last `]` or `}` as the end, so here it slices from the `[` in the prose to the closing `}`, which isn't JSON. Hits plan writer, tailor and voice parsing whenever the model adds a lead-in containing a bracket.
Fix: when the reply doesn't start with JSON, try the slice from the first `{` to the last `}` and the slice from the first `[` to the last `]` separately and keep the one that parses (or try each candidate start in turn).

### B-040 · sev 3 · Home's "/ 7d" bodyweight change uses an 8-day window and counts future check-ins
Found: 2026-11-19, 0.99.3, nightly sweep (sibling of B-033, which fixed the session and check-in tiles but not this line)
Where: js/ui.js `viewHome` — `bw7 = bws.filter(c => daysBetween(c.date, today()) <= 7)`
Reproduce: `daysBetween` of today−7 is 7 and of today−8 is 8 (probe in the page), so the window is today plus the previous seven days, 8 days, under a "/ 7d" label. A check-in dated in the future gives a negative number, passes `<= 7`, and is also used as `bwNow` (the last entry). Entering a weight for tomorrow shows it as today's weight and a wrong delta.
Fix: `<= 6 && >= 0` like `last7()` and `sessions7`, and take `bwNow` from the filtered list (or the latest check-in dated today or earlier).

### B-041 · sev 4 · The doc comment for `holdRecords` sits above `isBefore`, not above the function
Found: 2026-11-19, 0.99.3, nightly sweep
Where: js/exercises.js, the block before `isBefore` / `holdRecords`
Reproduce: from the code — "Completed working holds for a key…" (per-weight records, `best`, `heaviest`) is followed by the "History before a session" comment and `isBefore`, so `holdRecords` has no comment of its own and `isBefore` appears to document two things.
Fix: move the hold-records comment down to sit directly above `holdRecords`.

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

- **2026-11-19, 0.99.3 (nightly)** — rotation: tonight **database** (from line
  95 to the end: storage safety, backup cards, `mergeSync`, Drive calls),
  **exercises**, **stats** and **ai**. Stopped at: **ai**, so tomorrow carries on
  with **loading**, then training, picker. Also read every js file changed
  since 11-16 (the 0.99.3 diff: B-028 to B-037 fixes in database, kit, movement,
  stats, ui, workout, training, io, tools, main, sync, core). The CSV formula
  guard round-trips (a leading `'` is added then stripped once); the storage
  fallback mark and `idb()` commit change read correctly; `holdBeatsSession`
  and `last7` are right. Probes in the page behind B-038 (noteRir), B-039
  (claudeParse with a stubbed fetch) and B-040 (daysBetween) are in their
  entries. Checks: check-version (0.99.3 / ironlog-v189), lint-scope,
  validate-exercises, validate-mobility and module-map --check (TypeScript
  5.6.3 in a scratch folder) pass; smoke 56/56, no page errors (headless
  Chromium). The click-through of every page was not completed: the headless
  renderer crashed on the first button taps, as in earlier sweeps. New: B-038
  to B-041.
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
