"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth";
import { getScenario, scenarioModes } from "@/server/scenarios";
import { createAttempt } from "@/server/attempts";
import { isMode } from "@/lib/modes";

export async function launchAction(formData: FormData) {
  const user = await requireUser();
  const scenarioId = String(formData.get("scenarioId") ?? "");

  const scenario = await getScenario(scenarioId);
  if (!scenario || !scenario.is_active) {
    redirect("/library");
  }

  const modeRaw = String(formData.get("mode") ?? "");
  const allowedModes = scenarioModes(scenario);
  const mode = isMode(modeRaw) && allowedModes.includes(modeRaw) ? modeRaw : allowedModes[0];

  const attemptId = await createAttempt(user.id, scenarioId, mode);
  redirect(`/library/${scenarioId}/launch?attempt=${attemptId}`);
}
