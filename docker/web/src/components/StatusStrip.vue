<template>
  <div class="status-strip">
    <div class="header-transport ss-transport" data-testid="header-transport">
      <button
        type="button"
        class="header-transport__btn"
        :class="playing ? 'header-transport__btn--pause header-transport__btn--active' : 'header-transport__btn--play'"
        :disabled="previewGenerating"
        :title="playing ? 'Pause Deforum animation' : 'Play Deforum animation'"
        :aria-label="playing ? 'Pause animation' : 'Play animation'"
        data-testid="header-play"
        @click="$emit('toggle-play')"
      >
        <UiIcon class="header-transport__icon" :name="playing ? 'pause' : 'play'" />
      </button>
      <button
        type="button"
        class="header-transport__btn header-transport__btn--stop"
        :disabled="!playing || previewGenerating"
        title="Stop animation"
        aria-label="Stop animation"
        data-testid="header-stop"
        @click="$emit('stop-play')"
      >
        <UiIcon class="header-transport__icon" name="stop" />
      </button>
      <button
        type="button"
        class="header-transport__btn header-transport__btn--record"
        :class="{ 'header-transport__btn--active': recording }"
        :disabled="playing || previewGenerating"
        :title="recording ? 'Stop recording' : 'Start recording'"
        :aria-label="recording ? 'Stop recording' : 'Start recording'"
        data-testid="header-record"
        @click="$emit('toggle-record')"
      >
        <UiIcon class="header-transport__icon" :name="recording ? 'stop' : 'record'" />
      </button>
      <span class="header-transport__divider" aria-hidden="true"></span>
      <button
        type="button"
        class="header-transport__btn header-transport__btn--preview"
        :class="{ 'header-transport__btn--active': previewGenerating }"
        :disabled="previewGenerating || previewDisabled"
        title="Generate preview frame from current settings"
        aria-label="Generate preview frame"
        data-testid="header-preview-frame"
        @click="$emit('generate-preview')"
      >
        <span v-if="previewGenerating" class="lazy-loading-indicator lazy-loading-indicator--button header-transport__preview-loading">
          <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
          <span class="header-transport__preview-label">Frame</span>
          <span class="lazy-loading-indicator__dots" aria-hidden="true"><span></span><span></span><span></span></span>
        </span>
        <template v-else>
          <UiIcon class="header-transport__icon" name="image" />
          <span class="header-transport__preview-label">Frame</span>
        </template>
      </button>
    </div>

    <div class="ss-health">
      <button
        type="button"
        class="ss-pill ss-pill--button ss-pill--health"
        :class="{
          'ss-pill--live': !healthHasIssues,
          'ss-pill--warn': healthHasIssues,
        }"
        title="Health status"
        data-testid="health-dropdown"
        @click.stop="toggleHealth"
      >
        <span class="ss-dot"></span>
        <span class="ss-key">Health</span>
        <strong v-if="healthHasIssues">!</strong>
        <strong v-else>ok</strong>
      </button>

      <div v-if="healthOpen" class="ss-health-popover" @click.stop>
        <div class="ss-health-popover__header">
          <div class="ss-health-popover__title">Health</div>
          <button type="button" class="ss-help-popover__close" @click="healthOpen = false">
            <UiIcon class="ss-icon" name="close" />
          </button>
        </div>

        <div class="ss-health-grid">
          <button
            type="button"
            class="ss-pill ss-pill--button"
            :class="{
              'ss-pill--live': gpuActiveCount > 0,
              'ss-pill--error': gpuTotalCount > 0 && gpuActiveCount === 0,
              'ss-pill--warn': gpuTotalCount === 0,
            }"
            title="Open GPU pool settings"
            @click="$emit('open-gpus'); healthOpen = false"
          >
            <span class="ss-dot"></span>
            <span class="ss-key">GPU</span>
            <strong>{{ gpuActiveCount }}({{ gpuTotalCount }})</strong>
          </button>

          <button
            v-if="midiSupported"
            type="button"
            class="ss-pill ss-pill--button"
            :class="{ 'ss-pill--live': midiSelected }"
            title="Open MIDI settings"
            @click="$emit('open-midi'); healthOpen = false"
          >
            <span class="ss-dot"></span>
            <span class="ss-key">MIDI</span>
            <strong>{{ midiSelected ? 'on' : 'off' }}</strong>
          </button>

          <button
            type="button"
            class="ss-pill ss-pill--button"
            :class="{
              'ss-pill--live': wsStatus === 'connected',
              'ss-pill--warn': wsStatus !== 'connected' && wsStatus !== 'offline',
            }"
            :title="wsStatus === 'connected' ? 'Go offline and disable collaboration' : 'Reconnect collaboration'"
            @click="$emit('toggle-ws'); healthOpen = false"
          >
            <span class="ss-dot"></span>
            <span class="ss-key">WS</span>
            <strong>{{ wsStatus }}</strong>
          </button>
        </div>
      </div>
    </div>

    <div class="ss-session">
      <button
        type="button"
        class="ss-pill ss-pill--button"
        title="Session manager"
        :aria-expanded="sessionOpen ? 'true' : 'false'"
        data-testid="session-dropdown"
        @click.stop="toggleSession"
      >
        <span class="ss-key">Session</span>
        <strong>{{ session }}</strong>
        <UiIcon class="ss-icon" :name="sessionOpen ? 'chevron-up' : 'chevron-down'" />
      </button>
      <button
        type="button"
        class="ss-btn ss-btn--ghost ss-session__new"
        title="New session"
        aria-label="New session"
        data-testid="session-new"
        @click.stop="$emit('new-session')"
      >
        +
      </button>

      <div v-if="sessionOpen" class="ss-session-popover" @click.stop>
        <div class="ss-help-popover__header">
          <div class="ss-help-popover__title">Sessions</div>
          <button type="button" class="ss-help-popover__close" @click="sessionOpen = false">
            <UiIcon class="ss-icon" name="close" />
          </button>
        </div>

        <div v-if="!sessions.length" class="ss-session-empty">No saved sessions yet.</div>
        <div v-else class="ss-session-list">
          <div
            v-for="s in sessions"
            :key="s.name"
            class="ss-session-row"
            :class="{ 'ss-session-row--active': s.name === session }"
          >
            <button type="button" class="ss-session-pick" @click="$emit('select-session', s.name); sessionOpen=false">
              <span class="ss-session-name">{{ s.name }}</span>
              <span class="ss-session-meta">{{ s.images }} img · {{ s.videos }} vid</span>
            </button>
            <div class="ss-session-actions">
              <button type="button" class="ss-btn ss-btn--ghost" @click="$emit('restore-session', s.name); sessionOpen=false">Restore</button>
              <button type="button" class="ss-btn ss-btn--ghost" @click="$emit('purge-session', s.name)">Purge</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="ss-help">
      <button
        type="button"
        class="ss-btn ss-btn--ghost"
        :class="{ 'ss-btn--active': helpOpen }"
        title="Keyboard shortcuts help"
        @click.stop="toggleHelp"
      >
        <UiIcon class="ss-icon" name="help" />
        <span class="ss-label">Help</span>
      </button>

      <div v-if="helpOpen" class="ss-help-popover" @click.stop>
        <div class="ss-help-popover__header">
          <div class="ss-help-popover__title">Keyboard Shortcuts</div>
          <button type="button" class="ss-help-popover__close" @click="helpOpen = false">
            <UiIcon class="ss-icon" name="close" />
          </button>
        </div>
        <div class="ss-help-grid">
          <div class="ss-help-section">
            <div class="ss-help-section__title">Navigation</div>
            <div class="ss-help-section__items">
              <div><kbd>1</kbd>–<kbd>5</kbd> Switch tabs (LIVE→SETTINGS)</div>
            </div>
          </div>
          <div class="ss-help-section">
            <div class="ss-help-section__title">LIVE Tab</div>
            <div class="ss-help-section__items">
              <div><kbd>Space</kbd> Generate image</div>
              <div><kbd>R</kbd> Reset Vibe & Camera params</div>
            </div>
          </div>
          <div class="ss-help-section">
            <div class="ss-help-section__title">PROMPTS Tab</div>
            <div class="ss-help-section__items">
              <div><kbd>M</kbd> Toggle prompt morphing</div>
            </div>
          </div>
          <div class="ss-help-section">
            <div class="ss-help-section__title">MODULATION Tab</div>
            <div class="ss-help-section__items">
              <div><kbd>L</kbd> Toggle LFO</div>
              <div><kbd>B</kbd> Toggle Beat Macro (MODULATION → Beat)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'

