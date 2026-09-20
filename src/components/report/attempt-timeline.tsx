"use client";

import { useState } from "react";
import { Hex } from "@/components/hex";
import type { AttemptEventRow } from "@/server/events";

const TYPE_COLOR: Record<AttemptEventRow["type"], string> = {
  step: "text-good",
  error: "text-bad",
  hint: "text-muted",
};

const TYPE_LABEL: Record<AttemptEventRow["type"], string> = {
  step: "Completed",
  error: "Error",
  hint: "Hint used",
};

function formatOffset(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function EventList({ events }: { events: AttemptEventRow[] }) {
  return (
    <ol className="space-y-0">
      {events.map((event) => (
        <li key={event.id} className="flex items-start gap-3 border-line/60 py-2.5">
          <span className="mt-1 w-10 shrink-0 font-mono text-xs text-muted">
            {formatOffset(event.t_offset_s)}
          </span>
          <Hex
            variant={event.type === "step" ? "fill" : "outline"}
            className={`mt-1 h-2.5 w-2.5 shrink-0 ${TYPE_COLOR[event.type]}`}
          />
          <div className="min-w-0 flex-1 border-b border-line/60 pb-2.5">
            <p className="text-sm text-ink">{event.label}</p>
            <p className={`mt-0.5 text-xs ${TYPE_COLOR[event.type]}`}>
              {TYPE_LABEL[event.type]}
              {event.points !== 0 && (
                <span className="ml-1.5 font-medium">
                  {event.points > 0 ? `+${event.points}` : event.points}
                </span>
              )}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

type ViewMode = "chronological" | "split";

/** Training-history timeline of what happened during a single attempt, either in
 * chronological order or split into completed items vs. errors/deductions. */
export function AttemptTimeline({ events }: { events: AttemptEventRow[] }) {
  const [mode, setMode] = useState<ViewMode>("chronological");

  if (events.length === 0) {
    return <p className="text-sm text-muted">No step-by-step history recorded for this attempt.</p>;
  }

  const steps = events.filter((e) => e.type === "step");
  const errors = events.filter((e) => e.type === "error");
  const hints = events.filter((e) => e.type === "hint");

  return (
    <div>
      <div className="mb-4 inline-flex border border-line text-xs">
        <button
          type="button"
          onClick={() => setMode("chronological")}
          className={`px-3 py-1.5 font-medium transition-colors ${
            mode === "chronological" ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
          }`}
        >
          Chronological
        </button>
        <button
          type="button"
          onClick={() => setMode("split")}
          className={`px-3 py-1.5 font-medium transition-colors ${
            mode === "split" ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
          }`}
        >
          Split by type
        </button>
      </div>

      {mode === "chronological" ? (
        <EventList events={events} />
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="mb-1 text-xs font-medium text-good">Completed items ({steps.length})</h3>
            {steps.length > 0 ? (
              <EventList events={steps} />
            ) : (
              <p className="text-sm text-muted">No completed items.</p>
            )}
          </div>
          <div>
            <h3 className="mb-1 text-xs font-medium text-bad">Errors &amp; deductions ({errors.length})</h3>
            {errors.length > 0 ? (
              <EventList events={errors} />
            ) : (
              <p className="text-sm text-muted">No errors.</p>
            )}
          </div>
          {hints.length > 0 && (
            <div>
              <h3 className="mb-1 text-xs font-medium text-muted">Hints used ({hints.length})</h3>
              <EventList events={hints} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
