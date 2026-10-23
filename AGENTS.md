# Shared instructions for Claude Code, Codex and any other agent

This file holds the rules every agent follows. Agent-specific notes live in CLAUDE.md (Claude Code). Read both before starting.

## The project

Sunny Product Finder: a product-learning catalog for sunnyhealthfitness.com.

- `app/index.html`: the whole single-file UI. It runs in two places and detects which one: the private Site (same-origin `/api`, Cloudflare Worker with D1 and R2) or the Claude Artifact (`window.claude` runtime, catalog in the artifact's `items` database). Keep both paths working; never remove the private Site API or the `window.claude` fallback.
- `server/worker.js`, `db/`, `drizzle/`: the private Site's API and storage. `.openai/hosting.json` publishes it.
- `data/<category>.json`, `data/images/<category>/`: the canonical catalog and cropped product pictures.
- `data/treadmill-specifications-notes.md`: specification sources, missing-data handling and tier rules.
- `tests/`: Playwright UI tests and server tests. `scripts/`: build, local preview, screenshots.

Where it is published:

| Target | URL | Who updates it |
|---|---|---|
| Claude Artifact | https://claude.ai/artifact/Eux9EgPAA2p4td6ZLTAyXS | Claude Code only (Codex cannot reach it) |
| Private Site | https://sunny-product-finder.steven-peace.chatgpt.site | Codex only (Claude Code cannot reach it) |

Each agent keeps its own preview link current as part of "git push" and "git pull" below; the owner has given standing permission for that. Publish only:
- from a commit that is already pushed to `main` (record that exact SHA in HANDOFF.md),
- when every test passes, and
- when the published app would actually change: compare the last published SHA in HANDOFF.md with `main` for `app/index.html` (and, for the private Site, `server/`, `db/`, `drizzle/`, `data/`). If nothing relevant changed, skip publishing and say so.

The owner may still have to approve a credential prompt when Codex publishes; that is Codex's own security setting. Local previews and screenshots are not publishing. Never claim a change is live on a target you did not publish to.

## The owner's commands

| Owner says | Meaning (same for every agent) |
|---|---|
| **"git pull"** | Run "Start of every task" below (sync, review the other agent's work, tests, screenshots), then update **your own** preview link if the app changed (rules above), refresh your app's practice export and run `npm run practice-report` ("SKU practice data" below), and report. |
| **"git push"** | Run "Before finishing" below (tests, HANDOFF.md entry, commit with your `Agent:` trailer, push to `main`), including your app's refreshed practice export, then update **your own** preview link if the app changed, and report the commit SHA and both links' status. |
| **"publish site"** | Codex: publish the private Site from `main` HEAD now (pushed commits only), even if nothing changed. Claude Code: republish the Claude Artifact. |

The owner works in one tool at a time: "git push" in the tool they finished in, then "git pull" in the other. After that pair, both links show the latest version.

## One agent at a time

GitHub `steveh00898/SS`, branch `main`, is the source of truth. Only one agent works at a time. Before handing over, the current agent commits and pushes everything to `main` and adds a HANDOFF.md entry.

## Start of every task: sync, then review the other agent's work

Both agents run this routine every time, before any new work, including when the owner says "continue from Codex" or "continue from Claude".

1. Check the branch, remote and `git status`. If there are uncommitted changes, report them and preserve them; never discard them.
2. Sync: `git fetch origin main`, then `git pull --ff-only origin main`. If the branches have diverged, merge `origin/main` keeping both sides' changes, and ask the owner about any conflict whose intended behavior is unclear.
3. List what arrived since your own last commit: `npm run incoming -- "Codex"` or `npm run incoming -- "Claude Code"` (Node only, works on Windows too). It shows the commits with their `Agent:` trailer, the files changed, the new HANDOFF.md entries, and flags commits without a trailer and changes to AGENTS.md, CLAUDE.md, the app, data and tests.
4. Review those changes:
   - If AGENTS.md or your agent file changed, re-read it and follow the new version.
   - Read each incoming commit's diff (`git show <sha>`) and check it matches its message and HANDOFF.md entry.
   - Check `app/index.html` still keeps both runtime paths: the private Site `/api` calls and the `window.claude` fallback.
   - Flag anything unexplained: changes missing from HANDOFF.md, removed or weakened test assertions, catalog changes in `data/*.json` without a note, commits without an `Agent:` trailer.
5. Verify:
   - Run all tests in `tests/`. They must pass every time; report failures with their output instead of re-running.
   - If `app/index.html` changed, check it with `npm run screenshots` (or `npm run preview`).
   - If `data/*.json` changed, compare it read-only with the app database you are responsible for, and list differences. Don't write to either side unless the owner asks.
6. On "git pull": if your own preview link is behind `main` (its last published SHA in HANDOFF.md vs `main`, rules above) and tests pass, update it. Do this even when no new commits arrived.
7. Report to the owner before starting new work: commits received and from which agent, what changed in plain language, test and screenshot results, issues found, and publication status of both links (version and SHA each is on, and whether it is behind `main`).

If there are no new commits, say so and skip steps 4 and 5.

## While working

- Follow the existing conventions in `app/index.html` and the tests.
- Run the relevant tests: `tests/*.spec.cjs` (UI tests need Playwright and Chromium; set the path the way your environment needs). They should pass every time. A flaky test is a bug to fix, not to re-run.
- Check UI changes with `npm run preview` (http://localhost:4173, no install needed) or, when the browser tool can't reach localhost, `npm run screenshots` (headless Chromium, saves PNGs to `preview-screenshots/`). Both use the checked-in catalog; edits made in the preview are not saved.

## The catalog

- `data/*.json` is the canonical catalog. Catalog changes go into those files and are pushed; each app's database is then updated from them.
- The two app databases can also hold edits made inside the apps. Before writing to either database, read it, compare it with `data/*.json`, and bring any app-only edits into the repository first (or ask the owner which version wins). Never overwrite database edits blindly, and pin writes to the version you read.
- Each category matches the product cards shown on page 1 of the collection the sunnyhealthfitness.com homepage category row links to, not the `products.json` feed.
- Product pictures: the product's first image, trimmed to the product with 4% padding on a white 4:3 canvas, 1200x900 JPEG.
- Every picture has `photoChecked: true` once someone has looked for printed text, and `photoMasks` boxes over any printed SKU/model number (`sku`), product name or product-type word or weight (`name`) and price (`price`), as `[x, y, w, h]` fractions of the picture. A new or replaced picture needs the same check before `photoChecked` is set; until then SKU practice blurs it. Masks added in an app (**Hide part of photo**) are app-only edits: bring them into `data/*.json`.

## SKU practice data

Each app saves practice results per signed-in user in its own database (README.md, "SKU practice"). Neither agent can open the other's app, so the results meet in the repository:

- Claude Code writes the Claude Artifact's results to `practice-data/claude-artifact.json` (read with its artifact database tool from the owner's `data/users/<id>/practice-*` documents).
- Codex writes the private Site's results to `practice-data/private-site.json` (`GET /api/practice` as the owner, or the D1 table `practice_attempts`).
- Use the format in `practice-data/README.md`: the whole file is replaced on each export, with no user ids, names or emails. If you can't read your app's results, say so and ask the owner to use **Progress → Export results file** in that app instead; never invent or edit records.
- Then run `npm run practice-report` (add `-- --md` to also write `practice-data/report.md`) and include the headline numbers in your report: answers, accuracy, most missed field, most missed products.
- The repository is public. Ask the owner before the first export if it hasn't been made private.

## Before finishing

1. Add an entry at the top of HANDOFF.md (format below).
2. Commit all intended source changes together with HANDOFF.md. End every commit message with a trailer naming the agent: `Agent: Claude Code` or `Agent: Codex`.
3. `git push origin HEAD:main`. If `main` moved, fetch, merge `origin/main`, re-test, push again.
4. Update your own preview link from the pushed commit if the app changed (rules above), then record the published version and SHA in a short follow-up HANDOFF.md entry and push it.
5. Report the final commit SHA, whether the push succeeded, and the status of both links.

## HANDOFF.md entry format

Newest entry first; never rewrite older entries (fixing a factual mistake, such as a wrong date, is fine). Dates use the owner's time zone, America/Los_Angeles.

```
## YYYY-MM-DD: <agent> — <one-line summary>
- Changes: what changed and why
- Files: affected files
- Tests: what ran and the result
- Local preview: checked / not checked
- Claude Artifact: published (version) / not published
- Private Site: published (deployed version and the exact main commit SHA it was built from) / not published (reason)
- Practice data: exported (file, number of results) / not exported (reason)
- Remaining issues: ...
- Next steps: ...
```
