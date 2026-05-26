<template>
  <header class="header">
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab', { active: currentTab === tab.id }]"
        @click="() => setCurrentTab(tab.id)"
      >
        {{ tab.name }}
      </button>
    </div>
    <div class="status-strip">
      <slot name="status"></slot>
    </div>
  </header>
</template>

<script>
export default {
  name: 'LayoutHeader',
  props: {
    currentTab: { type: String, required: true },
    tabs: { type: Array, required: true }
  },
  emits: ['tab-change'],
  methods: {
    setCurrentTab(tabId) {
      this.$emit('tab-change', tabId)
    }
  }
}
</script>

<style scoped>
.header {
  padding: 7px 14px;
  background: rgba(8, 9, 13, 0.9);
  border-bottom: 0.5px solid var(--border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;
}

.tabs { 
  display: flex; 
  gap: 4px; 
  flex-wrap: wrap; 
  justify-content: flex-start; 
}

.tab {
  padding: 5px 11px;
  border-radius: var(--radius-pill);
  border: 0.5px solid var(--border);
  background: var(--bg-2);
  color: var(--text-dim);
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color 0.12s, border-color 0.12s;
}

.tab:hover { 
  color: var(--text-secondary); 
  border-color: var(--border-strong); 
}

.tab.active {
  border-color: var(--accent);
  color: var(--accent-text);
  box-shadow: 0 0 10px rgba(127, 119, 221, 0.16);
}
</style>