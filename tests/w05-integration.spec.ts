import { expect, test, type Page } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";

async function clearSession(page: Page) {
  await page.context().clearCookies();
}

async function setSession(page: Page, fixtureId: string) {
  await clearSession(page);
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

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    dir: document.documentElement.dir,
    lang: document.documentElement.lang
  }));

  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.dir).toBe("rtl");
  expect(dimensions.lang).toBe("ar");
}

test("W05 assembled product exposes every reviewed surface family together", async ({ page }) => {
  await clearSession(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "اعثر على المكان المناسب لك" })).toBeVisible();
  await expect(page.getByTestId("property-photo").first()).toHaveCSS("background-image", /property-sprite\.webp/);

  await setSession(page, "operations-demo");
  await page.goto("/operations");
  await expect(page.getByRole("heading", { name: "الجاهزية التشغيلية" })).toBeVisible();
  await page.getByTestId("readiness-review-action").click();
  await expect(page.getByTestId("readiness-review-state")).toHaveText("تمت محليًا");

  await setSession(page, "tenant-demo");
  await page.goto("/tenant");
  await expect(page.getByRole("heading", { name: "خدمات المستأجر" })).toBeVisible();
  await expect(page.getByText("شقة النرجس 101", { exact: true }).first()).toBeVisible();

  await setSession(page, "contractor-demo");
  await page.goto("/contractor");
  await expect(page.getByRole("heading", { name: "تفاصيل المهمة الموكلة إليك" })).toBeVisible();
  await expect(page.getByTestId("approve-completion")).toBeDisabled();
  await expect(page.getByTestId("approve-cost")).toBeDisabled();

  await setSession(page, "admin-demo");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "عمليات المحافظ" })).toBeVisible();
  await page.getByRole("searchbox", { name: "ابحث باسم العقار أو الوحدة" }).fill("النرجس");
  await page.getByRole("button", { name: "اختيار شقة النرجس 101" }).click();
  await page.getByTestId("s13-review-open-conditions").click();
  await expect(page.getByTestId("s13-review-mode")).toContainText("الحالات المفتوحة — 4");
});

test("W05 authorization matrix preserves visitor, profile, workspace, and resource boundaries", async ({ page }) => {
  await clearSession(page);
  for (const route of ["/operations", "/tenant", "/contractor", "/admin"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/sign-in\?reason=authentication-required/);
  }

  await setSession(page, "tenant-demo");
  await page.goto("/tenant/resources/tenant-resource-202");
  await expect(page).toHaveURL(/\/access-denied\?reason=scope/);
  for (const route of ["/operations", "/contractor", "/admin"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/access-denied\?reason=workspace/);
  }

  await setSession(page, "contractor-demo");
  await page.goto("/contractor/assignments/work-order-502");
  await expect(page).toHaveURL(/\/access-denied\?reason=scope/);
  for (const route of ["/tenant", "/operations", "/admin"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/access-denied\?reason=workspace/);
  }

  await setSession(page, "operations-demo");
  await page.goto("/operations/records/ops-record-202");
  await expect(page).toHaveURL(/\/access-denied\?reason=scope/);
  for (const route of ["/tenant", "/contractor", "/admin"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/access-denied\?reason=workspace/);
  }
});

test("W05 integrated representative surfaces keep Arabic RTL and avoid page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await clearSession(page);
  await page.goto("/");
  await expectNoPageOverflow(page);

  await setSession(page, "tenant-demo");
  await page.goto("/tenant");
  await expectNoPageOverflow(page);

  await setSession(page, "admin-demo");
  await page.goto("/admin");
  await expectNoPageOverflow(page);

  await page.setViewportSize({ width: 820, height: 1000 });
  await setSession(page, "contractor-demo");
  await page.goto("/contractor");
  await expectNoPageOverflow(page);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await setSession(page, "operations-demo");
  await page.goto("/operations/records/ops-record-101/payments");
  await expectNoPageOverflow(page);
});
