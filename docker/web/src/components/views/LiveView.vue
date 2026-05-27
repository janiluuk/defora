<template>
  <div>
    <div class="rack performance-deck">
      <div class="framesync-panel">
        <div class="framesync-header">
          <div class="framesync-title">
            <UiIcon class="framesync-title-icon" name="film" />
            <span class="framesync-accent">Default Animation</span>
          </div>
          <span class="framesync-subtitle" style="margin:0;">Volume-lighting style standby scene inspired by the referenced Three.js demo.</span>
        </div>

        <div class="framesync-stack" style="margin-top:10px;">
          <div class="framesync-subtitle">Output surface</div>
          <div class="chips">
            <button
              type="button"
              class="chip"
              :class="{ active: !defaultAnimation.preferDeforumVideo }"
              @click="setPreferDeforumVideo(false)"
            >
              Default animation
            </button>
            <button
              type="button"
              class="chip"
              :class="{ active: defaultAnimation.preferDeforumVideo }"
              @click="setPreferDeforumVideo(true)"
            >
              Deforum feed
            </button>
          </div>
          <div class="framesync-subtitle" style="margin-top:6px;">
            {{ deforumFeedStatusLabel }}
          </div>
        </div>

        <template v-if="!defaultAnimation.preferDeforumVideo">
          <div v-if="defaultAnimation.mode === 'volume'" class="slider-row">
            <label>Beam count</label>
            <input type="range" min="3" max="12" step="1" v-model.number="defaultAnimation.beamCount" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'orbital'" class="slider-row">
            <label>Orbit size</label>
            <input type="range" min="0.1" max="2.0" step="0.01" v-model.number="defaultAnimation.orbit" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'nebula'" class="slider-row">
            <label>Mist</label>
            <input type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.mist" @input="onDefaultAnimationInput">
          </div>
          <div class="slider-row">
            <label>Speed</label>
            <input type="range" min="0.1" max="2.5" step="0.01" v-model.number="defaultAnimation.speed" @input="onDefaultAnimationInput">
          </div>
          <div class="slider-row">
            <label>Spread</label>
            <input type="range" min="0.2" max="1.4" step="0.01" v-model.number="defaultAnimation.spread" @input="onDefaultAnimationInput">
          </div>
          <div class="slider-row">
            <label>Glow</label>
            <input type="range" min="0.1" max="1.4" step="0.01" v-model.number="defaultAnimation.glow" @input="onDefaultAnimationInput">
          </div>
          <div class="slider-row">
            <label>Hue</label>
            <input type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.hue" @input="onDefaultAnimationInput">
          </div>
          <div class="slider-row">
            <label>Pulse</label>
            <input type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.pulse" @input="onDefaultAnimationInput">
          </div>
          <div class="slider-row">
            <label>Drift</label>
            <input type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.drift" @input="onDefaultAnimationInput">
          </div>
        </template>
      </div>
    </div>

    <div class="rack performance-deck">
      <div class="framesync-panel">
        <div class="framesync-header">
          <div class="framesync-title">
            <UiIcon class="framesync-title-icon" name="sliders" />
            <span class="framesync-accent">Morph Setup</span>
          </div>
          <span class="framesync-subtitle" style="margin:0;">Drawer-only setup for prompts, slots, and morph targets.</span>
        </div>

        <div class="framesync-stack" style="margin-top:10px;">
          <div class="framesync-subtitle">Generic prompt</div>
          <textarea class="framesync-input" v-model="performance.genericPrompt" rows="2" placeholder="Base prompt for this session…" @input="onPerformanceInput"></textarea>
        </div>

        <div class="crossfade-deck" style="margin-top:14px;">
          <div class="crossfade-deck-head">
            <span class="framesync-subtitle" style="margin:0;">Morph slots</span>
            <select class="framesync-select" style="max-width:140px;" v-model="performance.newSlotType">
              <option v-for="st in crossfadeSlotTypes" :key="st.id" :value="st.id">{{ st.label }}</option>
            </select>
            <button type="button" class="framesync-button" @click="addCrossfadeSlot">+ Add</button>
          </div>

          <div v-if="!performance.slots.length" class="crossfade-empty">Add prompts, parameters, LoRAs, or ControlNet values on side A and/or B.</div>

          <div v-for="slot in performance.slots" :key="slot.id" class="crossfade-slot-row">
            <div class="crossfade-side crossfade-side-a">
              <span class="crossfade-side-label">A</span>
              <template v-if="slot.type === 'prompt'">
                <input class="framesync-input" v-model="slot.valueA" placeholder="Prompt A (optional)" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'param'">
                <select class="framesync-select" v-model="slot.paramKey" @change="onPerformanceInput">
                  <option v-for="t in lfoTargets" :key="'a-'+slot.id+t.key" :value="t.key">{{ t.label }}</option>
                </select>
                <input type="number" class="framesync-input" v-model.number="slot.valueA" step="any" placeholder="Value A" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'lora'">
                <select class="framesync-select" v-model="slot.valueA" @change="onPerformanceInput">
                  <option :value="null">— none —</option>
                  <option v-for="l in loras.available" :key="'la-'+slot.id+l.id" :value="l.name">{{ l.name }}</option>
                </select>
                <input type="number" class="framesync-input" v-model.number="slot.loraStrengthA" min="0" max="2" step="0.01" placeholder="Str A" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'controlnet'">
                <select class="framesync-select" v-model="slot.cnSlotId" @change="onPerformanceInput">
                  <option v-for="s in cn.slots" :key="'cna-'+slot.id+s.id" :value="s.id">{{ s.label }}</option>
                </select>
                <input type="number" class="framesync-input" v-model.number="slot.valueA" min="0" max="2" step="0.01" placeholder="Weight A" @input="onPerformanceInput">
              </template>
            </div>

            <div class="crossfade-slot-meta">
              <span class="crossfade-type-pill">{{ slotTypeLabel(slot.type) }}</span>
              <button type="button" class="framesync-button" style="padding:2px 6px;" @click="removeCrossfadeSlot(slot.id)">✕</button>
            </div>

            <div class="crossfade-side crossfade-side-b">
              <span class="crossfade-side-label">B</span>
              <template v-if="slot.type === 'prompt'">
                <input class="framesync-input" v-model="slot.valueB" placeholder="Prompt B (optional)" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'param'">
                <input type="number" class="framesync-input" v-model.number="slot.valueB" step="any" placeholder="Value B" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'lora'">
                <select class="framesync-select" v-model="slot.valueB" @change="onPerformanceInput">
                  <option :value="null">— none —</option>
                  <option v-for="l in loras.available" :key="'lb-'+slot.id+l.id" :value="l.name">{{ l.name }}</option>
                </select>
                <input type="number" class="framesync-input" v-model.number="slot.loraStrengthB" min="0" max="2" step="0.01" placeholder="Str B" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'controlnet'">
                <input type="number" class="framesync-input" v-model.number="slot.valueB" min="0" max="2" step="0.01" placeholder="Weight B" @input="onPerformanceInput">
              </template>
            </div>

            <div class="crossfade-morphed" v-if="slotMorphedPreview(slot) !== null">
              <span class="framesync-subtitle" style="margin:0;font-size:9px;">→</span>
              <code class="crossfade-morphed-val">{{ formatMorphedPreview(slot) }}</code>
            </div>
          </div>
        </div>

        <div v-if="performance.status" class="framesync-subtitle" style="margin-top:10px;text-align:center;color:var(--success);">
          <span v-if="previewGenerating" class="lazy-loading-indicator lazy-loading-indicator--subtle">
            <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
            <span>{{ performance.status }}</span>
            <span class="lazy-loading-indicator__dots" aria-hidden="true"><span></span><span></span><span></span></span>
          </span>
          <template v-else>{{ performance.status }}</template>
        </div>
      </div>
    </div>

    <div class="rack param-drawer">
      <button type="button" class="param-drawer-toggle" @click="paramPanelOpen = !paramPanelOpen; saveSessionState()">
        <span class="param-drawer-label">
          <UiIcon class="param-drawer-label-icon" name="sliders" />
          <span>Parameters</span>
        </span>
        <span class="model-status-pill" :class="'model-' + modelStatusKind" :title="modelStatusLabel">
          <span class="model-status-dot"></span>
          {{ modelStatusLabel }}
        </span>
        <UiIcon class="param-drawer-chevron" :name="paramPanelOpen ? 'chevron-up' : 'chevron-down'" />
      </button>
      <div v-show="paramPanelOpen" class="param-drawer-body">
        <div class="model-bar">
          <label class="framesync-subtitle">Checkpoint</label>
          <select class="framesync-select" v-model="forge.selectedModel" :disabled="forge.switching || modelStatusKind === 'offline'" @change="onModelSelectChange">
            <option value="">— select model —</option>
            <option v-for="m in forge.models" :key="m.model_name || m.title" :value="m.model_name || m.title">{{ m.title || m.model_name }}</option>
          </select>
          <span v-if="forge.modelsSource" class="model-source-pill" :class="'src-' + forge.modelsSource" :title="'Model list from ' + forge.modelsSource">
            ● {{ modelSourceLabel(forge.modelsSource) }}
          </span>
          <span v-if="forge.switching || forge.loading" class="model-loading">
            <span class="lazy-loading-indicator lazy-loading-indicator--subtle">
              <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
              <span>{{ forge.switching ? 'Loading model' : 'Loading Forge data' }}</span>
              <span class="lazy-loading-indicator__dots" aria-hidden="true"><span></span><span></span><span></span></span>
            </span>
          </span>
          <span v-else-if="forge.lastModel" class="model-last">Last: {{ forge.lastModel }}</span>
        </div>

        <div v-if="pinnedParamItems.length" class="param-group param-group--pinned">
          <div class="framesync-subtitle">📌 Pinned</div>
          <div class="param-group-grid">
            <div class="framesync-stack" v-for="p in pinnedParamItems" :key="'pin-'+p.key" :class="{'param-locked': isParamLocked(p.key)}">
              <div class="framesync-subtitle" style="font-size:10px; display:flex; align-items:center; gap:4px;">
                <span>{{ p.label }}</span>
                <button type="button" class="param-pin-btn active" title="Unpin" @click.stop="toggleParamPin(p.key)">📌</button>
                <button type="button" class="param-lock-btn" :class="{active: isParamLockedByMe(p.key)}" :title="paramLockTitle(p.key)" @click.stop="toggleParamLock(p.key)">🔒</button>
              </div>
              <input type="range" :min="p.min" :max="p.max" :step="p.step" :value="p.val" :disabled="isParamLocked(p.key) && !isParamLockedByMe(p.key)" @input="updateParam(p,$event)" class="framesync-input">
            </div>
          </div>
        </div>

        <div v-for="group in paramPanelGroups" :key="group.label" class="param-group">
          <div class="framesync-subtitle">{{ group.label }}</div>
          <div class="param-group-grid">
            <div class="framesync-stack" v-for="p in group.items" :key="p.key" :class="{'param-locked': isParamLocked(p.key)}">
              <div class="framesync-subtitle" style="font-size:10px; display:flex; align-items:center; gap:4px;">
                <span>{{ p.label }}</span>
                <button type="button" class="param-pin-btn" :class="{active: isParamPinned(p.key)}" title="Pin to top" @click.stop="toggleParamPin(p.key)">📌</button>
                <button type="button" class="param-lock-btn" :class="{active: isParamLockedByMe(p.key)}" :title="paramLockTitle(p.key)" @click.stop="toggleParamLock(p.key)">🔒</button>
              </div>
              <input type="range" :min="p.min" :max="p.max" :step="p.step" :value="p.val" :disabled="isParamLocked(p.key) && !isParamLockedByMe(p.key)" @input="updateParam(p,$event)" class="framesync-input">
            </div>
          </div>
        </div>

        <div class="framesync-footer" style="margin-top:10px;">
          <button class="framesync-button" @click="resetVibeParams">↺ Reset vibe</button>
          <button class="framesync-button" @click="resetCameraParams">↺ Reset camera</button>
        </div>
      </div>
    </div>

    <div class="rack param-drawer deforum-settings-drawer" data-testid="deforum-settings-panel">
      <button type="button" class="param-drawer-toggle" @click="deforumPanelOpen = !deforumPanelOpen; saveSessionState()">
        <span class="param-drawer-label">
          <UiIcon class="param-drawer-label-icon" name="film" />
          <span>Deforum settings</span>
        </span>
        <span class="deforum-settings-hint">{{ deforumSettingsStatus || 'Hidden panel' }}</span>
        <UiIcon class="param-drawer-chevron" :name="deforumPanelOpen ? 'chevron-up' : 'chevron-down'" />
      </button>
      <div v-show="deforumPanelOpen" class="param-drawer-body deforum-settings-body">
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

        <div v-else class="deforum-settings-groups">
          <details
            v-for="group in deforumFieldGroups"
            :key="group.id"
            class="deforum-settings-group"
            :open="deforumSectionOpen[group.id] !== false"
            @toggle="onDeforumSectionToggle(group.id, $event)"
          >
            <summary class="deforum-settings-group-title">{{ group.label }}</summary>
            <div class="deforum-settings-grid">
              <label
                v-for="field in group.fields"
                :key="field.key"
                class="deforum-field"
                :class="[
                  'deforum-field-' + (field.type || 'text'),
                  { 'deforum-field--disabled': !isDeforumFieldEnabled(field.key) }
                ]"
              >
                <span class="deforum-field-head">
                  <span class="deforum-field-label">{{ field.label }}</span>
                  <span class="deforum-field-toggle">
                    <input
                      type="checkbox"
                      :checked="isDeforumFieldEnabled(field.key)"
                      @change="setDeforumFieldEnabled(field.key, $event.target.checked)"
                    >
                    <span>{{ isDeforumFieldEnabled(field.key) ? 'On' : 'Off' }}</span>
                  </span>
                </span>
                <input
                  v-if="field.type === 'number'"
                  type="number"
                  class="framesync-input"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step || 1"
                  :value="getDeforumField(field.key)"
                  :disabled="!isDeforumFieldEnabled(field.key)"
                  @input="onDeforumFieldInput(field.key, $event.target.value, 'number')"
                />
                <input
                  v-else-if="field.type === 'bool'"
                  type="checkbox"
                  :checked="!!getDeforumField(field.key)"
                  :disabled="!isDeforumFieldEnabled(field.key)"
                  @change="onDeforumFieldInput(field.key, $event.target.checked, 'bool')"
                />
                <textarea
                  v-else-if="field.type === 'textarea'"
                  class="framesync-input"
                  :rows="field.rows || 3"
                  :value="getDeforumField(field.key) ?? ''"
                  :disabled="!isDeforumFieldEnabled(field.key)"
                  @input="onDeforumFieldInput(field.key, $event.target.value, 'text')"
                />
                <select
                  v-else-if="field.key === 'sd_model_name' && forge.models.length"
                  class="framesync-select"
                  :value="getDeforumField(field.key) ?? ''"
                  :disabled="!isDeforumFieldEnabled(field.key) || forge.switching || modelStatusKind === 'offline'"
                  @change="onDeforumModelCommit($event.target.value)"
                >
                  <option value="">— select model —</option>
                  <option
                    v-for="m in forge.models"
                    :key="m.model_name || m.title"
                    :value="m.model_name || m.title"
                  >
                    {{ m.title || m.model_name }}
                  </option>
                </select>
                <input
                  v-else-if="field.key === 'sd_model_name'"
                  type="text"
                  class="framesync-input"
                  :value="getDeforumField(field.key) ?? ''"
                  :disabled="!isDeforumFieldEnabled(field.key)"
                  @input="onDeforumFieldInput(field.key, $event.target.value, 'text')"
                  @blur="onDeforumModelCommit($event.target.value)"
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
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UiIcon from '../UiIcon.vue'
import { proxyAppView } from './app-view-proxy.js'

export default {
  name: 'LiveView',
  components: { UiIcon },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
