"""Import exact current-catalog SKU rows through FN; preserve original workbook values.
Usage: python scripts/import-current-isv.py <master.xlsx>
Requires openpyxl for read-only extraction. Does not alter the master workbook.
"""
import openpyxl, json, pathlib, re, datetime, hashlib, sys
root=pathlib.Path(__file__).resolve().parents[1]
source=pathlib.Path(sys.argv[1])
w=openpyxl.load_workbook(source,data_only=True)
s=w['ISV 4']
catalog=[]
for p in root.glob('data/*.json'):
 try:
  a=json.loads(p.read_text(encoding='utf-8'))
  if isinstance(a,list): catalog.extend(x for x in a if isinstance(x,dict) and 'sku' in x)
 except Exception: pass
norm=lambda v:re.sub(r'[^A-Z0-9]','',str(v).upper())
rows={}
for row in s.iter_rows(min_row=4,max_col=170):
 if row[0].value is not None: rows.setdefault(norm(row[0].value),[]).append(row)
data=json.loads((root/'data/isv/treadmills.json').read_text())
data['items']=[]
for it in catalog:
 matches=rows.get(norm(it['sku']),[])
 exact=[r for r in matches if str(r[0].value).strip().upper()==it['sku'].strip().upper()]
 if len(exact)==1: matches=exact
 if len(matches)!=1: raise ValueError((it['sku'],len(matches)))
 row=matches[0]
 fields={}
 for cell in row:
  value=cell.value
  if value is None or str(value).strip()=='': continue
  if isinstance(value,(datetime.datetime,datetime.date)): value=value.strftime('%Y-%m-%d')
  fields[cell.column_letter]=value.strip() if isinstance(value,str) else value
 data['items'].append(dict(id=it['id'],sku=it['sku'],row=row[0].row,fields=fields))
data['source']['sha256']=hashlib.sha256(source.read_bytes()).hexdigest()
(root/'data/isv/current-products.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=root/'app/index.html'
html=p.read_text(encoding='utf-8')
html=re.sub(r'  const ISV_TREADMILL_DATA=.*;\n  const resourceFor=',lambda m:'  const ISV_TREADMILL_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n  const resourceFor=',html)
p.write_text(html,encoding='utf-8')
print('Imported',len(data['items']),'catalog records;',len(set(x['sku'] for x in data['items'])),'unique SKUs')
