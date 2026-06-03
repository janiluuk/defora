<template>
  <div class="library-browser__panel videos-browser" data-testid="videos-browser">
    <div class="library-browser__toolbar framesync-panel">
      <div class="library-browser__head">
        <p class="framesync-subtitle library-browser__subtitle">
          Every export, recording, and upload — thumbnails update as files appear.
        </p>
      </div>
      <div class="library-browser__actions">
        <button
          type="button"
          class="framesync-button framesync-button--compact framesync-button--live"
          :disabled="loading"
          data-testid="videos-upload-video"
          title="Upload a video"
          @click="openUploadPicker()"
        >
          + Video
        </button>
        <button
          type="button"
          class="framesync-button framesync-button--compact"
          :class="{ 'framesync-button--loading': loading }"
          :disabled="loading"
          data-testid="videos-refresh"
          @click="loadVideos()"
        >
          <span v-if="loading" class="lazy-loading-indicator__spinner" aria-hidden="true" />
          Refresh
        </button>
        <input
          ref="uploadInputEl"
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-m4v,video/*,.mp4,.webm,.mov,.mkv,.m4v,.avi"
          multiple
          class="library-browser__upload-input"
          data-testid="videos-upload-input"
          @change="onUploadInputChange"
        >
      </div>
      <div v-if="status" class="framesync-subtitle library-browser__status">{{ status }}</div>
    </div>

    <div
      class="library-browser__dropzone"
      :class="{ 'library-browser__dropzone--active': dropzoneActive }"
      data-testid="videos-dropzone"
      @dragenter="onDropEnter"
      @dragover="onDropOver"
      @dragleave="onDropLeave"
      @drop="onDropFiles"
    >
      <div v-if="dropzoneActive" class="library-browser__dropzone-hint">
        Drop video files here
      </div>

      <div v-if="loading" class="library-browser__skeleton-grid" aria-busy="true" aria-label="Loading videos">
        <div v-for="n in 6" :key="'skel-' + n" class="library-browser__skeleton-card">
          <div class="library-browser__skeleton-media" />
          <div class="library-browser__skeleton-line library-browser__skeleton-line--wide" />
          <div class="library-browser__skeleton-line" />
        </div>
      </div>
      <div v-else-if="!videos.length" class="library-browser__empty">
        No videos yet — record on LIVE, export a run, or upload with + Video.
      </div>
      <div v-else class="library-browser__grid">
        <LibraryMediaCard
          v-for="video in videos"
          :key="video.id"
          card-test-id="video-card"
          :item="video"
          :selected="selectedId === video.id"
          :hovered="hoveredId === video.id"
          :show-video-preview="shouldPreviewVideo(video)"
          :badges="videoBadges(video)"
          @mouseenter="hoveredId = video.id"
          @mouseleave="hoveredId = null"
          @click="selectVideo"
          @dblclick="openVideo"
          @watch="openVideo"
          @edit="openVideoInEditor"
          @video-ref="onPreviewVideoRef"
        />
      </div>
    </div>

    <div
      v-if="fullscreenVideo"
      class="library-browser__modal"
      data-testid="videos-fullscreen"
      @click="onFullscreenBackdropClick"
    >
      <div class="library-browser__modal-inner">
        <div class="library-browser__modal-head">
          <strong>{{ fullscreenVideo.title }}</strong>
          <div class="library-browser__modal-actions">
            <button type="button" class="framesync-button framesync-button--compact framesync-button--live" @click="useVideoAsSource(fullscreenVideo)">
              Use as source
            </button>
            <button type="button" class="framesync-button framesync-button--compact" @click="loadVideoToMotionSequence(fullscreenVideo)">
              Load to motion sequence
            </button>
            <button type="button" class="framesync-button framesync-button--compact" @click="openVideoInEditor(fullscreenVideo)">
              Open in editor
            </button>
            <button
              type="button"
              class="framesync-button framesync-button--compact"
              data-testid="library-fullscreen-close"
              @click="closeFullscreen"
            >
              Close
            </button>
          </div>
        </div>
        <video
          v-if="fullscreenVideo.videoUrl"
          ref="modalVideoEl"
          class="library-browser__modal-video"
          controls
          autoplay
          playsinline
          :src="fullscreenVideo.videoUrl"
        />
      </div>
    </div>
  </div>
</template>

<script>
import LibraryMediaCard from './LibraryMediaCard.vue'

export default {
  name: 'VideosBrowser',
  components: { LibraryMediaCard },
  props: {
    app: { type: Object, required: true },
    active: { type: Boolean, default: true },
  },
  data() {
    return {
      videos: [],
      loading: false,
      status: '',
      selectedId: null,
      hoveredId: null,
      fullscreenVideo: null,
      previewVideos: {},
      dropzoneActive: false,
      dropzoneDepth: 0,
    }
  },
  mounted() {
    if (this.active) void this.loadVideos()
    document.addEventListener('keydown', this.onFullscreenKey)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onFullscreenKey)
    this.pauseAllPreviewVideos()
  },
  methods: {
    async loadVideos() {
      this.loading = true
      this.status = ''
      try {
        const res = await fetch('/api/video-swarm/videos')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load videos')
        this.videos = Array.isArray(data.videos) ? data.videos : []
      } catch (err) {
        this.status = err.message || 'Videos unavailable'
        this.videos = []
      } finally {
        this.loading = false
      }
    },
    videoBadges(video) {
      const badges = [{ label: 'Video', variant: 'video' }]
      if (video.source === 'recording') badges.push({ label: 'Recording', variant: 'recording' })
      if (video.source === 'run') badges.push({ label: 'Run', variant: 'run' })
      return badges
    },
    shouldPreviewVideo(video) {
      return this.hoveredId === video.id || this.selectedId === video.id
    },
    onPreviewVideoRef({ id, el }) {
      if (el) this.previewVideos[id] = el
      else delete this.previewVideos[id]
    },
    pauseAllPreviewVideos() {
      Object.values(this.previewVideos).forEach((el) => {
        try { el.pause() } catch (_e) { /* ignore */ }
      })
    },
    selectVideo(video) {
      this.selectedId = video?.id || null
      this.app.librarySelectedVideo = video || null
      this.app.librarySelectedProject = video || null
      if (video?.videoUrl) {
        this.$nextTick(() => {
          this.previewVideos[video.id]?.play?.().catch(() => {})
        })
      }
    },
    openVideo(video) {
      if (!video?.videoUrl) return
      this.fullscreenVideo = video
      this.$nextTick(() => {
        this.$refs.modalVideoEl?.play?.().catch(() => {})
      })
    },
    closeFullscreen() {
      this.fullscreenVideo = null
    },
    onFullscreenBackdropClick(event) {
      if (event.target === event.currentTarget) this.closeFullscreen()
    },
    onFullscreenKey(event) {
      if (!this.fullscreenVideo) return
      if (event.key === 'Escape') {
        event.stopPropagation()
        this.closeFullscreen()
      }
    },
    openVideoInEditor(video) {
      if (!video?.videoPath) {
        this.status = 'No video file for this item'
        return
      }
      this.app.openInVideoEditor({
        path: video.videoPath,
        rootId: video.rootId || 'uploads',
        name: video.title,
        url: video.videoUrl,
      })
    },
    useVideoAsSource(video) {
      if (!video) return
      this.selectVideo(video)
      void this.app.applyLibrarySelectionAsSource()
    },
    loadVideoToMotionSequence(video) {
      if (!video) return
      this.selectVideo(video)
      void this.app.applyLibrarySelectionToMotionSequencer()
    },
    openUploadPicker() {
      this.$refs.uploadInputEl?.click()
    },
    async uploadVideoFile(file) {
      if (!file) return
      const name = String(file.name || 'upload.mp4')
      const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')).toLowerCase() : ''
      const allowed = ['.mp4', '.webm', '.mov', '.mkv', '.m4v', '.avi']
      if (ext && !allowed.includes(ext)) {
        this.status = 'Unsupported file type (use mp4, webm, mov, mkv, m4v, avi)'
        return
      }
      this.loading = true
      this.status = `Uploading ${name}…`
      try {
        const body = await file.arrayBuffer()
        const q = new URLSearchParams({ name, dir: 'projects' })
        const res = await fetch(`/api/video-swarm/upload?${q.toString()}`, {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
            'X-Filename': name,
          },
          body,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        this.status = 'Video added'
        await this.loadVideos()
        const match = this.videos.find((v) => v.videoPath === data.path)
        if (match) this.selectVideo(match)
      } catch (err) {
        this.status = err.message || 'Upload failed'
      } finally {
        this.loading = false
      }
    },
    onUploadInputChange(event) {
      const files = Array.from(event.target?.files || [])
      event.target.value = ''
      files.forEach((file) => { void this.uploadVideoFile(file) })
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
      const files = Array.from(event.dataTransfer?.files || [])
      files.forEach((file) => { void this.uploadVideoFile(file) })
    },
  },
  watch: {
    active(isActive) {
      if (isActive && !this.videos.length && !this.loading) void this.loadVideos()
    },
    hoveredId(id) {
      this.$nextTick(() => {
        Object.entries(this.previewVideos).forEach(([videoId, el]) => {
          if (!el) return
          if (videoId === id || videoId === this.selectedId) {
            el.play?.().catch(() => {})
          } else {
            el.pause()
            el.currentTime = 0
          }
        })
      })
    },
  },
}
</script>
