import { execFileSync } from "node:child_process";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { expect, test, type Page } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";
const databasePath = process.env.RP04_DB_PATH?.trim()
  ? path.resolve(process.env.RP04_DB_PATH.trim())
  : path.resolve(".runtime/rp04.sqlite");

function resetDatabase() {
  execFileSync("npm", ["run", "db:reset"], {
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

function writeDatabase(work: (db: DatabaseSync) => void) {
  const db = new DatabaseSync(databasePath);
  db.exec("PRAGMA foreign_keys = ON;");
  try {
    work(db);
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

test.describe.serial("RP04-IMP-W06 cross-surface domain coherence", () => {
  test.beforeEach(() => resetDatabase());
  test.afterAll(() => resetDatabase());

  test("S01-S06 public property truth is served from SQLite rather than a competing static copy", async ({ page }) => {
    writeDatabase((db) => {
      db.prepare("UPDATE units SET name = ? WHERE id = ?").run("شقة الياسمين 12 — مصدر SQLite", "unit-104");
      db.prepare("UPDATE listings SET annual_price = ? WHERE id = ?").run(67000, "yasmin-12");
    });

    await page.goto("/search?district=all&type=all&budget=all&rooms=all&availability=all");
    await expect(page.getByText("شقة الياسمين 12 — مصدر SQLite", { exact: true }).first()).toBeVisible();
    const card = page.getByTestId("property-yasmin-12");
    await expect(card).toContainText("67,000");

    await page.goto("/assets/yasmin-12");
    await expect(page.getByRole("heading", { name: "شقة الياسمين 12 — مصدر SQLite", level: 1 })).toBeVisible();
    await expect(page.locator("main")).toContainText("67,000");
  });

  test("Property Unit Listing Tenancy and Payment relationships are relationally coherent", () => {
    const state = readDatabase((db) => {
      const listingMismatches = Number((db.prepare(`
        SELECT COUNT(*) AS count
        FROM listings l
        JOIN units u ON u.id = l.unit_id
        WHERE l.property_id <> u.property_id
           OR l.district <> u.location
           OR l.bedrooms <> u.bedrooms
           OR l.bathrooms <> u.bathrooms
           OR l.area <> u.area
      `).get() as { count: number }).count);

      const occupiedAvailableNow = Number((db.prepare(`
        SELECT COUNT(*) AS count
        FROM listings l
        JOIN tenancies t ON t.unit_id = l.unit_id AND t.status = 'نشط'
        WHERE l.status = 'available'
      `).get() as { count: number }).count);

      const narcissus = db.prepare(`
        SELECT l.property_id, l.unit_id, l.district, l.status, l.annual_price,
               u.property_id AS unit_property_id, u.location AS unit_location,
               t.annual_rent, t.payment_plan
        FROM listings l
        JOIN units u ON u.id = l.unit_id
        JOIN tenancies t ON t.unit_id = u.id AND t.status = 'نشط'
        WHERE l.id = 'narjis-101'
      `).get() as {
        property_id: string;
        unit_id: string;
        district: string;
        status: string;
        annual_price: number;
        unit_property_id: string;
        unit_location: string;
        annual_rent: number;
        payment_plan: string;
      };

      const paymentAmounts = (db.prepare(`
        SELECT amount
        FROM payment_records
        WHERE tenancy_id = 'tenancy-101'
        ORDER BY rowid
      `).all() as Array<{ amount: number }>).map((row) => Number(row.amount));

      return { listingMismatches, occupiedAvailableNow, narcissus, paymentAmounts };
    });

    expect(state.listingMismatches).toBe(0);
    expect(state.occupiedAvailableNow).toBe(0);
    expect(state.narcissus).toMatchObject({
      property_id: "property-102",
      unit_id: "unit-tenant-101",
      district: "الرياض — حي النرجس",
      status: "soon",
      annual_price: 72000,
      unit_property_id: "property-102",
      unit_location: "الرياض — حي النرجس",
      annual_rent: 72000,
      payment_plan: "دفعات شهرية"
    });
    expect(state.paymentAmounts).toEqual([6000, 6000, 6000, 6000]);
  });

  test("S10 S11 and S12 share one maintenance request identity and lifecycle", async ({ page }) => {
    const baseline = readDatabase((db) => db.prepare(`
      SELECT a.request_id, a.status AS assignment_status,
             m.id AS maintenance_id, m.status AS maintenance_status,
             m.unit_id, m.tenancy_id
      FROM contractor_assignments a
      JOIN maintenance_records m ON m.id = a.maintenance_id
      WHERE a.id = 'work-order-501'
    `).get() as {
      request_id: string;
      assignment_status: string;
      maintenance_id: string;
      maintenance_status: string;
      unit_id: string;
      tenancy_id: string;
    });

    expect(baseline).toEqual({
      request_id: "SRV-2026-0891",
      assignment_status: "بانتظار الوصول",
      maintenance_id: "SRV-2026-0891",
      maintenance_status: "بانتظار الوصول",
      unit_id: "unit-tenant-101",
      tenancy_id: "tenancy-101"
    });

    await setSession(page, "tenant-demo");
    await page.goto("/tenant");
    await expect(page.getByText("SRV-2026-0891", { exact: true })).toBeVisible();
    await expect(page.getByText("بانتظار الوصول", { exact: true }).first()).toBeVisible();

    await setSession(page, "operations-demo");
    await page.goto("/operations/records/ops-record-101/maintenance");
    await expect(page.getByText("SRV-2026-0891", { exact: true })).toBeVisible();
    await expect(page.getByText("بانتظار الوصول", { exact: true }).first()).toBeVisible();

    await setSession(page, "contractor-demo");
    await page.goto("/contractor");
    await expect(page.getByText("SRV-2026-0891", { exact: true })).toBeVisible();
    await expect(page.getByLabel("حالة المهمة")).toHaveValue("بانتظار الوصول");
    await page.getByLabel("حالة المهمة").selectOption({ label: "قيد التنفيذ" });
    await page.getByTestId("contractor-update-status").click();
    await expect(page.getByText(/تم تحديث الحالة داخل الجلسة إلى: قيد التنفيذ/)).toBeVisible();

    await setSession(page, "tenant-demo");
    await page.goto("/tenant");
    await expect(page.getByText("SRV-2026-0891", { exact: true })).toBeVisible();
    await expect(page.getByText("قيد التنفيذ", { exact: true }).first()).toBeVisible();

    await setSession(page, "operations-demo");
    await page.goto("/operations/records/ops-record-101/maintenance");
    await expect(page.getByText("SRV-2026-0891", { exact: true })).toBeVisible();
    await expect(page.getByText("قيد التنفيذ", { exact: true }).first()).toBeVisible();
  });

  test("S13 summary totals are derived from persisted visible portfolio rows", async ({ page }) => {
    const totals = readDatabase((db) => {
      const row = db.prepare(`
        SELECT
          SUM(open_conditions) AS open_conditions,
          COUNT(*) AS active_records,
          SUM((
            SELECT COUNT(*)
            FROM json_each(properties.conditions_json)
            WHERE json_extract(json_each.value, '$.severity') <> 'منخفض'
          )) AS follow_up
        FROM properties
        WHERE portfolio_visible = 1
      `).get() as { open_conditions: number; active_records: number; follow_up: number };
      return {
        openConditions: Number(row.open_conditions),
        activeRecords: Number(row.active_records),
        followUp: Number(row.follow_up)
      };
    });

    expect(totals).toEqual({ openConditions: 12, activeRecords: 4, followUp: 8 });

    await setSession(page, "admin-demo");
    await page.goto("/admin");
    const summary = page.getByLabel("ملخص العمليات");
    await expect(summary.getByText("12", { exact: true })).toBeVisible();
    await expect(summary.getByText("4", { exact: true })).toBeVisible();
    await expect(summary.getByText("8", { exact: true })).toBeVisible();
  });

  test("Public Tenant and Operations expose the same occupied unit identity and location", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/assets/narjis-101");
    await expect(page.getByRole("heading", { name: "شقة النرجس 101", level: 1 })).toBeVisible();
    await expect(page.getByText("الرياض — حي النرجس", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("متاح قريبًا", { exact: true }).first()).toBeVisible();
    await expect(page.locator("main")).toContainText("72,000");

    await setSession(page, "tenant-demo");
    await page.goto("/tenant");
    await expect(page.getByText("شقة النرجس 101", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("الرياض — حي النرجس", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("72,000 ريال", { exact: true })).toBeVisible();
    await expect(page.getByText("دفعات شهرية", { exact: true })).toBeVisible();

    await setSession(page, "operations-demo");
    await page.goto("/operations/records/ops-record-101");
    await expect(page.getByText("شقة النرجس 101", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("الرياض — حي النرجس", { exact: true })).toBeVisible();
  });
});
