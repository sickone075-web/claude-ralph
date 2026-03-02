import { NextResponse } from "next/server";
import fs from "fs";
import { getConfig } from "@/lib/config";
import type { PRD, ApiResponse } from "@/lib/types";

export async function GET() {
  const config = getConfig();

  try {
    const raw = fs.readFileSync(config.prdPath, "utf-8");
    const prd: PRD = JSON.parse(raw);
    return NextResponse.json({ data: prd, error: null } satisfies ApiResponse<PRD>);
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json(
        { data: null, error: "PRD file not found" } satisfies ApiResponse<PRD>,
        { status: 404 }
      );
    }
    return NextResponse.json(
      { data: null, error: "Failed to read PRD file" } satisfies ApiResponse<PRD>,
      { status: 500 }
    );
  }
}
