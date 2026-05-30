#!/usr/bin/env node
/**
 * Seed sample folders and media for local Library browsing.
 * Respects RUNS_DIR, FRAMES_DIR, UPLOADS_DIR, VIDEOSWARM_DIR (see modules/storage-paths.js).
 *
 * Usage: cd docker/web && npm run seed-library
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { resolveStoragePaths } = require('../modules/storage-paths.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, '..');
const storage = resolveStoragePaths({ webRoot }, process.env);

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
  'base64',
);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeTinyPng(filePath, label = 'seed') {
  ensureDir(path.dirname(filePath));
  if (fs.existsSync(filePath)) return;
  fs.writeFileSync(filePath, TINY_PNG);
  console.log('  png', path.relative(webRoot, filePath), `(${label})`);
}

function writeReadme(dir, text) {
  ensureDir(dir);
  const readme = path.join(dir, 'README.txt');
  fs.writeFileSync(readme, `${text.trim()}\n`, 'utf8');
  console.log('  readme', path.relative(webRoot, readme));
}

function makeColorMp4(outPath, color, label) {
  ensureDir(path.dirname(outPath));
  if (fs.existsSync(outPath)) {
    console.log('  skip (exists)', path.relative(webRoot, outPath));
    return;
  }
  execSync(
    `ffmpeg -y -f lavfi -i color=c=${color}:size=640x360:d=2 -frames:v 24 -c:v libx264 -pix_fmt yuv420p -preset ultrafast -crf 28 "${outPath}"`,
    { stdio: 'pipe' },
  );
  console.log('  mp4', path.relative(webRoot, outPath), `(${label})`);
}

const { runsDir, framesDir, uploadsDir, videoswarmDir } = storage;

console.log('Seeding library for user', process.env.USER || process.env.LOGNAME || 'local');
console.log('  runs:     ', runsDir);
console.log('  uploads:  ', uploadsDir);
console.log('  frames:   ', framesDir);
console.log('  videoswarm:', videoswarmDir);

function removeIfExists(p) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log('  removed', path.relative(webRoot, p));
  }
}

// Drop legacy top-level layout so Uploads root shows 1 folder + 1 video.
removeIfExists(path.join(uploadsDir, 'converted'));
try {
  fs.unlinkSync(path.join(uploadsDir, 'preview_seed_example.png'));
} catch (_e) {}

// ── Uploads: default Library view = 1 folder + 1 video at root ─────────────
const clipsDir = path.join(uploadsDir, 'clips');
writeReadme(clipsDir, 'User clip folder — drop MP4/WebM here or use Library → + Video.');
makeColorMp4(path.join(clipsDir, 'clip-orbit.mp4'), 'orange', 'clip A');
makeColorMp4(path.join(clipsDir, 'clip-tunnel.mp4'), 'purple', 'clip B');

// Top-level preview video (Library → Uploads default grid)
makeColorMp4(path.join(uploadsDir, 'demo-preview.mp4'), 'teal', 'uploads root preview');

// Nested converted outputs (not shown at uploads root)
const convertedDir = path.join(clipsDir, 'converted');
writeReadme(
  convertedDir,
  `Converted outputs (Library → Uploads → clips → converted)

- img2img / txt2img: preview_*.png (also served at /uploads/…)
- Stage recording: defora_rec_<timestamp>.mp4 after header Record → stop
- Demo test run video: demo-output.mp4 (from RUNS → Launch test run)`,
);
writeTinyPng(path.join(convertedDir, 'img2img-example.png'), 'img2img sample');
makeColorMp4(path.join(convertedDir, 'demo-recording.mp4'), 'teal', 'recording sample');

// ── Frames: live Deforum preview PNGs ──────────────────────────────────────
writeReadme(
  framesDir,
  `Live preview frames (Library → Frames)

Written by Forge/Deforum as frame_00000.png, frame_00001.png, …
Shown on LIVE layer bar and RUNS → Frames rail.`,
);
for (let i = 0; i < 8; i++) {
  writeTinyPng(path.join(framesDir, `frame_${String(i).padStart(5, '0')}.png`), `frame ${i}`);
}

// ── Runs: per-job folders ───────────────────────────────────────────────────
const demoRunId = 'demo-run-seed';
const demoRunDir = path.join(runsDir, demoRunId);
ensureDir(demoRunDir);
const demoRunJson = {
  run_id: demoRunId,
  status: 'completed',
  started_at: new Date().toISOString(),
  model: 'seed-model.safetensors',
  frame_count: 24,
  tag: 'library-seed',
  prompt_positive: 'seed run for library browser demo',
  notes: 'Created by npm run seed-library',
};
const demoRunPath = path.join(demoRunDir, 'run.json');
if (!fs.existsSync(demoRunPath)) {
  fs.writeFileSync(demoRunPath, JSON.stringify(demoRunJson, null, 2));
  console.log('  json', path.relative(webRoot, demoRunPath));
}
makeColorMp4(path.join(demoRunDir, 'demo-output.mp4'), 'cyan', 'run export');

// ── VideoSwarm staging ─────────────────────────────────────────────────────
const exportsDir = path.join(videoswarmDir, 'exports');
writeReadme(exportsDir, 'VideoSwarm exports — trim/editor output and manual staging.');
makeColorMp4(path.join(exportsDir, 'export-sample.mp4'), 'green', 'videoswarm export');

console.log('\nDone. Open Library tab and browse Uploads (default):');
console.log('  Uploads (root)           — demo-preview.mp4 + clips/ folder');
console.log('  Uploads → clips/         — sample user clips');
console.log('  Uploads → clips/converted/ — img2img, recordings');
console.log('  Frames                 — live frame_*.png strip');
console.log('  Runs → demo-run-seed/  — completed run + demo-output.mp4');
console.log('  VideoSwarm → exports/  — editor/export staging');
