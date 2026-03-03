import fs from "fs";
import { getActiveProjectPaths } from "@/lib/config";
import type { PRD } from "@/lib/types";

let writeLock = false;

async function acquireLock(): Promise<void> {
  while (writeLock) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  writeLock = true;
}

function releaseLock(): void {
  writeLock = false;
}

function getPrdPath(): string {
  const paths = getActiveProjectPaths();
  if (!paths) {
    throw Object.assign(new Error("No active project configured"), { code: "ENOENT" });
  }
  return paths.prdPath;
}

export function readPrd(): PRD {
  const prdPath = getPrdPath();
  const raw = fs.readFileSync(prdPath, "utf-8");
  return JSON.parse(raw) as PRD;
}

export async function writePrd(prd: PRD): Promise<void> {
  const prdPath = getPrdPath();
  const tmpPath = prdPath + ".tmp";

  await acquireLock();
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(prd, null, 2) + "\n", "utf-8");
    fs.renameSync(tmpPath, prdPath);
  } finally {
    releaseLock();
  }
}

export function getNextStoryId(stories: PRD["userStories"]): string {
  let maxNum = 0;
  for (const story of stories) {
    const match = story.id.match(/^US-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return `US-${String(maxNum + 1).padStart(3, "0")}`;
}
