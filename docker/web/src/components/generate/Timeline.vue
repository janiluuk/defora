<template>
  <div class="timeline-hero" :class="{ 'timeline-hero--compact': compact }">
    <div class="timeline-hero__header">
      <div class="timeline-hero__title-block">
        <span class="timeline-hero__eyebrow">Timeline</span>
        <code class="timeline-hero__time">{{ formatTime(playhead) }} / {{ formatTime(duration) }}</code>
        <code
          class="timeline-hero__frame"
          :class="{ 'timeline-hero__frame--live': jobFrameLive }"
          data-testid="timeline-job-frame-counter"
        >
          Frame {{ jobFrameNumber }} / {{ jobTotalFrames }}
        </code>
      </div>
      <div class="timeline-hero__header-actions">
        <div class="timeline-hero__summary">
          {{ tracks.length }} tracks · {{ markers.length }} markers
          <template v-if="clips.length"> · {{ clips.length }} clips</template>
        </div>
        <button
          v-if="expandable"
          type="button"
          class="timeline-hero__toggle"
          @click="$emit('toggle-compact')"
        >
          {{ compact ? 'Expand lanes' : 'Compact' }}
        </button>
      </div>
    </div>

    <div class="timeline-hero__body">
      <div
        class="timeline-hero__shared-playhead"
        :style="{ left: playheadPct }"
        aria-hidden="true"
      ></div>

      <div class="timeline-hero__filmstrip" :class="{ 'timeline-hero__filmstrip--empty': !frameItems.length }">
        <button
          v-for="frame in frameItems"
          :key="frame.key"
          type="button"
          class="timeline-hero__frame"
          :style="{ left: frame.left }"
          :title="`${frame.label} @ ${formatTime(frame.time)}`"
          @click="$emit('seek', frame.time)"
        >
          <img
            v-if="frame.src"
            class="timeline-hero__frame-image"
            :src="frame.src"
            :alt="frame.label"
          />
          <div v-else class="timeline-hero__frame-placeholder">{{ frame.label }}</div>
          <span class="timeline-hero__frame-label">{{ frame.label }}</span>
        </button>
        <div v-if="!frameItems.length" class="timeline-hero__filmstrip-empty">
          Frame filmstrip appears here as previews arrive.
        </div>
      </div>

      <div v-if="showContentLanes" class="timeline-hero__content-lanes">
        <div
          v-for="lane in clipLanes"
          :key="'clip-lane-' + lane.type"
          class="timeline-hero__content-lane"
        >
          <div class="timeline-hero__content-lane-label">{{ lane.label }}</div>
          <div class="timeline-hero__content-lane-track">
            <button
              v-for="clip in lane.clips"
              :key="clip.id"
              type="button"
              class="timeline-hero__clip"
              :class="[
                'timeline-hero__clip--' + clip.type,
                { 'timeline-hero__clip--selected': clip.id === selectedClipId },
              ]"
              :style="clipStyle(clip)"
              :title="clip.title"
              @click.stop="$emit('jump-clip', clip)"
            >
              <span class="timeline-hero__clip-label">{{ clip.label }}</span>
            </button>
            <div v-if="!lane.clips.length" class="timeline-hero__content-lane-empty">Add clips from the sequencer panel</div>
          </div>
        </div>
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

      <div v-if="tracks.length && !compact" class="timeline-hero__lanes">
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
    </div>

    <div v-if="tracks.length && compact" class="timeline-hero__compact-note">
      Compact mode keeps the filmstrip and shared playhead visible while preserving preview space.
    </div>

    <div v-if="!tracks.length" class="timeline-hero__empty">No tracks yet. Add a track to begin.</div>
  </div>
</template>

<script>
import TrackLane from './TrackLane.vue'

