<template>
  <div class="deforum-plugin-panel animation-plugin-panel" data-testid="deforum-plugin-panel">
    <DeforumJobToolbar :app="app" />
    <DeforumControlPanel
      :app="app"
      visual-plugin-id="deforum"
      motion-pads-show-readout
    />
  </div>
</template>

<script>
import DeforumJobToolbar from '../DeforumJobToolbar.vue'
import DeforumControlPanel from '../DeforumControlPanel.vue'
import { proxyAppView } from '../views/app-view-proxy.mjs'

export default {
  name: 'DeforumPluginPanel',
  components: { DeforumJobToolbar, DeforumControlPanel },
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
