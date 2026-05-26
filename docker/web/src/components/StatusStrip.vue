<template>
  <div class="status-strip">
    <button
      class="ss-btn"
      :class="{ 'ss-btn--active': playing }"
      :title="playing ? 'Pause Deforum' : 'Play Deforum animation'"
      @click="$emit('toggle-play')"
    >
      <UiIcon class="ss-icon" :name="playing ? 'pause' : 'play'" />
      <span class="ss-label">Anim</span>
    </button>
    <button class="ss-btn ss-btn--ghost" title="Stop animation" @click="$emit('stop-play')">
      <UiIcon class="ss-icon" name="stop" />
    </button>
    <button
      class="ss-btn ss-btn--ghost"
      :class="{ 'ss-btn--recording': recording }"
      @click="$emit('toggle-record')"
    >
      <UiIcon class="ss-icon" :name="recording ? 'stop' : 'record'" />
      <span class="ss-label">Rec</span>
    </button>

    <div
      v-if="apiHealth && apiHealth.sdForge"
      class="ss-pill"
      :class="{
        'ss-pill--live':  apiHealth.sdForge.available === true,
        'ss-pill--error': apiHealth.sdForge.available === false,
      }"
      :title="apiHealth.sdForge.lastChecked ? 'SD-Forge last check: ' + apiHealth.sdForge.lastChecked : 'SD-Forge status'"
    >
      <span class="ss-dot"></span>
      <span class="ss-key">Forge</span>
      <strong>{{ apiHealth.sdForge.available == null ? '…' : (apiHealth.sdForge.available ? 'up' : 'down') }}</strong>
    </div>

    <div v-if="midiSupported" class="ss-pill" :class="{ 'ss-pill--live': midiSelected }">
      <span class="ss-dot"></span>
      <span class="ss-key">MIDI</span>
      <strong>{{ midiSelected ? 'on' : 'off' }}</strong>
    </div>

    <div class="ss-pill" :class="{ 'ss-pill--live': wsStatus === 'connected', 'ss-pill--warn': wsStatus !== 'connected' }">
      <span class="ss-dot"></span>
      <span class="ss-key">WS</span>
      <strong>{{ wsStatus }}</strong>
    </div>

    <div class="ss-pill">
      <span class="ss-key">Session</span>
      <strong>{{ session }}</strong>
    </div>
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'

export default {
  name: 'StatusStrip',
  components: { UiIcon },
  emits: ['toggle-play', 'stop-play', 'toggle-record'],
  props: {
    playing:       { type: Boolean, default: false },
    recording:     { type: Boolean, default: false },
    apiHealth:     { type: Object,  default: () => ({}) },
    midiSupported: { type: Boolean, default: false },
    midiSelected:  { default: null },
    wsStatus:      { type: String,  default: 'disconnected' },
    session:       { type: String,  default: '' },
  },
}
</script>

<style scoped>
.status-strip {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
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
</style>
