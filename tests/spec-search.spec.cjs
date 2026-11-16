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
  await page.locator('#rows tr').first().waitFor();
  const query=page.locator('#specQuery');
  const resultIds=()=>page.locator('#rows tr').evaluateAll(rows=>rows.map(row=>row.dataset.id));
  assert.equal(await page.locator('#specCategory option').count(),12);
  assert.equal(await page.locator('#specExport').isEnabled(),false);
  assert.equal(await page.locator('#specSource input').count(),2);
  const sameRow=()=>page.evaluate(()=>{const category=document.querySelector('#specCategory').getBoundingClientRect(),query=document.querySelector('#specQuery').getBoundingClientRect();return query.left>category.right&&Math.abs(query.top-category.top)<2;});
  assert(await sameRow());
  assert.equal(await page.locator('#rows tr .c-cat .cat').count(),items.length);
  assert.equal(await page.locator('#rows tr [data-product-spec]').count(),items.length);
  await page.selectOption('#specCategory','Treadmills');
  const chooseField=async name=>{await query.fill(name);await query.press('Enter');};
  await chooseField('18" deck');
  assert.match(await page.locator('#specFieldTitle').innerText(),/Running deck width/);
  assert.equal(await page.locator('#specTolerance').inputValue(),'10');
  assert.equal(await page.locator('#specAmount').inputValue(),'18');
  assert.deepEqual(await resultIds(),['medium-manual']);
  await page.selectOption('#specTolerance','15');
  await page.locator('#specAddNumeric').click();
  assert.deepEqual(await resultIds(),['wide-auto','wide-manual','narrow-manual','medium-manual']);
  await chooseField('incline');
  const file=page.waitForEvent('download');
  await page.locator('#specExport').click();
  const download=await file;
  assert.equal(download.suggestedFilename(),'sunny-spec-search.xlsx');
  // The browser creates a ZIP containing uncompressed worksheet XML.
  const zip=fs.readFileSync(await download.path());
  assert.equal(zip.readUInt32LE(0),0x04034b50);
  assert.match(zip.toString(),/name="Results"/);
  assert.match(zip.toString(),/name="Filters"/);
  assert.match(zip.toString(),/18 in ±15%/);
  assert.match(zip.toString(),/WIDE-AUTO/);
  assert.doesNotMatch(zip.toString(),/machine-width-only|Incline type/);
  await page.locator('[data-spec-answer=Manual]').click();
  assert.deepEqual(await resultIds(),['wide-manual','narrow-manual','medium-manual']);
  await page.locator('#compareToggle').check();
  await page.locator('#rows input[data-compare]').first().check();
  await page.locator('#rows input[data-compare]').last().check();
  await page.locator('#compareConfirm').click();
  await page.locator('#rows [data-product-spec]').first().click();
  assert.equal(await page.locator('#productSpecTitle').innerText(),'Compare Product Specs');
  await page.locator('#closeProductSpec').click();
  await page.locator('#compareToggle').uncheck();
  await page.locator('#specChips [data-spec-remove]').first().click();
  assert.deepEqual(await resultIds(),['wide-manual','narrow-manual','medium-manual']);
  await page.selectOption('#specCategory','Indoor Bikes');
  assert.deepEqual(await resultIds(),[]);
  await page.selectOption('#specCategory','Treadmills');
  assert.deepEqual(await resultIds(),['wide-manual','narrow-manual','medium-manual']);
  await page.selectOption('#specCategory','Indoor Bikes');
  const clearAll=page.locator('#specChips button').first();
  assert.equal(await clearAll.innerText(),'Clear all');
  await clearAll.click();
  assert.deepEqual(await resultIds(),['bike-kg','bike-lb']);
  assert.equal(await page.locator('#specChips button').count(),0);
  await chooseField('8 lbs flywheel');
  assert.deepEqual(await resultIds(),['bike-kg','bike-lb']);
  await page.selectOption('#specCategory','');
  await chooseField('Wi-Fi');
  assert.deepEqual(await page.locator('[data-spec-answer]').allTextContents(),['Yes','No']);
  await page.locator('[data-spec-answer=Yes]').click();
  assert.deepEqual(await resultIds(),['wide-auto']);
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('#rows').isVisible(),true);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  // Check the reported products and preserve the existing workbook value when one is present.
  const models=['SF-T724064','SF-T725880','SF-T723007','SF-T7515'];
  items.splice(0,items.length,...[
   ...require('../data/treadmills.json'),...require('../data/off-sunny-web/items.json')
  ].filter(item=>models.includes(item.sku)));
  await page.setViewportSize({width:1440,height:900});
  await page.goto('https://spec.test/?view=spec-search');
  await query.fill('Bluetooth');
  assert.deepEqual(await page.locator('#specOptions li').allTextContents(),['Bluetooth compatibility']);
  await query.press('Enter');
  assert.deepEqual(await page.locator('[data-spec-answer]').allTextContents(),['Yes','No']);
  await page.locator('[data-spec-answer=Yes]').click();
  const matches=await resultIds();
  assert(matches.includes('sf-t724064'));
  assert(matches.includes('off-sunny-sf-t725880'));
  const row=page.locator('#rows tr[data-id="sf-t724064"]');
  await row.locator('.isv-link').click();
  assert.match(await page.locator('#isvBody [data-isv-column="CI"] td.isv-value').innerText(),/^Yes\s*\(From Product Spec\)$/);
  await page.locator('#closeISV').click();
  await page.locator('#compareToggle').check();
  for(const id of matches)await page.locator('[data-compare="'+id+'"]').check();
  await page.locator('#compareConfirm').click();
  const connectivity=page.locator('#isvBody [role=row]').filter({has:page.getByRole('rowheader',{name:'Bluetooth Connectivity',exact:true})});
  await row.locator('.isv-link').click();
  assert.equal(await connectivity.getByText('(From Product Spec)',{exact:true}).count(),2);
  assert.match(await page.locator('#isvBody').innerText(),/Spec Search matches/);
  await page.locator('#closeISV').click();
  await row.locator('[data-product-spec]').click();
  assert.match(await page.locator('#productSpecBody').innerText(),/Spec Search matches/);
  await page.locator('#closeProductSpec').click();
  await page.locator('#compareToggle').uncheck();
  await page.locator('[data-spec-clear]').click();
  await page.locator('#specSource input[value=isv]').check();
  await chooseField('Bluetooth');
  await page.locator('[data-spec-answer=Yes]').click();
  assert.deepEqual((await resultIds()).sort(),['off-sunny-sf-t7515','sf-t723007']);
  for(const match of await page.locator('#rows .ss-match').allTextContents())assert.match(match,/Bluetooth compatibility: Yes.*From ISV/);
  await page.locator('#specSource input[value=product]').check();
  await chooseField('Bluetooth');
  await page.locator('[data-spec-answer=Yes]').click();
  assert.deepEqual(await resultIds(),['off-sunny-sf-t7515']);
 }finally{await browser.close();}
 console.log('PASS: category suggestions, live numeric and text matching, combined filters, shared Catalog table, compare, mobile layout and confirmed-only Excel export.');
})().catch(e=>{console.error(e);process.exitCode=1;});
