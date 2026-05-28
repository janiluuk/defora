<template>
  <div class="rack motion-view" data-testid="motion-controls-panel">
      <div class="framesync-panel motion-panel">
        <div class="framesync-header">
          <div class="framesync-title">Motion <span class="framesync-accent">Performance</span></div>
          <div class="motion-panel__header-actions">
            <code class="motion-panel__readout">
              <template v-if="isDeforumMotion2d">
                Move {{ motionPadReadout.x.toFixed(2) }}, {{ motionPadReadout.y.toFixed(2) }}
                · Look {{ motionPadReadout.lookX.toFixed(2) }}, {{ motionPadReadout.lookY.toFixed(2) }}
              </template>
              <template v-else>
                X {{ motionPadReadout.x.toFixed(2) }}
                · Y {{ motionPadReadout.y.toFixed(2) }}
                · Z {{ motionPadReadout.z.toFixed(2) }}
                · Zoom {{ motionPadReadout.zoom.toFixed(2) }}
              </template>
            </code>
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

        <div v-if="isDeforumMotion2d" class="motion-controls-2d">
          <div class="motion-controls-2d__block">
            <div class="motion-controls-2d__label">Move controls</div>
            <div
              class="motion-pad-hero motion-pad-hero--move"
              data-testid="motion-pad-move"
              @mousedown="motionPadMouseDown($event, 'move')"
              @mousemove="motionPadMouseMove($event, 'move')"
              @mouseup="motionPadMouseUp"
              @mouseleave="motionPadMouseUp"
              @touchstart.prevent="motionPadMouseDown($event, 'move')"
              @touchmove.prevent="motionPadMouseMove($event, 'move')"
              @touchend.prevent="motionPadMouseUp"
            >
              <div class="motion-pad-hero__axis motion-pad-hero__axis--x">X</div>
              <div class="motion-pad-hero__axis motion-pad-hero__axis--y">Y</div>
              <div class="motion-pad-hero__crosshair motion-pad-hero__crosshair--x"></div>
              <div class="motion-pad-hero__crosshair motion-pad-hero__crosshair--y"></div>
              <div class="motion-pad-hero__puck" :style="motionPadPuckStyle"></div>
              <code class="motion-pad-hero__readout">
                {{ motionPadReadout.x.toFixed(2) }}, {{ motionPadReadout.y.toFixed(2) }}
              </code>
            </div>
          </div>
          <div class="motion-controls-2d__block">
            <div class="motion-controls-2d__label">Look controls</div>
            <div
              class="motion-pad-hero motion-pad-hero--look"
              data-testid="motion-pad-look"
              @mousedown="motionPadMouseDown($event, 'look')"
              @mousemove="motionPadMouseMove($event, 'look')"
              @mouseup="motionPadMouseUp"
              @mouseleave="motionPadMouseUp"
              @touchstart.prevent="motionPadMouseDown($event, 'look')"
              @touchmove.prevent="motionPadMouseMove($event, 'look')"
              @touchend.prevent="motionPadMouseUp"
            >
              <div class="motion-pad-hero__axis motion-pad-hero__axis--x">Angle</div>
              <div class="motion-pad-hero__axis motion-pad-hero__axis--y">Zoom</div>
              <div class="motion-pad-hero__crosshair motion-pad-hero__crosshair--x"></div>
              <div class="motion-pad-hero__crosshair motion-pad-hero__crosshair--y"></div>
              <div class="motion-pad-hero__puck motion-pad-hero__puck--look" :style="motionLookPadPuckStyle"></div>
              <code class="motion-pad-hero__readout">
                {{ motionPadReadout.lookX.toFixed(2) }}, {{ motionPadReadout.lookY.toFixed(2) }}
              </code>
            </div>
          </div>
        </div>

        <div v-else class="motion-controls-row">
          <div
            class="motion-pad-hero motion-pad-hero--move"
            data-testid="motion-pad-move"
            @mousedown="motionPadMouseDown($event, 'move')"
            @mousemove="motionPadMouseMove($event, 'move')"
            @mouseup="motionPadMouseUp"
            @mouseleave="motionPadMouseUp"
            @touchstart.prevent="motionPadMouseDown($event, 'move')"
            @touchmove.prevent="motionPadMouseMove($event, 'move')"
            @touchend.prevent="motionPadMouseUp"
          >
            <div class="motion-pad-hero__axis motion-pad-hero__axis--x">X</div>
            <div class="motion-pad-hero__axis motion-pad-hero__axis--y">Y</div>
            <div class="motion-pad-hero__crosshair motion-pad-hero__crosshair--x"></div>
            <div class="motion-pad-hero__crosshair motion-pad-hero__crosshair--y"></div>
            <div class="motion-pad-hero__puck" :style="motionPadPuckStyle"></div>
            <code class="motion-pad-hero__readout">
              {{ motionPadReadout.x.toFixed(2) }}, {{ motionPadReadout.y.toFixed(2) }}
            </code>
          </div>
        </div>
        <div class="motion-controls-2d__block">
          <div class="motion-controls-2d__label">Look controls</div>
          <div
            class="motion-pad-hero motion-pad-hero--look"
            data-testid="motion-pad-look"
            @mousedown="motionPadMouseDown($event, 'look')"
            @mousemove="motionPadMouseMove($event, 'look')"
            @mouseup="motionPadMouseUp"
            @mouseleave="motionPadMouseUp"
            @touchstart.prevent="motionPadMouseDown($event, 'look')"
            @touchmove.prevent="motionPadMouseMove($event, 'look')"
            @touchend.prevent="motionPadMouseUp"
          >
            <div class="motion-pad-hero__axis motion-pad-hero__axis--x">Angle</div>
            <div class="motion-pad-hero__axis motion-pad-hero__axis--y">Zoom</div>
            <div class="motion-pad-hero__crosshair motion-pad-hero__crosshair--x"></div>
            <div class="motion-pad-hero__crosshair motion-pad-hero__crosshair--y"></div>
            <div class="motion-pad-hero__puck motion-pad-hero__puck--look" :style="motionLookPadPuckStyle"></div>
            <code class="motion-pad-hero__readout">
              {{ motionPadReadout.lookX.toFixed(2) }}, {{ motionPadReadout.lookY.toFixed(2) }}
            </code>
          </div>
        </div>
        <div class="motion-axis-sliders motion-axis-sliders--2d">
          <label class="motion-axis-slider">
            <span class="motion-axis-slider__label">Zoom</span>
            <input
              class="framesync-input motion-axis-slider__input"
              type="range"
              min="-1"
              max="1"
              step="0.01"
              data-testid="motion-zoom-slider"
              :value="motionPadValues.zoom"
              @input="motionSmoothnessActive() ? previewMotionAxis('zoom', $event.target.value) : setMotionAxis('zoom', $event.target.value)"
              @change="motionSmoothnessActive() && setMotionAxis('zoom', $event.target.value)"
            >
            <code class="motion-axis-slider__value">{{ motionPadReadout.zoom.toFixed(2) }}</code>
          </label>
          <label class="motion-axis-slider">
            <span class="motion-axis-slider__label">Tilt</span>
            <input
              class="framesync-input motion-axis-slider__input"
              type="range"
              min="-1"
              max="1"
              step="0.01"
              data-testid="motion-tilt-slider"
              :value="motionPadValues.look_x"
              @input="motionSmoothnessActive() ? previewMotionAxis('angle', $event.target.value) : setMotionAxis('angle', $event.target.value)"
              @change="motionSmoothnessActive() && setMotionAxis('angle', $event.target.value)"
            >
            <code class="motion-axis-slider__value">{{ motionPadReadout.lookX.toFixed(2) }}</code>
          </label>
        </div>
      </div>

      <div v-else class="motion-controls-row">
        <div
          class="motion-pad-hero motion-pad-hero--move"
          data-testid="motion-pad-move"
          @mousedown="motionPadMouseDown($event, 'move')"
          @mousemove="motionPadMouseMove($event, 'move')"
          @mouseup="motionPadMouseUp"
          @mouseleave="motionPadMouseUp"
          @touchstart.prevent="motionPadMouseDown($event, 'move')"
          @touchmove.prevent="motionPadMouseMove($event, 'move')"
          @touchend.prevent="motionPadMouseUp"
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
              @input="motionSmoothnessActive() ? previewMotionAxis('translation_z', $event.target.value) : setMotionAxis('translation_z', $event.target.value)"
              @change="motionSmoothnessActive() && setMotionAxis('translation_z', $event.target.value)"
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
              data-testid="motion-zoom-slider"
              :value="motionPadValues.zoom"
              @input="motionSmoothnessActive() ? previewMotionAxis('zoom', $event.target.value) : setMotionAxis('zoom', $event.target.value)"
              @change="motionSmoothnessActive() && setMotionAxis('zoom', $event.target.value)"
            >
            <code class="motion-axis-slider__value">{{ motionPadReadout.zoom.toFixed(2) }}</code>
          </label>
          <label class="motion-axis-slider">
            <span class="motion-axis-slider__label">Tilt</span>
            <input
              class="framesync-input motion-axis-slider__input"
              type="range"
              min="-180"
              max="180"
              step="0.5"
              data-testid="motion-tilt-slider"
              :value="motionPadValues.rotation_z"
              @input="motionSmoothnessActive() ? previewMotionAxis('rotation_z', $event.target.value) : setMotionAxis('rotation_z', $event.target.value)"
              @change="motionSmoothnessActive() && setMotionAxis('rotation_z', $event.target.value)"
            >
            <code class="motion-axis-slider__value">{{ motionPadReadout.tilt.toFixed(2) }}</code>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UiIcon from '../UiIcon.vue'
import MotionPathPreview from '../MotionPathPreview.vue'
import { proxyAppView } from './app-view-proxy.mjs'

export default {
  name: 'MotionView',
  components: { UiIcon, MotionPathPreview },
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
