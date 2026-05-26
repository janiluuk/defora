<template>
  <div class="lpr" :class="{ 'lpr--modulated': modulated }">
    <div class="lpr-label">
      <span class="lpr-name">{{ label }}</span>
      <span v-if="source && modulated" class="lpr-source">← {{ source }}</span>
    </div>
    <div class="lpr-bar-wrap">
      <div class="lpr-bar" :style="{ width: fillPct + '%' }"></div>
    </div>
    <code class="lpr-value">{{ formattedValue }}</code>
  </div>
</template>

<script>
export default {
  name: 'LiveParamRow',
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
  grid-template-columns: 1fr 72px 40px;
  gap: 6px;
  align-items: center;
  padding: 5px 0;
  border-bottom: 0.5px solid var(--border);
  opacity: 0.45;
  transition: opacity 0.2s;
}
.lpr:last-child { border-bottom: none; }
.lpr--modulated { opacity: 1; }

.lpr-name {
  display: block;
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
  display: block;
  font-size: 8px;
  color: var(--live-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.lpr-bar-wrap {
  height: 3px;
  border-radius: 2px;
  background: var(--bg-1);
  overflow: hidden;
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
  font-family: ui-monospace, "Cascadia Code", monospace;
  font-size: 10px;
  color: var(--text-dim);
  text-align: right;
}
.lpr--modulated .lpr-value { color: var(--live-text); }
</style>
