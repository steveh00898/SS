#!/usr/bin/env python3
"""Fetch Sunny's live collection, crop pictures, and stage a seed (no publishing)."""
import concurrent.futures, datetime, io, json, pathlib, urllib.request
from PIL import Image, ImageChops, ImageDraw
ROOT=pathlib.Path(__file__).resolve().parent
OUT=ROOT/'data'; IMAGES=OUT/'images/treadmills'
def fetch(url):
    request=urllib.request.Request(url, headers={'User-Agent':'SunnyProductCatalog/1.0'})
    with urllib.request.urlopen(request,timeout=60) as r: return r.read()
def prepare(p):
    v=p['variants'][0]; sku=v['sku'].strip().upper()
    if not sku: raise ValueError(f"Missing SKU: {p['title']}")
    source=p['images'][0]['src']; url=source+('&' if '?' in source else '?')+'width=1400'
    im=Image.open(io.BytesIO(fetch(url))).convert('RGB')
    diff=ImageChops.difference(im, Image.new('RGB',im.size,'white'))
    r,g,b=diff.split(); mask=ImageChops.lighter(ImageChops.lighter(r,g),b).point(lambda x:255 if x>12 else 0)
    box=mask.getbbox()
    if box: im=im.crop(box)
    w,h=im.size; padding=round(max(w,h)*.04); w+=padding*2; h+=padding*2
    cw=max(w,round(h*4/3)); ch=max(h,round(cw*3/4))
    canvas=Image.new('RGB',(cw,ch),'white'); canvas.paste(im,((cw-im.width)//2,(ch-im.height)//2))
    canvas=canvas.resize((1200,900),Image.Resampling.LANCZOS)
    path=IMAGES/(sku.lower()+'.jpg'); canvas.save(path,quality=88)
    now=datetime.datetime.now(datetime.timezone.utc).isoformat()
    return {'name':p['title'],'sku':sku,'category':'Treadmills','price':float(v['price']) if v.get('price') else None,'priceChecked':True,'url':'https://sunnyhealthfitness.com/collections/treadmills/products/'+p['handle'],'imageUrl':'','imageAssetId':None,'createdAt':now,'updatedAt':now}
def main():
    IMAGES.mkdir(parents=True,exist_ok=True); products=[]; page=1
    while True:
        batch=json.loads(fetch(f'https://sunnyhealthfitness.com/collections/treadmills/products.json?limit=250&page={page}'))['products']
        if not batch:break
        products.extend(batch);page+=1
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: rows=list(pool.map(prepare,products))
    ids=[r['sku'].lower() for r in rows]
    if len(set(ids))!=len(ids):raise ValueError('Duplicate SKUs in source')
    (OUT/'treadmills.json').write_text(json.dumps(rows,indent=2))
    cols=4; cellw,cellh=300,265; sheet=Image.new('RGB',(cols*cellw,((len(rows)+cols-1)//cols)*cellh),'#eeeeee');draw=ImageDraw.Draw(sheet)
    for n,row in enumerate(rows):
        im=Image.open(IMAGES/(row['sku'].lower()+'.jpg'));im.thumbnail((300,225));x=(n%cols)*cellw;y=(n//cols)*cellh;sheet.paste(im,(x,y));draw.text((x+10,y+230),row['sku'],fill='black')
    sheet.save(OUT/'contact-sheet.jpg',quality=90)
    print(f"Fetched {len(rows)} rows. Inspect data/contact-sheet.jpg before asset upload.")
    if len(rows)!=23:print('NOTICE: Live feed count differs from the requested 23; do not fabricate or drop products.')
if __name__=='__main__':main()
