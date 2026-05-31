<template>
  <div class="rack modulation-view">
    <div class="framesync-panel modulation-panel">
      <div class="framesync-header">
        <div class="framesync-title">
          <template v-if="isAudioTab">Audio <span class="framesync-accent">Reactive</span></template>
          <template v-else>Modulation <span class="framesync-accent">Patch Bay</span></template>
        </div>
        <span v-if="!isAudioTab" class="modulation-summary">{{ modulationSubtabSummary }}</span>
      </div>
      <div v-if="!isAudioTab" class="sub-pills modulation-subtabs">
        <button class="sub-pill" :class="{active: modulationPane === 'LFO'}" @click="switchSubTab('MODULATION','LFO')">LFO</button>
        <button class="sub-pill" :class="{active: modulationPane === 'AV_SYNC'}" @click="switchSubTab('MODULATION','AV_SYNC')">Audio</button>
        <button class="sub-pill" :class="{active: modulationPane === 'AUDIO_REACTIVE'}" @click="openAudioTab()">Reactive</button>
        <button class="sub-pill" :class="{active: modulationPane === 'BEAT_MACROS'}" @click="switchSubTab('MODULATION','BEAT_MACROS')">Beat</button>
        <button class="sub-pill" :class="{active: modulationPane === 'MAPPINGS'}" @click="switchSubTab('MODULATION','MAPPINGS')">Mappings</button>
      </div>
      <div v-else class="framesync-subtitle modulation-audio-tab__intro">
        Map frequency bands to live parameters. Use the spectrum hero and meter cards below, or upload reference audio under Modulation → Audio.
      </div>

      <template v-if="modulationPane === 'LFO'">
        <div class="modulation-panel__actions modulation-panel__actions--section">
          <button class="framesync-button" :class="{active: lfoOn}" @click="lfoOn=!lfoOn">{{ lfoOn ? 'On' : 'Off' }}</button>
          <button class="framesync-button" @click="resetLfos">Reset</button>
        </div>

        <div class="modulation-lfo-grid">
          <div
            v-for="lfo in lfos"
            :key="'lfo-'+lfo.id"
            class="modulation-lfo-card"
            :class="{
              'modulation-lfo-card--active': lfo.on,
              'modulation-lfo-card--selected': selectedModulationLfo && selectedModulationLfo.id === lfo.id,
            }"
            @click="modulationSelectedLfoId = lfo.id"
          >
            <div class="modulation-lfo-card__header">
              <label class="switch modulation-lfo-card__switch">
                <input type="checkbox" v-model="lfo.on">
                <span class="modulation-lfo-card__title">
                  <span class="modulation-lfo-card__dot"></span>
                  <span>LFO {{ lfo.id }}</span>
                </span>
              </label>
              <code class="modulation-lfo-card__meta">{{ lfo.shape }} · {{ lfo.bpm }}</code>
            </div>
            <Waveform :shape="lfo.shape" :phase="lfo.renderPhase != null ? lfo.renderPhase : lfo.phase" :depth="lfo.depth" :active="lfo.on" :width="240" :height="selectedModulationLfo && selectedModulationLfo.id === lfo.id ? 88 : 64" class="modulation-lfo-card__waveform" />
            <div
              v-if="!(selectedModulationLfo && selectedModulationLfo.id === lfo.id)"
              class="modulation-lfo-card__compact"
            >
              {{ lfo.bpm }} BPM · depth {{ Number(lfo.depth).toFixed(2) }} · {{ (lfo.targets || []).length ? (lfo.targets || []).length + ' route' + ((lfo.targets || []).length === 1 ? '' : 's') : 'no routes' }}
            </div>
            <div v-show="selectedModulationLfo && selectedModulationLfo.id === lfo.id" class="modulation-lfo-card__controls">
              <label class="modulation-lfo-card__control">
                <span class="framesync-subtitle">Shape</span>
                <select class="framesync-select" v-model="lfo.shape">
                  <option v-for="s in lfoShapes" :key="s" :value="s">{{ s }}</option>
                </select>
              </label>
              <label class="modulation-lfo-card__control">
                <span class="framesync-subtitle">BPM</span>
                <input type="number" class="framesync-input" v-model.number="lfo.bpm" min="20" max="300">
              </label>
              <label class="modulation-lfo-card__control">
                <span class="framesync-subtitle">Speed</span>
                <input type="number" class="framesync-input" v-model.number="lfo.speed" min="0.1" max="10" step="0.1">
              </label>
              <label class="modulation-lfo-card__control">
                <span class="framesync-subtitle">Depth</span>
                <input type="number" class="framesync-input" v-model.number="lfo.depth" min="0" max="1" step="0.01">
              </label>
            </div>
            <div class="modulation-lfo-card__footer">
              <span v-if="(lfo.targets || []).length" class="modulation-route-pill" v-for="targetKey in (lfo.targets || [])" :key="'lfo-route-' + lfo.id + '-' + targetKey">
                {{ sequencerParamMetaMap[targetKey]?.label || targetKey }}
              </span>
              <span v-else class="modulation-route-pill modulation-route-pill--idle">off</span>
              <button type="button" class="framesync-button modulation-lfo-card__route-button" @click="onLfoRouteButtonClick(lfo.id)">+ route</button>
            </div>
          </div>
        </div>

        <div class="modulation-target-board">
          <div class="modulation-target-board__header">
            <div>
              <div class="framesync-subtitle">Targets</div>
              <div class="modulation-target-board__hint" v-if="selectedModulationLfo">
                Armed: LFO {{ selectedModulationLfo.id }}. Click a target to toggle its route.
                Standby / Three.js targets drive the WebGL animation engine (not Deforum).
              </div>
            </div>
          </div>
          <div class="modulation-target-board__grid">
            <TargetCell
              v-for="target in modulationTargets"
              :key="'shared-target-' + target.key"
              :label="target.label"
              :param-key="target.key"
              :selected="selectedModulationLfo ? selectedModulationLfo.targets.includes(target.key) : false"
              :focused="modulationRouteFocusKey === target.key"
              :owners="targetOwners[target.key] || []"
              @toggle="selectedModulationLfo && toggleLfoTarget(selectedModulationLfo, target.key)"
            />
          </div>
        </div>
      </template>

      <template v-else-if="modulationPane === 'MAPPINGS'">
        <ModulationMappingsPanel :app="app" />
      </template>

      <template v-else-if="modulationPane === 'AV_SYNC'">
        <div class="framesync-panel modulation-audio-panel">
          <div class="framesync-header">
            <div class="framesync-title">Reference <span class="framesync-accent">Audio</span></div>
          </div>
          <div class="framesync-subtitle" style="margin-top:8px;">
            Upload the track you use for modulation. Enable sync to lock playback to the HLS clock.
          </div>

          <div
            class="modulation-audio-dropzone"
            :class="{ 'modulation-audio-dropzone--filled': audio.objectUrl }"
            data-testid="audio-dropzone"
            @dragover="onModulationAudioDragover"
            @drop="onModulationAudioDrop"
            @click="$refs.audioFileInput && $refs.audioFileInput.click()"
          >
            <input
              ref="audioFileInput"
              type="file"
              accept="audio/*"
              class="modulation-audio-dropzone__input"
              @change="onAudioUpload"
            >
            <template v-if="audio.uploadedFile">
              <span class="modulation-audio-dropzone__title">{{ audio.uploadedFile }}</span>
              <span class="modulation-audio-dropzone__hint">{{ audioStatus || 'Ready' }}</span>
              <button type="button" class="framesync-button framesync-button--compact" @click="clearAudioFile">Remove</button>
            </template>
            <template v-else>
              <span class="modulation-audio-dropzone__title">Drop audio here</span>
              <span class="modulation-audio-dropzone__hint">or click to browse · max 50MB</span>
            </template>
          </div>

          <label class="framesync-checkbox" style="margin-top:14px;">
            <input
              type="checkbox"
              data-testid="av-sync-enable"
              v-model="avSyncEnabled"
              :disabled="!audio.objectUrl"
            >
            Enable sync
          </label>

          <div v-if="avSyncEnabled && audio.objectUrl" class="modulation-audio-sync-settings">
            <div class="framesync-subtitle" style="margin-top:10px;">
              If the music feels <em>ahead</em> of the pictures (normal for live HLS + encoder delay), raise <strong>Video lead</strong> until it lines up.
            </div>
            <label class="modulation-audio-sync-settings__lead">
              <span class="framesync-subtitle">Video lead (sec)</span>
              <input
                type="number"
                data-testid="av-sync-lead"
                class="framesync-input"
                v-model.number="avSyncLeadSec"
                min="0"
                max="120"
                step="0.25"
              >
            </label>
            <div class="framesync-subtitle" style="margin-top:4px; font-size:10px;">≈ encoder buffer + HLS fragments (often 2–10s).</div>
          </div>
        </div>
      </template>

      <template v-else-if="modulationPane === 'AUDIO_REACTIVE'">
        <div class="framesync-panel audio-reactive-panel">
          <div class="framesync-header">
            <div class="framesync-title">Audio <span class="framesync-accent">Reactive</span></div>
            <button
              type="button"
              class="framesync-button"
              :class="{ 'framesync-button--live': audioReactiveActive }"
              @click="startAudioStream"
            >
              {{ audioReactiveActive ? 'Running' : 'Start' }}
            </button>
          </div>
          <div class="framesync-subtitle audio-reactive-panel__intro">
            Map frequency bands to live parameters. Meters animate from real audio analysis — drag bands on the spectrum to retune.
          </div>

          <div v-if="activeAudioMapping || audioMappings.length" class="audio-band-presets audio-band-presets--hero">
            <span class="audio-band-presets__label">Quick bands</span>
            <button
              v-for="chip in audioBandChips"
              :key="'audio-preset-hero-' + chip.key"
              type="button"
              class="chip"
              @click="applyAudioBandPreset(activeAudioMappingIndex >= 0 ? activeAudioMappingIndex : 0, chip.key)"
            >
              {{ chip.label }}
            </button>
            <button type="button" class="chip chip--ghost" @click="addAudioMapping">+ map</button>
          </div>

          <AudioSpectrumEditor
            class="audio-reactive-panel__spectrum audio-reactive-panel__spectrum--hero"
            :canvas-height="148"
            :mappings="audioMappings"
            :levels="audioMappingLevels"
            :active-index="activeAudioMappingIndex"
            :spectrum-bins="audioSpectrumBins"
            :live="audioSpectrumEditorLive"
            :band-labels="audioSpectrumBandLabels"
            :band-colors="audioSpectrumBandColors"
            @select-band="onAudioSpectrumSelectBand"
            @update-band="updateAudioMappingBand"
          />

          <div class="audio-reactive-mappings">
            <button
              v-for="(mapping, mapIndex) in audioMappings"
              :key="'audio-meter-' + mapIndex"
              type="button"
              class="audio-reactive-mapping-card"
              :class="{
                'audio-reactive-mapping-card--active': activeAudioMappingIndex === mapIndex,
                'audio-reactive-mapping-card--live': audioSpectrumPlaying || audioReactiveActive,
              }"
              @click="onAudioSpectrumSelectBand(mapIndex)"
            >
              <div class="audio-reactive-mapping-card__head">
                <span class="audio-map-card__target-name">{{ mapping.param ? (lfoTargets.find(t => t.key === mapping.param)?.label || mapping.param) : 'Unmapped' }}</span>
                <code class="modulation-lfo-card__meta">{{ mapping.freq_min }}–{{ mapping.freq_max }} Hz</code>
              </div>
              <svg
                class="audio-mini-bars"
                :class="{ 'audio-mini-bars--live': audioSpectrumPlaying || audioReactiveActive }"
                viewBox="0 0 88 28"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  v-for="(h, bi) in audioMappingMiniBars[mapIndex]"
                  :key="bi"
                  :x="bi * 11"
                  :y="28 - Math.max(2, h * 26)"
                  width="9"
                  :height="Math.max(2, h * 26)"
                  class="audio-mini-bars__bar"
                  :class="{ 'audio-mini-bars__bar--on': h > 0.04 }"
                  rx="1.5"
                />
              </svg>
              <div class="audio-reactive-mapping-card__level">
                {{ Math.round((audioMappingLevels[mapIndex] || 0) * 100) }}%
                · {{ audioBandTabDefs[mapIndex]?.label || 'Band' }}
              </div>
            </button>
          </div>

          <div v-if="activeAudioMapping" class="audio-reactive-detail">
            <div class="audio-band-presets audio-band-presets--detail">
              <button
                v-for="chip in audioBandChips"
                :key="'audio-preset-' + chip.key"
                type="button"
                class="chip"
                @click="applyAudioBandPreset(activeAudioMappingIndex, chip.key)"
              >
                {{ chip.label }}
              </button>
            </div>

            <div
              class="modulation-lfo-card modulation-audio-band-card"
              :class="{ 'modulation-lfo-card--active': audioReactiveActive || audioSpectrumPlaying }"
            >
              <div class="modulation-lfo-card__controls modulation-audio-band-card__controls modulation-audio-band-card__controls--compact">
                <label class="modulation-lfo-card__control modulation-audio-band-card__control--wide">
                  <span class="framesync-subtitle">Target</span>
                  <select class="framesync-select" v-model="activeAudioMapping.param">
                    <option value="">Select target…</option>
                    <option v-for="target in lfoTargets" :key="'audio-target-' + activeAudioMappingIndex + '-' + target.key" :value="target.key">
                      {{ target.label }}
                    </option>
                  </select>
                </label>
                <label class="modulation-lfo-card__control">
                  <span class="framesync-subtitle">Hz</span>
                  <span class="audio-reactive-hz-pair">
                    <input type="number" class="framesync-input" v-model.number="activeAudioMapping.freq_min" min="20" max="20000" step="1" aria-label="Min Hz">
                    <span class="audio-reactive-hz-pair__sep">–</span>
                    <input type="number" class="framesync-input" v-model.number="activeAudioMapping.freq_max" min="20" max="20000" step="1" aria-label="Max Hz">
                  </span>
                </label>
                <label class="modulation-lfo-card__control">
                  <span class="framesync-subtitle">Out</span>
                  <span class="audio-reactive-hz-pair">
                    <input type="number" class="framesync-input" v-model.number="activeAudioMapping.out_min" step="any" aria-label="Out min">
                    <span class="audio-reactive-hz-pair__sep">–</span>
                    <input type="number" class="framesync-input" v-model.number="activeAudioMapping.out_max" step="any" aria-label="Out max">
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div class="audio-reactive-panel__status" v-if="audioStatus">{{ audioStatus }}</div>
        </div>
      </template>

      <template v-else-if="modulationPane === 'BEAT_MACROS'">
        <div class="framesync-panel modulation-macros modulation-macros--audio" :class="{ 'modulation-macros--disabled': !audio.objectUrl }">
          <div class="framesync-header modulation-macros__header">
            <div class="framesync-title">Beat <span class="framesync-accent">Macros</span></div>
            <div class="modulation-panel__actions">
              <button class="framesync-button" :class="{active: beatMacroOn}" @click="beatMacroOn=!beatMacroOn" :disabled="!audio.objectUrl">{{ beatMacroOn ? 'On' : 'Off' }}</button>
              <button class="framesync-button" @click="addMacro" v-if="macrosRack.length<6" :disabled="!audio.objectUrl">+ Add Macro</button>
            </div>
          </div>
          <div v-if="!audio.objectUrl" class="framesync-subtitle modulation-macros__hint">
            Upload an audio file on the Audio tab to unlock beat macros.
          </div>
          <div v-else class="modulation-macro-strip">
            <div v-for="(macro, idx) in macrosRack" :key="'macro-' + idx" class="modulation-macro-pill" :class="{ 'modulation-macro-pill--active': macro.on }" :style="macro.on ? { '--macro-beat-dur': ((60 / (macro.bpm || 120)).toFixed(3) + 's') } : {}">
              <label class="switch modulation-macro-pill__switch"><input type="checkbox" v-model="macro.on"> Macro {{ idx + 1 }}</label>
              <select class="framesync-select modulation-macro-pill__select" v-model="macro.target">
                <option value="">None</option>
                <option v-for="target in modulationTargets" :key="'macro-target-' + idx + '-' + target.key" :value="target.key">{{ target.label }}</option>
              </select>
              <select class="framesync-select modulation-macro-pill__select" v-model="macro.shape">
                <option v-for="shape in [...lfoShapes, 'Noise']" :key="'macro-shape-' + idx + '-' + shape" :value="shape">{{ shape }}</option>
              </select>
              <input type="number" class="framesync-input modulation-macro-pill__input" v-model.number="macro.bpm" min="20" max="300">
              <input type="number" class="framesync-input modulation-macro-pill__input" v-model.number="macro.depth" min="0" max="1" step="0.01">
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Waveform from '../Waveform.vue'
import TargetCell from '../TargetCell.vue'
import AudioSpectrumEditor from '../AudioSpectrumEditor.vue'
import ModulationMappingsPanel from '../ModulationMappingsPanel.vue'
import { proxyAppView } from './app-view-proxy.mjs'

