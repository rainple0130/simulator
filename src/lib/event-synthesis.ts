import type { Mode } from "./modes";

export type AttemptEventType = "step" | "error" | "hint";

export interface NewAttemptEvent {
  tOffsetS: number;
  type: AttemptEventType;
  label: string;
  points: number;
}

/** Standard checklist steps per scenario category, used to fabricate a plausible training-history timeline for the demo launch flow (no real Quest telemetry yet). */
const STEP_LIBRARY: Record<string, string[]> = {
  "Vascular Access": [
    "Verify patient identity and consent",
    "Position patient and prep sterile field",
    "Apply ultrasound probe and identify vessel",
    "Anesthetize insertion site",
    "Advance needle under ultrasound guidance",
    "Confirm venous return",
    "Insert guidewire (Seldinger technique)",
    "Dilate tract and advance catheter",
    "Confirm catheter placement",
    "Secure catheter and dress site",
  ],
  "Obstetric Procedures": [
    "Verify patient identity and consent",
    "Perform pre-procedure ultrasound survey",
    "Plan needle path avoiding fetus and placenta",
    "Prep sterile field",
    "Anesthetize insertion site",
    "Advance needle under ultrasound guidance",
    "Aspirate amniotic fluid",
    "Withdraw needle and inspect site",
    "Confirm fetal heart activity post-procedure",
    "Label and send specimen",
  ],
};

const DEFAULT_STEPS = [
  "Verify patient identity and consent",
  "Prep sterile field",
  "Position equipment",
  "Perform primary maneuver",
  "Confirm result",
  "Document procedure",
];

function stepsForCategory(category: string): string[] {
  return STEP_LIBRARY[category] ?? DEFAULT_STEPS;
}

export interface SynthesizeInput {
  category: string;
  mode: Mode;
  timeSeconds: number;
  errors: number;
  score: number;
}

/**
 * Turns the demo completion form's simple (score/time/errors) inputs into an ordered list of
 * step/error events spread across the attempt duration, so every attempt has a real timeline
 * without requiring actual Quest telemetry.
 */
export function synthesizeEvents(input: SynthesizeInput): NewAttemptEvent[] {
  const steps = stepsForCategory(input.category);
  const duration = Math.max(input.timeSeconds, steps.length * 5);
  const errorCount = Math.min(input.errors, steps.length);
  const errorStepIndexes = new Set<number>();
  // Spread errors evenly across the step sequence rather than clustering them at the start.
  for (let i = 0; i < errorCount; i++) {
    errorStepIndexes.add(Math.floor(((i + 1) * steps.length) / (errorCount + 1)));
  }

  const pointsPerStep = Math.max(1, Math.round(100 / steps.length));
  const events: NewAttemptEvent[] = [];

  steps.forEach((label, index) => {
    const tOffsetS = Math.round(((index + 1) / (steps.length + 1)) * duration);
    if (errorStepIndexes.has(index)) {
      events.push({
        tOffsetS,
        type: "error",
        label: `Deviation: ${label.toLowerCase()}`,
        points: -Math.min(10, pointsPerStep),
      });
    }
    events.push({ tOffsetS, type: "step", label, points: pointsPerStep });
  });

  if (input.mode === "guided") {
    events.splice(1, 0, {
      tOffsetS: Math.round(duration * 0.1),
      type: "hint",
      label: "Hint requested: probe positioning",
      points: 0,
    });
  }

  return events.sort((a, b) => a.tOffsetS - b.tOffsetS);
}
