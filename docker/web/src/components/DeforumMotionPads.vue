<template>
  <section class="deforum-motion-pads" data-testid="deforum-motion-pads">
    <div class="deforum-control-panel__section-head">
      <span class="framesync-subtitle deforum-control-panel__section-title">Camera XY</span>
      <code v-if="showReadout" class="deforum-motion-pads__readout">
        <template v-if="isDeforumMotion2d">
          Move {{ motionPadReadout.x.toFixed(2) }}, {{ motionPadReadout.y.toFixed(2) }}
          · Zoom {{ motionPadReadout.zoom.toFixed(2) }}
          · Tilt {{ motionPadReadout.lookX.toFixed(2) }}
        </template>
        <template v-else>
          X {{ motionPadReadout.x.toFixed(2) }}
          · Y {{ motionPadReadout.y.toFixed(2) }}
          · Z {{ motionPadReadout.z.toFixed(2) }}
          · Zoom {{ motionPadReadout.zoom.toFixed(2) }}
          · Tilt {{ motionPadReadout.tilt.toFixed(2) }}
        </template>
      </code>
    </div>

    <div v-if="isDeforumMotion2d" class="motion-controls-2d">
      <div class="motion-controls-2d__block">
        <div class="motion-controls-2d__label">Pan X / Y</div>
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
        <div class="motion-controls-2d__label">Angle / Zoom</div>
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
      <div v-if="showAxisSliders" class="motion-axis-sliders motion-axis-sliders--2d">
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

      <div v-if="showAxisSliders" class="motion-axis-sliders">
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
  </section>
</template>

<script>
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'DeforumMotionPads',
  props: {
    app: { type: Object, required: true },
    showReadout: { type: Boolean, default: true },
    showAxisSliders: { type: Boolean, default: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
