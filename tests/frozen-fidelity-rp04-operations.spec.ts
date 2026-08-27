import { expect, test, type Page } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";
const recordId = "ops-record-101";

async function setOperationsSession(page: Page) {
  await page.context().addCookies([
    {
      name: "rp04_demo_session",
      value: "operations-demo",
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test("S08 approved composition keeps entity visual left and occupancy main/side structure", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await setOperationsSession(page);
  await page.goto(`/operations/records/${recordId}/occupancy`);

  const entity = page.locator('[data-rp04-surface="operations-entity-summary"]');
  const image = entity.locator('img').first();
  const title = entity.getByRole("heading").first();
  await expect(entity).toBeVisible();
  await expect(image).toBeVisible();
  const imageBox = await image.boundingBox();
  const titleBox = await title.boundingBox();
  expect(imageBox && titleBox && imageBox.x < titleBox.x).toBeTruthy();

  const workspace = page.locator('[data-rp04-surface="s08-occupancy-workspace"]');
  await expect(workspace).toBeVisible();
  expect(await workspace.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length)).toBeGreaterThan(1);
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
});

test("S10 approved composition keeps work stream primary and summary rail bounded", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await setOperationsSession(page);
  await page.goto(`/operations/records/${recordId}/maintenance`);

  const workspace = page.locator('[data-rp04-surface="s10-maintenance-workspace"]');
  const openWork = page.getByRole("heading", { name: "الطلبات والأعمال المفتوحة" });
  const summary = page.getByRole("heading", { name: "حالة الصيانة والخدمة" });
  await expect(workspace).toBeVisible();
  await expect(openWork).toBeVisible();
  await expect(summary).toBeVisible();
  const workBox = await openWork.boundingBox();
  const summaryBox = await summary.boundingBox();
  expect(workBox && summaryBox && workBox.x > summaryBox.x).toBeTruthy();
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
});
