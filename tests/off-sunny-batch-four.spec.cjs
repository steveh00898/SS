const assert=require('node:assert/strict'),fs=require('node:fs'),{execFileSync}=require('node:child_process'),{pathToFileURL}=require('node:url');
const read=f=>JSON.parse(fs.readFileSync(__dirname+'/../'+f,'utf8'));
const MODEL=s=>String(s).toUpperCase().replace(/[^A-Z0-9]/g,'');
(async()=>{
 const archive=read('data/off-sunny-web/items.json'),batch=archive.filter(r=>r.importBatch==='v3-batch-4'),older=archive.filter(r=>r.importBatch!=='v3-batch-4');
 assert.equal(batch.length,100);assert.equal(older.length,120);
 const current=fs.readdirSync(__dirname+'/../data').filter(f=>f.endsWith('.json')).flatMap(f=>read('data/'+f));assert.equal(current.length,156);
 const taken=new Set([...older,...current].map(r=>MODEL(r.sku)));assert.equal(new Set(batch.map(r=>MODEL(r.sku))).size,100,'distinct within the batch');for(const r of batch)assert(!taken.has(MODEL(r.sku)),'not already in the catalog: '+r.sku);
 // Audit: each model maps to a real source file with a model cell, and no processed file is reused.
 const sources=read('data/off-sunny-web/batch-four-sources.json').records,selection=read('data/off-sunny-web/batch-four-selection.json'),deferred=read('data/off-sunny-web/batch-four-deferred.json'),resources=read('data/off-sunny-web/batch-four-resources.json');
 assert.equal(sources.length,100);assert.equal(selection.length,100);assert.equal(resources.length,100);
 const olderFiles=new Set(older.map(r=>r.sourceFile));const templates=read('data/specifications/templates.json');
 for(const r of batch){
  const s=sources.find(x=>x.id===r.id),e=resources.find(x=>x.id===r.id);assert(s&&e,'audit entries for '+r.sku);
  assert.equal(s.file,r.sourceFile);assert.equal(MODEL(s.modelEvidence.text),MODEL(r.sku));assert.match(s.sha256,/^[0-9a-f]{64}$/);assert(!olderFiles.has(r.sourceFile),'unprocessed file only: '+r.sourceFile);
  assert(!deferred.some(d=>d.sourceFile===r.sourceFile),'a used file is not also deferred');
  assert(templates[r.category],'existing category template: '+r.category);
  const shown=new Set(templates[r.category].flatMap(sec=>sec.fields.map(([k])=>k)));assert(Object.keys(r.specDetails.values).some(k=>shown.has(k)),'usable template fields: '+r.sku);
  assert(!/^(item name|pending|tba|date\s*:)/i.test(r.name),'descriptive name: '+r.sku);
  for(const [k,v]of Object.entries(r.specDetails.values)){assert(!/[一-鿿]/.test(v),'English value: '+r.sku+' '+k);assert(!/^if no\b|^(MIN|MAX|PENDING)\s*[:?.]*$/i.test(v.trim()),'no form prompt: '+r.sku+' '+k);assert(!/^(supplier|factory|vendor|cost|fob|moq)/i.test(k),'no internal field: '+k);}
  // Resources are recorded as found, and only from an exact-model page.
  assert.equal(r.url,e.productUrl||'');if(r.url)assert.match(r.url,/^https:\/\/sunnyhealthfitness\.com\/products\/.+\?variant=\d+$/);
  const links=r.resourceLinks;assert.equal(links.verificationStatus,'verified');
  if(links.manualUrl){assert.match(links.manualUrl,/\.pdf/i);assert.equal(links.manualPage,e.guidePage);assert(e.evidence.some(x=>x.guideHeading&&MODEL(x.guideHeading).startsWith(MODEL(r.sku))),'manual from exact guide: '+r.sku)}
  if(links.assemblyUrl)assert.match(links.assemblyUrl,/^https:\/\/www\.youtube\.com\/watch\?v=/);
  assert.equal(r.photoChecked,false,'printed-text check still needed: '+r.sku);
  assert(r.imageUrl.endsWith('-batch4-v1.jpg'));assert(fs.statSync(__dirname+'/../data/images/off-sunny-web/'+r.imageUrl.split('/').pop()).size>1000);
 }
 const video=batch.find(r=>r.sku==='SF-S025005');assert.equal(video.resourceLinks.assemblyUrl,null,'video titled for another model is not used');
 // ISV: exact IDs only, unmatched models are left out, and no older match changed.
 const isv=read('data/isv/off-sunny-products.json'),audit=read('data/isv/off-sunny-match-audit.json');const unmatched=['SF-E326015-GY','SF-SK025801','SF-T724043'];
 assert.equal(isv.items.length,217);for(const sku of unmatched){assert(!isv.items.some(x=>x.sku===sku));assert.equal(audit.items.find(x=>x.sku===sku).status,'missing')}
 for(const x of isv.items){const row=archive.find(r=>r.id===x.id);assert.equal(row.sku,x.sku);assert.equal(MODEL(x.fields.A),MODEL(row.sku==='NO. 089 COMBO'?'NO. 089-COMBO':row.sku))}
 assert(fs.readFileSync(__dirname+'/../app/index.html','utf8').includes('"id":"off-sunny-sf-t724964"'),'ISV reference embedded in the app');
 // Upgrade: insert-only, once, keeps edits and deletions.
 const {sql,env,worker,request}=await require('./usage-fixture.cjs')();
 global.APP_CATALOG.push(...older);assert.equal((await(await request('/api/items')).json()).length,276);
 sql.prepare("UPDATE items SET data=json_set(data,'$.name','Keep my title','$.photoMasks',json(?)) WHERE id=?").run(JSON.stringify({name:[[.1,.1,.2,.2]]}),older[50].id);
 const before=sql.prepare('SELECT id,data FROM items').all();global.APP_CATALOG.push(...batch);
 const rows=await(await request('/api/items')).json();assert.equal(rows.length,376);for(const b of before)assert.equal(sql.prepare('SELECT data FROM items WHERE id=?').get(b.id).data,b.data,'existing record byte-preserved: '+b.id);for(const r of batch)assert.deepEqual(rows.find(i=>i.id===r.id),r);
 sql.prepare('DELETE FROM items WHERE id=?').run(batch[0].id);assert.equal((await(await request('/api/items')).json()).length,375,'a deleted model is not re-imported');
 // Packaging: batch-four pictures are not embedded; they load once from the pinned commit, then R2.
 const name=batch[1].imageUrl.split('/').pop(),bytes=fs.readFileSync(__dirname+'/../data/images/off-sunny-web/'+name);delete global.APP_SHEET_IMAGES[batch[1].imageUrl];
 const store=new Map();env.BUCKET={get:async k=>store.has(k)?{body:store.get(k)}:null,put:async(k,b)=>store.set(k,new Uint8Array(b))};const calls=[],orig=global.fetch;global.fetch=async u=>{calls.push(String(u));return new Response(bytes,{status:200})};
 let image=await worker.fetch(new Request('https://usage.test'+batch[1].imageUrl),env);assert.equal(image.status,200);assert.equal(calls.length,1);assert.match(calls[0],new RegExp('^https://raw\\.githubusercontent\\.com/steveh00898/SS/[0-9a-f]{40}/data/images/off-sunny-web/'+name+'$'));assert.deepEqual(Buffer.from(await image.arrayBuffer()),bytes);
 image=await worker.fetch(new Request('https://usage.test'+batch[1].imageUrl),env);assert.equal(image.status,200);assert.equal(calls.length,1,'cached after the first load');global.fetch=orig;
 sql.close();
 execFileSync(process.execPath,['scripts/build.mjs'],{cwd:__dirname+'/..'});const built=fs.readFileSync(__dirname+'/../dist/server/index.js','utf8');assert(!built.match(/const APP_SHEET_IMAGES=.*-batch4-v1\.jpg":"/),'batch-four bytes are not embedded');const size=require('node:zlib').gzipSync(built).length;assert(size<10*1024*1024,'Worker gzip under 10 MiB: '+size);
 console.log('PASS: 100 distinct audited models, exact-model resources, 97 ISV matches with 3 left unmatched, insert-only upgrade, pinned image loading, Worker gzip '+size+' bytes.');
})().catch(e=>{console.error(e);process.exit(1)});
