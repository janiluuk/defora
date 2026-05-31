#!/usr/bin/env node
/**
 * Build upstream FreeCut and install into public/freecut/ for /freecut/ static serving.
 *
 * Usage:
 *   cd docker/web && npm run install:freecut
 *   npm run install:freecut -- --force
 *   FREECUT_REF=main npm run install:freecut
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, '..');
const targetDir = path.join(webRoot, 'public', 'freecut');
const vendorDir = path.join(webRoot, 'vendor', 'freecut-src');

const FREECUT_REPO = process.env.FREECUT_REPO || 'https://github.com/walterlow/freecut.git';
const FREECUT_REF = process.env.FREECUT_REF || 'main';
const FREECUT_BASE = process.env.FREECUT_BASE || '/freecut/';

const force = process.argv.includes('--force');
const skipIfPresent = process.argv.includes('--skip-if-present');

function log(msg) {
  console.log(`[install-freecut] ${msg}`);
}

function run(cmd, opts = {}) {
  log(cmd);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function rmDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

const targetIndex = path.join(targetDir, 'index.html');
if (skipIfPresent && fs.existsSync(targetIndex) && !force) {
  log(`skip — ${path.relative(webRoot, targetDir)} already installed (use --force to rebuild)`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(vendorDir), { recursive: true });
if (!fs.existsSync(path.join(vendorDir, '.git'))) {
  run(`git clone --depth 1 ${FREECUT_REPO} "${vendorDir}"`, { cwd: webRoot });
}
run(`git fetch origin ${FREECUT_REF} --depth 1`, { cwd: vendorDir });
run(`git checkout ${FREECUT_REF}`, { cwd: vendorDir });

run('npm ci', { cwd: vendorDir, env: { ...process.env, CI: 'true' } });

const vpBin = path.join(vendorDir, 'node_modules', '.bin', 'vp');
if (!fs.existsSync(vpBin)) {
  console.error('[install-freecut] vite-plus CLI missing after npm ci');
  process.exit(1);
}

run(`"${vpBin}" build --base ${FREECUT_BASE}`, { cwd: vendorDir, shell: true });

const distDir = path.join(vendorDir, 'dist');
if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('[install-freecut] build did not produce dist/index.html');
  process.exit(1);
}

log(`installing to ${path.relative(webRoot, targetDir)}`);
rmDir(targetDir);
copyDir(distDir, targetDir);
log('done — restart npm run dev:server, then Library → Open in editor');
