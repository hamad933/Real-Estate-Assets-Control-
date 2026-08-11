import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const migrationsDirectory = path.join(process.cwd(), "db", "migrations");
const seedFile = path.join(process.cwd(), "db", "seed", "001_synthetic_seed.sql");

export function resolveDatabasePath(): string {
  const configured = process.env.RP04_DB_PATH?.trim();
  return configured ? path.resolve(configured) : path.join(process.cwd(), ".runtime", "rp04.sqlite");
}

function ensureParentDirectory(databasePath: string) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
}

export function migrateDatabase(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrations = fs
    .readdirSync(migrationsDirectory)
    .filter((name) => name.endsWith(".sql"))
    .sort();
  const applied = db.prepare("SELECT 1 FROM schema_migrations WHERE version = ?");
  const record = db.prepare("INSERT INTO schema_migrations (version) VALUES (?)");

  for (const fileName of migrations) {
    if (applied.get(fileName)) continue;

    const sql = fs.readFileSync(path.join(migrationsDirectory, fileName), "utf8");
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(sql);
      record.run(fileName);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
}

export function seedDatabase(db: DatabaseSync): void {
  const row = db.prepare("SELECT COUNT(*) AS count FROM properties").get() as { count: number };
  if (Number(row.count) > 0) return;

  const seedSql = fs.readFileSync(seedFile, "utf8");
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(seedSql);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function openDatabase(options: { seedIfEmpty?: boolean } = {}): DatabaseSync {
  const databasePath = resolveDatabasePath();
  ensureParentDirectory(databasePath);

  const db = new DatabaseSync(databasePath);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");
  migrateDatabase(db);
  if (options.seedIfEmpty !== false) seedDatabase(db);
  return db;
}

export function withDatabase<T>(work: (db: DatabaseSync) => T): T {
  const db = openDatabase();
  try {
    return work(db);
  } finally {
    db.close();
  }
}
