// SKU practice report for any agent: merges the practice results exported from each app and prints the
// same numbers as the app's Progress view (overall, by field, by category, by product, by day, streak).
// The Claude Artifact's results go in practice-data/claude-artifact.json (Claude Code exports them),
// the private Site's in practice-data/private-site.json (Codex exports them). Node only, works on Windows.
// Usage: npm run practice-report [-- --days 30] [-- --md]   (--md also writes practice-data/report.md)
//        node scripts/practice-report.mjs --dir <folder>    (read the exports from another folder)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), opt = (name) => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1] ?? true; };
const dir = path.resolve(opt('--dir') || path.join(root, 'practice-data')), days = opt('--days') ? Number(opt('--days')) : null, now = opt('--now') ? new Date(opt('--now')) : new Date();
const FIELDS = [['sku', 'SKU'], ['name', 'Item name'], ['price', 'Price']];
const ORDER = ['Treadmills', 'Ellipticals', 'Rowers', 'Indoor Bikes', 'Steppers', 'Row-N-Ride', 'Pilates Reformers', 'Racks', 'Weight Benches', 'Weights', 'Essentials'];

const catalog = new Map();
for (const f of fs.readdirSync(path.join(root, 'data')).filter((f) => f.endsWith('.json'))) for (const r of JSON.parse(fs.readFileSync(path.join(root, 'data', f), 'utf8'))) if (!catalog.has(r.sku)) catalog.set(r.sku, r);

const valid = (r) => r && typeof r.id === 'string' && typeof r.sku === 'string' && FIELDS.some(([f]) => f === r.field) && typeof r.correct === 'boolean' && !isNaN(Date.parse(r.at));
const sources = [], seen = new Set(), all = [];
if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  const x = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')), list = (Array.isArray(x) ? x : x.records || []).filter(valid);
  const source = (!Array.isArray(x) && x.source) || f.replace(/\.json$/, '');
  let added = 0; for (const r of list) { if (seen.has(r.id)) continue; seen.add(r.id); all.push({ ...r, source }); added++; }
  sources.push(`${f}: ${list.length} results${x.exportedAt ? `, exported ${x.exportedAt}` : ''}${added < list.length ? ` (${list.length - added} already in another file)` : ''}`);
}
const since = days ? now.getTime() - days * 864e5 : 0, recs = all.filter((r) => Date.parse(r.at) >= since).sort((a, b) => a.at < b.at ? -1 : 1);
const pct = (c, n) => n ? Math.round(100 * c / n) + '%' : '-';
const day = (iso) => { const d = new Date(iso); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const count = (rr) => ({ n: rr.length, c: rr.filter((r) => r.correct).length });
const table = (head, rows) => ['| ' + head.join(' | ') + ' |', '|' + head.map(() => '---').join('|') + '|', ...rows.map((r) => '| ' + r.join(' | ') + ' |')].join('\n');

const out = [`# SKU practice report`, '', `Generated ${now.toISOString()}${days ? `, last ${days} days` : ', all time'}. Sources: ${sources.length ? sources.join('; ') : `none (no export files in ${path.relative(root, dir) || dir})`}.`, ''];
if (!recs.length) out.push('No practice results yet.');
else {
  const o = count(recs), dayset = [...new Set(recs.map((r) => day(r.at)))].sort();
  let streak = 0; const d = new Date(now); if (!dayset.includes(day(d.toISOString()))) d.setDate(d.getDate() - 1); while (new Set(all.map((r) => day(r.at))).has(day(d.toISOString()))) { streak++; d.setDate(d.getDate() - 1); }
  const items = new Map(); for (const r of all) { const s = items.get(r.sku) || { sku: r.sku, category: r.category, list: [] }; s.list.push(r); items.set(r.sku, s); }
  for (const s of items.values()) { s.list.sort((a, b) => a.at < b.at ? -1 : 1); const recent = s.list.slice(-8); s.mastered = recent.length >= 4 && recent.filter((r) => r.correct).length / recent.length >= 0.75; }
  const practised = [...new Set(recs.map((r) => r.sku))];
  out.push(`**${o.n} answers, ${pct(o.c, o.n)} correct**, ${dayset.length} days practiced, ${streak}-day streak, ${practised.filter((s) => items.get(s).mastered).length} of ${practised.length} products mastered (75%+ of the last 8 answers, at least 4).`, '');
  const byField = FIELDS.map(([f, l]) => ({ l, ...count(recs.filter((r) => r.field === f)) })).filter((x) => x.n);
  out.push('## By field', '', table(['Field', 'Answers', 'Correct', 'Accuracy'], byField.map((x) => [x.l, x.n, x.c, pct(x.c, x.n)])), '');
  if (byField.length > 1) { const best = [...byField].sort((a, b) => b.c / b.n - a.c / a.n)[0], worst = [...byField].sort((a, b) => (b.n - b.c) - (a.n - a.c))[0]; out.push(`Most correct: ${best.l} (${pct(best.c, best.n)}). Most missed: ${worst.l} (${worst.n - worst.c} missed).`, ''); }
  const cats = [...new Set(recs.map((r) => r.category))].sort((a, b) => ((ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99)) || a.localeCompare(b));
  const cell = (rr) => { const x = count(rr); return x.n ? `${pct(x.c, x.n)} (${x.n})` : '-'; };
  out.push('## By category', '', table(['Category', ...FIELDS.map(([, l]) => l), 'Overall'], cats.map((c) => { const rr = recs.filter((r) => r.category === c); return [c || 'Other', ...FIELDS.map(([f]) => cell(rr.filter((r) => r.field === f))), cell(rr)]; })), '');
  const prod = practised.map((sku) => { const rr = recs.filter((r) => r.sku === sku); return { sku, name: (catalog.get(sku) || {}).name || '', ...count(rr), missed: FIELDS.filter(([f]) => rr.some((r) => r.field === f && !r.correct)).map(([, l]) => l).join(', '), status: items.get(sku).mastered ? 'Mastered' : 'Learning' }; });
  const miss = prod.filter((p) => p.c < p.n).sort((a, b) => (b.n - b.c) - (a.n - a.c) || a.c / a.n - b.c / b.n).slice(0, 15);
  out.push('## Most missed products', '', miss.length ? table(['SKU', 'Item', 'Answers', 'Correct', 'Missed fields', 'Status'], miss.map((p) => [p.sku, p.name, p.n, pct(p.c, p.n), p.missed, p.status])) : 'None.', '');
  const best = prod.filter((p) => p.c > 0).sort((a, b) => b.c / b.n - a.c / a.n || b.n - a.n).slice(0, 15);
  out.push('## Best known products', '', best.length ? table(['SKU', 'Item', 'Answers', 'Correct', 'Status'], best.map((p) => [p.sku, p.name, p.n, pct(p.c, p.n), p.status])) : 'None.', '');
  out.push('## By day', '', table(['Day', ...FIELDS.map(([, l]) => l), 'Overall'], [...dayset].reverse().map((k) => { const rr = recs.filter((r) => day(r.at) === k); return [k, ...FIELDS.map(([f]) => cell(rr.filter((r) => r.field === f))), cell(rr)]; })), '');
}
const text = out.join('\n');
console.log(text);
if (opt('--md')) { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'report.md'), text + '\n'); console.error('Wrote ' + path.relative(root, path.join(dir, 'report.md'))); }
