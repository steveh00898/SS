"""Audit elliptical Product Specs from the source inventory, then apply a reviewed rebuild."""
import argparse
import collections
import datetime
import importlib.util
import json
import pathlib
import re
import unicodedata

root = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("inventory", type=pathlib.Path)
parser.add_argument("baseline", type=pathlib.Path)
parser.add_argument("review", type=pathlib.Path)
parser.add_argument("--apply", action="store_true", help="Write the reviewed template, audited data and evidence.")
args = parser.parse_args()
spec = importlib.util.spec_from_file_location('tread', root/'scripts/rebuild-treadmill-specs.py')
t = importlib.util.module_from_spec(spec)
spec.loader.exec_module(t)
d = json.loads(args.inventory.read_text(encoding='utf-8'))
live = {p['id']:p for p in json.loads(args.baseline.read_text(encoding='utf-8-sig'))}
master_file = 'SF-E326015WT final spec sheet 20260817.xlsx'
master = next(row for row in d['files'][t.MODEL('SF-E326015WT')] if row['file'] == master_file)
master_rows = {int(row[0][0][1:]):row[0][1] for row in master['rows'] if re.fullmatch('A[0-9]+',row[0][0])}
sections = [
    ('Product and dimensions', [7, *range(10, 25)], 'brand upc color materials latex pfas shippingWeight productWeight flywheelWeight keyDimensions foldedDimensions shippingDimensions seatDimensions footprint maxUserWeightLb maxUserHeight'),
    ('Performance and adjustments', range(25, 43), 'resistanceType speedResistanceLevels magnets motorized driveResistanceSystem beltDimensions bearingSize crankPullerSize crankLength plateDiameter pedalBothDirections selfLevelingPedals footStraps stride stepHeightMax stepHeightMin transportWheels controlOnHandlebar'),
    ('Console and connectivity', range(44, 76), 'meterSize meterModel battery screenType screenSize display programs bluetooth bluetoothSpec bluetoothType appMetrics appControls ftms wifi fan speakers usb heartRate wirelessHeartRate dumbbellRack deviceHolder bottleHolder bottleHolderSize plugType powerCord electrical watts amps energySaver remoteControl remoteBattery loadingQty'),
    # Keep the app's shared Features row before Certification.
    ('Features', (77,76), 'features certification'),
]
fields = {key:(row, master_rows[row]) for _, rows, keys in sections for row,key in zip(rows,keys.split(),strict=True)}
aliases = {
    'productWeight':['product weight','net weight'],
    'keyDimensions':['assembled dimensions','product dimensions','assembled size'],
    'shippingDimensions':['shipping dimensions','carton dimensions'],
    'footprint':['floor footprint coverage','footprint floor coverage measurement','floor footprint'],
    'flywheelWeight':['flywheel weight','flywheel'],
    'speedResistanceLevels':['speed level','resistance level','levels of resistance'],
    'resistanceType':['resistance type','type of resistance','tension resistance type'],
    'driveResistanceSystem':['drive mechanism','chain belt','drive system'],
    'latex':['contained latex rubber','contain latex','contained latex','latex'],
    'pedalBothDirections':['can be pedaled both directions','dual action can pedal both forward and backward','can pedal both forward and backward'],
    'footStraps':['adjustable foot straps','adjustable pedal straps'],
    'stride':['stride length','stride'],
    'stepHeightMax':['step height step to floor max','max step height','step height max'],
    'stepHeightMin':['step height step to floor min','min step height','step height min'],
    'screenType':['meter screen display type','screen type'],
    'screenSize':['meter screen display size','meer screen display size','screen size'],
    'display':['meter feature','console feature','meter display','meter displays','digital monitor'],
    'battery':['meter battery used','type of battery','battery'],
    'bluetooth':['bluetooth connectivity','bluetooth compatible'],
    'bluetoothType':['bluetooth type','bluetooth compatible app'],
    'heartRate':['heart monitor pulse sensors','heart rate sensors','hand pulse sensors'],
    'wirelessHeartRate':['heart monitor pulse wireless','wireless heart rate function','wireless heart rate','heart rate transmitter belt compatible'],
    'deviceHolder':['device tablet holder','device holder','tablet holder'],
    'bottleHolder':['hydration water bottle holder','water bottle holder','bottle holder'],
    'loadingQty':['loading qty','container loading qty','container loading q ty'],
    'features':['features funtions selling points of this product','features functions selling points of this product','please list all other special features of this product'],
    'certification':['certification','tests done for this item'],
}
aliases['heartRate'].append('hand pulse sensor')
aliases['speedResistanceLevels'].append('levels of speed')
aliases['powerCord']=['length of power cord','cord length']
aliases['battery'].append('have battery')
old_aliases = {key: seq for _, _, keys in sections for key in keys.split() for k, _, seq in t.FIELDS if k == key}
for key,(row,label) in fields.items():
    if key == 'productWeight':
        continue
    aliases[key] = [label,*aliases.get(key,[]),*old_aliases.get(key,[])]
