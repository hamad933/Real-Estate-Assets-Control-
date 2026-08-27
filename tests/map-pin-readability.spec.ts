import { expect, test } from "@playwright/test";

async function expectUpright(elements: ReturnType<import("@playwright/test").Page["locator"]>) {
  const count = await elements.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    const rotate = await elements.nth(index).evaluate((element) => getComputedStyle(element).rotate);
    expect(rotate).toBe("none");
  }
}

test("S01 and S03 map marker labels remain upright", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto("/");
  const discoveryPins = page
    .locator('[aria-label="معاينة خريطة العقارات"] > span')
    .filter({ hasText: /^\d+$/ });
  await expectUpright(discoveryPins);

  await page.goto("/map");
  const mapPins = page.locator('section[aria-label="خريطة العقارات"] button[aria-label^="تحديد "]');
  await expectUpright(mapPins);
});
