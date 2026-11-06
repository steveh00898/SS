"""Exact-model official resource research for V3 batch four.

Usage: python scripts/research-v3-batch-four.py <staged JSON> <V3 folder> <cache dir>
Writes data/off-sunny-web/batch-four-resources.json and data/images/off-sunny-web/*-batch4-v1.jpg.
A link is kept only when its page names this exact model: a variant SKU equal to the model, or a
guide page heading that starts with the model. A similar model is never substituted. Requests are
paced and cached so an interrupted run can be resumed; HTTP 429 stays "pending", not "unavailable".
"""
import hashlib, html, io, json, pathlib, posixpath, re, sys, time, urllib.error, urllib.parse, urllib.request, zipfile
import xml.etree.ElementTree as E
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parents[1]
rows = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8'))
SRC = pathlib.Path(sys.argv[2])
TMP = pathlib.Path(sys.argv[3])
TMP.mkdir(exist_ok=True)
ASSETS = ROOT / 'data/images/off-sunny-web'
OUT = ROOT / 'data/off-sunny-web/batch-four-resources.json'
SITE = 'https://sunnyhealthfitness.com'
norm = lambda x: re.sub('[^A-Z0-9]', '', str(x).upper())
last = 0.0


def get(url, cache=None):
    global last
    if cache and cache.exists():
        return cache.read_bytes()
    for attempt in range(3):
        wait = 1.2 - (time.monotonic() - last)
        if wait > 0:
            time.sleep(wait)
        last = time.monotonic()
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30) as r:
                body = r.read()
            if cache:
                cache.write_bytes(body)
            return body
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 2:
                raise
            print('429 cooldown', flush=True)
            time.sleep(70)


