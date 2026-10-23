# Sunny Product Finder

Private treadmill catalog with a single-file UI and a Cloudflare Worker API. Items persist in D1; uploaded pictures persist in R2. The private Sites access policy protects the app, and API writes additionally require the platform-provided signed-in user identity. CSV downloads use the browser.

The app uses the catalog and interface from GitHub repository steveh00898/SS at commit 18d984479d00ac6ae0ed88356d1bb4b4cd216544. There are 156 entries across 11 categories, including 23 treadmills. Product pictures are fetched from that pinned GitHub snapshot and cached in R2. The browser receives same-origin image URLs.

Catalog records are imported once, preserving existing records and subsequent edits. Existing sample rows are removed only when their names still identify them as samples. Three cross-category products retain distinct IDs even though their SKUs overlap.
## Structure

- `app/index.html`: branded, responsive catalog UI with embedded Poppins and Roboto Condensed fonts. The header logo is the "SUNNY" wordmark taken from Sunny Brand Guidelines 2026 (vector from the guideline PDF): without "Health & Fitness" because the full lockup needs at least 250px, 120px wide (104px on phones, never under 100px), Sunny Red #E81D1D on the light header and solid white on the dark one. The page icon is the red 'S' badge.
- `server/worker.js`: same-origin catalog and image API; input validation, collision-safe SKU moves, identity checks and CSRF origin checks.
- `db/schema.ts` and `drizzle/`: database schema and generated migrations.
- `scripts/build.mjs`: creates the deployable Worker with embedded HTML.
- `work-fetch.py`: live Sunny retrieval, requested PIL cropping pipeline, and contact-sheet generation. Requires Pillow and access to Sunny and its image hosts.
- `tests/`: mocked UI checks and server integration checks. UI test data is read from the checked-in catalog.

## Commands

```sh
npm run preview          # latest app/index.html + checked-in catalog at http://localhost:4173 (no install needed)
npm run screenshots      # headless screenshots of that preview into preview-screenshots/ (needs Playwright + Chromium, as tests/ do)
npm run practice-report  # SKU practice results from both apps (practice-data/*.json), same numbers as the Progress view
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

The seven shared specification columns are sourced from the uploaded master portfolio. See `data/treadmill-specifications-notes.md` for the dimension interpretation, missing values, and independent tier rules. Open `/?category=Treadmills` for the comparison view.

## Shared specifications

All categories use the same seven specification columns; missing values display `-`. Treadmills, all 18 ellipticals and all 13 rowers include the available master-portfolio information. See `data/catalog-specifications-notes.md` for category-based tier rules and dimension handling.

## Column layout and specification editing

Drag the header grip to rearrange columns. Main product columns stay visible; specification eye icons collapse the body and label to a closed-eye header for restoration. Layout preferences are saved in this browser. The subtle Default columns order button sits at the right of the tier/Compare row and restores order while retaining visibility choices. Focused header grips also support Alt + arrow keys. SKU, picture and price remain frozen in their chosen relative order. Edit includes all seven specification fields, even hidden ones, supports blank values, and refreshes numeric tier metrics from edited descriptions.

## SKU practice

The **SKU Practice** and **Progress** buttons above the page title (also `?view=practice` and `?view=progress`) open a learning mode on top of the catalog.

- **Setup**: choose categories and what to practice (SKU, item name, price; any one, two or all three), optionally "Review missed items only".
- **Study cards**: a product at a time with picture, SKU, name and price; ‹ ›, arrow keys, mouse wheel and swipe move between cards.
- **Quiz**: endless until Stop. Each question shows the product photo and three choices per practiced field; with more than one field the choices form a table with one column each. Correct picks turn light green; a wrong pick turns light red and the right answer turns green. Keys 1–3 answer, Enter goes on. Stop shows a session summary.
- **What the question hides**: only the asked fields are hidden. Each catalog picture has `photoChecked` and `photoMasks` (`{sku,name,price}` boxes `[x,y,w,h]` as fractions of the picture) covering printed model numbers, product-type words and weight labels; the boxes for the asked fields are covered until the question is answered. A picture with `photoChecked` not true (for example a newly uploaded one) stays blurred until answered. Signed-in editors can add a box with **Hide part of photo**. Replacing a picture clears its masks.
- **Which items come up**: weighted by the last 8 answers for each product: unseen 3, under 75% `1 + 4 × (1 − accuracy)` plus 2 if the last answer was wrong, mastered (75%+ over at least 4 answers) 0.5; never the same product twice in a row. Wrong choices come from the same category first, then the rest of the catalog.
- **Progress**: answers, accuracy, days practiced, streak, mastered products; accuracy by field (most correct and most missed), daily accuracy chart (with a table view), by category, most missed and best known products; 7/30/90 days or all time. Export CSV, export a results file (JSON), import a results file, reset.
- **Storage**: one record per answered field `{id, at, sessionId, sku, itemId, category, field, correct, chosen, answer}`, private to the signed-in user. Private Site: table `practice_attempts` through `GET/POST/DELETE /api/practice` (POST takes up to 50 records). Claude Artifact: documents `data/users/<viewer id>/practice-<chunk>` (up to 400 records each) in the artifact database. The two apps keep separate histories.
- **Accounts (private Site)**: anyone the Site lets sign in gets their own progress, and can set the name the admin sees (Progress → Your name; table `practice_users`). Admins are set with the Worker settings `ADMIN_USER_IDS` and/or `ADMIN_EMAILS` (comma-separated), or a `catalog_meta` row `admins` = `{"userIds":[…],"emails":[…]}`; emails match only if the platform sends `oai-authenticated-user-email`. Admins get an **Accounts** view (every learner's answers, accuracy by field, mastered, streak, last practiced; open one for their full progress; CSV of everyone) from `GET /api/practice/accounts`. Once an admin is set, only admins can change the catalog; with none set, every signed-in user can (the owner-only Site as before). The Claude Artifact has no accounts: outside visitors can view it but can't save.
- **For agents**: each agent exports its own app's results to `practice-data/` (`claude-artifact.json` from Claude Code, `private-site.json` from Codex; see `practice-data/README.md`), then `npm run practice-report` merges them and prints the same numbers as the Progress view.
