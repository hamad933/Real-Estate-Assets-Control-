import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";
const evidenceDir = path.resolve("evidence/screenshots/w08");
const shortlist = "narjis-101,yasmin-villa";
const operationsRecord = "ops-record-101";

const forbiddenVisibleTerms = [
  "RP04",
  "W07",
  "W08",
  "S01",
  "S13",
  "PR #",
  "Playwright",
  "SQLite",
  "exact head",
  "workstream",
  "executor",
  "controller",
  "artifact",
  "fixture"
] as const;

async function setSession(page: Page, fixtureId?: string) {
  await page.context().clearCookies();
  if (!fixtureId) return;
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

async function expectNoInternalVocabulary(page: Page) {
  const visibleText = await page.locator("body").innerText();
  for (const term of forbiddenVisibleTerms) {
    expect(visibleText, `visible internal term leaked: ${term}`).not.toContain(term);
  }
}

async function capture(page: Page, name: string) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  await expectNoOverflow(page);
  await expectNoInternalVocabulary(page);
  await page.screenshot({ path: path.join(evidenceDir, name), fullPage: true, caret: "initial" });
}

async function openAndCapture(
  page: Page,
  options: {
    route: string;
    name: string;
    viewport: { width: number; height: number };
    fixtureId?: string;
    heading?: string;
  }
) {
  await setSession(page, options.fixtureId);
  await page.setViewportSize(options.viewport);
  await page.goto(options.route);
  if (options.heading) {
    await expect(page.getByRole("heading", { name: options.heading }).first()).toBeVisible();
  }
  await capture(page, options.name);
}

const desktop = { width: 1440, height: 1000 };
const tablet = { width: 820, height: 1000 };
const mobile = { width: 390, height: 844 };

const publicSurfaces = [
  { code: "S01", route: "/", heading: "اعثر على المكان المناسب لك", slug: "asset-discovery" },
  { code: "S02", route: `/search?district=all&type=all&budget=all&rooms=all&availability=all&shortlist=${shortlist}`, heading: "عقارات مطابقة لبحثك", slug: "search-shortlists" },
  { code: "S03", route: `/map?district=all&type=all&budget=all&rooms=all&availability=all&shortlist=${shortlist}`, heading: "الخريطة والقائمة", slug: "map-list" },
  { code: "S04", route: `/assets/narjis-101?shortlist=${shortlist}`, heading: "شقة النرجس 101", slug: "asset-detail" },
  { code: "S06", route: `/compare?shortlist=${shortlist}`, heading: "قارن الخيارات التي اخترتها", slug: "comparison" },
  { code: "S07", route: `/inquiry?property=narjis-101&shortlist=${shortlist}`, heading: "طلب زيارة أو استفسار", slug: "inquiry" }
] as const;

for (const surface of publicSurfaces) {
  test(`W08 ${surface.code} desktop and mobile evidence`, async ({ page }) => {
    await openAndCapture(page, {
      route: surface.route,
      name: `${surface.code}-${surface.slug}-desktop.png`,
      viewport: desktop,
      heading: surface.heading
    });
    await openAndCapture(page, {
      route: surface.route,
      name: `${surface.code}-${surface.slug}-mobile.png`,
      viewport: mobile,
      heading: surface.heading
    });
  });
}

const operationsSurfaces = [
  { code: "S05", route: "/operations", heading: "الجاهزية التشغيلية", slug: "operational-readiness" },
  { code: "S08", route: `/operations/records/${operationsRecord}/occupancy`, heading: "سجل الإشغال والسكن", slug: "occupancy-record" },
  { code: "S09", route: `/operations/records/${operationsRecord}/payments`, heading: "سجل الدفعات والتحصيل", slug: "payment-record" },
  { code: "S10", route: `/operations/records/${operationsRecord}/maintenance`, heading: "الصيانة والخدمة", slug: "maintenance-record" }
] as const;

