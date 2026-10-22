# Instructions for coding agents (Codex and others)

Read CLAUDE.md in this folder too: it describes the project, the catalog rules and the owner's git workflow. The essentials:

## Always start from the latest code

```sh
git fetch origin main && git pull --ff-only origin main
```

If there are uncommitted local changes, stop and report them instead of overwriting them.

## Launch the latest app locally

The Claude Artifact link (claude.ai/artifact/...) cannot be opened from a sandbox. It runs the same `app/index.html` that is in this repository, so preview the app from the repository instead:

```sh
npm run preview            # or: node scripts/preview.mjs 4173
```

Then open http://localhost:4173 (add `?category=Treadmills` for a category). It needs only Node, no `npm install`. It serves the current `app/index.html` with all products from `data/*.json` and their pictures from `data/images/`, behind an in-memory copy of the app API. Edits made in the preview are lost when it stops, and nothing is published.

### If your browser tool can't reach localhost

Some sandboxes block the browser tool from localhost. You don't need it: run

```sh
npm run screenshots
```

It starts the preview itself, drives headless Chromium from the terminal through Playwright (the same way `tests/` do) and saves six PNGs to `preview-screenshots/` (catalog, Treadmills, and the enlarged picture viewer, each at desktop 1440px and phone 390px). It prints the product shown in the picture viewer and fails on page errors. Show those PNGs to the owner. Set `CHROMIUM=/path/to/chrome` if Chromium is not at `/usr/bin/chromium`.

## After changing anything

Commit and push straight to `main` (`git push origin HEAD:main`). If `main` has moved, fetch, merge `origin/main`, re-test and push again. Publishing to the private Site uses `.openai/hosting.json` and needs the owner's approval to send credentials to the publishing tool.
