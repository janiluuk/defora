<template>
  <div class="rack motion-view">
    <div class="sub-pills motion-view__tabs">
      <button
        type="button"
        class="sub-pill"
        :class="{ active: currentSubTab.MOTION === 'PERFORMANCE' }"
        @click="switchSubTab('MOTION', 'PERFORMANCE')"
      >
        Performance
      </button>
      <button
        type="button"
        class="sub-pill"
        :class="{ active: currentSubTab.MOTION === 'SEQUENCER' }"
        @click="switchSubTab('MOTION', 'SEQUENCER')"
      >
        Sequencer
      </button>
    </div>

    <template v-if="currentSubTab.MOTION === 'PERFORMANCE'">
      <div class="framesync-panel motion-panel">
        <div class="framesync-header">
          <div class="framesync-title">Motion <span class="framesync-accent">Performance</span></div>
          <code class="motion-panel__readout">
            X {{ motionPadReadout.x.toFixed(2) }}
            · Y {{ motionPadReadout.y.toFixed(2) }}
            · Z {{ motionPadReadout.z.toFixed(2) }}
            · Zoom {{ motionPadReadout.zoom.toFixed(2) }}
          </code>
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

        <MotionPathPreview
          :deforum-settings="deforumSettings"
          :motion-values="motionPathLiveValues"
          :prefer-live-values="true"
        />

        <div class="motion-controls-row">
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
            <code class="motion-pad-hero__readout">
              X {{ motionPadReadout.x.toFixed(2) }} · Y {{ motionPadReadout.y.toFixed(2) }}
            </code>
          </div>

          <div class="motion-axis-sliders">
            <label class="motion-axis-slider">
              <span class="motion-axis-slider__label">Z</span>
              <input
                class="framesync-input motion-axis-slider__input"
                type="range"
                min="-10"
                max="10"
                step="0.05"
                :value="motionPadValues.translation_z"
                @input="setMotionAxis('translation_z', $event.target.value)"
              >
              <code class="motion-axis-slider__value">{{ motionPadReadout.z.toFixed(2) }}</code>
            </label>
            <label class="motion-axis-slider">
              <span class="motion-axis-slider__label">Zoom</span>
              <input
                class="framesync-input motion-axis-slider__input"
                type="range"
                min="0.5"
                max="2"
                step="0.01"
                :value="motionPadValues.zoom"
                @input="setMotionAxis('zoom', $event.target.value)"
              >
              <code class="motion-axis-slider__value">{{ motionPadReadout.zoom.toFixed(2) }}</code>
            </label>
          </div>
        </div>
      </div>
    </template>

    <GenerateView v-else-if="currentSubTab.MOTION === 'SEQUENCER'" :app="$props.app" />
  </div>
</template>

<script>
import UiIcon from '../UiIcon.vue'
import GenerateView from './GenerateView.vue'
import MotionPathPreview from '../MotionPathPreview.vue'
import { proxyAppView } from './app-view-proxy.js'

export default {
  name: 'MotionView',
  components: { UiIcon, GenerateView, MotionPathPreview },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
  computed: {
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