for (const surface of operationsSurfaces) {
  test(`W08 ${surface.code} desktop and mobile evidence`, async ({ page }) => {
    await openAndCapture(page, {
      route: surface.route,
      name: `${surface.code}-${surface.slug}-desktop.png`,
      viewport: desktop,
      fixtureId: "operations-demo",
      heading: surface.heading
    });
    await openAndCapture(page, {
      route: surface.route,
      name: `${surface.code}-${surface.slug}-mobile.png`,
      viewport: mobile,
      fixtureId: "operations-demo",
      heading: surface.heading
    });
  });
}

test("W08 S11 desktop and mobile evidence", async ({ page }) => {
  await openAndCapture(page, { route: "/tenant", name: "S11-tenant-self-service-desktop.png", viewport: desktop, fixtureId: "tenant-demo", heading: "خدمات المستأجر" });
  await openAndCapture(page, { route: "/tenant", name: "S11-tenant-self-service-mobile.png", viewport: mobile, fixtureId: "tenant-demo", heading: "خدمات المستأجر" });
});

test("W08 S12 desktop tablet and mobile evidence", async ({ page }) => {
  await openAndCapture(page, { route: "/contractor", name: "S12-contractor-work-desktop.png", viewport: desktop, fixtureId: "contractor-demo", heading: "تفاصيل المهمة الموكلة إليك" });
  await openAndCapture(page, { route: "/contractor", name: "S12-contractor-work-tablet.png", viewport: tablet, fixtureId: "contractor-demo", heading: "تفاصيل المهمة الموكلة إليك" });
  await openAndCapture(page, { route: "/contractor", name: "S12-contractor-work-mobile.png", viewport: mobile, fixtureId: "contractor-demo", heading: "تفاصيل المهمة الموكلة إليك" });
});

test("W08 S13 desktop and mobile evidence", async ({ page }) => {
  await openAndCapture(page, { route: "/admin", name: "S13-portfolio-operations-desktop.png", viewport: desktop, fixtureId: "admin-demo", heading: "عمليات المحافظ" });
  await openAndCapture(page, { route: "/admin", name: "S13-portfolio-operations-mobile.png", viewport: mobile, fixtureId: "admin-demo", heading: "عمليات المحافظ" });
});

test("W08 customer-facing surfaces do not leak internal build vocabulary", async ({ page }) => {
  const routes: Array<{ route: string; fixtureId?: string }> = [
    { route: "/" },
    { route: "/search?district=all&type=all&budget=all&rooms=all&availability=all" },
    { route: "/map" },
    { route: "/assets/narjis-101" },
    { route: `/compare?shortlist=${shortlist}` },
    { route: "/inquiry?property=narjis-101" },
    { route: "/sign-in" },
    { route: "/operations", fixtureId: "operations-demo" },
    { route: `/operations/records/${operationsRecord}/occupancy`, fixtureId: "operations-demo" },
    { route: `/operations/records/${operationsRecord}/payments`, fixtureId: "operations-demo" },
    { route: `/operations/records/${operationsRecord}/maintenance`, fixtureId: "operations-demo" },
    { route: "/tenant", fixtureId: "tenant-demo" },
    { route: "/contractor", fixtureId: "contractor-demo" },
    { route: "/admin", fixtureId: "admin-demo" }
  ];

  for (const item of routes) {
    await setSession(page, item.fixtureId);
    await page.goto(item.route);
    await expectNoInternalVocabulary(page);
  }
});

