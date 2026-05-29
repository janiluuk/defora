<template>
  <Transition name="library-workspace-slide">
    <div
      v-if="libraryWorkspaceOpen"
      class="library-workspace"
      data-testid="library-workspace"
      role="dialog"
      aria-modal="true"
      aria-label="Library and video editor"
    >
      <div class="library-workspace__chrome">
        <div class="library-workspace__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            class="library-workspace__tab"
            :class="{ 'library-workspace__tab--active': libraryWorkspacePane === 'browser' }"
            :aria-selected="libraryWorkspacePane === 'browser' ? 'true' : 'false'"
            data-testid="library-workspace-tab-browser"
            @click="setLibraryWorkspacePane('browser')"
          >
            <UiIcon name="folder" />
            <span>Browser</span>
          </button>
          <button
            type="button"
            role="tab"
            class="library-workspace__tab"
            :class="{ 'library-workspace__tab--active': libraryWorkspacePane === 'editor' }"
            :aria-selected="libraryWorkspacePane === 'editor' ? 'true' : 'false'"
            data-testid="library-workspace-tab-editor"
            @click="setLibraryWorkspacePane('editor')"
          >
            <UiIcon name="film" />
            <span>Video editor</span>
          </button>
        </div>
        <button
          type="button"
          class="library-workspace__close framesync-button framesync-button--compact"
          data-testid="close-library-workspace"
          title="Close library"
          @click="closeLibraryWorkspace()"
        >
          <UiIcon name="chevron-up" />
          <span>Close</span>
        </button>
      </div>
      <div class="library-workspace__body">
        <LibraryView
          v-show="libraryWorkspacePane === 'browser'"
          class="library-workspace__pane"
          :app="app"
          workspace
        />
        <div
          v-show="libraryWorkspacePane === 'editor'"
          class="library-workspace__pane library-workspace__pane--editor"
          data-testid="editor-workspace"
        >
          <EditorView :app="app" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import UiIcon from './UiIcon.vue'
import LibraryView from './views/LibraryView.vue'
import EditorView from './views/EditorView.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'LibraryWorkspaceOverlay',
  components: { UiIcon, LibraryView, EditorView },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
