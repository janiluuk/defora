const path = require("path");

/**
 * Resolve canonical storage directories for frames, runs, uploads, and HLS.
 * Uploads and videoswarm default under runsDir unless overridden by env.
 */
function resolveStoragePaths(opts = {}, env = process.env) {
  const webRoot = path.resolve(opts.webRoot || path.join(__dirname, ".."));
  const runsDir = path.resolve(opts.runsDir || env.RUNS_DIR || path.join(webRoot, "runs"));
  const framesDir = path.resolve(opts.framesDir || env.FRAMES_DIR || path.join(webRoot, "frames"));
  const uploadsDir = path.resolve(opts.uploadsDir || env.UPLOADS_DIR || path.join(runsDir, "uploads"));
  const videoswarmDir = path.resolve(
    opts.videoswarmDir || env.VIDEOSWARM_DIR || path.join(runsDir, "videoswarm"),
  );
  const hlsDir = path.resolve(opts.hlsDir || env.HLS_DIR || path.join(webRoot, "hls"));
  return { webRoot, runsDir, framesDir, uploadsDir, videoswarmDir, hlsDir };
}

module.exports = { resolveStoragePaths };
