"""Stage the next 100 verified V3 models for the off-Sunny-web catalog (read-only on sources).

Usage: python scripts/import-v3-batch-four.py --source <V3 folder> --output <staged JSON>
Walks unprocessed files in filename order and takes each visible sheet's model cell. A model is
accepted only if its text matches the filename (or the file is a known multi-model workbook) and
the sheet gives a descriptive name. Everything else is written to batch-four-deferred.json.
Reuses the field mapping and source readers of import-v3-batch-three.py; existing records are
never rewritten.
"""
import argparse, hashlib, importlib.util, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('b3', ROOT / 'scripts/import-v3-batch-three.py')
b3 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b3)
MODEL, N = b3.MODEL, b3.N
OUT = ROOT / 'data/off-sunny-web'
BATCH = 'v3-batch-4'
MODEL_LABELS = {'model', 'modelnumber', 'modelno', 'item', 'itemnumber', 'itemno', 'productmodel', 'productnumber'}
PLACEHOLDER = {'pending', 'itemname', 'productname', 'tba', 'treadmill', 'tbd'}
MULTI = ('SF-EB03-4 ', 'SF-EB04-Slam', 'SF-GL01-S', 'SF-WV02 ')


def category(name, sku):
    s = name.lower()
    if 'treadmill' in s or 'walking pad' in s or 'treadpad' in s:
        return 'Treadmills'
    if 'reformer' in s:
        return 'Pilates Reformers'
    if 'climber' in s and 'elliptical' not in s:
        return 'Steppers'
    if re.search(r'threaded chrome|medicine ball|slam ball|kettlebell|weight plates?', s):
        return 'Weights'
    return b3.category(name, sku)


def candidates(sheets):
    """(sheet, model text, model cell) for every visible sheet with a plain model cell."""
    for sheet in sheets:
        found = None
        for row in sheet['rows']:
            for i, (_, text) in enumerate(row):
                if N(text) in MODEL_LABELS and i + 1 < len(row):
                    value = row[i + 1][1].strip()
                    if len(value) < 30 and re.search(r'[A-Z]+[-‐ .]*\d', value.upper()):
                        found = (sheet, value, row[i + 1][0])
                        break
            if found:
                break
        if found:
            yield found


def swapped_name(sheet):
    """Older bumper-plate forms hold the title in the model cell and the SKU in the name cell."""
    p = b3.pairs(sheet)
    n = b3.find(p, ['item name', 'product name'])
    if n and re.fullmatch(r'SF-[A-Z0-9-]+', n[2].strip()):
        for row in sheet['rows']:
            for i, (_, text) in enumerate(row):
                if N(text) in MODEL_LABELS and i + 1 < len(row):
                    return n[2].strip(), n[3], row[i + 1][1].strip()
    return None


