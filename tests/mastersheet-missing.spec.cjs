const assert = require('node:assert/strict');
const archive = require('../data/off-sunny-web/items.json');
const audit = require('../data/pricing/us-mastersheet-v1-audit.json');

(async () => {
  const { sql, request } = await require('./usage-fixture.cjs')();
  try {
    const batch = archive.filter(item => item.importBatch === 'us-mastersheet-v1-missing');
    const older = archive.filter(item => item.importBatch !== 'us-mastersheet-v1-missing');
    assert.equal(batch.length, 136);
    assert.deepEqual(batch.map(item => [item.sku, item.mastersheetRow, item.mastersheetStatus]),
      audit.notInApp.map(row => [row.sku, row.row, row.status]));
    assert.equal(new Set(archive.map(item => item.id)).size, archive.length);
    global.APP_CATALOG.push(...older);
    const before = await (await request('/api/items')).json();
    assert.equal(before.length, 490);

    global.APP_CATALOG.push(...batch);
    const response = await (await request('/api/items')).json();
    assert.equal(response.length, 626);
    const byId = new Map(response.map(item => [item.id, item]));
    for (const item of before) assert.deepEqual(byId.get(item.id), item);
    for (const item of batch) assert.deepEqual(byId.get(item.id), item);
    assert(byId.has('no-077s'));
    assert(byId.has('off-sunny-no-077-s'));

    sql.prepare('DELETE FROM items WHERE id=?').run(batch[0].id);
    const after = await (await request('/api/items')).json();
    assert.equal(after.length, 625);
    assert(!after.some(item => item.id === batch[0].id));
    console.log('PASS: all 136 Mastersheet gaps inserted once, with older records and variant identities preserved.');
  } finally {
    sql.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
