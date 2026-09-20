"use client";

import { useState } from "react";
import Link from "next/link";
import { HexBullet } from "@/components/hex";
import { LineChart, type LinePoint } from "@/components/charts/line-chart";
import { AttemptsTable, type AttemptTableRow } from "@/components/report/attempts-table";
import { formatSeconds } from "@/lib/format";

export interface SwitchableScenario {
  scenarioId: string;
  title: string;
  category: string;
  attemptCount: number;
  averageScore: number | null;
  passRate: number | null;
  bestScore?: number | null;
  averageTimeSeconds?: number | null;
  trend: LinePoint[];
  attempts: AttemptTableRow[];
}

/**
 * A tab switcher over scenarios rather than a side-by-side grid — a fixed 2-up grid stops
 * making sense once there are more than a couple of scenarios, so only one scenario's
 * overview/trend/attempts is shown at a time, selected by tab.
 */
export function ScenarioSwitcher({
  scenarios,
  basePath,
  linkLabel = "View full scenario report →",
}: {
  scenarios: SwitchableScenario[];
  basePath: string;
  linkLabel?: string;
}) {
  const [selectedId, setSelectedId] = useState(scenarios[0]?.scenarioId);
  const scenario = scenarios.find((s) => s.scenarioId === selectedId) ?? scenarios[0];
  if (!scenario) return <p className="text-sm text-muted">No scenarios yet.</p>;

  return (
    <div>
      <div className="flex flex-wrap gap-1 overflow-x-auto border-b border-line">
        {scenarios.map((s) => (
          <button
            key={s.scenarioId}
            type="button"
            onClick={() => setSelectedId(s.scenarioId)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              s.scenarioId === scenario.scenarioId
                ? "border-accent text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="mt-4 border border-line bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted">
              <HexBullet />
              {scenario.category}
            </div>
            <h3 className="mt-1 font-medium text-ink">{scenario.title}</h3>
          </div>
          <span className="shrink-0 font-display text-2xl font-semibold text-ink">
            {scenario.averageScore != null ? scenario.averageScore.toFixed(1) : "—"}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-muted sm:grid-cols-4">
          <div>
            <dt>Attempts</dt>
            <dd className="text-ink">{scenario.attemptCount}</dd>
          </div>
          <div>
            <dt>Pass rate</dt>
            <dd className="text-ink">
              {scenario.passRate != null ? `${Math.round(scenario.passRate * 100)}%` : "—"}
            </dd>
          </div>
          {scenario.bestScore !== undefined && (
            <div>
              <dt>Best score</dt>
              <dd className="text-ink">{scenario.bestScore ?? "—"}</dd>
            </div>
          )}
          {scenario.averageTimeSeconds !== undefined && (
            <div>
              <dt>Avg. time</dt>
              <dd className="text-ink">
                {scenario.averageTimeSeconds != null ? formatSeconds(scenario.averageTimeSeconds) : "—"}
              </dd>
            </div>
          )}
        </dl>

        {scenario.trend.length > 1 && (
          <div className="mt-4 border-t border-line pt-4">
            <LineChart data={scenario.trend} />
          </div>
        )}

        <Link
          href={`${basePath}/${scenario.scenarioId}`}
          className="mt-4 inline-block text-sm text-accent hover:underline"
        >
          {linkLabel}
        </Link>
      </div>

      <div className="mt-4">
        <AttemptsTable rows={scenario.attempts} />
      </div>
    </div>
  );
}
