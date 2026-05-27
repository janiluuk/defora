<template>
  <div class="video-swarm-browser" data-testid="video-swarm-browser">
    <div class="video-swarm-browser__toolbar framesync-panel">
      <div class="video-swarm-browser__toolbar-row">
        <div class="video-swarm-browser__roots">
          <select
            class="framesync-select"
            :value="systemFiles.rootId"
            :disabled="systemFiles.loading"
            @change="onRootChange($event.target.value)"
          >
            <option v-for="root in systemFiles.roots" :key="'vfs-root-' + root.id" :value="root.id">
              {{ root.label }}
            </option>
          </select>
          <button
            type="button"
            class="framesync-button framesync-button--compact"
            :disabled="!systemFiles.parent || systemFiles.loading"
            title="Parent folder"
            @click="browseSystemFiles(systemFiles.parent)"
          >
            ↑ Up
          </button>
        </div>
        <div class="video-swarm-browser__chips chips">
          <button
            type="button"
            class="chip"
            :class="{ active: systemFiles.recursive }"
            :disabled="systemFiles.loading"
            @click="toggleSystemFilesRecursive"
          >
            Subfolders
          </button>
          <button
            type="button"
            class="chip"
            :class="{ active: systemFiles.showFilenames }"
            :disabled="systemFiles.loading"
            @click="toggleSystemFilesShowNames"
          >
            Names
          </button>
        </div>
        <select
          class="framesync-select video-swarm-browser__sort"
          :value="systemFiles.sortKey"
          :disabled="systemFiles.loading"
          @change="setSystemFilesSort($event.target.value)"
        >
          <option value="name-asc">Name ↑</option>
          <option value="name-desc">Name ↓</option>
          <option value="mtime-desc">Modified ↓</option>
          <option value="mtime-asc">Modified ↑</option>
          <option value="size-desc">Size ↓</option>
          <option value="size-asc">Size ↑</option>
        </select>
        <label class="video-swarm-browser__zoom">
          <span class="framesync-subtitle">Zoom</span>
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            :value="systemFiles.zoomLevel"
            :disabled="systemFiles.loading"
            @input="setSystemFilesZoom(Number($event.target.value))"
          >
        </label>
        <button
          type="button"
          class="framesync-button"
          :disabled="systemFiles.loading"
          @click="refreshSystemFilesBrowse(true)"
        >
          Refresh
        </button>
      </div>
      <div class="video-swarm-browser__path">
        <code>{{ systemFiles.currentPath || '—' }}</code>
        <span v-if="systemFiles.videoCount != null" class="video-swarm-browser__count">
          {{ systemFiles.videoCount }} videos
        </span>
      </div>
      <div v-if="systemFiles.status" class="framesync-subtitle video-swarm-browser__status">{{ systemFiles.status }}</div>
    </div>

    <div v-if="systemFiles.loading" class="video-swarm-browser__empty">Scanning folder…</div>
    <div v-else-if="!displayVideos.length" class="video-swarm-browser__empty">No videos in this location.</div>
    <div
      v-else
      ref="gridEl"
      class="video-swarm-browser__grid"
      :class="'video-swarm-browser__grid--zoom-' + systemFiles.zoomLevel"
      @scroll.passive="onGridScroll"
    >
      <button
        v-for="(video, index) in displayVideos"
        :key="video.path"
        type="button"
        class="video-swarm-browser__tile"
        :class="{
          'video-swarm-browser__tile--selected': systemFiles.selectedPaths.includes(video.path),
          'video-swarm-browser__tile--hover': hoveredPath === video.path,
        }"
        :data-video-path="video.path"
        @click="onTileClick($event, video, index)"
        @dblclick.prevent="openSystemFileFullscreen(index)"
        @contextmenu.prevent="openTileMenu($event, video)"
        @mouseenter="onTileEnter(video)"
        @mouseleave="onTileLeave(video)"
      >
        <video
          v-if="shouldLoadVideo(video)"
          :ref="(el) => registerTileVideo(video.path, el)"
          class="video-swarm-browser__video"
          muted
          loop
          playsinline
          preload="metadata"
          :src="systemFileMediaUrl(video.path)"
          @loadeddata="onVideoLoaded(video.path)"
        />
        <div v-else class="video-swarm-browser__placeholder">▶</div>
        <div v-if="systemFiles.showFilenames" class="video-swarm-browser__label">{{ video.name }}</div>
        <div class="video-swarm-browser__meta">{{ formatFileSize(video.size) }}</div>
      </button>
    </div>

  <teleport to="body">
    <div
      v-if="systemFiles.fullscreenIndex >= 0 && fullscreenVideo"
      class="video-swarm-browser__modal"
      data-testid="video-swarm-fullscreen"
      @click.self="closeSystemFileFullscreen"
    >
      <div class="video-swarm-browser__modal-inner">
        <div class="video-swarm-browser__modal-head">
          <strong>{{ fullscreenVideo.name }}</strong>
          <div class="video-swarm-browser__modal-actions">
            <button type="button" class="framesync-button framesync-button--compact" @click="stepSystemFileFullscreen(-1)">← Prev</button>
            <button type="button" class="framesync-button framesync-button--compact" @click="stepSystemFileFullscreen(1)">Next →</button>
            <button type="button" class="framesync-button framesync-button--compact" @click="copySystemFilePath(fullscreenVideo.path)">Copy path</button>
            <button type="button" class="framesync-button framesync-button--danger framesync-button--compact" @click="deleteSystemFile(fullscreenVideo.path)">Delete</button>
            <button type="button" class="framesync-button framesync-button--compact" @click="closeSystemFileFullscreen">Close</button>
          </div>
        </div>
        <video
          ref="modalVideoEl"
          class="video-swarm-browser__modal-video"
          controls
          autoplay
          playsinline
          :src="systemFileMediaUrl(fullscreenVideo.path)"
        />
      </div>
    </div>
  </teleport>

  <teleport to="body">
    <div
      v-if="contextMenu.open"
      class="video-swarm-browser__menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
    >
      <button type="button" class="framesync-button framesync-button--compact" @click="openContextFullscreen">Open</button>
      <button type="button" class="framesync-button framesync-button--compact" @click="copySystemFilePath(contextMenu.video?.path)">Copy path</button>
      <button type="button" class="framesync-button framesync-button--danger framesync-button--compact" @click="deleteContextVideo">Delete</button>
    </div>
  </teleport>
  </div>
