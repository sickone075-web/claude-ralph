#!/usr/bin/env node
/**
 * prepare-standalone script: replace the standalone package.json with a
 * minimal one that only lists runtime dependencies needed by the Next.js
 * production server. This keeps `npm install` in postinstall fast and light.
 */
const fs = require('fs');
const path = require('path');

const standaloneDir = path.join(__dirname, '..', 'dashboard', '.next', 'standalone');
const pkgPath = path.join(standaloneDir, 'package.json');

if (!fs.existsSync(standaloneDir)) {
  console.error('Standalone directory not found. Run `next build` first.');
  process.exit(1);
}

// Read the full dashboard package.json to extract exact versions
const dashPkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'dashboard', 'package.json'), 'utf-8')
);

// Only keep deps that the standalone server actually needs
const runtimeDeps = ['next', 'react', 'react-dom'];
const deps = {};
for (const dep of runtimeDeps) {
  if (dashPkg.dependencies[dep]) {
    deps[dep] = dashPkg.dependencies[dep];
  }
}

const minimalPkg = {
  name: 'ralph-dashboard-standalone',
  version: dashPkg.version || '0.0.0',
  private: true,
  dependencies: deps,
};

fs.writeFileSync(pkgPath, JSON.stringify(minimalPkg, null, 2) + '\n');
console.log('[ralph] Standalone package.json prepared with deps:', Object.keys(deps).join(', '));

// Fix hardcoded absolute paths in server.js so it works on any machine
const serverJsPath = path.join(standaloneDir, 'server.js');
if (fs.existsSync(serverJsPath)) {
  let serverJs = fs.readFileSync(serverJsPath, 'utf-8');
  // Replace hardcoded outputFileTracingRoot with a __dirname-relative value
  serverJs = serverJs.replace(
    /"outputFileTracingRoot":"[^"]+"/g,
    '"outputFileTracingRoot":"."'
  );
  // Replace hardcoded turbopack.root
  serverJs = serverJs.replace(
    /"root":"[^"]+?dashboard"/g,
    '"root":"."'
  );
  // Replace hardcoded tailwindcss resolve alias path
  serverJs = serverJs.replace(
    /"tailwindcss":"[^"]+?node_modules[\\/]+tailwindcss"/g,
    '"tailwindcss":"tailwindcss"'
  );
  fs.writeFileSync(serverJsPath, serverJs);
  console.log('[ralph] Standalone server.js: hardcoded paths fixed.');
}

// Copy .next/static/ and public/ into standalone directory
// Next.js standalone mode requires these to be present alongside server.js
const dashboardDir = path.join(__dirname, '..', 'dashboard');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const staticSrc = path.join(dashboardDir, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
copyDirSync(staticSrc, staticDest);
console.log('[ralph] Copied .next/static/ into standalone.');

const publicSrc = path.join(dashboardDir, 'public');
const publicDest = path.join(standaloneDir, 'public');
copyDirSync(publicSrc, publicDest);
console.log('[ralph] Copied public/ into standalone.');
