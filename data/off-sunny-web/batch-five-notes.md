# Off Sunny web: V3 batch five (2026-11-06)

Adds the last 114 models that can be verified from the V3 folder, from 107 files. Totals become Current website 156, Off Sunny web 334, All 490. Eleven models stay out, listed in `batch-five-deferred.json` and below.

- `batch-five-selection.json`: the models and their source files.
- `batch-five-sources.json`: file SHA-256, sheet, model evidence, name source, category, field count and notes per model.
- `batch-five-resources.json`: exact-model evidence for product pages, manuals, videos and images.
- `batch-five-deferred.json`: models held back and why.
- `scripts/import-v3-batch-five.py`, `scripts/research-v3-batch-four.py` (with `five`), `scripts/merge-v3-batch-five.py`: how these were produced.

## Decisions

- Batch four's rules still apply. Two are widened, and both need an exact ISV 4.0 row:
  - A blank or code-only name on the sheet uses the ISV Product Name (29 models). The record's notes name the ISV cell.
  - A blank or misprinted model cell uses the filename when the ISV row agrees. A filename with no model uses the sheet's model cell when the ISV row agrees. These are listed in `IDENTITY` in the import script.
- Four legacy `.xls` files were read through `.xlsx` copies made by Excel; the originals are unchanged and the SHA-256 is the original's.
- ISV names are kept as written, including the "Sunn Health and Fitness" typo on SF-A026020.
- Category: rack, weight rack, power tower, dip station and attachment models use Racks, by their ISV category. Ankle weights use Weights and vests use Essentials, matching the Current website catalog. Climbers still use Steppers, so SF-E325094 is a Stepper although ISV lists it under Ellipticals. SF-XF926805 has no ISV row and stays in Essentials.
- SF-A023001 has an unusual sheet layout, so only 2 fields import. SF-T722901 has 6.

## Held back

- No product name in the sheet or ISV, and no exact website match: SF-A026811, SF-E3919 SMART, SF-RW522816, SF-RW524087, SF-S026037, SF-T726024, SF-T726031, SF-X7330, UB202.
- SF-PM10-RB ("Reformer Box"): the sheet's model doesn't match its filename (SF-PMA_01) and there is no ISV row.
- SF-A026006: the file holds only a measuring list, with no specification fields to import.

## Resources

- 80 product pages, 73 manuals, 19 videos. Same exact-model rules as batch four.
- Images: 108 official, 6 from spec sheets. All 114 were viewed on contact sheets.
- Hand-picked sheet images: SF-B222001 and SF-T722068, where the largest image was a diagram. SF-RB425097's official page shows only a "No image" graphic, so its sheet photo is used. SF-A025049's only sheet image shows the product's parts and people using it.
- Photos stay `photoChecked: false`, so SKU practice blurs them until printed text is checked.

## ISV

113 of 114 match. SF-XF926805 has no row in ISV 4.0 and shows ISV unavailable.

## Packaging

Same as batch four: images aren't embedded. The Worker loads each once from the pinned public commit in `BATCH_FIVE_IMAGE_REVISION`, then serves it from R2. If the repository is made private, these images need another home first.
