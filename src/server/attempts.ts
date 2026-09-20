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

export function createAttempt(userId: string, scenarioId: string, mode: Mode): string {
  const id = crypto.randomUUID();
  getDb()
    .prepare(
      "INSERT INTO attempts (id, user_id, scenario_id, status, mode) VALUES (?, ?, ?, 'in_progress', ?)"
    )
    .run(id, userId, scenarioId, mode);
  return id;
}

export function completeAttempt(
  attemptId: string,
  score: number,
  metrics: Record<string, unknown>
): void {
  getDb()
    .prepare(
      `UPDATE attempts
       SET status = 'completed', score = ?, metrics_json = ?, completed_at = datetime('now')
       WHERE id = ?`
    )
    .run(score, JSON.stringify(metrics), attemptId);
}

export function getAttempt(id: string): AttemptWithDetails | null {
  const row = getDb()
    .prepare(`${DETAILS_SELECT} WHERE attempts.id = ?`)
    .get(id) as AttemptWithDetails | undefined;
  return row ?? null;
}

export function listAttemptsForUser(userId: string): AttemptWithDetails[] {
  return getDb()
    .prepare(`${DETAILS_SELECT} WHERE attempts.user_id = ? ORDER BY attempts.started_at DESC`)
    .all(userId) as AttemptWithDetails[];
}

export function listAllAttempts(): AttemptWithDetails[] {
  return getDb()
    .prepare(`${DETAILS_SELECT} ORDER BY attempts.started_at DESC`)
    .all() as AttemptWithDetails[];
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
export function aggregateStats(): AggregateStats {
  const db = getDb();

  const totalStudents = (
    db.prepare("SELECT count(*) as c FROM users WHERE role = 'student'").get() as { c: number }
  ).c;

  const attempts = listAllAttempts();
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
