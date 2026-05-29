<template>
  <div class="video-swarm-browser" data-testid="video-swarm-browser">
    <div class="video-swarm-browser__toolbar framesync-panel">
      <div class="video-swarm-browser__toolbar-row">
        <div class="video-swarm-browser__roots">
          <select
            class="framesync-select"
            :value="systemFiles.rootId"
            :disabled="systemFiles.loading"
            data-testid="video-swarm-root-select"
            @change="onRootChange($event.target.value)"
          >
            <option v-for="root in systemFiles.roots" :key="'vfs-root-' + root.id" :value="root.id">
              {{ root.label }}
            </option>
          </select>
          <button
            type="button"
            class="framesync-button framesync-button--compact"
            :disabled="!systemFiles.parent || systemFiles.loading || videoSwarmIsCloudRoot || videoSwarmIsVideosOnly"
            title="Parent folder"
            @click="browseSystemFiles(systemFiles.parent)"
          >
            ↑ Up
          </button>
          <button
            type="button"
            class="framesync-button framesync-button--compact"
            :disabled="systemFiles.loading || videoSwarmIsCloudRoot"
            data-testid="video-swarm-new-folder"
            title="New folder"
            @click="openNewFolderDialog()"
          >
            + Folder
          </button>
          <button
            type="button"
            class="framesync-button framesync-button--compact framesync-button--live"
            :disabled="systemFiles.loading || videoSwarmIsCloudRoot"
            data-testid="video-swarm-upload-video"
            title="Upload video file"
            @click="openUploadPicker()"
          >
            + Video
          </button>
          <input
            ref="uploadInputEl"
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-m4v,video/*,.mp4,.webm,.mov,.mkv,.m4v,.avi"
            multiple
            class="video-swarm-browser__upload-input"
            data-testid="video-swarm-upload-input"
            @change="onUploadInputChange"
          >
        </div>
        <div class="video-swarm-browser__chips chips">
          <button
            type="button"
            class="chip"
            :class="{ active: !videoSwarmIsVideosOnly }"
            :disabled="systemFiles.loading"
            data-testid="video-swarm-view-browse"
            @click="setViewMode('browse')"
          >
            Browse
          </button>
          <button
            type="button"
            class="chip"
            :class="{ active: videoSwarmIsVideosOnly }"
            :disabled="systemFiles.loading || videoSwarmIsCloudRoot"
            data-testid="video-swarm-view-videos-only"
            @click="setViewMode('videos-only')"
          >
            Videos only
          </button>
          <button
            type="button"
            class="chip"
            :class="{ active: systemFiles.recursive }"
            :disabled="systemFiles.loading || videoSwarmIsVideosOnly || videoSwarmIsCloudRoot"
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
          class="framesync-button framesync-button--compact"
          :class="{ active: systemFiles.cloudConnectOpen }"
          data-testid="video-swarm-connect-cloud"
          @click="systemFiles.cloudConnectOpen = !systemFiles.cloudConnectOpen"
        >
          Connect cloud
        </button>
        <button
          type="button"
          class="framesync-button"
          :disabled="systemFiles.loading"
          @click="refreshSystemFilesBrowse(true)"
        >
          Refresh
        </button>
      </div>

      <div v-if="systemFiles.cloudConnectOpen" class="video-swarm-browser__cloud-connect" data-testid="video-swarm-cloud-connect">
        <div class="video-swarm-browser__cloud-connect-title">Connect cloud storage</div>
        <div class="video-swarm-browser__cloud-connect-row">
          <select v-model="cloudDriveDraft.provider" class="framesync-select">
            <option value="google_drive">Google Drive</option>
            <option value="dropbox">Dropbox</option>
            <option value="onedrive">OneDrive</option>
            <option value="other">Other</option>
          </select>
          <input
            v-model.trim="cloudDriveDraft.url"
            type="url"
            class="framesync-input"
            placeholder="https://drive.google.com/… folder or file share link"
            data-testid="video-swarm-cloud-url"
            @keyup.enter="connectCloudStorage()"
          >
          <button type="button" class="framesync-button framesync-button--live" @click="connectCloudStorage()">Connect</button>
        </div>
        <div class="framesync-subtitle video-swarm-browser__cloud-hint">
          Saves the share link in the browser. Open the drive in a new tab, then add direct video URLs below for playback.
        </div>
        <div v-if="(systemFiles.cloudSources || []).length" class="video-swarm-browser__cloud-list">
          <div
            v-for="source in systemFiles.cloudSources"
            :key="'cloud-src-' + source.id"
            class="video-swarm-browser__cloud-item"
          >
            <button type="button" class="video-swarm-browser__cloud-item-main" @click="selectCloudRoot(source)">
              <strong>{{ cloudProviderLabel(source.provider) }}</strong>
              <span>{{ source.label }}</span>
            </button>
            <button type="button" class="framesync-button framesync-button--compact" @click="openCloudStorageLink(source)">Open</button>
            <button type="button" class="framesync-button framesync-button--danger framesync-button--compact" @click="disconnectCloudStorage(source.id)">Remove</button>
          </div>
        </div>
      </div>

      <div v-if="systemFiles.newFolderOpen" class="video-swarm-browser__newfolder" data-testid="video-swarm-new-folder-dialog">
        <input
          v-model.trim="systemFiles.newFolderName"
          type="text"
          class="framesync-input"
          placeholder="New folder name"
          data-testid="video-swarm-new-folder-name"
          @keyup.enter="createSystemFolder()"
        >
        <button type="button" class="framesync-button framesync-button--live" @click="createSystemFolder()">Create</button>
        <button type="button" class="framesync-button" @click="cancelNewFolderDialog()">Cancel</button>
      </div>

      <div class="video-swarm-browser__path">
        <code v-if="!videoSwarmIsCloudRoot">{{ systemFiles.currentPath || '—' }}</code>
        <code v-else>{{ videoSwarmCloudPathLabel }}</code>
        <span v-if="videoSwarmIsVideosOnly" class="video-swarm-browser__count">Videos only · all subfolders</span>
        <span v-else-if="systemFiles.folderCount != null && systemFiles.folderCount > 0" class="video-swarm-browser__count">
          {{ systemFiles.folderCount }} folders
        </span>
        <span v-if="systemFiles.videoCount != null" class="video-swarm-browser__count">
          {{ systemFiles.videoCount }} videos
        </span>
      </div>
      <div v-if="systemFiles.status" class="framesync-subtitle video-swarm-browser__status">{{ systemFiles.status }}</div>
    </div>

    <div v-if="videoSwarmIsCloudRoot && systemFiles.cloudSource" class="video-swarm-browser__cloud-panel framesync-panel" data-testid="video-swarm-cloud-panel">
      <div class="framesync-header">
        <div class="framesync-title">
          <span class="framesync-accent">{{ cloudProviderLabel(systemFiles.cloudSource.provider) }}</span>
        </div>
        <div class="video-swarm-browser__cloud-panel-actions">
          <button type="button" class="framesync-button framesync-button--compact" @click="openCloudStorageLink(systemFiles.cloudSource)">Open in browser</button>
          <button type="button" class="framesync-button framesync-button--danger framesync-button--compact" @click="disconnectCloudStorage(systemFiles.cloudSource.id)">Disconnect</button>
        </div>
      </div>
      <div class="framesync-subtitle">{{ systemFiles.cloudSource.url }}</div>
      <div class="video-swarm-browser__cloud-video-form">
        <input
          v-model.trim="systemFiles.cloudVideoDraft.name"
          type="text"
          class="framesync-input"
          placeholder="Label (optional)"
        >
        <input
          v-model.trim="systemFiles.cloudVideoDraft.url"
          type="url"
          class="framesync-input"
          placeholder="Direct video URL (https://…mp4)"
          data-testid="video-swarm-cloud-video-url"
          @keyup.enter="addCloudStorageVideo(systemFiles.cloudSource.id)"
        >
        <button type="button" class="framesync-button" @click="addCloudStorageVideo(systemFiles.cloudSource.id)">Add video</button>
      </div>
    </div>

    <div
      class="video-swarm-browser__dropzone"
      :class="{ 'video-swarm-browser__dropzone--active': dropzoneActive, 'video-swarm-browser__dropzone--disabled': videoSwarmIsCloudRoot }"
      data-testid="video-swarm-dropzone"
      @dragenter="onDropEnter"
      @dragover="onDropOver"
      @dragleave="onDropLeave"
      @drop="onDropFiles"
    >
      <div v-if="dropzoneActive && !videoSwarmIsCloudRoot" class="video-swarm-browser__dropzone-hint">
        Drop video files to upload
      </div>

    <div v-if="systemFiles.loading" class="video-swarm-browser__empty">Scanning folder…</div>
    <div v-else-if="!videoSwarmDisplayFolders.length && !videoSwarmDisplayVideos.length" class="video-swarm-browser__empty">
      {{ videoSwarmIsCloudRoot ? 'No videos linked yet — add a direct URL above.' : 'No folders or videos — use + Video or drag files here.' }}
    </div>
    <div
      v-else
      ref="gridEl"
      class="video-swarm-browser__grid"
      :class="'video-swarm-browser__grid--zoom-' + systemFiles.zoomLevel"
      @scroll="onGridScroll"
    >
      <button
        v-for="folder in videoSwarmDisplayFolders"
        :key="'folder-' + folder.path"
        type="button"
        class="video-swarm-browser__tile video-swarm-browser__tile--folder"
        data-testid="video-swarm-folder"
        :data-folder-path="folder.path"
        :title="folder.name"
        @click="openSystemFolder(folder)"
      >
        <div class="video-swarm-browser__folder-icon" aria-hidden="true">📁</div>
        <div v-if="systemFiles.showFilenames" class="video-swarm-browser__label">{{ folder.name }}</div>
      </button>
      <button
        v-for="(video, index) in videoSwarmDisplayVideos"
        :key="video.path"
        type="button"
        class="video-swarm-browser__tile"
        :class="{
          'video-swarm-browser__tile--selected': systemFiles.selectedPaths.includes(video.path),
          'video-swarm-browser__tile--hover': hoveredPath === video.path,
        }"
        :data-video-path="video.path"
        @click="onTileClick($event, video, index)"
        @dblclick="onTileDblClick($event, index)"
        @contextmenu="onTileContextMenu($event, video)"
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
        <div class="video-swarm-browser__meta">{{ formatVideoSwarmFileSize(video.size) }}</div>
      </button>
    </div>
    </div>

    <div
      v-if="systemFiles.fullscreenIndex >= 0 && videoSwarmFullscreenVideo"
      class="video-swarm-browser__modal"
      data-testid="video-swarm-fullscreen"
      @click="onFullscreenBackdropClick"
    >
      <div class="video-swarm-browser__modal-inner">
        <div class="video-swarm-browser__modal-head">
          <strong>{{ videoSwarmFullscreenVideo.name }}</strong>
          <div class="video-swarm-browser__modal-actions">
            <button type="button" class="framesync-button framesync-button--compact" @click="stepSystemFileFullscreen(-1)">← Prev</button>
            <button type="button" class="framesync-button framesync-button--compact" @click="stepSystemFileFullscreen(1)">Next →</button>
            <button type="button" class="framesync-button framesync-button--compact" @click="copySystemFilePath(videoSwarmFullscreenVideo.path)">Copy path</button>
            <button type="button" class="framesync-button framesync-button--compact" @click="openInVideoEditor(videoSwarmFullscreenVideo)">Open in editor</button>
            <button type="button" class="framesync-button framesync-button--danger framesync-button--compact" @click="deleteSystemFile(videoSwarmFullscreenVideo.path)">Delete</button>
            <button type="button" class="framesync-button framesync-button--compact" @click="closeSystemFileFullscreen">Close</button>
          </div>
        </div>
        <video
          ref="modalVideoEl"
          class="video-swarm-browser__modal-video"
          controls
          autoplay
          playsinline
          :src="systemFileMediaUrl(videoSwarmFullscreenVideo.path)"
        />
      </div>
    </div>

    <div
      v-if="contextMenu.open"
      class="video-swarm-browser__menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
    >
      <button type="button" class="framesync-button framesync-button--compact" @click="openContextFullscreen">Open</button>
      <button type="button" class="framesync-button framesync-button--compact" @click="openInVideoEditor(contextMenu.video)">Open in editor</button>
      <button type="button" class="framesync-button framesync-button--compact" @click="copySystemFilePath(contextMenu.video?.path)">Copy path</button>
      <button type="button" class="framesync-button framesync-button--danger framesync-button--compact" @click="deleteContextVideo">Delete</button>
    </div>
  </div>
</template>

<script>
const RENDER_BUFFER = 24

const APP_METHODS = [
  'initSystemFilesBrowser',
  'browseSystemFiles',
  'refreshSystemFilesBrowse',
  'openNewFolderDialog',
  'createSystemFolder',
  'cancelNewFolderDialog',
  'uploadSystemVideoFiles',
  'toggleSystemFilesRecursive',
  'toggleSystemFilesShowNames',
  'toggleSystemFilesVideosOnly',
  'setSystemFilesSort',
  'setSystemFilesZoom',
  'connectCloudStorage',
  'cloudProviderLabel',
  'selectCloudRoot',
  'openCloudStorageLink',
  'disconnectCloudStorage',
  'addCloudStorageVideo',
  'openSystemFolder',
  'openInVideoEditor',
  'deleteSystemFile',
  'copySystemFilePath',
  'openSystemFileFullscreen',
  'closeSystemFileFullscreen',
  'stepSystemFileFullscreen',
  'toggleSystemFileSelection',
  'systemFileMediaUrl',
  'formatVideoSwarmFileSize',
  'saveSessionState',
]

export default {
  name: 'VideoSwarmBrowser',
  props: {
    app: { type: Object, required: true },
  },
  computed: {
    systemFiles() {
      return this.app.systemFiles
    },
    videoSwarmIsCloudRoot() {
      return this.app.videoSwarmIsCloudRoot
    },
    videoSwarmIsVideosOnly() {
      return this.app.videoSwarmIsVideosOnly
    },
    videoSwarmCloudPathLabel() {
      return this.app.videoSwarmCloudPathLabel
    },
    videoSwarmDisplayFolders() {
      return this.app.videoSwarmDisplayFolders
    },
    videoSwarmDisplayVideos() {
      return this.app.videoSwarmDisplayVideos
    },
    videoSwarmFullscreenVideo() {
      return this.app.videoSwarmFullscreenVideo
    },
    videoSwarmVisibleStart: {
      get() {
        return this.app.videoSwarmVisibleStart
      },
      set(v) {
        this.app.videoSwarmVisibleStart = v
      },
    },
    videoSwarmVisibleEnd: {
      get() {
        return this.app.videoSwarmVisibleEnd
      },
      set(v) {
        this.app.videoSwarmVisibleEnd = v
      },
    },
  },
  data() {
    return {
      hoveredPath: null,
      contextMenu: { open: false, x: 0, y: 0, video: null, index: -1 },
      tileVideos: {},
      modalVideoEl: null,
      dropzoneActive: false,
      dropzoneDepth: 0,
    }
  },
  watch: {
    'systemFiles.videos'() {
      this.videoSwarmVisibleStart = 0
      this.videoSwarmVisibleEnd = 48
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
    initSystemFilesBrowser(...args) { return this.app.initSystemFilesBrowser(...args) },
    browseSystemFiles(...args) { return this.app.browseSystemFiles(...args) },
    refreshSystemFilesBrowse(...args) { return this.app.refreshSystemFilesBrowse(...args) },
    openNewFolderDialog(...args) { return this.app.openNewFolderDialog(...args) },
    createSystemFolder(...args) { return this.app.createSystemFolder(...args) },
    cancelNewFolderDialog(...args) { return this.app.cancelNewFolderDialog(...args) },
    uploadSystemVideoFiles(...args) { return this.app.uploadSystemVideoFiles(...args) },
    toggleSystemFilesRecursive(...args) { return this.app.toggleSystemFilesRecursive(...args) },
    toggleSystemFilesShowNames(...args) { return this.app.toggleSystemFilesShowNames(...args) },
    toggleSystemFilesVideosOnly(...args) { return this.app.toggleSystemFilesVideosOnly(...args) },
    setSystemFilesSort(...args) { return this.app.setSystemFilesSort(...args) },
    setSystemFilesZoom(...args) { return this.app.setSystemFilesZoom(...args) },
    connectCloudStorage(...args) { return this.app.connectCloudStorage(...args) },
    cloudProviderLabel(...args) { return this.app.cloudProviderLabel(...args) },
    openCloudStorageLink(...args) { return this.app.openCloudStorageLink(...args) },
    disconnectCloudStorage(...args) { return this.app.disconnectCloudStorage(...args) },
    addCloudStorageVideo(...args) { return this.app.addCloudStorageVideo(...args) },
    openInVideoEditor(...args) { return this.app.openInVideoEditor(...args) },
    deleteSystemFile(...args) { return this.app.deleteSystemFile(...args) },
    copySystemFilePath(...args) { return this.app.copySystemFilePath(...args) },
    openSystemFileFullscreen(...args) { return this.app.openSystemFileFullscreen(...args) },
    closeSystemFileFullscreen(...args) { return this.app.closeSystemFileFullscreen(...args) },
    stepSystemFileFullscreen(...args) { return this.app.stepSystemFileFullscreen(...args) },
    toggleSystemFileSelection(...args) { return this.app.toggleSystemFileSelection(...args) },
    systemFileMediaUrl(...args) { return this.app.systemFileMediaUrl(...args) },
    formatVideoSwarmFileSize(...args) { return this.app.formatVideoSwarmFileSize(...args) },
    saveSessionState(...args) { return this.app.saveSessionState(...args) },
    setViewMode(mode) {
      if (mode === 'videos-only' && this.videoSwarmIsCloudRoot) return
      if (this.systemFiles.viewMode === mode) return
      this.systemFiles.viewMode = mode
      void this.browseSystemFiles(this.systemFiles.currentPath)
      this.saveSessionState()
    },
    openUploadPicker() {
      if (this.videoSwarmIsCloudRoot) return
      const input = this.$refs.uploadInputEl
      if (input) input.click()
    },
    onUploadInputChange(event) {
      const files = event.target?.files
      void this.uploadSystemVideoFiles(files)
      if (event.target) event.target.value = ''
    },
    onDropEnter(event) {
      event?.preventDefault?.()
      if (this.videoSwarmIsCloudRoot) return
      this.dropzoneDepth += 1
      this.dropzoneActive = true
    },
    onDropOver(event) {
      event?.preventDefault?.()
      if (this.videoSwarmIsCloudRoot) return
      this.dropzoneActive = true
    },
    onDropLeave(event) {
      event?.preventDefault?.()
      if (this.videoSwarmIsCloudRoot) return
      this.dropzoneDepth = Math.max(0, this.dropzoneDepth - 1)
      if (this.dropzoneDepth === 0) this.dropzoneActive = false
    },
    onDropFiles(event) {
      event?.preventDefault?.()
      this.dropzoneDepth = 0
      this.dropzoneActive = false
      if (this.videoSwarmIsCloudRoot) return
      const files = event.dataTransfer?.files
      void this.uploadSystemVideoFiles(files)
    },
    onRootChange(rootId) {
      const root = (this.systemFiles.roots || []).find((r) => r.id === rootId)
      if (!root) return
      if (root.kind === 'cloud') {
        void this.browseSystemFiles('', { rootId: root.id })
        return
      }
      void this.browseSystemFiles(root.path, { rootId: root.id })
    },
    selectCloudRoot(source) {
      if (!source || !source.id) return
      this.systemFiles.cloudConnectOpen = false
      void this.browseSystemFiles('', { rootId: `cloud:${source.id}` })
    },
    openSystemFolder(folder) {
      if (!folder || !folder.path) return
      void this.browseSystemFiles(folder.path, { rootId: folder.rootId || this.systemFiles.rootId })
    },
    onGridScroll() {
      this.updateVisibleWindow()
    },
    updateVisibleWindow() {
      const grid = this.$refs.gridEl
      const total = (this.systemFiles.videos || []).length
      if (!grid || !total) {
        this.videoSwarmVisibleStart = 0
        this.videoSwarmVisibleEnd = 48
        return
      }
      const tile = grid.querySelector('.video-swarm-browser__tile')
      const tileHeight = tile ? tile.offsetHeight + 10 : 180
      const cols = Math.max(1, Math.floor(grid.clientWidth / Math.max(tile?.offsetWidth || 200, 120)))
      const rowsVisible = Math.ceil(grid.clientHeight / tileHeight) + 2
      const startRow = Math.max(0, Math.floor(grid.scrollTop / tileHeight) - 1)
      const start = Math.max(0, startRow * cols)
      const end = Math.min(total, start + rowsVisible * cols + RENDER_BUFFER)
      this.videoSwarmVisibleStart = start
      this.videoSwarmVisibleEnd = end
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
    onTileDblClick(event, index) {
      event?.preventDefault?.()
      this.openSystemFileFullscreen(index)
    },
    onTileContextMenu(event, video) {
      event?.preventDefault?.()
      this.openTileMenu(event, video)
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
    onFullscreenBackdropClick(event) {
      if (event.target === event.currentTarget) this.closeSystemFileFullscreen()
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
