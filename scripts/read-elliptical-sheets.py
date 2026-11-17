import argparse
import collections
import importlib.util
import json
import pathlib
import re

repo = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description="Read elliptical spec sheets and the ISV SHF worksheet.")
parser.add_argument("folder", type=pathlib.Path)
parser.add_argument("isv", type=pathlib.Path)
parser.add_argument("output", type=pathlib.Path)
args = parser.parse_args()
spec = importlib.util.spec_from_file_location('tread', repo / 'scripts/rebuild-treadmill-specs.py')
t = importlib.util.module_from_spec(spec)
spec.loader.exec_module(t)
base = args.folder
catalog = [row for path in [repo/'data/ellipticals.json', repo/'data/off-sunny-web/items.json']
           for row in json.loads(path.read_text(encoding='utf-8')) if row['category'] == 'Ellipticals']
models = {t.MODEL(row['sku']) for row in catalog}
all_models = {t.MODEL(row['sku']) for path in [*sorted((repo/'data').glob('*.json')),repo/'data/off-sunny-web/items.json']
              for row in json.loads(path.read_text(encoding='utf-8'))}
index = collections.defaultdict(list)
errors = []
for path in base.rglob('*'):
    if not path.is_file() or path.name.startswith('~$') or path.suffix.lower() not in {'.xlsx','.xls','.docx'}:
        continue
    name = path.relative_to(base).as_posix()
    try:
        sheets = t.b3.read_sources(base, [{'sourceFile': name}])[name]
    except Exception as exc:
        errors.append([name, type(exc).__name__, str(exc)])
        continue
    named = set()
    for sheet in sheets:
        found = set()
        for row in sheet['rows']:
            for i, (_, text) in enumerate(row[:-1]):
                if t.N(text) in t.fill.MODEL_LABELS and len(row[i+1][1]) < 80:
                    clean = re.sub(r'[（(\[][^）)\]]*[）)\]]', '', row[i+1][1])
                    found.update(t.MODEL(v) for v in re.split(r'[/,;&]|\band\b',clean))
        named.update(found)
        sheet['models'] = sorted(found & models)
    if not named & all_models:
        lead = re.match(r'\s*(?:spec(?:ification)?\s+(?:sheet\s+)?(?:for\s+)?)?((?:[A-Za-z]{1,3}[ -]?[A-Za-z]*|No\.\s*)?\d[\w-]*(?:\s+SMART)?)', path.stem, re.I)
        model = t.MODEL(lead[1]) if lead else ''
        if model in models:
            candidates = [s for s in sheets if sum(1 for row in s['rows'] if t.N(row[0][1]) in {'brand','grossweight','netweight','resistancetype','stride','stridelength','productweight'}) >= 2]
            if candidates:
                candidates[0]['models'].append(model)
    matching = [s for s in sheets if s['models']]
    if not matching:
        continue
    boxes = t.checkboxes(path) if path.suffix.lower() == '.xlsx' else {}
    for sheet in matching:
        sheet['checks'] = boxes.get(sheet['name'], {})
        for model in sheet['models']:
            index[model].append({'file':name, 'mtime':path.stat().st_mtime, **sheet})

for entries in index.values():
    entries.sort(key=lambda row:(-row['mtime'],row['file'],row['name']))
actual = t.b3.read_sources(args.isv.parent,[{'sourceFile':args.isv.name}])[args.isv.name]
shf = next(s for s in actual if s['name']=='SHF')['rows']
out = {'catalog':catalog,'files':index,'isv':shf,'errors':errors}
(args.output).write_text(json.dumps(out,ensure_ascii=False),encoding='utf-8')
print('catalog',len(catalog),'models',len(models),'with sheets',len(index),'read errors',len(errors))
for row in catalog:
    model = t.MODEL(row['sku'])
    if not index.get(model):
        print('NO SHEET',row['sku'])
        continue
    entry = index[model][0]
    if entry['checks']:
        print('CHECKBOX',row['sku'],entry['file'],sum(any(v for _,v in boxes) for boxes in entry['checks'].values()))
