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
  await expect(page.getByText("10 أغسطس 2026", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("SRV-2026-0891")).toHaveCount(0);

  await page.goto(`/operations/records/${recordId}/maintenance`);
  await expect(page.getByRole("heading", { name: "الصيانة والخدمة" })).toBeVisible();
  await expect(page.getByText("تحت المعالجة", { exact: true })).toBeVisible();
  await expect(page.getByText("SRV-2026-0891", { exact: true })).toBeVisible();
  await expect(page.getByText("مؤسسة أفق الصيانة", { exact: true })).toBeVisible();
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
  await expect(page.getByText("دفعة أغسطس ومسارات خدمة مفتوحة", { exact: true })).toBeVisible();
});

test("deterministic occupancy, payment, and maintenance states do not drift", async ({ page }) => {
  await setSession(page, "operations-demo");

  await page.goto(`/operations/records/${recordId}/occupancy`);
  await expect(page.getByText("15 سبتمبر 2025", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("14 سبتمبر 2026", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("مستأجر مسجل", { exact: true })).toBeVisible();

  await page.goto(`/operations/records/${recordId}/payments`);
  await expect(page.getByRole("cell", { name: "أغسطس 2026", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "متأخرة", exact: true })).toBeVisible();
  await expect(page.getByText("لا يوجد اتصال بخدمة خارجية", { exact: true })).toBeVisible();

  await page.goto(`/operations/records/${recordId}/maintenance`);
  await expect(page.getByText("صيانة تكييف", { exact: true })).toBeVisible();
  await expect(page.getByText("ملاحظة سباكة", { exact: true })).toBeVisible();
  await expect(page.getByText("خدمة كهربائية", { exact: true })).toBeVisible();
});

test("enabled W03 actions produce explicit local outcomes", async ({ page }) => {
  await setSession(page, "operations-demo");

  await page.goto("/operations");
  await page.getByTestId("readiness-review-action").click();
  await expect(page.getByTestId("readiness-review-state")).toHaveText("تمت محليًا");
  await expect(page.getByTestId("readiness-action-feedback")).toHaveText(
    "تمت مراجعة العنصر المفتوح محليًا داخل هذه الجلسة التجريبية فقط."
  );

  await page.getByTestId("readiness-followup-action").click();
  await expect(page.getByTestId("readiness-followup-state")).toHaveText(
    "12 أغسطس 2026، 10:00 ص"
  );
  await expect(page.getByTestId("readiness-action-feedback")).toContainText(
    "لا توجد رسالة أو مزامنة خارجية"
  );

  await page.goto(`/operations/records/${recordId}/payments`);
  await page.getByTestId("collection-followup-action").click();
  await expect(page.getByTestId("collection-followup-state")).toHaveText(
    "متابعة داخلية مطلوبة"
  );
  await expect(page.getByTestId("collection-action-feedback")).toContainText(
    "لم يُرسل أي اتصال خارجي"
  );

  await page.getByTestId("collection-note-action").click();
  await expect(page.getByTestId("collection-note-state")).toHaveText(
    "تمت مراجعة الاستحقاق؛ لا يوجد اتصال خارجي."
  );
  await expect(page.getByTestId("collection-action-feedback")).toHaveText(
    "تمت إضافة ملاحظة تحصيل تركيبية محليًا داخل هذه الجلسة فقط."
  );
});

test("unavailable and non-action surfaces leave no enabled silent no-op", async ({ page }) => {
  await setSession(page, "operations-demo");

  await page.goto("/operations");
  const readinessMain = page.locator("main");
  await expect(readinessMain.getByRole("button")).toHaveCount(3);
  await expect(page.getByTestId("readiness-documents-action")).toBeDisabled();
  await expect(
    page.getByText(
      "غير متاح في النموذج التركيبي الحالي: تحديث الوثائق يتطلب حفظًا أو مخزن مستندات، وهما خارج نطاق W03.",
      { exact: true }
    )
  ).toBeVisible();

  await page.goto(`/operations/records/${recordId}/occupancy`);
  await expect(page.locator("main").getByRole("button")).toHaveCount(0);

  await page.goto(`/operations/records/${recordId}/payments`);
  await expect(page.locator("main").getByRole("button")).toHaveCount(2);

  await page.goto(`/operations/records/${recordId}/maintenance`);
  await expect(page.locator("main").getByRole("button")).toHaveCount(0);
});

test("local demo action state does not persist across reload", async ({ page }) => {
  await setSession(page, "operations-demo");
  await page.goto("/operations");

  await page.getByTestId("readiness-review-action").click();
  await expect(page.getByTestId("readiness-review-state")).toHaveText("تمت محليًا");

  await page.reload();
  await expect(page.getByTestId("readiness-review-state")).toHaveText("لم تتم بعد");
  await expect(page.getByTestId("readiness-followup-state")).toHaveText("غير مجدولة محليًا");
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
