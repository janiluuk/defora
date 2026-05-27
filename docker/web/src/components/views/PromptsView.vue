<template>
  <div>
    <div class="sub-pills">
      <button class="sub-pill" :class="{active: currentSubTab.PROMPTS==='PROMPTS'}" @click="switchSubTab('PROMPTS','PROMPTS')">PROMPTS</button>
      <button class="sub-pill" :class="{active: currentSubTab.PROMPTS==='IMAGE'}" @click="switchSubTab('PROMPTS','IMAGE')">IMAGE</button>
      <button class="sub-pill" :class="{active: currentSubTab.PROMPTS==='LORA'}" @click="switchSubTab('PROMPTS','LORA')">LORA</button>
      <button class="sub-pill" :class="{active: currentSubTab.PROMPTS==='CONTROLNET'}" @click="switchSubTab('PROMPTS','CONTROLNET')">CONTROLNET</button>
      <button class="sub-pill" :class="{active: currentSubTab.PROMPTS==='STORY'}" @click="switchSubTab('PROMPTS','STORY')">STORY</button>
    </div>
    <div v-if="currentSubTab.PROMPTS==='PROMPTS'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">Prompt <span class="framesync-accent">Morphing</span></div>
            <div class="prompt-toolbar">
              <button class="framesync-button" :class="{ 'framesync-button--live': prompts.morphOn }" @click="setMorph(true)">Enabled</button>
              <button class="framesync-button" :class="{active: !prompts.morphOn}" @click="setMorph(false)">Disabled</button>
              <button class="framesync-button" @click="morphCollapsed = !morphCollapsed">{{ morphCollapsed ? 'Expand' : 'Collapse' }}</button>
            </div>
          </div>

          <div v-if="morphCollapsed && prompts.morphOn" class="morph-crossfader-mini" data-testid="prompt-morph-mini">
            <div class="framesync-subtitle" style="margin:0;">Morph Crossfader</div>
            <div class="framesync-gradient-bar"></div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              :value="prompts.morphBlend"
              class="framesync-input"
              data-testid="prompt-morph-blend"
              @input="applyPromptMorphBlend($event.target.value, { commitBase: true })"
            />
            <div class="morph-blend-labels">
              <span>A {{ ((1 - prompts.morphBlend) * 100).toFixed(0) }}%</span>
              <span>B {{ (prompts.morphBlend * 100).toFixed(0) }}%</span>
            </div>
            <button type="button" class="framesync-button framesync-button--compact" @click="morphCollapsed = false">Expand</button>
          </div>

          <div v-else-if="!morphCollapsed">
            <div class="morph-crossfader-panel">
              <div class="framesync-header">
                <div class="framesync-title">Morph <span class="framesync-accent">Crossfader</span></div>
                <div class="prompt-toolbar morph-crossfader-links">
                  <button
                    class="framesync-button"
                    :class="{ active: !promptMorphBlendLinkedLfo }"
                    @click="setPromptMorphBlendLfoLink(null)"
                  >
                    Manual
                  </button>
                  <button
                    v-for="lfo in lfos.slice(0, 4)"
                    :key="'morph-lfo-link-' + lfo.id"
                    class="framesync-button"
                    :class="{ active: prompts.morphBlendLfoLink === lfo.id }"
                    @click="setPromptMorphBlendLfoLink(lfo.id)"
                  >
                    {{ 'LFO ' + lfo.id }}
                  </button>
                </div>
              </div>
              <div class="morph-blend-bar" style="margin-top:14px;">
                <div class="framesync-subtitle">Prompt morph blend</div>
                <div class="framesync-gradient-bar"></div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  :value="prompts.morphBlend"
                  class="framesync-input"
                  data-testid="prompt-morph-blend"
                  :disabled="!prompts.morphOn"
                  @input="applyPromptMorphBlend($event.target.value, { commitBase: true })"
                />
                <div class="morph-blend-labels">
                  <span>A {{ ((1 - prompts.morphBlend) * 100).toFixed(0) }}%</span>
                  <span>B {{ (prompts.morphBlend * 100).toFixed(0) }}%</span>
                </div>
              </div>
              <div class="framesync-subtitle morph-crossfader-status">{{ promptMorphBlendLinkStatus }}</div>
            </div>
            <div v-if="prompts.morphOn" class="morph-slot-weights" style="margin-top:12px;">
              <div
                v-for="slot in morphSlots"
                :key="'mw-' + slot.id"
                class="morph-slot-weight-row"
                :class="{
                  inactive: !slot.on,
                  'morph-slot-weight-row--flowing': slot.on && morphSlotInRange(slot),
                  'morph-slot-weight-row--waiting': slot.on && !morphSlotInRange(slot)
                }"
                :style="{ '--morph-flow-progress': `${(morphBlendInSlotRange(slot) * 100).toFixed(1)}%` }"
              >
                <div class="morph-slot-head">
                  <label class="framesync-checkbox morph-slot-weight-name">
                    <input type="checkbox" v-model="slot.on" @change="applyPromptMorphing" />
                    {{ slot.name }}
                  </label>
                  <div class="morph-slot-meta">
                    <span class="morph-slot-chip morph-slot-chip--range">{{ slot.range }}</span>
                    <span class="morph-slot-chip morph-slot-chip--weight">Weight {{ slot.weight.toFixed(2) }}</span>
                    <span class="morph-slot-chip" :class="slot.on && morphSlotInRange(slot) ? 'morph-slot-chip--active' : 'morph-slot-chip--idle'">
                      {{ slot.on ? (morphSlotInRange(slot) ? 'Flowing' : 'Waiting') : 'Muted' }}
                    </span>
                  </div>
                </div>
                <div class="morph-slot-flow">
                  <label class="morph-slot-lane morph-slot-lane--a">
                    <span class="morph-slot-editor__label">A phrase</span>
                    <input
                      type="text"
                      v-model.trim="slot.a"
                      class="framesync-input morph-slot-editor__input"
                      :disabled="!slot.on"
                      @input="onMorphSlotPhraseInput(slot)"
                    />
                  </label>
                  <div class="morph-slot-flow__bridge">
                    <div class="morph-slot-flow__track">
                      <span class="morph-slot-flow__glow"></span>
                      <span class="morph-slot-flow__marker"></span>
                    </div>
                    <div class="morph-slot-flow__readout">
                      <span class="morph-slot-flow__mix">A {{ ((1 - prompts.morphBlend) * 100).toFixed(0) }}%</span>
                      <span class="morph-slot-flow__preview">{{ morphSlotPreview(slot) }}</span>
                      <span class="morph-slot-flow__mix morph-slot-flow__mix--b">B {{ (prompts.morphBlend * 100).toFixed(0) }}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      v-model.number="slot.weight"
                      class="framesync-input morph-slot-weight-slider"
                      :disabled="!slot.on"
                      @input="onMorphSlotWeightInput(slot)"
                    />
                  </div>
                  <label class="morph-slot-lane morph-slot-lane--b">
                    <span class="morph-slot-editor__label">B phrase</span>
                    <input
                      type="text"
                      v-model.trim="slot.b"
                      class="framesync-input morph-slot-editor__input"
                      :disabled="!slot.on"
                      @input="onMorphSlotPhraseInput(slot)"
                    />
                  </label>
                </div>
                <code class="morph-slot-preview">{{ morphSlotPreview(slot) }}</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">Plugins <span class="framesync-accent">Registry</span></div>
            <button class="framesync-button" @click="refreshPlugins">Refresh</button>
          </div>
          <ul v-if="pluginsRegistry.length" class="framesync-list" style="margin-top:4px; font-size:11px; padding-left:16px;">
            <li v-for="p in pluginsRegistry" :key="p.id || p.name">{{ p.name || p.id }}<span v-if="p.description"> — {{ p.description }}</span></li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.PROMPTS==='IMAGE'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">img2img <span class="framesync-accent">(Forge)</span></div>
            <button class="framesync-button" @click="img2img.show = !img2img.show">{{ img2img.show ? 'Hide' : 'Show' }}</button>
          </div>
          <div v-if="img2img.show" class="img2img-panel">
            <div class="framesync-subtitle img2img-panel__summary">
              Use an <strong>input image</strong> with optional <strong>mask</strong> for inpainting. Drag files into the boxes below or click to browse.
            </div>
            <div class="img2img-dropgrid">
              <label
                class="img2img-dropzone"
                :class="{ 'img2img-dropzone--filled': !!img2img.dataUrl }"
                @dragover.prevent
                @dragenter.prevent
                @drop.prevent="handleImg2imgDrop($event, 'input')"
              >
                <input type="file" accept="image/*" class="img2img-dropzone__input" @change="handleImg2imgFile">
                <div v-if="img2img.dataUrl" class="img2img-dropzone__preview">
                  <img :src="img2img.dataUrl" alt="Input preview" class="img2img-dropzone__image">
                </div>
                <div v-else class="img2img-dropzone__empty">
                  <div class="img2img-dropzone__title">Input image</div>
                  <div class="img2img-dropzone__hint">Drag and drop an image here</div>
                  <div class="img2img-dropzone__meta">or click to browse</div>
                </div>
              </label>
              <label
                class="img2img-dropzone img2img-dropzone--mask"
                :class="{ 'img2img-dropzone--filled': !!img2img.maskDataUrl }"
                @dragover.prevent
                @dragenter.prevent
                @drop.prevent="handleImg2imgDrop($event, 'mask')"
              >
                <input type="file" accept="image/*" class="img2img-dropzone__input" @change="handleImg2imgMask">
                <div v-if="img2img.maskDataUrl" class="img2img-dropzone__preview">
                  <img :src="img2img.maskDataUrl" alt="Mask preview" class="img2img-dropzone__image">
                </div>
                <div v-else class="img2img-dropzone__empty">
                  <div class="img2img-dropzone__title">Mask image</div>
                  <div class="img2img-dropzone__hint">Optional inpaint mask</div>
                  <div class="img2img-dropzone__meta">white repaints, black keeps</div>
                </div>
              </label>
            </div>
            <div class="img2img-dropgrid__actions">
              <button class="framesync-button" :disabled="!img2img.dataUrl" @click="clearImg2imgInput">Clear input</button>
              <button class="framesync-button" :disabled="!img2img.maskDataUrl" @click="clearImg2imgMask">Clear mask</button>
            </div>
            <div class="img2img-controls-grid">
              <div class="img2img-control-card img2img-control-card--primary">
                <div class="framesync-subtitle">Denoising strength</div>
                <div class="img2img-control-card__value">{{ img2img.denoisingStrength.toFixed(2) }}</div>
                <input type="range" min="0" max="1" step="0.01" :value="img2img.denoisingStrength" class="framesync-input img2img-control-card__slider" @input="img2img.denoisingStrength=parseFloat($event.target.value)">
              </div>
              <div class="img2img-control-card">
                <div class="framesync-subtitle">Width</div>
                <input type="number" class="framesync-input img2img-control-card__input" v-model.number="img2img.width" min="64" max="2048" step="64">
              </div>
              <div class="img2img-control-card">
                <div class="framesync-subtitle">Height</div>
                <input type="number" class="framesync-input img2img-control-card__input" v-model.number="img2img.height" min="64" max="2048" step="64">
              </div>
              <div v-if="img2img.maskDataUrl" class="img2img-control-card">
                <div class="framesync-subtitle">Mask blur</div>
                <div class="img2img-control-card__value">{{ img2img.maskBlur }}</div>
                <input type="range" min="0" max="64" step="1" :value="img2img.maskBlur" class="framesync-input img2img-control-card__slider" @input="img2img.maskBlur=parseInt($event.target.value, 10)">
              </div>
              <div v-if="img2img.maskDataUrl" class="img2img-control-card">
                <div class="framesync-subtitle">Inpainting fill</div>
                <select class="framesync-select img2img-control-card__input" v-model.number="img2img.inpaintingFill">
                  <option value="0">Fill</option>
                  <option value="1">Original</option>
                  <option value="2">Latent noise</option>
                  <option value="3">Latent nothing</option>
                </select>
              </div>
              <div v-if="img2img.maskDataUrl" class="img2img-control-card">
                <div class="framesync-subtitle">Masked area</div>
                <div class="framesync-buttons">
                  <button class="framesync-button" :class="{active: img2img.inpaintFullRes}" @click="img2img.inpaintFullRes = true">Full res</button>
                  <button class="framesync-button" :class="{active: !img2img.inpaintFullRes}" @click="img2img.inpaintFullRes = false">Whole image</button>
                </div>
              </div>
            </div>
            <div class="framesync-footer img2img-panel__actions">
              <button class="framesync-button" @click="runImg2img">{{ img2img.loading ? 'Running…' : 'Run img2img' }}</button>
            </div>
            <div v-if="img2img.status" class="framesync-subtitle img2img-panel__status">{{ img2img.status }}</div>
            <div v-if="img2img.lastPath" class="framesync-subtitle img2img-panel__output">
              Output: <a :href="img2img.lastPath" target="_blank" style="color:var(--warn);">{{ img2img.lastPath }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.PROMPTS==='STORY'">
      <div class="rack generate-story">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">Story <span class="framesync-accent">Generator</span></div>
            <span
              class="generate-sequencer__status"
              :class="{ 'generate-sequencer__status--live': storyGeneratorStatusLive }"
            >
              {{ storyGeneratorStatusLabel }}
            </span>
          </div>

          <p class="generate-sequencer__live-hint">
            Builds scene prompts and motion keyframes from your theme. Configure
            <button type="button" class="generate-sequencer__live-link" @click="switchTab('SETTINGS'); switchSubTab('SETTINGS', 'GPUS')">Ollama nodes</button>
            in Settings → GPUs for LLM-backed plans, or use the local fallback engine.
          </p>

          <div class="generate-sequencer__hero-grid">
            <div class="generate-sequencer__hero-card">
              <div class="framesync-subtitle">Scenes</div>
              <div class="generate-sequencer__hero-value">{{ storyGeneratorSceneCount }}</div>
              <div class="generate-sequencer__hero-meta">{{ storyGeneratorSceneMeta }}</div>
            </div>
            <div class="generate-sequencer__hero-card">
              <div class="framesync-subtitle">Frames</div>
              <div class="generate-sequencer__hero-value">{{ storyGeneratorFrameCount }}</div>
              <div class="generate-sequencer__hero-meta">{{ storyGeneratorTimelineMeta }}</div>
            </div>
            <div class="generate-sequencer__hero-card">
              <div class="framesync-subtitle">Resolution</div>
              <div class="generate-sequencer__hero-value generate-sequencer__hero-value--compact">{{ storyGeneratorResolutionLabel }}</div>
              <div class="generate-sequencer__hero-meta">From Deforum timeline settings</div>
            </div>
            <div class="generate-sequencer__hero-card">
              <div class="framesync-subtitle">Engine</div>
              <div class="generate-sequencer__hero-value generate-sequencer__hero-value--status generate-sequencer__hero-value--compact">{{ storyGeneratorSourceLabel }}</div>
              <div class="generate-sequencer__hero-meta">{{ availableOllamaNodes.length ? `${availableOllamaNodes.length} Ollama node(s) ready` : 'Local template fallback' }}</div>
            </div>
          </div>

          <div class="generate-story__config">
            <label class="framesync-stack generate-story__theme-field">
              <div class="framesync-subtitle">Theme / story concept</div>
              <input
                class="framesync-input generate-story__theme-input"
                v-model="generator.theme"
                placeholder="e.g. A Space Traveler, Ancient Forest, Cyberpunk City…"
              >
            </label>

            <div class="img2img-controls-grid generate-story__controls-grid">
              <div class="img2img-control-card img2img-control-card--primary">
                <div class="framesync-subtitle">Style preset</div>
                <select class="framesync-select img2img-control-card__input" v-model="generator.stylePreset">
                  <option value="Masterpiece, Realistic">Masterpiece Realistic</option>
                  <option value="Masterpiece, Cinematic">Cinematic</option>
                  <option value="Masterpiece, best quality, anime">Anime</option>
                  <option value="oil painting, impressionism">Oil Painting</option>
                  <option value="digital art, concept art, surrealistic">Surrealist</option>
                  <option value="watercolor, illustration">Watercolor</option>
                  <option value="custom">Custom…</option>
                </select>
              </div>
              <div v-if="generator.stylePreset === 'custom'" class="img2img-control-card">
                <div class="framesync-subtitle">Custom style</div>
                <input class="framesync-input img2img-control-card__input" v-model="generator.customStyle" placeholder="Your style keywords">
              </div>
              <div class="img2img-control-card">
                <div class="framesync-subtitle">Scene count</div>
                <div class="img2img-control-card__value">{{ storyGeneratorSceneCount }}</div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="1"
                  :value="generator.numScenes"
                  class="framesync-input img2img-control-card__slider"
                  @input="generator.numScenes = parseInt($event.target.value, 10)"
                >
              </div>
              <div class="img2img-control-card">
                <div class="framesync-subtitle">FPS</div>
                <input type="number" class="framesync-input img2img-control-card__input" v-model.number="generator.fps" min="1" max="60" step="1">
              </div>
              <div class="img2img-control-card">
                <div class="framesync-subtitle">Total frames</div>
                <input type="number" class="framesync-input img2img-control-card__input" v-model.number="generator.totalFrames" min="24" max="9999" step="1">
              </div>
            </div>
          </div>

          <div class="prompt-toolbar generate-story__actions">
            <button
              type="button"
              class="framesync-button framesync-button--live"
              :disabled="generator.isGenerating"
              @click="generateStory"
            >
              {{ generator.isGenerating ? 'Generating…' : 'Generate Story' }}
            </button>
            <button type="button" class="framesync-button" :disabled="generator.isGenerating" @click="generateImage">Generate Image</button>
          </div>

          <div v-if="generator.status" class="generate-sequencer__status-text">{{ generator.status }}</div>

          <div v-if="generator.result" class="generate-story__story-result">
            <div class="framesync-header">
              <div class="framesync-subtitle generate-story__section-title">Story plan</div>
              <span class="pill" v-if="generator.result.source && generator.result.source.model">{{ generator.result.source.model }}</span>
            </div>
            <pre class="generate-story__story-text">{{ generator.result.formatted }}</pre>
            <div class="prompt-toolbar generate-story__actions">
              <button type="button" class="framesync-button framesync-button--live" @click="approveStory">Apply to prompts</button>
              <button type="button" class="framesync-button" @click="rejectStory">Discard</button>
            </div>
          </div>

          <div v-if="generator.lastPath" class="generate-story__preview">
            <div class="framesync-header">
              <div class="framesync-subtitle generate-story__section-title">Preview image</div>
              <button type="button" class="framesync-button framesync-button--compact" @click="storyResultCollapsed = !storyResultCollapsed">
                {{ storyResultCollapsed ? 'Show' : 'Hide' }}
              </button>
            </div>
            <div v-if="!storyResultCollapsed" class="generate-story__image-wrap">
              <img :src="generator.lastPath" alt="Story preview" class="generate-story__image">
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.PROMPTS==='LORA'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">Active <span class="framesync-accent">LoRAs</span></div>
            <div class="prompt-toolbar">
              <span class="lora-family-pill">{{ currentLoraModelFamilyLabel }}</span>
              <span class="source" v-if="loras.source" style="font-size:10px;">
                <span v-if="loras.source==='sd-forge'" style="color:var(--success);">● Forge</span>
                <span v-else-if="loras.source==='cache'" style="color:var(--warn);">● Cache</span>
                <span v-else-if="loras.source==='placeholder'" style="color:var(--error);">● Placeholder</span>
                <span v-else style="color:var(--text-dim);">● {{ loras.source }}</span>
              </span>
              <button class="framesync-button" @click="refreshLoras">Refresh</button>
              <button class="framesync-button lora-picker-trigger" @click="loraPickerOpen = !loraPickerOpen">{{ loraPickerOpen ? 'Close' : '+' }}</button>
            </div>
          </div>
          <div v-if="loraPickerOpen" class="lora-picker-panel">
            <div class="framesync-subtitle lora-browser-summary">
              <span v-if="currentLoraModelFamily">Select from {{ currentLoraModelFamilyLabel }}-compatible LoRAs and assign them to Common, A, or B.</span>
              <span v-else>Select from the compatible LoRA list and assign them to Common, A, or B.</span>
            </div>
            <div class="lora-picker-families">
              <section v-for="family in compatibleLoraFamilies" :key="'picker-' + family.key" class="lora-picker-family">
                <div class="lora-picker-family__title">{{ family.label }}</div>
                <div class="lora-picker-list">
                  <div v-for="lora in family.items" :key="lora.id" class="lora-picker-row">
                    <div class="lora-picker-row__copy">
                      <div class="lora-picker-row__name">{{ lora.name }}</div>
                      <div class="lora-picker-row__path">{{ lora.path }}</div>
                    </div>
                    <div class="lora-picker-row__actions">
                      <button class="framesync-button prompt-group-button prompt-group-button--common" :class="{active: lora.group==='COMMON'}" @click.stop="assignLoraToGroup(lora,'COMMON')">Common</button>
                      <button class="framesync-button prompt-group-button prompt-group-button--a" :class="{active: lora.group==='A'}" @click.stop="assignLoraToGroup(lora,'A')">A</button>
                      <button class="framesync-button prompt-group-button prompt-group-button--b" :class="{active: lora.group==='B'}" @click.stop="assignLoraToGroup(lora,'B')">B</button>
                      <button class="framesync-button" v-if="lora.group" @click.stop="unassignLora(lora)">Remove</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div v-if="!compatibleLoraFamilies.length" class="lora-picker-empty">
              <span v-if="currentLoraModelFamily">No {{ currentLoraModelFamilyLabel }} LoRAs found. Refresh or check SD-Forge connection.</span>
              <span v-else>No LoRA models found. Refresh or check SD-Forge connection.</span>
            </div>
          </div>
          <div class="lora-active-groups">
            <div class="lora-active-group lora-active-group--common">
              <div class="lora-active-group__title">Common Group ({{ loras.common.length }})</div>
              <div class="lora-active-group__body">
                <div v-for="lora in loras.common" :key="lora.id"
                     class="lora-active-group__row">
                  <div class="lora-active-group__copy">
                    <span class="lora-active-group__name">{{ lora.name }}</span>
                    <span class="lora-active-group__value">{{ lora.strength.toFixed(2) }}</span>
                  </div>
                  <input type="range" min="0" max="2" step="0.01" :value="lora.strength" class="framesync-input lora-active-group__slider" @input="updateGroupedLoraStrength('COMMON', lora, $event.target.value)">
                  <button type="button" class="framesync-button framesync-button--danger framesync-button--compact lora-active-group__remove" @click="unassignLora(lora)">Remove</button>
                </div>
                <div v-if="loras.common.length === 0" class="lora-active-group__empty">
                  No LoRAs in Common group
                </div>
              </div>
            </div>
            <div class="lora-active-group lora-active-group--a">
              <div class="lora-active-group__title">A Group ({{ loras.groupA.length }})</div>
              <div class="lora-active-group__body">
                <div v-for="lora in loras.groupA" :key="lora.id"
                     class="lora-active-group__row">
                  <div class="lora-active-group__copy">
                    <span class="lora-active-group__name">{{ lora.name }}</span>
                    <span class="lora-active-group__value">{{ lora.strength.toFixed(2) }}</span>
                  </div>
                  <input type="range" min="0" max="2" step="0.01" :value="lora.strength" class="framesync-input lora-active-group__slider" @input="updateGroupedLoraStrength('A', lora, $event.target.value)">
                  <button type="button" class="framesync-button framesync-button--danger framesync-button--compact lora-active-group__remove" @click="unassignLora(lora)">Remove</button>
                </div>
                <div v-if="loras.groupA.length === 0" class="lora-active-group__empty">
                  No LoRAs in A group
                </div>
              </div>
            </div>
            <div class="lora-active-group lora-active-group--b">
              <div class="lora-active-group__title">B Group ({{ loras.groupB.length }})</div>
              <div class="lora-active-group__body">
                <div v-for="lora in loras.groupB" :key="lora.id"
                     class="lora-active-group__row">
                  <div class="lora-active-group__copy">
                    <span class="lora-active-group__name">{{ lora.name }}</span>
                    <span class="lora-active-group__value">{{ lora.strength.toFixed(2) }}</span>
                  </div>
                  <input type="range" min="0" max="2" step="0.01" :value="lora.strength" class="framesync-input lora-active-group__slider" @input="updateGroupedLoraStrength('B', lora, $event.target.value)">
                  <button type="button" class="framesync-button framesync-button--danger framesync-button--compact lora-active-group__remove" @click="unassignLora(lora)">Remove</button>
                </div>
                <div v-if="loras.groupB.length === 0" class="lora-active-group__empty">
                  No LoRAs in B group
                </div>
              </div>
            </div>
          </div>
          <div class="lora-crossfader-inline">
            <div class="lora-crossfader-inline__header">
              <div class="framesync-title">LoRA <span class="framesync-accent">Crossfader</span></div>
              <div class="prompt-toolbar">
                <button
                  type="button"
                  class="framesync-button"
                  :class="{ 'framesync-button--live': prompts.loraCrossfaderOn }"
                  @click="setLoraCrossfaderOn(true)"
                >
                  Enabled
                </button>
                <button
                  type="button"
                  class="framesync-button"
                  :class="{ active: !prompts.loraCrossfaderOn }"
                  @click="setLoraCrossfaderOn(false)"
                >
                  Disabled
                </button>
              </div>
            </div>
            <div class="framesync-subtitle lora-crossfader-summary__status">{{ loraCrossfaderSummary }}</div>
            <div class="lora-crossfader-links" :class="{ 'lora-crossfader-links--disabled': !prompts.loraCrossfaderOn }">
              <button
                type="button"
                class="framesync-button"
                :class="{ active: !prompts.loraCrossfaderLfoLink }"
                @click="setLoraCrossfaderLfoLink(null)"
              >
                Manual
              </button>
              <button
                v-for="lfo in lfos.slice(0, 6)"
                :key="'lora-crossfader-inline-lfo-' + lfo.id"
                type="button"
                class="framesync-button"
                :class="{ active: prompts.loraCrossfaderLfoLink === lfo.id }"
                @click="setLoraCrossfaderLfoLink(lfo.id)"
              >
                LFO {{ lfo.id }}
              </button>
            </div>
            <div class="framesync-gradient-bar"></div>
            <input type="range" min="0" max="1" step="0.01" :value="prompts.crossfaderValue" :disabled="!prompts.loraCrossfaderOn" @input="applyLoraCrossfader($event.target.value)" class="framesync-input" style="margin-top:8px;">
            <div class="prompt-ab-center__labels">
              <span class="prompt-ab-center__label prompt-ab-center__label--a">A: {{ ((1-prompts.crossfaderValue)*100).toFixed(0) }}%</span>
              <span class="prompt-ab-center__label prompt-ab-center__label--b">B: {{ (prompts.crossfaderValue*100).toFixed(0) }}%</span>
            </div>
            <div class="lora-crossfader-status">{{ loraCrossfaderLinkStatus }}</div>
          </div>
          <div class="framesync-footer" style="margin-top:12px;">
            <button class="framesync-button" @click="applyLoras">Apply LoRAs</button>
            <button class="framesync-button" @click="exportLoraPreset">Export preset</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.PROMPTS==='CONTROLNET'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">ControlNet <span class="framesync-accent">Slots</span></div>
            <div class="prompt-toolbar">
              <span class="source" v-if="cn.source" style="font-size:10px;">
                <span v-if="cn.source==='sd-forge'" style="color:var(--success);">● Forge</span>
                <span v-else-if="cn.source==='cache'" style="color:var(--warn);">● Cache</span>
                <span v-else-if="cn.source==='placeholder'" style="color:var(--error);">● Placeholder</span>
                <span v-else style="color:var(--text-dim);">● {{ cn.source }}</span>
              </span>
              <button class="framesync-button" @click="loadControlNetModels">Refresh</button>
            </div>
          </div>
          <div class="controlnet-slot-strip" style="margin-top:12px; display:flex; flex-direction:column; gap:6px;">
            <div v-for="slot in cn.slots" :key="slot.id" class="controlnet-slot-row" style="display:flex; gap:6px; align-items:center;">
              <button class="framesync-button" style="flex:1;" :class="{active: cn.active===slot.id}" @click="cn.active=slot.id">{{ slot.label }}</button>
              <button class="framesync-button controlnet-slot-row__toggle" :class="{active: slot.enabled}" @click="slot.enabled=!slot.enabled; updateControlNet(slot)">{{ slot.enabled ? 'On' : 'Off' }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title"><span class="framesync-accent">{{ activeSlot.label }}</span> Settings</div>
          </div>
          <div class="framesync-stack" style="margin-top:12px;">
            <div class="framesync-subtitle">Model</div>
            <select class="framesync-select" v-model="activeSlot.model" @change="updateControlNet(activeSlot)">
              <option v-for="m in activeControlNetModelChoices" :key="m.id" :value="m.name">{{ m.name }}{{ m.current && m.incompatible ? ' (current, incompatible)' : m.current ? ' (current)' : '' }}</option>
            </select>
            <div class="framesync-subtitle" style="margin-top:4px;">{{ controlNetModelSummary }}</div>
          </div>
          <div class="framesync-stack" style="margin-top:12px;">
            <div class="framesync-subtitle">Image source</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" class="framesync-button" :class="{active: activeSlot.imageSource==='file'}" @click="activeSlot.imageSource='file'">File</button>
              <button type="button" class="framesync-button" :class="{active: activeSlot.imageSource==='webcam'}" @click="activeSlot.imageSource='webcam'">Webcam</button>
              <button type="button" class="framesync-button" :class="{active: activeSlot.imageSource==='screen'}" @click="activeSlot.imageSource='screen'">Screen</button>
            </div>
            <input ref="cnImageInput" type="file" accept="image/*" style="display:none;" @change="onControlNetFileSelected">
          </div>
          <div v-if="activeSlot.imageSource==='webcam'" class="framesync-stack" style="margin-top:12px;">
            <div class="framesync-subtitle">Webcam input</div>
            <video ref="webcamVideo" autoplay playsinline style="width:100%; max-width:320px; border-radius:6px; border:1px solid var(--border); display:none;"></video>
            <canvas ref="webcamCanvas" style="display:none;"></canvas>
            <div style="display:flex; gap:8px; margin-top:8px;">
              <button type="button" class="framesync-button" :class="{active: cn.webcamActive}" @click="toggleWebcam">{{ cn.webcamActive ? 'Stop' : 'Start' }} Webcam</button>
              <select class="framesync-input" v-model.number="webcamCaptureRate" style="max-width:120px; font-size:11px;">
                <option :value="1000">1 fps</option>
                <option :value="500">2 fps</option>
                <option :value="200">5 fps</option>
                <option :value="100">10 fps</option>
              </select>
            </div>
          </div>
          <div v-if="activeSlot.imageSource==='screen'" class="framesync-stack" style="margin-top:12px;">
            <div class="framesync-subtitle">Screen capture</div>
            <button type="button" class="framesync-button" @click="startScreenCapture">Start screen capture</button>
          </div>
          <div class="framesync-footer" style="margin-top:10px;">
            <button type="button" class="framesync-button" @click="uploadControlNetImage(activeSlot)">Upload image</button>
            <button type="button" class="framesync-button" :class="{active: activeSlot.enabled}" @click="activeSlot.enabled=!activeSlot.enabled; updateControlNet(activeSlot)">{{ activeSlot.enabled ? 'Enabled' : 'Disabled' }}</button>
          </div>
          <div class="framesync-stack" style="margin-top:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div class="framesync-subtitle">Weight</div>
              <span style="color:var(--text-primary); font-size:12px;">{{ activeSlot.weight.toFixed(2) }}</span>
            </div>
            <input type="range" min="0" max="2" step="0.01" v-model.number="activeSlot.weight" @input="updateControlNet(activeSlot)" class="framesync-input">
            <div class="controlnet-weight-card" style="margin-top:4px; font-size:11px; color:var(--text-secondary);">{{ controlNetWeightLabel }}</div>
          </div>
          <div class="framesync-stack" style="margin-top:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div class="framesync-subtitle">Start step</div>
              <span style="color:var(--text-primary); font-size:12px;">{{ activeSlot.start.toFixed(2) }}</span>
            </div>
            <input type="range" min="0" max="1" step="0.01" v-model.number="activeSlot.start" @input="updateControlNet(activeSlot)" class="framesync-input">
          </div>
          <div class="framesync-stack" style="margin-top:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div class="framesync-subtitle">End step</div>
              <span style="color:var(--text-primary); font-size:12px;">{{ activeSlot.end.toFixed(2) }}</span>
            </div>
            <input type="range" min="0" max="1" step="0.01" v-model.number="activeSlot.end" @input="updateControlNet(activeSlot)" class="framesync-input">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './app-view-proxy.js'

export default {
  name: 'PromptsView',
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
