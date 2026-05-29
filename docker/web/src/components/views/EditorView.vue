<template>
  <div class="editor-view" data-testid="editor-view">
    <EditorShell
      title-accent="Video"
      title-rest="Editor"
      subtitle="FreeCut — multi-track timeline, keyframes, WebGPU preview, and export"
      :status="editorStatus"
      :status-live="editorStatusLive"
      test-id="video-editor-shell"
    >
      <template #actions>
        <button type="button" class="framesync-button framesync-button--compact" @click="navigateFreecut('projects')">
          Projects
        </button>
        <button type="button" class="framesync-button framesync-button--compact" @click="openFreecutNewTab">
          Open tab
        </button>
        <button
          type="button"
          class="framesync-button framesync-button--compact framesync-button--live"
          :disabled="!editorImportUrl"
          @click="copyImportUrl"
        >
          Copy import URL
        </button>
        <button
          type="button"
          class="framesync-button framesync-button--compact"
          :disabled="!editorImportUrl"
          @click="importFromLibrary"
        >
          Import from library
        </button>
      </template>

      <div class="editor-view__import" v-if="editorImportUrl">
        <span class="framesync-subtitle">Library handoff</span>
        <code class="editor-view__import-url">{{ editorImportUrl }}</code>
        <span class="framesync-subtitle editor-view__import-hint">
          Paste into FreeCut media library → Import from URL, or use Import from library once the editor is ready.
        </span>
      </div>

      <iframe
        ref="freecutFrame"
        class="editor-view__frame"
        data-testid="freecut-editor-frame"
        :src="freecutFrameSrc"
        title="FreeCut video editor"
        allow="clipboard-write; storage-access *"
        @load="onFreecutLoad"
      />
    </EditorShell>
  </div>
</template>

<script>
import EditorShell from '../EditorShell.vue'
import { proxyAppView } from './app-view-proxy.mjs'
import {
  buildFreecutImportMessage,
  deforaMediaFileUrl,
  freecutEditorUrl,
  freecutProjectsUrl,
} from '../../shared/freecut-bridge.mjs'

export default {
  name: 'EditorView',
  components: { EditorShell },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
  computed: {
    freecutFrameSrc() {
      const route = String(this.editorFreecutRoute || 'projects').trim()
      if (route.startsWith('editor/')) {
        const projectId = route.slice('editor/'.length)
        return freecutEditorUrl(projectId)
      }
      return freecutProjectsUrl()
    },
    editorImportUrl() {
      const raw = String(this.editorPendingImportUrl || '').trim()
      if (raw) return raw
      const path = String(this.editorPendingImportPath || '').trim()
      if (!path) return ''
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      return deforaMediaFileUrl(origin, path, this.editorPendingImportRootId)
    },
  },
  methods: {
    navigateFreecut(route) {
      this.editorFreecutRoute = route === 'projects' ? 'projects' : String(route || 'projects')
      this.editorStatus = route === 'projects' ? 'Browsing projects' : 'Opening editor'
      this.saveSessionState()
    },
    openFreecutNewTab() {
      if (typeof window === 'undefined') return
      window.open(this.freecutFrameSrc, '_blank', 'noopener,noreferrer')
    },
    onFreecutLoad() {
      this.editorStatus = 'FreeCut ready'
      this.editorStatusLive = true
      if (this.editorImportUrl) this.postImportToFreecut()
    },
    postImportToFreecut() {
      const frame = this.$refs.freecutFrame
      const message = buildFreecutImportMessage(this.editorImportUrl)
      if (!frame || !frame.contentWindow || !message) return
      try {
        frame.contentWindow.postMessage(message, window.location.origin)
        this.editorStatus = 'Sent import URL to FreeCut'
      } catch (_e) {
        this.editorStatus = 'Copy the import URL into FreeCut media library'
      }
    },
    importFromLibrary() {
      if (!this.editorImportUrl) {
        this.editorStatus = 'Select a video in Library first'
        return
      }
      this.postImportToFreecut()
      this.editorPendingImportPath = ''
      this.editorPendingImportRootId = ''
      this.editorPendingImportUrl = this.editorImportUrl
      this.saveSessionState()
    },
    async copyImportUrl() {
      if (!this.editorImportUrl) return
      try {
        await navigator.clipboard.writeText(this.editorImportUrl)
        this.editorStatus = 'Import URL copied'
      } catch (_e) {
        this.editorStatus = 'Could not copy URL — select and copy manually'
      }
    },
  },
}
</script>
