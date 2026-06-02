<template>
  <div class="wan-engine-controls animation-plugin-panel" data-testid="wan-plugin-panel">
    <div class="framesync-subtitle">WAN Video · steer generation</div>
    <p class="framesync-subtitle wan-engine-controls__hint">
      Uses Deforum <code>animation_mode: Wan Video</code> on Forge. Prompts come from the Prompts tab; models download on Forge when auto-download is enabled.
    </p>

    <div class="wan-engine-controls__speed">
      <div class="framesync-subtitle">Speed preset</div>
      <div class="chips">
        <button
          v-for="name in wanSpeedPresetNames"
          :key="'wan-speed-' + name"
          type="button"
          class="chip"
          :class="{ active: wanEngine.wan_speed_preset === name, 'chip--live': name === 'Turbo' || name === 'Fast' }"
          :data-testid="'wan-speed-preset-' + name"
          @click="applyWanSpeedPreset(name)"
        >
          {{ name }}
        </button>
      </div>
      <p class="framesync-subtitle wan-engine-controls__hint">
        Turbo/Fast use fewer inference steps + flash attention (similar to LCM-style quick passes).
      </p>
    </div>

    <div class="wan-engine-controls__motion">
      <div class="framesync-subtitle">Motion preset</div>
      <div class="motion-preset-row">
        <button
          v-for="name in wanMotionPresetNames"
          :key="'wan-motion-' + name"
          type="button"
          class="chip"
          :class="{ active: wanEngine.wan_motion_preset === name }"
          :data-testid="'wan-motion-preset-' + name"
          @click="applyWanMotionPreset(name)"
        >
          {{ name }}
        </button>
      </div>
    </div>

    <div class="animatelcm-plugin-panel__motion-loras wan-engine-controls__loras">
      <div class="framesync-subtitle">Motion LoRA (prompt tags)</div>
      <div class="chips">
        <button
          v-for="lora in wanMotionLoras"
          :key="'wan-lora-' + lora.id"
          type="button"
          class="chip"
          :class="{ active: activeWanMotionLoras.includes(lora.id) }"
          :data-testid="'wan-motion-lora-' + lora.id"
          :title="lora.id"
          @click="toggleWanMotionLora(lora.id)"
        >
          {{ lora.label }}
        </button>
      </div>
      <div v-if="activeWanMotionLoras.length > 0" class="animatelcm-plugin-panel__lora-weight">
        <div class="framesync-subtitle">LoRA weight</div>
        <input
          type="number"
          class="framesync-input"
          data-testid="wan-motion-lora-weight"
          min="0"
          max="1.5"
          step="0.05"
          :value="wanEngine.motion_lora_weight"
          @input="onWanEngineFieldChange('motion_lora_weight', $event.target.value, 'number')"
        >
      </div>
    </div>

    <div class="wan-engine-controls__init" data-testid="wan-init-section">
      <div class="framesync-subtitle">Image init (I2V)</div>
      <p class="framesync-subtitle wan-engine-controls__hint">
        Start the first clip from a still image. Forge uses Deforum <code>use_init</code> + I2V chaining for later clips.
      </p>
      <label class="wan-engine-controls__toggle">
        <input
          type="checkbox"
          :checked="!!wanEngine.wan_use_init_image"
          :disabled="!wanEngine.wan_init_image"
          data-testid="wan-field-wan_use_init_image"
          @change="onWanEngineFieldChange('wan_use_init_image', $event.target.checked, 'boolean')"
        >
        <span>Use init image for first frame</span>
      </label>
      <div
        class="img2img-dropzone wan-engine-controls__init-drop"
        :class="{ 'img2img-dropzone--filled': !!wanEngine.wan_init_image }"
        data-testid="wan-init-dropzone"
        @dragover.prevent
        @drop.prevent="handleWanInitImageDrop"
      >
        <input
          type="file"
          accept="image/*"
          class="img2img-dropzone__input"
          data-testid="wan-init-file-input"
          @change="handleWanInitImageFile"
        >
        <div v-if="wanEngine.wan_init_image" class="img2img-dropzone__preview">
          <img :src="wanEngine.wan_init_image" alt="Wan init preview" class="img2img-dropzone__image">
        </div>
        <div v-else class="img2img-dropzone__empty">
          <div class="img2img-dropzone__title">Init image</div>
          <div class="img2img-dropzone__hint">Drag and drop or click to browse</div>
        </div>
      </div>
      <div class="wan-engine-controls__init-actions">
        <button
          type="button"
          class="framesync-button framesync-button--compact"
          :disabled="!img2img.dataUrl"
          data-testid="wan-init-from-img2img"
          @click="useImg2imgAsWanInit"
        >
          Use Prompts → IMAGE input
        </button>
        <button
          type="button"
          class="framesync-button framesync-button--compact"
          :disabled="!wanEngine.wan_init_image"
          data-testid="wan-init-clear"
          @click="clearWanInitImage"
        >
          Clear init
        </button>
      </div>
      <div v-if="wanEngine.wan_init_image" class="wan-engine-controls__init-i2v">
        <div class="framesync-stack wan-engine-controls__field">
          <div class="framesync-subtitle">I2V model (first frame + chaining)</div>
          <select
            class="framesync-select"
            data-testid="wan-field-wan_i2v_model"
            :value="wanEngine.wan_i2v_model"
            @change="onWanEngineFieldChange('wan_i2v_model', $event.target.value, 'select')"
          >
            <option v-for="opt in wanI2vModelOptions" :key="'wan-i2v-' + opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
        <div class="framesync-stack wan-engine-controls__field">
          <div class="framesync-subtitle">Init strength (I2V conditioning)</div>
          <input
            type="number"
            class="framesync-input"
            data-testid="wan-field-wan_i2v_init_strength"
            min="0"
            max="1"
            step="0.05"
            :value="wanEngine.wan_i2v_init_strength"
            @input="onWanEngineFieldChange('wan_i2v_init_strength', $event.target.value, 'number')"
          >
        </div>
      </div>
    </div>

    <div class="wan-engine-controls__download" data-testid="wan-download-section">
      <div class="framesync-subtitle">Models on Forge</div>
      <div class="wan-engine-controls__download-row">
        <button
          v-for="pkg in wanDownloadPackages"
          :key="'wan-dl-' + pkg.id"
          type="button"
          class="framesync-button framesync-button--compact"
          :disabled="wanDownloadBusy"
          :data-testid="'wan-download-' + pkg.id"
          :title="pkg.hfCommand"
          @click="requestWanModelDownload(pkg.id)"
        >
          {{ wanDownloadBusy ? '…' : '↓' }} {{ pkg.label }}
        </button>
      </div>
      <label class="wan-engine-controls__toggle">
        <input
          type="checkbox"
          :checked="!!wanEngine.wan_auto_download"
          data-testid="wan-field-wan_auto_download"
          @change="onWanEngineFieldChange('wan_auto_download', $event.target.checked, 'boolean')"
        >
        <span>Auto-download missing Wan models on Forge</span>
      </label>
      <label class="wan-engine-controls__toggle">
        <input
          type="checkbox"
          :checked="!!wanEngine.wan_qwen_auto_download"
          data-testid="wan-field-wan_qwen_auto_download"
          @change="onWanEngineFieldChange('wan_qwen_auto_download', $event.target.checked, 'boolean')"
        >
        <span>Auto-download Qwen enhancer models</span>
      </label>
      <p v-if="wanDownloadStatus" class="framesync-subtitle wan-engine-controls__download-status" data-testid="wan-download-status">
        {{ wanDownloadStatus }}
      </p>
    </div>

    <details class="wan-engine-controls__advanced">
      <summary class="framesync-subtitle">Advanced Wan settings</summary>
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
    </details>
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
