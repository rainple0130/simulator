import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { seed } from "./seed-data";
import { applyMigrations } from "../src/server/db";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "simulator.db");
const SCHEMA_PATH = path.join(process.cwd(), "db", "schema.sql");

function main() {
  const force = process.argv.includes("--force");

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(fs.readFileSync(SCHEMA_PATH, "utf-8"));
  applyMigrations(db);

  const userCount = (db.prepare("SELECT count(*) as count FROM users").get() as { count: number })
    .count;

  if (userCount > 0 && !force) {
    console.log(`Database already has ${userCount} user(s). Use --force to wipe and reseed.`);
    db.close();
    return;
  }

  seed(db, force);
  db.close();
  console.log("Seed complete: teacher/teacher123, student1..3/student123");
}

main();
