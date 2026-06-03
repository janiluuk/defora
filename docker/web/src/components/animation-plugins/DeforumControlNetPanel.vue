<template>
  <div class="deforum-controlnet-panel animation-plugin-panel" data-testid="deforum-controlnet-panel">
    <div class="framesync-subtitle">Deforum ControlNet · CN1–CN5</div>
    <p class="framesync-subtitle deforum-controlnet-panel__hint">
      Drive Deforum batches and live renders with up to five ControlNet units. Pick a preprocessor plugin to show its controls.
    </p>

    <div class="deforum-controlnet-panel__toolbar">
      <button type="button" class="framesync-button framesync-button--compact" data-testid="deforum-cn-refresh" @click="loadControlNetModels(); loadControlNetModules()">
        Refresh models
      </button>
      <span v-if="cn.source" class="deforum-controlnet-panel__source">{{ cn.source }}</span>
    </div>

    <div class="chips deforum-controlnet-panel__units" role="tablist" aria-label="ControlNet units">
      <button
        v-for="unit in deforumCnUnits"
        :key="'deforum-cn-unit-' + unit"
        type="button"
        class="chip"
        :class="{ active: deforumActiveCnUnit === unit, 'chip--live': isDeforumCnUnitEnabled(unit) }"
        :data-testid="'deforum-cn-unit-' + unit"
        @click="deforumActiveCnUnit = unit; saveSessionState()"
      >
        CN{{ unit }}
      </button>
    </div>

    <div v-if="activeCnPreset" class="deforum-controlnet-panel__body">
      <div class="deforum-controlnet-panel__row">
        <label class="deforum-controlnet-panel__toggle">
          <input
            type="checkbox"
            :checked="isDeforumCnUnitEnabled(deforumActiveCnUnit)"
            :data-testid="'deforum-cn-enabled-' + deforumActiveCnUnit"
            @change="setDeforumCnEnabled(deforumActiveCnUnit, $event.target.checked)"
          >
          <span>Enabled</span>
        </label>
      </div>

      <div class="framesync-stack">
        <div class="framesync-subtitle">Preprocessor plugin</div>
        <select
          class="framesync-select"
          :value="activeCnPresetId"
          :data-testid="'deforum-cn-preset-' + deforumActiveCnUnit"
          @change="setDeforumCnModulePreset(deforumActiveCnUnit, $event.target.value)"
        >
          <option v-for="preset in cnModulePresets" :key="'cn-preset-' + preset.id" :value="preset.id">
            {{ preset.label }}
          </option>
        </select>
      </div>

      <div class="framesync-stack">
        <div class="framesync-subtitle">ControlNet model</div>
        <select
          class="framesync-select"
          :value="getDeforumCnField(deforumActiveCnUnit, 'model') || ''"
          :data-testid="'deforum-cn-model-' + deforumActiveCnUnit"
          @change="onDeforumCnField(deforumActiveCnUnit, 'model', $event.target.value, 'text')"
        >
          <option value="None">None</option>
          <option v-for="m in activeCnModelChoices" :key="'cn-model-' + m.id + m.name" :value="m.name">{{ m.name }}</option>
        </select>
      </div>

      <div class="slider-row">
        <span class="framesync-subtitle" style="margin:0;">Weight</span>
        <input
          class="framesync-input"
          type="range"
          min="0"
          max="2"
          step="0.01"
          :value="activeCnScalars.weight"
          :data-testid="'deforum-cn-weight-' + deforumActiveCnUnit"
          @input="setDeforumCnScalar(deforumActiveCnUnit, 'weight', $event.target.value)"
        >
        <span class="deforum-controlnet-panel__readout">{{ activeCnScalars.weight.toFixed(2) }}</span>
      </div>
      <div class="slider-row">
        <span class="framesync-subtitle" style="margin:0;">Guidance start</span>
        <input
          class="framesync-input"
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="activeCnScalars.start"
          @input="setDeforumCnScalar(deforumActiveCnUnit, 'guidance_start', $event.target.value)"
        >
        <span class="deforum-controlnet-panel__readout">{{ activeCnScalars.start.toFixed(2) }}</span>
      </div>
      <div class="slider-row">
        <span class="framesync-subtitle" style="margin:0;">Guidance end</span>
        <input
          class="framesync-input"
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="activeCnScalars.end"
          @input="setDeforumCnScalar(deforumActiveCnUnit, 'guidance_end', $event.target.value)"
        >
        <span class="deforum-controlnet-panel__readout">{{ activeCnScalars.end.toFixed(2) }}</span>
      </div>

      <template v-for="field in activeCnPluginFields" :key="'cn-plugin-' + deforumActiveCnUnit + field">
        <div v-if="cnPluginMeta(field).type === 'bool'" class="deforum-controlnet-panel__row">
          <label class="deforum-controlnet-panel__toggle">
            <input
              type="checkbox"
              :checked="!!getDeforumCnField(deforumActiveCnUnit, field)"
              @change="onDeforumCnField(deforumActiveCnUnit, field, $event.target.checked, 'bool')"
            >
            <span>{{ cnPluginMeta(field).label }}</span>
          </label>
        </div>
        <div v-else-if="cnPluginMeta(field).type === 'select'" class="framesync-stack">
          <div class="framesync-subtitle">{{ cnPluginMeta(field).label }}</div>
          <select
            class="framesync-select"
            :value="getDeforumCnField(deforumActiveCnUnit, field) || ''"
            @change="onDeforumCnField(deforumActiveCnUnit, field, $event.target.value, 'text')"
          >
            <option v-for="opt in cnPluginMeta(field).options || []" :key="field + opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
        <div v-else-if="cnPluginMeta(field).type === 'slider'" class="slider-row">
          <span class="framesync-subtitle" style="margin:0;">{{ cnPluginMeta(field).label }}</span>
          <input
            class="framesync-input"
            type="range"
            :min="cnPluginMeta(field).min"
            :max="cnPluginMeta(field).max"
            :step="cnPluginMeta(field).step || 1"
            :value="Number(getDeforumCnField(deforumActiveCnUnit, field) || cnPluginMeta(field).min)"
            @input="onDeforumCnField(deforumActiveCnUnit, field, $event.target.value, 'number')"
          >
          <span class="deforum-controlnet-panel__readout">{{ getDeforumCnField(deforumActiveCnUnit, field) }}</span>
        </div>
        <div v-else class="framesync-stack">
          <div class="framesync-subtitle">{{ cnPluginMeta(field).label }}</div>
          <input
            class="framesync-input"
            type="text"
            :value="getDeforumCnField(deforumActiveCnUnit, field) || ''"
            :placeholder="cnPluginMeta(field).hint || ''"
            :data-testid="'deforum-cn-field-' + deforumActiveCnUnit + '-' + field"
            @change="onDeforumCnField(deforumActiveCnUnit, field, $event.target.value, 'text')"
          >
        </div>
      </template>

      <div class="deforum-controlnet-panel__footer">
        <input
          ref="cnImageInput"
          type="file"
          accept="image/*"
          class="deforum-controlnet-panel__file-input"
          @change="onDeforumCnImageSelected"
        >
        <button type="button" class="framesync-button framesync-button--compact" @click="pickDeforumCnImage(deforumActiveCnUnit)">
          Upload guide image
        </button>
        <button type="button" class="framesync-button framesync-button--compact" @click="pushDeforumCnUnitToMediator(deforumActiveCnUnit)">
          Push to live
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { proxyAppView } from '../views/app-view-proxy.mjs'
import {
  CN_MODULE_PRESETS,
  CN_PLUGIN_FIELD_META,
  pluginFieldsForPreset,
  modulePresetById,
} from '../../shared/deforum-controlnet-config.mjs'

