"""Rebuild every treadmill's Product Spec on the SF-T725095 master template (owner decision 2026-11-16).

Usage: python scripts/rebuild-treadmill-specs.py <Master SPEC SHEET folder> [--cache <json>]
Template: the public rows of "SF-T725095 Treadmill draft Spec dated 9.28.2026.xlsx", in sheet order.
Each treadmill takes each field from its most recently modified spec sheet (exact model cell); when that
sheet has no value for the field, from ISV 4.0; otherwise the field is left empty and shows Unavailable.
Writes data/specifications/templates.json (Treadmills), the template constant in app/index.html, the
treadmill records and data/specifications/treadmill-master-audit.json. Rerunning gives the same result.
"""
import argparse, datetime, importlib.util, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('fill', ROOT / 'scripts/fill-master-specs.py')
fill = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fill)
b3, MODEL, N = fill.b3, fill.MODEL, fill.N
import sys; sys.path.insert(0, str(ROOT / 'scripts'))
from sheet_checkboxes import checkboxes
MASTER = 'SF-T725095 Treadmill draft Spec dated 9.28.2026.xlsx'
NOTE = 'Treadmill Product Spec rebuilt on 2026-11-16 on the SF-T725095 template: newest spec sheet first, then ISV 4.0, otherwise Unavailable.'

