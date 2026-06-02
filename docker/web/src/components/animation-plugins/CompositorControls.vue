<template>
  <section class="compositor-panel" data-testid="preview-compositor-controls">
    <header class="compositor-panel__head">
      <UiIcon class="compositor-panel__icon" name="film" aria-hidden="true" />
      <div class="compositor-panel__head-copy">
        <h3 class="compositor-panel__title">Preview compositor</h3>
        <p class="compositor-panel__subtitle">Crossfade, auto-switch, and forge mix routing</p>
      </div>
    </header>

    <div class="compositor-panel__cards">
      <article class="compositor-card">
        <div class="compositor-card__row">
          <div class="compositor-card__copy">
            <span class="compositor-card__label">Auto-switch to Deforum</span>
            <span class="compositor-card__hint">Jump preview to Deforum when new frames arrive</span>
          </div>
          <button
            type="button"
            class="compositor-big-toggle"
            :class="{ 'compositor-big-toggle--on': defaultAnimation.autoTransitionToDeforum !== false }"
            data-testid="auto-transition-deforum"
            :aria-pressed="defaultAnimation.autoTransitionToDeforum !== false ? 'true' : 'false'"
            @click="defaultAnimation.autoTransitionToDeforum = defaultAnimation.autoTransitionToDeforum === false; onDefaultAnimationInput()"
          >
            <span class="compositor-big-toggle__track" aria-hidden="true">
              <span class="compositor-big-toggle__thumb"></span>
            </span>
            <span class="compositor-big-toggle__label">
              {{ defaultAnimation.autoTransitionToDeforum !== false ? 'On' : 'Off' }}
            </span>
          </button>
        </div>
      </article>

      <article class="compositor-card">
        <div class="compositor-card__row">
          <div class="compositor-card__copy">
            <span class="compositor-card__label">Remember preview layer</span>
            <span class="compositor-card__hint">Restore last active layer after reload</span>
          </div>
          <button
            type="button"
            class="compositor-big-toggle"
            :class="{ 'compositor-big-toggle--on': !!defaultAnimation.rememberCompositorLayerOnStartup }"
            data-testid="remember-compositor-layer"
            :aria-pressed="defaultAnimation.rememberCompositorLayerOnStartup ? 'true' : 'false'"
            @click="defaultAnimation.rememberCompositorLayerOnStartup = !defaultAnimation.rememberCompositorLayerOnStartup; onDefaultAnimationInput()"
          >
            <span class="compositor-big-toggle__track" aria-hidden="true">
              <span class="compositor-big-toggle__thumb"></span>
            </span>
            <span class="compositor-big-toggle__label">
              {{ defaultAnimation.rememberCompositorLayerOnStartup ? 'On' : 'Off' }}
            </span>
          </button>
        </div>
      </article>

      <article class="compositor-card compositor-card--slider">
        <div class="compositor-card__slider-head">
          <span class="compositor-card__label">Crossfade duration</span>
          <span class="compositor-card__value">
            {{
              !defaultAnimation.previewCompositorCrossfadeMs
                ? 'Instant'
                : defaultAnimation.previewCompositorCrossfadeMs >= 1000
                  ? (defaultAnimation.previewCompositorCrossfadeMs / 1000).toFixed(defaultAnimation.previewCompositorCrossfadeMs % 1000 === 0 ? 0 : 1) + 's'
                  : Math.round(defaultAnimation.previewCompositorCrossfadeMs) + 'ms'
            }}
          </span>
        </div>
        <input
          class="framesync-input compositor-card__range"
          type="range"
          min="0"
          max="5000"
          step="50"
          v-model.number="defaultAnimation.previewCompositorCrossfadeMs"
          data-testid="preview-compositor-crossfade-ms"
          @input="onDefaultAnimationInput"
        >
      </article>

      <article v-if="defaultAnimation.autoTransitionToDeforum === false" class="compositor-card compositor-card--action">
        <button
          type="button"
          class="framesync-button compositor-panel__promote"
          data-testid="promote-to-deforum"
          @click="promoteToDeforum()"
        >
          Promote to Deforum now
        </button>
      </article>

      <article class="compositor-card" data-testid="compositor-deforum-backdrop">
        <div class="compositor-card__row">
          <div class="compositor-card__copy">
            <span class="compositor-card__label">Deforum frame in WebGL</span>
            <span class="compositor-card__hint">Latest generated frame as standby background</span>
          </div>
          <label class="compositor-card__toggle">
            <input
              type="checkbox"
              :checked="defaultAnimation.deforumBackdropEnabled !== false"
              data-testid="deforum-backdrop-enabled"
              @change="defaultAnimation.deforumBackdropEnabled = $event.target.checked; onDefaultAnimationInput(); syncDeforumBackdropToWebGL()"
            >
          </label>
        </div>
        <div v-if="defaultAnimation.deforumBackdropEnabled !== false" class="compositor-card__slider-row">
          <span class="compositor-card__hint">Backdrop mix {{ Math.round((defaultAnimation.deforumBackdropMix || 0) * 100) }}%</span>
          <input
            class="framesync-input compositor-card__range"
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model.number="defaultAnimation.deforumBackdropMix"
            data-testid="deforum-backdrop-mix"
            @input="onDefaultAnimationInput(); syncDeforumBackdropToWebGL()"
          >
        </div>
      </article>

      <article class="compositor-card compositor-card--lfo" data-testid="compositor-lfo-links">
        <span class="compositor-card__label">Forge mix LFO</span>
        <p class="compositor-card__hint compositor-card__hint--block">
          LFO modulates forge opacity on WebGL + Deforum (Both). Route audio into LFO depth from MODULATION.
        </p>
        <div class="compositor-lfo-grid">
          <button
            type="button"
            class="compositor-lfo-chip"
            :class="{ active: !defaultAnimation.forgeLayerOpacityLfoLink }"
            @click="setForgeLayerOpacityLfoLink(null)"
          >
            Manual
          </button>
          <button
            v-for="lfo in lfos.slice(0, 6)"
            :key="'compositor-lfo-' + lfo.id"
            type="button"
            class="compositor-lfo-chip"
            :class="{ active: defaultAnimation.forgeLayerOpacityLfoLink === lfo.id }"
            :data-testid="'compositor-lfo-link-' + lfo.id"
            @click="setForgeLayerOpacityLfoLink(lfo.id)"
          >
            LFO {{ lfo.id }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
import UiIcon from '../UiIcon.vue'
import { proxyAppView } from '../views/app-view-proxy.mjs'

export default {
  name: 'CompositorControls',
  components: { UiIcon },
  props: { app: { type: Object, required: true } },
  setup(props) { return proxyAppView(props) },
}
</script>
