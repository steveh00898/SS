"""Build the catalog Product Specs from the owner's 11-category workbook and ISV SHF."""
import argparse
from collections import Counter, defaultdict
import json
from pathlib import Path
import re
import unicodedata

from openpyxl import load_workbook
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parents[1]
VERSION = 'master-spec-workbook-v2'
CATEGORIES = ['Treadmills','Ellipticals','Rowers','Indoor Bikes','Steppers','Row-N-Ride','Pilates Reformers',
              'Essentials','Weights','Racks','Weight Benches']

def norm(value):
    return re.sub('[^a-z0-9]', '', unicodedata.normalize('NFKC', str(value or '')).casefold())

def applicable(value):
    return value is not None and str(value).strip().casefold() not in {
        '', 'unavailable', 'not provided', 'unknown', '-', '—', '#n/a', '#value!', '#ref!', '#div/0!', '#num!', '#name?', '#null!'
    }

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def write(path, value, indent=2):
    path.write_bytes((json.dumps(value,ensure_ascii=False,indent=indent)+'\n').encode('utf-8'))

# Keep existing field identifiers for the features that depend on them. Alternate
# titles with no corresponding field receive their own identifier.
ALIASES = {
    'maxUserWeightLb': ['Max User Weight','Max USER Weight Capacity'],
    'frameCapacity': ['Max Weight Capacity'],
    'maxUserHeight': ['Max User Height'],
    'speedResistanceLevels': ['Resistance Level','Resistance Levels','Levels of Resistance','Speed Level'],
    'foldable': ['Foldable or Flip vertially or none'],
    'foldedDimensions': ['Folded or Vertical Dimensions'],
    'shippingWeight': ['Estimated Shipping Weight','Gross Weight (KG/LBS)'],
    'productWeight': ['Net Weight (KG/LBS)'],
    'shippingDimensions': ['Shipping Dimensions (Carton Dimensions)','Shipping Dimensions (Carton Dimensions) (LxWxH)',
                           'Shipping Dimensions LxWxH (CM/INCHES)'],
    'keyDimensions': ['Assembled Dimensions','Assembled Dimensions LxWxH (CM/INCHES)'],
    'seatAdjustment': ['Fully Adjustable Seat (Up, Down, FWD, BWD)'],
    'handlebarAdjustment': ['Fully Adjustable Handlebar (Up, Down, FWD, BWD)'],
    'seatHeight': ['Seat Height (Top of the seat to floor)','Seat Height (Seat to Floor)'],
    'seatToHandlebar': ['Seat To Handlebar Distance'],
    'pedalThread': ['Pedal Thread Size'],
    'pedalBothDirections': ['Can be Pedaled in Both Directions'],
    'speakers': ['Speaker/Audio'],
    'screenSize': ['Meer Screen/Display Size'],
    'magnets': ['Number of Magnets & Pull Force per Magnet'],
    'slideRail': ['Slide Rail Length'],
    'bandPegs': ['Resistance Band Pegs'],
    'benchHeight': ['Height of Bench'],
    'latex': ['Contained Latex','Contain Latex'],
    'footStraps': ['Adjustable Foot Straps'],
    'powerCord': ['Length of power cord (refer to pictures to the right)'],
    'display': ['Meter Display'],
    'battery': ['Battery? If yes, Type'],
    'heartRate': ['Heart Rate Sensors'],
    'bottleHolder': ['Bottle Holder'],
    'bluetooth': ['Bluetooth Compatible: App'],
    'bearingSize': ['Bearing Size (if applicable)'],
    'stepHeight': ['Step Height (Step to Floor)'],
    'certification': ['Tests done for this item'],
    'features': ['Features/Functions/Selling Points of this product'],
}

