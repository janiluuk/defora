/**
 * CSS3D periodic table — data and helpers from three.js css3d_periodictable example.
 * @see https://threejs.org/examples/#css3d_periodictable
 */

import * as THREE from 'three'
import PERIODIC_TABLE_DATA from './periodic-table-data.mjs'
import {
  periodicTableDefaults,
  normalizePeriodicTableSettings,
  PERIODIC_LAYOUTS,
} from './periodic-table-settings.mjs'

export { PERIODIC_TABLE_DATA, periodicTableDefaults, normalizePeriodicTableSettings, PERIODIC_LAYOUTS }

const STYLE_TAG_ID = 'defora-periodic-table-styles'

function clampPt(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export function easeExponentialInOut(t) {
  if (t <= 0) return 0
  if (t >= 1) return 1
  if (t < 0.5) return (2 ** (20 * t - 10)) / 2
  return (2 - (2 ** (-20 * t + 10))) / 2
}

export function injectPeriodicTableStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_TAG_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_TAG_ID
  style.textContent = `
.defora-pt-element {
  width: 120px;
  height: 160px;
  box-shadow: 0 0 12px rgba(0,255,255,0.45);
  border: 1px solid rgba(127,255,255,0.28);
  font-family: Helvetica, Arial, sans-serif;
  text-align: center;
  line-height: normal;
  cursor: default;
  pointer-events: none;
  user-select: none;
  position: relative;
  box-sizing: border-box;
}
.defora-pt-element .defora-pt-number {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 12px;
  color: rgba(127,255,255,0.75);
}
.defora-pt-element .defora-pt-symbol {
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  font-size: 60px;
  font-weight: bold;
  color: rgba(255,255,255,0.75);
  text-shadow: 0 0 10px rgba(0,255,255,0.95);
}
.defora-pt-element .defora-pt-details {
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  font-size: 12px;
  color: rgba(127,255,255,0.75);
}
`
  document.head.appendChild(style)
}

export function removePeriodicTableStyles() {
  if (typeof document === 'undefined') return
  document.getElementById(STYLE_TAG_ID)?.remove()
}

export function elementBackgroundColor(opacity, hue, seed = 0) {
  const alpha = clampPt(opacity * (0.55 + (seed % 7) * 0.08), 0.12, 0.9)
  const r = Math.round(30 + hue * 40)
  const g = Math.round(100 + hue * 80)
  const b = Math.round(120 + (1 - hue) * 60)
  return `rgba(${r},${g},${b},${alpha})`
}

export function createPeriodicElement(index, styleOpts = {}) {
  const i = index * 5
  const symbol = PERIODIC_TABLE_DATA[i]
  const name = PERIODIC_TABLE_DATA[i + 1]
  const weight = PERIODIC_TABLE_DATA[i + 2]
  const opacity = styleOpts.opacity ?? 0.45
  const hue = styleOpts.hue ?? 0.5
  const scale = styleOpts.scale ?? 1

  const element = document.createElement('div')
  element.className = 'defora-pt-element'
  element.style.backgroundColor = elementBackgroundColor(opacity, hue, index)
  element.style.width = `${Math.round(120 * scale)}px`
  element.style.height = `${Math.round(160 * scale)}px`

  const number = document.createElement('div')
  number.className = 'defora-pt-number'
  number.textContent = String(index + 1)
  element.appendChild(number)

  const symbolEl = document.createElement('div')
  symbolEl.className = 'defora-pt-symbol'
  symbolEl.textContent = symbol
  element.appendChild(symbolEl)

  const details = document.createElement('div')
  details.className = 'defora-pt-details'
  details.innerHTML = `${name}<br>${weight}`
  element.appendChild(details)

  return element
}

export function buildPeriodicLayoutTargets(objectCount, spacing = 1) {
  const table = []
  const sphere = []
  const helix = []
  const grid = []
  const vector = new THREE.Vector3()

  for (let i = 0; i < PERIODIC_TABLE_DATA.length; i += 5) {
    const object = new THREE.Object3D()
    object.position.set(
      ((PERIODIC_TABLE_DATA[i + 3] * 140) - 1330) * spacing,
      (-(PERIODIC_TABLE_DATA[i + 4] * 180) + 990) * spacing,
      0,
    )
    table.push(object)
  }

  for (let i = 0; i < objectCount; i += 1) {
    const phi = Math.acos(-1 + (2 * i) / objectCount)
    const theta = Math.sqrt(objectCount * Math.PI) * phi
    const object = new THREE.Object3D()
    object.position.setFromSphericalCoords(800 * spacing, phi, theta)
    vector.copy(object.position).multiplyScalar(2)
    object.lookAt(vector)
    sphere.push(object)
  }

  for (let i = 0; i < objectCount; i += 1) {
    const theta = i * 0.175 + Math.PI
    const y = -(i * 8) + 450
    const object = new THREE.Object3D()
    object.position.setFromCylindricalCoords(900 * spacing, theta, y * spacing)
    vector.set(object.position.x * 2, object.position.y, object.position.z * 2)
    object.lookAt(vector)
    helix.push(object)
  }

  for (let i = 0; i < objectCount; i += 1) {
    const object = new THREE.Object3D()
    object.position.set(
      ((i % 5) * 400 - 800) * spacing,
      (-(Math.floor(i / 5) % 5) * 400 + 800) * spacing,
      (Math.floor(i / 25) * 1000 - 2000) * spacing,
    )
    grid.push(object)
  }

  return { table, sphere, helix, grid }
}

export function targetsForLayout(targets, layout) {
  if (!targets || !PERIODIC_LAYOUTS.includes(layout)) return targets?.table || []
  return targets[layout] || targets.table
}

export function beginPeriodicTransform(objects, targetObjects, baseDurationMs) {
  const tweens = []
  for (let i = 0; i < objects.length; i += 1) {
    const object = objects[i]
    const target = targetObjects[i]
    if (!object || !target) continue
    const durationMs = (0.5 + Math.random()) * baseDurationMs + baseDurationMs
    tweens.push({
      object,
      startPos: object.position.clone(),
      endPos: target.position.clone(),
      startRot: object.rotation.clone(),
      endRot: target.rotation.clone(),
      durationMs,
      elapsedMs: 0,
    })
  }
  return tweens
}

export function stepPeriodicTweens(tweens, deltaMs) {
  let active = false
  for (const tw of tweens) {
    tw.elapsedMs += deltaMs
    const t = Math.min(1, tw.elapsedMs / tw.durationMs)
    const e = easeExponentialInOut(t)
    if (t < 1) active = true
    tw.object.position.set(
      tw.startPos.x + (tw.endPos.x - tw.startPos.x) * e,
      tw.startPos.y + (tw.endPos.y - tw.startPos.y) * e,
      tw.startPos.z + (tw.endPos.z - tw.startPos.z) * e,
    )
    tw.object.rotation.set(
      tw.startRot.x + (tw.endRot.x - tw.startRot.x) * e,
      tw.startRot.y + (tw.endRot.y - tw.startRot.y) * e,
      tw.startRot.z + (tw.endRot.z - tw.startRot.z) * e,
    )
  }
  return active
}

export function applyPeriodicElementStyles(objects, styleOpts) {
  const opacity = styleOpts.opacity ?? 0.45
  const hue = styleOpts.hue ?? 0.5
  const scale = styleOpts.scale ?? 1
  objects.forEach((obj, index) => {
    const el = obj?.element
    if (!el) return
    el.style.backgroundColor = elementBackgroundColor(opacity, hue, index)
    el.style.width = `${Math.round(120 * scale)}px`
    el.style.height = `${Math.round(160 * scale)}px`
  })
}
