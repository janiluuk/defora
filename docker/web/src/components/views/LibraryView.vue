<template>
  <div class="library-shell" :class="{ 'library-shell--fullscreen': libraryFullscreen }">
    <div class="framesync-panel library-storage-browser">
      <div class="framesync-header library-storage-browser__header">
        <div class="framesync-title"><span class="framesync-accent">Browser</span></div>
        <span class="framesync-subtitle" style="margin:0;">Browse videos, then open a file in the editor to cut and export</span>
      </div>
      <div class="library-storage-browser__actions">
        <button
          type="button"
          class="framesync-button framesync-button--compact framesync-button--live"
          data-testid="open-in-video-editor"
          @click="openInVideoEditor()"
        >
          Open in editor
        </button>
      </div>
      <VideoSwarmBrowser :app="app" />
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './app-view-proxy.mjs'
import VideoSwarmBrowser from '../VideoSwarmBrowser.vue'

export default {
  name: 'LibraryView',
  components: { VideoSwarmBrowser },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>

<style scoped>
.library-shell {
  display: grid;
  gap: 12px;
}
.library-shell--fullscreen {
  position: fixed;
  inset: 8px;
  z-index: 999;
  padding: 12px;
  background: rgba(8, 9, 13, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  overflow: auto;
}
.library-storage-browser {
  display: grid;
  gap: 12px;
}
</style>
