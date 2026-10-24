import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
const dom = new JSDOM("", { url: "http://localhost/" });
globalThis.localStorage = dom.window.localStorage;
globalThis.sessionStorage = dom.window.sessionStorage;
const bundle = await build({
  stdin: {
    contents:
      "export * from './src/data';export * from './src/configuration';export * from './src/pricing';export * from './src/model';export * from './src/design';export * from './src/storage';export * from './src/services';export * from './src/url-state';",
    resolveDir: process.cwd(),
  },
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
});
const m = await import(
  "data:text/javascript;base64," +
    Buffer.from(bundle.outputFiles[0].text).toString("base64")
);
const p = m.products[0];
const config = () => m.defaultConfig(p);
const item = () => m.makeCartItem(p.id, config());
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  m.configureMock({ latency: 0, failNext: undefined });
});
test("CFG-1: every catalogue default and quantity table validates", () => {
  for (const product of m.products) {
    assert.deepEqual(m.validateConfig(product, m.defaultConfig(product)), []);
    assert.deepEqual(
      m.optionRules(product).find((r) => r.key === "quantity").values,
      [1, 2, 5, 10].map((n) => n * product.quantity),
    );
  }
});
test("CFG-2: last selection resets premium stock, delivery, finish and quantity dependencies", () => {
  let c = m.changeConfig(p, config(), "stock", "Premium Matte");
  c = m.changeConfig(p, c, "delivery", "Same Day");
  assert.equal(c.stock, "Standard Matte");
  assert.equal(c.delivery, "Same Day");
  c = m.changeConfig(p, c, "finish", "Spot UV");
  assert.equal(c.stock, "Premium Glossy");
  assert.equal(c.delivery, "Standard");
  c = m.changeConfig(p, c, "stock", "Standard Matte");
  assert.equal(c.finish, "None");
  c = m.changeConfig(p, { ...c, quantity: 1000 }, "delivery", "Same Day");
  assert.equal(c.quantity, 500);
  assert.throws(() => m.changeConfig(p, c, "quantity", 101));
  assert.throws(() =>
    m.quoteProduct(p, {
      ...config(),
      delivery: "Same Day",
      stock: "Premium Matte",
    }),
  );
});
test("CFG-3: material removes incompatible back printing and invalid query values normalise", () => {
  const shirt = m.products.find((p) => p.id === "polo");
  let c = m.changeConfig(
    shirt,
    m.defaultConfig(shirt),
    "sides",
    "Front & back",
  );
  c = m.changeConfig(shirt, c, "material", "Polyester");
  assert.equal(c.sides, "Front only");
  assert.deepEqual(
    m.optionRules(shirt, c).find((r) => r.key === "sides").values,
    ["Front only"],
  );
  assert.ok(m.validateConfig(shirt, { ...c, sides: "Front & back" }).length);
  assert.deepEqual(
    m.configFromParams(p, new URLSearchParams("quantity=-10&stock=evil")),
    config(),
  );
  assert.deepEqual(
    m.configFromParams(p, new URLSearchParams(m.configParams(config()))),
    config(),
  );
});
test("PRICE-1: integer table and option examples match documented local prices", () => {
  assert.deepEqual(
    m.priceTable(p).map((t) => t.basePaise),
    [20000, 40000, 90000, 160000],
  );
  for (const [patch, total] of [
    [{ stock: "Premium Matte", quantity: 500 }, 126000],
    [{ corners: "Rounded" }, 25000],
    [{ finish: "Spot UV", stock: "Premium Glossy" }, 34000],
    [{ sides: "Front & back" }, 24000],
    [{ delivery: "Same Day" }, 29900],
  ])
    assert.equal(
      m.quoteProduct(p, { ...config(), ...patch }).totalPaise,
      total,
    );
  assert.equal(
    m.quoteProduct(p, { ...config(), delivery: "Same Day" }).unitPaise,
    299,
  );
});
test("PRICE-2: half-up paise rounding and totals never recompose rounded units", () => {
  assert.equal(m.roundRatio(99, 1000, 10000), 10);
  assert.equal(m.roundRatio(5, 1, 2), 3);
  assert.throws(() => m.roundRatio(1.5, 1, 2));
  const c = item();
  c.bundles = 99;
  const total = m.cartTotals([c]);
  assert.equal(total.totalPaise, 1980000);
  assert.ok(Number.isSafeInteger(total.totalPaise));
  assert.equal(m.moneyPaise(299), "₹2.99");
});
test("COUPON-1: thresholds, caps, category scope, invalid/expired codes and delivery exclusion", () => {
  assert.ok(
    m.couponDiscount("LOCAL10", [
      { category: "cards", merchandisePaise: 49999 },
    ]).error,
  );
  assert.equal(
    m.couponDiscount(" local10 ", [
      { category: "cards", merchandisePaise: 50000 },
    ]).discountPaise,
    5000,
  );
  assert.equal(
    m.couponDiscount("LOCAL10", [
      { category: "cards", merchandisePaise: 1000000 },
    ]).discountPaise,
    30000,
  );
  assert.ok(
    m.couponDiscount("CARDS15", [
      { category: "gifts", merchandisePaise: 200000 },
    ]).error,
  );
  assert.ok(m.couponDiscount("EXPIRED", []).error);
  assert.ok(m.couponDiscount("madeup", []).error);
  const c = m.makeCartItem(p.id, { ...config(), quantity: 500 });
  assert.equal(m.cartTotals([c], "LOCAL10", 14900).totalPaise, 95900);
  assert.ok(m.cartTotals([item()], "LOCAL10").couponError);
});
test("CART-1: canonical identity, different documents, edits merging and immutable snapshots", () => {
  const doc = m.createDesign(p.id);
  const a = m.makeCartItem(p.id, config(), "Mira", doc);
  const same = m.makeCartItem(p.id, config(), "Mira", {
    ...doc,
    id: "another",
    updatedAt: 0,
  });
  assert.equal(a.key, same.key);
  const other = m.makeCartItem(p.id, config(), "Mira", {
    ...doc,
    back: { ...doc.back, tagline: "Different" },
  });
  assert.notEqual(a.key, other.key);
  doc.front.name = "Changed after adding";
  assert.notEqual(a.document.front.name, doc.front.name);
  let cart = m.addCartItem([a], same);
  assert.equal(cart[0].bundles, 2);
  const rounded = m.makeCartItem(p.id, { ...config(), corners: "Rounded" });
  const base = item();
  cart = m.editCartItem([base, rounded], rounded.key, config());
  assert.equal(cart.length, 1);
  assert.equal(cart[0].bundles, 2);
});
test("CART-2: tampered keys, unavailable products, invalid configurations and capacity", () => {
  const c = item();
  const restored = m.parseCart(JSON.stringify([{ ...c, key: "tampered" }]), [
    p.id,
  ]);
  assert.equal(restored[0].key, c.key);
  assert.equal(
    m.makeCartItem(p.id, { ...config(), unknownField: "ignored" }).key,
    c.key,
  );
  assert.equal(
    m.parseCart(JSON.stringify([{ ...c, productId: "removed" }]), [p.id])
      .length,
    0,
  );
  assert.equal(
    m.parseCart(
      JSON.stringify([{ ...c, config: { ...config(), quantity: 101 } }]),
      [p.id],
    ).length,
    0,
  );
  assert.throws(() => m.addCartItem([{ ...c, bundles: 99 }], c), /99/);
  const lines = Array.from({ length: 30 }, (_, i) =>
    m.makeCartItem(p.id, config(), String(i)),
  );
  assert.throws(
    () => m.addCartItem(lines, m.makeCartItem(p.id, config(), "new")),
    /30/,
  );
});
test("STORE-1: expiration, unchanged refresh, v1 migration and corrupt-state handling", () => {
  localStorage.setItem("printo-cart-v1", JSON.stringify([item()]));
  assert.equal(m.loadCart(1000).items.length, 1);
  assert.equal(m.saveCart(m.loadCart(1000).items, 1000), true);
  assert.equal(localStorage.getItem("printo-cart-v1"), null);
  const saved = JSON.parse(localStorage.getItem(m.CART_KEY));
  m.saveCart([item()], 2000);
  assert.equal(
    JSON.parse(localStorage.getItem(m.CART_KEY)).expiresAt,
    saved.expiresAt,
  );
  assert.equal(m.loadCart(saved.expiresAt).items.length, 0);
  assert.match(m.loadCart(saved.expiresAt).notice, /expired/);
  localStorage.setItem(m.CART_KEY, "broken");
  assert.match(m.loadCart().notice, /Invalid/);
  localStorage.removeItem(m.CART_KEY);
  localStorage.setItem("printo-cart-v1", "broken");
  assert.match(m.loadCart().notice, /Invalid legacy/);
});
test("URL-1: listing filters/query/page round trip without losing product configuration", () => {
  const state = {
    query: "Mira",
    category: "cards",
    sort: "newest",
    page: 2,
    filters: { colour: ["Green", "Blue"], theme: ["Minimal"] },
    band: "under500",
  };
  const query = m.writeListing("?quantity=500", state, "gallery");
  assert.match(query, /quantity=500/);
  assert.deepEqual(m.readListing(query, "gallery"), state);
  assert.equal(
    m.readListing("?page=-1&sort=unknown&f.colour=evil", "gallery").page,
    1,
  );
  assert.deepEqual(m.readListing("?f.colour=evil", "gallery").filters, {});
});
test("DESIGN-1: front/back edits, undo/redo and redo invalidation", () => {
  let h = { past: [], present: m.createDesign(p.id), future: [] };
  h = m.changeDesign(h, {
    ...h.present,
    front: { ...h.present.front, name: "Next" },
  });
  h = m.undoDesign(h);
  assert.equal(h.present.front.name, "Mira Studio");
  h = m.redoDesign(h);
  assert.equal(h.present.front.name, "Next");
  h = m.undoDesign(h);
  h = m.changeDesign(h, {
    ...h.present,
    back: { ...h.present.back, name: "Back edited" },
  });
  assert.equal(h.future.length, 0);
  assert.equal(h.present.front.name, "Mira Studio");
  assert.equal(h.present.back.name, "Back edited");
});
test("DESIGN-2: upload signatures, MIME, size and hostile persisted documents", () => {
  assert.match(m.uploadError({ type: "image/svg+xml", size: 10 }), /PNG/);
  assert.match(
    m.uploadError({ type: "image/png", size: m.UPLOAD_LIMIT + 1 }),
    /512/,
  );
  assert.match(
    m.uploadError({ type: "image/png", size: 10 }, new Uint8Array([1, 2, 3])),
    /contents/,
  );
  assert.equal(
    m.uploadError(
      { type: "image/png", size: 8 },
      new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    ),
    "",
  );
  const d = m.createDesign(p.id);
  assert.equal(m.validateDesign(d), true);
  d.front.image = {
    dataUrl: "data:text/html;base64,PHNjcmlwdD4=",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  };
  assert.equal(m.validateDesign(d), false);
  assert.throws(() => m.makeCartItem(p.id, config(), "Mira", d));
  assert.equal(m.saveDraft(d), false);
});
test("DESIGN-3: draft resume, resolution warning and transform bounds", () => {
  const d = m.createDesign(p.id);
  d.front.image = {
    dataUrl: "data:image/png;base64,aGVsbG8=",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
  };
  assert.match(m.resolutionWarning(d.front), /Low-resolution/);
  assert.equal(m.saveDraft(d), true);
  assert.equal(m.loadDraft(p.id).id, d.id);
  d.front.image.scale = 99;
  assert.equal(m.validateDesign(d), false);
});
test("ADDRESS-1: required fields, PIN rules and serviceability fixtures", () => {
  assert.deepEqual(m.validateAddress(m.demoAddresses[0]), {});
  assert.ok(
    m.validateAddress({ ...m.demoAddresses[0], pin: "000000", phone: "123" })
      .pin,
  );
  assert.throws(() => m.deliveryFor("000000"), /PIN/);
  assert.throws(() => m.deliveryFor("900001"), /demo delivery/);
  assert.equal(m.deliveryFor("400001").length, 2);
  assert.equal(m.deliveryFor("110001").length, 1);
});
test("ASYNC-1: aborted quote and failed delivery retry do not commit a result", async () => {
  m.configureMock({ latency: 20 });
  const abort = new AbortController();
  const request = m.quoteService(p, config(), abort.signal);
  abort.abort();
  await assert.rejects(request, { name: "AbortError" });
  m.configureMock({ latency: 0, failNext: "delivery" });
  await assert.rejects(m.deliveryService("400001"), /failed/);
  assert.equal((await m.deliveryService("400001")).length, 2);
});
function checkout(overrides = {}) {
  const items = [item()];
  return {
    items,
    fingerprint: m.cartFingerprint(items),
    getCurrentCart: () => items,
    coupon: "",
    address: m.demoAddresses[0],
    delivery: "standard",
    payment: "Demo UPI",
    accepted: true,
    idempotencyKey: "test-intent",
    ...overrides,
  };
}
test("CHECKOUT-1: duplicate intent resolves once, redacted address and expired session", async () => {
  const input = checkout();
  const [a, b] = await Promise.all([m.placeOrder(input), m.placeOrder(input)]);
  assert.equal(a.id, b.id);
  assert.equal(m.getOrders().length, 1);
  assert.equal("address" in a, false);
  assert.equal("phone" in a, false);
  assert.equal("name" in a, false);
  assert.equal(a.pin, "400001");
  assert.equal((await m.placeOrder(input)).id, a.id);
  await assert.rejects(
    m.placeOrder(checkout({ idempotencyKey: "expired", sessionExpiresAt: 1 })),
    /session expired/,
  );
});
test("CHECKOUT-2: current cart, coupon, acknowledgement, delivery and empty prerequisites", async () => {
  await assert.rejects(
    m.placeOrder(checkout({ getCurrentCart: () => [] })),
    /cart changed/,
  );
  await assert.rejects(
    m.placeOrder(checkout({ accepted: false })),
    /simulation/,
  );
  await assert.rejects(
    m.placeOrder(checkout({ coupon: "EXPIRED" })),
    /expired/,
  );
  await assert.rejects(
    m.placeOrder(
      checkout({
        address: { ...m.demoAddresses[0], pin: "110001" },
        delivery: "express",
      }),
    ),
    /delivery option/,
  );
  await assert.rejects(
    m.placeOrder(
      checkout({ items: [], fingerprint: "[]", getCurrentCart: () => [] }),
    ),
    /empty/,
  );
  assert.equal(m.getOrders().length, 0);
});
test("CHECKOUT-3: actual mid-flight cart changes, failure/retry and expired mock login", async () => {
  let current = [item()];
  m.configureMock({ latency: 15 });
  const pending = m.placeOrder(checkout({ getCurrentCart: () => current }));
  current = [];
  await assert.rejects(pending, /cart changed/);
  m.configureMock({ latency: 0, failNext: "checkout" });
  await assert.rejects(m.placeOrder(checkout()), /failed/);
  assert.ok((await m.placeOrder(checkout())).id.startsWith("DEMO-"));
  const session = m.signInDemo();
  assert.equal(m.getSession(session.expiresAt), null);
  assert.equal(m.getSession().alias, "Demo Shopper");
  m.signOutDemo();
  assert.equal(m.getSession(), null);
});
test("ORDER-1: immutable history, reordered current-price snapshots and unavailable-line skips", async () => {
  const order = await m.placeOrder(checkout());
  const result = m.reorderItems(order, []);
  assert.equal(result.items.length, 1);
  assert.equal(result.skipped.length, 0);
  assert.equal(m.cartTotals(result.items).totalPaise, 20000);
  const missing = {
    ...order,
    items: [{ ...order.items[0], productId: "removed" }],
  };
  assert.equal(m.reorderItems(missing, []).skipped.length, 1);
  assert.equal(m.getOrders(Date.now() + 31 * 86400000).length, 0);
});
test("STORE-2: quota failures are reported and no confirmation is silently lost", async () => {
  const prototype = Object.getPrototypeOf(localStorage);
  const original = prototype.setItem;
  prototype.setItem = function () {
    throw new Error("quota");
  };
  try {
    assert.equal(m.saveCart([item()]), false);
    assert.equal(m.saveDraft(m.createDesign(p.id)), false);
    await assert.rejects(m.placeOrder(checkout()), /Unable to save/);
    assert.equal(m.getOrders().length, 0);
  } finally {
    prototype.setItem = original;
  }
});
test("ORDER-2: reorder uses changed current catalogue prices and malformed history is ignored", async () => {
  const order = await m.placeOrder(checkout());
  const price = p.price;
  try {
    p.price = 201;
    const reordered = m.reorderItems(order, []);
    assert.equal(m.cartTotals(reordered.items).totalPaise, 20100);
    assert.equal(order.totals.totalPaise, 20000);
  } finally {
    p.price = price;
  }
  localStorage.setItem(
    "printo-orders-v1",
    JSON.stringify([{ ...order, items: [null] }]),
  );
  assert.equal(m.getOrders().length, 0);
});
test("CHECKOUT-4: cancelling a pending mock confirmation saves no order", async () => {
  m.configureMock({ latency: 20 });
  const controller = new AbortController();
  const operation = m.placeOrder(checkout({ signal: controller.signal }));
  controller.abort();
  await assert.rejects(operation, { name: "AbortError" });
  assert.equal(m.getOrders().length, 0);
});
