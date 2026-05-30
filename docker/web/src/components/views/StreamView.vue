<template>
  <div class="stream-shell">
    <div class="framesync-panel stream-card stream-card--preview">
      <div class="framesync-header">
        <div class="framesync-title">Stream <span class="framesync-accent">Preview</span></div>
        <span class="stream-status-pill" :class="`stream-status-pill--${statusTone}`">
          {{ streamStatusLabel }}
        </span>
      </div>
      <div class="framesync-subtitle" style="margin-top:10px;">
        Configure the live HLS feed and enable main-stage streaming from <strong>Settings → Output</strong> or the status strip once the preview is valid.
      </div>

      <div class="stream-hls-controls">
        <span
          class="stream-preview-status"
          :class="previewValid ? 'stream-preview-status--live' : 'stream-preview-status--idle'"
          data-testid="stream-preview-status"
        >
          {{ previewValid ? 'HLS feed ready' : 'Waiting for HLS feed…' }}
        </span>
        <span v-if="app.hlsWatchEnabled" class="framesync-subtitle" style="margin:0;">
          Main stage is showing the live HLS feed.
        </span>
      </div>

      <div class="stream-preview" data-testid="stream-hls-preview">
        <video
          ref="previewEl"
          class="stream-preview__video"
          muted
          autoplay
          playsinline
          controls
        ></video>
      </div>

      <div class="stream-endpoints">
        <a class="stream-endpoint" :href="app.hlsStreamHref" target="_blank" rel="noreferrer">
          <UiIcon class="stream-endpoint__icon" name="broadcast" />
          <span class="stream-endpoint__label">HLS</span>
          <code class="stream-endpoint__value">{{ app.hlsStreamHref }}</code>
        </a>
        <a class="stream-endpoint" :href="app.rtmpStreamHref" target="_blank" rel="noreferrer">
          <UiIcon class="stream-endpoint__icon" name="broadcast" />
          <span class="stream-endpoint__label">RTMP</span>
          <code class="stream-endpoint__value">{{ app.rtmpStreamHref }}</code>
        </a>
      </div>

      <div v-if="app.streaming.status" class="stream-card__status">{{ app.streaming.status }}</div>
    </div>

    <div class="stream-active-section">
      <div class="stream-active-header">
        <div class="framesync-title">Active <span class="framesync-accent">streams</span></div>
        <button
          type="button"
          class="framesync-button framesync-button--live"
          data-testid="stream-add-destination-btn"
          @click="openAddDestinationForm()"
        >
          Add destination
        </button>
      </div>

      <div v-if="!activeDestinations.length && !addDestinationOpen" class="stream-empty" data-testid="stream-active-empty">
        No destinations yet. Add one to forward the live feed.
      </div>

      <div v-if="activeDestinations.length" class="stream-active-list" data-testid="stream-active-list">
        <div
          v-for="destination in activeDestinations"
          :key="destination.id"
          class="stream-active-row"
          :class="{ 'stream-active-row--live': isActive(destination) }"
        >
          <div class="stream-active-row__main">
            <div class="stream-active-row__title">{{ destination.name || 'Stream' }}</div>
            <code class="stream-active-row__target">{{ destination.target || '—' }}</code>
          </div>
          <div class="stream-active-row__metrics">
            <div class="stream-metric">
              <span class="stream-metric__label">kbps</span>
              <strong>{{ formatKbps(destination) }}</strong>
            </div>
            <div class="stream-metric">
              <span class="stream-metric__label">fps</span>
              <strong>{{ formatFps(destination) }}</strong>
            </div>
            <div class="stream-metric">
              <span class="stream-metric__label">health</span>
              <span class="stream-health-pill" :class="`stream-health-pill--${healthTone(destination)}`">
                {{ healthLabel(destination) }}
              </span>
            </div>
          </div>
          <div class="stream-active-row__actions">
            <a
              class="framesync-button stream-view-link"
              :href="viewUrlFor(destination)"
              target="_blank"
              rel="noreferrer"
              data-testid="stream-view-link"
            >
              View
            </a>
            <button
              type="button"
              class="framesync-button"
              @click="app.startStreamDestination(destination.id)"
            >
              {{ isActive(destination) ? 'Restart' : 'Start' }}
            </button>
            <button
              type="button"
              class="framesync-button"
              :disabled="!isActive(destination)"
              @click="app.stopOutboundStream()"
            >
              Stop
            </button>
            <button type="button" class="framesync-button" @click="app.removeStreamDestination(destination.id)">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="addDestinationOpen"
      class="framesync-panel stream-card stream-card--destinations"
      data-testid="stream-destination-form"
    >
      <div class="framesync-header">
        <div class="framesync-title">Possible <span class="framesync-accent">destinations</span></div>
        <button type="button" class="framesync-button" @click="closeAddDestinationForm()">Cancel</button>
      </div>

      <div class="stream-quick-add">
        <span class="framesync-subtitle" style="margin:0;">Protocol</span>
        <button type="button" class="framesync-button" @click="draft.protocol = 'rtmp'">RTMP</button>
        <button type="button" class="framesync-button" @click="draft.protocol = 'srt'">SRT</button>
        <button type="button" class="framesync-button" @click="draft.protocol = 'whip'">WHIP</button>
      </div>

      <div class="stream-destination__grid">
        <label class="stream-field stream-field--wide">
          <span class="framesync-subtitle">Name</span>
          <input v-model="draft.name" class="framesync-input" type="text" placeholder="Destination name">
        </label>

        <label class="stream-field stream-field--wide">
          <span class="framesync-subtitle">Target URL</span>
          <input
            v-model="draft.target"
            class="framesync-input"
            type="text"
            :placeholder="placeholderFor(draft.protocol)"
          >
        </label>

        <label class="stream-field">
          <span class="framesync-subtitle">FPS</span>
          <input v-model.number="draft.fps" class="framesync-input" type="number" min="1" max="60" step="1">
        </label>

        <label class="stream-field">
          <span class="framesync-subtitle">Resolution</span>
          <input v-model="draft.resolution" class="framesync-input" type="text" placeholder="1024x576">
        </label>

        <label class="stream-field">
          <span class="framesync-subtitle">Transition</span>
          <select v-model="draft.transition" class="framesync-select">
            <option value="">None</option>
            <option value="fade">Fade</option>
            <option value="wipe">Wipe</option>
            <option value="dissolve">Dissolve</option>
          </select>
        </label>

        <label class="stream-field stream-field--wide">
          <span class="framesync-subtitle">Overlay image path</span>
          <input v-model="draft.overlay" class="framesync-input" type="text" placeholder="/absolute/path/to/overlay.png">
        </label>
      </div>

      <div class="stream-destination__actions">
        <button
          type="button"
          class="framesync-button framesync-button--live"
          data-testid="stream-save-destination"
          :disabled="!String(draft.target || '').trim()"
          @click="saveDestination()"
        >
          Save destination
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import UiIcon from '../UiIcon.vue'
import { proxyAppView } from './app-view-proxy.mjs'

