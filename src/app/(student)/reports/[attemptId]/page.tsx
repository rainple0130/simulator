import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth";
import { getAttemptReport } from "@/server/reports";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
import { DonutChart } from "@/components/charts/donut-chart";
import { AttemptTimeline } from "@/components/report/attempt-timeline";
import { ModeBadge } from "@/components/report/mode-badge";
import { GradeBadge } from "@/components/report/grade-badge";
import { formatDateTime, formatSeconds } from "@/lib/format";
import { HexBullet } from "@/components/hex";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const user = await requireUser();
  const report = getAttemptReport(attemptId);

  if (!report) notFound();
  const { attempt } = report;
  if (attempt.user_id !== user.id && user.role !== "teacher") notFound();

  const unitHref =
    user.role === "teacher"
      ? `/teacher/students/${attempt.user_id}/units/${attempt.scenario_id}`
      : `/reports/units/${attempt.scenario_id}`;

  return (
    <div className="max-w-2xl">
      <Link href={unitHref} className="text-sm text-muted hover:text-ink">
        ← Back to {attempt.scenario_title}
      </Link>

      <div className="mt-4 border border-line bg-surface p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <HexBullet />
              {attempt.scenario_category}
            </div>
            <h1 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink">
              {attempt.scenario_title}
            </h1>
            {user.role === "teacher" && (
              <p className="mt-1 text-sm text-muted">
                Student: {attempt.student_display_name} ({attempt.student_username})
              </p>
            )}
            <div className="mt-2 flex items-center gap-3">
              <ModeBadge mode={attempt.mode} />
              <StatusBadge status={attempt.status} />
              {report.grade && <GradeBadge grade={report.grade} />}
            </div>
          </div>
        </div>

        {attempt.status === "completed" && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Score" value={attempt.score != null ? String(attempt.score) : "—"} />
              <StatCard
                label="Completion time"
                value={
                  typeof report.metrics.time_s === "number"
                    ? formatSeconds(report.metrics.time_s)
                    : "—"
                }
              />
              <StatCard label="Completed items" value={String(report.steps.length)} />
              <StatCard label="Errors" value={String(report.errors.length)} />
            </div>

            <div className="mt-6 border-t border-line pt-6">
              <h2 className="mb-3 text-sm font-medium text-ink">Points breakdown</h2>
              <DonutChart
                centerValue={String(report.pointsEarned - report.pointsDeducted)}
                centerLabel="net score"
                data={[
                  { label: "Earned", value: report.pointsEarned, tone: "good" },
                  { label: "Deducted", value: report.pointsDeducted, tone: "bad" },
                ]}
              />
            </div>

            <div className="mt-6 border-t border-line pt-6">
              <h2 className="mb-3 text-sm font-medium text-ink">Passing standards</h2>
              <ul className="space-y-2 text-sm">
                {report.metricChecks.map((check) => (
                  <li key={check.label} className="flex items-center gap-2">
                    <span className={check.passed ? "text-good" : "text-bad"}>
                      {check.passed ? "✓" : "✗"}
                    </span>
                    <span className="text-ink">{check.label}:</span>
                    <span className="text-muted">{check.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm">
          <div>
            <dt className="text-muted">Started</dt>
            <dd className="mt-0.5 text-ink">{formatDateTime(attempt.started_at)}</dd>
          </div>
          <div>
            <dt className="text-muted">Completed</dt>
            <dd className="mt-0.5 text-ink">{formatDateTime(attempt.completed_at)}</dd>
          </div>
        </dl>

        {report.metrics.notes && (
          <div className="mt-6 border-t border-line pt-4">
            <h2 className="text-sm font-medium text-ink">Notes</h2>
            <p className="mt-2 text-sm text-muted">{report.metrics.notes}</p>
          </div>
        )}

        {report.events.length > 0 && (
          <div className="mt-6 border-t border-line pt-4">
            <h2 className="text-sm font-medium text-ink">Training history</h2>
            <div className="mt-2">
              <AttemptTimeline events={report.events} />
            </div>
          </div>
        )}

        {attempt.status === "in_progress" && (
          <Link
            href={`/library/${attempt.scenario_id}/launch?attempt=${attempt.id}`}
            className="mt-6 inline-block rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Resume simulation
          </Link>
        )}
      </div>
    </div>
  );
}
