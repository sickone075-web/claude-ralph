import { NextResponse } from "next/server";
import { getConfig, writeConfig } from "@/lib/config";
import type { ApiResponse } from "@/lib/types";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    if (!name) {
      return NextResponse.json(
        { data: null, error: "name is required" } satisfies ApiResponse<null>,
        { status: 400 }
      );
    }

    const config = getConfig();
    const decodedName = decodeURIComponent(name);

    const idx = config.projects.findIndex((p) => p.name === decodedName);
    if (idx === -1) {
      return NextResponse.json(
        { data: null, error: `Project "${decodedName}" not found` } satisfies ApiResponse<null>,
        { status: 404 }
      );
    }

    config.projects.splice(idx, 1);

    if (config.activeProject === decodedName) {
      config.activeProject = config.projects.length > 0 ? config.projects[0].name : "";
    }

    writeConfig(config);

    return NextResponse.json({
      data: { projects: config.projects, activeProject: config.activeProject },
      error: null,
    } satisfies ApiResponse<{ projects: typeof config.projects; activeProject: string }>);
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to delete project" } satisfies ApiResponse<null>,
      { status: 500 }
    );
  }
}
