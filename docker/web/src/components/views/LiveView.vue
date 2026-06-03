<template>
  <div class="live-view" data-testid="live-view">
    <div class="live-view__scroll">
      <GlassPanel size="md" class="live-view__summary" data-testid="live-context-summary">
        <template #header>Live summary</template>
        <div class="live-view__summary-grid">
          <div class="live-view__summary-row">
            <span class="framesync-subtitle">Preview layer</span>
            <strong class="live-view__summary-value">{{ liveActiveLayerLabel }}</strong>
          </div>
          <div class="live-view__summary-row">
            <span class="framesync-subtitle">Deforum</span>
            <strong class="live-view__summary-value">{{ deforumPlaying ? 'Animating' : 'Ready' }}</strong>
          </div>
          <div v-if="prompts && prompts.morphOn" class="live-view__summary-row">
            <span class="framesync-subtitle">Morph</span>
            <strong class="live-view__summary-value">
              A {{ Math.round((1 - performance.crossfader) * 100) }}% · B {{ Math.round(performance.crossfader * 100) }}%
            </strong>
          </div>
        </div>
        <ul v-if="liveContextSummaryParams.length" class="live-view__param-list">
          <li v-for="item in liveContextSummaryParams" :key="'live-sum-' + item.key" class="live-view__param-list-item">
            <span>{{ item.label }}</span>
            <span class="live-view__param-list-meta">{{ item.source }} · {{ Number(item.val).toFixed(2) }}</span>
          </li>
        </ul>
        <p v-else class="framesync-subtitle live-view__summary-empty">
          Pin parameters from the panel below, or route LFO / audio in Modulation.
        </p>
      </GlassPanel>

      <GlassPanel size="md" class="live-view__shortcuts">
        <template #header>Engine shortcuts</template>
        <p class="framesync-subtitle live-view__shortcuts-copy">
          Full Deforum schedules (sampler, ControlNet, motion strings) live in the Engine drawer.
        </p>
        <div class="live-view__shortcut-actions">
          <button
            type="button"
            class="framesync-button framesync-button--live"
            data-testid="live-open-deforum-parameters"
            @click="openDeforumParameters"
          >
            Deforum settings
          </button>
          <button
            type="button"
            class="framesync-button"
            data-testid="live-open-deforum-prompts"
            @click="openEngineDeforumSettingsTab('prompts')"
          >
            Prompt schedules
          </button>
          <button
            type="button"
            class="framesync-button"
            data-testid="live-open-engine-webgl"
            @click="openEngineWebglLayer"
          >
            WebGL visual
          </button>
        </div>
      </GlassPanel>
    </div>
  </div>
</template>

<script>
import GlassPanel from '../GlassPanel.vue'
import { proxyAppView } from './app-view-proxy.mjs'

export default {
  name: 'LiveView',
  components: { GlassPanel },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
  methods: {
    openDeforumParameters() {
      this.liveEngineDrawerOpen = true
      this.promoteToDeforum()
      this.paramPanelOpen = true
      this.saveSessionState()
    },
    openEngineWebglLayer() {
      this.liveEngineDrawerOpen = true
      this.selectVideoLayer('webgl')
      this.saveSessionState()
    },
  },
}
</script>
