export function RalphStatusIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-zinc-500" />
      <span className="text-xs text-zinc-400">Idle</span>
    </div>
  );
}
