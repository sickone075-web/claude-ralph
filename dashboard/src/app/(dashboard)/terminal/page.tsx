import { Terminal } from "lucide-react";

export default function TerminalPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="h-5 w-5 text-zinc-400" />
        <h2 className="text-xl font-semibold">Terminal</h2>
      </div>
      <p className="text-zinc-400">Interactive terminal coming soon.</p>
    </div>
  );
}
