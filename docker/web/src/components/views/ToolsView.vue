<template>
  <div class="rack tools-view">
    <div class="framesync-panel">
      <div class="framesync-header">
        <div class="framesync-title">Tools <span class="framesync-accent">VideoSwarm</span></div>
        <span class="framesync-subtitle" style="margin:0;">Browse shared storage and mounted videos</span>
      </div>
      <VideoSwarmBrowser :app="app" />
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './app-view-proxy.js'
import VideoSwarmBrowser from '../VideoSwarmBrowser.vue'

export default {
  name: 'ToolsView',
  components: { VideoSwarmBrowser },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
