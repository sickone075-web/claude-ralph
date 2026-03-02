import { Archive } from "lucide-react";

export default function ArchivesPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Archive className="h-5 w-5 text-zinc-400" />
        <h2 className="text-xl font-semibold">Archives</h2>
      </div>
      <p className="text-zinc-400">Archive browsing coming soon.</p>
    </div>
  );
}
