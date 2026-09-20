import Link from "next/link";
import { listScenarios, scenarioModes } from "@/server/scenarios";
import { DifficultyHex, Hex } from "@/components/hex";
import { MODE_LABEL } from "@/lib/modes";

export default async function TeacherScenariosPage() {
  const scenarios = listScenarios();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Scenarios</h1>
          <p className="mt-1 text-sm text-muted">Manage the simulation library.</p>
        </div>
        <Link
          href="/teacher/scenarios/new"
          className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          New scenario
        </Link>
      </div>

      <div className="overflow-x-auto border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Difficulty</th>
              <th className="px-4 py-3 font-medium">Modes</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => (
              <tr key={s.id} className="border-b border-line/60 last:border-0 hover:bg-surface-hover">
                <td className="px-4 py-3">
                  <Link
                    href={`/teacher/scenarios/${s.id}`}
                    className="font-medium text-ink hover:text-accent"
                  >
                    {s.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{s.category}</td>
                <td className="px-4 py-3">
                  <DifficultyHex level={s.difficulty} />
                </td>
                <td className="px-4 py-3 text-muted">
                  {scenarioModes(s)
                    .map((m) => MODE_LABEL[m])
                    .join(" · ")}
                </td>
                <td className="px-4 py-3">
                  {s.is_active ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                      <Hex className="h-2.5 w-2.5" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted">
                      <Hex variant="outline" className="h-2.5 w-2.5" />
                      Inactive
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
