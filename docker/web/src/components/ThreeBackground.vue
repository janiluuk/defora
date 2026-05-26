<template>
  <div ref="host" class="three-background"></div>
</template>

<script>
import * as THREE from 'three'

const LFO_COLORS = ['#7f77dd', '#2de2ff', '#ef9f27', '#e879b0', '#1d9e75', '#cecbf6']

function clamp01(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(1, n))
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
  },
  data() {
    return {
      renderer: null,
      scene: null,
      camera: null,
      clock: null,
      rafId: null,
      particleSystem: null,
      particleBase: null,
      haloMesh: null,
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
      host.appendChild(this.renderer.domElement)

      this.scene.add(new THREE.AmbientLight(0xffffff, 0.35))
      const rimLight = new THREE.PointLight(0x7f77dd, 1.8, 60)
      rimLight.position.set(6, 5, 14)
      this.scene.add(rimLight)
      const fillLight = new THREE.PointLight(0x2de2ff, 1.2, 60)
      fillLight.position.set(-6, -4, 12)
      this.scene.add(fillLight)

      this.createParticles()
      this.createHalo()
      this.createLfoGroups()
      this.handleResize()

      window.addEventListener('resize', this.handleResize)
      this.animate()
    },
    createParticles() {
      const count = 900
      const positions = new Float32Array(count * 3)
      this.particleBase = new Float32Array(count * 3)
      for (let i = 0; i < count; i += 1) {
        const radius = 8 + Math.random() * 16
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.sin(phi) * Math.sin(theta)
        const z = (Math.random() - 0.5) * 16
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
        size: 0.075,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      this.particleSystem = new THREE.Points(geometry, material)
      this.scene.add(this.particleSystem)
    },
    createHalo() {
      const geometry = new THREE.IcosahedronGeometry(4.8, 1)
      const material = new THREE.MeshBasicMaterial({
        color: 0x7f77dd,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
      })
      this.haloMesh = new THREE.Mesh(geometry, material)
      this.scene.add(this.haloMesh)
    },
    createLfoGroups() {
      this.lfoGroups = Array.from({ length: 6 }).map((_, index) => {
        const color = new THREE.Color(LFO_COLORS[index % LFO_COLORS.length])
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
    handleResize() {
      if (!this.renderer || !this.camera) return
      const width = window.innerWidth || 1
      const height = window.innerHeight || 1
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
    updateHalo(elapsed, audioLevel, bass, morph) {
      if (!this.haloMesh) return
      const haloScale = 1 + bass * 0.18 + morph * 0.05
      this.haloMesh.scale.setScalar(haloScale)
      this.haloMesh.rotation.x = elapsed * (0.08 + morph * 0.04)
      this.haloMesh.rotation.y = elapsed * (0.12 + audioLevel * 0.08)
      this.haloMesh.material.opacity = 0.06 + audioLevel * 0.14 + bass * 0.1
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
        const tabBoost = this.activeTab === 'LIVE' ? 1 : 0.65

        this.updateParticles(elapsed, audioLevel * tabBoost, pulse)
        this.updateHalo(elapsed, audioLevel * tabBoost, bass, morph)
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

      this.renderer = null
      this.scene = null
      this.camera = null
      this.clock = null
      this.particleSystem = null
      this.particleBase = null
      this.haloMesh = null
      this.lfoGroups = []
    },
  },
}
</script>

<style scoped>
.three-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.92;
}

.three-background :deep(canvas) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
