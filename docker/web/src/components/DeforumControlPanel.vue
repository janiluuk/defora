<template>
  <div class="deforum-control-panel" data-testid="deforum-control-panel">
    <div class="sub-pills deforum-control-panel__tabs" role="tablist" aria-label="Deforum controls">
      <button
        v-for="tab in deforumControlTabs"
        :key="'deforum-ctrl-tab-' + tab.id"
        type="button"
        role="tab"
        class="sub-pill"
        :class="{ active: deforumControlTab === tab.id }"
        :aria-selected="deforumControlTab === tab.id ? 'true' : 'false'"
        :data-testid="'deforum-control-tab-' + tab.id"
        @click="setDeforumControlTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <DeforumSettingsBody v-show="deforumControlTab === 'settings'" :app="app" />
    <DeforumControlNetPanel v-show="deforumControlTab === 'controlnet'" :app="app" />
    <DeforumMotionPads
      v-show="deforumControlTab === 'motion'"
      :app="app"
      :show-readout="motionPadsShowReadout"
      :show-axis-sliders="motionPadsShowAxisSliders"
    />
    <CommonVisualStrip
      v-show="deforumControlTab === 'macros'"
      :app="app"
      :plugin-id="visualPluginId"
    />
  </div>
</template>

<script>
import CommonVisualStrip from './animation-plugins/CommonVisualStrip.vue'
import DeforumControlNetPanel from './animation-plugins/DeforumControlNetPanel.vue'
import DeforumMotionPads from './DeforumMotionPads.vue'
import DeforumSettingsBody from './DeforumSettingsBody.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'DeforumControlPanel',
  components: { CommonVisualStrip, DeforumControlNetPanel, DeforumMotionPads, DeforumSettingsBody },
  props: {
    app: { type: Object, required: true },
    visualPluginId: { type: String, default: 'deforum' },
    motionPadsShowReadout: { type: Boolean, default: false },
    motionPadsShowAxisSliders: { type: Boolean, default: true },
  },
  setup(props) {
    return proxyAppView(props);
  },
}
</script>
