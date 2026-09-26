"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth";
import { updateUserSettings, type VrDominantHand, type VrHaptics, type VrTurnMode } from "@/server/settings";

export async function updateSettingsAction(
  _prevState: { error?: string; saved?: boolean } | undefined,
  formData: FormData
) {
  const user = await requireUser();

  await updateUserSettings(user.id, {
    soundEnabled: formData.get("soundEnabled") === "on",
    hintsEnabled: formData.get("hintsEnabled") === "on",
    vrDominantHand: (String(formData.get("vrDominantHand") ?? "right") as VrDominantHand),
    vrHaptics: (String(formData.get("vrHaptics") ?? "medium") as VrHaptics),
    vrTurnMode: (String(formData.get("vrTurnMode") ?? "snap") as VrTurnMode),
  });

  revalidatePath("/settings");
  return { saved: true };
}
