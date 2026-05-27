<template>
  <div class="stream-shell">
    <div class="stream-grid">
      <div class="framesync-panel stream-card">
        <div class="framesync-header">
          <div class="framesync-title">Stream <span class="framesync-accent">Preview</span></div>
          <span class="stream-status-pill" :class="`stream-status-pill--${statusTone}`">
            {{ streamStatusLabel }}
          </span>
        </div>
        <div class="framesync-subtitle" style="margin-top:10px;">
          Watch the current HLS feed and use the local ingest links below for OBS, ffmpeg, or another relay.
        </div>

        <div class="stream-preview">
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

      <div class="framesync-panel stream-card">
        <div class="framesync-header">
          <div class="framesync-title">Possible <span class="framesync-accent">Destinations</span></div>
          <div class="stream-card__actions">
            <button type="button" class="framesync-button" @click="app.refreshStreamStatus()">Refresh</button>
            <button
              type="button"
              class="framesync-button"
              :disabled="app.streaming.activeStatus !== 'running'"
              @click="app.stopOutboundStream()"
            >
              Stop stream
            </button>
          </div>
        </div>

        <div class="stream-quick-add">
          <span class="framesync-subtitle" style="margin:0;">Add destination</span>
          <button type="button" class="framesync-button" @click="app.addStreamDestination('rtmp')">+ RTMP</button>
          <button type="button" class="framesync-button" @click="app.addStreamDestination('srt')">+ SRT</button>
          <button type="button" class="framesync-button" @click="app.addStreamDestination('whip')">+ WHIP</button>
        </div>

        <div v-if="!app.streaming.destinations.length" class="stream-empty">
          Add a destination card to forward the live feed somewhere else.
        </div>

        <div
          v-for="destination in app.streaming.destinations"
          :key="destination.id"
          class="stream-destination"
          :class="{ 'stream-destination--active': isActive(destination) }"
        >
          <div class="stream-destination__header">
            <input
              v-model="destination.name"
              class="framesync-input"
              type="text"
              placeholder="Destination name"
              @change="app.saveSessionState()"
            >
            <span v-if="isActive(destination)" class="stream-destination__badge">Live</span>
          </div>

          <div class="stream-destination__grid">
            <label class="stream-field">
              <span class="framesync-subtitle">Protocol</span>
              <select v-model="destination.protocol" class="framesync-select" @change="app.saveSessionState()">
                <option value="rtmp">RTMP</option>
                <option value="srt">SRT</option>
                <option value="whip">WHIP</option>
              </select>
            </label>

            <label class="stream-field stream-field--wide">
              <span class="framesync-subtitle">Target URL</span>
              <input
                v-model="destination.target"
                class="framesync-input"
                type="text"
                :placeholder="placeholderFor(destination.protocol)"
                @change="app.saveSessionState()"
              >
            </label>

            <label class="stream-field">
              <span class="framesync-subtitle">FPS</span>
              <input
                v-model.number="destination.fps"
                class="framesync-input"
                type="number"
                min="1"
                max="60"
                step="1"
                @change="app.saveSessionState()"
              >
            </label>

            <label class="stream-field">
              <span class="framesync-subtitle">Resolution</span>
              <input
                v-model="destination.resolution"
                class="framesync-input"
                type="text"
                placeholder="1024x576"
                @change="app.saveSessionState()"
              >
            </label>

            <label class="stream-field">
              <span class="framesync-subtitle">Transition</span>
              <select v-model="destination.transition" class="framesync-select" @change="app.saveSessionState()">
                <option value="">None</option>
                <option value="fade">Fade</option>
                <option value="wipe">Wipe</option>
                <option value="dissolve">Dissolve</option>
              </select>
            </label>

            <label class="stream-field stream-field--wide">
              <span class="framesync-subtitle">Overlay image path</span>
              <input
                v-model="destination.overlay"
                class="framesync-input"
                type="text"
                placeholder="/absolute/path/to/overlay.png"
                @change="app.saveSessionState()"
              >
            </label>
          </div>

          <div class="stream-destination__actions">
            <button type="button" class="framesync-button" @click="app.startStreamDestination(destination.id)">
              {{ isActive(destination) ? 'Restart' : 'Start stream' }}
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
  </div>
</template>

<script>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import UiIcon from '../UiIcon.vue'
import { proxyAppView } from './app-view-proxy.js'

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
    let hls = null

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

    const destroyPreview = () => {
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

      if (hls && typeof hls.destroy === 'function') {
        hls.destroy()
      }
      hls = null

      const baseSource = String(app.hlsStreamHref || '/hls/live/deforum.m3u8')
      const source = baseSource.includes('?') ? `${baseSource}&t=${Date.now()}` : `${baseSource}?t=${Date.now()}`
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
            if (typeof app.autoplayVideo === 'function') app.autoplayVideo(video)
          })
        }
        return
      }

      video.src = source
      video.load()
      if (typeof app.autoplayVideo === 'function') app.autoplayVideo(video)
    }

    onMounted(() => {
      void attachPreview()
      if (typeof app.refreshStreamStatus === 'function') {
        void app.refreshStreamStatus()
      }
    })

    onBeforeUnmount(() => {
      destroyPreview()
    })

    watch(() => app.hlsStreamHref, () => {
      void attachPreview()
    })

    return {
      app,
      previewEl,
      statusTone,
      streamStatusLabel,
      isActive,
      placeholderFor,
    }
  },
}
</script>

<style scoped>
.stream-shell {
  display: grid;
  gap: 12px;
}

.stream-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  gap: 12px;
}

.stream-card {
  display: grid;
  gap: 12px;
}

.stream-card__actions,
.stream-quick-add,
.stream-destination__actions,
.stream-endpoints {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stream-preview {
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  background: var(--bg-0);
}

.stream-preview__video {
  width: 100%;
  min-height: 260px;
  display: block;
  background: #000;
}

.stream-endpoint,
.stream-destination {
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

.stream-endpoint__label,
.stream-destination__badge {
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
  color: #ffd5d4;
  border-color: rgba(226, 75, 74, 0.45);
  background: rgba(226, 75, 74, 0.16);
}

.stream-status-pill--idle {
  color: #ffdca8;
  border-color: rgba(239, 159, 39, 0.45);
  background: rgba(239, 159, 39, 0.16);
}

.stream-status-pill--dim {
  color: var(--text-dim);
}

.stream-destination {
  display: grid;
  gap: 10px;
  padding: 12px;
}

.stream-destination--active {
  border-color: rgba(29, 158, 117, 0.45);
  box-shadow: inset 0 0 0 1px rgba(29, 158, 117, 0.14);
}

.stream-destination__header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.stream-destination__header .framesync-input {
  flex: 1 1 auto;
}

.stream-destination__badge {
  color: var(--live-text);
}

.stream-destination__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.stream-field {
  display: grid;
  gap: 6px;
}

.stream-field--wide {
  grid-column: 1 / -1;
}

@media (max-width: 1100px) {
  .stream-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .stream-destination__grid {
    grid-template-columns: 1fr;
  }
}
</style>
