export const AUDIO_SPECTRUM_MIN_HZ = 20
export const AUDIO_SPECTRUM_MAX_HZ = 16000

export function clampHz(value, minHz = AUDIO_SPECTRUM_MIN_HZ, maxHz = AUDIO_SPECTRUM_MAX_HZ) {
  const n = Number(value)
  if (!Number.isFinite(n)) return minHz
  return Math.min(maxHz, Math.max(minHz, n))
}

export function hzToRatio(hz, minHz = AUDIO_SPECTRUM_MIN_HZ, maxHz = AUDIO_SPECTRUM_MAX_HZ) {
  const clamped = clampHz(hz, minHz, maxHz)
  return (Math.log(clamped) - Math.log(minHz)) / (Math.log(maxHz) - Math.log(minHz))
}

export function ratioToHz(ratio, minHz = AUDIO_SPECTRUM_MIN_HZ, maxHz = AUDIO_SPECTRUM_MAX_HZ) {
  const t = Math.max(0, Math.min(1, Number(ratio) || 0))
  return Math.exp(Math.log(minHz) + t * (Math.log(maxHz) - Math.log(minHz)))
}

export function hzToPercent(hz, minHz = AUDIO_SPECTRUM_MIN_HZ, maxHz = AUDIO_SPECTRUM_MAX_HZ) {
  return hzToRatio(hz, minHz, maxHz) * 100
}

export function audioBandWindowStyle(mapping, minHz = AUDIO_SPECTRUM_MIN_HZ, maxHz = AUDIO_SPECTRUM_MAX_HZ) {
  const left = hzToPercent(mapping && mapping.freq_min, minHz, maxHz)
  const right = hzToPercent(mapping && mapping.freq_max, minHz, maxHz)
  return {
    left: `${Math.min(left, right)}%`,
    width: `${Math.max(1.5, Math.abs(right - left))}%`,
  }
}

export function paintSpectrumBars(ctx, freqBytes, width, height, { barColor, bgColor } = {}) {
  const w = Math.max(1, Math.floor(width))
  const h = Math.max(1, Math.floor(height))
  ctx.fillStyle = bgColor || 'rgb(8, 9, 13)'
  ctx.fillRect(0, 0, w, h)

  if (!freqBytes || !freqBytes.length) return

  const barCount = Math.min(96, Math.max(32, Math.floor(w / 4)))
  const step = Math.max(1, Math.floor(freqBytes.length / barCount))
  const gap = 1
  const barW = Math.max(2, (w - gap * (barCount - 1)) / barCount)

  for (let i = 0; i < barCount; i += 1) {
    let peak = 0
    const start = i * step
    const end = Math.min(freqBytes.length, start + step)
    for (let b = start; b < end; b += 1) peak = Math.max(peak, freqBytes[b])
    const level = peak / 255
    const barH = Math.max(2, level * (h - 4))
    const x = i * (barW + gap)
    const y = h - barH
    const grad = ctx.createLinearGradient(0, y, 0, h)
    grad.addColorStop(0, barColor || 'rgba(80, 250, 123, 0.95)')
    grad.addColorStop(1, barColor || 'rgba(29, 158, 117, 0.35)')
    ctx.fillStyle = grad
    ctx.fillRect(x, y, barW, barH)
  }
}

export const AUDIO_BAND_TAB_DEFS = [
  { key: 'low', label: 'Low', freq_min: 20, freq_max: 250, color: 'var(--a-group)' },
  { key: 'mid', label: 'Mid', freq_min: 250, freq_max: 2000, color: 'var(--accent)' },
  { key: 'high', label: 'High', freq_min: 2000, freq_max: 8000, color: 'var(--live)' },
]
