<template>
  <div class="frame-rail frame-rail--embedded" data-testid="runs-browser-frames">
    <div class="frame-rail__header">
      <div class="frame-rail__title-wrap">
        <span class="frame-rail__title">Frames</span>
        <span class="frame-rail__meta" v-if="frameStripThumbs.length">
          {{ selectedFrameLabel }} · {{ frameStripThumbs.length }} generated
        </span>
        <span class="frame-rail__meta" v-else>Waiting for rendered frames…</span>
      </div>
      <div class="frame-rail__actions">
        <div class="frame-rail__controls" v-if="frameStripThumbs.length">
          <button type="button" class="frame-rail__step" @click="stepFrameSelection(-1)" :disabled="selectedFrameIndex <= 0">Prev</button>
          <input
            class="frame-rail__scrubber"
            type="range"
            min="0"
            :max="Math.max(0, frameStripThumbs.length - 1)"
            :value="Math.max(0, selectedFrameIndex)"
            @input="selectFrame(Number($event.target.value))"
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
        :class="{ 'frame-rail__item--active': idx === selectedFrameIndex }"
        :data-frame-index="idx"
        data-testid="frame-rail-item"
        @click="selectFrame(idx)"
      >
        <img class="frame-rail__thumb" :src="f.src || f.url" :alt="f.name || ('Frame ' + idx)" />
        <span class="frame-rail__label">{{ frameLabel(f) }}</span>
      </button>
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
