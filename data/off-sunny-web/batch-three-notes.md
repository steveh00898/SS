# Off Sunny web — V3 batch three (2026-11-06)

The batch adds exactly **100 distinct model/variant entries from 83 V3 files**, in filename order after excluding the existing catalog and ten identity-unresolved candidates. It preserves all 156 Current website entries and the previous 20 Off Sunny web records. New totals are **Current website 156 / Off Sunny web 120 / All 276**. Based on the previous V3 inventory, 201 files representing 225 models/variants remain unimported, including the deferred candidates.

## Categories and templates

| Category | New entries |
|---|---:|
| Essentials | 40 |
| Indoor Bikes | 31 |
| Row-N-Ride | 8 |
| Weights | 7 |
| Ellipticals | 6 |
| Steppers | 5 |
| Rowers | 1 |
| Weight Benches | 1 |
| Racks | 1 |

Each category continues to use one shared Product Spec template. Twenty-five meaningful field additions make available source details visible through those templates; no item receives a private or independently arranged template. Values come from the matching visible model sheet, with file hashes and cell evidence. Missing values, template instructions and unselected answer options are excluded. Product name, category and model suffixes are preserved; no current model, SMART variant or color variant is substituted for a different model.

The seven comparison fields retain verified source information where applicable. No price, product-page URL, workout-area dimensions or capacity is guessed. Explicitly labelled units are preserved, and a header's unit is used only when the answer lacks one. Dimensions without units stay labelled as such. Kilogram-only user capacities may be converted to pounds for the numeric comparison field while the detailed source value remains available. General equipment/load capacity is not substituted for user capacity.

## Source quality decisions

- `batch-three-selection.json` is the exact 100-model manifest. `batch-three-sources.json` records source-file SHA-256, matching model evidence, worksheet/cell references and notes. `scripts/import-v3-batch-three.py` prepares a staged batch from read-only source sheets; it can freshly extract the source folder or consume the verified extraction cache.
- Ten candidates with no verified descriptive product identity are deferred in `batch-three-deferred.json`. These include blank-name draft sheets and a workbook containing force/dimension reference tables without a primary product identity. Later verified models replace them in this batch; no placeholder model-only product names or guessed categories are added.
- NO. 085's PDF was rendered and checked visually: its Item Name cell says `3 in 1 Weighted PRO-Plyo Box 30" 24" 20"`. The product dimensions are `30 × 24 × 20`, with no units labelled; no unit is inferred. Its explicitly printed maximum user capacity is 440 lb.
- NO. 086's sheet lists 80 pairs per carton together with net 8.1 kg / 18 lb and gross 8.7 kg / 19.3 lb. The visible values explicitly qualify the packing-basis ambiguity. They are not represented as verified weights of a single pair, and no per-pair weight is inferred.
- NO. 074-M uses its expressly labelled one-piece inner-box figures (3.5 lb net, 4 lb gross, 36 × 5 × 5 in), rather than the six-piece master carton. The three neoprene dumbbell pair records use their explicitly labelled per-pair weights and inner-box dimensions; wood-box master packing data is excluded.
- SF-A023053's printed product title appears in the Color cell while Product Name is blank. That explicit title is used as the name with a note; it is not presented as the color.
- Older forms sometimes include unrelated filled example/reference subsections on the same worksheet. These are scoped to the actual product type. SF-B1851 is a cycling bike: copied treadmill speed, incline, running-belt and electrical measurements, and rower reference values, are excluded. Blank MIN/MAX prompts, `pending`, generic pedal-thread choices and other form instructions do not become specifications.
- Supplier contacts, costs, creator fields, internal part references, template diagrams and unrelated drawing/reference sheets are not public Product Spec data.

## Resources and images

`batch-three-resources.json` records exact-model official search evidence, resource status and selected image provenance. The final batch contains **97 images: 18 verified official images and 79 specification-sheet images**. Three items display Image unavailable. Curated sheet images show the actual product or its product-specific drawing; bearing illustrations, packaging and unrelated template examples are excluded.

Seven manual links and one assembly-video link were verified. Official-source requests were rate-limited with HTTP 429 for 82 model searches. Those resources remain pending verification rather than being reported as definitively unavailable or assigned guessed URLs. Existing catalog resources are retained.

All 100 newly imported records keep `photoChecked: false` until their printed model/name/weight text has been reviewed and practice masks have been applied. Catalog images remain visible; the existing practice protection handles unreviewed photos. Asset/source hashes and image-selection evidence are retained in the resource audit.

## Safe deployment and continuation

Only the new batch's namespaced IDs are imported, once, using the `v3-batch-3` marker and insert-if-absent behavior. Existing records, custom uploads, manual edits and deleted earlier-batch records are preserved. New metadata continues through both the private Site API and the Claude runtime fallback, including edits and export.

The Site and Claude Artifact maintain separate databases and asset URLs. Claude Code must read and reconcile the Artifact first, insert only these new records, upload the new assets and retain its `/_blob/` image URLs. A Site publication does not update the Artifact automatically. Remaining pending resources can be researched later without changing source classification or inventing missing specifications.
