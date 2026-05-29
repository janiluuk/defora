<template>
  <DeforumJobPanel :app="app" />
</template>

<script>
import DeforumJobPanel from '../DeforumJobPanel.vue'
import { proxyAppView } from '../views/app-view-proxy.mjs'

export default {
  name: 'DeforumPluginPanel',
  components: { DeforumJobPanel },
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
