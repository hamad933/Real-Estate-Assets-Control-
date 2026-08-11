import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const evidenceDir = path.resolve("evidence/screenshots/w02");
const shortlist = "narjis-101,yasmin-villa";

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport);
}

async function shot(page: Page, name: string) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  await expectNoPageOverflow(page);
  await page.screenshot({ path: path.join(evidenceDir, name), fullPage: true, caret: "initial" });
}

test("complete visitor journey from discovery to inquiry confirmation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "اعثر على المكان المناسب لك" })).toBeVisible();

  await page.goto("/search?district=all&type=all&budget=all&rooms=all&availability=all");
  await expect(page.getByText("6 عقارات", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "إضافة شقة النرجس 101 إلى القائمة المختصرة" }).click();
  await page.getByRole("button", { name: "إضافة فيلا الياسمين إلى القائمة المختصرة" }).click();
  await expect(page.getByRole("link", { name: "المختصرة (2)" })).toBeVisible();

  await page.getByRole("link", { name: "عرض على الخريطة" }).click();
  await expect(page.getByRole("heading", { name: "الخريطة والقائمة" })).toBeVisible();
  await page.getByRole("button", { name: "تحديد فيلا الياسمين" }).click();
  await expect(page.getByTestId("map-selected-card")).toContainText("فيلا الياسمين");
  await page.getByTestId("map-selected-card").getByRole("link", { name: "عرض التفاصيل" }).click();

  await expect(page.getByRole("heading", { name: "فيلا الياسمين", level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "المختصرة (2)" }).click();
  await expect(page.getByRole("heading", { name: "قارن الخيارات التي اخترتها" })).toBeVisible();
  await page.getByRole("button", { name: "المساحة" }).click();
  await expect(page.getByTestId("recommendation")).toContainText("فيلا الياسمين");
  await expect(page.getByTestId("recommendation")).toContainText("أكبر مساحة");
  await page.getByRole("link", { name: "الاستفسار عن هذا الخيار" }).click();

  await expect(page.getByRole("heading", { name: "طلب زيارة أو استفسار" })).toBeVisible();
  await page.getByRole("button", { name: "إرسال الطلب" }).click();
  await expect(page.getByText("اختر تاريخًا مناسبًا للزيارة.")).toBeVisible();
  await expect(page.getByText("أدخل اسمًا من حرفين على الأقل.")).toBeVisible();
  await expect(page.getByText("أدخل رقم جوال بصيغة 05XXXXXXXX.")).toBeVisible();

  await page.getByLabel("تاريخ مقترح").fill("2026-08-20");
  await page.getByLabel("الاسم").fill("مستخدم استعراضي");
  await page.getByLabel("رقم الجوال").fill("0500000000");
  await page.getByRole("button", { name: "إرسال الطلب" }).click();
  await expect(page.getByRole("heading", { name: "شكرًا، تم تسجيل طلبك" })).toBeVisible();
  await expect(page.getByText(/لا يتم إرسال بيانات أو إنشاء حجز فعلي/)).toBeVisible();
});

test("search filters change deterministic results and expose an empty state", async ({ page }) => {
  await page.goto("/search?district=all&type=all&budget=all&rooms=all&availability=all");
  await expect(page.getByText("6 عقارات", { exact: true })).toBeVisible();

  await page.getByLabel("نوع العقار").selectOption("villa");
  await expect(page.getByText("2 عقارات", { exact: true })).toBeVisible();

  await page.getByLabel("المنطقة / الحي").selectOption("narjis");
  await expect(page.getByRole("heading", { name: "لا توجد نتائج بهذه المعايير" })).toBeVisible();
  await page.getByRole("button", { name: "عرض جميع العقارات" }).click();
  await expect(page.getByText("6 عقارات", { exact: true })).toBeVisible();
});

test("negative public states remain visitor-safe", async ({ page }) => {
  await page.goto("/compare");
  await expect(page.getByRole("heading", { name: "أضف عقارين على الأقل للمقارنة" })).toBeVisible();

  await page.goto("/assets/not-a-real-property");
  await expect(page.getByRole("heading", { name: "العقار غير موجود" })).toBeVisible();
  await expect(page.getByText(/الرابط غير صحيح/)).toBeVisible();

  await page.goto("/map?district=narjis&type=villa&budget=all&rooms=all&availability=all");
  await expect(page.getByText("0 عقارات على الخريطة", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "لا توجد عقارات هنا" })).toBeVisible();
});

test("W02 public surfaces use repository-native authorized photography", async ({ page }) => {
  await page.goto("/");
  const heroPhoto = page.getByTestId("property-photo").first();
  await expect(heroPhoto).toBeVisible();
  await expect(heroPhoto).toHaveCSS("background-image", /property-sprite\.webp/);

  await page.goto("/search?district=all&type=all&budget=all&rooms=all&availability=all");
  await expect(page.getByTestId("property-photo").first()).toBeVisible();

  await page.goto("/assets/yasmin-villa");
  await expect(page.getByTestId("property-photo")).toHaveCount(3);
});

test("capture desktop evidence for all six W02 surfaces", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto("/");
  await shot(page, "S01-asset-discovery-desktop.png");

  await page.goto(`/search?district=all&type=all&budget=all&rooms=all&availability=all&shortlist=${shortlist}`);
  await shot(page, "S02-search-shortlists-desktop.png");

  await page.goto(`/map?district=all&type=all&budget=all&rooms=all&availability=all&shortlist=${shortlist}`);
  await shot(page, "S03-map-list-desktop.png");

  await page.goto(`/assets/narjis-101?shortlist=${shortlist}`);
  await shot(page, "S04-asset-detail-desktop.png");

  await page.goto(`/compare?shortlist=${shortlist}`);
  await shot(page, "S06-comparison-desktop.png");

  await page.goto(`/inquiry?property=narjis-101&shortlist=${shortlist}`);
  await shot(page, "S07-inquiry-desktop.png");
});

test("capture representative responsive evidence for all six W02 surfaces", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/");
  await shot(page, "S01-asset-discovery-mobile.png");

  await page.goto(`/search?district=all&type=all&budget=all&rooms=all&availability=all&shortlist=${shortlist}`);
  await shot(page, "S02-search-shortlists-mobile.png");

  await page.goto(`/map?district=all&type=all&budget=all&rooms=all&availability=all&shortlist=${shortlist}`);
  await shot(page, "S03-map-list-mobile.png");

  await page.goto(`/assets/narjis-101?shortlist=${shortlist}`);
  await shot(page, "S04-asset-detail-mobile.png");

  await page.goto(`/compare?shortlist=${shortlist}`);
  await shot(page, "S06-comparison-mobile.png");

  await page.goto(`/inquiry?property=narjis-101&shortlist=${shortlist}`);
  await shot(page, "S07-inquiry-mobile.png");
});
