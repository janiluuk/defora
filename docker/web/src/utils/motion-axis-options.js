/** Motion axis definitions for compact XY controllers (future dynamic placement). */
export const MOTION_AXIS_DEFS = {
  translation_x: { key: 'translation_x', label: 'Pan X', shortLabel: 'X', icon: 'arrow-right', range: null },
  translation_y: { key: 'translation_y', label: 'Pan Y', shortLabel: 'Y', icon: 'chevron-up', range: null },
  translation_z: { key: 'translation_z', label: 'Depth Z', shortLabel: 'Z', icon: 'panel-bottom', range: 10 },
  angle: { key: 'angle', label: 'Angle', shortLabel: 'Ang', icon: 'rotate-ccw', range: 1 },
  zoom: { key: 'zoom', label: 'Zoom', shortLabel: 'Zm', icon: 'size-full', range: 1 },
  rotation_z: { key: 'rotation_z', label: 'Tilt', shortLabel: 'Tlt', icon: 'rotate-ccw', range: 180 },
}

export function motionAxisOptionsForMode(is2d) {
  const keys = is2d
    ? ['translation_x', 'translation_y', 'angle', 'zoom']
    : ['translation_x', 'translation_y', 'translation_z', 'zoom', 'rotation_z']
  return keys.map((key) => ({ ...MOTION_AXIS_DEFS[key] }))
}

export function defaultMotionXYPadSlots(is2d) {
  if (is2d) {
    return [
      { id: 'primary', xAxis: 'translation_x', yAxis: 'translation_y' },
      { id: 'look', xAxis: 'angle', yAxis: 'zoom' },
    ]
  }
  return [
    { id: 'primary', xAxis: 'translation_x', yAxis: 'translation_y' },
  ]
}

export function motionAxisDef(key) {
  return MOTION_AXIS_DEFS[key] || null
}

export function nextMotionAxisKey(currentKey, otherKey, options) {
  const keys = (options || []).map((o) => o.key).filter(Boolean)
  if (!keys.length) return currentKey
  let idx = Math.max(0, keys.indexOf(currentKey))
  for (let i = 0; i < keys.length; i += 1) {
    idx = (idx + 1) % keys.length
    const candidate = keys[idx]
    if (candidate !== otherKey) return candidate
  }
  return currentKey
}
