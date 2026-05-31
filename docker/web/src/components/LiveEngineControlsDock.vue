<template>
  <section class="live-engine-dock framesync-panel" data-testid="live-engine-dock">
    <div class="live-engine-dock__head">
      <div class="framesync-title">
        <UiIcon class="framesync-title-icon" name="film" />
        <span class="framesync-accent">Engine</span>
        <span
          v-if="lcmEngineEnabled"
          class="lcm-engine-badge"
          data-testid="lcm-engine-badge"
          title="LCM Engine mode — fast steps with LCM LoRA (Settings → Engine)"
        >
          <UiIcon class="lcm-engine-badge__icon" name="lightning" />
          LCM
        </span>
      </div>
    </div>

    <div class="live-engine-dock__body" data-testid="live-engine-dock-body">
      <div class="animation-engine-picker__toolbar">
        <div class="framesync-subtitle" style="margin:0;">Active layer</div>
        <button
          type="button"
          class="framesync-button framesync-button--compact animation-engine-picker__size"
          :title="videoStageSize === 'small' ? 'Small stage' : videoStageSize === 'medium' ? 'Medium stage' : 'Full stage'"
          @click="toggleVideoStageSize()"
        >
          <UiIcon
            :name="videoStageSize === 'small' ? 'size-small' : videoStageSize === 'medium' ? 'size-medium' : 'size-full'"
            aria-hidden="true"
          />
          Stage size
        </button>
      </div>

      <CommonVisualStrip v-if="activeAnimationPluginId" :app="app" />

      <AnimationEnginePluginPanel :app="app" />

      <CompositorControls :app="app" />
    </div>

    <p v-if="deforumPreloadStatus && isForgeAnimationLayerActive" class="live-engine-dock__preload-hint framesync-subtitle">
      {{ deforumPreloadStatus }}
    </p>
  </section>
</template>

<script>
import UiIcon from './UiIcon.vue'
import CommonVisualStrip from './animation-plugins/CommonVisualStrip.vue'
import AnimationEnginePluginPanel from './animation-plugins/AnimationEnginePluginPanel.vue'
import CompositorControls from './animation-plugins/CompositorControls.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'LiveEngineControlsDock',
  components: { UiIcon, CommonVisualStrip, AnimationEnginePluginPanel, CompositorControls },
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