def build(sheet, sku, file, name, existing_notes):
    cat = category(name, sku)
    p = b3.pairs(sheet, cat, name)
    vals, labels, evidence = {}, {}, {}
    notes = list(existing_notes)
    for key, aliases in b3.ALIASES.items():
        pair = b3.find(p, aliases)
        if pair and not re.match(r'if no\b', pair[2], re.I):
            # Keep the English of bilingual cells: drop Chinese glosses, never translate.
            vals[key] = re.sub(r'\s{2,}', ' ', re.sub(r'[一-鿿　-〿，：；、]+', ' ', re.sub(r'[(（][^()（）]*[一-鿿][^()（）]*[)）]', ' ', pair[2]))).strip() if re.search(r'[一-鿿]', pair[2]) else pair[2]
            labels[key] = pair[1]
            evidence[key] = f"{file} / {sheet['name']} / {pair[3]}"
    if vals.get('maxUserWeightLb') and N(vals['maxUserWeightLb']) in ['nolimit', 'unlimited']:
        vals.pop('maxUserWeightLb')
        evidence.pop('maxUserWeightLb', None)
        notes.append('Source user capacity says no limit; no numeric capacity is inferred.')
    for key in ['productWeight', 'shippingWeight', 'flywheelWeight', 'keyDimensions', 'foldedDimensions', 'shippingDimensions', 'seatDimensions']:
        val, label = vals.get(key), labels.get(key, '')
        if not val or val == 'Not applicable':
            continue
        if key.endswith('Weight') and re.fullmatch(r'\d+(?:\.\d+)?', val):
            if re.search(r'lbs?|pounds?', label, re.I):
                vals[key] += ' lb'
            elif re.search(r'kgs?|kilogram', label, re.I):
                vals[key] += ' kg'
        if key.endswith('Dimensions') and not re.search(r'cm|mm|inch|\d\s*in\b|\bft\b|feet|units|"', val, re.I):
            if re.search(r'inches|inch|\bin\b', label, re.I):
                vals[key] += ' in'
            elif re.search(r'\bcm\b', label, re.I):
                vals[key] += ' cm'
            else:
                notes.append(f'The source {key} field does not label measurement units; retained as written.')
    capacity = b3.num_lb(vals.get('maxUserWeightLb'), labels.get('maxUserWeightLb', ''))
    if capacity is None and vals.get('maxUserWeightLb') not in [None, 'Not applicable']:
        notes.append('User capacity is retained as source text; no numeric lb capacity can be parsed.')
    absent = lambda v: v is None or N(v) in {'notapplicable', 'no', 'none'}
    drive = ' / '.join(dict.fromkeys(vals[k] for k in ['driveResistanceSystem', 'resistanceType'] if not absent(vals.get(k)))) or None
    levels = None if absent(vals.get('speedResistanceLevels')) else vals.get('speedResistanceLevels')
    motion = vals.get('stride') if cat == 'Ellipticals' else vals.get('stepHeight') if cat == 'Steppers' else vals.get('inclineStrideMotion')
    dims = None if vals.get('keyDimensions') == 'Not applicable' else vals.get('keyDimensions')
    ident = 'off-sunny-' + re.sub('[^a-z0-9]+', '-', sku.lower()).strip('-')
    return {
        'id': ident, 'sku': sku, 'name': name, 'category': cat, 'catalogSource': 'off-sunny-web', 'sourceFile': file,
        'importBatch': BATCH, 'price': None, 'priceChecked': True, 'url': '', 'imageUrl': '', 'imageAssetId': None,
        'photoChecked': False, 'photoMasks': None,
        'specDetails': {'version': 1, 'values': vals, 'sources': [file], 'evidence': evidence, 'notes': notes},
        'productSpecs': {'driveResistanceSystem': drive, 'speedResistanceLevels': levels, 'inclineStrideMotion': motion,
                         'maxUserWeightLb': capacity, 'keyDimensions': dims, 'workoutAreaWidthIn': None, 'workoutAreaLengthIn': None,
                         'source': 'V3 spec sheet: ' + file, 'portfolioCategory': cat,
                         'dimensionOrder': 'Source dimensions; order and units are retained as written.'},
        'resourceLinks': {'manualUrl': None, 'assemblyUrl': None, 'manualPage': None, 'assemblyPage': None, 'checkedAt': None},
        'createdAt': '2026-11-06T00:00:00Z', 'updatedAt': '2026-11-06T00:00:00Z',
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--source', required=True, type=pathlib.Path)
    ap.add_argument('--output', required=True, type=pathlib.Path)
    a = ap.parse_args()
    for sections in json.loads((ROOT / 'data/specifications/templates.json').read_text(encoding='utf-8')).values():
        for section in sections:
            for key, label in section['fields']:
                b3.ALIASES.setdefault(key, [re.sub(r'\([^)]*\)', '', label).strip()])
    archive = [r for r in json.loads((OUT / 'items.json').read_text(encoding='utf-8')) if r.get('importBatch') != BATCH]
    current = [r for p in (ROOT / 'data').glob('*.json') for r in json.loads(p.read_text(encoding='utf-8'))]
    existing = {MODEL(r['sku']) for r in archive + current}
    done = {r['sourceFile'] for r in archive}
    out, audit, deferred = [], [], []
    files = sorted(f for f in a.source.iterdir() if f.is_file() and f.name not in done)
    for path in files:
        file = path.name
        if len(out) >= 100:
            break
        if path.suffix.lower() == '.xls':
            deferred.append({'sourceFile': file, 'reason': 'Legacy .xls not read in this batch; left for a later import.'})
            continue
        if path.suffix.lower() == '.pdf':
            deferred.append({'sourceFile': file, 'reason': 'PDF layout needs manual reading; left for a later import.'})
            continue
        sheets = b3.read_sources(a.source, [{'sourceFile': file}])[file]
        found = list(candidates(sheets))
        if not found:
            s = next((s for s in sheets if swapped_name(s)), None)
            if s:
                sku, cell, title = swapped_name(s)
                found = [(s, sku, cell)]
            else:
                deferred.append({'sourceFile': file, 'reason': 'No model number cell in the sheet.'})
                continue
        for sheet, sku, cell in found:
            if len(out) >= 100:
                break
            sku = sku.replace('‐', '-').strip()
            notes = []
            multi = file.startswith(MULTI)
            if not multi and MODEL(sku) not in MODEL(file):
                deferred.append({'sku': sku, 'sourceFile': file, 'reason': 'Model cell does not match the filename; identity unclear.'})
                continue
            if MODEL(sku) in existing:
                deferred.append({'sku': sku, 'sourceFile': file, 'reason': 'Model already in the catalog; existing record preserved.'})
                continue
            swap = swapped_name(sheet)
            pair = b3.find(b3.pairs(sheet), ['item name', 'product name'])
            name = swap[2] if swap else pair[2] if pair else None
            if swap:
                notes.append('The source form holds the title in the model cell and the SKU in the name cell; they are used accordingly.')
            if not name or N(name) in PLACEHOLDER or MODEL(name) == MODEL(sku) or re.match(r'DATE\s*:', name, re.I):
                deferred.append({'sku': sku, 'sourceFile': file, 'reason': 'No descriptive product name in the sheet; name and category not guessed.'})
                continue
            rec = build(sheet, sku, file, name, notes)
            existing.add(MODEL(sku))
            out.append(rec)
            audit.append({'id': rec['id'], 'model': sku, 'file': file, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'sheet': sheet['name'],
                          'modelEvidence': {'cell': cell, 'text': sku}, 'name': name, 'category': rec['category'],
                          'fieldsFilled': len(rec['specDetails']['values']), 'notes': rec['specDetails']['notes']})
    assert len(out) == 100 and len({r['id'] for r in out}) == 100
    a.output.write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (OUT / 'batch-four-selection.json').write_text(json.dumps([{'sku': r['sku'], 'sourceFile': r['sourceFile']} for r in out], ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (OUT / 'batch-four-deferred.json').write_text(json.dumps(deferred, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (OUT / 'batch-four-sources.json').write_text(json.dumps({'source': a.source.name, 'importedAt': '2026-11-06', 'importedModels': 100, 'sourceFiles': len({r['file'] for r in audit}), 'records': audit}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Prepared', len(out), 'models;', len({r['sourceFile'] for r in out}), 'files; deferred', len(deferred))
    for r in out:
        print(r['sku'], '|', r['name'][:55], '|', r['category'], '|', len(r['specDetails']['values']))
    for d in deferred:
        print('DEFER', d.get('sku', ''), '|', d['sourceFile'][:45], '|', d['reason'][:50])


if __name__ == '__main__':
    main()
