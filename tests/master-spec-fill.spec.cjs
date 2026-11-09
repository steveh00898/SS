const assert=require('node:assert/strict'),fs=require('node:fs');
const read=f=>JSON.parse(fs.readFileSync(__dirname+'/../'+f,'utf8'));
// Requested spec fields: filled from spec sheets, then ISV 4.0, only where empty; reach the Site once; wording shown to customers.
(async()=>{
 const audit=read('data/specifications/master-fill-audit.json'),archive=read('data/off-sunny-web/items.json');
 const current=fs.readdirSync(__dirname+'/../data').filter(f=>f.endsWith('.json')).flatMap(f=>read('data/'+f)),all=[...current,...archive];
 assert(audit.filled.length>600,'filled '+audit.filled.length);
 for(const f of audit.filled){const r=all.find(x=>x.id===f.id);assert.equal(r.specDetails.values[f.field],f.value);assert.equal(r.specDetails.evidence[f.field],f.evidence);
  if(f.source==='ISV 4.0')assert.match(f.evidence,/^ISV 4\.0 \/ SHF \/ [A-Z]+\d+$/);else assert(!f.evidence.startsWith('ISV'))}
 for(const c of audit.conflicts){const r=all.find(x=>x.id===c.id);assert.equal(r.specDetails.values[c.field],c.app,'app value kept: '+c.sku)}
 for(const u of audit.unavailable){const r=all.find(x=>x.sku===u.sku);const v=r.specDetails?.values?.[u.field];assert(!v||!String(v).trim()||/^(unavailable|not provided)$/i.test(v),'still empty: '+u.sku+' '+u.field)}
 for(const f of audit.filled.filter(f=>/Dimensions$/.test(f.field)))assert((f.value.match(/\d+(?:\.\d+)?/g)||[]).length>=2,'no empty template: '+f.sku);
 // Site upgrade: fills an empty field, keeps an app edit, runs once.
 const {sql,request}=await require('./usage-fixture.cjs')();global.APP_CATALOG.push(...archive);
 const target=audit.filled.find(f=>f.source==='spec sheet'&&all.find(x=>x.id===f.id).catalogSource==='off-sunny-web'),kept=audit.filled.find(f=>f.id!==target.id&&all.find(x=>x.id===f.id).catalogSource==='off-sunny-web');
 await request('/api/items');
 sql.prepare("DELETE FROM catalog_meta WHERE key='master-spec-fill-20261109'").run();
 sql.prepare('UPDATE items SET data=json_remove(data,?) WHERE id=?').run('$.specDetails.values.'+target.field,target.id);
 sql.prepare('UPDATE items SET data=json_set(data,?,?) WHERE id=?').run('$.specDetails.values.'+kept.field,'Owner value',kept.id);
 let rows=await(await request('/api/items')).json();
 assert.equal(rows.find(r=>r.id===target.id).specDetails.values[target.field],target.value,'empty field filled');
 assert.equal(rows.find(r=>r.id===kept.id).specDetails.values[kept.field],'Owner value','app edit kept');
 sql.prepare('UPDATE items SET data=json_remove(data,?) WHERE id=?').run('$.specDetails.values.'+target.field,target.id);
 rows=await(await request('/api/items')).json();assert.equal(rows.find(r=>r.id===target.id).specDetails.values[target.field],undefined,'runs once');sql.close();
 // Display wording.
 const html=fs.readFileSync(__dirname+'/../app/index.html','utf8');const src=html.match(/const sameCase = [^\n]+\n\s*const plainWording = [^\n]+/)[0];const plainWording=new Function(src+';return plainWording')();
 assert.equal(plainWording('STEPLESS RESISTANCE: Enjoy'),'MICRO-ADJUSTABLE RESISTANCE: Enjoy');
 assert.equal(plainWording('Stepless magnetic resistance'),'Micro-adjustable magnetic resistance');
 assert.equal(plainWording('the stepless micro-adjustment feature'),'the micro-adjustment feature');
 assert.equal(plainWording('micro-adjustable seat'),'micro-adjustable seat');
 assert(html.includes('new MutationObserver(() => rewordTree(el))'));
 console.log('PASS: '+audit.filled.length+' fields filled with evidence, '+audit.conflicts.length+' conflicts kept, Site fill once, wording shown as micro-adjustable.');
})().catch(e=>{console.error(e);process.exit(1)});
