# Handoff log

Newest entry first. Each agent adds one entry per completed task (format in AGENTS.md); older entries are never rewritten.

## 2026-10-30: Claude Code — Claude Artifact: owner links to the Site's Accounts, Public Usage Analysis and Feedback
- Changes: the owner noticed Accounts, Public Usage Analysis and the Feedback button are missing on the Claude link. They are Site-only on purpose: outside visitors can't save anything in the Artifact, so local copies would stay empty. The owner chose links. In the Claude Artifact only, when `user.isOwner()` is true:
  - The section menu shows "Accounts ↗" and "Public Usage Analysis ↗"; they open `https://sunny-product-finder.steven-peace.chatgpt.site/?view=accounts|usage` in a new tab.
  - "Feedback ↗" opens the Site's Public Usage Analysis, where visitor feedback is listed.
  - Non-owners see none of these.
  - Deep links `?view=accounts|usage` on the Artifact fall back to the catalog without opening the Site.
  - The private Site's behaviour is unchanged: `pr.siteLinks` is only set in the Artifact runtime.
- Files: app/index.html, tests/artifact-site-links.spec.cjs (new), HANDOFF.md
- Tests: all 19 tests/*.spec.cjs passed; `npm run build` passed.
- Local preview: checked through the new Artifact-runtime test (owner and non-owner).
- Claude Artifact: to be republished from this commit.
- Private Site: PUBLIC version 35 from 0f485ee. This change has no effect on the Site, but its app code differs from main until Codex next publishes.
- Practice data: not re-exported (no change).
- Remaining issues: the Site URL is written in app/index.html; update it if the Site address changes.
- Next steps: Codex runs "git pull".

## 2026-10-30: Claude Code — git pull: Off Sunny web pilot synced to the Claude Artifact (version 22)
- Changes: reviewed Codex commits 2f1dd8a, f42a0f4, ebd6eb7, 7fddc9f, 0f485ee, 7088dc1. They match their HANDOFF entries:
  - 10 V3 reference products as a separate `off-sunny-web` catalog source.
  - Source selector (Current website 156 / Off Sunny web 10 / All 166).
  - "Image" column wording; official-first images; the Worker packages the images.
  - New AGENTS.md image-priority rule.
  - `/api` and the `window.claude` fallback are intact, and the Artifact boot mapping keeps `catalogSource` and `sourceFile`.
  - New tests add coverage; no assertion was weakened.
- Claude Artifact data:
  - Uploaded the 10 `data/images/off-sunny-web/*-official-v1.jpg` files to the Artifact asset store.
  - Created the 10 `off-sunny-*` item documents from `data/off-sunny-web/items.json` (none existed before; checked first). Every field is identical to the repository, except `imageAssetId` and `imageUrl` (`/_blob/<id>`), because the Artifact cannot serve `/api/catalog-images/...`.
  - The 156 current records are untouched. Read back all 10: 0 field mismatches.
- Files: HANDOFF.md
- Tests: all 18 tests/*.spec.cjs passed. `npm run build` passed; `npm run screenshots` passed (14 PNGs). Preview `?source=off-sunny-web`: 10 rows, all 10 images decoded on desktop, no page errors.
- Local preview: checked.
- Claude Artifact: published version 22 from 7088dc1.
- Private Site: PUBLIC version 35 from 0f485ee (Codex); same app code as main.
- Practice data: not re-exported (no change).
- Remaining issues: none. For future off-Sunny imports, Claude Code must again upload the images to Artifact assets; data/*.json image paths for that source point to Site routes.
- Next steps: none.

## 2026-10-30: Codex — official-first image refresh published as version 35
- Changes: all ten pilot models now use verified official images; 7150 image available and 8730G gold image correct. Official-first -> spec sheet -> unavailable rule recorded in AGENTS.md. Source group/category/specs/prices/product links unchanged. Repaired v34 current-image build-path regression.
- Files: HANDOFF.md release record.
- Tests: 18 suites passed; standard/import captures and source contact sheet checked; packaged Worker route/bytes check passed. Live headless Chrome decoded all ten 1200px official images and verified 156 current-view rows plus a current product image. In-app browser binding failed with browser.user unavailable; headless live verification succeeded. Read all live DB rows: 166 total, ten versioned official image URLs, original current 156 strings unchanged.
- Local preview: checked; live screenshot at work/outputs/official-images-live.png.
- Claude Artifact: not published; Claude Code must sync official asset metadata, AGENTS rule and source before republishing.
- Private Site: PUBLIC version 35 from exact main SHA 0f485eedb20d50f6cee3be1476c0a894cc646b15; deployment appgdep_6ae5295767bc81919b641f36c5a3c5e6 succeeded; public audience/admin environment revision 1 unchanged.
- Practice data: not exported (public repository permission pending).
- Remaining issues: source grouping retained even when official product/support pages exist; no sales-status inference.
- Next steps: refresh Off Sunny web catalog; future imports follow AGENTS image priority.

## 2026-10-30: Codex — official-first images for all ten pilot models
- Changes: searched Sunny by each exact SKU/model, checked product variant SKUs (eight models) and exact-model official assembly pages (SF-B2715/SF-E3875). All ten now use official images; 7150 gains an image and 8730G gains the gold variant. Shared mat image is explicitly assigned to both matching variants. Rejects CB110S/SMART/accessory near matches. No catalog-source/category/spec/price/product-link changes. Sheet assets retained as fallback. AGENTS.md now requires official exact-model search first, sheet extraction second, Image unavailable last for every offsite import; record provenance and preserve user uploads.
- Files: AGENTS.md, data/off-sunny-web/items.json/official-images.json/README.md, ten versioned image assets, scripts/build.mjs, server/worker.js, three image/import tests and fixture, HANDOFF.md.
- Safety: read all 166 live records before editing; nine known sheet image paths and one empty 7150 image, no custom uploads. Guarded one-time upgrade replaces only known previous sheet URLs or empty fields; preserves custom assets/URLs. Versioned paths avoid stale image caches. Practice text masks checked; 7150 model/name panel covered.
- Tests: existing 17 suites passed; new packaged-build image suite passed (18 total). Standard and offsite desktop/phone captures generated/checked. Exact bytes, exact-SKU variant selection evidence, ten decoded images, legacy-image replacement and custom-upload preservation verified. Found/fixed a v34 packaging regression where broad filename replacement also changed current image paths; restored product-id paths and added built-Worker test verifying current external-fetch path and embedded official bytes.
- Local preview: checked; all ten official source images visually inspected in contact sheet.
- Claude Artifact: not published; Claude Code must sync new assets/metadata and AGENTS rule, then republish.
- Private Site: publication pending from this pushed commit; public access/admin environment unchanged.
- Practice data: not exported (public repository permission pending).
- Remaining issues: finding official product/support pages does not independently establish current sale/discontinued status; retained user's source grouping. Mat variants share official product image. No unsupported substitute images.
- Next steps: publish and verify all ten live images plus current-image routing.

## 2026-10-30: Codex — spec-sheet images published as version 34
- Changes: Image column/CSV wording; nine extracted original product images; 7150 Image unavailable. Both 8730 sheets share the same silver image, kept as supplied. Unrelated workbook diagrams not imported.
- Files: HANDOFF.md release record.
- Tests: all 17 suites passed, plus practice/offsite UI suites after final source-scoped practice adjustment. Standard and import-specific desktop/phone captures checked; Worker/archive build passed. Live UI confirms Image header, nine decoded images and sole 7150 unavailable label. Read all 166 live DB rows: nine archive images, original 156 data strings unchanged.
- Local preview: checked; live offsite catalog opened and retained for user.
- Claude Artifact: not published; Claude Code must sync archive images/canonical metadata and publish latest source.
- Private Site: PUBLIC version 34 from exact main SHA ebd6eb7a30c43269084857a37a63d5f008ac3edb; deployment appgdep_6ae526f6f73c81919a35735b43e5eb44 succeeded. Audience/admin environment revision 1 unchanged; no migrations.
- Practice data: not exported (public repository permission pending).
- Remaining issues: 7150 source has no embedded image; low-quality source images retained and 8730G silver image discrepancy documented.
- Next steps: refresh Off Sunny web catalog.

## 2026-10-30: Codex — embedded spec-sheet images for V3 pilot
- Changes: Picture column/layout label and CSV header renamed Image. Extracted/visually checked nine source product images: NO.074-L, NO.083, 8730, 8730G, NO.025, SF-B2715, CB110, SF-E3872, SF-E3875. 7150 Word file has no embedded image and displays Image unavailable; current 156 image data unchanged. XLS drawings reassembled from BIFF MSODRAWINGGROUP/CONTINUE records; unrelated template diagrams excluded. Both 8730 sheets supply the same silver treadmill image, retained without recoloring. Images fitted on white 1200x900 canvases, SHA-256/provenance in images.json. E3875 warehouse/frame labels masked only during practice.
- Delivery: Worker embeds JPEGs at build time and serves canonical image paths without GitHub runtime fetch. Preview serves the same paths. Guarded one-time backfill fills empty image/url fields only when offsite source/file match; custom existing URLs/uploads are never replaced. Source selector also scopes practice pool/category counts/distractors, so new photos do not mix sources by default. No migrations/access changes.
- Files: app/index.html, data/off-sunny-web/items.json/images.json/README.md, nine data/images/off-sunny-web/*.jpg, scripts/build.mjs, scripts/preview.mjs, server/worker.js, tests/off-sunny-web.spec.cjs, tests/sheet-images.spec.cjs, tests/usage-fixture.cjs, HANDOFF.md.
- Tests: all 17 suites passed; standard 14 captures generated. Import UI asserts nine fully decoded 1200px images, exactly one Image unavailable and Image header. Initial new assertions used a missing header data-key and did not account for existing reorder grip; corrected selector/assertion without reducing behavior checks. New server suite verifies exact JPEG bytes, missing-path 404, guarded upgrades, custom-upload preservation, practice masks and idempotency. After final practice-source adjustment, practice and offsite UI suites passed again; desktop/phone image captures checked.
- Local preview: checked with real Worker/SQLite integration and standard preview. Before editing, read all 166 live rows; ten offsite image fields were empty, no uploads to reconcile. V3 originals untouched.
- Claude Artifact: not published; fallback retained. Claude Code must sync canonical archive images/metadata and republish.
- Private Site: publication pending from this pushed commit; PUBLIC audience and existing secrets preserved.
- Practice data: not exported (public repository permission pending).
- Remaining issues: low source resolution/warehouse backgrounds retained; 8730G sheet's image matches 8730; 7150 unavailable. No generated substitute images.
- Next steps: publish, verify live nine images and current 156 preservation, record version/SHA.

## 2026-10-30: Codex — off Sunny web pilot published as version 33
- Changes: ten requested V3 reference records published with source selector and plain muted category annotation. Default current catalog remains 156; archive 10; combined 166.
- Files: HANDOFF.md release record.
- Tests: all 16 suites passed; standard preview captures passed with network permission after restricted localhost denial; import-specific desktop/phone checked. Worker/archive build and deployment succeeded. Opened live Site and verified source selector, all ten records, category grouping and specifications through visible UI. Live DB read confirms 166 rows/10 off-sunny-web; all original 156 data strings byte-identical to the pre-import read.
- Local preview: checked; live UI opened at ?source=off-sunny-web and All category selected.
- Claude Artifact: not published; currently version 21 from 9672157 per Claude handoff. Claude Code must sync archive records from nested canonical data/off-sunny-web/items.json (safe insert only), then publish latest app.
- Private Site: PUBLIC version 33 from exact main SHA 2f1dd8a461e27baaf0744101604d1ebff9ae3892; deployment appgdep_6ae523b15a808191b08280c34f2b2c2c succeeded. Existing public audience, admin environment revision 1 and databases retained; no migrations.
- Practice data: not exported (public repository permission pending).
- Remaining issues: no verified pictures/prices/product/manual/assembly links for this pilot; originals untouched. Adjustable DB import deferred because not in this explicit list.
- Next steps: review the ten records; additional source files require next selected batch.

## 2026-10-30: Codex — ten V3 off Sunny web reference products
- Changes: imported only the ten requested V3 files as separate off-sunny-web records (NO.074-L, NO.083, 7150, 8730, 8730G, NO.025, SF-B2715, CB110, SF-E3872, SF-E3875). Current website remains default 156; Off Sunny web 10; All products 166. Existing category types preserved; muted plain grey off Sunny web text below category label, no badge. Source selector works desktop/mobile, updates URL, scopes counts/search/suggestions/CSV/comparison; numeric tier cohorts keep current/offsite separate. CSV includes Catalog source. Archive IDs are namespaced; source metadata retained through edits and bulk saves. No exact overlaps in this batch; CB110 is distinct from current CB110S. Adjustable DB workbook is outside this explicit batch and not imported.
- Data: data/off-sunny-web/items.json plus per-file SHA-256/cell provenance and README; original source files untouched. Build/preview load archive alongside current canonical category files. One-time INSERT OR IGNORE upgrade adds only the archive records, keeps current rows unchanged and does not resurrect deleted records. No schema migrations.
- Limitations: prices, product URLs, pictures and resource guides are unavailable until verified; no fabricated links/prices. E3872's “no limit” user-weight phrase is not stored as unlimited safe capacity; source discrepancies documented. Mats, cadence sensor and doorway bar are Essentials. Both 8730 sheets label shared 8730/8730G; one record per requested model. Sources are internal company specification sheets, not a live website status claim.
- Files: app/index.html, scripts/build.mjs, scripts/preview.mjs, server/worker.js, data/off-sunny-web/, tests/off-sunny-web.spec.cjs, tests/usage-fixture.cjs, HANDOFF.md.
- Tests: all 16 suites passed. New integration verifies original 156 byte-equivalent records preserved, 10 imported once, null-link edit/source preservation, guest write denial, counts/filter persistence, distinct CB110, plain source labels and 390px fit. Corrected local fixture run() to provide D1 meta.changes after initial PUT fixture failure. Import screenshots desktop/phone checked. Standard screenshot command initially hit ERR_NETWORK_ACCESS_DENIED on localhost; rerun with approved network permission passed.
- Local preview: checked (standard captures and Worker/SQLite import fixture). Pre-import read all 156 deployed rows; meaningful catalog fields/specs matched repository after null/absent normalization. Incoming Claude docs-only commit 6537a86 reviewed, Artifact v21; no application changes in incoming work.
- Claude Artifact: not published; fallback preserved. Claude Code must sync archive items with safe insert-only identities; root data/*.json intentionally remains current 156.
- Private Site: publication pending from this pushed commit; preserve PUBLIC audience and existing admin secrets.
- Practice data: not exported (public repository permission pending). New records have no verified pictures and are excluded from picture practice.
- Remaining issues: verify/import pictures and resource links in a later request; next source batch requires explicit selection.
- Next steps: publish, verify archive count and current-record preservation live, record exact version/SHA.

## 2026-10-30: Claude Code — git pull: reviewed 33 Codex commits (172a153..9672157); Claude Artifact version 21
- Changes: reviewed the commits against their HANDOFF entries: simplified sidebar and mobile cards; SKU links to product pages; "User Manual/Assembly Guide" column (manuals and YouTube guides embedded in app/index.html from data/manuals/*.json); CSV with guide URLs and Excel UTF-8; public Site with guest catalog-only views; admin-only Public Usage Analysis (link clicks, timing, charts) and public feedback widget (migrations 0003, 0004); official `productSpecs` for the eight remaining categories; "Model number" wording. Worker: anonymous writes are limited to `/api/public-usage/click`, `/api/public-usage/events` and `/api/feedback` (same-origin, size-bounded, validated, 90-day retention); all usage and feedback reads are admin-only; catalog and practice writes still need a signed-in user. The Artifact runtime is unaffected: telemetry and feedback only run when the source is the private Site, and practice stays on for signed-in Artifact viewers. Test edits: every removed assertion has a renamed or updated replacement, except the mobile spec-cell width check, replaced because mobile spec cells are now intentionally hidden. The two issues I flagged on 2026-10-23 (phone category popup layout, desktop selector spacing) are fixed.
- Catalog data: read the Artifact `items` database (156 docs, no edits since my last write). All 93 items whose `productSpecs` changed still matched the old repository data, so I wrote only `productSpecs`, pinned with `if_version` (two atomic batches). No conflicts; no other fields touched.
- Files: HANDOFF.md
- Tests: all 13 tests/*.spec.cjs passed. `npm run screenshots` passed. Phone category popup and desktop catalog inspected.
- Local preview: checked via screenshots.
- Claude Artifact: published version 21 from 9672157.
- Private Site: version 32 (Codex); same app code as main.
- Practice data: not re-exported (no change).
- Remaining issues: none found. Note: anonymous feedback has only duplicate protection (same comment within 60 seconds), not a rate limit; fine at current traffic, worth revisiting if spam appears.
- Next steps: none.

## 2026-10-28: Codex — model terminology published as version 32
- Changes: published model-number wording; no identifiers or data changed.
- Files: HANDOFF.md release record.
- Tests: 15 suites passed; screenshots checked; build and deployment succeeded.
- Local preview: checked.
- Claude Artifact: not published; Claude Code sync required.
- Private Site: PUBLIC version 32 built from exact main SHA 9a5509b59a15c17c61c732c6d0b1e70473d1427c; deployment appgdep_6ae230c5eaac8191b415dfc797839f93 succeeded. Audience/environment unchanged.
- Practice data: not exported (public repository permission pending).
- Remaining issues: none for wording change.
- Next steps: refresh the app.

## 2026-10-28: Codex — customer-facing model number terminology
- Changes: replaced visible SKU wording with model number; Model / Item columns, Model Practice navigation, search/copy/edit/practice/progress labels and CSV Model number (SKU). Internal sku keys, SKU_RE parser, stored records, routes and identifiers unchanged.
- Files: app/index.html, tests/practice.spec.cjs, HANDOFF.md.
- Tests: all 15 suites passed across the verification run. Initial page-load check caught an accidental constant rename, restored before continuation; practice label assertions then updated to new exact wording (behavior assertions retained). Fourteen desktop/phone screenshots generated; catalog screenshot checked. Both runtimes retained; no data/schema changes.
- Local preview: checked.
- Claude Artifact: not published; Claude Code sync required.
- Private Site: publication pending from this pushed commit; public access unchanged.
- Practice data: not exported (public repository permission pending).
- Remaining issues: none for this wording change.
- Next steps: publish and record exact source/version.

## 2026-10-28: Codex — official specifications published as version 31
- Changes: published remaining-category specifications and preservation-safe missing-field import.
- Files: HANDOFF.md release record.
- Tests: 15 suites passed; Worker build passed; deployment succeeded. Read all 156 live DB rows after publication and compared every non-null canonical productSpecs field: zero differences. Standard and category captures generated; desktop visually checked.
- Local preview: checked; live specification import confirmed through read-only Sites database tools.
- Claude Artifact: not published; Claude Code source/catalog sync required.
- Private Site: PUBLIC version 31 from exact main SHA ca232676ebf7a9d8670b022f2013d89dd97805f8; deployment appgdep_6ae21de19c348191868bd64ba6eeb528 succeeded. Existing public audience and environment revision 1 preserved.
- Practice data: not exported (public repository permission pending).
- Remaining issues: nine products without relevant published specifications; all missing fields remain neutral, variant ranges retained.
- Next steps: refresh catalog; consult specification-sources audit for individual product gaps.

## 2026-10-28: Codex — official specifications for remaining categories
- Changes: checked 102 entries across Indoor Bikes, Steppers, Row-N-Ride, Pilates Reformers, Racks, Weight Benches, Weights and Essentials using official saved product pages; added relevant specification fields to 93. Nine have no applicable published measurements or an unavailable page (SF-DB01-055 HTTP 404), retained as blank. Per-SKU sources/raw official fields/import values recorded. All existing treadmill/elliptical/rower values preserved. Overall/folded/variant-range dimensions are not workout-area dimensions; rack capacity is not user weight.
- Files: eight category JSON files, data/specification-sources/remaining-categories.json, data/catalog-specifications-notes.md, server/worker.js, tests/server.spec.cjs, tests/official-specifications.spec.cjs, HANDOFF.md.
- Tests: all 15 suites passed. Initial server assertion expected only 31 productSpecs rows; retained exact 31 elliptical/rower assertion and added exact 124 total after expansion. New upgrade test verifies null-group repair, missing-field fill, preserved custom name/capacity and rack/user distinction. Standard screenshots and new bike desktop/phone captures generated; desktop checked. Both UI runtimes retained.
- Local preview: checked using local catalog/Worker fixture. All 156 live rows read before edits; compared names, SKUs, categories, prices, URLs, photo masks and specification groups to repository, no differences. Direct public API read returned HTTP 403; used supported read-only Sites DB tools instead.
- Claude Artifact: not published; Claude Code must sync source and canonical data.
- Private Site: publication pending from this pushed commit; SQL guarded one-time fill only missing fields, preserves current values and SKU/category; public access unchanged.
- Practice data: not exported (public repository permission pending).
- Remaining issues: nine products lack relevant specs; variant ranges stay labeled as ranges; no guessed values. Workout width/length null when not explicitly advertised as workout area.
- Next steps: publish, verify deployed data and record exact SHA/version.

## 2026-10-28: Codex — numeric alignment published as version 30
- Changes: published centered usage metric values and table click counts; text remains left-aligned.
- Files: HANDOFF.md release record.
- Tests: 14 suites passed, screenshots checked, Worker build passed; deployment succeeded.
- Local preview: checked desktop/phone fixture captures.
- Claude Artifact: not published; Claude Code sync needed.
- Private Site: PUBLIC version 30 from exact main SHA f17db8f526250302ea7088ab146bc1605c02993e; deployment appgdep_6ae21a167254819185eee5b701c9b7b8 succeeded. Public audience/environment unchanged.
- Practice data: not exported (public repository permission pending).
- Remaining issues: none for this change.
- Next steps: refresh Public Usage Analysis.

## 2026-10-28: Codex — center usage numbers
- Changes: centered Public Usage Analysis metric-card values, product click counts and daily click counts on desktop/mobile. Labels, headings, dates, product/category descriptions and chart positions remain unchanged.
- Files: app/index.html, HANDOFF.md.
- Tests: all 14 suites passed; standard screenshots generated; usage chart desktop/phone captures regenerated and desktop visually checked. CSS-only scoped change; API and Claude fallback intact.
- Local preview: checked with local Worker fixture.
- Claude Artifact: not published; Claude Code sync needed.
- Private Site: publication pending from this pushed commit; public access unchanged.
- Practice data: not exported (public repository permission pending).
- Remaining issues: none for this adjustment.
- Next steps: publish and record exact version/source.

## 2026-10-28: Codex — usage charts published as version 29
- Changes: published stacked daily resource clicks and median/P90 resource-time charts from tested main.
- Files: HANDOFF.md release record only.
- Tests: 14 suites passed; chart suite passed again after responsive sizing refinement. Worker/archive build passed; deployment succeeded.
- Local preview: desktop/390px chart screenshots checked using seeded local fixture; production admin chart interaction not separately exercised.
- Claude Artifact: not published; Claude Code sync required; runtime fallback preserved.
- Private Site: PUBLIC version 29 built from exact main SHA 2d171c68586faa1516d5b949bc8d2cbca8545a1c; deployment appgdep_6ae2189ef8f08191b57a80fd69634a20 succeeded. Public audience and environment revision 1 unchanged; no migrations needed.
- Practice data: not exported (public repository permission pending).
- Remaining issues: no historical timing backfill; UTC daily dates.
- Next steps: refresh and open Public Usage Analysis as admin.

## 2026-10-28: Codex — public usage trend charts
- Changes: added daily resource-click stacked areas and daily search-to-resource median with optional P90. Period/category/type filters apply; hover, focus and tap show daily counts or timing/sample totals. Zero-click days show zero, untimed days break the line. Summary cards above charts; responsive phone layout. Uses existing telemetry without new collection or migrations.
- Files: app/index.html, server/worker.js, tests/usage-charts.spec.cjs, tests/catalog-specifications.spec.cjs, HANDOFF.md.
- Tests: all 14 suites passed; chart integration checks exact daily quantiles, filters, gaps, P90, keyboard/tap, empty data and 390px layout. Initial catalog-specifications test failed with a 30s Close options timeout: fixed its resize race by waiting for automatic popup closure rather than attempting to click a disappearing button; retained all assertions. Fourteen standard screenshots plus desktop/phone chart captures generated and visually checked; final responsive adjustment passed chart suite again.
- Local preview: checked with real Worker/SQLite and headless Chrome; fixture data only, no fabricated production analytics.
- Claude Artifact: not published; fallback retained, Claude Code sync needed.
- Private Site: publication pending from this pushed commit; current PUBLIC version 28. No access changes.
- Practice data: not exported (public repository permission pending).
- Remaining issues: historical timing cannot be reconstructed; sparse days show individual points. Daily reporting uses UTC.
- Next steps: publish and record exact version/source SHA.

## 2026-10-27: Codex — timing, health and feedback published as Site version 28
- Changes: published desktop catalog scope note, search/category-to-resource median/P90, load/error/recovered-delivery metrics, bounded duplicate-safe retry outbox and minimal public feedback widget with private admin comments. All four excluded measurements remain unimplemented.
- Files: HANDOFF.md and README.md endpoint wording only; deployed source unchanged.
- Tests: full 13-suite run passed, then server mixed-stale-event and browser retry/feedback integration passed after the server-only retry safeguard. Fourteen standard captures and new feedback/performance captures passed/inspected. Worker build passed. Live clean browser confirmed all 156 items, note visible desktop/hidden at 390px, no extra feedback input fields, mobile fit, analytics GET 403 and invalid feedback/events POST 400.
- Local preview: desktop/phone form and admin metrics/comments checked against real Worker/SQLite fixture.
- Claude Artifact: fallback preserved; Site analytics/feedback disabled there. Claude sync required for source alignment.
- Private Site: PUBLIC version 28 from exact main SHA 70fd692f03b30496bc1fcc20a1d9d3f35f45f4d7; deployment appgdep_6ae1204252dc819196fea928134941aa succeeded. Migration 0004 confirmed applied: public_feedback and public_telemetry_events present alongside existing tables. Admin environment revision 1 and public audience preserved.
- Practice data: not exported (public-repository permission pending); catalog/practice and old click totals retained.
- Remaining issues: no historical timing backfill; recovered-failure metrics cannot represent permanently blocked reporting. QA submitted no production feedback or resource clicks; anonymous live verification can add a normal catalog-load timing sample. Actual admin interactions/quantiles/escaping tested locally; live public privacy restrictions verified.
- Next steps: refresh the app; admins open Public Usage Analysis to see new metrics and recent comments. Documentation follow-up does not change deployed app.
## 2026-10-27: Codex — prevent an obsolete queued link blocking telemetry
- Changes: schema-valid queued clicks for a removed product or removed resource are acknowledged as discarded without storing them, so valid events in the same batch still arrive. Malformed/cross-origin requests remain rejected.
- Files: server/worker.js, feedback-performance-server test, HANDOFF.md.
- Tests: mixed valid/stale batch assertion passed, including no stored stale event. Timing/retry/feedback browser integration passed after this server-only safeguard; prior full 13-suite run and screenshots passed unchanged UI.
- Local preview: existing checked desktop/phone layout unchanged.
- Claude Artifact: no effect; Site-only endpoint.
- Private Site: not published yet; release includes this commit rather than prior prepared archive.
- Practice data: not exported (permission pending); no production data changed.
- Remaining issues: documented bounded outbox/retention and recovered-failure reporting limits remain.
- Next steps: package and publish final tested source with migration 0004.
## 2026-10-27: Codex — resource timing, reliability metrics and minimal feedback
- Changes: desktop-only catalog note says Search products from sunnyhealthfitness.com only. Added visible-tab search/category-to-next-resource timing with exact median/P90 in Public Usage Analysis; refinements retain the start and hidden time pauses. Added catalog-ready duration, catalog/app errors and recovered delivery-failure counts. Implemented persistent bounded 24-hour/100-event outbox with backoff and event-ID idempotency. Added collapsed bottom-right feedback form (comment/Submit/Close, no account/contact fields) and private latest-100 admin feedback list. Excluded no-result searches, repeated-query metrics, unavailable-resource requests and satisfaction prompts as requested; no search text stored.
- Files: app/index.html, server/worker.js, db/schema.ts, migration 0004_usage_timing_feedback and metadata, preview.mjs, README.md, two new feedback/performance suites and existing usage-UI metric selectors, HANDOFF.md.
- Tests: all 13 suites passed. New integration cases cover exact quantiles, filters, lost-ack retries without duplicate clicks, hidden-time pause/refinement, failed feedback draft retention/retry, escaped markup, bounded/same-origin validation, admin exclusion, duplicate feedback and retention. Initial old usage UI assertion read the newly first timing card; added stable click-total card selector and retained its numeric assertions. Fixed both populated/empty wrappers after a selector timeout. Fourteen standard screenshots plus new feedback/performance screenshots passed/inspected. Worker build passed.
- Local preview: desktop scope note, phone-hidden note, minimal feedback panel and admin timing/health/comments checked. Preview data remain in memory.
- Claude Artifact: runtime fallback retained; Site telemetry/feedback do not run there. Claude must sync source independently.
- Private Site: PUBLIC audience preserved. Publication follows pushed tested commit with migration 0004; exact version/SHA in follow-up. Existing catalog/practice and daily click data unchanged.
- Practice data: not exported (public-repository permission pending); existing report has zero results.
- Remaining issues: timing measures visible time to click, not external reading/satisfaction. Only completed timed attempts count; new input after five visible idle minutes starts a fresh attempt, samples over 30 minutes omitted. Retried events use server-receipt UTC date. Delivery failures report only after recovery; permanently blocked/expired/cleared local queues cannot be measured. Feedback can contain user-entered personal data despite the avoid-personal-info prompt; it remains admin-only and is never exported to this public repo.
- Next steps: publish, verify migration/public privacy checks, then admin reviews new metrics and comments after visitors use the app.
## 2026-10-27: Codex — Public Usage Analysis live as Site version 27
- Changes: published admin-only Public Usage Analysis and anonymous resource-link counters. Public audience revision 2 retained; admin settings/environment revision 1 unchanged.
- Files: HANDOFF.md only.
- Tests: all 11 suites passed; 14 existing preview captures plus desktop/phone analytics captures passed/inspected; Worker build passed. Live unauthenticated session returns admin/canWrite/practice false, report API returns 403, invalid click returns 404 without adding a count. Live fresh anonymous browser still loads all 156 products and search while hiding private features.
- Local preview: desktop/phone dashboard checked against the real Worker and SQLite with isolated test counts.
- Claude Artifact: analytics intentionally Site-only; Claude must sync source independently.
- Private Site: PUBLIC version 27 from exact main SHA bc6e4c68ac4c18b61b0d63b5bab530eaf474f52f; deployment appgdep_6ae1007f13dc8191b535e21088a01fab succeeded. Migration 0003 confirmed applied: DB.public_link_clicks has only day/item_id/kind/click_count. Read-only check showed empty table immediately after deployment; production was not seeded with fake clicks.
- Practice data: not exported (public-repository permission pending); no catalog/practice data changed.
- Remaining issues: tracking begins now; best-effort openings are not unique people or proof of viewing. Anonymous reports denied live; authenticated admin interactions/filtering verified in local integration tests.
- Next steps: admin selects Public Usage Analysis in section menu and uses Refresh after visitors open resources. Review top SKUs to prioritize missing or outdated guides. Documentation-only follow-up leaves deployed app unchanged.
## 2026-10-27: Codex — admin Public Usage Analysis for resource links
- Changes: added fifth admin section Public Usage Analysis. Owner confirmed product-page, user-manual and assembly-guide clicks. Reports total/type counts, ranked SKUs and UTC daily activity with 7/30/90-day, category and type filters. Excludes admin, search/category/copy/picture/export clicks. Best-effort keepalive tracking never blocks opening links; same-link clicks throttled for one second. Public/learner viewers cannot select or directly open the analysis page or read its API.
- Files: app/index.html; server/worker.js; scripts/build.mjs and preview.mjs; db/schema.ts; migration 0003_public_link_clicks and Drizzle metadata; usage server/UI fixture/tests; README.md; HANDOFF.md.
- Tests: all 11 suites passed (existing nine plus usage-server and usage-ui). New tests exercise the actual Worker/SQLite/browser: anonymous counts, all three available link destinations, admin exclusion, origin/body/item/type validation, denied report access, aggregate filters, retention, non-link exclusion, admin dashboard/empty state and mobile layout. Existing 14 screenshot flows passed; two new dashboard screenshots inspected; Worker build passed. Only synthetic local counts used; no analytics exported from production.
- Local preview: desktop/phone dashboard checked; preview admin dashboard starts empty.
- Claude Artifact: Site analytics intentionally disabled there; runtime fallback retained. Claude must sync source independently.
- Private Site: PUBLIC audience preserved. Publication follows tested pushed main; saved version and source SHA in follow-up. New migration adds a standalone table and does not modify existing catalog/practice records.
- Practice data: not exported (public-repository permission pending); existing report has zero results.
- Remaining issues: counts are link openings, not unique people or confirmed resource views. Anonymous daily counters store day/item/type/count only (no names/emails/IPs/cookies/user IDs). 90-day reporting window; expired counters cleaned on record/report. No historical backfill. Ordinary browser/bot blockers can affect totals.
- Next steps: publish with migration 0003, verify live public catalog/report authorization and table availability; admin reviews usage after public clicks arrive.
## 2026-10-27: Codex — public catalog live as Site version 26
- Changes: owner-authorized audience changed from custom owner-only to Public, access revision 2. Everyone can browse without login. Anonymous SKU Practice/Progress and editing are disabled; existing account data retained.
- Files: HANDOFF.md only.
- Tests: all nine suites and 14 screenshots passed; Worker build passed. Initial anonymous live check saw dispatch HTTP 401 during access propagation; after HTTP 200 confirmed, fresh no-cookie Chromium passed: 156 products, working search, hidden practice/progress/add controls, /api/session canWrite=false/practice=false/admin=false, practice and accounts GET return 403. Screenshot saved in task outputs/public-catalog-desktop.png.
- Local preview: passed; live anonymous browser verified.
- Claude Artifact: behind 9b4c8f8; Claude must sync/publicize independently if desired.
- Private Site: now PUBLIC per explicit owner request; version 26 from exact main SHA 9b4c8f8ceac0d608eafdbe6db30cee019f58233c, deployment appgdep_6ae0f74fe398819196f4aff8d2fda9d6 succeeded. Admin environment revision 1 unchanged.
- Practice data: not exported (public-repository permission pending); no results deleted.
- Remaining issues: none for anonymous browsing. Signed-in account practice remains available; anonymous free visitors cannot practice.
- Next steps: share existing URL. Restore owner/custom account-only audience only when owner asks. Future publications must preserve PUBLIC audience and use the normal deployment operation, not private-only deploy.
## 2026-10-27: Codex — public catalog browsing with signed-out practice disabled
- Changes: owner explicitly requested public no-login browsing until they ask to restore account-only access. Signed-out Site visitors cannot select SKU Practice or Progress; direct practice/progress URLs return to Catalog. Signed-in users and Claude runtime retain existing practice/progress. Catalog writes remain server-authorized admin-only with existing ADMIN_EMAILS configuration.
- Files: app/index.html, new tests/public-catalog.spec.cjs, HANDOFF.md.
- Tests: all nine suites passed, including anonymous catalog/search, hidden practice/progress/edit controls, direct-link fallback, no private practice requests, signed-in practice and Artifact runtime. Fourteen screenshots passed; existing practice report has zero results.
- Local preview: desktop/phone flows passed.
- Claude Artifact: not published by Codex; Claude sync required.
- Private Site: publish tested commit first, then change audience to public per explicit owner authorization; exact version/SHA/access recorded in follow-up.
- Practice data: not exported (public-repository permission pending); no results removed.
- Remaining issues: real anonymous deployed check follows access change.
- Next steps: publish, enable Public, verify unauthenticated catalog and API restrictions. Restore custom owner-only access only on owner request.
## 2026-10-23: Codex — CSV export published as private Site version 25
- Changes: published guide-link CSV columns and Excel-compatible UTF-8 encoding.
- Files: HANDOFF.md only.
- Tests: all eight suites and 14 screenshots passed; Worker build passed.
- Local preview: checked.
- Claude Artifact: behind 27dd722; requires Claude sync/publication.
- Private Site: version 25 from exact main SHA 27dd722fba7d40f6ee362a9333600e0a89e75bc1; deployment appgdep_6adbf22854ac819198cf0f6dcceca157 succeeded. Owner-only access/admin unchanged.
- Practice data: not exported (public-repository permission pending).
- Remaining issues: previously downloaded CSVs need re-export.
- Next steps: refresh Site and export a fresh CSV; documentation-only commit leaves app unchanged.
## 2026-10-23: Codex — CSV guide links and Excel encoding
- Changes: catalog CSV adds User manual link and Assembly video link using the same SKU mappings as the app; unavailable links remain blank. UTF-8 BOM and explicit charset prevent Excel misreading Unicode punctuation/symbols. Existing catalog values and quoting retained.
- Files: app/index.html, catalog/treadmill CSV test captures, HANDOFF.md.
- Tests: all eight suites passed; screenshots passed. Initial treadmill capture timed out because it expected exact old MIME type; changed capture to accept CSV charset, then affected suite passed. Catalog asserts both new headers and video URLs.
- Local preview: 14 desktop/mobile captures passed.
- Claude Artifact: requires Claude sync/publication.
- Private Site: publication follows pushed tested commit; access unchanged.
- Practice data: not exported (public-repo permission pending).
- Remaining issues: existing downloaded files must be re-exported; source data unchanged.
- Next steps: publish and record exact SHA/version.
## 2026-10-23: Codex — catalog assembly guides published as private Site version 24
- Changes: published 96 verified SKU guide mappings / 99 product rows, with 57 unavailable notices and full report in data/manuals/assembly-guide-coverage.md. Of linked SKUs, 86 open YouTube directly and 10 open official embedded-video pages.
- Files: HANDOFF.md only.
- Tests: all eight suites passed after correcting the documented viewport/popup test-helper race. 86 YouTube oEmbed checks verified availability/ownership, 14 screenshots and Worker build passed.
- Local preview: desktop/phone checks passed.
- Claude Artifact: behind d88ac35; Claude must sync and publish.
- Private Site: version 24 from exact main SHA d88ac35c5f95e7c15fc07588e667c255fb8ab6d8; deployment appgdep_6adbebb9140081919f1187922f7156e2 succeeded. Owner-only access/admin environment revision 1 unchanged.
- Practice data: not exported (public-repository permission pending); existing report has zero results.
- Remaining issues: source HTTP 429 challenge limited direct extraction for 10 confirmed guides; their official page links retained. 57 exact SKU videos not verified; report lists all. No challenge bypassed.
- Next steps: refresh Site; Claude syncs. This documentation follow-up leaves deployed app unchanged.
## 2026-10-23: Codex — catalog-wide assembly guide research and links
- Changes: researched all 153 distinct catalog SKUs through full-SKU and assembly-term searches on @SunnyHealthFitness, all 18 continuation pages of supplied channel search (416 returned videos), and official assembly pages. 96 distinct SKUs / 99 product rows now have guide links: 86 direct YouTube destinations and 10 official pages confirmed to contain corresponding embedded videos. Remaining 57 show Assembly guide unavailable; full SKU/product list and source limitations are in data/manuals/assembly-guide-coverage.md. Existing manual PDFs remain unchanged.
- Files: app/index.html embedded map, all data/manuals category provenance maps, coverage report, catalog assertions and tests/mobile-options.cjs, HANDOFF.md. No saved catalog/database, runtime, auth, layout or access change.
- Tests: initial run: seven suites passed, column-controls failed with locator.click Timeout 30000ms waiting for Close options after viewport resize. Fixed shared helper to await expected matchMedia popup closure on desktop instead of racing a hidden button; assertions retained. All eight suites passed after the fix. Catalog checks all rendered guide hrefs/new-tab targets and 99 linked/57 unavailable rows. All 86 direct destinations returned YouTube oEmbed HTTP 200 with Sunny channel ownership. Screenshot script saved 14 desktop/phone PNGs.
- Local preview: desktop/phone screenshot flows passed.
- Claude Artifact: not published by Codex; Claude must sync and publish.
- Private Site: publication follows tested pushed main; exact version/SHA in follow-up. Owner-only access/admin unchanged.
- Practice data: not exported (public-repository permission pending); existing report has zero results.
- Remaining issues: Sunny returned HTTP 429 connection-verification pages during research. Cached official pages confirmed 10 videos but direct video IDs could not be extracted; those links open the official embedded-video pages. No challenge bypassed. Cached SF-BH622045 page describes SF-BH621002, so rejected that mismatched guide. Missing means no matching video verified, not a claim none exists; similar non-SMART models and generic demos/workouts were not substituted.
- Next steps: publish private Site; owner may supply direct links for remaining SKUs. Claude syncs Artifact.
## 2026-10-23: Codex — assembly guides published as private Site version 23
- Changes: published combined User Manual/Assembly Guide column and 18 treadmill video links, with five unavailable notices.
- Files: HANDOFF.md only.
- Tests: all eight suites, 18 YouTube oEmbed HTTP 200 checks, 14 screenshot captures and Worker build passed. Desktop/mobile guide presentation inspected.
- Local preview: checked.
- Claude Artifact: behind 6946d68; Claude must sync and publish.
- Private Site: version 23 from exact main SHA 6946d68e62bce0b277c727c8b0a7415aed5aa8b4; deployment appgdep_6adbe8a5d8648191b20b5352b122cf19 succeeded. Owner-only access and admin environment revision 1 retained.
- Practice data: not exported (public-repository permission pending); existing report has zero results.
- Remaining issues: five treadmill pages lack assembly videos, listed in preceding entry. Other categories' videos not researched.
- Next steps: refresh private Site; Claude syncs Artifact. Documentation follow-up leaves deployed application unchanged.
## 2026-10-23: Codex — treadmill assembly guide links below manuals
- Changes: renamed manual column to User Manual/Assembly Guide and stacked muted Assembly guide links below User manual on desktop/mobile. Extracted 18 exact treadmill video links from official Sunny assembly sections; some official embedded videos are titled unboxing videos. Five pages have no video: SF-T723030, SF-T724064, SF-T723007, SF-X7210, SF-T722576; these show Assembly guide unavailable. Other categories retain manuals only until requested.
- Files: app/index.html, data/manuals/treadmills.json (video/page provenance), tests/treadmill-specifications.spec.cjs, HANDOFF.md. Existing manual PDFs, product links, frozen columns, /api and window.claude runtime paths retained; no catalog/database changes.
- Tests: all eight suites passed; new assertions cover column name, 18 videos/5 unavailable entries, exact SF-T724012 destination/new-tab target and vertical link order at desktop/mobile widths. All 18 YouTube oEmbed checks returned HTTP 200 and model titles. Screenshot script saved 14 PNGs; desktop/mobile treadmill captures inspected.
- Local preview: checked at desktop and phone sizes.
- Claude Artifact: not published by Codex; Claude must sync and publish.
- Private Site: publication follows pushed tested main; exact version/SHA in follow-up. Owner-only access unchanged.
- Practice data: not exported (public-repository first-export permission pending); existing report has zero results.
- Remaining issues: five treadmill videos unavailable on official pages, 12 manuals remain unavailable per owner request; other categories' videos not researched yet.
- Next steps: publish private Site; owner reviews treadmills before extending video coverage.
## 2026-10-23: Codex — supplied manuals published as private Site version 22
- Changes: published owner-supplied bench, dumbbell and yoga ball PDF links; 144/156 product rows linked and remaining 12 unavailable as requested.
- Files: HANDOFF.md only.
- Tests: all eight suites, three PDF HTTP 200 checks, 14 screenshots and Worker build passed.
- Local preview: desktop/mobile capture flows passed.
- Claude Artifact: behind 8b00219; Claude must sync and publish.
- Private Site: version 22 from exact main SHA 8b00219a4b4f1661471b28e224e57a98d8593be9; deployment appgdep_6adbe6e14b048191a64f572e25e048ac succeeded. Owner-only access/admin environment revision 1 unchanged.
- Practice data: not exported (public-repository permission pending); existing report has zero results.
- Remaining issues: 12 manuals intentionally unavailable.
- Next steps: refresh Site; Claude syncs. Documentation-only follow-up leaves deployed app unchanged.
## 2026-10-23: Codex — add three owner-supplied missing manuals
- Changes: linked supplied PDFs to SF-BH625080, SF-DB01-055 and SF-EB02-XS. Coverage now 144/156 product rows. The other 12 remain Manual unavailable as requested. Owner-provided mappings retain the catalog SKU even when the PDF uses a shorter model-family filename.
- Files: app/index.html, data/manuals/weight-benches.json, weights.json and essentials.json, tests/catalog-specifications.spec.cjs, HANDOFF.md. No catalog records/database or runtime/auth changes.
- Tests: all eight suites passed. Assertions check each supplied destination plus 144 linked/12 unavailable rows. All three PDFs returned HTTP 200. Screenshot script saved all 14 desktop/mobile PNGs.
- Local preview: desktop/mobile screenshot flows passed.
- Claude Artifact: not published; Claude must sync and publish.
- Private Site: publication follows pushed tested commit; version and exact SHA in follow-up. Owner-only access retained.
- Practice data: not exported (public-repository first-export permission pending); existing report has zero results.
- Remaining issues: 12 manuals unavailable, intentionally retained per owner.
- Next steps: publish private Site; Claude syncs its Artifact.
## 2026-10-23: Codex — remaining manuals published as private Site version 21
- Changes: published three supplied Stepper PDFs and remaining-category manual mapping; 141/156 product rows now have links.
- Files: HANDOFF.md only.
- Tests: all eight suites, 138 unique PDF HTTP checks, 14 desktop/phone screenshot captures and Worker build passed.
- Local preview: screenshot flows passed; mobile manual presentation inspected.
- Claude Artifact: behind b1836ea; Claude must sync and publish.
- Private Site: version 21 from exact main SHA b1836eaae5811356ec23f2cdd1b4d708833d5397; deployment appgdep_6adbe41fc1d4819195635e02e5ce5c20 succeeded. Owner-only access and admin environment revision 1 retained.
- Practice data: not exported (public-repository permission pending); existing report has zero results.
- Remaining issues: 15 unavailable manuals listed in preceding entry; owner may supply exact PDFs.
- Next steps: refresh private Site; Claude syncs Artifact. This documentation-only commit leaves deployed application unchanged.
## 2026-10-23: Codex — complete remaining category manual research
- Changes: added owner-provided Stepper PDFs for SF-S026007, SF-S026002 and SF-S024072. Added verified exact-SKU Preview Now PDFs for Row-N-Ride (4/4), Pilates Reformers (2/2), Racks (8/8), Weight Benches (12/13), Weights (4/10), and Essentials (18/26). All categories researched: 141/156 product rows now link to 138 unique SKU PDF destinations. Missing manuals remain explicitly unavailable; no similar-model substitutions.
- Files: app/index.html embedded map, data/manuals/steppers.json and six new provenance maps, tests/catalog-specifications.spec.cjs, HANDOFF.md. No catalog records or databases changed; both private /api and window.claude runtime paths retained.
- Tests: all eight test suites passed; catalog assertions updated to 141 links and 15 unavailable rows. All 138 unique PDF destinations returned successful HEAD status. Screenshot script passed, saving 14 desktop/phone PNGs.
- Local preview: desktop/phone screenshot flows passed.
- Claude Artifact: not published by Codex; Claude must sync and publish these changes.
- Private Site: publication follows tested pushed main, exact version/SHA recorded in follow-up. Owner-only access/admin configuration unchanged.
- Practice data: not exported (public-repository first-export permission pending); existing report has zero results.
- Remaining issues: no verified manual found for SF-BH625080; SF-DB01-055, SF-DB02-5, SF-OP01-10, SF-DB03-5, NO. 021-2-PAIR, NO. 066-10; SF-EB02-XS, NO. 031-B, SF-EM02-GY, SF-EM01-BK, NO. 074-XS, SF-ER01-BK-12, NO. 120-GY, SF-WV01-A1.
- Next steps: publish private Site; owner can supply any remaining PDFs; Claude syncs its Artifact.
## 2026-10-23: Codex — expanded manuals published as private Site version 20
- Changes: published SF-T722576 supplied manual and Ellipticals/Rowers/Indoor Bikes/Steppers mapping.
- Files: HANDOFF.md only.
- Tests: all eight suites, 87 unique PDF HTTP checks, screenshot script and Worker build passed.
- Local preview: desktop/phone capture flows passed.
- Claude Artifact: behind 01ecbcb; Claude must sync and publish.
- Private Site: version 20 from exact main SHA 01ecbcb7df613bc6d7460ff69b6b0d5015493c90; deployment appgdep_6adbe1e6b91c81919eb1cbd5886b1000 succeeded. Owner-only access/admin settings unchanged.
- Practice data: not exported (public-repo permission pending).
- Remaining issues: Stepper SF-S026007, SF-S026002, SF-S024072 manuals not verified/found; shown unavailable.
- Next steps: owner may provide missing PDFs; Claude syncs. This documentation-only commit leaves deployed application unchanged.
## 2026-10-23: Codex — extend verified manuals to four categories and complete treadmills
- Changes: added owner-provided SF-T722576 PDF; added exact SKU Preview Now PDFs from official Sunny pages for 18 Ellipticals, 13 Rowers, 26 Indoor Bikes and 10/13 Steppers. Two rower pages were found via official-site search after directory omission. Steppers SF-S026007, SF-S026002 and SF-S024072 have no verified official manual page and show Manual unavailable; no guesses. Shared SKU rows account for 90 linked product rows using 87 unique PDFs. Existing SKU product links, grey manual styling, column position and frozen columns unchanged.
- Files: app/index.html embedded PRODUCT_MANUALS map, data/manuals/*.json source provenance, catalog/treadmill tests, HANDOFF.md. No saved catalog records or database changed.
- Tests: all eight suites pass; screenshots pass (14 PNGs); all 87 unique PDF URLs return successful HEAD status. New tests cover total linked rows, three unavailable models, and supplied SF-T722576 destination. Initial total assertion counted unique PDFs instead of product rows; corrected to account for duplicate SKU rows.
- Local preview: desktop and phone screenshot flows passed.
- Claude Artifact: behind this mapping change; Claude syncs and republishes app.
- Private Site: publication follows pushed tested main; exact version/SHA in follow-up. Admin/access unchanged.
- Practice data: not exported (public-repo permission pending).
- Remaining issues: three listed Stepper manuals unavailable from verified sources.
- Next steps: publish private Site; owner may supply missing PDFs.
## 2026-10-23: Codex — treadmill manuals published as private Site version 19
- Changes: published SKU product links and 22 exact treadmill Preview Now PDF links, with manual column after Price and muted mobile manual links.
- Files: HANDOFF.md only.
- Tests: all eight suites, added manual assertions, 22 PDF HTTP checks, screenshots and Worker build passed.
- Local preview: desktop/phone treadmill captures inspected.
- Claude Artifact: behind b979721; Claude must sync and publish app/index.html.
- Private Site: version 19 from exact main SHA b979721245057108925b4fe065c6a76d53c305e8; deployment appgdep_6adbdfc280308191af934964db9d2578 succeeded. Owner-only access/admin settings unchanged.
- Practice data: not exported (public-repo permission pending).
- Remaining issues: SF-T722576 not listed in official manual directory; other categories not researched per scope.
- Next steps: owner reviews treadmills, then decides whether to add other categories. Documentation follow-up leaves app identical to deployed SHA.
## 2026-10-23: Codex — treadmill user manuals and linked SKU text
- Changes: removed product Link column; SKU text now opens its original product page in a new tab, copy button separate. New User Manual column defaults immediately after Price, including migration of saved column layouts; manuals are not frozen. Mobile replaces View on site with muted-grey User manual. Matched exact SKU entries from Sunny official user-manual directory to assembly-guides pages and extracted Preview Now English PDF destinations: 22/23 treadmill SKUs verified. SF-T722576 is not listed and shows Manual unavailable; no guessed substitute. Other categories display a dash until their manuals are added. Bulk product URL input moved into SKU/item cell; CSV product URLs unchanged.
- Files: app/index.html, data/manuals/treadmills.json (source-page/PDF provenance), affected column and treadmill tests, HANDOFF.md. App embeds the map so both private Site and Claude Artifact work without a network lookup or database backfill. No catalog records/database edited.
- Tests: all eight suites passed. Added checks for 22 links, exact SF-T724064 PDF, unavailable model, new-tab SKU product link, removed Link column, manual position after Price and nonsticky manual cell. All 22 PDFs returned HTTP success to HEAD requests. Repository desktop/phone screenshots passed.
- Local preview: 1440px/390px screenshots; phone treadmill manual shown grey.
- Claude Artifact: behind this UI change; Claude syncs app and provenance map to republish.
- Private Site: publication follows tested pushed commit, exact version/SHA recorded afterward. Access/admin settings unchanged.
- Practice data: not exported (public-repo permission pending).
- Remaining issues: SF-T722576 exact manual absent from official directory; other categories intentionally not researched yet.
- Next steps: publish private Site; owner checks treadmill workflow before extending to other categories.
## 2026-10-23: Codex — mobile header fix published as private Site version 18
- Changes: mobile Tiers & Compare removed and scrolling panel layered below Sunny/search header.
- Files: HANDOFF.md only.
- Tests: all eight suites and 14 screenshot captures passed; Worker build passed.
- Local preview: desktop and phone checks complete.
- Claude Artifact: behind mobile fix; Claude must sync.
- Private Site: version 18 from exact main SHA 6a74231e128df8635605a504fd8d4b4ba8f7b567; deployment appgdep_6adbdae418d48191bdf1b9d75007334a succeeded. Access and admin settings unchanged.
- Practice data: not exported (public-repo permission pending).
- Remaining issues: none for this request.
- Next steps: refresh private Site; Claude syncs. Documentation-only follow-up does not affect deployed app.
## 2026-10-23: Codex — remove mobile tiers and fix sticky header layering
- Changes: phones hide Tiers & Compare and its legend entirely. Header z-index 40 is above scrolling sidebar 10, so logo/search stays above layout content. Modal dialogs remain above the header for intentional focused interactions. Desktop unchanged.
- Files: app/index.html, affected catalog UI tests, HANDOFF.md.
- Tests: all eight suites pass; mobile tier absence asserted. Comparison/reset assertions retained at desktop width because those controls are intentionally no longer offered on mobile. No runtime, data, or access changes.
- Local preview: CSS stacking and mobile visibility checked in tests; desktop/phone screenshot check follows.
- Claude Artifact: behind this change; Claude must sync.
- Private Site: publication follows pushed commit; version/SHA recorded afterward.
- Practice data: not exported (public-repo permission pending).
- Remaining issues: none for this request.
- Next steps: publish private Site and record source.
## 2026-10-23: Codex — simplified catalog UI published as private Site version 17
- Changes: published selector spacing, lighter option panels, direct compact desktop actions, mobile Add-only actions and five-field mobile product cards. Removed tier explanation. No catalog or authorization changes.
- Files: HANDOFF.md publication record.
- Tests: all eight suites pass; 14 screenshots and Worker build pass. Final desktop and phone catalog screenshots inspected.
- Local preview: 1440px/390px verified; selector/title gap >=20px asserted.
- Claude Artifact: behind 52ceff0; Claude must sync and publish (last recorded version 20).
- Private Site: version 17 from exact pushed main SHA 52ceff06c94f1d45823d026c4740902c155cb0da; deployment appgdep_6adbd7fb6d988191aae073f6254b66b8 succeeded. Owner-only access/admin environment revision 1 unchanged.
- Practice data: not exported (public-repo permission pending).
- Remaining issues: none for approved UI scope.
- Next steps: refresh Site; Claude syncs for Artifact. This follow-up documentation does not change deployed app code.
## 2026-10-23: Codex — spaced selector, distinct option panels, direct actions and simpler mobile cards
- Changes: fixed missing section-selector closing wrapper, which had kept the title inside it and defeated previous spacing; now 24px padding separates selector from heading. Flyouts/popups use lighter option-panel backgrounds with border/shadow contrast. Removed How tiers are compared content. Catalog actions are individual compact desktop buttons on one row, Add New Item rightmost; phones show only Add New Item. Mobile product cards hide specification and row-action cells, retaining category, SKU/name, picture, price and link; underlying stored data and desktop specifications unchanged. Category popup list is one aligned column.
- Files: app/index.html, affected UI tests, HANDOFF.md.
- Tests: all eight suites passed after wrapper correction. New assertions verify title gap >=20px, no action flyout or tier explanation, mobile Export/Bulk hidden, Add visible and no visible spec cells. Updated intentional mobile spec-width expectation to hidden cells; desktop spec assertions retained. 14 desktop/phone screenshots passed.
- Local preview: 1440px and 390px images visually inspected; final title spacing verified by assertion and screenshot.
- Claude Artifact: Claude records version 20 from e46cb27; behind these UI changes, Claude must sync and publish.
- Private Site: publish follows pushed tested main; exact version/source in follow-up. Owner-only access and admin settings unchanged.
- Practice data: not exported to public repository (permission pending).
- Remaining issues: live learner account check awaits access approval.
- Next steps: publish private Site and record provenance; Claude syncs.
## 2026-10-23: Claude Code — git pull: reviewed Codex's mobile option popups; Claude Artifact version 20
- Changes: reviewed Codex commits 9cdf041 and e46cb27. They match their HANDOFF entries: on phones, the section, actions, category and Tiers & Compare controls open a centred popup (close button, backdrop, Escape, focus trap, focus return), and on desktop `#sectionPicker` has a 20px bottom margin. Private Site `/api` and the `window.claude` fallback are untouched. Tests: the new helper `tests/mobile-options.cjs` (`revealOptions`) opens or closes popups before each step; every existing assertion is still there. No code change by Claude Code.
- Files: HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed (with `tests/mobile-options.cjs` copied next to the path-adapted test copies). `npm run screenshots` passed (14 PNGs). Phone category popup opened and closed on selection, no page errors.
- Local preview: checked via screenshots at 1440 and 390.
- Claude Artifact: published version 20 from e46cb27 (same app code as 9cdf041).
- Private Site: version 16 from 9cdf041 (Codex); same app code as main.
- Practice data: not re-exported (no change).
- Remaining issues, reported to the owner and not changed: (1) in the phone "Choose category" popup the categories are laid out in two uneven, centred columns ("Essentials" sits top-right next to "All") instead of one left-aligned list; (2) on desktop the gap between the section selector and the page title still looks very small in the screenshots, despite the new 20px margin.
- Next steps: owner decides whether to fix these; whoever does it records it here.

## 2026-10-23: Codex — mobile popup release published as private Site version 16
- Changes: private Site published with centered phone option windows and desktop selector spacing.
- Files: HANDOFF.md publication record only.
- Tests: all eight suites passed; 14 screenshots passed and Worker build succeeded.
- Local preview: 1440px/390px checks completed.
- Claude Artifact: behind by 9cdf041 UI change; Claude must sync and publish.
- Private Site: version 16 from exact main SHA 9cdf0411ad54d92cbc5122977d0746080292a97b; deployment appgdep_6adbcf4891f08191b84e40cb2efc20d4 succeeded. Owner-only access and environment revision 1 preserved.
- Practice data: not exported; public-repo permission pending.
- Remaining issues: no blocker for this UI change.
- Next steps: refresh private Site; Claude syncs to update Artifact. This documentation-only commit does not change deployed app code.
## 2026-10-23: Codex — mobile overlay option windows and desktop selector spacing
- Changes: phone section/actions/category/tier controls now open a centered overlay window with close button, backdrop dismissal, Escape, focus containment and focus return. Actual permission-gated controls move into the popup and return on close; category/action/section selections and comparison confirmation dismiss it. Page scrolling is locked while open; underlying layout stays in place. Desktop flyouts retained; section selector has 20px space before title.
- Files: app/index.html, UI tests, tests/mobile-options.cjs, HANDOFF.md.
- Tests: all eight suites pass after adapting interactions to modal popups. Helper opens visible UI controls and dismisses popups before interacting with underlying content; assertions retained. Initial failures were obsolete inline-control expectations; updated interactions without force clicks. Repository screenshots pass desktop/phone navigation and practice flows.
- Local preview: 1440px and 390px screenshots, popup selection/dismissal exercised by UI tests.
- Claude Artifact: version 19 from adc19d8 per incoming Claude c4047a2 handoff; behind this UI change, Claude must sync.
- Private Site: publication follows tested pushed commit; version/SHA recorded in follow-up. No admin or audience changes.
- Practice data: not exported; public-repo first-export permission pending.
- Remaining issues: live learner test still pending learner-access approval.
- Next steps: publish private Site and record source; Claude syncs for Artifact.
## 2026-10-23: Claude Code — git pull: reviewed Codex's compact sidebar; Claude Artifact version 19
- Changes: reviewed Codex commits 2fc8bbc, 48d4e4d, 6833273, adc19d8. They match their HANDOFF entries: the section switcher shows the current view with the others in a flyout (`#sectionTrigger`), catalog actions behind `#actionTrigger` ("+ Add New Item" or "Export CSV" for read-only), and on phones the categories and Tiers & Compare are collapsed behind `#categoryExpand` / `#toolsExpand`. Private Site `/api` and the `window.claude` fallback are untouched. Test edits only open the new flyouts or disclosures before the existing steps; no assertion was removed or weakened, and mobile collapsed/expanded checks were added. No code change by Claude Code.
- Files: HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed. `npm run screenshots` passed (14 PNGs, no page errors); desktop 1440 and phone 390 inspected.
- Local preview: checked via screenshots.
- Claude Artifact: published version 19 from adc19d8 (same app code as 6833273).
- Private Site: version 15 from 6833273 (Codex); same app code as main.
- Practice data: not re-exported (no change).
- Remaining issues: none.
- Next steps: none; both links show the same app.

## 2026-10-23: Codex — compact controls published as private Site version 15
- Changes: published compact sidebar and mobile disclosures, including follow-up 6833273 removing the full-bleed hero shadow so flyouts do not cover adjacent content. No runtime/auth/catalog changes.
- Files: HANDOFF.md publication record.
- Tests: all eight suites passed after final CSS correction; 14 desktop/phone captures passed and final mobile image visually inspected. Early failures exposed hover/click race, stacking interception and outdated screenshot navigation; corrected before publication, no forced clicks or assertion removals.
- Local preview: desktop 1440px and phone 390px checked; category and tier/Compare disclosures closed initially.
- Claude Artifact: behind by compact-control UI changes; Claude must sync and republish.
- Private Site: version 15, exact source SHA 6833273cb7dbb7b4d4ce074f447134433129ac62; deployment appgdep_6adbbe82bc708191b81adde649cdd406 succeeded, environment revision 1 preserved, owner-only access unchanged.
- Practice data: not exported (public repo first-export approval pending).
- Remaining issues: none for this UI task; live learner-account check remains pending access approval.
- Next steps: Claude syncs and updates Artifact. Documentation commit is newer than deployed source; app is identical.
## 2026-10-23: Codex — compact section/actions flyouts and collapsed mobile controls
- Changes: section selector shows current view only; hover opens alternatives to the right, with click/tap and keyboard support. Catalog actions show Add New Item by default (Export CSV for read-only users), with permission-gated original actions in a right flyout. Mobile categories and tiers/Compare are collapsed by default behind separate expand buttons. Fixed flyout stacking over the table and hover/click closing race observed in initial checks.
- Files: app/index.html, five existing UI tests, scripts/screenshots.cjs, HANDOFF.md.
- Tests: all eight suites pass after fixes; updated tests open the real selectors and mobile disclosures before exercising existing assertions. Added mobile collapsed/expanded visibility assertions. Screenshots script uses section trigger and passes desktop/phone captures. No assertions removed; admin Accounts visibility is checked with its menu open.
- Local preview: 1440px and 390px screenshots; phone categories and tier controls hidden initially. Private API and window.claude fallback unchanged.
- Claude Artifact: not published by Codex; Claude must sync and publish this UI change.
- Private Site: publication follows the pushed tested commit; exact version/SHA recorded afterward. Owner-only access and admin runtime settings unchanged.
- Practice data: not exported to public repository; first-export permission pending.
- Remaining issues: live non-admin check still awaits learner-access approval.
- Next steps: publish private Site, record provenance; Claude syncs to update Artifact.
## 2026-10-23: Codex — sync Sunny logo update and publish private Site version 14
- Changes: pulled six Claude Code commits 289d08a, 3a1b120, e341248, 84c1807, 9a26cec, bf46395; reviewed their logo/header changes against the handoff. Final header has the full Sunny Health & Fitness lockup at the owner's chosen 52px height on Almond, sticky header and side panel adjusted accordingly. Both private Site /api and window.claude fallback intact. No application-source edits by Codex.
- Files: HANDOFF.md only (sync/publication record).
- Tests: all eight tests/*.spec.cjs passed on the first run with the Windows browser-path adapter; no assertions or catalog changes arrived. scripts/screenshots.cjs passed, 14 PNGs at desktop 1440px and phone 390px; standalone Worker build passed.
- Local preview: desktop catalog screenshot inspected; desktop/phone picture navigation advanced to 2 of 23; practice and progress captures passed with no page errors.
- Claude Artifact: Claude records version 18 from 9a26cec, same app code as bf46395.
- Private Site: published version 14 from exact main SHA bf463956478ad7c23f8a0a19903280cb1c02f98c, deployment appgdep_6adbbaf975cc8191b3dea592d3183542 succeeded. Runtime environment revision 1 retained (owner admin settings unchanged); owner-only access preserved. This documentation-only follow-up is newer than the deployed SHA; app code is identical.
- Practice data: no new export committed; first export to this public repository still requires owner approval. Ran practice-report: existing Artifact export has 0 results; no claim that this re-reads live practice records.
- Remaining issues: live second-account check remains pending owner approval of learner access; no access change requested or made.
- Next steps: owner refreshes private Site to see the updated logo; next agent syncs this publication record.
## 2026-10-23: Claude Code — smaller header logo (owner's size)
- Changes: owner found the 250px lockup too big and asked for it just slightly taller than the search bar (44px). The lockup (with "HEALTH & FITNESS") is now 52px tall and 112px wide, with clear space of one dot diameter (9px). This is the owner's decision and is below the guideline's 250px minimum for the lockup with tagline. The header is 87px tall again on desktop and sticks to the top again; the side panel sticks at 96px; table box `100vh - 160px`. On phones "Product Finder" sits beside the logo again.
- Files: app/index.html, README.md, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice.
- Local preview: checked at 1440 light/dark, 1280, 1024, 390 (no sideways scroll).
- Claude Artifact: published version 18 from 9a26cec.
- Private Site: version 13 from 328bafe; behind main (logo commits).
- Practice data: not re-exported (no change).
- Remaining issues: none new.
- Next steps: Codex runs "git pull" and publishes.

## 2026-10-23: Claude Code — full Sunny logo lockup (with "Health & Fitness") on an Almond header
- Changes: owner asked for the actual red logo with "Health & Fitness" under it, and allowed changing the header background to suit. The header now shows the full lockup from the guideline PDF (page 8 vector: six Sunny Red #E81D1D paths plus the fourteen "HEALTH & FITNESS" paths in the guideline's #241F21), at 250px wide, the guideline's minimum for the lockup, with clear space of about one dot diameter (19px). The header background is Almond #F8EEE1 in both light and dark mode (the full-color logo is allowed only on white, almond or black), with light search-box colours there; the white dark-mode logo is gone. The header is 171px tall on desktop, so it no longer sticks to the top; the side panel now sticks at 16px and the table box is `100vh - 110px`. On phones "Product Finder" goes under the logo.
- Files: app/index.html, README.md, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice.
- Local preview: checked at 1440 light/dark, 1280, 1024 and 390 (no sideways scroll).
- Claude Artifact: published version 17 from e341248.
- Private Site: version 13 from 328bafe; behind main (two logo commits).
- Practice data: not re-exported (no change).
- Remaining issues: rest of the palette and fonts still differ from the guideline (owner to decide).
- Next steps: Codex runs "git pull" and publishes.

## 2026-10-23: Claude Code — Sunny logo per Brand Guidelines 2026
- Changes: owner shared Sunny_BrandGuidelines_2026_1_1.pdf (not committed). The header logo was re-typed text ("SUNNY" in Poppins, #d7262e, tiny red tagline), which the guideline forbids. Replaced it with the real vector "SUNNY" wordmark extracted from the PDF's master lockup (page 8, `pdftocairo -svg`, the six Sunny Red paths only, no tracing), inline SVG with `fill: currentColor`. Following the guideline: no "Health & Fitness" (the full lockup needs 250px+), 120px wide on desktop and 104px on phones (minimum 100px), fixed aspect ratio, clear space of about one dot diameter (9px), Sunny Red #E81D1D on the light header (new `--logo` token), solid white on the dark header. The favicon is now the red 'S' badge from page 10 (red circle, white 'S'). The header is about 10px taller, so the sticky side panel and table heights moved down to match. Reviewed Codex's b0bced1 (HANDOFF only: admin configured as a secret, Site version 13 from 328bafe, access still owner-only).
- Files: app/index.html, README.md, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice.
- Local preview: header checked at 1440 light/dark and 390 light/dark (logo 120×56 / 104×48, rgb(232,29,29) / white), side panel at 1440/1280/1024, no sideways scroll.
- Claude Artifact: published version 16 from 289d08a.
- Private Site: version 13 from 328bafe; behind main by this app change.
- Practice data: not re-exported (no change).
- Remaining issues: the rest of the palette and fonts still differ from the guideline (accent #e0322f, navy buttons, Poppins/Roboto Condensed vs Montserrat, Almond #F8EEE1); left for the owner to decide.
- Next steps: Codex runs "git pull" and publishes.

## 2026-10-23: Codex — owner admin configured; private Site version 13, access remains owner-only
- Changes: synced eight Claude Code commits 8643727..328bafe and ran scripts/incoming.mjs Codex. Reviewed the practice/accounts changes and handoff; private Site /api and window.claude paths retained. Configured ADMIN_EMAILS as a secret runtime setting (environment revision 1), without storing its value or the owner identity in this public repository. No application-source edits were needed.
- Files: HANDOFF.md only. Local catalog comparison and screenshot artifacts remain outside tracked source or ignored.
- Tests: all eight tests/*.spec.cjs passed on the first run using the Windows browser-path adapter. Existing assertions retained; treadmill unknown-value assertions intentionally changed to match the four documented owner data updates. Repository screenshots script passed for desktop 1440px and phone 390px (14 PNGs, no page errors); Worker build passed.
- Local preview: screenshots verified catalog, picture navigation (2 of 23), practice setup/question/feedback and progress at both widths.
- Claude Artifact: Claude records version 15 from ac68339; application code matches published main 328bafe (the latter records the Artifact publication).
- Private Site: published version 13 from exact pushed main SHA 328bafe10fd5dddb59e021e51fe26cbd15d5dff5. Deployment appgdep_6adbb3534f288191893a1c9141cf6313 succeeded, env revision 1. Migrations 0001_practice_attempts and 0002_practice_users included. Signed-in owner /api/session verified canWrite:true, practice:true, admin:true and an email matching the configured admin. Confirmed platform email header and recovered the Site-specific authenticated user id via the owner's account record; neither is recorded here. /api/practice?with=profile and admin /api/practice/accounts both succeeded, verifying the two new tables. Site access remains custom owner-only, revision 1, no additional visitors.
- Catalog comparison: before publishing, read all 156 Site rows and compared with data/*.json. Differences were the expected photoChecked/photoMasks additions plus empty workout-area fields on SF-T724011, SF-T722076, SF-T722021, SF-T725067 and SF-T722021 keyDimensions. No conflicting app-only catalog edits found; no direct catalog API writes made. Release includes the reviewed one-time hydration that preserves existing values.
- Practice data: owner live profile has 0 records. No export committed: repository is public and first-export permission is still required by AGENTS.md. Ran practice-report against existing tracked export: 0 results. No other learners' data exported.
- Remaining issues: live non-admin verification requires a second signed-in account after the owner approves specific learner access or a broader audience. Server tests already prove non-admin practice writes succeed and catalog PUT/DELETE and Accounts access return 403. No access policy change made.
- Next steps: owner chooses who may sign in; only then change Site access and verify a real non-admin account can practice but cannot edit. This documentation-only commit is newer than the deployed SHA; app code is identical.
## 2026-10-23: Claude Code — accounts on the private Site: learner names, admin Accounts view, admin-only catalog edits
- Changes:
  - Owner chose the private Site for accounts (people sign in with email through the Site's sign-in) with the owner's own account as admin (the owner gives Codex the email directly; it isn't written here because this repository is public). The Claude Artifact can't host other learners (outside visitors can view but never save), so it stays the owner's personal copy.
  - Worker: admin roles from `ADMIN_USER_IDS` / `ADMIN_EMAILS` (comma-separated settings) or a `catalog_meta` row `admins` = `{"userIds":[...],"emails":[...]}`; email matching uses the `oai-authenticated-user-email` header only if the platform sends it (not verified; Codex please check which identity headers Sites provides). `/api/session` now returns `admin` and `email`. Once any admin is configured, catalog writes (`/api/items*`, `/api/assets` POST) are admin-only; with none configured, behaviour is unchanged. New `practice_users` table (migration `drizzle/0002_practice_users.sql`), `PUT /api/practice/profile` (learner's display name), `GET /api/practice?with=profile`, admin-only `GET /api/practice/accounts`.
  - App: Progress → "Your name" (Site only); **Accounts** section (shown only to admins) with every learner's answers, accuracy by field, mastered, streak, last practiced, a drill-down into one learner's full (read-only) progress, and a CSV of all accounts. Preview runs as an admin.
  - Docs: README (accounts), AGENTS.md and practice-data/README.md: Codex exports only the owner's own Site results to the public repo; other learners' data and emails stay in the Site.
- Files: server/worker.js, db/schema.ts, drizzle/0002_practice_users.sql, drizzle/meta/*, app/index.html, scripts/preview.mjs, tests/server.spec.cjs, tests/practice.spec.cjs, README.md, AGENTS.md, practice-data/README.md, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice (server: roles by id/email/database row, catalog writes blocked for non-admins once configured, accounts view admin-only, names; UI: name save, Accounts list and drill-down hidden from non-admins). In tests/server.spec.cjs the final count for the second user's results went from 1 to 2 because the new checks add one result for that user.
- Local preview: checked (Accounts list, drill-down, Progress name field).
- Claude Artifact: published version 15 from ac68339 (no accounts there; Accounts button stays hidden).
- Private Site: not published (Codex's job). Needs migrations 0001 and 0002.
- Practice data: not re-exported (no Artifact data change).
- Remaining issues: the repository is still public.
- Next steps for Codex, in this order: (1) "git pull" and review; (2) find the owner's identity on the Site (user id from `oai-authenticated-user-id`, and whether an email header is sent) and configure the admin (`ADMIN_USER_IDS`, or `ADMIN_EMAILS` set to the owner's email if the email header exists, or the `admins` catalog_meta row); confirm `/api/session` shows `admin: true` for the owner; (3) publish with migrations; (4) only then, with the owner's go-ahead, change the Site's access from owner-only to letting other people sign in, and confirm a non-admin account can practice but cannot edit the catalog.

## 2026-10-23: Claude Code — left side panel; owner's treadmill workout-area edits in the catalog
- Changes:
  - Wide screens (1100px+): the section switcher, title, item count, Export CSV / Bulk Edit / Add New Item and the category list now sit in a sticky left panel; the table uses the full height of the window (`max-height: calc(100vh - 150px)`). Narrower screens keep the stacked layout.
  - Owner approved bringing the Artifact-only edits into the repository: workout width/length for SF-T724011 (16 × 50), SF-T725067 (20 × 55), SF-T722021 (17.3 × 47, key dimensions 47.2" × 17.3"), SF-T722076 (16 × 45.7) in `data/treadmills.json`; notes updated. Worker: one-time `treadmill-workout-area-v2` fill puts these into existing private Site rows only where the field is still empty (Site edits win).
  - tests/treadmill-specifications.spec.cjs: the check that SF-T725067's width shows "-" and the count of 4 unknown widths now assert the new values (20 in, 0 unknown, and SF-T722021's key dimensions), because the data changed. tests/server.spec.cjs: covers the one-time fill and that a Site value is kept.
- Files: app/index.html, data/treadmills.json, data/treadmill-specifications-notes.md, server/worker.js, tests/treadmill-specifications.spec.cjs, tests/server.spec.cjs, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice.
- Local preview: checked at 1440 (dark), 1280 (light), 1024 and the practice view; no sideways scroll.
- Claude Artifact: published version 14 from 1fde18d. Its items database already holds these four values, so no database write.
- Private Site: not published (Codex's job); behind main.
- Practice data: not re-exported (no change).
- Remaining issues: owner asked for email sign-up accounts with an admin view of everyone's progress; platform limits being clarified with the owner (see next entry).
- Next steps: Codex runs "git pull".

## 2026-10-23: Claude Code — quiz answer table: fixed cell sizes, colour-only feedback
- Changes: owner reported choice text spilling out of cells and cells resizing after a click. The answer columns now share one grid (cells placed by row/column), so every row has one height across columns before and after answering; smaller choice text (14px names, 17px prices/SKUs, no mid-word breaks); removed the "✓ Correct", "✓ Answer" and "✗ Your pick" labels, so feedback is colour only (the result stays in each cell's accessible label); the help line no longer changes after answering, so nothing moves.
- Files: app/index.html, tests/practice.spec.cjs, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice. practice.spec.cjs now also checks choice text stays inside its cell, rows have equal height across columns, cells keep size and position after answering, and no text marks.
- Local preview: checked at 1230px (dark) and 390px.
- Claude Artifact: published version 13 from a32c087 (recorded in the follow-up commit).
- Private Site: not published (Codex's job); still behind main.
- Practice data: not re-exported (no app data change).
- Remaining issues: same as the 2502a7e entry (owner treadmill edits only in the Artifact; public repository).
- Next steps: Codex runs "git pull".

## 2026-10-23: Claude Code — Claude Artifact republished with SKU practice (2502a7e)
- Changes: republished `app/index.html` from main 2502a7e to the Claude Artifact (version 12; capabilities assets, db, downloads, user carried forward). Added `photoChecked`/`photoMasks` from `data/*.json` to all 156 `items` documents with field-level updates pinned to the versions read; every picture matched `data/*.json` (same imageAssetId) and no other field was written, so the owner's app-only treadmill edits (2502a7e entry) are untouched. Exported the Artifact's practice results: none yet (`data/users/<owner>/` holds no practice documents).
- Files: HANDOFF.md, practice-data/claude-artifact.json (new, 0 results)
- Tests: unchanged since 2502a7e (all 8 passed twice). Read back sf-t724011: masks present, owner's productSpecs kept.
- Local preview: not needed.
- Claude Artifact: published version 12 from 2502a7e.
- Private Site: not published (Codex's job); still on version 12 from 6d1a426, behind main (app, server, drizzle, data changed).
- Practice data: exported practice-data/claude-artifact.json (0 results).
- Remaining issues: same as the 2502a7e entry.
- Next steps: Codex runs "git pull".

## 2026-10-23: Claude Code — SKU practice: study cards, quiz, progress dashboard, photo masks
- Changes:
  - New **SKU Practice** and **Progress** views (buttons above the title, `?view=practice|progress`). Setup: categories, fields (SKU / item name / price, any combination), "Review missed items only". Study cards with ‹ › / arrows / wheel / swipe. Endless quiz with 3 choices per field (a table with one column per field), light green / light red feedback with the right answer in green, keys 1–3 and Enter, Stop shows a session summary. Weighted toward missed items (last 8 answers; 75%+ over at least 4 = mastered and shown far less; never the same item twice in a row).
  - Only the asked fields are hidden, and the photo never gives the answer away: every catalog picture now has `photoChecked: true` and, for 61 of them, `photoMasks` boxes over printed SKUs/model numbers, product-type words (TREADMILL, BIKE, ROWER, ELLIPTICAL, ROW-N-RIDE, PILATES) and weight labels. I checked all 156 pictures by eye (no OCR in the container). An unchecked picture (e.g. newly uploaded) stays blurred until answered; editors can add a box with "Hide part of photo". Replacing a picture clears its masks.
  - Progress dashboard: answers, accuracy, days practiced, streak, mastered products; by field (most correct / most missed), daily accuracy chart with table view, by category, most missed and best known products; 7/30/90 days or all time; export CSV, export/import a results file, reset.
  - Storage, private to the signed-in user: private Site `practice_attempts` table (migration `drizzle/0001_practice_attempts.sql`) via `GET/POST/DELETE /api/practice`; Claude Artifact `data/users/<id>/practice-*` documents. Worker keeps and sanitizes `photoChecked`/`photoMasks`, keeps them on edits that omit them, and imports them once into existing D1 rows whose picture is unchanged (`photo-masks-v1`).
  - Tracking data for both agents: `practice-data/` (README with format) + `npm run practice-report` (merges `claude-artifact.json` and `private-site.json`, prints the Progress numbers). AGENTS.md: "git pull"/"git push" now include the practice export and report, new "SKU practice data" section, photo-mask catalog rule, HANDOFF "Practice data" line. CLAUDE.md: where Claude Code finds the Artifact results.
  - Fixed: the catalog column code used the first `thead` on the page; it now targets the catalog table only.
- Files: app/index.html, server/worker.js, db/schema.ts, drizzle/0001_practice_attempts.sql, drizzle/meta/*, data/*.json (photoChecked, photoMasks), scripts/preview.mjs, scripts/screenshots.cjs, scripts/practice-report.mjs (new), package.json, practice-data/README.md (new), tests/practice.spec.cjs, tests/practice-artifact.spec.cjs, tests/practice-report.spec.cjs (new), tests/server.spec.cjs, README.md, AGENTS.md, CLAUDE.md, HANDOFF.md
- Tests: all 8 tests/*.spec.cjs passed twice in a row (5 existing + 3 new; server test extended for practice API and masks; no existing assertion changed). `npm run build` OK. `npm run screenshots` OK (now also practice setup, question, answered, progress).
- Local preview: checked (desktop and 390px phone, no sideways scroll).
- Claude Artifact: to be republished from this commit (follow-up entry).
- Private Site: not published (Codex's job). Needs the new migration applied when Codex publishes this commit.
- Practice data: none yet (feature is new).
- Remaining issues: the Artifact's catalog database has owner edits not in `data/*.json`: workout-area width/length (and one key dimension) on SF-T724011, SF-T725067, SF-T722021, SF-T722076, made 2026-10-20 in the app. Left untouched; owner to decide whether they go into the repository. The repository is public, so practice exports in `practice-data/` are public.
- Next steps: Codex runs "git pull": reviews this, publishes the private Site with migrations, exports `practice-data/private-site.json` once there are results, runs `npm run practice-report`.

## 2026-10-22: Claude Code — "git pull" / "git push" keep each agent's preview link current
- Changes:
  - AGENTS.md: defined the owner's commands. "git pull" = sync, review the other agent's work, tests, screenshots, then update your own preview link if it is behind main. "git push" = tests, HANDOFF entry, commit with Agent trailer, push, then update your own preview link. "publish site" = publish now. Owner gave standing permission: Codex keeps the private Site current, Claude Code keeps the Claude Artifact current, both only from pushed main commits with all tests passing, recording the published SHA.
  - scripts/incoming.mjs replaces scripts/incoming.sh so the review works on Windows (Codex has no bash). Run with `npm run incoming -- "Codex"` or `npm run incoming -- "Claude Code"`. Merged-in history is summarized by its merge commit.
  - CLAUDE.md and .claude/hooks/sync-main.sh point to the new command.
- Files: AGENTS.md, CLAUDE.md, HANDOFF.md, package.json, scripts/incoming.mjs (new), scripts/incoming.sh (removed), .claude/hooks/sync-main.sh
- Tests: all five tests/*.spec.cjs passed after reviewing Codex's 6d1a426 and 0c149b8 (only HANDOFF.md, desktop.png and mobile.png changed; app code identical to 467604e; both runtime paths intact). incoming.mjs run for both agents.
- Local preview: not needed (no app change).
- Claude Artifact: not republished; already on the current app code (467604e).
- Private Site: not touched by Claude Code; Codex recorded version 12 from 6d1a426 (same app code as main).
- Remaining issues: none.
- Next steps: Codex runs "git pull" under the new AGENTS.md rules.

## 2026-10-22: Codex — publish reconciled main to private Site version 12
- Changes: published the existing owner-private Site from tested GitHub main commit 6d1a426caa417ea4631205be8aa8d17531353ddb. That merge includes 467604e and recovered Site commit 7dac947c6289c50e6bac3180d572a32483e5bfd0. The old Site tree had no unique application code beyond bc55acb; its two historical screenshots were preserved by the merge.
- Files: HANDOFF.md (publication record only).
- Tests: all five tests/*.spec.cjs passed on first post-merge run; standalone Worker and migrations built successfully. Both same-origin /api and window.claude fallback retained. No catalog files changed and no database writes performed by Codex.
- Local preview: app unchanged from previously verified picture navigation.
- Claude Artifact: not republished by Codex; Claude handoff records 467604e app code, which remains the current application code.
- Private Site: published version 12, exact source SHA 6d1a426caa417ea4631205be8aa8d17531353ddb. Deployment appgdep_6ada2e929f908191a34f5564ea3a516f succeeded at 2026-10-22T15:41:23Z. URL: https://sunny-product-finder.steven-peace.chatgpt.site . Existing custom owner-only access preserved. Saved version source provenance independently checked with get_site_version.
- Remaining issues: none blocking publication. This follow-up documentation commit is intentionally newer than the deployed source SHA; application code is identical.
- Next steps: next agent syncs main and reviews these Codex entries. Do not republish solely for this documentation entry.
## 2026-10-22: Codex — reconcile Site source history before publishing main
- Changes: reviewed Claude Code commits 60c1948 and 7566e38; recovered deployed commit 7dac947c6289c50e6bac3180d572a32483e5bfd0 from the Site source repository. Its tree equals GitHub bc55acb except for desktop.png and mobile.png. Merged that history without conflicts, preserving both screenshots and all newer main code, including 467604e.
- Files: desktop.png, mobile.png, HANDOFF.md. No app, server, catalog, or test changes.
- Tests: all five tests/*.spec.cjs passed on first run before merge; post-merge verification follows before publication. Windows-only browser and screenshot paths substituted by an untracked launcher outside the repository.
- Local preview: picture navigation previously verified; app unchanged by this merge.
- Claude Artifact: not republished by Codex; Claude handoff records app code from 467604e.
- Private Site: owner authorized publication; version 11 currently uses 7dac947. Publication of this pushed main commit follows, with exact version and SHA to be recorded in a subsequent entry.
- Remaining issues: bash is absent, so incoming.sh was inspected and its Git checks performed directly. Historical commits without Agent trailers predate the shared rule.
- Next steps: push merged main, re-test, publish with existing owner-only access, then record deployed version and source SHA.
## 2026-10-21: Claude Code — private Site runs code that isn't in GitHub
- Changes: investigated why the private Site differs from main. Codex reports the Site's deployed version 11 was built from commit 7dac947. That commit is not in steveh00898/SS (not on main or any branch; `git cat-file -t 7dac947` fails after a full fetch), so the Site runs code that only exists in the workspace that published it, and it does not include main's later work (picture-viewer navigation b8b6c41, d7751e4, SKU beside the name 467604e). Corrected the dates of my two earlier entries to Pacific time and made AGENTS.md require recording the deployed commit for every Site publish.
- Files: HANDOFF.md, AGENTS.md
- Tests: none needed (docs only).
- Local preview: not needed.
- Claude Artifact: not republished (app unchanged; runs the 467604e code).
- Private Site: not published by Claude Code (no access). Deployed version 11 from 7dac947 (unknown to GitHub).
- Remaining issues: whoever has 7dac947 needs to push it (or confirm it can be dropped), then the Site must be republished from main.
- Next steps: Codex finds 7dac947 in its workspace, pushes or merges it into main, and — with the owner's go-ahead — publishes the Site from main HEAD, recording the deployed SHA here.

## 2026-10-21: Claude Code — start-of-task review routine for both agents
- Changes:
  - AGENTS.md: "Start of every task" routine for both agents: sync, list what arrived since your own last commit, review each incoming commit against its message and HANDOFF entry, check both runtime paths in app/index.html, run all tests, screenshot app changes, compare changed catalog data read-only, then report to the owner before new work.
  - scripts/incoming.sh "<agent>": lists commits since that agent's own last `Agent:` commit (with each commit's agent), files changed, new HANDOFF.md entries, and flags commits without a trailer and changes to AGENTS.md, CLAUDE.md, the app, data and tests.
  - .claude/hooks/sync-main.sh: also lists the commits it pulled at session start.
  - CLAUDE.md: Claude Code runs the routine with `scripts/incoming.sh "Claude Code"` every time.
- Files: AGENTS.md, CLAUDE.md, HANDOFF.md, scripts/incoming.sh, .claude/hooks/sync-main.sh
- Tests: no app or test change. Script and hook syntax-checked; incoming.sh run for both agents; hook tested on a clone two commits behind (listed both pulled commits with their agents).
- Local preview: not needed.
- Claude Artifact: not republished (app unchanged; still runs 467604e code).
- Private Site: not published (needs the owner's explicit request). Codex reports it is deployed version 11 built from 7dac947, a commit that is not in GitHub (see 2026-10-21 entry below).
- Remaining issues: Codex has no `Agent: Codex` commits yet, so on its first run incoming.sh shows the last 10 commits instead; commits before 7cc786f have no trailer and are flagged — that's expected history, not a problem.
- Next steps: Codex runs the routine with `scripts/incoming.sh "Codex"`, reviews 7cc786f and this commit, and adds its own HANDOFF entry.

## 2026-10-21: Claude Code — shared agent rules, handoff log, flaky test fixed
- Changes:
  - AGENTS.md now holds the shared rules for every agent: sync before work, one agent at a time, tests must pass every time, `data/*.json` is the canonical catalog (reconcile app-only edits before writing either database), HANDOFF.md log, `Agent:` commit trailer, and publishing rules (Claude Artifact updated automatically after completed and tested changes; private Site only on the owner's explicit request).
  - CLAUDE.md trimmed to Claude-specific notes and a pointer to AGENTS.md.
  - HANDOFF.md created (this log).
  - tests/column-controls.spec.cjs: fixed the flaky edit-save check. Root cause: the edit dialog moves focus to the Name field about 30 ms after opening, and the test sometimes started typing in a spec field before that, so the first characters went into Name and the save kept the old spec values (seen as `2 == 4` / `10 == 13`). The test now waits for focus to reach the Name field after each "Edit" click before typing. No assertion was changed or removed; the app's behavior is unchanged.
- Files: AGENTS.md, CLAUDE.md, HANDOFF.md, tests/column-controls.spec.cjs
- Tests: column-controls passed 12/12 runs after the fix (it failed about 1 in 3 before). github-ui, treadmill-specifications, catalog-specifications and server tests pass.
- Local preview: not needed (no app change).
- Claude Artifact: not republished; `app/index.html` unchanged. It runs the code from 467604e (picture-viewer arrows, SKU beside the name).
- Private Site: not published. Last known state from Codex: synced to 467604e but publishing was blocked by Codex's sandbox credential policy.
- Remaining issues: the private Site still shows an older version until the owner approves a publish from Codex.
- Next steps: when the owner asks, Codex publishes the private Site from main and records the result here.

## Earlier work (summary, before this log existed)
- Catalog of 156 products across the 11 homepage categories, cropped pictures, specification columns for treadmills, ellipticals and rowers, column controls, picture viewer with next/previous navigation and SKU beside the name.
- `npm run preview` and `npm run screenshots` for agents that cannot open the Claude Artifact.
