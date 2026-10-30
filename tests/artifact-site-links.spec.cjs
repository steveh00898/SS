const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert');
// Claude Artifact: the owner gets Accounts, Public Usage Analysis and Feedback as links to the private Site; other viewers get none of them.
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const rows=fs.readdirSync(__dirname+'/../data').filter(p=>p.endsWith('.json')).flatMap(p=>JSON.parse(fs.readFileSync(__dirname+'/../data/'+p,'utf8')));const html=fs.readFileSync(__dirname+'/../app/index.html','utf8');const errors=[];
for(const owner of [true,false]){const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(([rows,owner])=>{window.fetch=async()=>{throw new TypeError('offline')};const coll=path=>({onSnapshot(next){next({docs:rows.map(r=>({id:r.id,exists:true,data:()=>r}))});return()=>{}},async get(){return{docs:[]}},doc:()=>({set:async()=>{},delete:async()=>{}})});
 const caps={db:{collection:coll},user:{can:async()=>true,id:async()=>'viewer-1',isOwner:async()=>owner},assets:null,downloads:null};window.claude={use:async n=>caps[n]||null};},[rows,owner]);
await context.route('https://sunny-product-finder.steven-peace.chatgpt.site/**',r=>r.fulfill({contentType:'text/html',body:'site'}));await page.route('https://artifact.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await page.goto('https://artifact.test/?view=usage');await page.waitForFunction(()=>document.querySelectorAll('#rows tr').length>100);await page.waitForTimeout(300);
assert.equal(await page.evaluate(()=>new URL(location.href).searchParams.get('view')),null,'deep link to a Site-only view falls back to the catalog');
const shown=sel=>page.evaluate(s=>!document.querySelector(s).hidden,sel);
assert.equal(await shown('#views [data-view="accounts"]'),owner);assert.equal(await shown('#views [data-view="usage"]'),owner);assert.equal(await shown('#feedbackWidget'),owner);
if(owner){assert.match(await page.textContent('#views [data-view="usage"]'),/↗$/);
 for(const [open,view] of [[async()=>{await page.locator('#sectionTrigger').click();await page.locator('#views [data-view="accounts"]').click()},'accounts'],[async()=>{await page.locator('#sectionTrigger').click();await page.locator('#views [data-view="usage"]').click()},'usage'],[()=>page.locator('#feedbackToggle').click(),'usage']]){
  const [popup]=await Promise.all([context.waitForEvent('page'),open()]);await popup.waitForLoadState();assert.equal(popup.url(),'https://sunny-product-finder.steven-peace.chatgpt.site/?view='+view);await popup.close();
  assert.equal(await page.locator('#title').innerText().then(t=>/Catalog|Products/.test(t)||t.length>0),true);assert.equal(await page.locator('#feedbackPanel').isVisible(),false);}}
await context.close();}
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: Claude Artifact owner sees Accounts, Public Usage Analysis and Feedback as links that open the private Site; non-owners see none; Site-only deep links fall back to the catalog.');})().catch(e=>{console.error(e);process.exit(1)});
