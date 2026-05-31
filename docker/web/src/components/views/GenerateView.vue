<template>
  <div v-if="storyOnly" class="generate-story-strip">
    <button
      type="button"
      class="generate-story-strip__toggle"
      :aria-expanded="storyStripOpen ? 'true' : 'false'"
      @click="storyStripOpen = !storyStripOpen"
    >
      <span>Story</span>
      <span v-if="generator.result && generator.result.source && generator.result.source.model" class="generate-story-strip__pill">
        {{ generator.result.source.model }}
      </span>
      <span v-else-if="generator.status" class="generate-story-strip__pill generate-story-strip__pill--dim">{{ generator.status }}</span>
      <UiIcon class="generate-story-strip__chevron" :name="storyStripOpen ? 'chevron-up' : 'chevron-down'" />
    </button>
    <div v-if="storyStripOpen" class="generate-story-strip__body">
      <div v-if="generator.status" class="generate-story-strip__line">{{ generator.status }}</div>
      <pre v-if="generator.result && generator.result.formatted" class="generate-story-strip__text">{{ generator.result.formatted }}</pre>
      <button
        v-if="!generator.result"
        type="button"
        class="framesync-button framesync-button--compact"
        @click="switchTab('PROMPTS'); switchSubTab('PROMPTS', 'STORY')"
      >
        Open Story Generator
      </button>
    </div>
  </div>

  <div v-else class="rack generate-view generate-view--dock" data-testid="generate-view-dock">
    <div class="framesync-panel generate-dock-panel">
      <div class="framesync-header">
        <div class="framesync-title">Animation <span class="framesync-accent">Sequencer</span></div>
        <span class="generate-sequencer__status" :class="{ 'generate-sequencer__status--live': sequencerPlaying }">
          {{ sequencerPlaying ? 'Playing' : 'Stopped' }}
        </span>
      </div>

      <div class="generate-dock-sync" data-testid="generate-dock-sync">
        <div class="generate-dock-sync__metric">
          <span class="generate-dock-sync__label">Playhead</span>
          <code class="generate-dock-sync__value motion-readout">{{ sequencerPlayhead.toFixed(2) }}s</code>
        </div>
        <div class="generate-dock-sync__metric">
          <span class="generate-dock-sync__label">Duration</span>
          <code class="generate-dock-sync__value motion-readout">{{ Number(sequencer.durationSec || 0).toFixed(2) }}s</code>
        </div>
        <div class="generate-dock-sync__metric">
          <span class="generate-dock-sync__label">Frame</span>
          <code class="generate-dock-sync__value motion-readout">{{ sequencerJobFrameNumber }}/{{ sequencerJobTotalFrames }}</code>
        </div>
        <div class="generate-dock-sync__metric">
          <span class="generate-dock-sync__label">FPS</span>
          <code class="generate-dock-sync__value motion-readout">{{ masterFps }}</code>
        </div>
      </div>

      <p class="generate-sequencer__live-hint">
        Preview stays above the timeline dock. Transport, scrubber, and tracks share one playhead — open <strong>Edit</strong> on the dock for clip details.
      </p>

      <div class="generate-dock-actions">
        <button
          type="button"
          class="framesync-button framesync-button--compact"
          :class="{ active: motionSequencerSideOpen }"
          data-testid="generate-open-sequencer-editor"
          @click="motionSequencerSideOpen = !motionSequencerSideOpen; saveSessionState()"
        >
          {{ motionSequencerSideOpen ? 'Hide editor' : 'Open editor' }}
        </button>
        <button type="button" class="framesync-button framesync-button--compact" @click="switchTab('MOTION')">
          Motion controls
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import UiIcon from '../UiIcon.vue'
import { proxyAppView } from './app-view-proxy.mjs'

export default {
  name: 'GenerateView',
  components: { UiIcon },
  props: {
    app: { type: Object, required: true },
    storyOnly: { type: Boolean, default: false },
  },
  data() {
    return { storyStripOpen: false };
  },
  setup(props) {
    return proxyAppView(props);
  },
}
</script>
