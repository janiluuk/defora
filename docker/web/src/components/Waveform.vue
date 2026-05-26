<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    class="waveform"
    :class="{ 'waveform--active': active }"
    aria-hidden="true"
  >
    <polyline :points="points" fill="none" :stroke="strokeColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
  </svg>
</template>

<script>
const SHAPE_FNS = {
  sine:     t => Math.sin(t),
  triangle: t => { const p = ((t / (Math.PI * 2)) % 1 + 1) % 1; return p < 0.5 ? 4 * p - 1 : 3 - 4 * p; },
  saw:      t => { const p = ((t / (Math.PI * 2)) % 1 + 1) % 1; return 2 * p - 1; },
  square:   t => (Math.sin(t) >= 0 ? 1 : -1),
};

export default {
  name: 'Waveform',
  props: {
    shape:  { type: String, default: 'Sine' },
    phase:  { type: Number, default: 0 },
    depth:  { type: Number, default: 0.8 },
    active: { type: Boolean, default: false },
    width:  { type: Number, default: 80 },
    height: { type: Number, default: 30 },
    cycles: { type: Number, default: 2 },
  },
  computed: {
    strokeColor() {
      return this.active ? 'var(--live)' : 'var(--text-dim)';
    },
    points() {
      const { width, height, shape, phase, depth, cycles } = this;
      const mid = height / 2;
      const amp = (height / 2 - 2) * Math.min(1, Math.max(0, depth));
      const key = (shape || 'sine').toLowerCase();
      const fn = SHAPE_FNS[key] || SHAPE_FNS.sine;
      const pts = [];
      const steps = width;

      if (key === 'noise') {
        for (let i = 0; i <= steps; i++) {
          const y = mid + (Math.sin(i * 0.8 + phase) * Math.cos(i * 1.3 + phase * 0.7)) * amp;
          pts.push(`${i},${y.toFixed(1)}`);
        }
      } else {
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * Math.PI * 2 * cycles + (phase || 0);
          const y = mid - fn(t) * amp;
          pts.push(`${i},${y.toFixed(1)}`);
        }
      }
      return pts.join(' ');
    },
  },
}
</script>

<style scoped>
.waveform { display: block; overflow: visible; }
.waveform--active polyline { filter: drop-shadow(0 0 2px var(--live)); }
</style>
