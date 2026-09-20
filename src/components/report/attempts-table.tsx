import Link from "next/link";
import { ModeBadge } from "./mode-badge";
import { GradeBadge } from "./grade-badge";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime, formatSeconds } from "@/lib/format";
import type { Mode } from "@/lib/modes";
import type { AttemptStatus } from "@/server/attempts";
import type { Grade } from "@/lib/grading";

export interface AttemptTableRow {
  id: string;
  mode: Mode;
  status: AttemptStatus;
  score: number | null;
  grade: Grade | null;
  timeSeconds: number | null;
  startedAt: string;
  /** Set when the table spans multiple students (the teacher's cohort-wide scenario view). */
  studentId?: string;
  studentName?: string;
}

/**
 * Every row links to that attempt's single report — not just the mode cell, the whole row —
 * via an absolutely-positioned link sized to the row (`inset-0` on a `relative` <tr>), plus a
 * trailing arrow as a visual affordance that the row is clickable. When `showStudent` is set,
 * an extra Student column links independently to that student's page (given a higher z-index
 * so it wins over the row-wide overlay where the two overlap).
 */
export function AttemptsTable({
  rows,
  showStudent = false,
}: {
  rows: AttemptTableRow[];
  showStudent?: boolean;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">No attempts yet.</p>;
  }

  return (
    <div className="overflow-x-auto border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>
            {showStudent && <th className="px-4 py-3 font-medium">Student</th>}
            <th className="px-4 py-3 font-medium">Mode</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Grade</th>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Started</th>
            <th className="px-4 py-3" aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="group relative cursor-pointer border-b border-line/60 last:border-0 hover:bg-surface-hover"
            >
              {showStudent && (
                <td className="px-4 py-3">
                  {row.studentId ? (
                    <Link
                      href={`/teacher/students/${row.studentId}`}
                      className="relative z-20 font-medium text-ink hover:text-accent hover:underline"
                    >
                      {row.studentName}
                    </Link>
                  ) : (
                    <span className="text-ink">{row.studentName}</span>
                  )}
                </td>
              )}
              <td className="px-4 py-3">
                <Link
                  href={`/reports/${row.id}`}
                  className="absolute inset-0"
                  aria-label="View attempt report"
                />
                <ModeBadge mode={row.mode} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-4 py-3 text-muted">{row.score ?? "—"}</td>
              <td className="px-4 py-3">
                <GradeBadge grade={row.grade} />
              </td>
              <td className="px-4 py-3 text-muted">
                {row.timeSeconds != null ? formatSeconds(row.timeSeconds) : "—"}
              </td>
              <td className="px-4 py-3 text-muted">{formatDateTime(row.startedAt)}</td>
              <td className="px-4 py-3 text-right text-muted transition-colors group-hover:text-accent">
                →
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
