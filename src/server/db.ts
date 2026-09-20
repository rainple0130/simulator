import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { seed } from "../../scripts/seed-data";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "simulator.db");
const SCHEMA_PATH = path.join(process.cwd(), "db", "schema.sql");

declare global {
  var __simulatorDb: Database.Database | undefined;
}

function bootstrap(): Database.Database {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
  applyMigrations(db);

  const userCount = db.prepare("SELECT count(*) as count FROM users").get() as {
    count: number;
  };
  if (userCount.count === 0) {
    seed(db);
  }

  return db;
}

/** SQLite has no `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, so guard columns added after initial release. */
export function applyMigrations(db: Database.Database): void {
  const hasColumn = (table: string, column: string): boolean =>
    (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).some(
      (c) => c.name === column
    );

  if (!hasColumn("scenarios", "available_modes")) {
    db.exec(
      "ALTER TABLE scenarios ADD COLUMN available_modes TEXT NOT NULL DEFAULT 'guided,practice,exam'"
    );
  }
  if (!hasColumn("attempts", "mode")) {
    db.exec("ALTER TABLE attempts ADD COLUMN mode TEXT NOT NULL DEFAULT 'practice'");
  }
  if (!hasColumn("scenarios", "pass_score")) {
    db.exec("ALTER TABLE scenarios ADD COLUMN pass_score INTEGER NOT NULL DEFAULT 70");
  }
  if (!hasColumn("scenarios", "excellent_score")) {
    db.exec("ALTER TABLE scenarios ADD COLUMN excellent_score INTEGER NOT NULL DEFAULT 90");
  }
  if (!hasColumn("scenarios", "max_errors")) {
    db.exec("ALTER TABLE scenarios ADD COLUMN max_errors INTEGER");
  }
  if (!hasColumn("scenarios", "time_limit_s")) {
    db.exec("ALTER TABLE scenarios ADD COLUMN time_limit_s INTEGER");
  }
}

export function getDb(): Database.Database {
  if (!global.__simulatorDb) {
    global.__simulatorDb = bootstrap();
  }
  return global.__simulatorDb;
}
