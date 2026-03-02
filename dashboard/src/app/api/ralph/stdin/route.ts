import { NextResponse } from "next/server";
import { sendStdin, isRunning } from "@/lib/ralph-process";
import type { ApiResponse } from "@/lib/types";

export async function POST(request: Request) {
  try {
    if (!isRunning()) {
      return NextResponse.json(
        { data: null, error: "Ralph is not running" } satisfies ApiResponse<null>,
        { status: 400 }
      );
    }

    const body = await request.json();
    if (typeof body.input !== "string") {
      return NextResponse.json(
        { data: null, error: "input is required and must be a string" } satisfies ApiResponse<null>,
        { status: 400 }
      );
    }

    sendStdin(body.input);

    return NextResponse.json({
      data: { sent: true },
      error: null,
    } satisfies ApiResponse<{ sent: boolean }>);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send input";
    return NextResponse.json(
      { data: null, error: message } satisfies ApiResponse<null>,
      { status: 500 }
    );
  }
}
