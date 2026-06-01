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
        <div class="animation-engine-layer-row__top">
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
            class="animation-engine-layer-row__visibility-toggle"
            :class="{ 'animation-engine-layer-row__visibility-toggle--on': isVideoLayerPreviewVisible(layer) }"
            :title="isVideoLayerPreviewVisible(layer) ? 'Hide layer in preview' : 'Show layer in preview'"
            :aria-pressed="isVideoLayerPreviewVisible(layer) ? 'true' : 'false'"
            :data-testid="'animation-engine-visibility-' + layer.id"
            @click.stop="toggleVideoLayerPreview(layer.id)"
          >
            <UiIcon
              class="animation-engine-layer-row__visibility-icon"
              :name="isVideoLayerPreviewVisible(layer) ? 'eye' : 'eye-off'"
              aria-hidden="true"
            />
            <span class="animation-engine-layer-row__visibility-label">
              {{ isVideoLayerPreviewVisible(layer) ? 'On' : 'Off' }}
            </span>
          </button>
        </div>

        <details
          class="animation-engine-layer-row__controls"
          :data-testid="'animation-engine-controls-' + layer.id"
          :open="layer.kind === 'webgl' || layer.kind === 'deforum'"
        >
          <summary class="animation-engine-layer-row__controls-summary">
            <span class="animation-engine-layer-row__controls-label">Controls</span>
            <UiIcon class="animation-engine-layer-row__controls-chevron" name="chevron-down" aria-hidden="true" />
          </summary>
          <div class="animation-engine-layer-row__controls-body">
            <EngineLayerControls :app="app" :layer-id="layer.id" />
          </div>
        </details>
      </li>
    </ul>

    <details class="animation-engine-panel__compositor-section" data-testid="animation-engine-compositor-section">
      <summary class="animation-engine-panel__compositor-summary">
        <span class="animation-engine-panel__compositor-label">Compositor</span>
        <UiIcon class="animation-engine-panel__compositor-chevron" name="chevron-down" aria-hidden="true" />
      </summary>
      <div class="animation-engine-panel__compositor-body">
        <CompositorControls :app="app" />
      </div>
    </details>
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'
import EngineLayerControls from './animation-plugins/EngineLayerControls.vue'
import CompositorControls from './animation-plugins/CompositorControls.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'AnimationEnginePanel',
  components: { UiIcon, EngineLayerControls, CompositorControls },
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
