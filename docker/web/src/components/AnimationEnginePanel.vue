<template>
  <div class="animation-engine-panel" data-testid="animation-engine-panel">
    <div
      v-if="showFrameProcessingInChrome"
      class="live-frame-processing-banner"
      data-testid="live-frame-processing-banner"
      aria-live="polite"
    >
      <span class="lazy-loading-indicator lazy-loading-indicator--inline">
        <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
        <span>{{ frameProcessingLabel }}</span>
        <span class="lazy-loading-indicator__dots" aria-hidden="true"><span></span><span></span><span></span></span>
      </span>
      <span class="live-frame-processing-banner__hint">{{ frameProcessingHint }}</span>
    </div>

    <div class="animation-engine-panel__head">
      <div class="framesync-title">
        <UiIcon class="framesync-title-icon" name="film" />
        <span class="framesync-accent">Layers</span>
      </div>
      <div class="animation-engine-panel__head-actions">
        <button
          type="button"
          class="framesync-button framesync-button--compact"
          data-testid="animation-engine-promote-deforum"
          title="Switch preview to Deforum layer"
          @click="promoteToDeforum()"
        >
          Deforum →
        </button>
      </div>
    </div>

    <ul class="animation-engine-layer-list" data-testid="animation-engine-layer-list">
      <li
        v-for="layer in builtinEngineLayers"
        :key="'engine-layer-row-' + layer.id"
        class="animation-engine-layer-row"
        :class="{
          'animation-engine-layer-row--active': activeVideoLayerId === layer.id,
          'animation-engine-layer-row--hidden': !isVideoLayerPreviewVisible(layer),
        }"
        :data-testid="'animation-engine-row-' + layer.id"
      >
        <div class="animation-engine-layer-row__main">
          <button
            type="button"
            class="animation-engine-layer-row__select"
            :class="{ 'animation-engine-layer-row__select--active': activeVideoLayerId === layer.id }"
            :aria-pressed="activeVideoLayerId === layer.id ? 'true' : 'false'"
            :data-testid="'animation-engine-' + layer.id"
            @click="selectVideoLayer(layer.id)"
          >
            <span
              class="animation-engine-card__dot"
              :class="'animation-engine-card__dot--' + layerStatus(layer)"
              aria-hidden="true"
            ></span>
            <span class="animation-engine-layer-row__label">{{ layer.label }}</span>
            <span class="animation-engine-layer-row__status">{{ videoLayerStatusShort(layer) }}</span>
          </button>
          <div class="animation-engine-layer-row__mix">
            <div class="animation-engine-layer-row__mix-head">
              <span class="animation-engine-layer-row__mix-label">Opacity</span>
              <span class="animation-engine-layer-row__opacity-value">
                {{ Math.round(readVideoLayerOpacity(layer) * 100) }}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              class="animation-engine-layer-row__opacity-slider framesync-input"
              :value="readVideoLayerOpacity(layer)"
              :disabled="!isVideoLayerPreviewVisible(layer)"
              :data-testid="'animation-engine-opacity-' + layer.id"
              @input="setVideoLayerOpacity(layer.id, $event.target.value)"
            >
          </div>
        </div>
        <button
          type="button"
          class="framesync-button framesync-button--compact animation-engine-layer-row__visibility"
          :class="{ 'framesync-button--live': isVideoLayerPreviewVisible(layer) }"
          :title="isVideoLayerPreviewVisible(layer) ? 'Hide layer in preview' : 'Show layer in preview'"
          :aria-pressed="isVideoLayerPreviewVisible(layer) ? 'true' : 'false'"
          :data-testid="'animation-engine-visibility-' + layer.id"
          @click.stop="toggleVideoLayerPreview(layer.id)"
        >
          <UiIcon :name="isVideoLayerPreviewVisible(layer) ? 'eye' : 'eye-off'" />
          <span class="sr-only">{{ isVideoLayerPreviewVisible(layer) ? 'Hide layer' : 'Show layer' }}</span>
        </button>
      </li>
    </ul>

    <div class="animation-engine-panel__controls">
      <CommonVisualStrip v-if="activeAnimationPluginId" :app="app" />
      <AnimationEnginePluginPanel :app="app" />
      <CompositorControls :app="app" />
    </div>

    <div class="animation-engine-panel__sources">
      <button
        type="button"
        class="framesync-button framesync-button--compact"
        :class="{ active: videoLayerAddOpen }"
        data-testid="video-layer-add-toggle"
        @click="toggleVideoLayerAdd()"
      >
        + Add source
      </button>
      <div
        v-if="currentTab === 'LIVE' && videoLayerAddOpen"
        class="video-layer-add"
        data-testid="video-layer-add"
      >
        <div class="chips video-layer-add__mode">
          <button type="button" class="chip" :class="{ active: liveSourcePanel === 'library' }" @click="liveSourcePanel = 'library'; saveSessionState()">Video library</button>
          <button type="button" class="chip" :class="{ active: liveSourcePanel === 'cloud' }" @click="liveSourcePanel = 'cloud'; saveSessionState()">Cloud drive</button>
        </div>
        <div v-if="liveSourcePanel === 'library'" style="margin-top:8px;">
          <VideoSwarmBrowser :app="app" />
        </div>
        <div v-else style="margin-top:8px;">
          <div class="framesync-row" style="grid-template-columns: 1fr 0.8fr; gap:10px;">
            <input class="framesync-input" v-model.trim="cloudDriveDraft.url" placeholder="https://drive.google.com/...">
            <select class="framesync-select" v-model="cloudDriveDraft.provider">
              <option value="google_drive">Google Drive</option>
              <option value="dropbox">Dropbox</option>
              <option value="onedrive">OneDrive</option>
            </select>
          </div>
          <div class="framesync-footer" style="margin-top:8px;">
            <button type="button" class="framesync-button" @click="linkCloudDriveSource">Link cloud drive</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'
import VideoSwarmBrowser from './VideoSwarmBrowser.vue'
import CommonVisualStrip from './animation-plugins/CommonVisualStrip.vue'
import AnimationEnginePluginPanel from './animation-plugins/AnimationEnginePluginPanel.vue'
import CompositorControls from './animation-plugins/CompositorControls.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'AnimationEnginePanel',
  components: { UiIcon, VideoSwarmBrowser, CommonVisualStrip, AnimationEnginePluginPanel, CompositorControls },
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
