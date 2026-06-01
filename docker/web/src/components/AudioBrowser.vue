<template>
  <div class="library-browser__panel audio-browser" data-testid="audio-browser">
    <div class="library-browser__toolbar framesync-panel">
      <div class="library-browser__head">
        <p class="framesync-subtitle library-browser__subtitle">
          Uploaded and generated audio — preview tracks and load them into the reactive session.
        </p>
      </div>
      <div class="library-browser__actions">
        <button
          type="button"
          class="framesync-button framesync-button--compact framesync-button--live"
          :disabled="loading"
          data-testid="audio-upload"
          title="Upload audio file"
          @click="openUploadPicker()"
        >
          + Audio
        </button>
        <button
          type="button"
          class="framesync-button framesync-button--compact"
          :class="{ 'framesync-button--loading': loading }"
          :disabled="loading"
          data-testid="audio-refresh"
          @click="loadAudio()"
        >
          <span v-if="loading" class="lazy-loading-indicator__spinner" aria-hidden="true" />
          Refresh
        </button>
        <input
          ref="uploadInputEl"
          type="file"
          accept="audio/wav,audio/mpeg,audio/ogg,audio/flac,audio/mp4,audio/x-m4a,.wav,.mp3,.ogg,.flac,.m4a"
          multiple
          class="library-browser__upload-input"
          data-testid="audio-upload-input"
          @change="onUploadInputChange"
        >
      </div>
      <div v-if="status" class="framesync-subtitle library-browser__status">{{ status }}</div>
    </div>

    <div
      class="library-browser__dropzone"
      :class="{ 'library-browser__dropzone--active': dropzoneActive }"
      data-testid="audio-dropzone"
      @dragenter="onDropEnter"
      @dragover="onDropOver"
      @dragleave="onDropLeave"
      @drop="onDropFiles"
    >
      <div v-if="dropzoneActive" class="library-browser__dropzone-hint">
        Drop audio files here
      </div>

      <div v-if="loading" class="library-browser__skeleton-grid" aria-busy="true" aria-label="Loading audio">
        <div v-for="n in 6" :key="'skel-' + n" class="library-browser__skeleton-card">
          <div class="library-browser__skeleton-media" />
          <div class="library-browser__skeleton-line library-browser__skeleton-line--wide" />
          <div class="library-browser__skeleton-line" />
        </div>
      </div>
      <div v-else-if="!tracks.length" class="library-browser__empty">
        No audio yet — upload on AUDIO tab or drop a file here with + Audio.
      </div>
      <div v-else class="library-browser__grid">
        <LibraryAudioCard
          v-for="track in tracks"
          :key="track.id"
          :item="track"
          :selected="selectedId === track.id"
          :hovered="hoveredId === track.id"
          :use-label="libraryUseLabel"
          @mouseenter="hoveredId = track.id"
          @mouseleave="hoveredId = null"
          @click="selectTrack"
          @use="useTrackInSession"
          @preview-state="onPreviewState"
        />
      </div>
    </div>
  </div>
</template>

<script>
import LibraryAudioCard from './LibraryAudioCard.vue'

export default {
  name: 'AudioBrowser',
  components: { LibraryAudioCard },
  props: {
    app: { type: Object, required: true },
    active: { type: Boolean, default: true },
  },
  data() {
    return {
      tracks: [],
      loading: false,
      status: '',
      selectedId: null,
      hoveredId: null,
      dropzoneActive: false,
      dropzoneDepth: 0,
      playingId: null,
    }
  },
  computed: {
    libraryUseLabel() {
      return this.app?.librarySourceMode ? 'Use as source' : 'Use in session';
    },
  },
  mounted() {
    if (this.active) void this.loadAudio()
  },
  methods: {
    async loadAudio() {
      this.loading = true
      this.status = ''
      try {
        const res = await fetch('/api/video-swarm/audio')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load audio')
        this.tracks = Array.isArray(data.audio) ? data.audio : []
      } catch (err) {
        this.status = err.message || 'Audio unavailable'
        this.tracks = []
      } finally {
        this.loading = false
      }
    },
    selectTrack(track) {
      this.selectedId = track?.id || null
      this.app.librarySelectedAudio = track || null
    },
    useTrackInSession(track) {
      if (!track?.audioPath) {
        this.status = 'No audio file for this item'
        return
      }
      if (typeof this.app.useLibraryAudio === 'function') {
        const driveWebgl = !!this.app.librarySourceMode
        this.app.useLibraryAudio(track, { webgl: driveWebgl })
        this.status = driveWebgl
          ? 'Driving WebGL visualizer'
          : 'Loaded into session — open AUDIO tab to react'
      } else {
        this.status = 'Session audio handoff unavailable'
      }
    },
    onPreviewState({ id, playing }) {
      this.playingId = playing ? id : (this.playingId === id ? null : this.playingId)
    },
    openUploadPicker() {
      this.$refs.uploadInputEl?.click()
    },
    async uploadAudioFile(file) {
      if (!file) return
      const name = String(file.name || 'upload.wav')
      const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')).toLowerCase() : ''
      const allowed = ['.wav', '.mp3', '.ogg', '.flac', '.m4a']
      if (ext && !allowed.includes(ext)) {
        this.status = 'Unsupported file type (use wav, mp3, ogg, flac, m4a)'
        return
      }
      this.loading = true
      this.status = `Uploading ${name}…`
      try {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => reject(reader.error || new Error('Could not read file'))
          reader.readAsDataURL(file)
        })
        const res = await fetch('/api/audio-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, data: dataUrl }),
        })
        const json = await res.json()
        if (!res.ok || json.error) throw new Error(json.error || 'Upload failed')
        this.status = 'Audio added'
        await this.loadAudio()
        const match = this.tracks.find((t) => t.audioPath === json.path)
        if (match) {
          this.selectTrack(match)
          if (this.app.librarySourceMode) this.useTrackInSession(match)
        }
      } catch (err) {
        this.status = err.message || 'Upload failed'
      } finally {
        this.loading = false
      }
    },
    onUploadInputChange(event) {
      const files = Array.from(event.target?.files || [])
      event.target.value = ''
      files.forEach((file) => { void this.uploadAudioFile(file) })
    },
    onDropEnter(event) {
      event?.preventDefault?.()
      this.dropzoneDepth += 1
      this.dropzoneActive = true
    },
    onDropOver(event) {
      event?.preventDefault?.()
      this.dropzoneActive = true
    },
    onDropLeave(event) {
      event?.preventDefault?.()
      this.dropzoneDepth = Math.max(0, this.dropzoneDepth - 1)
      if (this.dropzoneDepth === 0) this.dropzoneActive = false
    },
    onDropFiles(event) {
      event?.preventDefault?.()
      this.dropzoneDepth = 0
      this.dropzoneActive = false
      const files = Array.from(event.dataTransfer?.files || []).filter((f) => {
        const n = String(f.name || '').toLowerCase()
        return /\.(wav|mp3|ogg|flac|m4a)$/.test(n) || String(f.type || '').startsWith('audio/')
      })
      files.forEach((file) => { void this.uploadAudioFile(file) })
    },
  },
  watch: {
    active(isActive) {
      if (isActive && !this.tracks.length && !this.loading) void this.loadAudio()
    },
  },
}
</script>
