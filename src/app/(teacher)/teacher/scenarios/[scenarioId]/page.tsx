import Link from "next/link";
import { notFound } from "next/navigation";
import { getScenario } from "@/server/scenarios";
import { ScenarioForm } from "../scenario-form";
import { updateScenarioAction } from "../actions";

export default async function EditScenarioPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  const scenario = await getScenario(scenarioId);
  if (!scenario) notFound();

  const boundAction = updateScenarioAction.bind(null, scenarioId);

  return (
    <div className="max-w-xl">
      <Link href="/teacher/scenarios" className="text-sm text-muted hover:text-ink">
        ← Back to Scenarios
      </Link>

      <div className="mt-4 border border-line bg-surface p-6">
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink">Edit Scenario</h1>
        <div className="mt-6">
          <ScenarioForm action={boundAction} initial={scenario} submitLabel="Save changes" />
        </div>
      </div>
    </div>
  );
}
