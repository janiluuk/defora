<template>
  <div ref="host" class="three-background"></div>
</template>

<script>
import * as THREE from 'three'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js'
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js'
import { Water } from 'three/addons/objects/Water.js'
import { Sky } from 'three/addons/objects/Sky.js'
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderTransitionPass } from 'three/addons/postprocessing/RenderTransitionPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js'
import {
  PROTOPLANET_SIM_WIDTH,
  PROTOPLANET_COMPUTE_POSITION,
  PROTOPLANET_COMPUTE_VELOCITY,
  PROTOPLANET_PARTICLE_VERTEX,
  PROTOPLANET_PARTICLE_FRAGMENT,
  protoplanetDefaults,
  normalizeProtoplanetSettings,
  protoplanetStaticSignature,
  fillProtoplanetTextures,
  getProtoplanetCameraConstant,
} from '../shared/protoplanet-gpgpu.mjs'
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js'
import {
  periodicTableDefaults,
  normalizePeriodicTableSettings,
  injectPeriodicTableStyles,
  removePeriodicTableStyles,
  createPeriodicElement,
  buildPeriodicLayoutTargets,
  targetsForLayout,
  beginPeriodicTransform,
  stepPeriodicTweens,
  applyPeriodicElementStyles,
  PERIODIC_LAYOUTS,
  PERIODIC_TABLE_DATA,
} from '../shared/css3d-periodic-table.mjs'

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
  return [v('--accent'), v('--cyan'), v('--warn'), v('--b-group'), v('--live'), v('--accent-text')]
}

const INSTANCING_MAX = 50000

const WEBGL_ANIMATION_MODES = [
  'instancing',
  'volume',
  'orbital',
  'nebula',
  'raycast',
  'marching',
  'ocean',
  'interactive_points',
  'interactive_raycast_points',
  'lensflares',
  'transition',
  'protoplanet',
  'periodic_table',
]

const TRANSITION_TEXTURE_COUNT = 6
const TRANSITION_INSTANCING_MAX = 2000

const INTERACTIVE_POINTS_VERTEX = `
attribute float size;
attribute vec3 customColor;
varying vec3 vColor;
void main() {
  vColor = customColor;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`

const INTERACTIVE_POINTS_FRAGMENT = `
uniform vec3 color;
uniform sampler2D pointTexture;
uniform float alphaTest;
varying vec3 vColor;
void main() {
  vec4 outColor = vec4(color * vColor, 1.0);
  outColor = outColor * texture2D(pointTexture, gl_PointCoord);
  if (outColor.a < alphaTest) discard;
  gl_FragColor = outColor;
}
`

const INSTANCING_VERTEX = `
attribute vec3 offset;
attribute vec4 color;
attribute vec4 orientationStart;
attribute vec4 orientationEnd;

uniform float sineTime;
uniform float spreadScale;

varying vec3 vPosition;
varying vec4 vColor;

void main() {
  vec3 pos = offset * spreadScale * max(abs(sineTime * 2.0 + 1.0), 0.5) + position;
  vec4 orientation = normalize(mix(orientationStart, orientationEnd, sineTime));
  vec3 vcV = cross(orientation.xyz, pos);
  pos = vcV * (2.0 * orientation.w) + (cross(orientation.xyz, vcV) * 2.0 + pos);
  vPosition = pos;
  vColor = color;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const INSTANCING_FRAGMENT = `
uniform float time;
uniform float hueShift;
uniform float shimmer;

varying vec3 vPosition;
varying vec4 vColor;

