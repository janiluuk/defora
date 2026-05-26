<template>
  <div class="rack">
    <div class="framesync-panel">
      <div class="framesync-header">
        <div class="framesync-title">Animation <span class="framesync-accent">Sequencer</span></div>
      </div>
      <div class="framesync-subtitle" style="margin-top:10px;">
        Story generation now lives under <strong>PROMPTS → STORY</strong>. Keep using this tab for the animation sequencer and preview controls in the dock beside the canvas.
      </div>
      <div class="framesync-footer" style="margin-top:12px;">
        <button class="framesync-button" @click="switchTab('PROMPTS'); switchSubTab('PROMPTS', 'STORY')">Open Story Generator</button>
      </div>
      <div class="framesync-stack" style="margin-top:12px;">
        <div class="framesync-subtitle">What stays here</div>
        <ul class="framesync-list" style="margin:0; padding-left:18px;">
          <li>Animation sequencer timeline and transport</li>
          <li>Marker placement and keyframe playback</li>
          <li>Preview-frame generation while shaping a clip</li>
        </ul>
      </div>
      <div class="generate-sequencer__details">
        <div v-if="performance.status || generator.status" class="generate-story__story-result">
          <div class="framesync-header">
            <div class="framesync-subtitle" style="margin:0;">Preview + Story status</div>
            <span
              class="generate-sequencer__status"
              :class="{ 'generate-sequencer__status--live': /frame ready/i.test(String(performance.status || '')) }"
            >
              {{ /frame ready/i.test(String(performance.status || '')) ? 'Frame ready' : 'Idle' }}
            </span>
          </div>
          <div v-if="performance.status" class="generate-sequencer__status-text">{{ performance.status }}</div>
          <div v-if="generator.status" class="framesync-subtitle" style="margin-top:8px;">{{ generator.status }}</div>
        </div>
        <div v-if="generator.result" class="generate-story__story-result">
          <div class="framesync-header">
            <div class="framesync-subtitle" style="margin:0;">Story generation text</div>
            <span class="pill" v-if="generator.result.source && generator.result.source.model">{{ generator.result.source.model }}</span>
          </div>
          <pre class="generate-story__story-text">{{ generator.result.formatted }}</pre>
        </div>
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
