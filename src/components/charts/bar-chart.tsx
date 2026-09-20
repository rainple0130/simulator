export interface BarDatum {
  label: string;
  value: number;
  tone?: "accent" | "good" | "bad" | "muted";
}

const TONE_FILL: Record<NonNullable<BarDatum["tone"]>, string> = {
  accent: "fill-accent",
  good: "fill-good",
  bad: "fill-bad",
  muted: "fill-muted",
};

/** Horizontal bar chart for comparing a small set of categories (e.g. average score by mode). */
export function BarChart({
  data,
  max,
  formatValue = (v) => String(Math.round(v)),
}: {
  data: BarDatum[];
  max?: number;
  formatValue?: (value: number) => string;
}) {
  if (data.length === 0) return <p className="text-sm text-muted">No data yet.</p>;
  const effectiveMax = max ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate text-muted" title={d.label}>
            {d.label}
          </span>
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="h-2.5 flex-1">
            <rect x={0} y={0} width={100} height={10} rx={1.5} className="fill-line" />
            <rect
              x={0}
              y={0}
              width={Math.max(0, Math.min(100, (d.value / effectiveMax) * 100))}
              height={10}
              rx={1.5}
              className={TONE_FILL[d.tone ?? "accent"]}
            >
              <title>{`${d.label}: ${formatValue(d.value)}`}</title>
            </rect>
          </svg>
          <span className="w-14 shrink-0 text-right text-ink">{formatValue(d.value)}</span>
        </div>
      ))}
    </div>
  );
}
