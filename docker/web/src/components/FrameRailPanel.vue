<template>
  <div class="frame-rail frame-rail--embedded" data-testid="runs-browser-frames">
    <div class="frame-rail__header">
      <div class="frame-rail__title-wrap">
        <span class="frame-rail__title">Frames</span>
        <span class="frame-rail__meta" v-if="frameStripThumbs.length">
          {{ selectedFrameLabel }} · {{ frameStripThumbs.length }}
          <template v-if="frameRailSourceLabel"> from {{ frameRailSourceLabel }}</template>
          <template v-else> generated</template>
          <span v-if="deforumPlaying && frameRailFollowLatest && !frameRailSourceLabel" class="frame-rail__live-tag">Live</span>
        </span>
        <span class="frame-rail__meta" v-else>Waiting for rendered frames…</span>
      </div>
      <div class="frame-rail__actions">
        <div class="frame-rail__controls" v-if="frameStripThumbs.length">
          <button
            type="button"
            class="frame-rail__step frame-rail__step--undo"
            data-testid="deforum-undo-segment"
            :disabled="!deforumContinuationCanUndo"
            :title="deforumContinuationUndoTitle"
            @click="undoDeforumContinuationSegment"
          >Undo</button>
          <button type="button" class="frame-rail__step" @click="stepFrameSelection(-1)" :disabled="selectedFrameIndex <= 0">Prev</button>
          <input
            class="frame-rail__scrubber"
            type="range"
            min="0"
            :max="Math.max(0, frameStripThumbs.length - 1)"
            :value="Math.max(0, selectedFrameIndex)"
            @input="selectFrame(Number($event.target.value), { userInitiated: true })"
          >
          <button
            type="button"
            class="frame-rail__step"
            @click="stepFrameSelection(1)"
            :disabled="selectedFrameIndex >= frameStripThumbs.length - 1"
          >Next</button>
        </div>
      </div>
    </div>
    <div
      v-if="frameStripThumbs.length"
      ref="frameRail"
      class="frame-rail__list"
      data-testid="runs-browser-frames-rail"
    >
      <button
        v-for="(f, idx) in frameStripThumbs"
        :key="'frame-rail-' + (f.name || idx)"
        type="button"
        class="frame-rail__item"
        :class="{
          'frame-rail__item--active': idx === selectedFrameIndex,
          'frame-rail__item--loading': isFrameThumbLoading(f),
        }"
        :data-frame-index="idx"
        data-testid="frame-rail-item"
        @click="selectFrame(idx, { userInitiated: true })"
      >
        <div class="frame-rail__thumb-wrap">
          <img
            class="frame-rail__thumb"
            :src="f.src || f.url"
            :alt="f.name || ('Frame ' + idx)"
            @load="onFrameThumbImageLoad(f)"
            @error="onFrameThumbImageError(f)"
          >
          <div
            v-if="isFrameThumbLoading(f)"
            class="frame-rail__thumb-loading"
            aria-hidden="true"
          >
            <span class="lazy-loading-indicator lazy-loading-indicator--thumb">
              <span class="lazy-loading-indicator__spinner"></span>
            </span>
          </div>
        </div>
        <span class="frame-rail__label">{{ frameLabel(f) }}</span>
      </button>
      <div
        v-if="deforumPlaying && frameRailFollowLatest"
        class="frame-rail__item frame-rail__item--pending"
        data-testid="frame-rail-pending"
        aria-hidden="true"
      >
        <div class="frame-rail__thumb-wrap frame-rail__thumb-wrap--pending">
          <span class="lazy-loading-indicator lazy-loading-indicator--thumb">
            <span class="lazy-loading-indicator__spinner"></span>
            <span class="lazy-loading-indicator__dots"><span></span><span></span><span></span></span>
          </span>
        </div>
        <span class="frame-rail__label">Next…</span>
      </div>
    </div>
    <div v-else class="frame-rail__empty">
      <span class="lazy-loading-indicator">
        <span v-if="framesEmptyStatus.kind === 'loading'" class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
        <span>{{ framesEmptyStatus.label }}</span>
        <span v-if="framesEmptyStatus.kind === 'loading'" class="lazy-loading-indicator__dots" aria-hidden="true"><span></span><span></span><span></span></span>
      </span>
      <div class="framesync-subtitle" style="margin-top:6px;">{{ framesEmptyStatus.detail }}</div>
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'FrameRailPanel',
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
