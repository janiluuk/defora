/**
 * Helpers for continuing a Deforum run from the last generated frame.
 */

export function framePathForDeforumInit(src) {
  const raw = String(src || '').trim();
  if (!raw) return null;
  const q = raw.indexOf('?');
  return q >= 0 ? raw.slice(0, q) : raw;
}

export function parseFrameNumberFromThumb(thumb) {
  if (!thumb || typeof thumb !== 'object') return null;
  const frame = Number(thumb.frame);
  if (Number.isFinite(frame) && frame >= 0) return frame;
  const name = String(thumb.name || thumb.src || thumb.url || thumb.path || '');
  const match = name.match(/(\d{3,})/);
  return match ? parseInt(match.pop(), 10) : null;
}

export function lastGeneratedThumb(thumbs) {
  if (!Array.isArray(thumbs) || !thumbs.length) return null;
  return thumbs[thumbs.length - 1];
}

export function deforumContinuationStartFrame(thumbs, { fallback = 0, initImage = null } = {}) {
  const thumb = lastGeneratedThumb(thumbs);
  const fromThumb = parseFrameNumberFromThumb(thumb);
  if (Number.isFinite(fromThumb) && fromThumb >= 0) return fromThumb;
  const fromInit = parseFrameNumberFromThumb({ name: initImage });
  if (Number.isFinite(fromInit) && fromInit >= 0) return fromInit;
  return fallback;
}

export function buildDeforumContinuationPatch(thumb) {
  const path = framePathForDeforumInit(
    thumb && (thumb.src || thumb.url || thumb.path),
  );
  if (!path) return null;
  return { init_image: path, use_init: true };
}

const MAX_CONTINUATION_CHECKPOINTS = 32;

export function normalizeContinuationCheckpoint(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const frame = Number(raw.frame);
  if (!Number.isFinite(frame) || frame < 0) return null;
  const init_image = framePathForDeforumInit(raw.init_image);
  if (!init_image) return null;
  const thumbCount = Number(raw.thumbCount);
  return {
    frame,
    init_image,
    use_init: raw.use_init !== false,
    thumbCount: Number.isFinite(thumbCount) && thumbCount >= 0 ? thumbCount : 0,
  };
}

export function pushContinuationCheckpoint(stack, checkpoint) {
  const normalized = normalizeContinuationCheckpoint(checkpoint);
  if (!normalized) return Array.isArray(stack) ? [...stack] : [];
  const prev = Array.isArray(stack) ? stack : [];
  const top = prev.length ? prev[prev.length - 1] : null;
  if (top && top.frame === normalized.frame && top.init_image === normalized.init_image) {
    return prev;
  }
  const next = [...prev, normalized];
  if (next.length > MAX_CONTINUATION_CHECKPOINTS) {
    return next.slice(next.length - MAX_CONTINUATION_CHECKPOINTS);
  }
  return next;
}

export function canUndoContinuation(stack) {
  return Array.isArray(stack) && stack.length >= 2;
}

export function popContinuationForUndo(stack) {
  if (!canUndoContinuation(stack)) {
    return { stack: Array.isArray(stack) ? [...stack] : [], restored: null };
  }
  const next = stack.slice(0, -1);
  const restored = next[next.length - 1] || null;
  return { stack: next, restored: normalizeContinuationCheckpoint(restored) };
}

export function trimThumbsToContinuationFrame(thumbs, maxFrame) {
  const limit = Number(maxFrame);
  if (!Array.isArray(thumbs) || !Number.isFinite(limit)) return [];
  return thumbs.filter((thumb) => {
    const n = parseFrameNumberFromThumb(thumb);
    return Number.isFinite(n) && n <= limit;
  });
}

export function continuationCheckpointFromThumb(thumb, thumbCount = 0) {
  const patch = buildDeforumContinuationPatch(thumb);
  if (!patch) return null;
  const frame = parseFrameNumberFromThumb(thumb);
  if (!Number.isFinite(frame) || frame < 0) return null;
  return normalizeContinuationCheckpoint({
    frame,
    init_image: patch.init_image,
    use_init: patch.use_init,
    thumbCount,
  });
}
