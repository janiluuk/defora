#!/usr/bin/env node
/**
 * Merge animation engine settings for CLI (stdin JSON → stdout JSON).
 *
 * Input: { engine, prompt, negative, maxFrames, fps, durationSec, wanEngine, svdEngine, animateLcmEngine, initImageBase64 }
 * Output: { kind: "deforum"|"svd", settings?, payload? }
 */
import { readFileSync } from 'node:fs'
import { mergeWanEngineIntoDeforumSettings, normalizeWanEngine, getWanSpeedPreset, getWanMotionPreset } from '../../docker/web/src/shared/wan-engine-config.mjs'
import { mergeAnimateLcmIntoDeforumSettings, normalizeAnimateLcmEngine } from '../../docker/web/src/animation-plugins/animatelcm-engine-config.mjs'
import { buildSvdGeneratePayload, normalizeSvdEngine, getSvdPreset } from '../../docker/web/src/shared/svd-engine-config.mjs'

function readInput() {
  const raw = readFileSync(0, 'utf8').trim()
  if (!raw) throw new Error('Expected JSON on stdin')
  return JSON.parse(raw)
}

function framesForDuration(durationSec, fps) {
  return Math.max(1, Math.round(Number(durationSec || 5) * Number(fps || 24)))
}

function applyWanPresets(wanEngine) {
  const wan = { ...wanEngine }
  const speed = getWanSpeedPreset(wan.wan_speed_preset)
  const motion = getWanMotionPreset(wan.wan_motion_preset)
  return normalizeWanEngine({ ...speed, ...motion, ...wan })
}

function applySvdPreset(svdEngine) {
  const preset = getSvdPreset(svdEngine.svd_preset)
  return normalizeSvdEngine({ ...(preset || {}), ...svdEngine })
}

function main() {
  const input = readInput()
  const engine = String(input.engine || '').toLowerCase()
  const prompt = String(input.prompt || 'cinematic scene, high quality').trim()
  const negative = String(input.negative || '').trim()
  const fps = Number(input.fps) || (engine === 'wan' ? 12 : engine === 'svd' ? 6 : 24)
  const maxFrames = input.maxFrames != null
    ? Math.max(1, Math.round(Number(input.maxFrames)))
    : framesForDuration(input.durationSec ?? 5, fps)

  if (engine === 'wan') {
    const wanEngine = applyWanPresets({
      ...normalizeWanEngine(input.wanEngine || {}),
      ...(input.wanEngine || {}),
    })
    const settings = mergeWanEngineIntoDeforumSettings(
      { max_frames: maxFrames, fps, skip_video_creation: false, prompts: { 0: prompt } },
      wanEngine,
      { positivePrompt: prompt },
    )
    if (negative) settings.animation_prompts_negative = negative
    process.stdout.write(JSON.stringify({ kind: 'deforum', engine: 'wan', settings, wanEngine, maxFrames, fps }))
    return
  }

  if (engine === 'animatelcm') {
    const animateLcmEngine = normalizeAnimateLcmEngine(input.animateLcmEngine || input.animatelcmEngine || {})
    const settings = mergeAnimateLcmIntoDeforumSettings(
      { max_frames: maxFrames, fps, skip_video_creation: false, prompts: { 0: prompt } },
      animateLcmEngine,
      { positivePrompt: prompt },
    )
    if (negative) settings.animation_prompts_negative = negative
    process.stdout.write(JSON.stringify({ kind: 'deforum', engine: 'animatelcm', settings, animateLcmEngine, maxFrames, fps }))
    return
  }

  if (engine === 'svd') {
    const svdEngine = applySvdPreset({ ...normalizeSvdEngine(input.svdEngine || {}), ...(input.svdEngine || {}) })
    if (input.video_frames != null) svdEngine.video_frames = Math.max(1, Math.round(Number(input.video_frames)))
    if (input.fps != null) svdEngine.fps = Math.max(1, Math.round(Number(input.fps)))
    const payload = buildSvdGeneratePayload(svdEngine, {
      initImageBase64: input.initImageBase64 || input.init_image || null,
      preview: !!input.preview,
    })
    process.stdout.write(JSON.stringify({ kind: 'svd', engine: 'svd', payload, svdEngine, maxFrames: payload.video_frames, fps: payload.fps }))
    return
  }

  throw new Error(`Unknown engine: ${engine}. Use wan, animatelcm, or svd.`)
}

main()
