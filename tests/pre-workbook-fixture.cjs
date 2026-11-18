const {execFileSync}=require('node:child_process');
const {resolve}=require('node:path');

// The last checked-in catalog and page before the owner replaced their spec templates.
const revision='c230fd388140828290c3e10d726df662376e6022';
const root=resolve(__dirname,'..');
const cache=new Map();

module.exports=function readPreWorkbook(path){
 if(!cache.has(path))cache.set(path,execFileSync('git',['show',revision+':'+path],{
  cwd:root,encoding:'utf8',maxBuffer:20*1024*1024
 }));
 return cache.get(path);
};