# (key, label shown in the app, sheet labels that mean the same field), in the master sheet's order.
SECTIONS = [
 ('Product and dimensions', [
  ('brand', 'Brand', ['brand']), ('upc', 'UPC', ['upc#', 'upc']), ('color', 'Color', ['color']),
  ('materials', 'Material', ['material', 'materials']),
  ('latex', 'Contains latex / rubber', ['container latex/rubber', 'contain latex', 'contained latex', 'container latex', 'latex']),
  ('pfas', 'Contains PFAS chemicals', ['contained chemical pfas', 'pfas']),
  ('shippingWeight', 'Gross weight (shipping)', ['gross weight (ship weight)', 'gross weight', 'shipping weight']),
  ('productWeight', 'Net weight (product)', ['net weight', 'product weight']),
  ('keyDimensions', 'Assembled dimensions (L × W × H)', ['assembled dimensions', 'product dimensions', 'assembled size']),
  ('foldedDimensions', 'Folded dimensions (L × W × H)', ['folded dimensions', 'fold dimensions']),
  ('shippingDimensions', 'Carton dimensions (L × W × H)', ['shipping dimensions', 'carton dimensions']),
  ('footprint', 'Floor footprint (L × W)', ['floor footprint coverage', 'floor footprint']),
  ('treadmillType', 'Treadmill type', ['treadmill type', 'walking/running treadmill', 'walking / running treadmill']),
  ('frontSupportFrame', 'Front support frame', ['front support frame']),
  ('baseFrame', 'Base frame', ['base frame']),
  ('handlebarHeight', 'Height from ground to top of handlebar', ['height from ground to top of handlebar']),
  ('foldable', 'Folding', ['folding', 'foldable']),
  ('storage', 'Storage type', ['storage type', 'storage']),
  ('controlOnHandlebar', 'Control on handlebar', ['control on handlebar']),
  ('consoleWidth', 'Console width', ['console width']),
  ('transportWheels', 'Transportation wheels', ['transportation wheel', 'transportation wheels', 'transport wheels'])]),
 ('Performance and adjustments', [
  ('beltThickness', 'Belt thickness', ['belt thickness']), ('deckRail', 'Deck rail', ['deck rail']),
  ('deckThickness', 'Deck thickness', ['deck thickness']), ('deckType', 'Deck type', ['deck type']),
  ('stepOnHeight', 'Step-on height', ['step on height', 'step-on height', 'deck to floor height']),
  ('softDrop', 'Soft drop', ['soft drop']), ('cushionType', 'Cushion type', ['cushion type']),
  ('shockAbsorption', 'Shock absorption', ['shock absorption']),
  ('runningSurface', 'Running space size (W × L)', ['running space size', 'running surface measurement', 'running surface']),
  ('beltDimensions', 'Running belt size (W × L)', ['running belt size', 'running belt measurement']),
  ('rollerSize', 'Roller size', ['roller size']), ('motorized', 'Motorized', ['motorized']),
  ('continuousHp', 'Horsepower – continuous', ['motor (horsepower) continuous', 'motor horsepower continuous', 'horsepower continuous']),
  ('peakHp', 'Horsepower – peak', ['motor (horsepower) peak', 'motor horsepower peak', 'horsepower peak']),
  ('motorType', 'Motor type', ['motor type', 'type of motor']),
  ('maxUserWeightLb', 'Weight capacity', ['weight capacity', 'max user weight', 'maximum user weight']),
  ('inclineType', 'Incline type', ['incline type']),
  ('inclineRange', 'Incline %', ['incline % range', 'incline percent', 'incline %']),
  ('inclineDegrees', 'Incline degrees', ['incline ° (degree) range', 'incline angle degrees', 'incline degree range', 'incline degree']),
  ('inclineLevels', 'Incline levels', ['incline level', 'incline levels']),
  ('quickInclineButtons', 'Instant incline buttons', ['instant incline button', 'quick incline button', 'quick speed/incline button']),
  ('speedRange', 'Speed range', ['speed range']),
  ('quickSpeedButtons', 'Instant speed buttons', ['instant speed button', 'quick speed button', 'quick speed/incline button'])]),
 ('Console and connectivity', [
  ('screenType', 'Screen / display', ['screen/display', 'screen type', 'meter screen/display type']),
  ('screenSize', 'Screen / display size', ['screen/display size', 'screen size']),
  ('meterModel', 'Meter model (manual treadmills)', ['meter model']),
  ('battery', 'Meter battery (manual treadmills)', ['meter battery used', 'type of battery', 'battery type']),
  ('display', 'Console features', ['console feature', 'meter displays', 'meter display', 'specific meter display']),
  ('bluetooth', 'Bluetooth', ['bluetooth connectivity', 'bluetooth compatible']), ('bluetoothSpec', 'Bluetooth spec', ['bluetooth spec']),
  ('bluetoothType', 'Bluetooth type', ['bluetooth type', 'bluetooth compatible: app']), ('ftms', 'FTMS', ['ftms']), ('wifi', 'Wi-Fi', ['wifi', 'wi-fi']),
  ('programs', 'Programs', ['program', 'programs', 'number of pre-programs']),
  ('fan', 'Fan / cooling', ['fan/cooling', 'fan']), ('speakers', 'Speakers / audio', ['speakers/audio', 'speaker']),
  ('usb', 'Mobile charging', ['mobile charging', 'usb charging']),
  ('heartRate', 'Heart rate / pulse sensors', ['heart monitor/ pulse sensors', 'heart monitor/pulse sensors', 'hand pulse sensors', 'heart rate sensors']),
  ('wirelessHeartRate', 'Wireless heart rate', ['heart monitor/ pulse wireless', 'heart monitor/pulse wireless', 'wireless heart rate function']),
  ('bottleHolder', 'Water bottle holder', ['hydration', 'water bottle holder', 'bottle holder']),
  ('bottleHolderSize', 'Water bottle holder size', ['water/bottle holder size']),
  ('plugType', 'Plug or adapter', ['plug or adapter', 'plug type']),
  ('powerCord', 'Power cord length', ['plug or adapter cord length', 'length of power cord', 'power cord']),
  ('electrical', 'Electrical requirement', ['electrical requirement', 'voltage']),
  ('watts', 'Watts', ['watt', 'watts']), ('amps', 'Ampere (A)', ['ampere (a)', 'ampere']),
  ('energySaver', 'Energy saver mode', ['energy saver mode']),
  ('deviceHolder', 'Tablet holder / rack', ['tablet holder/rack', 'device holder', 'device/tablet holder']),
  ('remoteControl', 'Remote control', ['remote control']),
  ('remoteBattery', 'Remote control battery', ['battery used for remote control'])]),
 ('Features', [
  ('features', 'Features / functions / selling points', ['features/funtions/selling points of this product', 'features/functions/selling points of this product', 'features']),
  ('certification', 'Certification', ['certification', 'tests done for this item', 'tests certification'])]),
]
FIELDS = [f for _, fs in SECTIONS for f in fs]
MEASURED = {'shippingWeight', 'productWeight', 'keyDimensions', 'foldedDimensions', 'shippingDimensions', 'footprint', 'frontSupportFrame',
            'baseFrame', 'handlebarHeight', 'consoleWidth', 'beltThickness', 'deckThickness', 'stepOnHeight', 'runningSurface', 'beltDimensions',
            'rollerSize', 'continuousHp', 'peakHp', 'maxUserWeightLb', 'speedRange', 'powerCord', 'watts', 'amps', 'screenSize'}
