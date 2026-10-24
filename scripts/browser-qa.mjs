import { chromium } from "playwright";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveAsset } from "./http-handler.mjs";
const base = "http://printo.local";
const viewports = [
  { width: 1440, height: 1000 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];
const pages = [
  ["home", "/"],
  ["category", "/business-cards"],
  ["signs", "/signs-posters"],
  ["product", "/business-cards/standard"],
  ["templates", "/business-cards/standard/templates"],
  ["search", "/search?q=cards"],
  ["cart", "/c/"],
  ["help", "/customer-care/help-centre/"],
  ["sale", "/diwali-gifting-sale"],
  ["account", "/my-account/"],
  ["editor", "/editor?product=standard"],
  ["checkout-empty", "/checkout"],
  ["history-empty", "/my-account/orders"],
];
const result = {
  started: new Date().toISOString(),
  status: "running",
  checks: [],
  screenshots: [],
  failures: [],
};
mkdirSync("docs/evidence/local", { recursive: true });
mkdirSync("docs/evidence/reference", { recursive: true });
let browser;
try {
  const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_EXECUTABLE
      ? { executablePath: process.env.BROWSER_EXECUTABLE }
      : existsSync(chrome)
        ? { executablePath: chrome }
        : {}),
  });
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.on("pageerror", (error) =>
      result.failures.push(`JS: ${error.message}`),
    );
    page.on("console", (message) => {
      if (message.type() === "error")
        result.failures.push(`Console: ${message.text()}`);
    });
    await page.route(`${base}/**`, async (route) => {
      const response = await resolveAsset(route.request().url());
      await route.fulfill({
        status: response.status,
        headers: response.headers,
        body: response.body,
      });
    });
    for (const [name, path] of pages) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 30));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(100);
      const dimensions = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        width: innerWidth,
        broken: [...document.images]
          .filter((i) => !i.complete || i.naturalWidth === 0)
          .map((i) => i.src),
      }));
      if (dimensions.scroll > dimensions.width)
        result.failures.push(
          `${name} ${viewport.width}: horizontal overflow ${dimensions.scroll}`,
        );
      result.failures.push(
        ...dimensions.broken.map((x) => `Broken image: ${x}`),
      );
      const pathName = `docs/evidence/local/${name}-${viewport.width}.png`;
      await page.screenshot({ path: pathName, fullPage: true });
      result.screenshots.push(pathName);
    }
    await page.goto(base + "/business-cards/standard");
    await page
      .locator(".options-form")
      .getByLabel("Quantity", { exact: true })
      .selectOption("500");
    await page
      .getByRole("button", { name: "Add sample configuration to cart" })
      .click();
    await page.goto(base + "/c/");
    if ((await page.locator(".cart-item").count()) !== 1)
      throw Error("Cart add did not persist");
    await page.getByRole("button", { name: "Remove", exact: true }).click();
    if (
      !(await page
        .getByRole("heading", { name: "Your cart is waiting for a good idea" })
        .isVisible())
    )
      throw Error("Cart remove failed");
    await page.goto(base + "/business-cards/standard/templates");
    if (viewport.width <= 700) {
      await page.getByRole("button", { name: /^Filters/ }).click();
      await page
        .getByRole("dialog")
        .getByLabel("Green", { exact: true })
        .check();
      await page.getByRole("button", { name: /Show .* designs/ }).click();
    } else {
      await page
        .locator(".filters")
        .getByLabel("Green", { exact: true })
        .check();
    }
    if ((await page.locator(".template-card").count()) !== 6)
      throw Error("Template filter failed");
    await page.locator(".template-open").first().click();
    if (!(await page.getByRole("dialog").isVisible()))
      throw Error("Preview dialog did not open");
    await page.keyboard.press("Escape");
    if (await page.locator("dialog").count())
      throw Error("Escape did not close dialog");
    await page.locator(".template-open").first().click();
    await page.getByRole("link", { name: "Open local design editor" }).click();
    await page
      .getByLabel("Business name", { exact: true })
      .fill("Browser QA Studio");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await page.getByRole("button", { name: "Preview both sides" }).click();
    await page
      .getByRole("button", { name: "Add designed sample to cart" })
      .click();
    await page.locator(".cart-link").click();
    await page
      .getByRole("button", { name: "Continue to mock checkout" })
      .click();
    await page.getByRole("button", { name: "Check delivery options" }).click();
    await page.locator('input[name="checkout-delivery"]').first().waitFor();
    await page.locator('.order-summary input[type="checkbox"]').check();
    await page
      .getByRole("button", { name: "Confirm demo order", exact: true })
      .click();
    await page.waitForURL(/order-confirmation/);
    if (
      !(await page
        .getByRole("heading", { name: "Your demo is confirmed", exact: true })
        .isVisible())
    )
      throw Error("Mock confirmation failed");
    result.checks.push(
      `${viewport.width}: local editor/draft/preview and mock checkout completed`,
    );
    result.checks.push(
      `${viewport.width}: cart persistence/removal, template filter and modal Escape passed`,
    );
    if (viewport.width <= 1100) {
      await page.getByRole("button", { name: "Open navigation menu" }).click();
      await page.keyboard.press("Tab");
      const inDialog = await page.evaluate(
        () => !!document.activeElement?.closest("dialog"),
      );
      if (!inDialog) throw Error("Dialog focus escaped");
      await page.keyboard.press("Escape");
      if (
        !(await page
          .getByRole("button", { name: "Open navigation menu" })
          .evaluate((el) => el === document.activeElement))
      )
        throw Error("Dialog focus was not restored");
    }
    await context.close();
  }
  if (process.env.AUDIT_REFERENCE === "1") {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
      for (const [name, path] of pages.filter(([name]) =>
        [
          "home",
          "category",
          "signs",
          "product",
          "templates",
          "cart",
          "help",
          "sale",
        ].includes(name),
      )) {
        try {
          await page.goto("https://www.vistaprint.in" + path, {
            waitUntil: "networkidle",
            timeout: 45000,
          });
          await page.screenshot({
            path: `docs/evidence/reference/${name}-${viewport.width}.png`,
            fullPage: true,
          });
        } catch (error) {
          result.failures.push(
            `Reference ${name} ${viewport.width}: ${error.message}`,
          );
        }
      }
      await page.close();
    }
  }
  result.status = result.failures.length ? "failed" : "passed";
} catch (error) {
  result.status = "blocked";
  result.failures.push(String(error));
} finally {
  await browser?.close();
  writeFileSync(
    "docs/evidence/browser-results.json",
    JSON.stringify(result, null, 2),
  );
  console.log(
    JSON.stringify(
      { ...result, failures: result.failures.map((x) => x.slice(0, 650)) },
      null,
      2,
    ),
  );
  if (result.status !== "passed") process.exitCode = 1;
}
const escape = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const comparisons = pages
  .flatMap(([name]) =>
    viewports.map(({ width }) => {
      const cells = ["reference", "local"]
        .map((kind) => {
          const path = `${kind}/${name}-${width}.png`;
          return `<div><h3>${kind}</h3>${existsSync(resolve("docs/evidence", path)) ? `<img src="${path}" alt="${name} ${kind} ${width}" loading="lazy">` : '<p class="missing">Capture unavailable. No comparison or fidelity claim.</p>'}</div>`;
        })
        .join("");
      return `<section><h2>${name} · ${width}px</h2><div class="pair">${cells}</div></section>`;
    }),
  )
  .join("");
writeFileSync(
  "docs/evidence/comparisons.html",
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Reference comparison coverage</title><style>body{font:14px Arial;margin:30px;background:#f6f6f6;color:#222}h1{font-size:26px}section{background:white;padding:20px;margin:24px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}.pair>div{min-width:0}img{width:100%;border:1px solid #ddd}.missing{background:#fff0d8;padding:20px;min-height:90px}h3{text-transform:capitalize}@media(max-width:600px){.pair{grid-template-columns:1fr}}</style><h1>Reference and local capture coverage</h1><p>Run status: ${escape(result.status)}. Missing captures are explicitly marked. Matching screenshots must exist before visual comparison is possible.</p>${comparisons}</html>`,
);
