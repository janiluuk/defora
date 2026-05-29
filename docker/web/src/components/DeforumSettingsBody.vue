<template>
  <section class="deforum-settings-body-wrap" data-testid="deforum-settings-body">
    <div class="deforum-settings-groups">
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
                >
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
                >
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
              >
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
              ></textarea>
              <input
                v-else
                type="text"
                class="framesync-input"
                :value="getDeforumField(field.key) ?? ''"
                :disabled="!isDeforumFieldEnabled(field.key)"
                @input="onDeforumFieldInput(field.key, $event.target.value, 'text')"
              >
            </label>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import MotionPathPreview from './MotionPathPreview.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'DeforumSettingsBody',
  components: { MotionPathPreview },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
