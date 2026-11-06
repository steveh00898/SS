# Off Sunny web: V3 batch four (2026-11-06)

Adds 100 distinct models from 83 V3 files, in filename order after the already processed files. Totals become Current website 156, Off Sunny web 220, All 376.

- `batch-four-selection.json`: the 100 models and their source files.
- `batch-four-sources.json`: file SHA-256, sheet, model cell, name, category, field count and notes per model.
- `batch-four-resources.json`: exact-model evidence for product pages, manuals, videos and images.
- `batch-four-deferred.json`: files passed over and why.
- `scripts/import-v3-batch-four.py`, `scripts/research-v3-batch-four.py`: how these were produced.

## Decisions

- A model is accepted only if its cell matches the filename (or a known multi-model workbook) and the sheet gives a descriptive name. `.xls` and PDF files reached in filename order were passed over and left for later.
- Chinese glosses in bilingual cells are removed, not translated. Form prompts are excluded.
- Ski trainers have no dedicated category and use Essentials. Medicine balls, slam balls, kettlebells, bars and plates use Weights. Climbers use Steppers.
- SF-E326015-GY keeps the hyphen printed in its model cell; its filename has none.
- SF-OP01 forms hold the title in the model cell and the SKU in the name cell; the two are swapped back, with a note on the record.

## Resources

- A product link needs a variant SKU equal to the model. A manual or video needs a guide page whose heading starts with the model. Manuals were opened and checked to be PDFs; video titles were read.
- SF-S025005: the guide page embeds a video titled for SF-S023005, so it is left unavailable rather than assumed to be a typo.
- The SF-S023812 and SF-T722051 videos are unboxing videos on those models' guide pages.
- Images prefer the manual page, then the exact variant. Nine use spec-sheet images. SF-E323050 and SF-RW5864 SMART use a hand-picked sheet image; all SF-GL01 sizes share the workbook's one photo. SF-S025025WT's official image shows a person, and SF-T724043's sheet image has a small icon in one corner.
- Photos stay `photoChecked: false`, so SKU practice blurs them until printed text is checked.

## ISV

97 of 100 match. SF-E326015-GY, SF-SK025801 and SF-T724043 have no row in ISV 4.0 and show ISV unavailable.

## Packaging

The Worker is limited to 10 MiB gzip, so these images are not embedded. The Worker loads each once from the pinned public commit in `BATCH_FOUR_IMAGE_REVISION`, then serves it from R2. If the repository is made private, these images need another home first.
