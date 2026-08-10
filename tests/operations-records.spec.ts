import { expect, test, type Page } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";
const recordId = "ops-record-101";

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

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasOverflow).toBe(false);
}

test("OPERATIONS can access every owned W03 surface", async ({ page }) => {
  await setSession(page, "operations-demo");

  await page.goto("/operations");
  await expect(page.getByRole("heading", { name: "الجاهزية التشغيلية" })).toBeVisible();
  await expect(page.getByText("يحتاج إجراء", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("عناصر مكتملة", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("82%");

  await page.goto(`/operations/records/${recordId}/occupancy`);
  await expect(page.getByRole("heading", { name: "سجل الإشغال والسكن" })).toBeVisible();
  await expect(page.getByText("مشغول", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("05× ××× ××××", { exact: true })).toBeVisible();
  await expect(page.getByText("musta***@mail.com", { exact: true })).toBeVisible();

  await page.goto(`/operations/records/${recordId}/payments`);
  await expect(page.getByRole("heading", { name: "سجل الدفعات والتحصيل" })).toBeVisible();
  await expect(page.getByText("6,000 ريال", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("15 أغسطس 2026", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("SRV-2026-0891")).toHaveCount(0);

  await page.goto(`/operations/records/${recordId}/maintenance`);
  await expect(page.getByRole("heading", { name: "الصيانة والخدمة" })).toBeVisible();
  await expect(page.getByText("تحت المعالجة", { exact: true })).toBeVisible();
  await expect(page.getByText("SRV-2026-0891", { exact: true })).toBeVisible();
  await expect(page.getByText("فريق الخدمة المعتمد", { exact: true })).toBeVisible();
});

test("operations record scope denial applies to hub and nested surfaces", async ({ page }) => {
  await setSession(page, "operations-demo");

  for (const route of [
    "/operations/records/ops-record-202",
    "/operations/records/ops-record-202/occupancy",
    "/operations/records/ops-record-202/payments",
    "/operations/records/ops-record-202/maintenance"
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/access-denied\?reason=scope/);
  }
});

test("cross-workspace sessions cannot access W03 operations records", async ({ page }) => {
  for (const fixtureId of ["tenant-demo", "contractor-demo", "admin-demo"]) {
    await setSession(page, fixtureId);
    await page.goto(`/operations/records/${recordId}/payments`);
    await expect(page).toHaveURL(/\/access-denied\?reason=workspace/);
  }
});

test("record navigation preserves the authorized record context", async ({ page }) => {
  await setSession(page, "operations-demo");
  await page.goto(`/operations/records/${recordId}/occupancy`);

  await page.getByRole("link", { name: /S09.*الدفعات والتحصيل/ }).click();
  await expect(page).toHaveURL(new RegExp(`/operations/records/${recordId}/payments$`));
  await expect(page.getByText("6,000 ريال", { exact: true }).first()).toBeVisible();

  await page.getByRole("link", { name: /S10.*الصيانة والخدمة/ }).click();
  await expect(page).toHaveURL(new RegExp(`/operations/records/${recordId}/maintenance$`));
  await expect(page.getByText("SRV-2026-0892", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: /S05.*الجاهزية التشغيلية/ }).click();
  await expect(page).toHaveURL(/\/operations$/);
  await expect(page.getByText("شهادة السلامة غير محدثة", { exact: true })).toBeVisible();
});

test("deterministic occupancy, payment, and maintenance states do not drift", async ({ page }) => {
  await setSession(page, "operations-demo");

  await page.goto(`/operations/records/${recordId}/occupancy`);
  await expect(page.getByText("01 سبتمبر 2025", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("31 أغسطس 2026", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("مستأجر مسجل", { exact: true })).toBeVisible();

  await page.goto(`/operations/records/${recordId}/payments`);
  await expect(page.getByRole("cell", { name: "أغسطس 2026" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "مستحقة" })).toBeVisible();
  await expect(page.getByText("لا يوجد اتصال بخدمة خارجية", { exact: true })).toBeVisible();

  await page.goto(`/operations/records/${recordId}/maintenance`);
  await expect(page.getByText("صيانة تكييف", { exact: true })).toBeVisible();
  await expect(page.getByText("ملاحظة سباكة", { exact: true })).toBeVisible();
  await expect(page.getByText("خدمة كهربائية", { exact: true })).toBeVisible();
});

const surfaces = [
  { code: "s05", route: "/operations", heading: "الجاهزية التشغيلية" },
  { code: "s08", route: `/operations/records/${recordId}/occupancy`, heading: "سجل الإشغال والسكن" },
  { code: "s09", route: `/operations/records/${recordId}/payments`, heading: "سجل الدفعات والتحصيل" },
  { code: "s10", route: `/operations/records/${recordId}/maintenance`, heading: "الصيانة والخدمة" }
] as const;

for (const surface of surfaces) {
  test(`${surface.code.toUpperCase()} desktop and responsive evidence`, async ({ page }) => {
    await setSession(page, "operations-demo");

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(surface.route);
    await expect(page.getByRole("heading", { name: surface.heading })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `evidence/screenshots/w03-${surface.code}-desktop.png`,
      fullPage: true
    });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(surface.route);
    await expect(page.getByRole("heading", { name: surface.heading })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `evidence/screenshots/w03-${surface.code}-responsive.png`,
      fullPage: true
    });
  });
}
