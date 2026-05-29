<template>
  <div class="live-view" data-testid="live-view">
    <div class="rack performance-deck">
      <div class="framesync-panel">
        <div class="framesync-header">
          <div class="framesync-title">
            <UiIcon class="framesync-title-icon" name="sliders" />
            <span class="framesync-accent">Crossfader</span>
          </div>
        </div>

        <div class="framesync-stack" style="margin-top:10px;">
          <div class="framesync-subtitle">Generic prompt</div>
          <div class="prompt-input-row">
            <textarea
              class="framesync-input prompt-input-row__input"
              v-model="performance.genericPrompt"
              rows="2"
              placeholder="Base prompt for this session…"
              @input="onPerformanceInput"
            ></textarea>
            <div class="prompt-input-row__actions">
              <button
                type="button"
                class="framesync-button framesync-button--compact"
                :class="{ 'framesync-button--live': speechPromptListening }"
                :title="speechPromptListening ? 'Stop microphone' : (speechPromptSupported ? 'Speak prompt' : 'Microphone not supported')"
                :disabled="!speechPromptSupported"
                @click="toggleSpeechPrompt"
              >
                <UiIcon name="mic" />
              </button>
              <button
                type="button"
                class="framesync-button framesync-button--compact"
                title="Clear prompt"
                :disabled="!(performance.genericPrompt || '').trim()"
                @click="clearGenericPrompt"
              >
                <UiIcon name="close" />
              </button>
              <button
                type="button"
                class="framesync-button framesync-button--compact"
                :class="{ active: promptHistoryOpen }"
                :title="promptHistoryOpen ? 'Close prompt history' : 'Open prompt history'"
                @click="togglePromptHistory"
              >
                <UiIcon name="history" />
              </button>
            </div>
          </div>
          <div v-if="speechPromptError" class="framesync-subtitle" style="margin-top:6px;color:var(--warn);">
            {{ speechPromptError }}
          </div>
          <div v-if="promptHistoryOpen" class="prompt-history-panel">
            <div class="prompt-history-panel__header">
              <div class="framesync-subtitle" style="margin:0;">History</div>
              <button type="button" class="framesync-button framesync-button--compact" @click="togglePromptHistory(false)">Close</button>
            </div>
            <div v-if="!promptHistory.length" class="prompt-history-panel__empty">No prompts yet.</div>
            <div v-else class="prompt-history-panel__list">
              <button
                v-for="(p, idx) in promptHistory"
                :key="'prompt-hist-' + idx"
                type="button"
                class="prompt-history-panel__item"
                @click="restorePromptFromHistory(p)"
                :title="p"
              >
                {{ p }}
              </button>
            </div>
          </div>
        </div>

        <div class="crossfade-deck" style="margin-top:14px;">
          <div class="crossfade-deck-head">
            <span class="framesync-subtitle" style="margin:0;">Slots</span>
            <select class="framesync-select" style="max-width:140px;" v-model="performance.newSlotType">
              <option v-for="st in crossfadeSlotTypes" :key="st.id" :value="st.id">{{ st.label }}</option>
            </select>
            <button type="button" class="framesync-button" @click="addCrossfadeSlot">+ Add</button>
          </div>

          <div v-if="!performance.slots.length" class="crossfade-empty">Add prompts, styles, parameters, LoRAs, or ControlNet values on side A and/or B.</div>

          <div v-for="slot in performance.slots" :key="slot.id" class="crossfade-slot-row">
            <div class="crossfade-side crossfade-side-a">
              <span class="crossfade-side-label">A</span>
              <template v-if="slot.type === 'prompt'">
                <input class="framesync-input" v-model="slot.valueA" placeholder="Prompt A (optional)" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'param'">
                <select class="framesync-select" v-model="slot.paramKey" @change="onPerformanceInput">
                  <option v-for="t in modulationTargets" :key="'a-'+slot.id+t.key" :value="t.key">{{ t.label }}</option>
                </select>
                <input type="number" class="framesync-input" v-model.number="slot.valueA" step="any" placeholder="Value A" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'style'">
                <select class="framesync-select" v-model="slot.valueA" data-testid="crossfade-style-a" @change="onPerformanceInput">
                  <option :value="null">— none —</option>
                  <option v-for="style in promptStyles" :key="'style-a-'+slot.id+style.id" :value="style.id">{{ style.name }}</option>
                </select>
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
              <button type="button" class="framesync-button framesync-button--danger framesync-button--compact" @click="removeCrossfadeSlot(slot.id)" title="Remove slot">✕</button>
            </div>

            <div class="crossfade-side crossfade-side-b">
              <span class="crossfade-side-label">B</span>
              <template v-if="slot.type === 'prompt'">
                <input class="framesync-input" v-model="slot.valueB" placeholder="Prompt B (optional)" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'param'">
                <input type="number" class="framesync-input" v-model.number="slot.valueB" step="any" placeholder="Value B" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'style'">
                <select class="framesync-select" v-model="slot.valueB" data-testid="crossfade-style-b" @change="onPerformanceInput">
                  <option :value="null">— none —</option>
                  <option v-for="style in promptStyles" :key="'style-b-'+slot.id+style.id" :value="style.id">{{ style.name }}</option>
                </select>
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
        <UiIcon class="param-drawer-chevron" :name="paramPanelOpen ? 'chevron-up' : 'chevron-down'" />
      </button>
      <div v-show="paramPanelOpen" class="param-drawer-body">
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
  </div>
</template>

<script>
import UiIcon from '../UiIcon.vue'
import { proxyAppView } from './app-view-proxy.mjs'

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
