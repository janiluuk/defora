<template>
  <div class="header-transport" data-testid="header-transport">
    <button
      type="button"
      class="header-transport__btn header-transport__btn--play"
      :class="{ 'header-transport__btn--active': playing }"
      :disabled="playing"
      title="Play animation"
      aria-label="Play animation"
      data-testid="header-play"
      @click="$emit('play')"
    >
      <UiIcon class="header-transport__icon" name="play" />
    </button>
    <button
      type="button"
      class="header-transport__btn header-transport__btn--pause"
      :class="{ 'header-transport__btn--active': playing }"
      :disabled="!playing"
      title="Pause animation"
      aria-label="Pause animation"
      data-testid="header-pause"
      @click="$emit('pause')"
    >
      <UiIcon class="header-transport__icon" name="pause" />
    </button>
    <button
      type="button"
      class="header-transport__btn header-transport__btn--record"
      :class="{ 'header-transport__btn--active': recording }"
      :disabled="playing"
      :title="recording ? 'Stop recording' : 'Start recording'"
      :aria-label="recording ? 'Stop recording' : 'Start recording'"
      data-testid="header-record"
      @click="$emit('toggle-record')"
    >
      <UiIcon class="header-transport__icon" :name="recording ? 'stop' : 'record'" />
    </button>
    <span class="header-transport__divider" aria-hidden="true"></span>
    <button
      type="button"
      class="header-transport__btn header-transport__btn--stream"
      :class="{ 'header-transport__btn--active': streamOpen }"
      title="Stream destinations and status"
      aria-label="Stream dashboard"
      :aria-expanded="streamOpen ? 'true' : 'false'"
      data-testid="header-stream"
      @click="$emit('toggle-stream')"
    >
      <UiIcon class="header-transport__icon" name="broadcast" />
    </button>
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'

export default {
  name: 'HeaderTransport',
  components: { UiIcon },
  emits: ['play', 'pause', 'toggle-record', 'toggle-stream'],
  props: {
    playing: { type: Boolean, default: false },
    recording: { type: Boolean, default: false },
    streamOpen: { type: Boolean, default: false },
  },
}
</script>
