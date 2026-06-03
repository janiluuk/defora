<template>
  <section class="engine-global-config framesync-panel" data-testid="engine-global-config">
    <div class="engine-global-config__head">
      <div class="framesync-subtitle engine-global-config__title">Global config</div>
      <p class="framesync-subtitle engine-global-config__hint">
        Resolution, sampling, and checkpoint — shared by Deforum and preview generation.
      </p>
    </div>
    <div class="engine-global-config__summary">
      <button
        type="button"
        class="engine-global-config__model"
        data-testid="engine-global-model-picker"
        :disabled="forge.switching"
        @click="openEngineModelPicker()"
      >
        <span class="framesync-subtitle">Checkpoint</span>
        <span class="engine-global-config__model-value">{{ engineCurrentModelName || 'Select model' }}</span>
      </button>
      <label v-if="lcmEngineEnabled" class="engine-global-config__lcm">
        <input
          type="checkbox"
          :checked="lcmEngineEnabled"
          data-testid="engine-global-lcm-toggle"
          @change="setLcmEngineEnabled($event.target.checked)"
        >
        <span>LCM engine</span>
      </label>
    </div>
    <div class="deforum-settings-grid engine-global-config__grid">
      <template v-for="field in (deforumGlobalEngineGroup && deforumGlobalEngineGroup.fields) || []" :key="'global-field-' + field.key">
        <label
          v-if="field.key !== 'sd_model_name'"
          class="deforum-field"
          :class="'deforum-field-' + (field.type || 'text')"
        >
          <span class="deforum-field-head">
            <span class="deforum-field-label">{{ field.label }}</span>
          </span>
          <div v-if="field.type === 'slider'" class="deforum-field-slider">
            <input
              type="range"
              class="framesync-input"
              :min="field.min"
              :max="field.max"
              :step="field.step || 1"
              :value="getDeforumField(field.key)"
              :disabled="lcmEngineEnabled && field.key === 'steps'"
              :data-testid="'engine-global-field-' + field.key"
              @input="onGlobalEngineFieldInput(field, $event.target.value)"
            >
            <span class="deforum-field-slider__value">{{ formatDeforumFieldValue(field, getDeforumField(field.key)) }}</span>
          </div>
          <select
            v-else-if="field.type === 'select'"
            class="framesync-select"
            :data-testid="'engine-global-field-' + field.key"
            :value="getDeforumField(field.key) ?? ''"
            @change="onGlobalEngineFieldInput(field, $event.target.value)"
          >
            <option
              v-for="opt in globalFieldOptions(field)"
              :key="field.key + '-opt-' + opt"
              :value="opt"
            >
              {{ opt }}
            </option>
          </select>
          <div v-else-if="field.key === 'seed'" class="deforum-seed-control" data-testid="engine-global-seed">
            <button
              type="button"
              class="chip chip--compact"
              :class="{ active: seedRandomEnabled }"
              data-testid="seed-random-toggle"
              @click="setSeedRandomEnabled(!seedRandomEnabled)"
            >
              Random
            </button>
            <input
              v-if="!seedRandomEnabled"
              type="number"
              class="framesync-input deforum-seed-control__input"
              min="0"
              :max="field.max"
              :step="field.step || 1"
              :value="getDeforumField(field.key)"
              @input="onDeforumSeedInput($event.target.value)"
            >
            <span v-else class="deforum-seed-control__hint">Random (−1)</span>
          </div>
          <input
            v-else-if="field.type === 'number'"
            type="number"
            class="framesync-input"
            :data-testid="'engine-global-field-' + field.key"
            :min="field.min"
            :max="field.max"
            :step="field.step || 1"
            :value="getDeforumField(field.key)"
            @input="onGlobalEngineFieldInput(field, $event.target.value)"
          >
        </label>
      </template>
    </div>
    <div class="engine-global-config__footer">
      <button
        type="button"
        class="framesync-button framesync-button--compact"
        :disabled="forge.switching || !engineCurrentModelName"
        @click="reapplyEngineModelDefaults()"
      >
        Optimize for model
      </button>
      <button
        type="button"
        class="framesync-button framesync-button--compact"
        data-testid="engine-global-open-settings"
        @click="openFullEngineSettings()"
      >
        Full engine settings →
      </button>
    </div>
  </section>
</template>

<script>
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'EngineGlobalConfigPanel',
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
  methods: {
    openFullEngineSettings() {
      this.switchTab('SETTINGS');
      this.switchSubTab('SETTINGS', 'ENGINE');
    },
    globalFieldOptions(field) {
      if (field.key === 'sampler') return this.deforumFieldOptions(field);
      if (field.key === 'scheduler') return this.deforumFieldOptions(field);
      return field.options || [];
    },
    onGlobalEngineFieldInput(field, rawValue) {
      if (!field?.key) return;
      if (field.key === 'sampler') {
        this.onEngineSamplerChange(rawValue);
        return;
      }
      if (field.key === 'scheduler') {
        this.onEngineSchedulerChange(rawValue);
        return;
      }
      if (field.key === 'steps') {
        this.onEngineStepsChange(rawValue);
        return;
      }
      if (field.key === 'W' || field.key === 'H') {
        this.onDeforumFieldInput(field.key, rawValue, 'number');
        const w = field.key === 'W' ? Number(rawValue) : Number(this.deforumSettings.W);
        const h = field.key === 'H' ? Number(rawValue) : Number(this.deforumSettings.H);
        if (Number.isFinite(w) && Number.isFinite(h)) {
          this.syncResolutionAcrossControls(w, h, { syncGpuModal: true });
        }
        return;
      }
      if (field.key === 'fps') {
        this.setGlobalFps(Number(rawValue));
        return;
      }
      const type = field.type === 'number' || field.type === 'slider' ? 'number' : 'text';
      this.onDeforumFieldInput(field.key, rawValue, type);
    },
  },
}
</script>
