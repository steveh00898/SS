const assert=require('node:assert/strict'),fs=require('node:fs');
const read=f=>JSON.parse(fs.readFileSync(__dirname+'/../'+f,'utf8'));
// Mastersheet prices are recorded with an audit and reach an existing Site database once, keeping other edits and deletions.
(async()=>{
 const audit=read('data/pricing/us-mastersheet-v1-audit.json'),archive=read('data/off-sunny-web/items.json').filter(r=>!['us-mastersheet-v1-missing','isv-shf-gap-20261111'].includes(r.importBatch));
 const current=fs.readdirSync(__dirname+'/../data').filter(f=>f.endsWith('.json')).flatMap(f=>read('data/'+f)),all=[...current,...archive];
 assert.equal(audit.rows,582);assert.equal(all.length,490);
 assert.deepEqual(audit.discrepancies.map(d=>[d.sku,d.old,d.new]),[['NO. 077S',99.99,89.99],['NO. 066-10',17.99,24.99],['SF-BH6629',89.99,84.99]]);
 assert.equal(audit.filled.length,286);assert.equal(audit.notInApp.length,136);assert.equal(audit.matchedWithoutPrice.length,7);
 for(const e of [...audit.discrepancies,...audit.filled]){const r=all.find(x=>x.id===e.id);assert.equal(r.price,e.new);assert.equal(r.priceSource,'Sunny US Mastersheet V1')}
 for(const e of audit.matchedWithoutPrice){const r=all.find(x=>x.id===e.id);assert.equal(r.price,null,'blank cell keeps the price: '+e.sku);assert.equal(r.priceSource,undefined)}
 assert(audit.notInApp.some(r=>r.sku==='NO. 077-S'),'NO. 077-S is its own product, not NO. 077S');
 for(const r of all.filter(x=>x.priceSource))assert(Number.isFinite(r.price)&&r.price>0,'usable price: '+r.sku);
 // Upgrade: a database made before the prices.
 const {sql,worker,env,request}=await require('./usage-fixture.cjs')();
 const updated=new Map(all.filter(r=>r.priceSource).map(r=>[r.id,r])),old=audit.discrepancies[0].id,filled=audit.filled.find(e=>e.catalog==='off-sunny-web').id,gone=audit.filled.filter(e=>e.catalog==='off-sunny-web')[1].id;
 const restore=global.APP_CATALOG.splice(0);global.APP_CATALOG.push(...restore.map(({priceSource,...r})=>r),...archive.map(({priceSource,...r})=>({...r,price:null})));
 sql.prepare("DELETE FROM catalog_meta WHERE key='us-mastersheet-v1-prices-20261106'").run();sql.prepare("UPDATE items SET data=json_set(json_remove(data,'$.priceSource'),'$.price',?) WHERE id=?").run(audit.discrepancies[0].old,old);
 let rows=await(await request('/api/items')).json();assert.equal(rows.find(r=>r.id===old).price,audit.discrepancies[0].old);assert.equal(rows.find(r=>r.id===filled).price,null);
 sql.prepare("UPDATE items SET data=json_set(data,'$.name','Keep my title') WHERE id=?").run(old);sql.prepare('DELETE FROM items WHERE id=?').run(gone);
 global.APP_CATALOG.splice(0,global.APP_CATALOG.length,...all);
 rows=await(await request('/api/items')).json();const row=rows.find(r=>r.id===old);
 assert.equal(row.price,audit.discrepancies[0].new,'the file wins');assert.equal(row.name,'Keep my title','other edits stay');assert.equal(rows.find(r=>r.id===filled).price,updated.get(filled).price);assert(!rows.some(r=>r.id===gone),'a deleted model stays deleted');
 sql.prepare("UPDATE items SET data=json_set(data,'$.price',1.5) WHERE id=?").run(old);rows=await(await request('/api/items')).json();assert.equal(rows.find(r=>r.id===old).price,1.5,'applied once, so later edits stay');
 sql.close();void worker;void env;
 console.log('PASS: 3 discrepancies and 286 filled prices audited; upgrade applies once and keeps edits and deletions.');
})().catch(e=>{console.error(e);process.exit(1)});
