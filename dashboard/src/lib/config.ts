import path from "path";
import fs from "fs";

interface DashboardConfig {
  prdPath: string;
  progressPath: string;
  ralphScriptPath: string;
}

const CONFIG_FILE = path.join(process.cwd(), "config.json");

const DEFAULTS: DashboardConfig = {
  prdPath: path.resolve(process.cwd(), "..", "scripts", "ralph", "prd.json"),
  progressPath: path.resolve(process.cwd(), "..", "scripts", "ralph", "progress.txt"),
  ralphScriptPath: path.resolve(process.cwd(), "..", "scripts", "ralph", "ralph.sh"),
};

export function getConfig(): DashboardConfig {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DashboardConfig>;
    return {
      prdPath: parsed.prdPath ? path.resolve(parsed.prdPath) : DEFAULTS.prdPath,
      progressPath: parsed.progressPath ? path.resolve(parsed.progressPath) : DEFAULTS.progressPath,
      ralphScriptPath: parsed.ralphScriptPath ? path.resolve(parsed.ralphScriptPath) : DEFAULTS.ralphScriptPath,
    };
  } catch {
    return DEFAULTS;
  }
}
