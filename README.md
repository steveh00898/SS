# Sunny Product Finder — local implementation

Status: single-file app implemented; core mocked-browser tests passed. NOT published to Claude. NOT seeded with real products. No live-data count, product pictures, or contact sheet has been verified. Only treadmills are in scope.

## Files

- `app/index.html`: single-file HTML; embedded Poppins and Roboto Condensed fonts; no hardcoded product records and no remote image hotlinks.
- `work-fetch.py`: paginated live Sunny feed retrieval and the requested PIL JPEG crop/contact-sheet pipeline. Requires Pillow and network access to sunnyhealthfitness.com and its actual image hosts. Produces `data/treadmills.json`, `data/images/treadmills/*.jpg`, and `data/contact-sheet.jpg`. This run was blocked by the proxy (403).
- `tests/mock-host.js`: artificial fixtures; for testing only, never for a real catalog seed.
- `tests/catalog.spec.cjs`: Playwright checks with local Chromium. The original requested `/opt/pw-browsers` is absent; this environment uses `/usr/bin/chromium`.
- Font licenses accompany the bundled fonts.

## Host integration still required

Claude Artifact and ArtifactData tools are unavailable in this environment. No authoritative Claude SDK contract was supplied, so the app intentionally uses an explicit adapter contract rather than pretending an invented native API exists. Before publishing, provide `window.catalogRuntime` (or `window.claude.catalogRuntime`) with:

```js
{
  user: { can: async permission => boolean }, // checks data.write
  items: {
    onSnapshot(next, error) {}, // emit [{id, name, sku, category, price, priceChecked, url, imageUrl, imageAssetId, createdAt, updatedAt}]
    async set(id, fields, {createOnly}) {}, // collection items; enforce createOnly atomically
    async delete(id) {},
    async move(oldId, newId, fields) {} // atomic collision-checked SKU rename
  },
  assets: {
    async upload(file) { return {id}; },
    async url(assetId) { return artifactCspAllowedAssetUrl; }
  },
  downloads: { async save(blob, filename) {} }
}
```

The adapter must be implemented using the actual Claude APIs and tested in the host. The host must enforce write authorization and SKU uniqueness; hiding controls does not replace database authorization. External image URLs are never rendered. Asset IDs are resolved through the host. No local storage database substitutes for shared data.

Publish privately with requested capabilities `{db:{}, user:{}, assets:{}, downloads:true}` only once the real integration is available. Then:

1. Run `python work-fetch.py` against the live source; inspect the contact sheet.
2. Upload all processed pictures in one native Artifact asset batch.
3. Populate each row's imageAssetId from the upload result and write collection `items` in one ArtifactData batch, using lowercase SKU document IDs.
4. Read back collection items; verify count against the live source (the request expects 23) and inspect fields/assets. Do not silently truncate or fabricate records to match 23.
5. Recheck native capabilities, write/viewer modes, downloads, CRUD and rename behavior inside Claude.
6. Commit populated data and app after successful publish and seed.

## Test

With Playwright installed:

```sh
node tests/catalog.spec.cjs
```

The script uses in-memory HTML because file navigation is blocked by browser policy in this environment. Test fixtures have deliberately fictional names and example.com links. Screenshot files display those fixtures, not real Sunny data.

## Known limits

- No real Claude adapter, private Artifact URL, ArtifactData seed, image upload, or 23-row readback can be claimed.
- Real live catalog data and crops are absent until network access is enabled. The data directory contains only a status file, not pretend catalog records.
- Bulk saves validate all records before starting, then save each row individually with progress. A runtime failure may leave some rows saved; unsaved drafts remain for retry. Concurrent write conflicts must be rejected by the host adapter.
- Category tabs and live table filtering reflect saved records while bulk drafts persist through those filters.
