<template>
  <div
    class="library-shell"
    :class="{
      'library-shell--fullscreen': libraryFullscreen && !workspace,
      'library-shell--workspace': workspace,
    }"
  >
    <div class="framesync-panel library-storage-browser">
      <div v-if="!workspace" class="framesync-header library-storage-browser__header">
        <div class="framesync-title">
          <UiIcon class="framesync-title-icon" name="folder" />
          <span class="framesync-accent">Library</span>
        </div>
        <span class="framesync-subtitle" style="margin:0;">Projects, videos, and audio — browse, preview, open in the editor</span>
      </div>
      <div class="library-storage-browser__actions">
        <button
          v-if="workspace && librarySourceMode"
          type="button"
          class="framesync-button framesync-button--compact framesync-button--live"
          data-testid="use-library-as-source"
          @click="applyLibrarySelectionAsSource()"
        >
          Use as source
        </button>
        <button
          type="button"
          class="framesync-button framesync-button--compact framesync-button--live"
          data-testid="open-in-video-editor"
          @click="openInVideoEditor()"
        >
          Open in editor
        </button>
      </div>
      <LibraryBrowserShell :app="app" />
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './app-view-proxy.mjs'
import UiIcon from '../UiIcon.vue'
import LibraryBrowserShell from '../LibraryBrowserShell.vue'

export default {
  name: 'LibraryView',
  components: { UiIcon, LibraryBrowserShell },
  props: {
    app: { type: Object, required: true },
    workspace: { type: Boolean, default: false },
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
.library-shell--workspace {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  gap: 8px;
}
.library-shell--workspace .library-storage-browser {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.library-storage-browser {
  display: grid;
  gap: 12px;
  min-height: 0;
}
</style>
