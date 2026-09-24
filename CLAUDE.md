# Ironlog — notes for agents

Read **`r&d/ROADMAP.md`** first. It lists what to build next, in order, plus the
standing rules (RIR shown / RPE stored, kg, local-first, version bumps in both
`version.json` and `sw.js`, the script syntax check before committing).

**Every version bump also adds an entry to the top of `r&d/CHANGELOG.md`**, in
the same commit: version, date, and a few plain-English bullets on what a user
would notice (new, changed, fixed). No code detail — that goes in the commit
message.

**Layout:** the repo root is the app — only files that get deployed live there.
Everything else (roadmap, changelog, specs, notes, data sources, build tools,
patches) is under `r&d/`; see `r&d/README.md` for the map. Keep it that way:
new specs go in `r&d/specs/`, new scripts in `r&d/tools/`, nothing new at the
root unless the app loads it. Quote the folder in the shell: `"r&d"`.

Where a spec exists, it wins over the roadmap summary.

The app is a single large `index.html`. Grep before editing; line numbers in
specs drift.
