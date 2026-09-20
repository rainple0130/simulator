import { aggregateStats } from "@/server/attempts";
import { getTeacherScenarioOverviews } from "@/server/reports";
import { HexBullet } from "@/components/hex";
import { StatCard } from "@/components/stat-card";
import { BarChart } from "@/components/charts/bar-chart";
import { TeacherScenarioSwitcher } from "@/components/report/teacher-scenario-switcher";
import { MODE_LABEL } from "@/lib/modes";
import { formatDateTime } from "@/lib/format";

export default async function TeacherDashboardPage() {
  const stats = aggregateStats();
  const scenarios = getTeacherScenarioOverviews();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          Teacher Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">Aggregate view across all students.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Students" value={String(stats.totalStudents)} />
        <StatCard label="Total attempts" value={String(stats.totalAttempts)} />
        <StatCard label="Completion rate" value={`${Math.round(stats.completionRate * 100)}%`} />
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
          <HexBullet />
          Average score by mode
        </h2>
        <div className="border border-line bg-surface p-5">
          <BarChart
            max={100}
            data={stats.byMode.map((m) => ({
              label: MODE_LABEL[m.mode],
              value: m.averageScore ?? 0,
            }))}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
          <HexBullet />
          By scenario
        </h2>
        <TeacherScenarioSwitcher
          scenarios={scenarios.map((scenario) => ({
            ...scenario,
            students: scenario.students.map((s) => ({
              ...s,
              trend: s.trend.map((t) => ({ label: formatDateTime(t.date), value: t.score })),
            })),
          }))}
        />
      </section>
    </div>
  );
}
