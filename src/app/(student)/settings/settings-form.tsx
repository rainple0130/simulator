"use client";

import { useActionState } from "react";
import type { UserSettings } from "@/server/settings";
import { updateSettingsAction } from "./actions";

const inputClass =
  "mt-1 w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";

export function SettingsForm({ initial }: { initial: UserSettings }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, undefined);

  return (
    <form action={formAction} className="space-y-8">
      <section>
        <h2 className="text-sm font-medium text-ink">General</h2>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="soundEnabled"
              defaultChecked={initial.soundEnabled}
              className="h-4 w-4 rounded-sm border-line bg-bg accent-accent"
            />
            Sound effects
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="hintsEnabled"
              defaultChecked={initial.hintsEnabled}
              className="h-4 w-4 rounded-sm border-line bg-bg accent-accent"
            />
            In-simulation hints
          </label>
        </div>
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="text-sm font-medium text-ink">VR controller</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <span className="block text-sm font-medium text-ink">Dominant hand</span>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="vrDominantHand"
                  value="right"
                  defaultChecked={initial.vrDominantHand === "right"}
                  className="accent-accent"
                />
                Right
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="vrDominantHand"
                  value="left"
                  defaultChecked={initial.vrDominantHand === "left"}
                  className="accent-accent"
                />
                Left
              </label>
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-ink">Turn mode</span>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="vrTurnMode"
                  value="snap"
                  defaultChecked={initial.vrTurnMode === "snap"}
                  className="accent-accent"
                />
                Snap
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="vrTurnMode"
                  value="smooth"
                  defaultChecked={initial.vrTurnMode === "smooth"}
                  className="accent-accent"
                />
                Smooth
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="vrHaptics" className="block text-sm font-medium text-ink">
              Haptics intensity
            </label>
            <select
              id="vrHaptics"
              name="vrHaptics"
              defaultValue={initial.vrHaptics}
              className={inputClass}
            >
              <option value="off">Off</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </section>

      {state?.saved && <p className="text-sm text-good">Settings saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
