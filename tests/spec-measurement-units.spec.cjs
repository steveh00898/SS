const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

(async () => {
  const models = ['SF-T1407M', 'SF-T1407SMART', 'SF-T724064'];
  const products = [...require('../data/treadmills.json'), ...require('../data/off-sunny-web/items.json')];
  const rows = models.map(sku => ({ ...products.find(item => item.sku === sku), imageUrl: '' }));
  rows[0].specDetails = { ...rows[0].specDetails, values: { ...rows[0].specDetails.values, productWeight: '21.18 kg' } };
  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const mock = `window.fetch=async path=>Response.json(path==='/api/session'?{canWrite:true}:${JSON.stringify(rows)});window.history.replaceState=()=>{};window.URLSearchParams=class{get(key){return ({category:'Treadmills',source:'all'})[key]??null}};`;
    await page.setContent('<script>' + mock + '</script>' + fs.readFileSync(__dirname + '/../app/index.html','utf8'));
    await page.waitForFunction(() => document.querySelectorAll('#rows tr').length === 3);
    const spec = item => page.locator(`[data-product-spec="${item.id}"]`);
    const isv = item => page.locator(`#rows tr[data-id="${item.id}"] .isv-link`);
    const isvField = column => page.locator(`#isvBody [data-isv-column=${column}] .isv-value`);
    await spec(rows[0]).click();
    const productWeight = page.locator('#productSpecBody [data-spec-field=productWeight] td');
    assert.equal(await productWeight.innerText(), '21.18 kg');
    assert.equal(await productWeight.evaluate(el => el.classList.contains('spec-different')), false);
    await page.keyboard.press('Escape');
    await isv(rows[0]).click();
    assert.equal(await isvField('AO').innerText(), '46.7 lb');
    assert.equal(await isvField('AO').evaluate(el => el.classList.contains('isv-different')), false);
    assert.equal(await isvField('AP').innerText(), '49 in');
    assert.equal(await isvField('AS').innerText(), '49 × 23 × 50 in (L × W × H)');
    assert.equal(await isvField('AL').innerText(), '0 ft³');
    assert.equal(await isvField('AT').innerText(), '20 × 23 × 50 in (L × W × H)');
    await page.keyboard.press('Escape');
    await isv(rows[1]).click();
    assert.equal(await isvField('AG').innerText(), '50.2 × 22.7 × 7.5 in (L × W × H)');
    assert.equal(await isvField('AB').innerText(), '50.2 in');
    await page.keyboard.press('Escape');

    await page.locator('#compareToggle').check();
    const firstRow = page.locator("#rows tr").first();
    const firstCheckbox = firstRow.locator("[data-compare]");
    await firstRow.locator("td").first().click();
    assert.equal(await firstCheckbox.isChecked(), true);
    await firstRow.locator("td").first().click();
    assert.equal(await firstCheckbox.isChecked(), false);
    for (const item of rows) await page.locator(`[data-compare="${item.id}"]`).check();
    await page.locator('#compareConfirm').click();
    const comparisonField = (dialog, label) => page.locator(`${dialog} .spec-compare-row`).filter({ has: page.getByRole('rowheader', { name: label, exact: true }) });
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await spec(rows[0]).click();
      assert.equal(await comparisonField('#productSpecBody', 'Net weight (product)').getByRole('cell').first().innerText(), '21.18 kg');
      await page.keyboard.press('Escape');
      await isv(rows[2]).click();
      const cell = comparisonField('#isvBody', 'Product Weight').getByRole('cell').first();
      assert.equal(await cell.innerText(), '48.4 lb');
      assert(await cell.evaluate(el => el.classList.contains('spec-compare-different')));
      await page.keyboard.press('Escape');
    }
    const elliptical= require('../data/ellipticals.json').find(item => item.sku === 'SF-E905SMART');
    const ellipsePage=await browser.newPage({viewport:{width:1440,height:900}});
    ellipsePage.on('pageerror',error=>errors.push(error.message));
    const ellipseMock=`window.fetch=async path=>Response.json(path==='/api/session'?{canWrite:true}:${JSON.stringify([{...elliptical,imageUrl:''}])});window.history.replaceState=()=>{};`;
    await ellipsePage.setContent('<script>'+ellipseMock+'</script>'+fs.readFileSync(__dirname+'/../app/index.html','utf8'));
    await ellipsePage.locator('#rows .isv-link').click();
    const limit=ellipsePage.locator('#isvBody [data-isv-column=BV] .isv-value');
    assert.equal((await limit.innerText()).split('\n')[0], '330 lb');
    assert.doesNotMatch(await limit.innerText(), /estimated unit/i);
    assert.equal(await limit.getByRole('link',{name:'220 lb max user weight'}).count(),1);
    assert.equal(await limit.evaluate(el=>el.classList.contains('isv-different')),false);
    assert.deepEqual(errors, []);
    console.log('PASS: verified measurement units, equivalent conversions, real discrepancies, unknown units and comparison layouts.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
