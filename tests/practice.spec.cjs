const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
// SKU practice: setup, quiz table, highlighting, photo masks, weighting toward missed items, saving, dashboard, study cards, phone layout.
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
const dataDir=__dirname+'/../data';let rows=fs.readdirSync(dataDir).filter(p=>p.endsWith('.json')).flatMap(p=>JSON.parse(fs.readFileSync(dataDir+'/'+p,'utf8')).map(row=>({...row,imageAssetId:'',imageUrl:'/data/images/'+p.slice(0,-5)+'/'+row.id+'.jpg'})));
rows=rows.map(r=>r.category==='Row-N-Ride'?{...r,photoChecked:false,photoMasks:null}:r);// stands in for pictures nobody has checked yet
await page.addInitScript(()=>{let a=20261023;Math.random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}});// seeded so question order is the same every run
let practice=[];const puts=[];let admin=false,profileName='',accounts=[];const html=fs.readFileSync(__dirname+'/../app/index.html','utf8');
await page.route('https://practice.test/**',async route=>{const req=route.request(),url=new URL(req.url()),p=decodeURIComponent(url.pathname),json=v=>route.fulfill({contentType:'application/json',body:JSON.stringify(v)});
  if(p==='/')return route.fulfill({contentType:'text/html',body:html});
  if(p.startsWith('/data/images/'))return route.fulfill({contentType:'image/jpeg',body:fs.readFileSync(path.join(dataDir,'..',p))});
  if(p==='/api/session')return json({canWrite:true,practice:true,admin,email:'me@example.com'});
  if(p==='/api/practice/accounts')return admin?json(accounts):route.fulfill({status:403,contentType:'application/json',body:'{"error":"Only the admin can see all accounts"}'});
  if(p==='/api/practice/profile'){profileName=JSON.parse(req.postData()).name;return json({name:profileName})}
  if(p==='/api/items')return json(rows);
  if(p.startsWith('/api/items/')&&req.method()==='PUT'){const id=p.slice(11),body=JSON.parse(req.postData());puts.push({id,value:body.value});rows=rows.map(r=>r.id===id?{...body.value,id}:r);return json({id})}
  if(p==='/api/practice'){if(req.method()==='GET')return json(url.searchParams.get('with')==='profile'?{name:profileName,email:'me@example.com',records:practice}:practice);if(req.method()==='POST'){const b=JSON.parse(req.postData());assert.ok(b.records.length<=50);practice.push(...b.records);return json({saved:b.records.length})}if(req.method()==='DELETE'){practice=[];return json({deleted:true})}}
  return route.fulfill({status:404,contentType:'application/json',body:'{"error":"not found"}'})});
const open=async(view)=>{await page.goto('https://practice.test/?view='+view);await page.waitForFunction(()=>document.querySelector('#views [aria-pressed="true"]'));};
const bySku=sku=>rows.find(r=>r.sku===sku);
const setup=async(cats,fields)=>{await page.locator('[data-pcatall]').check();await page.locator('[data-pcatall]').uncheck();for(const c of cats)await page.locator(`[data-pcat="${c}"]`).check();for(const f of ['sku','name','price'])await page.locator(`[data-pfield="${f}"]`).setChecked(fields.includes(f));};
const columns=()=>page.locator('.qcol').evaluateAll(cols=>cols.map(c=>({field:c.querySelector('h3').textContent,values:[...c.querySelectorAll('.qcell .v')].map(v=>v.textContent)})));

