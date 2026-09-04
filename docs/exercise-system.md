# Ironlog — Exercise & Program System

Specification for replacing flat exercise-name strings with a composed
exercise model, and absolute-dated programs with relative ones.

Companion file: `docs/exercises.json` (104 movements).
Prior context: `docs/audit-2026-09-03.md`.

---

## 0. Decisions — RESOLVED

All settled. Do not revisit; implement as stated.

| # | Decision | Ruling |
|---|---|---|
| D1 | Machine Chest Press / Flat DB Press | **Merge** into Bench Press as equipment variants |
| D2 | Rope vs straight-bar pushdown | **Add attachment as a fourth axis** (§1a) |
| D3 | Cable Lateral Raise | **Unilateral**, single arm |
| D4 | Smith load | **Plates + bar**, as normally racked |
| D5 | Leg Curl seated vs lying | **Do not split** for now |
| D6 | Additional equipment | **Add** safety squat bar and belt squat |
| D7 | Cardio metric | **Time only** for now; no distance |

### Notes on D6 — equipment vs modifier

Only *bar types* are equipment. Chains, bands, boards and slingshot are
**`splitsPR: true` modifiers** (§3), not equipment — a squat with chains
is still a barbell squat. Adding them as equipment would double-count
against the modifier system.

### Note on D4

Since load includes the bar, the app needs a per-equipment bar weight so
the assumption is explicit rather than implied. Smith carriages vary
(7–25 kg) and differ from a 20 kg barbell. Record the figure in settings
and surface it in the plate calculator when that lands.

---

## 1. Exercise identity

An exercise is **movement + equipment + execution**. Together these form a
**leaf**. The leaf is the unit of comparison: PRs, history and statistics
all key on it.

```
Calf Raise (standing)  /  smith     /  bilateral
Bench Press            /  barbell   /  bilateral
Lateral Raise          /  cable     /  unilateral
```

### Movement record

Defined in `docs/exercises.json`:

```json
{
  "id": "calf-raise-standing",
  "name": "Calf Raise (standing)",
  "category": "legs",
  "type": "strength",
  "equipment": ["smith", "machine", "barbell", "bodyweight", ...],
  "defaultEquipment": "smith",
  "execution": ["bilateral", "unilateral"],
  "defaultExecution": "bilateral",
  "primary": ["gastrocnemius"],
  "secondary": ["soleus"],
  "aliases": ["Smith Calf Raise", "Standing Calf Raise", ...],
  "verified": true,
  "metric": "reps_weight"
}
```

- `id` is stable and permanent. Never derived from the display name.
  Renaming a movement must not change its id.
- `equipment` is the allowed list. Anything outside it is invalid for
  this movement.
- `aliases` are historical and colloquial names. Used for import
  resolution only, never for identity.
- `verified: false` means the entry was generated rather than confirmed
  against Aaron's own logs. Treat as provisional.
- `metric` defaults to `reps_weight`. Other values: `time`, `distance`,
  `time_distance`. See §6.

**Alias uniqueness is a hard constraint.** No alias may appear on two
movements, case-insensitively. Enforce this at load time and fail loudly
— a duplicate makes import resolution non-deterministic.

### Leaf identity on a set

A logged set references the leaf, not a name:

```json
{ "mv": "calf-raise-standing", "eq": "smith", "ex": "bilateral",
  "w": 225, "r": 8, "rpe": 8, "warm": false }
```

The old `name` string is dropped from new records. Migration keeps it in
a `legacyName` field on migrated sets for one release so mismatches can
be audited, then it is removed.

## 1a. Attachment (fourth axis)

Per D2, leaf identity is **movement + equipment + execution +
attachment**.

- `attachment` is **nullable**, and valid only where the movement
  declares an `attachments` list (29 movements — all cable or
  ankle-strap based). For everything else it is `null` and must not be
  shown in the UI.
- Attachment is part of identity, not a modifier: a rope pushdown and a
  straight-bar pushdown are different leaves with separate PRs. That is
  the point of D2.
- Vocabulary: `rope`, `straight_bar`, `ez_bar`, `v_handle`, `wide_bar`,
  `lat_bar`, `single_handle`, `ankle_strap`, `dual_handle`, `none`.

A set therefore reads:

```json
{ "mv": "triceps-pushdown", "eq": "cable", "ex": "bilateral",
  "att": "rope", "w": 38, "r": 10, "rpe": 8, "type": "standard" }
```

