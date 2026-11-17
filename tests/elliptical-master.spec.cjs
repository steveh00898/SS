const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const read=file=>JSON.parse(fs.readFileSync(__dirname+'/../'+file,'utf8'));

(async()=>{
 const templates=read('data/specifications/templates.json');
 const audit=read('data/specifications/elliptical-master-audit.json');
 const archive=read('data/off-sunny-web/items.json');
 const items=[...read('data/ellipticals.json'),...archive.filter(item=>item.category==='Ellipticals')];
 const keys=templates.Ellipticals.flatMap(section=>section.fields.map(([key])=>key));
 const ordered=Object.entries(audit.fields).sort(([,a],[,b])=>a[0]-b[0]).map(([key])=>key);
 assert.equal(audit.template,'SF-E326015WT final spec sheet 20260817.xlsx');
 assert.deepEqual(keys,[...ordered.slice(0,-2),'features','certification']);
 assert.equal(keys.length,68);
 assert.equal(items.length,87);
 const records=new Map(audit.products.map(row=>[row.id,row]));
 for(const item of items){
  const row=records.get(item.id), {values,evidence}=item.specDetails;
  assert.deepEqual(values,row.values,item.sku);
  assert.deepEqual(evidence,row.evidence,item.sku);
  assert.deepEqual([...row.fromSheet,...row.fromISV,...row.unavailable].sort(),[...keys].sort(),item.sku);
  for(const key of row.fromSheet){
   assert(evidence[key].startsWith(row.sheet+' / '),item.sku+' '+key);
   assert.match(evidence[key],/ \/ (?:[A-Z]+\d+|\d+:\d+)(?: \(checkbox\))?$/);
  }
  for(const key of row.fromISV)assert.match(evidence[key],/^ISV 4\.0 \/ SHF \/ [A-Z]+\d+$/);
  for(const key of row.unavailable)assert.equal(values[key],undefined);
  assert(Object.values(values).every(value=>typeof value==='string'&&value.trim()&&!/[㐀-鿿]/.test(value)));
 }
 const spec=sku=>items.find(item=>item.sku===sku).specDetails;
 assert.equal(spec('SF-E902').values.bluetooth,'No');
 assert.equal(spec('SF-E902').evidence.bluetooth,'SF-E902 spec sheet .xlsx / Sheet1 / B26 (checkbox)');
 assert.equal(spec('SF-E905SMART').values.bluetooth,'Yes (SunnyFit APP)');
 assert.equal(spec('SF-E3919').values.bluetooth,undefined);
 assert.equal(spec('SF-E3919SMART').values.bluetooth,'Yes (SUNNY APP)');
 assert.match(spec('SF-E3919SMART').evidence.bluetooth,/ \/ B31 \(checkbox\)$/);
 assert.equal(spec('SF-E3919SMART').values.battery,'Yes');
 assert.match(spec('SF-E3919SMART').evidence.battery,/ \/ B25 \(checkbox\)$/);
 assert.equal(spec('SF-RBE420035').values.motorized,'No');
 assert.match(spec('SF-RBE420035').evidence.motorized,/ \/ B63 \(checkbox\)$/);
 assert.equal(spec('SF-E326015WT').values.flywheelWeight,'Not applicable');
 assert.equal(spec('SF-E3919SMART').values.bottleHolder,undefined);
 assert.equal(spec('SF-E3875').values.driveResistanceSystem,undefined);

 const {sql,request}=await require('./usage-fixture.cjs')();
 global.APP_CATALOG.push(...archive);
 await request('/api/items');
 const id='sf-e905smart',other='sf-t723030',marker='elliptical-master-template-20261117';
 sql.prepare('DELETE FROM catalog_meta WHERE key=?').run(marker);
 sql.prepare("UPDATE items SET data=json_set(data,'$.specDetails',json(?)) WHERE id=?").run('{"values":{"brand":"old"}}',id);
 const previous=sql.prepare('SELECT data FROM items WHERE id=?').get(other).data;
 let rows=await(await request('/api/items')).json();
 assert.deepEqual(rows.find(row=>row.id===id).specDetails,spec('SF-E905SMART'));
 assert.equal(sql.prepare('SELECT data FROM items WHERE id=?').get(other).data,previous);
 sql.prepare("UPDATE items SET data=json_set(data,'$.specDetails.values.brand','later') WHERE id=?").run(id);
 rows=await(await request('/api/items')).json();
 assert.equal(rows.find(row=>row.id===id).specDetails.values.brand,'later');
 const smart='off-sunny-sf-e3919smart',recumbent='sf-rbe420035';
 const checkboxMarker='elliptical-checkbox-20261117';
 sql.prepare('DELETE FROM catalog_meta WHERE key=?').run(checkboxMarker);
 sql.prepare("UPDATE items SET data=json_remove(data,'$.specDetails.values.battery','$.specDetails.evidence.battery') WHERE id=?").run(smart);
 sql.prepare("UPDATE items SET data=json_set(data,'$.specDetails.values.motorized','Owner edit') WHERE id=?").run(recumbent);
 const pedal='off-sunny-sf-e3875';
 sql.prepare("UPDATE items SET data=json_set(data,'$.specDetails.evidence.pedalBothDirections',?) WHERE id=?").run('E3875 ELLIPTICAL Specification.xlsx / Sheet1 / B19 (checkbox)',pedal);
 rows=await(await request('/api/items')).json();
 assert.deepEqual(rows.find(row=>row.id===smart).specDetails,spec('SF-E3919SMART'));
 assert.equal(rows.find(row=>row.id===recumbent).specDetails.values.motorized,'Owner edit');
 assert.equal(rows.find(row=>row.id===pedal).specDetails.evidence.pedalBothDirections,spec('SF-E3875').evidence.pedalBothDirections);
 sql.prepare("UPDATE items SET data=json_remove(data,'$.specDetails.values.battery','$.specDetails.evidence.battery') WHERE id=?").run(smart);
 rows=await(await request('/api/items')).json();
 assert.equal(rows.find(row=>row.id===smart).specDetails.values.battery,undefined,'checkbox migration runs once');
 sql.close();

 const html=fs.readFileSync(__dirname+'/../app/index.html','utf8');
 assert(html.includes('PRODUCT_SPEC_TEMPLATES='+JSON.stringify(templates)+';'));
 const testHtml=html.replace('  function fieldValues(field){',
  '  window.testSpecPartitions=(keys,source)=>keys.map(key=>{const field={key,source};const entries=specIndex().entries;const answers=fieldValues(field);return {key,count:entries.length,answers:answers.map(value=>answerCounts.get(norm(value))),hits:entries.map(entry=>answers.filter(value=>matchesSpec(entry,{...field,value})).length)};});\n  function fieldValues(field){');
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950}});
  await page.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin!=='https://spec.test')return route.abort();
   if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:testHtml});
   return route.fulfill({json:url.pathname==='/api/items'?items.map(item=>({...item,imageUrl:''})):{canWrite:false,practice:false}});
  });
  await page.goto('https://spec.test/?view=spec-search');
  await page.selectOption('#specCategory','Ellipticals');
  await page.waitForFunction(n=>document.querySelectorAll('#rows tr[data-id]').length===n,items.length);
  for(const source of ['product','isv']){
   const counts=await page.evaluate(({keys,source})=>window.testSpecPartitions(keys,source),{keys,source});
   for(const {key,count,answers,hits} of counts){
    assert.equal(count,87,key);
    assert.equal(answers.reduce((a,b)=>a+b,0),count,key+' answers sum');
    assert(hits.every(hit=>hit===1),key+' each product has exactly one answer');
   }
  }
  await page.locator('#specQuery').fill('flywheel weight');
  await page.locator('#specQuery').press('Enter');
  assert.equal(await page.locator('#specAnswerSelect option[value="Not applicable"]').count(),1);
  assert.equal(await page.locator('#specAnswerSelect option[value="Unavailable"]').count(),1);
  await page.locator('#specAnswerSelect').selectOption('Not applicable');
  await page.locator('#specAddAnswer').click();
  assert(await page.locator('#rows tr[data-id="off-sunny-sf-e326015wt"]').count());
  await page.locator('#rows tr[data-id="off-sunny-sf-e326015wt"] [data-product-spec]').click();
  assert.equal(await page.locator('#productSpecBody [data-spec-field=flywheelWeight] td').innerText(),'Not applicable');
 }finally{await browser.close();}
 console.log('PASS: 87 audited elliptical specs, real checkbox evidence, one-time Worker replacement, and exact partitions for all 68 fields.');
})().catch(error=>{console.error(error);process.exit(1);});
