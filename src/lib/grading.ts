export type Grade = "fail" | "pass" | "excellent";

export const GRADE_LABEL: Record<Grade, string> = {
  fail: "Fail",
  pass: "Pass",
  excellent: "Excellent",
};

/** Tailwind text-color utility per grade — red/green/blue, kept visually distinct at a glance. */
export const GRADE_COLOR: Record<Grade, string> = {
  fail: "text-bad",
  pass: "text-good",
  excellent: "text-info",
};

export interface GradingCriteria {
  passScore: number;
  excellentScore: number;
  /** null = no cap on errors */
  maxErrors: number | null;
  /** null = no time limit */
  timeLimitS: number | null;
}

export interface GradeInput {
  score: number;
  errors: number;
  timeSeconds: number | null;
}

/**
 * A breached error or time cap is a critical-error style auto-fail, mirroring standard
 * OSCE/clinical-simulation checklists where certain mistakes fail the attempt regardless
 * of the overall score. Otherwise the grade is banded by score alone.
 */
export function computeGrade(input: GradeInput, criteria: GradingCriteria): Grade {
  const breachedErrorCap = criteria.maxErrors != null && input.errors > criteria.maxErrors;
  const breachedTimeCap =
    criteria.timeLimitS != null && input.timeSeconds != null && input.timeSeconds > criteria.timeLimitS;
  if (breachedErrorCap || breachedTimeCap) return "fail";
  if (input.score >= criteria.excellentScore) return "excellent";
  if (input.score >= criteria.passScore) return "pass";
  return "fail";
}

export interface MetricCheck {
  label: string;
  passed: boolean;
  detail: string;
}

/** Per-metric pass/fail breakdown against the scenario's standards, for display alongside the raw numbers. */
export function evaluateMetrics(input: GradeInput, criteria: GradingCriteria): MetricCheck[] {
  const checks: MetricCheck[] = [
    {
      label: "Score",
      passed: input.score >= criteria.passScore,
      detail: `${input.score} (pass ≥ ${criteria.passScore}, excellent ≥ ${criteria.excellentScore})`,
    },
  ];

  if (criteria.maxErrors != null) {
    checks.push({
      label: "Errors",
      passed: input.errors <= criteria.maxErrors,
      detail: `${input.errors} (max ${criteria.maxErrors})`,
    });
  }

  if (criteria.timeLimitS != null && input.timeSeconds != null) {
    checks.push({
      label: "Time",
      passed: input.timeSeconds <= criteria.timeLimitS,
      detail: `${input.timeSeconds}s (limit ${criteria.timeLimitS}s)`,
    });
  }

  return checks;
}
