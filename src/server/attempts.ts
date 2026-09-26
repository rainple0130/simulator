import "server-only";
import crypto from "node:crypto";
import { getDb } from "./db";
import { MODES, type Mode } from "@/lib/modes";
import { parseAttemptMetrics } from "@/lib/attempt-metrics";
import { computeGrade, type Grade, type GradingCriteria } from "@/lib/grading";
import { average } from "@/lib/stats";

export type AttemptStatus = "in_progress" | "completed" | "abandoned";

export interface AttemptRow {
  id: string;
  user_id: string;
  scenario_id: string;
  status: AttemptStatus;
  mode: Mode;
  score: number | null;
  metrics_json: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface AttemptWithDetails extends AttemptRow {
  scenario_title: string;
  scenario_category: string;
  scenario_pass_score: number;
  scenario_excellent_score: number;
  scenario_max_errors: number | null;
  scenario_time_limit_s: number | null;
  student_username: string;
  student_display_name: string;
}

const DETAILS_SELECT = `
  SELECT
    attempts.*,
    scenarios.title as scenario_title,
    scenarios.category as scenario_category,
    scenarios.pass_score as scenario_pass_score,
    scenarios.excellent_score as scenario_excellent_score,
    scenarios.max_errors as scenario_max_errors,
    scenarios.time_limit_s as scenario_time_limit_s,
    users.username as student_username,
    users.display_name as student_display_name
  FROM attempts
  JOIN scenarios ON scenarios.id = attempts.scenario_id
  JOIN users ON users.id = attempts.user_id
`;

export async function createAttempt(userId: string, scenarioId: string, mode: Mode): Promise<string> {
  const id = crypto.randomUUID();
  const db = await getDb();
  await db.execute({
    sql: "INSERT INTO attempts (id, user_id, scenario_id, status, mode) VALUES (?, ?, ?, 'in_progress', ?)",
    args: [id, userId, scenarioId, mode],
  });
  return id;
}

export async function completeAttempt(
  attemptId: string,
  score: number,
  metrics: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: `UPDATE attempts
       SET status = 'completed', score = ?, metrics_json = ?, completed_at = datetime('now')
       WHERE id = ?`,
    args: [score, JSON.stringify(metrics), attemptId],
  });
}

export async function getAttempt(id: string): Promise<AttemptWithDetails | null> {
  const db = await getDb();
  const result = await db.execute({ sql: `${DETAILS_SELECT} WHERE attempts.id = ?`, args: [id] });
  return (result.rows[0] as unknown as AttemptWithDetails) ?? null;
}

export async function listAttemptsForUser(userId: string): Promise<AttemptWithDetails[]> {
  const db = await getDb();
  const result = await db.execute({
    sql: `${DETAILS_SELECT} WHERE attempts.user_id = ? ORDER BY attempts.started_at DESC`,
    args: [userId],
  });
  return result.rows as unknown as AttemptWithDetails[];
}

export async function listAllAttempts(): Promise<AttemptWithDetails[]> {
  const db = await getDb();
  const result = await db.execute(`${DETAILS_SELECT} ORDER BY attempts.started_at DESC`);
  return result.rows as unknown as AttemptWithDetails[];
}

export function criteriaForAttempt(attempt: AttemptWithDetails): GradingCriteria {
  return {
    passScore: attempt.scenario_pass_score,
    excellentScore: attempt.scenario_excellent_score,
    maxErrors: attempt.scenario_max_errors,
    timeLimitS: attempt.scenario_time_limit_s,
  };
}

/** null for attempts that aren't completed yet — there's nothing to grade. */
export function gradeForAttempt(attempt: AttemptWithDetails): Grade | null {
  if (attempt.status !== "completed" || attempt.score == null) return null;
  const metrics = parseAttemptMetrics(attempt.metrics_json);
  return computeGrade(
    { score: attempt.score, errors: metrics.errors ?? 0, timeSeconds: metrics.time_s ?? null },
    criteriaForAttempt(attempt)
  );
}

export interface AggregateStats {
  totalStudents: number;
  totalAttempts: number;
  completedAttempts: number;
  completionRate: number;
  byMode: {
    mode: Mode;
    attemptCount: number;
    averageScore: number | null;
  }[];
}

/** Cohort-wide counts and the mode breakdown only — anything scenario-specific (average
 * score, pass rate, trend, individual attempts) lives in getTeacherScenarioOverviews()
 * instead, scoped per scenario rather than blended across every procedure. */
export async function aggregateStats(): Promise<AggregateStats> {
  const db = await getDb();

  const totalStudentsResult = await db.execute("SELECT count(*) as c FROM users WHERE role = 'student'");
  const totalStudents = Number(totalStudentsResult.rows[0].c);

  const attempts = await listAllAttempts();
  const completed = attempts.filter((a) => a.status === "completed");

  const byMode = MODES.map((mode) => ({
    mode,
    attemptCount: attempts.filter((a) => a.mode === mode).length,
    averageScore: average(completed.filter((a) => a.mode === mode).map((a) => a.score ?? 0)),
  }));

  return {
    totalStudents,
    totalAttempts: attempts.length,
    completedAttempts: completed.length,
    completionRate: attempts.length === 0 ? 0 : completed.length / attempts.length,
    byMode,
  };
}
