<template>
  <div
    class="morph-crossfader-panel"
    :style="crossfadeWeightStyle"
  >
    <div class="morph-crossfader-hero">
      <div class="framesync-header morph-crossfader-hero__header">
        <div class="framesync-title">Morph <span class="framesync-accent">Crossfader</span></div>
        <code class="morph-crossfader-hero__readout">
          A {{ crossfadeAPercent }}% · B {{ crossfadeBPercent }}%
        </code>
      </div>
      <Crossfader
        :model-value="performance.crossfader"
        @update:model-value="onMorphCrossfaderInput"
        testid="modulation-morph-crossfader"
      />
      <div class="lora-crossfader-links morph-crossfader-links">
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
          :key="'morph-crossfader-lfo-' + lfo.id"
          type="button"
          class="framesync-button"
          :class="{ active: prompts.loraCrossfaderLfoLink === lfo.id }"
          @click="setLoraCrossfaderLfoLink(lfo.id)"
        >
          LFO {{ lfo.id }}
        </button>
      </div>
      <div class="lora-crossfader-status morph-crossfader-status">{{ loraCrossfaderLinkStatus }}</div>
      <div class="framesync-subtitle morph-crossfader-panel__summary">
        <span class="live-hud-morph__slot live-hud-morph__slot--a">{{ morphHudSummary.a }}</span>
        <span class="live-hud-morph__slot live-hud-morph__slot--b">{{ morphHudSummary.b }}</span>
      </div>
      <div class="morph-crossfader-center__add">
        <select class="framesync-select" v-model="performance.newSlotType">
          <option v-for="st in crossfadeSlotTypes" :key="'morph-add-' + st.id" :value="st.id">{{ st.label }}</option>
        </select>
        <button type="button" class="framesync-button" @click="addCrossfadeSlot">+ Add</button>
      </div>
    </div>

    <div class="prompt-ab-summary morph-crossfader-deck morph-crossfader-deck--split">
      <div
        class="prompt-ab-column prompt-ab-column--a morph-crossfader-deck__side morph-crossfader-deck__side--a"
        :class="{ 'morph-crossfader-deck__side--dominant': crossfadeAWeight >= crossfadeBWeight }"
      >
        <div class="prompt-ab-column__head">
          <div class="prompt-ab-column__title">A Group</div>
          <span class="morph-crossfader-deck__weight">{{ crossfadeAPercent }}%</span>
        </div>
        <template v-for="typeDef in crossfadeSlotTypes" :key="'morph-a-type-' + typeDef.id">
          <div v-if="slotsOfType(typeDef.id).length" class="morph-crossfader__section">
            <div class="morph-crossfader__section-label">{{ typeDef.label }}</div>
            <div
              v-for="slot in slotsOfType(typeDef.id)"
              :key="'morph-a-' + slot.id"
              class="prompt-ab-card morph-crossfader__card"
            >
              <div class="morph-crossfader__card-head">
                <div class="prompt-ab-card__name">{{ slotCardTitle(slot, 'A') }}</div>
                <button type="button" class="framesync-button framesync-button--danger framesync-button--compact morph-crossfader__remove" @click="removeCrossfadeSlot(slot.id)" title="Remove">✕</button>
              </div>
              <div class="morph-crossfader__card-body">
                <template v-if="slot.type === 'prompt'">
                  <textarea class="framesync-input morph-crossfader__textarea" rows="2" v-model="slot.valueA" placeholder="Prompt A" @input="onPerformanceInput"></textarea>
                </template>
                <template v-else-if="slot.type === 'param'">
                  <select class="framesync-select" v-model="slot.paramKey" @change="onPerformanceInput">
                    <option v-for="t in lfoTargets" :key="'morph-a-param-' + slot.id + t.key" :value="t.key">{{ t.label }}</option>
                  </select>
                  <input type="number" class="framesync-input" v-model.number="slot.valueA" step="any" placeholder="Value A" @input="onPerformanceInput">
                </template>
                <template v-else-if="slot.type === 'lora'">
                  <select class="framesync-select" v-model="slot.valueA" @change="onPerformanceInput">
                    <option :value="null">— none —</option>
                    <option v-for="l in loras.available" :key="'morph-a-lora-' + slot.id + l.id" :value="l.name">{{ l.name }}</option>
                  </select>
                  <input type="range" min="0" max="2" step="0.01" :value="slot.loraStrengthA" @input="slot.loraStrengthA = parseFloat($event.target.value); onPerformanceInput()" class="framesync-input prompt-ab-card__slider">
                  <div class="prompt-ab-card__value">{{ Number(slot.loraStrengthA || 0).toFixed(2) }}</div>
                </template>
                <template v-else-if="slot.type === 'controlnet'">
                  <select class="framesync-select" v-model="slot.cnSlotId" @change="onPerformanceInput">
                    <option v-for="s in cn.slots" :key="'morph-a-cn-' + slot.id + s.id" :value="s.id">{{ s.label }}</option>
                  </select>
                  <input type="range" min="0" max="2" step="0.01" :value="slot.valueA" @input="slot.valueA = parseFloat($event.target.value); onPerformanceInput()" class="framesync-input prompt-ab-card__slider">
                  <div class="prompt-ab-card__value">{{ Number(slot.valueA || 0).toFixed(2) }}</div>
                </template>
              </div>
            </div>
          </div>
        </template>
        <div v-if="!performance.slots.length" class="prompt-ab-column__empty">No A-side items yet</div>
      </div>

      <div
        class="prompt-ab-column prompt-ab-column--b morph-crossfader-deck__side morph-crossfader-deck__side--b"
        :class="{ 'morph-crossfader-deck__side--dominant': crossfadeBWeight > crossfadeAWeight }"
      >
        <div class="prompt-ab-column__head">
          <div class="prompt-ab-column__title">B Group</div>
          <span class="morph-crossfader-deck__weight">{{ crossfadeBPercent }}%</span>
        </div>
        <template v-for="typeDef in crossfadeSlotTypes" :key="'morph-b-type-' + typeDef.id">
          <div v-if="slotsOfType(typeDef.id).length" class="morph-crossfader__section">
            <div class="morph-crossfader__section-label">{{ typeDef.label }}</div>
            <div
              v-for="slot in slotsOfType(typeDef.id)"
              :key="'morph-b-' + slot.id"
              class="prompt-ab-card morph-crossfader__card"
            >
              <div class="morph-crossfader__card-head">
                <div class="prompt-ab-card__name">{{ slotCardTitle(slot, 'B') }}</div>
              </div>
              <div class="morph-crossfader__card-body">
                <template v-if="slot.type === 'prompt'">
                  <textarea class="framesync-input morph-crossfader__textarea" rows="2" v-model="slot.valueB" placeholder="Prompt B" @input="onPerformanceInput"></textarea>
                </template>
                <template v-else-if="slot.type === 'param'">
                  <input type="number" class="framesync-input" v-model.number="slot.valueB" step="any" placeholder="Value B" @input="onPerformanceInput">
                </template>
                <template v-else-if="slot.type === 'lora'">
                  <select class="framesync-select" v-model="slot.valueB" @change="onPerformanceInput">
                    <option :value="null">— none —</option>
                    <option v-for="l in loras.available" :key="'morph-b-lora-' + slot.id + l.id" :value="l.name">{{ l.name }}</option>
                  </select>
                  <input type="range" min="0" max="2" step="0.01" :value="slot.loraStrengthB" @input="slot.loraStrengthB = parseFloat($event.target.value); onPerformanceInput()" class="framesync-input prompt-ab-card__slider">
                  <div class="prompt-ab-card__value">{{ Number(slot.loraStrengthB || 0).toFixed(2) }}</div>
                </template>
                <template v-else-if="slot.type === 'controlnet'">
                  <input type="range" min="0" max="2" step="0.01" :value="slot.valueB" @input="slot.valueB = parseFloat($event.target.value); onPerformanceInput()" class="framesync-input prompt-ab-card__slider">
                  <div class="prompt-ab-card__value">{{ Number(slot.valueB || 0).toFixed(2) }}</div>
                </template>
              </div>
              <div v-if="slotMorphedPreview(slot) !== null" class="morph-crossfader__morphed">
                <span class="framesync-subtitle">→</span>
                <code class="crossfade-morphed-val">{{ formatMorphedPreview(slot) }}</code>
              </div>
            </div>
          </div>
        </template>
        <div v-if="!performance.slots.length" class="prompt-ab-column__empty">No B-side items yet</div>
      </div>
    </div>
  </div>
