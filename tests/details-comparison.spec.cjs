const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

(async () => {
  const current = require('../data/ellipticals.json');
  const archive = require('../data/off-sunny-web/items.json');
  const models = ['SF-E3875', 'SF-E3889SMART', 'SF-E321006'];
  const products = models.map(sku => [...current, ...archive].find(item => item.sku === sku));
  const missing = { ...products[0], id: 'off-sunny-missing-isv', sku: 'FIXTURE-404', name: 'Missing ISV fixture' };
  const rows = [...products, missing].map(item => ({ ...item, imageUrl: '' }));
  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const mock = `window.fetch=async path=>Response.json(path==='/api/session'?{canWrite:true}:${JSON.stringify(rows)});window.history.replaceState=()=>{};window.URLSearchParams=class{get(key){return ({category:'Ellipticals',source:'all'})[key]??null}};`;
    await page.setContent('<script>' + mock + '</script>' + fs.readFileSync(__dirname + '/../app/index.html','utf8'));
    await page.waitForFunction(() => document.querySelectorAll('#rows tr').length === 4);
    const spec = product => page.locator(`[data-product-spec="${product.id}"]`);
    const isv = product => page.locator(`#rows tr[data-id="${product.id}"] .isv-link`);
    const select = product => page.locator(`[data-compare="${product.id}"]`);
    const order = () => page.locator('#rows tr').evaluateAll(items => items.map(row => row.dataset.id));
    const assertColumns = async (dialog, clicked, expected) => {
      const names = await page.locator(`${dialog} .spec-compare-head [role=columnheader]`).evaluateAll(headers => headers.slice(1).map(header => header.firstChild.textContent));
      assert.deepEqual(names, [clicked.id, ...expected.filter(id => id !== clicked.id)].map(id => rows.find(row => row.id === id).sku));
      const body = page.locator(`${dialog} .product-spec-body`);
      assert(await body.evaluate(el => el.scrollWidth <= el.clientWidth + 1));
      await body.evaluate(el => { el.scrollTop = 500; });
      assert(await body.evaluate(el => el.querySelector('.spec-compare-head').getBoundingClientRect().top >= el.getBoundingClientRect().top - 1));
    };

    await page.locator('#compareToggle').check();
    for (const product of products) await select(product).check();
    await spec(products[0]).click();
    assert.equal(await page.locator('#productSpecTitle').innerText(), 'Product Spec · SF-E3875');
    await page.keyboard.press('Escape');
    await page.locator('#compareConfirm').click();
    const applied = await order();
    assert.equal(applied.length, 3);

    await select(products[2]).uncheck();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await spec(products[0]).click();
      await assertColumns('#productSpecDialog', products[0], applied);
      await page.keyboard.press('Escape');
      assert(await spec(products[0]).evaluate(el => document.activeElement === el));
      await isv(products[1]).click();
      await assertColumns('#isvDialog', products[1], applied);
      await page.keyboard.press('Escape');
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('#compareConfirm').click();
    await isv(products[0]).click();
    await assertColumns('#isvDialog', products[0], await order());
    await page.keyboard.press('Escape');
    await page.locator('#compareToggle').uncheck();
    await page.locator('#compareToggle').check();
    await select(products[0]).check();
    await select(missing).check();
    await page.locator('#compareConfirm').click();
    await isv(products[0]).click();
    assert.equal(await page.locator('#isvDialog .spec-compare-head').innerText().then(value => value.includes('FIXTURE-404')), true);
    assert(await page.locator('#isvDialog .spec-compare-missing').count());
    assert.deepEqual(errors, []);
    console.log('PASS: applied comparison order, clicked product first, sticky columns, phone fit, focus restoration and missing ISV.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
