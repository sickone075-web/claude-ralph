"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RalphStatus } from "@/lib/store";

export interface StartNodeData {
  projectName: string;
  description: string;
  completedCount: number;
  totalCount: number;
  ralphStatus: RalphStatus;
  branchName?: string;
  iteration?: number;
  totalIterations?: number;
}

const statusBadge: Record<RalphStatus, { className: string; label: string }> = {
  idle: { className: "bg-zinc-700 text-zinc-300", label: "空闲" },
  running: {
    className: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
    label: "运行中",
  },
  completed: { className: "bg-blue-900 text-blue-300", label: "已完成" },
  error: { className: "bg-red-900 text-red-300", label: "错误" },
};

function CircularProgress({ percent }: { percent: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-12 w-12">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
        <defs>
          <linearGradient
            id="startNodeProgressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-zinc-800"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="url(#startNodeProgressGradient)"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-200">
        {percent}%
      </span>
    </div>
  );
}

function StartNodeComponent({ data }: NodeProps & { data: StartNodeData }) {
  const {
    projectName,
    description,
    completedCount,
    totalCount,
    ralphStatus,
    branchName,
    iteration,
    totalIterations,
  } = data;

  const percent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const badge = statusBadge[ralphStatus];

  return (
    <div className="w-[320px] rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-lg">
      {/* Top gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl bg-gradient-to-r from-cyan-500 to-blue-500" />

      {/* Header: status badge */}
      <div className="mb-3 flex items-center justify-between">
        <Badge className={badge.className}>
          {ralphStatus === "running" &&
          totalIterations != null &&
          totalIterations > 0
            ? `${badge.label} (${iteration ?? 0}/${totalIterations})`
            : badge.label}
        </Badge>
      </div>

      {/* Project name & description */}
      <h3 className="mb-1 text-base font-bold text-zinc-100">{projectName}</h3>
      {description && (
        <p className="mb-3 line-clamp-2 text-xs text-zinc-500">{description}</p>
      )}

      {/* Progress section */}
      <div className="flex items-center gap-3">
        <CircularProgress percent={percent} />
        <div>
          <p className="text-sm font-medium text-zinc-300">
            {completedCount} / {totalCount} 完成
          </p>
          <p className="text-xs text-zinc-500">整体进度</p>
        </div>
      </div>

      {/* Branch name */}
      {branchName && (
        <div className="mt-3 flex items-center gap-1.5 rounded-md bg-zinc-800/60 px-2 py-1">
          <GitBranch className="h-3 w-3 text-zinc-500" />
          <span className="truncate font-mono text-xs text-zinc-400">
            {branchName}
          </span>
        </div>
      )}

      {/* Connection handles - all directions */}
      <Handle type="source" position={Position.Bottom} id="bottom" className="!h-2 !w-2 !border-zinc-700 !bg-cyan-500" />
      <Handle type="source" position={Position.Right} id="right" className="!h-2 !w-2 !border-zinc-700 !bg-cyan-500" />
      <Handle type="source" position={Position.Left} id="left" className="!h-2 !w-2 !border-zinc-700 !bg-cyan-500" />
    </div>
  );
}

export const StartNode = memo(StartNodeComponent);
