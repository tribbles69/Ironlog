# Ironlog — notes for agents

Read **`r&d/ROADMAP.md`** first. It lists what to build next, in order, plus the
standing rules (RIR shown / RPE stored, kg, local-first, version bumps in
`version.json`, `sw.js` **and `APP_VERSION` in `index.html`** — `r&d/tools/bump.cjs` does all
three, `r&d/tools/check-version.cjs` verifies — and the script syntax check before
committing).

**Every version bump also adds an entry to the top of `CHANGELOG.md`** (repo root — the app shows it as What's new), in
the same commit: version, date, and a few plain-English bullets on what a user
would notice (new, changed, fixed). No code detail — that goes in the commit
message.

**Layout:** the repo root is the app — only files that get deployed live there.
Everything else (roadmap, specs, notes, data sources, build tools,
patches) is under `r&d/`; see `r&d/README.md` for the map. Keep it that way:
new specs go in `r&d/specs/`, new scripts in `r&d/tools/`, nothing new at the
root unless the app loads it. Quote the folder in the shell: `"r&d"`.

Where a spec exists, it wins over the roadmap summary.

**Exercise demos** (the animated figures on the Info tab) are data in
`r&d/data/demos/`, built into `index.html` by `r&d/tools/build-demos.cjs` —
never edit the `DEMO_PATTERNS` / `DEMO_MAP` / `DEMO_TEXT` lines by hand. To
add or change one, follow `r&d/specs/exercise-demo-spec.md` §8 and finish with
`r&d/tools/demo-check.cjs`.

The app is a single large `index.html`. Grep before editing; line numbers in
specs drift.
