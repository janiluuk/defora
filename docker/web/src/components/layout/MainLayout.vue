<template>
  <div class="main-layout">
    <LayoutHeader 
      :current-tab="currentTab" 
      :tabs="tabs" 
      @tab-change="handleTabChange"
    />
    
    <div class="layout-content">
      <PreviewPanel 
        :video-src="videoSrc" 
        :show-overlay="true"
        :show-thumbs="true"
      />
      
      <div class="main-content">
        <slot name="content"></slot>
      </div>
    </div>
    
    <div class="context-panel" v-if="showContextPanel">
      <slot name="context"></slot>
    </div>
  </div>
</template>

<script>
import LayoutHeader from './Header.vue'
import PreviewPanel from './PreviewPanel.vue'

export default {
  name: 'MainLayout',
  components: {
    LayoutHeader,
    PreviewPanel
  },
  props: {
    currentTab: { type: String, required: true },
    tabs: { type: Array, required: true },
    videoSrc: { type: String, default: '' },
    showContextPanel: { type: Boolean, default: true }
  },
  methods: {
    handleTabChange(tabId) {
      this.$emit('tab-change', tabId)
    }
  }
}
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.layout-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 10px;
  padding: 10px;
  overflow: hidden;
}

.main-content {
  overflow: auto;
  padding: 10px;
}

.context-panel {
  grid-column: 1 / span 2;
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
  overflow: auto;
}
</style>