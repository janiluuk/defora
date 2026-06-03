<template>
  <div class="engine-settings-slots" data-testid="engine-settings-slots">
    <div class="engine-settings-slots__head">
      <span class="framesync-subtitle engine-settings-slots__label">Engine snapshots</span>
      <span class="engine-settings-slots__hint">Shift+click to overwrite</span>
    </div>
    <div class="engine-settings-slots__row" role="group" aria-label="Engine settings snapshot slots">
      <button
        v-for="(_, index) in engineSettingsSlots"
        :key="'engine-settings-slot-' + index"
        type="button"
        class="engine-settings-slots__slot"
        :class="{
          'engine-settings-slots__slot--empty': !engineSettingsSlots[index],
          'engine-settings-slots__slot--filled': !!engineSettingsSlots[index],
        }"
        :data-testid="'engine-settings-slot-' + index"
        :title="engineSettingsSlotTitle(engineSettingsSlots[index], index)"
        @click="onEngineSettingsSlotClick(index, $event)"
      >
        <span v-if="!engineSettingsSlots[index]" class="engine-settings-slots__plus" aria-hidden="true">+</span>
        <span v-else class="engine-settings-slots__label-text">
          <span class="engine-settings-slots__index">{{ index + 1 }}</span>
          <span class="engine-settings-slots__name">{{ engineSettingsSlotLabel(engineSettingsSlots[index]) }}</span>
        </span>
      </button>
    </div>
    <div v-if="engineSettingsSlotStatus" class="framesync-subtitle engine-settings-slots__status">
      {{ engineSettingsSlotStatus }}
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './views/app-view-proxy.mjs'
import { engineSettingsSlotLabel, engineSettingsSlotTitle } from '../shared/engine-settings-snapshot.mjs'

export default {
  name: 'EngineSettingsSlotsBar',
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
  methods: {
    engineSettingsSlotLabel,
    engineSettingsSlotTitle,
  },
}
</script>