export default {
  name: 'Timeline',
  components: { TrackLane },
  emits: ['jump-marker', 'jump-clip', 'seek', 'select-track', 'toggle-compact', 'update-keyframe'],
  props: {
    duration: { type: Number, default: 8 },
    playhead: { type: Number, default: 0 },
    markers: { type: Array, default: () => [] },
    clips: { type: Array, default: () => [] },
    selectedClipId: { type: String, default: '' },
    tracks: { type: Array, default: () => [] },
    selectedTrackId: { type: String, default: '' },
    paramMeta: { type: Object, default: () => ({}) },
    frames: { type: Array, default: () => [] },
    fps: { type: Number, default: 24 },
    jobFrameNumber: { type: Number, default: 1 },
    jobTotalFrames: { type: Number, default: 1 },
    jobFrameLive: { type: Boolean, default: false },
    compact: { type: Boolean, default: false },
    expandable: { type: Boolean, default: false },
  },
  computed: {
    playheadPct() {
      const duration = Math.max(0.01, Number(this.duration) || 0.01)
      return `${(Math.min(duration, Math.max(0, Number(this.playhead) || 0)) / duration) * 100}%`
    },
    sortedMarkers() {
      return [...this.markers].sort((a, b) => a.t - b.t)
    },
    clipLanes() {
      const defs = [
        { type: 'video', label: 'Video source' },
        { type: 'prompt', label: 'Prompts' },
        { type: 'lora', label: 'LoRAs' },
        { type: 'controlnet', label: 'ControlNet' },
      ]
      const duration = Math.max(0.01, Number(this.duration) || 0.01)
      return defs.map((lane) => ({
        ...lane,
        clips: (this.clips || [])
          .filter((clip) => clip && clip.type === lane.type)
          .map((clip) => ({
            ...clip,
            title: `${clip.label || lane.label} @ ${this.formatTime(clip.t)}${clip.endT != null ? ` – ${this.formatTime(clip.endT)}` : ''}`,
            left: `${(Math.max(0, Number(clip.t) || 0) / duration) * 100}%`,
            width: this.clipWidthPct(clip, duration),
          })),
      }))
    },
    showContentLanes() {
      return !this.compact
    },
    frameItems() {
      if (!Array.isArray(this.frames) || !this.frames.length) return []
      const duration = Math.max(0.01, Number(this.duration) || 0.01)
      const fps = Math.max(1, Number(this.fps) || 24)
      const numericFrames = this.frames
        .map((frame, index) => ({ frame, index, num: Number(frame && frame.frame) }))
        .filter((entry) => Number.isFinite(entry.num))
      const baseFrame = numericFrames.length
        ? Math.min(...numericFrames.map((entry) => entry.num))
        : null

      const visibleFrames = this.frames.length > 16 ? this.frames.slice(-16) : this.frames
      return visibleFrames.map((frame, index, list) => {
        const rawFrame = Number(frame && frame.frame)
        const parsedFrame = Number.isFinite(rawFrame) ? rawFrame : null
        const time = parsedFrame != null && baseFrame != null
          ? Math.max(0, (parsedFrame - baseFrame) / fps)
          : (list.length <= 1 ? 0 : (duration * index) / (list.length - 1))
        const pct = Math.max(0, Math.min(100, (time / duration) * 100))
        return {
          key: `${frame && frame.name ? frame.name : 'frame'}-${index}`,
          src: frame && (frame.src || frame.url || frame.path || ''),
          label: this.frameLabel(frame, index),
          time,
          left: `${pct}%`,
        }
      })
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
    clipWidthPct(clip, duration) {
      const start = Math.max(0, Number(clip.t) || 0)
      const end = clip.endT != null ? Math.min(duration, Number(clip.endT)) : Math.min(duration, start + 0.35)
      const span = Math.max(0.08, end - start)
      return `${(span / duration) * 100}%`
    },
    clipStyle(clip) {
      return {
        left: clip.left,
        width: clip.width,
      }
    },
    metaFor(param) {
      return this.paramMeta[param] || { label: param, min: -1, max: 1 }
    },
    frameLabel(frame, index) {
      const numeric = Number(frame && frame.frame)
      if (Number.isFinite(numeric)) return `F${numeric}`
      const name = frame && frame.name ? String(frame.name).replace(/\.[^.]+$/, '') : ''
      return name || `Frame ${index + 1}`
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

.timeline-hero--compact {
  gap: 10px;
}

.timeline-hero__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.timeline-hero__header-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
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

.timeline-hero__frame {
  font-size: 13px;
  color: var(--text-secondary);
}

.timeline-hero__frame--live {
  color: var(--live-text);
  text-shadow: 0 0 10px color-mix(in srgb, var(--live) 28%, transparent);
}

.timeline-hero__summary {
  font-size: 11px;
  color: var(--text-dim);
}

.timeline-hero__toggle {
  border: 1px solid var(--border);
  background: var(--bg-2);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 10px;
  cursor: pointer;
}

.timeline-hero__body {
  position: relative;
  display: grid;
  gap: 10px;
}

.timeline-hero__shared-playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: color-mix(in srgb, var(--live) 55%, transparent);
  box-shadow: 0 0 10px color-mix(in srgb, var(--live) 28%, transparent);
  transform: translateX(-50%);
  z-index: 1;
  pointer-events: none;
}

.timeline-hero__filmstrip {
  position: relative;
  min-height: 92px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--bg-2) 86%, transparent), var(--bg-0));
  overflow: hidden;
}

