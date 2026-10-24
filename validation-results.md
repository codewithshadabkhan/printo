# Validation results — Phase 4

Date: 2026-10-24. Phase 4 extends the earlier nine-test batch; the results below describe the current source.

## Completed checks

| Check                              | Actual result  | Evidence / limit                                                                                                                                                                                                                                                                       |
| ---------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript + Vite production build | PASS           | `npm run build`; strict TypeScript and 39-module production bundle                                                                                                                                                                                                                     |
| Lint                               | PASS           | `npm run lint`; generated test bundles are excluded                                                                                                                                                                                                                                    |
| Domain/model/service tests         | PASS, 28 tests | Configuration, exact paise, coupons, canonical identity/edit/merge, limits, invalid storage, migration/expiry, URL codecs, design history/upload validation, address/serviceability, sessions, failures, cancellation, idempotency, changed cart, storage quota, current-price reorder |
| Production routes/assets           | PASS, 2 tests  | In-process SPA resolver covers selected catalogue/galleries and new editor/checkout/history/confirmation routes; static entry assets resolve; missing assets/traversal rejected                                                                                                        |
| React DOM journey                  | PASS, 1 test   | Product → gallery/filter/page/save → preview/cart → coupon/edit → demo sign-in → invalid PIN → valid delivery/express → confirmation/history/reorder; search/Back restoration, editor undo/redo/save/resume, fallback image, stale quote/failure/retry and rapid duplicate add         |
| React DOM error capture            | PASS           | No console.error during that simulated journey; this is not a real-browser console pass                                                                                                                                                                                                |
| Browser capture/native QA          | BLOCKED        | Chrome aborts before a page opens; no checks or screenshots completed                                                                                                                                                                                                                  |

**31 tests, 31 passed, 0 failed.** Full passing TAP output: [phase4-tests.txt](docs/evidence/phase4-tests.txt). The build and lint were rerun after material fixes. The final DOM journey includes the local demo account/address/express-delivery path as well as guest-capable service rules.

The domain cases are in `tests/functional.test.mjs` and `tests/model.test.mjs`; route/asset checks in `tests/routes.test.mjs`; the integration journey in `tests/ui.test.mjs`. Tests intentionally exercise the independent local rules, not a guessed reference formula.

## Defects found and corrected

- Reject null/malformed persisted quantities instead of silently normalising them into an extra valid cart set.
- Recompute persisted cart keys, strip unknown configuration fields and canonicalise design-property ordering.
- Remount configured/editor routes correctly, including explicit saved-draft resume and direct configuration navigation.
- Keep selected configuration when opening a template's full local editor.
- Ignore stale/aborted quote results and disable price-dependent actions until a current quote succeeds.
- Require current-cart review, deduplicate confirmation intents, and cancel pending local confirmation on navigation/cancellation.
- Preserve storage/expiry warnings and report quota failures instead of clearing the cart after an unsaved confirmation.
- Exclude generated test bundles from lint to support simultaneous checks reliably.

## Verification limits

jsdom mocks ResizeObserver, scrolling and dialog showModal/close. It cannot validate rendered layout, actual image decoding/crop appearance, native focus trapping, contrast, touch behaviour or real browser errors. Pure upload MIME/size/signature/document validation passes; a real uploaded image's browser rendering remains unverified.

The latest Playwright retry failed at Chrome launch. [Raw browser evidence](docs/evidence/browser-results.json) has status blocked, checks [], screenshots []. [Comparison coverage](docs/evidence/comparisons.html) contains missing-capture markers, not completed screenshot comparisons. No visual or native browser pass is claimed.

Local port binding previously failed with EPERM; the exact production handler is tested without binding a port. The capture runner uses browser request interception and therefore does not require a listening server, but it still requires a browser that can launch.

Reference inspection was limited to public page/link text. No reference XHR trace, loaded option quote, cart submission, uploaded file, account sign-in, address, checkout or order was inspected or modified. The nine Phase 4 documents label observed surfaces separately from independent local rules.

## Reproduce

```sh
npm ci
npm run build
npm run typecheck
npm run lint
npm test
npm run test:browser
```

Use `BROWSER_EXECUTABLE` if necessary in an environment where Chrome can launch. `AUDIT_REFERENCE=1` additionally retries read-only reference documents; local editor/checkout routes are never sent to the reference. The runner includes the local design/confirmation journey but it was not executed here because launch failed.

Current functional scope, reference evidence and remaining omissions: [functional-spec.md](functional-spec.md), [test-scenarios.md](test-scenarios.md), [fidelity-and-limitations.md](fidelity-and-limitations.md). All commerce/session/address/delivery/order behaviour is a local mock; no real payment credentials or reference private APIs are involved.
