<template>
  <div class="rack">
    <div class="framesync-panel">
      <div class="framesync-header">
        <div class="framesync-title">Animation <span class="framesync-accent">Sequencer</span></div>
        <span class="generate-sequencer__status" :class="{ 'generate-sequencer__status--live': sequencerPlaying }">
          {{ sequencerPlaying ? 'Playing' : 'Stopped' }}
        </span>
      </div>

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

      <div class="generate-sequencer__transport generate-sequencer__transport--secondary">
        <label class="generate-sequencer__field">
          <span class="framesync-subtitle">Duration (s)</span>
          <input type="number" class="framesync-input" v-model.number="sequencer.durationSec" min="0.5" max="600" step="0.5" @change="clampSequencerPlayhead">
        </label>
        <label class="generate-sequencer__field">
          <span class="framesync-subtitle">FPS</span>
          <input type="number" class="framesync-input" v-model.number="sequencer.fps" min="1" max="60" step="1">
        </label>
        <label class="generate-sequencer__toggle">
          <span class="framesync-subtitle">Loop</span>
          <span><input type="checkbox" v-model="sequencer.loop"> Repeat timeline</span>
        </label>
        <label class="generate-sequencer__toggle">
          <span class="framesync-subtitle">BPM Sync</span>
          <span><input type="checkbox" v-model="sequencer.bpmSync"> Sync to audio BPM</span>
        </label>
      </div>

      <div v-if="sequencer.bpmSync" class="generate-sequencer__transport generate-sequencer__transport--secondary">
        <label class="generate-sequencer__field">
          <span class="framesync-subtitle">BPM</span>
          <input type="number" class="framesync-input" v-model.number="sequencer.bpm" min="20" max="300" step="0.1">
        </label>
        <label class="generate-sequencer__field">
          <span class="framesync-subtitle">Bars</span>
          <input type="number" class="framesync-input" v-model.number="sequencer.bars" min="1" max="128" step="1">
        </label>
        <label class="generate-sequencer__field">
          <span class="framesync-subtitle">Beats/Bar</span>
          <select class="framesync-select" v-model.number="sequencer.beatsPerBar">
            <option value="4">4/4</option>
            <option value="3">3/4</option>
            <option value="6">6/8</option>
          </select>
        </label>
        <div class="generate-sequencer__field generate-sequencer__field--calc">
          <span class="framesync-subtitle">Calculated</span>
          <code>{{ sequencerCalculatedDuration }}s</code>
        </div>
      </div>

      <div class="generate-sequencer__timeline-tools">
        <label class="generate-sequencer__playhead">
          <span class="framesync-subtitle">Playhead (s)</span>
          <input type="range" class="framesync-input" min="0" :max="Math.max(0.01, sequencer.durationSec)" step="0.01" v-model.number="sequencerPlayhead" @input="previewSequencerFrame">
        </label>
        <div class="generate-sequencer__marker-tools">
          <input type="text" class="framesync-input" v-model.trim="sequencerMarkerName" maxlength="48" placeholder="Label" title="1–48 chars: letters, digits, space, _ - .">
          <button type="button" class="framesync-button" @click="addSequencerMarker">+ Marker @ playhead</button>
        </div>
      </div>

      <Timeline
        :duration="Number(sequencer.durationSec) || 0"
        :playhead="sequencerPlayhead"
        :markers="sortedSequencerMarkers"
        :tracks="sequencer.tracks"
        :selected-track-id="selectedSequencerTrack ? selectedSequencerTrack.id : ''"
        :param-meta="sequencerParamMetaMap"
        :frames="thumbs"
        :fps="Number(sequencer.fps) || 24"
        :compact="false"
        :expandable="false"
        @seek="seekSequencer"
        @jump-marker="jumpToSequencerMarker"
        @select-track="selectSequencerTrack"
        @update-keyframe="updateSequencerKeyframe"
      />

      <div class="generate-sequencer__actions">
        <div class="generate-sequencer__track-builder">
          <select class="framesync-input" v-model="sequencerNewParam">
            <option v-for="opt in sequencerParamOptions" :key="'sp-'+opt.key" :value="opt.key">{{ opt.label }}</option>
          </select>
          <button type="button" class="framesync-button" @click="addSequencerTrack">+ Track</button>
          <input type="number" class="framesync-input" v-model.number="sequencerKeyframeVal" step="any" placeholder="Keyframe value">
          <button type="button" class="framesync-button" @click="addSequencerKeyframe">+ Keyframe @ playhead</button>
        </div>
        <div class="generate-sequencer__transport-actions">
          <button type="button" class="framesync-button" @click="toggleSequencerPlayback">{{ sequencerPlaying ? 'Stop' : 'Play' }}</button>
          <button type="button" class="framesync-button" @click="previewSequencerFrame">Preview frame</button>
          <button type="button" class="framesync-button" @click="saveSequencerTimeline">Save</button>
          <button type="button" class="framesync-button" @click="exportSequencerDownload">Export JSON</button>
          <select class="framesync-input" v-model="sequencerLoadPick" @change="loadSequencerTimeline">
            <option value="">Load saved…</option>
            <option v-for="n in sequencerList" :key="'seq-'+n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>

      <div class="generate-sequencer__details">
        <div class="generate-sequencer__track-list" v-if="sequencer.tracks.length">
          <div
            v-for="tr in sequencer.tracks"
            :key="tr.id"
            class="generate-track-card"
            :class="{ 'generate-track-card--selected': selectedSequencerTrack && selectedSequencerTrack.id === tr.id }"
          >
            <div class="generate-track-card__header">
              <button type="button" class="generate-track-card__title" @click="selectSequencerTrack(tr.id)">{{ sequencerParamMetaMap[tr.param]?.label || tr.param }}</button>
              <button type="button" class="framesync-button generate-track-card__remove" @click="removeSequencerTrack(tr.id)">Remove track</button>
            </div>
            <div class="generate-track-card__keyframes" v-if="sortedKeyframes(tr).length">
              <div v-for="(kf, ki) in sortedKeyframes(tr)" :key="tr.id+'-'+ki+'-'+(kf.t||0)" class="generate-track-card__keyframe-row">
                <span class="generate-track-card__keyframe-time">{{ kf.t.toFixed(2) }}s</span>
                <span class="generate-track-card__keyframe-value">{{ kf.v.toFixed(3) }}</span>
                <select class="framesync-input generate-track-card__easing" :value="kf.easing || 'linear'" title="Easing to next keyframe" @change="setKeyframeEasing(kf, $event.target.value)">
                  <option value="linear">linear</option>
                  <option value="easeIn">easeIn</option>
                  <option value="easeOut">easeOut</option>
                  <option value="easeInOut">easeInOut</option>
                </select>
                <button type="button" class="generate-track-card__delete" title="Remove" @click="removeSequencerKeyframe(tr.id, ki)">Remove</button>
              </div>
            </div>
            <div v-else class="generate-track-card__empty">No keyframes yet.</div>
          </div>
        </div>

        <div class="generate-sequencer__markers" v-if="sortedSequencerMarkers.length">
          <div v-for="(m, mi) in sortedSequencerMarkers" :key="'mrow-'+mi+'-'+(m.t||0)" class="generate-marker-row">
            <button type="button" class="framesync-button generate-marker-row__jump" @click="jumpToSequencerMarker(m)">{{ m.name }} @ {{ m.t.toFixed(2) }}s</button>
            <select class="framesync-input generate-marker-row__action" :value="m.action || 'jump'" @change="setMarkerAction(m, $event.target.value)">
              <option value="jump">Jump</option>
              <option value="preset">Preset</option>
              <option value="generate">Generate</option>
              <option value="morph">Morph</option>
              <option value="param">Params</option>
              <option value="pause">Pause</option>
            </select>
            <input
              v-if="m.action && m.action !== 'jump' && m.action !== 'generate' && m.action !== 'pause'"
              type="text"
              class="framesync-input generate-marker-row__target"
              :value="m.target || ''"
              :placeholder="markerActionPlaceholder(m.action)"
              @change="setMarkerTarget(m, $event.target.value)"
              :title="markerActionTitle(m.action)"
            >
            <span v-else class="generate-marker-row__hint">
              {{ m.action === 'jump' ? 'jump to time' : (m.action === 'generate' ? 'trigger generation' : (m.action === 'pause' ? 'pause playback' : '')) }}
            </span>
            <button type="button" class="generate-marker-row__delete" title="Remove" @click="removeSequencerMarker(mi)">Remove</button>
          </div>
        </div>
        <div v-else class="generate-sequencer__empty-markers">No markers yet.</div>

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
  </div>
</template>

<script>
import { proxyAppView } from './app-view-proxy.js'
import Timeline from '../generate/Timeline.vue'

export default {
  name: 'GenerateView',
  components: { Timeline },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
