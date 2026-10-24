# Product option dependencies

E1/E2 establish some option labels, not loaded defaults or combinations. The following table is the **proposed and implemented local policy** from `src/configuration.ts`. Families cover the selected catalogue; individual reference variants were not audited.

| Product                   | Option                      | Allowed values                              | Depends on              | Default        | Effect                                                                 |
| ------------------------- | --------------------------- | ------------------------------------------- | ----------------------- | -------------- | ---------------------------------------------------------------------- |
| All selected products     | Quantity                    | Base pack × 1/2/5/10                        | Delivery                | Base pack      | Select price-table row; over 5 packs resets Same Day                   |
| All                       | Delivery                    | Standard / Same Day                         | Stock, finish, quantity | Standard       | Same Day adds ₹99/set and resets incompatible choices                  |
| Visiting cards            | Corners                     | Standard / Rounded                          | None                    | Standard       | Rounded adds ₹50/set                                                   |
| Visiting cards            | Stock                       | Standard Matte/Glossy, Premium Matte/Glossy | Delivery, finish        | Standard Matte | Premium requires Standard delivery; non-Premium-Glossy removes Spot UV |
| Visiting cards            | Size                        | 89 × 51 / 85 × 45 mm                        | None                    | 89 × 51        | Identity/preview metadata only; no price surcharge                     |
| Visiting cards            | Material                    | Paper                                       | None                    | Paper          | Fixed                                                                  |
| Visiting cards            | Finish                      | None / Spot UV                              | Stock, delivery         | None           | Spot UV selects Premium Glossy and Standard delivery; +₹80/set         |
| Visiting cards            | Orientation                 | Horizontal / Vertical                       | None                    | Horizontal     | Configuration identity; editor geometry remains illustrative           |
| Visiting cards            | Printing sides              | Front only / Front & back                   | Material                | Front only     | Back printing +₹40/set                                                 |
| Apparel families          | Size                        | S / M / L / XL                              | None                    | M              | Variant identity; price unchanged                                      |
| Apparel                   | Material                    | Cotton / Polyester                          | Printing sides          | Cotton         | Polyester removes back-print choice and resets selection               |
| Apparel                   | Colour                      | Black / White / Navy                        | None                    | Black          | Variant identity; illustration not recoloured                          |
| Apparel / marketing print | Printing sides              | Front / Front & back                        | Material                | Front only     | Back +₹40/set, subject to polyester restriction                        |
| Other selected families   | Material/size/colour/finish | Fixed Standard/Full colour/None metadata    | None                    | Fixed          | Simplified local variants; no invented reference options               |
| Non-card products         | Stock/corners/orientation   | Fixed Standard Matte/Standard/Horizontal    | None                    | Fixed          | Hidden singleton controls; metadata simplification                     |

`optionRules` defines visibility/values/defaults; `changeConfig` applies last-edited-option resets; `normalizeConfig` restores invalid query values to safe defaults; `validateConfig` rejects invalid submitted or persisted combinations. The UI displays dependent-reset notices. Labels/defaults are not scattered among page-specific price conditions.

Unverified: actual minimums, increments, unavailable combinations, reference defaults/reset rules, reference colour/preview changes, option-loading responses and variant availability. The demo does not impose mock restrictions as purported VistaPrint rules.
