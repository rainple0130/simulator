export interface AttemptMetrics {
  time_s?: number;
  errors?: number;
  notes?: string;
}

export function parseAttemptMetrics(metricsJson: string | null): AttemptMetrics {
  if (!metricsJson) return {};
  try {
    return JSON.parse(metricsJson) as AttemptMetrics;
  } catch {
    return {};
  }
}
