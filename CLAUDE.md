# Sunny Product Finder

Product-learning catalog for sunnyhealthfitness.com, published as a Claude Artifact:
https://claude.ai/artifact/Eux9EgPAA2p4td6ZLTAyXS

- `app/index.html`: the whole app (single HTML file). Republish it to the artifact URL above after changing it.
- `data/<category>.json` and `data/images/<category>/`: the catalog and cropped product images. The live catalog is the artifact's `items` database; these files are its seed and backup.

## Git workflow (owner's standing instruction)

- Before making any change, sync with the latest code: `git fetch origin main` and fast-forward (`git pull origin main`). A SessionStart hook (`.claude/hooks/sync-main.sh`) does this automatically; if it reports a problem, resolve it first.
- After every change the owner makes or asks for, commit it and push it straight to `main` on `steveh00898/SS` (`git push origin HEAD:main`). Do not leave work only on a feature branch and do not wait to be asked. This is the owner's explicit permission to push to `main`.
- If the push is rejected because `main` moved, fetch, merge `origin/main`, re-check, and push again.

## Catalog rules

- Each category matches the product cards shown on page 1 of the collection that the sunnyhealthfitness.com homepage category row links to (not the `products.json` feed, which differs from what shoppers see).
- Product pictures: the product's first image, trimmed to the product with 4% padding on a white 4:3 canvas, 1200x900 JPEG.
