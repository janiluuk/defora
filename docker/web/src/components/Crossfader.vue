<template>
  <div
    class="crossfader"
    :class="{
      'crossfader--a': dominantSide === 'a',
      'crossfader--b': dominantSide === 'b',
    }"
    :style="weightStyle"
  >
    <div class="crossfader-labels">
      <span class="crossfader-label crossfader-label--a">A {{ aPercent }}%</span>
      <span class="crossfader-label crossfader-label--b">B {{ bPercent }}%</span>
    </div>
    <div class="crossfader-track">
      <div class="crossfader-track__half crossfader-track__half--a"></div>
      <div class="crossfader-track__half crossfader-track__half--b"></div>
      <div class="crossfader-track__divider" :style="{ left: (modelValue * 100) + '%' }"></div>
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
      <button class="crossfader-randomize" :disabled="disabled" @click="onRandomize" title="Randomize">
        <UiIcon class="crossfader-randomize-icon" name="shuffle" />
        <span class="crossfader-randomize-label">Rand</span>
      </button>
      <button class="crossfader-snap crossfader-snap--b" :disabled="disabled"
        @click="$emit('update:modelValue', 1); $emit('snap-b')">Snap B</button>
    </div>
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'

export default {
  name: 'Crossfader',
  components: { UiIcon },
  emits: ['update:modelValue', 'snap-a', 'snap-b', 'randomize'],
  props: {
    modelValue: { type: Number, default: 0.5 },
    disabled:   { type: Boolean, default: false },
    testid:     { type: String, default: '' },
  },
  computed: {
    aWeight() {
      return Math.min(1, Math.max(0, 1 - Number(this.modelValue) || 0));
    },
    bWeight() {
      return Math.min(1, Math.max(0, Number(this.modelValue) || 0));
    },
    dominantSide() {
      if (this.aWeight > this.bWeight + 0.02) return 'a';
      if (this.bWeight > this.aWeight + 0.02) return 'b';
      return 'neutral';
    },
    weightStyle() {
      return {
        '--crossfade-a-weight': this.aWeight,
        '--crossfade-b-weight': this.bWeight,
      };
    },
    aPercent() { return (this.aWeight * 100).toFixed(0); },
    bPercent() { return (this.bWeight * 100).toFixed(0); },
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
.crossfader {
  display: flex;
  flex-direction: column;
  gap: 8px;
  --crossfade-a-weight: 0.5;
  --crossfade-b-weight: 0.5;
}

.crossfader-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.crossfader-label--a {
  color: var(--a-group);
  opacity: calc(0.35 + var(--crossfade-a-weight) * 0.65);
  text-shadow: 0 0 calc(var(--crossfade-a-weight) * 14px) color-mix(in srgb, var(--a-group) 70%, transparent);
  transition: opacity 0.08s linear, text-shadow 0.08s linear;
}
.crossfader-label--b {
  color: var(--b-group);
  opacity: calc(0.35 + var(--crossfade-b-weight) * 0.65);
  text-shadow: 0 0 calc(var(--crossfade-b-weight) * 14px) color-mix(in srgb, var(--b-group) 70%, transparent);
  transition: opacity 0.08s linear, text-shadow 0.08s linear;
}

.crossfader-track {
  position: relative;
  height: 24px;
  border-radius: 8px;
  background: var(--bg-1);
  border: 0.5px solid var(--border);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.crossfader-track__half {
  height: 100%;
  transition: opacity 0.08s linear, box-shadow 0.08s linear, filter 0.08s linear;
}
.crossfader-track__half--a {
  background: linear-gradient(90deg, color-mix(in srgb, var(--a-group) 88%, var(--media-bg)), color-mix(in srgb, var(--a-group) 42%, transparent));
  opacity: calc(0.12 + var(--crossfade-a-weight) * 0.78);
  box-shadow:
    inset 0 0 calc(var(--crossfade-a-weight) * 28px) color-mix(in srgb, var(--a-group) 55%, transparent),
    0 0 calc(var(--crossfade-a-weight) * 18px) color-mix(in srgb, var(--a-group) 45%, transparent);
}
.crossfader-track__half--b {
  background: linear-gradient(270deg, color-mix(in srgb, var(--b-group) 88%, var(--media-bg)), color-mix(in srgb, var(--b-group) 42%, transparent));
  opacity: calc(0.12 + var(--crossfade-b-weight) * 0.78);
  box-shadow:
    inset 0 0 calc(var(--crossfade-b-weight) * 28px) color-mix(in srgb, var(--b-group) 55%, transparent),
    0 0 calc(var(--crossfade-b-weight) * 18px) color-mix(in srgb, var(--b-group) 45%, transparent);
}
.crossfader-track__divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  background: color-mix(in srgb, var(--media-text) 82%, transparent);
  box-shadow: 0 0 10px color-mix(in srgb, var(--media-text) 35%, transparent);
  pointer-events: none;
  z-index: 2;
  transition: left 0.04s linear;
}
.crossfader-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--media-text);
  transform: translate(-50%, -50%);
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--a-group) calc(var(--crossfade-a-weight) * 100%), var(--b-group)),
    0 0 calc(8px + var(--crossfade-a-weight) * 10px + var(--crossfade-b-weight) * 10px) color-mix(in srgb, var(--a-group) calc(var(--crossfade-a-weight) * 100%), var(--b-group));
  pointer-events: none;
  z-index: 3;
  transition: left 0.04s linear, box-shadow 0.08s linear;
}
.crossfader-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
  z-index: 4;
}
.crossfader-input:disabled { cursor: not-allowed; }

.crossfader-actions { display: flex; gap: 6px; }
.crossfader-snap {
  flex: 1;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  border: 0.5px solid var(--border);
  background: var(--bg-3);
  font-size: 10px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  transition: color 0.15s, border-color 0.15s, background 0.15s, box-shadow 0.15s;
}
.crossfader-snap--a {
  color: var(--a-group);
  border-color: rgba(55, 138, 221, 0.45);
  background: rgba(55, 138, 221, 0.12);
}
.crossfader--a .crossfader-snap--a {
  box-shadow: 0 0 calc(var(--crossfade-a-weight) * 16px) color-mix(in srgb, var(--a-group) 50%, transparent);
}
.crossfader-snap--b {
  color: var(--b-group);
  border-color: rgba(232, 121, 176, 0.45);
  background: rgba(232, 121, 176, 0.12);
}
.crossfader--b .crossfader-snap--b {
  box-shadow: 0 0 calc(var(--crossfade-b-weight) * 16px) color-mix(in srgb, var(--b-group) 50%, transparent);
}
.crossfader-randomize {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  border: 0.5px solid var(--live);
  background: rgba(29, 158, 117, 0.18);
  font-size: 10px;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  color: var(--live-text);
  transition: background 0.15s, border-color 0.15s;
}
.crossfader-randomize:hover:not(:disabled) {
  background: rgba(29, 158, 117, 0.28);
}
.crossfader-randomize-icon { font-size: 12px; }
.crossfader-randomize-label { line-height: 1; }
.crossfader-snap:disabled,
.crossfader-randomize:disabled { opacity: 0.38; cursor: not-allowed; }
</style>
