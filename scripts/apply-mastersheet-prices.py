"""Apply B2B TP prices from Sunny US Mastersheet V1 to the catalog and write an audit.

Usage: python scripts/apply-mastersheet-prices.py <mastersheet.xlsx>
A row matches a record by exact SKU text first, then ignoring spaces and punctuation. A blank or NA price
leaves the record's price as it is. Rerunning gives the same result.
"""
import collections, hashlib, json, pathlib, re, sys

import openpyxl

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = 'Sunny US Mastersheet V1'
book = pathlib.Path(sys.argv[1])
MODEL = lambda s: re.sub(r'[^A-Z0-9]', '', str(s).upper())
EXACT = lambda s: str(s).strip().upper()
clean = lambda s: re.sub(r'\s+', ' ', str(s)).strip() if s is not None else None

sheet = openpyxl.load_workbook(book, data_only=True).worksheets[0]
rows = []
for number, cells in enumerate(sheet.iter_rows(values_only=True), 1):
    if number > 1 and any(c is not None for c in cells):
        sku, category, status, price = cells[:4]
        valid = isinstance(price, (int, float)) and price > 0
        rows.append({'row': number, 'sku': clean(sku), 'category': clean(category), 'status': clean(status),
                     'price': round(float(price), 2) if valid else None, 'priceCell': None if valid or price is None else clean(price)})

files = sorted((ROOT / 'data').glob('*.json')) + [ROOT / 'data/off-sunny-web/items.json']
loaded = {f: json.loads(f.read_text(encoding='utf-8')) for f in files}
indents = {f: len(f.read_text(encoding='utf-8').split('\n')[1]) - len(f.read_text(encoding='utf-8').split('\n')[1].lstrip()) for f in files}
records = [r for items in loaded.values() for r in items]
by_exact, by_model = collections.defaultdict(list), collections.defaultdict(list)
for r in records:
    by_exact[EXACT(r['sku'])].append(r)
    by_model[MODEL(r['sku'])].append(r)

# Exact text claims a record first, so "NO. 077S" and "NO. 077-S" stay two products.
claimed = {r['id'] for row in rows for r in by_exact[EXACT(row['sku'])]}
changed, unchanged, no_price, missing = [], [], [], []
for row in rows:
    targets = by_exact[EXACT(row['sku'])] or [r for r in by_model[MODEL(row['sku'])] if r['id'] not in claimed]
    if not targets:
        missing.append(row)
        continue
    for r in targets:
        entry = {'row': row['row'], 'sheetSku': row['sku'], 'id': r['id'], 'sku': r['sku'], 'name': r['name'], 'catalog': r.get('catalogSource') or 'current', 'old': r.get('price'), 'new': row['price']}
        if row['price'] is None:
            no_price.append({**entry, 'priceCell': row['priceCell']})
            continue
        (unchanged if r.get('price') == row['price'] else changed).append(entry)
        r['price'] = row['price']
        r['priceSource'] = SOURCE

matched = {row['sheetSku'] for group in (changed, unchanged, no_price) for row in group}
not_in_sheet = sorted({MODEL(r['sku']): r['sku'] for r in records if MODEL(r['sku']) not in {MODEL(x['sku']) for x in rows}}.values())
for f, items in loaded.items():
    f.write_bytes((json.dumps(items, ensure_ascii=False, indent=indents[f]) + '\n').encode('utf-8'))  # Keeps each file's existing layout.
audit = {'source': book.name, 'sha256': hashlib.sha256(book.read_bytes()).hexdigest(), 'column': 'B2B TP', 'rows': len(rows),
         'discrepancies': [e for e in changed if e['old'] is not None], 'filled': [e for e in changed if e['old'] is None],
         'unchanged': len(unchanged), 'matchedWithoutPrice': no_price, 'notInApp': missing, 'appNotInSheet': not_in_sheet}
target = ROOT / 'data/pricing/us-mastersheet-v1-audit.json'
target.parent.mkdir(exist_ok=True)
target.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
fuzzy = sorted({(e['sheetSku'], e['sku']) for g in (changed, unchanged, no_price) for e in g if EXACT(e['sheetSku']) != EXACT(e['sku'])})
print(json.dumps({'rows': len(rows), 'matchedSheetSkus': len(matched), 'discrepancies': audit['discrepancies'], 'filled': len(audit['filled']), 'unchanged': len(unchanged),
                  'noPrice': no_price, 'notInApp': len(missing), 'appNotInSheet': len(not_in_sheet), 'nonExactMatches': fuzzy}, ensure_ascii=False, indent=1))
