"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Terminal, Play, Square, Loader2, Clock, Hash, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWebSocket, useRalphStatus } from "@/hooks/use-websocket";
import { useDashboardStore } from "@/lib/store";
import type { TerminalHandle } from "@/components/terminal-view";

const TerminalView = dynamic(() => import("@/components/terminal-view"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#1a1a2e]">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
    </div>
  ),
});

const WELCOME_MESSAGE = [
  "\x1b[1;35m  ____       _       _     \x1b[0m",
  "\x1b[1;35m |  _ \\ __ _| |_ __ | |__  \x1b[0m",
  "\x1b[1;35m | |_) / _` | | '_ \\| '_ \\ \x1b[0m",
  "\x1b[1;35m |  _ < (_| | | |_) | | | |\x1b[0m",
  "\x1b[1;35m |_| \\_\\__,_|_| .__/|_| |_|\x1b[0m",
  "\x1b[1;35m              |_|          \x1b[0m",
  "",
  "\x1b[1;37m  Autonomous AI Agent Loop\x1b[0m",
  "",
  "\x1b[90m  Ralph is not running. Use the controls above to start.\x1b[0m",
  "\x1b[90m  Select your AI tool and max iterations, then press Start.\x1b[0m",
  "",
].join("\r\n");

const STATUS_COLORS: Record<string, string> = {
  idle: "bg-zinc-500",
  running: "bg-green-500 animate-pulse",
  completed: "bg-blue-500",
  error: "bg-red-500",
};

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  idle: "secondary",
  running: "default",
  completed: "default",
  error: "destructive",
};

function formatElapsed(startedAt: string | null): string {
  if (!startedAt) return "00:00";
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function TerminalPage() {
  const termHandleRef = useRef<TerminalHandle | null>(null);
  const { status, iteration, totalIterations, startedAt } = useRalphStatus();
  const wsState = useDashboardStore((s) => s.wsState);
  const ws = useWebSocket();

  const [tool, setTool] = useState<"claude" | "amp">("claude");
  const [maxIterations, setMaxIterations] = useState("10");
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [elapsed, setElapsed] = useState("00:00");

  // Update elapsed timer every second when running
  useEffect(() => {
    if (status !== "running" || !startedAt) {
      setElapsed("00:00");
      return;
    }

    setElapsed(formatElapsed(startedAt));
    const interval = setInterval(() => {
      setElapsed(formatElapsed(startedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [status, startedAt]);

  // Subscribe to ralph:output and pipe to xterm
  useEffect(() => {
    const unsub = ws.subscribe("ralph:output", (payload: Record<string, unknown>) => {
      const text = payload.text as string;
      if (termHandleRef.current) {
        // Convert bare \n to \r\n for xterm
        termHandleRef.current.write(text.replace(/\r?\n/g, "\r\n"));
      }
    });

    return unsub;
  }, [ws]);

  const handleTerminalReady = useCallback((handle: TerminalHandle) => {
    termHandleRef.current = handle;
  }, []);

  // Handle keyboard input -> send to Ralph stdin via WebSocket
  const handleInput = useCallback(
    (data: string) => {
      if (status === "running") {
        ws.send("ralph:stdin", { input: data });
      }
    },
    [ws, status]
  );

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const res = await fetch("/api/ralph/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, maxIterations: parseInt(maxIterations, 10) }),
      });
      if (!res.ok) {
        const json = await res.json();
        termHandleRef.current?.write(
          `\r\n\x1b[31mError: ${json.error || "Failed to start Ralph"}\x1b[0m\r\n`
        );
      }
    } catch {
      // Network error
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    try {
      await fetch("/api/ralph/stop", { method: "POST" });
    } catch {
      // Network error
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-zinc-800 bg-zinc-950/50">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-zinc-400" />
          <h1 className="text-lg font-semibold text-zinc-100">Terminal</h1>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* WebSocket connection indicator */}
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            {wsState === "connected" ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
          </div>

          {/* Status badge */}
          <Badge variant={STATUS_BADGE_VARIANTS[status] ?? "secondary"} className="gap-1.5">
            <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[status] ?? "bg-zinc-500"}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>

          {/* Iteration */}
          {status === "running" && (
            <Badge variant="outline" className="gap-1">
              <Hash className="h-3 w-3" />
              {iteration}/{totalIterations}
            </Badge>
          )}

          {/* Elapsed time */}
          {status === "running" && (
            <Badge variant="outline" className="gap-1 tabular-nums">
              <Clock className="h-3 w-3" />
              {elapsed}
            </Badge>
          )}

          {/* Tool selector */}
          {status !== "running" && (
            <Select value={tool} onValueChange={(v) => setTool(v as "claude" | "amp")}>
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="amp">Amp</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Max iterations */}
          {status !== "running" && (
            <Select value={maxIterations} onValueChange={setMaxIterations}>
              <SelectTrigger className="w-[80px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 3, 5, 10, 15, 20].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} iter
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Start/Stop buttons */}
          {status === "running" ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStop}
              disabled={isStopping}
              className="gap-1"
            >
              {isStopping ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
              Stop
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleStart}
              disabled={isStarting}
              className="gap-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isStarting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              Start
            </Button>
          )}
        </div>
      </div>

      {/* Terminal area */}
      <div className="flex-1 min-h-0">
        <TerminalView
          onInput={handleInput}
          onReady={handleTerminalReady}
          welcomeMessage={status !== "running" ? WELCOME_MESSAGE : undefined}
        />
      </div>
    </div>
  );
}
