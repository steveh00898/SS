const {execFileSync}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert');
// practice-report merges both apps' exports (skipping duplicates) and matches the Progress view's numbers.
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'practice-'));const at=(d,h)=>new Date(Date.UTC(2026,9,d,h)).toISOString();
const r=(id,d,sku,category,field,correct)=>({id,at:at(d,18),sessionId:'s',sku,itemId:sku.toLowerCase(),category,field,correct,chosen:'',answer:''});
fs.writeFileSync(path.join(dir,'claude-artifact.json'),JSON.stringify({kind:'sku-practice-results',source:'claude-artifact',exportedAt:at(22,20),records:[r('a1',20,'SF-T724081','Treadmills','sku',true),r('a2',20,'SF-T724081','Treadmills','name',false),r('a3',21,'SF-E905SMART','Ellipticals','sku',false),r('a4',22,'SF-E905SMART','Ellipticals','price',true)]}));
fs.writeFileSync(path.join(dir,'private-site.json'),JSON.stringify({kind:'sku-practice-results',source:'private-site',records:[r('a4',22,'SF-E905SMART','Ellipticals','price',true),r('b1',22,'SF-T724081','Treadmills','sku',true),{id:'bad',field:'colour'}]}));
const out=execFileSync(process.execPath,[path.join(__dirname,'../scripts/practice-report.mjs'),'--dir',dir,'--now',at(22,22),'--md'],{encoding:'utf8',stdio:['ignore','pipe','ignore']});
assert.match(out,/\*\*5 answers, 60% correct\*\*, 3 days practiced, 3-day streak, 0 of 2 products mastered/);assert.match(out,/private-site\.json: 2 results \(1 already in another file\)/);
assert.match(out,/\| SKU \| 3 \| 2 \| 67% \|/);assert.match(out,/\| Item name \| 1 \| 0 \| 0% \|/);assert.match(out,/\| Price \| 1 \| 1 \| 100% \|/);assert.match(out,/Most correct: Price \(100%\)\. Most missed: SKU \(1 missed\)\./);
assert.match(out,/\| Treadmills \| 100% \(2\) \| 0% \(1\) \| - \| 67% \(3\) \|/);assert.match(out,/\| Ellipticals \| 0% \(1\) \| - \| 100% \(1\) \| 50% \(2\) \|/);assert.ok(out.indexOf('| Treadmills')<out.indexOf('| Ellipticals'));
assert.match(out,/## Most missed products[\s\S]*SF-T724081 \| Pace 500/);assert.equal(fs.readFileSync(path.join(dir,'report.md'),'utf8'),out);
fs.rmSync(dir,{recursive:true});console.log('PASS: practice report merges both app exports without duplicates, skips invalid rows, and reports overall, field, category, product, day and streak numbers.');