export default {
  name: 'StatusStrip',
  components: { UiIcon },
  emits: ['toggle-play', 'stop-play', 'toggle-record', 'generate-preview', 'toggle-ws', 'open-midi', 'open-gpus', 'select-session', 'new-session', 'purge-session', 'restore-session'],
  props: {
    playing:       { type: Boolean, default: false },
    recording:     { type: Boolean, default: false },
    previewGenerating: { type: Boolean, default: false },
    previewDisabled:   { type: Boolean, default: false },
    apiHealth:     { type: Object,  default: () => ({}) },
    gpuActiveCount:{ type: Number,  default: 0 },
    gpuTotalCount: { type: Number,  default: 0 },
    midiSupported: { type: Boolean, default: false },
    midiSelected:  { default: null },
    wsStatus:      { type: String,  default: 'disconnected' },
    session:       { type: String,  default: '' },
    sessions:      { type: Array, default: () => [] },
  },
  data() {
    return {
      helpOpen: false,
      healthOpen: false,
      sessionOpen: false,
    }
  },
  computed: {
    healthHasIssues() {
      const gpuOff = this.gpuTotalCount > 0 && this.gpuActiveCount === 0;
      const gpuMissing = this.gpuTotalCount === 0;
      const wsIssue = this.wsStatus !== 'connected' && this.wsStatus !== 'offline';
      return !!(gpuOff || gpuMissing || wsIssue);
    },
  },
  mounted() {
    if (typeof document !== 'undefined') {
      this._statusStripHelpClose = (event) => {
        if (!this.$el || this.$el.contains(event.target)) return
        this.helpOpen = false
        this.healthOpen = false
        this.sessionOpen = false
      }
      document.addEventListener('click', this._statusStripHelpClose)
    }
  },
  beforeUnmount() {
    if (typeof document !== 'undefined' && this._statusStripHelpClose) {
      document.removeEventListener('click', this._statusStripHelpClose)
    }
  },
  methods: {
    toggleHelp() {
      this.helpOpen = !this.helpOpen
      this.healthOpen = false
      this.sessionOpen = false
    },
    toggleHealth() {
      this.healthOpen = !this.healthOpen
      this.helpOpen = false
      this.sessionOpen = false
    },
    toggleSession() {
      this.sessionOpen = !this.sessionOpen
      this.helpOpen = false
      this.healthOpen = false
    },
  },
}
</script>