aliases['productWeight'] = ['product weight','net weight']
ISV = dict(zip(
    'brand upc color materials latex shippingWeight productWeight flywheelWeight keyDimensions foldedDimensions shippingDimensions seatDimensions footprint maxUserWeightLb resistanceType speedResistanceLevels magnets motorized driveResistanceSystem beltDimensions bearingSize pedalBothDirections selfLevelingPedals footStraps stride transportWheels meterModel battery screenType screenSize display programs bluetooth bluetoothType wifi heartRate wirelessHeartRate deviceHolder bottleHolder plugType powerCord remoteControl features'.split(),
    'E O BN BO BP AA AO BQ AS AT AG BR BS BV BW BX BZ DM CL CT CS DN CA CF DO CG CN CV BU BT CU BY CI CH V CD CE CB CC CO CQ CR AW'.split(),strict=True))
isv_by_model = collections.defaultdict(list)
for row in d['isv']:
    if not re.fullmatch('A[0-9]+',row[0][0]) or int(row[0][0][1:]) <= 3:
        continue
    isv_by_model[t.MODEL(row[0][1])].append({re.sub(r'\d+$','',addr):(text,addr) for addr,text in row})

ignored = {'item','itemno','itemnumber','model','modelno','modelnumber','sku','itemname','productname','createdby','createddate','dateupdated'}
measured = set('shippingWeight productWeight flywheelWeight keyDimensions foldedDimensions shippingDimensions seatDimensions footprint maxUserWeightLb maxUserHeight stride stepHeightMin stepHeightMax crankLength plateDiameter powerCord'.split())
boolean_fields = set('latex pfas motorized pedalBothDirections selfLevelingPedals footStraps transportWheels controlOnHandlebar bluetooth ftms wifi fan speakers usb heartRate wirelessHeartRate dumbbellRack deviceHolder bottleHolder energySaver remoteControl'.split())

def normalized(text):
    return t.N(re.split(r'[\u3400-\u9fff]',unicodedata.normalize('NFKC',str(text)),maxsplit=1)[0])

def identity(text):
    result = re.match(r'^\s*(yes|no)\b',str(text),re.I)
    return result[1].title() if result else None

def field_for(label):
    k = normalized(label)
    if re.match(r'^(?:steph(?:eight|eights)|heightstep).*',k):
        if 'min' in k: return 'stepHeightMin'
        if 'max' in k: return 'stepHeightMax'
        return 'stepHeightRange'
    # Use the longest match to distinguish e.g. holder size from holder presence.
    matches = [(k==normalized(alias),len(normalized(alias)),key) for key,names in aliases.items()
               for alias in names if normalized(alias) and (k==normalized(alias) or
               len(normalized(alias))>=6 and k.startswith(normalized(alias)))]
    return max(matches)[2] if matches else None

