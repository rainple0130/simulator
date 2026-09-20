import "server-only";
import crypto from "node:crypto";
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

export function recordAttemptEvents(attemptId: string, events: NewAttemptEvent[]): void {
  const insert = getDb().prepare(
    `INSERT INTO attempt_events (id, attempt_id, seq, t_offset_s, type, label, points)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const insertMany = getDb().transaction((rows: NewAttemptEvent[]) => {
    rows.forEach((row, index) => {
      insert.run(
        crypto.randomUUID(),
        attemptId,
        index,
        Math.max(0, Math.round(row.tOffsetS)),
        row.type,
        row.label,
        row.points
      );
    });
  });
  insertMany(events);
}

export function getAttemptEvents(attemptId: string): AttemptEventRow[] {
  return getDb()
    .prepare("SELECT * FROM attempt_events WHERE attempt_id = ? ORDER BY seq")
    .all(attemptId) as AttemptEventRow[];
}
