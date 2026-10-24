# Pricing observations and local calculations

## Reference evidence

E1's retrieved product content labels its price as tax inclusive but its option area remains loading; no configurable quote was captured. E3's generic footer excludes delivery/options unless otherwise stated. These are different scopes, not proof of a universal tax/fee formula. No authenticated cart, coupon outcome, crossed-out sale price, delivery quote or final payable amount was observed. Existing catalogue seeds are sample values, not verified current offers.

No formula is inferred from a small number of examples. All computations below are **L**, implemented in `src/pricing.ts` and `src/model.ts`; version `local-table-2`.

## Explicit local policy

Each catalogue product has a base pack quantity and rupee seed. At build/runtime, `priceTable` derives four immutable pack rows using the configured tier table: pack multipliers 1/2/5/10 and discounts 0/0/10%/20%. This is a configurable mock engine, not a reverse-engineered algorithm. Premium Matte multiplier 1.40; Premium Glossy 1.30; Rounded +₹50; Spot UV +₹80; back printing +₹40; Same Day +₹99 per set. Invalid combinations are rejected first.

Money is integer paise throughout quoting, coupon and cart totals. Rational multiplication uses BigInt and half-up division. Unit price is displayed to at most two decimals and is informational; cart totals multiply the set price, never a rounded per-unit price. Local prices include tax; tax is not added again. No GST breakup is fabricated.

| Local input: Standard card                  | Merchandise | Delivery |    Total |
| ------------------------------------------- | ----------: | -------: | -------: |
| 100, Standard Matte, front                  |        ₹200 |       ₹0 |     ₹200 |
| 200, same options                           |        ₹400 |       ₹0 |     ₹400 |
| 500, same options                           |        ₹900 |       ₹0 |     ₹900 |
| 1000, same options                          |      ₹1,600 |       ₹0 |   ₹1,600 |
| 500, Premium Matte                          |      ₹1,260 |       ₹0 |   ₹1,260 |
| 100, Standard Matte, Rounded                |        ₹250 |       ₹0 |     ₹250 |
| 100, Premium Glossy, Spot UV                |        ₹340 |       ₹0 |     ₹340 |
| 100, Standard Matte, front/back             |        ₹240 |       ₹0 |     ₹240 |
| 100, Standard Matte, Same Day               |        ₹200 |      ₹99 |     ₹299 |
| Premium Matte + Same Day submitted directly |           — |        — | Rejected |

## Local coupons and totals

LOCAL10: merchandise at least ₹500, 10%, capped at ₹300. CARDS15: eligible card merchandise at least ₹1,000, 15%, capped at ₹500. EXPIRED: deliberately expired fixture. Whitespace/case are normalised; minimums use eligible merchandise before discount. Only one coupon applies. Delivery is never discounted.

Example: 500 standard cards = ₹900; LOCAL10 saves ₹90; standard checkout delivery ₹0 → ₹810. Choose express (+₹149) → ₹959. Changing to 100 cards makes LOCAL10 ineligible and blocks confirmation until removal. Same-Day per-set fees and checkout express fees are separate, explicitly local charges.

Final local total = merchandise subtotal + per-line delivery + selected checkout delivery − eligible discount. All totals are recomputed at confirmation. No reference sale algorithm, tax authority, discount stacking or coupon eligibility is claimed.
