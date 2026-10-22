# Claude Code notes for Sunny Product Finder

Follow AGENTS.md: it holds the shared rules for every agent (sync, one agent at a time, tests, canonical catalog, HANDOFF.md, commit trailer, publishing). This file only adds what is specific to Claude Code.

## Claude-specific

- A SessionStart hook (`.claude/hooks/sync-main.sh`) fetches `origin/main` and fast-forwards when the session opens. If it reports uncommitted changes or a diverged branch, resolve that first (see AGENTS.md).
- Push straight to `main` after every completed change (`git push origin HEAD:main`); this is the owner's standing permission.
- End commit messages with `Agent: Claude Code`, before the Co-Authored-By and Claude-Session trailers.
- Claude Artifact (https://claude.ai/artifact/Eux9EgPAA2p4td6ZLTAyXS): after a completed, tested change to `app/index.html`, republish that file to the artifact URL. For catalog changes, read the artifact's `items` database first, reconcile app-only edits into `data/*.json` (AGENTS.md), then write with `if_version` pins.
- Private Site: never publish unless the owner explicitly asks. Claude Code cannot publish it from its sandbox.
- UI tests reference `/usr/bin/chromium` and `require('playwright')`. In Claude Code's container use Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` and Playwright at `/opt/node-tools/node_modules/playwright` (run a copy of the test with those paths substituted; don't change the committed paths). `npm run screenshots` takes `CHROMIUM=...`.
