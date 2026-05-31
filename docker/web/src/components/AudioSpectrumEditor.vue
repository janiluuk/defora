<template>
  <div
    class="audio-spectrum-editor"
    :class="{ 'audio-spectrum-editor--live': live, 'audio-spectrum-editor--dragging': dragState }"
  >
    <canvas
      ref="canvasEl"
      class="audio-spectrum-editor__canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
    ></canvas>
    <div class="audio-spectrum-editor__bands" aria-hidden="true">
      <div
        v-for="(mapping, index) in mappings"
        :key="'audio-band-' + index"
        class="audio-spectrum-editor__band"
        :class="{
          'audio-spectrum-editor__band--active': index === activeIndex,
          'audio-spectrum-editor__band--dragging': dragState && dragState.index === index,
        }"
        :style="bandStyle(mapping)"
      >
        <span class="audio-spectrum-editor__band-label">{{ bandLabel(index) }}</span>
      </div>
    </div>
    <div v-if="!live" class="audio-spectrum-editor__hint">Upload and play audio to see the live spectrum.</div>
  </div>
</template>

<script>
import {
  AUDIO_SPECTRUM_MAX_HZ,
  AUDIO_SPECTRUM_MIN_HZ,
  clampHz,
  hzToRatio,
  paintSpectrumBars,
  ratioToHz,
} from '../utils/audio-spectrum.js'