test("W08 important empty validation confirmation disabled selected and denied states", async ({ page }) => {
  await setSession(page);
  await page.setViewportSize(desktop);
  await page.goto("/search?district=all&type=all&budget=all&rooms=all&availability=all");
  await page.getByLabel("نوع العقار").selectOption("villa");
  await page.getByLabel("المنطقة / الحي").selectOption("narjis");
  await expect(page.getByRole("heading", { name: "لا توجد نتائج بهذه المعايير" })).toBeVisible();
  await capture(page, "STATE-empty-search-desktop.png");

  await page.goto("/inquiry?property=narjis-101");
  await page.getByRole("button", { name: "إرسال الطلب" }).click();
  await expect(page.getByText("اختر تاريخًا مناسبًا للزيارة.")).toBeVisible();
  await capture(page, "STATE-inquiry-validation-desktop.png");

  await page.getByLabel("تاريخ مقترح").fill("2026-08-20");
  await page.getByLabel("الاسم").fill("مستخدم استعراضي");
  await page.getByLabel("رقم الجوال").fill("0500000000");
  await page.getByRole("button", { name: "إرسال الطلب" }).click();
  await expect(page.getByRole("heading", { name: "شكرًا، تم تسجيل طلبك" })).toBeVisible();
  await capture(page, "STATE-inquiry-confirmation-desktop.png");

  await setSession(page, "operations-demo");
  await page.goto("/operations");
  await expect(page.getByTestId("readiness-documents-action")).toBeDisabled();
  await page.getByTestId("readiness-review-action").click();
  await expect(page.getByTestId("readiness-review-state")).toHaveText("تمت المراجعة");
  await capture(page, "STATE-readiness-reviewed-disabled-desktop.png");

  await setSession(page, "tenant-demo");
  await page.goto("/tenant");
  await page.getByTestId("tenant-create-service-request").first().click();
  await expect(page.getByRole("status").filter({ hasText: "تم إنشاء طلب الخدمة" }).first()).toBeVisible();
  await capture(page, "STATE-tenant-service-confirmation-desktop.png");

  await setSession(page, "contractor-demo");
  await page.goto("/contractor");
  await page.getByTestId("contractor-upload-evidence").click();
  await expect(page.getByTestId("approve-completion")).toBeDisabled();
  await expect(page.getByTestId("approve-cost")).toBeDisabled();
  await capture(page, "STATE-contractor-disabled-approval-desktop.png");

  await setSession(page, "admin-demo");
  await page.goto("/admin");
  await page.getByRole("button", { name: "اختيار فيلا الياسمين" }).click();
  await page.getByTestId("s13-review-open-conditions").click();
  await expect(page.getByTestId("s13-review-mode")).toBeVisible();
  await capture(page, "STATE-admin-selected-review-desktop.png");
  await page.getByRole("searchbox", { name: "ابحث باسم العقار أو الوحدة" }).fill("غير موجود إطلاقًا");
  await expect(page.getByTestId("s13-no-match")).toBeVisible();
  await capture(page, "STATE-admin-empty-disabled-desktop.png");

  await setSession(page, "tenant-demo");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/access-denied\?reason=workspace/);
  await capture(page, "STATE-access-denied-desktop.png");
});

test("W08 supporting sign-in access-denied and not-found surfaces are polished", async ({ page }) => {
  await openAndCapture(page, { route: "/sign-in", name: "SUPPORT-sign-in-desktop.png", viewport: desktop, heading: "الوصول إلى العقارات والأصول" });
  await setSession(page, "tenant-demo");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "لا يمكنك الوصول إلى هذه الصفحة" })).toBeVisible();
  await capture(page, "SUPPORT-access-denied-desktop.png");
  await setSession(page);
  await page.goto("/route-that-does-not-exist-w08");
  await expect(page.getByRole("heading", { name: "لم نجد الصفحة التي تبحث عنها" })).toBeVisible();
  await capture(page, "SUPPORT-not-found-desktop.png");
});

test("W08 representative journeys have clean runtime console and requests", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const requestFailures: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? "failed"}`));

  const journey: Array<{ route: string; fixtureId?: string }> = [
    { route: "/" },
    { route: `/search?district=all&type=all&budget=all&rooms=all&availability=all&shortlist=${shortlist}` },
    { route: `/assets/narjis-101?shortlist=${shortlist}` },
    { route: `/compare?shortlist=${shortlist}` },
    { route: "/operations", fixtureId: "operations-demo" },
    { route: "/tenant", fixtureId: "tenant-demo" },
    { route: "/contractor", fixtureId: "contractor-demo" },
    { route: "/admin", fixtureId: "admin-demo" }
  ];

  for (const item of journey) {
    await setSession(page, item.fixtureId);
    await page.goto(item.route);
    await expectNoOverflow(page);
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(requestFailures).toEqual([]);
});
