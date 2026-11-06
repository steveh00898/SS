const assert=require('node:assert/strict'),fs=require('node:fs'),{execFileSync}=require('node:child_process'),{chromium}=require('playwright');
// The smaller Artifact page loads ISV rows and manuals from its database and behaves like the full page.
(async()=>{
 const root=__dirname+'/..';const before=fs.readFileSync(root+'/app/index.html','utf8');
 const out=JSON.parse(execFileSync(process.execPath,['scripts/build-artifact.mjs'],{cwd:root,encoding:'utf8'}));
 assert.equal(fs.readFileSync(root+'/app/index.html','utf8'),before,'build leaves the Site page unchanged');
 assert(out.pageChars<300000,'page stays small: '+out.pageChars);
 const html=fs.readFileSync(root+'/dist/artifact/index.html','utf8');
 for(const required of ['/api/session','window.claude','loadReference'])assert(html.includes(required),required);
 assert(!html.includes('data:font/woff2'),'no embedded fonts');
 const refs=fs.readdirSync(root+'/dist/artifact/reference').map(f=>[f.replace('.json',''),JSON.parse(fs.readFileSync(root+'/dist/artifact/reference/'+f,'utf8'))]);
 for(const [,d] of refs)assert(Buffer.byteLength(JSON.stringify(d))<262144,'each document fits the 256 KiB database limit');
 const rowsOf=kind=>refs.filter(([,d])=>d.kind===kind).flatMap(([,d])=>JSON.parse(d.json));
 assert.deepEqual(rowsOf('isv-off'),JSON.parse(fs.readFileSync(root+'/data/isv/off-sunny-products.json','utf8')).items,'off-Sunny ISV is complete and identical');
 assert.deepEqual(rowsOf('isv-current'),JSON.parse(fs.readFileSync(root+'/data/isv/current-products.json','utf8')).items,'current ISV is complete and identical');
 const archive=JSON.parse(fs.readFileSync(root+'/data/off-sunny-web/items.json','utf8'));
 const current=fs.readdirSync(root+'/data').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(root+'/data/'+f,'utf8')));
 const rows=[...current,...archive].map(r=>({...r,imageUrl:'data:image/gif;base64,R0lGODlhAQABAAAAACw='}));
 const browser=await chromium.launch({headless:true});
 const open=async docs=>{const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));await page.route('https://fonts.gstatic.com/**',r=>r.abort());await page.route('https://artifact.test/**',r=>r.fulfill({contentType:'text/html',body:html}));
  await page.addInitScript(([rows,docs])=>{window.fetch=async()=>{throw new TypeError('offline')};const coll=path=>({onSnapshot(next){next({docs:rows.map(r=>({id:r.id,exists:true,data:()=>r}))});return()=>{}},async get(){if(path!=='reference')return{docs:[]};if(docs===null)throw Error('denied');return{docs:docs.map(([id,d])=>({id,exists:true,data:()=>d}))}},doc:()=>({set:async()=>{},delete:async()=>{}})});const caps={db:{collection:coll},user:{can:async()=>true,id:async()=>'viewer-1',isOwner:async()=>false},assets:null,downloads:null};window.claude={use:async n=>caps[n]||null};},[rows,docs]);
  await page.goto('https://artifact.test/?source=all&category=All');await page.waitForFunction(n=>document.querySelectorAll('#rows tr').length===n,rows.length);return {page,errors};};
 const {page,errors}=await open(refs);
 assert.equal(await page.locator('#banner').isVisible(),false);
 assert.equal(await page.locator('#rows .isv-link').count(),rowsOf('isv-current').length+rowsOf('isv-off').length);
 const product=archive.find(r=>r.sku==='SF-T724964');const row=page.locator('tr[data-id="'+product.id+'"]');
 await row.locator('[data-product-spec]').click();const spec=await page.locator('#productSpecBody tr:has(.spec-different)').evaluateAll(t=>[...new Set(t.map(r=>r.dataset.isvColumn))].sort());assert(spec.length>0);await page.locator('#closeProductSpec').click();
 await row.locator('.isv-link').click();const isv=await page.locator('#isvBody tr:has(.isv-different)').evaluateAll(t=>[...new Set(t.map(r=>r.dataset.isvColumn))].sort());assert.deepEqual(isv,spec,'same highlights in both dialogs');await page.locator('#closeISV').click();
 const guided=current.find(r=>rowsOf('manuals').some(([sku,g])=>sku===String(r.sku).toUpperCase()&&g.url));if(guided)assert.equal(await page.locator('tr[data-id="'+guided.id+'"] .manual-link').count(),1,'manual from the database');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);await page.close();
 for(const docs of [null,refs.slice(1)]){const failed=await open(docs);assert.equal(await failed.page.locator('#banner').isVisible(),true,'missing reference data is reported');assert.match(await failed.page.locator('#banner').innerText(),/couldn't load/);assert.deepEqual(failed.errors,[]);await failed.page.close();}
 await browser.close();console.log('PASS: Artifact page of '+out.pageChars+' characters loads complete ISV and manuals from the database, matches highlights, keeps both runtimes and reports missing data.');
})().catch(e=>{console.error(e);process.exit(1)});
