import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-zinc-400" />
        <h2 className="text-xl font-semibold">Settings</h2>
      </div>
      <p className="text-zinc-400">Configuration settings coming soon.</p>
    </div>
  );
}
