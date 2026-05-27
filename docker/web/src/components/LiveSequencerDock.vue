<template>
  <div class="live-sequencer-dock" data-testid="live-sequencer-dock" role="region" aria-label="Animation sequencer">
    <div class="live-sequencer-dock__head">
      <div class="live-seq-time" aria-live="polite">
        <span class="live-seq-time__current">{{ sequencerPlayhead.toFixed(2) }}s</span>
        <span class="live-seq-time__sep">/</span>
        <span class="live-seq-time__total">{{ Number(sequencer.durationSec || 0).toFixed(2) }}s</span>
      </div>
      <span
        class="live-seq-status"
        :class="{ 'live-seq-status--playing': sequencerPlaying }"
      >
        {{ sequencerPlaying ? 'Playing' : 'Stopped' }}
      </span>
      <button
        type="button"
        class="live-seq-btn live-seq-btn--ghost"
        :aria-expanded="generateDockExpanded ? 'true' : 'false'"
        @click="generateDockExpanded = !generateDockExpanded; saveSessionState()"
      >
        {{ generateDockExpanded ? 'Less' : 'More' }}
      </button>
    </div>

    <Timeline
      class="live-sequencer-dock__timeline"
      :duration="Number(sequencer.durationSec) || 0"
      :playhead="sequencerPlayhead"
      :markers="sortedSequencerMarkers"
      :tracks="sequencer.tracks"
      :selected-track-id="selectedSequencerTrack ? selectedSequencerTrack.id : ''"
      :param-meta="sequencerParamMetaMap"
      :frames="thumbs"
      :fps="Number(sequencer.fps) || 24"
      :compact="!generateDockExpanded"
      :expandable="true"
      @seek="seekSequencer"
      @jump-marker="jumpToSequencerMarker"
      @select-track="selectSequencerTrack"
      @toggle-compact="generateDockExpanded = !generateDockExpanded; saveSessionState()"
      @update-keyframe="updateSequencerKeyframe"
    />

    <label class="live-seq-scrub">
      <span class="live-seq-scrub__label">Playhead</span>
      <input
        type="range"
        class="live-seq-range"
        min="0"
        :max="Math.max(0.01, sequencer.durationSec)"
        step="0.01"
        v-model.number="sequencerPlayhead"
        aria-label="Scrub playhead"
        @input="previewSequencerFrame"
      >
    </label>

    <div class="live-seq-transport" role="toolbar" aria-label="Sequencer transport">
      <button
        type="button"
        class="live-seq-btn live-seq-btn--primary"
        :aria-label="sequencerPlaying ? 'Pause sequence' : 'Play sequence'"
        @click="toggleSequencerPlayback"
      >
        {{ sequencerPlaying ? 'Pause' : 'Play' }}
      </button>
      <button type="button" class="live-seq-btn" @click="previewSequencerFrame">Preview frame</button>
      <button type="button" class="live-seq-btn" @click="saveSequencerTimeline">Save</button>
      <button type="button" class="live-seq-btn" @click="exportSequencerDownload">Export</button>
      <select class="live-seq-select" v-model="sequencerLoadPick" aria-label="Load saved timeline" @change="loadSequencerTimeline">
        <option value="">Load saved…</option>
        <option v-for="n in sequencerList" :key="'live-seq-'+n" :value="n">{{ n }}</option>
      </select>
    </div>

    <div v-if="generateDockExpanded" class="live-seq-details">
      <div class="live-seq-settings">
        <label class="live-seq-field">
          <span class="live-seq-field__label">Duration (s)</span>
          <input type="number" class="live-seq-input" v-model.number="sequencer.durationSec" min="0.5" max="600" step="0.5" @change="clampSequencerPlayhead">
        </label>
        <label class="live-seq-field">
          <span class="live-seq-field__label">FPS</span>
          <input type="number" class="live-seq-input" v-model.number="sequencer.fps" min="1" max="60" step="1">
        </label>
        <label class="live-seq-check">
          <input type="checkbox" v-model="sequencer.loop">
          <span>Loop timeline</span>
        </label>
        <label class="live-seq-check">
          <input type="checkbox" v-model="sequencer.bpmSync">
          <span>BPM sync</span>
        </label>
      </div>

      <div v-if="sequencer.bpmSync" class="live-seq-settings live-seq-settings--bpm">
        <label class="live-seq-field">
          <span class="live-seq-field__label">BPM</span>
          <input type="number" class="live-seq-input" v-model.number="sequencer.bpm" min="20" max="300" step="0.1">
        </label>
        <label class="live-seq-field">
          <span class="live-seq-field__label">Bars</span>
          <input type="number" class="live-seq-input" v-model.number="sequencer.bars" min="1" max="128" step="1">
        </label>
        <label class="live-seq-field">
          <span class="live-seq-field__label">Beats/bar</span>
          <select class="live-seq-select" v-model.number="sequencer.beatsPerBar">
            <option :value="4">4/4</option>
            <option :value="3">3/4</option>
            <option :value="6">6/8</option>
          </select>
        </label>
        <div class="live-seq-field live-seq-field--calc">
          <span class="live-seq-field__label">Length</span>
          <code class="live-seq-calc">{{ sequencerCalculatedDuration }}s</code>
        </div>
      </div>

      <div class="live-seq-builder">
        <select class="live-seq-select" v-model="sequencerNewParam" aria-label="Parameter for new track">
          <option v-for="opt in sequencerParamOptions" :key="'live-sp-'+opt.key" :value="opt.key">{{ opt.label }}</option>
        </select>
        <button type="button" class="live-seq-btn" @click="addSequencerTrack">+ Track</button>
        <input type="number" class="live-seq-input live-seq-input--value" v-model.number="sequencerKeyframeVal" step="any" placeholder="Value" aria-label="Keyframe value">
        <button type="button" class="live-seq-btn" @click="addSequencerKeyframe">+ Keyframe</button>
        <input type="text" class="live-seq-input live-seq-input--label" v-model.trim="sequencerMarkerName" maxlength="48" placeholder="Marker label" title="1–48 chars: letters, digits, space, _ - .">
        <button type="button" class="live-seq-btn" @click="addSequencerMarker">+ Marker</button>
      </div>

      <div class="generate-sequencer__track-list" v-if="sequencer.tracks.length">
        <div
          v-for="tr in sequencer.tracks"
          :key="tr.id"
          class="generate-track-card"
          :class="{ 'generate-track-card--selected': selectedSequencerTrack && selectedSequencerTrack.id === tr.id }"
        >
          <div class="generate-track-card__header">
            <button type="button" class="generate-track-card__title" @click="selectSequencerTrack(tr.id)">{{ sequencerParamMetaMap[tr.param]?.label || tr.param }}</button>
            <button type="button" class="live-seq-btn live-seq-btn--danger" @click="removeSequencerTrack(tr.id)">Remove track</button>
          </div>
          <div class="generate-track-card__keyframes" v-if="sortedKeyframes(tr).length">
            <div v-for="(kf, ki) in sortedKeyframes(tr)" :key="tr.id+'-'+ki+'-'+(kf.t||0)" class="generate-track-card__keyframe-row">
              <span class="generate-track-card__keyframe-time">{{ kf.t.toFixed(2) }}s</span>
              <span class="generate-track-card__keyframe-value">{{ kf.v.toFixed(3) }}</span>
              <select class="live-seq-select generate-track-card__easing" :value="kf.easing || 'linear'" title="Easing to next keyframe" @change="setKeyframeEasing(kf, $event.target.value)">
                <option value="linear">linear</option>
                <option value="easeIn">easeIn</option>
                <option value="easeOut">easeOut</option>
                <option value="easeInOut">easeInOut</option>
              </select>
              <button type="button" class="live-seq-btn live-seq-btn--danger" title="Remove keyframe" @click="removeSequencerKeyframe(tr.id, ki)">Remove</button>
            </div>
          </div>
          <div v-else class="generate-track-card__empty">No keyframes yet.</div>
        </div>
      </div>

      <div class="generate-sequencer__markers" v-if="sortedSequencerMarkers.length">
        <div v-for="(m, mi) in sortedSequencerMarkers" :key="'live-mrow-'+mi+'-'+(m.t||0)" class="generate-marker-row">
          <button type="button" class="live-seq-btn generate-marker-row__jump" @click="jumpToSequencerMarker(m)">{{ m.name }} @ {{ m.t.toFixed(2) }}s</button>
          <select class="live-seq-select generate-marker-row__action" :value="m.action || 'jump'" @change="setMarkerAction(m, $event.target.value)">
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
            class="live-seq-input generate-marker-row__target"
            :value="m.target || ''"
            :placeholder="markerActionPlaceholder(m.action)"
            @change="setMarkerTarget(m, $event.target.value)"
            :title="markerActionTitle(m.action)"
          >
          <span v-else class="generate-marker-row__hint">
            {{ m.action === 'jump' ? 'jump to time' : (m.action === 'generate' ? 'trigger generation' : (m.action === 'pause' ? 'pause playback' : '')) }}
          </span>
          <button type="button" class="live-seq-btn live-seq-btn--danger" title="Remove marker" @click="removeSequencerMarker(mi)">Remove</button>
        </div>
      </div>
      <div v-else class="generate-sequencer__empty-markers">No markers yet.</div>

      <div v-if="sequencerStatus" class="generate-sequencer__status-text">{{ sequencerStatus }}</div>
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './views/app-view-proxy.js'
import Timeline from './generate/Timeline.vue'

export default {
  name: 'LiveSequencerDock',
  components: { Timeline },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
