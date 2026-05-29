<template>
  <div class="editor-shell framesync-panel" :data-testid="testId || 'editor-shell'">
    <div class="framesync-header editor-shell__header">
      <div class="editor-shell__titles">
        <div class="framesync-title">
          <span v-if="titleAccent">{{ titleAccent }}</span>
          <span v-if="titleAccent" class="framesync-accent">{{ titleRest }}</span>
          <span v-else class="framesync-accent">{{ title }}</span>
        </div>
        <span v-if="subtitle" class="framesync-subtitle editor-shell__subtitle">{{ subtitle }}</span>
      </div>
      <div v-if="$slots.actions" class="editor-shell__actions">
        <slot name="actions" />
      </div>
    </div>
    <div v-if="$slots.pills" class="editor-shell__pills sub-pills">
      <slot name="pills" />
    </div>
    <div v-if="status" class="editor-shell__status" :class="{ 'editor-shell__status--live': statusLive }">
      {{ status }}
    </div>
    <div class="editor-shell__body">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditorShell',
  props: {
    title: { type: String, default: 'Editor' },
    titleAccent: { type: String, default: '' },
    titleRest: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    status: { type: String, default: '' },
    statusLive: { type: Boolean, default: false },
    testId: { type: String, default: '' },
  },
}
</script>
