<template>
  <div
    class="xy-controller"
    :class="[
      'xy-controller--' + (compact ? 'compact' : 'regular'),
      'xy-controller--' + variant,
      {
        'xy-controller--dragging': dragging,
        'xy-controller--spring': springing,
      },
    ]"
    :data-testid="testId"
  >
    <div class="xy-controller__chrome">
      <button
        type="button"
        class="xy-controller__axis-btn xy-controller__axis-btn--x"
        :title="'X axis: ' + xAxisLabel + ' — click to change'"
        :data-testid="testId + '-axis-x'"
        @click="cycleAxis('x')"
      >
        <UiIcon :name="xAxisIcon" />
        <span class="xy-controller__axis-tag">X</span>
      </button>
      <code v-if="compact && showReadout" class="xy-controller__readout motion-readout">{{ readoutText }}</code>
      <button
        type="button"
        class="xy-controller__axis-btn xy-controller__axis-btn--y"
        :title="'Y axis: ' + yAxisLabel + ' — click to change'"
        :data-testid="testId + '-axis-y'"
        @click="cycleAxis('y')"
      >
        <UiIcon :name="yAxisIcon" />
        <span class="xy-controller__axis-tag">Y</span>
      </button>
    </div>
    <div
      ref="padEl"
      class="xy-controller__pad motion-pad-hero"
      :class="'motion-pad-hero--' + variant"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerLeave"
    >
      <div class="motion-pad-hero__crosshair motion-pad-hero__crosshair--x"></div>
      <div class="motion-pad-hero__crosshair motion-pad-hero__crosshair--y"></div>
      <div
        class="motion-pad-hero__puck"
        :class="{ 'motion-pad-hero__puck--look': variant === 'look' }"
        :style="puckStyle"
      ></div>
      <code v-if="!compact && showReadout" class="motion-pad-hero__readout motion-readout">
        {{ readoutText }}
      </code>
    </div>
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'
import { motionAxisDef, nextMotionAxisKey } from '../utils/motion-axis-options.mjs'

