<template>
  <div class="status-strip">
    <div class="header-transport ss-transport" data-testid="header-transport">
      <button
        type="button"
        class="header-transport__btn"
        :class="playing ? 'header-transport__btn--pause header-transport__btn--active' : 'header-transport__btn--play'"
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

    <button
      type="button"
      class="ss-pill ss-pill--button"
      :class="{
        'ss-pill--live': gpuActiveCount > 0,
        'ss-pill--error': gpuTotalCount > 0 && gpuActiveCount === 0,
        'ss-pill--warn': gpuTotalCount === 0,
      }"
      title="Open GPU pool settings"
      @click="$emit('open-gpus')"
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
      @click="$emit('open-midi')"
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
      @click="$emit('toggle-ws')"
    >
      <span class="ss-dot"></span>
      <span class="ss-key">WS</span>
      <strong>{{ wsStatus }}</strong>
    </button>

    <div class="ss-pill">
      <span class="ss-key">Session</span>
      <strong>{{ session }}</strong>
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
  emits: ['toggle-play', 'stop-play', 'toggle-record', 'generate-preview', 'toggle-ws', 'open-midi', 'open-gpus'],
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
  },
  data() {
    return {
      helpOpen: false,
    }
  },
  mounted() {
    if (typeof document !== 'undefined') {
      this._statusStripHelpClose = (event) => {
        if (!this.$el || this.$el.contains(event.target)) return
        this.helpOpen = false
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
