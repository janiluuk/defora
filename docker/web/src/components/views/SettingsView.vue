<template>
  <div class="settings-tab-shell">
    <div class="sub-pills settings-subtabs">
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='ENGINE'}" @click="switchSubTab('SETTINGS','ENGINE')">ENGINE</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='OUTPUT'}" @click="switchSubTab('SETTINGS','OUTPUT')">OUTPUT</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='GPUS'}" @click="switchSubTab('SETTINGS','GPUS')">GPUS</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='RUNS' || currentSubTab.SETTINGS==='SYSTEM'}" @click="switchSubTab('SETTINGS','RUNS')">RUNS</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='MIDI'}" @click="switchSubTab('SETTINGS','MIDI')">CONTROLLERS / MIDI</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='STYLES'}" @click="switchSubTab('SETTINGS','STYLES')">STYLES</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='PLUGINS'}" @click="switchSubTab('SETTINGS','PLUGINS')">PLUGINS</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='COLLAB'}" @click="switchSubTab('SETTINGS','COLLAB')">COLLAB</button>
    </div>

    <div v-if="currentSubTab.SETTINGS==='ENGINE'">
      <div class="rack">
        <GlassPanel size="lg" class="engine-model-glass">
          <template #header>Checkpoint</template>
          <div class="engine-main-summary engine-main-summary--glass">
            <button
              type="button"
              class="engine-main-card engine-main-card--wide engine-main-card--picker"
              :disabled="forge.switching"
              :title="engineCurrentModelName ? 'Change checkpoint' : 'Select checkpoint'"
              data-testid="engine-model-picker"
              @click="openEngineModelPicker()"
            >
              <div class="framesync-subtitle">Current model</div>
              <div class="engine-main-card__value engine-main-card__value--model">{{ engineCurrentModelName || 'Select checkpoint' }}</div>
              <div class="engine-main-card__meta">{{ engineOptimizedProfileLabel }} · {{ engineCurrentModelFamilyLabel }}</div>
              <div class="engine-main-card__hint">Click to browse checkpoints</div>
            </button>
            <div class="engine-main-card engine-main-card--stat">
              <div class="framesync-subtitle">CFG</div>
              <div class="engine-main-card__value">{{ engineCurrentCfgScale.toFixed(1) }}</div>
            </div>
            <div class="engine-main-card engine-main-card--stat">
              <div class="framesync-subtitle">Steps</div>
              <div class="engine-main-card__value">{{ engineCurrentSteps }}</div>
            </div>
            <div class="engine-main-card engine-main-card--stat">
              <div class="framesync-subtitle">Sampler</div>
              <div class="engine-main-card__value engine-main-card__value--small">{{ deforumSettings.sampler || '—' }}</div>
            </div>
          </div>
          <div class="engine-main-inline-status-row">
            <span class="model-status-pill" :class="'model-' + modelStatusKind">
              <span class="model-status-dot"></span>
              {{ modelStatusLabel }}
            </span>
            <span class="engine-main-inline-status">{{ deforumSettingsStatus || 'Idle' }}</span>
          </div>
        </GlassPanel>

        <details class="engine-advanced-panel framesync-panel">
          <summary class="engine-advanced-panel__summary">Advanced sampling &amp; resolution</summary>
          <div class="framesync-row engine-main-grid" style="grid-template-columns: 1fr 1fr 0.8fr 0.8fr; gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Sampler</div>
              <select class="framesync-select" :value="deforumSettings.sampler" @change="onEngineSamplerChange($event.target.value)">
                <option v-for="sampler in engineSamplerOptions" :key="'engine-sampler-' + sampler" :value="sampler">{{ sampler }}</option>
              </select>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Scheduler</div>
              <select class="framesync-select" :value="deforumSettings.scheduler" @change="onEngineSchedulerChange($event.target.value)">
                <option v-for="scheduler in engineSchedulerOptions" :key="'engine-scheduler-' + scheduler" :value="scheduler">{{ scheduler }}</option>
              </select>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Steps</div>
              <input
                type="number"
                class="framesync-input"
                :value="engineCurrentSteps"
                min="1"
                max="150"
                step="1"
                :disabled="lcmEngineEnabled"
                :title="lcmEngineEnabled ? 'Steps are controlled by LCM Engine' : ''"
                data-testid="engine-steps-input"
                @input="onEngineStepsChange($event.target.value)"
              >
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">CFG</div>
              <input type="number" class="framesync-input" :value="engineCurrentCfgScale" min="0" max="30" step="0.1" @input="onEngineCfgScaleChange($event.target.value)">
            </div>
          </div>
          <div class="framesync-row" style="grid-template-columns: repeat(4, 1fr); gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Resolution</div>
              <select class="framesync-select" :value="deforumSettings.W + 'x' + deforumSettings.H" @change="onEngineResolutionChange($event.target.value)">
                <option value="512x512">512×512</option>
                <option value="960x540">960×540</option>
                <option value="1024x1024">1024×1024</option>
              </select>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Global FPS</div>
              <select class="framesync-select" :value="deforumSettings.fps" @change="setGlobalFps(+$event.target.value)">
                <option :value="8">8</option>
                <option :value="12">12</option>
                <option :value="24">24</option>
                <option :value="30">30</option>
              </select>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Model source</div>
              <span class="model-source-pill" :class="'src-' + (forge.modelsSource || 'placeholder')">
                {{ forge.modelsSource || 'unknown' }}
              </span>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Status</div>
              <div class="engine-main-inline-status">{{ deforumSettingsStatus || 'Idle' }}</div>
            </div>
          </div>
          <div class="lcm-engine-panel" data-testid="lcm-engine-panel">
            <label class="lcm-engine-panel__toggle">
              <input
                type="checkbox"
                :checked="lcmEngineEnabled"
                data-testid="lcm-engine-toggle"
                @change="setLcmEngineEnabled($event.target.checked)"
              >
              <span>LCM Engine</span>
            </label>
            <template v-if="lcmEngineEnabled">
              <div class="lcm-engine-panel__fields">
                <div class="framesync-stack">
                  <div class="framesync-subtitle">LCM steps</div>
                  <input
                    type="number"
                    class="framesync-input"
                    data-testid="lcm-engine-steps"
                    min="1"
                    max="20"
                    step="1"
                    :value="lcmEngine.steps"
                    @input="onLcmEngineStepsChange($event.target.value)"
                  >
                </div>
                <div class="framesync-stack lcm-engine-panel__lora">
                  <div class="framesync-subtitle">LCM LoRA tag</div>
                  <input
                    type="text"
                    class="framesync-input"
                    data-testid="lcm-engine-lora"
                    :value="lcmEngine.loraTag"
                    @input="onLcmEngineLoraChange($event.target.value)"
                  >
                </div>
              </div>
            </template>
          </div>
          <div class="framesync-footer" style="margin-top:12px;">
            <button class="framesync-button" :disabled="forge.switching || !engineCurrentModelName" @click="reapplyEngineModelDefaults()">Optimize for model</button>
            <div class="engine-seed-control" data-testid="engine-seed-control">
              <span class="engine-seed-control__label">Seed</span>
              <button
                type="button"
                class="chip chip--compact"
                :class="{ active: seedRandomEnabled }"
                data-testid="seed-random-toggle"
                @click="setSeedRandomEnabled(!seedRandomEnabled)"
              >
                Random
              </button>
              <input
                v-if="!seedRandomEnabled"
                type="number"
                class="framesync-input engine-seed-control__input"
                data-testid="seed-value-input"
                min="0"
                max="2147483647"
                step="1"
                :value="deforumSettings.seed"
                @input="onDeforumSeedInput($event.target.value)"
              />
              <span v-else class="engine-seed-control__random-hint">−1 · random each run</span>
            </div>
            <span class="framesync-button" style="cursor:default;">{{ deforumSettings.W }}×{{ deforumSettings.H }} @ {{ deforumSettings.fps }} fps</span>
            <span class="framesync-button" style="cursor:default;">Profile: {{ engineOptimizedProfileLabel }}</span>
          </div>
        </details>

      <div v-if="engineModelPickerOpen" class="engine-model-picker" @click="onEngineModelPickerBackdropClick">
        <div class="engine-model-picker__dialog" role="dialog" aria-modal="true" aria-label="Checkpoint selector">
          <div class="engine-model-picker__header">
            <div>
              <div class="framesync-title">Select <span class="framesync-accent">Checkpoint</span></div>
              <div class="framesync-subtitle engine-model-picker__subtitle">
                {{ forge.modelsSource ? ('Source: ' + (forge.modelsSource || 'unknown')) : 'Loading checkpoints from Forge' }}
              </div>
            </div>
            <div class="engine-model-picker__header-actions">
              <button type="button" class="framesync-button" :disabled="forge.loading" @click="refreshForgeModels()">Refresh</button>
              <button type="button" class="framesync-button" @click="closeEngineModelPicker()">Close</button>
            </div>
          </div>

          <div class="sub-pills engine-model-picker__tabs">
            <button
              v-for="family in engineModelFamilyTabs"
              :key="'engine-model-tab-' + family.key"
              type="button"
              class="sub-pill"
              :class="{ active: engineModelPickerTab === family.key }"
              @click="setEngineModelPickerTab(family.key)"
            >
              {{ family.label }}
              <span class="engine-model-picker__tab-count">{{ (groupedEngineModels[family.key] || []).length }}</span>
            </button>
          </div>

          <div v-if="forge.switching" class="framesync-subtitle engine-model-picker__status">Switching checkpoint…</div>
          <div v-else-if="forge.loading && !forge.models.length" class="framesync-subtitle engine-model-picker__status">Loading checkpoints…</div>
          <div v-else-if="!activeEngineModelList.length" class="engine-model-picker__empty">
            No checkpoints in this family. Try another tab or refresh the model list.
          </div>
          <div v-else class="engine-model-picker__list">
            <button
              v-for="model in activeEngineModelList"
              :key="model.model_name || model.title"
              type="button"
              class="engine-model-picker__item"
              :class="{ active: normalizeModelName(model.model_name || model.title) === engineCurrentModelName }"
              :disabled="forge.switching"
              @click="selectEngineModel(model)"
            >
              <span class="engine-model-picker__item-title">{{ model.title || model.model_name }}</span>
              <span class="engine-model-picker__item-meta">{{ model.model_name || model.title }}</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='MIDI'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">Controllers <span class="framesync-accent">/ MIDI</span></div>
          </div>
          <div v-if="!midi.supported" style="color:var(--text-secondary); margin-top:12px; font-size:12px;">WebMIDI not supported or not enabled.</div>
          <div v-else>
            <div class="framesync-footer" style="margin-top:12px;">
              <button class="framesync-button" v-for="d in midi.devices" :key="d.id" :class="{active: midi.selected===d.id}" @click="midi.selected=d.id">{{ d.name }}</button>
              <button class="framesync-button" @click="scanMidi()">Rescan</button>
            </div>
            <div class="framesync-footer" style="margin-top:8px;">
              <button class="framesync-button">Learn mode</button>
              <button class="framesync-button" @click="addMidiMapping">+ Add Mapping</button>
              <button class="framesync-button">Status: {{ midiStatus }}</button>
            </div>
            <div class="framesync-subtitle" style="margin-top:10px;">
              Quick targets: <strong>Modulation 1–6</strong> map to the LIVE drawer performance widgets.
            </div>
            <div style="margin-top:12px; background:var(--bg-0); border:1px solid var(--border); border-radius:8px; overflow:hidden;">
              <table class="table">
                <thead><tr><th>Control</th><th>CC</th><th>Target</th><th>Actions</th></tr></thead>
                <tbody>
                  <tr v-for="(m, idx) in midi.mappings" :key="'midi'+idx">
                    <td><input class="framesync-input" v-model="m.control" @change="saveMidiMappings" style="width:100px; padding:4px;"></td>
                    <td><input class="framesync-input" type="number" v-model.number="m.cc" @change="saveMidiMappings" style="width:60px; padding:4px;"></td>
                    <td>
                      <select class="framesync-select" v-model="m.key" @change="saveMidiMappings" style="width:120px; padding:4px;">
                        <option value="">None</option>
                        <optgroup label="Modulation 1–6">
                          <option v-for="n in 6" :key="'modslot-'+n" :value="'mod_slot_' + n">
                            {{ 'Modulation ' + n }}
                          </option>
                        </optgroup>
                        <option v-for="t in modulationTargets" :key="'mopt'+t.key" :value="t.key">{{ t.label }}</option>
                      </select>
                    </td>
                    <td><button class="framesync-button" @click="deleteMidiMapping(idx)" style="padding:4px 8px; cursor:pointer;">Delete</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">Parameter <span class="framesync-accent">Bindings</span></div>
            <div style="display:flex; gap:8px; align-items:center;">
              <button class="framesync-button" :class="{active: bindingLearnMode}" @click="toggleBindingLearn">{{ bindingLearnMode ? 'Stop learn' : 'Learn' }}</button>
              <button class="framesync-button" @click="resetBindings">Defaults</button>
            </div>
          </div>
          <div v-if="bindingLearnMode" style="margin-top:8px; padding:8px 12px; background:rgba(127,119,221,0.08); border:1px solid var(--accent); border-radius:6px; font-size:12px; color:var(--accent-text);">
            Learn mode active. Press a key or move a MIDI controller, then click a parameter to bind.
          </div>
          <div class="framesync-row" style="grid-template-columns: repeat(2, 1fr); gap:10px; margin-top:12px;">
            <div class="framesync-stack" v-for="group in bindingGroups" :key="group.label">
              <div class="framesync-subtitle">{{ group.label }}</div>
              <div style="background:var(--bg-0); border:1px solid var(--border); border-radius:6px; overflow:hidden;">
                <table style="width:100%; font-size:11px; border-collapse:collapse;">
                  <thead><tr style="color:var(--text-dim); border-bottom:1px solid var(--border);">
                    <th style="text-align:left; padding:4px 8px;">Parameter</th>
                    <th style="text-align:left; padding:4px 8px;">Key</th>
                    <th style="text-align:left; padding:4px 8px;">MIDI CC</th>
                    <th style="padding:4px 8px;">Actions</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="t in group.items" :key="t.key" style="border-bottom:1px solid var(--border);">
                      <td style="padding:4px 8px; color:var(--text-primary);">{{ t.label }}</td>
                      <td style="padding:4px 8px;">
                        <span v-if="getKeyBinding(t.key)" style="display:inline-flex; align-items:center; gap:4px;">
                          <kbd style="background:var(--bg-2); border:1px solid var(--border-strong); border-radius:3px; padding:2px 6px; font-family:monospace; font-size:10px; color:var(--success);">{{ getKeyBinding(t.key) }}</kbd>
                          <button type="button" class="framesync-icon-button" aria-label="Clear key binding" @click="clearKeyBinding(t.key)"><UiIcon name="close" /></button>
                        </span>
                        <span v-else style="color:var(--text-dim);">—</span>
                      </td>
                      <td style="padding:4px 8px;">
                        <span v-if="getMidiBinding(t.key)" style="display:inline-flex; align-items:center; gap:4px;">
                          <span style="background:var(--bg-2); border:1px solid var(--border-strong); border-radius:3px; padding:2px 6px; font-size:10px; color:var(--warn);">CC {{ getMidiBinding(t.key) }}</span>
                          <button type="button" class="framesync-icon-button" aria-label="Clear MIDI binding" @click="clearMidiBinding(t.key)"><UiIcon name="close" /></button>
                        </span>
                        <span v-else style="color:var(--text-dim);">—</span>
                      </td>
                      <td style="padding:4px 8px; text-align:center;">
                        <button v-if="bindingLearnMode" class="framesync-button framesync-button--compact" @click="bindingTargetKey=t.key">Bind here</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">Preset <span class="framesync-accent">Management</span></div>
          </div>
          <div class="framesync-footer" style="margin-top:12px;">
            <button class="framesync-button" v-for="p in availablePresets" :key="p" :class="{active: currentPreset===p}" @click="loadPreset(p)">{{ p }}</button>
            <button class="framesync-button" @click="refreshPresets">Refresh</button>
          </div>
          <div class="framesync-stack" style="margin-top:12px;">
            <div class="framesync-subtitle">New preset name</div>
            <input class="framesync-input" v-model="newPresetName" placeholder="my-preset">
          </div>
          <div class="framesync-footer" style="margin-top:10px;">
            <button class="framesync-button" @click="saveCurrentPreset">Save current as preset</button>
            <button class="framesync-button framesync-button--danger" v-if="currentPreset" @click="deletePreset(currentPreset)">Delete {{ currentPreset }}</button>
          </div>
          <div v-if="presetStatus" class="framesync-subtitle" style="margin-top:8px; text-align:center;">{{ presetStatus }}</div>

          <div class="framesync-header" style="margin-top:20px; padding-top:12px; border-top:1px solid var(--border);">
            <div class="framesync-title">Shared <span class="framesync-accent">Presets</span></div>
            <button class="framesync-button" @click="refreshSharedPresets">Refresh</button>
          </div>
          <div class="framesync-row" style="grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Share as</div>
              <input class="framesync-input" v-model="sharedPresetName" placeholder="shared-preset-name">
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Your name</div>
              <input class="framesync-input" v-model="collab.userName" placeholder="Performer" @change="saveCollabUserName">
            </div>
          </div>
          <div class="framesync-footer" style="margin-top:8px;">
            <button class="framesync-button" @click="shareCurrentPreset">Share current state</button>
          </div>
          <ul v-if="sharedPresets.length" class="framesync-list" style="margin-top:10px; font-size:11px; padding-left:16px;">
            <li v-for="sp in sharedPresets" :key="sp.name" style="margin-bottom:6px; display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
              <strong>{{ sp.name }}</strong>
              <span style="color:var(--text-dim);">by {{ sp.sharedBy }}</span>
              <button class="framesync-button framesync-button--compact" @click="loadSharedPreset(sp.name)">Load</button>
              <button class="framesync-button framesync-button--danger framesync-button--compact" @click="deleteSharedPreset(sp.name)">Delete</button>
            </li>
          </ul>
          <div v-else style="margin-top:10px; font-size:11px; color:var(--text-dim);">No shared presets yet.</div>
          <div v-if="sharedPresetsStatus" class="framesync-subtitle" style="margin-top:8px;">{{ sharedPresetsStatus }}</div>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='GPUS'">
      <div class="rack">
        <div class="framesync-panel" data-testid="service-health-panel">
          <div class="framesync-header">
            <div class="framesync-title">Service <span class="framesync-accent">Health</span></div>
            <button
              class="framesync-button framesync-button--compact"
              @click="refreshServiceHealth"
              :disabled="serviceHealth.loading"
            >
              Refresh
            </button>
          </div>

          <div class="service-health-grid">
            <div class="service-health-card">
              <div class="service-health-card__head">
                <strong>Web</strong>
                <span class="gpu-status-pill" :class="serviceHealth.web && serviceHealth.web.ok ? 'st-healthy' : 'st-unhealthy'">
                  {{ serviceHealth.web && serviceHealth.web.ok ? 'healthy' : 'down' }}
                </span>
              </div>
              <div class="service-health-card__meta">HTTP <code>/health</code></div>
            </div>

            <div class="service-health-card">
              <div class="service-health-card__head">
                <strong>HLS</strong>
                <span
                  class="gpu-status-pill"
                  :class="serviceHealth.hls && serviceHealth.hls.updated ? ((serviceHealth.hls.ageMs != null && serviceHealth.hls.ageMs < 15000) ? 'st-healthy' : (serviceHealth.hls.ageMs != null && serviceHealth.hls.ageMs < 60000) ? 'st-unknown' : 'st-unhealthy') : 'st-unknown'"
                >
                  {{ serviceHealth.hls && serviceHealth.hls.updated ? 'ok' : 'unknown' }}
                </span>
              </div>
              <div class="service-health-card__meta">
                Playlist updated:
                <span v-if="serviceHealth.hls && serviceHealth.hls.updated">
                  {{ Math.round((serviceHealth.hls.ageMs || 0) / 1000) }}s ago
                </span>
                <span v-else>—</span>
              </div>
            </div>

            <div class="service-health-card">
              <div class="service-health-card__head">
                <strong>SD-Forge</strong>
                <span class="gpu-status-pill" :class="apiHealth.sdForge && apiHealth.sdForge.available ? 'st-healthy' : 'st-unhealthy'">
                  {{ apiHealth.sdForge && apiHealth.sdForge.available ? 'available' : 'offline' }}
                </span>
              </div>
              <div class="service-health-card__meta">Last checked: {{ (apiHealth.sdForge && apiHealth.sdForge.lastChecked) ? formatDate(apiHealth.sdForge.lastChecked) : '—' }}</div>
            </div>

            <div class="service-health-card">
              <div class="service-health-card__head">
                <strong>Mediator</strong>
                <span class="gpu-status-pill" :class="mediatorHealthSummary.ok ? 'st-healthy' : 'st-unhealthy'">
                  {{ mediatorHealthSummary.label }}
                </span>
              </div>
              <div class="service-health-card__meta">
                <span v-if="sdForgeGpuNodes.length">{{ sdForgeGpuNodes.length }} forge instance(s)</span>
                <span v-else-if="infrastructure.mediator"><code>{{ infrastructure.mediator.address }}</code></span>
                <span v-else>—</span>
              </div>
            </div>

            <div class="service-health-card">
              <div class="service-health-card__head">
                <strong>Streamer</strong>
                <span class="gpu-status-pill" :class="serviceHealth.stream && serviceHealth.stream.status === 'running' ? 'st-healthy' : serviceHealth.stream && serviceHealth.stream.status === 'stopped' ? 'st-unknown' : 'st-unknown'">
                  {{ serviceHealth.stream ? serviceHealth.stream.status : 'unknown' }}
                </span>
              </div>
              <div class="service-health-card__meta"><code>/api/stream/status</code></div>
            </div>
          </div>

          <div class="framesync-subtitle" style="margin-top:10px;">
            Last refresh: {{ serviceHealth.lastChecked ? formatDate(serviceHealth.lastChecked) : '—' }}
          </div>
        </div>

        <div class="framesync-panel infra-panel" data-testid="infrastructure-panel">
          <div class="framesync-header">
            <div class="framesync-title">Stack <span class="framesync-accent">Services</span></div>
            <button class="framesync-button framesync-button--compact" @click="refreshGpuPool(true)" :disabled="infrastructure.loading || gpuPool.loading">
              Refresh
            </button>
          </div>

          <div class="infra-section" data-testid="infra-mediator-list">
            <div class="framesync-subtitle">Mediator per SD-Forge instance</div>
            <div v-if="gpuPool.loading && !sdForgeGpuNodes.length" class="infra-panel__empty">Loading forge mediators…</div>
            <div v-else-if="sdForgeGpuNodes.length" class="infra-mediator-list">
              <div
                v-for="n in sdForgeGpuNodes"
                :key="'infra-mediator-' + n.id"
                class="infra-mediator-card"
                :data-testid="n.id === sdForgeGpuNodes[0].id ? 'infra-mediator-card' : undefined"
              >
                <div class="infra-mediator-card__head">
                  <strong>{{ n.name }}</strong>
                  <span v-if="n.mediator" class="gpu-status-pill" :class="mediatorStatusClass(n.mediator.deforumationStatus)">
                    Deforumation {{ n.mediator.deforumationStatus }}
                  </span>
                  <span v-if="n.mediator" class="gpu-status-pill" :class="mediatorStatusClass(n.mediator.deforumStatus)">
                    Deforum {{ n.mediator.deforumStatus }}
                  </span>
                </div>
                <div v-if="n.mediator" class="infra-mediator-card__meta">
                  <span>Host <code>{{ n.mediator.host }}</code></span>
                  <span>Deforumation <code>{{ n.mediator.deforumationWsUrl }}</code></span>
                  <span>Deforum bridge <code>{{ n.mediator.deforumWsUrl }}</code></span>
                </div>
                <div v-else class="infra-panel__empty">No mediator settings — disable node and Edit to configure.</div>
              </div>
            </div>
            <div v-else-if="infrastructure.mediator" class="infra-mediator-card" data-testid="infra-mediator-card">
              <div class="infra-mediator-card__head">
                <span class="gpu-status-pill" :class="infrastructure.mediator.status === 'healthy' ? 'st-healthy' : 'st-unhealthy'">
                  {{ infrastructure.mediator.status }}
                </span>
                <strong>{{ infrastructure.mediator.address }}</strong>
                <span class="infra-mediator-card__source">{{ infrastructure.mediator.source }}</span>
              </div>
              <div class="infra-mediator-card__meta">
                <span>Deforumation <code>{{ infrastructure.mediator.wsUrl }}</code></span>
                <span>Deforum <code>{{ infrastructure.mediator.deforumWsUrl }}</code> · {{ infrastructure.mediator.deforumStatus }}</span>
              </div>
            </div>
            <div v-else class="infra-panel__empty">No SD-Forge instances with mediator configuration.</div>
            <p class="infra-panel__hint">
              Each forge host runs its own mediator (e.g. <code>vimage5</code> → <code>vimage5:8765</code> / <code>:8766</code>).
              Edit an instance (disable first) to change host and ports, or use <strong>Check ports</strong> in the forge editor.
            </p>
          </div>

          <div class="infra-section">
            <div class="framesync-subtitle">FFmpeg transcoder nodes</div>
            <div v-if="infrastructure.loading && !infrastructure.transcoders.length" class="infra-panel__empty">Loading transcoders…</div>
            <div v-else-if="!infrastructure.transcoders.length" class="infra-panel__empty">No transcoder nodes configured.</div>
            <div v-else class="gpu-pool-table-wrap" data-testid="infra-transcoder-table">
              <table class="gpu-pool-table infra-transcoder-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>CPU</th>
                    <th>Jobs</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="node in infrastructure.transcoders" :key="node.id">
                    <td><strong>{{ node.name }}</strong></td>
                    <td>
                      <code class="infra-address">{{ node.address }}</code>
                      <span v-if="node.rtmpTarget && node.rtmpTarget !== node.address" class="infra-address-sub">{{ node.rtmpTarget }}</span>
                    </td>
                    <td>{{ node.cpuLabel }}</td>
                    <td>{{ node.jobsLabel }}</td>
                    <td>
                      <span class="gpu-status-pill" :class="'st-' + (node.status === 'streaming' ? 'healthy' : node.status === 'idle' ? 'unknown' : 'unhealthy')">
                        {{ node.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="infra-panel__hint">
              Configure extra nodes with <code>TRANSCODER_NODES</code> (format: <code>name|host:port|rtmp://target|statusUrl</code>).
              Optional <code>statusUrl</code> returns JSON <code>{ "cpu": 12.5, "activeJobs": 1 }</code>.
            </p>
          </div>
        </div>

        <div class="framesync-panel" data-testid="gpu-pool-panel">
          <div class="framesync-header">
            <div class="framesync-title">GPU <span class="framesync-accent">Pool</span></div>
            <label class="framesync-checkbox gpu-pool-enable">
              <input type="checkbox" v-model="gpuPool.enabled" @change="saveGpuPoolSettings">
              Load balancing
            </label>
          </div>
          <div class="framesync-row" style="grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Strategy</div>
              <select class="framesync-select" v-model="gpuPool.strategy" @change="saveGpuPoolSettings" :disabled="gpuPool.loading">
                <option value="round_robin">Round robin</option>
                <option value="least_busy">Least busy</option>
                <option value="priority">Priority</option>
                <option value="random">Random</option>
              </select>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Healthy / total</div>
              <div class="gpu-pool-healthy-count">{{ gpuPool.healthyNodes }} / {{ gpuPool.nodes.length }}</div>
            </div>
            <div class="framesync-stack" style="justify-content:flex-end;">
              <button class="framesync-button" @click="refreshGpuPool(true)" :disabled="gpuPool.loading">Refresh stats</button>
            </div>
          </div>
          <div class="framesync-row" style="grid-template-columns: 2fr 1fr; gap:10px; margin-top:10px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Default SD-Forge model</div>
              <select class="framesync-select" v-model="gpuPool.defaultForgeModel" :disabled="gpuPool.loading || forge.switching || !forge.models || !forge.models.length">
                <option value="">(no default)</option>
                <option v-for="m in (forge.models || [])" :key="'gpu-default-model-' + (m.title || m.model_name)" :value="m.title || m.model_name">
                  {{ m.title || m.model_name }}
                </option>
              </select>
            </div>
            <div class="framesync-stack" style="justify-content:flex-end;">
              <button
                class="framesync-button"
                @click="saveDefaultForgeModel({ preload: true })"
                :disabled="gpuPool.loading || forge.switching || !gpuPool.defaultForgeModel"
                title="Switch model on healthy SD-Forge nodes now so new jobs start instantly"
              >
                Save + preload
              </button>
            </div>
          </div>
          <div v-if="gpuPool.defaultForgeModelStatus" class="framesync-subtitle" style="margin-top:10px;">
            {{ gpuPool.defaultForgeModelStatus }}
          </div>
          <p style="font-size:11px; color:var(--text-dim); margin:12px 0 0;">
            Add SD-Forge (A1111 API), ComfyUI, or Ollama instances. Disable a node to edit or remove it.
            Generation load balancing uses enabled <strong>SD-Forge</strong> nodes for img2img/txt2img/Deforum, while the story generator uses configured <strong>Ollama</strong> nodes.
          </p>
          <div class="gpu-pool-add" style="margin-top:14px; padding:12px; border:1px solid var(--border); border-radius:10px;">
            <div class="framesync-subtitle">Add instance (saved disabled — enable after editing)</div>
            <div class="framesync-row" style="grid-template-columns: 2fr 1fr 1fr; gap:8px; margin-top:8px;">
              <input class="framesync-input" v-model="gpuPool.draft.url" placeholder="http://host:7860, :8188, or :11434" :disabled="gpuPool.loading">
              <input class="framesync-input" v-model="gpuPool.draft.name" placeholder="Name" :disabled="gpuPool.loading">
              <select class="framesync-select" v-model="gpuPool.draft.backend" :disabled="gpuPool.loading">
                <option value="sd-forge">SD-Forge</option>
                <option value="comfyui">ComfyUI</option>
                <option value="ollama">Ollama</option>
              </select>
            </div>
            <div v-if="gpuPool.draft.backend === 'ollama'" class="framesync-footer" style="margin-top:8px; align-items:center; gap:8px; flex-wrap:wrap;">
              <select class="framesync-select" v-model="gpuPool.draft.model" :disabled="gpuPool.loading" style="min-width:220px;">
                <option value="">Select Ollama model…</option>
                <option v-for="model in ollamaModelOptions(gpuPool.draft.url)" :key="'draft-'+model" :value="model">{{ model }}</option>
              </select>
              <button class="framesync-button" @click="refreshGpuDraftModels" :disabled="gpuPool.loading || !gpuPool.draft.url">Load models</button>
            </div>
            <div class="framesync-footer" style="margin-top:8px;">
              <button class="framesync-button" @click="addGpuNode" :disabled="gpuPool.loading || !gpuPool.draft.url">+ Add instance</button>
            </div>
          </div>

          <div v-if="gpuPool.nodes.length" style="margin-top:14px; display:grid; gap:10px;">
            <div v-for="n in gpuPool.nodes" :key="n.id" class="gpu-node-card" :class="{ 'gpu-row-disabled': !n.enabled }">
              <div class="gpu-node-card__header">
                <div class="gpu-node-card__identity">
                  <span class="gpu-status-pill" :class="'st-' + (n.enabled ? n.status : 'disabled')">{{ n.enabled ? n.status : 'disabled' }}</span>
                  <template v-if="gpuPool.editId === n.id">
                    <input class="framesync-input" v-model="gpuPool.editDraft.name" style="font-size:11px; width:120px;">
                    <input class="framesync-input" v-model="gpuPool.editDraft.url" style="font-size:10px; flex:1; min-width:160px;">
                    <select class="framesync-select" v-model="gpuPool.editDraft.backend" style="font-size:11px; width:100px;">
                      <option value="sd-forge">SD-Forge</option>
                      <option value="comfyui">ComfyUI</option>
                      <option value="ollama">Ollama</option>
                    </select>
                  </template>
                  <template v-else>
                    <strong style="font-size:12px;">{{ n.name }}</strong>
                    <span style="font-size:10px; color:var(--text-dim);">{{ n.url }}</span>
                    <span style="font-size:10px; color:var(--text-dim);">{{ n.backend }}</span>
                    <span v-if="n.backend === 'ollama' && (n.model || n.currentModel)" style="font-size:10px; color:var(--text-dim);">model: {{ n.model || n.currentModel }}</span>
                    <span v-if="n.backend === 'sd-forge' && n.mediator" style="font-size:10px; color:var(--text-dim);">
                      mediator: {{ n.mediator.host }}
                      · {{ n.mediator.deforumStatus }}/{{ n.mediator.deforumationStatus }}
                    </span>
                  </template>
                </div>
                <div class="gpu-node-card__stats">
                  <span title="Current model" style="font-size:10px; color:var(--text-secondary); max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ n.model || n.currentModel || '—' }}</span>
                  <span title="VRAM" style="font-size:10px; color:var(--text-dim);">{{ formatGpuMemory(n) }}</span>
                  <span title="GPU utilization" style="font-size:10px; color:var(--text-dim);">{{ n.gpuUtilization != null ? n.gpuUtilization + '%' : '—' }}</span>
                  <span title="Active jobs" style="font-size:10px; color:var(--text-dim);">{{ n.activeJobs }} jobs</span>
                  <span v-if="n.backend === 'sd-forge'" title="Forge queue (running/pending)" style="font-size:10px; color:var(--text-dim);">
                    q {{ n.queueRunning != null ? n.queueRunning : '—' }}/{{ n.queuePending != null ? n.queuePending : '—' }}
                  </span>
                  <span v-if="n.backend === 'sd-forge'" title="Forge progress" style="font-size:10px; color:var(--text-dim);">
                    {{ n.progress != null ? Math.round(n.progress * 100) + '%' : '—' }}
                  </span>
                </div>
                <div class="framesync-footer" style="flex-wrap:wrap; gap:4px; margin:0;">
                  <template v-if="n.enabled">
                    <button class="framesync-button framesync-button--compact" @click="disableGpuNode(n)">Disable</button>
                  </template>
                  <template v-else>
                    <button class="framesync-button framesync-button--compact" @click="enableGpuNode(n)">Enable</button>
                    <button v-if="gpuPool.editId !== n.id" class="framesync-button framesync-button--compact" @click="startEditGpuNode(n)">Edit</button>
                    <button v-else class="framesync-button framesync-button--compact" @click="saveGpuNodeEdit(n)">Save</button>
                    <button class="framesync-button framesync-button--danger framesync-button--compact" @click="removeGpuNode(n)">Remove</button>
                  </template>
                  <button class="framesync-button framesync-button--compact" @click="gpuPool.expandedLog = gpuPool.expandedLog === n.id ? null : n.id">
                    {{ gpuPool.expandedLog === n.id ? 'Hide log' : 'Log' }}{{ n.requestLog && n.requestLog.length ? ' (' + n.requestLog.length + ')' : '' }}
                  </button>
                </div>
              </div>
              <div v-if="gpuPool.editId === n.id && gpuPool.editDraft.backend === 'ollama'" class="framesync-footer" style="margin:8px 0 0; align-items:center; gap:8px; flex-wrap:wrap;">
                <select class="framesync-select" v-model="gpuPool.editDraft.model" style="min-width:220px;">
                  <option value="">Select Ollama model…</option>
                  <option v-for="model in ollamaModelOptions(gpuPool.editDraft.url)" :key="'edit-'+n.id+'-'+model" :value="model">{{ model }}</option>
                </select>
                <button class="framesync-button framesync-button--compact" @click="refreshGpuEditModels">Load models</button>
              </div>
              <div v-if="gpuPool.expandedLog === n.id" class="gpu-node-log">
                <div v-if="!n.requestLog || !n.requestLog.length" class="gpu-node-log__empty">No requests logged yet.</div>
                <div v-for="(entry, idx) in (n.requestLog || [])" :key="idx" class="gpu-node-log__entry" :class="{ 'gpu-node-log__entry--error': !entry.ok }">
                  <span class="gpu-node-log__badge" :class="'gpu-node-log__badge--' + entry.type">{{ entry.type }}</span>
                  <span class="gpu-node-log__path">{{ entry.path }}</span>
                  <span class="gpu-node-log__status" :style="entry.ok ? 'color:var(--live-text)' : 'color:var(--error)'">
                    {{ entry.statusCode || (entry.ok ? 'ok' : 'err') }}
                  </span>
                  <span class="gpu-node-log__duration">{{ entry.durationMs }}ms</span>
                  <span v-if="entry.error" class="gpu-node-log__error">{{ entry.error }}</span>
                  <span class="gpu-node-log__time">{{ new Date(entry.ts).toLocaleTimeString() }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else style="margin-top:14px; font-size:12px; color:var(--text-dim);">No GPU instances configured.</div>
          <div v-if="gpuPool.status" class="framesync-subtitle" style="margin-top:10px;">{{ gpuPool.status }}</div>
        </div>
      </div>
      <div v-if="gpuPool.forgeModal.open" class="gpu-forge-modal" @click="onGpuForgeModalBackdropClick">
        <div class="gpu-forge-modal__dialog">
          <div class="gpu-forge-modal__header">
            <div>
              <div class="framesync-title">Edit <span class="framesync-accent">SD-Forge</span> instance</div>
              <div class="framesync-subtitle gpu-forge-modal__subtitle">{{ gpuPool.forgeModal.nodeName || 'Forge node' }}</div>
            </div>
            <button class="framesync-button" @click="closeGpuForgeModal()">Close</button>
          </div>

          <div class="framesync-row gpu-forge-modal__identity" style="grid-template-columns: 1fr 1.6fr 0.6fr; gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Name</div>
              <input class="framesync-input" v-model.trim="gpuPool.forgeModal.nodeName" :disabled="gpuPool.forgeModal.saving || gpuPool.forgeModal.applying">
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">URL</div>
              <input class="framesync-input" v-model.trim="gpuPool.forgeModal.url" :disabled="gpuPool.forgeModal.saving || gpuPool.forgeModal.applying">
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Priority</div>
              <input type="number" class="framesync-input" v-model.number="gpuPool.forgeModal.priority" min="1" max="99" :disabled="gpuPool.forgeModal.saving || gpuPool.forgeModal.applying">
            </div>
          </div>

          <div class="framesync-footer" style="margin-top:12px;">
            <button class="framesync-button" :disabled="gpuPool.forgeModal.loading" @click="refreshGpuForgeModalOptions()">Refresh Forge</button>
            <button class="framesync-button" :disabled="gpuPool.forgeModal.applying || gpuPool.forgeModal.saving" @click="applyGpuForgeModalOptions()">Apply options</button>
            <button class="framesync-button" :disabled="gpuPool.forgeModal.saving || gpuPool.forgeModal.applying" @click="saveGpuForgeModal()">Save instance</button>
          </div>

          <div class="framesync-row" style="grid-template-columns: 1fr 1fr; gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Current model</div>
              <code>{{ gpuPool.forgeModal.currentModel || '—' }}</code>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Endpoint</div>
              <code class="forge-tab__endpoint">{{ gpuPool.forgeModal.url || '—' }}</code>
            </div>
          </div>

          <div class="framesync-subtitle forge-tab__note">
            This is the per-instance Forge configuration for <strong>{{ gpuPool.forgeModal.nodeName || 'this node' }}</strong>. Saved values reopen here next time, and <strong>Apply options</strong> pushes them to this Forge instance only.
          </div>

          <div class="gpu-forge-modal__mediator" data-testid="gpu-forge-mediator-section">
            <div class="framesync-subtitle" style="margin-top:14px;">Mediator <span class="framesync-accent">(Deforum)</span></div>
            <p class="framesync-subtitle forge-tab__note" style="margin-top:6px;">
              Co-located on the forge host — defaults to instance name (<code>{{ gpuPool.forgeModal.nodeName || 'hostname' }}</code>).
            </p>
            <div class="framesync-row" style="grid-template-columns: 1.4fr 0.8fr 0.8fr; gap:10px; margin-top:10px;">
              <div class="framesync-stack">
                <div class="framesync-subtitle">Host</div>
                <input
                  class="framesync-input"
                  v-model.trim="gpuPool.forgeModal.mediator.host"
                  placeholder="vimage5"
                  :disabled="gpuPool.forgeModal.saving || gpuPool.forgeModal.applying || gpuPool.forgeModal.mediator.probing"
                >
              </div>
              <div class="framesync-stack">
                <div class="framesync-subtitle">Deforum port</div>
                <input
                  type="number"
                  class="framesync-input"
                  v-model.number="gpuPool.forgeModal.mediator.deforumPort"
                  min="1"
                  max="65535"
                  :disabled="gpuPool.forgeModal.saving || gpuPool.forgeModal.applying || gpuPool.forgeModal.mediator.probing"
                >
              </div>
              <div class="framesync-stack">
                <div class="framesync-subtitle">Deforumation port</div>
                <input
                  type="number"
                  class="framesync-input"
                  v-model.number="gpuPool.forgeModal.mediator.deforumationPort"
                  min="1"
                  max="65535"
                  :disabled="gpuPool.forgeModal.saving || gpuPool.forgeModal.applying || gpuPool.forgeModal.mediator.probing"
                >
              </div>
            </div>
            <div class="framesync-footer" style="margin-top:10px; align-items:center; flex-wrap:wrap; gap:8px;">
              <button
                class="framesync-button framesync-button--compact"
                :disabled="gpuPool.forgeModal.mediator.probing || !gpuPool.forgeModal.nodeId"
                @click="probeGpuForgeMediatorPorts()"
              >
                {{ gpuPool.forgeModal.mediator.probing ? 'Checking…' : 'Check ports' }}
              </button>
              <span
                v-if="gpuPool.forgeModal.mediator.deforumStatus"
                class="gpu-status-pill"
                :class="mediatorStatusClass(gpuPool.forgeModal.mediator.deforumStatus)"
              >
                Deforum {{ gpuPool.forgeModal.mediator.deforumPort }}: {{ gpuPool.forgeModal.mediator.deforumStatus }}
              </span>
              <span
                v-if="gpuPool.forgeModal.mediator.deforumationStatus"
                class="gpu-status-pill"
                :class="mediatorStatusClass(gpuPool.forgeModal.mediator.deforumationStatus)"
              >
                Deforumation {{ gpuPool.forgeModal.mediator.deforumationPort }}: {{ gpuPool.forgeModal.mediator.deforumationStatus }}
              </span>
            </div>
          </div>

          <div class="framesync-row" style="grid-template-columns: 1fr 1fr; gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Sampler</div>
              <select class="framesync-select" v-model="gpuPool.forgeModal.options.sampler_name">
                <option value="">Auto</option>
                <option v-for="sampler in engineSamplerOptions" :key="'gpu-forge-sampler-'+sampler" :value="sampler">{{ sampler }}</option>
              </select>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Scheduler</div>
              <select class="framesync-select" v-model="gpuPool.forgeModal.options.scheduler">
                <option value="">Auto</option>
                <option v-for="scheduler in engineSchedulerOptions" :key="'gpu-forge-sch-'+scheduler" :value="scheduler">{{ scheduler }}</option>
              </select>
            </div>
          </div>
          <div class="framesync-row" style="grid-template-columns: 1fr; gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">VAE</div>
              <select class="framesync-select" v-model="gpuPool.forgeModal.options.sd_vae">
                <option value="">Auto</option>
                <option v-for="vae in gpuPool.forgeModal.vaeList" :key="'gpu-forge-vae-'+vae" :value="vae">{{ vae }}</option>
              </select>
            </div>
          </div>

          <div class="framesync-row forge-tab__options-grid" style="grid-template-columns: repeat(3, 1fr); gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Width</div>
              <input type="number" class="framesync-input" v-model.number="gpuPool.forgeModal.options.width" min="64" max="4096" step="64">
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Height</div>
              <input type="number" class="framesync-input" v-model.number="gpuPool.forgeModal.options.height" min="64" max="4096" step="64">
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Batch</div>
              <input type="number" class="framesync-input" v-model.number="gpuPool.forgeModal.options.batch_size" min="1" max="16">
            </div>
          </div>

          <div v-if="gpuPool.forgeModal.modelInfo" class="forge-tab__metadata">
            <div class="framesync-subtitle">Model metadata</div>
            <div class="chips" style="margin-top:8px;">
              <span v-for="(value, key) in gpuPool.forgeModal.modelInfo" :key="'gpu-forge-meta-'+key" class="chip">{{ key }}: {{ value }}</span>
            </div>
          </div>

          <div v-if="gpuPool.forgeModal.status" class="framesync-subtitle" style="margin-top:12px;">
            {{ gpuPool.forgeModal.status }}
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='STYLES'">
      <StylesSettingsPanel :app="app" />
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='PLUGINS'" class="settings-plugins-tab" data-testid="settings-plugins-registry">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">Plugins <span class="framesync-accent">Registry</span></div>
            <button type="button" class="framesync-button" @click="refreshPlugins">Refresh</button>
          </div>
          <p class="framesync-subtitle settings-plugins-tab__intro">
            Server-side animation and modulation plugins available to the live engine.
          </p>
          <ul v-if="pluginsRegistry.length" class="framesync-list settings-plugins-tab__list">
            <li v-for="p in pluginsRegistry" :key="p.id || p.name">
              {{ p.name || p.id }}<span v-if="p.description"> — {{ p.description }}</span>
            </li>
          </ul>
          <p v-else class="framesync-subtitle settings-plugins-tab__empty">No plugins reported — try Refresh.</p>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='COLLAB'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title"><span class="framesync-accent">Collaboration</span></div>
            <button class="framesync-button" :class="{ 'framesync-button--live': collabEnabled }" @click="toggleCollaboration">
              {{ collabEnabled ? 'WS ' + wsStatus : 'WS offline' }}
            </button>
          </div>
          <div v-if="!collabEnabled" style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
            Collaboration is offline. Press the WS button to bring the collaboration panel back and reconnect.
          </div>
          <template v-else>
          <div class="framesync-row" style="grid-template-columns: 1fr 1fr; gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Display name</div>
              <input class="framesync-input" v-model="collab.userName" @change="saveCollabUserName; collabIdentify()">
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Your session ID</div>
              <input class="framesync-input" :value="collab.userId || '—'" readonly>
            </div>
          </div>
          <div class="framesync-subtitle" style="margin-top:14px;">Connected users ({{ collab.users.length }})</div>
          <ul v-if="collab.users.length" class="framesync-list" style="font-size:11px; padding-left:16px; margin-top:6px;">
            <li v-for="u in collab.users" :key="u.id">
              {{ u.name }}
              <span v-if="u.lockedParams && u.lockedParams.length" style="color:var(--warn);"> — locks: {{ u.lockedParams.join(', ') }}</span>
            </li>
          </ul>
          <div v-else style="font-size:11px; color:var(--text-dim); margin-top:6px;">Only you (open another browser tab to test multi-user).</div>
          <div class="framesync-subtitle" style="margin-top:14px;">Session recording</div>
          <div class="framesync-footer" style="margin-top:8px;">
            <button class="framesync-button" :class="{ 'framesync-button--live': collab.recording }" @click="toggleSessionRecording">
              {{ collab.recording ? 'Stop recording' : 'Start recording' }}
            </button>
            <button class="framesync-button" @click="listSessionRecordings">List recordings</button>
          </div>
          <ul v-if="collab.recordings.length" class="framesync-list" style="margin-top:8px; font-size:11px; padding-left:16px;">
            <li v-for="r in collab.recordings" :key="r.filename" style="display:flex; gap:8px; align-items:center;">
              {{ r.filename }}
              <button class="framesync-button framesync-button--compact" @click="playbackSessionRecording(r.filename)">Play</button>
            </li>
          </ul>
          <div v-if="collab.status" class="framesync-subtitle" style="margin-top:10px; color:var(--success);">{{ collab.status }}</div>
          <div class="framesync-subtitle" style="margin-top:14px;">Parameter locks (click param label in LIVE drawer)</div>
          <div v-if="Object.keys(collab.locks).length" style="font-size:11px; margin-top:6px;">
            <span v-for="(who, param) in collab.locks" :key="param" class="pill" style="margin:2px 4px 2px 0;">
              {{ param }} → {{ who }}
              <button type="button" class="framesync-icon-button" aria-label="Unlock parameter" @click="unlockParam(param)"><UiIcon name="close" /></button>
            </span>
          </div>
          <div v-else style="font-size:11px; color:var(--text-dim); margin-top:6px;">No active locks.</div>
          </template>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='OUTPUT'" data-testid="settings-output-stream">
      <StreamView :app="app" />
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='RUNS' || currentSubTab.SETTINGS==='SYSTEM'" class="system-runs-tab" data-testid="settings-system-runs">
      <RunsBrowserPanel :app="app" />
    </div>

  </div>
</template>

<script>
import RunsBrowserPanel from '../RunsBrowserPanel.vue'
import StreamView from './StreamView.vue'
import StylesSettingsPanel from '../StylesSettingsPanel.vue'
import GlassPanel from '../GlassPanel.vue'
import UiIcon from '../UiIcon.vue'
import { proxyAppView } from './app-view-proxy.mjs'

export default {
  name: 'SettingsView',
  components: { RunsBrowserPanel, StreamView, StylesSettingsPanel, GlassPanel, UiIcon },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
