<template>
  <div class="animation-engine-panel" data-testid="animation-engine-panel">
    <div
      v-if="showFrameProcessingInChrome"
      class="live-frame-processing-banner"
      data-testid="live-frame-processing-banner"
      aria-live="polite"
    >
      <span class="lazy-loading-indicator lazy-loading-indicator--inline">
        <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
        <span>{{ frameProcessingLabel }}</span>
        <span class="lazy-loading-indicator__dots" aria-hidden="true"><span></span><span></span><span></span></span>
      </span>
      <span class="live-frame-processing-banner__hint">{{ frameProcessingHint }}</span>
    </div>

    <div class="animation-engine-panel__head">
      <div class="framesync-title">
        <UiIcon class="framesync-title-icon" name="film" />
        <span class="framesync-accent">Engines</span>
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
      <button
        type="button"
        class="framesync-button framesync-button--compact"
        :class="{ active: enginePanelDetailsOpen }"
        :aria-expanded="enginePanelDetailsOpen ? 'true' : 'false'"
        data-testid="animation-engine-details-toggle"
        @click="toggleEnginePanelDetails()"
      >
        <UiIcon :name="enginePanelDetailsOpen ? 'chevron-up' : 'chevron-down'" />
        Details
      </button>
    </div>

    <ul class="animation-engine-layer-list" data-testid="animation-engine-layer-list">
      <li
        v-for="layer in builtinEngineLayers"
        :key="'engine-layer-row-' + layer.id"
        class="animation-engine-layer-row"
        :class="{
          'animation-engine-layer-row--active': activeVideoLayerId === layer.id,
          'animation-engine-layer-row--hidden': !isVideoLayerPreviewVisible(layer),
        }"
        :data-testid="'animation-engine-row-' + layer.id"
      >
        <button
          type="button"
          class="animation-engine-layer-row__select"
          :class="{ 'animation-engine-layer-row__select--active': activeVideoLayerId === layer.id }"
          :aria-pressed="activeVideoLayerId === layer.id ? 'true' : 'false'"
          :data-testid="'animation-engine-' + layer.id"
          @click="selectVideoLayer(layer.id)"
        >
          <span
            class="animation-engine-card__dot"
            :class="'animation-engine-card__dot--' + layerStatus(layer)"
            aria-hidden="true"
          ></span>
          <span class="animation-engine-layer-row__label">{{ layer.label }}</span>
          <span class="animation-engine-layer-row__status">{{ videoLayerStatusShort(layer) }}</span>
        </button>
        <button
          type="button"
          class="framesync-button framesync-button--compact animation-engine-layer-row__visibility"
          :class="{ 'framesync-button--live': isVideoLayerPreviewVisible(layer) }"
          :title="isVideoLayerPreviewVisible(layer) ? 'Hide layer in preview' : 'Show layer in preview'"
          :data-testid="'animation-engine-visibility-' + layer.id"
          @click.stop="toggleVideoLayerPreview(layer.id)"
        >
          {{ isVideoLayerPreviewVisible(layer) ? 'Hide' : 'Show' }}
        </button>
      </li>
    </ul>

    <div v-if="enginePanelDetailsOpen" class="animation-engine-panel__details" data-testid="animation-engine-details">
      <div class="sub-pills animation-engine-panel__tabs">
        <button
          type="button"
          class="sub-pill"
          :class="{ active: enginePanelDetailsTab === 'ENGINE' }"
          @click="setEnginePanelDetailsTab('ENGINE')"
        >
          Controls
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

        <div class="animation-engine-picker" data-testid="animation-engine-picker">
          <button
            v-for="layer in videoLayers"
            :key="'animation-engine-picker-' + layer.id"
            type="button"
            class="animation-engine-card animation-engine-card--compact"
            :class="{
              'animation-engine-card--active': activeVideoLayerId === layer.id,
              'animation-engine-card--builtin': layer.builtin,
              'animation-engine-card--wan': layer.kind === 'wan',
            }"
            :aria-pressed="activeVideoLayerId === layer.id ? 'true' : 'false'"
            @click="selectVideoLayer(layer.id)"
          >
            <span
              class="animation-engine-card__dot"
              :class="'animation-engine-card__dot--' + layerStatus(layer)"
              aria-hidden="true"
            ></span>
            <span class="animation-engine-card__label">{{ layer.label }}</span>
          </button>
          <button
            type="button"
            class="animation-engine-card animation-engine-card--add animation-engine-card--compact"
            :class="{ 'animation-engine-card--active': videoLayerAddOpen }"
            data-testid="video-layer-add-toggle"
            @click="toggleVideoLayerAdd()"
          >
            <span class="animation-engine-card__label">+ Add</span>
          </button>
        </div>

        <div
          v-if="currentTab === 'LIVE' && videoLayerAddOpen"
          class="video-layer-add framesync-panel"
          data-testid="video-layer-add"
        >
          <div class="framesync-header">
            <div class="framesync-title">
              <UiIcon class="framesync-title-icon" name="plus" />
              <span class="framesync-accent">Add source</span>
            </div>
            <button type="button" class="framesync-button framesync-button--compact" @click="toggleVideoLayerAdd(false)">Close</button>
          </div>
          <p class="framesync-subtitle video-layer-add__hint">
            New sources open as preview tabs. Built-in layers: WebGL, Deforum, WAN Video, and Input.
          </p>
          <div class="chips video-layer-add__mode">
            <button type="button" class="chip" :class="{ active: liveSourcePanel === 'library' }" @click="liveSourcePanel = 'library'; saveSessionState()">Video library</button>
            <button type="button" class="chip" :class="{ active: liveSourcePanel === 'cloud' }" @click="liveSourcePanel = 'cloud'; saveSessionState()">Cloud drive</button>
          </div>
          <div v-if="liveSourcePanel === 'library'" style="margin-top:10px;">
            <VideoSwarmBrowser :app="app" />
          </div>
          <div v-else style="margin-top:10px;">
            <div class="framesync-row" style="grid-template-columns: 1fr 0.8fr; gap:10px;">
              <input class="framesync-input" v-model.trim="cloudDriveDraft.url" placeholder="https://drive.google.com/...">
              <select class="framesync-select" v-model="cloudDriveDraft.provider">
                <option value="google_drive">Google Drive</option>
                <option value="dropbox">Dropbox</option>
                <option value="onedrive">OneDrive</option>
              </select>
            </div>
            <div class="framesync-footer" style="margin-top:8px;">
              <button type="button" class="framesync-button" @click="linkCloudDriveSource">Link cloud drive</button>
            </div>
          </div>
        </div>

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

        <LiveEngineControls :app="app" />
      </template>

      <DeforumJobPanel v-else :app="app" />
    </div>

    <p v-if="deforumPreloadStatus" class="animation-engine-panel__preload-hint framesync-subtitle">{{ deforumPreloadStatus }}</p>
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'
import LiveEngineControls from './LiveEngineControls.vue'
import VideoSwarmBrowser from './VideoSwarmBrowser.vue'
import DeforumJobPanel from './DeforumJobPanel.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'AnimationEnginePanel',
  components: { UiIcon, LiveEngineControls, VideoSwarmBrowser, DeforumJobPanel },
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
