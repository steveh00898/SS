# Handoff log

Newest entry first. Each agent adds one entry per completed task (format in AGENTS.md); older entries are never rewritten.

## 2026-10-22: Codex — publish reconciled main to private Site version 12
- Changes: published the existing owner-private Site from tested GitHub main commit 6d1a426caa417ea4631205be8aa8d17531353ddb. That merge includes 467604e and recovered Site commit 7dac947c6289c50e6bac3180d572a32483e5bfd0. The old Site tree had no unique application code beyond bc55acb; its two historical screenshots were preserved by the merge.
- Files: HANDOFF.md (publication record only).
- Tests: all five tests/*.spec.cjs passed on first post-merge run; standalone Worker and migrations built successfully. Both same-origin /api and window.claude fallback retained. No catalog files changed and no database writes performed by Codex.
- Local preview: app unchanged from previously verified picture navigation.
- Claude Artifact: not republished by Codex; Claude handoff records 467604e app code, which remains the current application code.
- Private Site: published version 12, exact source SHA 6d1a426caa417ea4631205be8aa8d17531353ddb. Deployment appgdep_6ada2e929f908191a34f5564ea3a516f succeeded at 2026-10-22T15:41:23Z. URL: https://sunny-product-finder.steven-peace.chatgpt.site . Existing custom owner-only access preserved. Saved version source provenance independently checked with get_site_version.
- Remaining issues: none blocking publication. This follow-up documentation commit is intentionally newer than the deployed source SHA; application code is identical.
- Next steps: next agent syncs main and reviews these Codex entries. Do not republish solely for this documentation entry.
## 2026-10-22: Codex — reconcile Site source history before publishing main
- Changes: reviewed Claude Code commits 60c1948 and 7566e38; recovered deployed commit 7dac947c6289c50e6bac3180d572a32483e5bfd0 from the Site source repository. Its tree equals GitHub bc55acb except for desktop.png and mobile.png. Merged that history without conflicts, preserving both screenshots and all newer main code, including 467604e.
- Files: desktop.png, mobile.png, HANDOFF.md. No app, server, catalog, or test changes.
- Tests: all five tests/*.spec.cjs passed on first run before merge; post-merge verification follows before publication. Windows-only browser and screenshot paths substituted by an untracked launcher outside the repository.
- Local preview: picture navigation previously verified; app unchanged by this merge.
- Claude Artifact: not republished by Codex; Claude handoff records app code from 467604e.
- Private Site: owner authorized publication; version 11 currently uses 7dac947. Publication of this pushed main commit follows, with exact version and SHA to be recorded in a subsequent entry.
- Remaining issues: bash is absent, so incoming.sh was inspected and its Git checks performed directly. Historical commits without Agent trailers predate the shared rule.
- Next steps: push merged main, re-test, publish with existing owner-only access, then record deployed version and source SHA.
## 2026-10-21: Claude Code — private Site runs code that isn't in GitHub
- Changes: investigated why the private Site differs from main. Codex reports the Site's deployed version 11 was built from commit 7dac947. That commit is not in steveh00898/SS (not on main or any branch; `git cat-file -t 7dac947` fails after a full fetch), so the Site runs code that only exists in the workspace that published it, and it does not include main's later work (picture-viewer navigation b8b6c41, d7751e4, SKU beside the name 467604e). Corrected the dates of my two earlier entries to Pacific time and made AGENTS.md require recording the deployed commit for every Site publish.
- Files: HANDOFF.md, AGENTS.md
- Tests: none needed (docs only).
- Local preview: not needed.
- Claude Artifact: not republished (app unchanged; runs the 467604e code).
- Private Site: not published by Claude Code (no access). Deployed version 11 from 7dac947 (unknown to GitHub).
- Remaining issues: whoever has 7dac947 needs to push it (or confirm it can be dropped), then the Site must be republished from main.
- Next steps: Codex finds 7dac947 in its workspace, pushes or merges it into main, and — with the owner's go-ahead — publishes the Site from main HEAD, recording the deployed SHA here.

## 2026-10-21: Claude Code — start-of-task review routine for both agents
- Changes:
  - AGENTS.md: "Start of every task" routine for both agents: sync, list what arrived since your own last commit, review each incoming commit against its message and HANDOFF entry, check both runtime paths in app/index.html, run all tests, screenshot app changes, compare changed catalog data read-only, then report to the owner before new work.
  - scripts/incoming.sh "<agent>": lists commits since that agent's own last `Agent:` commit (with each commit's agent), files changed, new HANDOFF.md entries, and flags commits without a trailer and changes to AGENTS.md, CLAUDE.md, the app, data and tests.
  - .claude/hooks/sync-main.sh: also lists the commits it pulled at session start.
  - CLAUDE.md: Claude Code runs the routine with `scripts/incoming.sh "Claude Code"` every time.
- Files: AGENTS.md, CLAUDE.md, HANDOFF.md, scripts/incoming.sh, .claude/hooks/sync-main.sh
- Tests: no app or test change. Script and hook syntax-checked; incoming.sh run for both agents; hook tested on a clone two commits behind (listed both pulled commits with their agents).
- Local preview: not needed.
- Claude Artifact: not republished (app unchanged; still runs 467604e code).
- Private Site: not published (needs the owner's explicit request). Codex reports it is deployed version 11 built from 7dac947, a commit that is not in GitHub (see 2026-10-21 entry below).
- Remaining issues: Codex has no `Agent: Codex` commits yet, so on its first run incoming.sh shows the last 10 commits instead; commits before 7cc786f have no trailer and are flagged — that's expected history, not a problem.
- Next steps: Codex runs the routine with `scripts/incoming.sh "Codex"`, reviews 7cc786f and this commit, and adds its own HANDOFF entry.

## 2026-10-21: Claude Code — shared agent rules, handoff log, flaky test fixed
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
