<template>
  <div
    class="live-engine-controls"
    :class="{ 'live-engine-controls--compact': compact }"
    data-testid="live-engine-controls"
  >
    <PresetSelectorBar v-if="showWebgl && !compact" :app="app" />

    <div
      v-if="showCompositor"
      class="live-engine-controls__section live-engine-controls__section--compositor"
      data-testid="preview-compositor-controls"
    >
      <div class="live-engine-controls__section-head">
        <span class="framesync-subtitle live-engine-controls__section-title">Preview compositor</span>
      </div>
      <label class="live-engine-controls__toggle">
        <input
          type="checkbox"
          :checked="defaultAnimation.autoTransitionToDeforum !== false"
          data-testid="auto-transition-deforum"
          @change="defaultAnimation.autoTransitionToDeforum = $event.target.checked; onDefaultAnimationInput()"
        >
        <span>Auto-switch to Deforum when frames arrive</span>
      </label>
      <label class="live-engine-controls__toggle">
        <input
          type="checkbox"
          :checked="!!defaultAnimation.rememberCompositorLayerOnStartup"
          data-testid="remember-compositor-layer"
          @change="defaultAnimation.rememberCompositorLayerOnStartup = $event.target.checked; onDefaultAnimationInput()"
        >
        <span>Remember last preview layer on reload</span>
      </label>
      <div class="slider-row">
        <span class="framesync-subtitle" style="margin:0;">Crossfade duration</span>
        <input
          class="framesync-input"
          type="range"
          min="0"
          max="5000"
          step="50"
          v-model.number="defaultAnimation.previewCompositorCrossfadeMs"
          data-testid="preview-compositor-crossfade-ms"
          @input="onDefaultAnimationInput"
        >
      </div>
      <button
        v-if="defaultAnimation.autoTransitionToDeforum === false"
        type="button"
        class="framesync-button framesync-button--compact"
        data-testid="promote-to-deforum"
        @click="promoteToDeforum()"
      >
        Promote to Deforum now
      </button>
      <div class="live-engine-controls__compositor-row" data-testid="compositor-lfo-links">
        <span class="framesync-subtitle" style="margin:0;">Forge mix LFO</span>
        <button
          type="button"
          class="framesync-button framesync-button--compact"
          :class="{ active: !defaultAnimation.forgeLayerOpacityLfoLink }"
          @click="setForgeLayerOpacityLfoLink(null)"
        >
          Manual
        </button>
        <button
          v-for="lfo in lfos.slice(0, 6)"
          :key="'compositor-lfo-' + lfo.id"
          type="button"
          class="framesync-button framesync-button--compact"
          :class="{ active: defaultAnimation.forgeLayerOpacityLfoLink === lfo.id }"
          :data-testid="'compositor-lfo-link-' + lfo.id"
          @click="setForgeLayerOpacityLfoLink(lfo.id)"
        >
          {{ 'LFO ' + lfo.id }}
        </button>
      </div>
      <p class="framesync-subtitle live-engine-controls__hint">
        LFO modulates forge opacity on WebGL + Deforum (Both). Use MODULATION to route audio into LFO depth.
      </p>
    </div>

    <div
      v-if="showWebgl && (forceWebgl || (!forcePerformance && (isWebglLayerActive || isBlendLayerActive)))"
      class="live-engine-controls__section live-engine-controls__section--webgl"
      data-testid="live-webgl-controls"
    >
      <div class="live-engine-controls__section-head">
        <span class="framesync-subtitle live-engine-controls__section-title">WebGL visual</span>
        <button
          type="button"
          class="framesync-button framesync-button--compact"
          data-testid="reset-webgl-visual"
          @click="resetDefaultAnimationSettings"
        >
          ↺ Reset visual
        </button>
      </div>
      <div class="framesync-stack" :style="compact ? 'margin-top:6px;' : 'margin-top:10px;'">
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
      <template v-if="defaultAnimation.mode === 'instancing'">
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Instance count</span><input class="framesync-input" type="range" min="1000" max="50000" step="500" v-model.number="defaultAnimation.instCount" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Spread</span><input class="framesync-input" type="range" min="0.2" max="2.5" step="0.01" v-model.number="defaultAnimation.spread" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Motion rate</span><input class="framesync-input" type="range" min="0.1" max="2.5" step="0.01" v-model.number="defaultAnimation.speed" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Color shift</span><input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.hue" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Shimmer</span><input class="framesync-input" type="range" min="0.1" max="1.4" step="0.01" v-model.number="defaultAnimation.glow" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Camera depth</span><input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.orbit" @input="onDefaultAnimationInput"></div>
      </template>
      <div v-else-if="defaultAnimation.mode === 'volume'" class="slider-row"><span class="framesync-subtitle" style="margin:0;">Beam count</span><input class="framesync-input" type="range" min="3" max="12" step="1" v-model.number="defaultAnimation.beamCount" @input="onDefaultAnimationInput"></div>
      <div v-else-if="defaultAnimation.mode === 'orbital'" class="slider-row"><span class="framesync-subtitle" style="margin:0;">Orbit size</span><input class="framesync-input" type="range" min="0.1" max="2.0" step="0.01" v-model.number="defaultAnimation.orbit" @input="onDefaultAnimationInput"></div>
      <div v-else-if="defaultAnimation.mode === 'nebula'" class="slider-row"><span class="framesync-subtitle" style="margin:0;">Mist</span><input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.mist" @input="onDefaultAnimationInput"></div>
      <template v-else-if="defaultAnimation.mode === 'raycast'">
        <div v-if="!compact" class="framesync-stack" style="margin-top:10px;"><div class="framesync-subtitle">Line type</div><select class="framesync-select" v-model="defaultAnimation.lineType" @change="onDefaultAnimationInput"><option value="segments">LineSegmentsGeometry</option><option value="line">LineGeometry</option></select></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Width</span><input class="framesync-input" type="range" min="1" max="10" step="0.1" v-model.number="defaultAnimation.lineWidth" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Threshold</span><input class="framesync-input" type="range" min="0" max="10" step="0.1" v-model.number="defaultAnimation.lineThreshold" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Translation</span><input class="framesync-input" type="range" min="0" max="10" step="0.1" v-model.number="defaultAnimation.lineTranslation" @input="onDefaultAnimationInput"></div>
        <div v-if="!compact" class="framesync-stack" style="margin-top:10px;">
          <div class="framesync-subtitle">Line material</div>
          <div class="chips">
            <button type="button" class="chip" :class="{ active: defaultAnimation.lineWorldUnits }" @click="defaultAnimation.lineWorldUnits = true; onDefaultAnimationInput()">World units</button>
            <button type="button" class="chip" :class="{ active: !defaultAnimation.lineWorldUnits }" @click="defaultAnimation.lineWorldUnits = false; onDefaultAnimationInput()">Pixels</button>
            <button type="button" class="chip" :class="{ active: defaultAnimation.lineAlphaToCoverage }" @click="defaultAnimation.lineAlphaToCoverage = !defaultAnimation.lineAlphaToCoverage; onDefaultAnimationInput()">Alpha coverage</button>
          </div>
        </div>
        <div v-if="!compact" class="framesync-stack" style="margin-top:10px;">
          <div class="framesync-subtitle">Behavior</div>
          <div class="chips">
            <button type="button" class="chip" :class="{ active: defaultAnimation.lineVisualizeThreshold }" @click="defaultAnimation.lineVisualizeThreshold = !defaultAnimation.lineVisualizeThreshold; onDefaultAnimationInput()">Visualize threshold</button>
            <button type="button" class="chip" :class="{ active: defaultAnimation.lineAnimate }" @click="defaultAnimation.lineAnimate = !defaultAnimation.lineAnimate; onDefaultAnimationInput()">Animate</button>
          </div>
        </div>
      </template>
      <template v-else-if="defaultAnimation.mode === 'marching'">
        <div v-if="!compact" class="framesync-stack" style="margin-top:10px;"><div class="framesync-subtitle">Material</div><select class="framesync-select" v-model="defaultAnimation.mcMaterial" @change="onDefaultAnimationInput"><option value="shiny">Shiny</option><option value="chrome">Chrome</option><option value="liquid">Liquid</option><option value="matte">Matte</option><option value="flat">Flat</option><option value="plastic">Plastic</option><option value="colors">Colors</option><option value="multiColors">Multi colors</option></select></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Speed</span><input class="framesync-input" type="range" min="0.1" max="8" step="0.05" v-model.number="defaultAnimation.speed" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Blob count</span><input class="framesync-input" type="range" min="1" max="50" step="1" v-model.number="defaultAnimation.mcNumBlobs" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Resolution</span><input class="framesync-input" type="range" min="14" max="100" step="1" v-model.number="defaultAnimation.mcResolution" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Isolation</span><input class="framesync-input" type="range" min="10" max="300" step="1" v-model.number="defaultAnimation.mcIsolation" @input="onDefaultAnimationInput"></div>
        <div v-if="!compact" class="framesync-stack" style="margin-top:10px;">
          <div class="framesync-subtitle">Field helpers</div>
          <div class="chips">
            <button type="button" class="chip" :class="{ active: defaultAnimation.mcFloor }" @click="defaultAnimation.mcFloor = !defaultAnimation.mcFloor; onDefaultAnimationInput()">Floor</button>
            <button type="button" class="chip" :class="{ active: defaultAnimation.mcWallX }" @click="defaultAnimation.mcWallX = !defaultAnimation.mcWallX; onDefaultAnimationInput()">Wall X</button>
            <button type="button" class="chip" :class="{ active: defaultAnimation.mcWallZ }" @click="defaultAnimation.mcWallZ = !defaultAnimation.mcWallZ; onDefaultAnimationInput()">Wall Z</button>
          </div>
        </div>
      </template>
      <template v-else-if="defaultAnimation.mode === 'ocean'">
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Sun elevation</span><input class="framesync-input" type="range" min="0" max="90" step="0.1" v-model.number="defaultAnimation.ocElevation" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Sun azimuth</span><input class="framesync-input" type="range" min="-180" max="180" step="0.1" v-model.number="defaultAnimation.ocAzimuth" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Exposure</span><input class="framesync-input" type="range" min="0" max="1" step="0.0001" v-model.number="defaultAnimation.ocExposure" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Distortion scale</span><input class="framesync-input" type="range" min="0" max="8" step="0.1" v-model.number="defaultAnimation.ocDistortion" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Wave size</span><input class="framesync-input" type="range" min="0.1" max="10" step="0.1" v-model.number="defaultAnimation.ocSize" @input="onDefaultAnimationInput"></div>
        <div v-if="!compact" class="slider-row"><span class="framesync-subtitle" style="margin:0;">Cloud coverage</span><input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.ocCloudCoverage" @input="onDefaultAnimationInput"></div>
        <div v-if="!compact" class="slider-row"><span class="framesync-subtitle" style="margin:0;">Cloud density</span><input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.ocCloudDensity" @input="onDefaultAnimationInput"></div>
        <div v-if="!compact" class="slider-row"><span class="framesync-subtitle" style="margin:0;">Cloud elevation</span><input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.ocCloudElevation" @input="onDefaultAnimationInput"></div>
      </template>
      <template v-else-if="!['raycast', 'marching', 'ocean', 'instancing'].includes(defaultAnimation.mode)">
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Speed</span><input class="framesync-input" type="range" min="0.1" max="2.5" step="0.01" v-model.number="defaultAnimation.speed" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Spread</span><input class="framesync-input" type="range" min="0.2" max="1.4" step="0.01" v-model.number="defaultAnimation.spread" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Glow</span><input class="framesync-input" type="range" min="0.1" max="1.4" step="0.01" v-model.number="defaultAnimation.glow" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Hue</span><input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.hue" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Pulse</span><input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.pulse" @input="onDefaultAnimationInput"></div>
        <div class="slider-row"><span class="framesync-subtitle" style="margin:0;">Drift</span><input class="framesync-input" type="range" min="0" max="1" step="0.01" v-model.number="defaultAnimation.drift" @input="onDefaultAnimationInput"></div>
      </template>
    </div>

    <div
      v-if="showCompositor && !forcePerformance && showForgeOverWebgl"
      class="live-engine-controls__section live-engine-controls__section--composite"
      data-testid="forge-overlay-controls"
    >
      <div class="live-engine-controls__section-head">
        <span class="framesync-subtitle live-engine-controls__section-title">Layer over WebGL</span>
      </div>
      <div class="slider-row">
        <span class="framesync-subtitle" style="margin:0;">Forge opacity</span>
        <input
          class="framesync-input"
          type="range"
          min="0"
          max="1"
          step="0.01"
          v-model.number="defaultAnimation.forgeLayerOpacity"
          data-testid="forge-layer-opacity"
          @input="defaultAnimation.forgeLayerOpacityLfoBase = defaultAnimation.forgeLayerOpacity; onDefaultAnimationInput()"
        >
      </div>
      <p class="framesync-subtitle live-engine-controls__hint">
        Set to 0 to hide Deforum/WAN preview frames over the WebGL stage. Blend mode uses screen compositing.
      </p>
    </div>

  </div>
</template>

<script>
import { inject } from 'vue'
import PresetSelectorBar from './PresetSelectorBar.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'LiveEngineControls',
  components: { PresetSelectorBar },
  props: {
    app: { type: Object, default: null },
    compact: { type: Boolean, default: false },
    forceWebgl: { type: Boolean, default: false },
    forcePerformance: { type: Boolean, default: false },
    showCompositor: { type: Boolean, default: true },
    showWebgl: { type: Boolean, default: true },
  },
  setup(props) {
    const deforaApp = inject('deforaApp', null)
    const app = props.app || deforaApp
    return proxyAppView({
      app,
      compact: props.compact,
      forceWebgl: props.forceWebgl,
      forcePerformance: props.forcePerformance,
      showCompositor: props.showCompositor,
      showWebgl: props.showWebgl,
    })
  },
}
</script>
