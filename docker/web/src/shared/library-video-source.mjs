/**
 * Helpers for loading library videos as LIVE input sources and motion sequencer references.
 */

export function projectDurationSec(state = {}) {
  const fromSequencer = Number(state.sequencer?.durationSec);
  if (Number.isFinite(fromSequencer) && fromSequencer > 0) return fromSequencer;
  const fps = Math.max(
    1,
    Number(state.deforumSettings?.fps) || Number(state.sequencer?.fps) || 24,
  );
  const frames = Number(state.deforumSettings?.max_frames);
  if (Number.isFinite(frames) && frames > 0) return frames / fps;
  return 8;
}

export function projectFrameCount(state = {}, durationSec = null) {
  const fps = Math.max(
    1,
    Number(state.deforumSettings?.fps) || Number(state.sequencer?.fps) || 24,
  );
  const dur = durationSec != null ? Number(durationSec) : projectDurationSec(state);
  return Math.max(1, Math.ceil(Math.max(0.1, dur) * fps));
}

export function normalizeLibraryVideoEntry(entry, playbackUrlFn) {
  if (!entry || typeof entry !== "object") return null;
  const videoPath = entry.videoPath || entry.path || null;
  if (!videoPath) return null;
  const rootId = entry.rootId || "uploads";
  const title = String(entry.title || entry.name || "Video").trim() || "Video";
  const videoUrl = entry.videoUrl
    || (typeof playbackUrlFn === "function"
      ? playbackUrlFn({ path: videoPath, rootId, url: entry.url })
      : null);
  return {
    videoPath,
    rootId,
    title,
    name: entry.name || title,
    videoUrl,
    durationSec: Number.isFinite(Number(entry.durationSec)) ? Number(entry.durationSec) : null,
  };
}

export function shouldOfferProjectExtension(videoDurationSec, projectDurationSecValue, epsilonSec = 0.05) {
  const videoDur = Number(videoDurationSec);
  const projectDur = Number(projectDurationSecValue);
  if (!Number.isFinite(videoDur) || videoDur <= 0) return false;
  if (!Number.isFinite(projectDur) || projectDur <= 0) return true;
  return videoDur > projectDur + epsilonSec;
}

export function extendProjectDuration(state, durationSec, hooks = {}) {
  const fps = Math.max(
    1,
    Number(state.sequencer?.fps) || Number(state.deforumSettings?.fps) || 24,
  );
  const sec = Math.max(0.5, Math.min(600, Number(durationSec) || 0));
  const roundedSec = Math.round(sec * 100) / 100;
  const frames = Math.max(1, Math.ceil(roundedSec * fps));

  if (state.sequencer && typeof state.sequencer === "object") {
    state.sequencer.durationSec = roundedSec;
  }
  if (state.deforumSettings && typeof state.deforumSettings === "object") {
    state.deforumSettings.max_frames = frames;
    if (state.deforumSettings.fps == null) state.deforumSettings.fps = fps;
  }
  if (state.generator && typeof state.generator === "object") {
    state.generator.totalFrames = frames;
    state.generator.fps = fps;
  }
  if (state.framesync && typeof state.framesync === "object") {
    state.framesync.frameCount = frames;
    state.framesync.fps = fps;
  }

  if (typeof hooks.onDeforumMaxFrames === "function") {
    hooks.onDeforumMaxFrames(frames);
  }
  if (typeof hooks.clampSequencerClips === "function") {
    hooks.clampSequencerClips();
  }

  return { durationSec: roundedSec, frameCount: frames, fps };
}

export function buildMotionSequencerVideoClip(sourceVideo, projectDurationSecValue) {
  if (!sourceVideo?.url && !sourceVideo?.videoPath) return null;
  const projectDur = Math.max(0.1, Number(projectDurationSecValue) || 0.1);
  const videoDur = Number.isFinite(Number(sourceVideo.durationSec)) && Number(sourceVideo.durationSec) > 0
    ? Number(sourceVideo.durationSec)
    : projectDur;
  const endT = Math.min(projectDur, videoDur);
  const label = String(sourceVideo.label || sourceVideo.title || "Video").slice(0, 48);
  return {
    id: `clip-video-${Date.now()}`,
    type: "video",
    t: 0,
    endT,
    label,
    payload: { ...sourceVideo },
  };
}
