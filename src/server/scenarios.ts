import "server-only";
import crypto from "node:crypto";
import { getDb } from "./db";
import { type Mode, parseModes, serializeModes } from "@/lib/modes";
import type { GradingCriteria } from "@/lib/grading";

export type Difficulty = "easy" | "medium" | "hard";

export interface ScenarioRow {
  id: string;
  category: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  is_active: number;
  available_modes: string;
  pass_score: number;
  excellent_score: number;
  max_errors: number | null;
  time_limit_s: number | null;
  created_at: string;
}

export function scenarioModes(scenario: ScenarioRow): Mode[] {
  return parseModes(scenario.available_modes);
}

export function scenarioCriteria(scenario: ScenarioRow): GradingCriteria {
  return {
    passScore: scenario.pass_score,
    excellentScore: scenario.excellent_score,
    maxErrors: scenario.max_errors,
    timeLimitS: scenario.time_limit_s,
  };
}

export async function listScenarios(options: { activeOnly?: boolean } = {}): Promise<ScenarioRow[]> {
  const { activeOnly = false } = options;
  const sql = activeOnly
    ? "SELECT * FROM scenarios WHERE is_active = 1 ORDER BY category, title"
    : "SELECT * FROM scenarios ORDER BY category, title";
  const db = await getDb();
  const result = await db.execute(sql);
  return result.rows as unknown as ScenarioRow[];
}

export async function listScenariosGroupedByCategory(
  options: { activeOnly?: boolean } = {}
): Promise<{ category: string; scenarios: ScenarioRow[] }[]> {
  const rows = await listScenarios(options);
  const groups = new Map<string, ScenarioRow[]>();
  for (const row of rows) {
    if (!groups.has(row.category)) groups.set(row.category, []);
    groups.get(row.category)!.push(row);
  }
  return Array.from(groups.entries()).map(([category, scenarios]) => ({ category, scenarios }));
}

export async function getScenario(id: string): Promise<ScenarioRow | null> {
  const db = await getDb();
  const result = await db.execute({ sql: "SELECT * FROM scenarios WHERE id = ?", args: [id] });
  return (result.rows[0] as unknown as ScenarioRow) ?? null;
}

export interface ScenarioInput {
  category: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  isActive: boolean;
  availableModes: Mode[];
  passScore: number;
  excellentScore: number;
  maxErrors: number | null;
  timeLimitS: number | null;
}

export async function createScenario(
  input: ScenarioInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!input.category.trim() || !input.title.trim()) {
    return { ok: false, error: "Category and title are required." };
  }
  const id = crypto.randomUUID();
  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO scenarios
        (id, category, title, description, difficulty, is_active, available_modes, pass_score, excellent_score, max_errors, time_limit_s)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.category.trim(),
      input.title.trim(),
      input.description.trim(),
      input.difficulty,
      input.isActive ? 1 : 0,
      serializeModes(input.availableModes),
      input.passScore,
      input.excellentScore,
      input.maxErrors,
      input.timeLimitS,
    ],
  });
  return { ok: true, id };
}

export async function updateScenario(
  id: string,
  input: ScenarioInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.category.trim() || !input.title.trim()) {
    return { ok: false, error: "Category and title are required." };
  }
  const db = await getDb();
  await db.execute({
    sql: `UPDATE scenarios SET
        category = ?, title = ?, description = ?, difficulty = ?, is_active = ?, available_modes = ?,
        pass_score = ?, excellent_score = ?, max_errors = ?, time_limit_s = ?
       WHERE id = ?`,
    args: [
      input.category.trim(),
      input.title.trim(),
      input.description.trim(),
      input.difficulty,
      input.isActive ? 1 : 0,
      serializeModes(input.availableModes),
      input.passScore,
      input.excellentScore,
      input.maxErrors,
      input.timeLimitS,
      id,
    ],
  });
  return { ok: true };
}
