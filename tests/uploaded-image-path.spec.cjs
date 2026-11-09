const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

(async () => {
  const html = fs.readFileSync(__dirname + '/../app/index.html', 'utf8');
  const row = { id: 'sf-db01', sku: 'SF-DB01', name: 'Dumbbell', category: 'Weights', imageAssetId: 'abc-def.webp', imageUrl: '' };
  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium' });
  try {
    for (const artifact of [false, true]) {
      const page = await browser.newPage();
      const origin = 'https://catalog.test';
      const path = (artifact ? '/_blob/' : '/api/assets/') + row.imageAssetId;
      const mock = `window.claude={use:async name=>name==='db'?{collection:()=>({onSnapshot(callback){callback({docs:[{id:${JSON.stringify(row.id)},exists:true,data:()=>(${JSON.stringify(row)})}]});return()=>{};}})}:null};`;
      await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== origin) return route.abort();
        if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: (artifact ? '<script>' + mock + '</script>' : '') + html });
        if (url.pathname === '/api/session') return route.fulfill(artifact ? { status: 404 } : { json: { canWrite: true } });
        if (url.pathname === '/api/items') return route.fulfill({ json: [row] });
        if (url.pathname === path) return route.fulfill({ contentType: 'image/gif', body: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64') });
        return route.abort();
      });
      await page.goto(origin);
      const thumb = page.locator('#rows .thumb img');
      await thumb.waitFor();
      assert.equal(await thumb.getAttribute('src'), path);
      await page.waitForFunction(() => document.querySelector('#rows .thumb img')?.naturalWidth > 0);
      await thumb.click();
      assert.equal(await page.locator('#lbImg').getAttribute('src'), path);
      await page.close();
    }
    console.log('PASS: saved upload IDs display in the catalog and image viewer in both runtimes.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
