import { Hex } from "@/components/hex";
import { MODE_COLOR, MODE_LABEL, type Mode } from "@/lib/modes";

export function ModeBadge({ mode }: { mode: Mode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${MODE_COLOR[mode]}`}>
      <Hex className="h-2 w-2" />
      {MODE_LABEL[mode]}
    </span>
  );
}
