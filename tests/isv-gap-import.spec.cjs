const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const archive = require('../data/off-sunny-web/items.json');
const audit = require('../data/off-sunny-web/isv-gap-audit-20261111.json');
const isv = require('../data/isv/off-sunny-products.json');

(async () => {
  const { sql, request } = await require('./usage-fixture.cjs')();
  const batch = archive.filter(item => item.importBatch === 'isv-shf-gap-20261111');
  const older = archive.filter(item => item.importBatch !== 'isv-shf-gap-20261111');
  try {
    assert.equal(batch.length, 263);
    assert.equal(audit.resources.length, batch.length);
    assert.equal(new Set(archive.map(item => item.id)).size, archive.length);
    for (const item of batch) {
      const source = audit.resources.find(row => row.id === item.id);
      const detail = isv.items.find(row => row.id === item.id);
      assert.equal(detail.row, source.workbookRow);
      assert.equal(detail.sku, item.sku);
      for (const sensitive of ['H', 'I', 'K', 'R', 'S', 'W', 'X', 'Y']) {
        assert(!Object.hasOwn(detail.fields, sensitive), 'internal fields omitted from imported public specs');
      }
      if (item.imageUrl) {
        const bytes = fs.readFileSync(__dirname + '/../data/images/off-sunny-web/' + item.imageUrl.split('/').pop());
        assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), source.imageEvidence.sha256);
      }
    }
    global.APP_CATALOG.push(...older);
    const baseline = await (await request('/api/items')).json();
    assert.equal(baseline.length, 626);
    const concurrent = { ...batch.at(-1), name: 'Owner-maintained catalog record' };
    sql.prepare('INSERT INTO items (id,data) VALUES (?,?)').run('owner-catalog-item', JSON.stringify(concurrent));
    global.APP_CATALOG.push(...batch);
    const added = await (await request('/api/items')).json();
    assert.equal(added.length, 889);
    const byId = new Map(added.map(item => [item.id, item]));
    for (const item of baseline) assert.deepEqual(byId.get(item.id), item);
    assert.equal(byId.get('owner-catalog-item').name, concurrent.name);
    assert(!byId.has(concurrent.id));
    const bike = byId.get('off-sunny-sf-b1001');
    const elliptical = byId.get('off-sunny-sf-e1405');
    assert(bike.imageUrl && bike.resourceLinks.manualUrl.includes('SF-B1001'));
    assert.equal(elliptical.imageUrl, '');
    assert.equal(elliptical.resourceLinks.manualUrl, null);
    assert.equal(elliptical.resourceLinks.assemblyUrl, null);
    assert.match(elliptical.productSpecs.driveResistanceSystem, /Chain drive/);

    const originalFetch = global.fetch;
    const imageBytes = fs.readFileSync(__dirname + '/../data/images/off-sunny-web/' + bike.imageUrl.split('/').pop());
    delete global.APP_SHEET_IMAGES[bike.imageUrl];
    let assetUrl;
    global.fetch = async url => {
      assetUrl = String(url);
      return new Response(imageBytes, { status: 200 });
    };
    try {
      const response = await request(bike.imageUrl);
      assert.equal(response.status, 200);
      assert.match(assetUrl, /\/09ed2918888594ad0eb6042321866a5d6994bc0e\/data\/images\/off-sunny-web\/off-sunny-sf-b1001-isv-gap-v1\.jpg$/);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), imageBytes);
    } finally {
      global.fetch = originalFetch;
    }

    sql.prepare('DELETE FROM items WHERE id=?').run(bike.id);
    const reread = await (await request('/api/items')).json();
    assert(!reread.some(item => item.id === bike.id));
    console.log('PASS: 263 exact-model catalog records, verified evidence, pinned image, owner edits and duplicate SKU preserved, insert once.');
  } finally {
    sql.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
