# Ironlog — Isometric holds

Implementation brief for Claude Code.
Repo: `https://github.com/tribbles69/Ironlog` (branch `main`, single file `index.html`).

Line numbers below are from `index.html` at version 0.16.0. They will drift as you
edit — treat them as starting points, not addresses. Grep to confirm before changing
anything.

---

## The problem

Ironlog can log reps-and-weight or a duration, but duration is a property of the
*movement* — a plank is always timed, a lateral raise never is. There is no way to
log an isometric hold of a normally rep-based lift. Currently the workaround is
logging one rep and writing the hold in the notes, which keeps the duration out of
history, stats and PRs entirely.

Isometric is not a property of the movement. It is a property of *this exercise
entry in this session*. That distinction drives the whole design.

---

## Decisions already made

**Isometric is a per-entry flag, not a new movement or a new leaf axis.**
Add `iso: true` to the exercise entry. Do not add a fifth axis to the leaf
(movement / equipment / execution / attachment) and do not create duplicate
"Lateral Raise (Isometric)" movements in the database.

**Isometric sets keep their own PR pool.** A 20-second loaded hold and a set of ten
reps are not comparable lifts and must not contend for the same record.

**Reuse the existing `sec` field on the set.** Do not introduce a parallel duration
field. Holds are a `time` metric entry; the machinery for that mostly exists.

---

## Open decision — confirm before building

`bestHold()` (grep `function bestHold`) currently ignores weight completely. It
returns the longest completed working hold for a key, full stop. That was fine when
holds were only planks and carries. For a loaded isometric it is wrong: an 8 kg
lateral raise held 20 s and a bodyweight hold of 40 s would both register as "a
hold", and the heavier one would never be a record.

Two options, pick one before writing the logging UI, because it determines what the
set row has to store:

- **A — best hold per weight.** Mirror the existing `byRep` map pattern: keep a
  `byWeight` map of weight → longest hold at that weight. PR toast becomes "longest
  hold at this weight". More faithful, more code, and sparse at first.
- **B — hold volume.** Single scalar, `kg × sec` (bodyweight holds use a nominal
  1 so time still ranks). One number, sorts cleanly, but conflates a heavy short
  hold with a light long one.

Default to **A** if nobody says otherwise — it matches how the rest of the app
already treats records, and B can be derived later from the same data.

---

## Data model

Exercise entry gains one field:

```js
{ leaf, legacyName, notes, mods, iso: true, sets: [...] }
```

Absent or `false` means a normal entry. Never write `iso: false` on entries that
don't need it — keep existing stored sessions untouched.

Set rows for an isometric entry:

```js
{
  w: 8,               // load in kg, 0 for bodyweight — unchanged semantics
  r: null,            // holds have no reps
  sec: 22,            // the hold, in seconds
  holdMode: 'test',   // 'planned' | 'test' | 'manual'
  target: null,       // planned mode only: the prescribed seconds
  rpe: null,          // stored as RPE, entered as RIR — unchanged
  done: true,
  setType: 'working'
}
```

`holdMode` is per set, not per entry — a planned 30 s hold followed by a hold to
failure is a normal thing to program.

---

## Change 1 — make `isTimed` entry-aware

`isTimed(leaf)` is defined around line 1044 and takes a leaf. There are 19 call
sites; almost all of them already have the entry in hand and pass `e.leaf`.

Make it accept either:

```js
function isTimed(x) {
  if (!x) return false;
  if (x.leaf) return x.iso === true || metricFor(x.leaf) === 'time';  // entry
  return metricFor(x) === 'time';                                      // bare leaf
}
```

Then change `isTimed(e.leaf)` → `isTimed(e)` at every site where the entry is
available. Grep `isTimed(` and work through all of them. Sites needing more than a
mechanical swap:

- `setLabel(s, leaf)` (~3439) only receives a leaf. Change the signature to take the
  entry, or pass an explicit `iso` flag. Check every caller.
- `historyFor` / completed-session rendering (~4165) works from a row object — make
  sure the row carries `iso` through from the stored entry.
- New-exercise creation (~6978) sets `r: isTimed(leaf) ? null : 0`. Once the user
  can toggle iso *after* adding the exercise, this needs re-deriving on toggle, not
  just at creation.

**The toggle itself:** put it on the exercise entry in the active session and in the
edit modal. Flipping it must rewrite the entry's existing sets — `r` to `null`, and
back to `0` on un-toggling — otherwise you get half-converted rows. If any set in the
entry is already `done`, warn before converting rather than silently discarding
logged reps.

## Change 2 — separate PR pool

Every PR and history lookup goes through `statsFor(exKey(e))`. The cheapest correct
separation is to make `exKey` reflect the iso flag:

```js
// exKey(e) — append a suffix so isometric work keeps its own history and records
function exKey(e) { return leafKey(e.leaf) + (e.iso ? '|iso' : ''); }
```

