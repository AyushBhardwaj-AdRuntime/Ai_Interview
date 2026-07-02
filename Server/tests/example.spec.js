const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto("https://www.linkedin.com/in/ayushbhardwaj-dev/");

  console.log(await page.title());

  await page.waitForTimeout(5000);

  await browser.close();
})();