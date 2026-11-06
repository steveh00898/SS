"""Stage every remaining verifiable V3 model for the off-Sunny-web catalog (read-only on sources).

Usage: python scripts/import-v3-batch-five.py --source <V3 folder> --isv <ISV 4.0.xlsx> --xls-copies <dir> --output <staged JSON>
--xls-copies holds .xlsx copies of legacy .xls files (same base name); SHA-256 is taken from the original.

Rules on top of batch four (whose field mapping is reused):
- A model needs its sheet's model cell to match the filename, or the filename and an exact ISV row to agree
  when the cell is blank or misprinted, or the cell and an exact ISV row to agree when the filename names no model.
- The sheet's product name wins. A blank or code-only name uses the exact ISV row's Product Name, with a note.
- With no name in either source the model is deferred; a name or category is never guessed.
- Existing records are never rewritten.
"""
import argparse, hashlib, importlib.util, json, pathlib, re

import openpyxl

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('b4', ROOT / 'scripts/import-v3-batch-four.py')
b4 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b4)
b3, MODEL, N = b4.b3, b4.MODEL, b4.N
OUT = ROOT / 'data/off-sunny-web'
BATCH = 'v3-batch-5'
b4.BATCH = BATCH
b4.MULTI = b4.MULTI + ('SF-WV02 ',)

