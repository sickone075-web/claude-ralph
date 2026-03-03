import { NextResponse } from "next/server";
import { getConfig, writeConfig } from "@/lib/config";
import type { ApiResponse } from "@/lib/types";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name } = body as { name?: string };

    if (!name) {
      return NextResponse.json(
        { data: null, error: "name is required" } satisfies ApiResponse<null>,
        { status: 400 }
      );
    }

    const config = getConfig();

    if (!config.projects.some((p) => p.name === name)) {
      return NextResponse.json(
        { data: null, error: `Project "${name}" not found` } satisfies ApiResponse<null>,
        { status: 404 }
      );
    }

    config.activeProject = name;
    writeConfig(config);

    return NextResponse.json({
      data: { activeProject: config.activeProject },
      error: null,
    } satisfies ApiResponse<{ activeProject: string }>);
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to switch project" } satisfies ApiResponse<null>,
      { status: 500 }
    );
  }
}
