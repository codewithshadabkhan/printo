# Phase 4 functional specification

Status: independent local implementation; verification results are in `validation-results.md`. The reference audit is text/link inspection, not source-code or network reconstruction.

## Evidence classification

- **O**: observed text, control or link in publicly retrieved content. It does not prove the control's runtime outcome.
- **I**: inferred implementation approach; never a statement about VistaPrint's internals.
- **L**: defined local rule/implementation, including all prices, checkout, session and persistence rules.
- **U**: unverified behaviour, including reference requests, defaults, dependent resets, editor and private account flows.

Evidence sources, rechecked 2026-10-24:

| ID  | Source                                                                          | What is supported                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | [Standard product](https://www.vistaprint.in/business-cards/standard)           | Delivery, corner and quantity controls; browse/upload entry points; options-loading text; tax-inclusive price description; design/safe-area guidance. Loaded option values/prices and action outcomes remain U. |
| E2  | [Template gallery](https://www.vistaprint.in/business-cards/standard/templates) | Orientation, stock, finish, colour and other filters; search; designs-per-page control. Reader count was 2882; it is a snapshot, not a local inventory target. Selection outcomes and ranking remain U.         |
| E3  | [Cart](https://www.vistaprint.in/c/)                                            | Public shell only; no usable cart payload or line-item behaviour.                                                                                                                                               |
| E4  | [Account](https://www.vistaprint.in/my-account/)                                | Account/sidebar navigation, including history/reorder; no authenticated journey inspected.                                                                                                                      |

No orders, uploads, sign-ins, address submissions or payments were performed on the reference. No sensitive network values were recorded. A public web reader is available; rendered browser launch was previously blocked and will be retried for this phase. TinyFish is not exposed as a connected tool.

## Feature / evidence matrix

| Feature                     | Evidence                       | Observed rule                         | Local implementation                                                  | Test                    | Limitations                      |
| --------------------------- | ------------------------------ | ------------------------------------- | --------------------------------------------------------------------- | ----------------------- | -------------------------------- |
| Category browsing/filtering | Category routes, E2 indirectly | Links and gallery filter labels       | Price bands and sorting; URL state                                    | UI journey; URL tests   | Category price filters are L     |
| Search/suggestions          | Shared search input            | Submission field exists               | Word matching; five deterministic suggestions; keyboard selection     | Search/UI tests         | No private ranking claim         |
| Product configuration       | E1/E2                          | Controls and listed choice labels     | Central family rules, required defaults, dependencies and resets      | Configuration tests     | All combinations/defaults L      |
| Live price                  | E1 loading state               | Tax-inclusive label; no loaded values | Integer-paise versioned price table; cancellable quote service        | Pricing/race tests      | No reference formula inferred    |
| Templates                   | E2                             | Filter/search/selection surfaces      | 24 original sample identities, URL filters/sort/page                  | Gallery/UI tests        | Small original assortment        |
| Editor/upload               | E1 entry points only           | Browse/upload and safe-area guidance  | Local raster validation, front/back editor, undo/redo, save/resume    | Design tests; editor UI | Simplified, no production export |
| Cart identity/editing       | E3 shell                       | U                                     | Product + canonical config + design content, merging, editing, limits | Cart tests/UI           | Reference merge/expiry U         |
| Coupons                     | Reference promo text only      | Applying/eligibility U                | LOCAL10/CARDS15/EXPIRED fixtures; recalculate after edits             | Coupon tests/UI         | No real campaign enforcement     |
| Guest/demo sign-in          | E4 shell                       | U                                     | Guest allowed; credential-free demo session                           | Session/UI tests        | No auth/permissions backend      |
| Address/delivery            | E1 descriptions                | PIN-dependent delivery is mentioned   | Validated local fields, fixtures and deterministic PIN service        | Address/delivery tests  | No carrier or address lookup     |
| Checkout/confirmation       | E3/E4                          | U                                     | Mock-only confirmation, current-cart validation, idempotency          | Checkout/UI tests       | No payment or real order         |
| History/reorder             | E4 navigation                  | Link present; outcomes U              | 30-day local snapshots, revalidation/current prices                   | Reorder tests/UI        | Browser-local, no fulfilment     |
| Failure/retry               | Reference loading text         | Runtime failure rules U               | Abortable services; deterministic failure fixtures; visible retry     | Service/UI tests        | No original request timings      |
| Image failure               | U                              | U                                     | Local fallback SVG with updated alternative text                      | UI test                 | Not a reference asset            |

Implementation modules: `configuration.ts`, `pricing.ts`, `model.ts`, `design.ts`, `storage.ts`, `services.ts`, `url-state.ts`, `functional-ui.tsx`. Existing React/Vite/CSS stack is retained. A real backend must independently validate prices, permissions, coupons and final totals; this browser simulation offers no server authority.

## Inferences versus implementation decisions

| Observation                                         | Inference (I, not original-source fact)                   | Local proposal now implemented (L)               | Still unverified (U)                                         |
| --------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| Filter controls appear beside designs               | A predicate-driven result view could support this UI      | Deterministic local predicates and URL state     | Actual reference ranking, querying and persistence           |
| Product options and a price area coexist            | A configuration/quote model could connect them            | Central rules and cancellable Promise quotes     | Reference dependencies, request order and pricing algorithm  |
| Cart/account shells are incomplete in reader output | Client initialisation or access requirements are possible | Independent guest cart and mock session/checkout | Why the reference shell is incomplete; its actual data model |

Final local checks: build/type/lint and all 31 tests passed. Rendered-browser QA is blocked at launch; see `validation-results.md` for evidence. This establishes the local rules' behaviour within the tested scope, not parity with inaccessible reference flows.
