"""Fill requested Product Spec fields from the Master SPEC SHEET folder, then ISV 4.0.

Usage: python scripts/fill-master-specs.py <Master SPEC SHEET folder> [--cache <json>]
Fields: product weight, shipping weight and product dimensions for every product; treadmills also
get deck-to-floor height, running belt and carton dimensions; indoor bikes get carton dimensions,
Q-factor, flywheel weight and inseam. Only empty fields are filled. A spec sheet matches a product
only when a visible model cell equals its model number (spaces and punctuation ignored); the sheet
with the latest date in its file name is read first. Values that differ from what the app already
shows are not changed; they are listed in data/specifications/master-fill-audit.json.
"""
import argparse, datetime, importlib.util, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('b3', ROOT / 'scripts/import-v3-batch-three.py')
b3 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b3)
MODEL, N = b3.MODEL, b3.N
TODAY = '2026-11-09'
NOTE = 'Requested fields filled on ' + TODAY + ': Master SPEC SHEET first (latest dated file), then ISV 4.0.'
COMMON = ['productWeight', 'shippingWeight', 'keyDimensions']
FIELDS = {'Treadmills': COMMON + ['stepOnHeight', 'beltDimensions', 'shippingDimensions'],
          'Indoor Bikes': COMMON + ['shippingDimensions', 'qFactor', 'flywheelWeight', 'inseam']}
ALIASES = dict(b3.ALIASES)
ALIASES.update({'stepOnHeight': ['deck to floor height', 'deck height', 'step on height', 'step-on height', 'floor to deck height'],
                'qFactor': ['q-factor', 'q factor', 'qfactor'], 'inseam': ['inseam range', 'inseam', 'slide rail inseam']})
# ISV 4.0 columns (sheet SHF) for the same fields. Inseam has a bike and a recumbent column.
ISV = {'productWeight': ['AO'], 'shippingWeight': ['AA'], 'keyDimensions': ['AS'], 'shippingDimensions': ['AG'],
       'flywheelWeight': ['BQ'], 'inseam': ['DA', 'DQ', 'EV'], 'qFactor': ['DB'], 'beltDimensions': ['EG', 'CT'], 'stepOnHeight': ['ES']}
MODEL_LABELS = {'model', 'modelnumber', 'modelno', 'item', 'itemnumber', 'itemno', 'productmodel', 'productnumber', 'modelno', 'sku'}


def file_date(name):
    """Latest plausible date written in a file name (MMDDYYYY, YYYYMMDD, MMDDYY, M.D.YY, YYYY-MM-DD)."""
    found = []
    for m in re.finditer(r'(?<!\d)(\d{4})[-_.](\d{1,2})[-_.](\d{1,2})(?!\d)', name):
        found.append((int(m[1]), int(m[2]), int(m[3])))
    for m in re.finditer(r'(?<!\d)(\d{1,2})[-_.](\d{1,2})[-_.](\d{2}|\d{4})(?!\d)', name):
        y = int(m[3]); found.append((y + 2000 if y < 100 else y, int(m[1]), int(m[2])))
    for m in re.finditer(r'(?<!\d)(\d{8})(?!\d)', name):
        s = m[1]; found += [(int(s[4:]), int(s[:2]), int(s[2:4])), (int(s[:4]), int(s[4:6]), int(s[6:]))]
    for m in re.finditer(r'(?<!\d)(\d{6})(?!\d)', name):
        s = m[1]; found.append((2000 + int(s[4:]), int(s[:2]), int(s[2:4])))
    ok = []
    for y, mo, d in found:
        try:
            if 2010 <= y <= 2026:
                ok.append(datetime.date(y, mo, d))
        except ValueError:
            pass
    return max(ok) if ok else None


def models(sheet):
    out = set()
    for row in sheet['rows']:
        for i, (_, text) in enumerate(row):
            if N(text) in MODEL_LABELS and i + 1 < len(row):
                val = row[i + 1][1]
                if len(val) < 80:
                    out.update(MODEL(x) for x in re.split(r'[/,;&]|\band\b', val) if MODEL(x))
    return out


def with_units(key, value, label):
    if key.endswith('Weight') and re.fullmatch(r'\d+(?:\.\d+)?', value):
        if re.search(r'lbs?|pounds?', label, re.I): return value + ' lb'
        if re.search(r'kgs?|kilogram', label, re.I): return value + ' kg'
    if (key.endswith('Dimensions') or key in ('stepOnHeight', 'qFactor', 'inseam')) and not re.search(r'cm|mm|inch|"|\d\s*in\b|\bft\b|feet', value, re.I):
        if re.search(r'inches|inch|\bin\b', label, re.I): return value + ' in'
        if re.search(r'\bcm\b', label, re.I): return value + ' cm'
        if re.search(r'\bmm\b', label, re.I): return value + ' mm'
    return value


def usable(key, value):
    """Rejects empty templates such as 'L x W x H' or '60L x W x H'."""
    nums = re.findall(r'\d+(?:\.\d+)?', str(value))
    if key.endswith('Dimensions') or key == 'beltDimensions': return len(nums) >= 2
    return bool(nums) or N(value) in {'notapplicable'}


def same(app, sheet):
    """A sheet value that is part of the app value (for example MIN of a MIN/MAX pair) is not a difference."""
    if N(sheet) == N(app) or N(sheet) in N(app): return True
    # Same numbers written differently (lbs vs lb, 57" x 27.2" vs 57L x 27.2W) are not a difference.
    a = {float(x) for x in re.findall(r'\d+(?:\.\d+)?', str(app))}; s = {float(x) for x in re.findall(r'\d+(?:\.\d+)?', str(sheet))}
    return bool(a and s) and (a <= s or s <= a)


