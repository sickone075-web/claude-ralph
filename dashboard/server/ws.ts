import { WebSocketServer, WebSocket } from "ws";
import { watch, FSWatcher } from "chokidar";
import path from "path";
import { onEvent, sendStdin } from "../src/lib/ralph-process";
import { getActiveProjectPaths } from "../src/lib/config";

const PORT = 3001;

const wss = new WebSocketServer({ port: PORT });

function broadcast(type: string, payload: object) {
  const message = JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString(),
  });

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Subscribe to Ralph process events and broadcast to all WebSocket clients
onEvent((event: string, data: unknown) => {
  broadcast(event, data as object);
});

// Watch prd.json and progress.txt for changes based on active project
let debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
let currentWatcher: FSWatcher | null = null;
let currentPrdPath: string | null = null;

function setupFileWatcher() {
  // Clean up previous watcher
  if (currentWatcher) {
    currentWatcher.close();
    currentWatcher = null;
    currentPrdPath = null;
  }

  const projectPaths = getActiveProjectPaths();
  if (!projectPaths) {
    console.log("[WS] No active project configured, file watching disabled");
    return;
  }

  const filesToWatch = [projectPaths.prdPath, projectPaths.progressPath];
  currentPrdPath = projectPaths.prdPath;

  currentWatcher = watch(filesToWatch, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  });

  currentWatcher.on("change", (filePath: string) => {
    const normalized = path.resolve(filePath);
    const eventType = currentPrdPath && normalized === path.resolve(currentPrdPath)
      ? "prd:updated"
      : "progress:updated";

    // Debounce 500ms per file
    if (debounceTimers[normalized]) {
      clearTimeout(debounceTimers[normalized]);
    }

    debounceTimers[normalized] = setTimeout(() => {
      broadcast(eventType, { file: normalized });
      delete debounceTimers[normalized];
    }, 500);
  });

  console.log("[WS] Watching files:", filesToWatch);
}

setupFileWatcher();

// Handle incoming WebSocket connections
wss.on("connection", (ws: WebSocket) => {
  console.log("[WS] Client connected");

  ws.on("message", (raw: Buffer) => {
    try {
      const message = JSON.parse(raw.toString());

      if (message.type === "ralph:stdin" && typeof message.payload?.input === "string") {
        try {
          sendStdin(message.payload.input);
        } catch (err) {
          ws.send(
            JSON.stringify({
              type: "error",
              payload: { message: (err as Error).message },
              timestamp: new Date().toISOString(),
            })
          );
        }
      }
    } catch {
      // Ignore malformed messages
    }
  });

  ws.on("close", () => {
    console.log("[WS] Client disconnected");
  });
});

console.log(`[WS] WebSocket server running on ws://localhost:${PORT}`);
