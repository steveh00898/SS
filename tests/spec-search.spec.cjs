const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium'});
 try{
  const page=await browser.newPage();
  const html=fs.readFileSync(__dirname+'/../app/index.html','utf8');
  const product=(id,category,price,values,productSpecs={})=>({
   id,sku:id.toUpperCase(),name:id,category,price,specDetails:{values},productSpecs
  });
  const tread=(id,price,width,incline,wifi)=>product(id,'Treadmills',price,{inclineType:incline,wifi},{workoutAreaWidthIn:width});
  const items=[
   tread('wide-auto',400,20,'Automatic','Yes'),
   tread('wide-manual',500,20,'Manual','No'),
   tread('medium-manual',700,18,'Manual'),
   tread('narrow-manual',600,16,'Manual'),
   product('machine-width-only','Treadmills',200,{keyDimensions:'48 × 18 × 40 in'}),
   product('bike-kg','Indoor Bikes',299,{flywheelWeight:'3.6287 kg'}),
   product('bike-lb','Indoor Bikes',399,{flywheelWeight:'8 lb'})
  ];
  items[2].catalogSource='off-sunny-web';
  await page.route('**/*',route=>{
   const u=new URL(route.request().url());
   if(u.origin!=='https://spec.test')return route.abort();
   if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
   if(u.pathname==='/api/items')return route.fulfill({json:items});
   return route.fulfill({json:{canWrite:false,practice:false,admin:false}});
  });
  await page.goto('https://spec.test/');
  await page.locator('#specSearchToggle').click();
  await page.locator('#specResultRows tr').first().waitFor();
  const query=page.locator('#specQuery');
  const resultIds=()=>page.locator('#specResultRows tr').evaluateAll(rows=>rows.map(row=>row.dataset.specResult));
  assert.equal(await page.locator('#specCategory option').count(),12);
  assert.equal(await page.locator('#specExport').isEnabled(),false);
  await page.selectOption('#specCategory','Treadmills');
  await query.fill('18" deck');
  assert.match(await page.locator('#specOptions li').first().innerText(),/Running deck width · Exactly 18 in/);
  assert.deepEqual(await resultIds(),['medium-manual']);
  await page.locator('#specOptions li').filter({hasText:'Running deck width · At least 18 in'}).click();
  assert.deepEqual(await resultIds(),['wide-auto','wide-manual','medium-manual']);
  await query.fill('manual incline');
  assert.deepEqual(await resultIds(),['wide-manual','medium-manual']);
  const file=page.waitForEvent('download');
  await page.locator('#specExport').click();
  const download=await file;
  assert.equal(download.suggestedFilename(),'sunny-spec-search.xlsx');
  // The browser creates a ZIP containing uncompressed worksheet XML.
  const zip=fs.readFileSync(await download.path());
  assert.equal(zip.readUInt32LE(0),0x04034b50);
  assert.match(zip.toString(),/name="Results"/);
  assert.match(zip.toString(),/name="Filters"/);
  assert.match(zip.toString(),/At least 18 in/);
  assert.match(zip.toString(),/WIDE-AUTO/);
  assert.doesNotMatch(zip.toString(),/NARROW-MANUAL|machine-width-only|Incline type/);
  await query.press('Enter');
  assert.deepEqual(await resultIds(),['wide-manual','medium-manual']);
  await page.locator('#specResultRows input').first().check();
  await page.locator('#specResultRows input').last().check();
  await page.locator('#specCompare').click();
  assert.equal(await page.locator('#productSpecTitle').innerText(),'Compare Product Specs');
  await page.locator('#closeProductSpec').click();
  await page.selectOption('#specSource','current');
  assert.deepEqual(await resultIds(),['wide-manual']);
  await page.selectOption('#specSource','all');
  await page.locator('#specChips button').first().click();
  assert.deepEqual(await resultIds(),['wide-manual','narrow-manual','medium-manual']);
  await page.selectOption('#specCategory','Indoor Bikes');
  await query.fill('8 lbs flywheel');
  assert.deepEqual(await resultIds(),['bike-kg','bike-lb']);
  await page.selectOption('#specCategory','');
  await query.fill('Wi-Fi yes');
  assert.deepEqual(await resultIds(),['wide-auto']);
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('#specResultRows').isVisible(),true);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }finally{await browser.close();}
 console.log('PASS: category suggestions, live numeric and text matching, combined filters, source scope, compare, mobile layout and confirmed-only Excel export.');
})().catch(e=>{console.error(e);process.exitCode=1;});
