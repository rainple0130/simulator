/** SQLite's datetime('now') yields "YYYY-MM-DD HH:MM:SS" (UTC, no timezone marker). */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const iso = value.includes("T") ? value : value.replace(" ", "T") + "Z";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function formatSeconds(value: number): string {
  const total = Math.round(value);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
