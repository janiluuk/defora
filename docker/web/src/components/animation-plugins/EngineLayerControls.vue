<template>
  <div class="engine-layer-controls" :data-testid="'engine-layer-controls-' + layerId">
    <WebGLPluginPanel v-if="findVideoLayer(layerId)?.kind === 'webgl'" :app="app" />
    <DeforumPluginPanel v-else-if="findVideoLayer(layerId)?.kind === 'deforum'" :app="app" />
    <WanPluginPanel v-else-if="findVideoLayer(layerId)?.kind === 'wan'" :app="app" />
    <AnimateLcmPluginPanel v-else-if="findVideoLayer(layerId)?.kind === 'animatelcm'" :app="app" />
    <div v-else-if="findVideoLayer(layerId)?.kind === 'blend'" class="engine-layer-controls__blend">
      <p class="framesync-subtitle engine-layer-controls__hint">
        Composites WebGL under a Forge layer using screen blend.
      </p>
      <div class="slider-row">
        <span class="framesync-subtitle" style="margin:0;">Forge opacity</span>
        <input
          class="framesync-input"
          type="range"
          min="0"
          max="1"
          step="0.01"
          v-model.number="defaultAnimation.forgeLayerOpacity"
          data-testid="forge-layer-opacity"
          @input="defaultAnimation.forgeLayerOpacityLfoBase = defaultAnimation.forgeLayerOpacity; onDefaultAnimationInput()"
        >
      </div>
    </div>
    <div v-else-if="findVideoLayer(layerId)?.kind === 'input'" class="engine-layer-controls__input">
      <p class="framesync-subtitle engine-layer-controls__hint">
        Link a library or cloud video source from <strong>Add source</strong> below.
      </p>
    </div>
  </div>
</template>

<script>
import WebGLPluginPanel from './WebGLPluginPanel.vue'
import DeforumPluginPanel from './DeforumPluginPanel.vue'
import WanPluginPanel from './WanPluginPanel.vue'
import AnimateLcmPluginPanel from './AnimateLcmPluginPanel.vue'
import { proxyAppView } from '../views/app-view-proxy.mjs'

export default {
  name: 'EngineLayerControls',
  components: { WebGLPluginPanel, DeforumPluginPanel, WanPluginPanel, AnimateLcmPluginPanel },
  props: {
    app: { type: Object, required: true },
    layerId: { type: String, required: true },
  },
  setup(props) { return proxyAppView(props) },
}
</script>
