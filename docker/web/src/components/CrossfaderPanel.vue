<template>
  <div
    class="crossfader-panel lora-crossfader-panel"
    :class="{ 'lora-crossfader-panel--off': !prompts.loraCrossfaderOn }"
    :style="crossfadeWeightStyle"
    data-testid="crossfader-panel"
  >
    <div class="framesync-header crossfader-panel__header">
      <div class="framesync-title">
        <UiIcon class="framesync-title-icon" name="sliders" />
        <span class="framesync-accent">Crossfader</span>
      </div>
      <div class="prompt-toolbar">
        <button
          type="button"
          class="framesync-button"
          :class="{ 'framesync-button--live': prompts.loraCrossfaderOn }"
          data-testid="crossfader-enable"
          @click="setLoraCrossfaderOn(true)"
        >
          Enabled
        </button>
        <button
          type="button"
          class="framesync-button"
          :class="{ active: !prompts.loraCrossfaderOn }"
          data-testid="crossfader-disable"
          @click="setLoraCrossfaderOn(false)"
        >
          Disabled
        </button>
        <button type="button" class="framesync-button" @click="refreshLoras">Refresh LoRAs</button>
      </div>
    </div>

    <div class="crossfader-panel__generic">
      <div class="framesync-subtitle">Generic prompt</div>
      <div class="prompt-input-row">
        <textarea
          class="framesync-input prompt-input-row__input"
          v-model="performance.genericPrompt"
          rows="2"
          placeholder="Base prompt for this session — blended with morph slots below"
          data-testid="crossfader-generic-prompt"
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
      <div v-if="speechPromptError" class="framesync-subtitle crossfader-panel__warn">{{ speechPromptError }}</div>
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

    <div class="crossfader-panel__mixer">
      <div class="framesync-subtitle lora-crossfader-summary__status">{{ loraCrossfaderSummary }}</div>

      <Crossfader
        :model-value="performance.crossfader"
        :disabled="!prompts.loraCrossfaderOn"
        testid="crossfader-slider"
        @update:model-value="onCrossfaderSlider"
      />

      <div class="lora-crossfader-links" :class="{ 'lora-crossfader-links--disabled': !prompts.loraCrossfaderOn }">
        <button
          type="button"
          class="framesync-button"
          :class="{ active: !prompts.loraCrossfaderLfoLink }"
          @click="setLoraCrossfaderLfoLink(null)"
        >
          Manual
        </button>
        <button
          v-for="lfo in lfos.slice(0, 6)"
          :key="'crossfader-lfo-' + lfo.id"
          type="button"
          class="framesync-button"
          :class="{ active: prompts.loraCrossfaderLfoLink === lfo.id }"
          @click="setLoraCrossfaderLfoLink(lfo.id)"
        >
          LFO {{ lfo.id }}
        </button>
      </div>
      <div class="lora-crossfader-status">{{ loraCrossfaderLinkStatus }}</div>
    </div>

    <section class="crossfader-panel__section" data-testid="crossfader-morph-slots">
      <div class="crossfade-deck-head">
        <span class="framesync-subtitle crossfader-panel__section-title">Morph slots</span>
        <select class="framesync-select crossfader-panel__slot-type" v-model="performance.newSlotType">
          <option v-for="st in crossfadeSlotTypes" :key="st.id" :value="st.id">{{ st.label }}</option>
        </select>
        <button type="button" class="framesync-button framesync-button--compact" @click="addCrossfadeSlot">+ Add slot</button>
      </div>
      <p class="framesync-subtitle crossfader-panel__hint">
        Blend prompts, styles, parameters, single LoRAs, or ControlNet weights between A and B.
      </p>

      <div v-if="!performance.slots.length" class="crossfade-empty">
        Add morph slots to crossfade prompts, styles, parameters, LoRAs, or ControlNet.
      </div>

      <div v-for="slot in performance.slots" :key="slot.id" class="crossfade-slot-row">
        <div class="crossfade-side crossfade-side-a">
          <span class="crossfade-side-label">A</span>
          <template v-if="slot.type === 'prompt'">
            <input class="framesync-input" v-model="slot.valueA" placeholder="Prompt A" @input="onPerformanceInput">
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
            <input class="framesync-input" v-model="slot.valueB" placeholder="Prompt B" @input="onPerformanceInput">
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

        <div v-if="slotMorphedPreview(slot) !== null" class="crossfade-morphed">
          <span class="framesync-subtitle" style="margin:0;font-size:9px;">→</span>
          <code class="crossfade-morphed-val">{{ formatMorphedPreview(slot) }}</code>
        </div>
      </div>
    </section>

    <section class="crossfader-panel__section" data-testid="crossfader-lora-groups">
      <div class="framesync-subtitle crossfader-panel__section-title">LoRA groups</div>
      <p class="framesync-subtitle crossfader-panel__hint">
        Stack multiple LoRAs on each side — strengths scale with the crossfader when enabled.
      </p>

      <div class="prompt-ab-summary lora-crossfader-panel__deck">
        <div
          class="prompt-ab-column prompt-ab-column--a lora-crossfader-panel__side lora-crossfader-panel__side--a"
          :class="{ 'lora-crossfader-panel__side--dominant': crossfadeAWeight >= crossfadeBWeight }"
        >
          <div class="prompt-ab-column__head">
            <div class="prompt-ab-column__title">A Group</div>
            <button
              type="button"
              class="framesync-button lora-picker-trigger"
              :title="loraCrossfaderPickerGroup === 'A' ? 'Close LoRA picker' : 'Add LoRA to A group'"
              @click="toggleLoraCrossfaderPicker('A')"
            >
              {{ loraCrossfaderPickerGroup === 'A' ? '×' : '+' }}
            </button>
          </div>
          <div v-if="loraCrossfaderPickerGroup === 'A'" class="lora-picker-panel lora-picker-panel--column">
            <div class="framesync-subtitle lora-browser-summary">Add LoRAs to the A group.</div>
            <div class="lora-picker-families">
              <section v-for="family in compatibleLoraFamilies" :key="'xfpick-a-' + family.key" class="lora-picker-family">
                <div class="lora-picker-family__title">{{ family.label }}</div>
                <div class="lora-picker-list">
                  <div v-for="lora in family.items" :key="'xfpick-a-row-' + lora.id" class="lora-picker-row">
                    <div class="lora-picker-row__copy">
                      <div class="lora-picker-row__name">{{ lora.name }}</div>
                      <div class="lora-picker-row__path">{{ lora.path }}</div>
                    </div>
                    <div class="lora-picker-row__actions">
                      <button
                        type="button"
                        class="framesync-button prompt-group-button prompt-group-button--a"
                        :class="{ active: lora.group === 'A' }"
                        @click.stop="assignLoraToGroup(lora, 'A')"
                      >
                        {{ lora.group === 'A' ? 'In A' : 'Add' }}
                      </button>
                      <button type="button" class="framesync-button" v-if="lora.group" @click.stop="unassignLora(lora)">Remove</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div v-if="!compatibleLoraFamilies.length" class="lora-picker-empty">
              No LoRA models found. Refresh or check SD-Forge connection.
            </div>
          </div>
          <div v-for="lora in loras.groupA.slice(0, 4)" :key="'xfa-' + lora.id" class="prompt-ab-card">
            <div class="prompt-ab-card__name">{{ lora.name }}</div>
            <input type="range" min="0" max="2" step="0.01" :value="lora.strength" @input="lora.strength = parseFloat($event.target.value)" class="framesync-input prompt-ab-card__slider">
            <div class="prompt-ab-card__value">{{ lora.strength.toFixed(2) }}</div>
          </div>
          <div v-if="loras.groupA.length === 0" class="prompt-ab-column__empty">No LoRAs in A group</div>
          <div v-else-if="loras.groupA.length > 4" class="prompt-ab-column__more">+{{ loras.groupA.length - 4 }} more</div>
        </div>

        <div
          class="prompt-ab-column prompt-ab-column--b lora-crossfader-panel__side lora-crossfader-panel__side--b"
          :class="{ 'lora-crossfader-panel__side--dominant': crossfadeBWeight > crossfadeAWeight }"
        >
          <div class="prompt-ab-column__head">
            <div class="prompt-ab-column__title">B Group</div>
            <button
              type="button"
              class="framesync-button lora-picker-trigger"
              :title="loraCrossfaderPickerGroup === 'B' ? 'Close LoRA picker' : 'Add LoRA to B group'"
              @click="toggleLoraCrossfaderPicker('B')"
            >
              {{ loraCrossfaderPickerGroup === 'B' ? '×' : '+' }}
            </button>
          </div>
          <div v-if="loraCrossfaderPickerGroup === 'B'" class="lora-picker-panel lora-picker-panel--column">
            <div class="framesync-subtitle lora-browser-summary">Add LoRAs to the B group.</div>
            <div class="lora-picker-families">
              <section v-for="family in compatibleLoraFamilies" :key="'xfpick-b-' + family.key" class="lora-picker-family">
                <div class="lora-picker-family__title">{{ family.label }}</div>
                <div class="lora-picker-list">
                  <div v-for="lora in family.items" :key="'xfpick-b-row-' + lora.id" class="lora-picker-row">
                    <div class="lora-picker-row__copy">
                      <div class="lora-picker-row__name">{{ lora.name }}</div>
                      <div class="lora-picker-row__path">{{ lora.path }}</div>
                    </div>
                    <div class="lora-picker-row__actions">
                      <button
                        type="button"
                        class="framesync-button prompt-group-button prompt-group-button--b"
                        :class="{ active: lora.group === 'B' }"
                        @click.stop="assignLoraToGroup(lora, 'B')"
                      >
                        {{ lora.group === 'B' ? 'In B' : 'Add' }}
                      </button>
                      <button type="button" class="framesync-button" v-if="lora.group" @click.stop="unassignLora(lora)">Remove</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div v-if="!compatibleLoraFamilies.length" class="lora-picker-empty">
              No LoRA models found. Refresh or check SD-Forge connection.
            </div>
          </div>
          <div v-for="lora in loras.groupB.slice(0, 4)" :key="'xfb-' + lora.id" class="prompt-ab-card">
            <div class="prompt-ab-card__name">{{ lora.name }}</div>
            <input type="range" min="0" max="2" step="0.01" :value="lora.strength" @input="lora.strength = parseFloat($event.target.value)" class="framesync-input prompt-ab-card__slider">
            <div class="prompt-ab-card__value">{{ lora.strength.toFixed(2) }}</div>
          </div>
          <div v-if="loras.groupB.length === 0" class="prompt-ab-column__empty">No LoRAs in B group</div>
          <div v-else-if="loras.groupB.length > 4" class="prompt-ab-column__more">+{{ loras.groupB.length - 4 }} more</div>
        </div>
      </div>
    </section>

    <div v-if="performance.status" class="crossfader-panel__status framesync-subtitle">
      <span v-if="previewGenerating" class="lazy-loading-indicator lazy-loading-indicator--subtle">
        <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
        <span>{{ performance.status }}</span>
        <span class="lazy-loading-indicator__dots" aria-hidden="true"><span></span><span></span><span></span></span>
      </span>
      <template v-else>{{ performance.status }}</template>
    </div>

    <div class="framesync-footer crossfader-panel__footer">
      <button type="button" class="framesync-button" @click="applyLoras">Apply LoRAs</button>
    </div>
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'
import Crossfader from './Crossfader.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'CrossfaderPanel',
  components: { UiIcon, Crossfader },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
  computed: {
    crossfadeAWeight() {
      return Math.min(1, Math.max(0, 1 - (Number(this.performance?.crossfader) || 0)))
    },
    crossfadeBWeight() {
      return Math.min(1, Math.max(0, Number(this.performance?.crossfader) || 0))
    },
    crossfadeWeightStyle() {
      return {
        '--crossfade-a-weight': this.crossfadeAWeight,
        '--crossfade-b-weight': this.crossfadeBWeight,
      }
    },
  },
}
</script>