# ISV 4.0 (sheet SHF) columns for the same fields.
ISV = {'brand': 'E', 'upc': 'O', 'color': 'BN', 'materials': 'BO', 'latex': 'BP', 'shippingWeight': 'AA', 'productWeight': 'AO', 'keyDimensions': 'AS',
       'foldedDimensions': 'AT', 'shippingDimensions': 'AG', 'footprint': 'BS', 'treadmillType': 'DT', 'handlebarHeight': 'ET', 'foldable': 'EM',
       'storage': 'EN', 'transportWheels': 'CG', 'deckType': 'ER', 'stepOnHeight': 'ES', 'softDrop': 'EJ', 'cushionType': 'DU', 'shockAbsorption': 'EK',
       'beltDimensions': 'EG', 'motorized': 'EL', 'peakHp': 'EF', 'motorType': 'EE', 'maxUserWeightLb': 'BV', 'inclineType': 'DW', 'inclineRange': 'EA',
       'inclineDegrees': 'DZ', 'inclineLevels': 'DX', 'quickInclineButtons': 'EI', 'speedRange': 'DV', 'quickSpeedButtons': 'EH', 'screenType': 'BU',
       'screenSize': 'BT', 'meterModel': 'CN', 'battery': 'CV', 'display': 'CU', 'bluetooth': 'CI', 'bluetoothType': 'CH', 'wifi': 'V', 'programs': 'BY',
       'speakers': 'EO', 'usb': 'EP', 'heartRate': 'CD', 'wirelessHeartRate': 'CE', 'bottleHolder': 'CC', 'plugType': 'CO', 'powerCord': 'CQ',
       'electrical': 'EB', 'watts': 'EC', 'amps': 'ED', 'deviceHolder': 'CB', 'remoteControl': 'CR', 'features': 'AW'}
ISV_EMPTY = {'', 'na', 'n/a', '-', '--', 'none provided', 'tbd', 'pending'}


SUBLABEL = re.compile(r'^(?:detail|batt(?:ery)?|peak|continuous|min|max)\s*[:：]?\s*$', re.I)


def cell_text(text):
    """A value cell: the answer after a question prompt, without form labels and instructions."""
    text = str(text).strip()
    if '?' in text or '？' in text:
        text = re.split(r'[?？]', text)[-1].strip()
    if not text or SUBLABEL.match(text):
        return None
    return b3.clean(text)


def checked_answer(boxes, cells):
    """'No', 'Yes, Front', 'Yes (1 pcs 2032 lithium battery)': the ticked checkbox labels plus any detail text."""
    ticked = list(dict.fromkeys(label.strip().capitalize() for label, on in boxes if on and label.strip()))  # stacked duplicate boxes
    if not ticked or {'Yes', 'No'} <= set(ticked):  # nothing ticked, or both: no answer
        return None
    labels = {N(label) for label, _ in boxes}
    detail = []
    for _, text in cells:
        if ticked == ['No'] and re.match(r'^\s*if\s+yes\b', str(text), re.I):
            continue  # an "If YES, ..." answer does not apply to a No
        t = re.sub(r'^\s*(?:detail\s*[:：]|if\s+yes\s*[,，:：]?)\s*', '', str(text).strip(), flags=re.I).strip()
        if t and N(t) not in labels and N(t) not in ('na', 'n/a', 'none', 'detail') and cell_text(t):
            detail.append(cell_text(t))
    return ', '.join(ticked) + (' (' + '; '.join(detail) + ')' if detail else '')


