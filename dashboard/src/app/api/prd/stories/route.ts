import { NextResponse } from "next/server";
import fs from "fs";
import { getConfig } from "@/lib/config";
import type { Story, ApiResponse } from "@/lib/types";

export async function GET() {
  const config = getConfig();

  try {
    const raw = fs.readFileSync(config.prdPath, "utf-8");
    const prd = JSON.parse(raw);
    const stories: Story[] = prd.userStories ?? [];
    return NextResponse.json({ data: stories, error: null } satisfies ApiResponse<Story[]>);
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json(
        { data: null, error: "PRD file not found" } satisfies ApiResponse<Story[]>,
        { status: 404 }
      );
    }
    return NextResponse.json(
      { data: null, error: "Failed to read PRD file" } satisfies ApiResponse<Story[]>,
      { status: 500 }
    );
  }
}
