import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth";
import { getAttempt } from "@/server/attempts";
import { completeAttemptAction } from "./actions";
import { Hex } from "@/components/hex";
import { ModeBadge } from "@/components/report/mode-badge";

export default async function LaunchPage({
  params,
  searchParams,
}: {
  params: Promise<{ scenarioId: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const { scenarioId } = await params;
  const { attempt: attemptId } = await searchParams;
  const user = await requireUser();

  if (!attemptId) redirect(`/library/${scenarioId}`);

  const attempt = await getAttempt(attemptId);
  if (!attempt || attempt.user_id !== user.id || attempt.scenario_id !== scenarioId) {
    redirect(`/library/${scenarioId}`);
  }

  if (attempt.status === "completed") {
    redirect(`/reports/${attempt.id}`);
  }

  return (
    <div className="max-w-xl">
      <div className="border border-line bg-surface p-6">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-accent">
          <Hex className="h-2.5 w-2.5" />
          Demo mode — device handoff not yet implemented
        </p>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
            Preparing “{attempt.scenario_title}” on Meta Quest…
          </h1>
          <ModeBadge mode={attempt.mode} />
        </div>
        <p className="mt-2 text-sm text-muted">
          In a production build, this screen would hand off your authenticated session to the
          Quest headset and launch the Unity scene there. Since that device integration hasn't
          been built yet, use the form below to record a result as if the simulation had just
          finished on the headset.
        </p>

        <form action={completeAttemptAction} className="mt-6 space-y-4 border-t border-line pt-6">
          <input type="hidden" name="attemptId" value={attempt.id} />

          <div>
            <label htmlFor="score" className="block text-sm font-medium text-ink">
              Score (0–100)
            </label>
            <input
              id="score"
              name="score"
              type="number"
              min={0}
              max={100}
              required
              defaultValue={85}
              className="mt-1 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="timeSeconds" className="block text-sm font-medium text-ink">
                Time (seconds)
              </label>
              <input
                id="timeSeconds"
                name="timeSeconds"
                type="number"
                min={0}
                className="mt-1 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="errors" className="block text-sm font-medium text-ink">
                Errors
              </label>
              <input
                id="errors"
                name="errors"
                type="number"
                min={0}
                defaultValue={0}
                className="mt-1 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-ink">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="mt-1 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Mark simulation complete
          </button>
        </form>
      </div>
    </div>
  );
}