def rows_of(sheet):
    """(normalized label, label, value, cell) per row. New-layout sheets (an 'Item#' row) read column B only;
    older forms read columns B-E, join MIN/MAX cells, and split HORSEPOWER (Peak/Continuous) and
    Remote Control (Battery) rows into their own fields."""
    rows = sheet['rows']
    table = any(':' in c[0] for r in rows for c in r)  # Word tables address cells as 'row:column'.
    first = (lambda c: c[0].endswith(':1')) if table else (lambda c: c[0].startswith('A'))
    new_layout = any(first(r[0]) and N(r[0][1]) in ('item', 'itemno') for r in rows)
    out = []
    for r in rows:
        if not first(r[0]):
            continue
        label = r[0][1]; key = N(label)
        rownum = re.search(r'\d+$', r[0][0]); boxes = (sheet.get('checks') or {}).get(int(rownum.group(0))) if rownum and not table else None
        if len(r) < 2 and not boxes:  # a checkbox-only answer has no value cell
            continue
        if table:
            cells = r[1:]
        elif new_layout:
            cells = [c for c in r[1:] if c[0].startswith('B')]
        else:
            cells = [c for c in r[1:] if re.match(r'[B-E]\d+$', c[0])]
        if key.startswith('horsepower') or key.startswith('motorhorsepower') and not new_layout:
            for i, (addr, text) in enumerate(cells):
                for part, name in (('peak', 'motorhorsepowerpeak'), ('continuous', 'motorhorsepowercontinuous')):
                    if N(text).startswith(part) and i + 1 < len(cells) and cell_text(cells[i + 1][1]):
                        out.append((name, label + ' ' + part, cell_text(cells[i + 1][1]), cells[i + 1][0]))
            continue
        if key.startswith('remotecontrol') and not new_layout:
            lead = None
            for i, (addr, text) in enumerate(cells):
                inline = re.match(r'^\s*batt(?:ery)?\s*[:：]\s*(\S.*)$', text, re.I)
                if inline and cell_text(inline.group(1)):
                    out.append(('batteryusedforremotecontrol', 'Battery used for remote control', cell_text(inline.group(1)), addr))
                elif N(text).startswith('batt') and i + 1 < len(cells) and cell_text(cells[i + 1][1]):
                    out.append(('batteryusedforremotecontrol', 'Battery used for remote control', cell_text(cells[i + 1][1]), cells[i + 1][0]))
                elif i == 0 and cell_text(text):
                    lead = (addr, cell_text(text))
            answer = boxes and checked_answer(boxes, [c for c in cells if not N(c[1]).startswith('batt')])
            if answer: lead = (cells[0][0] + ' (checkbox)' if cells else r[0][0].replace('A', 'B', 1) + ' (checkbox)', answer)
            if lead: out.append((key, label, lead[1], lead[0]))
            continue
        answer = boxes and checked_answer(boxes, cells)
        if answer:  # A ticked checkbox is the sheet's answer for the row.
            out.append((key, label, answer, re.sub(r'^A', 'B', r[0][0]) + ' (checkbox)'))
            continue
        values = [(addr, cell_text(text)) for addr, text in cells]
        values = [(a, v) for a, v in values if v]
        if not values:
            continue
        addr, value = values[0]
        if re.match(r'^MIN\s*[:：]', value, re.I):
            upper = next((v for a, v in values[1:] if re.match(r'^MAX\s*[:：]', v, re.I)), None)
            if upper: value += '; ' + upper
        out.append((key, label, value, addr))
    return out


def find(rows, aliases):
    """Exact label first, then a label that starts with the alias (short remainder only)."""
    for exact in (True, False):
        for alias in aliases:
            k = N(alias)
            for row in rows:
                if row[0] == k or (not exact and len(k) >= 8 and row[0].startswith(k) and len(row[0]) - len(k) < 60):
                    return row
    return None


CJK = re.compile(r'[　-〿㐀-鿿＀-￯]')


def tidy(key, value, label):
    """Full-width punctuation to ASCII, '档' to 'levels', Excel percentages (0.15) to '15%'."""
    v = str(value).strip()
    for a, b in (('（', '('), ('）', ')'), ('：', ': '), ('；', '; '), ('，', ', '), ('、', ', '), ('～', '~'), ('档', ' levels')):
        v = v.replace(a, b)
    v = re.sub(r'\s+', ' ', v).strip()
    if key == 'inclineRange' and re.fullmatch(r'0?\.\d+', v) and '%' in label:
        v = ('%g' % (float(v) * 100)) + '%'
    return v


