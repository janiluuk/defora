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
        Deforum job
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

        <template v-else-if="isWebglLayerActive">
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
          <span class="framesync-subtitle" style="margin:0;">A/B mix: build slots for prompts, params, LoRAs, and ControlNet.</span>
        </div>

        <div class="framesync-stack" style="margin-top:10px;">
          <div class="framesync-subtitle">Generic prompt</div>
          <textarea class="framesync-input" v-model="performance.genericPrompt" rows="2" placeholder="Base prompt for this session…" @input="onPerformanceInput"></textarea>
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
            <span class="framesync-accent">Deforum job</span>
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

          <div v-if="deforumActiveGroup" class="deforum-settings-grid" style="margin-top:10px;">
            <template v-for="field in deforumActiveGroup.fields" :key="field.key">
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
                  <span class="deforum-field-toggle" v-if="!String(field.key || '').startsWith('cn_')">
                    <input
                      type="checkbox"
                      :checked="isDeforumFieldEnabled(field.key)"
                      @change="setDeforumFieldEnabled(field.key, $event.target.checked)"
                    >
                    <span>{{ isDeforumFieldEnabled(field.key) ? 'On' : 'Off' }}</span>
                  </span>
                </span>
                <input
                  v-if="field.type === 'number'"
                  type="number"
                  class="framesync-input"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step || 1"
                  :value="getDeforumField(field.key)"
                  :disabled="!isDeforumFieldEnabled(field.key)"
                  @input="onDeforumFieldInput(field.key, $event.target.value, 'number')"
                />
                <div v-else-if="field.type === 'bool'" class="chips" style="margin-top:4px;">
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
    </template>
  </div>
</template>

<script>
import UiIcon from '../UiIcon.vue'
import { proxyAppView } from './app-view-proxy.js'

export default {
  name: 'LiveView',
  components: { UiIcon },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
