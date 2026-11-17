const assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require('playwright');
// Spec Search answers partition a category: Yes + No + Unavailable (and every other answer) add up to the category total,
// and choosing each answer returns exactly that many products. Uses the real catalog.
(async()=>{
 const root=__dirname+'/..';
 const items=[...fs.readdirSync(root+'/data').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(root+'/data/'+f,'utf8'))),...JSON.parse(fs.readFileSync(root+'/data/off-sunny-web/items.json','utf8'))].map(r=>({...r,imageUrl:''}));
 const html=fs.readFileSync(root+'/app/index.html','utf8');
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!=='https://spec.test')return route.abort();if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:html});if(u.pathname==='/api/items')return route.fulfill({json:items});return route.fulfill({json:{canWrite:false,practice:false,admin:false}});});
  await page.goto('https://spec.test/');await page.locator('#specSearchToggle').click();await page.locator('#rows tr').first().waitFor();
  const count=async()=>Number((await page.locator('#rows tr').count()));
  for(const [category,field] of [['Treadmills','wi-fi'],['Treadmills','bluetooth'],['Treadmills','deck type'],['Indoor Bikes','bluetooth'],['Ellipticals','device holder']]){
   await page.selectOption('#specCategory',category);
   const total=items.filter(i=>i.category===category).length;
   await page.waitForFunction(n=>document.querySelectorAll('#rows tr').length===n,total);
   await page.locator('#specQuery').fill(field);await page.locator('#specQuery').press('Enter');
   const select=page.locator('#specAnswerSelect');
   const answers=await select.count()?await select.locator('option').evaluateAll(o=>o.map(x=>[x.value,x.textContent])):await page.locator('[data-spec-answer]').evaluateAll(b=>b.map(x=>[x.dataset.specAnswer,x.textContent]));
   const counts=answers.map(([value,label])=>[value,Number(label.match(/\((\d+)\)$/)[1])]);
   assert.equal(counts.reduce((s,[,n])=>s+n,0),total,category+' '+field+': answers add up to the category total');
   for(const [value,n] of counts.slice(0,4)){
    if(await select.count()){await select.selectOption(value);await page.locator('#specAddAnswer').click();}else await page.locator('[data-spec-answer="'+value.replace(/"/g,'\\"')+'"]').click();
    await page.waitForFunction(n=>document.querySelectorAll('#rows tr').length===n||document.querySelector('#rows .state'),n);
    assert.equal(await count(),n,category+' '+field+' = '+value+' returns its counted products');
    await page.getByRole('button',{name:/Clear all/i}).click();
    await page.locator('#specQuery').fill(field);await page.locator('#specQuery').press('Enter');
   }
   await page.getByRole('button',{name:/Clear all/i}).click().catch(()=>{});await page.locator('#specCancelField').click().catch(()=>{});
  }
  // Treadmill Wi-Fi: the owner's example.
  await page.selectOption('#specCategory','Treadmills');await page.locator('#specQuery').fill('wi-fi');await page.locator('#specQuery').press('Enter');
  const wifi=Object.fromEntries((await page.locator('[data-spec-answer]').evaluateAll(b=>b.map(x=>[x.dataset.specAnswer,x.textContent]))).map(([v,l])=>[v,Number(l.match(/\((\d+)\)$/)[1])]));
  assert.equal(Object.values(wifi).reduce((a,b)=>a+b,0),109);assert(wifi.Unavailable>=0);
  assert.deepEqual(errors,[]);
  console.log('PASS: Spec Search answers add up to each category total (treadmill Wi-Fi '+JSON.stringify(wifi)+'), and each answer returns its count.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
