<template>
  <div class="settings-tab-shell">
    <div class="sub-pills">
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='ENGINE'}" @click="switchSubTab('SETTINGS','ENGINE')">ENGINE</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='FORGE'}" @click="switchSubTab('SETTINGS','FORGE')">FORGE</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='MIDI'}" @click="switchSubTab('SETTINGS','MIDI')">MIDI</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='BINDINGS'}" @click="switchSubTab('SETTINGS','BINDINGS')">BINDINGS</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='PRESETS'}" @click="switchSubTab('SETTINGS','PRESETS')">PRESETS</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='RUNS'}" @click="switchSubTab('SETTINGS','RUNS')">RUNS</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='GPUS'}" @click="switchSubTab('SETTINGS','GPUS')">GPUS</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='COLLAB'}" @click="switchSubTab('SETTINGS','COLLAB')">COLLAB</button>
      <button class="sub-pill" :class="{active: currentSubTab.SETTINGS==='KEYS'}" @click="switchSubTab('SETTINGS','KEYS')">KEYS</button>
    </div>

    <div v-if="currentSubTab.SETTINGS==='RUNS'" class="rack runs-browser">
      <div class="framesync-panel runs-browser__panel">
        <div class="framesync-header">
          <div class="framesync-title">Runs <span class="framesync-accent">Browser</span></div>
          <div class="runs-browser__meta">
            <span class="runs-browser__count">{{ runsFiltered.length }} / {{ runsAll.length }}</span>
            <button class="framesync-button" @click="refreshRuns">Refresh</button>
          </div>
        </div>

        <div class="runs-browser__filters">
          <input type="text" class="framesync-input" v-model.trim="runsFilter.search" placeholder="Search (id, tag, model, prompt, notes)" @input="applyRunsFilters">
          <select class="framesync-select" v-model="runsFilter.status" @change="applyRunsFilters">
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
            <option value="queued">Queued</option>
          </select>
          <input type="text" class="framesync-input" v-model.trim="runsFilter.tag" placeholder="Filter by tag" @input="applyRunsFilters">
          <input type="text" class="framesync-input" v-model.trim="runsFilter.model" placeholder="Filter by model" @input="applyRunsFilters">
        </div>

        <div class="runs-browser__sortbar">
          <span class="runs-browser__sort-label">Sort:</span>
          <select class="framesync-select runs-browser__sort-select" v-model="runsSort.field" @change="applyRunsFilters">
            <option value="started_at">Date</option>
            <option value="run_id">Run ID</option>
            <option value="model">Model</option>
            <option value="frame_count">Frames</option>
            <option value="status">Status</option>
            <option value="tag">Tag</option>
          </select>
          <button class="framesync-button runs-browser__sort-order" @click="runsSort.order = runsSort.order === 'desc' ? 'asc' : 'desc'; applyRunsFilters();">
            {{ runsSort.order === 'desc' ? 'Desc' : 'Asc' }}
          </button>
          <div class="runs-browser__spacer"></div>
          <button class="framesync-button runs-browser__export" @click="exportRuns('json')">JSON</button>
          <button class="framesync-button runs-browser__export" @click="exportRuns('csv')">CSV</button>
        </div>

        <div class="runs-browser__table-wrap">
          <table class="runs-browser__table">
            <thead>
              <tr>
                <th>Thumb</th>
                <th>Run ID</th>
                <th>Status</th>
                <th>Model</th>
                <th>Frames</th>
                <th>Seed</th>
                <th>Tag</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="run in runsFiltered" :key="run.run_id" :class="{'runs-row-selected': runsSelected.includes(run.run_id)}" @click="toggleRunSelect(run.run_id)">
                <td>
                  <img v-if="run.has_thumbnail" :src="`/api/runs/${run.run_id}/thumb`" class="runs-browser__thumb" alt="">
                  <div v-else class="runs-browser__thumb runs-browser__thumb--empty">No img</div>
                </td>
                <td class="runs-browser__run-id">{{ run.run_id }}</td>
                <td>
                  <span class="runs-status-pill" :class="'runs-status-pill--' + run.status">{{ run.status }}</span>
                </td>
                <td>{{ run.model || '-' }}</td>
                <td>{{ run.frame_count || run.length_frames || '-' }}</td>
                <td class="runs-browser__seed">{{ run.seed || '-' }}</td>
                <td>{{ run.tag || '-' }}</td>
                <td class="runs-browser__date">{{ formatDate(run.started_at) }}</td>
                <td>
                  <div class="runs-browser__actions">
                    <button class="framesync-button runs-browser__action" @click.stop="showRunDetails(run)" title="Details">Details</button>
                    <button class="framesync-button runs-browser__action" @click.stop="rerunRun(run)" title="Rerun">Rerun</button>
                    <button class="framesync-button runs-browser__action runs-browser__action--danger" @click.stop="deleteRun(run)" title="Delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="runsFiltered.length === 0">
                <td colspan="9" class="runs-browser__empty">
                  No runs found. Adjust filters or refresh.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="runsDetailView" class="runs-detail-card">
        <div class="runs-detail-card__header">
          <div class="framesync-title">Run Details: <span class="runs-detail-card__id">{{ runsDetailView.run_id }}</span></div>
          <button class="framesync-button" @click="runsDetailView = null">Close</button>
        </div>
        <div class="runs-detail-card__grid">
          <div>
            <div class="framesync-subtitle">Status</div>
            <span class="runs-status-pill" :class="'runs-status-pill--' + runsDetailView.status">{{ runsDetailView.status }}</span>
          </div>
          <div>
            <div class="framesync-subtitle">Model</div>
            <div>{{ runsDetailView.model || '-' }}</div>
          </div>
          <div>
            <div class="framesync-subtitle">Frames</div>
            <div>{{ runsDetailView.frame_count || runsDetailView.length_frames || '-' }}</div>
          </div>
          <div>
            <div class="framesync-subtitle">Seed</div>
            <div class="runs-browser__seed">{{ runsDetailView.seed || '-' }}</div>
          </div>
          <div>
            <div class="framesync-subtitle">Steps</div>
            <div>{{ runsDetailView.steps || '-' }}</div>
          </div>
          <div>
            <div class="framesync-subtitle">Strength</div>
            <div>{{ runsDetailView.strength || '-' }}</div>
          </div>
          <div>
            <div class="framesync-subtitle">CFG</div>
            <div>{{ runsDetailView.cfg || '-' }}</div>
          </div>
          <div>
            <div class="framesync-subtitle">Tag</div>
            <div>{{ runsDetailView.tag || '-' }}</div>
          </div>
          <div class="runs-detail-card__full">
            <div class="framesync-subtitle">Positive Prompt</div>
            <div class="runs-detail-card__prompt">{{ runsDetailView.prompt_positive || '-' }}</div>
          </div>
          <div class="runs-detail-card__full">
            <div class="framesync-subtitle">Negative Prompt</div>
            <div class="runs-detail-card__prompt">{{ runsDetailView.prompt_negative || '-' }}</div>
          </div>
          <div class="runs-detail-card__full">
            <div class="framesync-subtitle">Notes</div>
            <textarea class="framesync-input runs-detail-card__notes" v-model="runsDetailView.notes" placeholder="Add notes..."></textarea>
            <button class="framesync-button runs-detail-card__save" @click="saveRunNotes(runsDetailView)">Save notes</button>
          </div>
        </div>

        <div v-if="runsDetailView.frames && runsDetailView.frames.length" class="runs-detail-card__frames">
          <div class="framesync-subtitle">Frames ({{ runsDetailView.frames.length }})</div>
          <div class="runs-detail-card__frames-list">
            <img v-for="f in runsDetailView.frames.slice(0, 50)" :key="f" :src="`/api/runs/${runsDetailView.run_id}/frames/${f}`" class="runs-detail-card__frame" :alt="f">
          </div>
        </div>
      </div>

      <div v-if="runsSelected.length >= 2" class="runs-compare-card">
        <div class="runs-compare-card__header">
          <div class="framesync-title">Compare Runs ({{ runsSelected.length }})</div>
          <div class="runs-compare-card__actions">
            <button class="framesync-button runs-browser__export" @click="exportRunComparison('json')">JSON</button>
            <button class="framesync-button runs-browser__export" @click="exportRunComparison('csv')">CSV</button>
            <button class="framesync-button" @click="runsSelected = []">Clear</button>
          </div>
        </div>
        <div class="runs-compare-card__table-wrap">
          <table class="runs-compare-card__table">
            <thead>
              <tr>
                <th>Property</th>
                <th v-for="runId in runsSelected" :key="runId" class="runs-browser__seed">{{ runId }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prop in runsCompareFields" :key="prop">
                <td>{{ prop }}</td>
                <td v-for="runId in runsSelected" :key="runId" class="runs-browser__seed">
                  {{ getRunProp(runId, prop) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='ENGINE'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title"><span class="framesync-accent">Engine</span></div>
            <span class="model-status-pill" :class="'model-' + modelStatusKind">
              <span class="model-status-dot"></span>
              {{ modelStatusLabel }}
            </span>
          </div>
          <div class="engine-main-summary">
            <div class="engine-main-card engine-main-card--wide">
              <div class="framesync-subtitle">Current model</div>
              <div class="engine-main-card__value engine-main-card__value--model">{{ engineCurrentModelName || '—' }}</div>
              <div class="engine-main-card__meta">{{ engineOptimizedProfileLabel }} · {{ engineCurrentModelFamilyLabel }}</div>
            </div>
            <div class="engine-main-card">
              <div class="framesync-subtitle">Current CFG</div>
              <div class="engine-main-card__value">{{ engineCurrentCfgScale.toFixed(1) }}</div>
            </div>
            <div class="engine-main-card">
              <div class="framesync-subtitle">Current steps</div>
              <div class="engine-main-card__value">{{ engineCurrentSteps }}</div>
            </div>
            <div class="engine-main-card">
              <div class="framesync-subtitle">Sampler</div>
              <div class="engine-main-card__value engine-main-card__value--small">{{ deforumSettings.sampler || '—' }}</div>
            </div>
          </div>
          <div class="framesync-row engine-main-grid" style="grid-template-columns: 1.6fr 1fr 0.8fr 0.8fr; gap:10px; margin-top:12px;">
            <div class="framesync-stack engine-main-grid__model">
              <div class="framesync-subtitle">Checkpoint</div>
              <select
                v-if="forge.models.length"
                class="framesync-select"
                :value="engineCurrentModelName"
                :disabled="forge.switching || modelStatusKind === 'offline'"
                @change="onDeforumModelCommit($event.target.value)"
              >
                <option value="">— select model —</option>
                <option v-for="m in forge.models" :key="m.model_name || m.title" :value="m.model_name || m.title">{{ m.title || m.model_name }}</option>
              </select>
              <input
                v-else
                type="text"
                class="framesync-input"
                :value="engineCurrentModelName"
                :disabled="forge.switching"
                placeholder="Checkpoint name"
                @change="onDeforumModelCommit($event.target.value)"
              >
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Sampler</div>
              <select class="framesync-select" :value="deforumSettings.sampler" @change="onEngineSamplerChange($event.target.value)">
                <option v-for="sampler in engineSamplerOptions" :key="'engine-sampler-' + sampler" :value="sampler">{{ sampler }}</option>
              </select>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Steps</div>
              <input type="number" class="framesync-input" :value="engineCurrentSteps" min="1" max="150" step="1" @input="onEngineStepsChange($event.target.value)">
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
              <div class="framesync-subtitle">FPS</div>
              <select class="framesync-select" :value="deforumSettings.fps" @change="onDeforumFieldInput('fps', +$event.target.value, 'number')">
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
          <div class="framesync-footer" style="margin-top:12px;">
            <button class="framesync-button" :disabled="forge.switching || !engineCurrentModelName" @click="reapplyEngineModelDefaults()">Optimize for model</button>
            <button class="framesync-button" @click="onDeforumFieldInput('seed', Math.floor(Math.random() * 2147483647), 'number')">Seed: {{ deforumSettings.seed }}</button>
            <span class="framesync-button" style="cursor:default;">{{ deforumSettings.W }}×{{ deforumSettings.H }} @ {{ deforumSettings.fps }} fps</span>
            <span class="framesync-button" style="cursor:default;">Profile: {{ engineOptimizedProfileLabel }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='FORGE'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">SD-<span class="framesync-accent">Forge</span></div>
            <span class="model-status-pill" :class="'model-' + modelStatusKind">
              <span class="model-status-dot"></span>
              {{ modelStatusLabel }}
            </span>
          </div>
          <div class="framesync-row" style="grid-template-columns: 1.2fr 0.7fr 1fr; gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Host</div>
              <input class="framesync-input" v-model.trim="forge.host" placeholder="Forge host">
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Port</div>
              <input class="framesync-input" v-model.trim="forge.port" placeholder="7860">
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Endpoint</div>
              <code class="forge-tab__endpoint">{{ forgeUrl() }}</code>
            </div>
          </div>
          <div class="framesync-footer" style="margin-top:12px;">
            <button class="framesync-button" :disabled="forge.loading" @click="refreshForgeAll">Refresh Forge</button>
            <button class="framesync-button" :disabled="forge.loading" @click="saveForgeConnection">Save connection</button>
            <button class="framesync-button" :disabled="forge.loading" @click="applyForgeOptions">Apply options</button>
          </div>
          <div class="framesync-row" style="grid-template-columns: 1fr 1fr; gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Current model</div>
              <code>{{ forge.currentModel || '—' }}</code>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Model list source</div>
              <span class="model-source-pill" :class="'src-' + (forge.modelsSource || 'placeholder')">
                {{ forge.modelsSource || 'unknown' }}
              </span>
            </div>
          </div>
          <div class="framesync-subtitle forge-tab__note">
            Main checkpoint, sampler, steps, and CFG controls now live under <strong>ENGINE</strong>. Keep Forge for connection and backend options.
          </div>
          <div class="framesync-row" style="grid-template-columns: 1fr 1fr; gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Scheduler</div>
              <select class="framesync-select" v-model="forge.options.scheduler">
                <option v-for="scheduler in forge.schedulers" :key="'forge-sch-'+scheduler" :value="scheduler">{{ scheduler }}</option>
              </select>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">VAE</div>
              <select class="framesync-select" v-model="forge.options.sd_vae">
                <option value="">Auto</option>
                <option v-for="vae in forge.vaeList" :key="'forge-vae-'+vae" :value="vae">{{ vae }}</option>
              </select>
            </div>
          </div>
          <div class="framesync-row forge-tab__options-grid" style="grid-template-columns: repeat(3, 1fr); gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Width</div>
              <input type="number" class="framesync-input" v-model.number="forge.options.width" min="64" max="4096" step="64">
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Height</div>
              <input type="number" class="framesync-input" v-model.number="forge.options.height" min="64" max="4096" step="64">
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">Batch</div>
              <input type="number" class="framesync-input" v-model.number="forge.options.batch_size" min="1" max="16">
            </div>
          </div>
          <div v-if="forge.modelInfo" class="forge-tab__metadata">
            <div class="framesync-subtitle">Model metadata</div>
            <div class="chips" style="margin-top:8px;">
              <span v-for="(value, key) in forge.modelInfo" :key="'forge-meta-'+key" class="chip">{{ key }}: {{ value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='MIDI'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">Controllers <span class="framesync-accent">(WebMIDI)</span></div>
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
                        <option v-for="t in lfoTargets" :key="'mopt'+t.key" :value="t.key">{{ t.label }}</option>
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
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='BINDINGS'">
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
                          <button style="border:none; background:transparent; color:var(--error); cursor:pointer; padding:0; font-size:9px;" @click="clearKeyBinding(t.key)">✕</button>
                        </span>
                        <span v-else style="color:var(--text-dim);">—</span>
                      </td>
                      <td style="padding:4px 8px;">
                        <span v-if="getMidiBinding(t.key)" style="display:inline-flex; align-items:center; gap:4px;">
                          <span style="background:var(--bg-2); border:1px solid var(--border-strong); border-radius:3px; padding:2px 6px; font-size:10px; color:var(--warn);">CC {{ getMidiBinding(t.key) }}</span>
                          <button style="border:none; background:transparent; color:var(--error); cursor:pointer; padding:0; font-size:9px;" @click="clearMidiBinding(t.key)">✕</button>
                        </span>
                        <span v-else style="color:var(--text-dim);">—</span>
                      </td>
                      <td style="padding:4px 8px; text-align:center;">
                        <button v-if="bindingLearnMode" class="framesync-button" style="padding:2px 6px; font-size:9px;" @click="bindingTargetKey=t.key">Bind here</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='PRESETS'">
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
            <button class="framesync-button" v-if="currentPreset" @click="deletePreset(currentPreset)" style="border-color:var(--error); color:var(--error);">Delete {{ currentPreset }}</button>
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
              <button class="framesync-button" style="padding:2px 8px; font-size:10px;" @click="loadSharedPreset(sp.name)">Load</button>
              <button class="framesync-button" style="padding:2px 8px; font-size:10px; border-color:var(--error); color:var(--error);" @click="deleteSharedPreset(sp.name)">Delete</button>
            </li>
          </ul>
          <div v-else style="margin-top:10px; font-size:11px; color:var(--text-dim);">No shared presets yet.</div>
          <div v-if="sharedPresetsStatus" class="framesync-subtitle" style="margin-top:8px;">{{ sharedPresetsStatus }}</div>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='GPUS'">
      <div class="rack">
        <div class="framesync-panel" data-testid="gpu-pool-panel">
          <div class="framesync-header">
            <div class="framesync-title">GPU <span class="framesync-accent">Pool</span></div>
            <label class="gpu-pool-enable">
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
                  </template>
                </div>
                <div class="gpu-node-card__stats">
                  <span title="Current model" style="font-size:10px; color:var(--text-secondary); max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ n.model || n.currentModel || '—' }}</span>
                  <span title="VRAM" style="font-size:10px; color:var(--text-dim);">{{ formatGpuMemory(n) }}</span>
                  <span title="GPU utilization" style="font-size:10px; color:var(--text-dim);">{{ n.gpuUtilization != null ? n.gpuUtilization + '%' : '—' }}</span>
                  <span title="Active jobs" style="font-size:10px; color:var(--text-dim);">{{ n.activeJobs }} jobs</span>
                </div>
                <div class="framesync-footer" style="flex-wrap:wrap; gap:4px; margin:0;">
                  <template v-if="n.enabled">
                    <button class="framesync-button" style="padding:2px 8px; font-size:10px;" @click="disableGpuNode(n)">Disable</button>
                  </template>
                  <template v-else>
                    <button class="framesync-button" style="padding:2px 8px; font-size:10px;" @click="enableGpuNode(n)">Enable</button>
                    <button v-if="gpuPool.editId !== n.id" class="framesync-button" style="padding:2px 8px; font-size:10px;" @click="startEditGpuNode(n)">Edit</button>
                    <button v-else class="framesync-button" style="padding:2px 8px; font-size:10px;" @click="saveGpuNodeEdit(n)">Save</button>
                    <button class="framesync-button" style="padding:2px 8px; font-size:10px; border-color:var(--error); color:var(--error);" @click="removeGpuNode(n)">Remove</button>
                  </template>
                  <button class="framesync-button" style="padding:2px 8px; font-size:10px;" @click="gpuPool.expandedLog = gpuPool.expandedLog === n.id ? null : n.id">
                    {{ gpuPool.expandedLog === n.id ? 'Hide log' : 'Log' }}{{ n.requestLog && n.requestLog.length ? ' (' + n.requestLog.length + ')' : '' }}
                  </button>
                </div>
              </div>
              <div v-if="gpuPool.editId === n.id && gpuPool.editDraft.backend === 'ollama'" class="framesync-footer" style="margin:8px 0 0; align-items:center; gap:8px; flex-wrap:wrap;">
                <select class="framesync-select" v-model="gpuPool.editDraft.model" style="min-width:220px;">
                  <option value="">Select Ollama model…</option>
                  <option v-for="model in ollamaModelOptions(gpuPool.editDraft.url)" :key="'edit-'+n.id+'-'+model" :value="model">{{ model }}</option>
                </select>
                <button class="framesync-button" style="padding:2px 8px; font-size:10px;" @click="refreshGpuEditModels">Load models</button>
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
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='COLLAB'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title"><span class="framesync-accent">Collaboration</span></div>
            <button class="framesync-button" :class="{ active: collabEnabled }" @click="toggleCollaboration">
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
            <button class="framesync-button" :class="{active: collab.recording}" @click="toggleSessionRecording">
              {{ collab.recording ? 'Stop recording' : 'Start recording' }}
            </button>
            <button class="framesync-button" @click="listSessionRecordings">List recordings</button>
          </div>
          <ul v-if="collab.recordings.length" class="framesync-list" style="margin-top:8px; font-size:11px; padding-left:16px;">
            <li v-for="r in collab.recordings" :key="r.filename" style="display:flex; gap:8px; align-items:center;">
              {{ r.filename }}
              <button class="framesync-button" style="padding:2px 8px; font-size:10px;" @click="playbackSessionRecording(r.filename)">Play</button>
            </li>
          </ul>
          <div v-if="collab.status" class="framesync-subtitle" style="margin-top:10px; color:var(--success);">{{ collab.status }}</div>
          <div class="framesync-subtitle" style="margin-top:14px;">Parameter locks (click param label in LIVE drawer)</div>
          <div v-if="Object.keys(collab.locks).length" style="font-size:11px; margin-top:6px;">
            <span v-for="(who, param) in collab.locks" :key="param" class="pill" style="margin:2px 4px 2px 0;">
              {{ param }} → {{ who }}
              <button type="button" style="border:none;background:transparent;color:var(--error);cursor:pointer;margin-left:4px;" @click="unlockParam(param)">✕</button>
            </span>
          </div>
          <div v-else style="font-size:11px; color:var(--text-dim); margin-top:6px;">No active locks.</div>
          </template>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.SETTINGS==='KEYS'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title"><span class="framesync-accent">Keyboard Shortcuts</span></div>
          </div>
          <div class="framesync-row" style="grid-template-columns: repeat(2, 1fr); gap:10px; margin-top:12px;">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Navigation</div>
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.8;">
                <div><kbd>1</kbd>–<kbd>6</kbd> Switch tabs (LIVE→GENERATE)</div>
              </div>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">LIVE Tab</div>
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.8;">
                <div><kbd>Space</kbd> Generate image</div>
                <div><kbd>R</kbd> Reset Vibe & Camera params</div>
              </div>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">PROMPTS Tab</div>
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.8;">
                <div><kbd>M</kbd> Toggle prompt morphing</div>
              </div>
            </div>
            <div class="framesync-stack">
              <div class="framesync-subtitle">MODULATION Tab</div>
              <div style="font-size:12px; color:var(--text-secondary); line-height:1.8;">
                <div><kbd>L</kbd> Toggle LFO</div>
                <div><kbd>B</kbd> Toggle Beat Macro (MODULATION → AUDIO)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './app-view-proxy.js'

export default {
  name: 'SettingsView',
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
