<template>
  <div class="glass-panel" :class="[`glass-panel--${size}`]">
    <div v-if="$slots.header" class="glass-panel-header">
      <slot name="header" />
    </div>
    <div class="glass-panel-body">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'GlassPanel',
  props: {
    size: { type: String, default: 'md' },
  },
}
</script>

<style scoped>
.glass-panel {
  background: rgba(17, 19, 28, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 0.5px solid var(--border);
  border-radius: 11px;
  overflow: hidden;
}
.glass-panel-header {
  padding: 8px 12px 6px;
  border-bottom: 0.5px solid var(--border);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-dim);
}
.glass-panel-body {
  padding: 10px 12px;
}
.glass-panel--sm .glass-panel-body { padding: 6px 10px; }
.glass-panel--lg .glass-panel-body { padding: 14px 16px; }
</style>
