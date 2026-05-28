<template>
  <div
    class="sequencer-controls-panel"
    :class="{ 'sequencer-controls-panel--stage': stage }"
    data-testid="sequencer-controls-panel"
  >
    <div v-if="stage" class="stage-sequencer-bar">
      <div class="stage-sequencer-bar__left">
        <button
          type="button"
          class="stage-sequencer-bar__btn"
          :class="{ 'stage-sequencer-bar__btn--live': sequencerPlaying }"
          :title="sequencerPlaying ? 'Stop' : 'Play'"
          @click="toggleSequencerPlayback"
        >
          <UiIcon :name="sequencerPlaying ? 'stop' : 'play'" />
        </button>
        <button type="button" class="stage-sequencer-bar__btn" title="Preview frame" @click="previewSequencerFrame">
          <UiIcon name="sparkles" />
        </button>
        <span
          class="stage-sequencer-bar__frame"
          :class="{ 'stage-sequencer-bar__frame--live': sequencerJobFrameLive }"
          data-testid="sequencer-job-frame-counter"
        >
          {{ sequencerJobFrameNumber }}<span class="stage-sequencer-bar__frame-total">/{{ sequencerJobTotalFrames }}</span>
        </span>
      </div>
      <label class="stage-sequencer-bar__scrub">
        <input
          type="range"
          class="stage-sequencer-bar__scrub-input"
          min="0"
          :max="Math.max(0.01, Number(sequencer.durationSec) || 0)"
          step="0.01"
          v-model.number="sequencerPlayhead"
          @input="previewSequencerFrame"
        >
      </label>
      <div class="stage-sequencer-bar__right">
        <span v-if="sequencerStatus" class="stage-sequencer-bar__status stage-sequencer-bar__status--clip">{{ sequencerStatus }}</span>
        <span v-else-if="performance.status" class="stage-sequencer-bar__status">{{ performance.status }}</span>
        <span class="stage-sequencer-bar__meta">{{ sequencerPlayhead.toFixed(2) }}s</span>
        <span class="stage-sequencer-bar__meta">{{ masterFps }} fps</span>
        <label class="stage-sequencer-bar__loop" title="Loop timeline">
          <input type="checkbox" v-model="sequencer.loop">
          <span>Loop</span>
        </label>
        <button type="button" class="framesync-button framesync-button--compact" @click="addSequencerClip('prompt')">+ Prompt</button>
        <button type="button" class="framesync-button framesync-button--compact" @click="addSequencerClip('lora')">+ LoRA</button>
        <button type="button" class="framesync-button framesync-button--compact" @click="addSequencerClip('controlnet')">+ CN</button>
        <button
          type="button"
          class="framesync-button framesync-button--compact"
          :class="{ active: generateDockExpanded }"
          @click="generateDockExpanded = !generateDockExpanded; saveSessionState()"
        >
          {{ generateDockExpanded ? 'Less' : 'Edit' }}
        </button>
        <button type="button" class="framesync-button framesync-button--compact framesync-button--live" @click="applySequencerToDeforumSettings">
          Apply
        </button>
      </div>
    </div>

    <div
      v-if="!stage && !summaryOnly"
      class="generate-sequencer__frame-hero"
      :class="{ 'generate-sequencer__frame-hero--live': sequencerJobFrameLive }"
      data-testid="sequencer-job-frame-hero"
    >
      <div class="generate-sequencer__frame-hero-label">Job frame</div>
      <div class="generate-sequencer__frame-hero-value">
        <span class="generate-sequencer__frame-hero-current">{{ sequencerJobFrameNumber }}</span>
        <span class="generate-sequencer__frame-hero-sep">/</span>
        <span class="generate-sequencer__frame-hero-total">{{ sequencerJobTotalFrames }}</span>
      </div>
      <div class="generate-sequencer__frame-hero-meta">
        {{ sequencerJobFps }} fps · {{ sequencerPlayhead.toFixed(2) }}s · {{ sequencerJobTotalFrames }} frames total
      </div>
      <div class="generate-sequencer__frame-hero-bar">
        <div class="generate-sequencer__frame-hero-bar-fill" :style="{ width: `${sequencerJobFrameProgressPct}%` }"></div>
      </div>
    </div>

    <div v-if="!stage" class="modulation-lfo-grid generate-sequencer__control-grid">
      <div class="modulation-lfo-card modulation-lfo-card--static modulation-lfo-card--active">
        <div class="modulation-lfo-card__header">
          <div class="modulation-lfo-card__title">
            <span class="modulation-lfo-card__dot"></span>
            <span>{{ summaryOnly ? 'Tracks' : 'Timeline' }}</span>
          </div>
          <code class="modulation-lfo-card__meta">
            {{ summaryOnly
              ? (selectedSequencerTrack ? (sequencerParamMetaMap[selectedSequencerTrack.param]?.label || selectedSequencerTrack.param) : 'No track selected')
              : `${Number(sequencer.durationSec || 0).toFixed(1)}s · ${sequencer.fps} fps` }}
          </code>
        </div>
        <div v-if="summaryOnly" class="modulation-lfo-card__footer">
          <span class="modulation-route-pill">{{ sequencer.tracks.length }} track{{ sequencer.tracks.length === 1 ? '' : 's' }}</span>
        </div>
        <div v-else class="modulation-lfo-card__controls">
          <label class="modulation-lfo-card__control">
            <span class="framesync-subtitle">Duration (s)</span>
            <input type="number" class="framesync-input" v-model.number="sequencer.durationSec" min="0.5" max="600" step="0.5" @change="clampSequencerPlayhead">
          </label>
          <label class="modulation-lfo-card__control">
            <span class="framesync-subtitle">FPS</span>
            <input type="number" class="framesync-input" v-model.number="sequencer.fps" min="1" max="60" step="1">
          </label>
          <label class="modulation-lfo-card__control modulation-lfo-card__control--wide modulation-lfo-card__control--switch">
            <input type="checkbox" v-model="sequencer.loop">
            <span class="framesync-subtitle">Loop timeline</span>
          </label>
        </div>
      </div>

      <div
        class="modulation-lfo-card modulation-lfo-card--static"
        :class="{ 'modulation-lfo-card--active': summaryOnly ? sortedSequencerMarkers.length > 0 : sequencer.bpmSync }"
      >
        <div class="modulation-lfo-card__header">
          <label v-if="!summaryOnly" class="modulation-lfo-card__switch">
            <input type="checkbox" v-model="sequencer.bpmSync">
            <span class="modulation-lfo-card__title">
              <span class="modulation-lfo-card__dot"></span>
              <span>BPM sync</span>
            </span>
          </label>
          <div v-else class="modulation-lfo-card__title">
            <span class="modulation-lfo-card__dot"></span>
            <span>Markers</span>
          </div>
          <code class="modulation-lfo-card__meta">
            {{ summaryOnly
              ? (sortedSequencerMarkers.length ? 'Scene triggers ready' : 'No marker cues yet')
              : (sequencer.bpmSync ? `${sequencerCalculatedDuration}s` : 'Manual timing') }}
          </code>
        </div>
        <div v-if="summaryOnly" class="modulation-lfo-card__footer">
          <span class="modulation-route-pill" :class="{ 'modulation-route-pill--idle': !sortedSequencerMarkers.length }">
            {{ sortedSequencerMarkers.length }} marker{{ sortedSequencerMarkers.length === 1 ? '' : 's' }}
          </span>
        </div>
        <div v-else-if="sequencer.bpmSync" class="modulation-lfo-card__controls">
          <label class="modulation-lfo-card__control">
            <span class="framesync-subtitle">BPM</span>
            <input type="number" class="framesync-input" v-model.number="sequencer.bpm" min="20" max="300" step="0.1">
          </label>
          <label class="modulation-lfo-card__control">
            <span class="framesync-subtitle">Bars</span>
            <input type="number" class="framesync-input" v-model.number="sequencer.bars" min="1" max="128" step="1">
          </label>
          <label class="modulation-lfo-card__control">
            <span class="framesync-subtitle">Beats/bar</span>
            <select class="framesync-select" v-model.number="sequencer.beatsPerBar">
              <option :value="4">4/4</option>
              <option :value="3">3/4</option>
              <option :value="6">6/8</option>
            </select>
          </label>
          <label class="modulation-lfo-card__control">
            <span class="framesync-subtitle">Length</span>
            <code class="modulation-lfo-card__meta">{{ sequencerCalculatedDuration }}s</code>
          </label>
        </div>
        <div v-else-if="!summaryOnly" class="modulation-lfo-card__footer">
          <span class="modulation-route-pill modulation-route-pill--idle">Sync timeline length to uploaded audio BPM</span>
        </div>
      </div>

      <div
        class="modulation-lfo-card modulation-lfo-card--static"
        :class="{ 'modulation-lfo-card--active': summaryOnly || sequencerPlaying }"
      >
        <div class="modulation-lfo-card__header">
          <div class="modulation-lfo-card__title">
            <span class="modulation-lfo-card__dot"></span>
            <span>{{ summaryOnly ? 'Playhead' : 'Transport' }}</span>
          </div>
          <code class="modulation-lfo-card__meta">
            {{ summaryOnly
              ? `${Number(sequencer.durationSec || 0).toFixed(2)}s timeline`
              : `${sequencerPlayhead.toFixed(2)}s playhead` }}
          </code>
        </div>
        <div v-if="summaryOnly" class="modulation-lfo-card__footer">
          <span class="modulation-route-pill">{{ sequencerJobFrameLabel }}</span>
        </div>
        <div v-else class="modulation-lfo-card__footer">
          <button type="button" class="framesync-button" :class="{ 'framesync-button--live': sequencerPlaying }" @click="toggleSequencerPlayback">
            {{ sequencerPlaying ? 'Stop' : 'Play' }}
          </button>
          <button type="button" class="framesync-button" @click="previewSequencerFrame">Preview frame</button>
          <button type="button" class="framesync-button framesync-button--accent" @click="applySequencerToDeforumSettings" title="Convert timeline keyframes to Deforum schedule strings and save to settings">Apply to Deforum</button>
        </div>
      </div>

      <div
        class="modulation-lfo-card modulation-lfo-card--static generate-sequencer__control-span"
        :class="{ 'modulation-lfo-card--active': summaryOnly ? /frame ready/i.test(String(performance.status || '')) : true }"
      >
        <div class="modulation-lfo-card__header">
          <div class="modulation-lfo-card__title">
            <span class="modulation-lfo-card__dot"></span>
            <span>{{ summaryOnly ? 'Preview' : 'Playhead' }}</span>
          </div>
          <code class="modulation-lfo-card__meta">
            {{ summaryOnly
              ? (performance.status || 'Preview status appears here')
              : `${sortedSequencerMarkers.length} marker${sortedSequencerMarkers.length === 1 ? '' : 's'}` }}
          </code>
        </div>
        <div v-if="summaryOnly" class="modulation-lfo-card__footer">
          <span
            class="modulation-route-pill"
            :class="{ 'modulation-route-pill--idle': !/frame ready/i.test(String(performance.status || '')) }"
          >
            {{ /frame ready/i.test(String(performance.status || '')) ? 'Ready' : (sequencerPlaying ? 'Playing' : 'Idle') }}
          </span>
        </div>
        <template v-else>
          <label class="modulation-lfo-card__control">
            <span class="framesync-subtitle">Job frame</span>
            <input
              type="number"
              class="framesync-input"
              :value="sequencerJobFrameNumber"
              min="1"
              :max="sequencerJobTotalFrames"
              step="1"
              @change="seekSequencerToJobFrame($event.target.value)"
            >
          </label>
          <label class="modulation-lfo-card__control modulation-lfo-card__control--wide">
            <span class="framesync-subtitle">Scrub timeline (s)</span>
            <input type="range" class="framesync-input" min="0" :max="Math.max(0.01, sequencer.durationSec)" step="0.01" v-model.number="sequencerPlayhead" @input="previewSequencerFrame">
          </label>
          <label class="modulation-lfo-card__control modulation-lfo-card__control--wide">
            <span class="framesync-subtitle">Scrub job frame</span>
            <input
              type="range"
              class="framesync-input"
              min="1"
              :max="sequencerJobTotalFrames"
              step="1"
              :value="sequencerJobFrameNumber"
              @input="seekSequencerToJobFrame($event.target.value)"
            >
          </label>
          <div class="modulation-lfo-card__footer">
            <input type="text" class="framesync-input generate-sequencer__marker-input" v-model.trim="sequencerMarkerName" maxlength="48" placeholder="Marker label" title="1–48 chars: letters, digits, space, _ - .">
            <button type="button" class="framesync-button" @click="addSequencerMarker">+ Marker @ playhead</button>
          </div>
        </template>
      </div>
    </div>

    <Timeline
      v-if="showTimeline"
      :duration="Number(sequencer.durationSec) || 0"
      :playhead="sequencerPlayhead"
      :markers="sortedSequencerMarkers"
      :clips="sortedSequencerClips"
      :selected-clip-id="sequencerSelectedClipId || ''"
      :tracks="sequencer.tracks"
      :selected-track-id="selectedSequencerTrack ? selectedSequencerTrack.id : ''"
      :param-meta="sequencerParamMetaMap"
      :frames="thumbs"
      :fps="Number(sequencer.fps) || 24"
      :job-frame-number="sequencerJobFrameNumber"
      :job-total-frames="sequencerJobTotalFrames"
      :job-frame-live="sequencerJobFrameLive"
      :compact="stage ? false : !generateDockExpanded"
      :expandable="!stage"
      @seek="seekSequencer"
      @jump-marker="jumpToSequencerMarker"
      @jump-clip="jumpToSequencerClip"
      @select-track="selectSequencerTrack"
      @toggle-compact="generateDockExpanded = !generateDockExpanded; saveSessionState()"
      @update-keyframe="updateSequencerKeyframe"
    />

    <template v-if="!summaryOnly && (!stage || generateDockExpanded)">
      <div class="modulation-lfo-grid generate-sequencer__control-grid generate-sequencer__control-grid--edit">
        <div class="modulation-lfo-card modulation-lfo-card--static modulation-lfo-card--active generate-sequencer__control-span">
          <div class="modulation-lfo-card__header">
            <div class="modulation-lfo-card__title">
              <span class="modulation-lfo-card__dot"></span>
              <span>Timeline content</span>
            </div>
            <code class="modulation-lfo-card__meta">
              {{ sequencerClipSummary.prompt }}p · {{ sequencerClipSummary.lora }}l · {{ sequencerClipSummary.controlnet }}c
            </code>
          </div>
          <div class="modulation-lfo-card__controls">
            <label class="modulation-lfo-card__control">
              <span class="framesync-subtitle">Clip span (s)</span>
              <input type="number" class="framesync-input" v-model.number="sequencerClipDurationSec" min="0.1" max="120" step="0.1">
            </label>
          </div>
          <div class="modulation-lfo-card__footer">
            <button type="button" class="framesync-button" @click="addSequencerClip('prompt')">+ Prompt</button>
            <button type="button" class="framesync-button" @click="addSequencerClip('lora')">+ LoRA</button>
            <button type="button" class="framesync-button" @click="addSequencerClip('controlnet')">+ ControlNet</button>
          </div>
          <div class="framesync-subtitle generate-sequencer__clip-hint">
            Snapshots current prompts, LoRA groups, or ControlNet slots at the playhead. Scrubbing or playback applies the active clip for each type.
          </div>
        </div>

        <div class="modulation-lfo-card modulation-lfo-card--static modulation-lfo-card--active">
          <div class="modulation-lfo-card__header">
            <div class="modulation-lfo-card__title">
              <span class="modulation-lfo-card__dot"></span>
              <span>Track editor</span>
            </div>
            <code class="modulation-lfo-card__meta">{{ sequencer.tracks.length }} track{{ sequencer.tracks.length === 1 ? '' : 's' }}</code>
          </div>
          <div class="modulation-lfo-card__controls">
            <label class="modulation-lfo-card__control modulation-lfo-card__control--wide">
              <span class="framesync-subtitle">Parameter</span>
              <select class="framesync-select" v-model="sequencerNewParam">
                <option v-for="opt in sequencerParamOptions" :key="'sp-'+opt.key" :value="opt.key">{{ opt.label }}</option>
              </select>
            </label>
            <label class="modulation-lfo-card__control">
              <span class="framesync-subtitle">Keyframe value</span>
              <input type="number" class="framesync-input" v-model.number="sequencerKeyframeVal" step="any" placeholder="Value">
            </label>
          </div>
          <div class="modulation-lfo-card__footer">
            <button type="button" class="framesync-button" @click="addSequencerTrack">+ Track</button>
            <button type="button" class="framesync-button" @click="addSequencerKeyframe">+ Keyframe @ playhead</button>
          </div>
        </div>

        <div class="modulation-lfo-card modulation-lfo-card--static modulation-lfo-card--active">
          <div class="modulation-lfo-card__header">
            <div class="modulation-lfo-card__title">
              <span class="modulation-lfo-card__dot"></span>
              <span>Timeline files</span>
            </div>
            <code class="modulation-lfo-card__meta">{{ sequencerList.length }} saved</code>
          </div>
          <div class="modulation-lfo-card__footer">
            <button type="button" class="framesync-button" @click="saveSequencerTimeline">Save</button>
            <button type="button" class="framesync-button" @click="exportSequencerDownload">Export JSON</button>
            <select class="framesync-select generate-sequencer__load-select" v-model="sequencerLoadPick" @change="loadSequencerTimeline">
              <option value="">Load saved…</option>
              <option v-for="n in sequencerList" :key="'seq-'+n" :value="n">{{ n }}</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="generateDockExpanded" class="generate-sequencer__details">
        <div class="modulation-lfo-grid generate-sequencer__track-list" v-if="sortedSequencerClips.length">
          <div
            v-for="clip in sortedSequencerClips"
            :key="clip.id"
            class="modulation-lfo-card modulation-lfo-card--static"
            :class="{ 'modulation-lfo-card--selected': sequencerSelectedClipId === clip.id }"
            @click="selectSequencerClip(clip.id)"
          >
            <div class="modulation-lfo-card__header">
              <div class="modulation-lfo-card__title">
                <span class="modulation-lfo-card__dot"></span>
                <span>{{ clip.label || clipTypeLabel(clip.type) }}</span>
              </div>
              <code class="modulation-lfo-card__meta">{{ clipTypeLabel(clip.type) }}</code>
            </div>
            <div class="modulation-lfo-card__controls">
              <label class="modulation-lfo-card__control">
                <span class="framesync-subtitle">Start (s)</span>
                <input type="number" class="framesync-input" v-model.number="clip.t" min="0" :max="sequencer.durationSec" step="0.01" @change="clampSequencerPlayhead">
              </label>
              <label class="modulation-lfo-card__control">
                <span class="framesync-subtitle">End (s)</span>
                <input type="number" class="framesync-input" :value="clip.endT == null ? '' : clip.endT" min="0" :max="sequencer.durationSec" step="0.01" placeholder="Point cue" @change="clip.endT = $event.target.value === '' ? null : parseFloat($event.target.value)">
              </label>
            </div>
            <div class="modulation-lfo-card__footer">
              <span class="modulation-route-pill">{{ clipSummaryText(clip) }}</span>
              <button type="button" class="framesync-button" @click.stop="jumpToSequencerClip(clip)">Go to</button>
              <button type="button" class="framesync-button framesync-button--live" @click.stop="applySequencerClip(clip)">Apply</button>
              <button type="button" class="framesync-button framesync-button--danger framesync-button--compact" @click.stop="removeSequencerClip(clip.id)">Remove</button>
            </div>
          </div>
        </div>

        <div class="modulation-lfo-grid generate-sequencer__track-list" v-if="sequencer.tracks.length">
          <div
            v-for="tr in sequencer.tracks"
            :key="tr.id"
            class="modulation-lfo-card modulation-lfo-card--static"
            :class="{ 'modulation-lfo-card--selected': selectedSequencerTrack && selectedSequencerTrack.id === tr.id }"
            @click="selectSequencerTrack(tr.id)"
          >
            <div class="modulation-lfo-card__header">
              <div class="modulation-lfo-card__title">
                <span class="modulation-lfo-card__dot"></span>
                <span>{{ sequencerParamMetaMap[tr.param]?.label || tr.param }}</span>
              </div>
              <code class="modulation-lfo-card__meta">{{ sortedKeyframes(tr).length }} keyframes</code>
            </div>
            <div v-if="sortedKeyframes(tr).length" class="generate-sequencer__keyframe-list">
              <div v-for="(kf, ki) in sortedKeyframes(tr)" :key="tr.id+'-'+ki+'-'+(kf.t||0)" class="generate-sequencer__keyframe-row">
                <code class="modulation-lfo-card__meta">{{ kf.t.toFixed(2) }}s → {{ kf.v.toFixed(3) }}</code>
                <select class="framesync-select generate-sequencer__keyframe-easing" :value="kf.easing || 'linear'" title="Easing to next keyframe" @click.stop @change="setKeyframeEasing(kf, $event.target.value)">
                  <option value="linear">linear</option>
                  <option value="easeIn">easeIn</option>
                  <option value="easeOut">easeOut</option>
                  <option value="easeInOut">easeInOut</option>
                </select>
                <button type="button" class="framesync-button framesync-button--danger framesync-button--compact" title="Remove keyframe" @click.stop="removeSequencerKeyframe(tr.id, ki)">Remove</button>
              </div>
            </div>
            <div v-else class="modulation-lfo-card__footer">
              <span class="modulation-route-pill modulation-route-pill--idle">No keyframes yet</span>
            </div>
            <div class="modulation-lfo-card__footer">
              <button type="button" class="framesync-button framesync-button--danger framesync-button--compact" @click.stop="removeSequencerTrack(tr.id)">Remove track</button>
            </div>
          </div>
        </div>

        <div class="modulation-lfo-grid generate-sequencer__markers" v-if="sortedSequencerMarkers.length">
          <div
            v-for="(m, mi) in sortedSequencerMarkers"
            :key="'mrow-'+mi+'-'+(m.t||0)"
            class="modulation-lfo-card modulation-lfo-card--static modulation-lfo-card--active"
          >
            <div class="modulation-lfo-card__header">
              <button type="button" class="generate-marker-row__jump framesync-button" @click="jumpToSequencerMarker(m)">
                {{ m.name }} @ {{ m.t.toFixed(2) }}s
              </button>
              <code class="modulation-lfo-card__meta">{{ m.action || 'jump' }}</code>
            </div>
            <div class="modulation-lfo-card__controls">
              <label class="modulation-lfo-card__control">
                <span class="framesync-subtitle">Action</span>
                <select class="framesync-select" :value="m.action || 'jump'" @change="setMarkerAction(m, $event.target.value)">
                  <option value="jump">Jump</option>
                  <option value="preset">Preset</option>
                  <option value="generate">Generate</option>
                  <option value="morph">Morph</option>
                  <option value="param">Params</option>
                  <option value="pause">Pause</option>
                </select>
              </label>
              <label
                v-if="m.action && m.action !== 'jump' && m.action !== 'generate' && m.action !== 'pause'"
                class="modulation-lfo-card__control modulation-lfo-card__control--wide"
              >
                <span class="framesync-subtitle">Target</span>
                <input
                  type="text"
                  class="framesync-input"
                  :value="m.target || ''"
                  :placeholder="markerActionPlaceholder(m.action)"
                  @change="setMarkerTarget(m, $event.target.value)"
                  :title="markerActionTitle(m.action)"
                >
              </label>
              <span v-else class="modulation-lfo-card__control modulation-lfo-card__control--wide generate-marker-row__hint">
                {{ m.action === 'jump' ? 'jump to time' : (m.action === 'generate' ? 'trigger generation' : (m.action === 'pause' ? 'pause playback' : '')) }}
              </span>
            </div>
            <div class="modulation-lfo-card__footer">
              <button type="button" class="framesync-button framesync-button--danger framesync-button--compact" title="Remove marker" @click="removeSequencerMarker(mi)">Remove</button>
            </div>
          </div>
        </div>
        <div v-else class="generate-sequencer__empty-markers">No markers yet.</div>

        <div v-if="sequencerStatus" class="generate-sequencer__status-text">{{ sequencerStatus }}</div>
      </div>
      <div v-else class="generate-sequencer__dock-note">
        Expand lanes for detailed keyframe editing and marker actions.
      </div>
    </template>
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'
import Timeline from './generate/Timeline.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'SequencerControlsPanel',
  components: { UiIcon, Timeline },
  props: {
    app: { type: Object, required: true },
    showTimeline: { type: Boolean, default: true },
    summaryOnly: { type: Boolean, default: false },
    stage: { type: Boolean, default: false },
  },
  setup(props) {
    return proxyAppView(props);
  },
}
</script>
