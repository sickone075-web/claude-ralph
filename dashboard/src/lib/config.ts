import path from "path";
import fs from "fs";

export interface DashboardConfig {
  prdPath: string;
  progressPath: string;
  ralphScriptPath: string;
  defaultTool: "claude" | "amp";
  defaultMaxIterations: number;
  terminalFontSize: number;
}

export const CONFIG_FILE = path.join(process.cwd(), "config.json");

export const DEFAULTS: DashboardConfig = {
  prdPath: path.resolve(process.cwd(), "..", "scripts", "ralph", "prd.json"),
  progressPath: path.resolve(process.cwd(), "..", "scripts", "ralph", "progress.txt"),
  ralphScriptPath: path.resolve(process.cwd(), "..", "scripts", "ralph", "ralph.sh"),
  defaultTool: "claude",
  defaultMaxIterations: 10,
  terminalFontSize: 14,
};

export function getConfig(): DashboardConfig {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DashboardConfig>;
    return {
      prdPath: parsed.prdPath ? path.resolve(parsed.prdPath) : DEFAULTS.prdPath,
      progressPath: parsed.progressPath ? path.resolve(parsed.progressPath) : DEFAULTS.progressPath,
      ralphScriptPath: parsed.ralphScriptPath ? path.resolve(parsed.ralphScriptPath) : DEFAULTS.ralphScriptPath,
      defaultTool: parsed.defaultTool === "amp" ? "amp" : DEFAULTS.defaultTool,
      defaultMaxIterations: typeof parsed.defaultMaxIterations === "number" && parsed.defaultMaxIterations > 0
        ? parsed.defaultMaxIterations
        : DEFAULTS.defaultMaxIterations,
      terminalFontSize: typeof parsed.terminalFontSize === "number" && parsed.terminalFontSize >= 12 && parsed.terminalFontSize <= 24
        ? parsed.terminalFontSize
        : DEFAULTS.terminalFontSize,
    };
  } catch {
    return DEFAULTS;
  }
}

export function writeConfig(config: Partial<DashboardConfig>): DashboardConfig {
  const current = getConfig();
  const merged: DashboardConfig = {
    ...current,
    ...config,
  };
  const tmpFile = CONFIG_FILE + ".tmp";
  fs.writeFileSync(tmpFile, JSON.stringify(merged, null, 2), "utf-8");
  fs.renameSync(tmpFile, CONFIG_FILE);
  return merged;
}
