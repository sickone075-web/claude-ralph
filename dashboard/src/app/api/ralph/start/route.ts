import { NextResponse } from "next/server";
import { startRalph } from "@/lib/ralph-process";
import type { ApiResponse } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tool = body.tool === "claude" ? "claude" : "amp";
    const maxIterations =
      typeof body.maxIterations === "number" && body.maxIterations > 0
        ? body.maxIterations
        : 10;

    startRalph({ tool, maxIterations });

    return NextResponse.json({
      data: { status: "running", tool, maxIterations },
      error: null,
    } satisfies ApiResponse<{ status: string; tool: string; maxIterations: number }>);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start Ralph";
    if (message === "Ralph is already running") {
      return NextResponse.json(
        { data: null, error: message } satisfies ApiResponse<null>,
        { status: 409 }
      );
    }
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    );
  }
}
