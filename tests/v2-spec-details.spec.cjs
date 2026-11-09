const assert=require('assert'),fs=require('fs'),{chromium}=require('playwright');
(async()=>{
 const root=__dirname+'/..',templates=JSON.parse(fs.readFileSync(root+'/data/specifications/templates.json','utf8')),html=fs.readFileSync(root+'/app/index.html','utf8');
 assert.deepEqual(JSON.parse(html.match(/const PRODUCT_SPEC_TEMPLATES=(.*);\r?\n/)[1]),templates);
 const catalog=fs.readdirSync(root+'/data').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(root+'/data/'+f,'utf8')));
 assert.equal(catalog.length,156);
 // Every category keeps one template: unique keys, the shared sections in the same order, and the V2 fields added once.
 const keysOf=c=>templates[c].flatMap(s=>s.fields.map(f=>f[0]));
 for(const [category,sections] of Object.entries(templates)){const keys=keysOf(category);assert.equal(new Set(keys).size,keys.length,category+' has duplicate fields');assert.deepEqual(sections.map(s=>s.title).slice(0,2),['Product and dimensions','Performance and adjustments']);assert.deepEqual(sections.at(-1).fields.map(f=>f[0]),['features','certification']);for(const k of ['brand','productWeight','keyDimensions','foldedDimensions','shippingWeight','shippingDimensions'])assert(keys.includes(k),category+' lacks '+k);}
 for(const c of ['Treadmills','Indoor Bikes','Ellipticals','Rowers','Steppers','Row-N-Ride'])for(const k of ['ftms','wifi','plugType'])assert(keysOf(c).includes(k),c+' lacks '+k);
 assert.deepEqual(keysOf('Treadmills').filter(k=>/Hp$/.test(k)),['peakHp','continuousHp']);
 // Treadmills follow the SF-T723030 sheet's rows in its order; Ellipticals follow SF-E324028, the elliptical sheet with the most filled fields.
 const order=(c,ks)=>{const all=keysOf(c);assert.deepEqual(ks.map(k=>all.indexOf(k)),ks.map(k=>all.indexOf(k)).slice().sort((x,y)=>x-y),c+' keeps the sheet order');ks.forEach(k=>assert(all.includes(k),c+' lacks '+k));};
 order('Treadmills',['brand','color','materials','latex','shippingWeight','productWeight','flywheelWeight','keyDimensions','foldedDimensions','shippingDimensions','footprint','maxUserWeightLb','maxUserHeight','resistanceType','magnets','treadmillType','speedRange','inclineType','inclineLevels','inclineDegrees','inclineRange','electrical','watts','amps','motorType','peakHp','continuousHp','beltDimensions','runningSurface','quickButtons','softDrop','shockAbsorption','motorized','foldable','storage','deckType','stepOnHeight','screenSize','screenType','programs','battery','deviceHolder','bottleHolder','heartRate','wirelessHeartRate','bluetooth','bluetoothApp','plugType','powerCord','display','speakers','usb','remoteControl','features','certification']);
 order('Ellipticals',['brand','upc','color','materials','latex','shippingWeight','productWeight','flywheelWeight','keyDimensions','foldedDimensions','shippingDimensions','seatDimensions','footprint','maxUserWeightLb','maxUserHeight','resistanceType','speedResistanceLevels','magnets','motorized','driveResistanceSystem','crankLength','pedalBothDirections','selfLevelingPedals','footStraps','stride','stepHeight','transportWheels','controlOnHandlebar','meterSize','battery','screenType','screenSize','display','programs','bluetooth','bluetoothApp','ftms','wifi','fan','speakers','usb','heartRate','wirelessHeartRate','deviceHolder','bottleHolder','plugType','powerCord','electrical','watts','amps','energySaver','remoteControl','features','certification']);
 for(const k of ['driveResistanceSystem','speedResistanceLevels','workoutAreaWidthIn','workoutAreaLengthIn'])assert(!keysOf('Treadmills').includes(k),'Treadmills drops the app summary row '+k);
 const unmatched=['sf-e322004','cb110s','no-031-b','sf-bh6996','sf-db01-055','no-066-10'];
 // The six unmatched records later received only the 2026-11-09 requested-field fill (tests/master-spec-fill.spec.cjs).
 const FILL=['productWeight','shippingWeight','keyDimensions','shippingDimensions','qFactor','flywheelWeight','inseam','stepOnHeight','beltDimensions'],masterOnly=i=>i.specDetails?.notes?.some(n=>n.startsWith('Requested fields filled on 2026-11-09'))&&Object.keys(i.specDetails.values).every(k=>FILL.includes(k));
 // The V2 checks below look at V2 values only; fields added by the 2026-11-09 fill carry their own evidence.
 const fillAudit=JSON.parse(fs.readFileSync(root+'/data/specifications/master-fill-audit.json','utf8')),added=[...fillAudit.filled,...(fillAudit.appliedConflicts||[])];
 const v2View=i=>{const d=JSON.parse(JSON.stringify(i.specDetails));for(const f of added.filter(f=>f.id===i.id)){delete d.values[f.field];delete d.evidence[f.field];}d.sources=d.sources.filter(s=>s.startsWith('V2 spec sheet: '));d.notes=(d.notes||[]).filter(n=>!n.startsWith('Requested fields filled on 2026-11-09')&&!n.startsWith('2026-11-09 owner decision:'));return d};
 const filled=catalog.filter(i=>i.specDetails&&!masterOnly(i));assert.equal(filled.length,150);assert.deepEqual(catalog.filter(i=>!i.specDetails||masterOnly(i)).map(i=>i.id).sort(),[...unmatched].sort());
 const banned=/\b(PO#|supplier|created by|e\.g\.|if yes|if no|or others|this should be|check the data|pending|will update|will add)\b|^(flip|n\/?a|na|none|no limit)$|[一-鿿]/i;
 for(const item of filled){const d=v2View(item),keys=keysOf(item.category),vk=Object.keys(d.values);
  assert(templates[item.category],item.id);assert.equal(d.version,1);assert.equal(d.sources.length,1);assert.match(d.sources[0],/^V2 spec sheet: /);
  assert(vk.length>0,item.id);assert.deepEqual(vk,keys.filter(k=>vk.includes(k)),item.id+' values follow the category template order');assert.deepEqual(Object.keys(d.evidence),vk,item.id+' has evidence for every value');
  const file=d.sources[0].slice('V2 spec sheet: '.length);for(const [k,v] of Object.entries(d.values)){assert.equal(typeof v,'string');assert(v.trim(),item.id+' '+k);assert(!banned.test(v.trim())||k==='features'&&!/PO#|pending|will update|[一-鿿]/i.test(v),item.id+' '+k+': '+v);assert(d.evidence[k].startsWith(file+' / '),item.id+' '+k);assert.match(d.evidence[k],/ \/ [A-Z]+\d+(, [A-Z]+\d+)*$/);}
  for(const k of ['maxUserWeightLb','maxUserHeight'])assert(!/no\s*(height\s*)?limit|unlimited/i.test(d.values[k]||''),item.id);
  for(const k of ['peakHp','continuousHp'])if(d.values[k])assert.match(d.values[k],/^[0-9.]+ HP$/);}
 const byId=Object.fromEntries(catalog.map(i=>[i.id,i]));
 // Product vs folded vs shipping dimensions, product vs shipping weight, peak vs continuous HP stay separate.
 const t=byId['sf-t723030'].specDetails.values;assert.equal(t.peakHp,'2.5 HP');assert.equal(t.continuousHp,'1.25 HP');assert.match(t.productWeight,/130Lbs/);assert.match(t.shippingWeight,/146.2Lbs/);assert.match(t.keyDimensions,/63.8\*30.9\*45.7/);assert.match(t.foldedDimensions,/11.4 inches/);assert.match(t.shippingDimensions,/70.3\*33.3\*10/);assert.match(t.runningSurface,/53.1\*20.1/);assert.match(t.beltDimensions,/110.6\*20/);
 const e=byId['sf-e324028'].specDetails.values;assert.equal(Object.keys(e).length,43);assert.equal(e.meterSize,'107*91mm/4.2*3.6inches');assert.equal(e.remoteControl,'Yes; battery: AAA/2pcs');assert.equal(e.footStraps,'Yes');assert.equal(e.certification,undefined,'placeholder "To de test" is not a certification');
 assert.equal(byId['sf-t722069'].specDetails.values.remoteControl,'Battery: CR2032/3V');assert.equal(byId['sf-x7210'].specDetails.values.remoteControl,'No');assert.equal(byId['sf-b1805smart'].specDetails.values.certification,undefined);
 // User-weight limits stay apart from rack and frame capacities.
 const rack=byId['sf-xf9925'].specDetails.values;assert.match(rack.pullUpUserWeight,/330LBS/);assert.match(rack.frameCapacity,/^1000LBS/);assert.match(rack.componentCapacities,/Hook: 800LBS/);assert.equal(rack.maxUserWeightLb,undefined);
 const bench=byId['sf-bh6920'].specDetails.values;assert.equal(bench.maxUserWeightLb,'330 lb');assert.match(bench.capacityConditions,/^500 lb \(Max User Weight 330 lb\)/);assert.equal(bench.frameCapacity,undefined);
 for(const id of ['sf-s025063','sf-s025064','sf-s025065'])assert.equal(byId[id].specDetails.values.maxUserHeight,undefined);
 // SMART and colour suffixes are matched exactly; the cross-listed SKU uses each record's own category template.
 assert.match(byId['sf-rw5713smart'].specDetails.sources[0],/RW5713SMART/);assert.match(byId['sf-em02-gy'].specDetails.evidence.color,/ \/ SF-EM02-GY \/ /);
 const both=catalog.filter(i=>i.sku==='SF-RBE420049');assert.equal(both.length,2);assert.notDeepEqual(Object.keys(both[0].specDetails.values),Object.keys(both[1].specDetails.values));
 // Audit file and conflict report: hashes and model evidence only, no workbook binaries.
 const audit=JSON.parse(fs.readFileSync(root+'/data/specifications/v2-sources.json','utf8'));assert.equal(audit.matched.length,150);assert.equal(audit.filesReadTotal,456);
 for(const m of audit.matched){assert.match(m.sha256,/^[a-f0-9]{64}$/);assert.equal(m.modelEvidence.text.replace(/[\s.\-_‐‑]/g,'').toUpperCase(),m.sku.replace(/[\s.\-_]/g,'').toUpperCase());assert.equal(byId[m.id].specDetails.sources[0],'V2 spec sheet: '+m.file);}
 assert.deepEqual(audit.unmatchedProducts.flatMap(u=>u.ids).sort(),[...unmatched].sort());
 const conflictRows=fs.readFileSync(root+'/data/specifications/v2-conflicts.md','utf8').split(/\r?\n/).filter(l=>/^\| \d+ \|/.test(l));assert.equal(conflictRows.length,audit.conflicts);
 assert(!/\b(created by|supplier contact|FOB|unit cost)\b/i.test(JSON.stringify(audit)));
 for(const f of fs.readdirSync(root+'/data/specifications'))assert(!/\.(xlsx?|docx|pdf)$/i.test(f));

 // One-time backfill on an existing private-Site database: fills only empty specDetails, keeps app edits and every other field.
 const {sql,worker,env,request}=await require('./usage-fixture.cjs')();
 global.APP_CATALOG.push(...JSON.parse(fs.readFileSync(root+'/data/off-sunny-web/items.json','utf8')));await request('/api/items');
 sql.prepare("DELETE FROM catalog_meta WHERE key='current-v2-spec-details-20261101'").run();
 sql.prepare("UPDATE items SET data=json_remove(data,'$.specDetails') WHERE COALESCE(json_extract(data,'$.catalogSource'),'current')<>'off-sunny-web'").run();
 const custom={version:1,values:{brand:'Owner edit'},evidence:{},sources:['Edited in the app'],notes:[]};
 sql.prepare("UPDATE items SET data=json_set(data,'$.specDetails',json(?)) WHERE id='sf-t723030'").run(JSON.stringify(custom));
 sql.prepare("UPDATE items SET data=json_set(data,'$.specDetails',json('null')) WHERE id='sf-e905smart'").run();
 sql.prepare("UPDATE items SET data=json_set(data,'$.specDetails',json('{\"version\":1,\"values\":{}}')) WHERE id='sf-t724081'").run();
 sql.prepare("UPDATE items SET data=json_set(data,'$.sku','SF-X7100-EDIT','$.name','Renamed in app') WHERE id='sf-x7100'").run();
 const before=Object.fromEntries(sql.prepare('SELECT id,data FROM items').all().map(r=>[r.id,JSON.parse(r.data)]));
 const rows=await(await request('/api/items')).json();assert.equal(rows.length,156+JSON.parse(fs.readFileSync(root+'/data/off-sunny-web/items.json','utf8')).length);
 for(const row of rows){const old=before[row.id];const {specDetails,...rest}=row,{specDetails:oldDetails,...oldRest}=old;assert.deepEqual(rest,{...oldRest,id:row.id},row.id+' other fields unchanged');
  const master=byId[row.id];
  if(row.catalogSource==='off-sunny-web')assert.deepEqual(specDetails,oldDetails);
  else if(row.id==='sf-t723030')assert.deepEqual(specDetails,custom);
  else if(row.id==='sf-x7100')assert.equal(specDetails,undefined);
  else if(master?.specDetails)assert.deepEqual(specDetails,master.specDetails,row.id);
  else assert.equal(specDetails,undefined,row.id);}
 assert(sql.prepare("SELECT value FROM catalog_meta WHERE key='current-v2-spec-details-20261101'").get());
 sql.prepare("UPDATE items SET data=json_remove(data,'$.specDetails') WHERE id='sf-t722069'").run();
 assert.equal((await(await request('/api/items')).json()).find(r=>r.id==='sf-t722069').specDetails,undefined,'the backfill runs once');
 // A legacy client save without specDetails keeps them; the worker keeps every imported value.
 const legacy={...rows.find(r=>r.id==='sf-b124067')};delete legacy.specDetails;assert.equal((await request('/api/items/sf-b124067',{method:'PUT',body:{value:legacy},user:'owner'})).status,200);
 assert.deepEqual((await(await request('/api/items')).json()).find(r=>r.id==='sf-b124067').specDetails,byId['sf-b124067'].specDetails);

 // The Product Spec dialog shows each category's template for every product: same headings, labels and order; gaps read "Unavailable".
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const r=route.request();if(new URL(r.url()).origin!=='https://usage.test')return route.abort();const response=await worker.fetch(new Request(r.url(),{method:r.method(),headers:{...r.headers(),'oai-authenticated-user-id':'owner'},body:r.method()==='GET'?undefined:r.postData()}),env);await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:Buffer.from(await response.arrayBuffer())});});
 const shown=await(await request('/api/items')).json();
 for(const category of Object.keys(templates)){const items=shown.filter(i=>i.category===category&&i.catalogSource!=='off-sunny-web');const picks=[...new Set([items[0],items.at(-1),items.find(i=>!i.specDetails)].filter(Boolean))];
  await page.goto('https://usage.test/?source=current&category='+encodeURIComponent(category));const expected=templates[category].map(s=>[s.title,s.fields.map(f=>f[1])]);
  for(const item of picks){await page.locator('[data-product-spec="'+item.id+'"]').first().click();await page.locator('#productSpecDialog').waitFor({state:'visible'});
   const layout=await page.locator('#productSpecBody .spec-section').evaluateAll(s=>s.filter(x=>x.querySelector('table')).map(x=>[x.querySelector('h3').textContent,[...x.querySelectorAll('th')].map(th=>th.textContent)]));assert.deepEqual(layout,expected,category+' '+item.id);
   const raw=item.productSpecs||item.treadmillSpecs||{},comparison={...raw};if(category==='Treadmills'){delete comparison.keyDimensions;delete comparison.speedResistanceLevels;if(raw.keyDimensions)comparison.runningSurface=raw.keyDimensions;if(raw.speedResistanceLevels)comparison.speedRange=raw.speedResistanceLevels;}else if(/^Folded:/.test(raw.keyDimensions||'')){delete comparison.keyDimensions;comparison.foldedDimensions=raw.keyDimensions.slice(7).trim();}if(category==='Ellipticals'&&raw.strideLengthIn!=null)comparison.stride=raw.strideLengthIn+' in';
   const assertDisplayedSource=async(key,value)=>{
    const display=await page.locator('#productSpecBody [data-spec-field="'+key+'"] td').textContent();
    const actual=display.replace(/ · Unit unverified$| \(estimated unit\)$/,'');
    if(actual===String(value))return;
    if(display.endsWith(' (estimated unit)')&&actual.replace(/ (?:lb|kg|g|oz|in|cm|mm|ft|m)$/,'')===String(value))return;
    // A simple measurement may now use a common suffix and × instead of its source punctuation.
    assert.match(actual,/^[φØø]?[\d.]+(?: × [\d.]+)* (?:lb|kg|g|oz|in|cm|mm|ft|m)(?: \([LWHDT](?: × [LWHDT])+\))?$/,item.id+' '+key);
    const numbers=text=>(String(text).match(/\d+(?:\.\d+)?/g)||[]).map(Number);
    assert.deepEqual(numbers(actual),numbers(value),'app source numbers win: '+item.id+' '+key);
   };
   for(const [key,value] of Object.entries(item.specDetails?.values||{})){if(comparison[key]!=null)continue;await assertDisplayedSource(key,value);}
   for(const [key,value] of Object.entries(comparison))if(value!=null&&keysOf(category).includes(key)&&typeof value==='string')await assertDisplayedSource(key,value);
   if(item.id==='sf-t723030'){assert.equal(await page.locator('#productSpecBody [data-spec-field="runningSurface"] td').textContent(),'53.1 × 20.1 in');assert.match(await page.locator('#productSpecBody [data-spec-field="keyDimensions"] td').textContent(),/63.8(?:\*| × )30.9(?:\*| × )45.7/);}
   const gaps=await page.locator('#productSpecBody td.spec-unavailable').allTextContents();assert(gaps.length>0&&gaps.every(g=>g==='Unavailable'));
   if(item.specDetails&&!masterOnly(item))assert.match(await page.locator('#productSpecBody').innerText(),/V2 spec sheet: /);
   await page.keyboard.press('Escape');await page.locator('#productSpecDialog').waitFor({state:'hidden'});}}
 assert.deepEqual(errors,[]);await browser.close();sql.close();
 console.log('PASS: V2 Product Spec for 150 of 156 current products follows each category template in order with evidence; unmatched 6 stay empty; one-time backfill fills only empty specDetails and keeps app edits; the dialog shows identical layouts per category with app values winning.');
})().catch(e=>{console.error(e);process.exit(1)});