# Files whose model cell is blank or misprinted, or whose filename names no model. Each one is
# accepted only if an exact ISV row exists for the model (checked below).
IDENTITY = {
    'SF-A023001 Specification': ('SF-A023001', 'The sheet has no model cell; the model comes from the filename and its exact ISV row.'),
    'SF-A026006 spec': ('SF-A026006', 'The sheet has no model cell; the model comes from the filename and its exact ISV row.'),
    'SF-T1407M Specification': ('SF-T1407M', 'The sheet prints the model as T-1407m; the model comes from the filename and its exact ISV row.'),
    'SF-T722068 Draft': ('SF-T722068', 'The sheet holds the model in the name cell and leaves the model cell blank; the model comes from the filename and its exact ISV row.'),
    'SF-T725095 Treadmill': ('SF-T725095', 'The sheet leaves the model cell blank; the model comes from the filename and its exact ISV row.'),
    'SF-T726025': ('SF-T726025', 'The sheet prints SF-726025 (TB3460A); the filename and exact ISV row give SF-T726025.'),
    'SF‐DB03‐10': ('SF-DB03-10', 'The sheet prints 10LBS in the model cell; the model comes from the filename and its exact ISV row.'),
    'Spec Sheet-S0978': ('SF-S0978', 'The filename prints S0978; the sheet and exact ISV row give SF-S0978.'),
    'Strength Spec dated': ('SF-A025049', 'The filename names no model; the model comes from the sheet and its exact ISV row.'),
    'Treadmill draft Spec dated TB2460A': ('SF-T726024', 'The sheet and filename also print factory code TB2460A.'),
}
# Printed differently from the ISV row and the filename; same model.
SKU_TEXT = {'NOO88COMBO': 'NO. 088-COMBO', 'NO088COMBO': 'NO. 088-COMBO'}
# A value printed in the name cell that is a factory or model code, not a product name.
CODE_NAME = {'SP208C', 'SF-T722068'}
# ISV categories that map to a catalog category; anything else goes by the product name.
ISV_CATEGORY = [
    (r'^Strength Training - (Racks|Weight Racks|Power Towers|Dip Stations|Attachments)', 'Racks'),
    (r'^Free Weights', 'Weights'),
    (r'^Benches', 'Weight Benches'),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--source', required=True, type=pathlib.Path)
    ap.add_argument('--isv', required=True, type=pathlib.Path)
    ap.add_argument('--xls-copies', required=True, type=pathlib.Path)
    ap.add_argument('--output', required=True, type=pathlib.Path)
    a = ap.parse_args()
    for sections in json.loads((ROOT / 'data/specifications/templates.json').read_text(encoding='utf-8')).values():
        for section in sections:
            for key, label in section['fields']:
                b3.ALIASES.setdefault(key, [re.sub(r'\([^)]*\)', '', label).strip()])

    book = openpyxl.load_workbook(a.isv, data_only=True, read_only=True)
    isv = {}
    for number, row in enumerate(book['SHF'].iter_rows(min_row=4, max_col=6, values_only=True), 4):
        if row[0] is not None:
            isv.setdefault(MODEL(row[0]), {'row': number, 'text': str(row[0]), 'category': row[2] or row[3] or '', 'name': (row[5] or '').strip() if isinstance(row[5], str) else ''})
    book.close()

    def category(name, sku):
        text = isv.get(MODEL(sku), {}).get('category', '')
        for pattern, cat in ISV_CATEGORY:
            if re.search(pattern, text):
                return cat
        return base_category(name, sku)
    base_category = b4.category
    b4.category = category

    archive = [r for r in json.loads((OUT / 'items.json').read_text(encoding='utf-8')) if r.get('importBatch') != BATCH]
    current = [r for p in (ROOT / 'data').glob('*.json') for r in json.loads(p.read_text(encoding='utf-8'))]
    existing = {MODEL(r['sku']) for r in archive + current}
    done = {r['sourceFile'] for r in archive}
    out, audit, deferred = [], [], []

    for path in sorted(f for f in a.source.iterdir() if f.is_file() and f.name not in done):
        file = path.name
        legacy = path.suffix.lower() == '.xls'
        base = a.xls_copies if legacy else a.source
        read_name = path.stem + '.xlsx' if legacy else file
        sheets = b3.read_sources(base, [{'sourceFile': read_name}])[read_name]
        override = next((v for k, v in IDENTITY.items() if file.replace('\xa0', ' ').startswith(k)), None)
        found = list(b4.candidates(sheets))
        if override and not found:
            found = [(sheets[0], override[0], 'filename')]
        if not found:
            s = next((s for s in sheets if b4.swapped_name(s)), None)
            if s:
                sku, cell, _ = b4.swapped_name(s)
                found = [(s, sku, cell)]
            else:
                deferred.append({'sourceFile': file, 'reason': 'No model number cell in the sheet.'})
                continue
        for sheet, sku, cell in found:
            sku = sku.replace('‐', '-').strip()
            notes = []
            if override:
                if MODEL(override[0]) not in isv:
                    deferred.append({'sku': override[0], 'sourceFile': file, 'reason': 'Model needs an exact ISV row to confirm it, and has none.'})
                    continue
                sku = override[0]
                notes.append(override[1])
            elif not file.startswith(b4.MULTI) and MODEL(sku) not in MODEL(file):
                deferred.append({'sku': sku, 'sourceFile': file, 'reason': 'Model cell does not match the filename and no ISV row confirms it; identity unclear.'})
                continue
            sku = SKU_TEXT.get(MODEL(sku), sku)
            if MODEL(sku) in existing:
                deferred.append({'sku': sku, 'sourceFile': file, 'reason': 'Model already in the catalog; existing record preserved.'})
                continue
            swap = b4.swapped_name(sheet)
            pair = b3.find(b3.pairs(sheet), ['item name', 'product name'])
            name = swap[2] if swap else pair[2] if pair else None
            if name and MODEL(name) in MODEL(sku):  # "ITEM NAME" can hold the model; the title is then in "PRODUCT NAME".
                pair = b3.find(b3.pairs(sheet), ['product name'])
                name = pair[2] if pair else name
            if swap:
                notes.append('The source form holds the title in the model cell and the SKU in the name cell; they are used accordingly.')
            usable = name and N(name) not in b4.PLACEHOLDER and MODEL(name) != MODEL(sku) and not re.match(r'DATE\s*:', name, re.I) and name.strip() not in CODE_NAME
            name_source = 'sheet'
            if not usable:
                row = isv.get(MODEL(sku))
                if not row or not row['name']:
                    deferred.append({'sku': sku, 'sourceFile': file, 'reason': 'No descriptive product name in the sheet or ISV 4.0; name and category not guessed.'})
                    continue
                name = row['name']
                name_source = f"ISV 4.0 SHF!F{row['row']}"
                notes.append(f'The spec sheet gives no descriptive product name; the name comes from {name_source}.')
            rec = b4.build(sheet, sku, file, name, notes)
            if not rec['specDetails']['values']:
                deferred.append({'sku': sku, 'sourceFile': file, 'reason': 'The file holds only a measuring list, with no product specification fields to import.'})
                continue
            existing.add(MODEL(sku))
            out.append(rec)
            audit.append({'id': rec['id'], 'model': sku, 'file': file, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'sheet': sheet['name'],
                          'modelEvidence': {'cell': cell, 'text': sku}, 'name': name, 'nameSource': name_source, 'category': rec['category'],
                          'fieldsFilled': len(rec['specDetails']['values']), 'notes': rec['specDetails']['notes']})

    assert len({r['id'] for r in out}) == len(out)
    a.output.write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (OUT / 'batch-five-selection.json').write_text(json.dumps([{'sku': r['sku'], 'sourceFile': r['sourceFile']} for r in out], ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (OUT / 'batch-five-deferred.json').write_text(json.dumps(deferred, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (OUT / 'batch-five-sources.json').write_text(json.dumps({'source': a.source.name, 'importedAt': '2026-11-06', 'importedModels': len(out), 'sourceFiles': len({r['file'] for r in audit}), 'records': audit}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Prepared', len(out), 'models;', len({r['sourceFile'] for r in out}), 'files; deferred', len(deferred))
    for r in out:
        src = next(x for x in audit if x['id'] == r['id'])
        print(r['sku'], '|', r['name'][:55], '|', r['category'], '|', len(r['specDetails']['values']), '|', src['nameSource'][:14])
    for d in deferred:
        print('DEFER', d.get('sku', ''), '|', d['sourceFile'][:45], '|', d['reason'][:60])


if __name__ == '__main__':
    main()
