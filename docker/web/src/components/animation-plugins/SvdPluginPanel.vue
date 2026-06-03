<template>
  <div class="svd-engine-controls animation-plugin-panel" data-testid="svd-plugin-panel">
    <div class="framesync-subtitle">SVD · Stable Video Diffusion</div>
    <p class="framesync-subtitle svd-engine-controls__hint">
      Uses Forge <code>sd_forge_svd</code> with Img2Vid-XT-1.1 defaults (1024×576, 25 frames, motion 127, 6 fps).
      Upload or generate an init image at the target resolution.
    </p>

    <div v-if="svdEngineSummary" class="svd-engine-controls__badge" data-testid="svd-support-badge">
      <span class="chip chip--live">{{ svdEngineSummary.modelFamily }}</span>
      <span class="framesync-subtitle">{{ svdEngineSummary.resolution }} · {{ svdEngineSummary.frames }}f @ {{ svdEngineSummary.fps }}fps</span>
    </div>

    <div class="svd-engine-controls__presets">
      <div class="framesync-subtitle">Preset</div>
      <div class="chips">
        <button
          v-for="name in svdPresetNames"
          :key="'svd-preset-' + name"
          type="button"
          class="chip"
          :class="{ active: svdEngine.svd_preset === name, 'chip--live': name === 'XT 1.1' }"
          :data-testid="'svd-preset-' + name.replace(/\s+/g, '-').toLowerCase()"
          @click="applySvdPreset(name)"
        >
          {{ name }}
        </button>
      </div>
    </div>

    <div class="svd-engine-controls__init">
      <div class="framesync-subtitle">Init image (img2vid)</div>
      <div class="wan-engine-controls__init-actions">
        <button
          type="button"
          class="framesync-button framesync-button--compact"
          data-testid="svd-init-from-prompts"
          @click="applySvdInitFromPromptsImage"
        >
          Use Prompts → IMAGE input
        </button>
        <button
          type="button"
          class="framesync-button framesync-button--compact"
          :disabled="!svdEngine.svd_init_image"
          data-testid="svd-init-clear"
          @click="clearSvdInitImage"
        >
          Clear init
        </button>
      </div>
      <p v-if="!svdEngine.svd_init_image" class="framesync-subtitle svd-engine-controls__init-hint">
        No init image — preview generates a still at {{ svdEngine.width }}×{{ svdEngine.height }}, then runs SVD.
      </p>
    </div>

    <div class="wan-engine-controls__grid">
      <template v-for="field in svdEngineControlFields" :key="'svd-field-' + field.key">
        <div v-if="field.key === 'svd_resolution'" class="framesync-stack wan-engine-controls__field">
          <div class="framesync-subtitle">{{ field.label }}</div>
          <select
            class="framesync-select"
            data-testid="svd-field-svd_resolution"
            :value="svdEngine.svd_resolution"
            @change="onSvdResolutionPresetChange($event.target.value)"
          >
            <option v-for="opt in field.options" :key="'svd-res-' + opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
        <div v-else-if="field.type === 'select'" class="framesync-stack wan-engine-controls__field">
          <div class="framesync-subtitle">{{ field.label }}</div>
          <select
            class="framesync-select"
            :data-testid="'svd-field-' + field.key"
            :value="svdEngine[field.key]"
            @change="onSvdEngineFieldChange(field.key, $event.target.value, 'select')"
          >
            <option v-for="opt in field.options" :key="field.key + '-' + opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
        <div v-else class="framesync-stack wan-engine-controls__field">
          <div class="framesync-subtitle">{{ field.label }}</div>
          <input
            v-if="field.type === 'number'"
            type="number"
            class="framesync-input"
            :data-testid="'svd-field-' + field.key"
            :min="field.min"
            :max="field.max"
            :step="field.step"
            :value="svdEngine[field.key]"
            @input="onSvdEngineFieldChange(field.key, $event.target.value, 'number')"
          >
          <input
            v-else
            type="text"
            class="framesync-input"
            :data-testid="'svd-field-' + field.key"
            :value="svdEngine[field.key]"
            @input="onSvdEngineFieldChange(field.key, $event.target.value, 'text')"
          >
          <p v-if="field.hint" class="framesync-subtitle svd-engine-controls__field-hint">{{ field.hint }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { proxyAppView } from '../views/app-view-proxy.mjs'

export default {
  name: 'SvdPluginPanel',
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
