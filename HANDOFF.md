# Handoff log

Newest entry first. Each agent adds one entry per completed task (format in AGENTS.md); older entries are never rewritten.

## 2026-10-23: Codex — sync Sunny logo update and publish private Site version 14
- Changes: pulled six Claude Code commits 289d08a, 3a1b120, e341248, 84c1807, 9a26cec, bf46395; reviewed their logo/header changes against the handoff. Final header has the full Sunny Health & Fitness lockup at the owner's chosen 52px height on Almond, sticky header and side panel adjusted accordingly. Both private Site /api and window.claude fallback intact. No application-source edits by Codex.
- Files: HANDOFF.md only (sync/publication record).
- Tests: all eight tests/*.spec.cjs passed on the first run with the Windows browser-path adapter; no assertions or catalog changes arrived. scripts/screenshots.cjs passed, 14 PNGs at desktop 1440px and phone 390px; standalone Worker build passed.
- Local preview: desktop catalog screenshot inspected; desktop/phone picture navigation advanced to 2 of 23; practice and progress captures passed with no page errors.
- Claude Artifact: Claude records version 18 from 9a26cec, same app code as bf46395.
- Private Site: published version 14 from exact main SHA bf463956478ad7c23f8a0a19903280cb1c02f98c, deployment appgdep_6adbbaf975cc8191b3dea592d3183542 succeeded. Runtime environment revision 1 retained (owner admin settings unchanged); owner-only access preserved. This documentation-only follow-up is newer than the deployed SHA; app code is identical.
- Practice data: no new export committed; first export to this public repository still requires owner approval. Ran practice-report: existing Artifact export has 0 results; no claim that this re-reads live practice records.
- Remaining issues: live second-account check remains pending owner approval of learner access; no access change requested or made.
- Next steps: owner refreshes private Site to see the updated logo; next agent syncs this publication record.
## 2026-10-23: Claude Code — smaller header logo (owner's size)
- Changes: owner found the 250px lockup too big and asked for it just slightly taller than the search bar (44px). The lockup (with "HEALTH & FITNESS") is now 52px tall and 112px wide, with clear space of one dot diameter (9px). This is the owner's decision and is below the guideline's 250px minimum for the lockup with tagline. The header is 87px tall again on desktop and sticks to the top again; the side panel sticks at 96px; table box `100vh - 160px`. On phones "Product Finder" sits beside the logo again.
- Files: app/index.html, README.md, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice.
- Local preview: checked at 1440 light/dark, 1280, 1024, 390 (no sideways scroll).
- Claude Artifact: published version 18 from 9a26cec.
- Private Site: version 13 from 328bafe; behind main (logo commits).
- Practice data: not re-exported (no change).
- Remaining issues: none new.
- Next steps: Codex runs "git pull" and publishes.

## 2026-10-23: Claude Code — full Sunny logo lockup (with "Health & Fitness") on an Almond header
- Changes: owner asked for the actual red logo with "Health & Fitness" under it, and allowed changing the header background to suit. The header now shows the full lockup from the guideline PDF (page 8 vector: six Sunny Red #E81D1D paths plus the fourteen "HEALTH & FITNESS" paths in the guideline's #241F21), at 250px wide, the guideline's minimum for the lockup, with clear space of about one dot diameter (19px). The header background is Almond #F8EEE1 in both light and dark mode (the full-color logo is allowed only on white, almond or black), with light search-box colours there; the white dark-mode logo is gone. The header is 171px tall on desktop, so it no longer sticks to the top; the side panel now sticks at 16px and the table box is `100vh - 110px`. On phones "Product Finder" goes under the logo.
- Files: app/index.html, README.md, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice.
- Local preview: checked at 1440 light/dark, 1280, 1024 and 390 (no sideways scroll).
- Claude Artifact: published version 17 from e341248.
- Private Site: version 13 from 328bafe; behind main (two logo commits).
- Practice data: not re-exported (no change).
- Remaining issues: rest of the palette and fonts still differ from the guideline (owner to decide).
- Next steps: Codex runs "git pull" and publishes.

## 2026-10-23: Claude Code — Sunny logo per Brand Guidelines 2026
- Changes: owner shared Sunny_BrandGuidelines_2026_1_1.pdf (not committed). The header logo was re-typed text ("SUNNY" in Poppins, #d7262e, tiny red tagline), which the guideline forbids. Replaced it with the real vector "SUNNY" wordmark extracted from the PDF's master lockup (page 8, `pdftocairo -svg`, the six Sunny Red paths only, no tracing), inline SVG with `fill: currentColor`. Following the guideline: no "Health & Fitness" (the full lockup needs 250px+), 120px wide on desktop and 104px on phones (minimum 100px), fixed aspect ratio, clear space of about one dot diameter (9px), Sunny Red #E81D1D on the light header (new `--logo` token), solid white on the dark header. The favicon is now the red 'S' badge from page 10 (red circle, white 'S'). The header is about 10px taller, so the sticky side panel and table heights moved down to match. Reviewed Codex's b0bced1 (HANDOFF only: admin configured as a secret, Site version 13 from 328bafe, access still owner-only).
- Files: app/index.html, README.md, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice.
- Local preview: header checked at 1440 light/dark and 390 light/dark (logo 120×56 / 104×48, rgb(232,29,29) / white), side panel at 1440/1280/1024, no sideways scroll.
- Claude Artifact: published version 16 from 289d08a.
- Private Site: version 13 from 328bafe; behind main by this app change.
- Practice data: not re-exported (no change).
- Remaining issues: the rest of the palette and fonts still differ from the guideline (accent #e0322f, navy buttons, Poppins/Roboto Condensed vs Montserrat, Almond #F8EEE1); left for the owner to decide.
- Next steps: Codex runs "git pull" and publishes.

## 2026-10-23: Codex — owner admin configured; private Site version 13, access remains owner-only
- Changes: synced eight Claude Code commits 8643727..328bafe and ran scripts/incoming.mjs Codex. Reviewed the practice/accounts changes and handoff; private Site /api and window.claude paths retained. Configured ADMIN_EMAILS as a secret runtime setting (environment revision 1), without storing its value or the owner identity in this public repository. No application-source edits were needed.
- Files: HANDOFF.md only. Local catalog comparison and screenshot artifacts remain outside tracked source or ignored.
- Tests: all eight tests/*.spec.cjs passed on the first run using the Windows browser-path adapter. Existing assertions retained; treadmill unknown-value assertions intentionally changed to match the four documented owner data updates. Repository screenshots script passed for desktop 1440px and phone 390px (14 PNGs, no page errors); Worker build passed.
- Local preview: screenshots verified catalog, picture navigation (2 of 23), practice setup/question/feedback and progress at both widths.
- Claude Artifact: Claude records version 15 from ac68339; application code matches published main 328bafe (the latter records the Artifact publication).
- Private Site: published version 13 from exact pushed main SHA 328bafe10fd5dddb59e021e51fe26cbd15d5dff5. Deployment appgdep_6adbb3534f288191893a1c9141cf6313 succeeded, env revision 1. Migrations 0001_practice_attempts and 0002_practice_users included. Signed-in owner /api/session verified canWrite:true, practice:true, admin:true and an email matching the configured admin. Confirmed platform email header and recovered the Site-specific authenticated user id via the owner's account record; neither is recorded here. /api/practice?with=profile and admin /api/practice/accounts both succeeded, verifying the two new tables. Site access remains custom owner-only, revision 1, no additional visitors.
- Catalog comparison: before publishing, read all 156 Site rows and compared with data/*.json. Differences were the expected photoChecked/photoMasks additions plus empty workout-area fields on SF-T724011, SF-T722076, SF-T722021, SF-T725067 and SF-T722021 keyDimensions. No conflicting app-only catalog edits found; no direct catalog API writes made. Release includes the reviewed one-time hydration that preserves existing values.
- Practice data: owner live profile has 0 records. No export committed: repository is public and first-export permission is still required by AGENTS.md. Ran practice-report against existing tracked export: 0 results. No other learners' data exported.
- Remaining issues: live non-admin verification requires a second signed-in account after the owner approves specific learner access or a broader audience. Server tests already prove non-admin practice writes succeed and catalog PUT/DELETE and Accounts access return 403. No access policy change made.
- Next steps: owner chooses who may sign in; only then change Site access and verify a real non-admin account can practice but cannot edit. This documentation-only commit is newer than the deployed SHA; app code is identical.
## 2026-10-23: Claude Code — accounts on the private Site: learner names, admin Accounts view, admin-only catalog edits
- Changes:
  - Owner chose the private Site for accounts (people sign in with email through the Site's sign-in) with the owner's own account as admin (the owner gives Codex the email directly; it isn't written here because this repository is public). The Claude Artifact can't host other learners (outside visitors can view but never save), so it stays the owner's personal copy.
  - Worker: admin roles from `ADMIN_USER_IDS` / `ADMIN_EMAILS` (comma-separated settings) or a `catalog_meta` row `admins` = `{"userIds":[...],"emails":[...]}`; email matching uses the `oai-authenticated-user-email` header only if the platform sends it (not verified; Codex please check which identity headers Sites provides). `/api/session` now returns `admin` and `email`. Once any admin is configured, catalog writes (`/api/items*`, `/api/assets` POST) are admin-only; with none configured, behaviour is unchanged. New `practice_users` table (migration `drizzle/0002_practice_users.sql`), `PUT /api/practice/profile` (learner's display name), `GET /api/practice?with=profile`, admin-only `GET /api/practice/accounts`.
  - App: Progress → "Your name" (Site only); **Accounts** section (shown only to admins) with every learner's answers, accuracy by field, mastered, streak, last practiced, a drill-down into one learner's full (read-only) progress, and a CSV of all accounts. Preview runs as an admin.
  - Docs: README (accounts), AGENTS.md and practice-data/README.md: Codex exports only the owner's own Site results to the public repo; other learners' data and emails stay in the Site.
- Files: server/worker.js, db/schema.ts, drizzle/0002_practice_users.sql, drizzle/meta/*, app/index.html, scripts/preview.mjs, tests/server.spec.cjs, tests/practice.spec.cjs, README.md, AGENTS.md, practice-data/README.md, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice (server: roles by id/email/database row, catalog writes blocked for non-admins once configured, accounts view admin-only, names; UI: name save, Accounts list and drill-down hidden from non-admins). In tests/server.spec.cjs the final count for the second user's results went from 1 to 2 because the new checks add one result for that user.
- Local preview: checked (Accounts list, drill-down, Progress name field).
- Claude Artifact: published version 15 from ac68339 (no accounts there; Accounts button stays hidden).
- Private Site: not published (Codex's job). Needs migrations 0001 and 0002.
- Practice data: not re-exported (no Artifact data change).
- Remaining issues: the repository is still public.
- Next steps for Codex, in this order: (1) "git pull" and review; (2) find the owner's identity on the Site (user id from `oai-authenticated-user-id`, and whether an email header is sent) and configure the admin (`ADMIN_USER_IDS`, or `ADMIN_EMAILS` set to the owner's email if the email header exists, or the `admins` catalog_meta row); confirm `/api/session` shows `admin: true` for the owner; (3) publish with migrations; (4) only then, with the owner's go-ahead, change the Site's access from owner-only to letting other people sign in, and confirm a non-admin account can practice but cannot edit the catalog.

## 2026-10-23: Claude Code — left side panel; owner's treadmill workout-area edits in the catalog
- Changes:
  - Wide screens (1100px+): the section switcher, title, item count, Export CSV / Bulk Edit / Add New Item and the category list now sit in a sticky left panel; the table uses the full height of the window (`max-height: calc(100vh - 150px)`). Narrower screens keep the stacked layout.
  - Owner approved bringing the Artifact-only edits into the repository: workout width/length for SF-T724011 (16 × 50), SF-T725067 (20 × 55), SF-T722021 (17.3 × 47, key dimensions 47.2" × 17.3"), SF-T722076 (16 × 45.7) in `data/treadmills.json`; notes updated. Worker: one-time `treadmill-workout-area-v2` fill puts these into existing private Site rows only where the field is still empty (Site edits win).
  - tests/treadmill-specifications.spec.cjs: the check that SF-T725067's width shows "-" and the count of 4 unknown widths now assert the new values (20 in, 0 unknown, and SF-T722021's key dimensions), because the data changed. tests/server.spec.cjs: covers the one-time fill and that a Site value is kept.
- Files: app/index.html, data/treadmills.json, data/treadmill-specifications-notes.md, server/worker.js, tests/treadmill-specifications.spec.cjs, tests/server.spec.cjs, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice.
- Local preview: checked at 1440 (dark), 1280 (light), 1024 and the practice view; no sideways scroll.
- Claude Artifact: published version 14 from 1fde18d. Its items database already holds these four values, so no database write.
- Private Site: not published (Codex's job); behind main.
- Practice data: not re-exported (no change).
- Remaining issues: owner asked for email sign-up accounts with an admin view of everyone's progress; platform limits being clarified with the owner (see next entry).
- Next steps: Codex runs "git pull".

## 2026-10-23: Claude Code — quiz answer table: fixed cell sizes, colour-only feedback
- Changes: owner reported choice text spilling out of cells and cells resizing after a click. The answer columns now share one grid (cells placed by row/column), so every row has one height across columns before and after answering; smaller choice text (14px names, 17px prices/SKUs, no mid-word breaks); removed the "✓ Correct", "✓ Answer" and "✗ Your pick" labels, so feedback is colour only (the result stays in each cell's accessible label); the help line no longer changes after answering, so nothing moves.
- Files: app/index.html, tests/practice.spec.cjs, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice. practice.spec.cjs now also checks choice text stays inside its cell, rows have equal height across columns, cells keep size and position after answering, and no text marks.
- Local preview: checked at 1230px (dark) and 390px.
- Claude Artifact: published version 13 from a32c087 (recorded in the follow-up commit).
- Private Site: not published (Codex's job); still behind main.
- Practice data: not re-exported (no app data change).
- Remaining issues: same as the 2502a7e entry (owner treadmill edits only in the Artifact; public repository).
- Next steps: Codex runs "git pull".

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
