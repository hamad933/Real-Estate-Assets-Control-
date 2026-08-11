import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const root = process.cwd();
const databasePath = process.env.RP04_DB_PATH?.trim()
  ? path.resolve(process.env.RP04_DB_PATH.trim())
  : path.join(root, ".runtime", "rp04.sqlite");
const migrationsDirectory = path.join(root, "db", "migrations");
const seedFile = path.join(root, "db", "seed", "001_synthetic_seed.sql");

function removeDatabaseFiles() {
  for (const candidate of [databasePath, `${databasePath}-shm`, `${databasePath}-wal`]) {
    if (fs.existsSync(candidate)) fs.rmSync(candidate, { force: true });
  }
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const applied = db.prepare("SELECT 1 FROM schema_migrations WHERE version = ?");
  const record = db.prepare("INSERT INTO schema_migrations (version) VALUES (?)");
  const migrations = fs.readdirSync(migrationsDirectory).filter((name) => name.endsWith(".sql")).sort();

  for (const fileName of migrations) {
    if (applied.get(fileName)) continue;
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(fs.readFileSync(path.join(migrationsDirectory, fileName), "utf8"));
      record.run(fileName);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
}

function seed(db) {
  const row = db.prepare("SELECT COUNT(*) AS count FROM properties").get();
  if (Number(row.count) > 0) return;
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(fs.readFileSync(seedFile, "utf8"));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function open({ seedIfEmpty = true } = {}) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");
  migrate(db);
  if (seedIfEmpty) seed(db);
  return db;
}

function count(db, table) {
  return Number(db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count);
}

function scalarCount(db, sql) {
  return Number(db.prepare(sql).get().count);
}

function verify(db) {
  const expected = {
    profiles: 7,
    properties: 7,
    units: 7,
    listings: 6,
    tenancies: 2,
    payment_records: 5,
    maintenance_records: 4,
    contractor_assignments: 2,
    operations_records: 2
  };

  const actual = Object.fromEntries(Object.keys(expected).map((table) => [table, count(db, table)]));
  for (const [table, expectedCount] of Object.entries(expected)) {
    if (actual[table] !== expectedCount) {
      throw new Error(`Unexpected deterministic seed count for ${table}: ${actual[table]} != ${expectedCount}`);
    }
  }

  const migrations = count(db, "schema_migrations");
  if (migrations !== 3) throw new Error(`Expected 3 migrations, found ${migrations}`);

  const foreignKeyIssues = db.prepare("PRAGMA foreign_key_check").all();
  if (foreignKeyIssues.length > 0) throw new Error(`Foreign-key check failed: ${JSON.stringify(foreignKeyIssues)}`);

  const coherence = {
    listingUnitPropertyMismatch: scalarCount(db, `
      SELECT COUNT(*) AS count
      FROM listings l
      JOIN units u ON u.id = l.unit_id
      WHERE l.property_id <> u.property_id
         OR l.district <> u.location
         OR l.bedrooms <> u.bedrooms
         OR l.bathrooms <> u.bathrooms
         OR l.area <> u.area
    `),
    activeTenancyAvailableNow: scalarCount(db, `
      SELECT COUNT(*) AS count
      FROM listings l
      JOIN tenancies t ON t.unit_id = l.unit_id AND t.status = 'نشط'
      WHERE l.status = 'available'
    `),
    activeTenancyRentMismatch: scalarCount(db, `
      SELECT COUNT(*) AS count
      FROM listings l
      JOIN tenancies t ON t.unit_id = l.unit_id AND t.status = 'نشط'
      WHERE l.annual_price <> t.annual_rent
    `),
    monthlyPaymentMismatch: scalarCount(db, `
      SELECT COUNT(*) AS count
      FROM payment_records pr
      JOIN tenancies t ON t.id = pr.tenancy_id
      WHERE t.payment_plan = 'دفعات شهرية'
        AND t.annual_rent % 12 = 0
        AND pr.amount <> t.annual_rent / 12
    `),
    assignmentLifecycleMismatch: scalarCount(db, `
      SELECT COUNT(*) AS count
      FROM contractor_assignments a
      JOIN maintenance_records m ON m.id = a.maintenance_id
      WHERE a.request_id <> m.id OR a.status <> m.status
    `),
    operationsOwnershipMismatch: scalarCount(db, `
      SELECT COUNT(*) AS count
      FROM operations_records o
      JOIN units u ON u.id = o.unit_id
      WHERE o.property_id <> u.property_id
    `),
    portfolioConditionCountMismatch: scalarCount(db, `
      SELECT COUNT(*) AS count
      FROM properties
      WHERE portfolio_visible = 1
        AND open_conditions <> json_array_length(conditions_json)
    `)
  };

  const failedCoherence = Object.entries(coherence).filter(([, value]) => value !== 0);
  if (failedCoherence.length > 0) {
    throw new Error(`Cross-surface coherence check failed: ${JSON.stringify(Object.fromEntries(failedCoherence))}`);
  }

  const result = {
    databasePath,
    migrationCount: migrations,
    seedCounts: actual,
    inquiryCount: count(db, "inquiries"),
    foreignKeyCheck: "PASS",
    crossSurfaceCoherence: { ...coherence, status: "PASS" }
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

const command = process.argv[2] ?? "init";

if (command === "reset") removeDatabaseFiles();
const db = open({ seedIfEmpty: command !== "seed" });

try {
  if (command === "seed") seed(db);
  if (command === "verify") verify(db);
  if (!new Set(["init", "seed", "reset", "verify"]).has(command)) {
    throw new Error(`Unknown database command: ${command}`);
  }

  if (command !== "verify") {
    process.stdout.write(`${command}: PASS (${databasePath})\n`);
  }
} finally {
  db.close();
}
