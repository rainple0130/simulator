import Link from "next/link";
import { requireUser } from "@/server/auth";
import { getReportOverview } from "@/server/reports";
import { StatCard } from "@/components/stat-card";
import { ScenarioSwitcher } from "@/components/report/scenario-switcher";
import { HexBullet } from "@/components/hex";
import { formatDateTime } from "@/lib/format";

export default async function ReportsPage() {
  const user = await requireUser();
  const overview = await getReportOverview(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">My Reports</h1>
        <p className="mt-1 text-sm text-muted">
          Your performance across every scenario, and the history behind it.
        </p>
      </div>

      {overview.totalAttempts === 0 ? (
        <p className="text-sm text-muted">
          You haven't run any simulations yet. Head to the{" "}
          <Link href="/library" className="text-accent underline">
            Library
          </Link>{" "}
          to get started.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Scenarios" value={String(overview.byScenario.length)} />
            <StatCard label="Total attempts" value={String(overview.totalAttempts)} />
            <StatCard label="Completed" value={String(overview.completedAttempts)} />
          </div>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
              <HexBullet />
              By scenario
            </h2>
            <ScenarioSwitcher
              basePath="/reports/units"
              scenarios={overview.byScenario.map((scenario) => ({
                scenarioId: scenario.scenarioId,
                title: scenario.title,
                category: scenario.category,
                attemptCount: scenario.attemptCount,
                averageScore: scenario.averageScore,
                passRate: scenario.passRate,
                bestScore: scenario.bestScore,
                averageTimeSeconds: scenario.averageTimeSeconds,
                trend: scenario.trend.map((t) => ({ label: formatDateTime(t.date), value: t.score })),
                attempts: scenario.attempts,
              }))}
            />
          </section>
        </>
      )}
    </div>
  );
}
