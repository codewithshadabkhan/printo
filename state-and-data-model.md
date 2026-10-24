# Local state and data model

These are independent TypeScript models, not inferred reference schemas.

| Model             | Fields / ownership                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalogue Product | id, category, image, base price seed, base pack, route, sample rating; static `data.ts`                                                         |
| Configuration     | quantity, stock, corners, delivery, size, material, finish, colour, orientation, sides; central rule validation                                 |
| Quote             | price version, canonical configuration, merchandise/delivery/total/unit paise, taxIncluded; recomputed, not persisted as cart authority         |
| DesignDocument    | schema 1, id, product/template ids, updatedAt, front/back faces; each face has text, colour, font, alignment and optional raster data/transform |
| Design history    | up to 20 past snapshots, present, future; component memory; new edits clear redo                                                                |
| CartItem          | canonical key, productId, configuration, sets, optional label and immutable design snapshot                                                     |
| Cart envelope     | schema 2, updatedAt, expiresAt, items; guest localStorage, seven-day TTL                                                                        |
| Coupon            | code, minimum, category scope, percentage basis points, cap, expiry; static fixtures; raw applied code stored locally                           |
| Address           | id, name, line, city, state, PIN, phone; validated, session-only                                                                                |
| Demo session      | fixed alias and expiresAt; 30-minute sessionStorage, no credentials or auth token                                                               |
| Checkout          | current cart fingerprint, address, checked PIN/options, delivery, payment enum, acknowledgement, request lock and intent key; component state   |
| Local Order       | DEMO id, timestamp, idempotency key, immutable item snapshot, recomputed totals, city/PIN, delivery name, demo payment enum, simulation status  |

## State placement

- URL: product configuration; catalogue query/category/price band/sort; gallery query/filter groups/sort/page; editor product/template/resume intent; confirmation ID. Back/Forward restores listing controls. URL inputs are normalised; no images/addresses are put in URLs.
- Temporary component state: open menus/dialogs, quote status/retry sequence, editor active face/history before explicit save, upload progress, validation errors, current checkout/address edits and acknowledgement.
- Shared application state: current guest cart, saved IDs and notifications. The cart ref exposes the latest state to in-flight confirmation checks.
- localStorage: `printo-cart-v2` (legacy v1 migration), `printo-saved-v1`, `printo-coupon`, per-product `printo-draft-*`, `printo-orders-v1` (20 orders/30 days). Raster drafts can exhaust storage; failures must be shown.
- sessionStorage: `printo-session`, `printo-address`; no real credentials or raw payment details. Orders omit full name/address/phone.
- Server-owned state: **none in this mock**. Browser stores are user-editable and not secure authority. A real deployment must move price/coupon/permission/order validation and idempotency to its own backend.

Cross-tab cart events reload and validate the v2 envelope. The implementation does not provide multi-device synchronisation or transactional cross-tab locks. A race between separate tabs is a documented limitation. A normal refresh does not reset a valid configuration or extend an unchanged cart's expiry.
