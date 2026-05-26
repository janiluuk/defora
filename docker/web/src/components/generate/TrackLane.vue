<template>
  <div class="track-lane" :class="{ 'track-lane--selected': selected }">
    <button type="button" class="track-lane__label" @click="$emit('select-track', track.id)">
      <span class="track-lane__name">{{ label }}</span>
      <span class="track-lane__meta">{{ sortedKeyframes.length }} keyframes</span>
    </button>

    <div ref="graph" class="track-lane__graph" @pointerdown="onGraphPointerDown">
      <svg class="track-lane__path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline v-if="points" :points="points" />
      </svg>
      <div class="track-lane__playhead" :style="{ left: playheadPct }"></div>
      <button
        v-for="(kf, index) in sortedKeyframes"
        :key="track.id + '-' + index + '-' + (kf.t || 0)"
        type="button"
        class="track-lane__keyframe"
        :style="keyframeStyle(kf)"
        @pointerdown.stop="onKeyframePointerDown($event, kf)"
        @mouseenter="hoveredKeyframe = kf"
        @mouseleave="clearHovered(kf)"
      >
        <span v-if="hoveredKeyframe === kf" class="track-lane__tooltip">
          {{ formatValue(kf.v) }}
        </span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrackLane',
  emits: ['seek', 'select-track', 'update-keyframe'],
  props: {
    track: { type: Object, required: true },
    label: { type: String, required: true },
    duration: { type: Number, default: 8 },
    playhead: { type: Number, default: 0 },
    selected: { type: Boolean, default: false },
    valueMin: { type: Number, default: -1 },
    valueMax: { type: Number, default: 1 },
  },
  data() {
    return {
      dragKeyframe: null,
      hoveredKeyframe: null,
      detachDragHandlers: null,
    }
  },
  computed: {
    sortedKeyframes() {
      return [...(this.track.keyframes || [])].sort((a, b) => a.t - b.t)
    },
    playheadPct() {
      const duration = Math.max(0.01, Number(this.duration) || 0.01)
      const pct = (Math.min(duration, Math.max(0, Number(this.playhead) || 0)) / duration) * 100
      return `${pct}%`
    },
    points() {
      if (!this.sortedKeyframes.length) return ''
      return this.sortedKeyframes
        .map((kf) => `${this.timePct(kf.t)},${this.valuePct(kf.v)}`)
        .join(' ')
    },
  },
  beforeUnmount() {
    this.stopDragging()
  },
  methods: {
    clamp(value, min, max) {
      return Math.min(max, Math.max(min, value))
    },
    timePct(time) {
      const duration = Math.max(0.01, Number(this.duration) || 0.01)
      return ((this.clamp(Number(time) || 0, 0, duration) / duration) * 100).toFixed(3)
    },
    valuePct(value) {
      const min = Number(this.valueMin)
      const max = Number(this.valueMax)
      if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 50
      const pct = ((this.clamp(Number(value) || 0, min, max) - min) / (max - min)) * 100
      return (100 - pct).toFixed(3)
    },
    keyframeStyle(kf) {
      return {
        left: `${this.timePct(kf.t)}%`,
        top: `${this.valuePct(kf.v)}%`,
      }
    },
    pointerToTrackValues(evt) {
      const graph = this.$refs.graph
      if (!graph) return { t: 0, v: 0 }
      const rect = graph.getBoundingClientRect()
      const x = this.clamp(evt.clientX - rect.left, 0, rect.width)
      const y = this.clamp(evt.clientY - rect.top, 0, rect.height)
      const duration = Math.max(0.01, Number(this.duration) || 0.01)
      const t = (x / rect.width) * duration
      const min = Number(this.valueMin)
      const max = Number(this.valueMax)
      const v = max <= min
        ? 0
        : max - (y / rect.height) * (max - min)
      return {
        t: this.clamp(t, 0, duration),
        v: this.clamp(v, min, max),
      }
    },
    onGraphPointerDown(evt) {
      this.$emit('select-track', this.track.id)
      const { t } = this.pointerToTrackValues(evt)
      this.$emit('seek', t)
    },
    onKeyframePointerDown(evt, keyframe) {
      this.dragKeyframe = keyframe
      this.hoveredKeyframe = keyframe
      this.$emit('select-track', this.track.id)
      const onMove = (moveEvt) => {
        if (!this.dragKeyframe) return
        const { t, v } = this.pointerToTrackValues(moveEvt)
        this.$emit('update-keyframe', { trackId: this.track.id, keyframe: this.dragKeyframe, t, v })
        this.$emit('seek', t)
      }
      const onUp = () => {
        this.stopDragging()
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp, { once: true })
      this.detachDragHandlers = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }
    },
    stopDragging() {
      if (typeof this.detachDragHandlers === 'function') {
        this.detachDragHandlers()
      }
      this.detachDragHandlers = null
      this.dragKeyframe = null
    },
    clearHovered(keyframe) {
      if (this.hoveredKeyframe === keyframe) {
        this.hoveredKeyframe = null
      }
    },
    formatValue(value) {
      const numeric = Number(value)
      if (!Number.isFinite(numeric)) return '0'
      if (Math.abs(numeric) >= 100) return numeric.toFixed(0)
      if (Math.abs(numeric) >= 10) return numeric.toFixed(1)
      return numeric.toFixed(2)
    },
  },
}
</script>

<style scoped>
.track-lane {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.track-lane__label {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-1);
  color: var(--text-primary);
  min-height: 72px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  display: grid;
  gap: 4px;
}

.track-lane--selected .track-lane__label {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 18%, transparent) inset;
}

.track-lane__name {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

.track-lane__meta {
  font-size: 10px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.track-lane__graph {
  position: relative;
  min-height: 72px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--accent) 8%, transparent), color-mix(in srgb, var(--accent) 2%, transparent)),
    linear-gradient(90deg, color-mix(in srgb, var(--text-primary) 4%, transparent) 1px, transparent 1px),
    linear-gradient(180deg, color-mix(in srgb, var(--text-primary) 4%, transparent) 1px, transparent 1px),
    var(--bg-0);
  background-size: auto, 10% 100%, 100% 25%, auto;
  overflow: hidden;
  cursor: pointer;
}

.track-lane--selected .track-lane__graph {
  border-color: var(--accent);
}

.track-lane__path {
  position: absolute;
  inset: 8px;
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  overflow: visible;
}

.track-lane__path polyline {
  fill: none;
  stroke: var(--accent);
  stroke-width: 1.4;
  vector-effect: non-scaling-stroke;
}

.track-lane__playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--live);
  box-shadow: 0 0 8px color-mix(in srgb, var(--live) 35%, transparent);
  transform: translateX(-50%);
}

.track-lane__keyframe {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 1px solid var(--accent);
  background: var(--bg-1);
  border-radius: 3px;
  transform: translate(-50%, -50%) rotate(45deg);
  cursor: grab;
  padding: 0;
}

.track-lane__keyframe:active {
  cursor: grabbing;
}

.track-lane__tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translate(-50%, 0) rotate(-45deg);
  border-radius: 6px;
  background: var(--bg-2);
  border: 1px solid var(--border-strong);
  color: var(--text-primary);
  padding: 4px 6px;
  font-size: 10px;
  white-space: nowrap;
  pointer-events: none;
}

@media (max-width: 768px) {
  .track-lane {
    grid-template-columns: 1fr;
  }

  .track-lane__label {
    min-height: auto;
  }
}
</style>
