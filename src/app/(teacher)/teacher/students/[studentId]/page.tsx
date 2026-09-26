import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserById } from "@/server/users";
import { getReportOverview } from "@/server/reports";
import { getUserSettings } from "@/server/settings";
import { StatCard } from "@/components/stat-card";
import { ScenarioSwitcher } from "@/components/report/scenario-switcher";
import { HexBullet } from "@/components/hex";
import { formatDateTime } from "@/lib/format";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = await getUserById(studentId);
  if (!student || student.role !== "student") notFound();

  const [overview, settings] = await Promise.all([
    getReportOverview(studentId),
    getUserSettings(studentId),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/teacher/students" className="text-sm text-muted hover:text-ink">
          ← Back to Students
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">
          {student.display_name}
        </h1>
        <p className="mt-1 text-sm text-muted">@{student.username}</p>
      </div>

      {overview.totalAttempts === 0 ? (
        <p className="text-sm text-muted">No attempts recorded yet.</p>
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
              basePath={`/teacher/students/${studentId}/units`}
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

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
          <HexBullet />
          Settings
        </h2>
        <dl className="grid grid-cols-2 gap-4 border border-line bg-surface p-5 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted">Sound effects</dt>
            <dd className="mt-0.5 text-ink">{settings.soundEnabled ? "On" : "Off"}</dd>
          </div>
          <div>
            <dt className="text-muted">Hints</dt>
            <dd className="mt-0.5 text-ink">{settings.hintsEnabled ? "On" : "Off"}</dd>
          </div>
          <div>
            <dt className="text-muted">Dominant hand</dt>
            <dd className="mt-0.5 capitalize text-ink">{settings.vrDominantHand}</dd>
          </div>
          <div>
            <dt className="text-muted">Haptics</dt>
            <dd className="mt-0.5 capitalize text-ink">{settings.vrHaptics}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
