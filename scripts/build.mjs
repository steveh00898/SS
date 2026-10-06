import {readFile,mkdir,writeFile,cp} from 'node:fs/promises';
const html=await readFile('app/index.html','utf8');const worker=await readFile('server/worker.js','utf8');
await mkdir('dist/server',{recursive:true});await writeFile('dist/server/index.js','const APP_HTML='+JSON.stringify(html)+';\n'+worker);
await cp('drizzle','dist/server/migrations',{recursive:true});
await writeFile('dist/server/wrangler.json',JSON.stringify({name:'sunny-product-finder',main:'index.js',compatibility_date:'2026-10-06',d1_databases:[{binding:'DB',database_name:'DB',database_id:'DB',migrations_dir:'migrations'}],r2_buckets:[{binding:'BUCKET',bucket_name:'BUCKET'}]},null,2));
console.log('Built standalone Worker and migrations.');
