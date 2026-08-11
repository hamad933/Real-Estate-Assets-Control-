import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";
const stateDir = path.resolve("evidence/screenshots/w07-states");

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

async function expectNoOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport);
}

async function stateShot(page: Page, name: string) {
  fs.mkdirSync(stateDir, { recursive: true });
  await expectNoOverflow(page);
  await page.screenshot({ path: path.join(stateDir, name), fullPage: true, caret: "initial" });
}

test("W07 keeps repository-native property photography coherent across operational workspaces", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await setSession(page, "operations-demo");
  for (const route of [
    "/operations",
    "/operations/records/ops-record-101/occupancy",
    "/operations/records/ops-record-101/payments",
    "/operations/records/ops-record-101/maintenance"
  ]) {
    await page.goto(route);
    const photo = page.getByTestId("property-photo").first();
    await expect(photo).toBeVisible();
    await expect(photo).toHaveCSS("background-image", /property-sprite\.webp/);
    await expectNoOverflow(page);
  }

  await setSession(page, "tenant-demo");
  await page.goto("/tenant");
  await expect(page.getByTestId("property-photo").first()).toBeVisible();
  await expect(page.getByText("72,000 ريال", { exact: true })).toBeVisible();
  await expect(page.getByText("6,000 ريال", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("SRV-2026-0891", { exact: true })).toBeVisible();

  await setSession(page, "contractor-demo");
  await page.goto("/contractor");
  await expect(page.getByTestId("property-photo").first()).toBeVisible();
  await expect(page.getByText("SRV-2026-0891", { exact: true })).toBeVisible();

  await setSession(page, "admin-demo");
  await page.goto("/admin");
  await expect(page.getByTestId("property-photo").first()).toBeVisible();
  await page.getByRole("button", { name: "اختيار فيلا الياسمين" }).click();
  await expect(page.getByTestId("s13-selected-context")).toContainText("فيلا الياسمين");
  await expect(page.getByTestId("property-photo").first()).toHaveCSS("background-image", /property-sprite\.webp/);
});

test("W07 captures empty, error, disabled, interaction, and confirmation states", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto("/search?district=all&type=all&budget=all&rooms=all&availability=all");
  await page.getByLabel("نوع العقار").selectOption("villa");
  await page.getByLabel("المنطقة / الحي").selectOption("narjis");
  await expect(page.getByRole("heading", { name: "لا توجد نتائج بهذه المعايير" })).toBeVisible();
  await stateShot(page, "S02-empty-search-desktop.png");

  await page.goto("/inquiry?property=narjis-101");
  await page.getByRole("button", { name: "إرسال الطلب" }).click();
  await expect(page.getByText("اختر تاريخًا مناسبًا للزيارة.")).toBeVisible();
  await stateShot(page, "S07-validation-error-desktop.png");

  await setSession(page, "operations-demo");
  await page.goto("/operations");
  await expect(page.getByTestId("readiness-documents-action")).toBeDisabled();
  await page.getByTestId("readiness-review-action").click();
  await expect(page.getByTestId("readiness-review-state")).toHaveText("تمت المراجعة");
  await stateShot(page, "S05-reviewed-and-disabled-desktop.png");

  await setSession(page, "tenant-demo");
  await page.goto("/tenant");
  await page.getByTestId("tenant-create-service-request").first().click();
  await expect(page.getByRole("status").filter({ hasText: "تم إنشاء طلب الخدمة" }).first()).toBeVisible();
  await stateShot(page, "S11-service-confirmation-desktop.png");

  await setSession(page, "contractor-demo");
  await page.goto("/contractor");
  await page.getByTestId("contractor-upload-evidence").click();
  await expect(page.getByTestId("approve-completion")).toBeDisabled();
  await expect(page.getByTestId("approve-cost")).toBeDisabled();
  await stateShot(page, "S12-evidence-and-disabled-approval-desktop.png");

  await setSession(page, "admin-demo");
  await page.goto("/admin");
  await page.getByRole("searchbox", { name: "ابحث باسم العقار أو الوحدة" }).fill("غير موجود إطلاقًا");
  await expect(page.getByTestId("s13-no-match")).toBeVisible();
  await expect(page.getByTestId("s13-columns-disabled")).toBeDisabled();
  await expect(page.getByTestId("s13-actions-disabled")).toBeDisabled();
  await stateShot(page, "S13-no-match-and-disabled-desktop.png");
});
