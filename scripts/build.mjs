import {readFile,readdir,mkdir,writeFile,cp} from 'node:fs/promises';
let catalog=[];for(const path of (await readdir('data')).filter(p=>p.endsWith('.json'))){const category=path.slice(0,-5);const rows=JSON.parse(await readFile('data/'+path,'utf8'));catalog.push(...rows.map(row=>({...row,imageAssetId:null,imageUrl:'/api/catalog-images/'+category+'/'+row.id+'.jpg'})))};
const html=await readFile('app/index.html','utf8');const worker=await readFile('server/worker.js','utf8');
await mkdir('dist/server',{recursive:true});await writeFile('dist/server/index.js','const APP_HTML='+JSON.stringify(html)+';\nconst APP_CATALOG='+JSON.stringify(catalog)+';\n'+worker);
await cp('drizzle','dist/server/migrations',{recursive:true});
await writeFile('dist/server/wrangler.json',JSON.stringify({name:'sunny-product-finder',main:'index.js',compatibility_date:'2026-10-06',d1_databases:[{binding:'DB',database_name:'DB',database_id:'DB',migrations_dir:'migrations'}],r2_buckets:[{binding:'BUCKET',bucket_name:'BUCKET'}]},null,2));
console.log('Built standalone Worker and migrations.');
