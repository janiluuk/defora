<template>
  <div class="motion-path-preview" data-testid="motion-path-preview">
    <div class="motion-path-preview__header">
      <div class="framesync-subtitle motion-path-preview__title">3D motion preview</div>
      <code class="motion-path-preview__readout">
        Frame {{ displayFrame }} / {{ totalFrames }}
        · X {{ displayPoint.x.toFixed(1) }}
        · Y {{ displayPoint.y.toFixed(1) }}
        · Z {{ displayPoint.z.toFixed(1) }}
      </code>
    </div>
    <div ref="host" class="motion-path-preview__stage"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { buildCameraPath } from '../deforum-schedule.js'

export default {
  name: 'MotionPathPreview',
  props: {
    deforumSettings: { type: Object, default: () => ({}) },
    motionValues: { type: Object, default: () => ({}) },
    preferLiveValues: { type: Boolean, default: true },
    playing: { type: Boolean, default: true },
  },
  data() {
    return {
      playheadFrame: 0,
      displayFrame: 0,
      displayPoint: { x: 0, y: 0, z: 0 },
      totalFrames: 120,
      _raf: 0,
      _lastTs: 0,
      _pathPoints: [],
    }
  },
  computed: {
    liveMotionOverrides() {
      if (!this.preferLiveValues) return {};
      const v = this.motionValues || {};
      const out = {};
      ['translation_x', 'translation_y', 'translation_z', 'rotation_3d_x', 'rotation_3d_y', 'rotation_3d_z'].forEach((key) => {
        if (v[key] != null && Number.isFinite(Number(v[key]))) out[key] = Number(v[key]);
      });
      return out;
    },
    previewFrameCount() {
      const max = Number(this.deforumSettings?.max_frames) || 120;
      return Math.max(24, Math.min(240, max));
    },
    previewFps() {
      const fps = Number(this.deforumSettings?.fps) || 24;
      return Math.max(8, Math.min(60, fps));
    },
  },
  watch: {
    deforumSettings: { deep: true, handler() { this.rebuildPath(); } },
    motionValues: { deep: true, handler() { this.rebuildPath(); } },
    preferLiveValues() { this.rebuildPath(); },
    playing(on) {
      if (on) this.startLoop();
      else this.stopLoop();
    },
  },
  mounted() {
    this.initScene();
    this.rebuildPath();
    if (this.playing) this.startLoop();
    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
  },
  beforeUnmount() {
    this.stopLoop();
    window.removeEventListener('resize', this._onResize);
    this.disposeScene();
  },
  methods: {
    initScene() {
      const host = this.$refs.host;
      if (!host) return;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x060910);
      this.scene.fog = new THREE.Fog(0x060910, 40, 220);

      const w = host.clientWidth || 640;
      const h = host.clientHeight || 220;
      this.viewCamera = new THREE.PerspectiveCamera(48, w / h, 0.1, 500);
      this.viewCamera.position.set(28, 22, 34);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h, false);
      host.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.viewCamera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.target.set(0, 0, 0);

      const grid = new THREE.GridHelper(80, 40, 0x2de2ff, 0x1a2438);
      grid.position.y = -0.01;
      this.scene.add(grid);

      const axes = new THREE.AxesHelper(8);
      this.scene.add(axes);

      this.pathMaterial = new THREE.LineBasicMaterial({ color: 0x7f77dd, linewidth: 1 });
      this.pathGeometry = new THREE.BufferGeometry();
      this.pathLine = new THREE.Line(this.pathGeometry, this.pathMaterial);
      this.scene.add(this.pathLine);

      this.playheadMaterial = new THREE.MeshStandardMaterial({
        color: 0x2de2ff,
        emissive: 0x0a3040,
        metalness: 0.2,
        roughness: 0.35,
      });
      this.playheadMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), this.playheadMaterial);
      this.scene.add(this.playheadMesh);

      const coneGeo = new THREE.ConeGeometry(0.35, 1.2, 12);
      this.facingMaterial = new THREE.MeshStandardMaterial({ color: 0xe879b0, emissive: 0x301020 });
      this.facingMesh = new THREE.Mesh(coneGeo, this.facingMaterial);
      this.facingMesh.rotation.x = Math.PI / 2;
      this.playheadMesh.add(this.facingMesh);

      const light = new THREE.DirectionalLight(0xffffff, 1.1);
      light.position.set(12, 24, 16);
      this.scene.add(light);
      this.scene.add(new THREE.AmbientLight(0x445566, 0.65));
    },
    resize() {
      const host = this.$refs.host;
      if (!host || !this.renderer || !this.viewCamera) return;
      const w = host.clientWidth || 640;
      const h = host.clientHeight || 220;
      this.renderer.setSize(w, h, false);
      this.viewCamera.aspect = w / h;
      this.viewCamera.updateProjectionMatrix();
    },
    rebuildPath() {
      this.totalFrames = this.previewFrameCount;
      this._pathPoints = buildCameraPath({
        settings: this.deforumSettings || {},
        live: this.liveMotionOverrides,
        frameCount: this.totalFrames,
      });
      this.updatePathGeometry();
      this.playheadFrame = Math.min(this.playheadFrame, this.totalFrames);
      this.applyPlayhead(this.playheadFrame);
    },
    updatePathGeometry() {
      if (!this.pathGeometry) return;
      const pts = this._pathPoints;
      const positions = new Float32Array(pts.length * 3);
      pts.forEach((p, i) => {
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      });
      this.pathGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.pathGeometry.computeBoundingSphere();

      if (pts.length > 1 && this.controls) {
        let minX = Infinity; let maxX = -Infinity;
        let minY = Infinity; let maxY = -Infinity;
        let minZ = Infinity; let maxZ = -Infinity;
        pts.forEach((p) => {
          minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
          minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
        });
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const cz = (minZ + maxZ) / 2;
        const span = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 6);
        this.controls.target.set(cx, cy, cz);
        this.viewCamera.position.set(cx + span * 1.4, cy + span * 0.9, cz + span * 1.4);
      }
    },
    applyPlayhead(frame) {
      const pts = this._pathPoints;
      if (!pts.length || !this.playheadMesh) return;
      const idx = Math.max(0, Math.min(pts.length - 1, Math.round(frame)));
      const p = pts[idx];
      this.displayFrame = p.frame;
      this.displayPoint = { x: p.x, y: p.y, z: p.z };
      this.playheadMesh.position.set(p.x, p.y, p.z);
      this.playheadMesh.rotation.set(p.pitch || 0, p.yaw || 0, p.roll || 0);
    },
    startLoop() {
      this.stopLoop();
      this._lastTs = 0;
      const tick = (ts) => {
        this._raf = requestAnimationFrame(tick);
        if (!this.playing) return;
        if (!this._lastTs) this._lastTs = ts;
        const dt = (ts - this._lastTs) / 1000;
        this._lastTs = ts;
        this.playheadFrame += dt * this.previewFps;
        if (this.playheadFrame > this.totalFrames) {
          this.playheadFrame = 0;
        }
        this.applyPlayhead(this.playheadFrame);
        if (this.controls) this.controls.update();
        if (this.renderer && this.scene && this.viewCamera) {
          this.renderer.render(this.scene, this.viewCamera);
        }
      };
      this._raf = requestAnimationFrame(tick);
    },
    stopLoop() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = 0;
      this._lastTs = 0;
    },
    disposeScene() {
      this.stopLoop();
      if (this.controls) this.controls.dispose();
      if (this.pathGeometry) this.pathGeometry.dispose();
      if (this.pathMaterial) this.pathMaterial.dispose();
      if (this.playheadMaterial) this.playheadMaterial.dispose();
      if (this.facingMaterial) this.facingMaterial.dispose();
      if (this.renderer) {
        this.renderer.dispose();
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
      }
      this.scene = null;
    },
  },
}
</script>
