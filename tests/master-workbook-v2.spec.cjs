const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const read=path=>JSON.parse(fs.readFileSync(__dirname+'/../'+path,'utf8'));

(async()=>{
 const audit=read('data/specifications/master-workbook-v2-audit.json');
 const templates=read('data/specifications/templates.json');
 const archive=read('data/off-sunny-web/items.json');
 const current=fs.readdirSync(__dirname+'/../data').filter(file=>file.endsWith('.json')).flatMap(file=>read('data/'+file));
 const byId=new Map([...current,...archive].map(item=>[item.id,item]));
 assert.equal(audit.items.length,885);
 assert.equal(new Set(audit.items.map(item=>item.id)).size,885);
 assert.deepEqual(Object.fromEntries(Object.entries(audit.categories).map(([name,{fields,products}])=>[name,[fields,products]])),{
  Treadmills:[73,108],Ellipticals:[68,87],Rowers:[68,79],'Indoor Bikes':[73,166],Steppers:[66,46],
  'Row-N-Ride':[65,18],'Pilates Reformers':[28,2],Essentials:[52,171],Weights:[25,138],Racks:[102,36],'Weight Benches':[30,34]
 });
 assert.deepEqual(audit.aliases,[{workbookSku:'SF-DB01-55',appSku:'SF-DB01',id:'off-sunny-sf-db01',canonicalId:'off-sunny-sf-db01-55'}]);
 assert.equal(audit.crossListed.length,3);
 assert.deepEqual(audit.appOnly.map(item=>item.sku),['SF-T7603-CB']);
 for(const provenance of audit.items){
  const item=byId.get(provenance.id),details=item.specDetails;
  const keys=templates[item.category].flatMap(section=>section.fields.map(([key])=>key));
  assert.equal(details.masterTemplate,'master-spec-workbook-v2');
  assert.equal(keys.length,(provenance.workbook||0)+(provenance.isv||0)+(provenance.unavailable||0));
  assert.deepEqual(Object.keys(details.values),keys.filter(key=>Object.hasOwn(details.values,key)));
  assert.deepEqual(Object.keys(details.values),Object.keys(details.evidence));
  let workbook=0,isv=0;
  for(const value of Object.values(details.evidence)){
   if(value.startsWith('ISV 4.0 / SHF / ')){
    assert.match(value,new RegExp('[A-Z]+'+provenance.isvRow+'$'));
    isv++;
   }else{
    assert(value.startsWith(audit.workbook+' / '+item.category+' / '));
    assert.match(value,new RegExp('[A-Z]+'+provenance.row+'$'));
    workbook++;
   }
  }
  assert.equal(workbook,provenance.workbook||0);
  assert.equal(isv,provenance.isv||0);
 }
 const treadmill=byId.get('off-sunny-sf-t726025');
 assert.equal(treadmill.specDetails.values.latex,'Yes (rubber and silicone)');
 assert.equal(treadmill.specDetails.values.pfas,undefined);
 assert.match(byId.get('off-sunny-sf-x7300smart').specDetails.values.maxUserWeightLb,/400 lbs/i);
 const fallback=audit.items.find(row=>row.isv>0);
 const fallbackItem=byId.get(fallback.id);
 const fallbackField=Object.keys(fallbackItem.specDetails.evidence).find(key=>fallbackItem.specDetails.evidence[key].startsWith('ISV 4.0 / SHF'));
 const {sql,request}=await require('./usage-fixture.cjs')();
 global.APP_CATALOG.push(...archive);
 await request('/api/items');
 const marker='master-spec-workbook-v2-20261117';
 sql.prepare('DELETE FROM catalog_meta WHERE key=?').run(marker);
 const dumbbell=byId.get('off-sunny-sf-db01-55');
 sql.prepare('UPDATE items SET id=?, data=json_set(data,\'$.sku\',?) WHERE id=?')
  .run('off-sunny-sf-db01','SF-DB01',dumbbell.id);
 sql.prepare("UPDATE items SET data=json_set(data,'$.specDetails',json(?)) WHERE id=?").run('{"values":{"latex":"old"}}',treadmill.id);
 const before=sql.prepare('SELECT data FROM items WHERE id=?').get(treadmill.id).data;
 const rows=await(await request('/api/items')).json();
 const updated=rows.find(row=>row.id===treadmill.id);
 const {specDetails,...remaining}=updated,{specDetails:prior,...priorRemaining}=JSON.parse(before);
 assert.deepEqual(specDetails,treadmill.specDetails);
 assert.deepEqual(rows.find(row=>row.id==='off-sunny-sf-db01').specDetails,dumbbell.specDetails);
 assert.deepEqual(remaining,{...priorRemaining,id:treadmill.id});
 assert.equal(sql.prepare('SELECT value FROM catalog_meta WHERE key=?').get(marker).value,'applied');
 sql.prepare("UPDATE items SET data=json_set(data,'$.specDetails.values.latex','later') WHERE id=?").run(treadmill.id);
 assert.equal((await(await request('/api/items')).json()).find(row=>row.id===treadmill.id).specDetails.values.latex,'later');
 sql.close();

 const html=fs.readFileSync(__dirname+'/../app/index.html','utf8');
 assert(html.includes('PRODUCT_SPEC_TEMPLATES='+JSON.stringify(templates)+';'));
 const testHtml=html.replace('  function fieldValues(field){',
  '  window.workbookPartitions=keys=>keys.map(key=>{const field={key,source:"product"},entries=specIndex().entries,answers=fieldValues(field);return {key,total:entries.length,counts:answers.map(value=>answerCounts.get(norm(value))),hits:entries.map(entry=>answers.filter(value=>matchesSpec(entry,{...field,value})).length)};});\n  function fieldValues(field){');
 const ellipticals=audit.items.filter(record=>record.category==='Ellipticals').map(record=>byId.get(record.id));
 const rack=byId.get(audit.items.find(record=>record.category==='Racks').id);
 const uiItems=[...new Map([treadmill,fallbackItem,rack,...ellipticals].map(item=>[item.id,item])).values()];
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(url.origin!=='https://workbook.test')return route.abort();
   if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:testHtml});
   return route.fulfill({json:url.pathname==='/api/items'?uiItems:{canWrite:false,practice:false}});
  });
  await page.goto('https://workbook.test/?category=Treadmills');
  await page.locator('[data-product-spec="'+treadmill.id+'"]').click();
  assert.equal(await page.locator('#productSpecBody [data-spec-field=latex] td').innerText(),'Yes (rubber and silicone)');
  assert.equal(await page.locator('#productSpecBody [data-spec-field=pfas] td').innerText(),'Unavailable');
  await page.keyboard.press('Escape');
  await page.locator('[data-product-spec="'+fallbackItem.id+'"]').click();
  assert.equal(await page.locator('#productSpecBody [data-spec-field='+fallbackField+'] .source-badge').innerText(),'(From ISV)');
  await page.goto('https://workbook.test/?category=Racks');
  await page.locator('[data-product-spec="'+rack.id+'"]').click();
  assert.deepEqual(await page.locator('#productSpecBody [data-spec-field] th').allTextContents(),
   templates.Racks.flatMap(section=>section.fields.map(([,label])=>label)));
  await page.goto('https://workbook.test/?view=spec-search');
  await page.selectOption('#specCategory','Ellipticals');
  await page.waitForFunction(n=>document.querySelectorAll('#rows tr[data-id]').length===n,ellipticals.length);
  const keys=templates.Ellipticals.flatMap(section=>section.fields.map(([key])=>key));
  for(const {key,total,counts,hits} of await page.evaluate(keys=>window.workbookPartitions(keys),keys)){
   assert.equal(total,87,key);
   assert.equal(counts.reduce((sum,n)=>sum+n,0),total,key+' counts sum');
   assert(hits.every(n=>n===1),key+' partitions every model');
  }
 }finally{await browser.close();}
 console.log('PASS: 885 Product Specs across 11 categories, with labeled ISV fills and one-time migration.');
})().catch(error=>{console.error(error);process.exit(1);});
