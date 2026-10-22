#!/bin/bash
# Lists the work that arrived since this agent's own last commit, for the start-of-task review in AGENTS.md.
# Usage: scripts/incoming.sh "Claude Code"   or   scripts/incoming.sh "Codex"
# Run it after syncing with origin/main.
set -u
agent="${1:?usage: scripts/incoming.sh \"Claude Code\"|\"Codex\"}"
cd "$(git rev-parse --show-toplevel)" || exit 1

base=$(git log -1 --format=%H --grep="^Agent: ${agent}\$" HEAD)
if [ -z "$base" ]; then
  echo "No earlier commit with 'Agent: ${agent}' found; showing the last 10 commits instead."
  base=$(git rev-list -n 1 --skip=10 HEAD 2>/dev/null || git rev-list --max-parents=0 HEAD)
fi

if [ "$(git rev-parse "$base")" = "$(git rev-parse HEAD)" ]; then
  echo "No new commits since your last commit ($(git log -1 --format='%h %s' "$base"))."
  exit 0
fi

echo "== Commits since your last commit $(git log -1 --format='%h' "$base"), oldest first"
git log --reverse --format='%h  %<(12,trunc)%(trailers:key=Agent,valueonly,separator=%x2C)  %s' "$base"..HEAD
missing=$(git log --format='%h %(trailers:key=Agent,valueonly)' "$base"..HEAD | awk 'NF==1{print $1}' | tr '\n' ' ')
[ -n "$missing" ] && echo "!! Commits without an Agent trailer: $missing"

echo
echo "== Files changed"
git diff --stat "$base"..HEAD

echo
echo "== New HANDOFF.md entries"
git diff "$base"..HEAD -- HANDOFF.md | sed -n 's/^+\(.*\)/\1/p' | grep -v '^++ ' || echo "(none — ask why if code changed)"

for f in AGENTS.md CLAUDE.md; do
  git diff --quiet "$base"..HEAD -- "$f" || echo "!! $f changed — re-read it before working."
done
git diff --quiet "$base"..HEAD -- app/index.html || echo ">> app/index.html changed — run the tests and npm run screenshots."
git diff --quiet "$base"..HEAD -- data || echo ">> data/ changed — compare with the app databases before writing to them."
git diff --quiet "$base"..HEAD -- tests || echo ">> tests/ changed — check no assertion was removed or weakened."