def save_image(raw, ident):
    im = Image.open(io.BytesIO(raw)).convert('RGBA')
    bg = Image.new('RGBA', im.size, 'white')
    bg.alpha_composite(im)
    im = ImageOps.contain(bg.convert('RGB'), (1104, 828))
    canvas = Image.new('RGB', (1200, 900), 'white')
    canvas.paste(im, ((1200 - im.width) // 2, (900 - im.height) // 2))
    target = ASSETS / (ident + '-batch4-v1.jpg')
    canvas.save(target, quality=88, optimize=True)
    return target


def sheet_media(path, sheet_name):
    """Embedded images on this model's own sheet, largest first (xlsx only)."""
    if path.suffix.lower() != '.xlsx':
        return []
    out = []
    ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    rid = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'
    with zipfile.ZipFile(path) as z:
        rels = {x.get('Id'): x.get('Target') for x in E.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        names = set(z.namelist())
        for sheet in E.fromstring(z.read('xl/workbook.xml')).findall('m:sheets/m:sheet', ns):
            if sheet.get('name') != sheet_name:
                continue
            target = rels[sheet.get(rid)].lstrip('/')
            target = target if target.startswith('xl/') else 'xl/' + target
            rel = posixpath.join(posixpath.dirname(target), '_rels', posixpath.basename(target) + '.rels')
            if rel not in names:
                continue
            for r in E.fromstring(z.read(rel)):
                if 'drawing' not in r.get('Type', ''):
                    continue
                drawing = posixpath.normpath(posixpath.join(posixpath.dirname(target), r.get('Target')))
                drel = posixpath.join(posixpath.dirname(drawing), '_rels', posixpath.basename(drawing) + '.rels')
                if drel not in names:
                    continue
                for m in E.fromstring(z.read(drel)):
                    name = posixpath.normpath(posixpath.join(posixpath.dirname(drawing), m.get('Target')))
                    if 'media/' not in name or name not in names:
                        continue
                    try:
                        blob = z.read(name)
                        w, h = Image.open(io.BytesIO(blob)).size
                    except Exception:
                        continue
                    if min(w, h) >= 100 and max(w, h) / min(w, h) < 6:
                        out.append((w * h, name, blob))
    return sorted(out, key=lambda t: -t[0])


sources = {r['id']: r for r in json.loads((ROOT / 'data/off-sunny-web/batch-four-sources.json').read_text(encoding='utf-8'))['records']}
feed = []
for page in range(1, 9):
    data = json.loads(get(f'{SITE}/products.json?limit=250&page={page}', TMP / f'feed-{page}.json'))
    feed += data.get('products', [])
    if len(data.get('products', [])) < 250:
        break
products = {}
for p in feed:
    for v in p.get('variants', []):
        if v.get('sku'):
            products.setdefault(norm(v['sku']), (p, v))
print('FEED', len(feed), flush=True)

results = []
for i, row in enumerate(rows):
    sku, ident = row['sku'], row['id']
    e = {'id': ident, 'sku': sku, 'sourceFile': row['sourceFile'], 'checkedAt': '2026-11-06', 'productUrl': None, 'guidePage': None, 'manualUrl': None,
         'assemblyUrl': None, 'imageUrl': '', 'imageAvailability': 'unavailable', 'imageEvidence': None, 'evidence': [], 'errors': []}
    variant_image = None
    pv = products.get(norm(sku))
    if not pv:
        try:
            q = urllib.parse.urlencode({'q': sku, 'resources[type]': 'product', 'resources[limit]': 5, 'resources[options][unavailable_products]': 'show'})
            found = json.loads(get(f'{SITE}/search/suggest.json?{q}', TMP / f'{ident}-search.json')).get('resources', {}).get('results', {}).get('products', [])
            for c in found[:3]:
                u = SITE + c['url'].split('?')[0]
                p = json.loads(get(u + '.js', TMP / f"{ident}-p-{hashlib.sha1(c['handle'].encode()).hexdigest()[:10]}.json"))
                v = next((v for v in p.get('variants', []) if norm(v.get('sku')) == norm(sku)), None)
                if v:
                    pv = (p, v)
                    break
        except Exception as x:
            e['errors'].append({'productSearch': str(x)})
    if pv:
        p, v = pv
        e['productUrl'] = f"{SITE}/products/{p['handle']}?variant={v['id']}"
        e['evidence'].append({'product': 'exact variant SKU', 'sku': v['sku']})
        img = (v.get('featured_image') or {}).get('src')
        if not img and len(p.get('variants', [])) == 1:
            imgs = p.get('images') or []
            first = imgs[0] if imgs else p.get('featured_image')
            img = first.get('src') if isinstance(first, dict) else first
        variant_image = img
    slug = sku.lower().replace('no. ', 'no-').replace('no.', 'no-')
    guide_image = None
    for gi, slugged in enumerate(dict.fromkeys([slug.replace(' ', '-'), slug.replace(' ', '')])):
        u = f'{SITE}/blogs/assembly-guides/{slugged}'
        try:
            s = get(u, TMP / f'{ident}-guide{gi}.html').decode('utf-8', 'replace')
        except urllib.error.HTTPError as x:
            if x.code == 429:
                e['errors'].append({'page': u, 'error': '429'})
            else:
                e['evidence'].append({'guideMissing': u, 'status': x.code})
            continue
        except Exception as x:
            e['errors'].append({'page': u, 'error': str(x)})
            continue
        h = re.search(r'<h1\b[^>]*>(.*?)</h1>', s, re.S | re.I)
        heading = html.unescape(re.sub('<[^>]+>', '', h[1])).strip() if h else ''
        if not norm(heading).startswith(norm(sku) + 'USERMANUAL'):
            e['evidence'].append({'guideHeadingMismatch': heading[:80], 'page': u})
            continue
        e['guidePage'] = u
        e['evidence'].append({'guideHeading': heading})
        meta = re.search(r'(?:let|const|var)\s+_metaJson\s*=\s*\{(.*?)\}', s, re.S)
        m = re.search(r'\ben\s*:\s*["\'](https?[^"\']+)["\']', meta[1]) if meta else None
        if m and '.pdf' in m[1].lower():
            e['manualUrl'] = html.unescape(m[1])
        else:
            pdfs = re.findall(r'https?[^\s"\'<>]+\.pdf[^\s"\'<>]*', s)
            exact = [x for x in pdfs if norm(sku) in norm(x.split('/')[-1])]
            if exact:
                e['manualUrl'] = html.unescape(exact[0])
        for video in re.findall(r'<iframe\b[^>]*(?:src|data-src)=["\']([^"\']+)', s, re.I):
            y = re.search(r'youtube(?:-nocookie)?\.com/embed/([A-Za-z0-9_-]{11})', video)
            if y:
                e['assemblyUrl'] = 'https://www.youtube.com/watch?v=' + y[1]
                break
        pos = s.find('class="user-manual-pdf"')
        tag = re.search(r'<img\b[^>]*>', s[pos:pos + 3000], re.S | re.I) if pos >= 0 else None
        src = re.search(r'(?:data-src|src)=["\']([^"\']+)', tag[0]) if tag else None
        if src and not src[1].startswith('data:'):
            guide_image = html.unescape(src[1])
        break
    # Confirm each link opens before recording it as verified.
    if e['manualUrl']:
        try:
            req = urllib.request.Request(e['manualUrl'], headers={'User-Agent': 'Mozilla/5.0', 'Range': 'bytes=0-7'})
            with urllib.request.urlopen(req, timeout=30) as r:
                if not r.read(8).startswith(b'%PDF'):
                    raise ValueError('not a PDF')
            e['evidence'].append({'manualOpened': True})
        except Exception as x:
            e['errors'].append({'manual': str(x), 'url': e['manualUrl']})
            e['manualUrl'] = None
    if e['assemblyUrl']:
        try:
            q = urllib.parse.urlencode({'url': e['assemblyUrl'], 'format': 'json'})
            title = json.load(urllib.request.urlopen(f'https://www.youtube.com/oembed?{q}', timeout=30)).get('title', '')
            e['evidence'].append({'videoTitle': title})
            named = re.findall(r'SF-?[A-Z]*\d{3,}[A-Z0-9]*', title.upper())
            if named and not any(norm(sku).startswith(norm(n)) or norm(n).startswith(norm(sku)) for n in named):
                e['errors'].append({'videoTitleNamesOtherModel': title})
                e['assemblyUrl'] = None
        except Exception as x:
            e['errors'].append({'video': str(x), 'url': e['assemblyUrl']})
            e['assemblyUrl'] = None
    raw = None
    for url, region, page in [(guide_image, 'user-manual page product image', e['guidePage']), (variant_image, 'exact-variant product image', e['productUrl'])]:
        if url and raw is None:
            url = 'https:' + url if url.startswith('//') else url
            try:
                raw = get(url, TMP / f'{ident}-{hashlib.sha1(url.encode()).hexdigest()[:8]}.img')
                e['imageAvailability'] = 'official-website'
                e['imageEvidence'] = {'page': page, 'sourceUrl': url, 'region': region}
            except Exception as x:
                e['errors'].append({'image': str(x), 'url': url})
    if raw is None:
        media = sheet_media(SRC / row['sourceFile'], sources[ident]['sheet'])
        if media:
            raw = media[0][2]
            e['imageAvailability'] = 'spec-sheet'
            e['imageEvidence'] = {'sourceFile': row['sourceFile'], 'sheet': sources[ident]['sheet'], 'object': media[0][1], 'otherObjects': [m[1] for m in media[1:6]]}
    if raw:
        try:
            target = save_image(raw, ident)
            e['imageUrl'] = '/api/catalog-images/off-sunny-web/' + target.name
            e['imageEvidence']['sha256'] = hashlib.sha256(target.read_bytes()).hexdigest()
        except Exception as x:
            e['errors'].append({'imageDecode': str(x)})
            e['imageAvailability'] = 'unavailable'
            e['imageEvidence'] = None
    e['status'] = 'pending' if any('429' in json.dumps(x) or 'timed out' in json.dumps(x) for x in e['errors']) else 'verified'
    results.append(e)
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(i + 1, sku, 'P' if e['productUrl'] else '-', 'M' if e['manualUrl'] else '-', 'V' if e['assemblyUrl'] else '-', e['imageAvailability'], e['status'], flush=True)
print('COUNTS products', sum(bool(x['productUrl']) for x in results), 'manuals', sum(bool(x['manualUrl']) for x in results), 'videos', sum(bool(x['assemblyUrl']) for x in results),
      'official', sum(x['imageAvailability'] == 'official-website' for x in results), 'sheet', sum(x['imageAvailability'] == 'spec-sheet' for x in results), 'pending', sum(x['status'] == 'pending' for x in results), flush=True)
