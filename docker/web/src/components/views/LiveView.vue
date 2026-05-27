<template>
  <div class="live-view" data-testid="live-view">
    <div class="sub-pills live-view__tabs">
      <button
        type="button"
        class="sub-pill"
        :class="{ active: currentSubTab.LIVE === 'MONITOR' }"
        @click="switchSubTab('LIVE', 'MONITOR')"
      >
        Controls
      </button>
      <button
        type="button"
        class="sub-pill"
        :class="{ active: currentSubTab.LIVE === 'DEFORUM_JOB' }"
        @click="switchSubTab('LIVE', 'DEFORUM_JOB')"
      >
        Deforum
      </button>
    </div>

    <template v-if="currentSubTab.LIVE === 'MONITOR'">
    <div class="rack performance-deck">
      <div class="framesync-panel">
        <div class="framesync-header">
          <div class="framesync-title">
            <UiIcon class="framesync-title-icon" name="film" />
            <span class="framesync-accent">Animation Engine</span>
          </div>
          <button
            type="button"
            class="framesync-button framesync-button--compact"
            :class="{ active: liveAnimationBoxOpen }"
            @click="liveAnimationBoxOpen = !liveAnimationBoxOpen; saveSessionState()"
            :title="liveAnimationBoxOpen ? 'Collapse' : 'Expand'"
          >
            <UiIcon :name="liveAnimationBoxOpen ? 'chevron-up' : 'chevron-down'" />
          </button>
        </div>

        <div v-if="!liveAnimationBoxOpen" class="live-animation-summary" data-testid="live-animation-summary">
          <div class="framesync-subtitle" style="margin:0;">Layers</div>
          <div class="chips">
            <span
              v-for="layer in videoLayers.filter((l) => l && l.builtin)"
              :key="'anim-layer-summary-' + layer.id"
              class="chip"
              :class="{ active: activeVideoLayerId === layer.id }"
              style="display:inline-flex; align-items:center; gap:6px;"
            >
              <span
                style="width:8px;height:8px;border-radius:999px;display:inline-block;"
                :style="{
                  background: layerStatus(layer) === 'green' ? 'var(--live)' : layerStatus(layer) === 'yellow' ? 'var(--warn)' : 'var(--error)'
                }"
                aria-hidden="true"
              ></span>
              {{ layer.label }}
            </span>
          </div>
          <div class="framesync-subtitle" style="margin:0;margin-top:6px;">
            WebGL mode: <strong>{{ defaultAnimation.mode }}</strong>
          </div>
        </div>

        <template v-else>
          <div class="framesync-stack" style="margin-top:10px;">
            <div class="framesync-subtitle">Video layers</div>
            <div class="video-layer-tabs video-layer-tabs--engine" data-testid="video-layer-tabs">
              <div class="video-layer-tabs__transport" data-testid="live-transport-top">
                <button class="control-btn control-btn--top" :class="{playing: deforumPlaying}" @click="toggleDeforumPlay" data-testid="deforum-play">
                  <UiIcon class="control-btn__icon" :name="deforumPlaying ? 'pause' : 'play'" />
                  <span>{{ deforumPlaying ? 'Pause' : 'Play' }}</span>
                </button>
                <button
                  class="control-btn control-btn--top control-btn--frame"
                  :class="{ 'control-btn--loading': previewGenerating }"
                  @click="generatePreviewFrame"
                  :disabled="previewGenerating || deforumPlaying"
                  data-testid="preview-frame"
                >
                  <span v-if="previewGenerating" class="lazy-loading-indicator lazy-loading-indicator--button">
                    <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
                    <span>Frame</span>
                    <span class="lazy-loading-indicator__dots" aria-hidden="true"><span></span><span></span><span></span></span>
                  </span>
                  <template v-else>
                    <UiIcon class="control-btn__icon" name="image" />
                    <span>Frame</span>
                  </template>
                </button>
                <button class="control-btn control-btn--top control-btn--record" :class="{recording: isRecording}" @click="toggleStreamRecord" data-testid="stream-record">
                  <UiIcon class="control-btn__icon" :name="isRecording ? 'stop' : 'record'" />
                  <span>{{ isRecording ? 'Stop Rec' : 'Record' }}</span>
                </button>
                <span class="perf-mode-badge" :class="deforumPlaying ? 'mode-animate' : 'mode-preview'">
                  {{ deforumPlaying ? 'Animating' : 'Preview' }}
                </span>
              </div>

              <div
                v-for="layer in videoLayers"
                :key="'video-layer-' + layer.id"
                role="button"
                tabindex="0"
                class="video-layer-tab"
                :class="{
                  active: activeVideoLayerId === layer.id,
                  'video-layer-tab--builtin': layer.builtin,
                }"
                @click="selectVideoLayer(layer.id)"
                @keyup.enter="selectVideoLayer(layer.id)"
              >
                <span
                  class="video-layer-tab__dot"
                  :class="[
                    'video-layer-tab__dot--' + layerStatus(layer),
                    { active: activeVideoLayerId === layer.id },
                  ]"
                  aria-hidden="true"
                ></span>
                <span class="video-layer-tab__label">{{ layer.label }}</span>
                <button
                  v-if="!layer.builtin"
                  type="button"
                  class="video-layer-tab__close"
                  title="Remove layer"
                  @click.stop="closeVideoLayer(layer.id)"
                >
                  ×
                </button>
              </div>
              <button
                type="button"
                class="video-layer-tab video-layer-tab--add"
                :class="{ active: videoLayerAddOpen }"
                data-testid="video-layer-add-toggle"
                @click="toggleVideoLayerAdd"
              >
                + Add source
              </button>
              <button
                type="button"
                class="video-layer-tab video-layer-tab--size"
                :title="videoStageSize === 'small' ? 'Small stage' : videoStageSize === 'medium' ? 'Medium stage' : 'Full stage'"
                @click="toggleVideoStageSize()"
              >
                <UiIcon
                  :name="videoStageSize === 'small' ? 'size-small' : videoStageSize === 'medium' ? 'size-medium' : 'size-full'"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div
            v-if="currentTab === 'LIVE' && videoLayerAddOpen"
            class="video-layer-add framesync-panel"
            data-testid="video-layer-add"
            style="margin-top:10px;"
          >
            <div class="framesync-header">
              <div class="framesync-title">
                <UiIcon class="framesync-title-icon" name="plus" />
                <span class="framesync-accent">Add source</span>
              </div>
              <button type="button" class="framesync-button framesync-button--compact" @click="toggleVideoLayerAdd(false)">Close</button>
            </div>
            <p class="framesync-subtitle video-layer-add__hint">
              New sources open as preview tabs. Built-in layers: WebGL, Deforum, and Input.
            </p>
            <div class="chips video-layer-add__mode">
              <button
                type="button"
                class="chip"
                :class="{ active: liveSourcePanel === 'library' }"
                @click="liveSourcePanel = 'library'; saveSessionState()"
              >
                Video library
              </button>
              <button
                type="button"
                class="chip"
                :class="{ active: liveSourcePanel === 'cloud' }"
                @click="liveSourcePanel = 'cloud'; saveSessionState()"
              >
                Cloud drive
              </button>
            </div>
            <div v-if="liveSourcePanel === 'library'" style="margin-top:10px;">
              <VideoSwarmBrowser :app="app" />
            </div>
            <div v-else style="margin-top:10px;">
              <div class="framesync-row" style="grid-template-columns: 1fr 0.8fr; gap:10px;">
                <input class="framesync-input" v-model.trim="cloudDriveDraft.url" placeholder="https://drive.google.com/...">
                <select class="framesync-select" v-model="cloudDriveDraft.provider">
                  <option value="google_drive">Google Drive</option>
                  <option value="dropbox">Dropbox</option>
                  <option value="onedrive">OneDrive</option>
                </select>
              </div>
              <div class="framesync-footer" style="margin-top:8px;">
                <button type="button" class="framesync-button" @click="linkCloudDriveSource">Link cloud drive</button>
              </div>
            </div>
          </div>
          <div v-if="isWebglLayerActive">
          <div class="framesync-stack" style="margin-top:10px;">
            <div class="framesync-subtitle">Animation style</div>
            <select class="framesync-select" :value="defaultAnimation.mode" @change="setDefaultAnimationMode($event.target.value)">
              <option value="instancing">GPU instancing</option>
              <option value="volume">Volume lighting</option>
              <option value="orbital">Orbital pulse</option>
              <option value="nebula">Nebula drift</option>
              <option value="raycast">Fat lines raycast</option>
              <option value="marching">Marching cubes</option>
              <option value="ocean">Shader ocean</option>
            </select>
          </div>
          <div v-if="defaultAnimation.mode === 'instancing'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Instance count</span>
            <input class="framesync-input" type="range" min="1000" max="50000" step="500" v-model.number="defaultAnimation.instCount" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'instancing'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Spread</span>
            <input class="framesync-input" type="range" min="0.2" max="2.5" step="0.01" v-model.number="defaultAnimation.spread" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'instancing'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Motion rate</span>
            <input class="framesync-input" type="range" min="0.1" max="2.5" step="0.01" v-model.number="defaultAnimation.speed" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'instancing'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Color shift</span>
            <input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.hue" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'instancing'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Shimmer</span>
            <input class="framesync-input" type="range" min="0.1" max="1.4" step="0.01" v-model.number="defaultAnimation.glow" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'instancing'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Camera depth</span>
            <input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.orbit" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'volume'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Beam count</span>
            <input class="framesync-input" type="range" min="3" max="12" step="1" v-model.number="defaultAnimation.beamCount" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'orbital'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Orbit size</span>
            <input class="framesync-input" type="range" min="0.1" max="2.0" step="0.01" v-model.number="defaultAnimation.orbit" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'nebula'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Mist</span>
            <input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.mist" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'raycast'" class="framesync-stack" style="margin-top:10px;">
            <div class="framesync-subtitle">Line type</div>
            <select class="framesync-select" v-model="defaultAnimation.lineType" @change="onDefaultAnimationInput">
              <option value="segments">LineSegmentsGeometry</option>
              <option value="line">LineGeometry</option>
            </select>
          </div>
          <div v-if="defaultAnimation.mode === 'raycast'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Width</span>
            <input class="framesync-input" type="range" min="1" max="10" step="0.1" v-model.number="defaultAnimation.lineWidth" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'raycast'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Threshold</span>
            <input class="framesync-input" type="range" min="0" max="10" step="0.1" v-model.number="defaultAnimation.lineThreshold" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'raycast'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Translation</span>
            <input class="framesync-input" type="range" min="0" max="10" step="0.1" v-model.number="defaultAnimation.lineTranslation" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'raycast'" class="framesync-stack" style="margin-top:10px;">
            <div class="framesync-subtitle">Line material</div>
            <div class="chips">
              <button type="button" class="chip" :class="{ active: defaultAnimation.lineWorldUnits }" @click="defaultAnimation.lineWorldUnits = true; onDefaultAnimationInput()">World units</button>
              <button type="button" class="chip" :class="{ active: !defaultAnimation.lineWorldUnits }" @click="defaultAnimation.lineWorldUnits = false; onDefaultAnimationInput()">Pixels</button>
              <button type="button" class="chip" :class="{ active: defaultAnimation.lineAlphaToCoverage }" @click="defaultAnimation.lineAlphaToCoverage = !defaultAnimation.lineAlphaToCoverage; onDefaultAnimationInput()">Alpha coverage</button>
            </div>
          </div>
          <div v-if="defaultAnimation.mode === 'raycast'" class="framesync-stack" style="margin-top:10px;">
            <div class="framesync-subtitle">Behavior</div>
            <div class="chips">
              <button type="button" class="chip" :class="{ active: defaultAnimation.lineVisualizeThreshold }" @click="defaultAnimation.lineVisualizeThreshold = !defaultAnimation.lineVisualizeThreshold; onDefaultAnimationInput()">Visualize threshold</button>
              <button type="button" class="chip" :class="{ active: defaultAnimation.lineAnimate }" @click="defaultAnimation.lineAnimate = !defaultAnimation.lineAnimate; onDefaultAnimationInput()">Animate</button>
            </div>
          </div>
          <div v-if="defaultAnimation.mode === 'marching'" class="framesync-stack" style="margin-top:10px;">
            <div class="framesync-subtitle">Material</div>
            <select class="framesync-select" v-model="defaultAnimation.mcMaterial" @change="onDefaultAnimationInput">
              <option value="shiny">Shiny</option>
              <option value="chrome">Chrome</option>
              <option value="liquid">Liquid</option>
              <option value="matte">Matte</option>
              <option value="flat">Flat</option>
              <option value="plastic">Plastic</option>
              <option value="colors">Colors</option>
              <option value="multiColors">Multi colors</option>
            </select>
          </div>
          <div v-if="defaultAnimation.mode === 'marching'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Speed</span>
            <input class="framesync-input" type="range" min="0.1" max="8" step="0.05" v-model.number="defaultAnimation.speed" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'marching'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Blob count</span>
            <input class="framesync-input" type="range" min="1" max="50" step="1" v-model.number="defaultAnimation.mcNumBlobs" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'marching'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Resolution</span>
            <input class="framesync-input" type="range" min="14" max="100" step="1" v-model.number="defaultAnimation.mcResolution" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'marching'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Isolation</span>
            <input class="framesync-input" type="range" min="10" max="300" step="1" v-model.number="defaultAnimation.mcIsolation" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'marching'" class="framesync-stack" style="margin-top:10px;">
            <div class="framesync-subtitle">Field helpers</div>
            <div class="chips">
              <button type="button" class="chip" :class="{ active: defaultAnimation.mcFloor }" @click="defaultAnimation.mcFloor = !defaultAnimation.mcFloor; onDefaultAnimationInput()">Floor</button>
              <button type="button" class="chip" :class="{ active: defaultAnimation.mcWallX }" @click="defaultAnimation.mcWallX = !defaultAnimation.mcWallX; onDefaultAnimationInput()">Wall X</button>
              <button type="button" class="chip" :class="{ active: defaultAnimation.mcWallZ }" @click="defaultAnimation.mcWallZ = !defaultAnimation.mcWallZ; onDefaultAnimationInput()">Wall Z</button>
            </div>
          </div>
          <div v-if="defaultAnimation.mode === 'ocean'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Sun elevation</span>
            <input class="framesync-input" type="range" min="0" max="90" step="0.1" v-model.number="defaultAnimation.ocElevation" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'ocean'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Sun azimuth</span>
            <input class="framesync-input" type="range" min="-180" max="180" step="0.1" v-model.number="defaultAnimation.ocAzimuth" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'ocean'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Exposure</span>
            <input class="framesync-input" type="range" min="0" max="1" step="0.0001" v-model.number="defaultAnimation.ocExposure" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'ocean'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Distortion scale</span>
            <input class="framesync-input" type="range" min="0" max="8" step="0.1" v-model.number="defaultAnimation.ocDistortion" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'ocean'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Wave size</span>
            <input class="framesync-input" type="range" min="0.1" max="10" step="0.1" v-model.number="defaultAnimation.ocSize" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'ocean'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Cloud coverage</span>
            <input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.ocCloudCoverage" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'ocean'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Cloud density</span>
            <input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.ocCloudDensity" @input="onDefaultAnimationInput">
          </div>
          <div v-if="defaultAnimation.mode === 'ocean'" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Cloud elevation</span>
            <input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.ocCloudElevation" @input="onDefaultAnimationInput">
          </div>
          <div v-if="!['raycast', 'marching', 'ocean', 'instancing'].includes(defaultAnimation.mode)" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Speed</span>
            <input class="framesync-input" type="range" min="0.1" max="2.5" step="0.01" v-model.number="defaultAnimation.speed" @input="onDefaultAnimationInput">
          </div>
          <div v-if="!['raycast', 'marching', 'ocean', 'instancing'].includes(defaultAnimation.mode)" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Spread</span>
            <input class="framesync-input" type="range" min="0.2" max="1.4" step="0.01" v-model.number="defaultAnimation.spread" @input="onDefaultAnimationInput">
          </div>
          <div v-if="!['raycast', 'marching', 'ocean', 'instancing'].includes(defaultAnimation.mode)" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Glow</span>
            <input class="framesync-input" type="range" min="0.1" max="1.4" step="0.01" v-model.number="defaultAnimation.glow" @input="onDefaultAnimationInput">
          </div>
          <div v-if="!['raycast', 'marching', 'ocean', 'instancing'].includes(defaultAnimation.mode)" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Hue</span>
            <input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.hue" @input="onDefaultAnimationInput">
          </div>
          <div v-if="!['raycast', 'marching', 'ocean', 'instancing'].includes(defaultAnimation.mode)" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Pulse</span>
            <input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.pulse" @input="onDefaultAnimationInput">
          </div>
          <div v-if="!['raycast', 'marching', 'ocean', 'instancing'].includes(defaultAnimation.mode)" class="slider-row">
            <span class="framesync-subtitle" style="margin:0;">Drift</span>
            <input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.drift" @input="onDefaultAnimationInput">
          </div>
          </div>
        </template>
      </div>
    </div>

    <div class="rack performance-deck">
      <div class="framesync-panel">
        <div class="framesync-header">
          <div class="framesync-title">
            <UiIcon class="framesync-title-icon" name="sliders" />
            <span class="framesync-accent">Crossfader</span>
          </div>
        </div>

        <div class="framesync-stack" style="margin-top:10px;">
          <div class="framesync-subtitle">Generic prompt</div>
          <div class="prompt-input-row">
            <textarea
              class="framesync-input prompt-input-row__input"
              v-model="performance.genericPrompt"
              rows="2"
              placeholder="Base prompt for this session…"
              @input="onPerformanceInput"
            ></textarea>
            <div class="prompt-input-row__actions">
              <button
                type="button"
                class="framesync-button framesync-button--compact"
                :class="{ 'framesync-button--live': speechPromptListening }"
                :title="speechPromptListening ? 'Stop microphone' : (speechPromptSupported ? 'Speak prompt' : 'Microphone not supported')"
                :disabled="!speechPromptSupported"
                @click="toggleSpeechPrompt"
              >
                <UiIcon name="mic" />
              </button>
              <button
                type="button"
                class="framesync-button framesync-button--compact"
                title="Clear prompt"
                :disabled="!(performance.genericPrompt || '').trim()"
                @click="clearGenericPrompt"
              >
                <UiIcon name="close" />
              </button>
              <button
                type="button"
                class="framesync-button framesync-button--compact"
                :class="{ active: promptHistoryOpen }"
                :title="promptHistoryOpen ? 'Close prompt history' : 'Open prompt history'"
                @click="togglePromptHistory"
              >
                <UiIcon name="history" />
              </button>
            </div>
          </div>
          <div v-if="speechPromptError" class="framesync-subtitle" style="margin-top:6px;color:var(--warn);">
            {{ speechPromptError }}
          </div>
          <div v-if="promptHistoryOpen" class="prompt-history-panel">
            <div class="prompt-history-panel__header">
              <div class="framesync-subtitle" style="margin:0;">History</div>
              <button type="button" class="framesync-button framesync-button--compact" @click="togglePromptHistory(false)">Close</button>
            </div>
            <div v-if="!promptHistory.length" class="prompt-history-panel__empty">No prompts yet.</div>
            <div v-else class="prompt-history-panel__list">
              <button
                v-for="(p, idx) in promptHistory"
                :key="'prompt-hist-' + idx"
                type="button"
                class="prompt-history-panel__item"
                @click="restorePromptFromHistory(p)"
                :title="p"
              >
                {{ p }}
              </button>
            </div>
          </div>
        </div>

        <div class="crossfade-deck" style="margin-top:14px;">
          <div class="crossfade-deck-head">
            <span class="framesync-subtitle" style="margin:0;">Slots</span>
            <select class="framesync-select" style="max-width:140px;" v-model="performance.newSlotType">
              <option v-for="st in crossfadeSlotTypes" :key="st.id" :value="st.id">{{ st.label }}</option>
            </select>
            <button type="button" class="framesync-button" @click="addCrossfadeSlot">+ Add</button>
          </div>

          <div v-if="!performance.slots.length" class="crossfade-empty">Add prompts, parameters, LoRAs, or ControlNet values on side A and/or B.</div>

          <div v-for="slot in performance.slots" :key="slot.id" class="crossfade-slot-row">
            <div class="crossfade-side crossfade-side-a">
              <span class="crossfade-side-label">A</span>
              <template v-if="slot.type === 'prompt'">
                <input class="framesync-input" v-model="slot.valueA" placeholder="Prompt A (optional)" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'param'">
                <select class="framesync-select" v-model="slot.paramKey" @change="onPerformanceInput">
                  <option v-for="t in modulationTargets" :key="'a-'+slot.id+t.key" :value="t.key">{{ t.label }}</option>
                </select>
                <input type="number" class="framesync-input" v-model.number="slot.valueA" step="any" placeholder="Value A" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'lora'">
                <select class="framesync-select" v-model="slot.valueA" @change="onPerformanceInput">
                  <option :value="null">— none —</option>
                  <option v-for="l in loras.available" :key="'la-'+slot.id+l.id" :value="l.name">{{ l.name }}</option>
                </select>
                <input type="number" class="framesync-input" v-model.number="slot.loraStrengthA" min="0" max="2" step="0.01" placeholder="Str A" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'controlnet'">
                <select class="framesync-select" v-model="slot.cnSlotId" @change="onPerformanceInput">
                  <option v-for="s in cn.slots" :key="'cna-'+slot.id+s.id" :value="s.id">{{ s.label }}</option>
                </select>
                <input type="number" class="framesync-input" v-model.number="slot.valueA" min="0" max="2" step="0.01" placeholder="Weight A" @input="onPerformanceInput">
              </template>
            </div>

            <div class="crossfade-slot-meta">
              <span class="crossfade-type-pill">{{ slotTypeLabel(slot.type) }}</span>
              <button type="button" class="framesync-button" style="padding:2px 6px;" @click="removeCrossfadeSlot(slot.id)">✕</button>
            </div>

            <div class="crossfade-side crossfade-side-b">
              <span class="crossfade-side-label">B</span>
              <template v-if="slot.type === 'prompt'">
                <input class="framesync-input" v-model="slot.valueB" placeholder="Prompt B (optional)" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'param'">
                <input type="number" class="framesync-input" v-model.number="slot.valueB" step="any" placeholder="Value B" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'lora'">
                <select class="framesync-select" v-model="slot.valueB" @change="onPerformanceInput">
                  <option :value="null">— none —</option>
                  <option v-for="l in loras.available" :key="'lb-'+slot.id+l.id" :value="l.name">{{ l.name }}</option>
                </select>
                <input type="number" class="framesync-input" v-model.number="slot.loraStrengthB" min="0" max="2" step="0.01" placeholder="Str B" @input="onPerformanceInput">
              </template>
              <template v-else-if="slot.type === 'controlnet'">
                <input type="number" class="framesync-input" v-model.number="slot.valueB" min="0" max="2" step="0.01" placeholder="Weight B" @input="onPerformanceInput">
              </template>
            </div>

            <div class="crossfade-morphed" v-if="slotMorphedPreview(slot) !== null">
              <span class="framesync-subtitle" style="margin:0;font-size:9px;">→</span>
              <code class="crossfade-morphed-val">{{ formatMorphedPreview(slot) }}</code>
            </div>
          </div>
        </div>

        <div v-if="performance.status" class="framesync-subtitle" style="margin-top:10px;text-align:center;color:var(--success);">
          <span v-if="previewGenerating" class="lazy-loading-indicator lazy-loading-indicator--subtle">
            <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
            <span>{{ performance.status }}</span>
            <span class="lazy-loading-indicator__dots" aria-hidden="true"><span></span><span></span><span></span></span>
          </span>
          <template v-else>{{ performance.status }}</template>
        </div>
      </div>
    </div>

    <div class="rack param-drawer">
      <button type="button" class="param-drawer-toggle" @click="paramPanelOpen = !paramPanelOpen; saveSessionState()">
        <span class="param-drawer-label">
          <UiIcon class="param-drawer-label-icon" name="sliders" />
          <span>Parameters</span>
        </span>
        <UiIcon class="param-drawer-chevron" :name="paramPanelOpen ? 'chevron-up' : 'chevron-down'" />
      </button>
      <div v-show="paramPanelOpen" class="param-drawer-body">
        <div v-if="pinnedParamItems.length" class="param-group param-group--pinned">
          <div class="framesync-subtitle">📌 Pinned</div>
          <div class="param-group-grid">
            <div class="framesync-stack" v-for="p in pinnedParamItems" :key="'pin-'+p.key" :class="{'param-locked': isParamLocked(p.key)}">
              <div class="framesync-subtitle" style="font-size:10px; display:flex; align-items:center; gap:4px;">
                <span>{{ p.label }}</span>
                <button type="button" class="param-pin-btn active" title="Unpin" @click.stop="toggleParamPin(p.key)">📌</button>
                <button type="button" class="param-lock-btn" :class="{active: isParamLockedByMe(p.key)}" :title="paramLockTitle(p.key)" @click.stop="toggleParamLock(p.key)">🔒</button>
              </div>
              <input type="range" :min="p.min" :max="p.max" :step="p.step" :value="p.val" :disabled="isParamLocked(p.key) && !isParamLockedByMe(p.key)" @input="updateParam(p,$event)" class="framesync-input">
            </div>
          </div>
        </div>

        <div v-for="group in paramPanelGroups" :key="group.label" class="param-group">
          <div class="framesync-subtitle">{{ group.label }}</div>
          <div class="param-group-grid">
            <div class="framesync-stack" v-for="p in group.items" :key="p.key" :class="{'param-locked': isParamLocked(p.key)}">
              <div class="framesync-subtitle" style="font-size:10px; display:flex; align-items:center; gap:4px;">
                <span>{{ p.label }}</span>
                <button type="button" class="param-pin-btn" :class="{active: isParamPinned(p.key)}" title="Pin to top" @click.stop="toggleParamPin(p.key)">📌</button>
                <button type="button" class="param-lock-btn" :class="{active: isParamLockedByMe(p.key)}" :title="paramLockTitle(p.key)" @click.stop="toggleParamLock(p.key)">🔒</button>
              </div>
              <input type="range" :min="p.min" :max="p.max" :step="p.step" :value="p.val" :disabled="isParamLocked(p.key) && !isParamLockedByMe(p.key)" @input="updateParam(p,$event)" class="framesync-input">
            </div>
          </div>
        </div>

        <div class="framesync-footer" style="margin-top:10px;">
          <button class="framesync-button" @click="resetVibeParams">↺ Reset vibe</button>
          <button class="framesync-button" @click="resetCameraParams">↺ Reset camera</button>
        </div>
      </div>
    </div>
    </template>

    <template v-else-if="currentSubTab.LIVE === 'DEFORUM_JOB'">
    <div class="rack deforum-job-panel" data-testid="deforum-settings-panel">
      <div class="framesync-panel deforum-job-panel__head">
        <div class="framesync-header">
          <div class="framesync-title">
            <UiIcon class="framesync-title-icon" name="film" />
            <span class="framesync-accent">Deforum</span>
          </div>
          <span
            class="perf-mode-badge"
            :class="deforumPlaying ? 'mode-animate' : 'mode-preview'"
          >
            {{ deforumPlaying ? 'Animating' : 'Ready' }}
          </span>
        </div>
        <p class="framesync-subtitle deforum-job-panel__summary">
          Batch <strong>{{ deforumSettings.batch_name || '—' }}</strong>
          · {{ deforumSettings.max_frames || 0 }} frames @ {{ deforumSettings.fps || 24 }} fps
        </p>
        <div class="deforum-job-panel__transport">
          <button type="button" class="framesync-button" :class="{ active: deforumPlaying }" @click="toggleDeforumPlay">
            {{ deforumPlaying ? 'Pause job' : 'Play job' }}
          </button>
          <button type="button" class="framesync-button" @click="stopDeforumPlay">Stop</button>
        </div>
        <div v-if="deforumSettingsStatus" class="framesync-subtitle deforum-job-panel__status">{{ deforumSettingsStatus }}</div>
      </div>
      <div class="param-drawer-body deforum-settings-body">
        <div class="deforum-settings-toolbar">
          <button type="button" class="framesync-button" :disabled="deforumSettingsLoading" @click="loadDeforumSettings">
            <span v-if="deforumSettingsLoading" class="lazy-loading-indicator lazy-loading-indicator--button">
              <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
              <span>Reload</span>
            </span>
            <template v-else>↻ Reload</template>
          </button>
          <button type="button" class="framesync-button" :disabled="deforumSettingsSaving" @click="saveDeforumSettings">
            <span v-if="deforumSettingsSaving" class="lazy-loading-indicator lazy-loading-indicator--button">
              <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
              <span>Save</span>
            </span>
            <template v-else>💾 Save</template>
          </button>
          <button
            type="button"
            class="framesync-button"
            :class="{ 'framesync-button--loading': previewGenerating }"
            :disabled="previewGenerating"
            @click="generateDeforumPreviewFrame"
          >
            <span v-if="previewGenerating" class="lazy-loading-indicator lazy-loading-indicator--button">
              <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
              <span>Regenerate frame</span>
            </span>
            <template v-else>🖼 Regenerate frame</template>
          </button>
          <label class="deforum-advanced-toggle">
            <input type="checkbox" v-model="deforumAdvancedOpen"> JSON
          </label>
        </div>

        <div v-if="deforumAdvancedOpen" class="deforum-advanced-json">
          <textarea
            class="framesync-input deforum-json-editor"
            v-model="deforumSettingsJson"
            rows="12"
            spellcheck="false"
            @blur="applyDeforumSettingsJson"
          ></textarea>
          <p v-if="deforumSettingsJsonError" class="deforum-json-error">{{ deforumSettingsJsonError }}</p>
        </div>

        <div v-else class="deforum-settings-groups">
          <div class="sub-pills deforum-settings-tabs">
            <button
              v-for="group in deforumFieldGroups"
              :key="'deforum-tab-' + group.id"
              type="button"
              class="sub-pill"
              :class="{ active: deforumActiveTab === group.id }"
              @click="deforumActiveTab = group.id; saveSessionState()"
            >
              {{ group.label }}
            </button>
          </div>

          <div v-if="activeDeforumFieldGroup" class="framesync-panel deforum-settings-panel">
            <MotionPathPreview
              v-if="deforumActiveTab === 'motion' || deforumActiveTab === 'motion3d'"
              :deforum-settings="deforumSettings"
              :motion-values="{}"
              :prefer-live-values="false"
            />
            <div class="deforum-settings-grid">
              <template v-for="field in activeDeforumFieldGroup.fields" :key="field.key">
                <label
                  v-if="field.key !== 'sd_model_name'"
                  class="deforum-field"
                  :class="[
                    'deforum-field-' + (field.type || 'text'),
                    { 'deforum-field--disabled': !isDeforumFieldEnabled(field.key) }
                  ]"
                >
                  <span class="deforum-field-head">
                    <span class="deforum-field-label">{{ field.label }}</span>
                    <span v-if="isDeforumFieldToggleable(field.key)" class="deforum-field-toggle">
                      <button
                        type="button"
                        class="chip chip--compact"
                        :class="{ active: isDeforumFieldEnabled(field.key) }"
                        @click.prevent="setDeforumFieldEnabled(field.key, !isDeforumFieldEnabled(field.key))"
                      >
                        {{ isDeforumFieldEnabled(field.key) ? 'On' : 'Off' }}
                      </button>
                    </span>
                  </span>
                  <div v-if="field.type === 'slider'" class="deforum-field-slider">
                    <input
                      type="range"
                      class="framesync-input"
                      :min="field.min"
                      :max="field.max"
                      :step="field.step || 1"
                      :value="getDeforumField(field.key)"
                      :disabled="!isDeforumFieldEnabled(field.key)"
                      @input="onDeforumFieldInput(field.key, $event.target.value, 'number')"
                    />
                    <span class="deforum-field-slider__value">{{ formatDeforumFieldValue(field, getDeforumField(field.key)) }}</span>
                  </div>
                  <select
                    v-else-if="field.type === 'select'"
                    class="framesync-select"
                    :value="getDeforumField(field.key) ?? ''"
                    :disabled="!isDeforumFieldEnabled(field.key)"
                    @change="onDeforumFieldInput(field.key, $event.target.value, 'text')"
                  >
                    <option v-if="isDeforumDynamicSelect(field) && !deforumFieldOptions(field).length" value="">—</option>
                    <option
                      v-for="opt in deforumFieldOptions(field)"
                      :key="field.key + '-opt-' + opt"
                      :value="opt"
                    >
                      {{ opt }}
                    </option>
                  </select>
                  <input
                    v-else-if="field.type === 'number'"
                    type="number"
                    class="framesync-input"
                    :min="field.min"
                    :max="field.max"
                    :step="field.step || 1"
                    :value="getDeforumField(field.key)"
                    :disabled="!isDeforumFieldEnabled(field.key)"
                    @input="onDeforumFieldInput(field.key, $event.target.value, 'number')"
                  />
                  <div v-else-if="field.type === 'bool'" class="chips deforum-field-bool">
                    <button type="button" class="chip" :class="{ active: !!getDeforumField(field.key) }" :disabled="!isDeforumFieldEnabled(field.key)" @click="onDeforumFieldInput(field.key, true, 'bool')">On</button>
                    <button type="button" class="chip" :class="{ active: !getDeforumField(field.key) }" :disabled="!isDeforumFieldEnabled(field.key)" @click="onDeforumFieldInput(field.key, false, 'bool')">Off</button>
                  </div>
                  <textarea
                    v-else-if="field.type === 'textarea'"
                    class="framesync-input"
                    :rows="field.rows || 3"
                    :value="getDeforumField(field.key) ?? ''"
                    :disabled="!isDeforumFieldEnabled(field.key)"
                    @input="onDeforumFieldInput(field.key, $event.target.value, 'text')"
                  />
                  <input
                    v-else
                    type="text"
                    class="framesync-input"
                    :value="getDeforumField(field.key) ?? ''"
                    :disabled="!isDeforumFieldEnabled(field.key)"
                    @input="onDeforumFieldInput(field.key, $event.target.value, 'text')"
                  />
                </label>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script>
import UiIcon from '../UiIcon.vue'
import MotionPathPreview from '../MotionPathPreview.vue'
import { proxyAppView } from './app-view-proxy.mjs'

export default {
  name: 'LiveView',
  components: { UiIcon, MotionPathPreview },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
