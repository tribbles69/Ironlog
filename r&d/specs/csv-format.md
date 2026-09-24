# Ironlog CSV — `ironlog-csv-1`

Roadmap B7. It's for spreadsheet users, and it round-trips exactly: export,
wipe, import, and the sessions compare equal key for key. See `CSV EXPORT` in
`index.html`.

- UTF-8 with a BOM (so Excel reads it as UTF-8), CRLF line ends, RFC 4180
  quoting. Values with edge spaces are quoted too.
- **One row per set.** An exercise with no sets gets one row with the set
  columns empty, and so does a session with no exercises.
- **Session columns** repeat on every row:
  - `session_id`, `date`, `session`, `status`, `source`, `off_day`;
  - `session_extra` (JSON) sits on the session's first row only.
- **Exercise columns**:
  - `exercise_no`, then `movement`, `equipment`, `execution` and
    `attachment` (the leaf);
  - `legacy_name`, `exercise_notes`, `isometric`, `time_cap_s`,
    `stone_series`, `series_s`;
  - `exercise_extra` (JSON) sits on the exercise's first row.
- **Set columns**: `set_type`, `weight_kg`, `reps`, `rir`, `seconds`,
  `metres`, `implements`, `done`, `missed`, and `set_extra` (JSON).
- **Derived columns** are for reading and ignored on import: `exercise`
  (display name), `modifiers`, `set_no`, `e1rm_kg`.
- **Booleans** are `yes`/`no`. Weights are always kg. RIR is written as
  `10 − RPE`; where that wouldn't read back exactly, the RPE goes in
  `set_extra` instead.
- **Extras:**
  - Anything a column can't carry exactly goes in that level's extra: a
    summary, a cardio trace, VBT, modifiers, a leafless entry's `leaf: null`,
    a field added later.
  - `"$null": [keys]` marks keys that were `null`. An empty cell with no
    listing means the key was absent.
  - `"$noExercises": true` marks a session stored without an `exercises`
    array.
- **Import** adds sessions whose `session_id` isn't already on the device and
  leaves existing ones alone.
- The first column is always `format` = `ironlog-csv-1`. That's how the CSV
  button tells Ironlog's own file from Liftoff's.

JSON export is the whole state and also round-trips exactly. A food log left
over from before 0.25.0 comes back with it when the device has none of its
own.
