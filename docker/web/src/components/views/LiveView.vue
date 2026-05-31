<template>
  <div class="live-view" data-testid="live-view">
    <div class="live-view__scroll">
      <div class="framesync-panel live-view__engine-hint">
        <div class="framesync-header">
          <div class="framesync-title">Live <span class="framesync-accent">controls</span></div>
        </div>
        <p class="framesync-subtitle live-view__engine-hint-copy">
          Style and camera parameters are in the Animation Engine → Deforum panel.
        </p>
        <button
          type="button"
          class="framesync-button framesync-button--live"
          data-testid="live-open-deforum-parameters"
          @click="openDeforumParameters"
        >
          Open Deforum parameters
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './app-view-proxy.mjs'

export default {
  name: 'LiveView',
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
  methods: {
    openDeforumParameters() {
      this.liveEngineDrawerOpen = true
      this.promoteToDeforum()
      this.paramPanelOpen = true
      this.saveSessionState()
    },
  },
}
</script>