def usable(key, value):
    if CJK.search(str(value)):
        return False
    value = str(value).strip()
    if not value:
        return False
    if N(value) == 'notapplicable':
        return True  # The sheet states the field does not apply; keep that answer.
    if key in MEASURED:
        return bool(re.search(r'\d', value))
    return True


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('folder', type=pathlib.Path); ap.add_argument('--cache', type=pathlib.Path); a = ap.parse_args()
    cache = json.loads(a.cache.read_text(encoding='utf-8')) if a.cache and a.cache.exists() else {}
    files = sorted(p for p in a.folder.rglob('*') if p.is_file() and not p.name.startswith('~$') and p.suffix.lower() in ('.xlsx', '.xls', '.docx'))
    for p in files:
        rel = p.relative_to(a.folder).as_posix()
        if rel not in cache:
            try:
                cache[rel] = b3.read_sources(a.folder, [{'sourceFile': rel}])[rel]
            except Exception:
                cache[rel] = None
    if a.cache: a.cache.write_text(json.dumps(cache, ensure_ascii=False), encoding='utf-8')
    assert MASTER in cache and cache[MASTER], 'master template sheet not found'
    mtime = {p.relative_to(a.folder).as_posix(): p.stat().st_mtime for p in files}
    # Model of each sheet: its Item#/Model cell without a bracketed factory code. When the cell is blank or
    # names no catalog model (e.g. 'SF-726025'), the model at the start of the file name is used instead.
    treadmills = {MODEL(r['sku']) for p in sorted((ROOT / 'data').glob('*.json')) + [ROOT / 'data/off-sunny-web/items.json']
                  for r in json.loads(p.read_text(encoding='utf-8')) if r['category'] == 'Treadmills'}
    index = {}
    for rel, sheets in cache.items():
        for sheet in sheets or []:
            found = set()
            for row in sheet['rows']:
                for i, (_, text) in enumerate(row):
                    if N(text) in fill.MODEL_LABELS and i + 1 < len(row) and len(row[i + 1][1]) < 80:
                        found |= {MODEL(re.sub(r'[（(][^）)]*[）)]', '', x)) for x in re.split(r'[/,;&]', row[i + 1][1])}
            found = {m for m in found if m}
            if not found & treadmills:
                lead = re.match(r'\s*([A-Za-z]{1,3}-?[A-Za-z]*\d[\w-]*(?:\s+SMART)?)', pathlib.Path(rel).name)
                if lead and MODEL(lead.group(1)) in treadmills: found.add(MODEL(lead.group(1)))
            for m in found:
                index.setdefault(m, []).append((rel, sheet))

    # Template from the master sheet: every mapped row must exist there.
    master_rows = [(N(r[0][1]), r[0][1], '', r[0][0]) for r in cache[MASTER][0]['rows'] if r[0][0].startswith('A')]
    missing = [k for k, _, al in FIELDS if not find(master_rows, al)]
    assert not missing, 'template rows not found in the master sheet: ' + ', '.join(missing)
    templates_path = ROOT / 'data/specifications/templates.json'
    templates = json.loads(templates_path.read_text(encoding='utf-8'))
    templates['Treadmills'] = [{'title': t, 'fields': [[k, label] for k, label, _ in fs]} for t, fs in SECTIONS]
    templates_path.write_text(json.dumps(templates, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    html_path = ROOT / 'app/index.html'; html = html_path.read_bytes().decode('utf-8')
    html, n = re.subn(r'PRODUCT_SPEC_TEMPLATES=\{.*?\};(\r?\n)', lambda m: 'PRODUCT_SPEC_TEMPLATES=' + json.dumps(templates, ensure_ascii=False, separators=(',', ':')) + ';' + m.group(1), html, count=1)
    assert n == 1; html_path.write_bytes(html.encode('utf-8'))

    isv = {}
    for f in ('current-products.json', 'off-sunny-products.json'):
        for x in json.loads((ROOT / 'data/isv' / f).read_text(encoding='utf-8'))['items']:
            isv[x['id']] = x
    paths = sorted((ROOT / 'data').glob('*.json')) + [ROOT / 'data/off-sunny-web/items.json']
    audit = {'template': MASTER, 'rebuiltAt': '2026-11-16', 'fields': [k for k, _, _ in FIELDS], 'products': []}
    for p in paths:
        raw = p.read_text(encoding='utf-8'); items = json.loads(raw); indent = len(raw.split('\n')[1]) - len(raw.split('\n')[1].lstrip()); changed = False
        for r in items:
            if r['category'] != 'Treadmills':
                continue
            entries = sorted(index.get(MODEL(r['sku']), []), key=lambda e: mtime.get(e[0], 0), reverse=True)
            latest = entries[0][0] if entries else None
            sheets = [s for rel, s in entries if rel == latest]
            if latest and latest.lower().endswith('.xlsx'):
                boxes = checkboxes(a.folder / latest)
                for sheet in sheets: sheet['checks'] = boxes.get(sheet['name'], {})
            old = (r.get('specDetails') or {}).get('values', {})
            values, evidence, sources, row = {}, {}, [], {'id': r['id'], 'sku': r['sku'], 'sheet': latest,
                    'sheetModified': datetime.datetime.fromtimestamp(mtime[latest]).isoformat(timespec='minutes') if latest else None,
                    'fromSheet': [], 'fromISV': [], 'unavailable': [], 'replaced': []}
            for key, _, aliases in FIELDS:
                found = None
                for sheet in sheets:
                    pair = find(rows_of(sheet), aliases)
                    v = tidy(key, pair[2], pair[1]) if pair and pair[2] else ''
                    if key == 'bluetoothType' and pair and pair[3].endswith('(checkbox)'):  # the app named next to the Yes box
                        m = re.fullmatch(r'Yes \((.+)\)', v); v = m.group(1) if m else ''
                    if v and usable(key, v):
                        found = (fill.with_units(key, v, pair[1]), latest + ' / ' + sheet['name'] + ' / ' + pair[3], latest, 'fromSheet'); break
                if not found:
                    x = isv.get(r['id']); col = ISV.get(key); v = x and col and x['fields'].get(col)
                    if v not in (None, '') and str(v).strip().lower() not in ISV_EMPTY and usable(key, v):
                        v = str(v).strip()
                        if re.fullmatch(r'\d+\.\d{6,}', v): v = '%g' % round(float(v), 4)
                        if re.fullmatch(r'\d+(?:\.\d+)?', v): v += {'AA': ' lb', 'CQ': ' in'}.get(col, '')
                        found = (v, 'ISV 4.0 / SHF / ' + col + str(x['row']), 'ISV 4.0', 'fromISV')
                if not found:
                    row['unavailable'].append(key)
                    if old.get(key): row['replaced'].append({'field': key, 'old': old[key], 'new': None})
                    continue
                values[key], evidence[key] = found[0], found[1]
                if found[2] not in sources: sources.append(found[2])
                row[found[3]].append(key)
                if old.get(key) and old[key] != found[0]: row['replaced'].append({'field': key, 'old': old[key], 'new': found[0]})
            sd = r.get('specDetails') or {'version': 1}
            # Values for fields the template no longer lists are kept in the record, but not shown.
            keep = {k: v for k, v in old.items() if k not in {f[0] for f in FIELDS}}
            sd['values'] = {**values, **keep}
            sd['evidence'] = {**evidence, **{k: v for k, v in (sd.get('evidence') or {}).items() if k in keep}}
            sd['sources'] = sources
            sd['notes'] = [n for n in (sd.get('notes') or []) if n != NOTE] + [NOTE]
            r['specDetails'] = sd; changed = True
            audit['products'].append(row)
        if changed:
            p.write_bytes((json.dumps(items, ensure_ascii=False, indent=indent) + '\n').encode('utf-8'))
    (ROOT / 'data/specifications/treadmill-master-audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    P = audit['products']
    print(json.dumps({'treadmills': len(P), 'withSheet': sum(1 for x in P if x['sheet']), 'fromSheet': sum(len(x['fromSheet']) for x in P),
                      'fromISV': sum(len(x['fromISV']) for x in P), 'unavailable': sum(len(x['unavailable']) for x in P),
                      'replaced': sum(1 for x in P for c in x['replaced'] if c['new'] is not None), 'cleared': sum(1 for x in P for c in x['replaced'] if c['new'] is None)}))


if __name__ == '__main__':
    main()