.timeline-hero__filmstrip--empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-hero__filmstrip-empty {
  color: var(--text-dim);
  font-size: 11px;
}

.timeline-hero__frame {
  position: absolute;
  top: 10px;
  width: 74px;
  transform: translateX(-50%);
  display: grid;
  gap: 4px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  z-index: 2;
}

.timeline-hero__frame-image,
.timeline-hero__frame-placeholder {
  width: 74px;
  height: 42px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-1);
  object-fit: cover;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.28);
}

.timeline-hero__frame-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-dim);
  font-size: 10px;
}

.timeline-hero__frame-label {
  font-size: 9px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.timeline-hero__content-lanes {
  display: grid;
  gap: 6px;
}

.timeline-hero__content-lane {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 8px;
  align-items: center;
}

.timeline-hero__content-lane-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-dim);
}

.timeline-hero__content-lane-track {
  position: relative;
  min-height: 28px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-0);
  overflow: hidden;
}

.timeline-hero__clip {
  position: absolute;
  top: 4px;
  bottom: 4px;
  min-width: 28px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  z-index: 2;
}

.timeline-hero__clip--prompt {
  background: color-mix(in srgb, var(--accent) 22%, var(--bg-2));
  border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
}

.timeline-hero__clip--lora {
  background: color-mix(in srgb, var(--live) 18%, var(--bg-2));
  border-color: color-mix(in srgb, var(--live) 40%, var(--border));
}

.timeline-hero__clip--controlnet {
  background: color-mix(in srgb, var(--warn) 18%, var(--bg-2));
  border-color: color-mix(in srgb, var(--warn) 42%, var(--border));
}

.timeline-hero__clip--selected {
  box-shadow: 0 0 0 1px var(--accent);
}

.timeline-hero__clip-label {
  font-size: 9px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.timeline-hero__content-lane-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: var(--text-dim);
  pointer-events: none;
}

.timeline-hero__ruler {
  position: relative;
  min-height: 64px;
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
  position: relative;
  z-index: 2;
}

.timeline-hero__compact-note {
  font-size: 11px;
  color: var(--text-dim);
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

@media (max-width: 768px) {
  .timeline-hero__header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .timeline-hero__frame {
    width: 60px;
  }

  .timeline-hero__frame-image,
  .timeline-hero__frame-placeholder {
    width: 60px;
    height: 36px;
  }
}
</style>
