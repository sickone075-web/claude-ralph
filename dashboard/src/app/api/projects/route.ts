import { NextResponse } from "next/server";
import fs from "fs";
import { getConfig, writeConfig } from "@/lib/config";
import type { ApiResponse } from "@/lib/types";
import type { ProjectConfig } from "@/lib/config";

export async function GET() {
  const config = getConfig();
  return NextResponse.json({
    data: { projects: config.projects, activeProject: config.activeProject },
    error: null,
  } satisfies ApiResponse<{ projects: ProjectConfig[]; activeProject: string }>);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, path } = body as { name?: string; path?: string };

    if (!name || !path) {
      return NextResponse.json(
        { data: null, error: "name and path are required" } satisfies ApiResponse<null>,
        { status: 400 }
      );
    }

    if (!fs.existsSync(path)) {
      return NextResponse.json(
        { data: null, error: `Path does not exist: ${path}` } satisfies ApiResponse<null>,
        { status: 400 }
      );
    }

    const config = getConfig();

    if (config.projects.some((p) => p.name === name)) {
      return NextResponse.json(
        { data: null, error: `Project "${name}" already exists` } satisfies ApiResponse<null>,
        { status: 409 }
      );
    }

    config.projects.push({ name, path });
    if (!config.activeProject) {
      config.activeProject = name;
    }
    writeConfig(config);

    return NextResponse.json({
      data: { projects: config.projects, activeProject: config.activeProject },
      error: null,
    } satisfies ApiResponse<{ projects: ProjectConfig[]; activeProject: string }>);
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to add project" } satisfies ApiResponse<null>,
      { status: 500 }
    );
  }
}
