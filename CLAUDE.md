# Sunny Product Finder

Product-learning catalog for sunnyhealthfitness.com, published as a private web app:
https://sunny-product-finder.steven-peace.chatgpt.site

- `app/index.html`: single-file catalog interface, using the private app API.
- `server/worker.js`, `db/`, `drizzle/`: persistent catalog and picture storage.
- `data/<category>.json` and `data/images/<category>/`: checked-in catalog and cropped product pictures.
- `data/treadmill-specifications-notes.md`: source, missing-data treatment and independent tier rules for the treadmill comparison.
- Publish app changes to the existing private Site using `.openai/hosting.json`; keep the current access policy.
- The same `app/index.html` is also published as a Claude Artifact (https://claude.ai/artifact/Eux9EgPAA2p4td6ZLTAyXS). It detects which one it runs in: the private Site's same-origin `/api`, or the artifact's `window.claude` runtime (its catalog lives in the artifact's `items` database). After changing the app or the catalog, update both.

## Git workflow (owner's standing instruction)

- Before making any change, sync with the latest code: `git fetch origin main` and fast-forward (`git pull origin main`). A SessionStart hook (`.claude/hooks/sync-main.sh`) does this automatically; if it reports a problem, resolve it first.
- After every change the owner makes or asks for, commit it and push it straight to `main` on `steveh00898/SS` (`git push origin HEAD:main`). Do not leave work only on a feature branch and do not wait to be asked. This is the owner's explicit permission to push to `main`.
- If the push is rejected because `main` moved, fetch, merge `origin/main`, re-check, and push again.

## Catalog rules

- Each category matches the product cards shown on page 1 of the collection that the sunnyhealthfitness.com homepage category row links to (not the `products.json` feed, which differs from what shoppers see).
- Product pictures: the product's first image, trimmed to the product with 4% padding on a white 4:3 canvas, 1200x900 JPEG.
