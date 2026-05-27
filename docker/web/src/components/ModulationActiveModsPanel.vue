<template>
  <div class="modulation-active-mods">
    <div v-if="!liveModulating.length" class="live-hud-empty">No active modulators</div>
    <div v-else class="modulation-active-mods__list">
      <LiveParamRow
        v-for="p in liveModulating"
        :key="'mod-active-' + p.key"
        :label="p.label"
        :param-key="p.key"
        :value="p.val"
        :min="p.min"
        :max="p.max"
        :source="p.source"
        :modulated="true"
      />
    </div>
  </div>
</template>

<script>
import LiveParamRow from './LiveParamRow.vue'
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'ModulationActiveModsPanel',
  components: { LiveParamRow },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
