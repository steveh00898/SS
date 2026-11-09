"""Owner decision 2026-11-09: where the newest spec sheet differs from the app, use the spec sheet value.

Usage: python scripts/apply-spec-conflicts.py
Reads the differences in data/specifications/master-fill-audit.json, writes each spec sheet value with its cell
evidence, keeps the replaced app value in the record's notes, and moves the entries to 'appliedConflicts'.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
AUDIT = ROOT / 'data/specifications/master-fill-audit.json'
audit = json.loads(AUDIT.read_text(encoding='utf-8'))
todo = audit.get('conflicts', [])
paths = sorted((ROOT / 'data').glob('*.json')) + [ROOT / 'data/off-sunny-web/items.json']
for p in paths:
    raw = p.read_text(encoding='utf-8'); items = json.loads(raw); indent = len(raw.split('\n')[1]) - len(raw.split('\n')[1].lstrip()); changed = False
    for r in items:
        for c in [c for c in todo if c['id'] == r['id']]:
            sd = r['specDetails']; assert sd['values'][c['field']] == c['app'], c
            sd['values'][c['field']] = c['specSheet']; sd.setdefault('evidence', {})[c['field']] = c['evidence']
            src = c['evidence'].split(' / ')[0]
            if src not in sd.setdefault('sources', []): sd['sources'].append(src)
            sd.setdefault('notes', []).append('2026-11-09 owner decision: ' + c['field'] + ' uses the newest spec sheet value; replaced app value: ' + str(c['app']))
            changed = True
    if changed:
        p.write_bytes((json.dumps(items, ensure_ascii=False, indent=indent) + '\n').encode('utf-8'))
audit['appliedConflicts'] = audit.get('appliedConflicts', []) + todo
audit['conflicts'] = []
AUDIT.write_text(json.dumps(audit, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print('applied', len(todo))
