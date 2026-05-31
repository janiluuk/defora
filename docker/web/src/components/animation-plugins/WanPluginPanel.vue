<template>
  <div class="wan-engine-controls animation-plugin-panel" data-testid="wan-plugin-panel">
    <div class="framesync-subtitle">WAN Video · steer generation</div>
    <p class="framesync-subtitle wan-engine-controls__hint">
      Uses Deforum <code>animation_mode: Wan Video</code> on the Forge node. Prompts come from the Prompts tab.
    </p>
    <div class="wan-engine-controls__grid">
      <template v-for="field in wanEngineControlFields" :key="'wan-field-' + field.key">
        <div v-if="field.type === 'boolean'" class="wan-engine-controls__toggle">
          <label>
            <input
              type="checkbox"
              :checked="!!wanEngine[field.key]"
              :data-testid="'wan-field-' + field.key"
              @change="onWanEngineFieldChange(field.key, $event.target.checked, 'boolean')"
            >
            <span>{{ field.label }}</span>
          </label>
        </div>
        <div v-else class="framesync-stack wan-engine-controls__field">
          <div class="framesync-subtitle">{{ field.label }}</div>
          <select
            v-if="field.type === 'select'"
            class="framesync-select"
            :data-testid="'wan-field-' + field.key"
            :value="wanEngine[field.key]"
            @change="onWanEngineFieldChange(field.key, $event.target.value, 'select')"
          >
            <option v-for="opt in field.options" :key="field.key + '-' + opt" :value="opt">{{ opt }}</option>
          </select>
          <input
            v-else-if="field.type === 'number'"
            type="number"
            class="framesync-input"
            :data-testid="'wan-field-' + field.key"
            :min="field.min"
            :max="field.max"
            :step="field.step"
            :value="wanEngine[field.key]"
            @input="onWanEngineFieldChange(field.key, $event.target.value, 'number')"
          >
          <input
            v-else
            type="text"
            class="framesync-input"
            :data-testid="'wan-field-' + field.key"
            :value="wanEngine[field.key]"
            @input="onWanEngineFieldChange(field.key, $event.target.value, 'text')"
          >
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { proxyAppView } from '../views/app-view-proxy.mjs'

export default {
  name: 'WanPluginPanel',
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