export default {
  name: 'ModulationView',
  components: { Waveform, TargetCell, AudioSpectrumEditor, ModulationMappingsPanel },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
  computed: {
    isAudioTab() {
      return this.currentTab === 'AUDIO'
    },
    modulationPane() {
      if (this.isAudioTab) return 'AUDIO_REACTIVE'
      const sub = this.currentSubTab && this.currentSubTab.MODULATION
      return sub || 'LFO'
    },
    audioMappingMiniBars() {
      const bins = this.audioSpectrumBins
      const BAR_COUNT = 8
      const NYQUIST = 22050
      return (this.audioMappings || []).map((m) => {
        if (!bins || !bins.length) return Array(BAR_COUNT).fill(0)
        const binCount = bins.length
        const lo = Math.max(0, Math.floor((m.freq_min / NYQUIST) * binCount))
        const hi = Math.min(binCount - 1, Math.ceil((m.freq_max / NYQUIST) * binCount))
        const range = Math.max(1, hi - lo + 1)
        const step = range / BAR_COUNT
        const bars = []
        for (let b = 0; b < BAR_COUNT; b++) {
          const start = lo + Math.floor(b * step)
          const end = lo + Math.floor((b + 1) * step)
          let peak = 0
          for (let i = start; i <= Math.min(hi, end); i++) peak = Math.max(peak, bins[i] || 0)
          bars.push(peak / 255)
        }
        return bars
      })
    },
  },
  methods: {
    openAudioTab() {
      if (typeof this.switchTab === 'function') {
        this.switchTab('AUDIO')
      } else {
        this.switchSubTab('MODULATION', 'AUDIO_REACTIVE')
      }
    },
  },
}
</script>