COMMON_ISV = {
    'brand':'E','upc':'O','color':'BN','materials':'BO','latex':'BP','shippingWeight':'AA',
    'productWeight':'AO','flywheelWeight':'BQ','keyDimensions':'AS','foldedDimensions':'AT',
    'shippingDimensions':'AG','seatDimensions':'BR','footprint':'BS','maxUserWeightLb':'BV',
    'resistanceType':'BW','speedResistanceLevels':'BX','magnets':'BZ','driveResistanceSystem':'CL',
    'beltDimensions':'CT','bearingSize':'CS','selfLevelingPedals':'CA','footStraps':'CF',
    'pedalBothDirections':'DN','stride':'DO','stepHeight':'DP','transportWheels':'CG','meterModel':'CN','battery':'CV',
    'screenType':'BU','screenSize':'BT','display':'CU','programs':'BY','bluetooth':'CI',
    'bluetoothType':'CH','wifi':'CK V','heartRate':'CD','wirelessHeartRate':'CE','deviceHolder':'CB',
    'bottleHolder':'CC','plugType':'CO','powerCord':'CQ','features':'AW','frameCapacity':'BV',
}
SPECIFIC_ISV = {
    'Treadmills': {'wifi':'V CK'},
    'Ellipticals': {'motorized':'DM','remoteControl':'CR'},
    'Rowers': {'slideRail':'EU','railInseam':'EV','seatHeight':'EW','foldable':'EX'},
    'Indoor Bikes': {'motorized':'DC','inseam':'DA','qFactor':'DB','seatAdjustment':'DD',
                     'handlebarAdjustment':'DE','pedalThread':'DH','crankType':'DI','seatHeight':'DJ',
                     'seatToHandlebar':'DK','workbookSpdPedal':'DF'},
    'Steppers': {'motorized':'DM'},
    'Row-N-Ride': {},
    # The ISV weight field does not distinguish Pilates user from frame capacity.
    'Pilates Reformers': {'frameCapacity':'','maxUserWeightLb':''},
    'Essentials': {'frameCapacity':'','maxUserWeightLb':'','workbookColorBoxOrBrownBox':'T'},
    'Weights': {'frameCapacity':'','maxUserWeightLb':'','workbookColorBoxOrBrownBox':'T',
                'workbookPiecesPerCartonIfApplicable':'AF','battery':'CW CV'},
    'Racks': {'frameCapacity':'','maxUserWeightLb':'','workbookColorBoxOrBrownBox':'T',
              'workbookPiecesPerCaseIfApplicable':'AH','inseam':'DA',
              'inseamForRecumbentBike':'DQ','motorized':'DC','motorizedForEllipticalStepperMiniCycle':'DM',
              'motorizedForRecumbentBike':'DR','motorizedForTreadmill':'EL','foldable':'EM',
              'foldableForRower':'EX','seatAdjustment':'DD','handlebarAdjustment':'DE','seatHeight':'DJ',
              'qFactor':'DB','pedalThread':'DH','crankType':'DI','speedRange':'DV','inclineType':'DW',
              'watts':'EC','amps':'ED','softDrop':'EJ','shockAbsorption':'EK','deckType':'ER',
              'slideRail':'EU','railInseam':'EV','workbookHeightOfTheSeat':'EW',
              'workbookSpdPedal':'DF','workbookMeter':'CM','workbookStorage':'EN',
              'workbookUsbCharging':'EP','workbookCompatibleWithSunnyApp':'EQ',
              'workbookDeckToFloorHeight':'ES','workbookInclineLevel':'DX',
              'workbookSetInclineDegreeBeforeIncline':'DY','workbookInclineDegree':'DZ',
              'workbookVoltage':'EB','workbookHorsepower':'EF','workbookRunningBeltMeasurement':'EG'},
    'Weight Benches': {'frameCapacity':'','maxUserWeightLb':''},
}

