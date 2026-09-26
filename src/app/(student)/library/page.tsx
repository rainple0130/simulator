import Link from "next/link";
import { listScenariosGroupedByCategory, scenarioModes } from "@/server/scenarios";
import { DifficultyHex, HexBullet } from "@/components/hex";
import { MODE_LABEL } from "@/lib/modes";

export default async function LibraryPage() {
  const groups = await listScenariosGroupedByCategory({ activeOnly: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          Simulation Library
        </h1>
        <p className="mt-1 text-sm text-muted">
          Choose a procedure to run on your Meta Quest headset.
        </p>
      </div>

      {groups.length === 0 && <p className="text-sm text-muted">No simulations are available yet.</p>}

      {groups.map((group) => (
        <section key={group.category}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
            <HexBullet />
            {group.category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.scenarios.map((scenario) => (
              <Link
                key={scenario.id}
                href={`/library/${scenario.id}`}
                className="block border border-line bg-surface p-5 transition-colors hover:border-accent hover:bg-surface-hover"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-ink">{scenario.title}</h3>
                  <DifficultyHex level={scenario.difficulty} />
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{scenario.description}</p>
                <p className="mt-3 text-xs text-muted">
                  {scenarioModes(scenario)
                    .map((m) => MODE_LABEL[m])
                    .join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
