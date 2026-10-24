const {
  chromium,
} = require("/Users/shadabkhan/.npm/_npx/9833c18b2d85bc59/node_modules/playwright");
(async () => {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    });
    let page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    await page.goto("https://www.vistaprint.in/", {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    console.log(await page.title());
    await page.screenshot({
      path: "docs/evidence/reference/home-1440.png",
      fullPage: true,
    });
    require("fs").writeFileSync(
      "docs/evidence/reference/home.html",
      await page.content(),
    );
  } catch (e) {
    console.log(String(e));
  } finally {
    if (browser) await browser.close();
  }
})();
