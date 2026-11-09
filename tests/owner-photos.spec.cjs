const assert = require('node:assert/strict');
const fs = require('node:fs');
const archive = require('../data/off-sunny-web/items.json');

(async () => {
  const { sql, env, worker, request } = await require('./usage-fixture.cjs')();
  const photos = archive.filter(item => item.imageAvailability === 'owner-supplied');
  assert.equal(photos.length, 15);
  const ids = new Set(photos.map(item => item.id));
  const originalFetch = global.fetch;
  try {
    const current = [...global.APP_CATALOG];
    global.APP_CATALOG.push(...archive.map(item => ids.has(item.id) ? { ...item, imageUrl: '', imageAvailability: 'unavailable' } : item));
    await request('/api/items');
    const [added, uploaded, linked, renamed, deleted] = photos;
    sql.prepare("UPDATE items SET data=json_set(data,'$.imageAssetId','abc-def.webp') WHERE id=?").run(uploaded.id);
    sql.prepare("UPDATE items SET data=json_set(data,'$.imageUrl','/existing.jpg') WHERE id=?").run(linked.id);
    sql.prepare("UPDATE items SET data=json_set(data,'$.sku','REVIEWED-SKU') WHERE id=?").run(renamed.id);
    sql.prepare('DELETE FROM items WHERE id=?').run(deleted.id);
    global.APP_CATALOG.splice(0, global.APP_CATALOG.length, ...current, ...archive);

    const records = await (await request('/api/items')).json();
    const byId = new Map(records.map(item => [item.id,item]));
    assert.equal(byId.get(added.id).imageUrl, added.imageUrl);
    assert.equal(byId.get(added.id).photoChecked, false);
    assert.equal(byId.get(uploaded.id).imageUrl, '');
    assert.equal(byId.get(uploaded.id).imageAssetId, 'abc-def.webp');
    assert.equal(byId.get(linked.id).imageUrl, '/existing.jpg');
    assert.equal(byId.get(renamed.id).imageUrl, '');
    assert(!byId.has(deleted.id));

    const filename = added.imageUrl.split('/').pop();
    const bytes = fs.readFileSync(__dirname + '/../data/images/off-sunny-web/' + filename);
    delete global.APP_SHEET_IMAGES[added.imageUrl];
    const calls = [];
    global.fetch = async url => { calls.push(String(url)); return new Response(bytes); };
    const image = await worker.fetch(new Request('https://usage.test' + added.imageUrl), env);
    assert.equal(image.status, 200);
    assert.deepEqual(Buffer.from(await image.arrayBuffer()), bytes);
    assert.deepEqual(calls, ['https://raw.githubusercontent.com/steveh00898/SS/7fe18e46fe51e084a663fe70e3a37802341c7d20/data/images/off-sunny-web/' + filename]);

    sql.prepare("UPDATE items SET data=json_set(data,'$.imageUrl','') WHERE id=?").run(added.id);
    const repeated = await (await request('/api/items')).json();
    assert.equal(repeated.find(item => item.id === added.id).imageUrl, '');
    console.log('PASS: 15 matched photos, guarded backfill, pinned image bytes and no reapplication.');
  } finally {
    global.fetch = originalFetch;
    sql.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
