#!/usr/bin/env node
/**
 * Start the web API with repo-local storage paths (not /tmp/defora-*).
 * Usage: cd docker/web && npm run dev:server
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const webRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const freecutIndex = path.join(webRoot, 'public', 'freecut', 'index.html');
if (!fs.existsSync(freecutIndex)) {
  console.warn('[web] FreeCut bundle missing — video editor unavailable until you run: npm run install:freecut');
}

const env = {
  ...process.env,
  PORT: process.env.PORT || '3999',
  FRAMES_DIR: process.env.FRAMES_DIR || path.join(webRoot, 'frames'),
  HLS_DIR: process.env.HLS_DIR || path.join(webRoot, 'hls'),
  RUNS_DIR: process.env.RUNS_DIR || path.join(webRoot, 'runs'),
  UPLOADS_DIR: process.env.UPLOADS_DIR || path.join(webRoot, 'runs', 'uploads'),
  VIDEOSWARM_DIR: process.env.VIDEOSWARM_DIR || path.join(webRoot, 'runs', 'videoswarm'),
};

console.log('Starting defora web server with local storage:');
console.log('  PORT:      ', env.PORT);
console.log('  FRAMES_DIR:', env.FRAMES_DIR);
console.log('  RUNS_DIR:  ', env.RUNS_DIR);
console.log('  UPLOADS:   ', env.UPLOADS_DIR);

const child = spawn('node', ['server.js'], {
  cwd: webRoot,
  env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
