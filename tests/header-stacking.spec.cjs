const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless:true, executablePath:'/usr/bin/chromium' });
  try {
    const page = await browser.newPage({ viewport:{ width:1440, height:650 } });
    const rows = fs.readdirSync(__dirname+'/../data').filter(file=>file.endsWith('.json'))
      .flatMap(file=>require('../data/'+file)).map(item=>({...item,imageUrl:''}));
    const mock = `window.fetch=async path=>Response.json(path==='/api/session'?{canWrite:true}:${JSON.stringify(rows)});`;
    await page.setContent('<script>'+mock+'</script>'+fs.readFileSync(__dirname+'/../app/index.html','utf8'));
    await page.waitForFunction(()=>document.querySelectorAll('#rows tr').length===156);
    const scrollbar=page.locator('#catalogScroll');
    await scrollbar.waitFor({state:'visible'});
    await scrollbar.evaluate(bar=>{bar.scrollLeft=bar.scrollWidth;});
    await page.waitForFunction(()=>{
      const box=document.querySelector('.tablebox');
      return box.scrollLeft>0&&box.scrollLeft===box.scrollWidth-box.clientWidth;
    });
    assert(await scrollbar.evaluate(bar=>Math.abs(bar.getBoundingClientRect().left-
      document.querySelector('.tablebox').getBoundingClientRect().left)<=2),'the full scrollbar stays in view at the far right');
    await page.locator('.tablebox').evaluate(box=>{box.scrollLeft=0;box.scrollTop=150;});
    await page.waitForFunction(()=>document.querySelector('#catalogScroll').scrollLeft===0);
    const placement=await scrollbar.evaluate(bar=>{
      const head=document.querySelector('#catalogHead tr:first-child th[data-col="sku"]');
      return Math.abs(head.getBoundingClientRect().bottom-bar.getBoundingClientRect().top);
    });
    assert(placement<=1,'the scrollbar remains just below the sticky headers');
    for (const height of [898, 650, 480]) {
      await page.setViewportSize({ width: 1440, height });
      const layout = await page.evaluate(() => {
        const table = document.querySelector(".tablebox");
        const header = document.querySelector(".top");
        table.scrollTop = 150;
        return {
          pageOverflow: document.documentElement.scrollHeight - innerHeight,
          tableScroll: table.scrollTop,
          tableBottom: table.getBoundingClientRect().bottom,
          headerTop: header.getBoundingClientRect().top
        };
      });
      assert.equal(layout.pageOverflow, 0, "the desktop catalog fits the viewport");
      assert(layout.tableScroll > 0, "the catalog table still scrolls");
      assert(layout.tableBottom <= height, "the table stays inside the viewport");
      assert.equal(layout.headerTop, 0, "the header stays visible");
    }
    await page.locator("#bulkBtn").click();
    assert(await page.evaluate(() => document.querySelector(".tablebox").getBoundingClientRect().bottom <= document.querySelector("#bulkbar").getBoundingClientRect().top));
    await page.setViewportSize({ width: 390, height: 844 });
    await scrollbar.waitFor({state:'hidden'});
    assert(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight), "mobile keeps page scrolling");
    console.log("PASS: desktop catalog fits the viewport, with internal table scrolling, visible bulk controls and mobile page scrolling.");
  } finally {
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
