# Implementation plan

Phase 1 audit completed before app code. No existing stack found. Use React + TypeScript + Vite, plain CSS tokens and original SVG assets. Offline package cache will be used if installation is available. Local-only delivery; no deployment.

## Batch 1

1. Shared token layer, original asset pipeline, data/types and local persistence utilities.
2. Reusable shell, keyboard-operable mega menus/mobile modal, search, footer, cards/rails.
3. Homepage following observed section order (no invented unobserved hero campaign).
4. Visiting cards and signs category templates, selected additional catalogue routes using clearly simulated data.
5. Standard card product, generic selected product route template and local original-design gallery.
6. Search, favourites, browser-local cart, help and account/service boundaries.
7. Appropriate unit/component checks, type/build/lint, direct-route and asset checks.
8. Browser QA/screenshots at 1440×1000, 768×1024 and 390×844 if browser access permits; compare only against actual reference captures.

## Acceptance / audit constraints

- Header/footer and reusable templates maintain a coherent compact commerce UI.
- Buttons navigate or visibly change state; no decorative fake controls.
- Query routes and direct refresh work through SPA fallback.
- Modal focus/Escape, keyboard navigation, visible focus, reduced motion and narrow-width overflow must be checked.
- Cart is a sample configuration, prices are demo estimates, no reference backend/auth/order/payment claims.
- No copyrighted reference assets without permission.
- Missing screenshot/computed-style evidence remains a blocker to verified visual fidelity.

## Coverage checklist

- [x] Text/link audit for representative templates.
- [x] Seven requested documents drafted before implementation.
- [x] Shared components/homepage/category/product/gallery/remaining selected templates (12 categories, 42 products and local galleries).
- [x] Build/type checks, lint and nine model/route/React DOM tests passed; see validation-results.md. Rendered functional QA remains blocked.
- [ ] Reference screenshots/side-by-side differences (blocked).
- [ ] Additional catalogue batches (deferred, see page-and-route-map.md).

## Deferred batch 2

Rendered reference audit; precise token/crop adjustment; licensed photo asset replacement; additional category-specific options and industry/product families; public article detail parity. Private backend and checkout are excluded unless separately authorised and observable.

## Phase 4 extension

Implemented central option/dependency rules, integer-paise prices/coupons, canonical cart edit/merge/expiry, URL listing state, a simplified local editor/upload, mock session/address/delivery/checkout, confirmation/history/reorder, and reliability tests. Nine additional requested documents are linked from README.md. Reference APIs/private flows and exact behavioural parity remain unverified; see functional-spec.md and fidelity-and-limitations.md.
