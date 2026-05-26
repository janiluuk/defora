<template>
  <div>
    <div class="sub-pills">
      <button class="sub-pill" :class="{active: currentSubTab.PROMPTS==='PROMPTS'}" @click="switchSubTab('PROMPTS','PROMPTS')">PROMPTS</button>
      <button class="sub-pill" :class="{active: currentSubTab.PROMPTS==='STORY'}" @click="switchSubTab('PROMPTS','STORY')">STORY</button>
      <button class="sub-pill" :class="{active: currentSubTab.PROMPTS==='CROSSFADER'}" @click="switchSubTab('PROMPTS','CROSSFADER')">CROSSFADER</button>
      <button class="sub-pill" :class="{active: currentSubTab.PROMPTS==='LORA'}" @click="switchSubTab('PROMPTS','LORA')">LORA</button>
      <button class="sub-pill" :class="{active: currentSubTab.PROMPTS==='CONTROLNET'}" @click="switchSubTab('PROMPTS','CONTROLNET')">CONTROLNET</button>
    </div>
    <div v-if="currentSubTab.PROMPTS==='PROMPTS'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">Prompt <span class="framesync-accent">Morphing</span></div>
            <div class="prompt-toolbar">
              <button class="framesync-button" :class="{active: prompts.morphOn}" @click="setMorph(true)">Enabled</button>
              <button class="framesync-button" :class="{active: !prompts.morphOn}" @click="setMorph(false)">Disabled</button>
              <button class="framesync-button" @click="morphCollapsed = !morphCollapsed">{{ morphCollapsed ? 'Show' : 'Hide' }}</button>
            </div>
          </div>

          <div v-if="!morphCollapsed">
            <div class="morph-blend-bar" style="margin-top:14px;">
              <div class="framesync-subtitle">Prompt morph blend</div>
              <div class="framesync-gradient-bar"></div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="prompts.morphBlend"
                class="framesync-input"
                data-testid="prompt-morph-blend"
                @input="onPromptMorphBlendInput"
              />
              <div class="morph-blend-labels">
                <span>A {{ ((1 - prompts.morphBlend) * 100).toFixed(0) }}%</span>
                <span>B {{ (prompts.morphBlend * 100).toFixed(0) }}%</span>
              </div>
            </div>
            <div v-if="prompts.morphOn" class="morph-slot-weights" style="margin-top:12px;">
              <div
                v-for="slot in morphSlots"
                :key="'mw-' + slot.id"
                class="morph-slot-weight-row"
                :class="{ inactive: !slot.on || !morphSlotInRange(slot) }"
              >
                <label class="morph-slot-weight-name">
                  <input type="checkbox" v-model="slot.on" @change="applyPromptMorphing" />
                  {{ slot.name }}
                </label>
                <span class="morph-slot-range">{{ slot.range }}</span>
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
                <div class="morph-slot-editor">
                  <label class="morph-slot-editor__field">
                    <span class="morph-slot-editor__label">A phrase</span>
                    <input
                      type="text"
                      v-model.trim="slot.a"
                      class="framesync-input morph-slot-editor__input"
                      :disabled="!slot.on"
                      @input="onMorphSlotPhraseInput(slot)"
                    />
                  </label>
                  <label class="morph-slot-editor__field">
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
            <div class="framesync-title">img2img <span class="framesync-accent">(Forge)</span></div>
            <button class="framesync-button" @click="img2img.show = !img2img.show">{{ img2img.show ? 'Hide' : 'Show' }}</button>
          </div>
          <div v-if="img2img.show">
            <div class="framesync-subtitle" style="margin-top:8px;">
              Reference image → <code>/api/img2img</code> (SD-Forge). Optional <strong>mask</strong> enables inpainting (white = repaint, black = keep). Output under <code>/uploads/</code>.
            </div>
            <div class="framesync-row" style="grid-template-columns: 1fr 1fr; gap:10px; margin-top:12px;">
              <div class="framesync-stack">
                <div class="framesync-subtitle">Reference image</div>
                <input type="file" accept="image/*" @change="onImg2imgFile" class="framesync-input">
              </div>
              <div class="framesync-stack">
                <div class="framesync-subtitle">Mask image (optional)</div>
                <input type="file" accept="image/*" @change="onImg2imgMaskFile" class="framesync-input">
              </div>
            </div>
            <div class="framesync-row" style="grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-top:10px;">
              <div class="framesync-stack">
                <div class="framesync-subtitle">Mask blur</div>
                <input type="number" class="framesync-input" v-model.number="img2img.maskBlur" min="0" max="64">
              </div>
              <div class="framesync-stack">
                <div class="framesync-subtitle">Inpainting fill</div>
                <select class="framesync-select" v-model.number="img2img.inpaintingFill">
                  <option value="0">Fill</option>
                  <option value="1">Original</option>
                  <option value="2">Latent noise</option>
                  <option value="3">Latent nothing</option>
                </select>
              </div>
              <div class="framesync-stack">
                <div class="framesync-subtitle">Denoising strength</div>
                <input type="number" class="framesync-input" v-model.number="img2img.denoisingStrength" min="0" max="1" step="0.01">
              </div>
            </div>
            <div class="framesync-footer" style="margin-top:10px;">
              <button class="framesync-button" @click="runImg2img">Run img2img</button>
            </div>
            <div v-if="img2img.status" class="framesync-subtitle" style="margin-top:8px; text-align:center;">{{ img2img.status }}</div>
            <div v-if="img2img.lastPath" class="framesync-subtitle" style="margin-top:4px; text-align:center;">
              Output: <a :href="img2img.lastPath" target="_blank" style="color:var(--warn);">{{ img2img.lastPath }}</a>
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

    <div v-else-if="currentSubTab.PROMPTS==='STORY'">
      <div class="rack generate-story">
        <div class="framesync-panel generate-story__panel">
          <div class="framesync-header">
            <div class="framesync-title">Story <span class="framesync-accent">Generator</span></div>
            <button class="framesync-button generate-story__hero-action" :disabled="generator.isGenerating" @click="generateStory">
              {{ generator.isGenerating ? 'Generating…' : 'Generate Story' }}
            </button>
          </div>
          <div class="framesync-stack generate-story__field">
            <div class="framesync-subtitle">Theme / Story concept</div>
            <input class="framesync-input" v-model="generator.theme" placeholder="e.g. A Space Traveler, Ancient Forest, Cyberpunk City…">
          </div>
          <div class="generate-story__grid">
            <div class="framesync-stack">
              <div class="framesync-subtitle">Style preset</div>
              <select class="framesync-select" v-model="generator.stylePreset">
                <option value="Masterpiece, Realistic">Masterpiece Realistic</option>
                <option value="Masterpiece, Cinematic">Cinematic</option>
                <option value="Masterpiece, best quality, anime">Anime</option>
                <option value="oil painting, impressionism">Oil Painting</option>
                <option value="digital art, concept art, surrealistic">Surrealist</option>
                <option value="watercolor, illustration">Watercolor</option>
                <option value="custom">Custom…</option>
              </select>
            </div>
            <div class="framesync-stack" v-if="generator.stylePreset === 'custom'">
              <div class="framesync-subtitle">Custom style</div>
              <input class="framesync-input" v-model="generator.customStyle" placeholder="your style keywords">
            </div>
          </div>
          <div class="framesync-subtitle" style="margin-top:10px;">Story engine: {{ storyGeneratorSourceLabel }}</div>
          <div class="framesync-footer generate-story__actions">
            <button class="framesync-button" @click="generateStory">Generate Story</button>
            <button class="framesync-button" @click="generateImage">Generate Image</button>
          </div>
          <div v-if="generator.status" class="generate-story__status">{{ generator.status }}</div>
          <div v-if="generator.result" class="generate-story__story-result">
            <div class="framesync-header">
              <div class="framesync-subtitle" style="margin:0;">Story plan</div>
              <span class="pill" v-if="generator.result.source && generator.result.source.model">{{ generator.result.source.model }}</span>
            </div>
            <pre class="generate-story__story-text">{{ generator.result.formatted }}</pre>
            <div class="framesync-footer generate-story__actions">
              <button class="framesync-button" @click="approveStory">Apply to prompts</button>
              <button class="framesync-button" @click="rejectStory">Discard</button>
            </div>
          </div>
          <div v-if="generator.lastPath" class="generate-story__result">
            <div class="framesync-header">
              <div class="framesync-subtitle" style="margin:0;">Result</div>
              <button class="framesync-button" @click="storyResultCollapsed = !storyResultCollapsed">{{ storyResultCollapsed ? 'Show' : 'Hide' }}</button>
            </div>
            <div v-if="!storyResultCollapsed" class="generate-story__image-wrap">
              <img v-if="generator.lastPath" :src="generator.lastPath" class="generate-story__image">
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.PROMPTS==='CROSSFADER'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">LoRA <span class="framesync-accent">Crossfader</span></div>
            <div class="prompt-toolbar">
              <span class="pill" :class="{ danger: !loraCrossfaderEnabled }">
                <span class="dot"></span>{{ loraCrossfaderStatusLabel }}
              </span>
              <button class="framesync-button" @click="loraCrossfaderCollapsed = !loraCrossfaderCollapsed">{{ loraCrossfaderCollapsed ? 'Show' : 'Hide' }}</button>
            </div>
          </div>
          <div class="lora-crossfader-shell">
            <div class="framesync-subtitle lora-crossfader-summary__status">{{ loraCrossfaderSummary }}</div>
            <div v-if="!loraCrossfaderCollapsed" class="prompt-ab-summary">
              <div class="prompt-ab-column prompt-ab-column--a">
                <div class="prompt-ab-column__title">A Group</div>
                <div v-for="lora in loras.groupA.slice(0, 3)" :key="'xfa-'+lora.id" class="prompt-ab-card">
                  <div class="prompt-ab-card__name">{{ lora.name }}</div>
                  <input type="range" min="0" max="2" step="0.01" :value="lora.strength" @input="lora.strength=parseFloat($event.target.value)" class="framesync-input prompt-ab-card__slider">
                  <div class="prompt-ab-card__value">{{ lora.strength.toFixed(2) }}</div>
                </div>
                <div v-if="loras.groupA.length === 0" class="prompt-ab-column__empty">
                  No LoRAs in A group
                </div>
                <div v-else-if="loras.groupA.length > 3" class="prompt-ab-column__more">
                  +{{ loras.groupA.length - 3 }} more
                </div>
              </div>

              <div class="framesync-stack prompt-ab-center">
                <div class="framesync-subtitle">Crossfader</div>
                <div class="framesync-gradient-bar"></div>
                <input type="range" min="0" max="1" step="0.01" :value="prompts.crossfaderValue" @input="prompts.crossfaderValue=parseFloat($event.target.value)" class="framesync-input" style="margin-top:8px;">
                <div class="prompt-ab-center__labels">
                  <span class="prompt-ab-center__label prompt-ab-center__label--a">A: {{ ((1-prompts.crossfaderValue)*100).toFixed(0) }}%</span>
                  <span class="prompt-ab-center__label prompt-ab-center__label--b">B: {{ (prompts.crossfaderValue*100).toFixed(0) }}%</span>
                </div>
              </div>

              <div class="prompt-ab-column prompt-ab-column--b">
                <div class="prompt-ab-column__title">B Group</div>
                <div v-for="lora in loras.groupB.slice(0, 3)" :key="'xfb-'+lora.id" class="prompt-ab-card">
                  <div class="prompt-ab-card__name">{{ lora.name }}</div>
                  <input type="range" min="0" max="2" step="0.01" :value="lora.strength" @input="lora.strength=parseFloat($event.target.value)" class="framesync-input prompt-ab-card__slider">
                  <div class="prompt-ab-card__value">{{ lora.strength.toFixed(2) }}</div>
                </div>
                <div v-if="loras.groupB.length === 0" class="prompt-ab-column__empty">
                  No LoRAs in B group
                </div>
                <div v-else-if="loras.groupB.length > 3" class="prompt-ab-column__more">
                  +{{ loras.groupB.length - 3 }} more
                </div>
              </div>
            </div>
            <div v-if="!loraCrossfaderCollapsed" class="framesync-footer" style="margin-top:12px;">
              <button class="framesync-button" @click="applyLoras">Apply LoRAs</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="currentSubTab.PROMPTS==='LORA'">
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">LoRA <span class="framesync-accent">Browser</span></div>
            <div class="prompt-toolbar">
              <span class="source" v-if="loras.source" style="font-size:10px;">
                <span v-if="loras.source==='sd-forge'" style="color:var(--success);">● Forge</span>
                <span v-else-if="loras.source==='cache'" style="color:var(--warn);">● Cache</span>
                <span v-else-if="loras.source==='placeholder'" style="color:var(--error);">● Placeholder</span>
                <span v-else style="color:var(--text-dim);">● {{ loras.source }}</span>
              </span>
              <button class="framesync-button" @click="refreshLoras">Refresh</button>
            </div>
          </div>
          <div class="lora-browser-grid">
            <div v-for="lora in loras.available" :key="lora.id"
                 class="lora-card"
                 @click="toggleLoraSelection(lora)">
              <div class="lora-card__media">
                <img v-if="lora.thumbnail" :src="lora.thumbnail" class="lora-card__thumb" :alt="lora.name" />
                <div v-else class="lora-card__placeholder">
                  <svg viewBox="0 0 24 24" style="width:48px; height:48px; opacity:0.3;" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" rx="2"/>
                    <circle cx="8" cy="8" r="2" fill="currentColor"/>
                    <path d="M3 15 L8 10 L12 14 L17 9 L21 13 V21 H3 Z" fill="currentColor" opacity="0.5"/>
                  </svg>
                </div>
                <div v-if="lora.selected" class="lora-card__selected" :class="lora.group === 'A' ? 'lora-card__selected--a' : 'lora-card__selected--b'">
                  {{ lora.group }}
                </div>
              </div>
              <div class="lora-card__body">
                <div class="lora-card__title">
                  {{ lora.name }}
                </div>
                <div class="lora-card__path">
                  {{ lora.path }}
                </div>
                <div class="framesync-stack">
                  <div class="framesync-subtitle">Strength</div>
                  <input type="range" min="0" max="2" step="0.01" :value="lora.strength" @input="lora.strength=parseFloat($event.target.value)" class="framesync-input">
                  <div class="lora-card__strength">{{ lora.strength.toFixed(2) }}</div>
                </div>
                <div class="lora-card__actions">
                  <button class="framesync-button prompt-group-button prompt-group-button--a" :class="{active: lora.group==='A'}" @click.stop="assignLoraToGroup(lora,'A')">Assign A</button>
                  <button class="framesync-button prompt-group-button prompt-group-button--b" :class="{active: lora.group==='B'}" @click.stop="assignLoraToGroup(lora,'B')">Assign B</button>
                  <button class="framesync-button" v-if="lora.group" @click.stop="unassignLora(lora)">Remove</button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="loras.available.length === 0" style="margin-top:20px; text-align:center; color:var(--text-dim); font-size:12px;">
            No LoRA models found. Refresh or check SD-Forge connection.
          </div>
        </div>
      </div>
      <div class="rack">
        <div class="framesync-panel">
          <div class="framesync-header">
            <div class="framesync-title">Active <span class="framesync-accent">LoRAs</span></div>
          </div>
          <div class="lora-active-groups">
            <div class="lora-active-group lora-active-group--a">
              <div class="lora-active-group__title">A Group ({{ loras.groupA.length }})</div>
              <div class="lora-active-group__body">
                <div v-for="lora in loras.groupA" :key="lora.id"
                     class="lora-active-group__row">
                  <span class="lora-active-group__name">{{ lora.name }}</span>
                  <span class="lora-active-group__value">{{ lora.strength.toFixed(2) }}</span>
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
                  <span class="lora-active-group__name">{{ lora.name }}</span>
                  <span class="lora-active-group__value">{{ lora.strength.toFixed(2) }}</span>
                </div>
                <div v-if="loras.groupB.length === 0" class="lora-active-group__empty">
                  No LoRAs in B group
                </div>
              </div>
            </div>
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
          <div class="framesync-footer" style="margin-top:12px;">
            <button class="framesync-button" v-for="slot in cn.slots" :key="slot.id" :class="{active: cn.active===slot.id}" @click="cn.active=slot.id">{{ slot.label }}</button>
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
              <option v-for="m in cn.availableModels" :key="m.id" :value="m.name">{{ m.name }}</option>
            </select>
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
