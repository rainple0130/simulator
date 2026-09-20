export interface DonutDatum {
  label: string;
  value: number;
  tone: "accent" | "good" | "bad" | "muted";
}

const TONE_STROKE: Record<DonutDatum["tone"], string> = {
  accent: "stroke-accent",
  good: "stroke-good",
  bad: "stroke-bad",
  muted: "stroke-muted",
};

const TONE_FILL: Record<DonutDatum["tone"], string> = {
  accent: "fill-accent",
  good: "fill-good",
  bad: "fill-bad",
  muted: "fill-muted",
};

/** Part-to-whole breakdown (e.g. points earned vs. deducted, or errors by category). */
export function DonutChart({
  data,
  centerLabel,
  centerValue,
}: {
  data: DonutDatum[];
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0">
        <g transform="rotate(-90 50 50)">
          {total === 0 ? (
            <circle cx={50} cy={50} r={radius} fill="none" strokeWidth={14} className="stroke-line" />
          ) : (
            data
              .filter((d) => d.value > 0)
              .map((d) => {
                const fraction = d.value / total;
                const dash = fraction * circumference;
                const offset = -cumulative;
                cumulative += dash;
                return (
                  <circle
                    key={d.label}
                    cx={50}
                    cy={50}
                    r={radius}
                    fill="none"
                    strokeWidth={14}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={offset}
                    className={TONE_STROKE[d.tone]}
                  >
                    <title>{`${d.label}: ${d.value}`}</title>
                  </circle>
                );
              })
          )}
        </g>
        {centerValue && (
          <text
            x={50}
            y={centerLabel ? 46 : 50}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-ink font-display text-[18px] font-semibold"
          >
            {centerValue}
          </text>
        )}
        {centerLabel && (
          <text
            x={50}
            y={62}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-muted text-[8px]"
          >
            {centerLabel}
          </text>
        )}
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${TONE_FILL[d.tone]}`} />
            <span className="text-muted">{d.label}</span>
            <span className="font-medium text-ink">{d.value}</span>
          </li>
        ))}
        {total === 0 && <li className="text-muted">No data yet.</li>}
      </ul>
    </div>
  );
}