export default {
  name: 'AudioSpectrumEditor',
  props: {
    mappings: { type: Array, default: () => [] },
    levels: { type: Array, default: () => [] },
    activeIndex: { type: Number, default: 0 },
    spectrumBins: { type: Array, default: () => [] },
    live: { type: Boolean, default: false },
    bandLabels: { type: Array, default: () => ['Low', 'Mid', 'High'] },
    bandColors: { type: Array, default: () => [] },
    canvasWidth: { type: Number, default: 640 },
    canvasHeight: { type: Number, default: 120 },
  },
  emits: ['select-band', 'update-band'],
  data() {
    return {
      dragState: null,
    }
  },
  watch: {
    spectrumBins: {
      handler() {
        this.paint()
      },
      deep: true,
    },
    mappings: {
      handler() {
        this.paint()
      },
      deep: true,
    },
    live() {
      this.paint()
    },
  },
  mounted() {
    this.paint()
  },
  methods: {
    cssVar(name, fallback = '') {
      try {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
        return value || fallback
      } catch (_e) {
        return fallback
      }
    },
    toRgba(color, alpha) {
      const a = Number(alpha)
      if (!Number.isFinite(a)) return String(color || '')
      const c = String(color || '').trim()
      if (c.startsWith('#') && (c.length === 7 || c.length === 4)) {
        const hex = c.length === 4
          ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
          : c
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        if ([r, g, b].every((n) => Number.isFinite(n))) return `rgba(${r}, ${g}, ${b}, ${a})`
      }
      return c
    },
    bandLabel(index) {
      return this.bandLabels[index] || `Band ${index + 1}`
    },
    bandStyle(mapping) {
      const minHz = AUDIO_SPECTRUM_MIN_HZ
      const maxHz = AUDIO_SPECTRUM_MAX_HZ
      const left = hzToRatio(mapping && mapping.freq_min, minHz, maxHz) * 100
      const right = hzToRatio(mapping && mapping.freq_max, minHz, maxHz) * 100
      const index = this.mappings.indexOf(mapping)
      const fallbackColors = [this.cssVar('--band-low'), this.cssVar('--band-mid'), this.cssVar('--band-high')]
      const color = this.bandColors[index] || fallbackColors[index] || this.cssVar('--live') || 'var(--live)'
      return {
        left: `${Math.min(left, right)}%`,
        width: `${Math.max(2, Math.abs(right - left))}%`,
        '--band-color': color,
      }
    },
    paint() {
      const canvas = this.$refs.canvasEl
      if (!canvas || !canvas.getContext) return
      const ctx = canvas.getContext('2d')
      const bins = this.live && this.spectrumBins.length ? this.spectrumBins : null
      paintSpectrumBars(ctx, bins, canvas.width, canvas.height, {
        bgColor: this.cssVar('--bg-0') || 'rgb(8, 9, 13)',
        barColor: this.toRgba(this.cssVar('--band-high') || this.cssVar('--success'), 0.9),
      })
    },
    canvasRect() {
      const canvas = this.$refs.canvasEl
      return canvas ? canvas.getBoundingClientRect() : { width: 1, left: 0 }
    },
    xToHz(clientX) {
      const rect = this.canvasRect()
      const x = clientX - rect.left
      const ratio = x / Math.max(1, rect.width)
      return ratioToHz(ratio)
    },
    hitTest(clientX, clientY) {
      const rect = this.canvasRect()
      const x = ((clientX - rect.left) / Math.max(1, rect.width)) * 100
      const edgePx = 10
      const edgePct = (edgePx / Math.max(1, rect.width)) * 100

      for (let index = this.mappings.length - 1; index >= 0; index -= 1) {
        const mapping = this.mappings[index]
        if (!mapping) continue
        const left = hzToRatio(mapping.freq_min) * 100
        const right = hzToRatio(mapping.freq_max) * 100
        const lo = Math.min(left, right)
        const hi = Math.max(left, right)
        if (x < lo - 1 || x > hi + 1) continue
        if (Math.abs(x - lo) <= edgePct) return { index, mode: 'left' }
        if (Math.abs(x - hi) <= edgePct) return { index, mode: 'right' }
        return { index, mode: 'move' }
      }
      return null
    },
    onPointerDown(event) {
      const hit = this.hitTest(event.clientX, event.clientY)
      if (!hit) return
      const mapping = this.mappings[hit.index]
      if (!mapping) return
      this.$emit('select-band', hit.index)
      const rect = this.canvasRect()
      this.dragState = {
        index: hit.index,
        mode: hit.mode,
        startX: event.clientX,
        startRatio: (event.clientX - rect.left) / Math.max(1, rect.width),
        startMin: Number(mapping.freq_min) || AUDIO_SPECTRUM_MIN_HZ,
        startMax: Number(mapping.freq_max) || AUDIO_SPECTRUM_MAX_HZ,
        pointerId: event.pointerId,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
      event.preventDefault()
    },
    onPointerMove(event) {
      if (!this.dragState || this.dragState.pointerId !== event.pointerId) return
      const mapping = this.mappings[this.dragState.index]
      if (!mapping) return
      const rect = this.canvasRect()
      const currentRatio = (event.clientX - rect.left) / Math.max(1, rect.width)
      const deltaRatio = currentRatio - this.dragState.startRatio
      let nextMin = this.dragState.startMin
      let nextMax = this.dragState.startMax
      const minGap = 20

      if (this.dragState.mode === 'left') {
        nextMin = clampHz(this.xToHz(event.clientX))
        nextMax = clampHz(Math.max(nextMin + minGap, this.dragState.startMax))
      } else if (this.dragState.mode === 'right') {
        nextMax = clampHz(this.xToHz(event.clientX))
        nextMin = clampHz(Math.min(nextMax - minGap, this.dragState.startMin))
      } else {
        const width = this.dragState.startMax - this.dragState.startMin
        nextMin = clampHz(ratioToHz(hzToRatio(this.dragState.startMin) + deltaRatio))
        nextMax = clampHz(nextMin + width)
        if (nextMax >= AUDIO_SPECTRUM_MAX_HZ) {
          nextMax = AUDIO_SPECTRUM_MAX_HZ
          nextMin = clampHz(nextMax - width)
        }
      }

      this.$emit('update-band', {
        index: this.dragState.index,
        freq_min: Math.round(nextMin),
        freq_max: Math.round(nextMax),
      })
      event.preventDefault()
    },
    onPointerUp(event) {
      if (!this.dragState || (event.pointerId != null && this.dragState.pointerId !== event.pointerId)) return
      try {
        event.currentTarget.releasePointerCapture(this.dragState.pointerId)
      } catch (_e) {
        /* ignore */
      }
      this.dragState = null
    },
  },
}
</script>
