# Functional and reliability test scenarios

Actual results and counts are in `validation-results.md`. Names below map to meaningful automated cases; jsdom is not a rendering engine.

| ID         | Scenario / expected invariant                                                                        | Test layer                                      |
| ---------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| CFG-1      | Every product default validates; quantity values match base packs                                    | Rules/model                                     |
| CFG-2      | Premium/Spot UV and Same Day reset each other according to last edited field                         | Rules                                           |
| CFG-3      | Polyester removes/resets back printing; invalid direct combination rejected                          | Rules                                           |
| PRICE-1    | Quantity table examples and all option charges agree in paise                                        | Pricing                                         |
| PRICE-2    | Half-up rounding; no per-unit recomposition or float accumulation                                    | Pricing                                         |
| COUPON-1   | Threshold at/below boundary, cap, card scope, whitespace, invalid and expired codes                  | Pricing                                         |
| CART-1     | Identical content merges; different design remains separate; canonical edit can merge                | Model                                           |
| CART-2     | Invalid quantity/config/tampered identity/unavailable item rejected; 99-set/30-line limits           | Model                                           |
| STORE-1    | Seven-day expiry, unchanged refresh, v1 migration and corrupt storage notices                        | Storage                                         |
| URL-1      | Query/filter/page serialization and invalid-input normalisation                                      | URL model                                       |
| DESIGN-1   | Undo/redo, new-edit redo invalidation, front/back identity                                           | Design                                          |
| DESIGN-2   | MIME/size/signature, unsafe data URL and malformed draft rejection                                   | Design                                          |
| DESIGN-3   | Low-resolution warning and transform bounds                                                          | Design                                          |
| ADDRESS-1  | Missing fields, malformed PIN/mobile and unserviceable region                                        | Service                                         |
| ASYNC-1    | Aborted quote and deterministic failed delivery, then retry                                          | Service                                         |
| CHECKOUT-1 | Duplicate concurrent intent produces one saved confirmation                                          | Service                                         |
| CHECKOUT-2 | Cart changed during delay, expired session, invalid coupon and no acknowledgement reject             | Service                                         |
| ORDER-1    | Confirmation stores only city/PIN; reorder validates and reprices                                    | Service                                         |
| UI-1       | Product → filtered template → preview → cart edit/coupon → checkout → confirmation → history/reorder | React DOM                                       |
| UI-2       | URL restoration, empty search, suggestions, local draft editing/save/resume, fallback image          | React DOM                                       |
| RENDER-1   | Three viewport captures, native dialog focus, touch/overflow/real console                            | Playwright; blocked unless browser launch works |

Mock latency/failure controls are service test helpers, not reference behaviour. DOM primitives for layout/dialog/scroll are mocked, so passing DOM tests do not establish native focus trapping or responsive appearance. Upload decoder/crop appearance needs a real browser; pure file and document validation is tested independently.

Manual follow-up when rendering is available: choose a licensed image, test corrupt decode, slow rapid replacement/cancel, inspect image crop and warnings, resize through 390/768/1440, tab through suggestions/modal controls, navigate Back/Forward from products, refresh configured/editor routes, and change the cart from a second tab during checkout. Do not perform these mutations on the reference website.

Phase 4 result: **31/31 automated tests passed**. Additional cases STORE-2 (quota failures), ORDER-2 (changed catalogue price/malformed history), and CHECKOUT-4 (cancel pending confirmation) pass. The UI journey also verifies demo sign-in, invalid PIN feedback, express charges, history navigation, quote failure/retry, rapid quantity changes and duplicate-add suppression. Native capture/focus/layout remain blocked; see validation-results.md.
