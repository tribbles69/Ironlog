# General-strength PPLUL (removed from the repo, 0.100.7)

An 18-week general-strength PPLUL built for the maintainer was parked here,
with its data file and builder, but never wired into the app. Since 0.100.7
the app ships no training program and the repo holds nothing personal, so the
data and its builder left the repo; the maintainer keeps it as a plan file
and can bring it in like any other (Settings → Training program → Bring in a
plan).

Two lessons from it still apply to any program file:

1. **Catalogue aliases.** Names that don't resolve become the lifter's own
   movements and split PR history. When a plan file uses a name the
   catalogue lacks (this one used *Smith Close Grip Bench* and *Smith Hip
   Thrust*), add an alias to `r&d/data/exercises.json` and run
   `build-catalogue.cjs` rather than renaming in the plan.
2. **Note-text gotcha.** Exercise notes are scanned for modifier keywords
   (`modsFromNote`): "seated", "supported", "brace", "banded" and so on tag
   modifiers, so a superset note should say "cable row" rather than
   "Seated Cable Row".

`node "r&d/tools/validate-exercises.js" <file>` checks a program file's names
and shape.
