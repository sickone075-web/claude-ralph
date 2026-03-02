import { ScrollText } from "lucide-react";

export default function LogsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText className="h-5 w-5 text-zinc-400" />
        <h2 className="text-xl font-semibold">Logs</h2>
      </div>
      <p className="text-zinc-400">Iteration logs coming soon.</p>
    </div>
  );
}
