# Ironlog — Exercise System, Phase 1: decisions and record shapes

**Status:** Phase 1 deliverable. Review only — no application code changed.
**Branch:** `exercise-overhaul` · **Base:** `main` @ `5e8fd97` (v0.6.3)
**Inputs:** [`exercise-system.md`](exercise-system.md) · [`exercises.json`](exercises.json) · [`audit-2026-09-03.md`](audit-2026-09-03.md)

Per §11, Phase 1 resolves D1–D7 into concrete proposals with reasoning and
produces the final record shapes. No code. Phase 2 does not begin without a
go-ahead.

Every number below is reproducible — see [Appendix B](#appendix-b--evidence).

---

## 1. Changelog against `exercise-system.md`

The spec is committed here with these corrections applied in place.

| § | Said | Verified truth |
|---|---|---|
| 5 | "stores AMRAP sets as `r: 0` — **346** of them" | **143** zero-rep sets. 355 entries mention AMRAP in notes; 243 of those store a real rep count and have no defect; 112 store it as `r: 0`. |
| 5 | one AMRAP defect, one migration | **Two defects.** 100 Smith Calf Raise zeros are the *last* set of their entry (real AMRAP). 43 Machine Chest Press zeros sit in 12 entries where *every* set is zero — bad PDF extraction, not AMRAP. Converting both would fabricate 43 AMRAP sets. |
| 1a | attachments are "29 movements — all cable or ankle-strap based" | 29 is right, the reason is wrong. Several are also barbell/dumbbell movements (`biceps-curl`, `hammer-curl`). Attachment must be scoped **by equipment**, else `DB Hammer Curl` resolves to a dumbbell curl holding a rope. |
| 3 | `splitsPR: true` seeds "taken from Aaron's program notes" | True of the ten `splitsPR: false` seeds — all verified present. **None** of the `splitsPR: true` seeds appears anywhere in the program. |
| 3 | `deficit`, `block/rack pull`, `board press` are modifiers | They collide with movement ids. `rack-pull`, `box-squat`, `pin-press` already exist as movements. Removed from the modifier list; see §8.1. |
| 2 | load convention (spec text correct) | The **catalogue** contradicted it — `vocabularies.load` still encoded the flat `bilateral → total` rule §2 says would "corrupt every dumbbell record". Catalogue fixed (E4). |
| 1 | "104 movements" | Correct for the current `exercises.json`. An earlier 32-movement draft is superseded and not committed. |

Two further corrections to the **catalogue**, found while validating:

- `vocabularies.metric` contained `"reps_weight (default)"` — a parenthetical
  baked into an enum value, so `m.metric === "reps_weight"` fails against the
  vocabulary. Fixed (E3).
- 29 movements declared `attachments` but no `defaultAttachment`, so a bare
  alias could not complete a leaf. Added (E9).

---

## 2. Scope

**In:** the decisions, the record shapes, and a corrected `exercises.json`.

**Out, and the phase each belongs to:** migration code, `program.json`
extraction, removing auto-install (Phase 2); the exercise page and per-variant
graphs (Phase 3); equipment/execution chips and the logging screen (Phase 4).
The Meets → Events generalisation is a **Phase 2 dependency** (§7) and is named
here, not started. §10's exclusions stand.

**No `APP_VERSION` / `sw.js` bump.** §11 says bump "on any phase that ships";
this phase ships documentation, changes no behaviour and needs no cache
invalidation. Flagged as a deliberate reading.

---

## 3. The identity model

An exercise is a **leaf**: movement + equipment + execution + attachment. The
leaf is the unit of comparison — PRs, history and statistics all key on it.

```
leafKey = movement "/" equipment "/" execution "/" attachment
        → "triceps-pushdown/cable/bilateral/rope"

prKey   = leafKey [ "#" sorted(splitting modifiers) ]
        → "deadlift/barbell/bilateral/none#chains"
```

The serialisation is normative. `prKey` is a persisted grouping key in exports;
an implementation that sorts modifiers differently silently splits a PR
history.

### 3.1 Why aliases had to change — the finding that shaped this phase

The catalogue resolved a name to a **movement**, not a leaf, because `aliases`
was `string[]`. Seven movements absorb sixteen program names, so **489 of 1400
program entries (34.9%)** resolved with equipment and attachment unknown:

| Movement | Names absorbed | Entries |
|---|---|---|
| `bench-press` | Bench Press · Machine Chest Press · Flat DB Press | 114 |
| `lateral-raise` | Cable Lat Raise · DB Lat Raise | 106 |
| `overhead-press` | Strict Press · Smith Shoulder Press | 61 |
| `shrug` | Barbell Shrug · Smith Shrug | 58 |
| `deadlift` | Deadlift · Hex Deadlift | 56 |
| `triceps-pushdown` | Rope Pushdown · Tricep Bar Pushdown | 54 |
| `hammer-curl` | DB Hammer Curl · Cable Hammer Curl | 40 |

§8 forbids fuzzy matching — it is what produced B3 — so guessing the missing
axes is not available. **Leaf-bearing aliases are the only legal way to close
this**, and they are the single most important catalogue change (E8). An alias
now pins the axes its own name states and inherits the rest:

```jsonc
{ "name": "Rope Pushdown",       "equipment": "cable", "attachment": "rope" }
{ "name": "Tricep Bar Pushdown", "equipment": "cable", "attachment": "straight_bar" }
```

After E8: **zero orphans and zero leaf-ambiguous entries** across all 1400.
Full mapping in [Appendix A](#appendix-a--the-40-name-resolution-table).

### 3.2 Attachment is scoped by equipment

Attachment is not a property of the movement alone. `hammer-curl` declares
`["rope","single_handle"]` and supports dumbbells — so a naive default gives
"a dumbbell hammer curl with a rope". The catalogue now carries:

```jsonc
"attachmentApplies": { "cable": "any", "barbell": "bar", "_default": "none" }
```

`any` = every attachment the movement lists; `bar` = only those whose
`attachmentKind` is `bar` (a real weighted bar — `straight_bar`, `ez_bar`);
`none` = the axis collapses to `"none"`. This is why attachment is the fourth
axis of the **leaf** and not a field on the movement.

### 3.3 The movement/modifier boundary

Proposed governing rule, **for ratification** (§8.1):

> A **ROM or setup variant with a name of its own is a movement.**
> **Accommodating resistance and supportive gear are modifiers.**

Under it: `rack-pull`, `box-squat`, `pin-press`, `deficit-deadlift` are
movements; `chains`, `bands`, `slingshot`, `equipped` are modifiers.

---

## 4. D1–D7 — rulings and reasoning

Each ruling is §0's; the reasoning, cost and consequences are this phase's.

### D1 — Machine Chest Press / Flat DB Press → merge into Bench Press

**Ruling (§0):** merge as equipment variants.

**Reasoning.** This is the compression the model exists for. The three names are
one movement pattern performed with three implements, and PRs stay separate
because each is its own leaf. It converts 114 entries (8% of the program) from
three unrelated name-strings into one movement with three comparable variants,
which is what makes a parent exercise page possible at all.

**Cost.** A seated machine press is arguably a different pattern from a flat
barbell bench. The merge is reversible — split the movement and re-point the
aliases — but only before Phase 2 migrates history.

**Forecloses.** Nothing. §4.4 already forbids a machine press outranking a
competition bench: the parent headline is the primary variant's or nothing.

### D2 — Rope vs straight-bar pushdown → attachment as a fourth axis

**Ruling (§0):** add attachment as a fourth axis.

**Reasoning.** You log them at materially different loads (rope 34–38 kg, bar
32–40 kg) across 54 entries. Merging loses that; splitting into two movements
would duplicate every other axis. An axis is the only option that keeps one
movement and separate PRs — which is the entire point of D2.

**Cost.** A fourth axis on every leaf, and a UI that must hide it for the 75
movements that take none. Scoped by equipment per §3.2.

### D3 — Cable Lateral Raise → unilateral

**Ruling (§0):** unilateral, single arm.

**Reasoning.** Encoded as `executionDefaults: { "cable": "unilateral" }`, not as
the movement default — a dumbbell lateral raise stays bilateral. This flips the
cable variant to **per-side** load, which is what finally makes your cable
numbers (10–11.3 kg) and dumbbell numbers (12.5 kg) comparable. 71 entries.

**Note.** No stored weight changes. The number means per-hand where it always
did; the app now says so.

### D4 — Smith load → plates + bar, as normally racked

**Ruling (§0):** the logged number includes the carriage.

**Reasoning.** Requires a per-equipment bar weight in settings so the
assumption is explicit rather than implied — Smith carriages vary 7–25 kg and
differ from a 20 kg barbell. Keyed on **(equipment, attachment)**, because
`ez_bar` is 7.5 kg of steel on a barbell leaf and a weightless handle on a
cable leaf.

**Open — see §8.5.** The carriage weight is a physical fact about your gym that
the app cannot know, and it is unknown whether your 113 historical Smith Calf
Raise sets were logged plates-only. Migration **must not** retro-add anything:
the number's meaning changes, its value never does.

### D5 — Leg curl seated vs lying → do not split

**Ruling (§0):** do not split for now.

**Reasoning.** 78 entries, and nothing in the corpus distinguishes them — the
program says only "Leg Curl". Splitting now would mean guessing, and §8 forbids
guessing. Deferring costs nothing that a later split cannot recover, because a
split is additive: a new movement plus re-pointed aliases.

**Cost, stated plainly.** Until then the leg curl PR spans two strength curves
and is weaker evidence than it appears. Recorded in §8.4.

### D6 — Additional equipment → safety squat bar, belt squat

**Ruling (§0):** add both. Present in the vocabulary (13 entries).

**Reasoning.** Only *bar types* are equipment. Chains, bands, boards and
slingshot are `splitsPR: true` **modifiers** — a squat with chains is still a
barbell squat, and making them equipment would double-count against the
modifier system.

### D7 — Cardio metric → time only

**Ruling (§0):** time only; no distance.

**Reasoning.** Two metrics ship: `reps_weight` (94 movements, default) and
`time` (10). `distance` and `time_distance` stay in the vocabulary but
unimplemented. Sled push and farmers carry are logged by time, which is
legitimate, and distance can be added later without a migration because it is
a new metric value, not a change to an existing one.

---

## 5. Record shapes

Normative. `?` marks optional; **omit optional fields rather than writing
`null`** — 4409 sets live in one JSON blob written on a 400 ms debounce.

### 5.1 Leaf

```jsonc
{
  "movement":   "triceps-pushdown",  // → movements[].id
  "equipment":  "cable",             // → vocabularies.equipment
  "execution":  "bilateral",         // → vocabularies.execution
  "attachment": "rope"               // "none" where the equipment takes none (§3.2)
}
```

Stored as four components, never as a pre-serialised string — the key is needed
transiently for grouping, and storing it too creates a second source of truth
that drifts when the catalogue is edited.

### 5.2 Movement (catalogue)

```jsonc
{
  "id": "triceps-pushdown",          // stable, permanent, never derived from the name
  "name": "Triceps Pushdown",
  "category": "arms",
  "type": "strength",
  "metric": "reps_weight",           // ? omitted = reps_weight
  "equipment": ["cable", "machine", "resistance_band"],
  "defaultEquipment": "cable",
  "execution": ["bilateral", "unilateral"],
  "defaultExecution": "bilateral",
  "executionDefaults": { "cable": "unilateral" },   // ? per-equipment override (D3)
  "attachments": ["rope", "straight_bar", "ez_bar", "v_handle", "single_handle"],
  "defaultAttachment": "rope",       // required wherever attachments exists (E9)
  "singleImplement": false,          // ? true = both hands share one implement
  "loadOverride": null,              // ? "total" | "per_side" escape hatch
  "primary": ["triceps"],
  "secondary": [],
  "aliases": [                       // leaf-bearing (E8); import resolution only
    { "name": "Rope Pushdown", "equipment": "cable", "attachment": "rope" },
    { "name": "Pushdown" }
  ],
  "verified": true                   // leaf mapping checked against real logged data
}
```

`aliases` are never identity. **Alias uniqueness is a hard constraint** — no
alias may appear on two movements case-insensitively; enforced at load time,
failing loudly.

### 5.3 Logged set

```jsonc
{
  "w": 34,               // kg. The weight ON THE IMPLEMENT, per the load convention
                         // for this leaf. On a per_side leaf this is one dumbbell.
  "r": 12,               // number | null. NULL IS NEW: "not recorded". This frees 0
                         // to mean a genuine zero-rep set (a missed single).
  "rpe": 8.5,            // ? number | null
  "done": true,
  "setType": "working",  // replaces the `warm` boolean
  "leaf": null,          // ? per-set override; absent = inherit the entry
  "mods": null,          // ? absent = inherit the entry
  "needsReview": false   // ? set by migration where the source was ambiguous
}
```

`setType` — four values, each earning its place through distinct downstream
behaviour:

| Value | Counts to volume | PR-eligible | Migrated from |
|---|---|---|---|
| `warmup` | no | no | `warm: true` |
| `working` | yes | yes | `warm: false` |
| `amrap` | yes | yes | last-set `r: 0` + AMRAP note (§8.3) |
| `drop` | yes | **no** — fatigued e1RM | nothing; new logging only |

§5's `failure` and `myoreps` are **rejected**: `failure` is RPE 10, and neither
carries behaviour the other four lack. An enum value with no distinct behaviour
is a taxonomy, not a model. `dropset` is renamed `drop` for consistency.

Zero **weight** stays valid (pull-ups, dips, planks). Absent **reps** is valid
only for `amrap` and non-`reps_weight` metrics.

### 5.4 Exercise entry

```jsonc
{
  "leaf": { "movement": "triceps-pushdown", "equipment": "cable",
            "execution": "bilateral", "attachment": "rope" },
  "legacyName": "Rope Pushdown",   // the string the user actually had
  "mods": ["comp_pause"],          // ? modifier ids
  "notes": "comp pause · last set AMRAP (stop 1 shy)",
  "restSec": null,                 // ? null = fall back to settings.restDefault
  "sets": [ /* 5.3 */ ]
}
```

`name` is gone. Display text is **derived** from the leaf, never stored — a
stored display string is a third source of truth and the thing that rots.

`notes` is kept **verbatim**. Modifiers are *extracted* from notes; notes are
never rewritten. Never destroy prose.

**`legacyName` lives on the entry, not the set.** That is where `name` lived,
the migration source string is per-entry, and stamping ~20 characters onto all
4409 sets is blob growth for no recoverable information. §1 says it may be
removed after one release; keeping it permanently is cheap and lets an old
export re-resolve after a catalogue edit — recommended, ruling optional.

### 5.5 Workout and state root

Only `exercises[]` changes shape. `block` is kept: written-never-read today, it
becomes the phase label under the program model, and renaming it costs a
migration for nothing.

```jsonc
{ "schemaVersion": 2, "settings": { }, "workouts": [ ], "goals": [ ] }
```

`schemaVersion` goes at the **state root**; absent ⇒ 1. Migrations are an
ordered, idempotent chain keyed on version, run in `load()`
(`index.html:566-586`) where the existing `backfilled` → `source` shim already
lives — so the pattern exists, it is merely unversioned. **The same chain must
run for Settings → Import**, which today has no migration hook at all: an old
export re-imported after Phase 2 would land raw name strings in a leaf-shaped
field. The storage key `ironlog.v1` stays as it is; the version belongs in the
payload, so a partial rollout cannot orphan a blob.

### 5.6 Program, session, prescription

```jsonc
{
  "id": "hunchback-hercules-pplul-77",
  "schemaVersion": 2,
  "weeks": 77,
  "anchor": { "mode": "startDate", "defaultStart": "2026-07-13", "weekStartsOn": "monday" },
  "priority": [ /* slot-bound leaf refs, 5.7 */ ],
  "meets": [ { "name": "West Midlands Spring", "date": "2027-04-10" } ],
  "sessions": [{
    "uid": "a3f19c2b",     // sha1(programId | week | day | slug(name)), 8 hex
    "week": 1, "day": 1,   // 1-based, relative
    "name": "Wk 1 · Push",
    "block": "A - COMP",
    "exercises": [{
      "leaf": { },
      "legacyName": "Bench Press",
      "notes": "comp pause · last set AMRAP (stop 1 shy)",
      "mods": ["comp_pause"],
      "restSec": 210,      // rest belongs to the exercise, not the session
      "sets": [{
        "setType": "working",
        "load": { "type": "absolute", "kg": 82.5 },
        //     | { "type": "pct1rm", "pct": 82.5, "of": { /* leaf */ }, "source": "tested" }
        //     | { "type": "rpe", "rpe": 8, "repsCap": 5 }
        //     | { "type": "bodyweight", "addedKg": 0 }
        "reps": { "type": "fixed", "n": 5 },
        //     | { "type": "range", "min": 8, "max": 12 }
        //     | { "type": "amrap", "min": 3, "stopShyOf": 1 }
        "restSec": null
      }]
    }]
  }]
}
```

Three points worth stating:

- **Meets keep absolute dates.** A federation fixes them; they are not relative
  to your start. Only sessions slide. This is the clean resolution of the
  relative/absolute tension.
- **Session `uid` derives from position + identity, not full content**, so
  editing a weight does not orphan an installed session. Today's
  `` `${P.id}#${i}` `` renumbers every later session when one is inserted, and
  `installProgram`'s `existing.has(id)` check then silently mismatches.
- **`reps.type: "amrap"` is the payoff.** 355 entries currently encode AMRAP as
  English prose, and 112 lose the number entirely.

### 5.7 Settings additions

```jsonc
{
  "priority": [
    { "slot": "squat",    "leaf": { "movement": "back-squat",  "equipment": "barbell", "execution": "bilateral", "attachment": "none" } },
    { "slot": "bench",    "leaf": { "movement": "bench-press", "equipment": "barbell", "execution": "bilateral", "attachment": "none" } },
    { "slot": "deadlift", "leaf": { "movement": "deadlift",    "equipment": "barbell", "execution": "bilateral", "attachment": "none" } }
  ],
  "barWeights": {
    "barbell":  { "_default": 20, "ez_bar": 7.5 },
    "smith":    { "_default": null },   // null = not recorded; prompt, never assume (D4)
    "trap_bar": { "_default": 25 },
    "safety_squat_bar": { "_default": 25 },
    "belt_squat": { "_default": 0 },
    "cable": { "_default": 0 }, "machine": { "_default": 0 }
  },
  "barKg": 20,                          // deprecated, retained as migration source
  "bars": [{ "name": "Barbell", "kg": 20 }],  // deprecated, retained
  "prCountEst": true                    // read at index.html:1041, absent from DEFAULT_STATE
}
```

**Priority lifts become slot-bound leaf refs.** IPF has exactly three lifts —
that is a rule of the sport, not a modelling accident. What is broken is the
*derivation*: `liftName` maps a key to `priority[i]` **positionally**
(`index.html:3252`) and `shortLift` **sniffs substrings** of a display string
(`index.html:3285`), so "Bulgarian Split Squat" collapses to "Squat". Slots
kill both. Per §7, installing a program **offers** its priority lifts; it must
not impose them — `installProgram` overwrites them unconditionally today
(`index.html:3567`).

`barWeights` is display and warm-up arithmetic only. **It never alters a stored
`w`.**

### 5.8 Modifier

```jsonc
{
  "id": "chains", "label": "Chains", "splitsPR": true,
  "detect": ["chains", "chain"],   // literal, case-insensitive, whole-word. Never fuzzy.
  "evidence": { "programEntries": 0 }
}
```

`evidence` records provenance so an unexercised modifier is visibly
unexercised. Ten `splitsPR: false` modifiers carry real counts; all four
`splitsPR: true` are at zero.

### 5.9 Migration dry-run report

Machine-checkable JSON with a Markdown rendering. **The report's job is to
assert the migration is number-preserving.**

```jsonc
{
  "report": "migration-dry-run", "schemaFrom": 1, "schemaTo": 2,
  "catalogue": { "movements": 104, "sha256": "…" },
  "corpus": [ { "site": "workouts[].exercises[].name", "entries": 1400, "distinctNames": 40 } ],
  "resolution": [ { "legacyName": "Rope Pushdown", "entries": 21, "sets": 56,
                    "method": "alias-exact", "leafKey": "triceps-pushdown/cable/bilateral/rope",
                    "axesFromDefaults": ["execution"] } ],
  "orphans": [], "ambiguous": [],
  "zeroReps": { "total": 143, "toAmrap": 100, "toNeedsReview": 43, "entriesFullyZero": 12 },
  "loadConvention": [ { "leafKey": "lateral-raise/cable/unilateral/single_handle",
                        "was": "total", "now": "per_side",
                        "setsReinterpreted": 177, "storedWeightsChanged": 0 } ],
  "invariants": { "workouts": {"before":327,"after":327}, "entries": {"before":1400,"after":1400},
                  "sets": {"before":4409,"after":4409}, "sumW": {}, "sumR": {} },
  "refusals": []
}
```

**Migration operates on identity only. It never changes a number.**

**Refusal conditions** — any one aborts the whole migration, writes the report
and changes nothing:

1. any orphan;
2. any name matching two movements;
3. any leaf axis outside the vocabularies;
4. any case-insensitive alias collision;
5. a movement with `attachments` but no `defaultAttachment`;
6. any invariant mismatch;
7. **any stored `w` / `r` / `rpe` changed.**

Resolution order is §8's, unchanged: exact `name`, then exact `alias`
(case-insensitive), else **orphan**. Orphans are listed for manual resolution
and never guessed at.

### 5.10 The six identity sites

A migration scoped only to `workouts[]` silently breaks two of these:

| Site | Today | Notes |
|---|---|---|
| `workouts[].exercises[].name` | string | 1400 entries |
| `active.exercises[].name` | string | a live session must survive migration |
| `settings.priority[]` | 3 strings | → slot-bound leaf refs (§5.7) |
| `goals[].exercise` | string | read at `index.html:1534`, rendered as a name `<select>` at 1630 |
| `customEx[]` | strings | user-created names with no catalogue entry |
| `exAliases{}` | string → string | the Liftoff import map; orphaned if ignored |

---

## 6. Catalogue changes

Applied to `exercises.json`; all verified (§9).

| # | Edit | Serves |
|---|---|---|
| E1 | `schemaVersion` 1 → 2 | versioning |
| E2 | Rewrite `note` — it claimed `review:true` entries need a ruling, false after E10 | housekeeping |
| E3 | `vocabularies.metric`: `"reps_weight (default)"` → `"reps_weight"` | §6 |
| E4 | Replace `vocabularies.load` with §2's ordered rule | §2 |
| E5 | Add `vocabularies.setType` | §5 |
| E6 | Add `vocabularies.modifier` — 14 records with `splitsPR`, whole-word `detect`, `evidence` counts | §3 |
| E7 | Add `attachmentKind` + `attachmentApplies` (§3.2) | §1a, D4 |
| E8 | **Leaf-bearing aliases** — 260 converted, 35 pinning equipment, 3 attachment, 3 execution | §1, §8 |
| E9 | `defaultAttachment` on all 29 attachment-bearing movements | §1a |
| E10 | Clear `review`/`reviewNote` from 5 movements; rulings recorded in §4 | §0 |

E10 note: `calf-raise-standing`'s review note was already stale — it asked for
a seated entry, and `calf-raise-seated` exists in the catalogue.

---

## 7. Acceptance criteria for Phase 2

A Phase 2 build matches this spec when:

1. Dry-run reports **0 orphans and 0 leaf-ambiguous entries** across all six
   identity sites.
2. Every invariant holds: workouts 327, entries 1400, sets 4409, `sumW` and
   `sumR` unchanged.
3. `git diff` of stored `w`/`r`/`rpe` across the migration is **empty**.
4. Re-running the migration is a no-op (idempotent).
5. A pre-migration export re-imported post-migration produces identical state.
6. The 100 last-set zeros become `setType: "amrap"` with `r: null`; the 43
   Machine Chest Press zeros are `needsReview` and **not** converted.
7. `prsFor` still derives at read time (§4.1) — batch 1's rule is not
   regressed — and now keys on `prKey`.
8. Alias uniqueness is enforced at load time and fails loudly.
9. `parse-food.js` still present (§9).

---

## 8. Stop and report

§11: *"If a phase turns out larger than described, or needs a decision not
listed in §0, stop and report rather than improvising."* These six need a
ruling. Nothing here is decided.

**8.1 — Movement vs modifier boundary.** `rack-pull`, `box-squat` and
`pin-press` are movements in the catalogue; §3 listed `block/rack pull` and
`board press` as modifiers. Both cannot be identity. `pin-press` is
`verified: true` and backs "Bench Pin Press" (6 entries), so it must stay a
movement — which makes `deficit` (no movement id) arbitrarily different from
`rack-pull` (has one). Proposed rule in §3.3; if ratified, add
`deficit-deadlift` and `board-press` as movements. Modifier list already
trimmed to the four unambiguous ones.

**8.2 — `paused` and `splitsPR`.** §3 seeds `comp pause` as `splitsPR: false`.
But `LIB` already carries `Pause Squat` and `Pause Bench` as distinct names, so
the app splits them today; and for an IPF lifter **the paused rep is the
standard** — touch-and-go is the variant. `paused` as the splitting modifier is
arguably backwards. Either `comp_pause` stays `false` and `touch_and_go`
becomes the `true` modifier, or the reverse.

**8.3 — The 43 Machine Chest Press zeros.** Not AMRAP (§1). Proposal: flag
`needsReview`, never convert. They are 12 entirely-zero entries that today
vanish completely at finish, so nothing is lost by leaving them flagged — but
someone has to say what they were meant to be.

**8.4 — Leg curl seated vs lying.** D5 says do not split. 78 entries ride on
it, and until it is split the leg curl PR spans two strength curves. Confirming
that the cost is understood, not reopening D5.

**8.5 — Smith carriage weight.** D4 rules plates + bar. Two unknowns remain:
the carriage weight (a fact about your gym), and whether the 113 historical
Smith Calf Raise sets were logged plates-only. Whatever is ruled, migration
must not retro-add it — the number's meaning changes, its value never does.

**8.6 — Re-keying installed sessions.** Boot auto-installs the program into
empty state (`index.html:5650-5654`), so existing workouts carry
`` `${P.id}#${i}` `` ids. Moving to content-derived uids must re-key them
without duplicating or stranding completed sessions — and `removeProgram`
deliberately keeps completed work, so a bad re-key strands real training
history. **This is the highest-risk item in the migration** and §0 does not
cover it.

**Stated, not resolved:** `load.type` `pct1rm` and `rpe`, `setType: "drop"`,
and all four `splitsPR: true` modifiers have **zero instances** in the current
corpus. They are justified — you cannot log a chained deadlift and have it
pollute your conventional PR, and the mechanism must exist before the data does
— but they ship untested by construction unless Phase 3 carries synthetic
fixtures.

---

## Appendix A — the 40-name resolution table

Every distinct exercise name in the bundled program, resolved through §8's
order. **0 orphans, 0 leaf-ambiguous.** This is the artefact Phase 2 codes
against.

| legacyName | Entries | Sets | Leaf | Via | Load |
|---|---|---|---|---|---|
| `Smith Calf Raise` | 113 | 427 | `calf-raise-standing/smith/bilateral/none` | alias | total |
| `Face Pull` | 92 | 247 | `face-pull/cable/bilateral/rope` | name | total |
| `Seated Cable Row` | 78 | 242 | `seated-row/cable/bilateral/v_handle` | alias | total |
| `Leg Curl` | 78 | 206 | `leg-curl/machine/bilateral/none` | name | total |
| `Cable Lat Raise` | 71 | 177 | `lateral-raise/cable/unilateral/single_handle` | alias | per_side |
| `Leg Extension` | 56 | 144 | `leg-extension/machine/bilateral/none` | name | total |
| `Lat Pulldown` | 51 | 162 | `lat-pulldown/cable/bilateral/wide_bar` | name | total |
| `Machine Chest Press` | 47 | 146 | `bench-press/machine/bilateral/none` | alias | total |
| `Bench Press` | 45 | 144 | `bench-press/barbell/bilateral/none` | name | total |
| `Back Squat` | 45 | 342 | `back-squat/barbell/bilateral/none` | name | total |
| `Hip Abduction` | 44 | 88 | `hip-abduction/machine/bilateral/none` | name | total |
| `Deadlift` | 39 | 315 | `deadlift/barbell/bilateral/none` | name | total |
| `DB Lat Raise` | 35 | 94 | `lateral-raise/dumbbells/bilateral/none` | alias | per_side |
| `Tricep Bar Pushdown` | 33 | 82 | `triceps-pushdown/cable/bilateral/straight_bar` | alias | total |
| `Strict Press` | 32 | 100 | `overhead-press/barbell/bilateral/none` | alias | total |
| `Sled Leg Press` | 31 | 99 | `leg-press/plate_loaded_machine/bilateral/none` | alias | total |
| `Barbell Shrug` | 29 | 104 | `shrug/barbell/bilateral/none` | alias | total |
| `Smith Shrug` | 29 | 97 | `shrug/smith/bilateral/none` | alias | total |
| `Smith Shoulder Press` | 29 | 94 | `overhead-press/smith/bilateral/none` | alias | total |
| `Close Grip Bench` | 28 | 73 | `close-grip-bench/barbell/bilateral/none` | alias | total |
| `Barbell Hip Thrust` | 28 | 92 | `hip-thrust/barbell/bilateral/none` | alias | total |
| `Cable Crunch` | 25 | 64 | `cable-crunch/cable/bilateral/rope` | alias | total |
| `Back Extension` | 24 | 64 | `back-extension/bodyweight/bilateral/none` | name | total |
| `Hip Adduction` | 23 | 46 | `hip-adduction/machine/bilateral/none` | name | total |
| `DB Hammer Curl` | 23 | 59 | `hammer-curl/dumbbells/alternating/none` | alias | per_side |
| `Barbell Curl` | 22 | 58 | `biceps-curl/barbell/bilateral/straight_bar` | alias | total |
| `Overhead Tricep Extension` | 22 | 58 | `overhead-triceps-extension/cable/bilateral/rope` | alias | total |
| `DB Side Bend` | 22 | 58 | `side-bend/dumbbells/unilateral/none` | alias | per_side |
| `Flat DB Press` | 22 | 60 | `bench-press/dumbbells/bilateral/none` | alias | per_side |
| `Romanian Deadlift` | 22 | 60 | `romanian-deadlift/barbell/bilateral/none` | name | total |
| `Rope Pushdown` | 21 | 56 | `triceps-pushdown/cable/bilateral/rope` | alias | total |
| `Reverse Curl` | 21 | 55 | `reverse-curl/barbell/bilateral/straight_bar` | name | total |
| `Cable Kickback` | 21 | 55 | `glute-kickback/cable/unilateral/ankle_strap` | alias | per_side |
| `Incline Bench` | 19 | 55 | `incline-bench-press/barbell/bilateral/none` | alias | total |
| `Hex Deadlift` | 17 | 34 | `deadlift/trap_bar/bilateral/none` | alias | total |
| `Cable Hammer Curl` | 17 | 47 | `hammer-curl/cable/alternating/rope` | alias | per_side |
| `Cable Woodchopper` | 14 | 28 | `woodchopper/cable/unilateral/rope` | alias | per_side |
| `Front Raise` | 13 | 26 | `front-raise/dumbbells/bilateral/none` | name | per_side |
| `Hanging Knee Raise` | 13 | 39 | `hanging-knee-raise/bodyweight/bilateral/none` | name | total |
| `Bench Pin Press` | 6 | 12 | `pin-press/barbell/bilateral/none` | alias | total |

Worth noting: `Flat DB Press` resolves **per_side** — §2's worked example. Two
40 kg dumbbells are logged as 40, not 80, even though the execution is
bilateral.

## Appendix B — evidence

Every figure in this document is produced by the Phase 1 validator, which
checks catalogue integrity, runs the leaf-level dry run, and asserts each
quoted number:

```bash
node tools/validate-exercises.js
```

It exits non-zero on any failure and prints `ALL CHECKS PASSED` otherwise. The
program figures are read directly from `window.IRONLOG_PROGRAM` in
`index.html`; the catalogue figures from `docs/exercises.json`.
