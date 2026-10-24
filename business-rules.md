# Local business rules

Every numbered rule below is **L**, not an observed reference rule. E1–E4 evidence is defined in `functional-spec.md`.

1. Configuration is validated centrally before quoting or adding. Invalid API combinations are rejected; changing a UI option uses explicit dependent resets. Refresh restores the product query parameters.
2. Quantity is one of 1, 2, 5 or 10 times the product's base pack. Cart sets are integers 1–99; a cart holds at most 30 distinct configurations.
3. Same Day permits standard stock, no Spot UV and at most five base packs. Choosing it resets conflicting fields. Choosing premium stock/Spot UV or a larger quantity resets delivery to Standard. Polyester resets back printing to front-only.
4. Price rules are versioned. All authoritative local arithmetic is in integer paise with half-up rational rounding. Persisted prices/keys are ignored and rebuilt from catalogue/configuration.
5. A coupon applies to eligible merchandise only, excluding all delivery. One code at a time. Minimums, category restrictions, expiry and caps are re-evaluated after every cart edit and at confirmation. Invalid applied coupons block checkout until removed or made eligible.
6. Identity is product + sorted configuration + front/back design content (or legacy design label). Design IDs/timestamps do not distinguish otherwise identical content. Edits may merge with a matching line. Different text/images/layouts stay separate.
7. Intentional repeated adds merge sets. Accidental identical add events within 400 ms are ignored. Checkout uses an in-flight lock plus service idempotency; one confirmation per checkout intent, including retries.
8. Guest cart v2 expires seven days after its last actual content change; a plain refresh does not extend it. Malformed/unavailable items are discarded with a notice. Legacy v1 items migrate once and untrusted identities are reconstructed.
9. Demo login has no password/email and expires after 30 minutes. Guest checkout is allowed. Sign-in/out preserves the browser's guest cart; no account cart exists to merge. A signed-in session expiring during confirmation requires explicit guest continuation or new demo sign-in.
10. Required address fields are name, line, city, state, six-digit non-zero-leading PIN and ten-digit Indian-format mobile. Use fictional details. Address edits are kept only in tab session storage after a successful delivery check. History keeps city/PIN, not full address/phone/name.
11. Demo PINs starting 9 are unserviceable; malformed PINs fail validation. Other valid PINs offer standard delivery. 400001/560001/700001 additionally offer express. Same Day cart lines require one of those three PINs. These are fictional serviceability rules.
12. Confirmation requires non-empty valid cart, current reviewed cart fingerprint, valid coupon/address, current PIN delivery choice, demo payment choice and explicit simulation acknowledgement. No raw payment fields exist.
13. A cart change while checkout is open clears acknowledgement; a change during the request rejects confirmation. Checkout recomputes all totals from current rules, never trusts a displayed total. A local order is saved before the UI clears the cart.
14. Local order history retains up to 20 confirmations for 30 days. Reorder revalidates items and applies current prices; unavailable/invalid/over-limit items are skipped with feedback. Old coupon and delivery selection are not reapplied automatically.
15. Failed storage writes surface a warning; state can remain temporary. Browser storage can be cleared, edited or exhausted; it is not a secure database or multi-device account.

No claim is made about reference cart merging, dependencies, authentication, coupon algorithm, price computation, session duration or storage. See `test-scenarios.md` for boundary coverage.

Pending local confirmation can be cancelled, and leaving checkout aborts its pending mock request. Cancellation before the synchronous save point creates no order. This is an independent local cancellation policy; no reference cancellation semantics were observed.
