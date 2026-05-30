<template>
  <LiveEngineControls :app="app" :show-compositor="true" :show-webgl="false" force-performance />
</template>

<script>
import LiveEngineControls from '../LiveEngineControls.vue'
import { proxyAppView } from '../views/app-view-proxy.mjs'

export default {
  name: 'CompositorControls',
  components: { LiveEngineControls },
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
