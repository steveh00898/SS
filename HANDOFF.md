# Handoff log

Newest entry first. Each agent adds one entry per completed task (format in AGENTS.md); older entries are never rewritten.

## 2026-10-23: Claude Code — Claude Artifact republished with SKU practice (2502a7e)
- Changes: republished `app/index.html` from main 2502a7e to the Claude Artifact (version 12; capabilities assets, db, downloads, user carried forward). Added `photoChecked`/`photoMasks` from `data/*.json` to all 156 `items` documents with field-level updates pinned to the versions read; every picture matched `data/*.json` (same imageAssetId) and no other field was written, so the owner's app-only treadmill edits (2502a7e entry) are untouched. Exported the Artifact's practice results: none yet (`data/users/<owner>/` holds no practice documents).
- Files: HANDOFF.md, practice-data/claude-artifact.json (new, 0 results)
- Tests: unchanged since 2502a7e (all 8 passed twice). Read back sf-t724011: masks present, owner's productSpecs kept.
- Local preview: not needed.
- Claude Artifact: published version 12 from 2502a7e.
- Private Site: not published (Codex's job); still on version 12 from 6d1a426, behind main (app, server, drizzle, data changed).
- Practice data: exported practice-data/claude-artifact.json (0 results).
- Remaining issues: same as the 2502a7e entry.
- Next steps: Codex runs "git pull".

## 2026-10-23: Claude Code — SKU practice: study cards, quiz, progress dashboard, photo masks
- Changes:
  - New **SKU Practice** and **Progress** views (buttons above the title, `?view=practice|progress`). Setup: categories, fields (SKU / item name / price, any combination), "Review missed items only". Study cards with ‹ › / arrows / wheel / swipe. Endless quiz with 3 choices per field (a table with one column per field), light green / light red feedback with the right answer in green, keys 1–3 and Enter, Stop shows a session summary. Weighted toward missed items (last 8 answers; 75%+ over at least 4 = mastered and shown far less; never the same item twice in a row).
  - Only the asked fields are hidden, and the photo never gives the answer away: every catalog picture now has `photoChecked: true` and, for 61 of them, `photoMasks` boxes over printed SKUs/model numbers, product-type words (TREADMILL, BIKE, ROWER, ELLIPTICAL, ROW-N-RIDE, PILATES) and weight labels. I checked all 156 pictures by eye (no OCR in the container). An unchecked picture (e.g. newly uploaded) stays blurred until answered; editors can add a box with "Hide part of photo". Replacing a picture clears its masks.
  - Progress dashboard: answers, accuracy, days practiced, streak, mastered products; by field (most correct / most missed), daily accuracy chart with table view, by category, most missed and best known products; 7/30/90 days or all time; export CSV, export/import a results file, reset.
  - Storage, private to the signed-in user: private Site `practice_attempts` table (migration `drizzle/0001_practice_attempts.sql`) via `GET/POST/DELETE /api/practice`; Claude Artifact `data/users/<id>/practice-*` documents. Worker keeps and sanitizes `photoChecked`/`photoMasks`, keeps them on edits that omit them, and imports them once into existing D1 rows whose picture is unchanged (`photo-masks-v1`).
  - Tracking data for both agents: `practice-data/` (README with format) + `npm run practice-report` (merges `claude-artifact.json` and `private-site.json`, prints the Progress numbers). AGENTS.md: "git pull"/"git push" now include the practice export and report, new "SKU practice data" section, photo-mask catalog rule, HANDOFF "Practice data" line. CLAUDE.md: where Claude Code finds the Artifact results.
  - Fixed: the catalog column code used the first `thead` on the page; it now targets the catalog table only.
- Files: app/index.html, server/worker.js, db/schema.ts, drizzle/0001_practice_attempts.sql, drizzle/meta/*, data/*.json (photoChecked, photoMasks), scripts/preview.mjs, scripts/screenshots.cjs, scripts/practice-report.mjs (new), package.json, practice-data/README.md (new), tests/practice.spec.cjs, tests/practice-artifact.spec.cjs, tests/practice-report.spec.cjs (new), tests/server.spec.cjs, README.md, AGENTS.md, CLAUDE.md, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice in a row (5 existing + 3 new; server test extended for practice API and masks; no existing assertion changed). `npm run build` OK. `npm run screenshots` OK (now also practice setup, question, answered, progress).
- Local preview: checked (desktop and 390px phone, no sideways scroll).
- Claude Artifact: to be republished from this commit (follow-up entry).
- Private Site: not published (Codex's job). Needs the new migration applied when Codex publishes this commit.
- Practice data: none yet (feature is new).
- Remaining issues: the Artifact's catalog database has owner edits not in `data/*.json`: workout-area width/length (and one key dimension) on SF-T724011, SF-T725067, SF-T722021, SF-T722076, made 2026-10-20 in the app. Left untouched; owner to decide whether they go into the repository. The repository is public, so practice exports in `practice-data/` are public.
- Next steps: Codex runs "git pull": reviews this, publishes the private Site with migrations, exports `practice-data/private-site.json` once there are results, runs `npm run practice-report`.

## 2026-10-22: Claude Code — "git pull" / "git push" keep each agent's preview link current
- Changes:
  - AGENTS.md: defined the owner's commands. "git pull" = sync, review the other agent's work, tests, screenshots, then update your own preview link if it is behind main. "git push" = tests, HANDOFF entry, commit with Agent trailer, push, then update your own preview link. "publish site" = publish now. Owner gave standing permission: Codex keeps the private Site current, Claude Code keeps the Claude Artifact current, both only from pushed main commits with all tests passing, recording the published SHA.
  - scripts/incoming.mjs replaces scripts/incoming.sh so the review works on Windows (Codex has no bash). Run with `npm run incoming -- "Codex"` or `npm run incoming -- "Claude Code"`. Merged-in history is summarized by its merge commit.
  - CLAUDE.md and .claude/hooks/sync-main.sh point to the new command.
- Files: AGENTS.md, CLAUDE.md, HANDOFF.md, package.json, scripts/incoming.mjs (new), scripts/incoming.sh (removed), .claude/hooks/sync-main.sh
- Tests: all five tests/*.spec.cjs passed after reviewing Codex's 6d1a426 and 0c149b8 (only HANDOFF.md, desktop.png and mobile.png changed; app code identical to 467604e; both runtime paths intact). incoming.mjs run for both agents.
- Local preview: not needed (no app change).
- Claude Artifact: not republished; already on the current app code (467604e).
- Private Site: not touched by Claude Code; Codex recorded version 12 from 6d1a426 (same app code as main).
- Remaining issues: none.
- Next steps: Codex runs "git pull" under the new AGENTS.md rules.

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
