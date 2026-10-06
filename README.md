# Sunny Product Finder

Private treadmill catalog with a single-file UI and a Cloudflare Worker API. Items persist in D1; uploaded pictures persist in R2. The private Sites access policy protects the app, and API writes additionally require the platform-provided signed-in user identity. CSV downloads use the browser.

The app uses the catalog and interface from GitHub repository steveh00898/SS at commit 18d984479d00ac6ae0ed88356d1bb4b4cd216544. There are 156 entries across 11 categories, including 23 treadmills. Product pictures are fetched from that pinned GitHub snapshot and cached in R2. The browser receives same-origin image URLs.

Catalog records are imported once, preserving existing records and subsequent edits. Existing sample rows are removed only when their names still identify them as samples. Three cross-category products retain distinct IDs even though their SKUs overlap.
## Structure

- `app/index.html`: branded, responsive catalog UI with embedded Poppins and Roboto Condensed fonts.
- `server/worker.js`: same-origin catalog and image API; input validation, collision-safe SKU moves, identity checks and CSRF origin checks.
- `db/schema.ts` and `drizzle/`: database schema and generated migrations.
- `scripts/build.mjs`: creates the deployable Worker with embedded HTML.
- `work-fetch.py`: live Sunny retrieval, requested PIL cropping pipeline, and contact-sheet generation. Requires Pillow and access to Sunny and its image hosts.
- `tests/`: mocked UI checks and server integration checks. UI test data is read from the checked-in catalog.

## Commands

```sh
npm install
npm run db:generate
npm run build
node tests/github-ui.spec.cjs
node tests/server.spec.cjs
```

Deployment archives include the generated drizzle directory at the archive root alongside the Worker output. Generated migration SQL and metadata must be preserved after deployment. The generated Worker exports a default object with a fetch handler. Database and picture storage use logical bindings DB and BUCKET.

## Catalog behavior

Search matches name or SKU while ignoring dashes. Suggestions support keyboard selection. Sorting keeps unknown prices last. Add and edit share a modal; delete requires an in-page confirmation. Bulk edits retain drafts through filtering, highlight changes, validate all rows before saving and show progress. A partial network failure preserves remaining drafts for retry. SKU changes use an atomic, uniqueness-checked database update. Picture uploads are restricted to JPEG, PNG and WebP up to 10 MB. CSV export includes the currently shown saved items.

Catalog changes refresh after each write and are checked every ten seconds while the page is visible. This polling replaces a platform-specific subscription. AI browser actions for search are feature-detected.

## Live import

Once source access is available, run `python work-fetch.py`, inspect the contact sheet, upload processed JPEGs through `/api/assets`, and save the rows through the catalog API. Confirm the live feed count rather than truncating or fabricating records to reach an expected count. API writes require a signed-in user. The catalog includes all categories present in the GitHub snapshot.

## Treadmill comparison

The seven treadmill-only columns are sourced from the uploaded master portfolio. See `data/treadmill-specifications-notes.md` for the dimension interpretation, missing values, and independent tier rules. Open `/?category=Treadmills` for the comparison view.
