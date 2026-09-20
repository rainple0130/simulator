import "server-only";
import {
  listAttemptsForUser,
  listAllAttempts,
  getAttempt,
  gradeForAttempt,
  criteriaForAttempt,
  type AttemptWithDetails,
} from "./attempts";
import { listScenarios } from "./scenarios";
import { getAttemptEvents, type AttemptEventRow } from "./events";
import { MODES, type Mode } from "@/lib/modes";
import { parseAttemptMetrics, type AttemptMetrics } from "@/lib/attempt-metrics";
import { evaluateMetrics, type Grade, type MetricCheck } from "@/lib/grading";
import { average } from "@/lib/stats";
import type { AttemptTableRow } from "@/components/report/attempts-table";

export interface TrendPoint {
  attemptId: string;
  date: string;
  score: number;
  mode: Mode;
  grade: Grade | null;
}

export interface ScenarioPerformance {
  scenarioId: string;
  title: string;
  category: string;
  attemptCount: number;
  averageScore: number | null;
  averageTimeSeconds: number | null;
  bestScore: number | null;
  lastCompletedAt: string | null;
  passRate: number | null;
  // Score trend within this scenario only — scores from different scenarios aren't
  // comparable, so trends are always scoped per scenario rather than blended together.
  trend: TrendPoint[];
  // Every attempt (any status) for this scenario only — never blended with other scenarios'.
  attempts: AttemptTableRow[];
}

export interface ReportOverview {
  totalAttempts: number;
  completedAttempts: number;
  byScenario: ScenarioPerformance[];
}

function toAttemptTableRow(a: AttemptWithDetails, options: { withStudent?: boolean } = {}): AttemptTableRow {
  return {
    id: a.id,
    mode: a.mode,
    status: a.status,
    score: a.score,
    grade: gradeForAttempt(a),
    timeSeconds: parseAttemptMetrics(a.metrics_json).time_s ?? null,
    startedAt: a.started_at,
    ...(options.withStudent
      ? { studentId: a.user_id, studentName: a.student_display_name }
      : {}),
  };
}

