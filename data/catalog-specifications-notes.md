# Shared catalog specifications

Source: `Sunny_Master_Products_Portfolio_Value_Weighted_Summary.xlsx`, `Master Products Portfolio` sheet. All 18 Elliptical and 13 Rower rows match the checked-in category records by SKU. Existing treadmill specifications remain available through the legacy `treadmillSpecs` field; new category specifications use `productSpecs`.

All 156 products use the same seven specification columns in All, category views, bulk edit, mobile cards and CSV export. Missing information is shown as `-`, with no tier color. Other categories remain blank until their specifications are imported.

Workbook drive/resistance, speed/resistance, incline/stride/motion, capacity and dimension descriptions are preserved. Elliptical and rower dimensions are overall or folded machine measurements, not workout-pad measurements. They appear only in Key Dimensions; workout width and length remain blank. No specifications are inferred from product names or another category's duplicate SKU.

Numeric tiers use distinct values within the product's full saved category. The lowest floor(N/3) values are grey, the highest ceil(N/3) values are green, and the rest are unchanged. Fewer than three distinct values are unranked. Elliptical resistance level counts and motorized speed level counts use separate groups. Explicit numeric stride lengths are ranked within Ellipticals; qualitative long-stride descriptions remain unranked. Capacity uses pounds. Search, comparison and sorting do not change the underlying tiers.

Resistance technologies and descriptive rower motion labels are unranked because the workbook provides no standardized numerical performance scale for them. The existing treadmill HP, MPH, capacity, workout dimensions and incline-adjustability rules are preserved. Colors describe a specification band, not overall product quality or suitability.

Missing workbook values: Ellipticals have 11 missing capacities, 13 missing dimensions, 11 missing speed/resistance descriptions, and 9 missing motion descriptions. Rowers have 12 missing capacities and 12 missing dimensions. These remain blank rather than guessed.

The Worker imports the new specifications once into existing saved rows, matched by category and SKU, retaining custom product names, prices, images and other edits. Edits, bulk changes and CSV exports retain the specifications. Comparison is available across views; changing category exits the current comparison.
