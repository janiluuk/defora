/**
 * Periodic table preset settings (no Three.js / Node deps — safe for app-definition sync).
 */

export const PERIODIC_LAYOUTS = ['table', 'sphere', 'helix', 'grid']

function clampPt(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function periodicTableDefaults() {
  return {
    ptLayout: 'table',
    ptTransitionMs: 2000,
    ptSpacing: 1,
    ptCardOpacity: 0.45,
    ptCardScale: 1,
    ptAutoCycle: false,
    ptAutoCycleSec: 8,
    ptHue: 0.5,
  }
}

export function normalizePeriodicTableSettings(input = {}) {
  const d = periodicTableDefaults()
  const next = input && typeof input === 'object' ? input : {}
  const layout = PERIODIC_LAYOUTS.includes(next.ptLayout) ? next.ptLayout : d.ptLayout
  return {
    ptLayout: layout,
    ptTransitionMs: clampPt(Math.round(Number(next.ptTransitionMs) || d.ptTransitionMs), 400, 6000),
    ptSpacing: clampPt(Number.isFinite(Number(next.ptSpacing)) ? Number(next.ptSpacing) : d.ptSpacing, 0.5, 1.5),
    ptCardOpacity: clampPt(Number.isFinite(Number(next.ptCardOpacity)) ? Number(next.ptCardOpacity) : d.ptCardOpacity, 0.15, 0.85),
    ptCardScale: clampPt(Number.isFinite(Number(next.ptCardScale)) ? Number(next.ptCardScale) : d.ptCardScale, 0.6, 1.4),
    ptAutoCycle: !!next.ptAutoCycle,
    ptAutoCycleSec: clampPt(Number.isFinite(Number(next.ptAutoCycleSec)) ? Number(next.ptAutoCycleSec) : d.ptAutoCycleSec, 3, 30),
    ptHue: clampPt(Number.isFinite(Number(next.ptHue)) ? Number(next.ptHue) : d.ptHue, 0, 1),
  }
}
