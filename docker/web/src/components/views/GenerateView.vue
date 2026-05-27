<template>
  <div class="rack">
    <div class="framesync-panel">
      <div class="framesync-header">
        <div class="framesync-title">Animation <span class="framesync-accent">Sequencer</span></div>
        <span class="generate-sequencer__status" :class="{ 'generate-sequencer__status--live': sequencerPlaying }">
          {{ sequencerPlaying ? 'Playing' : 'Stopped' }}
        </span>
      </div>

      <p class="generate-sequencer__live-hint">
        Edit the timeline on the <button type="button" class="generate-sequencer__live-link" @click="switchTab('LIVE')">LIVE</button> view — the sequencer sits on the video with controls sized for touch and keyboard.
      </p>

      <div class="generate-sequencer__hero-grid">
        <div class="generate-sequencer__hero-card">
          <div class="framesync-subtitle">Tracks</div>
          <div class="generate-sequencer__hero-value">{{ sequencer.tracks.length }}</div>
          <div class="generate-sequencer__hero-meta">{{ selectedSequencerTrack ? (sequencerParamMetaMap[selectedSequencerTrack.param]?.label || selectedSequencerTrack.param) : 'No track selected' }}</div>
        </div>
        <div class="generate-sequencer__hero-card">
          <div class="framesync-subtitle">Markers</div>
          <div class="generate-sequencer__hero-value">{{ sortedSequencerMarkers.length }}</div>
          <div class="generate-sequencer__hero-meta">{{ sortedSequencerMarkers.length ? 'Scene triggers ready' : 'No marker cues yet' }}</div>
        </div>
        <div class="generate-sequencer__hero-card">
          <div class="framesync-subtitle">Playhead</div>
          <div class="generate-sequencer__hero-value">{{ sequencerPlayhead.toFixed(2) }}s</div>
          <div class="generate-sequencer__hero-meta">{{ Number(sequencer.durationSec || 0).toFixed(2) }}s timeline</div>
        </div>
        <div class="generate-sequencer__hero-card">
          <div class="framesync-subtitle">Preview</div>
          <div class="generate-sequencer__hero-value generate-sequencer__hero-value--status">
            {{ /frame ready/i.test(String(performance.status || '')) ? 'Ready' : 'Idle' }}
          </div>
          <div class="generate-sequencer__hero-meta">{{ performance.status || 'Preview status appears here' }}</div>
        </div>
      </div>

      <div v-if="sequencerStatus || performance.status || generator.status" class="generate-story__story-result">
        <div class="framesync-header">
          <div class="framesync-subtitle" style="margin:0;">Preview + Story status</div>
          <span
            class="generate-sequencer__status"
            :class="{ 'generate-sequencer__status--live': /frame ready/i.test(String(performance.status || '')) }"
          >
            {{ /frame ready/i.test(String(performance.status || '')) ? 'Frame ready' : (sequencerPlaying ? 'Playing' : 'Idle') }}
          </span>
        </div>
        <div v-if="sequencerStatus" class="generate-sequencer__status-text">{{ sequencerStatus }}</div>
        <div v-if="performance.status" class="generate-sequencer__status-text">{{ performance.status }}</div>
        <div v-if="generator.status" class="framesync-subtitle" style="margin-top:8px;">{{ generator.status }}</div>
      </div>

      <div v-if="generator.result" class="generate-story__story-result">
        <div class="framesync-header">
          <div class="framesync-subtitle" style="margin:0;">Story generation text</div>
          <div class="framesync-footer" style="margin:0;">
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
import { proxyAppView } from './app-view-proxy.js'

export default {
  name: 'GenerateView',
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
