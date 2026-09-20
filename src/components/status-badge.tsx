import { Hex } from "./hex";

const COLORS: Record<string, string> = {
  completed: "text-accent",
  in_progress: "text-ink",
  abandoned: "text-muted",
};

const LABELS: Record<string, string> = {
  completed: "Completed",
  in_progress: "In progress",
  abandoned: "Abandoned",
};

export function StatusBadge({ status }: { status: string }) {
  const color = COLORS[status] ?? "text-muted";
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${color}`}>
      <Hex variant={status === "completed" ? "fill" : "outline"} className="h-2.5 w-2.5" />
      {LABELS[status] ?? status}
    </span>
  );
}
