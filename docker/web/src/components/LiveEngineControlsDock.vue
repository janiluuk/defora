<template>
  <section class="live-engine-dock framesync-panel" data-testid="live-engine-dock">
    <div class="live-engine-dock__head">
      <div class="framesync-title">
        <UiIcon class="framesync-title-icon" name="film" />
        <span class="framesync-accent">Engine</span>
        <span
          v-if="lcmEngineEnabled"
          class="lcm-engine-badge"
          data-testid="lcm-engine-badge"
          title="LCM Engine mode — fast steps with LCM LoRA"
        >
          <UiIcon class="lcm-engine-badge__icon" name="lightning" />
          LCM
        </span>
      </div>
      <div class="sub-pills live-engine-dock__tabs" data-testid="live-engine-dock-tabs">
        <button
          type="button"
          class="sub-pill"
          :class="{ active: enginePanelDetailsTab === 'ENGINE' }"
          @click="setEnginePanelDetailsTab('ENGINE')"
        >
          Visual
        </button>
        <button
          type="button"
          class="sub-pill"
          :class="{ active: enginePanelDetailsTab === 'JOB' }"
          @click="setEnginePanelDetailsTab('JOB')"
        >
          Deforum
        </button>
      </div>
    </div>

    <div class="live-engine-dock__body" data-testid="live-engine-dock-body">
      <template v-if="enginePanelDetailsTab === 'ENGINE'">
        <div class="animation-engine-picker__toolbar">
          <div class="framesync-subtitle" style="margin:0;">Preview source</div>
          <button
            type="button"
            class="framesync-button framesync-button--compact animation-engine-picker__size"
            :title="videoStageSize === 'small' ? 'Small stage' : videoStageSize === 'medium' ? 'Medium stage' : 'Full stage'"
            @click="toggleVideoStageSize()"
          >
            <UiIcon
              :name="videoStageSize === 'small' ? 'size-small' : videoStageSize === 'medium' ? 'size-medium' : 'size-full'"
              aria-hidden="true"
            />
            Stage size
          </button>
        </div>

        <LiveEngineControls :app="app" />

        <div v-if="isWanLayerActive" class="wan-engine-controls" data-testid="wan-engine-controls">
          <div class="framesync-subtitle" style="margin-top:10px;">WAN Video · steer generation</div>
          <p class="framesync-subtitle wan-engine-controls__hint">
            Uses Deforum <code>animation_mode: Wan Video</code> on the Forge node (vimage5+). Prompts come from the Prompts tab / keyframe schedule.
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

      <DeforumJobPanel v-else :app="app" />
    </div>

    <p v-if="deforumPreloadStatus && enginePanelDetailsTab === 'ENGINE'" class="live-engine-dock__preload-hint framesync-subtitle">
      {{ deforumPreloadStatus }}
    </p>
  </section>
</template>

<script>
import UiIcon from './UiIcon.vue'
import LiveEngineControls from './LiveEngineControls.vue'
import DeforumJobPanel from './DeforumJobPanel.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'LiveEngineControlsDock',
  components: { UiIcon, LiveEngineControls, DeforumJobPanel },
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
