# VistaPrint India local UI study

React 19, TypeScript, Vite and plain CSS. The original workspace was empty. Phase 1 documents were written before application code; Phase 4 extends the independent functional model.

The app is a working local recreation with **simulated commerce**, not a verified pixel match or a copy of the reference backend. Public text/link evidence is separated from inferred and local rules. Reference rendering, computed styles and browser traffic inspection remain blocked in this execution environment. All imagery is original replacement artwork.

## Run

```sh
npm ci
npm run dev
```

Production build with direct-route refresh support:

```sh
npm run build
npm run preview
```

Preview uses http://127.0.0.1:4173 (`PORT` can override it). This sandbox previously rejected listening on local ports, so no running preview URL is claimed here. The exact production resolver is tested in-process.

## Try the complete local journey

Open `/business-cards/standard`, choose quantity 500 and browse an original template. Preview its name or open the local editor. Save a front/back draft, preview and add it to the cart. In `/c/`, edit options/sets and apply **LOCAL10** (₹500 minimum eligible merchandise, 10% discount capped at ₹300). Continue to `/checkout`, use guest or demo sign-in, check the fictional address's PIN, choose delivery and a demo payment label, acknowledge the simulation, and confirm. Review `/my-account/orders` and reorder at current local prices.

No real order or payment is created. There are no card-number, CVV, password or real authentication fields. Local image files never leave the browser. Use fictional address details; the full address stays in tab session storage, and history retains only city/PIN.

## Implemented scope

- Homepage, 12 category routes, 42 product routes and their original galleries; many catalogue values are mock data.
- Product-dependent configuration rules, query restoration and cancellable sample quotes using integer-paise pricing.
- Search suggestions/keyboard selection, result sorting and categories, category price filters, URL-driven gallery filters/sort/pagination and Back/Forward restoration.
- Local front/back editor: text, font, colour, alignment, licensed-image input, clipped zoom/rotation/position, guides, low-resolution warnings, undo/redo, save/resume and preview. PNG/JPEG/WebP, 512 KiB maximum; no production-ready print export.
- Canonical cart identity, distinct designs, merging, option/quantity edits, coupons, recalculation, persistence and seven-day expiry.
- Credential-free demo session, address validation, PIN fixtures, delivery choices/dates, mock checkout, cancellation/retry, idempotency, cart-change checks, local confirmation/history/reorder.
- Existing help, sale, favourites, account/service boundaries and useful unknown-route screens; accessible controls and reduced-motion CSS.

Browser storage is user-editable and can be unavailable/full. It is not server authority. Real backend prices, permissions, coupons and payable totals would need independent server validation.

## Phase 4 documents

- [Functional specification and feature/evidence matrix](functional-spec.md)
- [Local business rules](business-rules.md)
- [Product option dependencies](product-option-dependencies.md)
- [Pricing observations and worked examples](pricing-observations.md)
- [State and data model](state-and-data-model.md)
- [Network evidence and mock-service contracts](api-contracts.md)
- [User journeys](user-journeys.md)
- [Test scenarios](test-scenarios.md)
- [Fidelity and limitations](fidelity-and-limitations.md)

Original audit: [reference](reference-audit.md), [routes](page-and-route-map.md), [tokens](design-tokens.md), [components](component-inventory.md), [interactions](interaction-matrix.md), [assets](asset-manifest.md), [plan](implementation-plan.md). See [implemented routes](docs/implemented-routes.md) and [validation results](validation-results.md).

## Verification

```sh
npm run build
npm run typecheck
npm run lint
npm test
npm run test:browser
```

Model/service tests validate dependencies, exact money, coupons, cart identities/limits/expiry, drafts/upload restrictions, address/session rules, cancellation, duplicate confirmation and changed-cart checks. React DOM checks exercise the full local journey. jsdom mocks layout/dialog/scroll primitives and cannot prove browser rendering or native focus behaviour.

The Playwright runner intercepts `http://printo.local` to serve `dist` without a listening server. Build first and provide installed Chrome/Chromium (`BROWSER_EXECUTABLE` can choose it). It captures representative pages at 1440×1000, 768×1024 and 390×844 and runs local interactions. `AUDIT_REFERENCE=1 npm run test:browser` retries **read-only** reference document captures only. It never submits reference forms or reference cart/order actions.

Current capture status and raw launch evidence are in [the comparison coverage report](docs/evidence/comparisons.html) and [browser results](docs/evidence/browser-results.json). Missing screenshots are explicitly marked; there is no visual pass unless the captures actually succeed.

## Source map

`data.ts`: catalogue. `configuration.ts`: variant rules. `pricing.ts`: versioned integer-paise engine. `model.ts`: cart and filters. `design.ts`: design history/file rules. `storage.ts`: cart TTL/drafts. `services.ts`: independent Promise-based mocks (no HTTP/private API calls). `url-state.ts`: list query state. `components.tsx`: shared shell. `functional-ui.tsx`: configuration/editor/cart/account/checkout/order screens. `App.tsx`: routes and shared state. `styles.css`: estimated tokens/responsive styling.

Not affiliated with or endorsed by VistaPrint. Full reference catalogue coverage, licensed reference assets and rendered verification remain outstanding.
