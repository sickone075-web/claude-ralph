"use client";

import { useCallback } from "react";
import {
  LayoutDashboard,
  GitBranch,
  CheckCircle2,
  Clock,
  ListTodo,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KanbanBoard } from "@/components/kanban-board";
import { useDashboardStore } from "@/lib/store";
import type { RalphStatus } from "@/lib/store";
import type { Story } from "@/lib/types";

const statusBadge: Record<RalphStatus, { className: string; label: string }> = {
  idle: { className: "bg-zinc-700 text-zinc-300", label: "Idle" },
  running: { className: "bg-green-900 text-green-300", label: "Running" },
  completed: { className: "bg-blue-900 text-blue-300", label: "Completed" },
  error: { className: "bg-red-900 text-red-300", label: "Error" },
};

function CircularProgress({ percent }: { percent: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-16 w-16">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-zinc-800"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-green-500 transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-200">
        {percent}%
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { prd, ralphStatus, iteration, totalIterations, setPrd } =
    useDashboardStore();

  const stories = prd?.userStories ?? [];
  const total = stories.length;
  const completedCount = stories.filter((s) => s.passes).length;
  const pendingCount = total - completedCount;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Determine which story Ralph is currently working on
  const currentStoryId =
    ralphStatus === "running"
      ? stories.find((s) => !s.passes)?.id ?? null
      : null;

  const handleUpdateStory = useCallback(
    async (updated: Partial<Story>) => {
      if (!updated.id) return;
      try {
        const res = await fetch(`/api/prd/stories/${updated.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        const json = await res.json();
        if (json.data && prd) {
          // Update local store immediately
          const updatedStories = prd.userStories.map((s) =>
            s.id === updated.id ? { ...s, ...updated } : s
          );
          setPrd({ ...prd, userStories: updatedStories });
        }
      } catch {
        // WebSocket prd:updated will sync eventually
      }
    },
    [prd, setPrd]
  );

  const badge = statusBadge[ralphStatus];

  return (
    <div className="p-6 space-y-6">
      {/* Info Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-5 w-5 text-zinc-400" />
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">
              {prd?.project ?? "Loading..."}
            </h1>
            {prd?.description && (
              <p className="text-sm text-zinc-500 mt-0.5 max-w-xl line-clamp-1">
                {prd.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {prd?.branchName && (
            <Badge
              variant="outline"
              className="font-mono text-xs border-zinc-700 text-zinc-400"
            >
              <GitBranch className="h-3 w-3 mr-1" />
              {prd.branchName}
            </Badge>
          )}
          <Badge className={badge.className}>
            {ralphStatus === "running" && totalIterations > 0
              ? `${badge.label} (${iteration}/${totalIterations})`
              : badge.label}
          </Badge>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex items-center gap-3 p-4">
            <ListTodo className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-2xl font-bold text-zinc-100">{total}</p>
              <p className="text-xs text-zinc-500">Total Stories</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-zinc-100">{completedCount}</p>
              <p className="text-xs text-zinc-500">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-zinc-100">{pendingCount}</p>
              <p className="text-xs text-zinc-500">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex items-center gap-3 p-4">
            <CircularProgress percent={percent} />
            <div>
              <p className="text-xs text-zinc-500">Completion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        stories={stories}
        currentStoryId={currentStoryId}
        ralphRunning={ralphStatus === "running"}
        onUpdateStory={handleUpdateStory}
      />
    </div>
  );
}
