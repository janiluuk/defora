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
          v-if="deforumVerifyResults && (deforumVerifyResults.errors.length || deforumVerifyResults.warnings.length)"
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

        <div v-else class="deforum-settings-groups">
          <div
            class="deforum-mode-toggle"
            role="group"
            aria-label="Deforum animation mode"
            data-testid="deforum-mode-toggle"
          >
            <button
              type="button"
              class="deforum-mode-toggle__btn"
              :class="{ active: deforumMode2d3d === '2D' }"
              data-testid="deforum-mode-2d"
              @click="setDeforumMode2d3d('2D')"
            >
              2D
            </button>
            <button
              type="button"
              class="deforum-mode-toggle__btn"
              :class="{ active: deforumMode2d3d === '3D' }"
              data-testid="deforum-mode-3d"
              @click="setDeforumMode2d3d('3D')"
            >
              3D
            </button>
          </div>
          <p v-if="!deforumMode3dActive" class="deforum-mode-toggle__hint">
            3D motion schedules are disabled in 2D mode.
          </p>
          <div class="sub-pills deforum-settings-tabs">
            <button
              v-for="group in deforumFieldGroups"
              :key="'deforum-tab-' + group.id"
              type="button"
              class="sub-pill"
              :class="{
                active: deforumActiveTab === group.id,
                'sub-pill--disabled': isDeforumFieldGroupDisabledByAnimationMode(group.id),
              }"
              :disabled="isDeforumFieldGroupDisabledByAnimationMode(group.id)"
              @click="deforumActiveTab = group.id; saveSessionState()"
            >
              {{ group.label }}
            </button>
          </div>

          <div v-if="activeDeforumFieldGroup" class="framesync-panel deforum-settings-panel">
            <MotionPathPreview
              v-if="deforumMode3dActive && (deforumActiveTab === 'motion' || deforumActiveTab === 'motion3d')"
              :deforum-settings="deforumSettings"
              :motion-values="{}"
              :prefer-live-values="false"
            />
            <div class="deforum-settings-grid">
              <template v-for="field in activeDeforumFieldGroup.fields" :key="field.key">
                <label
                  v-if="field.key !== 'sd_model_name'"
                  class="deforum-field"
                  :class="[
                    'deforum-field-' + (field.type || 'text'),
                    {
                      'deforum-field--disabled': !isDeforumFieldEnabled(field.key),
                      'deforum-field--mode-locked': isDeforumFieldDisabledByAnimationMode(field.key),
                    }
                  ]"
                >
                  <span class="deforum-field-head">
                    <span class="deforum-field-label">{{ field.label }}</span>
                    <span v-if="isDeforumFieldToggleable(field.key)" class="deforum-field-toggle">
                      <button
                        type="button"
                        class="chip chip--compact"
                        :class="{ active: isDeforumFieldEnabled(field.key) }"
                        @click.prevent="setDeforumFieldEnabled(field.key, !isDeforumFieldEnabled(field.key))"
                      >
                        {{ isDeforumFieldEnabled(field.key) ? 'On' : 'Off' }}
                      </button>
                    </span>
                  </span>
                  <div v-if="field.type === 'slider'" class="deforum-field-slider">
                    <input
                      type="range"
                      class="framesync-input"
                      :min="field.min"
                      :max="field.max"
                      :step="field.step || 1"
                      :value="getDeforumField(field.key)"
                      :disabled="!isDeforumFieldEnabled(field.key)"
                      @input="onDeforumFieldInput(field.key, $event.target.value, 'number')"
                    />
                    <span class="deforum-field-slider__value">{{ formatDeforumFieldValue(field, getDeforumField(field.key)) }}</span>
                  </div>
                  <select
                    v-else-if="field.type === 'select'"
                    class="framesync-select"
                    :data-testid="'deforum-field-' + field.key"
                    :value="getDeforumField(field.key) ?? ''"
                    :disabled="!isDeforumFieldEnabled(field.key)"
                    @change="onDeforumSelectInput(field, $event.target.value)"
                  >
                    <option
                      v-for="opt in deforumFieldOptions(field)"
                      :key="field.key + '-opt-' + opt"
                      :value="opt"
                    >
                      {{ opt }}
                    </option>
                  </select>
                  <div v-else-if="field.key === 'seed'" class="deforum-seed-control" data-testid="deforum-seed-control">
                    <button
                      type="button"
                      class="chip chip--compact"
                      :class="{ active: seedRandomEnabled }"
                      :disabled="!isDeforumFieldEnabled(field.key)"
                      data-testid="seed-random-toggle"
                      @click="setSeedRandomEnabled(!seedRandomEnabled)"
                    >
                      Random
                    </button>
                    <input
                      v-if="!seedRandomEnabled"
                      type="number"
                      class="framesync-input deforum-seed-control__input"
                      data-testid="deforum-field-seed"
                      min="0"
                      :max="field.max"
                      :step="field.step || 1"
                      :value="getDeforumField(field.key)"
                      :disabled="!isDeforumFieldEnabled(field.key)"
                      @input="onDeforumSeedInput($event.target.value)"
                    />
                    <span v-else class="deforum-seed-control__hint">Random (−1)</span>
                  </div>
                  <input
                    v-else-if="field.type === 'number'"
                    type="number"
                    class="framesync-input"
                    :data-testid="'deforum-field-' + field.key"
                    :min="field.min"
                    :max="field.max"
                    :step="field.step || 1"
                    :value="getDeforumField(field.key)"
                    :disabled="!isDeforumFieldEnabled(field.key)"
                    @input="onDeforumFieldInput(field.key, $event.target.value, 'number')"
                  />
                  <div v-else-if="field.type === 'bool'" class="chips deforum-field-bool">
                    <button type="button" class="chip" :class="{ active: !!getDeforumField(field.key) }" :disabled="!isDeforumFieldEnabled(field.key)" @click="onDeforumFieldInput(field.key, true, 'bool')">On</button>
                    <button type="button" class="chip" :class="{ active: !getDeforumField(field.key) }" :disabled="!isDeforumFieldEnabled(field.key)" @click="onDeforumFieldInput(field.key, false, 'bool')">Off</button>
                  </div>
                  <textarea
                    v-else-if="field.type === 'textarea'"
                    class="framesync-input"
                    :rows="field.rows || 3"
                    :value="getDeforumField(field.key) ?? ''"
                    :disabled="!isDeforumFieldEnabled(field.key)"
                    @input="onDeforumFieldInput(field.key, $event.target.value, 'text')"
                  />
                  <input
                    v-else
                    type="text"
                    class="framesync-input"
                    :value="getDeforumField(field.key) ?? ''"
                    :disabled="!isDeforumFieldEnabled(field.key)"
                    @input="onDeforumFieldInput(field.key, $event.target.value, 'text')"
                  />
                </label>
              </template>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'
import MotionPathPreview from './MotionPathPreview.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'DeforumJobPanel',
  components: { UiIcon, MotionPathPreview },
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
