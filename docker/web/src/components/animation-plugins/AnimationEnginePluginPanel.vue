<template>
  <WebGLPluginPanel v-if="activeAnimationPluginId === 'webgl'" :app="app" />
  <DeforumPluginPanel v-else-if="activeAnimationPluginId === 'deforum'" :app="app" />
  <WanPluginPanel v-else-if="activeAnimationPluginId === 'wan'" :app="app" />
  <AnimateLcmPluginPanel v-else-if="activeAnimationPluginId === 'animatelcm'" :app="app" />
  <div v-else-if="activeVideoLayer?.kind === 'blend'" class="animation-plugin-panel animation-plugin-panel--hint">
    <p class="framesync-subtitle">
      <strong>Both</strong> composites WebGL under a Forge layer. Adjust forge opacity in the Compositor section.
    </p>
  </div>
  <div v-else-if="activeVideoLayer?.kind === 'input'" class="animation-plugin-panel animation-plugin-panel--hint">
    <p class="framesync-subtitle">Input layer — link a library or cloud video source.</p>
  </div>
</template>

<script>
import WebGLPluginPanel from './WebGLPluginPanel.vue'
import DeforumPluginPanel from './DeforumPluginPanel.vue'
import WanPluginPanel from './WanPluginPanel.vue'
import AnimateLcmPluginPanel from './AnimateLcmPluginPanel.vue'
import { proxyAppView } from '../views/app-view-proxy.mjs'

export default {
  name: 'AnimationEnginePluginPanel',
  components: { WebGLPluginPanel, DeforumPluginPanel, WanPluginPanel, AnimateLcmPluginPanel },
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
