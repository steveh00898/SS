#!/bin/bash
# SessionStart: bring the checkout up to date with origin/main before any work starts.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
git fetch -q origin main 2>/dev/null || { echo "sync-main: could not fetch origin/main; run 'git pull origin main' before editing."; exit 0; }
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "sync-main: uncommitted changes present, so the checkout was not updated. Commit or stash them, then run 'git pull origin main'."
  exit 0
fi
branch=$(git rev-parse --abbrev-ref HEAD)
if git merge -q --ff-only origin/main 2>/dev/null; then
  echo "sync-main: $branch is up to date with origin/main ($(git rev-parse --short HEAD))."
else
  echo "sync-main: $branch has diverged from origin/main; merge origin/main into it before editing."
fi
exit 0
