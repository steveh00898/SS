# V2 spec sheets vs the app: conflicts

Imported 2026-11-01 from "Sorted Master SPEC SHEET - V2". **The app wins**: none of these app values were changed. The Excel value is kept only in the record's Product Spec details (`specDetails`), and the Product Spec dialog still shows the app value for these fields.

Compared fields are the comparison columns that have a sheet counterpart: maximum user weight (lb), assembled dimensions (treadmills: running area and workout-area width/length against the sheet's running surface), peak HP, maximum speed, resistance levels, elliptical stride and maximum incline %. Numbers are compared in inches and pounds with a small rounding tolerance (0.6 in or 2.5%, 1 lb). Names, prices, images and links were not changed and are not compared: sheet product names are factory descriptions, not website titles.

| # | Model number | Product | Field | App value | Excel value | Sheet file | Cell |
|---|---|---|---|---|---|---|---|
| 1 | SF-E324005 | 16-Level Smart Magnetic Resistance Elliptical | Stride length (in) | 12 in stride | 290mm / 11.4" | SF-E324005 FINAL SPEC SHEET 20240929.xlsx | Sheet1!B65 |
| 2 | SF-RW1205SMART | Smart Compact Hydraulic Rowing Machine with 12 Levels Hydraulic Resistance | Assembled / product dimensions | 54"L × 20"W × 23"H | 1475*510*630MM 58.1*20.1*24.8inch | SF-RW1205 SMART FINAL SPEC SHEET 08082023.xlsx | Sheet1!B14 |
| 3 | SF-S020027SMART | Smart Twist Stepper with Handlebar | Maximum user weight (lb) | 350 | 110 KGS/250 LBS | SF-S020027 SMART final spec sheet 20240105.xlsx | SF-S020027 SMART!B21 |
| 4 | SF-S020027SMART | Smart Twist Stepper with Handlebar | Assembled / product dimensions | 27.8L x 19.5W x 56.1H in | 675*485*1425 MM/ 26.6*19.1*56.1 INCHES | SF-S020027 SMART final spec sheet 20240105.xlsx | SF-S020027 SMART!B14 |
| 5 | P2410 | Pink Smart Advanced Stair Exercise Stepper with Handlebar and Resistance Bands | Maximum user weight (lb) | 220 | 150kgs / 330lbs | P2410 FINAL SPEC SHEET 20240909.xlsx | Sheet1!B19 |
| 6 | SF-T724081 | Pace 500 Smart Auto Incline Treadmill with Wi-Fi Connectivity | Dimensions column (running area L × W) | 52.4" × 18.1" | 1270*457mm/50*18inches | SF-T724081 Treadmill Final Spec dated 4.24.2025.xlsx | Specs!B37 |
| 7 | SF-T724081 | Pace 500 Smart Auto Incline Treadmill with Wi-Fi Connectivity | Workout-area length (in) | 52.4 | 1270*457mm/50*18inches | SF-T724081 Treadmill Final Spec dated 4.24.2025.xlsx | Specs!B37 |
| 8 | SF-T723017 | Excel Smart Incline/Decline 20” Deck Treadmill with 300LB Weight Capacity | Dimensions column (running area L × W) | 55" × 20.1" | 510*1350mm/20*53.1 inches | SF-T723017 Treadmill Final Spec dated 4.29.2025.xlsx | Specs!B38 |
| 9 | SF-T723017 | Excel Smart Incline/Decline 20” Deck Treadmill with 300LB Weight Capacity | Workout-area length (in) | 55 | 510*1350mm/20*53.1 inches | SF-T723017 Treadmill Final Spec dated 4.29.2025.xlsx | Specs!B38 |
| 10 | SF-T722022 | Slim Interactive Auto Incline Smart Foldable Treadmill | Incline (max %) | Auto electric, 12 levels; up to 12.27% | 1.3-12.6% (see the right spreedsheet) | SF-T722022 Treadmill Final Spec 20260701.xlsx | Specs!B48 |
| 11 | SF-BH6920 | Power Zone Premium Adjustable Multifunction Incline/Decline Bench | Maximum user weight (lb) | 500 | 330 lb | Spec Sheet for SF-BH6920 06212023 - unconfirmed.xlsx | Sheet1!B12 |
| 12 | SF-BH6921 | Adjustable Workout Bench Utility Weight | Maximum user weight (lb) | 430 | 330 lb | SF-BH6921 Spec Sheet 2023.06.21.xlsx | Sheet1!B14 |

Notes:

- SF-BH6920 and SF-BH6921: the sheet gives a total capacity with a separate user-weight limit (SF-BH6920 B12: "500 lb (Max User Weight 330 lb)"; SF-BH6921 B14: "430 lb (Max User Weight 330 lb)"). The app shows the total as maximum user weight.
- SF-T724081 and SF-T723017 running area: the sheet value is the available running surface; the app value may come from a different measurement (for example the belt).
- SF-S023056: the sheet's user-weight cell (B19) holds an order-specific remark, so it was not imported or compared. Its later-order figure, 330 lb, matches the app.
- Total: 12 conflicts across 9 products.
