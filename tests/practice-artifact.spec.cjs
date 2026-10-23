const revealOptions=require('./mobile-options.cjs');
const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert');
// SKU practice in the Claude Artifact runtime (window.claude): results go to the viewer's private
// data/users/<id>/practice-* documents, load back after a reload, and export as a results file.
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
const rows=fs.readdirSync(__dirname+'/../data').filter(p=>p.endsWith('.json')).flatMap(p=>JSON.parse(fs.readFileSync(__dirname+'/../data/'+p,'utf8')).map(row=>({...row,imageUrl:'data:image/gif;base64,R0lGODlhAQABAAAAACw='})));
const store={};const paths=new Set();await page.exposeFunction('__dbSet',(p,v)=>{paths.add(p);store[p]=v});await page.exposeFunction('__dbDel',p=>{delete store[p]});await page.exposeFunction('__dbAll',()=>store);
const mock=`window.__rows=${JSON.stringify(rows)};window.__dl=[];window.fetch=async()=>{throw new TypeError('offline')};
const coll=(path)=>({path,onSnapshot(next){next({docs:window.__rows.map(r=>({id:r.id,exists:true,data:()=>r}))});return()=>{}},
  async get(){const all=await window.__dbAll();return {docs:Object.keys(all).filter(k=>k.startsWith(path+'/')).map(k=>({id:k.slice(path.length+1),exists:true,data:()=>all[k]}))}},
  doc:id=>({set:v=>window.__dbSet(path+'/'+id,JSON.parse(JSON.stringify(v))),delete:()=>window.__dbDel(path+'/'+id)})});
const caps={db:{collection:coll},user:{can:async()=>true,id:async()=>'viewer-1'},assets:{upload:async()=>({id:'x',url:''})},downloads:{save:async({filename,data})=>{window.__dl.push({filename,text:await data.text()})}}};
window.claude={use:async n=>caps[n]||null};`;
await page.addInitScript(mock);const html=fs.readFileSync(__dirname+'/../app/index.html','utf8');await page.route('https://artifact.test/**',r=>r.fulfill({contentType:'text/html',body:html}));
await page.goto('https://artifact.test/?view=practice');await page.waitForFunction(()=>/saved to your account/.test(document.querySelector('#practiceView').textContent),null,{timeout:15000});
await revealOptions(page,'[data-pfield="name"]');await page.locator('[data-pfield="name"]').check();await revealOptions(page,'[data-pstart="quiz"]');await page.locator('[data-pstart="quiz"]').click();await page.waitForSelector('.qcell');await page.keyboard.press('1');await page.keyboard.press('2');await page.waitForFunction(()=>window.__dbAll().then(s=>Object.keys(s).length===1));
let docs=Object.entries(store);assert.equal(docs.length,1);assert.match(docs[0][0],/^data\/users\/viewer-1\/practice-[a-z0-9]+$/);assert.equal(docs[0][1].records.length,2);assert.deepEqual(docs[0][1].records.map(r=>r.field),['sku','name']);
await revealOptions(page,'#pNext');await page.locator('#pNext').click();await page.keyboard.press('3');await page.keyboard.press('3');await page.waitForFunction(()=>window.__dbAll().then(s=>Object.values(s)[0].records.length===4));assert.equal(Object.keys(store).length,1);
await page.goto('https://artifact.test/?view=progress');await page.waitForSelector('.tiles');assert.equal((await page.locator('.tile .v').allInnerTexts())[0],'4');
await revealOptions(page,'[data-pact="export-json"]');await page.locator('[data-pact="export-json"]').click();await page.waitForFunction(()=>window.__dl.length===1);const file=await page.evaluate(()=>window.__dl[0]);assert.equal(file.filename,'practice-claude-artifact.json');const parsed=JSON.parse(file.text);assert.equal(parsed.source,'claude-artifact');assert.equal(parsed.records.length,4);assert.ok(parsed.records.every(r=>!('user' in r)));
await revealOptions(page,'[data-pact="reset"]');await page.locator('[data-pact="reset"]').click();await revealOptions(page,'[data-pact="reset-yes"]');await page.locator('[data-pact="reset-yes"]').click();await page.waitForFunction(()=>window.__dbAll().then(s=>!Object.keys(s).length));
assert.ok([...paths].every(p=>p.startsWith('data/users/viewer-1/')));assert.deepEqual(errors,[]);await browser.close();console.log('PASS: Claude Artifact runtime saves SKU practice results in the viewer\'s private data/users/<id>/ documents, reloads them for the dashboard, exports a results file and resets.');})().catch(e=>{console.error(e);process.exit(1)});
