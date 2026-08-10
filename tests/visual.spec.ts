import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const evidenceDir = path.resolve("evidence/screenshots");
const baseURL = "http://127.0.0.1:3000";

async function setSession(page: Page, fixtureId: string) {
  await page.context().clearCookies();
  await page.context().addCookies([
    {
      name: "rp04_demo_session",
      value: fixtureId,
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);
}

async function expectNoPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth
  }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.viewport);
}

async function shot(page: Page, name: string) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDir, name),
    fullPage: true,
    caret: "initial"
  });
}

test("capture S11 S12 S13 desktop evidence", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await setSession(page, "tenant-demo");
  await page.goto("/tenant");
  await expect(page.getByRole("heading", { name: "خدمات المستأجر" })).toBeVisible();
  await expectNoPageOverflow(page);
  await shot(page, "w04-s11-tenant-desktop.png");

  await setSession(page, "contractor-demo");
  await page.goto("/contractor");
  await expect(page.getByRole("heading", { name: "تفاصيل المهمة الموكلة إليك" })).toBeVisible();
  await expectNoPageOverflow(page);
  await shot(page, "w04-s12-contractor-desktop.png");

  await setSession(page, "admin-demo");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "عمليات المحافظ" })).toBeVisible();
  await expectNoPageOverflow(page);
  await shot(page, "w04-s13-portfolio-operations-desktop.png");
});

test("capture representative mobile evidence", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await setSession(page, "tenant-demo");
  await page.goto("/tenant");
  await expectNoPageOverflow(page);
  await shot(page, "w04-s11-tenant-mobile.png");

  await setSession(page, "admin-demo");
  await page.goto("/admin");
  await expectNoPageOverflow(page);
  await shot(page, "w04-s13-portfolio-operations-mobile.png");
});

test("capture representative tablet contractor evidence", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  await setSession(page, "contractor-demo");
  await page.goto("/contractor");
  await expectNoPageOverflow(page);
  await shot(page, "w04-s12-contractor-tablet.png");
});
