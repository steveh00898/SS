const assert=require('node:assert/strict'),fs=require('node:fs'),{execFileSync}=require('node:child_process'),{chromium}=require('playwright');
// Version stamp: commit date + short hash from the build, runtime label, local-time tooltip, copy on click; feedback keeps it.
(async()=>{
 const root=__dirname+'/..';
 const {appVersion,stampVersion}=await import('../scripts/version.mjs');
 const raw=fs.readFileSync(root+'/app/index.html','utf8');
 assert.match(raw,/^  const APP_VERSION=\{"date":"","commit":"","time":""\};\r?$/m,'source page carries an empty stamp');
 const v={date:'2026-11-16',commit:'3e2ed50',time:'2026-11-16T15:24:00-08:00'};
 const html=stampVersion(raw,v);assert(html.includes('const APP_VERSION='+JSON.stringify(v)+';'));
 const real=appVersion();if(real.commit){assert.match(real.date,/^\d{4}-\d{2}-\d{2}$/);assert.match(real.commit,/^[0-9a-f]{7}$/);}
 // Both builds embed the stamp of the commit they are built from.
 execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root});execFileSync(process.execPath,['scripts/build-artifact.mjs'],{cwd:root});
 const site=fs.readFileSync(root+'/dist/server/index.js','utf8'),artifact=fs.readFileSync(root+'/dist/artifact/index.html','utf8');
 if(real.commit){assert(site.includes(JSON.stringify('const APP_VERSION='+JSON.stringify(real)+';').slice(1,-1)),'Site build stamped');assert(artifact.includes(real.commit)&&artifact.includes(real.date),'Artifact build stamped');}
 // Page: Site runtime label, tooltip and copy.
 const {sql,worker,env,request}=await require('./usage-fixture.cjs')();global.APP_HTML=html;
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium'});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const r=route.request();if(new URL(r.url()).origin!=='https://usage.test')return route.abort();const res=await worker.fetch(new Request(r.url(),{method:r.method(),headers:{...r.headers(),'oai-authenticated-user-id':'owner'},body:r.method()==='GET'?undefined:r.postData()}),env);await route.fulfill({status:res.status,headers:Object.fromEntries(res.headers),body:Buffer.from(await res.arrayBuffer())})});
 await page.addInitScript(()=>{window.__copied=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async t=>{window.__copied.push(t)}}})});
 await page.goto('https://usage.test/');const stamp=page.locator('#appVersion');
 await page.waitForFunction(()=>/· Site$/.test(document.querySelector('#appVersion').textContent));
 assert.equal(await stamp.textContent(),'v2026.11.16 · 3e2ed50 · Site');
 assert.match(await stamp.getAttribute('title'),/^Updated Nov 16, 2026/);
 await stamp.click();assert.deepEqual(await page.evaluate(()=>window.__copied),['v2026.11.16 · 3e2ed50 · Site']);assert.equal(await page.locator('#toast').textContent(),'Version copied');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal scroll on phones');
 assert.deepEqual(errors,[]);await browser.close();
 // Feedback stores the stamp; older rows without one still list; bad values are refused.
 let r=await request('/api/feedback',{method:'POST',body:{id:'feedback-version-000001',comment:'Looks good',version:'v2026.11.16 · 3e2ed50 · Site'}});assert.equal(r.status,201);
 sql.prepare('INSERT INTO public_feedback (id,created_at,comment) VALUES (?,?,?)').run('fb-old',new Date().toISOString(),'Older comment');
 r=await request('/api/feedback',{method:'POST',body:{id:'feedback-version-000002',comment:'Too long',version:'x'.repeat(81)}});assert.equal(r.status,400);
 const list=(await(await request('/api/public-usage/feedback?days=7',{user:'owner'})).json()).feedback;
 assert.equal(list.find(f=>f.comment==='Looks good').version,'v2026.11.16 · 3e2ed50 · Site');assert.equal(list.find(f=>f.comment==='Older comment').version,null);
 sql.close();
 console.log('PASS: version stamp in both builds, Site label, tooltip, copy on click, phone width, feedback keeps the version.');
})().catch(e=>{console.error(e);process.exit(1)});
