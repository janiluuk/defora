<template>
  <div class="rack generate-view">
    <div class="framesync-panel">
      <div class="framesync-header">
        <div class="framesync-title">Animation <span class="framesync-accent">Sequencer</span></div>
        <span class="generate-sequencer__status" :class="{ 'generate-sequencer__status--live': sequencerPlaying }">
          {{ sequencerPlaying ? 'Playing' : 'Stopped' }}
        </span>
      </div>

      <p class="generate-sequencer__live-hint">
        Edit the timeline on the video stage below — open <button type="button" class="generate-sequencer__live-link" @click="switchTab('LIVE')">LIVE</button> for full-screen monitoring with touch and keyboard controls.
      </p>

      <SequencerControlsPanel :app="$props.app" summary-only :show-timeline="false" />

      <div
        class="generate-sequencer__frame-hero generate-sequencer__frame-hero--compact"
        :class="{ 'generate-sequencer__frame-hero--live': sequencerJobFrameLive }"
      >
        <div class="generate-sequencer__frame-hero-label">Job frame</div>
        <div class="generate-sequencer__frame-hero-value">
          <span class="generate-sequencer__frame-hero-current">{{ sequencerJobFrameNumber }}</span>
          <span class="generate-sequencer__frame-hero-sep">/</span>
          <span class="generate-sequencer__frame-hero-total">{{ sequencerJobTotalFrames }}</span>
        </div>
      </div>

      <div v-if="sequencerStatus || performance.status || generator.status" class="generate-story__story-result">
        <div class="framesync-header">
          <div class="framesync-subtitle generate-story__section-title">Preview + Story status</div>
          <span
            class="generate-sequencer__status"
            :class="{ 'generate-sequencer__status--live': /frame ready/i.test(String(performance.status || '')) }"
          >
            {{ /frame ready/i.test(String(performance.status || '')) ? 'Frame ready' : (sequencerPlaying ? 'Playing' : 'Idle') }}
          </span>
        </div>
        <div v-if="sequencerStatus" class="generate-sequencer__status-text">{{ sequencerStatus }}</div>
        <div v-if="performance.status" class="generate-sequencer__status-text">{{ performance.status }}</div>
        <div v-if="generator.status" class="framesync-subtitle generate-story__status-line">{{ generator.status }}</div>
      </div>

      <div v-if="generator.result" class="generate-story__story-result">
        <div class="framesync-header">
          <div class="framesync-subtitle generate-story__section-title">Story generation text</div>
          <div class="prompt-toolbar">
            <span class="pill" v-if="generator.result.source && generator.result.source.model">{{ generator.result.source.model }}</span>
            <button class="framesync-button" @click="switchTab('PROMPTS'); switchSubTab('PROMPTS', 'STORY')">Open Story Generator</button>
          </div>
        </div>
        <pre class="generate-story__story-text">{{ generator.result.formatted }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import SequencerControlsPanel from '../SequencerControlsPanel.vue'
import { proxyAppView } from './app-view-proxy.js'

export default {
  name: 'GenerateView',
  components: { SequencerControlsPanel },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
