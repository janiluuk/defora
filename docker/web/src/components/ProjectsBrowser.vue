<template>
  <div class="library-browser__panel projects-browser" data-testid="projects-browser">
    <div class="library-browser__toolbar framesync-panel">
      <div class="library-browser__head">
        <p class="framesync-subtitle library-browser__subtitle">
          Generations grouped by session — frame counts, previews, and exports.
        </p>
      </div>
      <div class="library-browser__actions">
        <button
          type="button"
          class="framesync-button framesync-button--compact framesync-button--live"
          :disabled="loading"
          data-testid="projects-upload-video"
          title="Upload video to a new project"
          @click="openUploadPicker()"
        >
          + Video
        </button>
        <button
          type="button"
          class="framesync-button framesync-button--compact"
          :class="{ 'framesync-button--loading': loading }"
          :disabled="loading"
          data-testid="projects-refresh"
          @click="loadProjects()"
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
          data-testid="projects-upload-input"
          @change="onUploadInputChange"
        >
      </div>
      <div v-if="status" class="framesync-subtitle library-browser__status">{{ status }}</div>
    </div>

    <div
      class="library-browser__dropzone"
      :class="{ 'library-browser__dropzone--active': dropzoneActive }"
      data-testid="projects-dropzone"
      @dragenter="onDropEnter"
      @dragover="onDropOver"
      @dragleave="onDropLeave"
      @drop="onDropFiles"
    >
      <div v-if="dropzoneActive" class="library-browser__dropzone-hint">
        Drop video files to add a project
      </div>

      <div v-if="loading" class="library-browser__skeleton-grid" aria-busy="true" aria-label="Loading projects">
        <div v-for="n in 6" :key="'skel-' + n" class="library-browser__skeleton-card">
          <div class="library-browser__skeleton-media" />
          <div class="library-browser__skeleton-line library-browser__skeleton-line--wide" />
          <div class="library-browser__skeleton-line" />
        </div>
      </div>
      <div v-else-if="!projects.length" class="library-browser__empty">
        No projects yet — generate frames on LIVE or upload a video with + Video.
      </div>
      <div v-else class="library-browser__grid">
        <LibraryMediaCard
          v-for="project in projects"
          :key="project.id"
          card-test-id="project-card"
          :item="project"
          :selected="selectedId === project.id"
          :hovered="hoveredId === project.id"
          :show-video-preview="shouldPreviewVideo(project)"
          :show-actions="project.hasVideo"
          :badges="projectBadges(project)"
          @mouseenter="hoveredId = project.id"
          @mouseleave="hoveredId = null"
          @click="selectProject"
          @dblclick="openProject"
          @watch="openProject"
          @edit="openProjectInEditor"
          @video-ref="onPreviewVideoRef"
        />
      </div>
    </div>

    <div
      v-if="fullscreenProject"
      class="library-browser__modal"
      data-testid="projects-fullscreen"
      @click="onFullscreenBackdropClick"
    >
      <div class="library-browser__modal-inner">
        <div class="library-browser__modal-head">
          <strong>{{ fullscreenProject.title }}</strong>
          <div class="library-browser__modal-actions">
            <button type="button" class="framesync-button framesync-button--compact framesync-button--live" @click="useProjectAsSource(fullscreenProject)">
              Use as source
            </button>
            <button type="button" class="framesync-button framesync-button--compact" @click="loadProjectToMotionSequence(fullscreenProject)">
              Load to motion sequence
            </button>
            <button type="button" class="framesync-button framesync-button--compact" @click="openProjectInEditor(fullscreenProject)">
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
          v-if="fullscreenProject.videoUrl"
          ref="modalVideoEl"
          class="library-browser__modal-video"
          controls
          autoplay
          playsinline
          :src="fullscreenProject.videoUrl"
        />
      </div>
    </div>
  </div>
</template>

<script>
import LibraryMediaCard from './LibraryMediaCard.vue'

