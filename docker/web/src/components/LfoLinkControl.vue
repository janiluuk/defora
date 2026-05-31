<template>
  <div class="lfo-link-control" data-testid="lfo-link-control">
    <button
      type="button"
      class="framesync-button lfo-link-control__toggle"
      :class="{ 'framesync-button--live': enabled }"
      data-testid="lfo-link-toggle"
      @click="onToggle"
    >
      {{ enabled ? 'LFO on' : 'LFO off' }}
    </button>
    <select
      v-if="enabled"
      class="framesync-select lfo-link-control__select"
      data-testid="lfo-link-select"
      :value="linkId || ''"
      @change="onSelect($event.target.value)"
    >
      <option v-for="lfo in lfos" :key="'lfo-link-opt-' + lfo.id" :value="lfo.id">
        LFO {{ lfo.id }} · {{ lfo.shape }}
      </option>
    </select>
    <span v-if="status" class="lfo-link-control__status">{{ status }}</span>
  </div>
</template>

<script>
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'LfoLinkControl',
  props: {
    app: { type: Object, required: true },
    linkId: { type: Number, default: null },
    status: { type: String, default: '' },
    maxLfoId: { type: Number, default: 6 },
  },
  emits: ['update:linkId'],
  setup(props) {
    return proxyAppView(props)
  },
  computed: {
    enabled() {
      const id = Number(this.linkId || 0)
      return id >= 1 && id <= this.maxLfoId
    },
  },
  methods: {
    onToggle() {
      if (this.enabled) {
        this.$emit('update:linkId', null)
        return
      }
      const first = (this.lfos || []).find((lfo) => lfo.id >= 1 && lfo.id <= this.maxLfoId)
      this.$emit('update:linkId', first ? first.id : 1)
    },
    onSelect(raw) {
      const id = Number(raw || 0)
      if (id >= 1 && id <= this.maxLfoId) {
        this.$emit('update:linkId', id)
      }
    },
  },
}
</script>
