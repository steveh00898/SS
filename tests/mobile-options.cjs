const assert=require('assert');
module.exports=async function revealOptions(page,selector){
 const target=page.locator(selector);
 // Resizing to desktop closes the popup asynchronously through matchMedia.
 if(await page.evaluate(()=>innerWidth>720)){
   await page.locator('.mobile-popup').waitFor({state:'hidden'});
   return;
 }
 if(await page.locator('.mobile-popup:not([hidden])').count()){
   const inside=await target.first().evaluate(n=>!!n.closest('.mobile-popup')).catch(()=>false);
   if(!inside)await page.getByRole('button',{name:'Close options',exact:true}).click();
 }
 if(await page.evaluate(()=>innerWidth<=720)&&!(await target.first().isVisible())){
   const home=await target.first().evaluate(n=>n.closest('#tabs')?'categoryExpand':n.closest('#specLegend')?'toolsExpand':null).catch(()=>null);
   if(home)await page.locator('#'+home).click();
 }
};
