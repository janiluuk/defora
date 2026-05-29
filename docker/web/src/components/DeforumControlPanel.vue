<template>
  <div class="deforum-control-panel" data-testid="deforum-control-panel">
    <CommonVisualStrip v-if="showMacroKnobs" :app="app" plugin-id="deforum" />
    <DeforumMotionPads
      v-if="showMotionPads"
      :app="app"
      :show-readout="motionPadsShowReadout"
      :show-axis-sliders="motionPadsShowAxisSliders"
    />
    <DeforumSettingsBody v-if="showSettings" :app="app" />
  </div>
</template>

<script>
import CommonVisualStrip from './animation-plugins/CommonVisualStrip.vue'
import DeforumMotionPads from './DeforumMotionPads.vue'
import DeforumSettingsBody from './DeforumSettingsBody.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'DeforumControlPanel',
  components: { CommonVisualStrip, DeforumMotionPads, DeforumSettingsBody },
  props: {
    app: { type: Object, required: true },
    showMacroKnobs: { type: Boolean, default: true },
    showMotionPads: { type: Boolean, default: true },
    showSettings: { type: Boolean, default: true },
    motionPadsShowReadout: { type: Boolean, default: false },
    motionPadsShowAxisSliders: { type: Boolean, default: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
