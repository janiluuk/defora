<template>
  <div
    class="lora-crossfader-panel"
    :class="{ 'lora-crossfader-panel--off': !prompts.loraCrossfaderOn }"
    :style="crossfadeWeightStyle"
    data-testid="lora-crossfader-panel"
  >
    <div class="framesync-header lora-crossfader-panel__header">
      <div class="framesync-title">LoRA <span class="framesync-accent">Crossfader</span></div>
      <div class="prompt-toolbar">
        <button
          type="button"
          class="framesync-button"
          :class="{ 'framesync-button--live': prompts.loraCrossfaderOn }"
          @click="setLoraCrossfaderOn(true)"
        >
          Enabled
        </button>
        <button
          type="button"
          class="framesync-button"
          :class="{ active: !prompts.loraCrossfaderOn }"
          @click="setLoraCrossfaderOn(false)"
        >
          Disabled
        </button>
        <button type="button" class="framesync-button" @click="refreshLoras">Refresh</button>
      </div>
    </div>

    <div class="lora-crossfader-shell">
      <div class="framesync-subtitle lora-crossfader-summary__status">{{ loraCrossfaderSummary }}</div>

      <Crossfader
        :model-value="prompts.crossfaderValue"
        :disabled="!prompts.loraCrossfaderOn"
        testid="lora-crossfader"
        @update:model-value="applyLoraCrossfader"
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
          :key="'lora-crossfader-lfo-' + lfo.id"
          type="button"
          class="framesync-button"
          :class="{ active: prompts.loraCrossfaderLfoLink === lfo.id }"
          @click="setLoraCrossfaderLfoLink(lfo.id)"
        >
          LFO {{ lfo.id }}
        </button>
      </div>
      <div class="lora-crossfader-status">{{ loraCrossfaderLinkStatus }}</div>

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
            <div class="framesync-subtitle lora-browser-summary">Add LoRAs to the A group for crossfading.</div>
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
          <div v-for="lora in loras.groupA.slice(0, 3)" :key="'xfa-' + lora.id" class="prompt-ab-card">
            <div class="prompt-ab-card__name">{{ lora.name }}</div>
            <input type="range" min="0" max="2" step="0.01" :value="lora.strength" @input="lora.strength = parseFloat($event.target.value)" class="framesync-input prompt-ab-card__slider">
            <div class="prompt-ab-card__value">{{ lora.strength.toFixed(2) }}</div>
          </div>
          <div v-if="loras.groupA.length === 0" class="prompt-ab-column__empty">No LoRAs in A group</div>
          <div v-else-if="loras.groupA.length > 3" class="prompt-ab-column__more">+{{ loras.groupA.length - 3 }} more</div>
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
            <div class="framesync-subtitle lora-browser-summary">Add LoRAs to the B group for crossfading.</div>
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
          <div v-for="lora in loras.groupB.slice(0, 3)" :key="'xfb-' + lora.id" class="prompt-ab-card">
            <div class="prompt-ab-card__name">{{ lora.name }}</div>
            <input type="range" min="0" max="2" step="0.01" :value="lora.strength" @input="lora.strength = parseFloat($event.target.value)" class="framesync-input prompt-ab-card__slider">
            <div class="prompt-ab-card__value">{{ lora.strength.toFixed(2) }}</div>
          </div>
          <div v-if="loras.groupB.length === 0" class="prompt-ab-column__empty">No LoRAs in B group</div>
          <div v-else-if="loras.groupB.length > 3" class="prompt-ab-column__more">+{{ loras.groupB.length - 3 }} more</div>
        </div>
      </div>

      <div class="framesync-footer lora-crossfader-panel__footer">
        <button type="button" class="framesync-button" @click="applyLoras">Apply LoRAs</button>
      </div>
    </div>
  </div>
</template>

<script>
import Crossfader from './Crossfader.vue'
import { proxyAppView } from './views/app-view-proxy.js'

export default {
  name: 'LoraCrossfaderPanel',
  components: { Crossfader },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
  computed: {
    crossfadeAWeight() {
      return Math.min(1, Math.max(0, 1 - (Number(this.prompts?.crossfaderValue) || 0)))
    },
    crossfadeBWeight() {
      return Math.min(1, Math.max(0, Number(this.prompts?.crossfaderValue) || 0))
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
