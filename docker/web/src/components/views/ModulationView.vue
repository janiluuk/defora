<template>
  <div class="rack modulation-view">
    <div class="framesync-panel modulation-panel">
      <div class="framesync-header">
        <div class="framesync-title">Modulation <span class="framesync-accent">Patch Bay</span></div>
        <span class="modulation-summary">
          {{ currentSubTab.MODULATION === 'LFO' ? (lfos.filter(l => l.on).length + '/' + lfos.length + ' active') : (audioReactiveActive ? 'Audio live' : 'Audio idle') }}
        </span>
      </div>
      <div class="sub-pills modulation-subtabs">
        <button class="sub-pill" :class="{active: currentSubTab.MODULATION==='LFO'}" @click="switchSubTab('MODULATION','LFO')">LFO</button>
        <button class="sub-pill" :class="{active: currentSubTab.MODULATION==='AUDIO'}" @click="switchSubTab('MODULATION','AUDIO')">AUDIO</button>
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
              </div>
            </div>
          </div>
          <div class="modulation-target-board__grid">
            <TargetCell
              v-for="target in lfoTargets"
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

      <template v-else>
        <div class="modulation-audio-stack">
          <div class="framesync-panel modulation-audio-panel">
            <div class="framesync-header">
              <div class="framesync-title">Reference <span class="framesync-accent">A/V sync</span></div>
              <button class="framesync-button" @click="avSyncCollapsed = !avSyncCollapsed">{{ avSyncCollapsed ? 'Show' : 'Hide' }}</button>
            </div>
            <div v-if="!avSyncCollapsed">
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
          </div>

          <div class="framesync-panel audio-reactive-panel">
            <div class="framesync-header">
              <div class="framesync-title">Audio <span class="framesync-accent">Reactive</span></div>
              <button class="framesync-button audio-start-button" :class="{ active: audioReactiveActive }" @click="startAudioStream">
                {{ audioReactiveActive ? 'Running' : 'Start' }}
              </button>
            </div>
            <div class="framesync-subtitle" style="margin-top:8px;">
              Map frequency bands to parameters. Live audio from mic/system → frequency analysis → parameter modulation.
            </div>
            <div class="audio-map-grid" style="margin-top:12px;">
              <div class="audio-map-card" :class="{ 'audio-map-card--live': audioReactiveActive }" v-for="(m, idx) in audioMappings" :key="'amap-'+idx">
                <div class="audio-map-card__header">
                  <div class="audio-map-card__title-wrap">
                    <span class="audio-map-card__target-name">{{ lfoTargets.find(t => t.key === m.param)?.label || m.param || 'No target' }}</span>
                    <select class="framesync-select audio-map-card__target" v-model="m.param">
                      <option value="">Select target…</option>
                      <option v-for="target in lfoTargets" :key="'audio-target-' + idx + '-' + target.key" :value="target.key">
                        {{ target.key }}
                      </option>
                    </select>
                  </div>
                  <button class="framesync-button audio-map-card__remove" @click="removeAudioMapping(idx)">✕</button>
                </div>
                <div class="audio-map-card__freq-meter" :class="{ 'audio-map-card__freq-meter--active': audioReactiveActive }">
                  <div class="audio-map-card__freq-band" :style="audioBandWindowStyle(m)"></div>
                  <div class="audio-map-card__freq-bar" :style="{ width: ((audioMappingLevels[idx] || 0) * 100) + '%' }"></div>
                </div>
                <div class="audio-map-card__meter-note">{{ audioReactiveActive ? 'Listening to the selected band' : 'Idle until Start is active' }}</div>
                <div class="audio-map-card__fields">
                  <div class="framesync-subtitle">Freq range</div>
                  <div class="audio-map-card__pair">
                    <input type="number" class="framesync-input audio-map-card__input" v-model.number="m.freq_min" min="20" max="20000" placeholder="Min Hz">
                    <input type="number" class="framesync-input audio-map-card__input" v-model.number="m.freq_max" min="20" max="20000" placeholder="Max Hz">
                  </div>
                  <div class="framesync-subtitle">Output range</div>
                  <div class="audio-map-card__pair">
                    <input type="number" class="framesync-input audio-map-card__input" v-model.number="m.out_min" step="any" placeholder="Min out">
                    <input type="number" class="framesync-input audio-map-card__input" v-model.number="m.out_max" step="any" placeholder="Max out">
                  </div>
                  <div class="audio-map-card__presets">
                    <span class="audio-map-card__presets-label">Quick presets</span>
                    <button
                      class="framesync-button audio-band-pill"
                      v-for="chip in audioBandChips"
                      :key="'audio-chip-' + idx + '-' + chip.key"
                      @click="applyAudioBandPreset(idx, chip.key)"
                    >
                      {{ chip.label }}
                    </button>
                  </div>
                </div>
              </div>
              <button class="framesync-button audio-add-mapping" @click="addAudioMapping">+ Add mapping</button>
            </div>
            <div class="audio-reactive-panel__status" v-if="audioStatus">{{ audioStatus }}</div>
          </div>

          <div class="framesync-panel modulation-macros modulation-macros--audio" :class="{ 'modulation-macros--disabled': !audio.objectUrl }">
            <div class="framesync-header modulation-macros__header">
              <div class="framesync-title">Beat <span class="framesync-accent">Macros</span></div>
              <div class="modulation-panel__actions">
                <button class="framesync-button" @click="audioBeatMacrosCollapsed = !audioBeatMacrosCollapsed" :disabled="!audio.objectUrl">
                  {{ audioBeatMacrosCollapsed ? 'Show' : 'Hide' }}
                </button>
                <button class="framesync-button" :class="{active: beatMacroOn}" @click="beatMacroOn=!beatMacroOn" :disabled="!audio.objectUrl">{{ beatMacroOn ? 'On' : 'Off' }}</button>
                <button class="framesync-button" @click="addMacro" v-if="macrosRack.length<6" :disabled="!audio.objectUrl">+ Add Macro</button>
              </div>
            </div>
            <div v-if="!audio.objectUrl" class="framesync-subtitle modulation-macros__hint">
              Upload an audio file to unlock beat macros for the audio-reactive workflow.
            </div>
            <div v-else-if="audioBeatMacrosCollapsed" class="framesync-subtitle modulation-macros__hint">
              Beat macros are ready. Expand the panel to edit targets, shape, BPM, and depth.
            </div>
            <div v-else class="modulation-macro-strip">
              <div v-for="(macro, idx) in macrosRack" :key="'macro-' + idx" class="modulation-macro-pill" :class="{ 'modulation-macro-pill--active': macro.on }" :style="macro.on ? { '--macro-beat-dur': ((60 / (macro.bpm || 120)).toFixed(3) + 's') } : {}">
                <label class="switch modulation-macro-pill__switch"><input type="checkbox" v-model="macro.on"> Macro {{ idx + 1 }}</label>
                <select class="framesync-select modulation-macro-pill__select" v-model="macro.target">
                  <option value="">None</option>
                  <option v-for="target in lfoTargets" :key="'macro-target-' + idx + '-' + target.key" :value="target.key">{{ target.label }}</option>
                </select>
                <select class="framesync-select modulation-macro-pill__select" v-model="macro.shape">
                  <option v-for="shape in [...lfoShapes, 'Noise']" :key="'macro-shape-' + idx + '-' + shape" :value="shape">{{ shape }}</option>
                </select>
                <input type="number" class="framesync-input modulation-macro-pill__input" v-model.number="macro.bpm" min="20" max="300">
                <input type="number" class="framesync-input modulation-macro-pill__input" v-model.number="macro.depth" min="0" max="1" step="0.01">
              </div>
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
import { proxyAppView } from './app-view-proxy.js'

export default {
  name: 'ModulationView',
  components: { Waveform, TargetCell },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
