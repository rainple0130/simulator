"use client";

import { useState } from "react";
import { HexBullet } from "@/components/hex";
import { LineChart, type LinePoint } from "@/components/charts/line-chart";
import { AttemptsTable, type AttemptTableRow } from "@/components/report/attempts-table";
import { formatSeconds } from "@/lib/format";

export interface TeacherScenarioStudentOption {
  studentId: string;
  studentName: string;
  attemptCount: number;
  averageScore: number | null;
  bestScore: number | null;
  averageTimeSeconds: number | null;
  passRate: number | null;
  trend: LinePoint[];
  attempts: AttemptTableRow[];
}

export interface TeacherScenarioEntry {
  scenarioId: string;
  title: string;
  category: string;
  allStudents: {
    attemptCount: number;
    averageScore: number | null;
    passRate: number | null;
    attempts: AttemptTableRow[];
  };
  students: TeacherScenarioStudentOption[];
}

const ALL_STUDENTS = "__all__";

/**
 * Scenario tabs first, then a student filter within the selected scenario — "by student"
 * is a filter on this view rather than its own separate table. A trend line only makes
 * sense once narrowed to one student; blending every student's timeline together for
 * "all students" would be meaningless, so that case shows aggregate stats and the
 * (student-labeled) attempts list only, no chart.
 */
export function TeacherScenarioSwitcher({ scenarios }: { scenarios: TeacherScenarioEntry[] }) {
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.scenarioId);
  const [studentId, setStudentId] = useState(ALL_STUDENTS);

  const scenario = scenarios.find((s) => s.scenarioId === scenarioId) ?? scenarios[0];
  if (!scenario) return <p className="text-sm text-muted">No scenarios yet.</p>;

  const student = scenario.students.find((s) => s.studentId === studentId) ?? null;

  function selectScenario(id: string) {
    setScenarioId(id);
    setStudentId(ALL_STUDENTS);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 overflow-x-auto border-b border-line">
        {scenarios.map((s) => (
          <button
            key={s.scenarioId}
            type="button"
            onClick={() => selectScenario(s.scenarioId)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              s.scenarioId === scenario.scenarioId
                ? "border-accent text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="mt-4 border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted">
              <HexBullet />
              {scenario.category}
            </div>
            <h3 className="mt-1 font-medium text-ink">{scenario.title}</h3>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Student</span>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="rounded-sm border border-line bg-bg px-2 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value={ALL_STUDENTS}>All students</option>
              {scenario.students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentName}
                </option>
              ))}
            </select>
          </label>
        </div>

        {student ? (
          <>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm text-muted">{student.studentName}</span>
              <span className="shrink-0 font-display text-2xl font-semibold text-ink">
                {student.averageScore != null ? student.averageScore.toFixed(1) : "—"}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-muted sm:grid-cols-4">
              <div>
                <dt>Attempts</dt>
                <dd className="text-ink">{student.attemptCount}</dd>
              </div>
              <div>
                <dt>Pass rate</dt>
                <dd className="text-ink">
                  {student.passRate != null ? `${Math.round(student.passRate * 100)}%` : "—"}
                </dd>
              </div>
              <div>
                <dt>Best score</dt>
                <dd className="text-ink">{student.bestScore ?? "—"}</dd>
              </div>
              <div>
                <dt>Avg. time</dt>
                <dd className="text-ink">
                  {student.averageTimeSeconds != null ? formatSeconds(student.averageTimeSeconds) : "—"}
                </dd>
              </div>
            </dl>
            {student.trend.length > 1 && (
              <div className="mt-4 border-t border-line pt-4">
                <LineChart data={student.trend} />
              </div>
            )}
          </>
        ) : (
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-muted sm:grid-cols-3">
            <div>
              <dt>Attempts</dt>
              <dd className="text-ink">{scenario.allStudents.attemptCount}</dd>
            </div>
            <div>
              <dt>Average score</dt>
              <dd className="text-ink">
                {scenario.allStudents.averageScore != null
                  ? scenario.allStudents.averageScore.toFixed(1)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Pass rate</dt>
              <dd className="text-ink">
                {scenario.allStudents.passRate != null
                  ? `${Math.round(scenario.allStudents.passRate * 100)}%`
                  : "—"}
              </dd>
            </div>
          </dl>
        )}
      </div>

      <div className="mt-4">
        <AttemptsTable rows={student ? student.attempts : scenario.allStudents.attempts} showStudent />
      </div>
    </div>
  );
}