Where a movement declares attachments but the user hasn't chosen one,
`att` is `null` and the set is still valid — it forms its own leaf.
Migration will produce many of these; that is expected, not an error.

### Equipment validity in the UI

When choosing equipment for a movement, invalid options are shown
**greyed and unselectable, not hidden**. The user should be able to see
that the constraint exists.

---

## 2. Execution and load convention

Three values:

| Execution | Meaning |
|---|---|
| `bilateral` | Both limbs together |
| `alternating` | Limbs alternate within the set |
| `unilateral` | All reps one side, then the other |

### Load convention — CORRECTED

An earlier draft of this spec derived load convention from execution
alone. **That is wrong** and would have corrupted every dumbbell record.
A bilateral dumbbell bench with two 40 kg dumbbells is logged as 40, not
80 — the convention is per-hand even though the execution is bilateral.

The correct rule, in order:

1. If execution is `unilateral` or `alternating` → **per side**
2. Else if equipment is `dumbbells` or `kettlebell`, and the movement
   does **not** carry `singleImplement: true` → **per side** (one
   implement per hand)
3. Else → **total**

`singleImplement: true` marks movements where both hands share one
implement — goblet squat, dumbbell pullover, Russian twist, weighted
sit-up, and similar. Those are total.

The resolved convention must be displayed wherever a weight is entered
or shown, so 20 kg is never ambiguous between 20 and 40.

Also note `executionDefaults`: a movement may set a different default
execution per equipment. Lateral Raise uses this — unilateral on cable
(D3), bilateral on dumbbells.

Volume calculations must account for this: a per-side set of 20 kg × 10
is 400 kg of volume, not 200.

---

## 3. Modifiers

Modifiers annotate a set without necessarily changing its identity. Each
modifier carries a `splitsPR` flag.

### `splitsPR: false` — annotation only

Same leaf, same PR pool. Recorded and displayed, but does not fragment
history.

Seed vocabulary, taken from Aaron's existing program notes:
`comp pause`, `slow eccentric`, `2s pause at stretch`, `IPF depth`,
`comp stance`, `full commands`, `heavy single`, `opener`,
`stop 1 shy`, `technique`.

### `splitsPR: true` — its own leaf

Materially different lift. Must never share a PR pool with the
unmodified version.

Seed vocabulary: `deficit`, `block/rack pull`, `board press`, `chains`,
`bands`, `slingshot`, `equipped` (shirt/suit).

**This distinction is the load-bearing part.** A paused bench belongs in
the same PR pool as a competition bench; a shirted bench does not. If
`splitsPR` is not implemented before modifiers ship, PRs become
unreliable.

### UI

Quick-tap chips on the logging screen, pre-populated with the seed
vocabulary above, plus free-text entry for anything not listed. A
`splitsPR: true` modifier must be visually distinct — it changes what
the set counts as.

---

## 4. Personal records

Rules, in priority order:

1. **PRs are computed from history at read time.** Nothing stores a PR
   as truth. (Batch 1 established this; do not regress it.)
2. **PRs key on the leaf**, plus any `splitsPR: true` modifiers.
3. **A parent movement page rolls up its leaves but stores nothing.**
   The tree is presentation.
4. **The headline figure on a parent page is the primary variant's, or
   nothing at all.** Never the maximum across variants — a machine chest
   press outranking a competition bench is nonsense.
5. **Graphs show one line per variant.** Never merged, never averaged
   across variants. Overlaid is useful; aggregated is a lie.
6. `first: true` ("first time logged") is not a PR. It may appear in the
   session summary as its own thing, but not in PR chips or counters.

---

## 5. Set types

Replace the current boolean `warm` flag with an enum:

`standard` | `warmup` | `amrap` | `dropset` | `failure` | `myoreps`

**Critical:** Aaron's program stores AMRAP sets as `r: 0` — 346 of them.
Batch 1 introduced the rule "a set is valid when reps > 0". These two
are in conflict.

Required fix: AMRAP becomes a set *type* with reps unset, not reps zero.
Migration must convert every `r: 0` set carrying an AMRAP note to
`type: "amrap"` with `r: null`, and any prescribed set that is genuinely
zero-rep must be identified separately. **Verify current behaviour before
migrating — the batch-1 rule may already have invalidated these.**

Zero *weight* remains valid (pull-ups, dips, planks). Zero or absent
*reps* is only valid for `amrap` and non-`reps_weight` metrics.

---

## 6. Metrics

Not every exercise is reps × weight.

Per D7, two metrics ship:

