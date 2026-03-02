import { NextResponse } from "next/server";
import fs from "fs";
import { getConfig } from "@/lib/config";
import type { Story, ApiResponse } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const config = getConfig();

  try {
    const raw = fs.readFileSync(config.prdPath, "utf-8");
    const prd = JSON.parse(raw);
    const stories: Story[] = prd.userStories ?? [];
    const story = stories.find((s) => s.id === id);

    if (!story) {
      return NextResponse.json(
        { data: null, error: `Story '${id}' not found` } satisfies ApiResponse<Story>,
        { status: 404 }
      );
    }

    return NextResponse.json({ data: story, error: null } satisfies ApiResponse<Story>);
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json(
        { data: null, error: "PRD file not found" } satisfies ApiResponse<Story>,
        { status: 404 }
      );
    }
    return NextResponse.json(
      { data: null, error: "Failed to read PRD file" } satisfies ApiResponse<Story>,
      { status: 500 }
    );
  }
}
