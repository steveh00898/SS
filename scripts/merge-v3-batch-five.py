"""Merge staged V3 batch-five records and their researched resources into the off-Sunny-web catalog.

Usage: python scripts/merge-v3-batch-five.py <staged JSON> <V3 folder> <xls copies dir>
Applies the hand-checked image choices below, then appends the records. Earlier records are not touched,
and a rerun replaces only batch five.
"""
import hashlib, io, json, pathlib, sys, zipfile

from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'data/off-sunny-web'
ASSETS = ROOT / 'data/images/off-sunny-web'
staged = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8'))
SRC, COPIES = pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3])
resources = json.loads((OUT / 'batch-five-resources.json').read_text(encoding='utf-8'))

# Viewed by eye. The automatic pick (largest image) was a diagram or a website placeholder for these.
SHEET_PICKS = {'SF-B222001': 'xl/media/image5.png', 'SF-T722068': 'xl/media/image14.jpeg'}
OFFICIAL_PLACEHOLDER = {'SF-RB425097'}  # The official page shows a "No image" graphic.
PICK_NOTE = 'Hand-picked by viewing the sheet images; the largest image was not the product.'


def save(raw, ident):
    im = Image.open(io.BytesIO(raw)).convert('RGBA')
    bg = Image.new('RGBA', im.size, 'white')
    bg.alpha_composite(im)
    im = ImageOps.contain(bg.convert('RGB'), (1104, 828))
    canvas = Image.new('RGB', (1200, 900), 'white')
    canvas.paste(im, ((1200 - im.width) // 2, (900 - im.height) // 2))
    target = ASSETS / (ident + '-batch5-v1.jpg')
    canvas.save(target, quality=88, optimize=True)
    return target


for e in resources:
    if e['sku'] in SHEET_PICKS:
        book = SRC / e['sourceFile']
        book = COPIES / (book.stem + '.xlsx') if book.suffix.lower() == '.xls' else book
        obj = SHEET_PICKS[e['sku']]
        target = save(zipfile.ZipFile(book).read(obj), e['id'])
        e['imageEvidence'] = {**e['imageEvidence'], 'object': obj, 'note': PICK_NOTE, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()}
    if e['sku'] in OFFICIAL_PLACEHOLDER:
        obj = 'xl/media/image5.png'
        target = save(zipfile.ZipFile(SRC / e['sourceFile']).read(obj), e['id'])
        e.update(imageAvailability='spec-sheet', imageEvidence={'sourceFile': e['sourceFile'], 'object': obj, 'note': 'The official page shows only a "No image" graphic, so the sheet photo is used.', 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
(OUT / 'batch-five-resources.json').write_text(json.dumps(resources, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

by_id = {e['id']: e for e in resources}
records = []
for r in staged:
    e = by_id[r['id']]
    records.append({**r, 'url': e['productUrl'] or '', 'imageUrl': e['imageUrl'], 'imageAvailability': e['imageAvailability'],
                    'resourceLinks': {'manualUrl': e['manualUrl'], 'assemblyUrl': e['assemblyUrl'], 'manualPage': e['guidePage'] if e['manualUrl'] else None,
                                      'assemblyPage': e['guidePage'] if e['assemblyUrl'] else None, 'checkedAt': e['checkedAt'], 'verificationStatus': e['status']}})
archive = [r for r in json.loads((OUT / 'items.json').read_text(encoding='utf-8')) if r.get('importBatch') != 'v3-batch-5']
(OUT / 'items.json').write_text(json.dumps(archive + records, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('archive', len(archive) + len(records), 'batch', len(records))
