<template>
  <div class="rack modulation-view">
    <div class="framesync-panel modulation-panel">
      <div class="framesync-header">
        <div class="framesync-title">Modulation <span class="framesync-accent">Patch Bay</span></div>
        <span class="modulation-summary">{{ modulationSubtabSummary }}</span>
      </div>
      <div class="sub-pills modulation-subtabs">
        <button class="sub-pill" :class="{active: currentSubTab.MODULATION==='LFO'}" @click="switchSubTab('MODULATION','LFO')">LFO</button>
        <button class="sub-pill" :class="{active: currentSubTab.MODULATION==='AV_SYNC'}" @click="switchSubTab('MODULATION','AV_SYNC')">A/V sync</button>
        <button class="sub-pill" :class="{active: currentSubTab.MODULATION==='AUDIO_REACTIVE'}" @click="switchSubTab('MODULATION','AUDIO_REACTIVE')">Reactive</button>
        <button class="sub-pill" :class="{active: currentSubTab.MODULATION==='BEAT_MACROS'}" @click="switchSubTab('MODULATION','BEAT_MACROS')">Beat</button>
        <button class="sub-pill" :class="{active: currentSubTab.MODULATION==='ACTIVE_MODS'}" @click="switchSubTab('MODULATION','ACTIVE_MODS')">Active</button>
        <button class="sub-pill" :class="{active: currentSubTab.MODULATION==='CROSSFADER'}" @click="switchSubTab('MODULATION','CROSSFADER')">Crossfader</button>
      </div>

      <template v-if="currentSubTab.MODULATION==='LFO'">
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
            <Waveform :shape="lfo.shape" :phase="lfo.renderPhase != null ? lfo.renderPhase : lfo.phase" :depth="lfo.depth" :active="lfo.on" :width="240" :height="72" class="modulation-lfo-card__waveform" />
            <div class="modulation-lfo-card__controls">
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
              <span v-if="lfo.targets.length" class="modulation-route-pill" v-for="targetKey in lfo.targets" :key="'lfo-route-' + lfo.id + '-' + targetKey">
                {{ sequencerParamMetaMap[targetKey]?.label || targetKey }}
              </span>
              <span v-else class="modulation-route-pill modulation-route-pill--idle">off</span>
              <button class="framesync-button modulation-lfo-card__route-button" @click.stop="modulationSelectedLfoId = lfo.id">+ route</button>
            </div>
          </div>
        </div>

        <div class="modulation-target-board">
          <div class="modulation-target-board__header">
            <div>
              <div class="framesync-subtitle">Targets</div>
              <div class="modulation-target-board__hint" v-if="selectedModulationLfo">
                Armed: LFO {{ selectedModulationLfo.id }}. Click a target to toggle its route.
                Standby / Three.js targets drive the default animation (not Deforum).
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
              :owners="targetOwners[target.key] || []"
              @toggle="selectedModulationLfo && toggleLfoTarget(selectedModulationLfo, target.key)"
            />
          </div>
        </div>
      </template>

      <template v-else-if="currentSubTab.MODULATION==='ACTIVE_MODS'">
        <ModulationActiveModsPanel :app="app" />
      </template>

      <template v-else-if="currentSubTab.MODULATION==='CROSSFADER'">
        <MorphCrossfaderPanel :app="app" />
      </template>

      <template v-else-if="currentSubTab.MODULATION==='AV_SYNC'">
        <div class="framesync-panel modulation-audio-panel">
          <div class="framesync-header">
            <div class="framesync-title">Reference <span class="framesync-accent">A/V sync</span></div>
          </div>
          <div class="framesync-subtitle" style="margin-top:8px;">
            Play the same track you use for modulation, locked to the HLS clock. If the music feels <em>ahead</em> of the pictures (normal for live HLS + encoder delay), raise <strong>Video lead</strong> until it lines up.
          </div>
          <div class="framesync-row" style="grid-template-columns: 1fr 1fr; gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Upload track</div>
              <input type="file" accept="audio/*" ref="audioFileInput" @change="onAudioUpload" class="framesync-input">
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Video lead (sec)</div>
              <label class="framesync-checkbox" style="margin-top:6px;">
                <input type="checkbox" data-testid="av-sync-enable" v-model="avSyncEnabled" :disabled="!audio.objectUrl"> Enable sync (needs uploaded audio)
              </label>
              <input type="number" data-testid="av-sync-lead" class="framesync-input" v-model.number="avSyncLeadSec" min="0" max="120" step="0.25" style="max-width:120px;">
              <div class="framesync-subtitle" style="margin-top:4px; font-size:10px;">≈ encoder buffer + HLS fragments (often 2–10s).</div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="currentSubTab.MODULATION==='AUDIO_REACTIVE'">
        <div class="framesync-panel audio-reactive-panel">
          <div class="framesync-header">
            <div class="framesync-title">Audio <span class="framesync-accent">Reactive</span></div>
            <button class="framesync-button audio-start-button" :class="{ active: audioReactiveActive }" @click="startAudioStream">
              {{ audioReactiveActive ? 'Running' : 'Start' }}
            </button>
          </div>
          <div class="framesync-subtitle audio-reactive-panel__intro">
            Map Low / Mid / High frequency bands to live parameters. Drag the bands on the spectrum while audio plays.
          </div>

          <AudioSpectrumEditor
            class="audio-reactive-panel__spectrum"
            :mappings="audioMappings"
            :levels="audioMappingLevels"
            :active-index="activeAudioMappingIndex"
            :spectrum-bins="audioSpectrumBins"
            :live="audioSpectrumPlaying"
            :band-labels="audioSpectrumBandLabels"
            :band-colors="audioSpectrumBandColors"
            @select-band="onAudioSpectrumSelectBand"
            @update-band="updateAudioMappingBand"
          />

          <div class="audio-band-tabs sub-pills">
            <button
              v-for="(tab, tabIndex) in audioBandTabDefs"
              :key="'audio-band-tab-' + tab.key"
              type="button"
              class="sub-pill"
              :class="{ active: audioActiveBandTab === tab.key }"
              @click="setAudioActiveBandTab(tab.key)"
            >
              {{ tab.label }}
              <span class="audio-band-tabs__level">{{ Math.round((audioMappingLevels[tabIndex] || 0) * 100) }}%</span>
            </button>
          </div>

          <div
            v-if="activeAudioMapping"
            class="modulation-lfo-card modulation-audio-band-card"
            :class="{ 'modulation-lfo-card--active': audioReactiveActive || audioSpectrumPlaying }"
          >
            <div class="modulation-lfo-card__header">
              <div class="modulation-lfo-card__title">
                <span class="modulation-lfo-card__dot"></span>
                <span>{{ audioBandTabDefs.find(t => t.key === audioActiveBandTab)?.label || 'Band' }} band</span>
              </div>
              <code class="modulation-lfo-card__meta">
                {{ activeAudioMapping.freq_min }}–{{ activeAudioMapping.freq_max }} Hz
              </code>
            </div>

            <div class="modulation-audio-band-card__meter">
              <div class="audio-map-card__freq-meter" :class="{ 'audio-map-card__freq-meter--active': audioSpectrumPlaying || audioReactiveActive }">
                <div class="audio-map-card__freq-band" :style="audioBandWindowStyle(activeAudioMapping)"></div>
                <div
                  class="audio-map-card__freq-bar"
                  :style="{ width: ((audioMappingLevels[activeAudioMappingIndex] || 0) * 100) + '%' }"
                ></div>
              </div>
              <div class="audio-map-card__meter-note">
                {{ audioSpectrumPlaying ? 'Live level from this band' : (audioReactiveActive ? 'Reactive stream active' : 'Play uploaded audio to preview levels') }}
              </div>
            </div>

            <div class="modulation-lfo-card__controls modulation-audio-band-card__controls">
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
                <span class="framesync-subtitle">Min Hz</span>
                <input type="number" class="framesync-input" v-model.number="activeAudioMapping.freq_min" min="20" max="20000" step="1">
              </label>
              <label class="modulation-lfo-card__control">
                <span class="framesync-subtitle">Max Hz</span>
                <input type="number" class="framesync-input" v-model.number="activeAudioMapping.freq_max" min="20" max="20000" step="1">
              </label>
              <label class="modulation-lfo-card__control">
                <span class="framesync-subtitle">Out min</span>
                <input type="number" class="framesync-input" v-model.number="activeAudioMapping.out_min" step="any">
              </label>
              <label class="modulation-lfo-card__control">
                <span class="framesync-subtitle">Out max</span>
                <input type="number" class="framesync-input" v-model.number="activeAudioMapping.out_max" step="any">
              </label>
            </div>
          </div>

          <div class="audio-reactive-panel__status" v-if="audioStatus">{{ audioStatus }}</div>
        </div>
      </template>

      <template v-else-if="currentSubTab.MODULATION==='BEAT_MACROS'">
        <div class="framesync-panel modulation-macros modulation-macros--audio" :class="{ 'modulation-macros--disabled': !audio.objectUrl }">
          <div class="framesync-header modulation-macros__header">
            <div class="framesync-title">Beat <span class="framesync-accent">Macros</span></div>
            <div class="modulation-panel__actions">
              <button class="framesync-button" :class="{active: beatMacroOn}" @click="beatMacroOn=!beatMacroOn" :disabled="!audio.objectUrl">{{ beatMacroOn ? 'On' : 'Off' }}</button>
              <button class="framesync-button" @click="addMacro" v-if="macrosRack.length<6" :disabled="!audio.objectUrl">+ Add Macro</button>
            </div>
          </div>
          <div v-if="!audio.objectUrl" class="framesync-subtitle modulation-macros__hint">
            Upload an audio file on the A/V sync tab to unlock beat macros.
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
import MorphCrossfaderPanel from '../MorphCrossfaderPanel.vue'
import ModulationActiveModsPanel from '../ModulationActiveModsPanel.vue'
import { proxyAppView } from './app-view-proxy.js'

export default {
  name: 'ModulationView',
  components: { Waveform, TargetCell, AudioSpectrumEditor, MorphCrossfaderPanel, ModulationActiveModsPanel },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
