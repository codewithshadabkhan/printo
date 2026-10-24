# Network evidence and independent mock-service contracts

## Reference evidence ledger

Only normal public page/link retrieval was used. No DevTools request trace, HAR, fetch payload, auth cookie/token or private endpoint was available. The rows below are document navigations, **not captured XHR contracts**. GET is the conventional retrieval method used by the reader; the reference browser's actual request sequence is U.

| Public path                        | Purpose          | Observable response                       | Request fields / pagination                                                                                   |
| ---------------------------------- | ---------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| /business-cards/standard           | Product document | HTML/text controls; option loading        | No configuration API captured                                                                                 |
| /business-cards/standard/templates | Gallery document | Filter/search labels and results snapshot | Product browse link also includes attributes and selectedOptions parameters; meanings beyond their text are U |
| /c/                                | Cart document    | Shared shell only                         | Cart fields/payload U                                                                                         |
| /my-account/                       | Account document | Sidebar/navigation shell                  | Auth/session/API U; no login attempted                                                                        |
| /customer-care/help-centre/        | Help document    | Search/topic links                        | Article requests are public document links                                                                    |

No private API dependency is used by the recreation. Do not turn these unknowns into a guessed original schema.

## Implemented local transport

The independent mock services in `src/services.ts` are **in-browser Promise functions**, not HTTP routes. They run without network access, with configurable latency (140 ms by default), AbortSignal support for quotes/delivery, and deterministic next-call failures for tests via `configureMock`. The names below are actual exported functions; hypothetical REST paths are deliberately not claimed as implemented.

| Operation                             | Input                                                                                                                                                    | Response                           | Errors / handling                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| quoteService                          | product, configuration, optional signal                                                                                                                  | versioned integer-paise quote      | invalid options throw; aborted calls ignored; UI sequence guards stale completion and offers retry                            |
| deliveryService                       | six-digit PIN, optional signal                                                                                                                           | [{id,name,pricePaise,days}]        | VALIDATION, UNSERVICEABLE, NETWORK; cancellation and retry                                                                    |
| placeOrder                            | item snapshot, expected fingerprint, latest-cart callback, coupon, address, delivery/payment enums, acknowledgement, intent key, optional session expiry | local Order                        | EMPTY_CART, CART_CHANGED, VALIDATION, DELIVERY_CHANGED, UNSERVICEABLE, COUPON, SESSION_EXPIRED, UNAVAILABLE, NETWORK, STORAGE |
| getSession / signInDemo / signOutDemo | no credentials                                                                                                                                           | fixed alias/expiry or null         | session storage error; no real authentication                                                                                 |
| getOrders                             | optional clock                                                                                                                                           | retained valid local snapshots     | malformed data discarded; no remote pagination                                                                                |
| reorderItems                          | order snapshot, current cart                                                                                                                             | new cart and skipped-item messages | validates current catalogue/config and capacity                                                                               |

placeOrder deduplicates in-flight requests by intent and returns an already-saved confirmation for the same intent. It validates current cart content after the simulated delay and recomputes coupon/prices/delivery before saving. The UI clears its cart only after successful persistence.

Search/gallery use synchronous local data and URL pagination; there is no request, loading spinner or ranking API to invent. File reads use FileReader and the browser's image decoder; no upload request is made. Full address is session-only and never sent anywhere. No payment credential schema exists.

For a real backend, define authenticated, server-authoritative catalogue/quote/cart/order contracts separately; do not rely on these client values for charging or permissions.

`placeOrder` also accepts an optional AbortSignal. Leaving local checkout aborts a pending request; explicit cancellation before its save point produces no confirmation. The reference site's request/cancellation semantics remain unverified. The latest native-browser retry failed before navigation; no reference request trace has become available.
