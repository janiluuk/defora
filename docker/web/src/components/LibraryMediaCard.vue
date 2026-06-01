<template>
  <article
    class="library-browser__card"
    :class="{
      'library-browser__card--selected': selected,
      'library-browser__card--hover': hovered,
    }"
    :data-testid="cardTestId"
    :data-item-id="item.id"
    :data-video-path="item.videoPath || undefined"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    @click="$emit('click', item)"
    @dblclick="$emit('dblclick', item)"
  >
    <div class="library-browser__media">
      <div
        v-if="mediaLoading"
        class="library-browser__media-loading lazy-loading-indicator lazy-loading-indicator--overlay"
        aria-hidden="true"
      >
        <span class="lazy-loading-indicator__spinner" />
      </div>
      <video
        v-if="showVideoPreview && item.videoUrl"
        :ref="setVideoRef"
        class="library-browser__video"
        muted
        loop
        playsinline
        preload="metadata"
        :src="item.videoUrl"
        @loadeddata="onMediaReady"
        @error="onMediaError"
      />
      <img
        v-else-if="item.thumbUrl"
        class="library-browser__thumb"
        :src="item.thumbUrl"
        :alt="item.title"
        loading="lazy"
        @load="onMediaReady"
        @error="onMediaError"
      >
      <video
        v-else-if="item.videoUrl"
        class="library-browser__video library-browser__video--poster"
        muted
        playsinline
        preload="metadata"
        :src="item.videoUrl"
        @loadeddata="onMediaReady"
        @error="onMediaError"
      />
      <div v-else class="library-browser__placeholder" aria-hidden="true">
        <UiIcon name="film" />
      </div>
      <div v-if="badges.length" class="library-browser__badges">
        <span
          v-for="(badge, idx) in badges"
          :key="'badge-' + idx"
          class="library-browser__badge"
          :class="badge.variant ? `library-browser__badge--${badge.variant}` : null"
        >
          {{ badge.label }}
        </span>
      </div>
    </div>
    <div class="library-browser__copy">
      <h3 class="library-browser__title">{{ item.title }}</h3>
      <p v-if="item.meta" class="library-browser__meta">{{ item.meta }}</p>
    </div>
    <div v-if="showActions && item.videoUrl" class="library-browser__card-actions">
      <button
        type="button"
        class="framesync-button framesync-button--compact"
        @click.stop="$emit('watch', item)"
      >
        Watch
      </button>
      <button
        type="button"
        class="framesync-button framesync-button--compact framesync-button--live"
        @click.stop="$emit('edit', item)"
      >
        Edit
      </button>
    </div>
  </article>
</template>

<script>
import UiIcon from './UiIcon.vue'

export default {
  name: 'LibraryMediaCard',
  components: { UiIcon },
  props: {
    item: { type: Object, required: true },
    selected: { type: Boolean, default: false },
    hovered: { type: Boolean, default: false },
    showVideoPreview: { type: Boolean, default: false },
    showActions: { type: Boolean, default: true },
    cardTestId: { type: String, default: 'library-media-card' },
    badges: { type: Array, default: () => [] },
  },
  emits: ['click', 'dblclick', 'watch', 'edit', 'mouseenter', 'mouseleave', 'video-ref'],
  data() {
    return {
      mediaLoading: true,
    }
  },
  watch: {
    'item.id'() {
      this.mediaLoading = true
    },
    showVideoPreview() {
      this.mediaLoading = true
    },
  },
  methods: {
    setVideoRef(el) {
      this.$emit('video-ref', { id: this.item.id, el })
    },
    onMediaReady() {
      this.mediaLoading = false
    },
    onMediaError() {
      this.mediaLoading = false
    },
  },
}
</script>
