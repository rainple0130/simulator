const HEX_POINTS = "25,1 75,1 99,43.5 75,86 25,86 1,43.5";

export function Hex({
  className,
  variant = "fill",
}: {
  className?: string;
  variant?: "fill" | "outline";
}) {
  return (
    <svg viewBox="0 0 100 87" className={className} aria-hidden="true">
      <polygon
        points={HEX_POINTS}
        fill={variant === "fill" ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={variant === "outline" ? 7 : 0}
      />
    </svg>
  );
}

export function HexMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <polygon points="15,60 35,44 75,44 95,60 75,76 35,76" fill="var(--color-accent-hover)" />
      <polygon
        points="5,32 25,16 65,16 85,32 65,48 25,48"
        fill="var(--color-accent)"
        fillOpacity={0.94}
      />
    </svg>
  );
}

/** A small hex bullet used in place of the generic all-caps eyebrow label. */
export function HexBullet({ className }: { className?: string }) {
  return <Hex className={`inline-block h-2.5 w-2.5 shrink-0 text-accent ${className ?? ""}`} />;
}

const LEVELS: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

export function DifficultyHex({ level }: { level: string }) {
  const filled = LEVELS[level] ?? 1;
  return (
    <span className="inline-flex items-center gap-1" title={level}>
      {[0, 1, 2].map((i) => (
        <Hex
          key={i}
          variant={i < filled ? "fill" : "outline"}
          className={`h-3 w-3 ${i < filled ? "text-accent" : "text-muted"}`}
        />
      ))}
    </span>
  );
}
