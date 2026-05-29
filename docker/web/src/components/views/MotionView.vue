<template>
  <div class="rack motion-view" data-testid="motion-controls-panel">
    <div class="framesync-panel motion-panel">
      <div class="framesync-header">
        <div class="framesync-title">Motion <span class="framesync-accent">Performance</span></div>
        <div class="motion-panel__header-actions">
          <button
            type="button"
            class="framesync-button framesync-button--compact"
            data-testid="reset-motion-default"
            title="Reset all motion axes to zero"
            @click="resetMotionToDefault"
          >
            ↺ Reset to default
          </button>
        </div>
      </div>

      <div class="motion-preset-toolbar">
        <select
          class="framesync-select motion-preset-select"
          v-model="motionSelectedPreset"
        >
          <optgroup label="Built-in">
            <option v-for="presetName in Object.keys(motionPresets)" :key="presetName" :value="presetName">
              {{ presetName }}
            </option>
          </optgroup>
          <optgroup v-if="savedMotionPresetNames.length" label="Saved">
            <option v-for="presetName in savedMotionPresetNames" :key="`saved-${presetName}`" :value="presetName">
              {{ presetName }}
            </option>
          </optgroup>
        </select>
        <button
          type="button"
          class="framesync-button motion-preset-icon-btn"
          title="Load preset"
          aria-label="Load preset"
          @click="loadSelectedMotionPreset"
        >
          <UiIcon name="load" />
        </button>
        <button
          type="button"
          class="framesync-button motion-preset-icon-btn"
          title="Save current motion"
          aria-label="Save current motion"
          @click="saveCurrentMotionStyle"
        >
          <UiIcon name="save" />
        </button>
      </div>

      <div class="motion-preset-row">
        <button
          v-for="name in motionQuickPresets"
          :key="name"
          type="button"
          class="chip"
          :class="{ active: motionSelectedPreset === name }"
          @click="applyMotionPresetAndSelect(name)"
        >
          {{ name }}
        </button>
      </div>

      <div class="motion-smoothness" data-testid="motion-smoothness">
        <label class="motion-smoothness__toggle">
          <input
            type="checkbox"
            data-testid="motion-smoothness-enabled"
            v-model="motionSmoothness.enabled"
            @change="saveSessionState"
          >
          <span>Smoothness</span>
        </label>
        <label
          v-if="motionSmoothness.enabled"
          class="motion-smoothness__frames"
        >
          <span>Frames</span>
          <input
            class="framesync-input motion-smoothness__frames-input"
            type="number"
            min="1"
            max="999"
            step="1"
            data-testid="motion-smoothness-frames"
            :value="motionSmoothness.frames"
            @change="onMotionSmoothnessFramesChange($event.target.value)"
          >
        </label>
        <span v-if="motionSmoothness.enabled" class="motion-smoothness__hint">
          Ramp schedule changes over the frame count from the current playhead or selected frame.
        </span>
      </div>

      <MotionPathPreview
        v-if="!isDeforumMotion2d"
        :deforum-settings="deforumSettings"
        :motion-values="motionPathLiveValues"
        :prefer-live-values="true"
      />

      <DeforumControlPanel
        :app="app"
        :show-settings="false"
        motion-pads-show-readout
      />
    </div>
  </div>
</template>

<script>
import UiIcon from '../UiIcon.vue'
import MotionPathPreview from '../MotionPathPreview.vue'
import DeforumControlPanel from '../DeforumControlPanel.vue'
import { proxyAppView } from './app-view-proxy.mjs'

export default {
  name: 'MotionView',
  components: { UiIcon, MotionPathPreview, DeforumControlPanel },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
  computed: {
    motionQuickPresets() {
      return ['Static', 'Orbit', 'Tunnel', 'Handheld', 'Chaos'];
    },
    motionPathLiveValues() {
      return {
        translation_x: Number(this.motionPadValues?.translation_x) || 0,
        translation_y: Number(this.motionPadValues?.translation_y) || 0,
        translation_z: Number(this.motionPadValues?.translation_z) || 0,
      };
    },
  },
}
</script>
