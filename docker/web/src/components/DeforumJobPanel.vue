<template>
  <div class="rack deforum-job-panel" data-testid="deforum-settings-panel">
      <div class="framesync-panel deforum-job-panel__head">
        <div class="framesync-header">
          <div class="framesync-title">
            <UiIcon class="framesync-title-icon" name="film" />
            <span class="framesync-accent">Deforum</span>
          </div>
          <span
            class="perf-mode-badge"
            :class="deforumPlaying ? 'mode-animate' : 'mode-preview'"
          >
            {{ deforumPlaying ? 'Animating' : 'Ready' }}
          </span>
        </div>
        <p class="framesync-subtitle deforum-job-panel__summary">
          Batch <strong>{{ deforumSettings.batch_name || '—' }}</strong>
          · {{ deforumSettings.max_frames || 0 }} frames @ {{ deforumSettings.fps || 24 }} fps
        </p>
        <div class="deforum-job-panel__transport">
          <button type="button" class="framesync-button" :class="{ active: deforumPlaying }" @click="toggleDeforumPlay">
            {{ deforumPlaying ? 'Pause job' : 'Play job' }}
          </button>
          <button type="button" class="framesync-button" @click="stopDeforumPlay">Stop</button>
        </div>
        <div v-if="deforumSettingsStatus" class="framesync-subtitle deforum-job-panel__status">{{ deforumSettingsStatus }}</div>
      </div>
      <div class="param-drawer-body deforum-settings-body">
        <div class="deforum-settings-toolbar">
          <button type="button" class="framesync-button" :disabled="deforumSettingsLoading" @click="loadDeforumSettings">
            <span v-if="deforumSettingsLoading" class="lazy-loading-indicator lazy-loading-indicator--button">
              <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
              <span>Reload</span>
            </span>
            <template v-else>↻ Reload</template>
          </button>
          <button type="button" class="framesync-button" :disabled="deforumSettingsSaving" @click="saveDeforumSettings">
            <span v-if="deforumSettingsSaving" class="lazy-loading-indicator lazy-loading-indicator--button">
              <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
              <span>Save</span>
            </span>
            <template v-else>💾 Save</template>
          </button>
          <button
            type="button"
            class="framesync-button"
            :class="{ 'framesync-button--loading': previewGenerating }"
            :disabled="previewGenerating"
            @click="generateDeforumPreviewFrame"
          >
            <span v-if="previewGenerating" class="lazy-loading-indicator lazy-loading-indicator--button">
              <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
              <span>Regenerate frame</span>
            </span>
            <template v-else>🖼 Regenerate frame</template>
          </button>
          <label class="deforum-advanced-toggle">
            <input type="checkbox" v-model="deforumAdvancedOpen"> JSON
          </label>
          <button
            type="button"
            class="framesync-button"
            data-testid="deforum-settings-verify"
            title="Check settings for errors and optimization hints"
            @click="runDeforumSettingsVerify"
          >
            Verify
          </button>
        </div>

        <div v-if="deforumAdvancedOpen" class="deforum-advanced-json">
          <textarea
            class="framesync-input deforum-json-editor"
            v-model="deforumSettingsJson"
            rows="12"
            spellcheck="false"
            @blur="applyDeforumSettingsJson"
          ></textarea>
          <p v-if="deforumSettingsJsonError" class="deforum-json-error">{{ deforumSettingsJsonError }}</p>
        </div>

        <div
          v-else-if="deforumVerifyResults && (deforumVerifyResults.errors.length || deforumVerifyResults.warnings.length)"
          class="deforum-verify-results"
          data-testid="deforum-verify-results"
        >
          <div class="deforum-verify-results__head">
            <span class="framesync-subtitle" style="margin:0;">Verification</span>
            <span class="deforum-verify-results__counts">
              <span v-if="deforumVerifyResults.errors.length" class="deforum-verify-results__badge deforum-verify-results__badge--error">
                {{ deforumVerifyResults.errors.length }} error{{ deforumVerifyResults.errors.length === 1 ? '' : 's' }}
              </span>
              <span v-if="deforumVerifyResults.warnings.length" class="deforum-verify-results__badge deforum-verify-results__badge--warn">
                {{ deforumVerifyResults.warnings.length }} hint{{ deforumVerifyResults.warnings.length === 1 ? '' : 's' }}
              </span>
            </span>
          </div>
          <ul v-if="deforumVerifyResults.errors.length" class="deforum-verify-results__list deforum-verify-results__list--error">
            <li v-for="(issue, idx) in deforumVerifyResults.errors" :key="'deforum-verr-' + idx">
              <strong>{{ issue.field }}</strong> — {{ issue.message }}
              <span v-if="issue.hint" class="deforum-verify-results__hint">{{ issue.hint }}</span>
            </li>
          </ul>
          <ul v-if="deforumVerifyResults.warnings.length" class="deforum-verify-results__list deforum-verify-results__list--warn">
            <li v-for="(issue, idx) in deforumVerifyResults.warnings" :key="'deforum-vwarn-' + idx">
              <strong>{{ issue.field }}</strong> — {{ issue.message }}
              <span v-if="issue.hint" class="deforum-verify-results__hint">{{ issue.hint }}</span>
            </li>
          </ul>
        </div>
        <p
          v-else-if="deforumVerifyResults && !deforumVerifyResults.errors.length && !deforumVerifyResults.warnings.length"
          class="deforum-verify-results deforum-verify-results--ok"
          data-testid="deforum-verify-results"
        >
          Settings look good — no issues found.
        </p>

        <DeforumControlPanel v-else :app="app" visual-plugin-id="deforum" />
      </div>
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'
import DeforumControlPanel from './DeforumControlPanel.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'DeforumJobPanel',
  components: { UiIcon, DeforumControlPanel },
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
