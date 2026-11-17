"""Checkbox form controls in .xlsx spec sheets.

Older spec-sheet forms answer YES/NO rows with Excel checkbox controls. The controls live in the sheet's
legacy VML drawing, not in the cells, so a cell reader sees an empty answer. checkboxes(path) returns
{sheet name: {Excel row number: [(label, checked), ...]}}, left to right.
"""
import posixpath, re, zipfile

REL = re.compile(r'<Relationship [^>]*?Id="([^"]+)"[^>]*?Target="([^"]+)"|<Relationship [^>]*?Target="([^"]+)"[^>]*?Id="([^"]+)"')


def _rels(z, part):
    folder, name = posixpath.split(part)
    path = posixpath.join(folder, '_rels', name + '.rels')
    if path not in z.namelist():
        return {}
    out = {}
    for m in REL.finditer(z.read(path).decode('utf-8', 'replace')):
        rid, target = (m.group(1), m.group(2)) if m.group(1) else (m.group(4), m.group(3))
        out[rid] = posixpath.normpath(posixpath.join(folder, target)) if not target.startswith('/') else target.lstrip('/')
    return out


def _text(s):
    s = re.sub(r'<br\s*/?>', ' ', s)
    s = re.sub(r'<[^>]+>', '', s)
    for a, b in (('&amp;', '&'), ('&lt;', '<'), ('&gt;', '>'), ('&quot;', '"'), ('&#39;', "'"), ('&nbsp;', ' ')):
        s = s.replace(a, b)
    return re.sub(r'\s+', ' ', s).strip()


def checkboxes(path):
    out = {}
    try:
        z = zipfile.ZipFile(path)
    except (zipfile.BadZipFile, OSError):
        return out
    with z:
        if 'xl/workbook.xml' not in z.namelist():
            return out
        wb = z.read('xl/workbook.xml').decode('utf-8', 'replace')
        wbrels = _rels(z, 'xl/workbook.xml')
        for m in re.finditer(r'<sheet\b[^>]*>', wb):
            tag = m.group(0)
            name = re.search(r'name="([^"]*)"', tag); rid = re.search(r'r:id="([^"]*)"', tag)
            if not (name and rid) or rid.group(1) not in wbrels:
                continue
            part = wbrels[rid.group(1)]
            if part not in z.namelist():
                continue
            xml = z.read(part).decode('utf-8', 'replace')
            legacy = re.search(r'<legacyDrawing [^>]*r:id="([^"]+)"', xml)
            vml = legacy and _rels(z, part).get(legacy.group(1))
            if not vml or vml not in z.namelist():
                continue
            rows = {}
            for shape in re.findall(r'<v:shape\b.*?</v:shape>', z.read(vml).decode('utf-8', 'replace'), re.S):
                if not re.search(r'ObjectType="Checkbox"', shape):
                    continue
                anchor = re.search(r'<x:Anchor>(.*?)</x:Anchor>', shape, re.S)
                if not anchor:
                    continue
                col, dx, top, dy, col2, dx2, bottom, dy2 = [int(x) for x in re.findall(r'-?\d+', anchor.group(1))[:8]]
                row = top + (1 if dy >= 10 and bottom > top else 0)  # the row holding most of the box (0-based)
                box = re.search(r'<v:textbox\b.*?</v:textbox>', shape, re.S)
                label = _text(box.group(0)) if box else ''
                checked = re.search(r'<x:Checked>\s*(\d)\s*</x:Checked>', shape)
                rows.setdefault(row + 1, []).append((col, dx, label, bool(checked and checked.group(1) != '0')))
            out[name.group(1)] = {r: [(l, c) for _, _, l, c in sorted(v)] for r, v in rows.items()}
    return out
