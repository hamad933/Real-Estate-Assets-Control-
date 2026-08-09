import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const evidenceDir = path.resolve("evidence/screenshots");
const baseURL = "http://127.0.0.1:3000";

async function setSession(page: Page, fixtureId: string) {
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

async function shot(page: Page, name: string) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDir, name),
    fullPage: true
  });
}

test("capture representative desktop shells", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "اعثر على المكان المناسب لك" })).toBeVisible();
  await shot(page, "01-public-desktop.png");

  await page.goto("/sign-in");
  await shot(page, "02-sign-in-desktop.png");

  await setSession(page, "operations-demo");
  await page.goto("/operations");
  await shot(page, "03-operations-desktop.png");

  await setSession(page, "tenant-demo");
  await page.goto("/tenant");
  await shot(page, "04-tenant-desktop.png");

  await setSession(page, "contractor-demo");
  await page.goto("/contractor");
  await shot(page, "05-contractor-desktop.png");

  await setSession(page, "admin-demo");
  await page.goto("/admin");
  await shot(page, "06-admin-desktop.png");

  await setSession(page, "tenant-demo");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/access-denied/);
  await shot(page, "07-access-denied-desktop.png");
});

test("capture responsive baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/");
  await shot(page, "08-public-mobile.png");

  await setSession(page, "tenant-demo");
  await page.goto("/tenant");
  await shot(page, "09-tenant-mobile.png");

  await setSession(page, "admin-demo");
  await page.goto("/admin");
  await shot(page, "10-admin-mobile.png");
});

test("capture tablet-width operations baseline", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  await setSession(page, "operations-demo");
  await page.goto("/operations");
  await shot(page, "11-operations-tablet.png");
});
