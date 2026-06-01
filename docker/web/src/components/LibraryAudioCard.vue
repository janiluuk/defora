<template>
  <article
    class="library-browser__card library-audio-card"
    :class="{
      'library-browser__card--selected': selected,
      'library-browser__card--hover': hovered,
      'library-audio-card--playing': playing,
    }"
    data-testid="audio-card"
    :data-item-id="item.id"
    :data-audio-path="item.audioPath || undefined"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    @click="$emit('click', item)"
  >
    <div class="library-audio-card__media library-browser__media">
      <div
        v-if="mediaLoading"
        class="library-browser__media-loading lazy-loading-indicator lazy-loading-indicator--overlay"
        aria-hidden="true"
      >
        <span class="lazy-loading-indicator__spinner" />
      </div>
      <div
        class="library-audio-card__wave"
        :class="{ 'library-audio-card__wave--active': playing || selected }"
        aria-hidden="true"
      >
        <span
          v-for="n in 16"
          :key="'bar-' + n"
          class="library-audio-card__bar"
          :style="{ animationDelay: `${(n % 5) * 0.08}s` }"
        />
      </div>
      <UiIcon class="library-audio-card__icon" name="mic" />
      <audio
        ref="audioEl"
        class="library-audio-card__audio"
        preload="metadata"
        :src="item.audioUrl"
        @loadedmetadata="onMediaReady"
        @error="onMediaError"
        @play="playing = true"
        @pause="playing = false"
        @ended="playing = false"
      />
      <div class="library-browser__badges">
        <span class="library-browser__badge library-browser__badge--audio">Audio</span>
        <span v-if="durationLabel" class="library-browser__badge">{{ durationLabel }}</span>
      </div>
    </div>
    <div class="library-browser__copy">
      <h3 class="library-browser__title">{{ item.title }}</h3>
      <p v-if="item.meta" class="library-browser__meta">{{ item.meta }}</p>
    </div>
    <div class="library-browser__card-actions">
      <button
        type="button"
        class="framesync-button framesync-button--compact"
        @click.stop="togglePreview"
      >
        {{ playing ? 'Pause' : 'Preview' }}
      </button>
      <button
        type="button"
        class="framesync-button framesync-button--compact framesync-button--live"
        data-testid="audio-use-in-session"
        @click.stop="$emit('use', item)"
      >
        {{ useLabel }}
      </button>
    </div>
  </article>
</template>

<script>
import UiIcon from './UiIcon.vue'

export default {
  name: 'LibraryAudioCard',
  components: { UiIcon },
  props: {
    item: { type: Object, required: true },
    selected: { type: Boolean, default: false },
    hovered: { type: Boolean, default: false },
    useLabel: { type: String, default: 'Use in session' },
  },
  emits: ['click', 'use', 'mouseenter', 'mouseleave', 'preview-state'],
  data() {
    return {
      mediaLoading: true,
      playing: false,
      durationSec: null,
    }
  },
  computed: {
    durationLabel() {
      if (!this.durationSec || !Number.isFinite(this.durationSec)) return '';
      const m = Math.floor(this.durationSec / 60);
      const s = Math.floor(this.durationSec % 60);
      return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
    },
  },
  watch: {
    'item.id'() {
      this.mediaLoading = true
      this.playing = false
      this.durationSec = null
      this.pausePreview()
    },
    selected(active) {
      if (!active) this.pausePreview()
    },
    playing(active) {
      this.$emit('preview-state', { id: this.item.id, playing: active })
    },
  },
  beforeUnmount() {
    this.pausePreview()
  },
  methods: {
    onMediaReady() {
      this.mediaLoading = false
      const el = this.$refs.audioEl
      if (el && Number.isFinite(el.duration) && el.duration > 0) {
        this.durationSec = el.duration
      }
    },
    onMediaError() {
      this.mediaLoading = false
    },
    togglePreview() {
      const el = this.$refs.audioEl
      if (!el) return
      if (this.playing) {
        el.pause()
      } else {
        el.play?.().catch(() => {})
      }
    },
    pausePreview() {
      const el = this.$refs.audioEl
      if (!el) return
      try { el.pause() } catch (_e) { /* ignore */ }
      this.playing = false
    },
  },
}
</script>
