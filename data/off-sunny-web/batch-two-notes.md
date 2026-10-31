# V3 second batch and product specifications — 2026-10-30

Scope: the ten existing Off Sunny web records receive structured specifications and verified resources; only the next ten files requested by the owner are imported. The original 156 Current website records are unchanged. Totals: Current website 156, Off Sunny web 20, All 176. Exact normalized model-number comparison found no matches between this batch and the current 156 or the first ten archive records.

## New file-to-model mapping

| Requested file | Model | Category |
|---|---|---|
| Final Spec Sheet for SF-B122061 09262023.xlsx | SF-B122061 | Indoor Bikes |
| Final spec sheet for SF-T7515 new version 04142025.xls | SF-T7515 | Treadmills |
| Final spec sheet for SF-T7515 SMART new version 04142025.xls | SF-T7515SMART | Treadmills |
| Final SPEC SHEET for SF-XFA008 - 08212023.xlsx | SF-XFA008 | Racks |
| Final Spec Sheet-SF-A023047 03.28.2025.xlsx | SF-A023047 | Essentials |
| Final Spec Sheet-SF-XF924016-240614.xlsx | SF-XF924016 | Racks |
| Holder Template.xlsx | NO. 082 | Essentials |
| No. 076 Specification.xlsx | NO. 076 | Weights |
| NO. 077GR final spec sheet 11.22.2024.xlsx | NO. 077GR | Row-N-Ride |
| No. 084 Specification.pdf | NO. 084 | Essentials |

Some actual filenames use non-breaking spaces; canonical sourceFile and audit files preserve them. Holder Template is a populated NO. 082 phone/tablet holder specification, not a blank template. SF-B122061's primary product sheet is sheet1; bearing reference tabs are not product records. SF-T7515, SF-T7515SMART and NO. 077GR are separate exact models; no SMART or color variant was substituted.

## Specifications

- `specDetails` stores transcribed public product fields, source filenames, field/cell evidence and source discrepancy notes. Internal contacts, costs, drawing references, templates and blank fields are excluded from the visible specification.
- `data/specifications/templates.json` defines one ordered section/field template per category. The app embeds the same templates; a test checks agreement. All products of a category use that template. Existing catalog comparison values take precedence for the seven editable comparison fields, so subsequent catalog edits remain visible.
- Product Spec opens an in-app dialog beneath User manual and Assembly guide. It supports desktop/phone scrolling, Close, Escape, focus containment/return, scroll locking and escaped sheet text. Missing values say Not provided; explicit source N/A values say Not applicable.
- Source inconsistencies are recorded rather than silently corrected: CB110 net weight; SF-B122061 shipping weight; SF-XFA008 carton conversions; NO. 083 name versus dimensions. NO. 076 and NO. 084 dimension units are not labelled and are not inferred. NO. 084 has no source load capacity. SF-E3872's source “no limit” does not become an unlimited capacity claim.
- T7515 models retain 48.8 in available running length separately from 50.8 in physical belt length. Their source incline level list starts at 2.5% and ends at 12%. NO. 077GR's three adjustable bands come from its features; its generic resistance-level field says N/A.

## Resources and images

- The combined 20 archive records have 17 verified official manual PDFs and eight exact-model official assembly-video links. `resources.json` records the exact guide page, PDF and video evidence. Manuals are unavailable for NO. 074-L, NO. 083 and NO. 076. A promotional video is not treated as an assembly guide.
- CB110's official guide title says CB110S, but the linked manual cover explicitly identifies CB110; the PDF cover was inspected before accepting it. The catalog model remains CB110.
- Nine new images use verified exact-model official product/assembly pages. NO. 076 has neither a verified official image nor an embedded sheet image, so it displays Image unavailable. The combined archive has 19 images.
- `batch-two-images.json` records the official page, exact-model evidence and packaged asset SHA-256. `batch-two-sources.json` records source-file SHA-256, primary sheet and decisions. Image audits for the first batch remain unchanged. Printed treadmill model/name areas are masked for practice.
- Finding an official image/page does not move an imported record into Current website. No product-page URL or price is guessed. Resource URLs also appear in CSV export and their actual anonymous clicks use the existing server-side telemetry validation.

## Safe upgrade

The Worker imports only new-batch IDs with INSERT OR IGNORE and a new one-time marker. The original import marker is retained, so deleted first-batch records are not recreated. A separate field-level backfill adds only missing specDetails/resourceLinks to archive records with the matching sourceFile. Custom names, images, comparison specifications and existing metadata are preserved. Older clients omitting new metadata retain it when saving. Both /api and window.claude runtimes consume these fields; Claude Code must sync archive data/assets to the Artifact separately.
