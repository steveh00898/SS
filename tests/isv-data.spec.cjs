const assert=require('node:assert');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'data','isv','treadmills.json'),'utf8'));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'data','treadmills.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'app','index.html'),'utf8');
const embeddedMatch=html.match(/  const ISV_TREADMILL_DATA=(.*);\r?\n  const resourceFor=/);
assert.ok(embeddedMatch,'embedded ISV snapshot is present');
const current=JSON.parse(fs.readFileSync(path.join(root,'data','isv','current-products.json'),'utf8'));
assert.deepEqual(JSON.parse(embeddedMatch[1]),current,'embedded ISV snapshot matches all current products');
assert.equal(current.items.length,156);
assert.equal(new Set(current.items.map(item=>item.id)).size,156);
assert.equal(new Set(current.items.map(item=>item.sku)).size,153);
for(const item of source.items)assert.equal(current.items.find(row=>row.id===item.id).row,item.row,'exact treadmill matches are preserved');
assert.equal(current.source.file,'ISV 4.0.xlsx');
assert.equal(current.source.sheet,'SHF');
assert.equal(current.items.find(row=>row.sku==='SF-T723030').fields.CI,'SunnyFit® App');
assert.ok(!current.items.some(item=>Object.values(item.fields).some(value=>String(value).includes('\ufffd'))),'clean reference has no replacement characters');
assert.equal(current.items.find(row=>row.sku==='NO. 077S').row,73,'exact SKU wins over a differently hyphenated variant');

assert.equal(source.source.sheet,'ISV 4');
assert.equal(source.source.columns,'A:FN');
assert.equal(source.items.length,23);
assert.equal(new Set(source.items.map(item=>item.sku)).size,23);
assert.deepEqual(source.items.map(item=>item.sku).sort(),catalog.map(item=>item.sku).sort());
assert.deepEqual(source.sections.map(section=>section.title),['Basic Information','Production','Carton Dimensions','Case Pack Dimensions','Product Dimensions & Weight','Marketing / Product Description','General Spec','Battery','Bike','Treadmill','Rower','Strength','Belt','Glove']);

const columnNumber=column=>[...column].reduce((value,letter)=>value*26+letter.charCodeAt(0)-64,0);
const lastColumn=columnNumber('FN');
for(const item of source.items){
  assert.ok(item.row>=4,`${item.sku} has a workbook row`);
  assert.ok(Object.keys(item.fields).every(column=>columnNumber(column)<=lastColumn),`${item.sku} contains no data after FN`);
}
const t723030=source.items.find(item=>item.sku==='SF-T723030');
assert.equal(t723030.row,714);
assert.equal(t723030.fields.BP,63.8,'the invalid source cell remains visible for review');
assert.equal(source.specMap.latex.column,'BP');

console.log('PASS: 23 exact treadmill ISV rows, A:FN boundary, category map, embedded snapshot parity, and source-value preservation.');