function trendFor(rows: AttemptWithDetails[]): TrendPoint[] {
  return rows
    .filter((a) => a.completed_at)
    .map((a) => ({
      attemptId: a.id,
      date: a.completed_at as string,
      score: a.score ?? 0,
      mode: a.mode,
      grade: gradeForAttempt(a),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function passRateFor(rows: AttemptWithDetails[]): number | null {
  const grades = rows.map(gradeForAttempt).filter((g): g is Grade => g != null);
  if (grades.length === 0) return null;
  return grades.filter((g) => g !== "fail").length / grades.length;
}

export function getReportOverview(userId: string): ReportOverview {
  const attempts = listAttemptsForUser(userId);
  const completed = attempts.filter((a) => a.status === "completed");

  // Group by scenario using every attempt (not just completed ones), so a scenario the
  // student has only just started (no completed attempt yet) still gets its own tab.
  const byScenarioMap = new Map<string, AttemptWithDetails[]>();
  for (const a of attempts) {
    if (!byScenarioMap.has(a.scenario_id)) byScenarioMap.set(a.scenario_id, []);
    byScenarioMap.get(a.scenario_id)!.push(a);
  }

  const byScenario: ScenarioPerformance[] = Array.from(byScenarioMap.entries()).map(
    ([scenarioId, rows]) => {
      const completedRows = rows.filter((r) => r.status === "completed");
      const rowScores = completedRows.map((r) => r.score ?? 0);
      const rowTimes = completedRows
        .map((r) => parseAttemptMetrics(r.metrics_json).time_s)
        .filter((t): t is number => typeof t === "number");
      return {
        scenarioId,
        title: rows[0].scenario_title,
        category: rows[0].scenario_category,
        attemptCount: rows.length,
        averageScore: average(rowScores),
        averageTimeSeconds: average(rowTimes),
        bestScore: rowScores.length > 0 ? Math.max(...rowScores) : null,
        lastCompletedAt: rows.reduce<string | null>(
          (latest, r) => (!latest || (r.completed_at ?? "") > latest ? r.completed_at : latest),
          null
        ),
        passRate: passRateFor(completedRows),
        trend: trendFor(completedRows),
        attempts: rows.map((a) => toAttemptTableRow(a)),
      };
    }
  );
  byScenario.sort((a, b) => a.title.localeCompare(b.title));

  return {
    totalAttempts: attempts.length,
    completedAttempts: completed.length,
    byScenario,
  };
}

export interface UnitReport {
  scenarioId: string;
  title: string;
  category: string;
  attempts: AttemptTableRow[];
  averageScore: number | null;
  averageTimeSeconds: number | null;
  bestScore: number | null;
  passRate: number | null;
  byMode: { mode: Mode; attemptCount: number; averageScore: number | null }[];
  trend: TrendPoint[];
}

export function getUnitReport(userId: string, scenarioId: string): UnitReport | null {
  const attempts = listAttemptsForUser(userId).filter((a) => a.scenario_id === scenarioId);
  if (attempts.length === 0) return null;

  const completed = attempts.filter((a) => a.status === "completed");
  const scores = completed.map((a) => a.score ?? 0);
  const times = completed
    .map((a) => parseAttemptMetrics(a.metrics_json).time_s)
    .filter((t): t is number => typeof t === "number");

  const byMode = MODES.map((mode) => {
    const rows = completed.filter((a) => a.mode === mode);
    return {
      mode,
      attemptCount: rows.length,
      averageScore: average(rows.map((r) => r.score ?? 0)),
    };
  });

  return {
    scenarioId,
    title: attempts[0].scenario_title,
    category: attempts[0].scenario_category,
    attempts: attempts.map((a) => toAttemptTableRow(a)),
    averageScore: average(scores),
    averageTimeSeconds: average(times),
    bestScore: scores.length > 0 ? Math.max(...scores) : null,
    passRate: passRateFor(completed),
    byMode,
    trend: trendFor(completed),
  };
}

export interface TeacherScenarioStudentEntry {
  studentId: string;
  studentName: string;
  attemptCount: number;
  averageScore: number | null;
  bestScore: number | null;
  averageTimeSeconds: number | null;
  passRate: number | null;
  // Meaningful here — this is one student's own trajectory in this scenario, unlike the
  // cohort-wide view where a trend line blending different students' timelines is not.
  trend: TrendPoint[];
  attempts: AttemptTableRow[];
}

export interface TeacherScenarioOverview {
  scenarioId: string;
  title: string;
  category: string;
  allStudents: {
    attemptCount: number;
    averageScore: number | null;
    passRate: number | null;
    attempts: AttemptTableRow[];
  };
  students: TeacherScenarioStudentEntry[];
}

/** Scenario-first, student-second breakdown for the teacher dashboard: pick a scenario, then
 * optionally narrow to one student (the "by student" list becomes a filter here, not its own
 * separate table — and only a single-student trend is ever charted). */
export function getTeacherScenarioOverviews(): TeacherScenarioOverview[] {
  const scenarios = listScenarios();
  const attempts = listAllAttempts();

  const overviews = scenarios.map((sc) => {
    const rows = attempts.filter((a) => a.scenario_id === sc.id);
    const completedRows = rows.filter((a) => a.status === "completed");

    const studentIds = Array.from(new Set(rows.map((a) => a.user_id)));
    const students: TeacherScenarioStudentEntry[] = studentIds
      .map((studentId) => {
        const studentRows = rows.filter((a) => a.user_id === studentId);
        const studentCompleted = studentRows.filter((a) => a.status === "completed");
        const scores = studentCompleted.map((a) => a.score ?? 0);
        const times = studentCompleted
          .map((a) => parseAttemptMetrics(a.metrics_json).time_s)
          .filter((t): t is number => typeof t === "number");
        return {
          studentId,
          studentName: studentRows[0].student_display_name,
          attemptCount: studentRows.length,
          averageScore: average(scores),
          bestScore: scores.length > 0 ? Math.max(...scores) : null,
          averageTimeSeconds: average(times),
          passRate: passRateFor(studentCompleted),
          trend: trendFor(studentCompleted),
          attempts: studentRows.map((a) => toAttemptTableRow(a, { withStudent: true })),
        };
      })
      .sort((a, b) => a.studentName.localeCompare(b.studentName));

    return {
      scenarioId: sc.id,
      title: sc.title,
      category: sc.category,
      allStudents: {
        attemptCount: rows.length,
        averageScore: average(completedRows.map((a) => a.score ?? 0)),
        passRate: passRateFor(completedRows),
        attempts: rows.map((a) => toAttemptTableRow(a, { withStudent: true })),
      },
      students,
    };
  });

  overviews.sort((a, b) => a.title.localeCompare(b.title));
  return overviews;
}

export interface AttemptReport {
  attempt: AttemptWithDetails;
  events: AttemptEventRow[];
  steps: AttemptEventRow[];
  errors: AttemptEventRow[];
  hints: AttemptEventRow[];
  pointsEarned: number;
  pointsDeducted: number;
  metrics: AttemptMetrics;
  grade: Grade | null;
  metricChecks: MetricCheck[];
}

export function getAttemptReport(attemptId: string): AttemptReport | null {
  const attempt = getAttempt(attemptId);
  if (!attempt) return null;

  const events = getAttemptEvents(attemptId);
  const steps = events.filter((e) => e.type === "step");
  const errors = events.filter((e) => e.type === "error");
  const hints = events.filter((e) => e.type === "hint");
  const metrics = parseAttemptMetrics(attempt.metrics_json);

  const metricChecks =
    attempt.status === "completed" && attempt.score != null
      ? evaluateMetrics(
          { score: attempt.score, errors: metrics.errors ?? 0, timeSeconds: metrics.time_s ?? null },
          criteriaForAttempt(attempt)
        )
      : [];

  return {
    attempt,
    events,
    steps,
    errors,
    hints,
    pointsEarned: steps.reduce((sum, e) => sum + Math.max(0, e.points), 0),
    pointsDeducted: errors.reduce((sum, e) => sum + Math.max(0, -e.points), 0),
    metrics,
    grade: gradeForAttempt(attempt),
    metricChecks,
  };
}
