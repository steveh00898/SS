const assert = require('node:assert/strict');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const { links } = require('../data/off-sunny-web/verified-product-links-20261124.json');
const catalog = require('../data/off-sunny-web/items.json');
const migration = fs.readFileSync(require('node:path').join(__dirname, '../drizzle/0009_verified_product_links.sql'), 'utf8');
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE items (id TEXT PRIMARY KEY, data TEXT NOT NULL)');
const insert = db.prepare('INSERT INTO items VALUES (?, ?)');
const read = id => JSON.parse(db.prepare('SELECT data FROM items WHERE id = ?').get(id).data);
for (const link of links) {
  const item = catalog.find(row => row.id === link.id);
  assert.equal(item.sku, link.sku);
  assert.equal(item.url, link.url);
  const url = new URL(link.url);
  assert.equal(url.origin, 'https://sunnyhealthfitness.com');
  assert.equal(url.searchParams.get('variant'), link.variant);
  insert.run(link.id, JSON.stringify({ sku: link.sku, url: '', custom: 'keep' }));
}
const [first, second] = links;
db.prepare('UPDATE items SET data = ? WHERE id = ?').run(JSON.stringify({ sku: first.sku, url: 'https://example.com/custom' }), first.id);
db.prepare('UPDATE items SET data = ? WHERE id = ?').run(JSON.stringify({ sku: 'DIFFERENT' }), second.id);
for (let run = 0; run < 2; run++) {
  db.exec(migration);
  assert.deepEqual(read(first.id), { sku: first.sku, url: 'https://example.com/custom' });
  assert.deepEqual(read(second.id), { sku: 'DIFFERENT' });
  for (const { id, sku, url } of links.slice(2)) assert.deepEqual(read(id), { sku, url, custom: 'keep' });
}
assert.equal(read('off-sunny-sf-e326015-gy').url.split('variant=')[1], '68215934484844');
