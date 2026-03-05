#!/usr/bin/env node

// Auto-register Ralph skills into Claude Code on npm install.
// Never fails npm install — all errors caught with manual fallback instructions.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PKG_ROOT = resolve(__dirname, '..');

const PLUGIN_NAME = 'claude-ralph-agent';
const MARKETPLACE_KEY = `${PLUGIN_NAME}@ralph-marketplace`;
const NPM_KEY = `${PLUGIN_NAME}@npm`;

function readJSON(filePath) {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

try {
  const claudeDir = resolve(homedir(), '.claude');
  const pluginsDir = resolve(claudeDir, 'plugins');
  const installedFile = resolve(pluginsDir, 'installed_plugins.json');
  const settingsFile = resolve(claudeDir, 'settings.json');

  // Skip if marketplace version already installed and enabled
  const existingInstalled = readJSON(installedFile);
  const existingSettings = readJSON(settingsFile);
  if (
    existingInstalled?.plugins?.[MARKETPLACE_KEY] &&
    existingSettings?.enabledPlugins?.[MARKETPLACE_KEY]
  ) {
    console.log('\n  ✓ Ralph skills already registered (via marketplace)\n');
    process.exit(0);
  }

  // Ensure directories exist
  mkdirSync(pluginsDir, { recursive: true });

  // 1. Register in installed_plugins.json
  const installed = existingInstalled ?? { version: 2, plugins: {} };
  const pkg = readJSON(resolve(PKG_ROOT, 'package.json'));
  const now = new Date().toISOString();

  installed.plugins[NPM_KEY] = [{
    scope: 'user',
    installPath: PKG_ROOT,
    version: pkg.version,
    installedAt: now,
    lastUpdated: now,
  }];

  writeJSON(installedFile, installed);

  // 2. Enable in settings.json
  const settings = existingSettings ?? {};
  if (!settings.enabledPlugins) settings.enabledPlugins = {};
  settings.enabledPlugins[NPM_KEY] = true;

  writeJSON(settingsFile, settings);

  console.log('\n  ✓ Ralph skills registered to Claude Code');
  console.log('    /ralph:prd  /ralph:task  /ralph:init  /ralph:update  /ralph:start  /ralph:stop');
  console.log('    Restart Claude Code to activate.\n');
} catch {
  console.log('\n  Ralph skills auto-registration skipped.');
  console.log('  To register manually in Claude Code:');
  console.log('    /plugin marketplace add sickone075-web/claude-ralph-agent');
  console.log('    /plugin install claude-ralph-agent@ralph-marketplace\n');
}
