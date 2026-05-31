/**
 * Visual E2E: seed a completed run with a real MP4,
 * screenshot the runs detail (video player), and the editor handoff.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';
import { chromium } from '../node_modules/playwright/index.mjs';
import { start } from '../server.js';
import { openRunsMonitor, waitForNavTabs, waitForPastRunRow } from './playwright-nav.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-verify-'));
const runsDir = path.join(tmp, 'runs');
const framesDir = path.join(tmp, 'frames');
const uploadsDir = path.join(tmp, 'uploads');
fs.mkdirSync(runsDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

// Create a real sea-animation MP4 in a completed run
const runId = 'sea-test-run';
const runDir = path.join(runsDir, runId);
fs.mkdirSync(runDir, { recursive: true });

console.log('Generating sea video for run…');
const videoPath = path.join(runDir, 'sea-output.mp4');
execSync(`ffmpeg -y -f lavfi \
  -i "color=0x06101e:size=960x540:rate=24,geq=\
r='clip(30+40*sin(2*PI*(X/W*3+T*0.4))*sin(2*PI*(Y/H*2+T*0.25)),0,255)':\
g='clip(80+60*sin(2*PI*(X/W*2+T*0.35))*cos(2*PI*(Y/H*1.5+T*0.2)),0,255)':\
b='clip(140+80*cos(2*PI*(X/W+Y/H*0.5+T*0.3)),0,255)'" \
  -t 4 -c:v libx264 -pix_fmt yuv420p -preset ultrafast -crf 22 "${videoPath}"`,
  { stdio: 'pipe' }
);

fs.writeFileSync(path.join(runDir, 'run.json'), JSON.stringify({
  run_id: runId,
  status: 'completed',
  started_at: new Date(Date.now() - 60000).toISOString(),
  completed_at: new Date().toISOString(),
  model: 'SDXL/sea-model.safetensors',
  frame_count: 96,
  tag: 'sea-test',
  prompt_positive: 'animated deep sea, ocean waves, teal blue water',
  notes: 'Visual verification run',
  output_video: videoPath,
}));

const svc = await start({
  port: 0, framesDir, uploadsDir,
  runsDir,
  runsDir,
  hlsDir: path.join(tmp, 'hls'),
  sequencersDir: path.join(tmp, 'seq'),
  enableMq: false,
});
const base = `http://127.0.0.1:${svc.port}`;
console.log('Server at', base);

const browser = await chromium.launch({ headless: true });
const SHOTS = '/tmp/verify-shots';
fs.mkdirSync(SHOTS, { recursive: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const modal = page.locator('.restore-session-modal');
  if (await modal.count() > 0)
    await page.locator('.restore-session-modal button').filter({ hasText: /Discard/ }).first().click();
  await waitForNavTabs(page);

  // 1. Open RUNS tab
  await openRunsMonitor(page);
  await page.screenshot({ path: path.join(SHOTS, '1-runs-tab.png') });
  console.log('  shot: 1-runs-tab.png');

  // 2. Switch to Past tab and wait for our row
  await page.locator('[data-testid="runs-browser-tab-past"]').click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SHOTS, '2-runs-past-list.png') });
  console.log('  shot: 2-runs-past-list.png');

  // 3. Click the run row
  const row = page.locator('tbody tr').filter({ hasText: 'sea-test-run' }).first();
  await row.waitFor({ state: 'visible', timeout: 10000 });
  await row.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SHOTS, '3-run-detail.png') });
  console.log('  shot: 3-run-detail.png');

  // 4. Check video element is present and report its src
  const videoEl = page.locator('[data-testid="runs-detail-outputs"] video, .runs-detail-card__video').first();
  const videoPresent = await videoEl.count() > 0;
  console.log('  video element present:', videoPresent);
  if (videoPresent) {
    const src = await videoEl.getAttribute('src').catch(() => '(no src attr)');
    console.log('  video src:', src);
  }

  // 5. Check for "Open in editor" button
  const editBtn = page.locator('button').filter({ hasText: /open in editor/i }).first();
  const editPresent = await editBtn.count() > 0;
  console.log('  "Open in editor" button present:', editPresent);

  if (editPresent) {
    await editBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SHOTS, '4-editor.png') });
    console.log('  shot: 4-editor.png');

    const editorFrame = page.locator('[data-testid="freecut-editor-frame"]');
    const editorPresent = await editorFrame.count() > 0;
    console.log('  FreeCut iframe present:', editorPresent);
    if (editorPresent) {
      const src = await editorFrame.getAttribute('src');
      console.log('  editor iframe src:', src);
    }
  }

  console.log('\nScreenshots in:', SHOTS);
  console.log(fs.readdirSync(SHOTS).join(', '));
} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {}
}
