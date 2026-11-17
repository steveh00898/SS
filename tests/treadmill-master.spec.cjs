const assert=require('node:assert/strict'),fs=require('node:fs');
const read=f=>JSON.parse(fs.readFileSync(__dirname+'/../'+f,'utf8'));
// Owner decision 2026-11-16: every treadmill follows the SF-T725095 template; each value comes from the model's newest
// spec sheet, else ISV 4.0, else it is left empty (Unavailable). The Site replaces the stored block once.
(async()=>{
 const templates=read('data/specifications/templates.json'),audit=read('data/specifications/treadmill-master-audit.json');
 const keys=templates.Treadmills.flatMap(s=>s.fields.map(f=>f[0]));
 assert.equal(audit.template,'SF-T725095 Treadmill draft Spec dated 9.28.2026.xlsx');
 assert.deepEqual(templates.Treadmills.map(s=>s.title),['Product and dimensions','Performance and adjustments','Console and connectivity','Features']);
 assert.equal(keys.length,73);assert.deepEqual(new Set(keys).size,73);
 for(const k of ['pfas','frontSupportFrame','baseFrame','consoleWidth','beltThickness','deckRail','deckThickness','cushionType','quickInclineButtons','quickSpeedButtons','bluetoothSpec','bluetoothType','bottleHolderSize','remoteBattery'])assert(keys.includes(k),'master field '+k);
 assert(keys.indexOf('continuousHp')<keys.indexOf('peakHp'),'sheet order: continuous before peak');
 const html=fs.readFileSync(__dirname+'/../app/index.html','utf8');assert(html.includes('PRODUCT_SPEC_TEMPLATES='+JSON.stringify(templates)+';'),'page carries the same template');
 const all=[...fs.readdirSync(__dirname+'/../data').filter(f=>f.endsWith('.json')).flatMap(f=>read('data/'+f)),...read('data/off-sunny-web/items.json')];
 const treadmills=all.filter(r=>r.category==='Treadmills');assert.equal(treadmills.length,109);assert.equal(audit.products.length,109);
 for(const r of treadmills){
  const a=audit.products.find(p=>p.id===r.id),d=r.specDetails;assert(a&&d,'audited: '+r.sku);
  assert(d.notes.at(-1).startsWith('Treadmill Product Spec rebuilt on 2026-11-16'),r.sku);
  for(const k of keys){
   const v=d.values[k];
   if(a.unavailable.includes(k)){assert.equal(v,undefined,'left empty: '+r.sku+' '+k);continue;}
   assert(typeof v==='string'&&v.trim(),'value: '+r.sku+' '+k);assert(!/[㐀-鿿]/.test(v),'English only: '+r.sku+' '+k);
   const ev=d.evidence[k];
   if(a.fromISV.includes(k))assert.match(ev,/^ISV 4\.0 \/ SHF \/ [A-Z]+\d+$/,r.sku+' '+k);
   else{assert(a.fromSheet.includes(k),r.sku+' '+k);assert(ev.startsWith(a.sheet+' / '),'newest sheet only: '+r.sku+' '+k);}
  }
 }
 // The master model carries its own sheet.
 const master=treadmills.find(r=>r.sku==='SF-T725095'),mv=master.specDetails.values;
 assert.equal(audit.products.find(p=>p.id===master.id).sheet,'SF-T725095 Treadmill draft Spec dated 9.28.2026.xlsx');
 assert.equal(mv.wifi,'NO');assert.equal(mv.cushionType,'rubber+TPE+Spring');assert.equal(mv.inclineRange,'15%');assert.match(mv.continuousHp,/1\.25HP/);
 // Older forms: HORSEPOWER row split into peak/continuous; inline remote battery.
 const t723030=treadmills.find(r=>r.id==='sf-t723030').specDetails.values;assert.equal(t723030.peakHp,'2.5HP');assert.equal(t723030.continuousHp,'1.25HP');
 assert.equal(treadmills.find(r=>r.id==='sf-t722069').specDetails.values.remoteBattery,'CR2032/3V');
 // Site: replaced once, other categories untouched.
 const {sql,request}=await require('./usage-fixture.cjs')();global.APP_CATALOG.push(...read('data/off-sunny-web/items.json'));
 await request('/api/items');
 const id='sf-t723030',other='sf-e322004';
 sql.prepare("DELETE FROM catalog_meta WHERE key='treadmill-master-template-20261116'").run();
 sql.prepare("UPDATE items SET data=json_set(data,'$.specDetails',json(?)) WHERE id=?").run(JSON.stringify({version:1,values:{brand:'old'}}),id);
 const before=sql.prepare('SELECT data FROM items WHERE id=?').get(other).data;
 let rows=await(await request('/api/items')).json();
 assert.deepEqual(rows.find(r=>r.id===id).specDetails,treadmills.find(r=>r.id===id).specDetails,'rebuilt block replaces the stored one');
 assert.equal(sql.prepare('SELECT data FROM items WHERE id=?').get(other).data,before,'other categories untouched');
 sql.prepare("UPDATE items SET data=json_set(data,'$.specDetails.values.brand','later') WHERE id=?").run(id);
 rows=await(await request('/api/items')).json();assert.equal(rows.find(r=>r.id===id).specDetails.values.brand,'later','runs once');
 sql.close();
 console.log('PASS: 109 treadmills on the 73-field SF-T725095 template, values from the newest sheet or ISV with evidence, Site replaces once.');
})().catch(e=>{console.error(e);process.exit(1)});