<style scoped>
.status-strip {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.ss-session {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ss-session__new {
  padding: 4px 10px;
  min-width: 30px;
  justify-content: center;
}

.ss-session-popover {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: min(520px, 92vw);
  max-height: min(60vh, 520px);
  overflow: auto;
  border-radius: 14px;
  border: 0.5px solid var(--border);
  background: rgba(10, 12, 18, 0.92);
  box-shadow: 0 24px 70px rgba(0,0,0,0.45);
  padding: 10px;
  z-index: 40;
}

.ss-session-empty {
  font-size: 11px;
  color: var(--text-dim);
  padding: 8px 2px;
}

.ss-session-list {
  display: grid;
  gap: 8px;
  margin-top: 6px;
}

.ss-session-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-radius: 12px;
  border: 0.5px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
}

.ss-session-row--active {
  border-color: rgba(127, 119, 221, 0.45);
  box-shadow: inset 0 0 0 1px rgba(127, 119, 221, 0.12);
}

.ss-session-pick {
  display: grid;
  gap: 2px;
  text-align: left;
  color: var(--text-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  min-width: 0;
}

.ss-session-name {
  font-size: 12px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ss-session-meta {
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ss-session-actions {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.ss-transport {
  border-left: none;
  border-radius: 12px;
  border: 0.5px solid var(--border);
  background: rgba(17, 19, 28, 0.72);
  padding: 4px;
  gap: 3px;
}

.ss-transport .header-transport__btn {
  width: 36px;
  height: 36px;
}

.ss-transport .header-transport__btn--preview {
  width: auto;
  min-width: 36px;
  padding: 0 10px;
  gap: 5px;
}

.header-transport__preview-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.header-transport__preview-loading {
  font-size: 10px;
}

/* Action buttons */
.ss-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 999px;
  border: 0.5px solid var(--border);
  background: var(--bg-2);
  color: var(--text-dim);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.12s, border-color 0.12s, box-shadow 0.12s;
  white-space: nowrap;
}
.ss-icon {
  font-size: 13px;
}
.ss-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; }
.ss-btn--ghost { background: transparent; border-color: transparent; }
.ss-btn--ghost:hover { border-color: var(--border); }
.ss-btn--active {
  color: var(--live-text);
  border-color: var(--live);
  box-shadow: 0 0 8px rgba(29, 158, 117, 0.25);
}
.ss-btn--recording {
  color: var(--error);
  border-color: var(--error);
  animation: ss-rec-pulse 1.5s ease-in-out infinite;
}
@keyframes ss-rec-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }

/* Status pills */
.ss-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  border: 0.5px solid var(--border);
  background: var(--bg-2);
  font-size: 11px;
  white-space: nowrap;
}
.ss-pill--button {
  cursor: pointer;
  color: inherit;
}
.ss-pill--live  { border-color: rgba(29, 158, 117, 0.4); }
.ss-pill--error { border-color: rgba(226, 75, 74, 0.4); }
.ss-pill--warn  { border-color: rgba(239, 159, 39, 0.35); }

.ss-key {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-dim);
}
.ss-pill strong { font-size: 11px; color: var(--text-secondary); }

