import { Hex } from "@/components/hex";
import { GRADE_COLOR, GRADE_LABEL, type Grade } from "@/lib/grading";

export function GradeBadge({ grade }: { grade: Grade | null }) {
  if (!grade) return <span className="text-sm text-muted">—</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${GRADE_COLOR[grade]}`}>
      <Hex variant={grade === "fail" ? "outline" : "fill"} className="h-2 w-2" />
      {GRADE_LABEL[grade]}
    </span>
  );
}
