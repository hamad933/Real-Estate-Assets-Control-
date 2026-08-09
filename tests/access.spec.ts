import { expect, test, type Page } from "@playwright/test";

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

test("VISITOR cannot enter protected routes", async ({ page }) => {
  await page.goto("/tenant");
  await expect(page).toHaveURL(/\/sign-in\?reason=authentication-required/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/sign-in\?reason=authentication-required/);
});

test("admin demo credential signs in and wrong credential is rejected", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("اسم المستخدم").fill("admin");
  await page.getByLabel("كلمة المرور").fill("wrong");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page.getByRole("alert")).toContainText("بيانات الدخول غير صحيحة");

  await page.getByLabel("اسم المستخدم").fill("admin");
  await page.getByLabel("كلمة المرور").fill("admin");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "عمليات المحفظة" })).toBeVisible();
});

test("TENANT is restricted to tenant workspace and own resource", async ({ page }) => {
  await setSession(page, "tenant-demo");

  await page.goto("/tenant");
  await expect(page.getByRole("heading", { name: "خدمات المستأجر" })).toBeVisible();

  await page.goto("/tenant/resources/tenant-resource-101");
  await expect(page.getByText("ضمن نطاق المستأجر")).toBeVisible();

  await page.goto("/tenant/resources/tenant-resource-202");
  await expect(page).toHaveURL(/\/access-denied\?reason=scope/);

  for (const route of ["/contractor", "/operations", "/admin"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/access-denied\?reason=workspace/);
  }
});

test("CONTRACTOR sees assigned work only and cannot self-approve", async ({ page }) => {
  await setSession(page, "contractor-demo");

  await page.goto("/contractor");
  await expect(page.getByRole("heading", { name: "مهمة مكلّف بها" })).toBeVisible();
  await expect(page.getByTestId("approve-completion")).toBeDisabled();
  await expect(page.getByTestId("approve-cost")).toBeDisabled();

  await page.goto("/contractor/assignments/work-order-501");
  await expect(page.getByText("مهمة مسندة")).toBeVisible();

  await page.goto("/contractor/assignments/work-order-502");
  await expect(page).toHaveURL(/\/access-denied\?reason=scope/);

  for (const route of ["/tenant", "/operations", "/admin"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/access-denied\?reason=workspace/);
  }
});

test("OPERATIONS is scoped and cannot enter other workspaces", async ({ page }) => {
  await setSession(page, "operations-demo");

  await page.goto("/operations");
  await expect(page.getByRole("heading", { name: "الجاهزية التشغيلية" })).toBeVisible();

  await page.goto("/operations/records/ops-record-101");
  await expect(page.getByText("ضمن النطاق")).toBeVisible();

  await page.goto("/operations/records/ops-record-202");
  await expect(page).toHaveURL(/\/access-denied\?reason=scope/);

  for (const route of ["/tenant", "/contractor", "/admin"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/access-denied\?reason=workspace/);
  }
});

test("ADMIN can enter admin experience", async ({ page }) => {
  await setSession(page, "admin-demo");
  await page.goto("/admin");
  await expect(page.getByText("ADMIN فقط")).toBeVisible();
});

test("logout clears access", async ({ page }) => {
  await setSession(page, "tenant-demo");
  await page.goto("/tenant");
  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/tenant");
  await expect(page).toHaveURL(/\/sign-in\?reason=authentication-required/);
});

test("refresh preserves the intended simulated session", async ({ page }) => {
  await setSession(page, "tenant-demo");
  await page.goto("/tenant");
  await page.reload();
  await expect(page.getByRole("heading", { name: "خدمات المستأجر" })).toBeVisible();
  await expect(page.getByText("tenant-demo")).toBeVisible();
});