</template>

<script>
import { proxyAppView } from './views/app-view-proxy.mjs'

const RENDER_BUFFER = 24

export default {
  name: 'VideoSwarmBrowser',
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
  data() {
    return {
      hoveredPath: null,
      visibleStart: 0,
      visibleEnd: 48,
      contextMenu: { open: false, x: 0, y: 0, video: null, index: -1 },
      tileVideos: {},
      modalVideoEl: null,
    }
  },
  computed: {
    displayVideos() {
      const list = Array.isArray(this.systemFiles.videos) ? this.systemFiles.videos : []
      return list.slice(this.visibleStart, this.visibleEnd)
    },
    fullscreenVideo() {
      const list = this.systemFiles.videos || []
      const idx = this.systemFiles.fullscreenIndex
      return idx >= 0 && idx < list.length ? list[idx] : null
    },
  },
  watch: {
    'systemFiles.videos'() {
      this.visibleStart = 0
      this.visibleEnd = 48
      this.$nextTick(() => this.updateVisibleWindow())
    },
    'systemFiles.fullscreenIndex'(idx) {
      document.removeEventListener('keydown', this.onFullscreenKey)
      if (idx < 0) return
      this.$nextTick(() => {
        const el = this.$refs.modalVideoEl
        if (el) el.play?.().catch(() => {})
      })
      document.addEventListener('keydown', this.onFullscreenKey)
    },
  },
  mounted() {
    void this.initSystemFilesBrowser()
    document.addEventListener('click', this.closeContextMenu)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeContextMenu)
    document.removeEventListener('keydown', this.onFullscreenKey)
    this.pauseAllTileVideos()
  },
  methods: {
    formatFileSize(bytes) {
      const n = Number(bytes) || 0
      if (n < 1024) return `${n} B`
      if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
      return `${(n / (1024 * 1024)).toFixed(1)} MB`
    },
    onRootChange(rootId) {
      const root = (this.systemFiles.roots || []).find((r) => r.id === rootId)
      if (root) void this.browseSystemFiles(root.path, { rootId })
    },
    onGridScroll() {
      this.updateVisibleWindow()
    },
    updateVisibleWindow() {
      const grid = this.$refs.gridEl
      const total = (this.systemFiles.videos || []).length
      if (!grid || !total) {
        this.visibleStart = 0
        this.visibleEnd = 48
        return
      }
      const tile = grid.querySelector('.video-swarm-browser__tile')
      const tileHeight = tile ? tile.offsetHeight + 10 : 180
      const cols = Math.max(1, Math.floor(grid.clientWidth / Math.max(tile?.offsetWidth || 200, 120)))
      const rowsVisible = Math.ceil(grid.clientHeight / tileHeight) + 2
      const startRow = Math.max(0, Math.floor(grid.scrollTop / tileHeight) - 1)
      const start = Math.max(0, startRow * cols)
      const end = Math.min(total, start + rowsVisible * cols + RENDER_BUFFER)
      this.visibleStart = start
      this.visibleEnd = end
    },
    shouldLoadVideo(video) {
      return Boolean(video && (this.hoveredPath === video.path || this.systemFiles.selectedPaths.includes(video.path)))
    },
    registerTileVideo(path, el) {
      if (el) this.tileVideos[path] = el
      else delete this.tileVideos[path]
    },
    onTileEnter(video) {
      this.hoveredPath = video.path
      this.$nextTick(() => {
        const el = this.tileVideos[video.path]
        if (el) el.play?.().catch(() => {})
      })
    },
    onTileLeave(video) {
      if (this.hoveredPath === video.path) this.hoveredPath = null
      const el = this.tileVideos[video.path]
      if (el) {
        el.pause()
        el.currentTime = 0
      }
    },
    pauseAllTileVideos() {
      Object.values(this.tileVideos).forEach((el) => {
        try {
          el.pause()
        } catch (_e) {}
      })
    },
    onVideoLoaded(path) {
      if (this.hoveredPath === path) {
        const el = this.tileVideos[path]
        el?.play?.().catch(() => {})
      }
    },
    onTileClick(event, video) {
      if (event.ctrlKey || event.metaKey) {
        this.toggleSystemFileSelection(video.path)
        return
      }
      this.systemFiles.selectedPaths = [video.path]
    },
    openTileMenu(event, video) {
      const list = this.systemFiles.videos || []
      const index = list.findIndex((v) => v.path === video.path)
      this.contextMenu = {
        open: true,
        x: event.clientX,
        y: event.clientY,
        video,
        index,
      }
    },
    closeContextMenu() {
      this.contextMenu.open = false
    },
    openContextFullscreen() {
      if (this.contextMenu.index >= 0) this.openSystemFileFullscreen(this.contextMenu.index)
      this.closeContextMenu()
    },
    deleteContextVideo() {
      if (this.contextMenu.video) void this.deleteSystemFile(this.contextMenu.video.path)
      this.closeContextMenu()
    },
    onFullscreenKey(event) {
      if (this.systemFiles.fullscreenIndex < 0) return
      if (event.key === 'Escape') this.closeSystemFileFullscreen()
      if (event.key === 'ArrowLeft') this.stepSystemFileFullscreen(-1)
      if (event.key === 'ArrowRight') this.stepSystemFileFullscreen(1)
      if (event.key === ' ') {
        event.preventDefault()
        const el = this.$refs.modalVideoEl
        if (!el) return
        if (el.paused) el.play()
        else el.pause()
      }
    },
  },
}
</script>