void main() {
  vec4 color = vec4(vColor);
  color.rgb = min(color.rgb * 1.25, vec3(1.0));
  color.rgb += vec3(hueShift * 0.35, hueShift * 0.18, hueShift * 0.5);
  color.r += sin(vPosition.x * 10.0 + time) * shimmer;
  color.a = max(color.a, 0.85);
  gl_FragColor = color;
}
`

function defaultSettings() {
  return {
    mode: 'instancing',
    instCount: 12000,
    beamCount: 7,
    speed: 0.75,
    spread: 0.68,
    glow: 0.78,
    hue: 0.6,
    pulse: 0.36,
    drift: 0.44,
    mist: 0.58,
    orbit: 0.52,
    lineType: 'segments',
    lineWidth: 2.4,
    lineThreshold: 0.8,
    lineTranslation: 0,
    lineWorldUnits: true,
    lineVisualizeThreshold: false,
    lineAlphaToCoverage: true,
    lineAnimate: true,
    mcMaterial: 'shiny',
    mcNumBlobs: 10,
    mcResolution: 28,
    mcIsolation: 80,
    mcFloor: true,
    mcWallX: false,
    mcWallZ: false,
    ocElevation: 2,
    ocAzimuth: 180,
    ocExposure: 0.1,
    ocDistortion: 3.7,
    ocSize: 1,
    ocCloudCoverage: 0.4,
    ocCloudDensity: 0.5,
    ocCloudElevation: 0.5,
    txTransition: 0.5,
    txTransitionAnimate: true,
    txSceneAnimate: true,
    txUseTexture: true,
    txTexture: 0,
    txCycle: true,
    txThreshold: 0.1,
    ...protoplanetDefaults(),
    ppRestartSerial: 0,
    ...periodicTableDefaults(),
  }
}

function marchingColors() {
  return [
    new THREE.Color(0xff5f6d),
    new THREE.Color(0xffc371),
    new THREE.Color(0xe8ff7a),
    new THREE.Color(0x50fa7b),
    new THREE.Color(0x5cc8ff),
    new THREE.Color(0x7f77dd),
    new THREE.Color(0xff78d7),
  ]
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
    // Keep only plain Vue state here. Three.js objects MUST NOT be reactive (Vue 3 Proxy
    // breaks modelViewMatrix during WebGLRenderer.render).
    return {
      dragState: null,
      marchingResolution: 28,
      marchingMaterialKey: 'shiny',
      oceanSettingsKey: '',
      baseRendererToneMapping: null,
      baseRendererExposure: 1,
    }
  },
  created() {
    this.renderer = null
    this.scene = null
    this.camera = null
    this.clock = null
    this.rafId = null
    this.resizeObserver = null
    this.particleSystem = null
    this.particleBase = null
    this.haloMesh = null
    this.beamMeshes = []
    this.fogSprites = []
    this.beamMap = null
    this.mistMap = null
    this.lfoGroups = []
    this.fatLineRoot = null
    this.fatLine = null
    this.fatThresholdLine = null
    this.fatSegments = null
    this.fatThresholdSegments = null
    this.marchingRoot = null
    this.marchingEffect = null
    this.marchingMaterials = null
    this.oceanRoot = null
    this.oceanSky = null
    this.oceanWater = null
    this.oceanMesh = null
    this.oceanSun = null
    this.oceanPmrem = null
    this.oceanPmremTarget = null
    this.oceanNormalsTexture = null
    this.instancingRoot = null
    this.instancingMesh = null
    this.customLightsRoot = null
    this.customLightsMaterial = null
    this.customLightsLights = []
    this.customLightsGlows = []
    this.deforumBackdropMesh = null
    this.deforumBackdropTexture = null
    this.deforumBackdropUrl = ''
    this.deforumBackdropOpacity = 0
    this.transitionComposer = null
    this.transitionRenderPass = null
    this.transitionTextures = []
    this.transitionFxA = null
    this.transitionFxB = null
    this.transitionAnimPhase = 0
    this.transitionLastMix = -1
    this.transitionRuntimeMix = 0.5
    this.transitionCycleTextureIndex = 0
    this.protoplanetScene = null
    this.protoplanetCamera = null
    this.protoplanetParticles = null
    this.protoplanetGpuCompute = null
    this.protoplanetVelocityVariable = null
    this.protoplanetPositionVariable = null
    this.protoplanetVelocityUniforms = null
    this.protoplanetParticleUniforms = null
    this.protoplanetInitError = null
    this.protoplanetStaticSignature = ''
    this.protoplanetLastRestartSerial = -1
    this.periodicScene = null
    this.periodicCamera = null
    this.periodicCss3dRenderer = null
    this.periodicObjects = []
    this.periodicTargets = null
    this.periodicTweens = []
    this.periodicLastLayout = ''
    this.periodicLastSpacing = -1
    this.periodicStyleKey = ''
    this.periodicAutoCycleTimer = 0
    this.periodicAutoCycleLayoutIndex = 0
  },
  mounted() {
    if (typeof window === 'undefined') return
    this.scheduleStartup()
    if (typeof document !== 'undefined') {
      this._visibilityHandler = () => {
        if (document.visibilityState === 'visible') this.ensureRunning()
      }
      document.addEventListener('visibilitychange', this._visibilityHandler)
    }
  },
  beforeUnmount() {
    if (typeof document !== 'undefined' && this._visibilityHandler) {
      document.removeEventListener('visibilitychange', this._visibilityHandler)
    }
    const host = this.$refs.host
    if (host && this._onPointerMove) {
      host.removeEventListener('pointermove', this._onPointerMove)
    }
    this.teardownScene()
  },
  methods: {
    scheduleStartup() {
      this.$nextTick(() => {
        requestAnimationFrame(() => this.startWhenReady())
      })
    },
    startWhenReady(attempts = 0) {
      const host = this.$refs.host
      if (!host) {
        if (attempts < 90) requestAnimationFrame(() => this.startWhenReady(attempts + 1))
        return
      }
      const width = host.clientWidth || 0
      const height = host.clientHeight || 0
      if ((width < 2 || height < 2) && attempts < 90) {
        requestAnimationFrame(() => this.startWhenReady(attempts + 1))
        return
      }
      if (!this.renderer) this.initScene()
      else this.ensureRunning()
    },
    ensureRunning() {
      if (!this.renderer || !this.scene || !this.camera || !this.clock) {
        this.scheduleStartup()
        return
      }
      this.handleResize()
      if (this.rafId == null) this.animate()
    },
    createDeforumBackdrop() {
      if (!this.scene || this.deforumBackdropMesh) return
      const geometry = new THREE.PlaneGeometry(36, 20)
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      this.deforumBackdropMesh = new THREE.Mesh(geometry, material)
      this.deforumBackdropMesh.position.z = -14
      this.deforumBackdropMesh.renderOrder = -200
      this.deforumBackdropMesh.visible = false
      this.scene.add(this.deforumBackdropMesh)
    },
    updateDeforumBackdropOpacity(opacity) {
      const next = clamp01(opacity)
      this.deforumBackdropOpacity = next
      if (!this.deforumBackdropMesh) return
      const material = this.deforumBackdropMesh.material
      material.opacity = next
      this.deforumBackdropMesh.visible = next > 0.001 && !!material.map
    },
    setDeforumBackdropFromUrl(url, { opacity = 0.35 } = {}) {
      if (!url || !this.scene) return
      if (!this.deforumBackdropMesh) this.createDeforumBackdrop()
      const nextOpacity = clamp01(opacity)
      if (this.deforumBackdropUrl === url && this.deforumBackdropTexture) {
        this.updateDeforumBackdropOpacity(nextOpacity)
        return
      }
      const loader = new THREE.TextureLoader()
      loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          if (this.deforumBackdropTexture) this.deforumBackdropTexture.dispose()
          this.deforumBackdropTexture = texture
          this.deforumBackdropUrl = url
          this.deforumBackdropMesh.material.map = texture
          this.deforumBackdropMesh.material.needsUpdate = true
          this.updateDeforumBackdropOpacity(nextOpacity)
        },
        undefined,
        () => {},
      )
    },
    clearDeforumBackdrop() {
      this.deforumBackdropUrl = ''
      this.updateDeforumBackdropOpacity(0)
      if (this.deforumBackdropTexture) {
        this.deforumBackdropTexture.dispose()
        this.deforumBackdropTexture = null
      }
      if (this.deforumBackdropMesh?.material) {
        this.deforumBackdropMesh.material.map = null
      }
    },
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
      this.baseRendererToneMapping = this.renderer.toneMapping
      this.baseRendererExposure = this.renderer.toneMappingExposure
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

      this.createDeforumBackdrop()
      this.createParticles()
      this.createHalo()
      this.createVolumeBeams()
      this.createFogSprites()
      this.createFatLines()
      this.createMarchingField()
      this.createOceanScene()
      this.createInstancingField()
      this.createInteractivePointsScene()
      this.createInteractiveRaycastScene()
      this.createLensflaresScene()
      this.createTransitionPostprocess()
      this.createProtoplanetScene()
      this.createPeriodicTableScene()
      this.createLfoGroups()
      this.raycaster = new THREE.Raycaster()
      this.bindPointerHandlers()
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
    createFatLines() {
      const points = []
      const positions = []
      const colors = []

      for (let i = -32; i < 32; i += 1) {
        const t = i / 2.8
        points.push(
          new THREE.Vector3(
            t * Math.sin(1.8 * t) * 0.72,
            t * 0.56,
            t * Math.cos(1.8 * t) * 0.72
          )
        )
      }

      const spline = new THREE.CatmullRomCurve3(points)
      const divisions = Math.max(96, Math.round(points.length * 3.5))
      const point = new THREE.Vector3()
      const color = new THREE.Color()

      for (let i = 0; i < divisions; i += 1) {
        const t = i / Math.max(1, divisions - 1)
        spline.getPoint(t, point)
        positions.push(point.x, point.y, point.z)
        color.setHSL((t * 0.92 + 0.06) % 1, 0.9, 0.6)
        colors.push(color.r, color.g, color.b)
      }

      const lineGeometry = new LineGeometry()
      lineGeometry.setPositions(positions)
      lineGeometry.setColors(colors)

      const segmentsGeometry = new LineSegmentsGeometry()
      segmentsGeometry.setPositions(positions)
      segmentsGeometry.setColors(colors)

      const createMaterial = ({ threshold = false } = {}) => new LineMaterial({
        color: 0xffffff,
        linewidth: threshold ? 3 : 2.4,
        worldUnits: true,
        vertexColors: !threshold,
        transparent: threshold,
        opacity: threshold ? 0.18 : 0.94,
        depthTest: !threshold,
        alphaToCoverage: true,
      })

      this.fatLineRoot = new THREE.Group()
      this.fatLineRoot.visible = false
      this.scene.add(this.fatLineRoot)

      this.fatLine = new Line2(lineGeometry, createMaterial())
      this.fatLine.computeLineDistances()
      this.fatLineRoot.add(this.fatLine)

      this.fatThresholdLine = new Line2(lineGeometry, createMaterial({ threshold: true }))
      this.fatThresholdLine.computeLineDistances()
      this.fatThresholdLine.visible = false
      this.fatLineRoot.add(this.fatThresholdLine)

      this.fatSegments = new LineSegments2(segmentsGeometry, createMaterial())
      this.fatSegments.computeLineDistances()
      this.fatSegments.visible = false
      this.fatLineRoot.add(this.fatSegments)

      this.fatThresholdSegments = new LineSegments2(segmentsGeometry, createMaterial({ threshold: true }))
      this.fatThresholdSegments.computeLineDistances()
      this.fatThresholdSegments.visible = false
      this.fatLineRoot.add(this.fatThresholdSegments)
    },
    createMarchingMaterials() {
      return {
        shiny: new THREE.MeshStandardMaterial({ color: 0xa3112a, roughness: 0.12, metalness: 0.85, emissive: 0x260510 }),
        chrome: new THREE.MeshStandardMaterial({ color: 0xe7ecff, roughness: 0.06, metalness: 1 }),
        liquid: new THREE.MeshPhysicalMaterial({ color: 0x7ad7ff, roughness: 0.04, transmission: 0.15, thickness: 0.8, metalness: 0.05 }),
        matte: new THREE.MeshPhongMaterial({ color: 0xc7b9ff, specular: 0x2a214b, shininess: 12 }),
        flat: new THREE.MeshLambertMaterial({ color: 0x9ae3ff, flatShading: true }),
        plastic: new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xc1c1c1, shininess: 220 }),
        colors: new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 32, vertexColors: true }),
        multiColors: new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 64, vertexColors: true }),
      }
    },
    createMarchingField() {
      this.marchingMaterials = this.createMarchingMaterials()
      this.marchingRoot = new THREE.Group()
      this.marchingRoot.visible = false
      this.scene.add(this.marchingRoot)

      this.marchingEffect = new MarchingCubes(28, this.marchingMaterials.shiny, false, false, 20000)
      this.marchingEffect.position.set(0, 0, 0)
      this.marchingEffect.scale.set(8.2, 8.2, 8.2)
      this.marchingEffect.isolation = 80
      this.marchingRoot.add(this.marchingEffect)
      this.marchingResolution = 28
      this.marchingMaterialKey = 'shiny'
    },
    createOceanScene() {
      this.oceanRoot = new THREE.Group()
      this.oceanRoot.visible = false
      this.scene.add(this.oceanRoot)
      this.oceanSun = new THREE.Vector3()

      const sky = new Sky()
      sky.scale.setScalar(10000)
      this.oceanSky = sky
      const skyUniforms = sky.material.uniforms
      skyUniforms.turbidity.value = 10
      skyUniforms.rayleigh.value = 2
      skyUniforms.mieCoefficient.value = 0.005
      skyUniforms.mieDirectionalG.value = 0.8
      this.oceanRoot.add(sky)

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(8, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xe7ecff, roughness: 0, metalness: 0.15 })
      )
      mesh.position.set(0, 5, 0)
      this.oceanMesh = mesh
      this.oceanRoot.add(mesh)

      this.oceanPmrem = new THREE.PMREMGenerator(this.renderer)

      const loader = new THREE.TextureLoader()
      loader.load('/textures/waternormals.jpg', (texture) => {
        if (!this.oceanRoot) {
          texture.dispose()
          return
        }
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        this.oceanNormalsTexture = texture

        const waterGeometry = new THREE.PlaneGeometry(500, 500, 1, 1)
        this.oceanWater = new Water(waterGeometry, {
          textureWidth: 512,
          textureHeight: 512,
          waterNormals: texture,
          sunDirection: new THREE.Vector3(),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 3.7,
          fog: false,
        })
        this.oceanWater.rotation.x = -Math.PI / 2
        this.oceanRoot.add(this.oceanWater)
        this.syncOceanSettings(this.resolvedSettings())
      })
    },
    oceanSettingsSignature(config) {
      return [
        config.ocElevation,
        config.ocAzimuth,
        config.ocExposure,
        config.ocDistortion,
        config.ocSize,
        config.ocCloudCoverage,
        config.ocCloudDensity,
        config.ocCloudElevation,
      ].join('|')
    },
    syncOceanSettings(config) {
      if (!this.oceanSky || !this.oceanWater) return
      const signature = this.oceanSettingsSignature(config)
      if (this.oceanSettingsKey === signature) return
      this.oceanSettingsKey = signature

      const phi = THREE.MathUtils.degToRad(90 - config.ocElevation)
      const theta = THREE.MathUtils.degToRad(config.ocAzimuth)
      this.oceanSun.setFromSphericalCoords(1, phi, theta)

      const skyUniforms = this.oceanSky.material.uniforms
      skyUniforms.sunPosition.value.copy(this.oceanSun)
      skyUniforms.cloudCoverage.value = config.ocCloudCoverage
      skyUniforms.cloudDensity.value = config.ocCloudDensity
      skyUniforms.cloudElevation.value = config.ocCloudElevation

      const waterUniforms = this.oceanWater.material.uniforms
      waterUniforms.sunDirection.value.copy(this.oceanSun).normalize()
      waterUniforms.distortionScale.value = config.ocDistortion
      waterUniforms.size.value = config.ocSize

      if (this.oceanPmremTarget) {
        this.oceanPmremTarget.dispose()
        this.oceanPmremTarget = null
      }
      const sceneEnv = new THREE.Scene()
      sceneEnv.add(this.oceanSky)
      this.oceanPmremTarget = this.oceanPmrem.fromScene(sceneEnv)
      this.oceanRoot.add(this.oceanSky)
      this.scene.environment = this.oceanPmremTarget.texture
    },
    updateOceanScene(elapsed, config, delta) {
      if (!this.oceanRoot || !this.oceanWater || !this.oceanSky || !this.oceanMesh) return

      this.oceanRoot.visible = true
      this.syncOceanSettings(config)

      const waveRate = Math.max(0.1, Number(config.speed) || 0.75)
      const time = performance.now() * 0.001
      this.oceanWater.material.uniforms.time.value += delta * waveRate
      this.oceanSky.material.uniforms.time.value = time

      this.oceanMesh.position.y = Math.sin(time * waveRate) * 4 + 5
      this.oceanMesh.rotation.x = time * 0.5 * waveRate
      this.oceanMesh.rotation.z = time * 0.51 * waveRate

      if (this.renderer) {
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = config.ocExposure
      }
    },
    restoreRendererToneMapping() {
      if (!this.renderer) return
      this.renderer.toneMapping = this.baseRendererToneMapping ?? THREE.NoToneMapping
      this.renderer.toneMappingExposure = this.baseRendererExposure ?? 1
    },
    createInstancingField() {
      const vector = new THREE.Vector4()
      const offsets = []
      const colors = []
      const orientationsStart = []
      const orientationsEnd = []

      for (let i = 0; i < INSTANCING_MAX; i += 1) {
        offsets.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        colors.push(Math.random(), Math.random(), Math.random(), Math.random())
        vector.set(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        )
        vector.normalize()
        orientationsStart.push(vector.x, vector.y, vector.z, vector.w)
        vector.set(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        )
        vector.normalize()
        orientationsEnd.push(vector.x, vector.y, vector.z, vector.w)
      }

      const positions = [
        0.025, -0.025, 0,
        -0.025, 0.025, 0,
        0, 0, 0.025,
      ]

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3))
      geometry.setAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 4))
      geometry.setAttribute('orientationStart', new THREE.InstancedBufferAttribute(new Float32Array(orientationsStart), 4))
      geometry.setAttribute('orientationEnd', new THREE.InstancedBufferAttribute(new Float32Array(orientationsEnd), 4))
      geometry.instanceCount = defaultSettings().instCount

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          sineTime: { value: 0 },
          spreadScale: { value: 1 },
          hueShift: { value: 0.6 },
          shimmer: { value: 0.5 },
        },
        vertexShader: INSTANCING_VERTEX,
        fragmentShader: INSTANCING_FRAGMENT,
        glslVersion: THREE.GLSL1,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })

      this.instancingMesh = new THREE.Mesh(geometry, material)
      this.instancingRoot = new THREE.Group()
      this.instancingRoot.add(this.instancingMesh)
      this.instancingRoot.visible = false
      this.scene.add(this.instancingRoot)
    },
    updateInstancingScene(elapsed, config, audioLevel) {
      if (!this.instancingRoot || !this.instancingMesh) return

      const geometry = this.instancingMesh.geometry
      const material = this.instancingMesh.material
      const count = clamp(Math.round(Number(config.instCount) || defaultSettings().instCount), 1000, INSTANCING_MAX)
      if (geometry.instanceCount !== count) geometry.instanceCount = count

      const spread = clamp(Number(config.spread) || 1, 0.2, 2.5)
      material.uniforms.spreadScale.value = spread
      material.uniforms.hueShift.value = clamp01(config.hue == null ? 0.6 : Number(config.hue))
      material.uniforms.shimmer.value = 0.15 + clamp(Number(config.glow) || 0.78, 0.1, 1.4) * 0.55 + audioLevel * 0.25

      const rate = Math.max(0.1, Number(config.speed) || 0.75)
      const time = performance.now()
      this.instancingRoot.visible = true
      this.instancingMesh.rotation.y = elapsed * 0.0005 * rate * 12
      material.uniforms.time.value = time * 0.005 * rate * (1 + audioLevel * 0.35)
      material.uniforms.sineTime.value = Math.sin(material.uniforms.time.value * 0.05)
    },
    initCustomLightsScene() {
      if (this.customLightsRoot) return
      this.customLightsRoot = new THREE.Group()
      this.customLightsRoot.visible = false
      this.scene.add(this.customLightsRoot)

      // 500k point cloud spanning a 3-unit cube, matching the original example
      const count = 500000
      const positions = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 3
        positions[i * 3 + 1] = (Math.random() - 0.5) * 3
        positions[i * 3 + 2] = (Math.random() - 0.5) * 3
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

      // Custom shader: per-point lighting from three moving point lights
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uL1: { value: new THREE.Vector3() },
          uL2: { value: new THREE.Vector3() },
          uL3: { value: new THREE.Vector3() },
          uC1: { value: new THREE.Color(0xffaa00) },
          uC2: { value: new THREE.Color(0x0044ff) },
          uC3: { value: new THREE.Color(0x44ff88) },
          uRadius: { value: 1.1 },
        },
        vertexShader: `
          uniform vec3 uL1; uniform vec3 uL2; uniform vec3 uL3;
          uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3;
          uniform float uRadius;
          varying vec3 vColor;
          void main() {
            vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
            float a1 = max(0.0, 1.0 - length(wp - uL1) / uRadius);
            float a2 = max(0.0, 1.0 - length(wp - uL2) / uRadius);
            float a3 = max(0.0, 1.0 - length(wp - uL3) / uRadius);
            vColor = uC1 * a1 * a1 + uC2 * a2 * a2 + uC3 * a3 * a3;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 1.5;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            if (dot(vColor, vColor) < 0.002) discard;
            gl_FragColor = vec4(vColor, 1.0);
          }
        `,
        transparent: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      this.customLightsMaterial = mat
      this.customLightsRoot.add(new THREE.Points(geo, mat))

      // Small glowing spheres at each light position (visual anchors)
      const glowGeo = new THREE.SphereGeometry(0.022, 16, 8)
      const lightDefs = [0xffaa00, 0x0044ff, 0x44ff88]
      this.customLightsGlows = lightDefs.map((hex) => {
        const mesh = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ color: hex }))
        this.customLightsRoot.add(mesh)
        return mesh
      })
      this.customLightsLights = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
    },
    updateCustomLightsScene(elapsed, config) {
      if (!this.customLightsRoot || !this.customLightsMaterial) return
      this.customLightsRoot.visible = true

      const t = elapsed
      const scale = 0.55 + clamp01(Number(config.spread) || 0.68) * 0.3
      const spd = Math.max(0.1, Number(config.speed) || 0.75)
      const T = t * spd

      const l1 = this.customLightsLights[0]
      const l2 = this.customLightsLights[1]
      const l3 = this.customLightsLights[2]

      l1.set(Math.sin(T * 0.7) * scale, Math.cos(T * 0.5) * scale, Math.cos(T * 0.3) * scale)
      l2.set(Math.cos(T * 0.3) * scale, Math.sin(T * 0.5) * scale, Math.sin(T * 0.7) * scale)
      l3.set(Math.sin(T * 0.7) * scale, Math.cos(T * 0.3) * scale, Math.sin(T * 0.5) * scale)

      const u = this.customLightsMaterial.uniforms
      u.uL1.value.copy(l1)
      u.uL2.value.copy(l2)
      u.uL3.value.copy(l3)
      u.uRadius.value = 0.85 + clamp01(Number(config.glow) || 0.78) * 0.55

      this.customLightsGlows[0].position.copy(l1)
      this.customLightsGlows[1].position.copy(l2)
      this.customLightsGlows[2].position.copy(l3)

      this.customLightsRoot.rotation.y = T * 0.1
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
        mode: ['instancing', 'volume', 'orbital', 'nebula', 'raycast', 'marching', 'ocean', 'customlights', 'transition', 'protoplanet', 'periodic_table'].includes(merged.mode) ? merged.mode : 'instancing',
        instCount: clamp(Math.round(Number(merged.instCount) || defaultSettings().instCount), 1000, INSTANCING_MAX),
        beamCount: clamp(Math.round(Number(merged.beamCount) || 7), 3, 12),
        speed: clamp(Number(merged.speed) || 0.75, 0.1, 2.5),
        spread: clamp(Number(merged.spread) || 0.68, 0.2, 2.5),
        glow: clamp(Number(merged.glow) || 0.78, 0.1, 1.4),
        hue: clamp01(merged.hue == null ? 0.6 : Number(merged.hue)),
        pulse: clamp01(merged.pulse == null ? 0.36 : Number(merged.pulse)),
        drift: clamp01(merged.drift == null ? 0.44 : Number(merged.drift)),
        mist: clamp01(merged.mist == null ? 0.58 : Number(merged.mist)),
        orbit: clamp01(merged.orbit == null ? 0.52 : Number(merged.orbit)),
        lineType: merged.lineType === 'line' ? 'line' : 'segments',
        lineWidth: clamp(Number(merged.lineWidth) || 2.4, 1, 10),
        lineThreshold: clamp(merged.lineThreshold == null ? 0.8 : Number(merged.lineThreshold), 0, 10),
        lineTranslation: clamp(merged.lineTranslation == null ? 0 : Number(merged.lineTranslation), 0, 10),
        lineWorldUnits: merged.lineWorldUnits !== false,
        lineVisualizeThreshold: !!merged.lineVisualizeThreshold,
        lineAlphaToCoverage: merged.lineAlphaToCoverage !== false,
        lineAnimate: merged.lineAnimate !== false,
        mcMaterial: ['shiny', 'chrome', 'liquid', 'matte', 'flat', 'plastic', 'colors', 'multiColors'].includes(merged.mcMaterial) ? merged.mcMaterial : 'shiny',
        mcNumBlobs: clamp(Math.round(Number(merged.mcNumBlobs) || 10), 1, 50),
        mcResolution: clamp(Math.round(Number(merged.mcResolution) || 28), 14, 100),
        mcIsolation: clamp(Math.round(Number(merged.mcIsolation) || 80), 10, 300),
        mcFloor: merged.mcFloor !== false,
        mcWallX: !!merged.mcWallX,
        mcWallZ: !!merged.mcWallZ,
        ocElevation: clamp(Number(merged.ocElevation) || 2, 0, 90),
        ocAzimuth: clamp(Number(merged.ocAzimuth) || 180, -180, 180),
        ocExposure: clamp(Number(merged.ocExposure) || 0.1, 0, 1),
        ocDistortion: clamp(Number(merged.ocDistortion) || 3.7, 0, 8),
        ocSize: clamp(Number(merged.ocSize) || 1, 0.1, 10),
        ocCloudCoverage: clamp01(merged.ocCloudCoverage == null ? 0.4 : Number(merged.ocCloudCoverage)),
        ocCloudDensity: clamp01(merged.ocCloudDensity == null ? 0.5 : Number(merged.ocCloudDensity)),
        ocCloudElevation: clamp01(merged.ocCloudElevation == null ? 0.5 : Number(merged.ocCloudElevation)),
        txTransition: clamp01(merged.txTransition == null ? 0.5 : Number(merged.txTransition)),
        txTransitionAnimate: merged.txTransitionAnimate !== false,
        txSceneAnimate: merged.txSceneAnimate !== false,
        txUseTexture: merged.txUseTexture !== false,
        txTexture: clamp(Math.round(Number(merged.txTexture) || 0), 0, TRANSITION_TEXTURE_COUNT - 1),
        txCycle: merged.txCycle !== false,
        txThreshold: clamp01(merged.txThreshold == null ? 0.1 : Number(merged.txThreshold)),
        ...normalizeProtoplanetSettings(merged),
        ppRestartSerial: Math.max(0, Math.round(Number(merged.ppRestartSerial) || 0)),
        ...normalizePeriodicTableSettings(merged),
      }
    },
    transitionTextureUrl(index) {
      const i = clamp(Math.round(Number(index) || 0), 0, TRANSITION_TEXTURE_COUNT - 1) + 1
      return `/textures/transition/transition${i}.png`
    },
    loadTransitionTextures() {
      if (this.transitionTextures.length >= TRANSITION_TEXTURE_COUNT) return
      const loader = new THREE.TextureLoader()
      this.transitionTextures = []
      for (let i = 0; i < TRANSITION_TEXTURE_COUNT; i += 1) {
        const texture = loader.load(
          this.transitionTextureUrl(i),
          undefined,
          undefined,
          () => {
            texture.dispose()
          },
        )
        texture.colorSpace = THREE.SRGBColorSpace
        this.transitionTextures.push(texture)
      }
    },
    buildTransitionInstancedMesh(geometry, material, count) {
      const mesh = new THREE.InstancedMesh(geometry, material, count)
      const dummy = new THREE.Object3D()
      const color = new THREE.Color()
      const isBox = geometry.type === 'BoxGeometry'

      for (let i = 0; i < count; i += 1) {
        dummy.position.set(
          Math.random() * 100 - 50,
          Math.random() * 60 - 30,
          Math.random() * 80 - 40,
        )
        dummy.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        )
        dummy.scale.x = Math.random() * 2 + 1
        if (isBox) {
          dummy.scale.y = Math.random() * 2 + 1
          dummy.scale.z = Math.random() * 2 + 1
        } else {
          dummy.scale.y = dummy.scale.x
          dummy.scale.z = dummy.scale.x
        }
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        mesh.setColorAt(i, color.setScalar(0.1 + Math.random() * 0.9))
      }
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      return mesh
    },
    createTransitionFXScene(geometry, rotationSpeed, backgroundColor, meshColor) {
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
      camera.position.z = 20

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(backgroundColor)
      scene.add(new THREE.AmbientLight(0xaaaaaa, 3))

      const light = new THREE.DirectionalLight(0xffffff, 3)
      light.position.set(0, 1, 4)
      scene.add(light)

      const material = new THREE.MeshPhongMaterial({ color: meshColor, flatShading: true })
      const mesh = this.buildTransitionInstancedMesh(geometry, material, TRANSITION_INSTANCING_MAX)

      scene.add(mesh)

      return {
        scene,
        camera,
        mesh,
        rotationSpeed,
        resize(aspect) {
          camera.aspect = aspect
          camera.updateProjectionMatrix()
        },
        update(delta, animateScene) {
          if (!animateScene) return
          mesh.rotation.x += rotationSpeed.x * delta
          mesh.rotation.y += rotationSpeed.y * delta
          mesh.rotation.z += rotationSpeed.z * delta
        },
      }
    },
    createTransitionPostprocess() {
      if (this.transitionComposer || !this.renderer) return

      this.loadTransitionTextures()

      const hue = 0.6
      this.transitionFxA = this.createTransitionFXScene(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.Vector3(0, -0.4, 0),
        0x05070d,
        new THREE.Color().setHSL(hue * 0.55, 0.85, 0.45).getHex(),
      )
      this.transitionFxB = this.createTransitionFXScene(
        new THREE.IcosahedronGeometry(1, 1),
        new THREE.Vector3(0, 0.2, 0.1),
        0x0a1020,
        new THREE.Color().setHSL((hue + 0.35) % 1, 0.9, 0.5).getHex(),
      )

      this.transitionComposer = new EffectComposer(this.renderer)
      this.transitionRenderPass = new RenderTransitionPass(
        this.transitionFxA.scene,
        this.transitionFxA.camera,
        this.transitionFxB.scene,
        this.transitionFxB.camera,
      )
      if (this.transitionTextures[0]) {
        this.transitionRenderPass.setTexture(this.transitionTextures[0])
      }
      this.transitionComposer.addPass(this.transitionRenderPass)
      this.transitionComposer.addPass(new OutputPass())
    },
    resizeTransitionViews(width, height) {
      const aspect = width / height
      if (this.transitionFxA) this.transitionFxA.resize(aspect)
      if (this.transitionFxB) this.transitionFxB.resize(aspect)
      if (this.transitionComposer) this.transitionComposer.setSize(width, height)
    },
    syncTransitionInstanceCount(config) {
      const count = clamp(
        Math.round(Number(config.instCount) || defaultSettings().instCount),
        100,
        TRANSITION_INSTANCING_MAX,
      )
      if (this.transitionFxA?.mesh) this.transitionFxA.mesh.count = count
      if (this.transitionFxB?.mesh) this.transitionFxB.mesh.count = count
    },
    updateTransitionScenes(delta, config, audioLevel) {
      if (!this.transitionRenderPass) this.createTransitionPostprocess()
      if (!this.transitionRenderPass) return

      this.syncTransitionInstanceCount(config)

      const speed = Math.max(0.1, Number(config.speed) || 0.75)
      const sceneRate = speed * (1 + audioLevel * 0.35)
      const rotScale = 0.35 + clamp(Number(config.spread) || 0.68, 0.2, 2.5) * 0.35

      if (this.transitionFxA) {
        this.transitionFxA.rotationSpeed.set(0, -0.4 * rotScale, 0)
        this.transitionFxA.update(delta, config.txSceneAnimate)
      }
      if (this.transitionFxB) {
        this.transitionFxB.rotationSpeed.set(0, 0.2 * rotScale, 0.1 * rotScale)
        this.transitionFxB.update(delta, config.txSceneAnimate)
      }

      let mix = clamp01(config.txTransition == null ? 0.5 : Number(config.txTransition))
      if (config.txTransitionAnimate) {
        this.transitionAnimPhase += delta * (0.22 + speed * 0.35)
        mix = (Math.sin(this.transitionAnimPhase) + 1) * 0.5
      }

      const textureIndex = clamp(Math.round(Number(config.txTexture) || 0), 0, TRANSITION_TEXTURE_COUNT - 1)
      if (!config.txTransitionAnimate || !config.txCycle) {
        this.transitionCycleTextureIndex = textureIndex
      } else if (config.txCycle && config.txTransitionAnimate && this.transitionTextures.length) {
        const atEndpoint = mix <= 0.02 || mix >= 0.98
        const wasAtEndpoint = this.transitionLastMix <= 0.02 || this.transitionLastMix >= 0.98
        if (atEndpoint && !wasAtEndpoint) {
          this.transitionCycleTextureIndex = (this.transitionCycleTextureIndex + 1) % TRANSITION_TEXTURE_COUNT
        }
      }
      this.transitionLastMix = mix
      this.transitionRuntimeMix = mix

      this.transitionRenderPass.setTransition(mix)
      this.transitionRenderPass.useTexture(!!config.txUseTexture)
      this.transitionRenderPass.setTextureThreshold(clamp01(config.txThreshold))
      const activeTexture = config.txCycle && config.txTransitionAnimate
        ? this.transitionCycleTextureIndex
        : textureIndex
      if (this.transitionTextures[activeTexture]) {
        this.transitionRenderPass.setTexture(this.transitionTextures[activeTexture])
      }
    },
    renderTransitionFrame() {
      if (!this.renderer || !this.transitionRenderPass) return
      const mix = this.transitionRuntimeMix

      if (mix <= 0.001 && this.transitionFxB) {
        this.renderer.render(this.transitionFxB.scene, this.transitionFxB.camera)
      } else if (mix >= 0.999 && this.transitionFxA) {
        this.renderer.render(this.transitionFxA.scene, this.transitionFxA.camera)
      } else if (this.transitionComposer) {
        this.transitionComposer.render()
      }
    },
    disposeTransitionPostprocess() {
      if (this.transitionRenderPass) {
        this.transitionRenderPass.dispose()
        this.transitionRenderPass = null
      }
      if (this.transitionComposer) {
        this.transitionComposer.passes.slice().forEach((pass) => {
          if (pass !== this.transitionRenderPass && typeof pass.dispose === 'function') pass.dispose()
        })
        this.transitionComposer = null
      }
      this.transitionTextures.forEach((tex) => {
        if (tex && typeof tex.dispose === 'function') tex.dispose()
      })
      this.transitionTextures = []

      const disposeFx = (fx) => {
        if (!fx) return
        if (fx.mesh) {
          if (fx.mesh.geometry) fx.mesh.geometry.dispose()
          if (fx.mesh.material) fx.mesh.material.dispose()
        }
        fx.scene?.traverse((obj) => {
          if (obj.geometry && obj !== fx.mesh && typeof obj.geometry.dispose === 'function') obj.geometry.dispose()
          if (obj.material && obj !== fx.mesh) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
            mats.forEach((mat) => { if (mat && typeof mat.dispose === 'function') mat.dispose() })
          }
        })
      }
      disposeFx(this.transitionFxA)
      disposeFx(this.transitionFxB)
      this.transitionFxA = null
      this.transitionFxB = null
      this.transitionAnimPhase = 0
      this.transitionLastMix = -1
    },
    createProtoplanetScene() {
      if (this.protoplanetScene || !this.renderer) return

      this.protoplanetScene = new THREE.Scene()
      this.protoplanetScene.background = new THREE.Color(0x05070d)

      this.protoplanetCamera = new THREE.PerspectiveCamera(75, 1, 5, 15000)
      this.protoplanetCamera.position.set(0, 120, 400)

      const width = PROTOPLANET_SIM_WIDTH
      const particles = width * width
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particles * 3)
      let p = 0
      const radius = protoplanetDefaults().ppRadius
      for (let i = 0; i < particles; i += 1) {
        positions[p++] = (Math.random() * 2 - 1) * radius
        positions[p++] = 0
        positions[p++] = (Math.random() * 2 - 1) * radius
      }
      const uvs = new Float32Array(particles * 2)
      p = 0
      for (let j = 0; j < width; j += 1) {
        for (let i = 0; i < width; i += 1) {
          uvs[p++] = i / (width - 1)
          uvs[p++] = j / (width - 1)
        }
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

      this.protoplanetParticleUniforms = {
        texturePosition: { value: null },
        textureVelocity: { value: null },
        cameraConstant: { value: 1 },
        density: { value: protoplanetDefaults().ppDensity },
        hueTint: { value: protoplanetDefaults().ppHue },
      }

      const material = new THREE.ShaderMaterial({
        uniforms: this.protoplanetParticleUniforms,
        vertexShader: PROTOPLANET_PARTICLE_VERTEX,
        fragmentShader: PROTOPLANET_PARTICLE_FRAGMENT,
        glslVersion: THREE.GLSL1,
      })

      this.protoplanetParticles = new THREE.Points(geometry, material)
      this.protoplanetParticles.matrixAutoUpdate = false
      this.protoplanetParticles.updateMatrix()
      this.protoplanetScene.add(this.protoplanetParticles)

      this.protoplanetGpuCompute = new GPUComputationRenderer(width, width, this.renderer)
      const dtPosition = this.protoplanetGpuCompute.createTexture()
      const dtVelocity = this.protoplanetGpuCompute.createTexture()

      this.protoplanetVelocityVariable = this.protoplanetGpuCompute.addVariable(
        'textureVelocity',
        PROTOPLANET_COMPUTE_VELOCITY,
        dtVelocity,
      )
      this.protoplanetPositionVariable = this.protoplanetGpuCompute.addVariable(
        'texturePosition',
        PROTOPLANET_COMPUTE_POSITION,
        dtPosition,
      )

      this.protoplanetGpuCompute.setVariableDependencies(this.protoplanetVelocityVariable, [
        this.protoplanetPositionVariable,
        this.protoplanetVelocityVariable,
      ])
      this.protoplanetGpuCompute.setVariableDependencies(this.protoplanetPositionVariable, [
        this.protoplanetPositionVariable,
        this.protoplanetVelocityVariable,
      ])

      this.protoplanetVelocityUniforms = this.protoplanetVelocityVariable.material.uniforms
      this.protoplanetVelocityUniforms.gravityConstant = { value: protoplanetDefaults().ppGravityConstant }
      this.protoplanetVelocityUniforms.density = { value: protoplanetDefaults().ppDensity }

      this.protoplanetInitError = this.protoplanetGpuCompute.init()
      if (this.protoplanetInitError) {
        console.error('[ThreeBackground] protoplanet GPGPU init failed:', this.protoplanetInitError)
        return
      }

      this.restartProtoplanetSimulation(this.resolvedSettings())
    },
    restartProtoplanetSimulation(config) {
      if (!this.protoplanetGpuCompute || this.protoplanetInitError) return

      const params = normalizeProtoplanetSettings(config)
      const dtPosition = this.protoplanetGpuCompute.createTexture()
      const dtVelocity = this.protoplanetGpuCompute.createTexture()
      fillProtoplanetTextures(dtPosition, dtVelocity, params, PROTOPLANET_SIM_WIDTH)

      this.protoplanetGpuCompute.renderTexture(dtPosition, this.protoplanetPositionVariable.renderTargets[0])
      this.protoplanetGpuCompute.renderTexture(dtPosition, this.protoplanetPositionVariable.renderTargets[1])
      this.protoplanetGpuCompute.renderTexture(dtVelocity, this.protoplanetVelocityVariable.renderTargets[0])
      this.protoplanetGpuCompute.renderTexture(dtVelocity, this.protoplanetVelocityVariable.renderTargets[1])

      this.protoplanetStaticSignature = protoplanetStaticSignature(params)
      this.applyProtoplanetDynamicUniforms(params)
    },
    applyProtoplanetDynamicUniforms(params) {
      if (!this.protoplanetVelocityUniforms || !this.protoplanetParticleUniforms) return
      const p = normalizeProtoplanetSettings(params)
      this.protoplanetVelocityUniforms.gravityConstant.value = p.ppGravityConstant
      this.protoplanetVelocityUniforms.density.value = p.ppDensity
      this.protoplanetParticleUniforms.density.value = p.ppDensity
      this.protoplanetParticleUniforms.hueTint.value = p.ppHue
    },
    updateProtoplanetScene(elapsed, config) {
      if (!this.protoplanetScene || !this.protoplanetCamera || this.protoplanetInitError) return
      if (!this.protoplanetGpuCompute) this.createProtoplanetScene()
      if (!this.protoplanetGpuCompute || this.protoplanetInitError) return

      const params = normalizeProtoplanetSettings(config)
      const staticSig = protoplanetStaticSignature(params)
      const restartSerial = Math.round(Number(config.ppRestartSerial) || 0)

      if (
        restartSerial !== this.protoplanetLastRestartSerial
        || staticSig !== this.protoplanetStaticSignature
      ) {
        this.restartProtoplanetSimulation(config)
        this.protoplanetLastRestartSerial = restartSerial
      } else {
        this.applyProtoplanetDynamicUniforms(params)
      }

      this.protoplanetGpuCompute.compute()

      this.protoplanetParticleUniforms.texturePosition.value = this.protoplanetGpuCompute
        .getCurrentRenderTarget(this.protoplanetPositionVariable).texture
      this.protoplanetParticleUniforms.textureVelocity.value = this.protoplanetGpuCompute
        .getCurrentRenderTarget(this.protoplanetVelocityVariable).texture

      const orbitRate = Math.max(0.05, Number(config.speed) || 0.75) * 0.12
      const dist = 280 + clamp01(config.orbit == null ? 0.52 : Number(config.orbit)) * 220
      const orbit = elapsed * orbitRate
      this.protoplanetCamera.position.set(
        Math.sin(orbit) * dist * 0.35,
        90 + Math.sin(elapsed * orbitRate * 0.7) * 35,
        Math.cos(orbit) * dist,
      )
      this.protoplanetCamera.lookAt(0, 0, 0)

      const host = this.$refs.host
      const heightPx = host ? Math.max(1, host.clientHeight) : 1
      this.protoplanetParticleUniforms.cameraConstant.value = getProtoplanetCameraConstant(
        this.protoplanetCamera,
        heightPx,
      )
    },
    renderProtoplanetFrame() {
      if (!this.renderer || !this.protoplanetScene || !this.protoplanetCamera) return
      this.renderer.render(this.protoplanetScene, this.protoplanetCamera)
    },
    disposeProtoplanetScene() {
      if (this.protoplanetGpuCompute) {
        if (this.protoplanetVelocityVariable?.renderTargets) {
          this.protoplanetVelocityVariable.renderTargets.forEach((rt) => rt?.dispose?.())
        }
        if (this.protoplanetPositionVariable?.renderTargets) {
          this.protoplanetPositionVariable.renderTargets.forEach((rt) => rt?.dispose?.())
        }
      }
      if (this.protoplanetParticles) {
        if (this.protoplanetParticles.geometry) this.protoplanetParticles.geometry.dispose()
        if (this.protoplanetParticles.material) this.protoplanetParticles.material.dispose()
      }
      this.protoplanetScene = null
      this.protoplanetCamera = null
      this.protoplanetParticles = null
      this.protoplanetGpuCompute = null
      this.protoplanetVelocityVariable = null
      this.protoplanetPositionVariable = null
      this.protoplanetVelocityUniforms = null
      this.protoplanetParticleUniforms = null
      this.protoplanetInitError = null
      this.protoplanetStaticSignature = ''
      this.protoplanetLastRestartSerial = -1
    },
    createPeriodicTableScene() {
      if (this.periodicScene || typeof document === 'undefined') return
      const host = this.$refs.host
      if (!host) return

      injectPeriodicTableStyles()

      const objectCount = PERIODIC_TABLE_DATA.length / 5
      this.periodicScene = new THREE.Scene()
      this.periodicCamera = new THREE.PerspectiveCamera(40, 1, 1, 10000)
      this.periodicCamera.position.z = 3000

      this.periodicObjects = []
      const style = periodicTableDefaults()

      for (let i = 0; i < objectCount; i += 1) {
        const element = createPeriodicElement(i, {
          opacity: style.ptCardOpacity,
          hue: style.ptHue,
          scale: style.ptCardScale,
        })
        const objectCSS = new CSS3DObject(element)
        objectCSS.position.set(
          Math.random() * 4000 - 2000,
          Math.random() * 4000 - 2000,
          Math.random() * 4000 - 2000,
        )
        this.periodicScene.add(objectCSS)
        this.periodicObjects.push(objectCSS)
      }

      this.periodicTargets = buildPeriodicLayoutTargets(objectCount, style.ptSpacing)

      this.periodicCss3dRenderer = new CSS3DRenderer()
      const dom = this.periodicCss3dRenderer.domElement
      dom.style.position = 'absolute'
      dom.style.inset = '0'
      dom.style.width = '100%'
      dom.style.height = '100%'
      dom.style.pointerEvents = 'none'
      dom.style.display = 'none'
      dom.style.overflow = 'hidden'
      host.appendChild(dom)

      const width = Math.max(1, host.clientWidth || 1)
      const height = Math.max(1, host.clientHeight || 1)
      this.periodicCamera.aspect = width / height
      this.periodicCamera.updateProjectionMatrix()
      this.periodicCss3dRenderer.setSize(width, height)

      this.periodicLastLayout = ''
      this.periodicLastSpacing = -1
      this.periodicAutoCycleTimer = 0
      this.periodicAutoCycleLayoutIndex = 0
    },
    periodicTransformToLayout(layout, config) {
      if (!this.periodicTargets || !this.periodicObjects.length) return
      const params = normalizePeriodicTableSettings(config)
      const targetList = targetsForLayout(this.periodicTargets, layout)
      this.periodicTweens = beginPeriodicTransform(
        this.periodicObjects,
        targetList,
        params.ptTransitionMs,
      )
      this.periodicLastLayout = layout
      const layoutIndex = PERIODIC_LAYOUTS.indexOf(layout)
      if (layoutIndex >= 0) this.periodicAutoCycleLayoutIndex = layoutIndex
    },
    rebuildPeriodicTargets(config) {
      const params = normalizePeriodicTableSettings(config)
      const objectCount = this.periodicObjects.length
      this.periodicTargets = buildPeriodicLayoutTargets(objectCount, params.ptSpacing)
      this.periodicLastSpacing = params.ptSpacing
    },
    updatePeriodicTableScene(elapsed, config, delta) {
      if (!this.periodicScene) this.createPeriodicTableScene()
      if (!this.periodicScene || !this.periodicCamera || !this.periodicCss3dRenderer) return

      const params = normalizePeriodicTableSettings(config)
      const styleKey = `${params.ptCardOpacity}|${params.ptHue}|${params.ptCardScale}`
      if (styleKey !== this.periodicStyleKey) {
        applyPeriodicElementStyles(this.periodicObjects, {
          opacity: params.ptCardOpacity,
          hue: params.ptHue,
          scale: params.ptCardScale,
        })
        this.periodicStyleKey = styleKey
      }

      if (params.ptSpacing !== this.periodicLastSpacing) {
        this.rebuildPeriodicTargets(config)
        this.periodicTransformToLayout(params.ptLayout, config)
      } else if (params.ptLayout !== this.periodicLastLayout) {
        this.periodicTransformToLayout(params.ptLayout, config)
      }

      const tweensActive = stepPeriodicTweens(this.periodicTweens, delta * 1000)

      if (params.ptAutoCycle && !tweensActive) {
        this.periodicAutoCycleTimer += delta
        if (this.periodicAutoCycleTimer >= params.ptAutoCycleSec) {
          this.periodicAutoCycleTimer = 0
          this.periodicAutoCycleLayoutIndex = (this.periodicAutoCycleLayoutIndex + 1) % PERIODIC_LAYOUTS.length
          const nextLayout = PERIODIC_LAYOUTS[this.periodicAutoCycleLayoutIndex]
          this.periodicTransformToLayout(nextLayout, config)
        }
      } else if (!params.ptAutoCycle) {
        this.periodicAutoCycleTimer = 0
      }

      const orbitRate = Math.max(0.05, Number(config.speed) || 0.75) * 0.1
      const dist = 2200 + clamp01(config.orbit == null ? 0.52 : Number(config.orbit)) * 1400
      const orbit = elapsed * orbitRate
      this.periodicCamera.position.set(
        Math.sin(orbit) * dist * 0.45,
        120 + Math.sin(elapsed * orbitRate * 0.65) * 60,
        Math.cos(orbit) * dist,
      )
      this.periodicCamera.lookAt(0, 0, 0)

      if (this.renderer?.domElement) this.renderer.domElement.style.display = 'none'
      if (this.periodicCss3dRenderer.domElement) {
        this.periodicCss3dRenderer.domElement.style.display = 'block'
      }
    },
    renderPeriodicTableFrame() {
      if (!this.periodicCss3dRenderer || !this.periodicScene || !this.periodicCamera) return
      this.periodicCss3dRenderer.render(this.periodicScene, this.periodicCamera)
    },
    setPeriodicRendererVisible(visible) {
      if (this.periodicCss3dRenderer?.domElement) {
        this.periodicCss3dRenderer.domElement.style.display = visible ? 'block' : 'none'
      }
      if (this.renderer?.domElement) {
        this.renderer.domElement.style.display = visible ? 'none' : ''
      }
    },
    disposePeriodicTableScene() {
      if (this.periodicScene) {
        this.periodicObjects.forEach((obj) => {
          this.periodicScene.remove(obj)
          if (obj.element?.parentNode) obj.element.parentNode.removeChild(obj.element)
        })
      }
      if (this.periodicCss3dRenderer?.domElement?.parentNode) {
        this.periodicCss3dRenderer.domElement.parentNode.removeChild(this.periodicCss3dRenderer.domElement)
      }
      removePeriodicTableStyles()
      this.periodicScene = null
      this.periodicCamera = null
      this.periodicCss3dRenderer = null
      this.periodicObjects = []
      this.periodicTargets = null
      this.periodicTweens = []
      this.periodicLastLayout = ''
      this.periodicLastSpacing = -1
      this.periodicStyleKey = ''
      this.periodicAutoCycleTimer = 0
      this.setPeriodicRendererVisible(false)
    },
    handleResize() {
      if (!this.renderer || !this.camera || !this.$refs.host) return
      const width = Math.max(1, this.$refs.host.clientWidth || 0)
      const height = Math.max(1, this.$refs.host.clientHeight || 0)
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height, false)
      if (this.transitionComposer) this.resizeTransitionViews(width, height)
      if (this.protoplanetCamera) {
        this.protoplanetCamera.aspect = width / height
        this.protoplanetCamera.updateProjectionMatrix()
        if (this.protoplanetParticleUniforms) {
          this.protoplanetParticleUniforms.cameraConstant.value = getProtoplanetCameraConstant(
            this.protoplanetCamera,
            height,
          )
        }
      }
      if (this.periodicCamera && this.periodicCss3dRenderer) {
        this.periodicCamera.aspect = width / height
        this.periodicCamera.updateProjectionMatrix()
        this.periodicCss3dRenderer.setSize(width, height)
      }
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
        sprite.visible = true
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
    updateRaycastLines(elapsed, audioLevel, bass, config) {
      if (!this.fatLineRoot || !this.fatLine || !this.fatSegments || !this.fatThresholdLine || !this.fatThresholdSegments) return

      const lineVisible = config.lineType === 'line'
      const thresholdWidth = config.lineWidth + config.lineThreshold
      const xOffset = config.lineTranslation - 5

      this.fatLineRoot.visible = true
      this.fatLineRoot.position.set(xOffset, 0, 0)
      this.fatLineRoot.rotation.y = config.lineAnimate ? elapsed * 0.18 : 0.65
      this.fatLineRoot.rotation.x = config.lineAnimate ? Math.sin(elapsed * 0.17) * 0.14 : -0.16
      this.fatLineRoot.rotation.z = config.lineAnimate ? Math.cos(elapsed * 0.11) * 0.06 : 0

      this.fatLine.visible = lineVisible
      this.fatSegments.visible = !lineVisible
      this.fatThresholdLine.visible = config.lineVisualizeThreshold && lineVisible
      this.fatThresholdSegments.visible = config.lineVisualizeThreshold && !lineVisible

      ;[
        this.fatLine.material,
        this.fatSegments.material,
      ].forEach((material) => {
        material.worldUnits = config.lineWorldUnits
        material.linewidth = config.lineWidth
        material.alphaToCoverage = config.lineAlphaToCoverage
        material.opacity = 0.88 + audioLevel * 0.08 + bass * 0.04
        material.needsUpdate = true
      })

      ;[
        this.fatThresholdLine.material,
        this.fatThresholdSegments.material,
      ].forEach((material) => {
        material.worldUnits = config.lineWorldUnits
        material.linewidth = thresholdWidth
        material.alphaToCoverage = config.lineAlphaToCoverage
        material.opacity = 0.12 + audioLevel * 0.06
        material.visible = config.lineVisualizeThreshold
        material.needsUpdate = true
      })
    },
    updateMarchingField(elapsed, config) {
      if (!this.marchingRoot || !this.marchingEffect || !this.marchingMaterials) return

      const material = this.marchingMaterials[config.mcMaterial] || this.marchingMaterials.shiny
      if (this.marchingMaterialKey !== config.mcMaterial || this.marchingEffect.material !== material) {
        this.marchingEffect.material = material
        this.marchingMaterialKey = config.mcMaterial
      }

      if (this.marchingEffect.enableColors !== ['colors', 'multiColors'].includes(config.mcMaterial)) {
        this.marchingEffect.enableColors = ['colors', 'multiColors'].includes(config.mcMaterial)
      }

      if (this.marchingEffect.enableUvs) {
        this.marchingEffect.enableUvs = false
      }

      if (this.marchingResolution !== config.mcResolution) {
        this.marchingEffect.init(Math.floor(config.mcResolution))
        this.marchingResolution = config.mcResolution
      }

      if (this.marchingEffect.isolation !== config.mcIsolation) {
        this.marchingEffect.isolation = config.mcIsolation
      }

      this.marchingRoot.visible = true
      this.marchingRoot.rotation.y = elapsed * 0.18
      this.marchingRoot.rotation.x = Math.sin(elapsed * 0.11) * 0.08

      this.marchingEffect.reset()

      const rainbow = marchingColors()
      const strength = 1.2 / (((Math.sqrt(config.mcNumBlobs) - 1) / 4) + 1)
      const subtract = 12
      const time = elapsed * config.speed * 0.5

      for (let i = 0; i < config.mcNumBlobs; i += 1) {
        const ballx = Math.sin(i + 1.26 * time * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.27 + 0.5
        const bally = Math.abs(Math.cos(i + 1.12 * time * Math.cos(1.22 + 0.1424 * i))) * 0.77
        const ballz = Math.cos(i + 1.32 * time * 0.1 * Math.sin(0.92 + 0.53 * i)) * 0.27 + 0.5

        if (config.mcMaterial === 'multiColors') {
          this.marchingEffect.addBall(ballx, bally, ballz, strength, subtract, rainbow[i % rainbow.length])
        } else {
          this.marchingEffect.addBall(ballx, bally, ballz, strength, subtract)
        }
      }

      if (config.mcFloor) this.marchingEffect.addPlaneY(2, 12)
      if (config.mcWallZ) this.marchingEffect.addPlaneZ(2, 12)
      if (config.mcWallX) this.marchingEffect.addPlaneX(2, 12)

      this.marchingEffect.update()
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
    updateCamera(elapsed, config) {
      if (!this.camera) return
      if (config.mode === 'raycast') {
        this.camera.position.set(-18 + Math.sin(elapsed * 0.12) * 2.5, 0, 30)
      } else if (config.mode === 'marching') {
        this.camera.position.set(-14, 12, 26)
      } else if (config.mode === 'ocean') {
        this.camera.position.set(24 + Math.sin(elapsed * 0.08) * 2, 16 + Math.cos(elapsed * 0.06) * 1.5, 38)
        this.camera.lookAt(0, 6, 0)
        return
      } else if (config.mode === 'interactive_points') {
        this.camera.position.set(0, 0, 12 + config.orbit * 4)
        this.camera.lookAt(0, 0, 0)
        return
      } else if (config.mode === 'interactive_raycast_points') {
        if (!this._raycastCameraSeeded) {
          this.camera.position.set(8, 8, 8)
          this.camera.lookAt(0, 0, 0)
          this._raycastCameraSeeded = true
        }
        return
      } else if (config.mode === 'lensflares') {
        const orbit = elapsed * (0.05 + config.speed * 0.08)
        const radius = 18 + config.orbit * 4
        this.camera.position.set(Math.cos(orbit) * radius, 6 + Math.sin(elapsed * 0.12) * 2, Math.sin(orbit) * radius)
        this.camera.lookAt(0, 0, 0)
        return
      } else if (config.mode === 'instancing') {
        if (this.camera.fov !== 50) {
          this.camera.fov = 50
          this.camera.near = 0.5
          this.camera.far = 20
          this.camera.updateProjectionMatrix()
        }
        this.camera.position.set(0, 0, 3.2 + config.orbit * 0.8)
        this.camera.lookAt(0, 0, 0)
        return
      } else if (config.mode === 'customlights') {
        if (this.camera.fov !== 70) {
          this.camera.fov = 70
          this.camera.near = 0.1
          this.camera.far = 10
          this.camera.updateProjectionMatrix()
        }
        this.camera.position.set(0, 0, 1.5)
        this.camera.lookAt(0, 0, 0)
        return
      } else if (config.mode === 'transition') {
        if (this.camera.fov !== 50) {
          this.camera.fov = 50
          this.camera.near = 0.1
          this.camera.far = 100
          this.camera.updateProjectionMatrix()
        }
        this.camera.position.set(0, 0, 20)
        this.camera.lookAt(0, 0, 0)
        return
      } else if (config.mode === 'protoplanet') {
        return
      } else if (config.mode === 'periodic_table') {
        return
      } else {
        if (this.camera.fov !== 45) {
          this.camera.fov = 45
          this.camera.near = 0.1
          this.camera.far = 100
          this.camera.updateProjectionMatrix()
        }
        this.camera.position.set(0, 0, 18 - config.orbit * 2)
      }
      this.camera.lookAt(0, 0, 0)
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
        const raycastMode = config.mode === 'raycast'
        const marchingMode = config.mode === 'marching'
        const oceanMode = config.mode === 'ocean'
        const instancingMode = config.mode === 'instancing'
        const customLightsMode = config.mode === 'customlights'
        const transitionMode = config.mode === 'transition'
        const protoplanetMode = config.mode === 'protoplanet'
        const periodicTableMode = config.mode === 'periodic_table'
        const presetMode = raycastMode || marchingMode || oceanMode || instancingMode || customLightsMode || transitionMode || protoplanetMode || periodicTableMode
        const delta = this.clock.getDelta()

        if (this.scene?.fog) {
          this.scene.fog.density = instancingMode || customLightsMode ? 0 : 0.045
        }

        if (this.particleSystem) this.particleSystem.visible = !presetMode
        if (this.haloMesh) this.haloMesh.visible = !presetMode
        this.beamMeshes.forEach((beam) => { beam.visible = !presetMode && beam.visible })
        this.fogSprites.forEach((sprite) => { sprite.visible = !presetMode })
        if (customLightsMode) {
          if (this.fatLineRoot) this.fatLineRoot.visible = false
          if (this.marchingRoot) this.marchingRoot.visible = false
          if (this.oceanRoot) this.oceanRoot.visible = false
          if (this.instancingRoot) this.instancingRoot.visible = false
          this.restoreRendererToneMapping()
          if (this.scene) this.scene.environment = null
          this.lfoGroups.forEach((group) => { group.visible = false })
          this.initCustomLightsScene()
          this.updateCustomLightsScene(elapsed, config)
        } else if (this.customLightsRoot) {
          this.customLightsRoot.visible = false
        }
        if (raycastMode) {
          if (this.marchingRoot) this.marchingRoot.visible = false
          if (this.oceanRoot) this.oceanRoot.visible = false
          if (this.instancingRoot) this.instancingRoot.visible = false
          if (this.customLightsRoot) this.customLightsRoot.visible = false
          this.restoreRendererToneMapping()
          if (this.scene) this.scene.environment = null
          this.lfoGroups.forEach((group) => { group.visible = false })
          this.updateRaycastLines(elapsed, audioLevel * tabBoost, bass, config)
        } else if (marchingMode) {
          if (this.fatLineRoot) this.fatLineRoot.visible = false
          if (this.oceanRoot) this.oceanRoot.visible = false
          if (this.instancingRoot) this.instancingRoot.visible = false
          if (this.interactivePointsRoot) this.interactivePointsRoot.visible = false
          if (this.interactiveRaycastRoot) this.interactiveRaycastRoot.visible = false
          if (this.lensflareRoot) this.lensflareRoot.visible = false
          this.restoreRendererToneMapping()
          if (this.scene) this.scene.environment = null
          this.lfoGroups.forEach((group) => { group.visible = false })
          this.updateMarchingField(elapsed, config)
        } else if (oceanMode) {
          if (this.fatLineRoot) this.fatLineRoot.visible = false
          if (this.marchingRoot) this.marchingRoot.visible = false
          if (this.instancingRoot) this.instancingRoot.visible = false
          if (this.interactivePointsRoot) this.interactivePointsRoot.visible = false
          if (this.interactiveRaycastRoot) this.interactiveRaycastRoot.visible = false
          if (this.lensflareRoot) this.lensflareRoot.visible = false
          this.lfoGroups.forEach((group) => { group.visible = false })
          this.updateOceanScene(elapsed, config, delta)
        } else if (instancingMode) {
          if (this.fatLineRoot) this.fatLineRoot.visible = false
          if (this.marchingRoot) this.marchingRoot.visible = false
          if (this.oceanRoot) this.oceanRoot.visible = false
          if (this.interactivePointsRoot) this.interactivePointsRoot.visible = false
          if (this.interactiveRaycastRoot) this.interactiveRaycastRoot.visible = false
          if (this.lensflareRoot) this.lensflareRoot.visible = false
          this.restoreRendererToneMapping()
          if (this.scene) this.scene.environment = null
          this.lfoGroups.forEach((group) => { group.visible = false })
          this.updateInstancingScene(elapsed, config, audioLevel * tabBoost)
        } else if (interactivePointsMode) {
          if (this.fatLineRoot) this.fatLineRoot.visible = false
          if (this.marchingRoot) this.marchingRoot.visible = false
          if (this.oceanRoot) this.oceanRoot.visible = false
          if (this.instancingRoot) this.instancingRoot.visible = false
          if (this.interactiveRaycastRoot) this.interactiveRaycastRoot.visible = false
          if (this.lensflareRoot) this.lensflareRoot.visible = false
          this.restoreRendererToneMapping()
          if (this.scene) this.scene.environment = null
          this.lfoGroups.forEach((group) => { group.visible = false })
          this.updateInteractivePoints(elapsed, config, audioLevel * tabBoost)
        } else if (interactiveRaycastMode) {
          if (this.fatLineRoot) this.fatLineRoot.visible = false
          if (this.marchingRoot) this.marchingRoot.visible = false
          if (this.oceanRoot) this.oceanRoot.visible = false
          if (this.instancingRoot) this.instancingRoot.visible = false
          if (this.interactivePointsRoot) this.interactivePointsRoot.visible = false
          if (this.lensflareRoot) this.lensflareRoot.visible = false
          this.restoreRendererToneMapping()
          if (this.scene) this.scene.environment = null
          this.lfoGroups.forEach((group) => { group.visible = false })
          this.updateInteractiveRaycastPoints(elapsed, config, delta, audioLevel * tabBoost)
        } else if (lensflaresMode) {
          if (this.fatLineRoot) this.fatLineRoot.visible = false
          if (this.marchingRoot) this.marchingRoot.visible = false
          if (this.oceanRoot) this.oceanRoot.visible = false
          if (this.instancingRoot) this.instancingRoot.visible = false
          if (this.interactivePointsRoot) this.interactivePointsRoot.visible = false
          if (this.interactiveRaycastRoot) this.interactiveRaycastRoot.visible = false
          this.lfoGroups.forEach((group) => { group.visible = false })
          this.updateLensflares(elapsed, config)
        } else if (transitionMode) {
          if (this.fatLineRoot) this.fatLineRoot.visible = false
          if (this.marchingRoot) this.marchingRoot.visible = false
          if (this.oceanRoot) this.oceanRoot.visible = false
          if (this.instancingRoot) this.instancingRoot.visible = false
          if (this.interactivePointsRoot) this.interactivePointsRoot.visible = false
          if (this.interactiveRaycastRoot) this.interactiveRaycastRoot.visible = false
          if (this.lensflareRoot) this.lensflareRoot.visible = false
          if (this.customLightsRoot) this.customLightsRoot.visible = false
          this.restoreRendererToneMapping()
          if (this.scene) this.scene.environment = null
          this.lfoGroups.forEach((group) => { group.visible = false })
          this.setPeriodicRendererVisible(false)
          this.updateTransitionScenes(delta, config, audioLevel * tabBoost)
        } else if (protoplanetMode) {
          if (this.fatLineRoot) this.fatLineRoot.visible = false
          if (this.marchingRoot) this.marchingRoot.visible = false
          if (this.oceanRoot) this.oceanRoot.visible = false
          if (this.instancingRoot) this.instancingRoot.visible = false
          if (this.interactivePointsRoot) this.interactivePointsRoot.visible = false
          if (this.interactiveRaycastRoot) this.interactiveRaycastRoot.visible = false
          if (this.lensflareRoot) this.lensflareRoot.visible = false
          if (this.customLightsRoot) this.customLightsRoot.visible = false
          this.restoreRendererToneMapping()
          if (this.scene) this.scene.environment = null
          this.lfoGroups.forEach((group) => { group.visible = false })
          this.setPeriodicRendererVisible(false)
          this.updateProtoplanetScene(elapsed, config)
        } else if (periodicTableMode) {
          if (this.fatLineRoot) this.fatLineRoot.visible = false
          if (this.marchingRoot) this.marchingRoot.visible = false
          if (this.oceanRoot) this.oceanRoot.visible = false
          if (this.instancingRoot) this.instancingRoot.visible = false
          if (this.interactivePointsRoot) this.interactivePointsRoot.visible = false
          if (this.interactiveRaycastRoot) this.interactiveRaycastRoot.visible = false
          if (this.lensflareRoot) this.lensflareRoot.visible = false
          if (this.customLightsRoot) this.customLightsRoot.visible = false
          this.restoreRendererToneMapping()
          if (this.scene) this.scene.environment = null
          this.lfoGroups.forEach((group) => { group.visible = false })
          this.updatePeriodicTableScene(elapsed, config, delta)
        } else {
          this.setPeriodicRendererVisible(false)
          if (this.instancingRoot) this.instancingRoot.visible = false
          if (this.fatLineRoot) this.fatLineRoot.visible = false
          if (this.marchingRoot) this.marchingRoot.visible = false
          if (this.oceanRoot) this.oceanRoot.visible = false
          if (this.interactivePointsRoot) this.interactivePointsRoot.visible = false
          if (this.interactiveRaycastRoot) this.interactiveRaycastRoot.visible = false
          if (this.lensflareRoot) this.lensflareRoot.visible = false
          this.applyLensflareSceneStyle(false)
          this.restoreRendererToneMapping()
          if (this.scene) this.scene.environment = null
          this.updateParticles(elapsed, audioLevel * tabBoost, pulse)
          this.updateHalo(elapsed, audioLevel * tabBoost, bass, morph, config)
          this.updateVolumeBeams(elapsed, audioLevel * tabBoost, bass, treble, config)
          this.updateFogSprites(elapsed, audioLevel * tabBoost, pulse, config)
          this.updateLfoGroups(elapsed, audioLevel * tabBoost, bass, mid, treble)
        }
        this.updateCamera(elapsed, config)

        if (this.$refs.host) {
          const width = this.$refs.host.clientWidth || 0
          const height = this.$refs.host.clientHeight || 0
          const canvas = this.renderer.domElement
          if (width >= 2 && height >= 2 && canvas && (canvas.width < 2 || canvas.height < 2)) {
            this.handleResize()
          }
        }

        if (transitionMode) {
          this.renderTransitionFrame()
        } else if (protoplanetMode) {
          this.renderProtoplanetFrame()
        } else if (periodicTableMode) {
          this.renderPeriodicTableFrame()
        } else {
          this.renderer.render(this.scene, this.camera)
        }
        this.rafId = requestAnimationFrame(tick)
      }
      if (this.rafId != null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this.rafId)
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
      if (this.marchingMaterials) {
        Object.values(this.marchingMaterials).forEach((material) => {
          if (material && typeof material.dispose === 'function') material.dispose()
        })
      }
      if (this.oceanPmremTarget) this.oceanPmremTarget.dispose()
      if (this.oceanPmrem) this.oceanPmrem.dispose()
      if (this.oceanNormalsTexture) this.oceanNormalsTexture.dispose()
      if (this.oceanWater) {
        if (this.oceanWater.geometry) this.oceanWater.geometry.dispose()
        if (this.oceanWater.material) this.oceanWater.material.dispose()
      }
      if (this.oceanSky && this.oceanSky.material) this.oceanSky.material.dispose()
      if (this.oceanMesh) {
        if (this.oceanMesh.geometry) this.oceanMesh.geometry.dispose()
        if (this.oceanMesh.material) this.oceanMesh.material.dispose()
      }
      if (this.instancingMesh) {
        if (this.instancingMesh.geometry) this.instancingMesh.geometry.dispose()
        if (this.instancingMesh.material) this.instancingMesh.material.dispose()
      }
      if (this.deforumBackdropTexture) this.deforumBackdropTexture.dispose()
      if (this.deforumBackdropMesh) {
        if (this.deforumBackdropMesh.geometry) this.deforumBackdropMesh.geometry.dispose()
        if (this.deforumBackdropMesh.material) this.deforumBackdropMesh.material.dispose()
      }
      this.disposeTransitionPostprocess()
      this.disposeProtoplanetScene()
      this.disposePeriodicTableScene()

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
      this.fatLineRoot = null
      this.fatLine = null
      this.fatThresholdLine = null
      this.fatSegments = null
      this.fatThresholdSegments = null
      this.marchingRoot = null
      this.marchingEffect = null
      this.marchingMaterials = null
      this.marchingResolution = 28
      this.marchingMaterialKey = 'shiny'
      this.oceanRoot = null
      this.oceanSky = null
      this.oceanWater = null
      this.oceanMesh = null
      this.oceanSun = null
      this.oceanPmrem = null
      this.oceanPmremTarget = null
      this.oceanNormalsTexture = null
      this.oceanSettingsKey = ''
      this.instancingRoot = null
      this.instancingMesh = null
      this.deforumBackdropMesh = null
      this.deforumBackdropTexture = null
      this.deforumBackdropUrl = ''
      this.deforumBackdropOpacity = 0
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
  background: transparent;
}

.three-background :deep(canvas) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
