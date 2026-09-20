"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/server/auth";
import { createScenario, updateScenario, type Difficulty } from "@/server/scenarios";
import { isMode } from "@/lib/modes";

function readOptionalInt(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : null;
}

function readScenarioInput(formData: FormData) {
  return {
    category: String(formData.get("category") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    difficulty: (String(formData.get("difficulty") ?? "medium") as Difficulty),
    isActive: formData.get("isActive") === "on",
    availableModes: formData.getAll("availableModes").map(String).filter(isMode),
    passScore: readOptionalInt(formData, "passScore") ?? 70,
    excellentScore: readOptionalInt(formData, "excellentScore") ?? 90,
    maxErrors: readOptionalInt(formData, "maxErrors"),
    timeLimitS: readOptionalInt(formData, "timeLimitS"),
  };
}

export async function createScenarioAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  await requireTeacher();
  const result = createScenario(readScenarioInput(formData));
  if (!result.ok) return { error: result.error };

  revalidatePath("/teacher/scenarios");
  redirect("/teacher/scenarios");
}

export async function updateScenarioAction(
  scenarioId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  await requireTeacher();
  const result = updateScenario(scenarioId, readScenarioInput(formData));
  if (!result.ok) return { error: result.error };

  revalidatePath("/teacher/scenarios");
  revalidatePath("/library");
  redirect("/teacher/scenarios");
}
