import { expect, test, type Page } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";

async function setContractorSession(page: Page) {
  await page.context().addCookies([
    {
      name: "rp04_demo_session",
      value: "contractor-demo",
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

test("S12 approved assigned-work composition preserves three-column task hierarchy", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await setContractorSession(page);
  await page.goto("/contractor");

  const workspace = page.locator('[data-rp04-surface="s12-contractor-workspace"]');
  const body = page.locator('[data-rp04-surface="s12-three-column-work"]');
  await expect(workspace).toBeVisible();
  await expect(body).toBeVisible();
  await expect(page.getByRole("heading", { name: "سياق الوصول" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "التنفيذ والتقرير" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "الأعمال المسندة إليك" })).toBeVisible();
  expect(await body.evaluate((node) => getComputedStyle(node).direction)).toBe("rtl");
  expect(await body.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length)).toBeGreaterThan(2);
  await expect(page.getByTestId("approve-completion")).toBeDisabled();
  await expect(page.getByTestId("approve-cost")).toBeDisabled();
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
});
