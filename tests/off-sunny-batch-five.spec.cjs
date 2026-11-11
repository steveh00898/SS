const assert=require('node:assert/strict'),fs=require('node:fs'),{execFileSync}=require('node:child_process');
const read=f=>JSON.parse(fs.readFileSync(__dirname+'/../'+f,'utf8'));
const MODEL=s=>String(s).toUpperCase().replace(/[^A-Z0-9]/g,'');
(async()=>{
 const archive=read('data/off-sunny-web/items.json'),batch=archive.filter(r=>r.importBatch==='v3-batch-5'),older=archive.filter(r=>!['v3-batch-5','us-mastersheet-v1-missing','isv-shf-gap-20261111'].includes(r.importBatch));
 assert.equal(batch.length,114);assert.equal(older.length,220);
 const current=fs.readdirSync(__dirname+'/../data').filter(f=>f.endsWith('.json')).flatMap(f=>read('data/'+f));assert.equal(current.length,156);
 const taken=new Set([...older,...current].map(r=>MODEL(r.sku)));assert.equal(new Set(batch.map(r=>MODEL(r.sku))).size,114,'distinct within the batch');for(const r of batch)assert(!taken.has(MODEL(r.sku)),'not already in the catalog: '+r.sku);
 // Audit: each model maps to one source file, and a name not on the sheet is traced to ISV.
 const sources=read('data/off-sunny-web/batch-five-sources.json').records,selection=read('data/off-sunny-web/batch-five-selection.json'),deferred=read('data/off-sunny-web/batch-five-deferred.json'),resources=read('data/off-sunny-web/batch-five-resources.json');
 assert.equal(sources.length,114);assert.equal(selection.length,114);assert.equal(resources.length,114);
 const olderFiles=new Set(older.map(r=>r.sourceFile));const templates=read('data/specifications/templates.json');const isvFull=read('data/isv/off-sunny-products.json').items;
 for(const r of batch){
  const s=sources.find(x=>x.id===r.id),e=resources.find(x=>x.id===r.id);assert(s&&e,'audit entries for '+r.sku);
  assert.equal(s.file,r.sourceFile);assert.equal(MODEL(s.modelEvidence.text),MODEL(r.sku));assert.match(s.sha256,/^[0-9a-f]{64}$/);assert(!olderFiles.has(r.sourceFile),'unprocessed file only: '+r.sourceFile);
  assert(!deferred.some(d=>d.sourceFile===r.sourceFile),'a used file is not also deferred');
  assert(templates[r.category],'existing category template: '+r.category);
  const shown=new Set(templates[r.category].flatMap(sec=>sec.fields.map(([k])=>k)));assert(Object.keys(r.specDetails.values).some(k=>shown.has(k)),'usable template fields: '+r.sku);
  assert(!/^(item name|pending|tba|date\s*:)/i.test(r.name),'descriptive name: '+r.sku);assert.notEqual(MODEL(r.name),MODEL(r.sku),'name is not the model: '+r.sku);
  if(s.nameSource!=='sheet'){assert.match(s.nameSource,/^ISV 4\.0 SHF!F\d+$/);const x=isvFull.find(i=>i.id===r.id);assert(x,'ISV row for an ISV name: '+r.sku);assert.equal(x.fields.F,r.name,'name equals the ISV Product Name: '+r.sku);assert(r.specDetails.notes.some(n=>n.includes(s.nameSource)),'note names the source: '+r.sku)}
  for(const [k,v]of Object.entries(r.specDetails.values)){assert(!/[一-鿿]/.test(v),'English value: '+r.sku+' '+k);assert(!/^if no\b|^(MIN|MAX|PENDING)\s*[:?.]*$/i.test(v.trim()),'no form prompt: '+r.sku+' '+k);assert(!/^(supplier|factory|vendor|cost|fob|moq)/i.test(k),'no internal field: '+k);}
  // Resources are recorded as found, and only from an exact-model page.
  assert.equal(r.url,e.productUrl||'');if(r.url)assert.match(r.url,/^https:\/\/sunnyhealthfitness\.com\/products\/.+\?variant=\d+$/);
  const links=r.resourceLinks;assert.equal(links.verificationStatus,'verified');
  if(links.manualUrl){assert.match(links.manualUrl,/\.pdf/i);assert.equal(links.manualPage,e.guidePage);assert(e.evidence.some(x=>x.guideHeading&&MODEL(x.guideHeading).startsWith(MODEL(r.sku))),'manual from exact guide: '+r.sku)}
  if(links.assemblyUrl)assert.match(links.assemblyUrl,/^https:\/\/www\.youtube\.com\/watch\?v=/);
  assert.equal(r.photoChecked,false,'printed-text check still needed: '+r.sku);
  if(r.imageUrl){assert(r.imageUrl.endsWith('-batch5-v1.jpg'));assert(fs.statSync(__dirname+'/../data/images/off-sunny-web/'+r.imageUrl.split('/').pop()).size>1000)}else assert.equal(r.imageAvailability,'unavailable');
 }
 // Held back, with a reason, rather than given a guessed name or model.
 const held=['SF-A026006','SF-A026811','SF-E3919 SMART','SF-PM10-RB','SF-RW522816','SF-RW524087','SF-S026037','SF-T726031','SF-X7330','SF-T726024','UB202'];
 assert.deepEqual(deferred.map(d=>d.sku).sort(),[...held].sort());for(const d of deferred)assert(d.reason.length>10);for(const sku of held)assert(![...older,...batch].some(r=>MODEL(r.sku)===MODEL(sku)),'not imported: '+sku);
 // Source oddities stay visible on the record.
 assert.equal(batch.find(r=>r.sku==='SF-T726025').specDetails.notes.some(n=>n.includes('SF-726025')),true,'misprinted cell is noted');
 assert.equal(batch.find(r=>r.sku==='NO. 088-COMBO').name,'Strength Training Band Combo');
 // ISV: exact IDs only, and no older match changed.
 const isv=read('data/isv/off-sunny-products.json'),audit=read('data/isv/off-sunny-match-audit.json');
 for(const x of isv.items){const row=archive.find(r=>r.id===x.id);assert.equal(row.sku,x.sku);assert.equal(MODEL(x.fields.A),MODEL(row.sku==='NO. 089 COMBO'?'NO. 089-COMBO':row.sku))}
 for(const a of audit.items.filter(a=>a.status!=='matched'))assert(!isv.items.some(x=>x.id===a.id));
 const unmatched=audit.items.filter(a=>a.status!=='matched'&&batch.some(r=>r.id===a.id)).map(a=>a.sku);assert.deepEqual(unmatched,['SF-XF926805'],'only this model has no ISV row');
 assert(fs.readFileSync(__dirname+'/../app/index.html','utf8').includes('"id":"'+batch.find(r=>r.sku==='SF-T726025').id+'"'),'ISV reference embedded in the app');
 // Upgrade: insert-only, once, keeps edits and deletions.
 const {sql,env,worker,request}=await require('./usage-fixture.cjs')();
 global.APP_CATALOG.push(...older);assert.equal((await(await request('/api/items')).json()).length,376);
 sql.prepare("UPDATE items SET data=json_set(data,'$.name','Keep my title') WHERE id=?").run(older[210].id);
 const before=sql.prepare('SELECT id,data FROM items').all();global.APP_CATALOG.push(...batch);
 const rows=await(await request('/api/items')).json();assert.equal(rows.length,490);for(const b of before)assert.equal(sql.prepare('SELECT data FROM items WHERE id=?').get(b.id).data,b.data,'existing record byte-preserved: '+b.id);for(const r of batch)assert.deepEqual(rows.find(i=>i.id===r.id),r);
 sql.prepare('DELETE FROM items WHERE id=?').run(batch[0].id);assert.equal((await(await request('/api/items')).json()).length,489,'a deleted model is not re-imported');
 // Packaging: pictures are not embedded; they load once from the pinned commit, then R2.
 const pictured=batch.find(r=>r.imageUrl&&r.id!==batch[0].id),name=pictured.imageUrl.split('/').pop(),bytes=fs.readFileSync(__dirname+'/../data/images/off-sunny-web/'+name);delete global.APP_SHEET_IMAGES[pictured.imageUrl];
 const store=new Map();env.BUCKET={get:async k=>store.has(k)?{body:store.get(k)}:null,put:async(k,b)=>store.set(k,new Uint8Array(b))};const calls=[],orig=global.fetch;global.fetch=async u=>{calls.push(String(u));return new Response(bytes,{status:200})};
 let image=await worker.fetch(new Request('https://usage.test'+pictured.imageUrl),env);assert.equal(image.status,200);assert.equal(calls.length,1);assert.match(calls[0],new RegExp('^https://raw\\.githubusercontent\\.com/steveh00898/SS/[0-9a-f]{40}/data/images/off-sunny-web/'+name+'$'));assert.deepEqual(Buffer.from(await image.arrayBuffer()),bytes);
 image=await worker.fetch(new Request('https://usage.test'+pictured.imageUrl),env);assert.equal(image.status,200);assert.equal(calls.length,1,'cached after the first load');global.fetch=orig;
 sql.close();
 execFileSync(process.execPath,['scripts/build.mjs'],{cwd:__dirname+'/..'});const built=fs.readFileSync(__dirname+'/../dist/server/index.js','utf8');assert(!built.match(/const APP_SHEET_IMAGES=.*-batch5-v1\.jpg":"/),'batch-five bytes are not embedded');const size=require('node:zlib').gzipSync(built).length;assert(size<10*1024*1024,'Worker gzip under 10 MiB: '+size);
 console.log('PASS: 114 distinct audited models, 11 held back with reasons, exact-model resources, insert-only upgrade, pinned image loading, Worker gzip '+size+' bytes.');
})().catch(e=>{console.error(e);process.exit(1)});
