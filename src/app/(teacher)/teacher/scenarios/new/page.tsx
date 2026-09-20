import Link from "next/link";
import { ScenarioForm } from "../scenario-form";
import { createScenarioAction } from "../actions";

export default function NewScenarioPage() {
  return (
    <div className="max-w-xl">
      <Link href="/teacher/scenarios" className="text-sm text-muted hover:text-ink">
        ← Back to Scenarios
      </Link>

      <div className="mt-4 border border-line bg-surface p-6">
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink">New Scenario</h1>
        <div className="mt-6">
          <ScenarioForm action={createScenarioAction} submitLabel="Create scenario" />
        </div>
      </div>
    </div>
  );
}
