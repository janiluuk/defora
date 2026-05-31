<template>
  <div class="modulation-mappings">
    <div class="modulation-mappings__toolbar">
      <label class="framesync-checkbox modulation-mappings__filter">
        <input type="checkbox" data-testid="mappings-active-only" v-model="mappingsActiveOnly">
        Active only
      </label>
    </div>

    <div v-if="!(modulationMappingsVisibleGroups || []).length" class="live-hud-empty">
      {{ mappingsActiveOnly ? 'No active mappings in this view' : 'No parameters' }}
    </div>

    <template v-else>
      <div v-if="(modulationMappingsVisibleGroups || []).length > 1" class="sub-pills modulation-mappings__group-tabs">
        <button
          v-for="group in (modulationMappingsVisibleGroups || [])"
          :key="'map-grp-' + group.label"
          type="button"
          class="sub-pill"
          :class="{ active: mappingsActiveGroupLabel === group.label }"
          @click="mappingsGroupTab = group.label"
        >
          {{ group.shortLabel || group.label }}
        </button>
      </div>

      <div v-if="mappingsActiveGroup" class="modulation-mappings__rows">
        <div
          v-for="target in mappingsActiveGroup.items"
          :key="'map-row-' + target.key"
          class="modulation-mapping-row"
          :class="{ 'modulation-mapping-row--mapped': paramHasActiveMapping(target.key) }"
        >
          <div class="modulation-mapping-row__head">
            <span class="modulation-mapping-row__label">{{ target.label }}</span>
            <div v-if="paramMappingLabels(target.key).length" class="modulation-mapping-row__badges">
              <span
                v-for="(badge, bi) in paramMappingLabels(target.key)"
                :key="'map-badge-' + target.key + '-' + bi"
                class="modulation-route-pill"
              >
                {{ badge }}
              </span>
            </div>
          </div>

          <div class="modulation-mapping-row__control">
            <input
              type="range"
              class="framesync-input modulation-mapping-row__slider"
              :min="paramControlMeta(target.key).min"
              :max="paramControlMeta(target.key).max"
              :step="paramControlMeta(target.key).step"
              :value="paramControlMeta(target.key).value"
              @input="setLiveModValue(target.key, $event.target.value)"
            />
            <code class="modulation-mapping-row__value">{{ formatMappingParamValue(target.key) }}</code>
          </div>

          <div class="modulation-mapping-row__actions">
            <button
              type="button"
              class="framesync-button framesync-button--compact"
              data-testid="modulation-map-btn"
              @click="openModulationMapPicker(target.key)"
            >
              Map
            </button>
            <button
              v-if="paramHasActiveMapping(target.key)"
              type="button"
              class="framesync-button framesync-button--compact"
              title="Clear mappings"
              @click="clearParamMapping(target.key)"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </template>

    <div
      v-if="modulationMapPicker && modulationMapPicker.paramKey"
      class="modulation-map-picker"
      data-testid="modulation-map-picker"
      @click="onModulationMapPickerBackdropClick"
    >
      <div class="modulation-map-picker__dialog framesync-panel">
        <div class="framesync-header">
          <div class="framesync-title">
            Map <span class="framesync-accent">{{ modulationMapPickerParamLabel }}</span>
          </div>
          <button type="button" class="framesync-button framesync-button--compact" @click="closeModulationMapPicker">
            Close
          </button>
        </div>

        <template v-if="modulationMapPicker.step === 'lfo'">
          <div class="framesync-subtitle" style="margin-top:8px;">Choose an LFO to route this parameter.</div>
          <div class="modulation-map-picker__lfo-list">
            <button
              v-for="lfo in lfos"
              :key="'map-lfo-' + lfo.id"
              type="button"
              class="modulation-map-picker__lfo"
              :class="{ 'modulation-map-picker__lfo--on': lfo.on }"
              @click="mapModulationParamToLfo(lfo.id)"
            >
              <span class="modulation-map-picker__lfo-title">LFO {{ lfo.id }}</span>
              <span class="modulation-map-picker__lfo-meta">
                {{ lfo.on ? 'On' : 'Off' }} · {{ lfo.shape }} · {{ lfo.bpm }} BPM · ×{{ lfo.speed }}
              </span>
              <span v-if="(lfo.targets || []).includes(modulationMapPicker.paramKey)" class="modulation-route-pill">routed</span>
            </button>
          </div>
          <button type="button" class="framesync-button" style="margin-top:10px;" @click="modulationMapPicker.step = 'choose'">
            Back
          </button>
        </template>

        <template v-else>
          <div class="framesync-subtitle" style="margin-top:8px;">Assign to a live control in the bottom modulation drawer.</div>
          <div class="modulation-map-picker__slots">
            <button
              v-for="opt in liveModSlotPickerOptions"
              :key="'map-slot-' + opt.index"
              type="button"
              class="framesync-button modulation-map-picker__slot"
              :class="{ active: paramLiveModSlotIndex(modulationMapPicker.paramKey) === opt.index }"
              @click="assignModulationMapToSlot(opt.index)"
            >
              {{ opt.label }}
            </button>
          </div>
          <button
            type="button"
            class="framesync-button"
            style="margin-top:12px;"
            @click="modulationMapPicker.step = 'lfo'"
          >
            Map to LFO…
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'ModulationMappingsPanel',
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
