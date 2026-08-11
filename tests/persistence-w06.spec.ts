import { execFileSync } from "node:child_process";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { expect, test, type Page } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";
const databasePath = process.env.RP04_DB_PATH?.trim()
  ? path.resolve(process.env.RP04_DB_PATH.trim())
  : path.resolve(".runtime/rp04.sqlite");

function runDb(script: "db:init" | "db:seed" | "db:reset" | "db:verify") {
  return execFileSync("npm", ["run", script], {
    cwd: process.cwd(),
    env: { ...process.env, RP04_DB_PATH: databasePath },
    encoding: "utf8"
  });
}

function readDatabase<T>(work: (db: DatabaseSync) => T): T {
  const db = new DatabaseSync(databasePath, { readOnly: true });
  db.exec("PRAGMA foreign_keys = ON;");
  try {
    return work(db);
  } finally {
    db.close();
  }
}

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

test.describe.serial("RP04-IMP-W06 local persistence foundation", () => {
  test.beforeAll(() => {
    runDb("db:reset");
  });

  test.afterAll(() => {
    runDb("db:reset");
  });

  test("clean init, migration, deterministic seed, idempotent seed, and reset are proven", () => {
    runDb("db:reset");
    const verification = runDb("db:verify");
    expect(verification).toContain('"migrationCount": 3');
    expect(verification).toContain('"foreignKeyCheck": "PASS"');
    expect(verification).toContain('"status": "PASS"');

    const baseline = readDatabase((db) => ({
      migrations: Number((db.prepare("SELECT COUNT(*) AS count FROM schema_migrations").get() as { count: number }).count),
      properties: Number((db.prepare("SELECT COUNT(*) AS count FROM properties").get() as { count: number }).count),
      units: Number((db.prepare("SELECT COUNT(*) AS count FROM units").get() as { count: number }).count),
      listings: Number((db.prepare("SELECT COUNT(*) AS count FROM listings").get() as { count: number }).count),
      payments: Number((db.prepare("SELECT COUNT(*) AS count FROM payment_records").get() as { count: number }).count),
      inquiries: Number((db.prepare("SELECT COUNT(*) AS count FROM inquiries").get() as { count: number }).count),
      assignmentStatus: String((db.prepare("SELECT status FROM contractor_assignments WHERE id = 'work-order-501'").get() as { status: string }).status),
      maintenanceStatus: String((db.prepare("SELECT status FROM maintenance_records WHERE id = 'SRV-2026-0891'").get() as { status: string }).status)
    }));

    expect(baseline).toEqual({
      migrations: 3,
      properties: 7,
      units: 7,
      listings: 6,
      payments: 5,
      inquiries: 0,
      assignmentStatus: "بانتظار الوصول",
      maintenanceStatus: "بانتظار الوصول"
    });

    runDb("db:seed");
    expect(readDatabase((db) => Number((db.prepare("SELECT COUNT(*) AS count FROM properties").get() as { count: number }).count))).toBe(7);

    const writable = new DatabaseSync(databasePath);
    writable.exec("PRAGMA foreign_keys = ON;");
    try {
      writable.prepare("UPDATE contractor_assignments SET status = ? WHERE id = ?").run("قيد التنفيذ", "work-order-501");
      writable.prepare(`
        INSERT INTO inquiries (
          listing_id, purpose, proposed_date, period, contact_method,
          synthetic_name, synthetic_phone, synthetic_email, notes_summary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run("narjis-101", "visit", "2026-08-20", "evening", "phone", "زائر تجريبي", "0500000000", null, "سجل اختبار تركيبي");
    } finally {
      writable.close();
    }

    runDb("db:reset");
    const resetState = readDatabase((db) => ({
      inquiries: Number((db.prepare("SELECT COUNT(*) AS count FROM inquiries").get() as { count: number }).count),
      assignmentStatus: String((db.prepare("SELECT status FROM contractor_assignments WHERE id = 'work-order-501'").get() as { status: string }).status),
      maintenanceStatus: String((db.prepare("SELECT status FROM maintenance_records WHERE id = 'SRV-2026-0891'").get() as { status: string }).status)
    }));
    expect(resetState).toEqual({
      inquiries: 0,
      assignmentStatus: "بانتظار الوصول",
      maintenanceStatus: "بانتظار الوصول"
    });
  });

  test("key Tenant, Contractor, Operations, and Admin records are served from SQLite under existing scope", async ({ page }) => {
    await setSession(page, "tenant-demo");
    await page.goto("/tenant/resources/tenant-resource-101");
    await expect(page.getByText("شقة النرجس 101", { exact: true })).toBeVisible();
    await expect(page.getByText(/tenancy-101/)).toBeVisible();
    await page.goto("/tenant/resources/tenant-resource-202");
    await expect(page).toHaveURL(/\/access-denied\?reason=scope/);

    await setSession(page, "contractor-demo");
    await page.goto("/contractor/assignments/work-order-501");
    await expect(page.getByText("صيانة تكييف", { exact: true })).toBeVisible();
    await expect(page.getByText("SRV-2026-0891", { exact: true })).toBeVisible();
    await page.goto("/contractor/assignments/work-order-502");
    await expect(page).toHaveURL(/\/access-denied\?reason=scope/);

    await setSession(page, "operations-demo");
    await page.goto("/operations/records/ops-record-101");
    await expect(page.getByText("شقة النرجس 101", { exact: true }).first()).toBeVisible();
    await page.goto("/operations/records/ops-record-202");
    await expect(page).toHaveURL(/\/access-denied\?reason=scope/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/access-denied\?reason=workspace/);

    await setSession(page, "admin-demo");
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "عمليات المحافظ" })).toBeVisible();
    await expect(page.getByRole("button", { name: "اختيار شقة النرجس 101" })).toBeVisible();

    await page.context().clearCookies();
    await page.goto("/tenant");
    await expect(page).toHaveURL(/\/sign-in\?reason=authentication-required/);
  });

  test("S07 inquiry persists through a new request and does not store entered contact fields", async ({ page }) => {
    runDb("db:reset");
    await page.goto("/inquiry?property=narjis-101");
    await page.getByLabel("تاريخ مقترح").fill("2026-08-20");
    await page.getByLabel("الاسم").fill("مستخدم تجريبي خاص");
    await page.getByLabel("رقم الجوال").fill("0500000000");
    await page.getByLabel("البريد الإلكتروني (اختياري)").fill("entered-value@example.test");
    await page.getByLabel("ملاحظات (اختياري)").fill("هذه الملاحظة لا ينبغي تخزينها.");
    await page.getByRole("button", { name: "إرسال الطلب التجريبي" }).click();

    await expect(page.getByRole("heading", { name: "شكرًا، تم إنشاء تأكيد تجريبي" })).toBeVisible();
    const displayId = await page.getByTestId("persisted-inquiry-id").textContent();
    expect(displayId).toMatch(/^INQ-LOCAL-\d{4}$/);

    const persisted = readDatabase((db) => db.prepare(`
      SELECT synthetic_name, synthetic_phone, synthetic_email, notes_summary
      FROM inquiries
      ORDER BY id DESC
      LIMIT 1
    `).get() as { synthetic_name: string; synthetic_phone: string; synthetic_email: string | null; notes_summary: string });

    expect(persisted.synthetic_name).toBe("زائر تجريبي");
    expect(persisted.synthetic_phone).toBe("0500000000");
    expect(persisted.synthetic_email).toBeNull();
    expect(persisted.notes_summary).not.toContain("هذه الملاحظة لا ينبغي تخزينها");
    expect(persisted.notes_summary).not.toContain("entered-value@example.test");

    await page.reload();
    await expect(page.getByRole("heading", { name: "شكرًا، تم إنشاء تأكيد تجريبي" })).toBeVisible();
    await expect(page.getByTestId("persisted-inquiry-id")).toHaveText(displayId ?? "");
  });

  test("authorized contractor status write persists and unrelated assignment remains inaccessible", async ({ page }) => {
    runDb("db:reset");
    await setSession(page, "contractor-demo");
    await page.goto("/contractor");
    await page.getByLabel("حالة المهمة").selectOption({ label: "قيد التنفيذ" });
    await page.getByTestId("contractor-update-status").click();
    await expect(page.getByText(/تم تحديث الحالة داخل الجلسة إلى: قيد التنفيذ/)).toBeVisible();

    const lifecycle = readDatabase((db) => ({
      assignment: String((db.prepare("SELECT status FROM contractor_assignments WHERE id = 'work-order-501'").get() as { status: string }).status),
      maintenance: String((db.prepare("SELECT status FROM maintenance_records WHERE id = 'SRV-2026-0891'").get() as { status: string }).status)
    }));
    expect(lifecycle).toEqual({ assignment: "قيد التنفيذ", maintenance: "قيد التنفيذ" });

    await page.reload();
    await expect(page.getByLabel("حالة المهمة")).toHaveValue("قيد التنفيذ");

    await page.goto("/contractor/assignments/work-order-502");
    await expect(page).toHaveURL(/\/access-denied\?reason=scope/);
  });
});
