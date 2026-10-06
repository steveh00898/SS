# Sunny Product Finder

Private treadmill catalog with a single-file UI and a Cloudflare Worker API. Items persist in D1; uploaded pictures persist in R2. The private Sites access policy protects the app, and API writes additionally require the platform-provided signed-in user identity. CSV downloads use the browser.

The current catalog starts with three clearly labeled sample items and example prices. Sunny's live endpoint is blocked by the authoring environment's network policy, so the real products have not been imported. Samples are initialized once, and deleting them does not recreate them. No real 23-row count is claimed.

## Structure

- `app/index.html`: branded, responsive catalog UI with embedded Poppins and Roboto Condensed fonts.
- `server/worker.js`: same-origin catalog and image API; input validation, collision-safe SKU moves, identity checks and CSRF origin checks.
- `db/schema.ts` and `drizzle/`: database schema and generated migrations.
- `scripts/build.mjs`: creates the deployable Worker with embedded HTML.
- `work-fetch.py`: live Sunny retrieval, requested PIL cropping pipeline, and contact-sheet generation. Requires Pillow and access to Sunny and its image hosts.
- `tests/`: mocked UI checks and server integration checks. Mock fixtures are test-only.

## Commands

```sh
npm install
npm run db:generate
npm run build
node tests/catalog.spec.cjs
node tests/server.spec.cjs
```

Generated migration SQL and metadata must be preserved after deployment. The generated Worker exports a default object with a fetch handler. Database and picture storage use logical bindings DB and BUCKET.

## Catalog behavior

Search matches name or SKU while ignoring dashes. Suggestions support keyboard selection. Sorting keeps unknown prices last. Add and edit share a modal; delete requires an in-page confirmation. Bulk edits retain drafts through filtering, highlight changes, validate all rows before saving and show progress. A partial network failure preserves remaining drafts for retry. SKU changes use an atomic, uniqueness-checked database update. Picture uploads are restricted to JPEG, PNG and WebP up to 10 MB. CSV export includes the currently shown saved items.

Catalog changes refresh after each write and are checked every ten seconds while the page is visible. This polling replaces a platform-specific subscription. AI browser actions for search and opening the add form are feature-detected.

## Live import

Once source access is available, run `python work-fetch.py`, inspect the contact sheet, upload processed JPEGs through `/api/assets`, and save the rows through the catalog API. Confirm the live feed count rather than truncating or fabricating records to reach an expected count. API writes require a signed-in user. Only treadmills are in scope.