.ss-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--border-strong);
  flex-shrink: 0;
}
.ss-pill--live  .ss-dot { background: var(--live); box-shadow: 0 0 5px var(--live); }
.ss-pill--error .ss-dot { background: var(--error); box-shadow: 0 0 5px var(--error); }
.ss-pill--warn  .ss-dot { background: var(--warn); box-shadow: 0 0 5px var(--warn); }

.ss-help {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.ss-help-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 30;
  width: min(360px, calc(100vw - 28px));
  padding: 12px;
  border-radius: 14px;
  border: 0.5px solid var(--border);
  background: rgba(8, 9, 13, 0.96);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.ss-health {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.ss-health-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 30;
  width: min(320px, calc(100vw - 28px));
  padding: 12px;
  border-radius: 14px;
  border: 0.5px solid var(--border);
  background: rgba(8, 9, 13, 0.96);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.ss-health-popover__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.ss-health-popover__title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.ss-health-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 10px;
}

.ss-help-popover__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ss-help-popover__title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.ss-help-popover__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 0.5px solid var(--border);
  background: var(--bg-2);
  color: var(--text-dim);
  cursor: pointer;
}

.ss-help-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.ss-help-section {
  display: grid;
  gap: 6px;
  padding: 10px;
  border-radius: 10px;
  border: 0.5px solid var(--border);
  background: rgba(255, 255, 255, 0.02);
}

.ss-help-section__title {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ss-help-section__items {
  display: grid;
  gap: 5px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.ss-help-popover kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  min-height: 20px;
  padding: 0 6px;
  margin: 0 2px;
  border-radius: 6px;
  border: 0.5px solid var(--border-strong);
  background: var(--bg-2);
  color: var(--text-primary);
  font-size: 10px;
  font-family: inherit;
  font-weight: 700;
}

@media (max-width: 900px) {
  .ss-help-grid {
    grid-template-columns: 1fr;
  }
}
</style>
