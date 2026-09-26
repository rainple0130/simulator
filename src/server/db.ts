import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { seed } from "../../scripts/seed-data";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "simulator.db");
const SCHEMA_PATH = path.join(process.cwd(), "db", "schema.sql");

declare global {
  var __simulatorDb: Client | undefined;
  var __simulatorDbReady: Promise<void> | undefined;
}

function createDbClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  }

  // No hosted DB configured: fall back to a local SQLite file for local dev.
  // This will NOT work on Vercel (read-only/ephemeral filesystem) — set
  // TURSO_DATABASE_URL / TURSO_AUTH_TOKEN there.
  fs.mkdirSync(DATA_DIR, { recursive: true });
  return createClient({ url: `file:${DB_PATH}` });
}

async function bootstrap(db: Client): Promise<void> {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  await db.executeMultiple(schema);
  await applyMigrations(db);

  const result = await db.execute("SELECT count(*) as count FROM users");
  const count = Number(result.rows[0].count);
  if (count === 0) {
    await seed(db);
  }
}

/** SQLite has no `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, so guard columns added after initial release. */
export async function applyMigrations(db: Client): Promise<void> {
  const hasColumn = async (table: string, column: string): Promise<boolean> => {
    const result = await db.execute(`PRAGMA table_info(${table})`);
    return result.rows.some((c) => c.name === column);
  };

  if (!(await hasColumn("scenarios", "available_modes"))) {
    await db.execute(
      "ALTER TABLE scenarios ADD COLUMN available_modes TEXT NOT NULL DEFAULT 'guided,practice,exam'"
    );
  }
  if (!(await hasColumn("attempts", "mode"))) {
    await db.execute("ALTER TABLE attempts ADD COLUMN mode TEXT NOT NULL DEFAULT 'practice'");
  }
  if (!(await hasColumn("scenarios", "pass_score"))) {
    await db.execute("ALTER TABLE scenarios ADD COLUMN pass_score INTEGER NOT NULL DEFAULT 70");
  }
  if (!(await hasColumn("scenarios", "excellent_score"))) {
    await db.execute("ALTER TABLE scenarios ADD COLUMN excellent_score INTEGER NOT NULL DEFAULT 90");
  }
  if (!(await hasColumn("scenarios", "max_errors"))) {
    await db.execute("ALTER TABLE scenarios ADD COLUMN max_errors INTEGER");
  }
  if (!(await hasColumn("scenarios", "time_limit_s"))) {
    await db.execute("ALTER TABLE scenarios ADD COLUMN time_limit_s INTEGER");
  }
}

export async function getDb(): Promise<Client> {
  if (!global.__simulatorDb) {
    global.__simulatorDb = createDbClient();
  }
  if (!global.__simulatorDbReady) {
    // Don't cache a failed bootstrap (e.g. two cold starts racing to seed) — retry next request.
    global.__simulatorDbReady = bootstrap(global.__simulatorDb).catch((err) => {
      global.__simulatorDbReady = undefined;
      throw err;
    });
  }
  await global.__simulatorDbReady;
  return global.__simulatorDb;
}
