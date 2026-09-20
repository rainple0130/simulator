import { requireUser } from "@/server/auth";
import { getUserSettings } from "@/server/settings";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = getUserSettings(user.id);

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Settings</h1>
      <p className="mt-1 text-sm text-muted">Sound, hints, and your VR controller preferences.</p>

      <div className="mt-6 border border-line bg-surface p-6">
        <SettingsForm initial={settings} />
      </div>
    </div>
  );
}
