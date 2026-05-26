<template>
  <button
    class="target-cell"
    :class="{
      'target-cell--routed': owners.length > 0,
      'target-cell--selected': selected,
    }"
    :title="tooltip"
    @click="$emit('toggle', paramKey)"
    type="button"
  >
    <span class="target-cell-label">{{ label }}</span>
    <span v-if="owners.length === 1" class="target-cell-owner">{{ owners[0] }}</span>
    <span v-else-if="owners.length > 1" class="target-cell-owner">{{ owners[0] }}<span class="target-cell-extra"> +{{ owners.length - 1 }}</span></span>
  </button>
</template>

<script>
export default {
  name: 'TargetCell',
  emits: ['toggle'],
  props: {
    label:    { type: String, required: true },
    paramKey: { type: String, required: true },
    owners:   { type: Array, default: () => [] },
    selected: { type: Boolean, default: false },
  },
  computed: {
    tooltip() {
      if (!this.owners.length) return this.label;
      return `${this.label} ← ${this.owners.join(', ')}`;
    },
  },
}
</script>

<style scoped>
.target-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 4px;
  border-radius: var(--radius-sm);
  border: 0.5px solid var(--border);
  background: var(--bg-2);
  cursor: pointer;
  min-width: 0;
  transition: border-color 0.12s, background 0.12s, box-shadow 0.12s;
  text-align: center;
}
.target-cell:hover { border-color: var(--border-strong); }

.target-cell--routed {
  border-color: var(--live);
  background: rgba(29, 158, 117, 0.08);
  box-shadow: 0 0 6px rgba(29, 158, 117, 0.18);
}
.target-cell--selected {
  border-color: var(--accent);
  background: rgba(127, 119, 221, 0.1);
  box-shadow: 0 0 6px rgba(127, 119, 221, 0.2);
}

.target-cell-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.target-cell--routed .target-cell-label  { color: var(--live-text); }
.target-cell--selected .target-cell-label { color: var(--accent-text); }

.target-cell-owner {
  font-size: 8px;
  color: var(--live);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  font-weight: 700;
}
.target-cell-extra { color: var(--text-dim); }
</style>
