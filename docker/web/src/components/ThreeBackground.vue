<template>
  <div ref="host" class="three-background"></div>
</template>

<script>
import * as THREE from 'three'

function clamp01(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(1, n))
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function lfoColors() {
  const s = getComputedStyle(document.documentElement)
  const v = (name) => s.getPropertyValue(name).trim()
  return [v('--accent'), '#2de2ff', v('--warn'), v('--b-group'), v('--live'), v('--accent-text')]
}

function defaultSettings() {
  return {
    beamCount: 7,
    speed: 0.75,
    spread: 0.68,
    glow: 0.78,
    hue: 0.6,
    pulse: 0.36,
    drift: 0.44,
  }
}

function radialTexture(innerAlpha, outerAlpha) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 128)
  grad.addColorStop(0, `rgba(255,255,255,${innerAlpha})`)
  grad.addColorStop(0.22, `rgba(255,255,255,${innerAlpha * 0.85})`)
  grad.addColorStop(0.68, `rgba(255,255,255,${outerAlpha})`)
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

function beamTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0, 'rgba(255,255,255,0)')
  grad.addColorStop(0.18, 'rgba(255,255,255,0.12)')
  grad.addColorStop(0.52, 'rgba(255,255,255,0.9)')
  grad.addColorStop(0.82, 'rgba(255,255,255,0.18)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 512)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export default {
  name: 'ThreeBackground',
  props: {
    lfos: {
      type: Array,
      default: () => [],
    },
    audioMetrics: {
      type: Object,
      default: () => ({ active: false, level: 0, bass: 0, mid: 0, treble: 0, pulse: 0 }),
    },
    activeTab: {
      type: String,
      default: 'LIVE',
    },
    morph: {
      type: Number,
      default: 0.5,
    },
    settings: {
      type: Object,
      default: () => defaultSettings(),
    },
  },
  data() {
    return {
      renderer: null,
      scene: null,
      camera: null,
      clock: null,
      rafId: null,
      resizeObserver: null,
      particleSystem: null,
      particleBase: null,
      haloMesh: null,
      beamMeshes: [],
      fogSprites: [],
      beamMap: null,
      mistMap: null,
      lfoGroups: [],
    }
  },
  mounted() {
    if (typeof window === 'undefined' || !this.$refs.host) return
    this.initScene()
  },
  beforeUnmount() {
    this.teardownScene()
  },
  methods: {
    initScene() {
      const host = this.$refs.host
      if (!host) return

      this.scene = new THREE.Scene()
      this.scene.fog = new THREE.FogExp2(0x05070d, 0.045)
      this.clock = new THREE.Clock()
      this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
      this.camera.position.set(0, 0, 18)

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
      this.renderer.setClearColor(0x000000, 0)
      this.renderer.outputColorSpace = THREE.SRGBColorSpace
      host.appendChild(this.renderer.domElement)

      this.scene.add(new THREE.AmbientLight(0xffffff, 0.28))
      const rimLight = new THREE.PointLight(0x8f80ff, 2.1, 60)
      rimLight.position.set(6, 5, 14)
      this.scene.add(rimLight)
      const fillLight = new THREE.PointLight(0x2de2ff, 1.35, 60)
      fillLight.position.set(-6, -4, 12)
      this.scene.add(fillLight)
      const warmLight = new THREE.PointLight(0xff78d7, 1.0, 50)
      warmLight.position.set(0, -3, 10)
      this.scene.add(warmLight)

      this.beamMap = beamTexture()
      this.mistMap = radialTexture(0.55, 0.12)

      this.createParticles()
      this.createHalo()
      this.createVolumeBeams()
      this.createFogSprites()
      this.createLfoGroups()
      this.handleResize()

      window.addEventListener('resize', this.handleResize)
      if (typeof ResizeObserver === 'function') {
        this.resizeObserver = new ResizeObserver(() => this.handleResize())
        this.resizeObserver.observe(host)
      }
      this.animate()
    },
    createParticles() {
      const count = 1100
      const positions = new Float32Array(count * 3)
      this.particleBase = new Float32Array(count * 3)
      for (let i = 0; i < count; i += 1) {
        const radius = 5 + Math.random() * 15
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.sin(phi) * Math.sin(theta)
        const z = (Math.random() - 0.5) * 18
        positions[i * 3] = x
        positions[i * 3 + 1] = y
        positions[i * 3 + 2] = z
        this.particleBase[i * 3] = x
        this.particleBase[i * 3 + 1] = y
        this.particleBase[i * 3 + 2] = z
      }
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const material = new THREE.PointsMaterial({
        color: 0xb9c6ff,
        size: 0.085,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      this.particleSystem = new THREE.Points(geometry, material)
      this.scene.add(this.particleSystem)
    },
    createHalo() {
      const geometry = new THREE.IcosahedronGeometry(4.6, 2)
      const material = new THREE.MeshPhongMaterial({
        color: 0x8078ff,
        emissive: 0x2f2270,
        shininess: 70,
        transparent: true,
        opacity: 0.08,
        wireframe: true,
      })
      this.haloMesh = new THREE.Mesh(geometry, material)
      this.scene.add(this.haloMesh)
    },
    createVolumeBeams() {
      const geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
      this.beamMeshes = Array.from({ length: 12 }).map(() => {
        const material = new THREE.MeshBasicMaterial({
          map: this.beamMap,
          color: 0xffffff,
          transparent: true,
          opacity: 0.4,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
        const beam = new THREE.Mesh(geometry, material)
        beam.visible = false
        this.scene.add(beam)
        return beam
      })
    },
    createFogSprites() {
      this.fogSprites = Array.from({ length: 4 }).map((_, index) => {
        const material = new THREE.SpriteMaterial({
          map: this.mistMap,
          color: new THREE.Color().setHSL((0.54 + index * 0.08) % 1, 0.72, 0.65),
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
        const sprite = new THREE.Sprite(material)
        this.scene.add(sprite)
        return sprite
      })
    },
    createLfoGroups() {
      this.lfoGroups = Array.from({ length: 6 }).map((_, index) => {
        const colors = lfoColors()
        const color = new THREE.Color(colors[index % colors.length])
        const group = new THREE.Group()

        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.8, 0.08, 16, 72),
          new THREE.MeshPhongMaterial({
            color,
            emissive: color.clone().multiplyScalar(0.55),
            transparent: true,
            opacity: 0.5,
          })
        )
        group.add(ring)

        const core = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 20, 20),
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.95,
          })
        )
        group.add(core)

        const aura = new THREE.Mesh(
          new THREE.SphereGeometry(0.58, 18, 18),
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.14,
          })
        )
        group.add(aura)

        group.userData = { ring, core, aura, color }
        group.visible = false
        this.scene.add(group)
        return group
      })
    },
    resolvedSettings() {
      const merged = { ...defaultSettings(), ...(this.settings || {}) }
      return {
        beamCount: clamp(Math.round(Number(merged.beamCount) || 7), 3, 12),
        speed: clamp(Number(merged.speed) || 0.75, 0.1, 2.5),
        spread: clamp(Number(merged.spread) || 0.68, 0.2, 1.4),
        glow: clamp(Number(merged.glow) || 0.78, 0.1, 1.4),
        hue: clamp01(merged.hue == null ? 0.6 : merged.hue),
        pulse: clamp01(merged.pulse == null ? 0.36 : merged.pulse),
        drift: clamp01(merged.drift == null ? 0.44 : merged.drift),
      }
    },
    handleResize() {
      if (!this.renderer || !this.camera || !this.$refs.host) return
      const width = this.$refs.host.clientWidth || 1
      const height = this.$refs.host.clientHeight || 1
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height, false)
    },
    shapeSample(shape, phase) {
      const p = phase % (Math.PI * 2)
      if (shape === 'Square') return Math.sin(p) >= 0 ? 1 : -1
      if (shape === 'Saw') return p / Math.PI - 1
      if (shape === 'Triangle') return (2 * Math.asin(Math.sin(p))) / Math.PI
      return Math.sin(p)
    },
    updateParticles(elapsed, audioLevel, pulse) {
      if (!this.particleSystem || !this.particleBase) return
      const positionAttr = this.particleSystem.geometry.getAttribute('position')
      const positions = positionAttr.array
      const wave = 0.08 + audioLevel * 0.5 + pulse * 0.25
      for (let i = 0; i < positions.length; i += 3) {
        const baseX = this.particleBase[i]
        const baseY = this.particleBase[i + 1]
        const baseZ = this.particleBase[i + 2]
        const drift = elapsed * 0.18 + i * 0.0008
        positions[i] = baseX + Math.sin(drift + baseZ * 0.12) * wave
        positions[i + 1] = baseY + Math.cos(drift * 1.2 + baseX * 0.08) * wave
        positions[i + 2] = baseZ + Math.sin(drift * 0.8 + baseY * 0.05) * wave * 0.6
      }
      positionAttr.needsUpdate = true
      this.particleSystem.rotation.z = elapsed * (0.02 + audioLevel * 0.05)
      this.particleSystem.rotation.x = Math.sin(elapsed * 0.12) * 0.18
      this.particleSystem.material.opacity = 0.2 + audioLevel * 0.25 + pulse * 0.15
    },
    updateHalo(elapsed, audioLevel, bass, morph, config) {
      if (!this.haloMesh) return
      const haloScale = 1 + bass * 0.18 + morph * 0.05 + config.glow * 0.08
      this.haloMesh.scale.setScalar(haloScale)
      this.haloMesh.rotation.x = elapsed * (0.08 + morph * 0.04 + config.speed * 0.03)
      this.haloMesh.rotation.y = elapsed * (0.12 + audioLevel * 0.08 + config.drift * 0.1)
      this.haloMesh.material.opacity = 0.04 + audioLevel * 0.12 + bass * 0.08 + config.glow * 0.04
      this.haloMesh.material.color.setHSL((config.hue + elapsed * 0.01) % 1, 0.72, 0.68)
    },
    updateVolumeBeams(elapsed, audioLevel, bass, treble, config) {
      const beamCount = config.beamCount
      const spread = 1.4 + config.spread * 2.6
      const pulse = 0.8 + config.pulse * 1.4 + bass * 0.7
      this.beamMeshes.forEach((beam, index) => {
        beam.visible = index < beamCount
        if (!beam.visible) return
        const ratio = beamCount <= 1 ? 0 : index / beamCount
        const orbit = elapsed * (0.12 + config.speed * 0.22) + ratio * Math.PI * 2
        const drift = Math.sin(elapsed * (0.3 + config.drift * 0.7) + index * 0.9)
        const radius = spread + drift * (0.5 + config.drift * 1.4)
        const tilt = Math.sin(orbit * 1.7 + index) * (0.22 + config.spread * 0.48)
        const width = 1.2 + config.glow * 2.8 + audioLevel * 1.6
        const height = 9 + config.glow * 16 + pulse * 4 + treble * 5
        const hue = (config.hue + ratio * 0.14 + elapsed * 0.01) % 1
        beam.position.set(
          Math.cos(orbit) * radius,
          Math.sin(orbit * 1.4) * (1.1 + config.drift * 2.2),
          -2 + Math.sin(orbit * 0.65 + index) * (1.8 + config.spread * 1.6)
        )
        beam.scale.set(width, height, 1)
        beam.rotation.z = orbit + tilt
        beam.lookAt(this.camera.position)
        beam.rotateZ(orbit + tilt)
        beam.material.color.setHSL(hue, 0.82, 0.7)
        beam.material.opacity = 0.12 + config.glow * 0.22 + audioLevel * 0.24 + bass * 0.12
      })
    },
    updateFogSprites(elapsed, audioLevel, pulse, config) {
      this.fogSprites.forEach((sprite, index) => {
        const orbit = elapsed * (0.08 + config.speed * 0.08) + index * 1.3
        const radius = 1.4 + config.spread * 2.2 + index * 0.35
        const depth = -4 + index * 1.35
        const size = 5 + config.glow * 7 + pulse * 2 + index * 1.3
        const hue = (config.hue + index * 0.06 + elapsed * 0.01) % 1
        sprite.position.set(
          Math.cos(orbit) * radius,
          Math.sin(orbit * 1.2) * (1.4 + config.drift * 1.8),
          depth
        )
        sprite.scale.setScalar(size)
        sprite.material.color.setHSL(hue, 0.78, 0.64)
        sprite.material.opacity = 0.06 + config.glow * 0.08 + audioLevel * 0.08
      })
    },
    updateLfoGroups(elapsed, audioLevel, bass, mid, treble) {
      const lfos = Array.isArray(this.lfos) ? this.lfos : []
      this.lfoGroups.forEach((group, index) => {
        const lfo = lfos[index]
        const active = !!(lfo && lfo.on)
        group.visible = active
        if (!active) return

        const speed = Math.max(0.1, Number(lfo.speed) || 1)
        const depth = clamp01(lfo.depth == null ? 0.2 : lfo.depth)
        const phase = Number(lfo.phase) || 0
        const time = elapsed * (0.35 + speed * 0.25)
        const orbit = phase + time
        const radius = 2.4 + index * 0.78 + depth * 1.6 + audioLevel * 0.35
        const vertical = this.shapeSample(lfo.shape, orbit) * (0.35 + depth * 1.2 + treble * 0.25)

        group.position.set(
          Math.cos(orbit + index * 0.65) * radius * 0.88,
          vertical + Math.sin(orbit * 0.45) * (0.25 + bass * 0.2),
          Math.sin(orbit * 0.8 + index) * (1.1 + mid * 1.1)
        )
        group.rotation.x += 0.005 + speed * 0.0025
        group.rotation.y += 0.008 + speed * 0.003
        group.rotation.z = orbit * 0.75

        const { ring, core, aura, color } = group.userData
        const ringScale = 0.75 + depth * 1.8 + audioLevel * 0.6
        const coreScale = 0.65 + depth * 0.8 + bass * 0.9
        const auraScale = 1.15 + depth * 1.4 + treble * 0.8
        ring.scale.setScalar(ringScale)
        core.scale.setScalar(coreScale)
        aura.scale.setScalar(auraScale)

        ring.material.opacity = 0.28 + depth * 0.35 + audioLevel * 0.2
        aura.material.opacity = 0.08 + audioLevel * 0.18 + treble * 0.1
        core.material.opacity = 0.7 + bass * 0.25
        ring.material.emissive.copy(color).multiplyScalar(0.4 + audioLevel * 0.8)
      })
    },
    animate() {
      if (!this.renderer || !this.scene || !this.camera || !this.clock) return
      const tick = () => {
        const elapsed = this.clock.getElapsedTime()
        const metrics = this.audioMetrics || {}
        const audioLevel = clamp01(metrics.level)
        const bass = clamp01(metrics.bass)
        const mid = clamp01(metrics.mid)
        const treble = clamp01(metrics.treble)
        const pulse = clamp01(metrics.pulse)
        const morph = clamp01(this.morph)
        const config = this.resolvedSettings()
        const tabBoost = this.activeTab === 'LIVE' ? 1 : 0.65

        this.updateParticles(elapsed, audioLevel * tabBoost, pulse)
        this.updateHalo(elapsed, audioLevel * tabBoost, bass, morph, config)
        this.updateVolumeBeams(elapsed, audioLevel * tabBoost, bass, treble, config)
        this.updateFogSprites(elapsed, audioLevel * tabBoost, pulse, config)
        this.updateLfoGroups(elapsed, audioLevel * tabBoost, bass, mid, treble)

        this.renderer.render(this.scene, this.camera)
        this.rafId = requestAnimationFrame(tick)
      }
      this.rafId = requestAnimationFrame(tick)
    },
    teardownScene() {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', this.handleResize)
      }
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }
      if (this.rafId != null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this.rafId)
      }
      this.rafId = null

      if (this.scene) {
        this.scene.traverse((obj) => {
          if (obj.geometry && typeof obj.geometry.dispose === 'function') obj.geometry.dispose()
          if (obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
            mats.forEach((mat) => {
              if (mat && typeof mat.dispose === 'function') mat.dispose()
            })
          }
        })
      }

      if (this.renderer) {
        this.renderer.dispose()
        const canvas = this.renderer.domElement
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas)
      }
      if (this.beamMap) this.beamMap.dispose()
      if (this.mistMap) this.mistMap.dispose()

      this.renderer = null
      this.scene = null
      this.camera = null
      this.clock = null
      this.particleSystem = null
      this.particleBase = null
      this.haloMesh = null
      this.beamMeshes = []
      this.fogSprites = []
      this.beamMap = null
      this.mistMap = null
      this.lfoGroups = []
    },
  },
}
</script>

<style scoped>
.three-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.95;
  background:
    radial-gradient(circle at 50% 38%, rgba(127, 119, 221, 0.18), transparent 38%),
    radial-gradient(circle at 18% 18%, rgba(45, 226, 255, 0.14), transparent 22%),
    radial-gradient(circle at 82% 20%, rgba(255, 120, 215, 0.12), transparent 24%);
}

.three-background :deep(canvas) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
