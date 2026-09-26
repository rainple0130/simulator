import "server-only";
import crypto from "node:crypto";
import type { InStatement } from "@libsql/client";
import { getDb } from "./db";

export type { AttemptEventType, NewAttemptEvent, SynthesizeInput } from "@/lib/event-synthesis";
export { synthesizeEvents } from "@/lib/event-synthesis";
import type { AttemptEventType, NewAttemptEvent } from "@/lib/event-synthesis";

export interface AttemptEventRow {
  id: string;
  attempt_id: string;
  seq: number;
  t_offset_s: number;
  type: AttemptEventType;
  label: string;
  points: number;
}

export async function recordAttemptEvents(attemptId: string, events: NewAttemptEvent[]): Promise<void> {
  if (events.length === 0) return;

  const statements: InStatement[] = events.map((row, index) => ({
    sql: `INSERT INTO attempt_events (id, attempt_id, seq, t_offset_s, type, label, points)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      attemptId,
      index,
      Math.max(0, Math.round(row.tOffsetS)),
      row.type,
      row.label,
      row.points,
    ],
  }));

  const db = await getDb();
  await db.batch(statements, "write");
}

export async function getAttemptEvents(attemptId: string): Promise<AttemptEventRow[]> {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT * FROM attempt_events WHERE attempt_id = ? ORDER BY seq",
    args: [attemptId],
  });
  return result.rows as unknown as AttemptEventRow[];
}
