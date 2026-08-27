import { expect, test } from "@playwright/test";

async function expectRtl(page: import("@playwright/test").Page, locator: string) {
  const element = page.locator(locator).first();
  await expect(element).toBeVisible();
  expect(await element.evaluate((node) => getComputedStyle(node).direction)).toBe("rtl");
}

test("public structural layouts remain semantically RTL without physical hero offset", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto("/");
  await expectRtl(page, "header > div");

  await page.goto("/search?district=all&type=all&budget=all&availability=all");
  const resultSection = page.locator('section[aria-label="نتائج العقارات"]');
  await expect(resultSection).toBeVisible();
  expect(await resultSection.evaluate((node) => getComputedStyle(node.parentElement!).direction)).toBe("rtl");

  await page.goto("/map");
  const mapSection = page.locator('section[aria-label="خريطة العقارات"]');
  await expect(mapSection).toBeVisible();
  expect(await mapSection.evaluate((node) => getComputedStyle(node.parentElement!).direction)).toBe("rtl");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const caption = page.getByText("خيار مميز").locator("..");
  const logicalStart = await caption.evaluate((node) => getComputedStyle(node).insetInlineStart);
  expect(logicalStart).toBe("12px");
});