def template_for(sheet, old):
    names = {}
    for category in [*old, sheet.title]:
        for section in old[category]:
            for key,label in section['fields']:
                names[norm(label)] = key
    names.update({norm(title):key for key,titles in ALIASES.items() for title in titles})
    # Common older/newer names, selected by matching the actual title rather than the field position.
    names.update({norm(x):'driveResistanceSystem' for x in ['Drive Mechanism']})
    names.update({norm(x):'railInseam' for x in ['Slide Rail Inseam']})
    sections = []
    columns = []
    current = 'Product and dimensions'
    seen = set()
    family = ''
    for cell in sheet[2][6:]:
        label = cell.value
        assert isinstance(label,str) and label.strip(), (sheet.title,cell.coordinate)
        label = label.strip()
        slug = norm(label)
        key = names.get(slug)
        if slug.startswith('resistanceforceinlbkgsresistanceforceintabletoright'):
            key = 'resistanceForce'
        if sheet.title=='Racks':
            key = {'motorized':'motorized', 'inseam':'inseam', 'foldable':'foldable',
                   'stepheightsteptofloor':'stepHeight'}.get(slug,key)
        if key is None:
            key = 'workbook' + ''.join(word.title() for word in re.findall('[A-Za-z0-9]+',label))
        if sheet.title=='Racks' and slug in ('bike','ellipticalstepperminicycle','recumbentbike','treadmill','rower','accessories'):
            family=label
        if key in seen:
            key+='For'+''.join(word.title() for word in re.findall('[A-Za-z0-9]+',family))
        assert key not in seen,(sheet.title,label,key)
        seen.add(key)
        group = sheet.cell(1,cell.column).value
        if group in ('Product and dimensions','Performance and adjustments','Console and connectivity','Features'):
            current = group
        elif slug=='individualpack':
            current = 'Individual pack'
        elif slug=='mastercarton':
            current = 'Master carton'
        elif slug in ('resistancetype','barbellcompatibility'):
            current = 'Performance and adjustments'
        elif slug=='metersize':
            current = 'Console and connectivity'
        elif key in ('features','certification'):
            current = 'Features'
        if family:
            current=family
        if not sections or sections[-1]['title']!=current:
            sections.append({'title':current,'fields':[]})
        sections[-1]['fields'].append([key,label])
        columns.append((cell.column,key,label))
    return sections, columns

def isv_data(path):
    wb=load_workbook(path,read_only=True,data_only=True)
    rows=defaultdict(list)
    for i,row in enumerate(wb['SHF'].iter_rows(min_row=4,values_only=True),4):
        if not row[0]:
            continue
        rows[norm(row[0])].append((i,{get_column_letter(j):v for j,v in enumerate(row,1) if v is not None}))
    identities={}
    for filename in ('treadmills.json','current-products.json','off-sunny-products.json'):
        for row in read(ROOT/'data/isv'/filename)['items']:
            identities[row['id']]=row['row']
    return rows,identities