| Metric | Fields | Examples |
|---|---|---|
| `reps_weight` | reps, weight | default, 94 entries |
| `time` | duration | plank, dead hang, all cardio, carries |

Ten catalogue entries carry `metric: "time"`. `distance` and
`time_distance` are **not** implemented in this work — sled push and
farmers carry are logged by time for now, which is legitimate, and
distance can be added later without a migration.

The logging screen must render the correct fields per metric. A
`time` exercise has no reps or weight input.

---

## 7. Program format

### Relative dates

Programs currently carry absolute dates (2026-07-13 → 2027-12-20). This
cannot work for anyone else and breaks if Aaron's own start slips.

Replace with `week` + `day` + a user-supplied `startDate` at install
time. All display dates are computed, never stored.

### Stable session IDs

Current: `'<programId>#<index>'`, derived from array position. This
breaks when a program is edited or regenerated in a different order, and
prevents two devices converging on the same program.

Replace with an id derived from stable content: program id + week + day
+ slot.

### Exercise references

Program sessions reference **leaf identity** (`mv` + `eq` + `ex`), not
name strings — same shape as logged sets.

### Prescription types

A prescribed set may specify load as: absolute weight, `%1RM`, `RPE`, or
bodyweight. Aaron's current program is absolute throughout, which is the
other reason it can't survive a start-date change.

Prescriptions also carry: sets, reps (or rep range), rest, and notes.

### Priority lifts

`installProgram` currently overwrites `settings.priority` unconditionally.
A program may *declare* suggested priority lifts; installing must offer
them, not impose them. Priority lifts reference a specific leaf — Aaron's
IPF squat is Back Squat / barbell / bilateral, not "best squat variant".

### Rest times

Rest belongs to the prescribed exercise, not the session. Two minutes on
squats is not ninety seconds on face pulls.

### Events

A program may declare events (meets). If so, the Meets → Events
generalisation must land alongside this work, not after: `FIELDS`,
`liftName`, `shortLift` and the three hard-coded lift keys all need
de-hard-coding first.

### Bundled program

Remove auto-install entirely. The bundled program becomes an explicit
opt-in that persists as a choice, never installed on first boot. Extract
it from `index.html` into `program.json` (343 KB, 51% of the file).

---

## 8. Migration

Inputs: 327 logged sessions, the Liftoff CSV import, and the bundled
program (40 distinct exercise names).

**Dry-run mode is mandatory and must run first.** It reports what would
change without changing anything.

Resolution order for each historical exercise name:
1. Exact match on a movement `name`
2. Exact match on an `alias` (case-insensitive)
3. No match → **orphan**

**Orphans are never guessed at.** They are listed for manual resolution.
Fuzzy matching is what produced B3; do not reintroduce it.

The dry-run report must include:
- every orphan, with occurrence count
- every set whose PR status changes as a result of migration, before and
  after
- every set affected by the AMRAP `r: 0` issue (§5)
- total sets migrated vs total sets in source (these must match)

Migrated sets keep `legacyName` for one release.

---

## 9. What does not change

- Storage stays IndexedDB, single blob. **Not** localStorage — the audit
  corrected this.
- Architecture stays: one global `S`, string-template renders, `wire()`
  rebinding. This is not a rewrite.
- Weights in kg throughout.
- `parse-food.js` is unreferenced and unreachable but **must not be
  deleted** — it is the parser contract for the future server-side move.

## 10. Out of scope

Do not build, even if it seems adjacent: muscle diagrams, per-exercise
artwork or icons, calorie estimates for lifting sessions, AI routine
generation, the first-run screen (deferred by choice), cloud sync, the
paid tier.

---

## 11. Build order

Each phase ends in a PR against `main`. Do not merge; do not begin the
next phase without a go-ahead.

**Phase 1 — spec.** Resolve D1–D7 into concrete proposals with
reasoning. Produce final record shapes. No code.

**Phase 2 — data layer.** Implement identity, execution, modifiers, set
types. Migration with dry-run. Program extracted to `program.json`,
auto-install removed. No UI changes.

**Phase 3 — exercise page.** Info / Statistics / History tabs. Per-variant
stats and graphs per §4. Variant strip along the bottom.

**Phase 4 — logging screen.** Equipment and execution chips with the
greyed-invalid picker. Modifier quick-tap chips. Equipment icon row on
exercise list items.

Bump `APP_VERSION` and `sw.js` `VERSION` on any phase that ships.

If a phase turns out larger than described, or needs a decision not
listed in §0, stop and report rather than improvising.
