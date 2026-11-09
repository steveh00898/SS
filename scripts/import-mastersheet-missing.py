"""Append the audited Mastersheet gaps using researched Sunny resources and exact ISV names."""
import json
import pathlib
import re
import sys
from collections import defaultdict

import openpyxl

root = pathlib.Path(__file__).resolve().parents[1]
archive_path = root / 'data/off-sunny-web/items.json'
batch = 'us-mastersheet-v1-missing'
archive = json.loads(archive_path.read_text(encoding='utf8'))
audit = json.loads((root / 'data/pricing/us-mastersheet-v1-audit.json').read_text(encoding='utf8'))
resources = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf8'))
by_sku = {entry['sku']: entry for entry in resources}
assert len(resources) == len(by_sku) == len(audit['notInApp']) == 136

names = defaultdict(list)
with pathlib.Path(sys.argv[2]).open('rb') as source:
    workbook = openpyxl.load_workbook(source, read_only=True, data_only=True)
    for row in workbook['SHF'].iter_rows(min_row=4, max_col=6, values_only=True):
        if row[0] is not None and isinstance(row[5], str) and row[5].strip():
            names[str(row[0]).strip().upper()].append(row[5].strip())
    workbook.close()

categories = {
    'Row-N-Rides': 'Row-N-Ride', 'Rowing Machines': 'Rowers', 'Free Weights': 'Weights',
    'Treadmills': 'Treadmills', 'Exercise Bikes': 'Indoor Bikes', 'Ellipticals': 'Ellipticals',
    'Step Machine': 'Steppers', 'Benches': 'Weight Benches',
    'Strength Training - Dip Stations': 'Racks', 'Strength Training - Barbells': 'Weights',
    'Strength Training - Attachments': 'Racks',
}
existing = {row['id'] for row in archive}
added = []
for row in audit['notInApp']:
    sku = row['sku']
    resource = by_sku[sku]
    ident = resource['id']
    assert ident not in existing
    existing.add(ident)
    category = categories.get(row['category'], categories.get(row['category'].split(' - ')[0], 'Essentials'))
    candidates = names[sku.upper()]
    name = resource.get('productName') or (candidates[0] if len(candidates) == 1 else None)
    price = row['price']
    added.append({
        'id': ident, 'sku': sku, 'name': name or sku, 'category': category,
        'catalogSource': 'off-sunny-web', 'importBatch': batch,
        'sourceFile': 'Sunny US Mastersheet V1.xlsx', 'mastersheetRow': row['row'],
        'mastersheetStatus': row['status'], 'mastersheetCategory': row['category'],
        'price': price, 'priceChecked': price is not None,
        'priceSource': 'Sunny US Mastersheet V1' if price is not None else None,
        'url': resource['productUrl'] or '', 'imageUrl': resource['imageUrl'],
        'imageAvailability': resource['imageAvailability'], 'imageAssetId': None,
        'photoChecked': False, 'photoMasks': None,
        'specDetails': {'version': 1, 'values': {}, 'sources': [f"Sunny US Mastersheet V1.xlsx row {row['row']}"], 'evidence': {}},
        'resourceLinks': {
            'manualUrl': resource['manualUrl'], 'assemblyUrl': resource['assemblyUrl'],
            'manualPage': resource['guidePage'] if resource['manualUrl'] else None,
            'assemblyPage': resource['guidePage'] if resource['assemblyUrl'] else None,
            'checkedAt': resource['checkedAt'], 'verificationStatus': resource['status'],
        },
        'createdAt': '2026-11-09T00:00:00Z', 'updatedAt': '2026-11-09T00:00:00Z',
    })

archive_path.write_text(json.dumps(archive + added, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
print(f'Appended {len(added)} records; Off Sunny web total {len(archive) + len(added)}.')
