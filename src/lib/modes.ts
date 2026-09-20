export type Mode = "guided" | "practice" | "exam";

export const MODES: Mode[] = ["guided", "practice", "exam"];

export const MODE_LABEL: Record<Mode, string> = {
  guided: "Guided",
  practice: "Practice",
  exam: "Exam",
};

export const MODE_DESCRIPTION: Record<Mode, string> = {
  guided: "Step-by-step prompts and hints while you learn the procedure.",
  practice: "Run the procedure unassisted; mistakes don't count against your record.",
  exam: "Timed, graded, no hints. Counts as an official assessment.",
};

/** Tailwind text-color utility per mode, matching the app's accent/good/bad/muted theme tokens. */
export const MODE_COLOR: Record<Mode, string> = {
  guided: "text-muted",
  practice: "text-accent",
  exam: "text-bad",
};

export function parseModes(value: string): Mode[] {
  const modes = value
    .split(",")
    .map((m) => m.trim())
    .filter((m): m is Mode => (MODES as string[]).includes(m));
  return modes.length > 0 ? modes : ["practice"];
}

export function serializeModes(modes: Mode[]): string {
  const unique = MODES.filter((m) => modes.includes(m));
  return unique.length > 0 ? unique.join(",") : "practice";
}

export function isMode(value: string): value is Mode {
  return (MODES as string[]).includes(value);
}
