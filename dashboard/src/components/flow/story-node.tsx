"use client";

import { memo, useEffect, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Check, X, Loader2, Circle } from "lucide-react";
import type { StoryStatus } from "@/lib/types";

export interface StoryNodeData {
  storyId: string;
  title: string;
  status: StoryStatus;
  startedAt?: string;
  completedAt?: string;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function RunningTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(() =>
    Date.now() - new Date(startedAt).getTime()
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Date.now() - new Date(startedAt).getTime());
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <span className="text-xs text-cyan-400 tabular-nums">
      {formatDuration(elapsed)}
    </span>
  );
}

const statusConfig: Record<
  StoryStatus,
  { borderClass: string; icon: React.ReactNode; label: string }
> = {
  pending: {
    borderClass: "border-zinc-800",
    icon: <Circle className="h-4 w-4 text-zinc-500" />,
    label: "待处理",
  },
  running: {
    borderClass: "border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.3)]",
    icon: <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />,
    label: "执行中",
  },
  completed: {
    borderClass: "border-green-500",
    icon: <Check className="h-4 w-4 text-green-400" />,
    label: "已完成",
  },
  failed: {
    borderClass: "border-red-500",
    icon: <X className="h-4 w-4 text-red-400" />,
    label: "失败",
  },
};

function StoryNodeComponent({ data }: NodeProps & { data: StoryNodeData }) {
  const { storyId, title, status, startedAt, completedAt } = data;
  const config = statusConfig[status];

  const completedDuration =
    status === "completed" && startedAt && completedAt
      ? formatDuration(
          new Date(completedAt).getTime() - new Date(startedAt).getTime()
        )
      : null;

  return (
    <div
      className={`w-[280px] rounded-lg border bg-zinc-900 p-3 transition-colors ${config.borderClass} ${
        status === "running" ? "animate-pulse-glow" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-zinc-700 !bg-cyan-500"
      />

      {/* Header: ID + status icon */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-xs font-semibold text-cyan-400">
          {storyId}
        </span>
        <div className="flex items-center gap-1.5">
          {status === "running" && startedAt && (
            <RunningTimer startedAt={startedAt} />
          )}
          {completedDuration && (
            <span className="text-xs text-green-400 tabular-nums">
              {completedDuration}
            </span>
          )}
          {config.icon}
        </div>
      </div>

      {/* Title */}
      <p className="text-sm leading-snug text-zinc-200">{title}</p>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-zinc-700 !bg-cyan-500"
      />
    </div>
  );
}

export const StoryNode = memo(StoryNodeComponent);
