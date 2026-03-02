import { NextResponse } from "next/server";
import { getConfig, writeConfig, DEFAULTS } from "@/lib/config";
import type { DashboardConfig } from "@/lib/config";
import type { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const config = getConfig();
    return NextResponse.json({ data: config, error: null } satisfies ApiResponse<DashboardConfig>);
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to read config" } satisfies ApiResponse<DashboardConfig>,
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = writeConfig(body);
    return NextResponse.json({ data: config, error: null } satisfies ApiResponse<DashboardConfig>);
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to save config" } satisfies ApiResponse<DashboardConfig>,
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const config = writeConfig(DEFAULTS);
    return NextResponse.json({ data: config, error: null } satisfies ApiResponse<DashboardConfig>);
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to reset config" } satisfies ApiResponse<DashboardConfig>,
      { status: 500 }
    );
  }
}
