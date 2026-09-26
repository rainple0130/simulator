import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { seed } from "./seed-data";
import { applyMigrations } from "../src/server/db";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "simulator.db");
const SCHEMA_PATH = path.join(process.cwd(), "db", "schema.sql");

async function main() {
  const force = process.argv.includes("--force");

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = url
    ? createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
    : createClient({ url: `file:${DB_PATH}` });

  await db.executeMultiple(fs.readFileSync(SCHEMA_PATH, "utf-8"));
  await applyMigrations(db);

  const result = await db.execute("SELECT count(*) as count FROM users");
  const userCount = Number(result.rows[0].count);

  if (userCount > 0 && !force) {
    console.log(`Database already has ${userCount} user(s). Use --force to wipe and reseed.`);
    db.close();
    return;
  }

  await seed(db, force);
  db.close();
  console.log("Seed complete: teacher/teacher123, student1..3/student123");
}

main();
