"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Check, Circle } from "lucide-react";

export interface EndNodeData {
  completedCount: number;
  totalCount: number;
  firstStartedAt?: string;
  lastCompletedAt?: string;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return `${hours}h ${remainMinutes}m`;
}

function EndNodeComponent({ data }: NodeProps & { data: EndNodeData }) {
  const { completedCount, totalCount, firstStartedAt, lastCompletedAt } = data;
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const remaining = totalCount - completedCount;

  const totalDuration =
    allCompleted && firstStartedAt && lastCompletedAt
      ? formatDuration(
          new Date(lastCompletedAt).getTime() -
            new Date(firstStartedAt).getTime()
        )
      : null;

  return (
    <div
      className={`w-[280px] rounded-xl border p-4 text-center ${
        allCompleted
          ? "border-green-500 bg-zinc-900"
          : "border-dashed border-zinc-700 bg-zinc-900/60"
      }`}
    >
      {/* Connection handles - all directions */}
      <Handle type="target" position={Position.Top} id="top" className="!h-2 !w-2 !border-zinc-700 !bg-cyan-500" />
      <Handle type="target" position={Position.Left} id="left-target" className="!h-2 !w-2 !border-zinc-700 !bg-cyan-500" />
      <Handle type="target" position={Position.Right} id="right-target" className="!h-2 !w-2 !border-zinc-700 !bg-cyan-500" />

      {allCompleted ? (
        <>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
            <Check className="h-5 w-5 text-green-400" />
          </div>
          <p className="text-sm font-semibold text-green-400">全部完成</p>
          {totalDuration && (
            <p className="mt-1 text-xs text-zinc-500">
              总耗时 {totalDuration}
            </p>
          )}
        </>
      ) : (
        <>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
            <Circle className="h-5 w-5 text-zinc-600" />
          </div>
          <p className="text-sm font-medium text-zinc-500">待完成</p>
          <p className="mt-1 text-xs text-zinc-600">
            剩余 {remaining} 个 Story
          </p>
        </>
      )}
    </div>
  );
}

export const EndNode = memo(EndNodeComponent);
