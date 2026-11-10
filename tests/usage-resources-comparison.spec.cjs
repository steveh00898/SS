const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const { sql, worker, env, request } = await require('./usage-fixture.cjs')();
  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    let admin = false;
    await page.route('**/*', async route => {
      const r = route.request();
      if (new URL(r.url()).origin !== 'https://usage.test') return route.abort();
      const response = await worker.fetch(new Request(r.url(), {
        method: r.method(),
        headers: { ...r.headers(), ...(admin ? { 'oai-authenticated-user-id': 'owner' } : {}) },
        body: r.method() === 'GET' ? undefined : r.postData()
      }), env);
      await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) });
    });
    await page.goto('https://usage.test/?category=Treadmills');
    const row = page.locator('tr[data-id="sf-t724012"]');
    await row.locator('[data-product-spec]').click();
    await page.locator('#closeProductSpec').click();
    await row.locator('.isv-link').click();
    await page.locator('#closeISV').click();
    await page.locator('#compareToggle').check();
    await row.locator('[data-compare]').check();
    await page.locator('#compareConfirm').click();
    for (let attempt = 0; attempt < 100; attempt++) {
      if (sql.prepare("SELECT COUNT(*) AS n FROM public_telemetry_events WHERE type='compare'").get().n) break;
      await page.waitForTimeout(20);
    }
    assert.equal(sql.prepare("SELECT COUNT(*) AS n FROM public_telemetry_events WHERE type='compare'").get().n, 1);
    for (const kind of ['spec', 'isv']) assert.equal(sql.prepare('SELECT click_count AS n FROM public_link_clicks WHERE item_id=? AND kind=?').get('sf-t724012', kind).n, 1);
    const send = (events, user) => request('/api/public-usage/events', { method: 'POST', body: { events }, user });
    const compare = { eventId: 'comparison-retry-test-12345', type: 'compare', value: 1 };
    assert.equal((await send([compare])).status, 202);
    assert.equal((await send([compare])).status, 202);
    assert.equal((await send([{ ...compare, eventId: 'comparison-admin-test-12345' }], 'owner')).status, 200);
    assert.equal((await send([{ ...compare, eventId: 'comparison-bad-test-12345', itemId: 'sf-t724012' }])).status, 400);
    const report = await (await request('/api/public-usage?kind=spec&category=Rowers', { user: 'owner' })).json();
    assert.equal(report.comparisons.uses, 2, 'comparison count is site-wide and duplicate-safe');
    assert.equal(report.comparisons.daily.reduce((n, day) => n + day.uses, 0), 2);
    const today = new Date().toISOString().slice(0, 10);
    for (const [kind, count] of [['product', 3], ['manual', 1], ['assembly', 1]]) {
      sql.prepare('INSERT INTO public_link_clicks VALUES (?,?,?,?)').run(today, 'sf-t724012', kind, count);
    }
    admin = true;
    await page.goto('https://usage.test/?view=usage');
    const card = page.locator('.usage-card').filter({ has: page.locator('span', { hasText: /^Comparison uses$/ }) });
    await card.locator('strong').filter({ hasText: /^2$/ }).waitFor();
    assert.equal(await page.locator('.usage-resource-line').count(), 5);
    const point = kind => page.locator('[data-resource-point="' + kind + '"]').last();
    const productY = Number(await point('product').getAttribute('cy'));
    const manualY = Number(await point('manual').getAttribute('cy'));
    const assemblyY = Number(await point('assembly').getAttribute('cy'));
    assert(productY < manualY, 'three clicks must plot above one click');
    assert.equal(manualY, assemblyY, 'equal counts must share the same height');
    assert.equal(await page.locator('.usage-area').count(), 0);
    await page.locator('.usage-charts').screenshot({ path: __dirname + '/../preview-screenshots/desktop-resource-lines.png' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => document.querySelector('.usage-chart')?.viewBox.baseVal.width === 320);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('.usage-charts').screenshot({ path: __dirname + '/../preview-screenshots/phone-resource-lines.png' });
    await page.locator('[data-usage-filter="kind"]').selectOption('spec');
    await page.waitForFunction(() => document.querySelectorAll('.usage-resource-line').length === 1);
    assert.equal(await page.locator('.usage-resource-line').getAttribute('data-resource-kind'), 'spec');
    assert.equal(await page.locator('.usage-click-stats strong').first().innerText(), '1');
    console.log('PASS: real guest spec/ISV opens, comparison confirmation, retry deduplication, admin exclusion, scoped resource filters and unstacked chart heights.');
  } finally {
    await browser.close();
    sql.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
