import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";
const evidenceDir = path.resolve("evidence/screenshots/w08");

async function setContractorSession(page: import("@playwright/test").Page) {
  await page.context().clearCookies();
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

test("S12 three work columns share one desktop row", async ({ page }) => {
  await setContractorSession(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/contractor");
  await expect(page.getByRole("heading", { name: "تفاصيل المهمة الموكلة إليك" })).toBeVisible();

  const work = page.locator('[data-rp04-surface="s12-three-column-work"]');
  const children = work.locator(":scope > *");
  await expect(children).toHaveCount(3);
  const boxes = await Promise.all([0, 1, 2].map((index) => children.nth(index).boundingBox()));
  for (const box of boxes) expect(box).not.toBeNull();
  const tops = boxes.map((box) => box?.y ?? 0);
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(8);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  fs.mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDir, "S12-three-column-layout-regression-desktop.png"),
    fullPage: true,
    caret: "initial"
  });
});

test("S12 tablet keeps the two primary columns aligned and execution below", async ({ page }) => {
  await setContractorSession(page);
  await page.setViewportSize({ width: 1000, height: 1000 });
  await page.goto("/contractor");

  const work = page.locator('[data-rp04-surface="s12-three-column-work"]');
  const children = work.locator(":scope > *");
  const location = await children.nth(0).boundingBox();
  const assignment = await children.nth(1).boundingBox();
  const execution = await children.nth(2).boundingBox();
  expect(location).not.toBeNull();
  expect(assignment).not.toBeNull();
  expect(execution).not.toBeNull();
  expect(Math.abs((location?.y ?? 0) - (assignment?.y ?? 0))).toBeLessThanOrEqual(8);
  expect(execution?.y ?? 0).toBeGreaterThan(Math.max((location?.y ?? 0) + (location?.height ?? 0), (assignment?.y ?? 0) + (assignment?.height ?? 0)) - 8);
});

test("S12 mobile returns to natural stacked order", async ({ page }) => {
  await setContractorSession(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contractor");

  const children = page.locator('[data-rp04-surface="s12-three-column-work"] > *');
  const boxes = await Promise.all([0, 1, 2].map((index) => children.nth(index).boundingBox()));
  for (const box of boxes) expect(box).not.toBeNull();
  expect(boxes[0]?.y ?? 0).toBeLessThan(boxes[1]?.y ?? 0);
  expect(boxes[1]?.y ?? 0).toBeLessThan(boxes[2]?.y ?? 0);
});
