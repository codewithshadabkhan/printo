# Fidelity and limitations — Phase 4

The existing Phase 1–3 visual audit remains applicable. This phase extends functional behaviour without claiming private source, schemas, ranking, pricing or API knowledge.

## Matched at the level of public evidence

The local experience exposes category/product navigation, search, configurable products, template filtering, browse/upload entry points, product disclosures and account/history navigation corresponding to surfaces found in retrieved reference content. Control presence is observed; exact interaction parity is not established.

## Independent local implementations

Configuration defaults/dependencies, all quantity tiers/surcharges/coupons, search ranking/suggestions, URL persistence, editor, raster upload restrictions, cart merging/expiry, session duration, address validation, PIN serviceability, delivery fees/dates, mock payment choice, confirmation, history retention and reorder are defined locally. The source modules and tests document these decisions. They must never be presented as the original website's implementation.

The editor is a simplified two-face composition tool, not a clone of a proprietary editor. It supports bounded image transforms and illustrative guides, but does not validate production dimensions, embedded fonts, bleed or resolution for export. Apparel colour/orientation metadata does not guarantee a recoloured physical product or accurate print placement. No print-ready export exists.

## Unverified / blocked

- Reference loaded option values, prices and dependent resets; real coupon eligibility and sale computations.
- Submitted search/ranking, result persistence, cart identity/merge/expiry, account permissions, addresses and checkout restrictions.
- Reference editor tools, accepted upload formats/limits, confirmation/history/reorder results.
- All reference XHR/API payloads, timing and error responses; no HAR trace or sensitive state was captured.
- Rendered responsive screenshots, exact visual tokens and native browser states remain blocked if Chrome still cannot launch in the sandbox. No screenshot comparison is fabricated.

## Reliability and deployment limits

The app has cancellable mock quote/delivery requests, stale-result guards, confirmation locks/idempotency, configuration validation, integer totals, storage-boundary sanitisation, image fallback and expiry notices. It remains a browser-local demo: it is not a secure server, cannot enforce prices/permissions across devices, and has no transactional cross-tab storage lock. Browser storage quota/clearing and confirmation-history eviction can affect persistence/idempotency. A real backend must independently recompute and validate everything before charging.

No reference mutations, actual orders, payment requests, authentication tokens, raw card fields or credential storage are included. Addresses use fictional fixtures by default and stay in tab session storage; full addresses/phone/name are excluded from local order records. Original artwork and assets remain documented in `asset-manifest.md`.

## Explicit remaining functional coverage

- Gallery filtering implements colour, orientation, theme and industry for 24 original designs. Reference stock/corner/finish filter groups, logo/photo-area and use-case filters are not reproduced in the gallery; some corresponding product choices are available on the product page.
- Product search returns the full matching local assortment; it has no server ranking, infinite scroll or product-result pagination. Category filters are local price bands/sorting, not claimed reference attribute filters.
- Each editor face has one text identity/contact line and one image. There are no arbitrary layers, vector/PDF imports, production exports or a full design asset library. One explicitly saved draft per product is supported; navigation can discard unsaved changes. Template styling is simplified to name/colour/font/alignment, not all ornamental template artwork.
- Cart edits change options/sets while retaining the immutable design snapshot. Editing an existing cart design in place is not provided; create another design and remove the old line instead.
- Variant preview artwork is illustrative; not every size, material, colour or orientation recolours/rebuilds the product image. Live inventory/backorders, manufacturing constraints, carriers, full address-book CRUD and multi-device account/cart merge are outside the mock.

The final local build/type/lint and 31 tests pass. Native browser QA was retried and remains blocked before page launch; no screenshot, native focus or real-browser visual pass is claimed.
