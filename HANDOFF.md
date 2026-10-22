# Handoff log

Newest entry first. Each agent adds one entry per completed task (format in AGENTS.md); older entries are never rewritten.

## 2026-10-22: Claude Code — start-of-task review routine for both agents
- Changes:
  - AGENTS.md: "Start of every task" routine for both agents: sync, list what arrived since your own last commit, review each incoming commit against its message and HANDOFF entry, check both runtime paths in app/index.html, run all tests, screenshot app changes, compare changed catalog data read-only, then report to the owner before new work.
  - scripts/incoming.sh "<agent>": lists commits since that agent's own last `Agent:` commit (with each commit's agent), files changed, new HANDOFF.md entries, and flags commits without a trailer and changes to AGENTS.md, CLAUDE.md, the app, data and tests.
  - .claude/hooks/sync-main.sh: also lists the commits it pulled at session start.
  - CLAUDE.md: Claude Code runs the routine with `scripts/incoming.sh "Claude Code"` every time.
- Files: AGENTS.md, CLAUDE.md, HANDOFF.md, scripts/incoming.sh, .claude/hooks/sync-main.sh
- Tests: no app or test change. Script and hook syntax-checked; incoming.sh run for both agents; hook tested on a clone two commits behind (listed both pulled commits with their agents).
- Local preview: not needed.
- Claude Artifact: not republished (app unchanged; still runs 467604e code).
- Private Site: not published (needs the owner's explicit request).
- Remaining issues: Codex has no `Agent: Codex` commits yet, so on its first run incoming.sh shows the last 10 commits instead; commits before 7cc786f have no trailer and are flagged — that's expected history, not a problem.
- Next steps: Codex runs the routine with `scripts/incoming.sh "Codex"`, reviews 7cc786f and this commit, and adds its own HANDOFF entry.

## 2026-10-22: Claude Code — shared agent rules, handoff log, flaky test fixed
- Changes:
  - AGENTS.md now holds the shared rules for every agent: sync before work, one agent at a time, tests must pass every time, `data/*.json` is the canonical catalog (reconcile app-only edits before writing either database), HANDOFF.md log, `Agent:` commit trailer, and publishing rules (Claude Artifact updated automatically after completed and tested changes; private Site only on the owner's explicit request).
  - CLAUDE.md trimmed to Claude-specific notes and a pointer to AGENTS.md.
  - HANDOFF.md created (this log).
  - tests/column-controls.spec.cjs: fixed the flaky edit-save check. Root cause: the edit dialog moves focus to the Name field about 30 ms after opening, and the test sometimes started typing in a spec field before that, so the first characters went into Name and the save kept the old spec values (seen as `2 == 4` / `10 == 13`). The test now waits for focus to reach the Name field after each "Edit" click before typing. No assertion was changed or removed; the app's behavior is unchanged.
- Files: AGENTS.md, CLAUDE.md, HANDOFF.md, tests/column-controls.spec.cjs
- Tests: column-controls passed 12/12 runs after the fix (it failed about 1 in 3 before). github-ui, treadmill-specifications, catalog-specifications and server tests pass.
- Local preview: not needed (no app change).
- Claude Artifact: not republished; `app/index.html` unchanged. It runs the code from 467604e (picture-viewer arrows, SKU beside the name).
- Private Site: not published. Last known state from Codex: synced to 467604e but publishing was blocked by Codex's sandbox credential policy.
- Remaining issues: the private Site still shows an older version until the owner approves a publish from Codex.
- Next steps: when the owner asks, Codex publishes the private Site from main and records the result here.

## Earlier work (summary, before this log existed)
- Catalog of 156 products across the 11 homepage categories, cropped pictures, specification columns for treadmills, ellipticals and rowers, column controls, picture viewer with next/previous navigation and SKU beside the name.
- `npm run preview` and `npm run screenshots` for agents that cannot open the Claude Artifact.
