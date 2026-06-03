<template>
  <div class="deforum-job-toolbar framesync-panel" data-testid="deforum-job-toolbar">
    <div class="deforum-job-toolbar__head">
      <span
        class="perf-mode-badge"
        :class="deforumPlaying ? 'mode-animate' : 'mode-preview'"
      >
        {{ deforumPlaying ? 'Animating' : 'Ready' }}
      </span>
      <p class="framesync-subtitle deforum-job-toolbar__summary">
        Batch <strong>{{ deforumSettings.batch_name || '—' }}</strong>
        · {{ deforumSettings.max_frames || 0 }} frames @ {{ deforumSettings.fps || 24 }} fps
      </p>
      <p v-if="jobStyleSummary" class="framesync-subtitle deforum-job-toolbar__style" data-testid="deforum-job-style-summary">
        Style: <strong>{{ jobStyleSummary }}</strong>
      </p>
    </div>
    <div class="deforum-job-toolbar__actions">
      <button type="button" class="framesync-button framesync-button--compact" :class="{ active: deforumPlaying }" @click="toggleDeforumPlay">
        {{ deforumPlaying ? 'Pause' : 'Play' }}
      </button>
      <button type="button" class="framesync-button framesync-button--compact" @click="stopDeforumPlay">Stop</button>
      <button
        type="button"
        class="framesync-button framesync-button--compact"
        data-testid="deforum-undo-segment-toolbar"
        :disabled="!deforumContinuationCanUndo"
        :title="deforumContinuationUndoTitle"
        @click="undoDeforumContinuationSegment"
      >Undo segment</button>
      <button
        type="button"
        class="framesync-button framesync-button--compact"
        :disabled="previewGenerating"
        @click="generateDeforumPreviewFrame"
      >
        {{ previewGenerating ? '…' : 'Preview frame' }}
      </button>
      <button type="button" class="framesync-button framesync-button--compact" :disabled="deforumSettingsLoading" @click="loadDeforumSettings">
        Reload
      </button>
      <button type="button" class="framesync-button framesync-button--compact" :disabled="deforumSettingsSaving" @click="saveDeforumSettings">
        Save
      </button>
      <button type="button" class="framesync-button framesync-button--compact" data-testid="deforum-settings-verify" @click="runDeforumSettingsVerify">
        Verify
      </button>
      <label class="deforum-advanced-toggle">
        <input type="checkbox" v-model="deforumAdvancedOpen"> JSON
      </label>
    </div>
    <div v-if="deforumAdvancedOpen" class="deforum-advanced-json">
      <textarea
        class="framesync-input deforum-json-editor"
        v-model="deforumSettingsJson"
        rows="8"
        spellcheck="false"
        @blur="applyDeforumSettingsJson"
      ></textarea>
      <p v-if="deforumSettingsJsonError" class="deforum-json-error">{{ deforumSettingsJsonError }}</p>
    </div>
    <p v-if="deforumSettingsStatus" class="framesync-subtitle deforum-job-toolbar__status">{{ deforumSettingsStatus }}</p>
  </div>
</template>

<script>
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'DeforumJobToolbar',
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
