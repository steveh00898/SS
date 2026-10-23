# Practice data

SKU practice results exported from each app, so every agent can report on all of them with `npm run practice-report` (add `-- --md` to also write `report.md` here, `-- --days 30` for a time range).

| File | Comes from | Who updates it |
|---|---|---|
| `claude-artifact.json` | Claude Artifact, the viewer's `data/users/<id>/practice-*` documents | Claude Code |
| `private-site.json` | Private Site, D1 table `practice_attempts` (`GET /api/practice` as the owner) | Codex |

Format (the same as the app's **Export results file** on the Progress page):

```json
{"kind":"sku-practice-results","version":1,"source":"claude-artifact","exportedAt":"2026-10-23T18:00:00.000Z",
 "records":[{"id":"…","at":"2026-10-23T17:59:01.000Z","sessionId":"…","sku":"SF-T724081","itemId":"sf-t724081","category":"Treadmills","field":"sku","correct":true,"chosen":"SF-T724081","answer":"SF-T724081"}]}
```

Each export replaces the whole file with the app's current results (records are never edited, only added or reset). The files hold product answers and times only: no user ids, names or emails. This repository is public, so anything here is visible to anyone.

An agent that cannot read its app's database can ask the owner to use **Progress → Export results file** in that app and save the file here under the right name. **Import results** on the Progress page loads a file from the other app, so one app can show the full history; records already there are skipped.
