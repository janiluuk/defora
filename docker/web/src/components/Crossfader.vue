<template>
  <div class="crossfader">
    <div class="crossfader-labels">
      <span class="crossfader-label crossfader-label--a">A {{ aPercent }}%</span>
      <span class="crossfader-label crossfader-label--b">B {{ bPercent }}%</span>
    </div>
    <div class="crossfader-track">
      <div class="crossfader-fill" :style="{ width: (modelValue * 100) + '%' }"></div>
      <div class="crossfader-thumb" :style="{ left: (modelValue * 100) + '%' }"></div>
      <input
        type="range"
        class="crossfader-input"
        min="0" max="1" step="0.01"
        :value="modelValue"
        :disabled="disabled"
        @input="$emit('update:modelValue', parseFloat($event.target.value))"
        :data-testid="testid || undefined"
      />
    </div>
    <div class="crossfader-actions">
      <button class="crossfader-snap crossfader-snap--a" :disabled="disabled"
        @click="$emit('update:modelValue', 0); $emit('snap-a')">Snap A</button>
      <button class="crossfader-randomize" :disabled="disabled" @click="onRandomize" title="Randomize">~</button>
      <button class="crossfader-snap crossfader-snap--b" :disabled="disabled"
        @click="$emit('update:modelValue', 1); $emit('snap-b')">Snap B</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Crossfader',
  emits: ['update:modelValue', 'snap-a', 'snap-b', 'randomize'],
  props: {
    modelValue: { type: Number, default: 0.5 },
    disabled:   { type: Boolean, default: false },
    testid:     { type: String, default: '' },
  },
  computed: {
    aPercent() { return ((1 - this.modelValue) * 100).toFixed(0); },
    bPercent() { return (this.modelValue * 100).toFixed(0); },
  },
  methods: {
    onRandomize() {
      const v = parseFloat(Math.random().toFixed(2));
      this.$emit('update:modelValue', v);
      this.$emit('randomize', v);
    },
  },
}
</script>

<style scoped>
.crossfader { display: flex; flex-direction: column; gap: 8px; }

.crossfader-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.crossfader-label--a { color: var(--a-group); }
.crossfader-label--b { color: var(--b-group); }

.crossfader-track {
  position: relative;
  height: 20px;
  border-radius: 4px;
  background: var(--bg-1);
  border: 0.5px solid var(--border);
  overflow: visible;
}
.crossfader-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--a-group), var(--b-group));
  opacity: 0.28;
  pointer-events: none;
  transition: width 0.04s;
}
.crossfader-thumb {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 2px rgba(127, 119, 221, 0.5), 0 0 8px rgba(127, 119, 221, 0.35);
  pointer-events: none;
  transition: left 0.04s;
}
.crossfader-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}
.crossfader-input:disabled { cursor: not-allowed; }

.crossfader-actions { display: flex; gap: 6px; }
.crossfader-snap {
  flex: 1;
  padding: 4px 6px;
  border-radius: var(--radius-pill);
  border: 0.5px solid var(--border);
  background: var(--bg-2);
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-dim);
  transition: color 0.15s, border-color 0.15s;
}
.crossfader-snap--a { color: var(--a-group); border-color: rgba(55, 138, 221, 0.35); }
.crossfader-snap--b { color: var(--b-group); border-color: rgba(232, 121, 176, 0.35); }
.crossfader-randomize {
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  border: 0.5px solid var(--border);
  background: var(--bg-2);
  font-size: 13px;
  cursor: pointer;
  color: var(--text-dim);
}
.crossfader-snap:disabled,
.crossfader-randomize:disabled { opacity: 0.38; cursor: not-allowed; }
</style>