Confirm the exact current body of `exKey` before editing, and check no stored data
contains a literal `exKey` output (it should be computed, not persisted — verify).

**Note for context, not for this task:** `prKey(leaf, mods)` exists around line 1016
and is *never called anywhere*. The `splitsPR: true` flag on chains, bands, slingshot
and equipped is currently documented intent rather than working behaviour — those
modifiers silently share a PR pool with the raw lift. That is a real bug but it is a
separate, larger job that will change existing PR numbers. **Do not fix it as part of
this change.** Use the narrow `exKey` suffix above.

## Change 3 — weight-aware holds

Rework `bestHold(key)` per the open decision above. Guard the e1RM path: line ~3362
already returns early for timed entries ("a hold is not an e1RM") — make sure that
guard now catches iso entries too, since they'll be reaching it through a
`reps_weight` movement for the first time.

## Change 4 — the hold timer

There is currently **no audio anywhere in the app** — zero `AudioContext`, no
`new Audio`, no rest-timer sound. This is new ground. Build the audio as a small
shared helper: the cardio HR-zone session on the roadmap reuses it.

Three modes:

- **Manual** — type the seconds. The field that already exists. No timer.
- **Planned** — count in, then count *down* from the target. Completing logs
  `sec = target`; stopping early logs actual elapsed.
- **Test** — count in, then count *up* until stopped. Whatever is on the clock is
  the hold. Conceptually this is the AMRAP `setType` you already support: a set whose
  target isn't known in advance. Consider reusing it.

**Count-in:** three beeps — two short then one long, the long one marking "go".
Web Audio oscillator, roughly 800 Hz short and 1200 Hz long. No audio files, works
offline.

Four things that will bite if not built in from the start:

1. **Mobile browsers block audio until a user gesture.** The Start button must be
   what creates/resumes the `AudioContext`. Create it on tap, not on page load.
2. **The screen sleeps mid-hold.** Use the Wake Lock API while a hold timer is
   running and release it on stop. Handle the promise rejecting — it is not
   available everywhere.
3. **Backgrounding.** Do not drive the clock off `setInterval` ticks alone;
   timers throttle when the tab is hidden. Store a start timestamp and compute
   elapsed from `Date.now()` so a backgrounded hold still reads correctly.
4. **Sound and haptics need a setting.** Add a Sound toggle and a Vibration toggle
   alongside the existing settings. Default both on. Respect the OS reduced-motion /
   silent state where detectable.

**RIR on holds:** keep the RIR field for manual and planned modes. In test mode the
hold ran to failure, so RIR is 0 by definition — set it automatically and hide the
input rather than asking.

## Change 5 — migration and housekeeping

- **Bump the version** — next minor in `version.json`, and the `VERSION` / cache
  name in `sw.js`. (Main was at 0.16.2 / `ironlog-v29` when this spec was committed;
  check what's current.) The PWA will serve a stale cached shell otherwise. This is
  not optional.
- **Liftoff import** (~5251) currently does
  `notes: e.secs && !isTimed(leaf) ? \`${e.secs} s hold\` : ''` — it already detects
  hold seconds on a rep-based movement and throws them into a note. That is exactly
  the isometric case. Convert those to `iso: true` entries with `sec` populated
  instead of a note.
- Aaron has existing sets logged as "one rep plus a note" from before this feature.
  Do **not** attempt to auto-detect and migrate those from free-text notes — too
  lossy. Leave them; mention in the commit message that they stay as-is.

---

## Do not touch

- **RIR/RPE storage.** RIR is the display and input layer only; RPE remains what is
  stored and what all effort maths consumes, via `rirToRpe` / `rpeToRir`. Do not
  "simplify" this by storing RIR.
- **The CSV import RPE column.** It maps an external format and must stay.
- **`prKey` / `splitsPR`.** See Change 2.
- **The exercise leaf model.** No new axis, no duplicate movements.

---

## Verification before commit

Syntax-check the embedded scripts — the app is one large HTML file and a template
literal typo will white-screen it:

```bash
node -e "
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .forEach((m,i)=>{try{new Function(m[1]);console.log(i,'OK')}catch(e){console.log(i,'ERR',e.message)}});
"
```

Then check by hand:

- A normal rep-based exercise is completely unchanged — table, history, PRs, e1RM.
- Toggling iso on a lateral raise switches the table to a duration column and back
  without corrupting logged sets.
- A loaded hold and a rep set of the same lift show as separate records, and neither
  appears in the other's history.
- An isometric entry produces no e1RM anywhere.
- Count-in fires on first tap from a cold load, on a real phone, not just desktop.
- Screen stays awake through a 60 s planned hold.
- A hold timed with the app backgrounded for 20 s still reads correctly on return.
- Existing completed sessions from before the change still open and render.

Commit as one change with a message describing the per-entry flag and the PR
separation, and note that pre-existing "1 rep + note" holds are deliberately not
migrated.
