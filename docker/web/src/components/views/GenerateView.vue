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
      <div v-if="sequencerStatus" class="generate-story-strip__line">{{ sequencerStatus }}</div>
      <div v-if="performance.status" class="generate-story-strip__line">{{ performance.status }}</div>
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

  <div v-else class="rack generate-view">
    <div class="framesync-panel">
      <div class="framesync-header">
        <div class="framesync-title">Animation <span class="framesync-accent">Sequencer</span></div>
        <span class="generate-sequencer__status" :class="{ 'generate-sequencer__status--live': sequencerPlaying }">
          {{ sequencerPlaying ? 'Playing' : 'Stopped' }}
        </span>
      </div>

      <p class="generate-sequencer__live-hint">
        Timeline and transport live below the video. Switch to the <strong>Sequencer</strong> tab under Motion.
      </p>
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
