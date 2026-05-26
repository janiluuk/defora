<template>
  <div class="lpr" :class="{ 'lpr--modulated': modulated }">
    <div class="lpr-main">
      <span class="lpr-name">{{ label }}</span>
      <span v-if="source && modulated" class="lpr-source">
        <UiIcon class="lpr-source-icon" name="arrow-left" />
        <span class="lpr-source-text">{{ source }}</span>
      </span>
    </div>
    <code class="lpr-value">{{ formattedValue }}</code>
    <div class="lpr-bar-wrap">
      <div class="lpr-bar" :style="{ width: fillPct + '%' }"></div>
    </div>
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'

export default {
  name: 'LiveParamRow',
  components: { UiIcon },
  props: {
    label:     { type: String, required: true },
    paramKey:  { type: String, required: true },
    value:     { type: Number, default: 0 },
    min:       { type: Number, default: 0 },
    max:       { type: Number, default: 1 },
    source:    { type: String, default: '' },
    modulated: { type: Boolean, default: false },
  },
  computed: {
    fillPct() {
      const range = this.max - this.min;
      if (range === 0) return 0;
      return Math.max(0, Math.min(100, ((this.value - this.min) / range) * 100));
    },
    formattedValue() {
      const v = this.value;
      if (Number.isNaN(v)) return '—';
      return Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2);
    },
  },
}
</script>

<style scoped>
.lpr {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: auto auto;
  gap: 6px;
  align-items: start;
  padding: 5px 0;
  border-bottom: 0.5px solid var(--border);
  opacity: 0.45;
  transition: opacity 0.2s;
}
.lpr:last-child { border-bottom: none; }
.lpr--modulated { opacity: 1; }

.lpr-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
}
.lpr-name {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lpr--modulated .lpr-name { color: var(--live); }
.lpr-source {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 8px;
  color: var(--live-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lpr-source-icon { font-size: 9px; }
.lpr-source-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lpr-bar-wrap {
  grid-column: 1 / -1;
  height: 3px;
  border-radius: 2px;
  background: var(--bg-1);
  overflow: hidden;
  margin-top: 1px;
}
.lpr-bar {
  height: 100%;
  border-radius: 2px;
  background: var(--text-dim);
  transition: width 0.06s;
}
.lpr--modulated .lpr-bar {
  background: var(--live);
  box-shadow: 0 0 4px var(--live);
}

.lpr-value {
  grid-column: 2;
  font-family: ui-monospace, "Cascadia Code", monospace;
  font-size: 10px;
  color: var(--text-dim);
  text-align: right;
  white-space: nowrap;
  padding-top: 1px;
}
.lpr--modulated .lpr-value { color: var(--live-text); }
</style>