export default {
  name: 'StreamView',
  components: {
    UiIcon,
  },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    const app = proxyAppView(props)
    const previewEl = ref(null)
    const previewValid = ref(false)
    const addDestinationOpen = ref(false)
    const draft = ref(null)
    let hls = null
    let previewProbeTimer = null
    let metricsPollTimer = null

    const activeDestinations = computed(() => {
      const list = Array.isArray(app.streaming && app.streaming.destinations)
        ? app.streaming.destinations
        : []
      return list.filter((dest) => dest && String(dest.target || '').trim())
    })

    const setPreviewValid = (valid) => {
      previewValid.value = !!valid
      if (typeof app.setHlsPreviewStreamValid === 'function') {
        app.setHlsPreviewStreamValid(valid)
      } else {
        app.hlsPreviewStreamValid = !!valid
      }
    }

    const statusTone = computed(() => {
      const state = String(app.streaming && app.streaming.activeStatus || 'unknown')
      if (state === 'running') return 'live'
      if (state === 'error') return 'error'
      if (state === 'stopped') return 'idle'
      return 'dim'
    })

    const streamStatusLabel = computed(() => {
      const state = String(app.streaming && app.streaming.activeStatus || 'unknown')
      if (state === 'running') return 'Streaming'
      if (state === 'error') return 'Error'
      if (state === 'stopped') return 'Stopped'
      return 'Standby'
    })

    const isActive = (destination) => !!(
      destination
      && app.streaming
      && app.streaming.activeStatus === 'running'
      && app.streaming.activeDestinationId === destination.id
    )

    const placeholderFor = (protocol) => {
      if (protocol === 'srt') return 'srt://host:port?streamid=publish:demo'
      if (protocol === 'whip') return 'https://example.com/whip/endpoint'
      return 'rtmp://host/app/stream-key'
    }

    const newDraft = (protocol = 'rtmp') => {
      if (typeof app.newStreamDestination === 'function') {
        return { ...app.newStreamDestination(protocol) }
      }
      return {
        id: `stream_draft_${Date.now()}`,
        name: 'Custom Stream',
        protocol: protocol || 'rtmp',
        target: '',
        fps: 24,
        resolution: '1024x576',
        overlay: '',
        transition: '',
        kbps: null,
        health: 'idle',
      }
    }

    const openAddDestinationForm = (protocol = 'rtmp') => {
      draft.value = newDraft(protocol)
      addDestinationOpen.value = true
    }

    const closeAddDestinationForm = () => {
      addDestinationOpen.value = false
      draft.value = null
    }

    const saveDestination = () => {
      const row = draft.value
      if (!row || !String(row.target || '').trim()) return
      const normalized = typeof app.normalizeStreamDestination === 'function'
        ? app.normalizeStreamDestination(row, (app.streaming.destinations || []).length)
        : row
      app.streaming.destinations.push(normalized)
      if (typeof app.saveSessionState === 'function') app.saveSessionState()
      closeAddDestinationForm()
    }

    const viewUrlFor = (destination) => {
      if (typeof app.streamDestinationViewUrl === 'function') {
        return app.streamDestinationViewUrl(destination)
      }
      return String(destination && destination.target || '#')
    }

    const formatKbps = (destination) => {
      const value = destination && destination.kbps
      if (!Number.isFinite(Number(value))) return '—'
      return `${Math.round(Number(value))}`
    }

    const formatFps = (destination) => {
      const value = destination && destination.fps
      if (!Number.isFinite(Number(value))) return '—'
      return String(Math.round(Number(value)))
    }

    const healthTone = (destination) => {
      const health = String(destination && destination.health || 'idle').toLowerCase()
      if (health === 'healthy') return 'live'
      if (health === 'degraded') return 'warn'
      if (health === 'error' || health === 'offline') return 'error'
      if (isActive(destination)) return 'live'
      return 'dim'
    }

    const healthLabel = (destination) => {
      const health = String(destination && destination.health || '').toLowerCase()
      if (health === 'healthy') return 'Healthy'
      if (health === 'degraded') return 'Degraded'
      if (health === 'error') return 'Error'
      if (health === 'offline') return 'Offline'
      if (isActive(destination)) return 'Live'
      return 'Idle'
    }

    const destroyPreview = () => {
      if (previewProbeTimer) {
        clearInterval(previewProbeTimer)
        previewProbeTimer = null
      }
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy()
      }
      hls = null
      const video = previewEl.value
      if (!video) return
      if (typeof video.pause === 'function') video.pause()
      video.removeAttribute('src')
      if (typeof video.load === 'function') video.load()
    }

    const attachPreview = async () => {
      await nextTick()
      const video = previewEl.value
      if (!video) return

      setPreviewValid(false)

      if (hls && typeof hls.destroy === 'function') {
        hls.destroy()
      }
      hls = null

      const baseSource = String(app.hlsStreamHref || '/hls/live/deforum.m3u8')
      const source = baseSource.includes('?') ? `${baseSource}&t=${Date.now()}` : `${baseSource}?t=${Date.now()}`

      const onPreviewReady = () => setPreviewValid(true)
      const onPreviewFailed = () => setPreviewValid(false)

      video.oncanplay = onPreviewReady
      video.onplaying = onPreviewReady
      video.onerror = onPreviewFailed

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source
        video.load()
        if (typeof app.autoplayVideo === 'function') app.autoplayVideo(video)
        return
      }

      const HlsCtor = typeof window !== 'undefined' ? window.Hls : null
      if (HlsCtor && typeof HlsCtor.isSupported === 'function' && HlsCtor.isSupported()) {
        const hlsEvents = HlsCtor.Events || { MANIFEST_PARSED: 'manifest_parsed', ERROR: 'error' }
        hls = new HlsCtor({ liveSyncDurationCount: 3 })
        hls.loadSource(source)
        hls.attachMedia(video)
        if (typeof hls.on === 'function') {
          hls.on(hlsEvents.MANIFEST_PARSED, () => {
            setPreviewValid(true)
            if (typeof app.autoplayVideo === 'function') app.autoplayVideo(video)
          })
          hls.on(hlsEvents.ERROR, onPreviewFailed)
        }
        return
      }

      video.src = source
      video.load()
      if (typeof app.autoplayVideo === 'function') app.autoplayVideo(video)
    }

    const schedulePreviewProbe = () => {
      if (previewProbeTimer) clearInterval(previewProbeTimer)
      previewProbeTimer = setInterval(() => {
        if (!previewValid.value) void attachPreview()
      }, 5000)
    }

    const scheduleMetricsPoll = () => {
      if (metricsPollTimer) clearInterval(metricsPollTimer)
      metricsPollTimer = setInterval(() => {
        if (typeof app.refreshStreamStatus === 'function') {
          void app.refreshStreamStatus()
        }
      }, 4000)
    }

    onMounted(() => {
      void attachPreview()
      schedulePreviewProbe()
      scheduleMetricsPoll()
      if (typeof app.refreshStreamStatus === 'function') {
        void app.refreshStreamStatus()
      }
    })

    onBeforeUnmount(() => {
      destroyPreview()
      setPreviewValid(false)
      if (metricsPollTimer) {
        clearInterval(metricsPollTimer)
        metricsPollTimer = null
      }
    })

    watch(() => app.hlsStreamHref, () => {
      void attachPreview()
    })

    watch(() => app.streamSrc, () => {
      void attachPreview()
    })

    return {
      app,
      previewEl,
      previewValid,
      addDestinationOpen,
      draft,
      activeDestinations,
      statusTone,
      streamStatusLabel,
      isActive,
      placeholderFor,
      openAddDestinationForm,
      closeAddDestinationForm,
      saveDestination,
      viewUrlFor,
      formatKbps,
      formatFps,
      healthTone,
      healthLabel,
    }
  },
}
</script>

