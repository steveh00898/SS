// Lists the work that arrived since this agent's own last commit, for the start-of-task review in AGENTS.md.
// Works on Linux, macOS and Windows (needs only Node and git).
// Usage: npm run incoming -- "Codex"     or     node scripts/incoming.mjs "Claude Code"
// Run it after syncing with origin/main.
import { execFileSync } from 'node:child_process';

const agent = process.argv[2];
if (!agent) { console.error('usage: node scripts/incoming.mjs "Claude Code"|"Codex"'); process.exit(2); }
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trimEnd();
process.chdir(git('rev-parse', '--show-toplevel'));

const escaped = agent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let base = git('log', '-1', '--format=%H', `--grep=^Agent: ${escaped}$`, 'HEAD');
if (!base) {
  console.log(`No earlier commit with 'Agent: ${agent}' found; showing the last 10 commits instead.`);
  const all = git('rev-list', 'HEAD').split('\n');
  base = all[Math.min(10, all.length - 1)];
}
if (git('rev-parse', base) === git('rev-parse', 'HEAD')) {
  console.log(`No new commits since your last commit (${git('log', '-1', '--format=%h %s', base)}).`);
  process.exit(0);
}

const range = `${base}..HEAD`;
console.log(`== Commits since your last commit ${git('log', '-1', '--format=%h', base)}, oldest first (merged-in history is summarized by its merge commit)`);
const rows = git('log', '--first-parent', '--reverse', '--format=%h%x09%(trailers:key=Agent,valueonly,separator=%x2C)%x09%s', range).split('\n').filter(Boolean);
for (const row of rows) { const [sha, who, subject] = row.split('\t'); console.log(`${sha}  ${(who || '-').padEnd(12)}  ${subject}`); }
const untagged = rows.filter((r) => !r.split('\t')[1]).map((r) => r.split('\t')[0]);
if (untagged.length) console.log(`!! Commits without an Agent trailer: ${untagged.join(' ')}`);

console.log('\n== Files changed');
console.log(git('diff', '--stat', range) || '(none)');

console.log('\n== New HANDOFF.md entries');
const added = git('diff', range, '--', 'HANDOFF.md').split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
console.log(added.length ? added.join('\n') : '(none — ask why if code changed)');

const changed = (path) => git('diff', '--name-only', range, '--', path) !== '';
for (const f of ['AGENTS.md', 'CLAUDE.md']) if (changed(f)) console.log(`!! ${f} changed — re-read it before working.`);
if (changed('app/index.html')) console.log('>> app/index.html changed — run the tests, take screenshots, and update your preview link (AGENTS.md).');
else console.log('>> app/index.html unchanged since your last commit. Still compare your preview link against the last published SHA in HANDOFF.md before skipping a publish.');
if (changed('data')) console.log('>> data/ changed — compare with the app databases before writing to them.');
if (changed('tests')) console.log('>> tests/ changed — check no assertion was removed or weakened.');
