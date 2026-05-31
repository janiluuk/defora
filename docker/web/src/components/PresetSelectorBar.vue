<template>
  <div class="preset-selector-bar" data-testid="preset-selector-bar">
    <div class="framesync-subtitle preset-selector-bar__label">Preset</div>
    <div class="preset-selector-bar__row">
      <select
        class="framesync-select preset-selector-bar__select"
        data-testid="preset-select"
        :value="currentPreset || ''"
        @change="onPresetChange($event.target.value)"
      >
        <option value="">— select —</option>
        <option v-for="name in availablePresets" :key="'preset-opt-' + name" :value="name">{{ name }}</option>
      </select>
      <input
        class="framesync-input preset-selector-bar__name"
        data-testid="preset-name-input"
        v-model="newPresetName"
        placeholder="New name"
      >
      <button
        type="button"
        class="framesync-button framesync-button--compact"
        data-testid="preset-add"
        title="Save current state as preset"
        @click="saveCurrentPreset"
      >
        + Add
      </button>
      <button
        type="button"
        class="framesync-button framesync-button--compact framesync-button--danger"
        data-testid="preset-delete"
        title="Delete selected preset"
        :disabled="!currentPreset"
        @click="deletePreset(currentPreset)"
      >
        Delete
      </button>
    </div>
    <div v-if="presetStatus" class="framesync-subtitle preset-selector-bar__status">{{ presetStatus }}</div>
  </div>
</template>

<script>
import { inject } from 'vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'PresetSelectorBar',
  props: {
    app: { type: Object, default: null },
  },
  setup(props) {
    const deforaApp = inject('deforaApp', null)
    const app = props.app || deforaApp
    return proxyAppView({ app });
  },
  mounted() {
    if (!this.availablePresets.length) {
      this.refreshPresets()
    }
  },
  methods: {
    onPresetChange(name) {
      if (name) {
        this.loadPreset(name)
      }
    },
  },
}
</script>