def usable_isv(value, letter):
    if not applicable(value):
        return False
    text=str(value).strip()
    if text.casefold() in {'na','n/a','n.a.','tbd','pending','?'}:
        return False
    if letter in {'AA','AO','BV'} and re.fullmatch(r'0+(?:\.0+)?(?:\s*(?:lbs?\.?|kg))?',text,re.I):
        return False
    if letter in {'AG','AS','AT','BR','BS','CT','EG'} and not re.search(r'\d',text):
        return False
    if letter=='BP' and re.fullmatch(r'[+-]?\d+(?:\.\d+)?',text):
        return False
    return True

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('workbook',type=Path)
    parser.add_argument('isv',type=Path)
    parser.add_argument('live_catalog',type=Path)
    parser.add_argument('--apply',action='store_true')
    args=parser.parse_args()
    book=load_workbook(args.workbook,data_only=True)
    live_isv,isv_ids=isv_data(args.isv)
    templates_path=ROOT/'data/specifications/templates.json'
    old=read(templates_path)
    templates=old.copy()
    paths=sorted((ROOT/'data').glob('*.json'))+[ROOT/'data/off-sunny-web/items.json']
    items={path:read(path) for path in paths}
    live_ids={item['id']:item for item in json.loads(args.live_catalog.read_text(encoding='utf-8-sig'))}
    catalog=defaultdict(list)
    live_matches={}
    for records in items.values():
        for item in records:
            current=live_ids.get(item['id'])
            if item['id']=='off-sunny-sf-db01-55':
                alternate=live_ids.get('off-sunny-sf-db01')
                if current is None and alternate and alternate['sku']=='SF-DB01' and alternate['name']==item['name']:
                    current=alternate
                    catalog[norm(item['sku'])].append(item)
                    live_matches[item['id']]=current
                    continue
            if current and current['sku']==item['sku'] and current['category']==item['category']:
                catalog[norm(item['sku'])].append(item)
                live_matches[item['id']]=current
    audit={'workbook':args.workbook.name,'isv':args.isv.name,'categories':{},'items':[],
           'crossListed':[],'appOnly':[],'aliases':[]}
    seen=set()
    for category in CATEGORIES:
        sheet=book[category]
        templates[category],columns=template_for(sheet,old)
        workbook_isv={**COMMON_ISV,**SPECIFIC_ISV[category]}
        if category=='Treadmills':
            workbook_isv={key:col['column'] for key,col in read(ROOT/'data/isv/treadmills.json')['specMap'].items()}|{'wifi':'V CK'}
        stats=Counter()
        for row in sheet.iter_rows(min_row=3):
            if not isinstance(row[0].value,(int,float)) or not row[1].value:
                continue
            sku=str(row[1].value)
            matches=catalog[norm(sku)]
            same=[item for item in matches if item['category']==category]
            if not same:
                assert matches,(category,sku)
                audit['crossListed'].append({'category':category,'sku':sku,'row':row[1].row,
                                             'appCategories':sorted({item['category'] for item in matches})})
                continue
            if len(same)>1:
                same=[item for item in same if item['sku'].casefold()==sku.casefold()]
            assert len(same)==1 and same[0]['id'] not in seen,(category,sku)
            item=same[0]
            current=live_matches[item['id']]
            if current['id']!=item['id']:
                assert current['name']==row[3].value, (category,sku)
                audit['aliases'].append({'workbookSku':sku,'appSku':current['sku'],
                                         'id':current['id'],'canonicalId':item['id']})
            seen.add(item['id'])
            candidates=live_isv[norm(sku)]
            if len(candidates)>1:
                candidates=[candidate for candidate in candidates if candidate[0]==isv_ids.get(item['id'])]
            shf_row,shf=candidates[0] if len(candidates)==1 else (None,{})
            values,evidence={},{}
            source_counts=Counter()
            for column,key,_ in columns:
                cell=row[column-1]
                value=cell.value
                if applicable(value):
                    values[key]=str(value)
                    evidence[key]=f'{args.workbook.name} / {category} / {cell.coordinate}'
                    source_counts['workbook']+=1
                    continue
                for letter in workbook_isv.get(key,'').split():
                    fallback=shf.get(letter)
                    if usable_isv(fallback,letter):
                        values[key]=str(fallback)
                        evidence[key]=f'ISV 4.0 / SHF / {letter}{shf_row}'
                        source_counts['isv']+=1
                        break
                else:
                    source_counts['unavailable']+=1
            old_notes=(current.get('specDetails') or {}).get('notes',[])
            name_notes=[note for note in old_notes if re.search(r'the name comes from ISV 4\.0 SHF!F\d+\.',note)]
            item['specDetails']={'version':1,'masterTemplate':VERSION,'values':values,'evidence':evidence,
                                 'sources':[args.workbook.name]+(['ISV 4.0'] if source_counts['isv'] else []),
                                 'notes':[*name_notes,'Product Spec follows the category tab in the master workbook.']}
            audit['items'].append({'id':item['id'],'sku':sku,'category':category,'row':row[1].row,
                                   'isvRow':shf_row,**source_counts})
            stats.update(source_counts)
            stats['products']+=1
        audit['categories'][category]={'fields':len(columns),**stats}
    audit['appOnly']=[{'sku':item['sku'],'id':item['id'],'category':item['category']}
                      for group in catalog.values() for item in group
                      if item['category'] in CATEGORIES and item['id'] not in seen]
    print(json.dumps({'matches':len(seen),'crossListed':audit['crossListed'],'appOnly':audit['appOnly']}))
    assert len(seen)==885 and len(audit['crossListed'])==3
    print(json.dumps(audit['categories'],indent=2))
    if args.apply:
        html_path=ROOT/'app/index.html'
        html=html_path.read_bytes().decode('utf-8')
        html,count=re.subn(r'PRODUCT_SPEC_TEMPLATES=\{.*?\};(\r?\n)',lambda match:
            'PRODUCT_SPEC_TEMPLATES='+json.dumps(templates,ensure_ascii=False,separators=(',',':'))+';'+match[1],
            html,count=1)
        assert count==1
        for path,records in items.items():
            if any(item['id'] in seen for item in records):
                first_row=path.read_text(encoding='utf-8').splitlines()[1]
                write(path,records,len(first_row)-len(first_row.lstrip()))
        write(templates_path,templates)
        html_path.write_bytes(html.encode('utf-8'))
        write(ROOT/'data/specifications/master-workbook-v2-audit.json',audit)

if __name__=='__main__':
    main()
