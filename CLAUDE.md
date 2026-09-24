# Ironlog — notes for agents

Read **`r&d/ROADMAP.md`** first. It lists what to build next, in order, plus the
standing rules (RIR shown / RPE stored, kg, local-first, version bumps in both
`version.json` and `sw.js`, the script syntax check before committing).

**Layout:** the repo root is the app — only files that get deployed live there.
Everything else (roadmap, specs, notes, data sources, build tools, patches) is
under `r&d/`; see `r&d/README.md` for the map. Keep it that way: new specs go
in `r&d/specs/`, new scripts in `r&d/tools/`, nothing new at the root unless
the app loads it. Quote the folder in the shell: `"r&d"`.

Where a spec exists, it wins over the roadmap summary.

The app is a single large `index.html`. Grep before editing; line numbers in
specs drift.
