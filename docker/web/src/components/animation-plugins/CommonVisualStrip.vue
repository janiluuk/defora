<template>
  <section class="common-visual-strip" data-testid="common-visual-strip">
    <div class="deforum-control-panel__section-head">
      <span class="framesync-subtitle deforum-control-panel__section-title">Common visuals</span>
      <span v-if="resolvedPlugin" class="common-visual-strip__plugin">{{ resolvedPlugin.label }}</span>
    </div>
    <div class="deforum-macro-knobs__grid">
      <label
        v-for="item in stripItems"
        :key="'common-visual-' + item.paramId"
        class="deforum-macro-knob"
        :class="{ 'deforum-macro-knob--disabled': item.disabled }"
        :data-testid="'common-visual-' + item.paramId"
      >
        <span class="deforum-macro-knob__label">{{ item.label }}</span>
        <input
          type="range"
          class="framesync-input deforum-macro-knob__input"
          :min="item.min"
          :max="item.max"
          :step="item.step"
          :value="item.value"
          :disabled="item.disabled"
          @input="onCommonVisualInput(item.paramId, $event.target.value, resolvedPluginId)"
        >
        <code class="deforum-macro-knob__readout">{{ item.readout }}</code>
      </label>
    </div>
  </section>
</template>

<script>
import { pluginById } from '../../animation-plugins/registry.mjs'
import { proxyAppView } from '../views/app-view-proxy.mjs'

export default {
  name: 'CommonVisualStrip',
  props: {
    app: { type: Object, required: true },
    pluginId: { type: String, default: '' },
  },
  setup(props) {
    return proxyAppView(props)
  },
  computed: {
    resolvedPluginId() {
      return this.pluginId || this.activeAnimationPluginId || '';
    },
    resolvedPlugin() {
      return pluginById(this.resolvedPluginId);
    },
    stripItems() {
      return this.commonVisualItemsForPlugin(this.resolvedPluginId);
    },
  },
}
</script>
