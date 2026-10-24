import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { existsSync, readFileSync } from "node:fs";
const load = async (path) => {
  const result = await build({
    entryPoints: [path],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });
  return import(
    "data:text/javascript;base64," +
      Buffer.from(result.outputFiles[0].text).toString("base64")
  );
};
const model = await load("src/model.ts");
const { products, templates, categories } = await load("src/data.ts");
test("volume pricing, stock premiums, delivery and unit quantities stay consistent", () => {
  const p = products[0];
  const c = model.defaultConfig(p);
  assert.equal(model.priceFor(p, c), 200);
  assert.equal(model.priceFor(p, { ...c, quantity: 500 }), 900);
  assert.equal(
    model.priceFor(p, { ...c, stock: "Premium Matte", corners: "Rounded" }),
    330,
  );
  assert.throws(() =>
    model.priceFor(p, { ...c, stock: "Premium Matte", delivery: "Same Day" }),
  );
  assert.equal(model.priceFor(p, { ...c, quantity: 1000 }), 1600);
});
test("identical configurations merge, distinct designs remain separate", () => {
  const c = model.defaultConfig(products[0]);
  const a = model.makeCartItem("standard", c);
  let cart = model.addCartItem([], a);
  cart = model.addCartItem(cart, a);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].bundles, 2);
  cart = model.addCartItem(cart, model.makeCartItem("standard", c, "Mira"));
  assert.equal(cart.length, 2);
  assert.equal(cart[1].bundles, 1);
  assert.equal(a.bundles, 1);
  assert.notEqual(a.config, c);
});
test("corrupted and tampered persisted cart data cannot produce invalid totals", () => {
  const valid = model.makeCartItem(
    "standard",
    model.defaultConfig(products[0]),
  );
  const list = [
    valid,
    { ...valid, productId: "missing" },
    { ...valid, bundles: -1 },
    { ...valid, bundles: 100 },
    { ...valid, config: { ...valid.config, quantity: Infinity } },
    { ...valid, config: { ...valid.config, stock: "bad" } },
    null,
  ];
  assert.deepEqual(
    model.parseCart(JSON.stringify(list), ["standard"]),
    JSON.parse(JSON.stringify([valid])),
  );
  assert.deepEqual(model.parseCart("{broken", ["standard"]), []);
  assert.deepEqual(model.parseCart("{}", ["standard"]), []);
  assert.deepEqual(model.parseSaved('[1,"standard",null]'), ["standard"]);
});
test("search handles case, whitespace, multiple terms and zero results", () => {
  assert.ok(model.searchProducts(products, "  VISITING   CARDS ").length >= 5);
  assert.equal(model.searchProducts(products, "nonexistent-unicorn").length, 0);
  assert.equal(model.searchProducts(products, "").length, products.length);
});
test("template filtering uses OR within a group and AND across groups", () => {
  const found = model.filterTemplates(templates, "", {
    colour: ["Green", "Blue"],
    theme: ["Minimal"],
  });
  assert.ok(found.length > 0);
  assert.ok(
    found.every(
      (t) => ["Green", "Blue"].includes(t.colour) && t.theme === "Minimal",
    ),
  );
  assert.equal(
    model.filterTemplates(templates, "nothing matches", {}).length,
    0,
  );
});
test("all catalogue routes are unique and all local illustrations exist", () => {
  const paths = [...categories, ...products].map((p) => p.path);
  assert.equal(new Set(paths).size, paths.length);
  for (const p of [...categories, ...products])
    assert.ok(existsSync(`public/assets/${p.image}.svg`), p.image);
  for (const image of new Set(products.map((p) => p.image))) {
    const svg = readFileSync(`public/assets/${image}.svg`, "utf8");
    assert.match(svg, /viewBox="0 0 600 750"/);
    assert.doesNotMatch(svg, /<image[^>]+href="https?:/);
  }
});
