<template>
  <div class="styles-settings" data-testid="styles-settings-panel">
    <div class="rack">
      <div class="framesync-panel">
        <div class="framesync-header">
          <div class="framesync-title">Prompt <span class="framesync-accent">Styles</span></div>
          <div class="styles-settings__header-actions">
            <span class="styles-settings__count">{{ filteredPromptStyles.length }} / {{ promptStyles.length }}</span>
            <button
              type="button"
              class="framesync-button framesync-button--compact"
              :disabled="promptStylesLoading || promptStylesImporting"
              data-testid="prompt-styles-import-forge"
              @click="importPromptStylesFromForge()"
            >
              {{ promptStylesImporting ? 'Importing…' : 'Import from Forge' }}
            </button>
            <button type="button" class="framesync-button framesync-button--compact" @click="startNewPromptStyle()">
              + New style
            </button>
          </div>
        </div>
        <p class="framesync-subtitle styles-settings__intro">
          Select a style to edit its name, description, preview scene, and prompt modifiers.
          Missing preview images are generated with txt2img using the preview scene plus this style’s append text.
        </p>
        <div v-if="promptStylesStatus" class="framesync-subtitle styles-settings__status">{{ promptStylesStatus }}</div>
        <input
          v-model.trim="promptStyleSearch"
          type="search"
          class="framesync-input styles-settings__search"
          placeholder="Search styles…"
          data-testid="prompt-styles-search"
        />
      </div>
    </div>

    <div class="styles-settings__body">
      <div class="styles-settings__list rack">
        <button
          v-for="style in filteredPromptStyles"
          :key="style.id"
          type="button"
          class="styles-settings__item"
          :class="{
            active: promptStyleEditorId === style.id,
            selected: activePromptStyleId === style.id,
          }"
          :data-testid="'prompt-style-item-' + style.id"
          @click="openPromptStyleEditor(style.id)"
        >
          <div v-if="style.exampleImage" class="styles-settings__thumb">
            <img :src="style.exampleImage" :alt="style.name" loading="lazy" />
          </div>
          <div
            v-else-if="promptStylePreviewGeneratingId === style.id"
            class="styles-settings__thumb styles-settings__thumb--generating"
            aria-label="Generating preview"
          >
            <span class="styles-settings__thumb-label">Generating…</span>
          </div>
          <div v-else class="styles-settings__thumb styles-settings__thumb--empty" aria-hidden="true"></div>
          <div class="styles-settings__item-copy">
            <div class="styles-settings__item-title">{{ style.name }}</div>
            <div class="styles-settings__item-meta">
              {{ style.description || style.source || 'custom' }}
            </div>
          </div>
          <span v-if="activePromptStyleId === style.id" class="styles-settings__active-tag">Active</span>
        </button>
      </div>

      <div v-if="promptStyleDraft" class="styles-settings__editor rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">Style <span class="framesync-accent">editor</span></div>
            <div class="styles-settings__header-actions">
              <button
                type="button"
                class="framesync-button framesync-button--compact"
                :class="{ 'framesync-button--live': activePromptStyleId === promptStyleDraft.id }"
                data-testid="prompt-style-use-active"
                @click="selectActivePromptStyle(promptStyleDraft.id)"
              >
                {{ activePromptStyleId === promptStyleDraft.id ? 'Active on Prompts' : 'Use on Prompts' }}
              </button>
              <button
                v-if="activePromptStyleId === promptStyleDraft.id"
                type="button"
                class="framesync-button framesync-button--compact"
                @click="selectActivePromptStyle(null)"
              >
                Clear active
              </button>
            </div>
          </div>

          <div
            v-if="promptStylePreviewGeneratingId === promptStyleDraft.id"
            class="styles-settings__example-preview styles-settings__example-preview--generating"
          >
            <span class="framesync-subtitle">Generating preview with “{{ promptStyleDraftPreviewPrompt }}”…</span>
          </div>
          <div v-else-if="promptStyleDraft.exampleImage" class="styles-settings__example-preview">
            <img :src="promptStyleDraft.exampleImage" :alt="promptStyleDraft.name + ' example'" />
          </div>
          <div v-else class="styles-settings__example-preview styles-settings__example-preview--empty">
            <span class="framesync-subtitle">No preview yet — select this style to generate one automatically.</span>
          </div>

          <label class="styles-settings__field">
            <span class="framesync-subtitle">Name</span>
            <input v-model.trim="promptStyleDraft.name" type="text" class="framesync-input" data-testid="prompt-style-name" />
          </label>
          <label class="styles-settings__field">
            <span class="framesync-subtitle">Description</span>
            <textarea
              v-model="promptStyleDraft.description"
              class="framesync-input"
              rows="3"
              placeholder="What this style is for, mood, subject matter, references…"
              data-testid="prompt-style-description"
            ></textarea>
          </label>
          <label class="styles-settings__field">
            <span class="framesync-subtitle">Preview scene (txt2img)</span>
            <input
              v-model.trim="promptStyleDraft.previewPrompt"
              type="text"
              class="framesync-input"
              placeholder="bunny and cat in space"
              data-testid="prompt-style-preview-prompt"
            />
            <span class="framesync-subtitle styles-settings__field-hint">
              Base scene for the thumbnail; positive and negative append below are added when generating the preview.
            </span>
          </label>
          <label class="styles-settings__field">
            <span class="framesync-subtitle">Positive append</span>
            <textarea v-model="promptStyleDraft.positive" class="framesync-input" rows="3" data-testid="prompt-style-positive"></textarea>
          </label>
          <label class="styles-settings__field">
            <span class="framesync-subtitle">Negative append</span>
            <textarea v-model="promptStyleDraft.negative" class="framesync-input" rows="3" data-testid="prompt-style-negative"></textarea>
          </label>

          <div class="framesync-footer styles-settings__editor-actions">
            <button type="button" class="framesync-button" data-testid="prompt-style-save" @click="savePromptStyleDraft()">
              Save
            </button>
            <button
              type="button"
              class="framesync-button framesync-button--live"
              data-testid="prompt-style-generate-preview"
              :disabled="!!promptStylePreviewGeneratingId"
              @click="generatePromptStyleExample(promptStyleDraft.id)"
            >
              {{ promptStylePreviewGeneratingId === promptStyleDraft.id ? 'Generating…' : 'Generate preview' }}
            </button>
            <button
              type="button"
              class="framesync-button"
              :disabled="!performance.lastPreviewPath && !generator.lastPath"
              data-testid="prompt-style-example-from-preview"
              @click="setPromptStyleExampleFromPreview(promptStyleDraft.id)"
            >
              Example from last preview
            </button>
            <label class="framesync-button styles-settings__upload">
              Upload example
              <input type="file" accept="image/*" class="styles-settings__upload-input" @change="onPromptStyleExampleFile($event, promptStyleDraft.id)" />
            </label>
            <button
              v-if="promptStyleDraft.exampleImage"
              type="button"
              class="framesync-button"
              @click="clearPromptStyleExample(promptStyleDraft.id)"
            >
              Clear example
            </button>
            <button
              v-if="!promptStyles.find((s) => s.id === promptStyleDraft.id)"
              type="button"
              class="framesync-button"
              @click="promptStyleDraft = null; promptStyleEditorId = null"
            >
              Cancel
            </button>
            <button
              v-else
              type="button"
              class="framesync-button"
              data-testid="prompt-style-delete"
              @click="deletePromptStyle(promptStyleDraft.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './views/app-view-proxy.mjs'

export default {
  name: 'StylesSettingsPanel',
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>

<style scoped>
.styles-settings__field-hint {
  margin: 4px 0 0;
  font-size: 10px;
  line-height: 1.35;
}
</style>