def usable(field,value,label=''):
    value = unicodedata.normalize('NFKC',str(value)).strip().replace('、',', ').replace('。','.')
    if normalized(value) in {'na','notapplicable'}:
        return 'Not applicable'
    if not value or t.CJK.search(value) or value.lower() in t.ISV_EMPTY or normalized(value) in {'unavailable','noneprovided','placeholder','itemname'}:
        return None
    if field=='certification' and re.fullmatch(r'to\s+(?:be|de)\s+test(?:ed)?',value,re.I):
        return None
    value = t.tidy(field,value,label)
    if re.fullmatch(r'\d+\.\d{8,}',value):
        value=f'{float(value):.12g}'
    if '%' in label and re.fullmatch(r'0?\.\d+',value):
        value = f'{float(value)*100:g}%'
    if field in measured and not (re.search(r'\d',value) or identity(value)=='No'):
        return None
    if value.upper() in ('YES','NO'):
        value = value.title()
    if field=='maxUserWeightLb' and re.fullmatch(r'\d+(?:\.\d+)?',value) and re.search(r'lb|pounds?',label,re.I):
        value+=' lb'
    return t.fill.with_units(field,value,label)

def cell_rows(entry, conflicts, unmapped, recumbent=False):
    section = 'general'
    best = {}
    new_layout=any(normalized(r[0][1]) in {'item','itemno'} for r in entry['rows'] if r[0][0].startswith('A'))
    for row in entry['rows']:
        address,label = row[0]
        if not (re.fullmatch(r'A\d+',address) or address.endswith(':1')):
            continue
        lower=normalized(label)
        if lower.startswith(('ellipticalstepperminicycle','ellipticalstepper')) or lower=='elliptical':
            section='elliptical'
        elif lower=='recumbentbike':
            section='recumbent'
        elif lower in ('treadmill','rower','bike','spinbike','strength','weightbench'):
            section='other'
        key=field_for(label)
        boxes=entry['checks'].get(address[1:],[]) if address.startswith('A') else []
        polarity={label.strip().lower() for label,ticked in boxes if ticked and label.strip().lower() in {'yes','no'}}
        if polarity=={'yes','no'}:
            conflicts.append({'row':address,'label':label,'reason':'YES and NO both ticked'})
        if polarity=={'no'}:
            details=[(a,x) for a,x in row[1:] if re.match(r'^[B-E]\d+$',a) and
                     not re.match(r'^\s*(?:detail\s*[:：]?|if\s+(?:yes|no)\b|e\.g\.)',x,re.I) and
                     t.cell_text(x) and normalized(x) not in {'yes','no','n','na','notapplicable','none'}]
            inline=[(a,re.sub(r'^\s*detail\s*[:：]\s*','',x,flags=re.I)) for a,x in row[1:]
                    if re.match(r'^\s*detail\s*[:：]\s*\S',x,re.I) and t.cell_text(x)]
            details += [(a,x) for a,x in inline if normalized(x) not in {'na','notapplicable','none','no'}]
            details=[(a,x) for a,x in details if not re.match(r'^\s*e\.g\.',x,re.I)]
            if details:
                conflicts.append({'row':address,'label':label,'reason':'NO ticked with detail','details':details})
        # Reuse the legacy reader, including typed answers, prompts and combined MIN/MAX values.
        if boxes and (not any(on for _,on in boxes) or len(polarity)==2):
            continue
        marker=[['A0','Item#'],['B0','']] if new_layout and address.startswith('A') else None
        if polarity=={'no'}:
            source_row=[row[0]]
        else:
            # Rejected detail text does not invalidate a legible ticked answer.
            source_row=[row[0],*((a,x) for a,x in row[1:] if not boxes or
                        (not re.match(r'^\s*(?:detail\s*[:：]\s*)?e\.g\.',x,re.I) and
                         not t.CJK.search(unicodedata.normalize('NFKC',x))))]
        parsed=t.rows_of({'rows':([marker] if marker else [])+[source_row],
                          'checks':{int(address[1:]):boxes} if address.startswith('A') else {}})
        if key=='features' and len(source_row)>1 and not boxes:
            # Features are prose. The short-cell instruction filter also matches sentences such as
            # "can be placed under the desk ...", so read the dedicated feature cell as prose.
            cell,text=source_row[1]
            parsed=[(lower,label,text,cell)]
        if key=='stepHeightRange' and section in ('general','elliptical'):
            pending=None
            for cell,text in row[1:]:
                axis=re.match(r'^\s*(min|max)\s*[:：]\s*(.*)$',text,re.I)
                if axis:
                    pending='stepHeight'+axis[1].title()
                    text=axis[2]
                if pending and text and (candidate:=usable(pending,text,label)):
                    best.setdefault(pending,(1,candidate,cell))
                    pending=None
            if not any(re.match(r'^\s*(min|max)\s*[:：]',text,re.I) for _,text in row[1:]) and parsed:
                unmapped.append({'field':label,'cells':row[1:],'section':section,
                                 'reason':'Height axis not identified as min or max'})
            continue
        for _, actual_label,value,cell in parsed:
            actual_key=field_for(actual_label) or key
            recumbent_motor=recumbent and section=='recumbent' and actual_key=='motorized'
            if not actual_key or (section in ('recumbent','other') and
                                  not recumbent_motor and actual_key not in {'features','certification','loadingQty'}):
                if normalized(actual_label) not in ignored:
                    unmapped.append({'field':actual_label,'cell':cell,'value':value,'section':section})
                continue
            v=usable(actual_key,value,actual_label)
            if actual_key=='bluetoothType' and v and lower.startswith('bluetoothcompatibleapp'):
                best.setdefault('bluetooth',(2,v,cell))
            if actual_key=='bluetoothType' and cell.endswith('(checkbox)'):
                match=re.fullmatch(r'Yes \((.+)\)',v or '')
                v=match[1] if match else v if identity(v)=='No' else None
            if not v:
                continue
            score=(1 if recumbent_motor else
                   5 if actual_key=='productWeight' and lower.startswith('productweight') else
                   4 if actual_key=='motorized' and section=='elliptical' else
                   3 if lower==normalized(fields[actual_key][1]) else 2)
            if actual_key not in best or score>best[actual_key][0]:
                best[actual_key]=(score,v,cell)
    return best

