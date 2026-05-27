<template>
  <svg
    class="ui-icon"
    :class="`ui-icon--${name}`"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <template v-if="name === 'play'">
      <path d="M8 6.5V17.5L17 12L8 6.5Z" fill="currentColor" />
    </template>
    <template v-else-if="name === 'pause'">
      <rect x="7" y="6" width="3.5" height="12" rx="1" fill="currentColor" />
      <rect x="13.5" y="6" width="3.5" height="12" rx="1" fill="currentColor" />
    </template>
    <template v-else-if="name === 'stop'">
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor" />
    </template>
    <template v-else-if="name === 'record'">
      <circle cx="12" cy="12" r="5" fill="currentColor" />
    </template>
    <template v-else-if="name === 'image'">
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.8" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
      <path d="M6 16L10 12L13 14.8L16 11L18 13.5V17H6V16Z" fill="currentColor" opacity="0.9" />
    </template>
    <template v-else-if="name === 'broadcast'">
      <path d="M5 12C8.5 12 12 15.5 12 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M5 7C11.2 7 17 12.8 17 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M5 2C14 2 22 10 22 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="5" cy="19" r="2" fill="currentColor" />
    </template>
    <template v-else-if="name === 'sliders'">
      <path d="M6 5V19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M12 5V19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M18 5V19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="6" cy="9" r="2.2" fill="currentColor" />
      <circle cx="12" cy="15" r="2.2" fill="currentColor" />
      <circle cx="18" cy="11" r="2.2" fill="currentColor" />
    </template>
    <template v-else-if="name === 'film'">
      <rect x="5" y="4.5" width="14" height="15" rx="2" stroke="currentColor" stroke-width="1.8" />
      <path d="M9 4.5V19.5" stroke="currentColor" stroke-width="1.5" />
      <path d="M15 4.5V19.5" stroke="currentColor" stroke-width="1.5" />
      <path d="M5 8H19" stroke="currentColor" stroke-width="1.5" />
      <path d="M5 16H19" stroke="currentColor" stroke-width="1.5" />
    </template>
    <template v-else-if="name === 'folder'">
      <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h3.2l1.6 1.8H18A2.5 2.5 0 0 1 20.5 9.3v7.2A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M3.8 9h16.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'gear'">
      <path d="M12 8.2A3.8 3.8 0 1 0 12 15.8A3.8 3.8 0 1 0 12 8.2Z" stroke="currentColor" stroke-width="1.8" />
      <path d="M12 3.8V5.4M12 18.6V20.2M5.5 6.5L6.7 7.7M17.3 18.3L18.5 19.5M3.8 12H5.4M18.6 12H20.2M5.5 17.5L6.7 16.3M17.3 5.7L18.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'chevron-up'">
      <path d="M6 14L12 8L18 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <path d="M6 10L12 16L18 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="M7 7L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M17 7L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'shuffle'">
      <path d="M4 7H6.5C8.5 7 9.8 7.5 11.2 9.4L12.5 11.1C13.9 13 15.2 13.5 17.2 13.5H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M4 17H6.5C8.2 17 9.4 16.6 10.6 15.1L13.4 11.5C14.6 10 15.8 9.5 17.5 9.5H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M17 6.5L20 9.5L17 12.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M17 10.5L20 13.5L17 16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'sparkles'">
      <path d="M12 3.8L13.7 8.3L18.2 10L13.7 11.7L12 16.2L10.3 11.7L5.8 10L10.3 8.3L12 3.8Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
      <path d="M18.5 4.5L19.2 6.3L21 7L19.2 7.7L18.5 9.5L17.8 7.7L16 7L17.8 6.3L18.5 4.5Z" fill="currentColor" />
      <path d="M6 15.5L6.8 17.5L8.8 18.3L6.8 19.1L6 21.1L5.2 19.1L3.2 18.3L5.2 17.5L6 15.5Z" fill="currentColor" />
    </template>
    <template v-else-if="name === 'wave'">
      <path d="M3 13C4.4 13 4.8 8 6.3 8C7.8 8 8.2 16 9.7 16C11.2 16 11.6 5 13.1 5C14.6 5 15 19 16.5 19C18 19 18.4 11 19.9 11C20.7 11 21.3 12 21 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'gear'">
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.8" />
      <path d="M12 3.5V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M12 18V20.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M20.5 12H18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M6 12H3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M17.9 6.1L16.1 7.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M7.9 16.1L6.1 17.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M17.9 17.9L16.1 16.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M7.9 7.9L6.1 6.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'arrow-left'">
      <path d="M15.5 7.5L10.5 12L15.5 16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M11 12H19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'arrow-right'">
      <path d="M8.5 7.5L13.5 12L8.5 16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M13 12H5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </template>
  </svg>
</template>

<script>
export default {
  name: 'UiIcon',
  props: {
    name: { type: String, required: true },
  },
}
</script>

<style scoped>
.ui-icon {
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
