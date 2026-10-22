// Screenshots of the latest app without a browser tool: starts scripts/preview.mjs on a free port,
// drives headless Chromium through Playwright from the terminal (the same way tests/ do), and saves
// PNGs to preview-screenshots/. Usage: npm run screenshots
// Browser: CHROMIUM=/path/to/chrome, else /usr/bin/chromium if present, else Playwright's default.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'preview-screenshots');
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules/playwright'); }

const freePort = () => new Promise((resolve) => { const s = net.createServer().listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); }); });

(async () => {
  const port = await freePort();
  const server = spawn(process.execPath, [path.join(root, 'scripts/preview.mjs'), String(port)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((resolve, reject) => { server.stdout.on('data', (d) => /Preview:/.test(d) && resolve()); server.on('exit', (c) => reject(Error('preview exited ' + c))); });
  const base = `http://localhost:${port}`;
  const executablePath = process.env.CHROMIUM || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  const browser = await playwright.chromium.launch({ headless: true, executablePath, args: ['--no-sandbox'] });
  fs.mkdirSync(outDir, { recursive: true });
  const errors = [], saved = [];
  const shot = async (page, name) => { const file = path.join(outDir, name + '.png'); await page.screenshot({ path: file }); saved.push(path.relative(root, file)); };
  try {
    for (const [label, viewport, scale] of [['desktop', { width: 1440, height: 1000 }, 1], ['phone', { width: 390, height: 844 }, 2]]) {
      const page = await browser.newPage({ viewport, deviceScaleFactor: scale });
      page.on('pageerror', (e) => errors.push(`${label}: ${e.message}`));
      await page.goto(base + '/?category=All');
      await page.waitForFunction(() => document.querySelectorAll('#rows tr').length > 100, null, { timeout: 20000 });
      await page.waitForTimeout(800); await shot(page, `${label}-1-catalog`);
      await page.goto(base + '/?category=Treadmills');
      await page.waitForFunction(() => document.querySelectorAll('#rows tr').length > 0, null, { timeout: 20000 });
      await page.waitForTimeout(800); await shot(page, `${label}-2-treadmills`);
      await page.locator('#rows [data-zoom]').first().click();
      await page.keyboard.press('ArrowRight'); await page.waitForTimeout(500);
      await shot(page, `${label}-3-picture-viewer`);
      console.log(`${label}: ${await page.textContent('#lbTitle')} | ${await page.textContent('#lbSkuTop')} | ${await page.textContent('#lbPos')}`);
      await page.close();
    }
  } finally { await browser.close(); server.kill(); }
  console.log('Saved:\n  ' + saved.join('\n  '));
  if (errors.length) { console.error('Page errors:\n  ' + errors.join('\n  ')); process.exit(1); }
})().catch((e) => { console.error(e); process.exit(1); });
