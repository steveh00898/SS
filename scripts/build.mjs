import {readFile,readdir,mkdir,writeFile,cp} from 'node:fs/promises';
let catalog=[];for(const path of (await readdir('data')).filter(p=>p.endsWith('.json'))){const category=path.slice(0,-5);const rows=JSON.parse(await readFile('data/'+path,'utf8'));catalog.push(...rows.map(row=>({...row,imageAssetId:null,imageUrl:'/api/catalog-images/'+category+'/'+row.id+'.jpg'})))};
catalog.push(...JSON.parse(await readFile('data/off-sunny-web/items.json','utf8')));
const guides={};for(const file of (await readdir('data/manuals')).filter(p=>p.endsWith('.json')))Object.assign(guides,JSON.parse(await readFile('data/manuals/'+file,'utf8')));
const isvKeys={current:[],off:[]};for(const file of ['treadmills','current-products','off-sunny-products']){const data=JSON.parse(await readFile('data/isv/'+file+'.json','utf8'));isvKeys[file==='off-sunny-products'?'off':'current'].push(...data.items.map(item=>file==='off-sunny-products'?item.id:item.sku));}
const archiveResourceBaseline=JSON.parse(await readFile('data/off-sunny-web/batch-three-official-baseline.json','utf8'));
const sheetImages={};for(const row of catalog.filter(r=>r.catalogSource==='off-sunny-web'&&r.imageUrl&&!r.imageUrl.endsWith('-owner-photo-v1.jpg')&&!['v3-batch-4','v3-batch-5','us-mastersheet-v1-missing','isv-shf-gap-20261111'].includes(r.importBatch))){sheetImages[row.imageUrl]=(await readFile('data/images/off-sunny-web/'+row.imageUrl.split('/').pop())).toString('base64');}
const specGaps=JSON.parse(await readFile('data/specifications/master-spec-gaps-20261113.json','utf8')).updates;
const html=await readFile('app/index.html','utf8');const worker=await readFile('server/worker.js','utf8');
await mkdir('dist/server',{recursive:true});await writeFile('dist/server/index.js','const APP_SPEC_GAPS='+JSON.stringify(specGaps)+';\nconst APP_ISV_KEYS='+JSON.stringify(isvKeys)+';\nconst APP_ARCHIVE_RESOURCE_BASELINE='+JSON.stringify(archiveResourceBaseline)+';\nconst APP_SHEET_IMAGES='+JSON.stringify(sheetImages)+';\nconst APP_HTML='+JSON.stringify(html)+';\nconst APP_CATALOG='+JSON.stringify(catalog)+';\nconst APP_GUIDES='+JSON.stringify(guides)+';\n'+worker);
await cp('drizzle','dist/server/migrations',{recursive:true});
await writeFile('dist/server/wrangler.json',JSON.stringify({name:'sunny-product-finder',main:'index.js',compatibility_date:'2026-10-06',d1_databases:[{binding:'DB',database_name:'DB',database_id:'DB',migrations_dir:'migrations'}],r2_buckets:[{binding:'BUCKET',bucket_name:'BUCKET'}]},null,2));
console.log('Built standalone Worker and migrations.');
