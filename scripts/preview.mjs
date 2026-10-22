// Local preview of the latest app: serves app/index.html with the checked-in catalog
// (data/*.json + data/images/) behind an in-memory copy of the app API.
// Edits made in the preview stay in memory and are lost when it stops.
// Usage: npm run preview   (or: node scripts/preview.mjs [port])
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || process.env.PORT || 4173);

const items = new Map();
for (const file of fs.readdirSync(path.join(root, 'data')).filter((f) => f.endsWith('.json')).sort()) {
  const dir = file.replace(/\.json$/, '');
  for (const row of JSON.parse(fs.readFileSync(path.join(root, 'data', file), 'utf8'))) {
    const picture = path.join('data/images', dir, row.id + '.jpg');
    items.set(row.id, { ...row, imageAssetId: '', imageUrl: fs.existsSync(path.join(root, picture)) ? '/' + picture : '' });
  }
}
const uploads = new Map();

const json = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
const readBody = (req) => new Promise((resolve) => { const chunks = []; req.on('data', (c) => chunks.push(c)); req.on('end', () => resolve(Buffer.concat(chunks))); });

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = decodeURIComponent(url.pathname);
  if (p === '/api/session') return json(res, 200, { canWrite: true });
  if (p === '/api/items' && req.method === 'GET') return json(res, 200, [...items.values()]);
  if (p.startsWith('/api/items/')) {
    const id = p.slice('/api/items/'.length);
    if (req.method === 'DELETE') { items.delete(id); return json(res, 200, { ok: true }); }
    if (req.method === 'PUT') {
      const { value, createOnly } = JSON.parse((await readBody(req)).toString() || '{}');
      if (createOnly && items.has(id)) return json(res, 409, { error: 'That SKU is already in the catalog.' });
      items.set(id, { ...value, id }); return json(res, 200, { ok: true });
    }
  }
  if (p === '/api/assets' && req.method === 'POST') {
    const id = 'preview-' + (uploads.size + 1);
    uploads.set(id, { type: req.headers['content-type'] || 'application/octet-stream', body: await readBody(req) });
    return json(res, 200, { id });
  }
  if (p.startsWith('/api/assets/') && uploads.has(p.slice(12))) {
    const a = uploads.get(p.slice(12)); res.writeHead(200, { 'Content-Type': a.type }); return res.end(a.body);
  }
  if (p.startsWith('/data/images/')) {
    const file = path.join(root, p);
    if (file.startsWith(path.join(root, 'data/images') + path.sep) && fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' }); return fs.createReadStream(file).pipe(res);
    }
    res.writeHead(404); return res.end();
  }
  if (p.startsWith('/api/')) return json(res, 404, { error: 'Not available in the preview.' });
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(path.join(root, 'app/index.html')));
}).listen(port, () => console.log(`Preview: http://localhost:${port}  (${items.size} products, app/index.html from this checkout)`));
