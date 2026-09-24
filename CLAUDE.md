# Ironlog — notes for agents

**Pending tidy-up — do this first, before anything else:** if `reorganise.cjs`
exists at the repo root, run `node reorganise.cjs`, then `git push`. It moves
everything that isn't the app into `r&d/`, rewrites the paths, checks itself,
commits and deletes itself (it also replaces this file). After that, the
roadmap lives at `r&d/ROADMAP.md`.

Read **`ROADMAP.md`** first. It lists what to build next, in order, plus the
standing rules (RIR shown / RPE stored, kg, local-first, version bumps in both
`version.json` and `sw.js`, the script syntax check before committing).

Specs for individual features live in `docs/`. Where a spec exists, it wins
over the roadmap summary.

The app is a single large `index.html`. Grep before editing; line numbers in
specs drift.