export default {
  name: 'XYController',
  components: { UiIcon },
  props: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    rangeX: { type: Number, default: 1 },
    rangeY: { type: Number, default: 1 },
    xAxis: { type: String, default: 'translation_x' },
    yAxis: { type: String, default: 'translation_y' },
    axisOptions: { type: Array, default: () => [] },
    variant: { type: String, default: 'move' },
    testId: { type: String, default: 'xy-controller' },
    showReadout: { type: Boolean, default: true },
    compact: { type: Boolean, default: true },
    springBack: { type: Boolean, default: true },
    springDurationMs: { type: Number, default: 280 },
  },
  emits: ['input', 'drag-start', 'release', 'update:xAxis', 'update:yAxis'],
  data() {
    return {
      normX: 0,
      normY: 0,
      dragging: false,
      springing: false,
      _springRaf: null,
      _activePointerId: null,
    }
  },
  computed: {
    xAxisMeta() {
      return motionAxisDef(this.xAxis) || { label: this.xAxis, icon: 'sliders' }
    },
    yAxisMeta() {
      return motionAxisDef(this.yAxis) || { label: this.yAxis, icon: 'sliders' }
    },
    xAxisLabel() {
      return this.xAxisMeta.label || this.xAxis
    },
    yAxisLabel() {
      return this.yAxisMeta.label || this.yAxis
    },
    xAxisIcon() {
      return this.xAxisMeta.icon || 'sliders'
    },
    yAxisIcon() {
      return this.yAxisMeta.icon || 'sliders'
    },
    puckStyle() {
      const rangeX = Math.max(0.0001, Number(this.rangeX) || 1)
      const rangeY = Math.max(0.0001, Number(this.rangeY) || 1)
      const xVal = this.dragging || this.springing ? this.normX * rangeX : Number(this.x) || 0
      const yVal = this.dragging || this.springing ? this.normY * rangeY : Number(this.y) || 0
      const xPct = ((xVal / rangeX) + 1) * 50
      const yPct = (1 - ((yVal / rangeY) + 1) * 0.5) * 100
      return {
        left: Math.min(100, Math.max(0, xPct)) + '%',
        top: Math.min(100, Math.max(0, yPct)) + '%',
      }
    },
    readoutText() {
      const rangeX = Math.max(0.0001, Number(this.rangeX) || 1)
      const rangeY = Math.max(0.0001, Number(this.rangeY) || 1)
      const xVal = this.dragging || this.springing ? this.normX * rangeX : Number(this.x) || 0
      const yVal = this.dragging || this.springing ? this.normY * rangeY : Number(this.y) || 0
      return xVal.toFixed(2) + ', ' + yVal.toFixed(2)
    },
  },
  watch: {
    x() { this.syncFromProps() },
    y() { this.syncFromProps() },
    rangeX() { this.syncFromProps() },
    rangeY() { this.syncFromProps() },
    xAxis() { this.syncFromProps() },
    yAxis() { this.syncFromProps() },
  },
  mounted() {
    this.syncFromProps()
  },
  beforeUnmount() {
    this.cancelSpring()
  },
  methods: {
    cycleAxis(channel) {
      const current = channel === 'x' ? this.xAxis : this.yAxis
      const other = channel === 'x' ? this.yAxis : this.xAxis
      const next = nextMotionAxisKey(current, other, this.axisOptions)
      if (next === current) return
      this.$emit(channel === 'x' ? 'update:xAxis' : 'update:yAxis', next)
    },
    syncFromProps() {
      if (this.dragging || this.springing) return
      const rangeX = Math.max(0.0001, Number(this.rangeX) || 1)
      const rangeY = Math.max(0.0001, Number(this.rangeY) || 1)
      this.normX = this.clampNorm((Number(this.x) || 0) / rangeX)
      this.normY = this.clampNorm((Number(this.y) || 0) / rangeY)
    },
    clampNorm(value) {
      const n = Number(value)
      if (!Number.isFinite(n)) return 0
      return Math.max(-1, Math.min(1, n))
    },
    padRect() {
      const el = this.$refs.padEl
      return el ? el.getBoundingClientRect() : { left: 0, top: 0, width: 1, height: 1 }
    },
    pointerToNorm(clientX, clientY) {
      const rect = this.padRect()
      const width = rect.width || 1
      const height = rect.height || 1
      const px = Math.max(0, Math.min(width, clientX - rect.left))
      const py = Math.max(0, Math.min(height, clientY - rect.top))
      return {
        normX: this.clampNorm((px / width) * 2 - 1),
        normY: this.clampNorm(1 - (py / height) * 2),
      }
    },
    emitValues() {
      const rangeX = Number(this.rangeX) || 1
      const rangeY = Number(this.rangeY) || 1
      this.$emit('input', {
        x: this.normX * rangeX,
        y: this.normY * rangeY,
        normX: this.normX,
        normY: this.normY,
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        dragging: this.dragging,
        springing: this.springing,
      })
    },
    cancelSpring() {
      if (this._springRaf != null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this._springRaf)
      }
      this._springRaf = null
      this.springing = false
    },
    startSpringBack() {
      if (!this.springBack) {
        this.normX = 0
        this.normY = 0
        this.emitValues()
        return
      }
      this.cancelSpring()
      this.springing = true
      const startX = this.normX
      const startY = this.normY
      if (Math.abs(startX) < 0.001 && Math.abs(startY) < 0.001) {
        this.normX = 0
        this.normY = 0
        this.springing = false
        this.emitValues()
        return
      }
      const startTime = performance.now()
      const duration = Math.max(80, Number(this.springDurationMs) || 280)
      const tick = (now) => {
        const t = Math.min(1, (now - startTime) / duration)
        const ease = 1 - Math.pow(1 - t, 2.6)
        this.normX = startX * (1 - ease)
        this.normY = startY * (1 - ease)
        this.emitValues()
        if (t < 1) {
          this._springRaf = requestAnimationFrame(tick)
          return
        }
        this.normX = 0
        this.normY = 0
        this.springing = false
        this._springRaf = null
        this.emitValues()
      }
      this._springRaf = requestAnimationFrame(tick)
    },
    onPointerDown(event) {
      if (this._activePointerId != null) return
      this.cancelSpring()
      this.dragging = true
      this._activePointerId = event.pointerId
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch (_e) { /* ignore */ }
      const { normX, normY } = this.pointerToNorm(event.clientX, event.clientY)
      this.normX = normX
      this.normY = normY
      this.$emit('drag-start')
      this.emitValues()
      event.preventDefault()
    },
    onPointerMove(event) {
      if (!this.dragging || event.pointerId !== this._activePointerId) return
      const { normX, normY } = this.pointerToNorm(event.clientX, event.clientY)
      this.normX = normX
      this.normY = normY
      this.emitValues()
      event.preventDefault()
    },
    onPointerUp(event) {
      if (event.pointerId !== this._activePointerId) return
      this.finishDrag(event.currentTarget, event.pointerId)
    },
    onPointerLeave(event) {
      if (!this.dragging || event.pointerId !== this._activePointerId) return
      this.finishDrag(event.currentTarget, event.pointerId)
    },
    finishDrag(target, pointerId) {
      if (!this.dragging) return
      try {
        target.releasePointerCapture(pointerId)
      } catch (_e) { /* ignore */ }
      this.dragging = false
      this._activePointerId = null
      this.$emit('release')
      this.startSpringBack()
    },
  },
}
</script>
