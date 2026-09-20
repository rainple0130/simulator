import "server-only";
import { getDb } from "./db";

export type VrDominantHand = "left" | "right";
export type VrHaptics = "off" | "low" | "medium" | "high";
export type VrTurnMode = "snap" | "smooth";

export interface UserSettings {
  soundEnabled: boolean;
  hintsEnabled: boolean;
  vrDominantHand: VrDominantHand;
  vrHaptics: VrHaptics;
  vrTurnMode: VrTurnMode;
}

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  hintsEnabled: true,
  vrDominantHand: "right",
  vrHaptics: "medium",
  vrTurnMode: "snap",
};

interface UserSettingsRow {
  sound_enabled: number;
  hints_enabled: number;
  vr_dominant_hand: VrDominantHand;
  vr_haptics: VrHaptics;
  vr_turn_mode: VrTurnMode;
}

export function getUserSettings(userId: string): UserSettings {
  const row = getDb()
    .prepare(
      `SELECT sound_enabled, hints_enabled, vr_dominant_hand, vr_haptics, vr_turn_mode
       FROM user_settings WHERE user_id = ?`
    )
    .get(userId) as UserSettingsRow | undefined;

  if (!row) return DEFAULT_SETTINGS;

  return {
    soundEnabled: row.sound_enabled === 1,
    hintsEnabled: row.hints_enabled === 1,
    vrDominantHand: row.vr_dominant_hand,
    vrHaptics: row.vr_haptics,
    vrTurnMode: row.vr_turn_mode,
  };
}

export function updateUserSettings(userId: string, input: UserSettings): void {
  getDb()
    .prepare(
      `INSERT INTO user_settings (user_id, sound_enabled, hints_enabled, vr_dominant_hand, vr_haptics, vr_turn_mode, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         sound_enabled = excluded.sound_enabled,
         hints_enabled = excluded.hints_enabled,
         vr_dominant_hand = excluded.vr_dominant_hand,
         vr_haptics = excluded.vr_haptics,
         vr_turn_mode = excluded.vr_turn_mode,
         updated_at = datetime('now')`
    )
    .run(
      userId,
      input.soundEnabled ? 1 : 0,
      input.hintsEnabled ? 1 : 0,
      input.vrDominantHand,
      input.vrHaptics,
      input.vrTurnMode
    );
}
