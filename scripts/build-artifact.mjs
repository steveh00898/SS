// Builds the smaller Claude Artifact page from app/index.html without changing that file or the Site.
// Output: dist/artifact/index.html, plus dist/artifact/reference/*.json for the Artifact's `reference` collection.
// Embedded fonts become a Google Fonts link. ISV rows and manuals load from the database at start-up.
import {transform} from 'esbuild';
import {createHash} from 'node:crypto';
import {mkdir,readFile,rm,writeFile} from 'node:fs/promises';

const CHUNK=200000; // Each database document must stay under the 256 KiB limit once serialized.
let html=await readFile('app/index.html','utf8');
const take=name=>{
  const re=new RegExp('^  const '+name+'=(.*);(\\r?)$','m');
  const found=html.match(re);
  if(!found)throw Error('Embedded constant not found: '+name);
  return {value:JSON.parse(found[1]),replace:text=>{html=html.replace(re,()=>'  const '+name+'='+text+';'+found[2])}};
};
const once=(from,to)=>{
  if(html.split(from).length!==2)throw Error('Expected exactly one match: '+from);
  html=html.replace(from,()=>to);
};

const manuals=take('PRODUCT_MANUALS'),current=take('ISV_TREADMILL_DATA'),off=take('ISV_OFF_SUNNY_DATA');
manuals.replace('{}');
for(const data of [current,off]){const {items,...meta}=data.value;data.replace(JSON.stringify({...meta,items:[]}));}

const fonts=html.match(/^<style>(?:@font-face\{[^}]*\})+\r?$/m);
if(!fonts)throw Error('Embedded font line not found');
html=html.replace(fonts[0],()=>'<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Roboto+Condensed:wght@400;500;600;700&display=swap" rel="stylesheet">\n<style>');

const docs=[];
const add=(kind,rows)=>{
  let part=[],size=0,index=0;
  const flush=()=>{if(part.length){docs.push({id:kind+'-'+index++,kind,json:JSON.stringify(part)});part=[];size=0;}};
  for(const row of rows){const length=JSON.stringify(row).length;if(size+length>CHUNK)flush();part.push(row);size+=length;}
  flush();
};
add('isv-current',current.value.items);
add('isv-off',off.value.items);
add('manuals',Object.entries(manuals.value));
const counts={'isv-current':current.value.items.length,'isv-off':off.value.items.length,manuals:Object.keys(manuals.value).length};
const version=createHash('sha256').update(JSON.stringify(docs)).digest('hex').slice(0,16);

once('  async function boot() {',`  // Artifact build only: reference rows too large for the page live in the database's reference collection.
  async function loadReference(db) {
    const expected=${JSON.stringify(counts)},seen={"isv-current":0,"isv-off":0,manuals:0};
    try {
      const snap=await db.collection("reference").get();
      for(const doc of snap.docs){
        const x=doc.exists?doc.data()||{}:{};
        if(x.version!=="${version}"||!Object.hasOwn(seen,x.kind))continue;
        const rows=JSON.parse(x.json);seen[x.kind]+=rows.length;
        if(x.kind==="isv-current")for(const item of rows){ISV_TREADMILL_DATA.items.push(item);ISV_BY_SKU.set(item.sku,item);}
        else if(x.kind==="isv-off")for(const item of rows){ISV_OFF_SUNNY_DATA.items.push(item);ISV_OFF_BY_ID.set(item.id,item);}
        else for(const [sku,guide] of rows)PRODUCT_MANUALS[sku]=guide;
      }
    } catch (e) {}
    if(Object.keys(expected).some(key=>expected[key]!==seen[key])){$("#banner").hidden=false;$("#banner").textContent="Some ISV and manual references couldn't load. Reload the page to try again.";}
  }
  async function boot() {`);
once('    initPractice(artifactRuntime, db, user);','    await loadReference(db);\n    initPractice(artifactRuntime, db, user);');

const script=html.match(/<script>\r?\n([\s\S]*?)<\/script>/);
if(!script)throw Error('Artifact script not found');
const compiled=await transform(script[1],{loader:'js',minifyWhitespace:true,lineLimit:120,legalComments:'inline'});
html=html.replace(script[0],()=>'<script>\n'+compiled.code.replace(/<\/script/gi,'<\\/script')+'</script>');

await rm('dist/artifact',{recursive:true,force:true});
await mkdir('dist/artifact/reference',{recursive:true});
await writeFile('dist/artifact/index.html',html);
for(const {id,kind,json} of docs)await writeFile('dist/artifact/reference/'+id+'.json',JSON.stringify({kind,version,json}));
const longest=Math.max(...html.split('\n').map(line=>line.length));
console.log(JSON.stringify({pageChars:html.length,longestLine:longest,version,counts,documents:docs.map(d=>d.id)}));
