import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserById } from "@/server/users";
import { getUnitReport } from "@/server/reports";
import { StatCard } from "@/components/stat-card";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { AttemptsTable } from "@/components/report/attempts-table";
import { HexBullet } from "@/components/hex";
import { formatDateTime, formatSeconds } from "@/lib/format";
import { MODE_LABEL } from "@/lib/modes";

export default async function StudentUnitReportPage({
  params,
}: {
  params: Promise<{ studentId: string; scenarioId: string }>;
}) {
  const { studentId, scenarioId } = await params;
  const student = await getUserById(studentId);
  if (!student || student.role !== "student") notFound();

  const unit = await getUnitReport(studentId, scenarioId);
  if (!unit) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/teacher/students/${studentId}`} className="text-sm text-muted hover:text-ink">
          ← Back to {student.display_name}
        </Link>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted">
          <HexBullet />
          {unit.category}
        </div>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {unit.title}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Average score"
          value={unit.averageScore != null ? unit.averageScore.toFixed(1) : "—"}
        />
        <StatCard label="Best score" value={unit.bestScore != null ? String(unit.bestScore) : "—"} />
        <StatCard
          label="Pass rate"
          value={unit.passRate != null ? `${Math.round(unit.passRate * 100)}%` : "—"}
        />
        <StatCard
          label="Average time"
          value={unit.averageTimeSeconds != null ? formatSeconds(unit.averageTimeSeconds) : "—"}
        />
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
          <HexBullet />
          Average score by mode
        </h2>
        <div className="border border-line bg-surface p-5">
          <BarChart
            max={100}
            data={unit.byMode.map((m) => ({
              label: MODE_LABEL[m.mode],
              value: m.averageScore ?? 0,
            }))}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
          <HexBullet />
          Score trend across attempts
        </h2>
        <div className="border border-line bg-surface p-5">
          <LineChart
            data={unit.trend.map((t) => ({ label: formatDateTime(t.date), value: t.score }))}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
          <HexBullet />
          All attempts
        </h2>
        <AttemptsTable rows={unit.attempts} />
      </section>
    </div>
  );
}
