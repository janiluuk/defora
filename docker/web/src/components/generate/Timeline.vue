<template>
  <div class="timeline-hero">
    <div class="timeline-hero__header">
      <div class="timeline-hero__title-block">
        <span class="timeline-hero__eyebrow">Timeline</span>
        <code class="timeline-hero__time">{{ formatTime(playhead) }} / {{ formatTime(duration) }}</code>
      </div>
      <div class="timeline-hero__summary">{{ tracks.length }} tracks · {{ markers.length }} markers</div>
    </div>

    <div class="timeline-hero__ruler" ref="ruler" @pointerdown="onRulerPointerDown">
      <div class="timeline-hero__playhead" :style="{ left: playheadPct }">
        <div class="timeline-hero__playhead-handle"></div>
      </div>

      <div
        v-for="marker in sortedMarkers"
        :key="marker.name + '-' + marker.t"
        class="timeline-hero__marker"
        :style="{ left: markerLeft(marker) }"
      >
        <button type="button" class="timeline-hero__marker-label" @click.stop="$emit('jump-marker', marker)">
          {{ marker.name }}
        </button>
      </div>
    </div>

    <div v-if="tracks.length" class="timeline-hero__lanes">
      <TrackLane
        v-for="track in tracks"
        :key="track.id"
        :track="track"
        :label="metaFor(track.param).label"
        :duration="duration"
        :playhead="playhead"
        :selected="track.id === selectedTrackId"
        :value-min="metaFor(track.param).min"
        :value-max="metaFor(track.param).max"
        @seek="$emit('seek', $event)"
        @select-track="$emit('select-track', $event)"
        @update-keyframe="$emit('update-keyframe', $event)"
      />
    </div>

    <div v-else class="timeline-hero__empty">No tracks yet. Add a track to begin.</div>
  </div>
</template>

<script>
import TrackLane from './TrackLane.vue'

export default {
  name: 'Timeline',
  components: { TrackLane },
  emits: ['jump-marker', 'seek', 'select-track', 'update-keyframe'],
  props: {
    duration: { type: Number, default: 8 },
    playhead: { type: Number, default: 0 },
    markers: { type: Array, default: () => [] },
    tracks: { type: Array, default: () => [] },
    selectedTrackId: { type: String, default: '' },
    paramMeta: { type: Object, default: () => ({}) },
  },
  computed: {
    playheadPct() {
      const duration = Math.max(0.01, Number(this.duration) || 0.01)
      return `${(Math.min(duration, Math.max(0, Number(this.playhead) || 0)) / duration) * 100}%`
    },
    sortedMarkers() {
      return [...this.markers].sort((a, b) => a.t - b.t)
    },
  },
  methods: {
    formatTime(value) {
      const numeric = Math.max(0, Number(value) || 0)
      return numeric.toFixed(2) + 's'
    },
    markerLeft(marker) {
      const duration = Math.max(0.01, Number(this.duration) || 0.01)
      return `${(Math.min(duration, Math.max(0, Number(marker.t) || 0)) / duration) * 100}%`
    },
    metaFor(param) {
      return this.paramMeta[param] || { label: param, min: -1, max: 1 }
    },
    onRulerPointerDown(evt) {
      const ruler = this.$refs.ruler
      if (!ruler) return
      const seekFromEvent = (pointerEvt) => {
        const rect = ruler.getBoundingClientRect()
        const x = Math.min(rect.width, Math.max(0, pointerEvt.clientX - rect.left))
        const duration = Math.max(0.01, Number(this.duration) || 0.01)
        this.$emit('seek', (x / rect.width) * duration)
      }

      seekFromEvent(evt)

      const onMove = (moveEvt) => seekFromEvent(moveEvt)
      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp, { once: true })
    },
  },
}
</script>

<style scoped>
.timeline-hero {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 8%, transparent), color-mix(in srgb, var(--bg-1) 96%, transparent));
  padding: 12px;
  display: grid;
  gap: 12px;
}

.timeline-hero__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.timeline-hero__title-block {
  display: grid;
  gap: 4px;
}

.timeline-hero__eyebrow {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}

.timeline-hero__time {
  font-size: 14px;
  color: var(--text-primary);
}

.timeline-hero__summary {
  font-size: 11px;
  color: var(--text-dim);
}

.timeline-hero__ruler {
  position: relative;
  min-height: 84px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--text-primary) 4%, transparent) 1px, transparent 1px),
    linear-gradient(180deg, color-mix(in srgb, var(--text-primary) 4%, transparent) 1px, transparent 1px),
    var(--bg-0);
  background-size: 10% 100%, 100% 50%, auto;
  overflow: hidden;
  cursor: ew-resize;
}

.timeline-hero__marker {
  position: absolute;
  top: 10px;
  bottom: 0;
  width: 0;
  transform: translateX(-50%);
}

.timeline-hero__marker::before {
  content: '';
  position: absolute;
  top: 24px;
  bottom: 0;
  left: 50%;
  width: 1px;
  background: color-mix(in srgb, var(--text-primary) 16%, transparent);
}

.timeline-hero__marker-label {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid var(--border-strong);
  background: var(--bg-2);
  color: var(--text-primary);
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 10px;
  white-space: nowrap;
  cursor: pointer;
}

.timeline-hero__playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--live);
  box-shadow: 0 0 10px color-mix(in srgb, var(--live) 40%, transparent);
  transform: translateX(-50%);
}

.timeline-hero__playhead-handle {
  position: absolute;
  top: 8px;
  left: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--live);
  transform: translate(-50%, 0);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--live) 16%, transparent);
}

.timeline-hero__lanes {
  display: grid;
  gap: 10px;
}

.timeline-hero__empty {
  min-height: 120px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-dim);
  font-size: 12px;
  background: var(--bg-0);
}
</style>
