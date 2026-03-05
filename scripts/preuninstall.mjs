#!/usr/bin/env node

// Clean up Claude Code plugin registration on npm uninstall.
// Never fails npm uninstall — all errors silently caught.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { homedir } from 'node:os';

const NPM_KEY = 'claude-ralph-agent@npm';

function readJSON(filePath) {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

try {
  const claudeDir = resolve(homedir(), '.claude');
  const installedFile = resolve(claudeDir, 'plugins', 'installed_plugins.json');
  const settingsFile = resolve(claudeDir, 'settings.json');

  // Remove from installed_plugins.json
  const installed = readJSON(installedFile);
  if (installed?.plugins?.[NPM_KEY]) {
    delete installed.plugins[NPM_KEY];
    writeJSON(installedFile, installed);
  }

  // Remove from settings.json enabledPlugins
  const settings = readJSON(settingsFile);
  if (settings?.enabledPlugins?.[NPM_KEY]) {
    delete settings.enabledPlugins[NPM_KEY];
    writeJSON(settingsFile, settings);
  }

  console.log('\n  ✓ Ralph skills unregistered from Claude Code\n');
} catch {
  // Silent — never block npm uninstall
}