def data_values(item):
    return (item.get('specDetails') or {}).get('values',{})

products=[]
for item in d['catalog']:
    model=t.MODEL(item['sku'])
    entries=[s for s in d['files'].get(model,[]) if not s['file'].lower().startswith('ecn')]
    latest=entries[0] if entries else None
    sheets=[s for s in entries if latest and s['file']==latest['file']]
    audit={'id':item['id'],'sku':item['sku'],'sheet':latest['file'] if latest else None,
           'sheetModified':datetime.datetime.fromtimestamp(latest['mtime']).astimezone().isoformat(timespec='seconds') if latest else None,
           'fromSheet':[],'fromISV':[],'unavailable':[],'replaced':[],'flips':[],
           'contradictions':[],'unmapped':[],'excludedChangeNotices':[x['file'] for x in d['files'].get(model,[]) if x['file'].lower().startswith('ecn')]}
    values,evidence,selected={},{},{}
    for s in sheets:
        for field,(_,value,cell) in cell_rows(s,audit['contradictions'],audit['unmapped'],
                                            bool(re.search(r'\brecumbent\b',item['name'],re.I))).items():
            selected.setdefault(field,(value,s['file']+' / '+s['name']+' / '+cell))
    shf=isv_by_model.get(model,[])
    if len(shf)>1:
        audit['duplicateISVRows']=[x['A'][1] for x in shf]
    for field in fields:
        found=selected.get(field)
        origin='fromSheet'
        if not found and shf and field in ISV:
            column=ISV[field]
            source_candidates=[(value,cell) for r in shf if column in r
                               for raw,cell in [r[column]] if raw.strip().lower() not in t.ISV_EMPTY
                               for value in [usable(field,raw, 'lb' if column=='AA' else 'in' if column=='CQ' else '')] if value]
            if len({t.N(v) for v,_ in source_candidates})==1:
                value,cell=source_candidates[0]
                found=(value,'ISV 4.0 / SHF / '+cell)
                origin='fromISV'
            elif source_candidates:
                audit.setdefault('conflictingISV',[]).append({'field':field,'values':source_candidates})
        if found:
            values[field],evidence[field]=found
            audit[origin].append(field)
        else:
            audit['unavailable'].append(field)
    old=data_values(live.get(item['id'],item))
    for field, value in old.items():
        if not value or field not in fields or value==values.get(field):
            continue
        updated=values.get(field)
        change={'field':field,'old':value,'new':updated,'evidence':evidence.get(field)}
        audit['replaced'].append(change)
        def answer(v):
            explicit=identity(v)
            if field=='bluetooth' and v and not explicit and re.search(r'bluetooth|\bsunny\s*fit\b|\bsunny\s*app\b|\bapp\b',v,re.I):
                return 'Yes'
            return explicit
        if answer(value) and answer(updated) and answer(value)!=answer(updated):
            audit['flips'].append(change)
    audit['retiredOldFields']={k:v for k,v in old.items() if k not in fields and v}
    audit['liveDiffersFromRepo']=data_values(item)!=old
    audit['values']=values
    audit['evidence']=evidence
    products.append(audit)
