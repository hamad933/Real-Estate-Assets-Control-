import { expect, test, type Page } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";

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

test("VISITOR cannot enter W04 protected routes", async ({ page }) => {
  for (const route of ["/tenant", "/contractor", "/admin"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/sign-in\?reason=authentication-required/);
  }
});

test("admin demo credential remains the only visible demo credential", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("اسم المستخدم").fill("admin");
  await page.getByLabel("كلمة المرور").fill("wrong");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page.getByText("بيانات الدخول غير صحيحة.", { exact: true })).toBeVisible();

  await page.getByLabel("اسم المستخدم").fill("admin");
  await page.getByLabel("كلمة المرور").fill("admin");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "عمليات المحافظ" })).toBeVisible();
});

test("TENANT sees only own relationship and cross-scope access is denied", async ({ page }) => {
  await setSession(page, "tenant-demo");

  await page.goto("/tenant");
  await expect(page.getByRole("heading", { name: "خدمات المستأجر" })).toBeVisible();
  await expect(page.getByText("شقة النرجس 101", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("مستندات شخصية مرتبطة بالعلاقة")).toBeVisible();
  await page.getByTestId("tenant-create-service-request").first().click();
  await expect(page.getByText(/تم إنشاء تمثيل طلب جديد/).first()).toBeVisible();

  await page.goto("/tenant/resources/tenant-resource-101");
  await expect(page.getByText("ضمن نطاق المستأجر", { exact: true })).toBeVisible();

  await page.goto("/tenant/resources/tenant-resource-202");
  await expect(page).toHaveURL(/\/access-denied\?reason=scope/);

  for (const route of ["/contractor", "/operations", "/admin"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/access-denied\?reason=workspace/);
  }
});

test("CONTRACTOR sees assigned work, can update execution representation, and cannot self-approve", async ({ page }) => {
  await setSession(page, "contractor-demo");

  await page.goto("/contractor");
  await expect(page.getByRole("heading", { name: "تفاصيل المهمة الموكلة إليك" })).toBeVisible();
  await expect(page.getByText("الأعمال المسندة فقط")).toBeVisible();
  await expect(page.getByTestId("approve-completion")).toBeDisabled();
  await expect(page.getByTestId("approve-cost")).toBeDisabled();

  await page.getByLabel("حالة المهمة").selectOption({ label: "قيد التنفيذ" });
  await page.getByTestId("contractor-update-status").click();
  await expect(page.getByText(/تم تحديث الحالة داخل الجلسة إلى: قيد التنفيذ/)).toBeVisible();
  await page.getByTestId("contractor-upload-evidence").click();
  await expect(page.getByText(/تمثيل رفع الدليل جاهز/)).toBeVisible();

  await page.goto("/contractor/assignments/work-order-501");
  await expect(page.getByText("مهمة مسندة")).toBeVisible();

  await page.goto("/contractor/assignments/work-order-502");
  await expect(page).toHaveURL(/\/access-denied\?reason=scope/);

  for (const route of ["/tenant", "/operations", "/admin"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/access-denied\?reason=workspace/);
  }
});

test("existing OPERATIONS user remains scoped and is denied from S13", async ({ page }) => {
  await setSession(page, "operations-demo");

  await page.goto("/operations");
  await expect(page.getByRole("heading", { name: "الجاهزية التشغيلية" })).toBeVisible();

  await page.goto("/operations/records/ops-record-101");
  await expect(page.getByText("ضمن النطاق")).toBeVisible();

  await page.goto("/operations/records/ops-record-202");
  await expect(page).toHaveURL(/\/access-denied\?reason=scope/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/access-denied\?reason=workspace/);
});

test("S13 is ADMIN only and all USER profiles are denied", async ({ page }) => {
  for (const fixtureId of ["tenant-demo", "contractor-demo", "operations-demo"]) {
    await setSession(page, fixtureId);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/access-denied\?reason=workspace/);
  }

  await setSession(page, "admin-demo");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "عمليات المحافظ" })).toBeVisible();
  await expect(page.getByText("ADMIN فقط", { exact: true })).toBeVisible();
  await expect(page.getByText("سبب الأولوية الحالية")).toBeVisible();
});

test("S13 Admin search selection review and unsupported controls are deterministic", async ({ page }) => {
  await setSession(page, "admin-demo");
  await page.goto("/admin");

  const table = page.getByRole("table", { name: "سجلات المحفظة" });
  const search = page.getByRole("searchbox", { name: "ابحث باسم العقار أو الوحدة" });

  await expect(page.getByTestId("s13-columns-disabled")).toBeDisabled();
  await expect(page.getByTestId("s13-actions-disabled")).toBeDisabled();
  await expect(page.getByText(/تخصيص الأعمدة والإجراءات المجمعة غير متاحة/)).toBeVisible();

  await search.fill("العقيق");
  await expect(table.getByRole("button", { name: "اختيار دوبلكس العقيق" })).toBeVisible();
  await expect(table.getByRole("button", { name: "اختيار فيلا الياسمين" })).toHaveCount(0);

  await search.fill("سجل غير موجود");
  await expect(page.getByTestId("s13-no-match")).toBeVisible();
  await expect(page.getByTestId("s13-no-match")).toContainText("لا توجد سجلات مطابقة");

  await page.getByRole("button", { name: "مسح البحث" }).click();
  await search.fill("النرجس");
  const selectNarcissus = table.getByRole("button", { name: "اختيار شقة النرجس 101" });
  await selectNarcissus.click();
  await expect(selectNarcissus).toHaveAttribute("aria-pressed", "true");

  const context = page.getByTestId("s13-selected-context");
  await expect(context.getByRole("heading", { name: "شقة النرجس 101" })).toBeVisible();
  await expect(context).toContainText("دفعة شهرية متأخرة وثلاثة طلبات خدمة مفتوحة");

  await page.getByTestId("s13-review-open-conditions").click();
  const review = page.getByTestId("s13-review-mode");
  await expect(review).toBeVisible();
  await expect(review).toContainText("الحالات المفتوحة — 4");
  await expect(review).toContainText("دفعة أغسطس الشهرية متأخرة");
});

test("logout clears W04 access", async ({ page }) => {
  await setSession(page, "tenant-demo");
  await page.goto("/tenant");
  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/tenant");
  await expect(page).toHaveURL(/\/sign-in\?reason=authentication-required/);
});

test("refresh preserves synthetic sessions for touched role workspaces", async ({ page }) => {
  for (const [fixtureId, route, heading] of [
    ["tenant-demo", "/tenant", "خدمات المستأجر"],
    ["contractor-demo", "/contractor", "تفاصيل المهمة الموكلة إليك"],
    ["admin-demo", "/admin", "عمليات المحافظ"]
  ] as const) {
    await setSession(page, fixtureId);
    await page.goto(route);
    await page.reload();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});
