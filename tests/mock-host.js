// Test fixture only. Never included in the delivered HTML or used to seed real data.
window.__rows=[
{id:'sf-t724081',sku:'SF-T724081',name:'Pace Test Treadmill',category:'Treadmills',price:499,priceChecked:true,url:'https://example.com/pace'},
{id:'sf-t100',sku:'SF-T100',name:'Compact Test Treadmill',category:'Treadmills',price:299,priceChecked:true,url:'https://example.com/compact'},
{id:'sf-t200',sku:'SF-T200',name:'Unknown Price Test Treadmill',category:'Treadmills',price:null,priceChecked:false,url:'https://example.com/unknown'}];
window.__writes=[];window.__downloads=[];let listener;
const emit=()=>listener?.(structuredClone(window.__rows));
window.claude={catalogRuntime:{
user:{can:async()=>!window.__viewer},
items:{onSnapshot:(next)=>{listener=next;setTimeout(emit,0);return()=>listener=null},set:async(id,value,opt)=>{if(opt?.createOnly&&window.__rows.some(i=>i.id===id))throw Error('Duplicate SKU');window.__writes.push(['set',id]);window.__rows=window.__rows.filter(i=>i.id!==id);window.__rows.push({...value,id});emit()},delete:async(id)=>{window.__writes.push(['delete',id]);window.__rows=window.__rows.filter(i=>i.id!==id);emit()},move:async(old,id,value)=>{if(window.__rows.some(i=>i.id===id))throw Error('Duplicate SKU');window.__rows=window.__rows.filter(i=>i.id!==old);window.__rows.push({...value,id});window.__writes.push(['move',old,id]);emit()}},
assets:{upload:async f=>({id:'test-picture'}),url:async()=> 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="90"/%3E'},
downloads:{save:async(blob,name)=>window.__downloads.push({name,text:await blob.text()})}}};
