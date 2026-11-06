"""Read-only import of exact archive-model ISV rows; never modify the workbook.
Usage: python scripts/import-off-sunny-isv.py "C:/Users/sHuynh/Desktop/ISV 4.0.xlsx"
Writes the archive ISV snapshot, matching audit and only the archive embedded app constant.
"""
import datetime, hashlib, json, pathlib, re, sys
import openpyxl
ROOT=pathlib.Path(__file__).resolve().parents[1]
source=pathlib.Path(sys.argv[1]); original_hash=hashlib.sha256(source.read_bytes()).hexdigest()
book=openpyxl.load_workbook(source,data_only=True,read_only=True)
sheet=book['SHF'] if 'SHF' in book.sheetnames else book['ISV 4']
archive=json.loads((ROOT/'data/off-sunny-web/items.json').read_text(encoding='utf-8'))
exact=lambda v: str(v).strip().upper()
def normalize(v):
    value=re.sub(r'\s+','',exact(v)).replace('NO.','NO')
    # Prefix typography is not a model variant. Internal hyphens remain significant.
    value=re.sub(r'^SF-','SF',value)
    # Verified against the V3 source filename NO. 089-COMBO and the same resistance tube set.
    return {'NO089COMBO':'NO089-COMBO'}.get(value,value)
index={}
for row in sheet.iter_rows(min_row=4,max_col=170):
    if row[0].value is not None:index.setdefault(normalize(row[0].value),[]).append(row)
data=json.loads((ROOT/'data/isv/current-products.json').read_text(encoding='utf-8'))
data['source']={'file':source.name,'sheet':sheet.title,'columns':'A:FN','sha256':original_hash}
data['items']=[]; audit=[]
for item in archive:
    candidates=index.get(normalize(item['sku']),[])
    literal=[r for r in candidates if exact(r[0].value)==exact(item['sku'])]
    matches=literal if literal else candidates
    record={'id':item['id'],'sku':item['sku'],'status':'missing','candidates':[{'row':r[0].row,'model':str(r[0].value)}for r in candidates]}
    if len(matches)==1:
        row=matches[0];fields={}
        for cell in row:
            value=cell.value
            if value is None or str(value).strip()=='':continue
            if isinstance(value,(datetime.date,datetime.datetime)):value=value.strftime('%Y-%m-%d')
            if isinstance(value,str):
                value=re.sub(r'SunnyFit(?:[®™\ufffd?]+)(?:\s*App)?','SunnyFit® App',value.strip(),flags=re.I)
            fields[cell.column_letter]=value
        data['items'].append({'id':item['id'],'sku':item['sku'],'row':row[0].row,'fields':fields})
        record.update(status='matched',row=row[0].row,workbookModel=str(row[0].value),matchMethod='exact text' if literal else 'verified NO. 089 COMBO / NO. 089-COMBO source-filename alias' if item['sku']=='NO. 089 COMBO' else 'prefix typography/whitespace only',evidence=f'{sheet.title}!A{row[0].row}')
    elif len(matches)>1:record['status']='ambiguous'
    audit.append(record)
book.close()
assert hashlib.sha256(source.read_bytes()).hexdigest()==original_hash,'Source workbook changed during reading'
app=ROOT/'app/index.html'
embedded,count=re.subn(r'^  const ISV_OFF_SUNNY_DATA=.*;$',lambda m:'  const ISV_OFF_SUNNY_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';',app.read_text(encoding='utf-8'),flags=re.M)
if count!=1:raise ValueError('Expected exactly one archive ISV constant; no output files written')
(ROOT/'data/isv/off-sunny-products.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
report={'source':data['source'],'catalogRecords':len(archive),'matched':len(data['items']),'rules':'Exact text preferred; otherwise whitespace and NO./SF-prefix typography only. Internal hyphens, numeric digits and SMART/color/size suffixes are preserved. Only explicit NO. 089 COMBO / NO. 089-COMBO alias is allowed, verified against the V3 filename and resistance tube set identity. Ambiguous/missing models are not substituted.','items':audit}
(ROOT/'data/isv/off-sunny-match-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
app.write_text(embedded,encoding='utf-8')
print(json.dumps({'matched':report['matched'],'total':len(archive),'unmatched':[r['sku']for r in audit if r['status']!='matched'],'sha256':original_hash}))