</template>

<script>
import Crossfader from './Crossfader.vue'
import { proxyAppView } from './views/app-view-proxy.js'

export default {
  name: 'MorphCrossfaderPanel',
  components: { Crossfader },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
  computed: {
    crossfadeAWeight() {
      return Math.min(1, Math.max(0, 1 - (Number(this.performance?.crossfader) || 0)));
    },
    crossfadeBWeight() {
      return Math.min(1, Math.max(0, Number(this.performance?.crossfader) || 0));
    },
    crossfadeAPercent() {
      return Math.round(this.crossfadeAWeight * 100);
    },
    crossfadeBPercent() {
      return Math.round(this.crossfadeBWeight * 100);
    },
    crossfadeWeightStyle() {
      return {
        '--crossfade-a-weight': this.crossfadeAWeight,
        '--crossfade-b-weight': this.crossfadeBWeight,
      };
    },
  },
  methods: {
    slotsOfType(typeId) {
      const slots = Array.isArray(this.performance.slots) ? this.performance.slots : [];
      return slots.filter((slot) => slot.type === typeId);
    },
    slotCardTitle(slot, side) {
      if (slot.type === 'prompt') {
        const v = side === 'A' ? slot.valueA : slot.valueB;
        const s = v != null ? String(v).trim() : '';
        return s ? (s.length > 36 ? s.slice(0, 36) + '…' : s) : 'Prompt';
      }
      if (slot.type === 'param') {
        const meta = this.lfoTargets.find((t) => t.key === slot.paramKey);
        const label = meta ? meta.label : slot.paramKey || 'Parameter';
        const v = side === 'A' ? slot.valueA : slot.valueB;
        return `${label} · ${Number(v).toFixed(2)}`;
      }
      if (slot.type === 'lora') {
        const name = side === 'A' ? slot.valueA : slot.valueB;
        const str = side === 'A' ? slot.loraStrengthA : slot.loraStrengthB;
        return name ? `${name} · ${Number(str || 0).toFixed(2)}` : 'LoRA';
      }
      if (slot.type === 'controlnet') {
        const cnSlot = this.cn.slots.find((s) => s.id === slot.cnSlotId);
        const label = cnSlot ? cnSlot.label : slot.cnSlotId;
        const w = side === 'A' ? slot.valueA : slot.valueB;
        return `${label} · ${Number(w || 0).toFixed(2)}`;
      }
      return this.slotTypeLabel(slot.type);
    },
    onMorphCrossfaderInput(val) {
      const next = this.clampVal(Number(val) || 0, 0, 1);
      this.performance.crossfader = next;
      this.prompts.crossfaderValue = next;
      this.prompts.loraCrossfaderLfoBase = next;
      this.onCrossfaderInput();
    },
  },
}
</script>
