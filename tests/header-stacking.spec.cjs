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
    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
    const result = await page.evaluate(()=>{
      const header=document.querySelector('.top').getBoundingClientRect();
      const panel=document.querySelector('.side').getBoundingClientRect();
      const overlap=Math.min(header.bottom,panel.bottom)-Math.max(header.top,panel.top);
      const at=document.elementFromPoint(panel.left+12,Math.max(header.top,panel.top)+overlap/2);
      return {scroll:window.scrollY,overlap,headerOnTop:Boolean(at?.closest('.top'))};
    });
    assert(result.scroll>0,'the outer page scrolled');
    assert(result.overlap>0,'the panel crosses behind the header at the bottom of the page');
    assert(result.headerOnTop,'the Sunny header is painted above the sidebar');
    console.log('PASS: the Sunny header stays above the sidebar during outer page scrolling.');
  } finally {
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
