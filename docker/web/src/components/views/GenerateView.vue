<template>
  <div class="rack generate-story">
    <div class="framesync-panel generate-story__panel">
      <div class="framesync-header">
        <div class="framesync-title">Story <span class="framesync-accent">Generator</span></div>
        <button class="framesync-button generate-story__hero-action" :disabled="generator.isGenerating" @click="generateStory">
          {{ generator.isGenerating ? 'Generating…' : 'Generate Story' }}
        </button>
      </div>
      <div class="framesync-stack generate-story__field">
        <div class="framesync-subtitle">Theme / Story concept</div>
        <input class="framesync-input" v-model="generator.theme" placeholder="e.g. A Space Traveler, Ancient Forest, Cyberpunk City…">
      </div>
      <div class="generate-story__grid">
        <div class="framesync-stack">
          <div class="framesync-subtitle">Style preset</div>
          <select class="framesync-select" v-model="generator.stylePreset">
            <option value="Masterpiece, Realistic">Masterpiece Realistic</option>
            <option value="Masterpiece, Cinematic">Cinematic</option>
            <option value="Masterpiece, best quality, anime">Anime</option>
            <option value="oil painting, impressionism">Oil Painting</option>
            <option value="digital art, concept art, surrealistic">Surrealist</option>
            <option value="watercolor, illustration">Watercolor</option>
            <option value="custom">Custom…</option>
          </select>
        </div>
        <div class="framesync-stack" v-if="generator.stylePreset === 'custom'">
          <div class="framesync-subtitle">Custom style</div>
          <input class="framesync-input" v-model="generator.customStyle" placeholder="your style keywords">
        </div>
      </div>
      <div class="framesync-subtitle" style="margin-top:10px;">Story engine: {{ storyGeneratorSourceLabel }}</div>
      <div class="framesync-footer generate-story__actions">
        <button class="framesync-button" @click="generateStory">Generate Story</button>
        <button class="framesync-button" @click="generateImage">Generate Image</button>
      </div>
      <div v-if="generator.status" class="generate-story__status">{{ generator.status }}</div>
      <div v-if="generator.result" class="generate-story__story-result">
        <div class="framesync-header">
          <div class="framesync-subtitle" style="margin:0;">Story plan</div>
          <span class="pill" v-if="generator.result.source && generator.result.source.model">{{ generator.result.source.model }}</span>
        </div>
        <pre class="generate-story__story-text">{{ generator.result.formatted }}</pre>
        <div class="framesync-footer generate-story__actions">
          <button class="framesync-button" @click="approveStory">Apply to prompts</button>
          <button class="framesync-button" @click="rejectStory">Discard</button>
        </div>
      </div>
      <div v-if="generator.lastPath" class="generate-story__result">
        <div class="framesync-header">
          <div class="framesync-subtitle" style="margin:0;">Result</div>
          <button class="framesync-button" @click="storyResultCollapsed = !storyResultCollapsed">{{ storyResultCollapsed ? 'Show' : 'Hide' }}</button>
        </div>
        <div v-if="!storyResultCollapsed" class="generate-story__image-wrap">
          <img v-if="generator.lastPath" :src="generator.lastPath" class="generate-story__image">
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