export default {
  name: 'DeforumControlNetPanel',
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
  computed: {
    cnModulePresets() {
      return CN_MODULE_PRESETS;
    },
    activeCnPresetId() {
      return this.inferDeforumCnPresetId(this.deforumActiveCnUnit);
    },
    activeCnPreset() {
      return modulePresetById(this.activeCnPresetId);
    },
    activeCnPluginFields() {
      return pluginFieldsForPreset(this.activeCnPreset);
    },
    activeCnModelChoices() {
      return this.deforumCnModelChoices(this.deforumActiveCnUnit);
    },
    activeCnScalars() {
      return {
        weight: this.getDeforumCnScalar(this.deforumActiveCnUnit, 'weight', 1),
        start: this.getDeforumCnScalar(this.deforumActiveCnUnit, 'guidance_start', 0),
        end: this.getDeforumCnScalar(this.deforumActiveCnUnit, 'guidance_end', 1),
      };
    },
  },
  methods: {
    cnPluginMeta(field) {
      return CN_PLUGIN_FIELD_META[field] || { label: field, type: 'text' };
    },
    pickDeforumCnImage(unit) {
      this._deforumCnUploadUnit = unit;
      const input = this.$refs.cnImageInput;
      if (input) input.click();
    },
    onDeforumCnImageSelected(evt) {
      const file = evt.target.files && evt.target.files[0];
      evt.target.value = '';
      if (!file || !this._deforumCnUploadUnit) return;
      this.uploadDeforumCnGuideImage(this._deforumCnUploadUnit, file);
    },
  },
}
</script>