export default {
  name: 'ProjectsBrowser',
  components: { LibraryMediaCard },
  props: {
    app: { type: Object, required: true },
    active: { type: Boolean, default: true },
  },
  data() {
    return {
      projects: [],
      loading: false,
      status: '',
      selectedId: null,
      hoveredId: null,
      fullscreenProject: null,
      previewVideos: {},
      dropzoneActive: false,
      dropzoneDepth: 0,
    }
  },
  mounted() {
    if (this.active) void this.loadProjects()
    document.addEventListener('keydown', this.onFullscreenKey)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onFullscreenKey)
    this.pauseAllPreviewVideos()
  },
  methods: {
    async loadProjects() {
      this.loading = true
      this.status = ''
      try {
        const res = await fetch('/api/video-swarm/projects')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load projects')
        this.projects = (Array.isArray(data.projects) ? data.projects : []).map((p) => ({
          ...p,
          meta: this.formatProjectMeta(p),
        }))
      } catch (err) {
        this.status = err.message || 'Projects unavailable'
        this.projects = []
      } finally {
        this.loading = false
      }
    },
    projectBadges(project) {
      const badges = []
      if (project.frameCount > 0) {
        badges.push({
          label: `${project.frameCount} frame${project.frameCount === 1 ? '' : 's'}`,
        })
      }
      if (project.hasVideo) badges.push({ label: 'Video', variant: 'video' })
      return badges
    },
    formatProjectMeta(project) {
      const parts = []
      if (project.frameCount > 0) {
        parts.push(`${project.frameCount} frame${project.frameCount === 1 ? '' : 's'}`)
      }
      if (project.hasVideo) parts.push('video ready')
      if (project.updatedAt) {
        const d = new Date(project.updatedAt)
        if (!Number.isNaN(d.getTime())) {
          parts.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))
        }
      }
      return parts.join(' · ') || 'Empty project'
    },
    shouldPreviewVideo(project) {
      return Boolean(project.hasVideo && project.videoUrl && (this.hoveredId === project.id || this.selectedId === project.id))
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
    selectProject(project) {
      this.selectedId = project?.id || null
      const enriched = project ? { ...project, meta: this.formatProjectMeta(project) } : null
      this.app.librarySelectedProject = enriched
      this.app.librarySelectedVideo = enriched
      if (project?.hasVideo && project?.videoUrl) {
        this.$nextTick(() => {
          this.previewVideos[project.id]?.play?.().catch(() => {})
        })
      }
    },
    openProject(project) {
      if (!project?.hasVideo || !project.videoUrl) return
      this.fullscreenProject = project
      this.$nextTick(() => {
        this.$refs.modalVideoEl?.play?.().catch(() => {})
      })
    },
    closeFullscreen() {
      this.fullscreenProject = null
    },
    onFullscreenBackdropClick(event) {
      if (event.target === event.currentTarget) this.closeFullscreen()
    },
    onFullscreenKey(event) {
      if (!this.fullscreenProject) return
      if (event.key === 'Escape') {
        event.stopPropagation()
        this.closeFullscreen()
      }
    },
    openProjectInEditor(project) {
      if (!project?.videoPath) {
        this.status = 'This project has no video yet'
        return
      }
      this.app.openInVideoEditor({
        path: project.videoPath,
        rootId: project.rootId || 'uploads',
        name: project.title,
        url: project.videoUrl,
      })
    },
    useProjectAsSource(project) {
      if (!project?.videoPath) return
      this.selectProject(project)
      void this.app.applyLibrarySelectionAsSource()
    },
    loadProjectToMotionSequence(project) {
      if (!project?.videoPath) return
      this.selectProject(project)
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
        this.status = 'Video added to Projects'
        await this.loadProjects()
        const match = this.projects.find((p) => p.videoPath === data.path)
        if (match) this.selectProject(match)
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
      if (isActive && !this.projects.length && !this.loading) void this.loadProjects()
    },
    hoveredId(id) {
      this.$nextTick(() => {
        Object.entries(this.previewVideos).forEach(([projectId, el]) => {
          if (!el) return
          if (projectId === id || projectId === this.selectedId) {
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
