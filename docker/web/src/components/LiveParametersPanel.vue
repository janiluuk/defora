<template>
  <div class="rack param-drawer live-parameters-panel" data-testid="live-parameters-panel">
    <button type="button" class="param-drawer-toggle" @click="paramPanelOpen = !paramPanelOpen; saveSessionState()">
      <span class="param-drawer-label">
        <UiIcon class="param-drawer-label-icon" name="sliders" />
        <span>Parameters</span>
      </span>
      <UiIcon class="param-drawer-chevron" :name="paramPanelOpen ? 'chevron-up' : 'chevron-down'" />
    </button>
    <div v-show="paramPanelOpen" class="param-drawer-body">
      <div v-if="pinnedParamItems.length" class="param-group param-group--pinned">
        <div class="framesync-subtitle param-group__pinned-label">
          <UiIcon name="pin" class="param-group__pinned-icon" />
          <span>Pinned</span>
        </div>
        <div class="param-group-grid">
          <div class="framesync-stack" v-for="p in pinnedParamItems" :key="'pin-'+p.key" :class="{'param-locked': isParamLocked(p.key)}">
            <div class="framesync-subtitle" style="font-size:10px; display:flex; align-items:center; gap:4px;">
              <span>{{ p.label }}</span>
              <button type="button" class="param-pin-btn active" title="Unpin" @click.stop="toggleParamPin(p.key)"><UiIcon name="pin" /></button>
              <button type="button" class="param-lock-btn" :class="{active: isParamLockedByMe(p.key)}" :title="paramLockTitle(p.key)" @click.stop="toggleParamLock(p.key)"><UiIcon name="lock" /></button>
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
              <button type="button" class="param-pin-btn" :class="{active: isParamPinned(p.key)}" title="Pin to top" @click.stop="toggleParamPin(p.key)"><UiIcon name="pin" /></button>
              <button type="button" class="param-lock-btn" :class="{active: isParamLockedByMe(p.key)}" :title="paramLockTitle(p.key)" @click.stop="toggleParamLock(p.key)"><UiIcon name="lock" /></button>
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

<script>
import UiIcon from './UiIcon.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'LiveParametersPanel',
  components: { UiIcon },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
