/**
 * Seed minimal demo media for Playwright / screenshot E2E (fast path).
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DEFAULT_FRAME_COUNT = 8;

function runFfmpeg(args) {
  execSync(`ffmpeg -y ${args}`, { stdio: 'pipe' });
}

/**
 * @param {{ framesDir: string, uploadsDir: string, projectsDir?: string, frameCount?: number }} opts
 * @returns {{ videoPath: string, projectVideo: string, framesDir: string, uploadsDir: string }}
 */
export function seedE2eMedia(opts) {
  const framesDir = path.resolve(opts.framesDir);
  const uploadsDir = path.resolve(opts.uploadsDir);
  const projectsDir = path.resolve(opts.projectsDir || path.join(uploadsDir, 'projects', 'demo-orbit'));
  const frameCount = Math.max(4, Number(opts.frameCount) || DEFAULT_FRAME_COUNT);

  fs.mkdirSync(framesDir, { recursive: true });
  fs.mkdirSync(projectsDir, { recursive: true });

  const videoPath = path.join(uploadsDir, 'preview_demo.mp4');
  const projectVideo = path.join(projectsDir, 'orbit-export.mp4');

  // One pass: short test pattern clip for LIVE preview + library handoff.
  runFfmpeg(
    `-f lavfi -i testsrc=size=960x540:rate=8:duration=${Math.max(1, frameCount / 8)} `
    + `-frames:v ${frameCount} -c:v libx264 -pix_fmt yuv420p -preset ultrafast -crf 28 `
    + `"${videoPath}"`,
  );

  // Extract numbered frames for /api/frames without N separate lavfi calls.
  runFfmpeg(
    `-i "${videoPath}" -frames:v ${frameCount} "${path.join(framesDir, 'frame_%05d.png')}"`,
  );

  runFfmpeg(
    `-i "${videoPath}" -frames:v 4 "${path.join(projectsDir, 'frame_%05d.png')}"`,
  );

  runFfmpeg(
    `-framerate 4 -i "${path.join(projectsDir, 'frame_%05d.png')}" -frames:v 4 `
    + `-c:v libx264 -pix_fmt yuv420p -preset ultrafast -crf 28 "${projectVideo}"`,
  );

  return { videoPath, projectVideo, framesDir, uploadsDir, projectsDir };
}
