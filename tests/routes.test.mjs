import test from "node:test";
import assert from "node:assert/strict";
import { resolveAsset } from "../scripts/http-handler.mjs";
import { build } from "esbuild";
const bundle = await build({
  entryPoints: ["src/data.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const { categories, products } = await import(
  "data:text/javascript;base64," +
    Buffer.from(bundle.outputFiles[0].text).toString("base64")
);
test("every implemented catalogue route and representative secondary route supports direct SPA refresh", async () => {
  for (const path of [
    "/",
    ...categories.map((c) => c.path),
    ...products.map((p) => p.path),
    ...products.map((p) => p.path + "/templates?quantity=100"),
    "/search?q=cards",
    "/c/",
    "/customer-care/help-centre/",
    "/favourites",
    "/my-account/",
    "/diwali-gifting-sale",
    "/editor?product=standard&resume=1",
    "/checkout",
    "/my-account/orders",
    "/order-confirmation?id=missing",
  ]) {
    const response = await resolveAsset(path);
    assert.equal(response.status, 200, path);
    assert.match(String(response.body), /<div id="root"><\/div>/, path);
  }
});
test("production entry scripts, styles and original images are present; unknown assets return 404", async () => {
  const index = String((await resolveAsset("/")).body);
  for (const match of index.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
    assert.equal((await resolveAsset(match[1])).status, 200, match[1]);
  }
  for (const item of [...categories, ...products])
    assert.equal((await resolveAsset(`/assets/${item.image}.svg`)).status, 200);
  assert.equal((await resolveAsset("/assets/missing.svg")).status, 404);
  assert.equal((await resolveAsset("/assets/missing.js")).status, 404);
  assert.equal((await resolveAsset("/%2e%2e%2fpackage.json")).status, 403);
});
