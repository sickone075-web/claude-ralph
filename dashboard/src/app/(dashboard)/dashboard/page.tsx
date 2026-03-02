import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <LayoutDashboard className="h-5 w-5 text-zinc-400" />
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </div>
      <p className="text-zinc-400">Kanban overview coming soon.</p>
    </div>
  );
}
