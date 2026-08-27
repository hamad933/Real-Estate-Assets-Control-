import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const evidenceDir = path.resolve("evidence/screenshots/w08");
const route = "/inquiry?property=narjis-101&shortlist=narjis-101,yasmin-villa";

test("S07 inquiry keeps the property context aligned with the form on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(route);
  await expect(page.getByRole("heading", { name: "طلب زيارة أو استفسار" })).toBeVisible();

  const form = page.locator("main form");
  const summary = page.locator("main aside");
  await expect(form).toBeVisible();
  await expect(summary).toBeVisible();

  const formBox = await form.boundingBox();
  const summaryBox = await summary.boundingBox();
  expect(formBox).not.toBeNull();
  expect(summaryBox).not.toBeNull();
  expect(Math.abs((formBox?.y ?? 0) - (summaryBox?.y ?? 0))).toBeLessThanOrEqual(8);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  fs.mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDir, "S07-inquiry-layout-regression-desktop.png"),
    fullPage: true,
    caret: "initial"
  });
});

test("S07 inquiry keeps the property context before the form on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);

  const formBox = await page.locator("main form").boundingBox();
  const summaryBox = await page.locator("main aside").boundingBox();
  expect(formBox).not.toBeNull();
  expect(summaryBox).not.toBeNull();
  expect((summaryBox?.y ?? 0)).toBeLessThan(formBox?.y ?? 0);
});
