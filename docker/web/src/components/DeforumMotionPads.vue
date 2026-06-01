<template>
  <section
    class="deforum-motion-pads"
    :class="{ 'deforum-motion-pads--hero': hero, 'deforum-motion-pads--compact': compact }"
    data-testid="deforum-motion-pads"
  >
    <div v-if="!compact" class="deforum-control-panel__section-head">
      <span class="framesync-subtitle deforum-control-panel__section-title">Camera XY</span>
      <code v-if="showReadout && !hero" class="deforum-motion-pads__readout motion-readout">
        <template v-if="isDeforumMotion2d">
          Move {{ motionPadReadout.x.toFixed(2) }}, {{ motionPadReadout.y.toFixed(2) }},
          Zoom {{ motionPadReadout.zoom.toFixed(2) }},
          Tilt {{ motionPadReadout.lookX.toFixed(2) }}
        </template>
        <template v-else>
          X {{ motionPadReadout.x.toFixed(2) }},
          Y {{ motionPadReadout.y.toFixed(2) }},
          Z {{ motionPadReadout.z.toFixed(2) }},
          Zoom {{ motionPadReadout.zoom.toFixed(2) }},
          Tilt {{ motionPadReadout.tilt.toFixed(2) }}
        </template>
      </code>
    </div>

    <div class="motion-controls-compact" data-testid="motion-controls-compact">
      <XYController
        v-for="slot in motionXYPadSlots"
        :key="slot.id"
        compact
        :x="motionAxisTargetValue(slot.xAxis)"
        :y="motionAxisTargetValue(slot.yAxis)"
        :range-x="motionAxisRangeForKey(slot.xAxis)"
        :range-y="motionAxisRangeForKey(slot.yAxis)"
        :x-axis="slot.xAxis"
        :y-axis="slot.yAxis"
        :axis-options="motionAxisOptionsList"
        :variant="slot.id === 'look' ? 'look' : 'move'"
        :test-id="slot.id === 'primary' ? 'motion-pad-move' : slot.id === 'look' ? 'motion-pad-look' : ('motion-pad-' + slot.id)"
        @update:x-axis="setMotionXYPadAxis(slot.id, 'x', $event)"
        @update:y-axis="setMotionXYPadAxis(slot.id, 'y', $event)"
        @drag-start="motionPadDragStart(slot.id)"
        @input="applyMotionPadAxisValues($event.xAxis || slot.xAxis, $event.yAxis || slot.yAxis, $event.x, $event.y, { previewOnly: $event.dragging && motionSmoothnessActive() })"
        @release="motionPadMouseUp(slot.id)"
      />
    </div>

    <div v-if="showAxisSliders && isDeforumMotion2d" class="motion-axis-sliders motion-axis-sliders--2d">
      <label class="motion-axis-slider">
        <span class="motion-axis-slider__label">Zoom</span>
        <input
          class="framesync-input motion-axis-slider__input"
          type="range"
          min="-1"
          max="1"
          step="0.01"
          data-testid="motion-zoom-slider"
          :value="motionAxisTargetValue('zoom')"
          @input="motionSmoothnessActive() ? previewMotionAxis('zoom', $event.target.value) : setMotionAxis('zoom', $event.target.value)"
          @change="motionSmoothnessActive() && setMotionAxis('zoom', $event.target.value)"
        >
        <code class="motion-axis-slider__value motion-readout">{{ motionAxisTargetValue('zoom').toFixed(2) }}</code>
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
          :value="motionAxisTargetValue('angle')"
          @input="motionSmoothnessActive() ? previewMotionAxis('angle', $event.target.value) : setMotionAxis('angle', $event.target.value)"
          @change="motionSmoothnessActive() && setMotionAxis('angle', $event.target.value)"
        >
        <code class="motion-axis-slider__value motion-readout">{{ motionAxisTargetValue('angle').toFixed(2) }}</code>
      </label>
    </div>

    <div v-else-if="showAxisSliders" class="motion-axis-sliders">
      <label class="motion-axis-slider">
        <span class="motion-axis-slider__label">Z</span>
        <input
          class="framesync-input motion-axis-slider__input"
          type="range"
          min="-10"
          max="10"
          step="0.05"
          :value="motionAxisTargetValue('translation_z')"
          @input="motionSmoothnessActive() ? previewMotionAxis('translation_z', $event.target.value) : setMotionAxis('translation_z', $event.target.value)"
          @change="motionSmoothnessActive() && setMotionAxis('translation_z', $event.target.value)"
        >
        <code class="motion-axis-slider__value motion-readout">{{ motionAxisTargetValue('translation_z').toFixed(2) }}</code>
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
          :value="motionAxisTargetValue('zoom')"
          @input="motionSmoothnessActive() ? previewMotionAxis('zoom', $event.target.value) : setMotionAxis('zoom', $event.target.value)"
          @change="motionSmoothnessActive() && setMotionAxis('zoom', $event.target.value)"
        >
        <code class="motion-axis-slider__value motion-readout">{{ motionAxisTargetValue('zoom').toFixed(2) }}</code>
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
          :value="motionAxisTargetValue('rotation_z')"
          @input="motionSmoothnessActive() ? previewMotionAxis('rotation_z', $event.target.value) : setMotionAxis('rotation_z', $event.target.value)"
          @change="motionSmoothnessActive() && setMotionAxis('rotation_z', $event.target.value)"
        >
        <code class="motion-axis-slider__value motion-readout">{{ motionAxisTargetValue('rotation_z').toFixed(2) }}</code>
      </label>
    </div>
  </section>
</template>

<script>
import XYController from './XYController.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'DeforumMotionPads',
  components: { XYController },
  props: {
    app: { type: Object, required: true },
    hero: { type: Boolean, default: false },
    compact: { type: Boolean, default: true },
    showReadout: { type: Boolean, default: true },
    showAxisSliders: { type: Boolean, default: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
