"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth";
import { getAttempt, completeAttempt } from "@/server/attempts";
import { recordAttemptEvents, synthesizeEvents } from "@/server/events";

export async function completeAttemptAction(formData: FormData) {
  const user = await requireUser();
  const attemptId = String(formData.get("attemptId") ?? "");

  const attempt = getAttempt(attemptId);
  if (!attempt || attempt.user_id !== user.id) {
    redirect("/library");
  }

  const scoreRaw = Number(formData.get("score"));
  const score = Number.isFinite(scoreRaw) ? Math.min(100, Math.max(0, Math.round(scoreRaw))) : 0;
  const timeSeconds = Number(formData.get("timeSeconds")) || 120;
  const errors = Number(formData.get("errors")) || 0;
  const notes = String(formData.get("notes") ?? "").trim();

  completeAttempt(attemptId, score, {
    time_s: timeSeconds,
    errors,
    ...(notes ? { notes } : {}),
  });

  // Demo mode has no real Quest telemetry, so derive a plausible step/error timeline
  // from the entered score/time/errors for the training-history report views.
  recordAttemptEvents(
    attemptId,
    synthesizeEvents({
      category: attempt.scenario_category,
      mode: attempt.mode,
      timeSeconds,
      errors,
      score,
    })
  );

  redirect(`/reports/${attemptId}`);
}