await open('practice');await page.waitForSelector('[data-pstart="quiz"]');await page.waitForFunction(()=>/saved to your account/.test(document.querySelector('#practiceView').textContent));
assert.equal(await page.locator('[data-pcat]').count(),11);assert.equal(await page.locator('#title').innerText(),'SKU Practice');assert.equal(await page.locator('#rows').isVisible(),false);
// all three fields: a table with one column each, three distinct choices, the asked info hidden
await setup(['Treadmills'],['sku','name','price']);await page.locator('[data-pstart="quiz"]').click();await page.waitForSelector('.qcell');
let cols=await columns();assert.deepEqual(cols.map(c=>c.field),['SKU','Item name','Price']);for(const c of cols){assert.equal(c.values.length,3);assert.equal(new Set(c.values.map(v=>v.toLowerCase())).size,3)}
assert.equal(await page.locator('.qinfo .hidden-val').count(),3);assert.equal(await page.locator('#qPhoto img').getAttribute('alt'),'Product picture');const maskCount=await page.locator('#qPhoto .pmask').count();
assert.equal(await page.locator('#pNext').isDisabled(),true);
const cellBoxes=()=>page.locator('.qcell').evaluateAll(cells=>cells.map(c=>{const r=c.getBoundingClientRect(),v=c.querySelector('.v').getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),fits:v.top>=r.top-1&&v.bottom<=r.bottom+1&&v.right<=r.right+1}}));const before=await cellBoxes();assert.ok(before.every(b=>b.fits),'choice text stays inside its cell');for(let i=0;i<3;i++)assert.equal(new Set([0,3,6].map(c=>before[c+i].h)).size,1,'a row has one height across columns');
for(let i=0;i<3;i++)await page.locator('.qcol').nth(i).locator('.qcell').first().click();
const sku=await page.locator('.qinfo dd.sku').innerText(),item=bySku(sku);assert.ok(item&&item.category==='Treadmills');
assert.equal(maskCount,['sku','name','price'].reduce((n,f)=>n+((item.photoMasks||{})[f]||[]).length,0));assert.ok(maskCount>0,'treadmill photos with a printed SKU are covered');
assert.equal(await page.locator('#qPhoto .pmask').count(),0);assert.deepEqual(await cellBoxes(),before,'cells keep their size and place after answering');assert.equal(await page.locator('.qgrid').evaluate(g=>/Correct|Answer|Your pick/.test(g.innerText.replace(/^(SKU|Item name|Price)$/gm,''))),false,'colour only, no text marks');assert.equal(await page.locator('.qinfo .hidden-val').count(),0);
for(let i=0;i<3;i++){const col=page.locator('.qcol').nth(i);assert.equal(await col.locator('.qcell.right').count(),1);const first=col.locator('.qcell').first();const right=await first.evaluate(e=>e.classList.contains('right')),wrong=await first.evaluate(e=>e.classList.contains('wrong'));assert.ok(right!==wrong);assert.equal(await col.locator('.qcell:disabled').count(),3)}
const right=await page.locator('.qcol').evaluateAll(cols=>cols.map(c=>c.querySelector('.qcell.right .v').textContent));assert.deepEqual(right,[item.sku,item.name,'$'+item.price.toLocaleString('en-US',{minimumFractionDigits:2})]);
await page.waitForFunction(()=>true);await page.waitForTimeout(150);assert.equal(practice.length,3);assert.deepEqual(practice.map(r=>r.field),['sku','name','price']);assert.ok(practice.every(r=>r.sku===sku&&r.category==='Treadmills'&&r.sessionId&&r.id&&!isNaN(Date.parse(r.at))));
const firstVals=cols.map(c=>c.values[0]);assert.deepEqual(practice.map(r=>r.correct),firstVals.map((v,i)=>v===right[i]));
// keyboard: Enter on Next question, keys 1-3 answer the first open column
await page.keyboard.press('Enter');await page.waitForFunction(()=>/Question 2/.test(document.querySelector('.qbar .score').textContent));await page.keyboard.press('1');await page.keyboard.press('2');await page.keyboard.press('3');assert.equal(await page.locator('.qcell:disabled').count(),9);
await page.locator('[data-pact="stop"]').click();await page.waitForSelector('text=Session finished');assert.match(await page.locator('#practiceView').innerText(),/2 questions/);
// one field and a two-item category: wrong answers come from other categories; prices at least $1 apart
await page.locator('[data-pact="setup"]').click();await setup(['Pilates Reformers'],['price']);await page.locator('[data-pstart="quiz"]').click();await page.waitForSelector('.qcell');cols=await columns();assert.equal(cols.length,1);const prices=cols[0].values.map(v=>Number(v.replace(/[$,]/g,'')));assert.equal(prices.length,3);for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert.ok(Math.abs(prices[i]-prices[j])>=1);
await page.locator('[data-pact="stop"]').click();
// an unchecked photo stays blurred until answered
await page.locator('[data-pact="setup"]').click({timeout:1000}).catch(()=>{});await setup(['Row-N-Ride'],['name']);await page.locator('[data-pstart="quiz"]').click();await page.waitForSelector('.qcell');assert.equal(await page.locator('#qPhoto.unchecked').count(),1);assert.match(await page.locator('#qPhoto').innerText(),/hasn't been checked/);
// hide part of photo: drag a box, choose SKU, saved with the item
await page.locator('[data-pact="draw"]').click();const box=await page.locator('#qPhoto').boundingBox();await page.mouse.move(box.x+box.width*0.2,box.y+box.height*0.3);await page.mouse.down();await page.mouse.move(box.x+box.width*0.5,box.y+box.height*0.5,{steps:4});await page.mouse.up();
await page.locator('[data-pmask="sku"]').click();await page.waitForFunction(()=>/stays covered/.test(document.querySelector('#toast').textContent));const saved=puts[puts.length-1];assert.ok(saved.value.photoMasks.sku.length===1);const [bx,by,bw,bh]=saved.value.photoMasks.sku[0];assert.ok(Math.abs(bx-0.2)<0.02&&Math.abs(by-0.3)<0.02&&Math.abs(bw-0.3)<0.02&&Math.abs(bh-0.2)<0.02);assert.equal(saved.value.name,rows.find(r=>r.id===saved.id).name);
await page.keyboard.press('1');assert.equal(await page.locator('#qPhoto.unchecked').count(),0);await page.locator('[data-pact="stop"]').click();
// weighting: one often-missed treadmill comes up far more than mastered ones, never twice in a row
const tm=rows.filter(r=>r.category==='Treadmills'),target=tm[5].sku,t0=Date.now()-3*864e5;let n=0;
practice=tm.flatMap(r=>Array.from({length:4},(_,k)=>({id:'seed'+(n++),at:new Date(t0+k*1000).toISOString(),sessionId:'s0',sku:r.sku,itemId:r.id,category:'Treadmills',field:'sku',correct:r.sku!==target,chosen:'x',answer:r.sku})));
await open('practice');await page.waitForSelector('[data-pstart="quiz"]');await setup(['Treadmills'],['sku']);await page.locator('[data-pstart="quiz"]').click();
const seen=[];for(let i=0;i<30;i++){await page.waitForSelector('.qcell:not(:disabled)');await page.keyboard.press('1');seen.push(await page.locator('.qinfo dd.sku').innerText());await page.locator('#pNext').click();}
for(let i=1;i<seen.length;i++)assert.notEqual(seen[i],seen[i-1]);const hits=seen.filter(s=>s===target).length;assert.ok(hits>=6,'missed item shown '+hits+' times in 30');
await page.locator('[data-pact="stop"]').click();
// review missed only limits the pool to items under 75%
await page.locator('[data-pact="setup"]').click();await page.locator('[data-pmissed]').check();assert.match(await page.locator('.pv-actions').innerText(),/\b[1-9]\d? products? in this practice/);
// dashboard numbers match the saved results
const day=d=>new Date(Date.now()-d*864e5).toISOString();const e=rows.find(r=>r.sku==='SF-E905SMART'),t=rows.find(r=>r.sku==='SF-T724081');
practice=[['a1',2,t,'sku',true],['a2',2,t,'name',false],['a3',1,t,'sku',true],['a4',1,e,'sku',false],['a5',1,e,'price',true],['a6',0,e,'sku',false],['a7',0,t,'price',true],['a8',40,t,'sku',false]].map(([id,d,it,field,correct])=>({id,at:day(d),sessionId:'s',sku:it.sku,itemId:it.id,category:it.category,field,correct,chosen:'',answer:''}));
await open('progress');await page.waitForSelector('.tiles');const tiles=await page.locator('.tile .v').allInnerTexts();assert.equal(tiles[0],'7');assert.equal(tiles[1],'57%');assert.equal(tiles[2],'3');assert.equal(tiles[3],'3');
assert.match(await page.locator('.fbar').nth(0).innerText(),/50% · 2 of 4/);assert.match(await page.locator('.fbar').nth(2).innerText(),/100% · 2 of 2/);assert.match(await page.locator('#progressView').innerText(),/Most missed: SKU/);
const catRows=await page.locator('.ptable').nth(1).locator('tbody tr').allInnerTexts();assert.equal(catRows.length,2);assert.match(catRows[0],/Treadmills/i);assert.match(catRows[0],/[\s\S]*100% \(2\)[\s\S]*0% \(1\)[\s\S]*100% \(1\)[\s\S]*75% \(4\)/);assert.match(catRows[1],/Ellipticals/i);assert.match(catRows[1],/[\s\S]*0% \(2\)[\s\S]*100% \(1\)[\s\S]*33% \(3\)/);
assert.match(await page.locator('.prow .pv-panel').first().innerText(),/SF-E905SMART/);assert.equal(await page.locator('#pChart circle').count(),6);
await page.selectOption('#pRange','all');assert.equal((await page.locator('.tile .v').allInnerTexts())[0],'8');
// reset asks first, then clears the saved results
await page.locator('[data-pact="reset"]').click();assert.match(await page.locator('.confirm').innerText(),/Delete all 8/);await page.locator('[data-pact="reset-yes"]').click();await page.waitForFunction(()=>/No practice results yet/.test(document.querySelector('#progressView').textContent));assert.equal(practice.length,0);
// study cards: full info, next and previous by button and keys
await page.locator('#sectionTrigger').click();await page.locator('[data-view="practice"]').click();await page.locator('[data-pmissed]').uncheck();await setup(['Weights'],['sku']);await page.locator('[data-pstart="study"]').click();await page.waitForSelector('#pStage');assert.match(await page.locator('.qbar').innerText(),/1 of 10/);assert.equal(await page.locator('.qinfo .hidden-val').count(),0);
const s1=await page.locator('.qinfo dd.sku').innerText();await page.locator('[data-pact="next"]').click();assert.match(await page.locator('.qbar').innerText(),/2 of 10/);assert.notEqual(await page.locator('.qinfo dd.sku').innerText(),s1);await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('.qinfo dd.sku').innerText(),s1);
// learner name shown to the admin; Accounts view only for admins, with each learner's full progress
await page.locator('#sectionTrigger').click();await page.locator('[data-view="progress"]').click();await page.locator('#pName').fill('Steve H');await page.locator('[data-pact="save-name"]').click();await page.waitForFunction(()=>/Name saved/.test(document.querySelector('#toast').textContent));assert.equal(profileName,'Steve H');
assert.equal(await page.locator('#views [data-view="accounts"]').isVisible(),false);
const rec=(id,d,sku,field,correct)=>({id,at:new Date(Date.now()-d*864e5).toISOString(),sessionId:'s',sku,itemId:sku.toLowerCase(),category:'Treadmills',field,correct,chosen:'',answer:''});
accounts=[{id:'u1',email:'amy@example.com',name:'Amy',firstSeen:null,lastSeen:null,records:[rec('x1',2,'SF-T724081','sku',true),rec('x2',1,'SF-T724081','name',false),rec('x3',0,'SF-T723030','sku',true)]},{id:'u2',email:'bo@example.com',name:'',firstSeen:null,lastSeen:new Date().toISOString(),records:[]}];admin=true;
await open('accounts');await page.waitForSelector('[data-acct]');await page.locator('#sectionTrigger').click();assert.equal(await page.locator('#views [data-view="accounts"]').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#title').innerText(),'Accounts');
const acctRows=await page.locator('#accountsView tbody tr').allInnerTexts();assert.equal(acctRows.length,2);assert.match(acctRows.join('\n'),/Amy[\s\S]*amy@example\.com\s*3\t67%\t100% \(2\)\t0% \(1\)/);assert.match(acctRows.join('\n'),/bo@example\.com\t0\t—/);
await page.locator('[data-acct="u1"]').click();await page.waitForSelector('#accountsView .tiles');assert.equal(await page.locator('#title').innerText(),'Amy');assert.equal((await page.locator('#accountsView .tile .v').allInnerTexts())[0],'3');assert.match(await page.locator('#accountsView').innerText(),/Viewing Amy's results \(read only\)/);assert.equal(await page.locator('#accountsView [data-pact="reset"]').count(),0);
await page.locator('[data-pact="accounts-back"]').click();await page.waitForSelector('[data-acct="u2"]');admin=false;await page.locator('#sectionTrigger').click();await page.locator('[data-view="practice"]').click();
// phone width: no sideways scrolling
await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('[data-pstart="quiz"]').click();await page.waitForSelector('.qcell');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.locator('#sectionTrigger').click();await page.locator('[data-view="progress"]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('#sectionTrigger').click();await page.locator('[data-view="catalog"]').click();await page.waitForFunction(()=>document.querySelectorAll('#rows tr').length===156);
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: SKU practice setup, 1-3 field quiz tables with distinct choices, green/red feedback, hidden asked info and photo masks, unchecked photo blur, hide-part-of-photo save, keyboard answers, weighting toward missed items without repeats, saved results, review missed only, dashboard numbers by field/category/item/day, reset, study cards, learner name, admin Accounts view with per-learner drill-down, and 390px layout.');})().catch(e=>{console.error(e);process.exit(1)});
