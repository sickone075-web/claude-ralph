import { NextResponse } from "next/server";
import { stopRalph, isRunning } from "@/lib/ralph-process";
import type { ApiResponse } from "@/lib/types";

export async function POST() {
  try {
    if (!isRunning()) {
      return NextResponse.json(
        { data: null, error: "Ralph is not running" } satisfies ApiResponse<null>,
        { status: 400 }
      );
    }

    stopRalph();

    return NextResponse.json({
      data: { status: "stopped" },
      error: null,
    } satisfies ApiResponse<{ status: string }>);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to stop Ralph";
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    );
  }
}
