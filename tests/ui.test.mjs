import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, rmSync } from "node:fs";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
const dom = new JSDOM(
  '<!doctype html><html><body><div id="root"></div></body></html>',
  { url: "http://localhost/" },
);
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "HTMLDialogElement",
  "HTMLInputElement",
  "HTMLImageElement",
  "sessionStorage",
  "Element",
  "Node",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
  "localStorage",
  "history",
  "location",
  "FormData",
])
  globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
};
globalThis.matchMedia = () => ({ matches: false });
window.scrollTo = () => {};
HTMLElement.prototype.scrollIntoView = () => {};
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
};
mkdirSync("tests/.qa-build", { recursive: true });
await build({
  entryPoints: ["src/App.tsx"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "tests/.qa-build/app.mjs",
  external: ["react", "react-dom"],
});
const { App, configureMock } = await import("./.qa-build/app.mjs");
configureMock({ latency: 0 });
const { createRoot } = await import("react-dom/client");
const root = createRoot(document.getElementById("root"));
const click = async (el) => {
  assert.ok(el, "Expected clickable element");
  await act(async () => {
    el.dispatchEvent(
      new MouseEvent("click", { bubbles: true, button: 0, cancelable: true }),
    );
    await new Promise((r) => setTimeout(r, 5));
  });
};
const navigate = async (path) =>
  act(async () => {
    history.pushState(null, "", path);
    window.dispatchEvent(new Event("popstate"));
    await new Promise((r) => setTimeout(r, 5));
  });
const change = async (el, value) => {
  assert.ok(el);
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(el),
      "value",
    ).set;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () => new Promise((r) => setTimeout(r, 10)));
};
const button = (text, scope = document) =>
  [...scope.querySelectorAll("button")].find((x) =>
    x.textContent.includes(text),
  );
const labelButton = (name) =>
  [...document.querySelectorAll("button")].find(
    (x) => x.getAttribute("aria-label") === name,
  );
const link = (text, scope = document) =>
  [...scope.querySelectorAll("a")].find((x) => x.textContent === text);
