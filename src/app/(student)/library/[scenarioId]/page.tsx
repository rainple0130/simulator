import { notFound } from "next/navigation";
import Link from "next/link";
import { getScenario, scenarioModes } from "@/server/scenarios";
import { launchAction } from "./actions";
import { DifficultyHex, HexBullet } from "@/components/hex";
import { MODE_DESCRIPTION, MODE_LABEL } from "@/lib/modes";

export default async function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  const scenario = await getScenario(scenarioId);
  if (!scenario || !scenario.is_active) notFound();

  const modes = scenarioModes(scenario);

  return (
    <div className="max-w-2xl">
      <Link href="/library" className="text-sm text-muted hover:text-ink">
        ← Back to Library
      </Link>

      <div className="mt-4 border border-line bg-surface p-6">
        <div className="flex items-center gap-2 text-sm text-muted">
          <HexBullet />
          {scenario.category}
        </div>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
          {scenario.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{scenario.description}</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted">
          Difficulty <DifficultyHex level={scenario.difficulty} />
        </div>

        <form action={launchAction} className="mt-6 border-t border-line pt-6">
          <input type="hidden" name="scenarioId" value={scenario.id} />

          <fieldset>
            <legend className="text-sm font-medium text-ink">Choose a mode</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {modes.map((mode, i) => (
                <label
                  key={mode}
                  className="flex cursor-pointer flex-col gap-1 border border-line bg-bg p-3 has-[:checked]:border-accent"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      value={mode}
                      defaultChecked={i === 0}
                      className="accent-accent"
                    />
                    <span className="text-sm font-medium text-ink">{MODE_LABEL[mode]}</span>
                  </span>
                  <span className="text-xs text-muted">{MODE_DESCRIPTION[mode]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="mt-5 rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Launch on Quest
          </button>
        </form>
      </div>
    </div>
  );
}
