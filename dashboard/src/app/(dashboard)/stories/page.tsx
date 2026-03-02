import { BookOpen } from "lucide-react";

export default function StoriesPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-zinc-400" />
        <h2 className="text-xl font-semibold">User Stories</h2>
      </div>
      <p className="text-zinc-400">Story management coming soon.</p>
    </div>
  );
}