const errors = [];
const originalError = console.error;
console.error = (...args) => {
  errors.push(args.join(" "));
  originalError(...args);
};
test("full local UI journey and state transitions (DOM simulation, not rendered-browser QA)", async () => {
  try {
    await act(async () => root.render(createElement(App)));
    assert.equal(document.querySelectorAll(".category-tile").length, 12);
    assert.equal(document.querySelectorAll(".product-section").length, 5);
    await click(
      button("Visiting Cards", document.querySelector(".desktop-nav")),
    );
    assert.ok(document.querySelector(".mega-menu"));
    await act(async () =>
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
    );
    assert.equal(document.querySelector(".mega-menu"), null);
    await click(
      link("Standard Visiting Cards", document.querySelector("main")),
    );
    assert.equal(location.pathname, "/business-cards/standard");
    const selects = document.querySelectorAll(".options-form select");
    await change(selects[1], "Premium Matte");
    await change(selects[2], "500");
    assert.match(document.querySelector(".price-block").textContent, /1,260/);
    await click(link("Browse designs "));
    assert.match(location.pathname, /templates$/);
    assert.equal(document.querySelectorAll(".template-card").length, 9);
    const green = [...document.querySelectorAll(".filters label")]
      .find((x) => x.textContent === "Green")
      .querySelector("input");
    await click(green);
    assert.equal(document.querySelectorAll(".template-card").length, 6);
    await change(
      document.querySelector(".template-search input"),
      "not-a-template",
    );
    assert.match(
      document.querySelector(".gallery-results").textContent,
      /No designs found/,
    );
    await click(button("Reset search and filters"));
    assert.equal(document.querySelectorAll(".template-card").length, 9);
    await click(labelButton("Next page"));
    assert.equal(
      document.querySelector('.pagination [aria-current="page"]').textContent,
      "2",
    );
    const save = document.querySelector(".template-image .save-button");
    await click(save);
    assert.match(localStorage.getItem("printo-saved-v1"), /design-/);
    await click(document.querySelector(".template-open"));
    assert.ok(document.querySelector("dialog[open]"));
    await change(
      document.querySelector(".preview-layout input"),
      "Mira <script>unsafe</script>",
    );
    assert.equal(document.querySelector(".preview-layout script"), null);
    assert.match(
      document.querySelector(".preview-layout .sample-name").textContent,
      /<script>/,
    );
    await click(button("Add sample to cart", document.querySelector("dialog")));
    assert.equal(document.querySelector("dialog"), null);
    await navigate("/c/");
    assert.equal(document.querySelectorAll(".cart-item").length, 1);
    assert.match(
      document.querySelector(".cart-design").textContent,
      /Mira <script>/,
    );
    await change(document.querySelector(".cart-actions select"), "2");
    assert.match(document.querySelector(".summary-total").textContent, /2,520/);
    const couponInput = document.querySelector(".coupon-form input");
    await change(couponInput, "EXPIRED");
    await act(async () =>
      document
        .querySelector(".coupon-form")
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
    assert.match(
      document.querySelector(".order-summary").textContent,
      /expired/,
    );
    await change(couponInput, "LOCAL10");
    await act(async () =>
      document
        .querySelector(".coupon-form")
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
    assert.match(document.querySelector(".summary-total").textContent, /2,268/);
    await click(button("Edit options", document.querySelector(".cart-item")));
    await change(
      document.querySelector("dialog .configuration-grid select"),
      "Rounded",
    );
    await click(button("Save item changes", document.querySelector("dialog")));
    assert.match(document.querySelector(".cart-item").textContent, /Rounded/);
    await click(button("Continue to mock checkout"));
    assert.equal(location.pathname, "/checkout");
    await click(button("Use demo sign-in"));
    assert.match(
      document.querySelector(".checkout-fields").textContent,
      /Signed in as Demo Shopper/,
    );
    const pinInput = [...document.querySelectorAll(".address-grid label")]
      .find((l) => l.firstChild.textContent === "PIN code")
      .querySelector("input");
    await change(pinInput, "000000");
    await click(button("Check delivery options"));
    assert.match(
      document.querySelector(".checkout-fields").textContent,
      /six-digit/,
    );
    await change(pinInput, "400001");
    await click(button("Check delivery options"));
    await act(async () => new Promise((r) => setTimeout(r, 10)));
    assert.ok(document.querySelector('input[name="checkout-delivery"]'));
    await click(
      document.querySelectorAll('input[name="checkout-delivery"]')[1],
    );
    assert.match(document.querySelector(".summary-total").textContent, /2,507/);
    const acknowledgement = document.querySelector(
      '.order-summary input[type="checkbox"]',
    );
    await click(acknowledgement);
    await click(button("Confirm demo order"));
    await act(async () => new Promise((r) => setTimeout(r, 10)));
    assert.equal(location.pathname, "/order-confirmation");
    assert.match(
      document.querySelector("main").textContent,
      /Your demo is confirmed/,
    );
    assert.equal(
      JSON.parse(localStorage.getItem("printo-orders-v1")).length,
      1,
    );
    await click(link("View local order history"));
    assert.equal(location.pathname, "/my-account/orders");
    await click(button("Reorder sample items"));
    await navigate("/c/");
    await click(button("Remove coupon"));
    await click(button("Remove", document.querySelector(".cart-item")));
    assert.match(
      document.querySelector("main").textContent,
      /Your cart is waiting/,
    );
    assert.equal(
      JSON.parse(localStorage.getItem("printo-cart-v2")).items.length,
      0,
    );
    await change(document.querySelector("#site-search"), "visiting cards");
    await act(async () => {
      document
        .querySelector(".desktop-search form")
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
      await new Promise((r) => setTimeout(r, 5));
    });
    assert.match(location.search, /visiting%20cards/);
    assert.ok(document.querySelectorAll(".product-card").length >= 5);
    await navigate("/search?q=unfindable");
    assert.match(
      document.querySelector("main").textContent,
      /No products found/,
    );
    await navigate("/favourites");
    assert.equal(document.querySelectorAll(".template-card").length, 1);
    await navigate("/customer-care/help-centre/");
    await change(document.querySelector(".help-search input"), "payments");
    assert.equal(document.querySelectorAll(".help-articles details").length, 1);
    await click(document.querySelector(".help-articles summary"));
    await navigate("/my-account/projects");
    assert.match(
      document.querySelector("main").textContent,
      /No credentials or personal data/,
    );
    await navigate("/not-real");
    assert.match(
      document.querySelector("main").textContent,
      /couldn’t find that page/,
    );
    await click(labelButton("Open navigation menu"));
    assert.ok(document.querySelector("dialog.menu-drawer[open]"));
    await act(async () =>
      document
        .querySelector("dialog")
        .dispatchEvent(
          new Event("cancel", { bubbles: true, cancelable: true }),
        ),
    );
    assert.equal(document.querySelector("dialog"), null);
    await navigate("/editor?product=standard");
    const businessName = document.querySelector(".editor-controls input");
    await change(businessName, "Local Editor Name");
    await click(button("Undo"));
    assert.equal(
      document.querySelector(".editor-controls input").value,
      "Mira Studio",
    );
    await click(button("Redo"));
    await click(button("Save draft"));
    await change(
      document.querySelector(".editor-controls input"),
      "Unsaved replacement",
    );
    await navigate("/editor?product=standard&resume=1");
    assert.equal(
      document.querySelector(".editor-controls input").value,
      "Local Editor Name",
    );
    await click(button("Preview both sides"));
    assert.equal(document.querySelectorAll("dialog .design-face").length, 2);
    await click(labelButton("Close dialog"));
    const broken =
      document.querySelector("header + .promotion") ||
      document.querySelector("main");
    assert.ok(broken);
    await navigate("/");
    const failedImage = document.querySelector(".category-art img");
    await act(async () => failedImage.dispatchEvent(new Event("error")));
    assert.match(failedImage.src, /image-unavailable/);
    await navigate("/search?q=cards&category=cards&sort=high");
    assert.equal(
      document.querySelector(".results-toolbar select").value,
      "cards",
    );
    await navigate("/business-cards/standard");
    await act(async () => history.back());
    await act(async () => new Promise((r) => setTimeout(r, 15)));
    assert.equal(
      document.querySelector(".results-toolbar select").value,
      "cards",
    );
    await navigate("/business-cards/standard");
    await click(labelButton("Expand Standard Visiting Cards image"));
    await click(labelButton("Zoom in"));
    assert.match(document.querySelector(".zoom-controls").textContent, /125%/);
    await act(async () =>
      document
        .querySelector(".zoom-stage")
        .dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
        ),
    );
    assert.match(
      document.querySelector(".zoom-stage img").style.transform,
      /-20px/,
    );
    await click(labelButton("Close dialog"));
    configureMock({ latency: 20, failNext: "quote" });
    await navigate("/business-cards/standard?quantity=100");
    await act(async () => new Promise((r) => setTimeout(r, 40)));
    assert.match(
      document.querySelector(".options-form").textContent,
      /local request failed/,
    );
    await click(button("Retry price"));
    await act(async () => new Promise((r) => setTimeout(r, 40)));
    assert.match(document.querySelector(".price-block").textContent, /₹200/);
    configureMock({ latency: 40 });
    const quantity = () =>
      [...document.querySelectorAll(".options-form label")]
        .find((l) => l.firstChild.textContent === "Quantity")
        .querySelector("select");
    await change(quantity(), "500");
    await change(quantity(), "1000");
    await act(async () => new Promise((r) => setTimeout(r, 60)));
    assert.match(document.querySelector(".price-block").textContent, /1,600/);
    assert.equal(quantity().value, "1000");
    configureMock({ latency: 0 });
    await click(button("Add sample configuration to cart"));
    await click(button("Add sample configuration to cart"));
    await navigate("/c/");
    assert.equal(document.querySelector(".cart-actions select").value, "1");
    await navigate("/");
    const suggestInput = document.querySelector("#site-search");
    await change(suggestInput, "visiting");
    await act(async () =>
      suggestInput.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowDown",
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    await act(async () =>
      suggestInput.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    assert.equal(location.pathname, "/business-cards/standard");
    assert.equal(errors.length, 0, errors.join("\n"));
  } finally {
    await act(async () => root.unmount());
    console.error = originalError;
    rmSync("tests/.qa-build", { recursive: true, force: true });
    dom.window.close();
  }
});
