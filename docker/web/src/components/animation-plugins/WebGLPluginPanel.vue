<template>
  <LiveEngineControls :app="app" :show-compositor="false" :show-webgl="true" force-webgl />
</template>

<script>
import LiveEngineControls from '../LiveEngineControls.vue'
import { proxyAppView } from '../views/app-view-proxy.mjs'

export default {
  name: 'WebGLPluginPanel',
  components: { LiveEngineControls },
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