def blank(v):
    return v is None or not str(v).strip() or N(v) in {'unavailable', 'notprovided', 'seetherighttable'}


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('folder', type=pathlib.Path); ap.add_argument('--cache', type=pathlib.Path); a = ap.parse_args()
    files = sorted(p for p in a.folder.rglob('*') if p.is_file() and not p.name.startswith('~$') and p.suffix.lower() in ('.xlsx', '.xls', '.docx'))
    cache = json.loads(a.cache.read_text(encoding='utf-8')) if a.cache and a.cache.exists() else {}
    unreadable = []
    for p in files:
        rel = p.relative_to(a.folder).as_posix()
        if rel in cache: continue
        try:
            cache[rel] = b3.read_sources(a.folder, [{'sourceFile': rel}])[rel]
        except Exception as e:  # Damaged or password-protected files are reported, not guessed.
            cache[rel] = None; unreadable.append(rel + ': ' + type(e).__name__)
    if a.cache: a.cache.write_text(json.dumps(cache, ensure_ascii=False), encoding='utf-8')
    unreadable = sorted(k for k, v in cache.items() if v is None)
    mtime = {p.relative_to(a.folder).as_posix(): p.stat().st_mtime for p in files}
    index = {}
    for rel, sheets in cache.items():
        for sheet in sheets or []:
            for m in models(sheet):
                index.setdefault(m, []).append((rel, sheet))
    order = lambda e: (file_date(pathlib.Path(e[0]).name) or datetime.date(1900, 1, 1), mtime.get(e[0], 0))

    isv = {}
    for f in ('current-products.json', 'off-sunny-products.json'):
        for x in json.loads((ROOT / 'data/isv' / f).read_text(encoding='utf-8'))['items']:
            isv[x['id']] = x
    paths = sorted((ROOT / 'data').glob('*.json')) + [ROOT / 'data/off-sunny-web/items.json']
    loaded = {p: json.loads(p.read_text(encoding='utf-8')) for p in paths}
    indents = {p: len(p.read_text(encoding='utf-8').split('\n')[1]) - len(p.read_text(encoding='utf-8').split('\n')[1].lstrip()) for p in paths}
    filled, conflicts, unavailable, nosheet = [], [], [], []
    for p, items in loaded.items():
        for r in items:
            keys = FIELDS.get(r['category'], COMMON)
            entries = sorted(index.get(MODEL(r['sku']), []), key=order, reverse=True)
            if not entries: nosheet.append(r['sku'])
            sd = r.get('specDetails') or {'version': 1, 'values': {}, 'sources': [], 'evidence': {}, 'notes': []}
            vals = sd.setdefault('values', {}); ev = sd.setdefault('evidence', {}); srcs = sd.setdefault('sources', []); changed = False
            for key in keys:
                found = None
                for rel, sheet in entries:
                    pair = b3.find(b3.pairs(sheet, r['category'], r['name']), ALIASES.get(key, []))
                    if pair and pair[2] and pair[2] != 'Not applicable' and usable(key, pair[2]):
                        found = (with_units(key, pair[2], pair[1]), rel + ' / ' + sheet['name'] + ' / ' + pair[3], rel); break
                if not blank(vals.get(key)):
                    if found and not same(vals[key], found[0]):
                        conflicts.append({'id': r['id'], 'sku': r['sku'], 'category': r['category'], 'field': key, 'app': vals[key], 'specSheet': found[0], 'evidence': found[1]})
                    continue
                source = 'spec sheet'
                if not found:
                    x = isv.get(r['id'])
                    for col in ISV.get(key, []):
                        v = x and x['fields'].get(col)
                        if v not in (None, '') and N(v) not in {'na', 'no', 'none', '0'} and usable(key, v):
                            v = str(v).strip() + (' lb' if col == 'AA' and re.fullmatch(r'\d+(?:\.\d+)?', str(v).strip()) else '')
                            found = (v, 'ISV 4.0 / SHF / ' + col + str(x['row']), 'ISV 4.0'); source = 'ISV 4.0'; break
                if not found:
                    unavailable.append({'sku': r['sku'], 'category': r['category'], 'field': key}); continue
                vals[key] = found[0]; ev[key] = found[1]; changed = True
                if found[2] not in srcs: srcs.append(found[2])
                filled.append({'id': r['id'], 'sku': r['sku'], 'field': key, 'value': found[0], 'source': source, 'evidence': found[1]})
            if changed:
                if NOTE not in sd.setdefault('notes', []): sd['notes'].append(NOTE)
                r['specDetails'] = sd
    for p, items in loaded.items():
        p.write_bytes((json.dumps(items, ensure_ascii=False, indent=indents[p]) + '\n').encode('utf-8'))
    audit = {'source': a.folder.name, 'filesRead': len(files) - len(unreadable), 'unreadable': unreadable, 'fields': FIELDS, 'common': COMMON,
             'filled': filled, 'conflicts': conflicts, 'unavailable': unavailable, 'noSpecSheet': sorted(set(nosheet))}
    (ROOT / 'data/specifications/master-fill-audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    by = lambda rows, k: {s: sum(1 for x in rows if x[k] == s) for s in sorted({x[k] for x in rows})}
    print(json.dumps({'files': len(files), 'unreadable': len(unreadable), 'filled': len(filled), 'bySource': by(filled, 'source'), 'byField': by(filled, 'field'),
                      'conflicts': len(conflicts), 'unavailable': len(unavailable), 'unavailableByField': by(unavailable, 'field'), 'noSheet': len(set(nosheet))}, indent=1))


if __name__ == '__main__':
    main()