<style scoped>
.stream-shell {
  display: grid;
  gap: 14px;
  max-width: 980px;
}

.stream-card {
  display: grid;
  gap: 12px;
}

.stream-active-section {
  display: grid;
  gap: 10px;
}

.stream-active-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.stream-active-list {
  display: grid;
  gap: 10px;
}

.stream-active-row {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-1);
}

.stream-active-row--live {
  border-color: rgba(29, 158, 117, 0.45);
  box-shadow: inset 0 0 0 1px rgba(29, 158, 117, 0.12);
}

.stream-active-row__main {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.stream-active-row__title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

.stream-active-row__target {
  font-size: 11px;
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stream-active-row__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.stream-metric {
  display: grid;
  gap: 2px;
  text-align: center;
  min-width: 52px;
}

.stream-metric__label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.stream-metric strong {
  font-size: 12px;
  color: var(--text-primary);
}

.stream-health-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 0.5px solid var(--border);
  color: var(--text-secondary);
  background: var(--bg-2);
}

.stream-health-pill--live {
  color: var(--live-text);
  border-color: rgba(29, 158, 117, 0.45);
  background: rgba(29, 158, 117, 0.14);
}

.stream-health-pill--warn {
  color: var(--warn-text);
  border-color: rgba(239, 159, 39, 0.45);
  background: rgba(239, 159, 39, 0.14);
}

.stream-health-pill--error {
  color: var(--error-text);
  border-color: rgba(226, 75, 74, 0.45);
  background: rgba(226, 75, 74, 0.14);
}

.stream-health-pill--dim {
  color: var(--text-dim);
}

.stream-active-row__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.stream-view-link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.stream-card__actions,
.stream-quick-add,
.stream-destination__actions,
.stream-endpoints {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stream-hls-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.stream-preview {
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  background: var(--bg-0);
}

.stream-preview-status {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 999px;
  border: 0.5px solid var(--border);
}
.stream-preview-status--live {
  color: var(--live-text);
  border-color: rgba(29, 158, 117, 0.45);
  background: rgba(29, 158, 117, 0.12);
}
.stream-preview-status--idle {
  color: var(--text-dim);
}

.stream-preview__video {
  width: 100%;
  min-height: 260px;
  display: block;
  background: var(--media-bg);
}

.stream-endpoint,
.stream-destination__grid {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-1);
  color: var(--text-primary);
}

.stream-endpoint {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  text-decoration: none;
  min-width: min(100%, 280px);
}

.stream-endpoint__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.stream-endpoint__value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-dim);
}

.stream-card__status,
.stream-empty {
  font-size: 11px;
  color: var(--text-dim);
}

.stream-status-pill {
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  background: var(--bg-2);
}

.stream-status-pill--live {
  color: var(--live-text);
  border-color: rgba(29, 158, 117, 0.5);
  background: rgba(29, 158, 117, 0.16);
}

.stream-status-pill--error {
  color: var(--error-text);
  border-color: rgba(226, 75, 74, 0.45);
  background: rgba(226, 75, 74, 0.16);
}

.stream-status-pill--idle {
  color: var(--warn-text);
  border-color: rgba(239, 159, 39, 0.45);
  background: rgba(239, 159, 39, 0.16);
}

.stream-status-pill--dim {
  color: var(--text-dim);
}

.stream-destination__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 12px;
}

.stream-field {
  display: grid;
  gap: 6px;
}

.stream-field--wide {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .stream-active-row {
    grid-template-columns: 1fr;
  }

  .stream-active-row__actions {
    justify-content: flex-start;
  }
}

@media (max-width: 700px) {
  .stream-destination__grid {
    grid-template-columns: 1fr;
  }
}
</style>
