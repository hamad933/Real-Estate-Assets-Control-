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

function verify(db) {
  const expected = {
    profiles: 7,
    properties: 6,
    units: 3,
    listings: 6,
    tenancies: 2,
    payment_records: 3,
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
  if (migrations !== 1) throw new Error(`Expected 1 migration, found ${migrations}`);

  const foreignKeyIssues = db.prepare("PRAGMA foreign_key_check").all();
  if (foreignKeyIssues.length > 0) throw new Error(`Foreign-key check failed: ${JSON.stringify(foreignKeyIssues)}`);

  const result = {
    databasePath,
    migrationCount: migrations,
    seedCounts: actual,
    inquiryCount: count(db, "inquiries"),
    foreignKeyCheck: "PASS"
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
