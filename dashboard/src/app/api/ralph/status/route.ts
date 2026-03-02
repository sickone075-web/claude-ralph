import { NextResponse } from "next/server";
import { getRalphStatus } from "@/lib/ralph-process";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  const status = getRalphStatus();
  return NextResponse.json({
    data: status,
    error: null,
  } satisfies ApiResponse<typeof status>);
}
