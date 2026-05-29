<template>
  <div class="animatelcm-plugin-panel animation-plugin-panel" data-testid="animatelcm-plugin-panel">
    <div class="framesync-subtitle">AnimateLCM · fast temporal generation</div>
    <p class="framesync-subtitle animatelcm-plugin-panel__hint">
      Runs as its own Forge animation mode. Independent from Settings → LCM Engine (global sampling shortcut).
    </p>

    <div class="animatelcm-plugin-panel__motion-type">
      <div class="framesync-subtitle">Motion type</div>
      <div class="chips">
        <button
          v-for="t in animateLcmMotionTypes"
          :key="'alcm-type-' + t.id"
          type="button"
          class="chip"
          :class="{ active: animateLcmEngine.motion_type === t.id }"
          :data-testid="'animatelcm-motion-type-' + t.id"
          @click="setAnimateLcmMotionType(t.id)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <div class="motion-preset-row">
      <button
        v-for="name in motionQuickPresets"
        :key="'alcm-preset-' + name"
        type="button"
        class="chip"
        :class="{ active: animateLcmEngine.motion_preset === name }"
        @click="applyAnimateLcmMotionPreset(name)"
      >
        {{ name }}
      </button>
    </div>

    <div class="wan-engine-controls__grid">
      <template v-for="field in animateLcmControlFields" :key="'alcm-field-' + field.key">
        <div v-if="field.key === 'motion_type' || field.key === 'motion_preset'" />
        <div v-else class="framesync-stack wan-engine-controls__field">
          <div class="framesync-subtitle">{{ field.label }}</div>
          <input
            type="number"
            class="framesync-input"
            :data-testid="'animatelcm-field-' + field.key"
            :min="field.min"
            :max="field.max"
            :step="field.step"
            :value="animateLcmEngine[field.key]"
            @input="onAnimateLcmFieldChange(field.key, $event.target.value, 'number')"
          >
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { proxyAppView } from '../views/app-view-proxy.mjs'

export default {
  name: 'AnimateLcmPluginPanel',
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
  computed: {
    motionQuickPresets() {
      return ['Static', 'Orbit', 'Tunnel', 'Handheld', 'Chaos'];
    },
  },
}
</script>
