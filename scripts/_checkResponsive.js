const { chromium } = require("playwright");
const fs = require("fs");

const BASE = "http://localhost:3000";
const PAGES = [
  { path: "/", name: "home" },
  { path: "/products", name: "products" },
  { path: "/products?category=rings", name: "products-rings" },
  { path: "/products/50cc7849-1735-4e8c-836f-7bb60138311a", name: "product-detail" },
  { path: "/about-us", name: "about-us" },
  { path: "/contact", name: "contact" },
  { path: "/faq", name: "faq" },
  { path: "/blogs", name: "blogs" },
  { path: "/notifications", name: "notifications" },
  { path: "/cart", name: "cart" },
  { path: "/checkout", name: "checkout" },
  { path: "/login", name: "login" },
  { path: "/signup", name: "signup" },
  { path: "/account", name: "account" },
];

async function main() {
  fs.mkdirSync("scripts/_shots", { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();

  const results = [];

  for (const p of PAGES) {
    try {
      await page.goto(BASE + p.path, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForLoadState("load").catch(() => {});
      await page.waitForTimeout(1200);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const overflowing = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const offenders = [];
        document.querySelectorAll("body *").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right > vw + 5 && r.width > 0) {
            offenders.push({
              tag: el.tagName,
              cls: (el.className || "").toString().slice(0, 80),
              right: Math.round(r.right),
              width: Math.round(r.width),
            });
          }
        });
        return offenders.slice(0, 8);
      });

      await page.screenshot({ path: `scripts/_shots/${p.name}.png`, fullPage: true });

      results.push({
        page: p.name,
        scrollWidth,
        clientWidth,
        hasHorizontalOverflow: scrollWidth > clientWidth + 5,
        overflowingElements: overflowing,
      });
    } catch (err) {
      results.push({ page: p.name, error: err.message });
    }
  }

  fs.mkdirSync("scripts/_shots", { recursive: true });
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
