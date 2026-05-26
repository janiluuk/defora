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
