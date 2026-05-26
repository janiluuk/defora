<template>
  <div class="rack motion-view">
    <div class="framesync-panel motion-panel">
      <div class="framesync-header">
        <div class="framesync-title">Motion <span class="framesync-accent">Performance</span></div>
        <code class="motion-panel__readout">X {{ motionPadReadout.x.toFixed(2) }} · Y {{ motionPadReadout.y.toFixed(2) }}</code>
      </div>
      <div class="motion-preset-row">
        <button
          v-for="presetName in Object.keys(motionPresets)"
          :key="presetName"
          class="framesync-button motion-preset-button"
          :class="{ active: motionSelectedPreset === presetName }"
          @click="applyMotionPresetAndSelect(presetName)"
        >
          {{ presetName }}
        </button>
      </div>
      <div
        class="motion-pad-hero"
        @mousedown="xyPadMouseDown"
        @mousemove="xyPadMouseMove"
        @mouseup="xyPadMouseUp"
        @mouseleave="xyPadMouseUp"
        @touchstart.prevent="xyPadMouseDown"
        @touchmove.prevent="xyPadMouseMove"
        @touchend.prevent="xyPadMouseUp"
      >
        <div class="motion-pad-hero__axis motion-pad-hero__axis--x">Pan X</div>
        <div class="motion-pad-hero__axis motion-pad-hero__axis--y">Pan Y</div>
        <div class="motion-pad-hero__crosshair motion-pad-hero__crosshair--x"></div>
        <div class="motion-pad-hero__crosshair motion-pad-hero__crosshair--y"></div>
        <div class="motion-pad-hero__puck" :style="motionPadPuckStyle"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './app-view-proxy.js'

export default {
  name: 'MotionView',
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
