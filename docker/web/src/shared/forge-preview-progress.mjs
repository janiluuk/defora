/**
 * Normalize SD-Forge /sdapi/v1/progress and Deforum batch status into UI-friendly preview progress.
 */

export function normalizeForgeProgressImage(currentImage) {
  if (!currentImage || typeof currentImage !== "string") return null;
  const trimmed = currentImage.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return trimmed;
  return `data:image/png;base64,${trimmed}`;
}

/**
 * @param {object|null|undefined} forgeProgress - Raw /sdapi/v1/progress payload
 * @param {object|null|undefined} batchData - Optional /deforum_api/batches/:id payload
 * @param {{ maxFrames?: number }} [options]
 */
export function computeForgePreviewProgress(forgeProgress, batchData = null, options = {}) {
  const maxFrames = Math.max(1, Number(options.maxFrames) || 1);
  const forge = forgeProgress && typeof forgeProgress === "object" ? forgeProgress : {};
  const batch = batchData && typeof batchData === "object" ? batchData : null;
  const state = forge.state && typeof forge.state === "object" ? forge.state : {};

  const forgeRatio = typeof forge.progress === "number" && Number.isFinite(forge.progress)
    ? Math.max(0, Math.min(1, forge.progress))
    : null;
  const batchRatio = batch && typeof batch.progress === "number" && Number.isFinite(batch.progress)
    ? Math.max(0, Math.min(1, batch.progress))
    : null;
  const phaseRatio = batch && typeof batch.phase_progress === "number" && Number.isFinite(batch.phase_progress)
    ? Math.max(0, Math.min(1, batch.phase_progress))
    : null;

  const samplingSteps = Number(state.sampling_steps);
  const samplingStep = Number(state.sampling_step);
  const stepRatio = Number.isFinite(samplingSteps) && samplingSteps > 0 && Number.isFinite(samplingStep)
    ? Math.max(0, Math.min(1, samplingStep / samplingSteps))
    : null;

  let progressRatio = null;
  let progressSource = null;

  if (maxFrames <= 1) {
    if (forgeRatio != null && forgeRatio > 0) {
      progressRatio = forgeRatio;
      progressSource = "forge";
    } else if (stepRatio != null && stepRatio > 0) {
      progressRatio = stepRatio;
      progressSource = "sampling_steps";
    } else if (phaseRatio != null && phaseRatio > 0) {
      progressRatio = phaseRatio;
      progressSource = "batch_phase";
    } else if (batchRatio != null && batchRatio > 0) {
      progressRatio = batchRatio;
      progressSource = "batch";
    } else if (forgeRatio === 0) {
      progressRatio = 0;
      progressSource = "forge";
    }
  } else {
    const frameBase = batchRatio != null ? batchRatio : phaseRatio;
    if (frameBase != null) {
      const intra = forgeRatio != null && forgeRatio > 0 ? forgeRatio : stepRatio;
      progressRatio = intra != null
        ? Math.max(0, Math.min(1, frameBase + intra / maxFrames))
        : frameBase;
      progressSource = intra != null ? "batch+forge" : "batch";
    } else if (forgeRatio != null) {
      progressRatio = forgeRatio;
      progressSource = "forge";
    } else if (stepRatio != null) {
      progressRatio = stepRatio;
      progressSource = "sampling_steps";
    }
  }

  const progressPct = progressRatio != null
    ? Math.min(99.9, Math.max(0, Math.round(progressRatio * 1000) / 10))
    : null;

  const previewImage = normalizeForgeProgressImage(forge.current_image);

  let progressLabel = null;
  if (progressPct != null) {
    if (Number.isFinite(samplingSteps) && samplingSteps > 0 && Number.isFinite(samplingStep)) {
      progressLabel = `Step ${Math.min(samplingSteps, Math.max(0, Math.round(samplingStep)))}/${samplingSteps} · ${progressPct}%`;
    } else {
      progressLabel = `${progressPct}%`;
    }
  }

  const batchStatus = batch ? String(batch.status || batch.state || "").toLowerCase() : "";
  const active = !!(forgeRatio != null && forgeRatio > 0 && forgeRatio < 1)
    || !!(stepRatio != null && stepRatio > 0 && stepRatio < 1)
    || (batchStatus && !["completed", "failed", "cancelled", "canceled", "done"].includes(batchStatus));

  return {
    progressRatio,
    progressPct,
    progressSource,
    progressLabel,
    previewImage,
    samplingStep: Number.isFinite(samplingStep) ? samplingStep : null,
    samplingSteps: Number.isFinite(samplingSteps) ? samplingSteps : null,
    etaRelative: typeof forge.eta_relative === "number" ? forge.eta_relative : null,
    textinfo: typeof forge.textinfo === "string" ? forge.textinfo : null,
    batchStatus: batchStatus || null,
    active,
  };
}

export function formatPreviewProgressLabel(progressPct, progressLabel) {
  if (progressLabel) return progressLabel;
  if (progressPct != null) return `${progressPct}%`;
  return null;
}
