export interface LinePoint {
  label: string;
  value: number;
}

const WIDTH = 400;
const BASE_PADDING = 10;

/** Trend sparkline for a numeric series across attempts (e.g. score over time). */
export function LineChart({
  data,
  formatValue = (v) => String(Math.round(v)),
  height = 140,
  min = 0,
  max = 100,
}: {
  data: LinePoint[];
  formatValue?: (value: number) => string;
  /** viewBox height in chart units; the rendered element keeps this exact WIDTH:height ratio so the line never gets stretched. */
  height?: number;
  /** Fixed y-axis bounds — scores are 0-100, so the axis stays fixed rather than zooming to whatever range the data happens to span. */
  min?: number;
  max?: number;
}) {
  if (data.length === 0) return <p className="text-sm text-muted">No data yet.</p>;

  const range = max - min || 1;
  const innerWidth = WIDTH - BASE_PADDING * 2;
  // One extra "interval" of margin on each side, so the first/last point never sits flush
  // against the plot edge: split the width into n+1 slots and place point i at slot i+1.
  const stepX = innerWidth / (data.length + 1);

  const points = data.map((d, i) => {
    const clamped = Math.min(max, Math.max(min, d.value));
    return {
      x: BASE_PADDING + stepX * (i + 1),
      y: height - BASE_PADDING - ((clamped - min) / range) * (height - BASE_PADDING * 2),
      ...d,
    };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${height - BASE_PADDING} L${points[0].x.toFixed(1)},${height - BASE_PADDING} Z`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      className="w-full"
      style={{ aspectRatio: `${WIDTH} / ${height}` }}
    >
      <line
        x1={BASE_PADDING}
        y1={height - BASE_PADDING}
        x2={WIDTH - BASE_PADDING}
        y2={height - BASE_PADDING}
        className="stroke-line"
        strokeWidth={1}
      />
      <path d={areaPath} className="fill-accent/10" stroke="none" />
      <path d={linePath} fill="none" className="stroke-accent" strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} className="fill-accent">
          <title>{`${p.label}: ${formatValue(p.value)}`}</title>
        </circle>
      ))}
    </svg>
  );
}