review={'template':master_file,'templateSheet':master['name'],'fields':fields,
        'sections':[{ 'title':title,'fields':keys.split()} for title,_,keys in sections],
        'products':products,'readErrors':d['errors']}
out=args.review
out.write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('products',len(products),'fields',len(fields),'withSheet',sum(bool(p['sheet']) for p in products))
print({k:sum(len(x[k]) for x in products) for k in ('fromSheet','fromISV','unavailable','flips','contradictions','unmapped','retiredOldFields')})
print('replaced',sum(c['new'] is not None for p in products for c in p['replaced']),
      'cleared',sum(c['new'] is None for p in products for c in p['replaced']),
      'live values differ from repo',sum(p['liveDiffersFromRepo'] for p in products))
for p in products:
    for k in ('flips','contradictions','duplicateISVRows','excludedChangeNotices'):
        if p.get(k): print(p['sku'],k,json.dumps(p[k],ensure_ascii=False)[:1600])

if args.apply:
    paths=[root/'data/ellipticals.json',root/'data/off-sunny-web/items.json']
    reviewed={p['id']:p for p in products}
    assert not review['readErrors'], 'Resolve missing source files before applying.'
    assert {r['id'] for path in paths for r in json.loads(path.read_text(encoding='utf-8'))
            if r['category']=='Ellipticals'}==set(reviewed), 'Catalog changed since extraction.'
    template_path=root/'data/specifications/templates.json'
    templates=json.loads(template_path.read_text(encoding='utf-8'))
    templates['Ellipticals']=[{'title':title,'fields':[[key,fields[key][1]] for key in keys.split()]}
                             for title,_,keys in sections]
    html_path=root/'app/index.html'
    html=html_path.read_bytes().decode('utf-8')
    html,count=re.subn(r'PRODUCT_SPEC_TEMPLATES=\{.*?\};(\r?\n)',
        lambda m:'PRODUCT_SPEC_TEMPLATES='+json.dumps(templates,ensure_ascii=False,separators=(',',':'))+';'+m[1],
        html,count=1)
    assert count==1
    note='Elliptical Product Spec rebuilt on 2026-11-17 on the SF-E326015WT template: newest spec sheet first, then ISV 4.0, otherwise Unavailable.'
    for path in paths:
        raw=path.read_text(encoding='utf-8')
        rows=json.loads(raw)
        for item in rows:
            if item['category']!='Ellipticals':
                continue
            audit=reviewed[item['id']]
            assert audit['sku']==item['sku']
            old_notes=(live.get(item['id'],item).get('specDetails') or {}).get('notes',[])
            name_notes=[text for text in old_notes if re.search(r'the name comes from ISV 4\.0 SHF!F\d+\.',text)]
            item['specDetails']={'version':1,'masterTemplate':'SF-E326015WT','values':audit['values'],
                                 'evidence':audit['evidence'],
                                 'sources':([audit['sheet']] if audit['fromSheet'] else [])+
                                           (['ISV 4.0'] if audit['fromISV'] else []),'notes':[*name_notes,note]}
        first_row=raw.splitlines()[1]
        indent=len(first_row)-len(first_row.lstrip())
        path.write_text(json.dumps(rows,ensure_ascii=False,indent=indent)+'\n',encoding='utf-8')
    template_path.write_text(json.dumps(templates,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    html_path.write_bytes(html.encode('utf-8'))
    audit_path=root/'data/specifications/elliptical-master-audit.json'
    audit_path.write_text(json.dumps(review,ensure_ascii=False,indent=1)+'\n',encoding='utf-8')
