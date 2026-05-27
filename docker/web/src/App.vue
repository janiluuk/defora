<template>
  <div id="app">
    <div v-if="restoreSessionPromptOpen" class="restore-session-modal" @click.self="dismissSessionRestore(false)">
      <div class="restore-session-modal__dialog framesync-panel">
        <div class="framesync-header">
          <div class="framesync-title">Restore <span class="framesync-accent">last UI state</span>?</div>
        </div>
        <div class="framesync-subtitle" style="margin-top:8px;">
          Found a saved session state that doesn’t match the current UI defaults.
        </div>
        <div class="framesync-footer" style="margin-top:12px; gap:10px; justify-content:flex-end;">
          <button type="button" class="framesync-button" @click="dismissSessionRestore(false)">Discard</button>
          <button type="button" class="framesync-button framesync-button--live" @click="dismissSessionRestore(true)">Restore</button>
        </div>
      </div>
    </div>
    <header>
      <div class="tabs">
        <button
          class="tab"
          v-for="tab in tabs"
          :key="tab.id"
          :class="[ `tab--${tab.id.toLowerCase()}`, { active: currentTab === tab.id } ]"
          @click="switchTab(tab.id)"
        >
          <span class="tab__icon-wrap" aria-hidden="true">
            <UiIcon class="tab__icon" :name="tab.icon" />
          </span>
          <span class="tab__copy">
            <span class="tab__label">{{ tab.label }}</span>
            <span class="tab__hint">{{ tab.hint }}</span>
          </span>
        </button>
      </div>
      <StatusStrip
        :playing="deforumPlaying"
        :recording="isRecording"
        :preview-generating="previewGenerating"
        :preview-disabled="deforumPlaying"
        :api-health="apiHealth"
        :gpu-active-count="gpuActiveCount"
        :gpu-total-count="gpuTotalCount"
        :midi-supported="midi.supported"
        :midi-selected="midi.selected"
        :ws-status="wsStatus"
        :session="session"
        :sessions="sessionCatalog"
        @toggle-play="toggleDeforumPlay"
        @stop-play="stopDeforumPlay"
        @toggle-record="toggleStreamRecord"
        @generate-preview="generatePreviewFrame"
        @open-gpus="openGpuSettings"
        @toggle-ws="toggleCollaboration"
        @open-midi="openMidiSettings"
        @select-session="selectSession"
        @new-session="createNewSession"
        @purge-session="purgeSession"
        @restore-session="restoreSession"
      />
    </header>

    <div class="layout" :class="{
      'layout--live': currentTab === 'LIVE',
      'layout--stage': currentTab === 'MOTION',
      'layout--studio': currentTab === 'MODULATION'
    }">
      <!-- Left: video + mini timeline -->
      <div class="preview" :class="{
        'preview--stage-full': currentTab === 'LIVE' && videoStageSize === 'full'
      }">
        <div
          class="video-wrap"
          :class="{
            'video-wrap--live': currentTab === 'LIVE',
            'video-wrap--preview-loading': previewGenerating,
          }"
        >
          <div
            class="video-wrap__stage"
            :class="{
              'video-wrap__stage--preview': videoStageSize === 'small',
              'video-wrap__stage--canvas': videoStageSize === 'medium',
              'video-wrap__stage--full': videoStageSize === 'full',
            }"
          >
            <ThreeBackground
              ref="threeBackgroundRef"
              data-testid="preview-standby-animation"
              :class="['video-wrap__default-animation', { 'video-wrap__default-animation--visible': showDefaultAnimation }]"
              :lfos="lfos"
              :audio-metrics="backgroundAudioMetrics"
              :active-tab="currentTab"
              :morph="performance.crossfader"
              :settings="defaultAnimation"
            />
            <img
              v-if="showPreviewStill"
              :src="activePreviewStillPath"
              alt="Generated preview"
              class="video-still-preview"
            />
            <video
              :class="['video-feed', { 'video-feed--visible': showDeforumVideo, 'video-feed--blended': isBlendLayerActive && showDeforumVideo }]"
              id="player"
              ref="videoEl"
              autoplay
              muted
              playsinline
            ></video>
            <video
              ref="inputVideoEl"
              :class="['video-feed', 'video-layer-input-video', { 'video-feed--visible': showLayerInputVideo }]"
              muted
              playsinline
              controls
            ></video>
            <div
              v-if="isInputLayerActive && !activeLayerPlaybackUrl"
              class="video-layer-empty"
              data-testid="video-layer-input-empty"
            >
              <span class="video-layer-empty__title">Input layer</span>
              <span class="framesync-subtitle">Pick a video from the library or link a cloud source.</span>
              <button type="button" class="framesync-button" @click="toggleVideoLayerAdd(true)">+ Add source</button>
            </div>
            <div
              v-if="activeVideoLayer && activeVideoLayer.kind === 'cloud'"
              class="video-layer-empty video-layer-empty--cloud"
            >
              <span class="video-layer-empty__title">{{ activeVideoLayer.label }}</span>
              <span class="framesync-subtitle">Cloud links open externally until direct streaming is wired in.</span>
              <button type="button" class="framesync-button" @click="openCloudLayer(activeVideoLayer)">Open link</button>
            </div>
          <div
            v-if="previewGenerating"
            class="preview-loading-overlay"
            aria-live="polite"
            aria-busy="true"
          >
            <div class="preview-loading-overlay__card">
              <span class="lazy-loading-indicator lazy-loading-indicator--overlay">
                <span class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
                <span>Rendering preview frame</span>
                <span class="lazy-loading-indicator__dots" aria-hidden="true"><span></span><span></span><span></span></span>
              </span>
              <span class="preview-loading-overlay__hint">Updating the live window as soon as Forge returns a frame.</span>
            </div>
          </div>
          <div class="overlay">
            <div>
              <div class="timecode">{{ timecode }}</div>
              <div style="font-size:11px; color:var(--text-secondary);">Seed {{ hud.seed }}</div>
              <div style="font-size:11px; color:var(--text-secondary);">
                {{ currentProjectLabel }} · {{ currentBatchLabel }}
              </div>
              <div
                v-if="isDeforumLayerActive && deforumStreamFrameLabel"
                class="video-feed-frames"
                data-testid="deforum-stream-frame-count"
              >
                {{ deforumStreamFrameLabel }}
              </div>
            </div>
            <div style="display:flex; align-items:flex-start; gap:8px; text-align:right;">
              <div>
                <div>{{ masterFps }} fps</div>
                <div style="font-size:11px; color:var(--text-secondary);">lat {{ stats.lat }}ms</div>
                <div class="video-feed-status" :class="{ 'video-feed-status--ready': videoReady && isDeforumLayerActive, 'video-feed-status--selected': isDeforumLayerActive }">
                  {{ videoLayerStatusLabel }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="currentTab === 'LIVE' && pinnedParamItems.length" class="live-hud-strip live-hud-strip--pinned">
            <GlassPanel size="sm" class="live-hud-pinned">
              <template #header>Pinned</template>
              <LiveParamRow
                v-for="p in pinnedParamItems.slice(0, 4)"
                :key="'hud-pin-' + p.key"
                :label="p.label"
                :param-key="p.key"
                :value="p.val"
                :min="p.min"
                :max="p.max"
                :source="paramSources[p.key] || 'Manual'"
                :modulated="!!paramSources[p.key] && paramSources[p.key] !== 'Manual'"
              />
            </GlassPanel>
          </div>
          </div>

          <div class="video-layer-tabs video-layer-tabs--preview" data-testid="video-layer-tabs">
            <button
              v-for="layer in videoLayers.filter((l) => l && l.builtin)"
              :key="'preview-layer-' + layer.id"
              type="button"
              class="video-layer-tab"
              :class="{
                active: activeVideoLayerId === layer.id,
                'video-layer-tab--builtin': layer.builtin,
              }"
              @click="selectVideoLayer(layer.id)"
            >
              <span
                class="video-layer-tab__dot"
                :class="'video-layer-tab__dot--' + layerStatus(layer)"
                aria-hidden="true"
              ></span>
              <span class="video-layer-tab__label">{{ layer.label }}</span>
            </button>
            <button
              type="button"
              class="video-layer-tab video-layer-tab--add"
              :class="{ active: videoLayerAddOpen }"
              data-testid="video-layer-add-toggle"
              title="Add video source"
              @click="toggleVideoLayerAdd()"
            >
              + Add source
            </button>
          </div>

          <div
            v-if="currentTab === 'LIVE' && videoLayerAddOpen"
            class="video-layer-add framesync-panel"
            data-testid="video-layer-add"
          >
            <div class="framesync-header">
              <div class="framesync-title">
                <UiIcon class="framesync-title-icon" name="plus" />
                <span class="framesync-accent">Add source</span>
              </div>
              <button type="button" class="framesync-button framesync-button--compact" @click="toggleVideoLayerAdd(false)">Close</button>
            </div>
            <p class="framesync-subtitle video-layer-add__hint">
              New sources open as preview tabs. Built-in layers: WebGL, Deforum, and Input.
            </p>
            <div class="chips video-layer-add__mode">
              <button
                type="button"
                class="chip"
                :class="{ active: liveSourcePanel === 'library' }"
                @click="liveSourcePanel = 'library'; saveSessionState()"
              >
                Library (video-swarm)
              </button>
              <button
                type="button"
                class="chip"
                :class="{ active: liveSourcePanel === 'cloud' }"
                @click="liveSourcePanel = 'cloud'; saveSessionState()"
              >
                Link cloud drive
              </button>
            </div>
            <div v-if="liveSourceStatus" class="framesync-subtitle video-layer-add__status">{{ liveSourceStatus }}</div>
            <div v-if="liveSourcePanel === 'library'" class="video-layer-add__library">
              <div class="video-layer-add__actions">
                <button type="button" class="framesync-button" @click="addLiveSourcesFromSelection">Open as new layer</button>
                <button type="button" class="framesync-button" @click="assignInputFromSelection">Assign to Input layer</button>
              </div>
              <VideoSwarmBrowser :app="appView" />
            </div>
            <div v-else class="video-layer-add__cloud framesync-stack">
              <label class="framesync-stack">
                <span class="framesync-subtitle">Provider</span>
                <select class="framesync-select" v-model="cloudDriveDraft.provider">
                  <option value="google_drive">Google Drive</option>
                  <option value="dropbox">Dropbox</option>
                  <option value="onedrive">OneDrive</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label class="framesync-stack">
                <span class="framesync-subtitle">Share link</span>
                <input
                  type="url"
                  class="framesync-input"
                  v-model.trim="cloudDriveDraft.url"
                  placeholder="https://drive.google.com/…"
                  @keyup.enter="linkCloudDriveSource"
                >
              </label>
              <button type="button" class="framesync-button" @click="linkCloudDriveSource">Link cloud drive</button>
            </div>
          </div>
        </div>

        <!-- Local blob URL only; used to align reference audio with HLS video timeline -->
        <audio ref="avSyncAudio" data-testid="av-sync-audio" :src="audio.objectUrl || undefined" preload="auto" style="display:none;"></audio>

        <div v-if="currentTab === 'MOTION'" class="stage-motion-tabs">
          <button
            type="button"
            class="sub-pill"
            :class="{ active: currentSubTab.MOTION === 'PERFORMANCE' }"
            @click="switchSubTab('MOTION', 'PERFORMANCE')"
          >
            Performance
          </button>
          <button
            type="button"
            class="sub-pill"
            :class="{ active: currentSubTab.MOTION === 'SEQUENCER' }"
            @click="switchSubTab('MOTION', 'SEQUENCER')"
          >
            Sequencer
          </button>
        </div>

        <div v-if="showMotionSequencerDock" class="stage-sequencer-shell">
          <SequencerControlsPanel :app="appViewModel" stage show-timeline />
          <GenerateView
            v-if="generator.result || generator.status || performance.status || sequencerStatus"
            :app="appViewModel"
            story-only
          />
        </div>
        <template v-else>
          <div v-if="currentTab !== 'LIBRARY'" class="frame-rail" :class="{ 'frame-rail--collapsed': !showFrames }" style="margin-top: 4px;">
            <div class="frame-rail__header">
              <div class="frame-rail__title-wrap">
                <span class="frame-rail__title">Frames</span>
                <span class="frame-rail__meta" v-if="frameStripThumbs.length">
                  {{ selectedFrameLabel }} · {{ frameStripThumbs.length }} generated
                </span>
                <span class="frame-rail__meta" v-else>Waiting for rendered frames…</span>
              </div>
              <div class="frame-rail__actions">
                <button
                  type="button"
                  class="frame-rail__toggle"
                  :aria-expanded="showFrames ? 'true' : 'false'"
                  :title="showFrames ? 'Collapse frames' : 'Expand frames'"
                  @click="showFrames = !showFrames; saveSessionState()"
                >
                  <UiIcon class="frame-rail__toggle-icon" :name="showFrames ? 'chevron-up' : 'chevron-down'" />
                </button>
                <div class="frame-rail__controls" v-if="showFrames && frameStripThumbs.length">
                  <button type="button" class="frame-rail__step" @click="stepFrameSelection(-1)" :disabled="selectedFrameIndex <= 0">Prev</button>
                  <input
                    class="frame-rail__scrubber"
                    type="range"
                    min="0"
                    :max="Math.max(0, frameStripThumbs.length - 1)"
                    :value="Math.max(0, selectedFrameIndex)"
                    @input="selectFrame(Number($event.target.value))"
                  >
                  <button
                    type="button"
                    class="frame-rail__step"
                    @click="stepFrameSelection(1)"
                    :disabled="selectedFrameIndex >= frameStripThumbs.length - 1"
                  >Next</button>
                </div>
              </div>
            </div>
            <div v-if="showFrames && frameStripThumbs.length" ref="frameRail" class="frame-rail__list">
              <button
                v-for="(f, idx) in frameStripThumbs"
                :key="'frame-rail-' + (f.name || idx)"
                type="button"
                class="frame-rail__item"
                :class="{ 'frame-rail__item--active': idx === selectedFrameIndex }"
                :data-frame-index="idx"
                @click="selectFrame(idx)"
              >
                <img class="frame-rail__thumb" :src="f.src || f.url" :alt="f.name || ('Frame ' + idx)" />
                <span class="frame-rail__label">{{ frameLabel(f) }}</span>
              </button>
            </div>
            <div v-else-if="showFrames" class="frame-rail__empty">
              <span class="lazy-loading-indicator">
                <span v-if="framesEmptyStatus.kind === 'loading'" class="lazy-loading-indicator__spinner" aria-hidden="true"></span>
                <span>{{ framesEmptyStatus.label }}</span>
                <span v-if="framesEmptyStatus.kind === 'loading'" class="lazy-loading-indicator__dots" aria-hidden="true"><span></span><span></span><span></span></span>
              </span>
              <div class="framesync-subtitle" style="margin-top:6px;">{{ framesEmptyStatus.detail }}</div>
            </div>
          </div>
        </template>
        <div
          v-if="currentTab === 'LIBRARY'"
          class="frame-rail library-frame-rail"
          :class="{ 'frame-rail--collapsed': !showFrames }"
          style="margin-top: 4px;"
          data-testid="library-frame-rail"
        >
          <div class="frame-rail__header">
            <div class="frame-rail__title-wrap">
              <span class="frame-rail__title">Runs</span>
              <span class="frame-rail__meta" v-if="librarySelectedRunSummary && librarySelectedFrames.length">
                {{ librarySelectedFrameLabel }} · {{ librarySelectedFrames.length }} frames
              </span>
              <span class="frame-rail__meta" v-else-if="runsLoading">Loading runs…</span>
              <span class="frame-rail__meta" v-else-if="libraryRailRuns.length">{{ libraryRailRuns.length }} runs</span>
              <span class="frame-rail__meta" v-else>No runs yet</span>
            </div>
            <div class="frame-rail__actions">
              <button
                type="button"
                class="frame-rail__toggle"
                :aria-expanded="showFrames ? 'true' : 'false'"
                :title="showFrames ? 'Collapse frames' : 'Expand frames'"
                @click="showFrames = !showFrames; saveSessionState()"
              >
                <UiIcon class="frame-rail__toggle-icon" :name="showFrames ? 'chevron-up' : 'chevron-down'" />
              </button>
              <div class="frame-rail__controls" v-if="showFrames && librarySelectedFrames.length">
                <button
                  type="button"
                  class="frame-rail__step"
                  @click="stepLibraryFrame(-1)"
                  :disabled="librarySelectedFrameIndex <= 0"
                >
                  Prev
                </button>
                <input
                  class="frame-rail__scrubber"
                  type="range"
                  min="0"
                  :max="Math.max(0, librarySelectedFrames.length - 1)"
                  :value="Math.max(0, librarySelectedFrameIndex)"
                  @input="selectLibraryFrame(librarySelectedFrames[Number($event.target.value)] || '')"
                >
                <button
                  type="button"
                  class="frame-rail__step"
                  @click="stepLibraryFrame(1)"
                  :disabled="librarySelectedFrameIndex >= librarySelectedFrames.length - 1"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div v-if="runsLoading" class="frame-rail__empty">Loading runs…</div>
          <div v-else-if="!libraryRailRuns.length" class="frame-rail__empty">No runs yet. Runs will appear here after you render.</div>
          <template v-else>
            <div v-if="library.status" class="frame-rail__empty">{{ library.status }}</div>
            <div v-else-if="library.loading" class="frame-rail__empty">Loading frames…</div>
            <div v-else class="library-frame-rail__runs" data-testid="library-run-thumbs">
              <button
                v-for="run in libraryRailRuns"
                :key="'library-rail-run-' + run.run_id"
                type="button"
                class="frame-rail__item library-frame-rail__run"
                :class="{ 'frame-rail__item--active': librarySelectedRunSummary && librarySelectedRunSummary.run_id === run.run_id }"
                @click="openLibraryRun(run)"
              >
                <img
                  v-if="run.has_thumbnail"
                  class="frame-rail__thumb"
                  :src="`/api/runs/${run.run_id}/thumb`"
                  :alt="run.run_id"
                />
                <div v-else class="frame-rail__thumb library-frame-rail__run-empty">No img</div>
                <span class="frame-rail__label">{{ run.run_id }}</span>
              </button>
            </div>

            <template v-if="showFrames">
              <div
                v-if="librarySelectedRunSummary && !library.loading && !librarySelectedFrames.length"
                class="frame-rail__empty"
              >
                This run has no exported frames to inspect.
              </div>
              <div v-if="librarySelectedFrames.length" class="frame-rail__list" data-testid="library-frame-thumbs">
                <button
                  v-for="frameName in librarySelectedFrames"
                  :key="'library-rail-frame-' + librarySelectedRunSummary.run_id + '-' + frameName"
                  type="button"
                  class="frame-rail__item"
                  :class="{ 'frame-rail__item--active': frameName === librarySelectedFrameResolved }"
                  @click="selectLibraryFrame(frameName)"
                >
                  <img
                    class="frame-rail__thumb"
                    :src="`/api/runs/${encodeURIComponent(librarySelectedRunSummary.run_id)}/frames/${encodeURIComponent(frameName)}`"
                    :alt="frameName"
                  />
                  <span class="frame-rail__label">
                    {{ Number.isFinite(parseFrameNumber(frameName)) && parseFrameNumber(frameName) >= 0 ? parseFrameNumber(frameName) : frameName }}
                  </span>
                </button>
              </div>
            </template>
          </template>
        </div>

        <!-- transport moved to top bar in LIVE -->

        <div v-if="currentTab === 'LIVE'" class="recent-runs-rail">
          <div class="recent-runs-rail__header">
            <span class="recent-runs-rail__title">Recent runs</span>
            <button type="button" class="recent-runs-rail__link" @click="openRunsSettings">All runs</button>
          </div>
          <div v-if="recentRunsRail.length" class="recent-runs-rail__list">
            <button
              v-for="run in recentRunsRail"
              :key="'recent-run-' + run.run_id"
              type="button"
              class="recent-runs-rail__item"
              @click="openRecentRun(run)"
            >
              <img
                v-if="run.has_thumbnail"
                class="recent-runs-rail__thumb"
                :src="`/api/runs/${run.run_id}/thumb`"
                :alt="run.run_id"
              />
              <div v-else class="recent-runs-rail__thumb recent-runs-rail__thumb--empty">No img</div>
              <div class="recent-runs-rail__meta">
                <span class="recent-runs-rail__id">{{ run.run_id }}</span>
                <span class="recent-runs-rail__date">{{ formatDate(run.started_at) }}</span>
              </div>
            </button>
          </div>
          <div v-else class="recent-runs-rail__empty">No recent runs yet.</div>
        </div>

      </div>

      <div
        v-if="currentTab === 'LIVE'"
        class="live-drawer-shell"
        :class="{ 'live-drawer-shell--open': liveDrawerOpen }"
      >
        <button
          type="button"
          class="live-overlay-btn live-overlay-btn--attached"
          :class="{ 'live-overlay-btn--open': showRightPanel }"
          :title="rightPanelToggleTitle"
          :aria-expanded="showRightPanel ? 'true' : 'false'"
          @click="liveDrawerOpen = !liveDrawerOpen"
        >
          <span class="live-overlay-btn__arrow-wrap">
            <UiIcon class="live-overlay-btn__state" :name="rightPanelToggleIcon" />
          </span>
        </button>
        <div class="live-right-column">
          <LiveView :app="appViewModel" />
        </div>
      </div>

      <!-- Right: control rack per tab -->
      <transition name="right-panel-slide">
        <div v-if="currentTab !== 'LIVE' && showRightPanel" :class="{
          'stage-rack-overlay': currentTab === 'MOTION' && currentSubTab.MOTION === 'PERFORMANCE',
          'studio-right-column': currentTab === 'MODULATION'
        }">
          <LibraryView v-if="currentTab==='LIBRARY'" :app="appViewModel" />
          <StreamView v-else-if="currentTab==='STREAM'" :app="appViewModel" />
          <PromptsView v-else-if="currentTab==='PROMPTS'" :app="appViewModel" />
          <MotionView v-else-if="currentTab==='MOTION'" :app="appViewModel" />
          <ModulationView v-else-if="currentTab==='MODULATION'" :app="appViewModel" />
          <SettingsView v-else-if="currentTab==='SETTINGS'" :app="appViewModel" />
        </div>
      </transition>
    </div>

    <div
      class="bottom-drawer-shell"
      :class="{ 'bottom-drawer-shell--open': liveBottomDrawerOpen }"
      data-testid="bottom-drawer"
    >
      <button
        type="button"
        class="bottom-drawer-fab"
        :class="{ 'bottom-drawer-fab--active': liveBottomDrawerOpen }"
        :aria-expanded="liveBottomDrawerOpen ? 'true' : 'false'"
        :title="liveBottomDrawerOpen ? 'Hide performance panel' : 'Show performance panel'"
        @click="liveBottomDrawerOpen = !liveBottomDrawerOpen; saveSessionState()"
      >
        <UiIcon class="bottom-drawer-fab__icon" name="panel-bottom" />
      </button>

      <div class="bottom-drawer-panel" :class="{ 'bottom-drawer-panel--open': liveBottomDrawerOpen }">
        <div class="live-bottom-drawer__tabs">
          <button
            type="button"
            class="sub-pill"
            :class="{ active: liveBottomDrawerTab === 'MODULATION' }"
            @click="setLiveBottomDrawerTab('MODULATION')"
          >
            MODULATION
          </button>
          <button
            type="button"
            class="sub-pill"
            :class="{ active: liveBottomDrawerTab === 'CROSSFADER' }"
            @click="setLiveBottomDrawerTab('CROSSFADER')"
          >
            CROSSFADER
          </button>
        </div>

        <div v-if="liveBottomDrawerTab === 'MODULATION'" class="live-mod-grid">
          <div v-if="!liveModulating.length" class="live-hud-empty">No active modulators</div>
          <template v-else>
            <div v-for="(slot, idx) in liveModulationSlots" :key="'live-mod-slot-' + idx" class="live-mod-slot">
              <div class="live-mod-slot__head">
                <span class="framesync-subtitle" style="margin:0;">{{ slot.label }}</span>
                <span v-if="slot.mappingLabel" class="live-mod-slot__map">
                  <UiIcon name="arrow-left" />
                  <span>{{ slot.mappingLabel }}</span>
                </span>
                <div class="live-mod-slot__actions">
                  <button
                    v-if="slot.paramKey"
                    type="button"
                    class="framesync-button framesync-button--compact"
                    title="Remove mapping"
                    @click="clearParamMapping(slot.paramKey)"
                  >
                    <UiIcon name="close" />
                  </button>
                  <button
                    v-if="slot.paramKey"
                    type="button"
                    class="framesync-button framesync-button--compact"
                    title="Add mapping"
                    @click="openModulationMapping(slot.paramKey)"
                  >
                    <UiIcon name="sliders" />
                  </button>
                </div>
              </div>

              <div v-if="slot.kind === 'slider'" class="live-mod-slot__body">
                <div class="live-mod-slider" :style="{ '--shade': `${slot.shade}` }">
                  <input
                    type="range"
                    class="framesync-input live-mod-slider__input"
                    :min="slot.min"
                    :max="slot.max"
                    :step="slot.step"
                    :value="slot.value"
                    @input="slot.paramKey && setLiveModValue(slot.paramKey, $event.target.value)"
                  />
                  <div class="live-mod-slider__readout">{{ slot.valueLabel }}</div>
                </div>
              </div>

              <div v-else-if="slot.kind === 'xypad'" class="live-mod-slot__body">
                <div
                  class="live-mod-pad"
                  @mousedown="livePadDown($event, slot)"
                  @mousemove="livePadMove($event, slot)"
                  @mouseup="livePadUp"
                  @mouseleave="livePadUp"
                  @touchstart.prevent="livePadDown($event, slot)"
                  @touchmove.prevent="livePadMove($event, slot)"
                  @touchend.prevent="livePadUp"
                >
                  <div class="live-mod-pad__crosshair live-mod-pad__crosshair--x"></div>
                  <div class="live-mod-pad__crosshair live-mod-pad__crosshair--y"></div>
                  <div class="live-mod-pad__puck" :style="slot.puckStyle"></div>
                </div>
                <div class="live-mod-pad__axes">
                  <span class="framesync-subtitle" style="margin:0;">X {{ slot.xLabel }}</span>
                  <span class="framesync-subtitle" style="margin:0;">Y {{ slot.yLabel }}</span>
                </div>
              </div>

              <div v-else class="live-mod-slot__body">
                <div class="live-mod-knob">
                  <input
                    type="range"
                    class="framesync-input live-mod-knob__input"
                    :min="slot.min"
                    :max="slot.max"
                    :step="slot.step"
                    :value="slot.value"
                    @input="slot.paramKey && setLiveModValue(slot.paramKey, $event.target.value)"
                  />
                  <div class="live-mod-knob__readout">{{ slot.valueLabel }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <LoraCrossfaderPanel v-else :app="appViewModel" />
      </div>
    </div>

  </div>
</template>

<script>
import './style.css'
import {
  CROSSFADE_SLOT_TYPES,
  morphSlotValue,
  smoothstep,
} from './morph-utils.js'
import {
  DEFORUM_DEFAULT_SETTINGS,
  DEFORUM_FIELD_GROUPS,
  DEFORUM_FIELD_KEYS,
  createDeforumFieldEnabledMap,
  getNestedValue,
  setNestedValue,
  removeNestedValue,
  patchFromKeyPath,
  mergeDeforumSettings,
} from './deforum-settings-schema.js'
import { apiFetch, modelSourceLabel } from './api-utils.js'

const CONTROLNET_GROUP_IDS = new Set(['controlnet'])

const TIMELINE_TRACK_COLORS = [
  'rgb(45, 226, 255)',
  'rgb(255, 83, 217)',
  'rgb(90, 242, 169)',
  'rgb(255, 138, 26)',
  'rgb(167, 139, 250)',
  'rgb(244, 114, 182)',
  'rgb(52, 211, 153)',
  'rgb(251, 191, 36)',
]
const TIMELINE_GRID_EMPTY = 'rgb(26, 58, 82)'
const TIMELINE_GRID_LABEL = 'rgb(58, 90, 120)'
const TIMELINE_GRID_BORDER = 'rgb(12, 48, 72)'
const TIMELINE_GRID_TEXT = 'rgb(90, 143, 184)'
const DEFORUM_DERIVED_TOGGLE_KEYS = {
  distilled_cfg_scale_schedule: 'cfg_scale_schedule',
}

import StatusStrip from './components/StatusStrip.vue'
import GlassPanel from './components/GlassPanel.vue'
import LiveParamRow from './components/LiveParamRow.vue'
import UiIcon from './components/UiIcon.vue'
import SequencerControlsPanel from './components/SequencerControlsPanel.vue'
import ThreeBackground from './components/ThreeBackground.vue'
import LoraCrossfaderPanel from './components/LoraCrossfaderPanel.vue'
import VideoSwarmBrowser from './components/VideoSwarmBrowser.vue'
import LiveView from './components/views/LiveView.vue'
import LibraryView from './components/views/LibraryView.vue'
import StreamView from './components/views/StreamView.vue'
import PromptsView from './components/views/PromptsView.vue'
import MotionView from './components/views/MotionView.vue'
import GenerateView from './components/views/GenerateView.vue'
import ModulationView from './components/views/ModulationView.vue'
import SettingsView from './components/views/SettingsView.vue'
import { paintSpectrumBars } from './audio-spectrum.js'

export default {
  name: 'App',
  components: { StatusStrip, GlassPanel, LiveParamRow, UiIcon, SequencerControlsPanel, GenerateView, ThreeBackground, LoraCrossfaderPanel, VideoSwarmBrowser, LiveView, LibraryView, StreamView, PromptsView, MotionView, ModulationView, SettingsView },
  data() {
    return {
       showFrames: false,
       isPlaying: false,
       isRecording: false,
       deforumPlaying: false,
       previewGenerating: false,
       previewDebounceTimer: null,
       previewQueuedKind: null,
      videoReady: false,
       framesRefreshBackoffMs: 1000,
       frameRefreshTimer: null,
       apiHealthBackoffMs: 15000,
      runsLoading: false,
      presetsLoading: false,
      sharedPresetsLoading: false,
      pluginsLoading: false,
      lorasLoading: false,
      deforumSettingsLoading: false,
      deforumSettingsSaving: false,
      paramPanelOpen: false,
      deforumPanelOpen: false,
      liveDrawerOpen: true,
      videoStageSize: 'medium', // small | medium | full
      liveAnimationBoxOpen: true,
      libraryFullscreen: false,
       deforumSettings: { ...DEFORUM_DEFAULT_SETTINGS },
      deforumFieldGroups: DEFORUM_FIELD_GROUPS.filter((g) => !CONTROLNET_GROUP_IDS.has(g.id)),
      deforumFieldEnabled: createDeforumFieldEnabledMap(),
       deforumActiveTab: 'canvas',
       deforumSectionOpen: {},
       deforumAdvancedOpen: false,
       sessionDeforumSettingsLoaded: false,
       deforumSettingsJson: '',
       deforumSettingsJsonError: '',
       deforumSettingsStatus: '',
       deforumSaveTimer: null,
       deforumPreviewTimer: null,
       crossfadeSlotTypes: CROSSFADE_SLOT_TYPES,
       performance: {
         genericPrompt: '',
         crossfader: 0.5,
         newSlotType: 'prompt',
         slots: [],
         status: '',
         lastPreviewPath: null,
       },
       forge: {
         host: typeof process !== 'undefined' && process.env && process.env.SD_FORGE_HOST ? process.env.SD_FORGE_HOST : '192.168.2.101',
         port: typeof process !== 'undefined' && process.env && process.env.SD_FORGE_PORT ? process.env.SD_FORGE_PORT : '7860',
         available: false,
         loading: false,
         switching: false,
         models: [],
         modelsSource: '',
         currentModel: '',
         selectedModel: '',
         lastModel: '',
         modelInfo: null,
         samplers: [],
         schedulers: [],
         vaeList: [],
         options: {},
       },
       streamUrl: "",
      streaming: {
        status: '',
        activeStatus: 'unknown',
        activeDestinationId: null,
        destinations: [
          {
            id: 'stream_dest_default',
            name: 'Custom RTMP',
            protocol: 'rtmp',
            target: '',
            fps: 24,
            resolution: '1024x576',
            overlay: '',
            transition: '',
          },
        ],
      },
       lfoOn: true,
      beatMacroOn: true,
      apiHealth: { sdForge: null },
      serviceHealth: {
        loading: false,
        lastChecked: null,
        web: { ok: true },
        hls: { updated: null, ageMs: null },
        stream: { status: 'unknown' },
      },
      forgeHost: process.env.SD_FORGE_HOST || '192.168.2.101',
      availablePresets: [],
      currentPreset: null,
      newPresetName: '',
      presetStatus: '',
      sharedPresets: [],
      sharedPresetName: '',
      sharedPresetBy: '',
      sharedPresetsStatus: '',
      collab: {
        userId: null,
        userName: typeof localStorage !== 'undefined' ? (localStorage.getItem('defora_user_name') || 'Performer') : 'Performer',
        users: [],
        locks: {},
        recording: false,
        recordings: [],
        status: '',
      },
      collabEnabled: true,
      gpuPool: {
        enabled: false,
        strategy: 'least_busy',
        defaultForgeModel: '',
        healthyNodes: 0,
        nodes: [],
        loading: false,
        status: '',
        draft: { url: '', name: '', backend: 'sd-forge', priority: 1, model: '' },
        editId: null,
        editDraft: { name: '', url: '', backend: 'sd-forge', priority: 1, model: '' },
        forgeModal: {
          open: false,
          nodeId: '',
          nodeName: '',
          url: '',
          priority: 1,
          model: '',
          currentModel: '',
          available: false,
          loading: false,
          saving: false,
          applying: false,
          status: '',
          samplers: [],
          schedulers: [],
          vaeList: [],
          modelInfo: null,
          options: {},
        },
        expandedLog: null,
        modelOptions: {},
        defaultForgeModelStatus: '',
      },
      infrastructure: {
        loading: false,
        mediator: null,
        transcoders: [],
        updatedAt: null,
      },
      generator: {
        theme: '',
        stylePreset: 'Masterpiece, Realistic',
        customStyle: '',
        fps: 24,
        resolution: '1024x576',
        totalFrames: 96,
        numScenes: 4,
        isGenerating: false,
        status: '',
        lastPath: null,
        result: null,
      },
      session: "clown_set_01",
      _syncingGlobalFps: false,
      tabs: [
        { id: "LIVE", label: "LIVE", hint: "Monitor", icon: "broadcast" },
        { id: "STREAM", label: "STREAM", hint: "Output", icon: "broadcast" },
        { id: "LIBRARY", label: "LIBRARY", hint: "Frames", icon: "folder" },
        { id: "PROMPTS", label: "PROMPTS", hint: "Words", icon: "sparkles" },
        { id: "MOTION", label: "MOTION", hint: "Move", icon: "shuffle" },
        { id: "MODULATION", label: "MODULATION", hint: "React", icon: "wave" },
        { id: "SETTINGS", label: "SETTINGS", hint: "Engine", icon: "gear" },
      ],
      currentTab: "LIVE",
      currentSubTab: { LIVE: 'MONITOR', PROMPTS: 'PROMPTS', MODULATION: 'LFO', SETTINGS: 'ENGINE', MOTION: 'PERFORMANCE' },
      liveSourcePanel: 'library',
      liveSources: [],
      liveSourceStatus: '',
      videoLayers: [
        { id: 'webgl', kind: 'webgl', label: 'WebGL', builtin: true },
        { id: 'deforum', kind: 'deforum', label: 'Deforum', builtin: true },
        { id: 'blend', kind: 'blend', label: 'Both', builtin: true },
        { id: 'input', kind: 'input', label: 'Input', builtin: true, playbackUrl: null },
      ],
      _userPickedPreviewLayer: false,
      activeVideoLayerId: 'webgl',
      videoLayerAddOpen: false,
      inputLayerPlaybackUrl: null,
      inputLayerLabel: 'Input',
      inputVideoReady: false,
      cloudDriveDraft: { url: '', provider: 'google_drive' },
      systemFiles: {
        roots: [],
        rootId: 'frames',
        currentPath: '',
        parent: '',
        videos: [],
        videoCount: null,
        loading: false,
        status: '',
        recursive: false,
        showFilenames: true,
        sortKey: 'name',
        zoomLevel: 2,
        selectedPaths: [],
        fullscreenIndex: -1,
      },
      librarySubTab: 'BROWSER',
      liveBottomDrawerOpen: false,
      liveBottomDrawerTab: 'MODULATION',
      restoreSessionPromptOpen: false,
      pendingSessionStateRaw: '',
      promptHistoryOpen: false,
      promptHistory: [],
      speechPromptSupported: false,
      speechPromptListening: false,
      speechPromptError: '',
      stats: { lat: 120 },
      hud: { seed: 42490527 },
      timecode: "00:00.00",
      liveVibe: [
        { key: "cfg", label: "Vibe (CFG)", val: 0.63, min: 0, max: 1.5, step: 0.01 },
        { key: "strength", label: "Strength", val: 0.78, min: 0, max: 1.5, step: 0.01 },
        { key: "noise", label: "Noise/Glitch", val: 0.2, min: 0, max: 1, step: 0.01 },
        { key: "cfgscale", label: "CFG scale", val: 5.0, min: 0, max: 15, step: 0.1 },
      ],
      liveCam: [
        { key: "zoom", label: "Zoom", val: 0.8, min: -5, max: 5, step: 0.05, sourceable: true },
        { key: "panx", label: "Pan X", val: 0.1, min: -1, max: 1, step: 0.05, sourceable: false },
        { key: "pany", label: "Pan Y", val: 0.0, min: -1, max: 1, step: 0.05, sourceable: false },
        { key: "tilt", label: "Tilt / Rotate", val: 0.0, min: -180, max: 180, step: 0.5, sourceable: false },
      ],
      paramSources: {
        cfg: "Manual",
        strength: "Manual",
        noise: "Beat",
        cfgscale: "Manual",
        zoom: "Beat",
      },
      pinnedParams: (() => {
        try {
          const raw = typeof localStorage !== 'undefined' && localStorage.getItem('defora_pinned_params');
          return raw ? JSON.parse(raw) : [];
        } catch (_) { return []; }
      })(),
      prompts: {
        pos: "",
        neg: "",
        morphOn: true,
        loraCrossfaderOn: false,
        crossfaderValue: 0.5,
        loraCrossfaderLfoLink: null,
        loraCrossfaderLfoBase: 0.5,
        morphBlend: 0.5,
        morphBlendLfoLink: null,
        morphBlendLfoBase: 0.5,
      },
      img2img: {
        show: true,
        dataUrl: null,
        maskDataUrl: null,
        maskBlur: 4,
        inpaintingFill: 1,
        inpaintFullRes: true,
        denoisingStrength: 0.55,
        width: 1024,
        height: 1024,
        loading: false,
        status: "",
        lastPath: null,
      },
      pluginsRegistry: [],
      morphSlots: [
        { id: 1, on: true, name: "clean → mad", a: "clean evil", b: "mad clown", range: "0.40–1.00", weight: 1 },
        { id: 2, on: true, name: "box → tunnel", a: "small box", b: "neon tunnel", range: "0.00–0.60", weight: 1 },
        { id: 3, on: false, name: "style fade", a: "photographic", b: "anime render", range: "0.20–0.80", weight: 1 },
      ],
      loras: {
        available: [],
        common: [],
        groupA: [],
        groupB: [],
        source: "unknown",
        familyCollapsed: {
          sd15: true,
          sdxl: true,
          flux: true,
          svd: true,
        },
      },
      motionPresets: {
        Static:      { translation_z: 0,   translation_x: 0,    translation_y: 0,   rotation_z: 0,  rotation_y: 0 },
        Orbit:       { translation_z: 2,   rotation_y: 15,      translation_x: 0,   translation_y: 0, rotation_z: 0 },
        Tunnel:      { translation_z: 5,   translation_x: 0,    translation_y: 0,   rotation_z: 0,  rotation_y: 0 },
        Handheld:    { translation_z: 0.5, translation_x: 0.2,  translation_y: 0.1, rotation_z: 2,  rotation_y: 0 },
        Chaos:       { translation_z: 1.5, translation_x: 0.5,  translation_y: 0.3, rotation_z: 5,  rotation_y: 10 },
        // rotation_3d_z gallery presets (wiki examples: ±1, ±2, ±4, ±8)
        'Spin +1':   { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 1,  rotation_y: 0 },
        'Spin +2':   { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 2,  rotation_y: 0 },
        'Spin +4':   { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 4,  rotation_y: 0 },
        'Spin +8':   { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 8,  rotation_y: 0 },
        'Spin -1':   { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: -1, rotation_y: 0 },
        'Spin -2':   { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: -2, rotation_y: 0 },
        'Spin -4':   { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: -4, rotation_y: 0 },
        // rotation_3d_y gallery presets (±0.5, ±1, ±2, ±3)
        'Yaw +0.5':  { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 0, rotation_y: 0.5 },
        'Yaw +1':    { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 0, rotation_y: 1 },
        'Yaw +2':    { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 0, rotation_y: 2 },
        'Yaw +3':    { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 0, rotation_y: 3 },
        'Yaw -1':    { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 0, rotation_y: -1 },
        'Yaw -2':    { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 0, rotation_y: -2 },
        // rotation_3d_x gallery presets (±0.5, ±1, ±2)
        'Pitch +0.5':{ translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 0, rotation_y: 0, rotation_x: 0.5 },
        'Pitch +1':  { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 0, rotation_y: 0, rotation_x: 1 },
        'Pitch +2':  { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 0, rotation_y: 0, rotation_x: 2 },
        'Pitch -1':  { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 0, rotation_y: 0, rotation_x: -1 },
        // 2D translation gallery presets
        'Pan R':     { translation_z: 0, translation_x: 5,  translation_y: 0,  rotation_z: 0, rotation_y: 0 },
        'Pan L':     { translation_z: 0, translation_x: -5, translation_y: 0,  rotation_z: 0, rotation_y: 0 },
        'Pan Up':    { translation_z: 0, translation_x: 0,  translation_y: -5, rotation_z: 0, rotation_y: 0 },
        'Pan Down':  { translation_z: 0, translation_x: 0,  translation_y: 5,  rotation_z: 0, rotation_y: 0 },
        // 2D zoom gallery presets
        'Zoom Out':  { translation_z: -2, translation_x: 0, translation_y: 0, rotation_z: 0, rotation_y: 0 },
      },
      motionStyles: ["Calm", "Travel", "Spin", "Handheld", "Chaos"],
      motionStylesSaved: {},
      motionSelectedPreset: "Static",
      motionPadValues: { translation_x: 0, translation_y: 0, translation_z: 0, zoom: 1 },
      xyPad: { dragging: false, padSize: 420 },
      audio: { track: "", bpm: 114.8, uploadedFile: null, objectUrl: null },
      audioSpectrogramDataUrl: null,
      audioSpectrogramStatus: "",
      _spectrogramGen: 0,
      avSyncEnabled: false,
      avSyncLeadSec: 4,
      audioBeatMacrosCollapsed: true,
      audioStatus: "Idle",
      audioMappings: [
        { param: "strength", band: "low", freq_min: 20, freq_max: 250, out_min: 0, out_max: 1.5 },
        { param: "cfg", band: "mid", freq_min: 250, freq_max: 2000, out_min: 0, out_max: 30 },
        { param: "translation_z", band: "high", freq_min: 2000, freq_max: 8000, out_min: -5, out_max: 5 },
      ],
      audioMappingLevels: [0, 0, 0],
      audioActiveBandTab: "low",
      audioSpectrumBins: [],
      _audioSpectrumPaintTs: 0,
      audioBandPresets: {
        sub: { label: "Sub", freq_min: 20, freq_max: 60 },
        bass: { label: "Bass", freq_min: 60, freq_max: 250 },
        lowmid: { label: "Lo-mid", freq_min: 250, freq_max: 500 },
        mid: { label: "Mid", freq_min: 500, freq_max: 2000 },
        high: { label: "High", freq_min: 2000, freq_max: 8000 },
        air: { label: "Air", freq_min: 8000, freq_max: 16000 },
      },
      lfoBpm: 120,
      modulationSelectedLfoId: 1,
      lfoTargets: [
        { key: "cfg", label: "Vibe (CFG)", min: 0, max: 30, default: 6, group: "Style" },
        { key: "strength", label: "Strength", min: 0, max: 1.5, default: 0.7, group: "Style" },
        { key: "noise_multiplier", label: "Noise/Glitch", min: 0, max: 3, default: 1.0, group: "Style" },
        { key: "translation_z", label: "Zoom", min: -10, max: 10, default: 0, group: "Camera" },
        { key: "translation_x", label: "Pan X", min: -10, max: 10, default: 0, group: "Camera" },
        { key: "translation_y", label: "Pan Y", min: -10, max: 10, default: 0, group: "Camera" },
        { key: "rotation_y", label: "Rotate Y", min: -180, max: 180, default: 0, group: "Camera" },
        { key: "rotation_z", label: "Tilt", min: -180, max: 180, default: 0, group: "Camera" },
        { key: "fov", label: "FOV", min: 1, max: 180, default: 70, group: "Camera" },
        // Deforum-native 3D schedule params (maps to rotation_3d_* in Deforum settings)
        { key: "rotation_3d_x", label: "Rotate X (3D)", min: -180, max: 180, default: 0, group: "Camera 3D", deforumKey: "rotation_3d_x" },
        { key: "rotation_3d_y", label: "Rotate Y (3D)", min: -180, max: 180, default: 0, group: "Camera 3D", deforumKey: "rotation_3d_y" },
        { key: "rotation_3d_z", label: "Rotate Z (3D)", min: -180, max: 180, default: 0, group: "Camera 3D", deforumKey: "rotation_3d_z" },
        { key: "zoom_2d", label: "Zoom (2D)", min: 0.5, max: 2.0, default: 1.0, group: "Camera 2D", deforumKey: "zoom" },
        { key: "angle_2d", label: "Angle (2D)", min: -90, max: 90, default: 0, group: "Camera 2D", deforumKey: "angle" },
        { key: "near_clip", label: "Near Clip", min: 1, max: 1000, default: 200, group: "Camera 3D", deforumKey: "near_schedule" },
        { key: "far_clip", label: "Far Clip", min: 100, max: 100000, default: 10000, group: "Camera 3D", deforumKey: "far_schedule" },
        { key: "cn_CN1_weight", label: "CN1 Weight", min: 0, max: 2, default: 0.4, group: "ControlNet" },
        { key: "cn_CN2_weight", label: "CN2 Weight", min: 0, max: 2, default: 0.4, group: "ControlNet" },
        { key: "cn_CN3_weight", label: "CN3 Weight", min: 0, max: 2, default: 0.4, group: "ControlNet" },
        { key: "cn_CN1_start", label: "CN1 Start", min: 0, max: 1, default: 0, group: "ControlNet" },
        { key: "cn_CN2_start", label: "CN2 Start", min: 0, max: 1, default: 0, group: "ControlNet" },
        { key: "cn_CN1_end", label: "CN1 End", min: 0, max: 1, default: 0.9, group: "ControlNet" },
        { key: "cn_CN2_end", label: "CN2 End", min: 0, max: 1, default: 0.9, group: "ControlNet" },
      ],
      animationTargets: [
        { key: "anim_instCount", field: "instCount", label: "Instance count", min: 1000, max: 50000, default: 12000, group: "Standby — Instancing" },
        { key: "anim_spread", field: "spread", label: "Spread", min: 0.2, max: 2.5, default: 0.68, group: "Standby — Instancing" },
        { key: "anim_speed", field: "speed", label: "Speed", min: 0.1, max: 2.5, default: 0.75, group: "Standby — Instancing" },
        { key: "anim_hue", field: "hue", label: "Hue", min: 0, max: 1, default: 0.6, group: "Standby — Instancing" },
        { key: "anim_glow", field: "glow", label: "Glow", min: 0.1, max: 1.4, default: 0.78, group: "Standby — Instancing" },
        { key: "anim_orbit", field: "orbit", label: "Orbit", min: 0, max: 1, default: 0.52, group: "Standby — Instancing" },
        { key: "anim_beamCount", field: "beamCount", label: "Beam count", min: 3, max: 12, default: 7, group: "Standby — Volume" },
        { key: "anim_pulse", field: "pulse", label: "Pulse", min: 0, max: 1, default: 0.36, group: "Standby — Volume" },
        { key: "anim_drift", field: "drift", label: "Drift", min: 0, max: 1, default: 0.44, group: "Standby — Volume" },
        { key: "anim_mist", field: "mist", label: "Mist", min: 0, max: 1, default: 0.58, group: "Standby — Nebula" },
        { key: "anim_lineWidth", field: "lineWidth", label: "Line width", min: 1, max: 10, default: 2.4, group: "Standby — Raycast" },
        { key: "anim_lineThreshold", field: "lineThreshold", label: "Line threshold", min: 0, max: 10, default: 0.8, group: "Standby — Raycast" },
        { key: "anim_lineTranslation", field: "lineTranslation", label: "Line translation", min: 0, max: 10, default: 0, group: "Standby — Raycast" },
        { key: "anim_mcNumBlobs", field: "mcNumBlobs", label: "Blob count", min: 1, max: 50, default: 10, group: "Standby — Marching" },
        { key: "anim_mcResolution", field: "mcResolution", label: "MC resolution", min: 14, max: 100, default: 28, group: "Standby — Marching" },
        { key: "anim_mcIsolation", field: "mcIsolation", label: "MC isolation", min: 10, max: 300, default: 80, group: "Standby — Marching" },
        { key: "anim_ocElevation", field: "ocElevation", label: "Sun elevation", min: 0, max: 90, default: 2, group: "Standby — Ocean" },
        { key: "anim_ocDistortion", field: "ocDistortion", label: "Distortion", min: 0, max: 8, default: 3.7, group: "Standby — Ocean" },
        { key: "anim_ocCloudCoverage", field: "ocCloudCoverage", label: "Cloud coverage", min: 0, max: 1, default: 0.4, group: "Standby — Ocean" },
      ],
      lfoShapes: ["Sine", "Triangle", "Saw", "Square"],
      lfos: Array.from({ length: 6 }).map((_, idx) => ({
        id: idx + 1,
        on: idx === 0,
        targets: idx === 0 ? ["cfg"] : [],
        shape: "Sine",
        bpm: 120,
        speed: 1.0,
        depth: 0.1,
        base: null,
        phase: 0,
        renderPhase: 0,
      })),
      macrosRack: [
        { id: "macro-0", on: true, target: "cfg", shape: "Sine", bpm: 120, depth: 0.7, offset: 0.1, show: true },
        { id: "macro-1", on: true, target: "translation_z", shape: "Saw", bpm: 90, depth: 0.6, offset: 0.2, show: false },
        { id: "macro-2", on: false, target: "noise_multiplier", shape: "Noise", bpm: 140, depth: 0.3, offset: 0.0, show: false },
        ],
      framesync: {
        presets: ["Basic Strength Schedule", "Basic Noise Schedule", "Basic Init"],
        factoryPresets: ["Basic Strength Schedule", "Basic Noise Schedule", "Basic Init"],
        selectedPreset: "Basic Strength Schedule",
        primaryWave: "Cosine",
        waveShapes: ["Cosine", "Sine", "Saw", "Triangle", "Square", "Noise"],
        amplitude: 1,
        shift: 0,
        bend: 1,
        noise: 0,
        fps: 24,
        frameCount: 120,
        bpm: 120,
        shiftFrames: 0,
        syncRates: ["1", "1/2", "1/4", "1/8", "1/16", "1/32", "2", "4", "8"],
        syncRate: "1/4",
        decimals: 2,
        metrics: [
          { label: "Max", value: "1.00", sub: "32bars" },
          { label: "Min", value: "-1.00", sub: "16bars" },
          { label: "Avg", value: "0.00", sub: "4bars" },
          { label: "Abs Avg", value: "0.63", sub: "1bar" },
          { label: "Duration", value: "5.00s", sub: "1/2" },
        ],
        timingTable: [
          { label: "32bar", time: "58.0s", frames: "1392.0" },
          { label: "16bar", time: "28.0s", frames: "768.0" },
          { label: "8bar", time: "16.0s", frames: "384.0" },
          { label: "4bar", time: "8.0s", frames: "192.0" },
          { label: "2bar", time: "4.0s", frames: "96.0" },
          { label: "1bar", time: "2.0s", frames: "48.0" },
          { label: "1/2", time: "1.0s", frames: "24.0" },
        ],
        featureCoverage: [
          "Wave presets",
          "LFO modulation",
          "Audio-driven sync",
          "Tempo & shift",
          "Metrics + timing table",
          "Preset import/export"
        ],
      },
      cn: {
        slots: [
          { id: "CN1", label: "CN1", model: "Canny", weight: 0.4, start: 0, end: 0.9, enabled: false, imageSource: "file" },
          { id: "CN2", label: "CN2 •", model: "Depth", weight: 0.4, start: 0, end: 0.9, enabled: false, imageSource: "file" },
          { id: "CN3", label: "CN3", model: "Pose", weight: 0.4, start: 0, end: 0.9, enabled: false, imageSource: "file" },
          { id: "CN4", label: "CN4", model: "Tile", weight: 0.4, start: 0, end: 0.9, enabled: false, imageSource: "file" },
          { id: "CN5", label: "CN5", model: "Control", weight: 0.4, start: 0, end: 0.9, enabled: false, imageSource: "file" },
        ],
        active: "CN2",
        availableModels: [],
        source: "unknown",
        webcamActive: false,
        webcamStream: null,
        webcamVideo: null,
        webcamCanvas: null,
        webcamCaptureInterval: null,
      },
      webcamCaptureRate: 500,
      midi: {
        supported: typeof navigator !== 'undefined' && !!navigator.requestMIDIAccess,
        devices: [],
        selected: null,
        mappings: [
          { control: "LaunchControl CC21", cc: 21, key: "cfg" },
          { control: "LaunchControl CC22", cc: 22, key: "strength" },
          { control: "LaunchControl CC23", cc: 23, key: "cfgscale" },
        ],
      },
      keyBindings: {
        "translation_z": "w",
        "translation_x": "a",
        "translation_y": "s",
        "rotation_y": "d",
        "rotation_z": "q",
        "fov": "e",
        "cfg": "z",
        "strength": "x",
        "noise_multiplier": "c",
      },
      bindingLearnMode: false,
      bindingTargetKey: null,
      bindingLearnTimeout: null,
      midiStatus: "Ready",
      ws: null,
      wsStatus: "disconnected",
      wsReconnectTimer: null,
      streamSrc: "/hls/live/deforum.m3u8",
      defaultAnimation: {
        preferDeforumVideo: false,
        autoTransitionToDeforum: true,
        mode: 'instancing',
        instCount: 12000,
        beamCount: 7,
        speed: 0.75,
        spread: 0.68,
        glow: 0.78,
        hue: 0.6,
        pulse: 0.36,
        drift: 0.44,
        mist: 0.58,
        orbit: 0.52,
        lineType: 'segments',
        lineWidth: 2.4,
        lineThreshold: 0.8,
        lineTranslation: 0,
        lineWorldUnits: true,
        lineVisualizeThreshold: false,
        lineAlphaToCoverage: true,
        lineAnimate: true,
        mcMaterial: 'shiny',
        mcNumBlobs: 10,
        mcResolution: 28,
        mcIsolation: 80,
        mcFloor: true,
        mcWallX: false,
        mcWallZ: false,
        ocElevation: 2,
        ocAzimuth: 180,
        ocExposure: 0.1,
        ocDistortion: 3.7,
        ocSize: 1,
        ocCloudCoverage: 0.4,
        ocCloudDensity: 0.5,
        ocCloudElevation: 0.5,
      },
      thumbs: [],
      framesTimer: null,
      playerEl: null,
      timeHandler: null,
      hls: null,
      videoReadyHandler: null,
      videoWaitingHandler: null,
      videoPlayHandler: null,
      videoPauseHandler: null,
      liveParamTimers: {},
      liveParamPending: {},
      lastParamSent: {},
      controlDelayMs: 75,
      errorHandler: null,
      playbackTimer: null,
      lfoTimer: null,
      lastLfoTick: null,
      beatTimer: null,
      lastBeatTime: null,
      beatCount: 0,
      beatPhase: 0,
      lastMacroTrigger: {},
      sequencer: { version: 1, durationSec: 8, fps: 24, loop: true, tracks: [], markers: [], clips: [], bpmSync: false, bpm: 120, bars: 4, beatsPerBar: 4 },
      sequencerPlayhead: 0,
      jobPlaybackTimeSec: 0,
      sequencerPlaying: false,
      sequencerTimer: null,
      sequencerSaveName: "default_clip",
      sequencerLoadPick: "",
      sequencerList: [],
      sequencerStatus: "",
      sequencerNewParam: "translation_x",
      sequencerKeyframeVal: 0,
      sequencerMarkerName: "Scene",
      sequencerClipDurationSec: 2,
      sequencerSelectedTrackId: null,
      sequencerSelectedClipId: null,
      generateDockExpanded: false,
      selectedFrameIndex: -1,
      timelineHoverTime: null,
      timelineHoverPercent: 0,
      timelineCanvasCtx: null,
      lfoTargetPick: {},
      avSyncCollapsed: true,
      morphCollapsed: true,
      loraPickerOpen: false,
      loraCrossfaderPickerGroup: null,
      loraCrossfaderCollapsed: false,
      engineModelPickerOpen: false,
      engineModelPickerTab: 'sd15',
      forgeAdvancedCollapsed: true,
      storyResultCollapsed: false,
       lfoCanvasRefs: {},
       _lfoAnimFrame: null,
       runsAll: [],
       runsFiltered: [],
       runsFilter: { search: "", status: "", tag: "", model: "" },
       runsSort: { field: "started_at", order: "desc" },
       deforumBatches: [],
       deforumBatchesStatus: "",
       deforumBatchNodes: [],
       runsSelected: [],
       runsCompareFields: [
         'status', 'model', 'frame_count', 'seed', 'steps', 'strength', 'cfg', 'tag',
         'prompt_positive', 'prompt_negative', 'notes',
       ],
       runsDetailView: null,
       runsStatus: "",
       library: {
         selectedRunId: '',
         selectedFrameName: '',
         runDetail: null,
         loading: false,
         status: '',
       },
       genData: {
         defaultThemes: ['A journey through light', 'Neon cathedral', 'Ocean depths'],
         sceneDescriptors: { opening: ['ethereal', 'quiet'], buildup: ['rising', 'vivid'], climax: ['intense', 'surreal'], closing: ['soft', 'fading'] },
         environments: [['forest', 'meadow'], ['city', 'alley'], ['space', 'nebula']],
         lighting: ['golden hour', 'neon rim light', 'moonlit'],
         quality: ['masterpiece', 'best quality'],
         techSpecs: ['8k', 'sharp focus'],
         artists: { default: ['artgerm', 'greg rutkowski'], 'Masterpiece, Realistic': ['photorealistic'] },
         negatives: ['blurry', 'low quality'],
         cameraBehaviors: ['STATIC', 'ORBIT', 'TUNNEL'],
       },
     };
  },
  computed: {
    appViewModel() {
      return this;
    },
    gpuActiveCount() {
      return Math.max(0, Number(this.gpuPool && this.gpuPool.healthyNodes) || 0);
    },
    gpuTotalCount() {
      return Array.isArray(this.gpuPool && this.gpuPool.nodes) ? this.gpuPool.nodes.length : 0;
    },
    runsActiveGpuJobs() {
      const batches = Array.isArray(this.deforumBatches) ? this.deforumBatches : [];
      return batches
        .map((batch) => {
          const batchId = batch.batch_id || batch.id || batch.batchId || "";
          const rawStatus = String(batch.status || batch.state || "queued").toLowerCase();
          let status = rawStatus;
          if (rawStatus.includes("run") || rawStatus.includes("progress") || rawStatus.includes("generat")) status = "running";
          else if (rawStatus.includes("queue") || rawStatus.includes("pending") || rawStatus.includes("wait")) status = "queued";
          else if (rawStatus.includes("cancel")) status = "cancelled";
          else if (rawStatus.includes("fail") || rawStatus.includes("error")) status = "failed";
          else if (rawStatus.includes("complete") || rawStatus.includes("done") || rawStatus.includes("success")) status = "completed";
          return {
            batchId,
            runId: batchId ? `batch:${batchId}` : "",
            status,
            model: batch.model || batch.sd_model_name || batch.sd_model_checkpoint || "",
            frames: batch.frame_count ?? batch.frames ?? batch.max_frames ?? null,
            progress: batch.progress ?? batch.phase_progress ?? null,
            node: batch._node || null,
            nodeName: (batch._node && batch._node.name) || (batch._node && batch._node.url) || "forge",
            startedAt: batch.started_at || batch.created_at || batch.createdAt || null,
            _batch: batch,
          };
        })
        .filter((job) => job.batchId && (job.status === "queued" || job.status === "running"));
    },
    runsGpuNodeSummaries() {
      const forgeNodes = (this.gpuPool.nodes || []).filter((node) => node && node.enabled && node.backend === "sd-forge");
      const activeByNode = {};
      this.runsActiveGpuJobs.forEach((job) => {
        const key = (job.node && job.node.id) || job.nodeName || "unknown";
        if (!activeByNode[key]) activeByNode[key] = [];
        activeByNode[key].push(job);
      });
      if (forgeNodes.length) {
        return forgeNodes.map((node) => ({
          id: node.id,
          name: node.name || node.url,
          url: node.url,
          status: node.status,
          activeJobs: node.activeJobs,
          queueRunning: node.queueRunning,
          queuePending: node.queuePending,
          progress: node.progress,
          jobs: activeByNode[node.id] || [],
        }));
      }
      return (this.deforumBatchNodes || []).map((node) => ({
        id: node.id || node.url,
        name: node.name || node.url,
        url: node.url,
        status: null,
        activeJobs: (activeByNode[node.id || node.url] || []).length,
        queueRunning: null,
        queuePending: null,
        progress: null,
        jobs: activeByNode[node.id || node.url] || activeByNode[node.name || node.url] || [],
      }));
    },
    rtmpStreamHref() {
      const nodes = this.infrastructure && Array.isArray(this.infrastructure.transcoders)
        ? this.infrastructure.transcoders
        : [];
      const primary = nodes.find((n) => n && n.rtmpTarget) || nodes[0];
      if (primary && primary.rtmpTarget) return primary.rtmpTarget;
      return 'rtmp://vimage3:1935/live/deforum';
    },
    hlsStreamHref() {
      return '/hls/live/deforum.m3u8';
    },
    frameStripThumbs() {
      return (this.thumbs || []).filter((thumb) => !!(thumb && (thumb.src || thumb.url || thumb.path)));
    },
    framesEmptyStatus() {
      const forgeUp = !!(this.forge && this.forge.available) || !!(this.apiHealth && this.apiHealth.sdForge && this.apiHealth.sdForge.available);
      if (!forgeUp) {
        return {
          label: 'Waiting for frames…',
          detail: 'Unknown (offline)',
          kind: 'unknown',
        };
      }
      const nextPollMs = Math.max(0, Number(this.framesRefreshBackoffMs) || 0);
      const etaSec = nextPollMs ? Math.max(1, Math.round(nextPollMs / 1000)) : 0;
      if (this.previewGenerating) {
        return {
          label: 'Rendering…',
          detail: etaSec ? `Next check ~${etaSec}s` : 'Checking soon',
          kind: 'loading',
        };
      }
      if (this.deforumPlaying) {
        return {
          label: 'Animating…',
          detail: etaSec ? `Next check ~${etaSec}s` : 'Checking soon',
          kind: 'loading',
        };
      }
      return {
        label: 'Waiting for frames…',
        detail: etaSec ? `Next check ~${etaSec}s` : 'Checking soon',
        kind: 'loading',
      };
    },
    selectedFrameThumb() {
      if (!this.frameStripThumbs.length) return null;
      if (!Number.isFinite(Number(this.selectedFrameIndex))) return this.frameStripThumbs[this.frameStripThumbs.length - 1] || null;
      const index = Math.min(this.frameStripThumbs.length - 1, Math.max(0, Number(this.selectedFrameIndex)));
      return this.frameStripThumbs[index] || null;
    },
    selectedFrameLabel() {
      return this.selectedFrameThumb ? `Frame ${this.frameLabel(this.selectedFrameThumb)}` : 'No frames';
    },
    currentProjectLabel() {
      return String(this.session || '').trim() || 'Project';
    },
    currentBatchLabel() {
      return String((this.deforumSettings && this.deforumSettings.batch_name) || '').trim() || '—';
    },
    deforumGeneratedFrameCount() {
      return this.frameStripThumbs.length;
    },
    deforumStreamFrameLabel() {
      const count = this.deforumGeneratedFrameCount;
      if (!count) return '';
      const latest = this.frameStripThumbs[count - 1];
      const latestNum = latest ? this.frameLabel(latest) : count;
      if (count === 1) return `1 frame generated (#${latestNum})`;
      return `${count} frames generated · latest #${latestNum}`;
    },
    activePreviewStillPath() {
      if (!this.deforumPlaying && this.currentTab === 'LIBRARY') {
        return this.librarySelectedFrameSrc || '';
      }
      if (!this.deforumPlaying && this.currentTab === 'LIVE') {
        return this.performance.lastPreviewPath
          || this.generator.lastPath
          || (this.selectedFrameThumb && (this.selectedFrameThumb.src || this.selectedFrameThumb.url || this.selectedFrameThumb.path))
          || '';
      }
      if (!this.deforumPlaying && !this.showMotionSequencerDock && this.selectedFrameThumb) {
        return this.selectedFrameThumb.src
          || this.selectedFrameThumb.url
          || this.selectedFrameThumb.path
          || this.performance.lastPreviewPath
          || this.generator.lastPath
          || '';
      }
      return this.performance.lastPreviewPath || this.generator.lastPath || '';
    },
    showMotionSequencerDock() {
      return this.currentTab === 'MOTION' && this.currentSubTab.MOTION === 'SEQUENCER';
    },
    showRightPanel() {
      if (this.currentTab === 'MOTION' && this.currentSubTab.MOTION === 'SEQUENCER') {
        return false;
      }
      return this.currentTab !== 'LIVE' || this.liveDrawerOpen;
    },
    rightPanelToggleIcon() {
      return this.showRightPanel ? 'arrow-right' : 'arrow-left';
    },
    rightPanelToggleTitle() {
      return this.showRightPanel ? 'Hide controls menu' : 'Show controls menu';
    },
    showDeforumVideo() {
      if (this.isWebglLayerActive && !this.isBlendLayerActive) return false;
      if (!this.isDeforumLayerActive && !this.isBlendLayerActive) return false;
      if (!this.videoReady) return false;
      // Empty HLS can reach "ready" without frames; keep WebGL visible until Deforum is actually running.
      return this.deforumPlaying || this.deforumGeneratedFrameCount > 0;
    },
    showDefaultAnimation() {
      // Ensure the stage is never empty on startup.
      if (this.isBlendLayerActive) return true;
      if (this.isWebglLayerActive) return true;
      if (this.isDeforumLayerActive) return !this.showDeforumVideo;
      if (!this.activeLayerPlaybackUrl && !this.showLayerInputVideo) return true;
      return false;
    },
    activeVideoLayer() {
      const layers = Array.isArray(this.videoLayers) ? this.videoLayers : [];
      return layers.find((layer) => layer.id === this.activeVideoLayerId) || layers[0] || null;
    },
    isWebglLayerActive() {
      return this.activeVideoLayer?.kind === 'webgl';
    },
    isDeforumLayerActive() {
      return this.activeVideoLayer?.kind === 'deforum';
    },
    isBlendLayerActive() {
      return this.activeVideoLayer?.kind === 'blend';
    },
    isInputLayerActive() {
      return this.activeVideoLayer?.kind === 'input';
    },
    activeLayerPlaybackUrl() {
      const layer = this.activeVideoLayer;
      if (!layer) return '';
      if (layer.kind === 'input') return this.inputLayerPlaybackUrl || layer.playbackUrl || '';
      if (layer.kind === 'library') return layer.playbackUrl || '';
      return '';
    },
    showLayerInputVideo() {
      const layer = this.activeVideoLayer;
      if (!layer || !this.activeLayerPlaybackUrl) return false;
      return layer.kind === 'input' || layer.kind === 'library';
    },
    appView() {
      return this;
    },
    videoLayerStatusLabel() {
      const layer = this.activeVideoLayer;
      if (!layer) return '—';
      if (layer.kind === 'webgl') return 'WebGL engine';
      if (layer.kind === 'blend') {
        if (this.showDeforumVideo) return 'WebGL + Deforum';
        return 'WebGL · waiting for Deforum';
      }
      if (layer.kind === 'deforum') {
        const frames = this.deforumGeneratedFrameCount;
        const frameSuffix = frames ? ` · ${frames} frame${frames === 1 ? '' : 's'}` : '';
        if (this.showDeforumVideo) return `Deforum live${frameSuffix}`;
        if (this.videoReady) return `Deforum ready${frameSuffix}`;
        if (this.deforumPlaying) return `Deforum warming up${frameSuffix}`;
        return frames ? `Deforum · ${frames} frame${frames === 1 ? '' : 's'}` : 'Waiting for Deforum';
      }
      if (layer.kind === 'input') {
        return this.activeLayerPlaybackUrl ? `Input · ${this.inputLayerLabel || 'Video'}` : 'Input · no source';
      }
      if (layer.kind === 'library') return `Layer · ${layer.label || 'Video'}`;
      if (layer.kind === 'cloud') return `Cloud · ${layer.label || 'Link'}`;
      return layer.label || 'Layer';
    },
    showPreviewStill() {
      if (this.isWebglLayerActive) return false;
      const shouldSurfaceStill = this.currentTab !== 'LIVE'
        || this.isDeforumLayerActive;
      return !!(!this.showDeforumVideo && !this.deforumPlaying && this.activePreviewStillPath && shouldSurfaceStill);
    },
    backgroundAudioMetrics() {
      const levels = Array.isArray(this.audioMappingLevels) ? this.audioMappingLevels.map((value) => Math.max(0, Math.min(1, Number(value) || 0))) : [];
      const bass = levels[0] || 0;
      const mid = levels[1] || 0;
      const treble = levels[2] || 0;
      const level = levels.length ? levels.reduce((sum, value) => sum + value, 0) / levels.length : 0;
      return {
        active: level > 0.01,
        level,
        bass,
        mid,
        treble,
        pulse: Math.min(1, bass * 0.7 + level * 0.3),
      };
    },
    availableOllamaNodes() {
      return (this.gpuPool.nodes || []).filter((node) => node && node.enabled && node.backend === 'ollama');
    },
    healthyOllamaNodes() {
      return this.availableOllamaNodes.filter((node) => node.status === 'healthy');
    },
    storyOllamaStatusLabel() {
      const healthy = this.healthyOllamaNodes;
      if (healthy.length) {
        const primary = healthy[0];
        const model = primary.model || primary.currentModel;
        const name = primary.name || primary.url || 'Ollama';
        const suffix = healthy.length > 1 ? ` (+${healthy.length - 1} more)` : '';
        return model ? `Ollama ready — ${model} on ${name}${suffix}` : `Ollama ready — ${name}${suffix}`;
      }
      const configured = this.availableOllamaNodes;
      if (configured.length) {
        const node = configured[0];
        return `Ollama unreachable — ${node.name || node.url}`;
      }
      if (this.gpuPool && this.gpuPool.loading) return 'Checking Ollama…';
      return 'Ollama not configured';
    },
    storyOllamaStatusTone() {
      if (this.healthyOllamaNodes.length) return 'ready';
      if (this.availableOllamaNodes.length) return 'warn';
      return 'off';
    },
    storyOllamaNeedsConfigure() {
      return this.healthyOllamaNodes.length === 0;
    },
    storyGeneratorSourceLabel() {
      const activeResult = this.generator && this.generator.result && this.generator.result.source;
      if (activeResult && activeResult.model) {
        return `Ollama ${activeResult.model}${activeResult.node && activeResult.node.name ? ' on ' + activeResult.node.name : ''}`;
      }
      const firstNode = this.availableOllamaNodes[0];
      if (firstNode) {
        return `Ollama ${firstNode.model || firstNode.currentModel || firstNode.name}`;
      }
      return 'Local fallback';
    },
    storyGeneratorStatusLabel() {
      if (this.generator.isGenerating) return 'Generating';
      if (this.generator.result) return 'Ready';
      return 'Idle';
    },
    storyGeneratorStatusLive() {
      return !!this.generator.isGenerating || !!this.generator.result;
    },
    storyGeneratorSceneCount() {
      return Math.max(2, Number(this.generator.numScenes) || 4);
    },
    storyGeneratorFrameCount() {
      return Number(this.deforumSettings && this.deforumSettings.max_frames)
        || Number(this.generator.totalFrames)
        || 96;
    },
    storyGeneratorFps() {
      return this.masterFps;
    },
    storyGeneratorSceneMeta() {
      const scenes = this.storyGeneratorSceneCount;
      const frames = this.storyGeneratorFrameCount;
      return `~${Math.ceil(frames / scenes)} frames per scene`;
    },
    storyGeneratorTimelineMeta() {
      const fps = this.storyGeneratorFps;
      const frames = this.storyGeneratorFrameCount;
      return `${(frames / fps).toFixed(1)}s timeline`;
    },
    storyGeneratorResolutionLabel() {
      const w = Number(this.deforumSettings && this.deforumSettings.W)
        || Number((this.generator.resolution || '1024x576').split('x')[0])
        || 1024;
      const h = Number(this.deforumSettings && this.deforumSettings.H)
        || Number((this.generator.resolution || '1024x576').split('x')[1])
        || 576;
      return `${w}×${h}`;
    },
    promptMorphBlendLinkedLfo() {
      const id = Number(this.prompts.morphBlendLfoLink || 0);
      if (!id) return null;
      return this.lfos.find((lfo) => lfo.id === id) || null;
    },
    promptMorphBlendLinkStatus() {
      const lfo = this.promptMorphBlendLinkedLfo;
      if (!lfo) return 'Manual control';
      return lfo.on ? `Linked to LFO ${lfo.id}` : `Linked to LFO ${lfo.id} (currently off)`;
    },
    loraCrossfaderLinkedLfo() {
      const id = Number(this.prompts.loraCrossfaderLfoLink || 0);
      if (!id) return null;
      return this.lfos.find((lfo) => lfo.id === id) || null;
    },
    loraCrossfaderLinkStatus() {
      const lfo = this.loraCrossfaderLinkedLfo;
      if (!lfo) return 'Manual control';
      return lfo.on ? `Linked to LFO ${lfo.id}` : `Linked to LFO ${lfo.id} (currently off)`;
    },
    currentLoraModelFamily() {
      return this.detectModelFamilyFromValue(
        this.forge.modelInfo,
        this.forge.currentModel || this.forge.selectedModel || this.forge.lastModel
      );
    },
    currentLoraModelFamilyLabel() {
      const labels = { sd15: 'SD1.5', sdxl: 'SDXL', flux: 'FLUX', zimage: 'Z-Image', svd: 'SVD' };
      return labels[this.currentLoraModelFamily] || 'Unknown';
    },
    loraBrowserFamilies() {
      const defs = [
        { key: 'sd15', label: 'SD1.5' },
        { key: 'sdxl', label: 'SDXL' },
        { key: 'flux', label: 'FLUX' },
        { key: 'svd', label: 'SVD' },
      ];
      const active = this.currentLoraModelFamily;
      return defs
        .map((family) => ({
          ...family,
          items: this.loras.available.filter((lora) => (lora.family || 'sd15') === family.key),
          compatible: !active || active === family.key,
          collapsed: this.loras.familyCollapsed[family.key] !== false,
        }))
        .filter((family) => !active || family.compatible);
    },
    compatibleLoraFamilies() {
      return this.loraBrowserFamilies
        .map((family) => ({ ...family, items: family.items.filter(Boolean) }))
        .filter((family) => family.items.length);
    },
    loraCrossfaderReady() {
      return this.loras.groupA.length > 0 && this.loras.groupB.length > 0;
    },
    loraCrossfaderBlending() {
      return !!this.prompts.loraCrossfaderOn && this.loraCrossfaderReady;
    },
    loraCrossfaderStatusLabel() {
      return this.prompts.loraCrossfaderOn ? 'Enabled' : 'Disabled';
    },
    loraCrossfaderSummary() {
      const aCount = this.loras.groupA.length;
      const bCount = this.loras.groupB.length;
      const aMix = ((1 - this.prompts.crossfaderValue) * 100).toFixed(0);
      const bMix = (this.prompts.crossfaderValue * 100).toFixed(0);
      if (!this.prompts.loraCrossfaderOn) {
        return 'Crossfader is off. Click Enabled to blend A/B LoRA groups.';
      }
      if (!aCount && !bCount) {
        return 'Assign LoRAs to A and B groups to crossfade.';
      }
      if (!this.loraCrossfaderReady) {
        return `Needs LoRAs in both groups. Current assignment: A ${aCount}, B ${bCount}.`;
      }
      return `A ${aCount} · B ${bCount} · mix ${aMix}% / ${bMix}%`;
    },
    modelStatusKind() {
      if (this.forge.switching || this.forge.loading) return 'loading';
      if (this.forge.available || (this.apiHealth.sdForge && this.apiHealth.sdForge.available)) return 'ready';
      return 'offline';
    },
    modelStatusLabel() {
      if (this.modelStatusKind === 'loading') return 'Loading';
      if (this.modelStatusKind === 'ready') return 'Ready';
      return 'Offline';
    },
    engineCurrentModelName() {
      return this.normalizeModelName(
        (this.deforumSettings && this.deforumSettings.sd_model_name)
        || this.forge.currentModel
        || this.forge.selectedModel
        || this.forge.lastModel
      );
    },
    engineCurrentModelFamily() {
      return this.detectModelFamilyFromValue(this.forge.modelInfo, this.engineCurrentModelName);
    },
    engineCurrentModelFamilyLabel() {
      const labels = { sd15: 'SD1.5', sdxl: 'SDXL', flux: 'FLUX', zimage: 'Z-Image', svd: 'SVD' };
      return labels[this.engineCurrentModelFamily] || 'Generic';
    },
    engineModelFamilyTabs() {
      return [
        { key: 'sd15', label: 'SD1.5' },
        { key: 'sdxl', label: 'SDXL' },
        { key: 'flux', label: 'Flux' },
        { key: 'zimage', label: 'Z-Image' },
        { key: 'other', label: 'Other' },
      ];
    },
    groupedEngineModels() {
      const groups = { sd15: [], sdxl: [], flux: [], zimage: [], other: [] };
      (this.forge.models || []).forEach((model) => {
        const family = this.detectModelFamilyFromValue(
          model.metadata,
          `${model.title || ''} ${model.model_name || ''}`
        );
        const bucket = groups[family] ? family : 'other';
        groups[bucket].push(model);
      });
      Object.keys(groups).forEach((key) => {
        groups[key].sort((a, b) => String(a.title || a.model_name || '').localeCompare(String(b.title || b.model_name || '')));
      });
      return groups;
    },
    activeEngineModelList() {
      const tab = this.engineModelPickerTab || 'sd15';
      return this.groupedEngineModels[tab] || [];
    },
    engineCurrentCfgScale() {
      const fallback = Number(this.forge.options && this.forge.options.cfg_scale)
        || Number((this.liveVibe.find((param) => param.key === 'cfgscale') || {}).val)
        || 7;
      return this.readFirstNumericValue(
        (this.deforumSettings && (this.deforumSettings.cfg_scale_schedule || this.deforumSettings.distilled_cfg_scale_schedule)) || '',
        fallback
      );
    },
    engineCurrentSteps() {
      return this.currentStepsValue();
    },
    engineSamplerOptions() {
      return [...new Set([
        this.deforumSettings && this.deforumSettings.sampler,
        this.forge.options && this.forge.options.sampler_name,
        this.gpuPool && this.gpuPool.forgeModal && this.gpuPool.forgeModal.options && this.gpuPool.forgeModal.options.sampler_name,
        ...(this.forge.samplers || []),
      ].map((value) => String(value || '').trim()).filter(Boolean))];
    },
    engineSchedulerOptions() {
      return [...new Set([
        this.deforumSettings && this.deforumSettings.scheduler,
        this.forge.options && this.forge.options.scheduler,
        this.gpuPool && this.gpuPool.forgeModal && this.gpuPool.forgeModal.options && this.gpuPool.forgeModal.options.scheduler,
        ...(this.forge.schedulers || []),
      ].map((value) => String(value || '').trim()).filter(Boolean))];
    },
    activeDeforumFieldGroup() {
      return this.deforumFieldGroups.find((group) => group.id === this.deforumActiveTab) || this.deforumFieldGroups[0] || null;
    },
    engineOptimizedDefaults() {
      return this.optimizedDefaultsForModel(this.engineCurrentModelName);
    },
    engineOptimizedProfileLabel() {
      return (this.engineOptimizedDefaults && this.engineOptimizedDefaults.profileLabel) || 'Manual / custom';
    },
    paramPanelGroups() {
      return [
        { label: 'Style', items: this.liveVibe },
        { label: 'Camera', items: this.liveCam },
      ];
    },
    pinnedParamItems() {
      const allParams = [...this.liveVibe, ...this.liveCam];
      return this.pinnedParams
        .map(key => allParams.find(p => p.key === key))
        .filter(Boolean);
    },
    audioReactiveActive() {
      return ['Audio sent to mediator', 'Streaming'].includes(this.audioStatus);
    },
    audioSpectrumPlaying() {
      const el = this.$refs && this.$refs.avSyncAudio;
      return !!(el && this.audio.objectUrl && !el.paused && !el.ended);
    },
    audioBandTabDefs() {
      return [
        { key: 'low', label: 'Low' },
        { key: 'mid', label: 'Mid' },
        { key: 'high', label: 'High' },
      ];
    },
    activeAudioMappingIndex() {
      const tabs = this.audioBandTabDefs;
      const key = this.audioActiveBandTab;
      const idx = tabs.findIndex((tab) => tab.key === key);
      return idx >= 0 ? idx : 0;
    },
    activeAudioMapping() {
      return this.audioMappings[this.activeAudioMappingIndex] || this.audioMappings[0] || null;
    },
    audioSpectrumBandLabels() {
      return this.audioBandTabDefs.map((tab) => tab.label);
    },
    audioSpectrumBandColors() {
      try {
        const s = getComputedStyle(document.documentElement)
        const v = (name) => s.getPropertyValue(name).trim()
        return [v('--band-low'), v('--band-mid'), v('--band-high')].filter(Boolean);
      } catch (_e) {
        return [];
      }
    },
    liveModulating() {
      const paramMap = {};
      [...this.liveVibe, ...this.liveCam].forEach(p => { paramMap[p.key] = p; });
      this.modulationTargets.forEach(t => {
        if (!paramMap[t.key]) {
          const animField = t.field;
          const val = animField && this.defaultAnimation
            ? Number(this.defaultAnimation[animField])
            : (t.default || 0);
          paramMap[t.key] = {
            key: t.key,
            label: t.label,
            val: Number.isFinite(val) ? val : (t.default || 0),
            min: t.min || 0,
            max: t.max || 1,
          };
        }
      });
      const modulated = {};
      this.lfos.filter(l => l.on && l.targets.length).forEach(l => {
        l.targets.forEach(key => {
          if (!modulated[key]) modulated[key] = { key, sources: [] };
          modulated[key].sources.push(`LFO ${l.id}`);
        });
      });
      this.macrosRack.filter(m => m.on && m.target).forEach(m => {
        const key = m.target;
        if (!modulated[key]) modulated[key] = { key, sources: [] };
        modulated[key].sources.push('Macro');
      });
      if (this.audioReactiveActive) {
        this.audioMappings.forEach((mapping) => {
          if (!mapping || !mapping.param) return;
          if (!modulated[mapping.param]) modulated[mapping.param] = { key: mapping.param, sources: [] };
          modulated[mapping.param].sources.push('Audio');
        });
      }
      [
        { key: 'translation_x', active: Math.abs(Number(this.motionPadValues.translation_x) || 0) > 0.01 },
        { key: 'translation_y', active: Math.abs(Number(this.motionPadValues.translation_y) || 0) > 0.01 },
      ].forEach(({ key, active }) => {
        if (!active) return;
        if (!modulated[key]) modulated[key] = { key, sources: [] };
        modulated[key].sources.push('XY');
      });
      return Object.values(modulated).map(entry => {
        const p = paramMap[entry.key] || { key: entry.key, label: entry.key, val: 0, min: 0, max: 1 };
        return { ...p, source: entry.sources.join(' + ') };
      });
    },
    liveModulationSlots() {
      const mods = Array.isArray(this.liveModulating) ? this.liveModulating : [];
      const pick = (i) => mods[i] || null;
      const fmtVal = (v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return '—';
        return Math.abs(n) >= 10 ? n.toFixed(1) : n.toFixed(2);
      };
      const shadeFrom = (p) => {
        if (!p) return 35;
        const min = Number(p.min ?? 0);
        const max = Number(p.max ?? 1);
        const val = Number(p.val ?? 0);
        const t = (val - min) / ((max - min) || 1);
        return Math.round(30 + Math.max(0, Math.min(1, t)) * 70);
      };

      const sliderSlot = (p, label) => ({
        kind: 'slider',
        label,
        paramKey: p?.key || '',
        mappingLabel: p?.source && p.source !== 'Manual' ? p.source : '',
        min: p?.min ?? 0,
        max: p?.max ?? 1,
        step: p?.step ?? 0.01,
        value: p?.val ?? 0,
        valueLabel: fmtVal(p?.val),
        shade: shadeFrom(p),
      });

      const knobSlot = (p, label) => ({
        kind: 'knob',
        label,
        paramKey: p?.key || '',
        mappingLabel: p?.source && p.source !== 'Manual' ? p.source : '',
        min: p?.min ?? 0,
        max: p?.max ?? 1,
        step: p?.step ?? 0.01,
        value: p?.val ?? 0,
        valueLabel: fmtVal(p?.val),
      });

      const xySlot = (px, py, label) => {
        const xMin = Number(px?.min ?? 0);
        const xMax = Number(px?.max ?? 1);
        const yMin = Number(py?.min ?? 0);
        const yMax = Number(py?.max ?? 1);
        const xVal = Number(px?.val ?? 0);
        const yVal = Number(py?.val ?? 0);
        const nx = (xVal - xMin) / ((xMax - xMin) || 1);
        const ny = (yVal - yMin) / ((yMax - yMin) || 1);
        const clx = Math.max(0, Math.min(1, Number.isFinite(nx) ? nx : 0));
        const cly = Math.max(0, Math.min(1, Number.isFinite(ny) ? ny : 0));
        return {
          kind: 'xypad',
          label,
          paramKey: '',
          paramKeyX: px?.key || '',
          paramKeyY: py?.key || '',
          mappingLabel: [px?.source, py?.source].filter((s) => s && s !== 'Manual').join(' · '),
          x: clx,
          y: cly,
          xLabel: fmtVal(xVal),
          yLabel: fmtVal(yVal),
          puckStyle: { left: `${clx * 100}%`, top: `${(1 - cly) * 100}%` },
        };
      };

      return [
        sliderSlot(pick(0), 'Slider 1'),
        sliderSlot(pick(1), 'Slider 2'),
        xySlot(pick(2), pick(3), 'XY Pad 1'),
        xySlot(pick(4), pick(5), 'XY Pad 2'),
        knobSlot(pick(6), 'Knob 1'),
        knobSlot(pick(7), 'Knob 2'),
      ];
    },
    recentRunsRail() {
      return [...this.runsAll]
        .sort((a, b) => {
          const aTime = a && a.started_at ? new Date(a.started_at).getTime() : 0;
          const bTime = b && b.started_at ? new Date(b.started_at).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 4);
    },
    libraryRailRuns() {
      return [...this.runsAll].sort((a, b) => {
        const aTime = a && a.started_at ? new Date(a.started_at).getTime() : 0;
        const bTime = b && b.started_at ? new Date(b.started_at).getTime() : 0;
        return bTime - aTime;
      });
    },
    librarySelectedRunSummary() {
      return this.libraryRailRuns.find((run) => run.run_id === this.library.selectedRunId)
        || this.libraryRailRuns[0]
        || null;
    },
    librarySelectedRunDetail() {
      return this.library.runDetail && this.librarySelectedRunSummary && this.library.runDetail.run_id === this.librarySelectedRunSummary.run_id
        ? this.library.runDetail
        : null;
    },
    librarySelectedFrames() {
      return Array.isArray(this.librarySelectedRunDetail && this.librarySelectedRunDetail.frames)
        ? this.librarySelectedRunDetail.frames
        : [];
    },
    librarySelectedFrameResolved() {
      if (!this.librarySelectedFrames.length) return '';
      if (this.librarySelectedFrames.includes(this.library.selectedFrameName)) return this.library.selectedFrameName;
      return this.librarySelectedFrames[0];
    },
    librarySelectedFrameIndex() {
      return this.librarySelectedFrames.indexOf(this.librarySelectedFrameResolved);
    },
    libraryVisibleFrames() {
      if (!this.librarySelectedFrames.length) return [];
      const current = this.librarySelectedFrameIndex >= 0 ? this.librarySelectedFrameIndex : 0;
      const start = Math.max(0, current - 24);
      return this.librarySelectedFrames.slice(start, start + 49);
    },
    librarySelectedFrameSrc() {
      if (!this.librarySelectedRunSummary || !this.librarySelectedFrameResolved) return '';
      return `/api/runs/${encodeURIComponent(this.librarySelectedRunSummary.run_id)}/frames/${encodeURIComponent(this.librarySelectedFrameResolved)}`;
    },
    librarySelectedFrameLabel() {
      if (!this.librarySelectedFrameResolved) return 'No frame selected';
      const parsed = this.parseFrameNumber(this.librarySelectedFrameResolved);
      return Number.isFinite(parsed) && parsed >= 0 ? `Frame ${parsed}` : this.librarySelectedFrameResolved;
    },
    sessionCatalog() {
      try {
        if (typeof window === 'undefined' || !window.localStorage) return [];
        const storage = window.localStorage;
        const names = new Set();
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (!key) continue;
          if (key.startsWith('defora_session_') && !key.endsWith('__touchedAt') && !key.endsWith('__restoreDeclinedAt')) {
            names.add(key.replace(/^defora_session_/, ''));
          }
        }
        names.add(String(this.session || 'default'));

        const sessionList = [...names].map((name) => {
          const touchedRaw = storage.getItem(`defora_session_${name}__touchedAt`);
          const touchedAt = touchedRaw != null ? Number(touchedRaw) : NaN;
          const runs = (this.runsAll || []).filter((r) => {
            const id = String(r && r.run_id ? r.run_id : '');
            if (!id) return false;
            return id === name || id.startsWith(`${name}_`) || id.startsWith(`${name}-`) || id.includes(name);
          });
          let images = 0;
          let videos = 0;
          runs.forEach((r) => {
            const frames = Number(r && (r.frame_count ?? r.frames ?? r.length_frames ?? 0)) || 0;
            if (frames > 1) videos += 1;
            else images += 1;
          });
          return {
            name,
            touchedAt: Number.isFinite(touchedAt) ? touchedAt : 0,
            images,
            videos,
            runs: runs.length,
          };
        });

        return sessionList.sort((a, b) => (b.touchedAt || 0) - (a.touchedAt || 0) || a.name.localeCompare(b.name));
      } catch (_e) {
        return [];
      }
    },
    targetOwners() {
      const map = {};
      this.lfos.forEach(l => {
        if (!l.on) return;
        l.targets.forEach(key => {
          if (!map[key]) map[key] = [];
          map[key].push(`LFO ${l.id}`);
        });
      });
      this.macrosRack.forEach((m, idx) => {
        if (!m.on || !m.target) return;
        if (!map[m.target]) map[m.target] = [];
        map[m.target].push(`Macro ${idx + 1}`);
      });
      return map;
    },
    activeSlot() {
      return this.cn.slots.find((s) => s.id === this.cn.active) || this.cn.slots[0];
    },
    currentControlNetModelFamily() {
      return this.engineCurrentModelFamily || this.currentLoraModelFamily || '';
    },
    currentControlNetModelFamilyLabel() {
      const labels = { sd15: 'SD1.5', sdxl: 'SDXL', flux: 'FLUX', svd: 'SVD' };
      return labels[this.currentControlNetModelFamily] || 'Generic';
    },
    controlNetCompatibleModels() {
      const activeFamily = this.currentControlNetModelFamily;
      return (this.cn.availableModels || []).filter((model) => {
        const family = this.detectModelFamilyFromValue(null, `${model && model.name ? model.name : ''} ${model && model.id ? model.id : ''}`);
        return !activeFamily || !family || family === activeFamily;
      });
    },
    activeControlNetModelIsCompatible() {
      const selected = String(this.activeSlot && this.activeSlot.model || '').trim();
      if (!selected) return true;
      const selectedFamily = this.detectModelFamilyFromValue(null, selected);
      if (!this.currentControlNetModelFamily || !selectedFamily) return true;
      return selectedFamily === this.currentControlNetModelFamily;
    },
    activeControlNetModelChoices() {
      const selected = String(this.activeSlot && this.activeSlot.model || '').trim();
      const hasSelectedOption = this.controlNetCompatibleModels.some((model) => model && model.name === selected);
      if (!selected || hasSelectedOption) return this.controlNetCompatibleModels;
      const matched = (this.cn.availableModels || []).find((model) => model && model.name === selected);
      return [
        {
          ...(matched || { id: `current-${selected.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name: selected, category: 'current' }),
          current: true,
          incompatible: !this.activeControlNetModelIsCompatible,
        },
        ...this.controlNetCompatibleModels,
      ];
    },
    controlNetModelSummary() {
      const count = this.controlNetCompatibleModels.length;
      if (this.currentControlNetModelFamily) {
        return `Showing ${count} ${this.currentControlNetModelFamilyLabel}-compatible models.`;
      }
      return `Showing ${count} available models.`;
    },
    controlNetWeightPercent() {
      return Math.max(0, Math.min(100, ((Number(this.activeSlot && this.activeSlot.weight) || 0) / 2) * 100));
    },
    controlNetWeightLabel() {
      const weight = Number(this.activeSlot && this.activeSlot.weight) || 0;
      if (weight < 0.35) return 'Very subtle';
      if (weight < 0.75) return 'Subtle';
      if (weight < 1.1) return 'Balanced';
      if (weight < 1.5) return 'Strong';
      return 'Very strong';
    },
    modulationTargets() {
      return [...this.lfoTargets, ...this.animationTargets];
    },
    lfoTargetGroups() {
      const groups = {};
      this.modulationTargets.forEach((target) => {
        const label = target.group || "Other";
        if (!groups[label]) groups[label] = [];
        groups[label].push(target);
      });
      return Object.entries(groups).map(([label, items]) => ({ label, items }));
    },
    sequencerParamOptions() {
      const opts = this.modulationTargets.map((t) => ({ key: t.key, label: t.label }));
      this.cn.slots.forEach((s) => {
        opts.push({ key: `cn_${s.id}_weight`, label: `CN ${s.id} Weight`, group: "ControlNet" });
        opts.push({ key: `cn_${s.id}_start`, label: `CN ${s.id} Start`, group: "ControlNet" });
        opts.push({ key: `cn_${s.id}_end`, label: `CN ${s.id} End`, group: "ControlNet" });
      });
      return opts;
    },
    audioBandChips() {
      return Object.entries(this.audioBandPresets).map(([key, v]) => ({
        key,
        label: v.label,
        freq_min: v.freq_min,
        freq_max: v.freq_max,
      }));
    },
    sortedSequencerMarkers() {
      const raw = (this.sequencer && this.sequencer.markers) || [];
      return [...raw].sort((a, b) => a.t - b.t);
    },
    sortedSequencerClips() {
      const raw = (this.sequencer && this.sequencer.clips) || [];
      return [...raw].sort((a, b) => a.t - b.t);
    },
    sequencerClipSummary() {
      const clips = this.sortedSequencerClips;
      const count = (type) => clips.filter((c) => c.type === type).length;
      return { prompt: count('prompt'), lora: count('lora'), controlnet: count('controlnet') };
    },
    masterFps() {
      const n = Number(this.deforumSettings && this.deforumSettings.fps);
      return Math.max(1, Math.min(120, Number.isFinite(n) && n > 0 ? Math.round(n) : 24));
    },
    sequencerJobFps() {
      return this.masterFps;
    },
    sequencerJobTotalFrames() {
      const fromDeforum = Number(this.deforumSettings && this.deforumSettings.max_frames);
      if (Number.isFinite(fromDeforum) && fromDeforum > 0) {
        return Math.floor(fromDeforum);
      }
      const fps = this.sequencerJobFps;
      const dur = Number(this.sequencer && this.sequencer.durationSec) || 0;
      return Math.max(1, Math.ceil(dur * fps));
    },
    sequencerJobTimeSec() {
      if (this.sequencerPlaying) {
        return Number(this.sequencerPlayhead) || 0;
      }
      if (this.deforumPlaying && this.showMotionSequencerDock) {
        return Number(this.jobPlaybackTimeSec) || 0;
      }
      return Number(this.sequencerPlayhead) || 0;
    },
    sequencerJobFrameIndex() {
      const fps = this.sequencerJobFps;
      const total = this.sequencerJobTotalFrames;
      const idx = Math.floor((Number(this.sequencerJobTimeSec) || 0) * fps + 1e-6);
      return Math.min(total - 1, Math.max(0, idx));
    },
    sequencerJobFrameNumber() {
      return this.sequencerJobFrameIndex + 1;
    },
    sequencerJobFrameLabel() {
      return `Frame ${this.sequencerJobFrameNumber} / ${this.sequencerJobTotalFrames}`;
    },
    sequencerJobFrameProgressPct() {
      const total = this.sequencerJobTotalFrames;
      if (total <= 1) return 0;
      return (this.sequencerJobFrameIndex / (total - 1)) * 100;
    },
    sequencerJobFrameLive() {
      return !!this.sequencerPlaying || !!this.deforumPlaying;
    },
    sequencerCalculatedDuration() {
      if (!this.sequencer.bpmSync) return "—";
      const bpm = Math.max(1, this.sequencer.bpm || 120);
      const beats = (this.sequencer.bars || 4) * (this.sequencer.beatsPerBar || 4);
      const duration = (beats / bpm) * 60;
      return duration.toFixed(2);
    },
    selectedSequencerTrack() {
      return this.sequencer.tracks.find((track) => track.id === this.sequencerSelectedTrackId) || this.sequencer.tracks[0] || null;
    },
    sequencerParamMetaMap() {
      const meta = {};
      this.modulationTargets.forEach((target) => {
        meta[target.key] = {
          label: target.label,
          min: Number(target.min ?? 0),
          max: Number(target.max ?? 1),
        };
      });
      this.cn.slots.forEach((slot) => {
        meta[`cn_${slot.id}_weight`] = { label: `CN ${slot.id} Weight`, min: 0, max: 2 };
        meta[`cn_${slot.id}_start`] = { label: `CN ${slot.id} Start`, min: 0, max: 1 };
        meta[`cn_${slot.id}_end`] = { label: `CN ${slot.id} End`, min: 0, max: 1 };
      });
      return meta;
    },
    selectedModulationLfo() {
      return this.lfos.find((lfo) => lfo.id === this.modulationSelectedLfoId) || this.lfos[0] || null;
    },
    motionPadPuckStyle() {
      const range = 10;
      const xPct = ((this.motionPadValues.translation_x + range) / (range * 2)) * 100;
      const yPct = (1 - ((this.motionPadValues.translation_y + range) / (range * 2))) * 100;
      return {
        left: `${Math.min(100, Math.max(0, xPct))}%`,
        top: `${Math.min(100, Math.max(0, yPct))}%`,
      };
    },
    motionPadReadout() {
      return {
        x: Number(this.motionPadValues.translation_x || 0),
        y: Number(this.motionPadValues.translation_y || 0),
        z: Number(this.motionPadValues.translation_z || 0),
        zoom: Number(this.motionPadValues.zoom ?? 1),
      };
    },
    savedMotionPresetNames() {
      return Object.keys(this.motionStylesSaved || {}).sort((a, b) => a.localeCompare(b));
    },
    morphHudSummary() {
      const slots = Array.isArray(this.performance.slots) ? this.performance.slots : [];
      const summarize = (sideKey) => {
        if (!slots.length) return `No ${sideKey} slots`;
        const labels = slots
          .slice(0, 2)
          .map((slot) => {
            if (slot.type === 'param' && slot.paramKey) {
              const meta = this.modulationTargetByKey(slot.paramKey);
              return meta ? meta.label : this.slotTypeLabel(slot.type);
            }
            return this.slotTypeLabel(slot.type);
          });
        const extra = slots.length > 2 ? ` +${slots.length - 2}` : '';
        return `${sideKey} · ${labels.join(' / ')}${extra}`;
      };
      return {
        a: summarize('A'),
        b: summarize('B'),
      };
    },
    bindingGroups() {
      const groups = {};
      this.modulationTargets.forEach((t) => {
        const label = t.group || "Other";
        if (!groups[label]) groups[label] = [];
        groups[label].push(t);
      });
      return Object.entries(groups).map(([label, items]) => ({ label, items }));
    },
    modulationSubtabSummary() {
      const sub = this.normalizeModulationSubTab(this.currentSubTab.MODULATION);
      if (sub === 'LFO') {
        const active = this.lfos.filter((l) => l.on).length;
        return `${active}/${this.lfos.length} LFO active`;
      }
      if (sub === 'AV_SYNC') {
        if (this.avSyncEnabled && this.audio.objectUrl) return 'A/V sync on';
        return this.audio.objectUrl ? 'A/V sync off' : 'Upload track';
      }
      if (sub === 'AUDIO_REACTIVE') {
        return this.audioReactiveActive ? 'Audio live' : 'Audio idle';
      }
      if (sub === 'BEAT_MACROS') {
        return this.beatMacroOn ? 'Beat macros on' : 'Beat macros off';
      }
      if (sub === 'ACTIVE_MODS') {
        return this.liveModulating.length ? `${this.liveModulating.length} modulated` : 'No active mods';
      }
      if (sub === 'CROSSFADER') {
        return `${this.morphHudSummary.a} · ${this.morphHudSummary.b}`;
      }
      return '';
    },
  },
  watch: {
    sequencer: {
      handler() {
        this.$nextTick(() => this.drawTimeline());
      },
      deep: true,
    },
    'sequencer.fps'(next) {
      if (this._syncingGlobalFps) return;
      this.setGlobalFps(next, { source: 'sequencer' });
    },
    'generator.fps'(next) {
      if (this._syncingGlobalFps) return;
      this.setGlobalFps(next, { source: 'generator' });
    },
    sequencerPlayhead() {
      this.$nextTick(() => this.drawTimeline());
    },
    'performance.crossfader'() {
      this.applyCrossfadeMorph();
      this.saveSessionState();
    },
    session() {
      this.saveSessionState();
    },
    showDefaultAnimation(visible) {
      if (visible) this.$nextTick(() => this.kickstandbyAnimation());
    },
    deforumGeneratedFrameCount(count) {
      if (count > 0) this.maybePromoteDeforumPreview();
    },
    deforumPlaying(playing) {
      if (playing) this.maybePromoteDeforumPreview();
    },
    videoReady(ready) {
      if (ready) this.maybePromoteDeforumPreview();
    },
    currentTab(tab) {
      if (tab === 'LIBRARY') void this.refreshRuns();
    },
  },
  mounted() {
    // Restore prompt: if we have saved UI state and current state differs, ask before applying.
    if (!this.checkAndPromptSessionRestore()) {
      this.loadSessionState();
    }
    this.initVideoLayers();
    this.applyStartupVideoPreview();
    this.ensureStandbyAnimationAtStartup();
    this.syncMotionPadFromPayload(this.motionPresets[this.motionSelectedPreset] || { translation_x: 0, translation_y: 0 });
    this.applyCrossfadeMorph();
    this.loadMotionStyles();
    this.loadBindings();
    this.refreshPresets();
    this.refreshSharedPresets();
    this.refreshGpuPool(false);
    this.loadControlNetModels();
    this.refreshPlugins();
    this.syncDeforumSettingsJson();
    const deforumSettingsPromise = this.loadDeforumSettings({ syncServerModel: false });
    const forgeRefreshPromise = this.refreshForgeAll();
    deforumSettingsPromise.finally(() => {
      if (!this.deforumPlaying) this.schedulePreviewFrame();
    });
    Promise.allSettled([deforumSettingsPromise, forgeRefreshPromise]).then(() => {
      this.restoreLastModel();
      this.runStartupWarmup();
    });
    this.scanMidi();
    this.connectWebSocket();
    this.attachPlayer();
    if (typeof fetch === "function") {
      const cachedThumbs = this.loadCachedFrameThumbs();
      if (cachedThumbs.length) {
        this.thumbs = cachedThumbs;
        this.updateFrameSelection("");
      }
      const scheduleFramesPoll = () => {
        this.refreshFrames().finally(() => {
          this.framesTimer = setTimeout(scheduleFramesPoll, this.framesRefreshBackoffMs || 5000);
        });
      };
      scheduleFramesPoll();
      const scheduleHealthPoll = () => {
        this.refreshApiHealth().finally(() => {
          this.apiStatusTimer = setTimeout(scheduleHealthPoll, this.apiHealthBackoffMs || 15000);
        });
      };
      scheduleHealthPoll();
    }
    this.playbackTimer = setInterval(() => this.ensureLivePlayback(), 4000);
    this.lfoTimer = setInterval(() => this.runLfos(), 120);
    this.beatTimer = setInterval(() => this.processBeat(), 50);
    this.startLfoAnimation();
    this.setupKeyboardShortcuts();
    this.refreshRuns();
    this.$nextTick(() => {
      this.refreshSequencerList();
      setTimeout(() => this.drawTimeline(), 200);
      this.kickstandbyAnimation();
    });
    this.initPromptHistory();
    this.refreshServiceHealth();
  },
  beforeUnmount() {
    this.disposeLiveAudioAnalyser();
    this.stopSequencerPlayback();
    if (this.framesTimer) clearTimeout(this.framesTimer);
    if (this.apiStatusTimer) clearTimeout(this.apiStatusTimer);
    if (this.playbackTimer) clearInterval(this.playbackTimer);
    if (this.lfoTimer) clearInterval(this.lfoTimer);
    if (this.beatTimer) clearInterval(this.beatTimer);
    if (this.previewDebounceTimer) clearTimeout(this.previewDebounceTimer);
    if (this.deforumPreviewTimer) clearTimeout(this.deforumPreviewTimer);
    if (this.frameRefreshTimer) clearTimeout(this.frameRefreshTimer);
    if (this.wsReconnectTimer) clearTimeout(this.wsReconnectTimer);
    this.stopLfoAnimation();
    if (this.playerEl) {
      this.detachPlayerListeners(this.playerEl);
    }
    if (this.hls && this.hls.destroy) {
      this.hls.destroy();
      this.hls = null;
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("keydown", this._keyHandler);
    }
  },
  methods: {

  cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  },

  themeColor(name, fallback) {
    return this.cssVar(name) || fallback
  },

  sanitizeSessionName(raw) {
    return String(raw || '')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 60) || 'default';
  },
  selectSession(name) {
    const next = this.sanitizeSessionName(name);
    this.session = next;
    try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('defora_session', next); } catch (_e) {}
    this.loadSessionState();
    this.saveSessionState();
  },
  createNewSession() {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const next = this.sanitizeSessionName(`session_${stamp}`);
    this.selectSession(next);
  },
  purgeSession(name) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const clean = this.sanitizeSessionName(name);
      window.localStorage.removeItem(`defora_session_${clean}`);
      window.localStorage.removeItem(`defora_session_${clean}__touchedAt`);
      window.localStorage.removeItem(`defora_session_${clean}__restoreDeclinedAt`);
      if (clean === this.session) {
        this.selectSession('default');
      }
    } catch (_e) {}
  },
  restoreSession(name) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const clean = this.sanitizeSessionName(name);
      const raw = window.localStorage.getItem(`defora_session_${clean}`);
      if (!raw) return;
      this.pendingSessionStateRaw = raw;
      this.session = clean;
      try { window.localStorage.setItem('defora_session', clean); } catch (_e) {}
      this.clearSessionRestoreDeclined();
      this.loadSessionState();
      this.saveSessionState();
    } catch (_e) {}
  },

  async refreshApiHealth() {
    if (typeof fetch !== "function") return;
    try {
      const res = await fetch("/api/status");
      if (!res.ok) {
        this.apiHealthBackoffMs = Math.min(120000, (this.apiHealthBackoffMs || 15000) * 2);
        return;
      }
      const j = await res.json();
      if (j && j.sdForge) {
        this.apiHealth = { sdForge: { ...j.sdForge } };
        this.forge.available = !!j.sdForge.available;
      }
      this.apiHealthBackoffMs = 15000;
    } catch (_e) {
      this.apiHealthBackoffMs = Math.min(120000, (this.apiHealthBackoffMs || 15000) * 2);
    }
  },

  async refreshServiceHealth() {
    if (typeof fetch !== 'function') return;
    const startedAt = Date.now();
    this.serviceHealth.loading = true;
    this.serviceHealth.lastChecked = new Date().toISOString();
    const next = {
      web: { ok: false },
      hls: { updated: null, ageMs: null },
      stream: { status: 'unknown' },
    };

    const safeJson = async (res) => {
      try { return await res.json(); } catch (_e) { return null; }
    };

    await Promise.allSettled([
      (async () => {
        try {
          const res = await fetch('/health', { cache: 'no-store' });
          next.web.ok = !!res.ok;
        } catch (_e) {
          next.web.ok = false;
        }
      })(),
      (async () => {
        try {
          const res = await fetch('/api/health', { cache: 'no-store' });
          if (!res.ok) return;
          const j = await safeJson(res);
          const updated = j && j.updated != null ? Number(j.updated) : null;
          next.hls.updated = Number.isFinite(updated) ? updated : null;
          if (next.hls.updated != null) next.hls.ageMs = Math.max(0, Date.now() - next.hls.updated);
        } catch (_e) {
          /* ignore */
        }
      })(),
      (async () => {
        try {
          const res = await fetch('/api/stream/status', { cache: 'no-store' });
          if (!res.ok) return;
          const j = await safeJson(res);
          next.stream.status = (j && j.status) ? String(j.status) : 'unknown';
        } catch (_e) {
          /* ignore */
        }
      })(),
    ]);

    this.serviceHealth.web = next.web;
    this.serviceHealth.hls = next.hls;
    this.serviceHealth.stream = next.stream;
    this.serviceHealth.lastChecked = new Date().toISOString();
    this.serviceHealth.loading = false;
    // keep a tiny status breadcrumb
    const dt = Date.now() - startedAt;
    if (dt > 1500 && this.performance && this.performance.status === '') {
      this.performance.status = `Service health refreshed (${dt}ms)`;
      setTimeout(() => { if (this.performance.status && this.performance.status.startsWith('Service health refreshed')) this.performance.status = ''; }, 2500);
    }
  },
  syncLibrarySelection() {
    if (!this.libraryRailRuns.length) {
      this.library.selectedRunId = '';
      this.library.selectedFrameName = '';
      this.library.runDetail = null;
      return;
    }
    if (!this.libraryRailRuns.some((run) => run.run_id === this.library.selectedRunId)) {
      this.library.selectedRunId = (this.libraryRailRuns[0] && this.libraryRailRuns[0].run_id) || '';
      this.library.selectedFrameName = '';
      this.library.runDetail = null;
    }
    if (this.library.runDetail && this.library.runDetail.run_id !== this.library.selectedRunId) {
      this.library.runDetail = null;
      this.library.selectedFrameName = '';
    }
  },
  async ensureLibraryRunDetail() {
    this.syncLibrarySelection();
    const run = this.librarySelectedRunSummary;
    if (!run) return;
    if (this.librarySelectedRunDetail) {
      if (!this.library.selectedFrameName && this.librarySelectedFrames.length) {
        this.library.selectedFrameName = this.librarySelectedFrames[0];
      }
      return;
    }
    await this.openLibraryRun(run);
  },
  async refreshRuns() {
    if (typeof fetch !== "function") return;
    this.runsLoading = true;
    try {
      const res = await fetch("/api/runs");
      if (!res.ok) return;
      const data = await res.json();
      this.runsAll = data.runs || [];
      this.applyRunsFilters();
      void this.refreshGpuPool(true);
      // Best-effort: fetch Deforum batch queue from all Forge GPUs and merge into runs list.
      try {
        const bres = await fetch("/api/deforum/batches?all=1", { cache: "no-store" });
        if (bres.ok) {
          const bj = await bres.json();
          const batches = Array.isArray(bj.batches) ? bj.batches : [];
          this.deforumBatches = batches;
          this.deforumBatchNodes = Array.isArray(bj.nodes) ? bj.nodes : [];
          const errors = Array.isArray(bj.errors) ? bj.errors : [];
          this.deforumBatchesStatus = errors.length
            ? `Some GPUs unavailable (${errors.length})`
            : "";
        } else {
          this.deforumBatches = [];
          this.deforumBatchNodes = [];
          this.deforumBatchesStatus = "Deforum batches unavailable";
        }
      } catch (_e) {
        this.deforumBatches = [];
        this.deforumBatchNodes = [];
        this.deforumBatchesStatus = "Deforum batches unavailable";
      }
      if (this.deforumBatches.length) {
        const mapped = this.deforumBatches.map((b) => {
          const id = b.batch_id || b.id || b.batchId || "";
          const status = String(b.status || b.state || "queued").toLowerCase();
          const started = b.started_at || b.created_at || b.createdAt || null;
          const model = b.model || b.sd_model_name || b.sd_model_checkpoint || "";
          const node = b._node || null;
          return {
            run_id: id ? `batch:${id}` : `batch:unknown:${Math.random().toString(36).slice(2, 8)}`,
            status: status.includes("run") || status.includes("progress") ? "running" : status.includes("queue") || status.includes("pending") ? "queued" : status.includes("cancel") ? "cancelled" : status,
            model,
            tag: "deforum-batch",
            started_at: started,
            frame_count: b.frame_count ?? b.frames ?? b.max_frames ?? null,
            _isBatch: true,
            _batch: b,
            _batchNode: node,
            _gpu: (node && node.name) || (node && node.url) || "",
          };
        });
        const existing = this.runsAll.filter((r) => !String(r.run_id || "").startsWith("batch:"));
        this.runsAll = [...mapped, ...existing];
      }
      this.applyRunsFilters();
      this.syncLibrarySelection();
      if (this.currentTab === 'LIBRARY') {
        await this.ensureLibraryRunDetail();
      }
    } catch (_e) {
      this.runsStatus = "Failed to load runs";
    } finally {
      this.runsLoading = false;
    }
  },
  openMidiSettings() {
    this.switchTab('SETTINGS');
    this.switchSubTab('SETTINGS', 'MIDI');
  },
  openGpuSettings() {
    this.switchTab('SETTINGS');
    this.switchSubTab('SETTINGS', 'GPUS');
  },
  openRunsSettings() {
    this.switchTab('LIBRARY');
    this.librarySubTab = 'BROWSER';
    void this.refreshRuns();
  },
  openRecentRun(run) {
    if (!run) return;
    this.openRunsSettings();
    this.showRunDetails(run);
  },
  async openLibraryRun(run) {
    if (!run || !run.run_id || typeof fetch !== 'function') return;
    this.library.selectedRunId = run.run_id;
    this.library.selectedFrameName = '';
    this.library.loading = true;
    this.library.status = '';
    try {
      const res = await fetch(`/api/runs/${run.run_id}`);
      if (!res.ok) return;
      this.library.runDetail = await res.json();
      this.library.selectedFrameName = (this.library.runDetail.frames && this.library.runDetail.frames[0]) || '';
    } catch (_e) {
      this.library.status = 'Failed to load run frames';
    } finally {
      this.library.loading = false;
    }
  },
  selectLibraryFrame(frameName) {
    this.library.selectedFrameName = frameName || '';
  },
  stepLibraryFrame(direction) {
    if (!this.librarySelectedFrames.length) return;
    const current = this.librarySelectedFrameIndex >= 0 ? this.librarySelectedFrameIndex : 0;
    const next = Math.min(this.librarySelectedFrames.length - 1, Math.max(0, current + Number(direction || 0)));
    this.library.selectedFrameName = this.librarySelectedFrames[next] || '';
  },
  applyRunsFilters() {
    let filtered = [...this.runsAll];
    const { search, status, tag, model } = this.runsFilter;
    if (status) filtered = filtered.filter(r => r.status === status);
    if (tag) filtered = filtered.filter(r => (r.tag || "").toLowerCase().includes(tag.toLowerCase()));
    if (model) filtered = filtered.filter(r => (r.model || "").toLowerCase().includes(model.toLowerCase()));
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(r =>
        (r.run_id || "").toLowerCase().includes(s) ||
        (r.tag || "").toLowerCase().includes(s) ||
        (r.model || "").toLowerCase().includes(s) ||
        (r.prompt_positive || "").toLowerCase().includes(s) ||
        (r.notes || "").toLowerCase().includes(s)
      );
    }
    const { field, order } = this.runsSort;
    filtered.sort((a, b) => {
      let va = a[field] || "";
      let vb = b[field] || "";
      if (typeof va === "number" && typeof vb === "number") {
        return order === "desc" ? vb - va : va - vb;
      }
      va = String(va).toLowerCase();
      vb = String(vb).toLowerCase();
      return order === "desc" ? vb.localeCompare(va) : va.localeCompare(vb);
    });
    this.runsFiltered = filtered;
  },
  toggleRunSelect(runId) {
    const idx = this.runsSelected.indexOf(runId);
    if (idx >= 0) this.runsSelected.splice(idx, 1);
    else this.runsSelected.push(runId);
  },
  async showRunDetails(run) {
    if (!run) return;
    if (run._isBatch) {
      this.runsDetailView = { ...run };
      return;
    }
    if (typeof fetch !== "function") return;
    try {
      const res = await fetch(`/api/runs/${run.run_id}`);
      if (!res.ok) return;
      this.runsDetailView = await res.json();
    } catch (_e) {
      this.runsStatus = "Failed to load run details";
    }
  },
  canKillQueuedRun(run) {
    return !!(run && run._isBatch && run.status === "queued");
  },
  async killQueuedRun(run) {
    if (typeof fetch !== "function") return;
    if (!this.canKillQueuedRun(run)) return;
    const batchId = String(run.run_id || "").replace(/^batch:/, "");
    const nodeId = (run._batchNode && run._batchNode.id) || "";
    if (!batchId) return;
    if (!confirm(`Cancel queued batch ${batchId}?`)) return;
    try {
      const qs = nodeId ? `?nodeId=${encodeURIComponent(nodeId)}` : "";
      const res = await fetch(`/api/deforum/batches/${encodeURIComponent(batchId)}/cancel${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nodeId ? { nodeId } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok !== false) {
        this.runsStatus = `Cancelled batch ${batchId}`;
        await this.refreshRuns();
      } else {
        this.runsStatus = data.error || `Failed to cancel batch ${batchId}`;
      }
    } catch (_e) {
      this.runsStatus = "Failed to cancel batch";
    }
  },
  async rerunRun(run) {
    if (typeof fetch !== "function") return;
    if (!confirm(`Rerun ${run.run_id}?`)) return;
    try {
      const res = await fetch(`/api/runs/${run.run_id}/rerun`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides: {} }),
      });
      const data = await res.json();
      this.runsStatus = data.success ? `Rerun request saved for ${run.run_id}` : data.error;
    } catch (_e) {
      this.runsStatus = "Failed to submit rerun";
    }
  },
  async deleteRun(run) {
    if (typeof fetch !== "function") return;
    if (!confirm(`Delete ${run.run_id}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/runs/${run.run_id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await this.refreshRuns();
        this.runsStatus = `Deleted ${run.run_id}`;
      } else {
        this.runsStatus = data.error;
      }
    } catch (_e) {
      this.runsStatus = "Failed to delete run";
    }
  },
  async saveRunNotes(run) {
    if (typeof fetch !== "function") return;
    try {
      const res = await fetch(`/api/runs/${run.run_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: run.notes }),
      });
      const data = await res.json();
      this.runsStatus = data.success ? "Notes saved" : data.error;
    } catch (_e) {
      this.runsStatus = "Failed to save notes";
    }
  },
  async exportRuns(format) {
    if (typeof fetch !== "function") return;
    try {
      const res = await fetch(`/api/runs/export?format=${format}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `runs_export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (_e) {
      this.runsStatus = "Failed to export";
    }
  },
  getRunProp(runId, prop) {
    const run = this.runsAll.find(r => r.run_id === runId);
    if (!run) return '-';
    const val = run[prop];
    if (val === undefined || val === null || val === '') return '-';
    if ((prop === 'prompt_positive' || prop === 'prompt_negative') && String(val).length > 80) {
      return String(val).slice(0, 80) + '…';
    }
    return val;
  },
  async exportRunComparison(format) {
    if (this.runsSelected.length < 2) {
      this.runsStatus = 'Select at least 2 runs to compare';
      return;
    }
    try {
      const res = await fetch('/api/runs/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_ids: this.runsSelected, format }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      if (format === 'csv') {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'runs_comparison.csv';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data.comparison, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'runs_comparison.json';
        a.click();
        URL.revokeObjectURL(url);
      }
      this.runsStatus = `Exported comparison (${this.runsSelected.length} runs)`;
    } catch (err) {
      this.runsStatus = err.message || 'Compare export failed';
    }
  },
  formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  },
 switchTab(id) {
   if (id === 'GENERATE') {
     this.currentTab = 'MOTION';
     this.currentSubTab.MOTION = 'SEQUENCER';
     try {
       if (typeof window !== 'undefined' && window.localStorage) {
         window.localStorage.setItem('defora_tab', 'MOTION');
         window.localStorage.setItem('defora_subtab_MOTION', 'SEQUENCER');
       }
     } catch (_e) {}
     return;
   }
   if (id === 'AUDIO') {
     this.currentTab = 'MODULATION';
     this.currentSubTab.MODULATION = 'AUDIO_REACTIVE';
     try {
       if (typeof window !== 'undefined' && window.localStorage) {
         window.localStorage.setItem('defora_tab', 'MODULATION');
         window.localStorage.setItem('defora_subtab_MODULATION', 'AUDIO_REACTIVE');
       }
     } catch (_e) {}
     return;
   }
   if (id === 'RUNS') {
     this.currentTab = 'LIBRARY';
     this.librarySubTab = 'BROWSER';
     try {
       if (typeof window !== 'undefined' && window.localStorage) {
         window.localStorage.setItem('defora_tab', 'LIBRARY');
       }
     } catch (_e) {}
     void this.refreshRuns();
     return;
   }
  if (id === 'MOTION') {
    this.currentSubTab.MOTION = this.normalizeMotionSubTab(this.currentSubTab.MOTION);
  }
   this.currentTab = id;
   try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('defora_tab', id); } catch(_e) {}
  if (id === 'LIBRARY') {
    if (!this.runsAll.length && !this.runsLoading) {
      void this.refreshRuns();
    } else {
      void this.ensureLibraryRunDetail();
    }
  }
  if (id === 'STREAM') {
    void this.refreshStreamStatus();
  }
 },
 normalizeModulationSubTab(sub) {
   if (sub === 'AUDIO') return 'AUDIO_REACTIVE';
   if (sub === 'ACTIVE') return 'ACTIVE_MODS';
   const allowed = ['LFO', 'AV_SYNC', 'AUDIO_REACTIVE', 'BEAT_MACROS', 'ACTIVE_MODS', 'CROSSFADER'];
   return allowed.includes(sub) ? sub : 'LFO';
 },
 normalizeLiveSubTab(sub) {
   const allowed = ['MONITOR', 'DEFORUM_JOB'];
   if (sub === 'ADD_SOURCE') return 'MONITOR';
   return allowed.includes(sub) ? sub : 'MONITOR';
 },
 normalizeMotionSubTab(sub) {
   const allowed = ['PERFORMANCE', 'SEQUENCER'];
   return allowed.includes(sub) ? sub : 'PERFORMANCE';
 },
 switchSubTab(tab, sub) {
  if (tab === 'SETTINGS' && sub === 'RUNS') {
    this.openRunsSettings();
    return;
  }
  if (tab === 'SETTINGS' && sub === 'FORGE') sub = 'GPUS';
  if (tab === 'SETTINGS' && sub === 'KEYS') sub = 'ENGINE';
  if (tab === 'SETTINGS' && (sub === 'BINDINGS' || sub === 'PRESETS')) sub = 'MIDI';
  if (tab === 'MODULATION') sub = this.normalizeModulationSubTab(sub);
  if (tab === 'LIVE') sub = this.normalizeLiveSubTab(sub);
  if (tab === 'MOTION') sub = this.normalizeMotionSubTab(sub);
   this.currentSubTab[tab] = sub;
   try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('defora_subtab_' + tab, sub); } catch(_e) {}
  if (tab === 'PROMPTS' && sub !== 'LORA') {
    this.loraPickerOpen = false;
  }
  if (tab === 'PROMPTS' && sub === 'LORA' && !this.lorasLoading && !this.loras.available.length) {
    this.refreshLoras();
  }
  if (tab === 'LIVE' && sub === 'ADD_SOURCE') {
    sub = 'MONITOR';
    this.toggleVideoLayerAdd(true);
  }
  if (tab === 'LIVE' && this.videoLayerAddOpen && !this.systemFiles.roots.length) {
    void this.initSystemFilesBrowser();
  }
 },
 setLiveBottomDrawerTab(tab) {
  if (tab !== 'MODULATION' && tab !== 'CROSSFADER') return;
  this.liveBottomDrawerTab = tab;
  if (tab !== 'CROSSFADER') {
    this.loraCrossfaderPickerGroup = null;
  } else if (!this.lorasLoading && !this.loras.available.length) {
    this.refreshLoras();
  }
  this.saveSessionState();
 },
 toggleLoraCrossfaderPicker(group) {
  if (group !== 'A' && group !== 'B') return;
  this.loraCrossfaderPickerGroup = this.loraCrossfaderPickerGroup === group ? null : group;
  if (this.loraCrossfaderPickerGroup && !this.lorasLoading && !this.loras.available.length) {
    this.refreshLoras();
  }
},
 togglePlayPause() {
   this.toggleDeforumPlay();
 },
 stopVideo() {
   this.stopDeforumPlay();
 },
 toggleDeforumPlay() {
   if (this.deforumPlaying) {
     this.pauseDeforumAnimation();
   } else {
     this.startDeforumAnimation();
   }
 },
 startDeforumAnimation() {
   this.applyCrossfadeMorph();
   const startFrame = this.parseFrameNumber(this.thumbs[0]?.name) || 0;
   this.sendControl('liveParam', { start_frame: startFrame, should_resume: 1 });
   this.deforumPlaying = true;
   this.performance.status = 'Deforum animation playing';
   this.isPlaying = true;
 },
 pauseDeforumAnimation() {
   this.sendControl('liveParam', { is_paused_rendering: 1 });
   this.deforumPlaying = false;
   this.performance.status = 'Animation paused — parameter changes update preview';
   this.isPlaying = false;
 },
 stopDeforumPlay() {
   this.sendControl('liveParam', { is_paused_rendering: 1, should_resume: 0 });
   this.deforumPlaying = false;
   this.performance.status = '';
   this.isPlaying = false;
   const video = this.playerEl || document.getElementById("player");
   if (video) {
     video.pause();
     video.currentTime = 0;
   }
  this.syncFrameSelectionFromPlayback(0);
 },
 async runStartupWarmup() {
   if (this.deforumPlaying || typeof fetch !== "function") return;
   if (!this.apiStatus?.sdForge?.available) return;
   try {
     const res = await fetch('/api/deforum/warmup', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ maxFrames: 48, fps: 12 }),
     });
     if (!res.ok) return;
     const data = await res.json();
     if (data.ok && data.status !== 'already_running') {
       this.performance.status = 'Startup clip generating… (WebGL stays visible until frames arrive)';
     }
   } catch (_e) {}
 },
 async toggleStreamRecord() {
   if (this.isRecording) {
     this.isRecording = false;
     try {
       const res = await fetch('/api/stream/stop-record', { method: 'POST' });
       const data = await res.json();
       this.performance.status = data.success ? 'Recording stopped' : (data.error || 'Stop failed');
     } catch (e) {
       this.performance.status = 'Stop record failed';
     }
   } else {
     this.isRecording = true;
     const output = `/tmp/defora_rec_${Date.now()}.mp4`;
     try {
       const res = await fetch('/api/stream/record', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ output, fps: 24 }),
       });
       const data = await res.json();
       this.performance.status = data.success ? `Recording → ${output}` : (data.error || 'Record failed');
       if (!data.success) this.isRecording = false;
     } catch (e) {
       this.isRecording = false;
       this.performance.status = 'Record failed';
     }
   }
 },
 async toggleRecord() {
   return this.toggleStreamRecord();
 },
newStreamDestination(protocol = 'rtmp') {
  const normalizedProtocol = ['rtmp', 'srt', 'whip'].includes(protocol) ? protocol : 'rtmp';
  const defaults = {
    rtmp: 'Custom RTMP',
    srt: 'Custom SRT',
    whip: 'Custom WHIP',
  };
  const { width, height } = this.currentResolution();
  return {
    id: `stream_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: defaults[normalizedProtocol] || 'Custom Stream',
    protocol: normalizedProtocol,
    target: '',
    fps: Number(this.generator && this.generator.fps) || 24,
    resolution: `${width}x${height}`,
    overlay: '',
    transition: '',
  };
},
addStreamDestination(protocol = 'rtmp') {
  this.streaming.destinations.push(this.newStreamDestination(protocol));
  this.saveSessionState();
},
removeStreamDestination(id) {
  this.streaming.destinations = this.streaming.destinations.filter((dest) => dest.id !== id);
  if (this.streaming.activeDestinationId === id) {
    this.streaming.activeDestinationId = null;
  }
  this.saveSessionState();
},
async refreshStreamStatus() {
  try {
    const res = await fetch('/api/stream/status', { cache: 'no-store' });
    const data = await res.json();
    this.streaming.activeStatus = data.status || 'unknown';
    this.streaming.status = (data.output || '').trim() || (this.streaming.activeStatus === 'running'
      ? 'Outbound stream is running.'
      : 'No outbound stream running.');
    if (this.streaming.activeStatus !== 'running') {
      this.streaming.activeDestinationId = null;
    }
  } catch (err) {
    this.streaming.activeStatus = 'error';
    this.streaming.status = err.message || 'Failed to read stream status';
  }
},
async startStreamDestination(id) {
  const destination = this.streaming.destinations.find((dest) => dest.id === id);
  if (!destination) return;
  const target = String(destination.target || '').trim();
  if (!target) {
    this.streaming.status = 'Destination URL is required.';
    return;
  }
  try {
    const res = await fetch('/api/stream/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target,
        fps: Number(destination.fps) || 24,
        resolution: destination.resolution || undefined,
        protocol: destination.protocol || undefined,
        overlay: destination.overlay ? String(destination.overlay).trim() : undefined,
        transition: destination.transition ? String(destination.transition).trim() : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Could not start outbound stream');
    }
    this.streaming.activeDestinationId = id;
    this.streaming.activeStatus = 'running';
    this.streaming.status = (data.message || '').trim() || `Streaming to ${destination.name}`;
    this.streamUrl = target;
    this.saveSessionState();
  } catch (err) {
    this.streaming.activeStatus = 'error';
    this.streaming.status = err.message || 'Could not start outbound stream';
  }
},
async stopOutboundStream() {
  try {
    const res = await fetch('/api/stream/stop', { method: 'POST' });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || 'Could not stop outbound stream');
    }
    this.streaming.activeDestinationId = null;
    this.streaming.activeStatus = 'stopped';
    this.streaming.status = (data.message || '').trim() || 'Outbound stream stopped.';
    this.saveSessionState();
  } catch (err) {
    this.streaming.activeStatus = 'error';
    this.streaming.status = err.message || 'Could not stop outbound stream';
  }
},
normalizeDefaultAnimationSettings(input = {}) {
  const next = input && typeof input === 'object' ? input : {};
  const mode = ['instancing', 'volume', 'orbital', 'nebula', 'raycast', 'marching', 'ocean'].includes(next.mode) ? next.mode : 'instancing';
  return {
    preferDeforumVideo: !!next.preferDeforumVideo,
    autoTransitionToDeforum: next.autoTransitionToDeforum !== false,
    mode,
    instCount: Math.max(1000, Math.min(50000, Math.round(Number(next.instCount) || 12000))),
    beamCount: Math.max(3, Math.min(12, Math.round(Number(next.beamCount) || 7))),
    speed: Math.max(0.1, Math.min(2.5, Number(next.speed) || 0.75)),
    spread: Math.max(0.2, Math.min(2.5, Number(next.spread) || 0.68)),
    glow: Math.max(0.1, Math.min(1.4, Number(next.glow) || 0.78)),
    hue: Math.max(0, Math.min(1, Number.isFinite(Number(next.hue)) ? Number(next.hue) : 0.6)),
    pulse: Math.max(0, Math.min(1, Number.isFinite(Number(next.pulse)) ? Number(next.pulse) : 0.36)),
    drift: Math.max(0, Math.min(1, Number.isFinite(Number(next.drift)) ? Number(next.drift) : 0.44)),
    mist: Math.max(0, Math.min(1, Number.isFinite(Number(next.mist)) ? Number(next.mist) : 0.58)),
    orbit: Math.max(0, Math.min(1, Number.isFinite(Number(next.orbit)) ? Number(next.orbit) : 0.52)),
    lineType: next.lineType === 'line' ? 'line' : 'segments',
    lineWidth: Math.max(1, Math.min(10, Number(next.lineWidth) || 2.4)),
    lineThreshold: Math.max(0, Math.min(10, Number.isFinite(Number(next.lineThreshold)) ? Number(next.lineThreshold) : 0.8)),
    lineTranslation: Math.max(0, Math.min(10, Number.isFinite(Number(next.lineTranslation)) ? Number(next.lineTranslation) : 0)),
    lineWorldUnits: next.lineWorldUnits !== false,
    lineVisualizeThreshold: !!next.lineVisualizeThreshold,
    lineAlphaToCoverage: next.lineAlphaToCoverage !== false,
    lineAnimate: next.lineAnimate !== false,
    mcMaterial: ['shiny', 'chrome', 'liquid', 'matte', 'flat', 'plastic', 'colors', 'multiColors'].includes(next.mcMaterial)
      ? next.mcMaterial
      : 'shiny',
    mcNumBlobs: Math.max(1, Math.min(50, Math.round(Number(next.mcNumBlobs) || 10))),
    mcResolution: Math.max(14, Math.min(100, Math.round(Number(next.mcResolution) || 28))),
    mcIsolation: Math.max(10, Math.min(300, Math.round(Number(next.mcIsolation) || 80))),
    mcFloor: next.mcFloor !== false,
    mcWallX: !!next.mcWallX,
    mcWallZ: !!next.mcWallZ,
    ocElevation: Math.max(0, Math.min(90, Number(next.ocElevation) || 2)),
    ocAzimuth: Math.max(-180, Math.min(180, Number.isFinite(Number(next.ocAzimuth)) ? Number(next.ocAzimuth) : 180)),
    ocExposure: Math.max(0, Math.min(1, Number.isFinite(Number(next.ocExposure)) ? Number(next.ocExposure) : 0.1)),
    ocDistortion: Math.max(0, Math.min(8, Number.isFinite(Number(next.ocDistortion)) ? Number(next.ocDistortion) : 3.7)),
    ocSize: Math.max(0.1, Math.min(10, Number.isFinite(Number(next.ocSize)) ? Number(next.ocSize) : 1)),
    ocCloudCoverage: Math.max(0, Math.min(1, Number.isFinite(Number(next.ocCloudCoverage)) ? Number(next.ocCloudCoverage) : 0.4)),
    ocCloudDensity: Math.max(0, Math.min(1, Number.isFinite(Number(next.ocCloudDensity)) ? Number(next.ocCloudDensity) : 0.5)),
    ocCloudElevation: Math.max(0, Math.min(1, Number.isFinite(Number(next.ocCloudElevation)) ? Number(next.ocCloudElevation) : 0.5)),
  };
},
onDefaultAnimationInput() {
  this.defaultAnimation = this.normalizeDefaultAnimationSettings(this.defaultAnimation);
  this.saveSessionState();
},
modulationTargetByKey(key) {
  if (!key) return null;
  return this.lfoTargets.find((t) => t.key === key)
    || this.animationTargets.find((t) => t.key === key)
    || null;
},
isAnimationModKey(key) {
  return typeof key === 'string' && key.startsWith('anim_');
},
applyAnimationModulation(field, value) {
  if (!field) return;
  this.defaultAnimation = this.normalizeDefaultAnimationSettings({
    ...this.defaultAnimation,
    [field]: value,
  });
},
routeModulationValue(key, value, payload, cnUpdates) {
  const anim = this.animationTargets.find((t) => t.key === key);
  if (anim) {
    this.applyAnimationModulation(anim.field, value);
    return;
  }
  if (key.startsWith('cn_')) {
    const parts = key.split('_');
    const slotId = parts[1];
    const field = parts[2];
    const slot = this.cn.slots.find((s) => s.id === slotId);
    if (slot) {
      if (field === 'weight') slot.weight = value;
      else if (field === 'start') slot.start = value;
      else if (field === 'end') slot.end = value;
      cnUpdates[slotId] = slot;
    }
    return;
  }
  payload[key] = value;
},
setDefaultAnimationMode(mode) {
  this.defaultAnimation = this.normalizeDefaultAnimationSettings({
    ...this.defaultAnimation,
    mode,
  });
  this.saveSessionState();
},
resetDefaultAnimationSettings() {
  const preferDeforumVideo = !!(this.defaultAnimation && this.defaultAnimation.preferDeforumVideo);
  this.defaultAnimation = this.normalizeDefaultAnimationSettings({ preferDeforumVideo });
  this.saveSessionState();
},
setPreferDeforumVideo(prefer) {
  this.defaultAnimation = this.normalizeDefaultAnimationSettings({
    ...this.defaultAnimation,
    preferDeforumVideo: prefer,
  });
  if (prefer) {
    this.activeVideoLayerId = 'deforum';
    this.videoReady = false;
    this.attachPlayer();
  } else if (this.activeVideoLayerId === 'deforum') {
    this.activeVideoLayerId = 'webgl';
  }
  this.saveSessionState();
},
rebuildVideoLayers() {
  const custom = (this.liveSources || []).map((source) => ({
    id: source.id,
    kind: source.type === 'cloud' ? 'cloud' : 'library',
    label: source.label || 'Source',
    playbackUrl: source.playbackUrl || null,
    url: source.url || null,
    builtin: false,
  }));
  this.videoLayers = [
    { id: 'webgl', kind: 'webgl', label: 'WebGL', builtin: true },
    { id: 'deforum', kind: 'deforum', label: 'Deforum', builtin: true },
    { id: 'blend', kind: 'blend', label: 'Both', builtin: true },
    {
      id: 'input',
      kind: 'input',
      label: this.inputLayerLabel || 'Input',
      playbackUrl: this.inputLayerPlaybackUrl || null,
      builtin: true,
    },
    ...custom,
  ];
},
initVideoLayers() {
  this.rebuildVideoLayers();
  const allowed = new Set(this.videoLayers.map((layer) => layer.id));
  const preferDeforum = !!this.defaultAnimation?.preferDeforumVideo;
  if (preferDeforum && allowed.has('deforum')) {
    this.activeVideoLayerId = 'deforum';
  } else if (!allowed.has(this.activeVideoLayerId)) {
    this.activeVideoLayerId = 'webgl';
  }
  this.$nextTick(() => {
    if (this.showLayerInputVideo) this.attachInputVideo(this.activeLayerPlaybackUrl);
  });
},
ensureStandbyAnimationAtStartup() {
  const preferDeforum = !!this.defaultAnimation?.preferDeforumVideo;
  const deforumLive = this.deforumPlaying && this.videoReady;
  if (!preferDeforum && !deforumLive && this.activeVideoLayerId !== 'webgl' && !this.isBlendLayerActive) {
    this.activeVideoLayerId = 'webgl';
  }
  if (!this.defaultAnimation?.mode) {
    this.defaultAnimation = this.normalizeDefaultAnimationSettings(this.defaultAnimation);
  }
},
applyStartupVideoPreview() {
  this._userPickedPreviewLayer = false;
  this.activeVideoLayerId = 'webgl';
  this.defaultAnimation = this.normalizeDefaultAnimationSettings({
    ...this.defaultAnimation,
    preferDeforumVideo: false,
    autoTransitionToDeforum: this.defaultAnimation?.autoTransitionToDeforum !== false,
  });
  this.$nextTick(() => this.kickstandbyAnimation());
},
maybePromoteDeforumPreview() {
  const anim = this.defaultAnimation || {};
  if (anim.autoTransitionToDeforum === false) return;
  if (this._userPickedPreviewLayer) return;
  if (this.activeVideoLayerId !== 'webgl') return;
  if (!this.deforumPlaying && !this.deforumGeneratedFrameCount) return;
  this.selectVideoLayer('deforum', { userInitiated: false });
},
kickstandbyAnimation(attempts = 0) {
  const bg = this.$refs.threeBackgroundRef;
  if (bg && typeof bg.ensureRunning === 'function') {
    bg.ensureRunning();
    return;
  }
  if (attempts < 30 && typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => this.kickstandbyAnimation(attempts + 1));
  }
},
selectVideoLayer(id, opts = {}) {
  if (!this.videoLayers.find((layer) => layer.id === id)) return;
  if (opts.userInitiated !== false) this._userPickedPreviewLayer = true;
  this.activeVideoLayerId = id;
  const layer = this.activeVideoLayer;
  if (layer?.kind === 'webgl') {
    this.setPreferDeforumVideo(false);
    this.kickstandbyAnimation();
    return;
  }
  if (layer?.kind === 'blend') {
    this.defaultAnimation = this.normalizeDefaultAnimationSettings({
      ...this.defaultAnimation,
      preferDeforumVideo: true,
    });
    this.videoReady = false;
    this.attachPlayer();
    this.kickstandbyAnimation();
    this.saveSessionState();
    return;
  }
  if (layer?.kind === 'deforum') {
    this.setPreferDeforumVideo(true);
    return;
  }
  this.defaultAnimation = this.normalizeDefaultAnimationSettings({
    ...this.defaultAnimation,
    preferDeforumVideo: false,
  });
  if (layer?.playbackUrl || (layer?.kind === 'input' && this.inputLayerPlaybackUrl)) {
    this.$nextTick(() => this.attachInputVideo(this.activeLayerPlaybackUrl));
  }
  this.saveSessionState();
},
toggleVideoLayerAdd(open) {
  const next = typeof open === 'boolean' ? open : !this.videoLayerAddOpen;
  this.videoLayerAddOpen = next;
  if (next && !this.systemFiles.roots.length) {
    void this.initSystemFilesBrowser();
  }
  this.saveSessionState();
},
closeVideoLayer(id) {
  if (id === 'webgl' || id === 'deforum' || id === 'blend' || id === 'input') return;
  this.removeLiveSource(id);
  if (this.activeVideoLayerId === id) {
    this.selectVideoLayer('input');
  }
},
attachInputVideo(src) {
  const video = this.$refs.inputVideoEl;
  if (!video || !src) return;
  this.inputVideoReady = false;
  if (!this._inputVideoReadyHandler) {
    this._inputVideoReadyHandler = () => {
      try {
        this.inputVideoReady = video.readyState >= 2;
      } catch (_e) {
        this.inputVideoReady = true;
      }
    };
  }
  video.removeEventListener?.("loadeddata", this._inputVideoReadyHandler);
  video.removeEventListener?.("canplay", this._inputVideoReadyHandler);
  video.addEventListener?.("loadeddata", this._inputVideoReadyHandler);
  video.addEventListener?.("canplay", this._inputVideoReadyHandler);
  if (video.src !== src) {
    video.src = src;
    video.load();
  }
  try {
    const p = video.play?.();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch (_e) {}
},
openCloudLayer(layer) {
  if (!layer?.url) return;
  window.open(layer.url, '_blank', 'noopener');
},
toggleVideoStageSize(next) {
  const allowed = ['small', 'medium', 'full'];
  const target = allowed.includes(String(next)) ? String(next) : null;
  const order = ['small', 'medium', 'full'];
  const current = allowed.includes(this.videoStageSize) ? this.videoStageSize : 'medium';
  const desired = target || order[(order.indexOf(current) + 1) % order.length];
  this.videoStageSize = desired;
  this.saveSessionState();
},
layerStatus(layer) {
  if (!layer) return 'red';
  if (layer.kind === 'webgl') return 'green';
  if (layer.kind === 'blend') {
    if (this.showDeforumVideo) return 'green';
    if (this.deforumPlaying || this.videoReady) return 'yellow';
    return 'green';
  }
  if (layer.kind === 'deforum') {
    if (this.videoReady) return 'green';
    if (this.deforumPlaying || (this.defaultAnimation && this.defaultAnimation.preferDeforumVideo)) return 'yellow';
    return 'red';
  }
  if (layer.kind === 'input') {
    if (!this.inputLayerPlaybackUrl) return 'red';
    return this.inputVideoReady ? 'green' : 'yellow';
  }
  if (layer.kind === 'library') {
    if (!layer.playbackUrl) return 'red';
    return this.inputVideoReady ? 'green' : 'yellow';
  }
  if (layer.kind === 'cloud') {
    return layer.url ? 'yellow' : 'red';
  }
  return 'red';
},
assignInputFromSelection() {
  const selected = (this.systemFiles.selectedPaths || [])
    .map((path) => (this.systemFiles.videos || []).find((video) => video.path === path))
    .filter(Boolean);
  const video = selected[0];
  if (!video) {
    this.liveSourceStatus = 'Select a video in the library grid first';
    return;
  }
  this.inputLayerPlaybackUrl = this.systemFilePlaybackUrl(video);
  this.inputLayerLabel = video.name || 'Input';
  this.rebuildVideoLayers();
  this.selectVideoLayer('input');
  this.liveSourceStatus = `Assigned to Input layer: ${this.inputLayerLabel}`;
  this.videoLayerAddOpen = false;
  this.saveSessionState();
},
async initSystemFilesBrowser() {
  if (this.systemFiles.roots.length) return;
  try {
    const res = await fetch('/api/video-swarm/roots');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not load library roots');
    this.systemFiles.roots = Array.isArray(data.roots) ? data.roots : [];
    const preferred = this.systemFiles.roots.find((r) => r.id === 'frames') || this.systemFiles.roots[0];
    if (preferred) {
      this.systemFiles.rootId = preferred.id;
      await this.browseSystemFiles(preferred.path, { rootId: preferred.id });
    }
  } catch (err) {
    this.systemFiles.status = err.message || 'Library unavailable';
  }
},
async browseSystemFiles(targetPath, { rootId } = {}) {
  this.systemFiles.loading = true;
  try {
    const q = new URLSearchParams();
    if (targetPath) q.set('path', targetPath);
    if (rootId || this.systemFiles.rootId) q.set('rootId', rootId || this.systemFiles.rootId);
    if (this.systemFiles.recursive) q.set('recursive', '1');
    q.set('sort', this.systemFiles.sortKey || 'name');
    const res = await fetch(`/api/video-swarm/browse?${q.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Browse failed');
    this.systemFiles.currentPath = data.path || '';
    this.systemFiles.parent = data.parent || '';
    this.systemFiles.videos = Array.isArray(data.videos) ? data.videos : [];
    this.systemFiles.videoCount = Number.isFinite(Number(data.videoCount))
      ? Number(data.videoCount)
      : this.systemFiles.videos.length;
    this.systemFiles.status = '';
  } catch (err) {
    this.systemFiles.status = err.message || 'Could not browse folder';
    this.systemFiles.videos = [];
    this.systemFiles.videoCount = 0;
  } finally {
    this.systemFiles.loading = false;
  }
},
toggleSystemFilesRecursive() {
  this.systemFiles.recursive = !this.systemFiles.recursive;
  void this.browseSystemFiles(this.systemFiles.currentPath);
},
toggleSystemFilesShowNames() {
  this.systemFiles.showFilenames = !this.systemFiles.showFilenames;
},
toggleSystemFileSelection(filePath) {
  const paths = Array.isArray(this.systemFiles.selectedPaths) ? [...this.systemFiles.selectedPaths] : [];
  const idx = paths.indexOf(filePath);
  if (idx >= 0) paths.splice(idx, 1);
  else paths.push(filePath);
  this.systemFiles.selectedPaths = paths;
},
openSystemFileFullscreen(index) {
  const list = this.systemFiles.videos || [];
  if (index >= 0 && index < list.length) this.systemFiles.fullscreenIndex = index;
},
closeSystemFileFullscreen() {
  this.systemFiles.fullscreenIndex = -1;
},
stepSystemFileFullscreen(delta) {
  const list = this.systemFiles.videos || [];
  if (!list.length) return;
  let idx = this.systemFiles.fullscreenIndex;
  if (idx < 0) idx = 0;
  idx = (idx + delta + list.length) % list.length;
  this.systemFiles.fullscreenIndex = idx;
},
async deleteSystemFile(filePath) {
  this.systemFiles.status = 'Delete is not available from the web UI yet';
},
systemFilePlaybackUrl(video) {
  if (!video || !video.path) return '';
  const q = new URLSearchParams({ path: video.path });
  if (video.rootId) q.set('rootId', video.rootId);
  return `/api/video-swarm/file?${q.toString()}`;
},
systemFileMediaUrl(filePath) {
  const video = (this.systemFiles.videos || []).find((v) => v.path === filePath);
  if (video) return this.systemFilePlaybackUrl(video);
  const q = new URLSearchParams({ path: filePath });
  if (this.systemFiles.rootId) q.set('rootId', this.systemFiles.rootId);
  return `/api/video-swarm/file?${q.toString()}`;
},
addLiveSourceFromVideo(video) {
  if (!video || !video.path) return;
  const entry = {
    id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: 'library',
    label: video.name || 'Video',
    path: video.path,
    rootId: video.rootId || this.systemFiles.rootId || 'frames',
    playbackUrl: this.systemFilePlaybackUrl(video),
  };
  this.liveSources = [...(this.liveSources || []), entry];
  this.rebuildVideoLayers();
  this.selectVideoLayer(entry.id);
  this.liveSourceStatus = `Opened layer: ${entry.label}`;
  this.videoLayerAddOpen = false;
  this.saveSessionState();
},
addLiveSourcesFromSelection() {
  const selected = (this.systemFiles.selectedPaths || [])
    .map((p) => (this.systemFiles.videos || []).find((v) => v.path === p))
    .filter(Boolean);
  if (!selected.length) {
    const hovered = (this.systemFiles.videos || []).find((v) => v.path === (this.systemFiles.selectedPaths || [])[0]);
    if (hovered) selected.push(hovered);
  }
  if (!selected.length) {
    this.liveSourceStatus = 'Select a video in the library grid first';
    return;
  }
  selected.forEach((video) => this.addLiveSourceFromVideo(video));
},
linkCloudDriveSource() {
  const url = String(this.cloudDriveDraft.url || '').trim();
  if (!url) {
    this.liveSourceStatus = 'Enter a cloud share link';
    return;
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch (_e) {
    this.liveSourceStatus = 'Enter a valid https:// link';
    return;
  }
  const entry = {
    id: `cloud-${Date.now()}`,
    type: 'cloud',
    label: parsed.hostname.replace(/^www\./, ''),
    url: parsed.href,
    provider: this.cloudDriveDraft.provider || 'other',
    playbackUrl: parsed.href,
  };
  this.liveSources = [...(this.liveSources || []), entry];
  this.rebuildVideoLayers();
  this.selectVideoLayer(entry.id);
  this.cloudDriveDraft.url = '';
  this.liveSourceStatus = `Opened cloud layer: ${entry.label}`;
  this.videoLayerAddOpen = false;
  this.saveSessionState();
},
removeLiveSource(sourceId) {
  this.liveSources = (this.liveSources || []).filter((s) => s.id !== sourceId);
  this.rebuildVideoLayers();
  this.saveSessionState();
},
applyLiveSourceAsFeed(source) {
  if (!source) return;
  this.selectVideoLayer(source.id);
},
markVideoReady(ready) {
  this.videoReady = !!ready;
},
detachPlayerListeners(video = this.playerEl) {
  if (!video) return;
  if (this.timeHandler) video.removeEventListener("timeupdate", this.timeHandler);
  if (this.errorHandler) video.removeEventListener("error", this.errorHandler);
  if (this.videoReadyHandler) {
    video.removeEventListener("loadeddata", this.videoReadyHandler);
    video.removeEventListener("canplay", this.videoReadyHandler);
    video.removeEventListener("playing", this.videoReadyHandler);
  }
  if (this.videoWaitingHandler) {
    video.removeEventListener("waiting", this.videoWaitingHandler);
    video.removeEventListener("stalled", this.videoWaitingHandler);
    video.removeEventListener("emptied", this.videoWaitingHandler);
  }
  if (this.videoPlayHandler) video.removeEventListener("play", this.videoPlayHandler);
  if (this.videoPauseHandler) video.removeEventListener("pause", this.videoPauseHandler);
},
 attachPlayer() {
   const video = document.getElementById("player");
   if (!video) return;
  if (this.playerEl) this.detachPlayerListeners(this.playerEl);
   this.playerEl = video;
  this.markVideoReady(false);
   const hlsSource = this.streamSrc.includes("?") ? this.streamSrc + "&t=" + Date.now() : this.streamSrc + "?t=" + Date.now();
   if (this.hls && this.hls.destroy) {
     this.hls.destroy();
     this.hls = null;
   }
   if (video.canPlayType("application/vnd.apple.mpegurl")) {
     video.src = hlsSource;
     video.load();
     this.autoplayVideo(video);
   } else if (typeof Hls !== "undefined" && Hls.isSupported && Hls.isSupported()) {
     const hlsEvents = (Hls && Hls.Events) || { MANIFEST_PARSED: "manifest_parsed", ERROR: "error" };
     this.hls = new Hls({ liveSyncDurationCount: 1, liveMaxLatencyDurationCount: 3, maxBufferLength: 6, maxMaxBufferLength: 12 });
     this.hls.loadSource(hlsSource);
     this.hls.attachMedia(video);
     if (this.hls.on) {
       this.hls.on(hlsEvents.MANIFEST_PARSED, () => this.autoplayVideo(video));
       this.hls.on(hlsEvents.ERROR, () => {
         setTimeout(() => this.attachPlayer(), 800);
       });
     }
   } else {
     video.src = hlsSource;
   }
   this.timeHandler = () => {
     if (!isNaN(video.currentTime)) {
      const t = video.currentTime;
      this.timecode = this.formatPlaybackTime(t);
      this.jobPlaybackTimeSec = t;
      this.syncFrameSelectionFromPlayback(t);
     }
    if (video.readyState >= 2) this.markVideoReady(true);
     this.syncReferenceAudioToVideo(video);
   };
   this.errorHandler = () => {
    this.markVideoReady(false);
     setTimeout(() => this.attachPlayer(), 800);
   };
  this.videoReadyHandler = () => {
    if (video.readyState >= 2) this.markVideoReady(true);
  };
  this.videoWaitingHandler = () => {
    this.markVideoReady(false);
  };
  this.videoPlayHandler = () => {
    this.isPlaying = true;
    if (video.readyState >= 2) this.markVideoReady(true);
    this.syncAvAudioPlayState(true, video);
  };
  this.videoPauseHandler = () => {
    this.isPlaying = false;
    this.syncAvAudioPlayState(false, video);
  };
   video.addEventListener("timeupdate", this.timeHandler);
   video.addEventListener("error", this.errorHandler);
  video.addEventListener("loadeddata", this.videoReadyHandler);
  video.addEventListener("canplay", this.videoReadyHandler);
  video.addEventListener("playing", this.videoReadyHandler);
  video.addEventListener("waiting", this.videoWaitingHandler);
  video.addEventListener("stalled", this.videoWaitingHandler);
  video.addEventListener("emptied", this.videoWaitingHandler);
  video.addEventListener("play", this.videoPlayHandler);
  video.addEventListener("pause", this.videoPauseHandler);
   this.autoplayVideo(video);
 },
 syncReferenceAudioToVideo(video) {
   if (!this.avSyncEnabled || !this.audio.objectUrl) return;
   const v = video || this.playerEl;
   const a = this.$refs.avSyncAudio;
   if (!v || !a || v.paused) return;
   const lag = Number(this.avSyncLeadSec);
   const L = Number.isFinite(lag) && lag >= 0 ? lag : 4;
   const target = Math.max(0, v.currentTime - L);
   if (Math.abs(a.currentTime - target) > 0.12) {
     try {
       a.currentTime = target;
     } catch (_e) {
       /* ignore seek errors on sparse codecs */
     }
   }
   if (a.paused) {
     a.play().catch(() => {});
   }
 },
 syncAvAudioPlayState(playing, video) {
   const a = this.$refs.avSyncAudio;
   if (!a || !this.avSyncEnabled || !this.audio.objectUrl) return;
   const v = video || this.playerEl;
   if (playing && v) {
     this.syncReferenceAudioToVideo(v);
     a.play().catch(() => {});
   } else {
     a.pause();
   }
 },
 autoplayVideo(video) {
   const el = video || this.playerEl;
   if (!el || typeof el.play !== "function") return;
  let p = null;
  try {
    p = el.play();
  } catch (_e) {
    this.isPlaying = false;
    this.markVideoReady(false);
    return;
  }
   if (p && typeof p.catch === "function") {
    p.then(() => {
      this.isPlaying = true;
      if (el.readyState >= 2) this.markVideoReady(true);
    }).catch(() => {
      this.isPlaying = false;
      this.markVideoReady(false);
    });
   }
 },
 ensureLivePlayback() {
   if (!this.playerEl) return;
   if (this.playerEl.paused || this.playerEl.readyState < 2) {
     this.autoplayVideo(this.playerEl);
   }
 },
 lfoTarget(lfo) {
   if (!lfo || !lfo.target) return null;
   return this.lfoTargets.find((t) => t.key === lfo.target) || null;
 },
 initLfoBase(lfo) {
   const target = this.lfoTarget(lfo);
   if (!target) return;
   if (lfo.base === null || lfo.base === undefined) {
     lfo.base = target.default != null ? target.default : (target.min + target.max) / 2;
   } else {
     lfo.base = this.clampVal(lfo.base, target.min, target.max);
   }
 },
 shapeValue(shape, phase) {
   const p = phase % (Math.PI * 2);
   if (shape === "Square") return Math.sin(p) >= 0 ? 1 : -1;
   if (shape === "Saw") return p / Math.PI - 1; // -1..1
   if (shape === "Triangle") return (2 * Math.asin(Math.sin(p))) / Math.PI;
   return Math.sin(p);
 },
 clampVal(v, min, max) {
   if (v === null || v === undefined || Number.isNaN(v)) return min;
   return Math.min(max, Math.max(min, v));
 },
 getNow() {
   return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
 },
formatPlaybackTime(seconds) {
  const t = Math.max(0, Number(seconds) || 0);
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(2).padStart(5, "0");
  return `${String(m).padStart(2, "0")}:${s}`;
},
lfoRateRadPerSec(lfo) {
  const bpm = Number((lfo && lfo.bpm) || this.lfoBpm || 120);
  const speed = Number((lfo && lfo.speed) || 1);
  return (bpm / 60) * Math.PI * 2 * speed;
},
interpolatedLfoPhase(lfo, now = this.getNow()) {
  const basePhase = Number(lfo && lfo.phase) || 0;
  if (!lfo || !lfo.on || this.lastLfoTick == null) return basePhase;
  const elapsedSec = Math.max(0, (now - this.lastLfoTick) / 1000);
  return (basePhase + elapsedSec * this.lfoRateRadPerSec(lfo)) % (Math.PI * 2);
},
  runLfos(now = this.getNow()) {
    if (this.audio.track) return;
    if (this.lastLfoTick === null) {
      this.lastLfoTick = now;
      return;
    }
    const dtSec = (now - this.lastLfoTick) / 1000;
    this.lastLfoTick = now;
    if (dtSec <= 0) return;

    const payload = {};
    const cnUpdates = {};
    this.lfos.forEach((lfo) => {
      const drivesMorphBlend = Number(this.prompts.morphBlendLfoLink || 0) === lfo.id && lfo.id >= 1 && lfo.id <= 4;
      const drivesLoraCrossfader = this.prompts.loraCrossfaderOn
        && Number(this.prompts.loraCrossfaderLfoLink || 0) === lfo.id
        && lfo.id >= 1
        && lfo.id <= 6;
      if (!lfo.on || (!lfo.targets.length && !drivesMorphBlend && !drivesLoraCrossfader)) return;
      const depth = this.clampVal(lfo.depth ?? 0, 0, 1);
      const inc = dtSec * this.lfoRateRadPerSec(lfo);
      const phase = (lfo.phase || 0) + inc;
      lfo.phase = phase % (Math.PI * 2);
      lfo.renderPhase = lfo.phase;
      const wave = this.shapeValue(lfo.shape, lfo.phase);

      if (drivesMorphBlend) {
        const base = this.clampVal(
          Number(this.prompts.morphBlendLfoBase ?? this.prompts.morphBlend ?? 0.5) || 0.5,
          0,
          1
        );
        const amp = depth * 0.5;
        const value = this.clampVal(base + wave * amp, 0, 1);
        this.applyPromptMorphBlend(value, { fromModulation: true });
      }

      if (drivesLoraCrossfader) {
        const base = this.clampVal(
          Number(this.prompts.loraCrossfaderLfoBase ?? this.prompts.crossfaderValue ?? 0.5) || 0.5,
          0,
          1
        );
        const amp = depth * 0.5;
        const value = this.clampVal(base + wave * amp, 0, 1);
        this.applyLoraCrossfader(value, { fromModulation: true });
      }

      lfo.targets.forEach((targetKey) => {
        const target = this.modulationTargetByKey(targetKey);
        if (!target) return;
        const base = lfo.base == null ? (target.default ?? (target.min + target.max) / 2) : this.clampVal(lfo.base, target.min, target.max);
        if (lfo.base === null) lfo.base = base;
        const amp = depth * (target.max - target.min) / 2;
        const value = this.clampVal(base + wave * amp, target.min, target.max);
        this.routeModulationValue(targetKey, value, payload, cnUpdates);
      });
    });
    if (Object.keys(payload).length) {
      this.sendControl("liveParam", payload);
    }
    Object.values(cnUpdates).forEach(slot => this.updateControlNet(slot));
  },
 startLfoAnimation() {
   this.stopLfoAnimation();
   const REDUCED = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   let lastWaveTs = 0;
   const animate = (ts) => {
     // Throttle waveform SVG updates to ~20 fps — enough for smooth motion
     if (!REDUCED && ts - lastWaveTs > 48) {
       lastWaveTs = ts;
       this.lfos.forEach((lfo) => {
        lfo.renderPhase = this.interpolatedLfoPhase(lfo, ts);
         // Legacy canvas path (no-ops when no canvas element registered)
         const canvas = this.lfoCanvasRefs[lfo.id];
         if (canvas?.getContext) this.drawLfoPreview(canvas, lfo, ts);
       });
    } else if (REDUCED) {
      this.lfos.forEach((lfo) => {
        lfo.renderPhase = Number(lfo.phase) || 0;
      });
     }
     // Audio freq meter — update at full rate for responsive meter feel
     const analyser = this._liveSpecAnalyser;
     const buf = this._liveSpecFreqBuf;
     if (analyser && buf && buf.length) {
       try { analyser.getByteFrequencyData(buf); } catch (_) {}
       if (!REDUCED && ts - (this._audioSpectrumPaintTs || 0) > 48) {
         this._audioSpectrumPaintTs = ts;
         this.audioSpectrumBins = Array.from(buf);
       }
       const sampleRate = (analyser.context && analyser.context.sampleRate) || 44100;
       const nyquist = sampleRate / 2;
       const binCount = buf.length;
       this.audioMappings.forEach((m, idx) => {
         const lo = Math.max(0, Math.floor((m.freq_min / nyquist) * binCount));
         const hi = Math.min(binCount - 1, Math.ceil((m.freq_max / nyquist) * binCount));
         const count = Math.max(1, hi - lo + 1);
         let sum = 0;
         for (let i = lo; i <= hi; i++) sum += buf[i];
         if (this.audioMappingLevels.length <= idx) this.audioMappingLevels.push(0);
         this.audioMappingLevels[idx] = Math.min(1, sum / (count * 255));
       });
     } else {
       if (this.audioSpectrumBins.length) this.audioSpectrumBins = [];
       this.audioMappings.forEach((_, idx) => {
         if (this.audioMappingLevels.length > idx) this.audioMappingLevels[idx] = 0;
       });
     }
     this._lfoAnimFrame = requestAnimationFrame(animate);
   };
   this._lfoAnimFrame = requestAnimationFrame(animate);
 },
 stopLfoAnimation() {
   if (this._lfoAnimFrame != null && typeof cancelAnimationFrame === "function") {
     cancelAnimationFrame(this._lfoAnimFrame);
     this._lfoAnimFrame = null;
   }
 },
 drawLfoPreview(canvas, lfo, ts) {
   const ctx = canvas.getContext("2d");
   if (!ctx) return;
   const w = canvas.width;
   const h = canvas.height;
   const mid = h / 2;
   const amp = (h / 2 - 4) * (lfo.depth || 0.2);

   ctx.fillStyle = this.themeColor('--bg-0', 'rgb(8, 9, 13)');
   ctx.fillRect(0, 0, w, h);

   // Grid lines
   ctx.strokeStyle = "rgba(12, 48, 72, 0.5)";
   ctx.lineWidth = 0.5;
   ctx.beginPath();
   ctx.moveTo(0, mid);
   ctx.lineTo(w, mid);
   ctx.stroke();

   // Phase offset based on time and speed
   const speed = (lfo.speed || 1.0) * 0.002;
   const phase = (ts || 0) * speed;

   ctx.strokeStyle = lfo.on
     ? this.themeColor('--warn', 'rgb(239, 159, 39)')
     : this.themeColor('--border', 'rgb(42, 45, 58)');
   ctx.lineWidth = 2;
   ctx.beginPath();

   const cycles = 2;
   for (let x = 0; x < w; x++) {
     const t = (x / w) * cycles * Math.PI * 2 + phase;
     let y;
     const p = t % (Math.PI * 2);
     if (lfo.shape === "Sine") {
       y = mid + Math.sin(p) * amp;
     } else if (lfo.shape === "Triangle") {
       y = mid + (2 * Math.asin(Math.sin(p)) / Math.PI) * amp;
     } else if (lfo.shape === "Saw") {
       y = mid + (p / Math.PI - 1) * amp;
     } else {
       y = mid + (Math.sin(p) >= 0 ? 1 : -1) * amp;
     }
     if (x === 0) ctx.moveTo(x, y);
     else ctx.lineTo(x, y);
   }
   ctx.stroke();

   // Glow effect when enabled
   if (lfo.on) {
     ctx.strokeStyle = "rgba(255, 138, 26, 0.15)";
     ctx.lineWidth = 6;
     ctx.beginPath();
     for (let x = 0; x < w; x++) {
       const t = (x / w) * cycles * Math.PI * 2 + phase;
       const p = t % (Math.PI * 2);
       let y;
       if (lfo.shape === "Sine") {
         y = mid + Math.sin(p) * amp;
       } else if (lfo.shape === "Triangle") {
         y = mid + (2 * Math.asin(Math.sin(p)) / Math.PI) * amp;
       } else if (lfo.shape === "Saw") {
         y = mid + (p / Math.PI - 1) * amp;
       } else {
         y = mid + (Math.sin(p) >= 0 ? 1 : -1) * amp;
       }
       if (x === 0) ctx.moveTo(x, y);
       else ctx.lineTo(x, y);
     }
     ctx.stroke();
   }
 },
 processBeat() {
   const now = this.getNow();
   const bpm = this.audio.bpm || 120;
   const beatIntervalMs = (60 / bpm) * 1000;
   
   if (this.lastBeatTime === null) {
     this.lastBeatTime = now;
     this.beatCount = 0;
     this.beatPhase = 0;
     return;
   }
   
   const timeSinceLastBeat = now - this.lastBeatTime;
   
   // Check if a beat should occur
   if (timeSinceLastBeat >= beatIntervalMs) {
     this.lastBeatTime = now;
     this.beatCount++;
     this.triggerBeatMacros(now);
   }
   
   // Update continuous beat phase for smooth animations
   this.beatPhase = (timeSinceLastBeat / beatIntervalMs) % 1;
 },
 triggerBeatMacros(now = this.getNow()) {
   const payload = {};
   const cnUpdates = {};
   const activeMacros = this.macrosRack.filter(m => m.on);
   
   activeMacros.forEach((macro) => {
     const target = this.modulationTargetByKey(macro.target);
     if (!target) return;
     
     // Determine if this macro should trigger on this beat
     const shouldTrigger = this.shouldMacroTrigger(macro, now);
     if (!shouldTrigger) return;
     
     // Calculate value based on macro shape
     const base = target.default ?? (target.min + target.max) / 2;
     const depth = this.clampVal(macro.depth ?? 0.5, 0, 1);
     const offset = this.clampVal(macro.offset ?? 0, -1, 1);
     
     let value;
     if (macro.shape === "Noise") {
       // Random value for noise
       value = base + (Math.random() * 2 - 1) * depth * (target.max - target.min) / 2;
     } else {
       // Use shape value at current phase
       const phase = this.beatPhase * Math.PI * 2;
       const wave = this.shapeValue(macro.shape || "Sine", phase);
       value = base + (wave + offset) * depth * (target.max - target.min) / 2;
     }
     
     const clamped = this.clampVal(value, target.min, target.max);
     this.routeModulationValue(macro.target, clamped, payload, cnUpdates);
   });
   
   if (Object.keys(payload).length) {
     this.sendControl("liveParam", payload);
   }
   Object.values(cnUpdates).forEach(slot => this.updateControlNet(slot));
 },
 shouldMacroTrigger(macro, now) {
   const bpm = Number(macro.bpm || 0);
   if (bpm > 0) {
     const interval = (60 / bpm) * 1000;
     const last = this.lastMacroTrigger[macro.id] || 0;
     if (now - last >= interval) {
       this.lastMacroTrigger[macro.id] = now;
       return true;
     }
     return false;
   }
   // Fallback: if no BPM (or BPM is 0/invalid), trigger on every beat
   return true;
 },
 connectWebSocket() {
  if (!this.collabEnabled) {
    this.wsStatus = "offline";
    return;
  }
   const url = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws";
   const connect = () => {
    if (!this.collabEnabled) {
      this.wsStatus = "offline";
      return;
    }
    if (this.ws && (this.ws.readyState === 0 || this.ws.readyState === 1)) {
      return;
    }
    this.wsStatus = "connecting";
    const socket = new WebSocket(url);
    this.ws = socket;
    socket.onopen = () => {
      if (this.ws !== socket) return;
      this.wsStatus = "connected";
      if (this.wsReconnectTimer) {
        clearTimeout(this.wsReconnectTimer);
        this.wsReconnectTimer = null;
      }
      this.collabIdentify();
    };
    socket.onclose = () => {
      if (this.ws === socket) this.ws = null;
      this.clearCollaborationPresence();
      if (!this.collabEnabled) {
        this.wsStatus = "offline";
        return;
      }
      this.wsStatus = "disconnected";
      this.wsReconnectTimer = setTimeout(connect, 1000);
    };
    socket.onmessage = (evt) => {
       try {
         const msg = JSON.parse(evt.data);
         this.handleWsMessage(msg);
       } catch (_) {}
     };
   };
   connect();
 },
clearCollaborationPresence() {
  this.collab.userId = null;
  this.collab.users = [];
  this.collab.locks = {};
  this.collab.recording = false;
  this.collab.recordings = [];
  this.collab.status = '';
},
disconnectWebSocket({ status = "offline" } = {}) {
  if (this.wsReconnectTimer) {
    clearTimeout(this.wsReconnectTimer);
    this.wsReconnectTimer = null;
  }
  const socket = this.ws;
  this.ws = null;
  this.clearCollaborationPresence();
  this.wsStatus = status;
  if (socket && typeof socket.close === "function" && socket.readyState < 2) {
    try {
      socket.close();
    } catch (_) {}
  }
},
toggleCollaboration() {
  if (this.collabEnabled) {
    this.collabEnabled = false;
    this.disconnectWebSocket({ status: "offline" });
  } else {
    this.collabEnabled = true;
    this.wsStatus = "disconnected";
    this.connectWebSocket();
  }
  this.saveSessionState();
},
 handleWsMessage(msg) {
  if (msg.type === "batch" && Array.isArray(msg.messages)) {
    msg.messages.forEach((entry) => this.handleWsMessage(entry));
    return;
  }
   if (msg.type === "hello" && msg.userId) {
     this.collab.userId = msg.userId;
     this.collabIdentify();
   }
   if (msg.type === "presence" && Array.isArray(msg.users)) {
     this.collab.users = msg.users;
     const locks = {};
     msg.users.forEach((u) => {
       (u.lockedParams || []).forEach((param) => {
         locks[param] = u.name;
       });
     });
     this.collab.locks = locks;
   }
   if (msg.type === "shared_preset") {
     this.sharedPresetsStatus = `Shared preset ${msg.action}: ${msg.name}`;
     this.refreshSharedPresets();
     setTimeout(() => { this.sharedPresetsStatus = ""; }, 3000);
   }
   if (msg.type === "recording") {
     this.collab.recording = msg.status === "started";
     this.collab.status = msg.status === "started" ? "Session recording…" : "Recording saved on server";
   }
   if (msg.type === "recordings" && Array.isArray(msg.files)) {
     this.collab.recordings = msg.files;
   }
   if (msg.type === "playback") {
     this.collab.status = `Playback started (${msg.events || 0} events)`;
   }
   if (msg.type === "error") {
     console.error("[Defora WS]", msg.msg || msg, msg.locked || "");
    this.collab.status = this.collabEnabled ? (msg.msg || "WebSocket error") : "";
   }
   if (msg.type === "event") {
     if (msg.msg) console.log("[Defora event]", msg.msg);
   }
   if (msg.type === "stream" && msg.src) {
    this.markVideoReady(false);
     this.streamSrc = msg.src + "?t=" + Date.now();
     this.attachPlayer();
   }
   if (msg.type === "frame") {
    if (msg.item) this.mergeFrameThumb(msg.item);
    this.scheduleFrameRefresh(msg.item ? 80 : 0);
   }
  if (msg.type === "warmup_started") {
    this.selectVideoLayer('deforum');
    this.performance.status = 'Startup clip generating…';
  }
  if (msg.type === "warmup_done") {
    if (this.performance.status === 'Startup clip generating…') {
      this.performance.status = 'Startup clip ready';
    }
  }
  if (msg.type === "deforum_settings") {
    this.loadDeforumSettings({ syncServerModel: false });
  }
  if (msg.type === "sd_model" && msg.model) {
    const modelName = msg.model.model_name || msg.model.title || '';
    this.applyLoadedModelSelection(modelName, { queueDeforumSave: false });
  }
 },
 collabIdentify() {
   if (!this.ws || this.ws.readyState !== 1) return;
   this.wsSend({ type: "identify", name: this.collab.userName || "Performer" });
 },
 saveCollabUserName() {
   try {
     localStorage.setItem("defora_user_name", this.collab.userName || "Performer");
   } catch (_) {}
 },
 wsSend(payload) {
   if (!this.ws || this.ws.readyState !== 1) return;
   this.ws.send(JSON.stringify(payload));
 },
 modelSourceLabel(source) {
   return modelSourceLabel(source);
 },
 isParamLocked(key) {
   return Boolean(this.collab.locks[key]);
 },
 isParamLockedByMe(key) {
   const who = this.collab.locks[key];
   return who && who === (this.collab.userName || "Performer");
 },
 paramLockTitle(key) {
   if (!this.collab.locks[key]) return "Lock parameter for collaboration";
   if (this.isParamLockedByMe(key)) return "Unlock (you hold this lock)";
   return `Locked by ${this.collab.locks[key]}`;
 },
 toggleParamLock(key) {
   if (this.isParamLockedByMe(key)) {
     this.unlockParam(key);
   } else if (!this.isParamLocked(key)) {
     this.wsSend({ type: "lock_param", param: key });
   } else {
     this.collab.status = `${key} is locked by ${this.collab.locks[key]}`;
   }
 },
 isParamPinned(key) {
   return this.pinnedParams.includes(key);
 },
 toggleParamPin(key) {
   const idx = this.pinnedParams.indexOf(key);
   if (idx === -1) {
     this.pinnedParams.push(key);
   } else {
     this.pinnedParams.splice(idx, 1);
   }
   try {
     if (typeof localStorage !== 'undefined') {
       localStorage.setItem('defora_pinned_params', JSON.stringify(this.pinnedParams));
     }
   } catch (_) {}
 },
 unlockParam(key) {
   this.wsSend({ type: "unlock_param", param: key });
 },
 toggleSessionRecording() {
   if (this.collab.recording) {
     this.wsSend({ type: "stop_recording" });
   } else {
     this.wsSend({ type: "start_recording" });
   }
 },
 listSessionRecordings() {
   this.wsSend({ type: "list_recordings" });
 },
 playbackSessionRecording(filename) {
   this.wsSend({ type: "playback_recording", recordingFile: filename });
 },
 async refreshSharedPresets() {
  this.sharedPresetsLoading = true;
   try {
     const { data } = await apiFetch("/api/shared-presets", {}, "shared-presets list");
     this.sharedPresets = data.presets || [];
   } catch (err) {
     this.sharedPresetsStatus = err.message;
  } finally {
    this.sharedPresetsLoading = false;
   }
 },
 async shareCurrentPreset() {
   const name = (this.sharedPresetName || this.newPresetName || this.currentPreset || "shared").replace(/[^a-zA-Z0-9_-]/g, "") || "shared";
   const preset = {
     liveVibe: this.liveVibe,
     liveCam: this.liveCam,
     audio: { bpm: this.audio.bpm, track: this.audio.track },
     cn: { slots: this.cn.slots, active: this.cn.active },
    loras: { common: this.loras.common, groupA: this.loras.groupA, groupB: this.loras.groupB },
     prompts: {
       pos: this.prompts.pos,
       neg: this.prompts.neg,
       morphOn: this.prompts.morphOn,
       loraCrossfaderOn: this.prompts.loraCrossfaderOn,
       crossfaderValue: this.prompts.crossfaderValue,
       loraCrossfaderLfoLink: this.prompts.loraCrossfaderLfoLink,
       loraCrossfaderLfoBase: this.prompts.loraCrossfaderLfoBase,
       morphBlend: this.prompts.morphBlend,
       morphBlendLfoLink: this.prompts.morphBlendLfoLink,
       morphBlendLfoBase: this.prompts.morphBlendLfoBase,
     },
     lfos: this.lfos,
     macrosRack: this.macrosRack,
     paramSources: this.paramSources,
   };
   try {
     await apiFetch("/api/shared-presets", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         name,
         preset,
         sharedBy: this.collab.userName || "anonymous",
         description: `Shared from web UI`,
       }),
     }, "share preset");
     this.sharedPresetsStatus = `Shared as ${name}`;
     this.sharedPresetName = name;
     await this.refreshSharedPresets();
   } catch (err) {
     this.sharedPresetsStatus = err.message;
   }
 },
 async loadSharedPreset(name) {
   try {
     const { data } = await apiFetch(`/api/shared-presets/${encodeURIComponent(name)}`, {}, "load shared preset");
     const preset = data.preset || data;
     if (preset.liveVibe) this.liveVibe = preset.liveVibe;
     if (preset.liveCam) this.liveCam = preset.liveCam;
     if (preset.audio) Object.assign(this.audio, preset.audio);
     if (preset.cn) Object.assign(this.cn, preset.cn);
     if (preset.lfos) this.lfos = preset.lfos;
     if (preset.macrosRack) this.macrosRack = preset.macrosRack;
     if (preset.prompts) Object.assign(this.prompts, preset.prompts);
     if (preset.loras) {
      this.loras.common = preset.loras.common || [];
       this.loras.groupA = preset.loras.groupA || [];
       this.loras.groupB = preset.loras.groupB || [];
       await this.refreshLoras();
     }
     this.sharedPresetsStatus = `Loaded shared preset: ${name}`;
     setTimeout(() => { this.sharedPresetsStatus = ""; }, 3000);
   } catch (err) {
     this.sharedPresetsStatus = err.message;
   }
 },
 async deleteSharedPreset(name) {
   if (!confirm(`Delete shared preset "${name}"?`)) return;
   try {
     await apiFetch(`/api/shared-presets/${encodeURIComponent(name)}`, { method: "DELETE" }, "delete shared preset");
     await this.refreshSharedPresets();
     this.sharedPresetsStatus = `Deleted ${name}`;
   } catch (err) {
     this.sharedPresetsStatus = err.message;
   }
 },
 async refreshGpuPool(refreshStats = false) {
   this.gpuPool.loading = true;
   this.infrastructure.loading = true;
   try {
     if (refreshStats) {
       await apiFetch("/api/gpu-pool/refresh", { method: "POST" }, "gpu pool refresh");
     }
     const [poolResult, infraResult] = await Promise.allSettled([
       apiFetch("/api/gpu-pool", {}, "gpu pool status"),
       apiFetch("/api/infrastructure", {}, "infrastructure status"),
     ]);
     if (poolResult.status === "fulfilled") {
       const data = poolResult.value.data;
       this.gpuPool.enabled = !!data.enabled;
       this.gpuPool.strategy = data.strategy || "round_robin";
      this.gpuPool.defaultForgeModel = data.defaultForgeModel || "";
       this.gpuPool.healthyNodes = data.healthyNodes ?? 0;
       this.gpuPool.nodes = data.nodes || [];
       const modelOptions = { ...(this.gpuPool.modelOptions || {}) };
       this.gpuPool.nodes.forEach((node) => {
         if (node && node.url && Array.isArray(node.availableModels) && node.availableModels.length) {
           modelOptions[node.url] = [...node.availableModels];
         }
       });
       this.gpuPool.modelOptions = modelOptions;
     } else {
       this.gpuPool.status = poolResult.reason?.message || "Failed to load GPU pool";
     }
     if (infraResult.status === "fulfilled") {
       const infra = infraResult.value.data || {};
       this.infrastructure.mediator = infra.mediator || null;
       this.infrastructure.transcoders = Array.isArray(infra.transcoders) ? infra.transcoders : [];
       this.infrastructure.updatedAt = infra.updatedAt || null;
     } else {
       this.infrastructure.mediator = null;
       this.infrastructure.transcoders = [];
     }
   } catch (err) {
     this.gpuPool.status = err.message;
   } finally {
     this.gpuPool.loading = false;
     this.infrastructure.loading = false;
   }
 },
ollamaModelOptions(url) {
  const map = this.gpuPool.modelOptions || {};
  const normalized = String(url || '').trim().replace(/\/+$/, '');
  return (map[url] || map[normalized] || []).filter(Boolean);
},
frameThumbsCacheKey() {
  return "defora.frameThumbs.v1";
},
frameThumbsCacheLimit() {
  return 48;
},
frameSrcKey(value) {
  return String(value || "").split("?")[0];
},
loadCachedFrameThumbs() {
  try {
    if (!window.localStorage) return [];
    const raw = window.localStorage.getItem(this.frameThumbsCacheKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => this.normalizeFrameThumb(item)).filter(Boolean);
  } catch (_e) {
    return [];
  }
},
saveCachedFrameThumbs(thumbs) {
  try {
    if (!window.localStorage) return;
    const payload = (Array.isArray(thumbs) ? thumbs : [])
      .slice(-this.frameThumbsCacheLimit())
      .map((thumb) => ({
        name: thumb.name,
        src: this.frameSrcKey(thumb.src || thumb.url || thumb.path || ""),
        frame: thumb.frame,
        mtime: thumb.mtime,
      }))
      .filter((thumb) => thumb.name || thumb.src);
    window.localStorage.setItem(this.frameThumbsCacheKey(), JSON.stringify(payload));
  } catch (_e) {
    /* ignore quota errors */
  }
},
mergeFrameThumbs(apiItems, { keepCachedOnEmpty = true } = {}) {
  const cached = this.loadCachedFrameThumbs();
  const apiThumbs = (Array.isArray(apiItems) ? apiItems : [])
    .map((item) => this.normalizeFrameThumb(item))
    .filter(Boolean);
  const byName = new Map();
  if (keepCachedOnEmpty || apiThumbs.length) {
    cached.forEach((thumb) => {
      if (thumb && thumb.name) byName.set(thumb.name, thumb);
    });
  }
  apiThumbs.forEach((thumb) => {
    if (thumb && thumb.name) byName.set(thumb.name, thumb);
  });
  return [...byName.values()]
    .sort((a, b) => {
      const aFrame = Number(a && a.frame);
      const bFrame = Number(b && b.frame);
      if (Number.isFinite(aFrame) && Number.isFinite(bFrame)) return aFrame - bFrame;
      return String(a && a.name || "").localeCompare(String(b && b.name || ""));
    })
    .slice(-this.frameThumbsCacheLimit());
},
normalizeFrameThumb(item) {
  if (!item) return null;
  if (typeof item === "string") {
    const src = item;
    const baseSrc = this.frameSrcKey(src);
    return {
      src,
      name: baseSrc.split("/").pop(),
      frame: this.parseFrameNumber(baseSrc),
      mtime: Date.now(),
    };
  }
  const rawSrc = item.src || item.url || item.path || "";
  const name = item.name || this.frameSrcKey(rawSrc).split("/").pop() || "";
  const frame = item.frame != null ? item.frame : this.parseFrameNumber(name || rawSrc);
  const mtime = Number(item.mtime) || Date.now();
  const src = rawSrc || (name ? `/frames/${name}?v=${mtime}` : "");
  return { src, name, frame, mtime };
},
mergeFrameThumb(item) {
  const normalized = this.normalizeFrameThumb(item);
  if (!normalized || (!normalized.name && !normalized.src)) return;
  const selectedSrcKey = this.frameSrcKey(
    this.selectedFrameThumb ? (this.selectedFrameThumb.src || this.selectedFrameThumb.url || this.selectedFrameThumb.path || "") : ""
  );
  const next = [...(this.thumbs || [])]
    .filter((entry) => entry && entry.name !== normalized.name)
    .concat(normalized)
    .sort((a, b) => {
      const aFrame = Number(a && a.frame);
      const bFrame = Number(b && b.frame);
      if (Number.isFinite(aFrame) && Number.isFinite(bFrame)) return aFrame - bFrame;
      return String(a && a.name || "").localeCompare(String(b && b.name || ""));
    });
  this.thumbs = next;
  this.saveCachedFrameThumbs(next);
  this.updateFrameSelection(selectedSrcKey);
},
scheduleFrameRefresh(delay = 0) {
  clearTimeout(this.frameRefreshTimer);
  this.frameRefreshTimer = setTimeout(() => {
    this.frameRefreshTimer = null;
    this.refreshFrames();
  }, Math.max(0, Number(delay) || 0));
},
nextFramesPollDelay({ failed = false } = {}) {
  const current = Number(this.framesRefreshBackoffMs) || 1000;
  if (failed) {
    return Math.min(10000, Math.max(1000, current * 2));
  }
  if (this.previewGenerating || this.deforumPlaying) return 750;
  if (this.wsStatus !== "connected") return 1500;
  return 3000;
},
async loadOllamaModels(url) {
  const normalized = (url || '').trim();
  if (!normalized) {
    this.gpuPool.status = 'Enter an Ollama URL first.';
    return [];
  }
  const { data } = await apiFetch(`/api/ollama/models?url=${encodeURIComponent(normalized)}`, {}, 'ollama models');
  const models = (data.models || [])
    .map((entry) => (entry && typeof entry === 'object' ? entry.name : entry))
    .filter(Boolean);
  const key = data && data.url ? data.url : normalized;
  this.gpuPool.modelOptions = {
    ...(this.gpuPool.modelOptions || {}),
    [key]: models,
  };
  return models;
},
async refreshGpuDraftModels() {
  try {
    const models = await this.loadOllamaModels(this.gpuPool.draft.url);
    if (!this.gpuPool.draft.model && models.length) this.gpuPool.draft.model = models[0];
    this.gpuPool.status = models.length ? `Loaded ${models.length} Ollama models.` : 'No Ollama models found.';
  } catch (err) {
    this.gpuPool.status = err.message;
  }
},
async refreshGpuEditModels() {
  try {
    const models = await this.loadOllamaModels(this.gpuPool.editDraft.url);
    if (!this.gpuPool.editDraft.model && models.length) this.gpuPool.editDraft.model = models[0];
    this.gpuPool.status = models.length ? `Loaded ${models.length} Ollama models.` : 'No Ollama models found.';
  } catch (err) {
    this.gpuPool.status = err.message;
  }
},
gpuForgeOptionKeys() {
  return [
    'sampler_name',
    'scheduler',
    'steps',
    'cfg_scale',
    'width',
    'height',
    'batch_size',
    'sd_vae',
    'clip_skip',
    'eta_ddim',
    'eta_ancestral',
    'sigma_churn',
    'enable_emphasis',
    'use_old_sampling',
    'do_not_add_watermark',
  ];
},
normalizeGpuForgeSettings(raw = {}, fallback = {}) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const base = fallback && typeof fallback === 'object' ? fallback : {};
  const numericKeys = new Set(['steps', 'cfg_scale', 'width', 'height', 'batch_size', 'clip_skip', 'eta_ddim', 'eta_ancestral', 'sigma_churn']);
  const booleanKeys = new Set(['enable_emphasis', 'use_old_sampling', 'do_not_add_watermark']);
  const merged = {};
  for (const key of this.gpuForgeOptionKeys()) {
    const value = source[key] !== undefined ? source[key] : base[key];
    if (value === undefined) continue;
    if (booleanKeys.has(key)) {
      merged[key] = !!value;
      continue;
    }
    if (numericKeys.has(key)) {
      const num = Number(value);
      if (Number.isFinite(num)) merged[key] = num;
      continue;
    }
    merged[key] = value == null ? null : String(value);
  }
  return merged;
},
gpuForgePreferredQuery(nodeId) {
  return nodeId ? `?preferredNode=${encodeURIComponent(nodeId)}` : '';
},
closeGpuForgeModal() {
  this.gpuPool.forgeModal = {
    open: false,
    nodeId: '',
    nodeName: '',
    url: '',
    priority: 1,
    model: '',
    currentModel: '',
    available: false,
    loading: false,
    saving: false,
    applying: false,
    status: '',
    samplers: [],
    schedulers: [],
    vaeList: [],
    modelInfo: null,
    options: {},
  };
},
async refreshGpuForgeModalOptions() {
  const modal = this.gpuPool.forgeModal;
  if (!modal.open || !modal.nodeId) return;
  const query = this.gpuForgePreferredQuery(modal.nodeId);
  const fallbackNode = (this.gpuPool.nodes || []).find((node) => node && node.id === modal.nodeId) || {};
  modal.loading = true;
  modal.status = 'Loading Forge instance...';
  try {
    const [optRes, sampRes, schedRes, vaeRes, curRes] = await Promise.all([
      fetch(`/api/forge/options${query}`),
      fetch(`/api/forge/samplers${query}`),
      fetch(`/api/forge/schedulers${query}`),
      fetch(`/api/forge/vae${query}`),
      fetch(`/api/sd-models/current${query}`),
    ]);
    const [opt, samp, sched, vae, cur] = await Promise.all([
      optRes.json(),
      sampRes.json(),
      schedRes.json(),
      vaeRes.json(),
      curRes.json(),
    ]);
    if (!this.gpuPool.forgeModal.open || this.gpuPool.forgeModal.nodeId !== modal.nodeId) return;
    const fallbackOptions = this.normalizeGpuForgeSettings(
      fallbackNode.forgeSettings || {},
      this.forge.options || {}
    );
    this.gpuPool.forgeModal.available = !!opt.available;
    this.gpuPool.forgeModal.options = this.normalizeGpuForgeSettings(opt.options || {}, fallbackOptions);
    this.gpuPool.forgeModal.samplers = Array.isArray(samp.samplers) ? samp.samplers : [...(this.forge.samplers || [])];
    this.gpuPool.forgeModal.schedulers = Array.isArray(sched.schedulers) ? sched.schedulers : [...(this.forge.schedulers || [])];
    this.gpuPool.forgeModal.vaeList = Array.isArray(vae.vae) ? vae.vae : [...(this.forge.vaeList || [])];
    const currentModel = cur && cur.model ? (cur.model.model_name || cur.model.title || '') : '';
    this.gpuPool.forgeModal.currentModel = currentModel;
    this.gpuPool.forgeModal.model = fallbackNode.model || currentModel || '';
    this.gpuPool.forgeModal.modelInfo = (cur && cur.model && cur.model.metadata) || null;
    this.gpuPool.forgeModal.status = opt.available ? 'Forge instance ready.' : (opt.error || 'Forge instance unavailable.');
  } catch (err) {
    this.gpuPool.forgeModal.options = this.normalizeGpuForgeSettings(
      fallbackNode.forgeSettings || {},
      this.forge.options || {}
    );
    this.gpuPool.forgeModal.samplers = [...(this.forge.samplers || [])];
    this.gpuPool.forgeModal.schedulers = [...(this.forge.schedulers || [])];
    this.gpuPool.forgeModal.vaeList = [...(this.forge.vaeList || [])];
    this.gpuPool.forgeModal.currentModel = fallbackNode.currentModel || fallbackNode.model || '';
    this.gpuPool.forgeModal.model = fallbackNode.model || fallbackNode.currentModel || '';
    this.gpuPool.forgeModal.modelInfo = null;
    this.gpuPool.forgeModal.available = false;
    this.gpuPool.forgeModal.status = err.message || 'Failed to load Forge instance.';
  } finally {
    if (this.gpuPool.forgeModal.nodeId === modal.nodeId) {
      this.gpuPool.forgeModal.loading = false;
    }
  }
},
async openGpuForgeModal(node) {
  const fallbackOptions = this.normalizeGpuForgeSettings(node && node.forgeSettings || {}, this.forge.options || {});
  this.gpuPool.editId = null;
  this.gpuPool.forgeModal = {
    open: true,
    nodeId: node.id,
    nodeName: node.name || '',
    url: node.url || '',
    priority: node.priority || 1,
    model: node.model || '',
    currentModel: node.currentModel || node.model || '',
    available: false,
    loading: false,
    saving: false,
    applying: false,
    status: '',
    samplers: [...(this.forge.samplers || [])],
    schedulers: [...(this.forge.schedulers || [])],
    vaeList: [...(this.forge.vaeList || [])],
    modelInfo: null,
    options: fallbackOptions,
  };
  await this.refreshGpuForgeModalOptions();
},
async persistGpuForgeModalNode() {
  const modal = this.gpuPool.forgeModal;
  const payload = {
    name: modal.nodeName || modal.url,
    url: modal.url,
    backend: 'sd-forge',
    priority: modal.priority || 1,
    model: modal.model || modal.currentModel || null,
    forgeSettings: this.normalizeGpuForgeSettings(modal.options || {}, this.forge.options || {}),
  };
  const { data } = await apiFetch(`/api/gpu-pool/nodes/${encodeURIComponent(modal.nodeId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'save forge gpu node');
  const savedNode = data && data.node ? data.node : null;
  if (savedNode) {
    this.gpuPool.forgeModal.nodeId = savedNode.id || modal.nodeId;
    this.gpuPool.forgeModal.nodeName = savedNode.name || modal.nodeName;
    this.gpuPool.forgeModal.url = savedNode.url || modal.url;
    this.gpuPool.forgeModal.priority = savedNode.priority || modal.priority;
    this.gpuPool.forgeModal.model = savedNode.model || modal.model;
  }
  await this.refreshGpuPool(false);
  return savedNode;
},
async saveGpuForgeModal() {
  this.gpuPool.forgeModal.saving = true;
  try {
    await this.persistGpuForgeModalNode();
    this.gpuPool.forgeModal.status = 'Forge instance settings saved.';
    this.gpuPool.status = 'Forge instance settings saved.';
  } catch (err) {
    this.gpuPool.forgeModal.status = err.message;
    this.gpuPool.status = err.message;
  } finally {
    this.gpuPool.forgeModal.saving = false;
  }
},
async applyGpuForgeModalOptions() {
  this.gpuPool.forgeModal.applying = true;
  try {
    const savedNode = await this.persistGpuForgeModalNode();
    const preferredNode = (savedNode && savedNode.id) || this.gpuPool.forgeModal.nodeId;
    await apiFetch(`/api/forge/options${this.gpuForgePreferredQuery(preferredNode)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.normalizeGpuForgeSettings(this.gpuPool.forgeModal.options || {}, this.forge.options || {})),
    }, 'apply forge node options');
    this.gpuPool.forgeModal.status = 'Forge options applied to this instance.';
    this.gpuPool.status = 'Forge options applied to this instance.';
    await this.refreshGpuForgeModalOptions();
  } catch (err) {
    this.gpuPool.forgeModal.status = err.message;
    this.gpuPool.status = err.message;
  } finally {
    this.gpuPool.forgeModal.applying = false;
  }
},
 async saveGpuPoolSettings() {
   try {
     await apiFetch("/api/gpu-pool", {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         enabled: this.gpuPool.enabled,
         strategy: this.gpuPool.strategy,
       }),
     }, "gpu pool settings");
     this.gpuPool.status = this.gpuPool.enabled ? "Load balancing enabled" : "Load balancing disabled";
   } catch (err) {
     this.gpuPool.status = err.message;
   }
 },

 async saveDefaultForgeModel({ preload = true } = {}) {
   try {
     this.gpuPool.defaultForgeModelStatus = "Saving default model…";
     const res = await apiFetch(
       "/api/gpu-pool/default-forge-model",
       {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           model: this.gpuPool.defaultForgeModel || "",
           preload: preload === true,
         }),
       },
       "default forge model"
     );
     const results = res.data?.preloadResults;
     if (Array.isArray(results) && results.length) {
       const ok = results.filter((r) => r && r.ok).length;
       const fail = results.filter((r) => r && !r.ok).length;
       this.gpuPool.defaultForgeModelStatus = `Default model saved. Preload: ${ok} ok, ${fail} failed.`;
     } else {
       this.gpuPool.defaultForgeModelStatus = "Default model saved.";
     }
     await this.refreshGpuPool(true);
   } catch (err) {
     this.gpuPool.defaultForgeModelStatus = err.message;
     this.gpuPool.status = err.message;
   }
 },
 async addGpuNode() {
   const url = (this.gpuPool.draft.url || "").trim();
   if (!url) return;
   try {
     await apiFetch("/api/gpu-pool/nodes", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         url,
         name: this.gpuPool.draft.name || url,
         backend: this.gpuPool.draft.backend,
         enabled: false,
         priority: this.gpuPool.draft.priority || 1,
        model: this.gpuPool.draft.backend === 'ollama' ? (this.gpuPool.draft.model || null) : null,
       }),
     }, "add gpu node");
    this.gpuPool.draft = { url: "", name: "", backend: "sd-forge", priority: 1, model: "" };
     await this.refreshGpuPool(false);
     this.gpuPool.status = "Instance added (disabled). Edit if needed, then enable.";
   } catch (err) {
     this.gpuPool.status = err.message;
   }
 },
async startEditGpuNode(n) {
   if (n.enabled) {
     this.gpuPool.status = "Disable the node before editing.";
     return;
   }
  if (n.backend === 'sd-forge') {
    await this.openGpuForgeModal(n);
    return;
  }
   this.gpuPool.editId = n.id;
   this.gpuPool.editDraft = {
     name: n.name,
     url: n.url,
     backend: n.backend,
     priority: n.priority || 1,
    model: n.model || '',
   };
 },
 async saveGpuNodeEdit(n) {
   try {
     await apiFetch(`/api/gpu-pool/nodes/${encodeURIComponent(n.id)}`, {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(this.gpuPool.editDraft),
     }, "edit gpu node");
     this.gpuPool.editId = null;
     await this.refreshGpuPool(false);
     this.gpuPool.status = "Node updated.";
   } catch (err) {
     this.gpuPool.status = err.message;
   }
 },
 async disableGpuNode(n) {
   try {
     await apiFetch(`/api/gpu-pool/nodes/${encodeURIComponent(n.id)}/disable`, { method: "POST" }, "disable gpu");
     await this.refreshGpuPool(false);
   } catch (err) {
     this.gpuPool.status = err.message;
   }
 },
 async enableGpuNode(n) {
   try {
     await apiFetch(`/api/gpu-pool/nodes/${encodeURIComponent(n.id)}/enable`, { method: "POST" }, "enable gpu");
     await this.refreshGpuPool(true);
     this.gpuPool.status = `${n.name} enabled.`;
   } catch (err) {
     this.gpuPool.status = err.message;
   }
 },
 async removeGpuNode(n) {
   if (!confirm(`Remove GPU instance "${n.name}"?`)) return;
   try {
     await apiFetch(`/api/gpu-pool/nodes/${encodeURIComponent(n.id)}`, { method: "DELETE" }, "remove gpu");
     await this.refreshGpuPool(false);
     this.gpuPool.status = "Node removed.";
   } catch (err) {
     this.gpuPool.status = err.message;
   }
 },
 formatGpuMemory(n) {
   if (n.memoryUsedMb == null && n.memoryTotalMb == null) return "—";
   const used = n.memoryUsedMb != null ? `${n.memoryUsedMb}` : "?";
   const total = n.memoryTotalMb != null ? `${n.memoryTotalMb}` : "?";
   return `${used} / ${total} MB`;
 },
 sendControl(controlType, payload) {
   if (!this.ws || this.ws.readyState !== 1) return;
  if (controlType === "liveParam" && payload && typeof payload === "object") {
    this.syncMotionPadFromPayload(payload);
  }
   const msg = { type: "control", controlType, payload };
   this.ws.send(JSON.stringify(msg));
 },
syncMotionPadFromPayload(payload) {
  if (!payload || typeof payload !== "object") return;
  const x = payload.translation_x ?? payload.panx;
  const y = payload.translation_y ?? payload.pany;
  const z = payload.translation_z;
  const zoom = payload.zoom_2d ?? payload.zoom;
  if (x != null && Number.isFinite(Number(x))) {
    this.motionPadValues.translation_x = Number(x);
  }
  if (y != null && Number.isFinite(Number(y))) {
    this.motionPadValues.translation_y = Number(y);
  }
  if (z != null && Number.isFinite(Number(z))) {
    this.motionPadValues.translation_z = Number(z);
  }
  if (zoom != null && Number.isFinite(Number(zoom))) {
    this.motionPadValues.zoom = Number(zoom);
  }
},
 updateParam(p, evt) {
   if (this.isParamLocked(p.key) && !this.isParamLockedByMe(p.key)) {
     console.warn(`[Defora] Parameter "${p.key}" is locked by ${this.collab.locks[p.key]}`);
     return;
   }
   const val = parseFloat(evt.target.value);
   p.val = val;
   this.queueLiveParam(p.key, val);
   if (!this.deforumPlaying) this.schedulePreviewFrame();
 },
 setSource(key, source) {
   this.paramSources[key] = source;
   this.sendControl("paramSource", { key, source });
 },
 clearParamMapping(paramKey) {
   if (!paramKey) return;
   this.setSource(paramKey, 'Manual');
 },
 openModulationMapping(paramKey) {
   // Best-effort: jump to modulation view where mappings are managed.
   if (!paramKey) return;
   this.switchTab('MODULATION');
   this.currentSubTab.MODULATION = 'ACTIVE_MODS';
   try { window.localStorage && window.localStorage.setItem('defora_subtab_MODULATION', 'ACTIVE_MODS'); } catch (_e) {}
 },
 setLiveModValue(paramKey, value) {
   if (!paramKey) return;
   const v = Number(value);
   if (!Number.isFinite(v)) return;
   const t = this.modulationTargetByKey(paramKey);
   if (t && t.field) {
     this.applyAnimationModulation(t.field, v);
   } else {
     this.queueLiveParam(paramKey, v);
   }
   if (!this.deforumPlaying) this.schedulePreviewFrame();
 },
 livePadDown(evt, slot) {
   this._livePadDragging = true;
   this.livePadMove(evt, slot);
 },
 livePadMove(evt, slot) {
   if (!this._livePadDragging || !slot) return;
   const el = evt.currentTarget;
   if (!el || !el.getBoundingClientRect) return;
   const rect = el.getBoundingClientRect();
   const point = evt.touches && evt.touches[0] ? evt.touches[0] : evt;
   const nx = (point.clientX - rect.left) / (rect.width || 1);
   const ny = (point.clientY - rect.top) / (rect.height || 1);
   const x = Math.max(0, Math.min(1, nx));
   const y = Math.max(0, Math.min(1, 1 - ny));
   const px = this.modulationTargetByKey(slot.paramKeyX);
   const py = this.modulationTargetByKey(slot.paramKeyY);
   if (slot.paramKeyX && px) {
     const xv = (px.min ?? 0) + x * (((px.max ?? 1) - (px.min ?? 0)) || 1);
     this.setLiveModValue(slot.paramKeyX, xv);
   }
   if (slot.paramKeyY && py) {
     const yv = (py.min ?? 0) + y * (((py.max ?? 1) - (py.min ?? 0)) || 1);
     this.setLiveModValue(slot.paramKeyY, yv);
   }
 },
 livePadUp() {
   this._livePadDragging = false;
 },
 sourceTip(p) {
   const src = this.paramSources[p.key];
   if (src === "Beat") return "Beat/LFO";
   if (src === "MIDI") return "MIDI mapping";
   return "Manual";
 },
applyMotionPresetAndSelect(name) {
  this.motionSelectedPreset = name;
  this.applyMotionPreset(name);
},
loadSelectedMotionPreset() {
  const name = this.motionSelectedPreset;
  if (!name) return;
  if (this.motionPresets[name]) {
    this.applyMotionPreset(name);
    return;
  }
  if (this.motionStylesSaved[name]) {
    this.applySavedMotionStyle(name);
  }
},
setMotionAxis(axis, value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return;
  if (axis === 'translation_x') this.motionPadValues.translation_x = num;
  else if (axis === 'translation_y') this.motionPadValues.translation_y = num;
  else if (axis === 'translation_z') this.motionPadValues.translation_z = num;
  else if (axis === 'zoom') this.motionPadValues.zoom = num;
  const paramKey = axis === 'zoom' ? 'zoom_2d' : axis;
  this.emitMotionLiveParam(paramKey, num);
  if (!this.deforumPlaying) this.schedulePreviewFrame();
},
emitMotionLiveParam(key, val) {
  const num = Number(val);
  if (!Number.isFinite(num)) return;
  const now = this.getNow();
  const last = this.lastParamSent[key] || 0;
  this.liveParamPending[key] = num;
  if (now - last > this.controlDelayMs) {
    this.lastParamSent[key] = now;
    this.sendControl("liveParam", { [key]: num });
    return;
  }
  clearTimeout(this.liveParamTimers[key]);
  this.liveParamTimers[key] = setTimeout(() => {
    const v = this.liveParamPending[key];
    delete this.liveParamPending[key];
    this.lastParamSent[key] = this.getNow();
    this.sendControl("liveParam", { [key]: v });
  }, this.controlDelayMs);
},
 sendPreset(name) {
   const preset = this.motionPresets[name];
   if (!preset) return;
   this.sendControl("liveParam", preset);
   this.syncMotionPadFromPayload(preset);
   console.log(`Applied motion preset: ${name}`, preset);
 },
 resetVibeParams() {
   const defaults = { cfg: 6.0, strength: 0.65, noise: 1.0, cfgscale: 5.0 };
   this.liveVibe.forEach((p) => {
     if (defaults[p.key] !== undefined) {
       p.val = defaults[p.key];
       this.queueLiveParam(p.key, defaults[p.key]);
     }
   });
 },
 resetCameraParams() {
   const defaults = { zoom: 0.8, panx: 0, pany: 0, tilt: 0 };
   this.liveCam.forEach((p) => {
     if (defaults[p.key] !== undefined) {
       p.val = defaults[p.key];
       this.queueLiveParam(p.key, defaults[p.key]);
     }
   });
   this.sendControl("liveParam", this.motionPresets.Static);
 },
  setupKeyboardShortcuts() {
    if (typeof document === "undefined") return;
    const self = this;
    this._keyHandler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (self.bindingLearnMode && self.bindingTargetKey) {
        const key = e.key.toLowerCase();
        if (key.length === 1 || ["arrowup", "arrowdown", "arrowleft", "arrowright", "space", "enter", "tab"].includes(key)) {
          self.keyBindings[self.bindingTargetKey] = key;
          self.saveBindings();
          self.status = `Bound "${self.bindingTargetKey}" → ${key}`;
          self.bindingTargetKey = null;
          e.preventDefault();
          return;
        }
      }
      const boundKey = Object.entries(self.keyBindings).find(([, v]) => v === e.key.toLowerCase());
      if (boundKey) {
        const [paramKey] = boundKey;
        const target = self.modulationTargetByKey(paramKey);
        if (target) {
          const current = self.getParamValue(paramKey);
          const step = (target.max - target.min) * 0.05;
          const next = Math.min(target.max, Math.max(target.min, current + step));
          if (target.field) {
            self.applyAnimationModulation(target.field, next);
          } else {
            self.queueLiveParam(paramKey, next);
          }
          e.preventDefault();
          return;
        }
      }
      switch(e.key) {
        case "1": case "2": case "3": case "4": case "5": case "6":
          const tabs = ["LIVE", "PROMPTS", "MOTION", "MODULATION", "SETTINGS"];
          self.switchTab(tabs[parseInt(e.key) - 1]);
          e.preventDefault();
          break;
        case " ":
          if (self.currentTab === "LIVE") {
            self.generatePreviewFrame();
            e.preventDefault();
          } else if (self.showMotionSequencerDock) {
            self.generatePreviewFrame();
            e.preventDefault();
          }
          break;
        case "r":
          if (self.currentTab === "LIVE") {
            self.resetVibeParams();
            self.resetCameraParams();
            e.preventDefault();
          }
          break;
        case "m":
          if (self.currentTab === "PROMPTS") {
            self.prompts.morphOn = !self.prompts.morphOn;
            self.setMorph(self.prompts.morphOn);
            e.preventDefault();
          }
          break;
        case "l":
          if (self.currentTab === "MODULATION") {
            self.lfoOn = !self.lfoOn;
            e.preventDefault();
          }
          break;
        case "b":
          if (self.currentTab === "MODULATION") {
            self.switchSubTab("MODULATION", "BEAT_MACROS");
            self.beatMacroOn = !self.beatMacroOn;
            e.preventDefault();
          }
          break;
      }
    };
    document.addEventListener("keydown", this._keyHandler);
  },
 midiTarget(key) {
   const k = String(key || "");
   const m = k.match(/^mod_slot_(\d)$/);
   if (m) {
     const idx = Math.max(1, Math.min(6, Number(m[1]) || 1));
     const slots = Array.isArray(this.liveModulationSlots) ? this.liveModulationSlots : [];
     const slot = slots[idx - 1];
     if (!slot) return null;
     if (slot.kind === 'xypad') return null; // XY handled separately
     if (!slot.paramKey) return null;
     return this.modulationTargetByKey(slot.paramKey);
   }
   return this.modulationTargetByKey(k);
 },
 updateMidiMapping(map) {
   // noop hook for now; v-model already updates
   return map;
 },
 setMorph(on) {
   this.prompts.morphOn = on;
   this.sendControl("prompts", { morphOn: on });
   if (on) {
     this.applyPromptMorphing();
   }
 },
 parseMorphRange(range) {
   const m = String(range || "0–1").match(/([0-9.]+)\s*[–\-]\s*([0-9.]+)/);
   if (!m) return { min: 0, max: 1 };
   const min = Math.min(parseFloat(m[1]), parseFloat(m[2]));
   const max = Math.max(parseFloat(m[1]), parseFloat(m[2]));
   return { min, max };
 },
 morphSlotInRange(slot) {
   const { min, max } = this.parseMorphRange(slot.range);
   const t = this.prompts.morphBlend ?? 0.5;
   return t >= min && t <= max;
 },
 morphBlendInSlotRange(slot) {
   const { min, max } = this.parseMorphRange(slot.range);
   const t = this.prompts.morphBlend ?? 0.5;
   if (max <= min) return t;
   return Math.max(0, Math.min(1, (t - min) / (max - min)));
 },
 morphSlotPreview(slot) {
   if (!slot.on || !this.morphSlotInRange(slot)) return "—";
   const phrase = morphSlotValue(
     { type: "prompt", valueA: slot.a, valueB: slot.b },
     this.morphBlendInSlotRange(slot)
   );
   if (!phrase) return "—";
   const w = slot.weight != null ? slot.weight : 1;
   return w < 0.99 ? `${phrase} ×${w.toFixed(2)}` : phrase;
 },
 onPromptMorphBlendInput() {
  this.applyPromptMorphBlend(this.prompts.morphBlend, { commitBase: true });
 },
 onMorphSlotWeightInput(_slot) {
   this.applyPromptMorphing();
   if (!this.deforumPlaying) this.schedulePreviewFrame();
 },
onMorphSlotPhraseInput(_slot) {
  this.applyPromptMorphing();
  if (!this.deforumPlaying) this.schedulePreviewFrame();
},
applyPromptMorphBlend(value, { commitBase = false, fromModulation = false } = {}) {
  const next = this.clampVal(Number(value) || 0, 0, 1);
  this.prompts.morphBlend = next;
  if (commitBase || !fromModulation) {
    this.prompts.morphBlendLfoBase = next;
  }
  this.applyPromptMorphing();
  if (!fromModulation && !this.deforumPlaying) {
    this.schedulePreviewFrame();
  }
},
setPromptMorphBlendLfoLink(lfoId) {
  const nextId = Number(lfoId || 0);
  const allowed = nextId >= 1 && nextId <= 4 ? nextId : null;
  this.prompts.morphBlendLfoLink = this.prompts.morphBlendLfoLink === allowed ? null : allowed;
  this.prompts.morphBlendLfoBase = this.prompts.morphBlend;
  if (this.prompts.morphBlendLfoLink) {
    const linked = this.lfos.find((lfo) => lfo.id === this.prompts.morphBlendLfoLink);
    if (linked) linked.on = true;
  }
},
setLoraCrossfaderOn(on) {
  this.prompts.loraCrossfaderOn = !!on;
  this.sendControl("prompts", { loraCrossfaderOn: this.prompts.loraCrossfaderOn });
  if (this.loras.groupA.length || this.loras.groupB.length) {
    this.applyLoras();
  }
  this.saveSessionState();
},
applyLoraCrossfader(value, { commitBase = false, fromModulation = false } = {}) {
  const next = this.clampVal(Number(value) || 0, 0, 1);
  this.prompts.crossfaderValue = next;
  this.performance.crossfader = next;
  if (commitBase || !fromModulation) {
    this.prompts.loraCrossfaderLfoBase = next;
  }
  if (!this.prompts.loraCrossfaderOn) {
    if (!fromModulation) {
      this.saveSessionState();
    }
    return;
  }
  if (this.performance.slots.length) {
    this.applyCrossfadeMorph();
  } else if (this.loras.groupA.length || this.loras.groupB.length) {
    this.applyLoras();
  }
  if (!fromModulation) {
    this.saveSessionState();
  }
},
setLoraCrossfaderLfoLink(lfoId) {
  const nextId = Number(lfoId || 0);
  const allowed = nextId >= 1 && nextId <= 6 ? nextId : null;
  this.prompts.loraCrossfaderLfoLink = this.prompts.loraCrossfaderLfoLink === allowed ? null : allowed;
  this.prompts.loraCrossfaderLfoBase = this.performance.crossfader;
  if (this.prompts.loraCrossfaderLfoLink) {
    const linked = this.lfos.find((lfo) => lfo.id === this.prompts.loraCrossfaderLfoLink);
    if (linked) linked.on = true;
  }
},
toggleLoraFamilyCollapse(familyKey) {
  if (!familyKey || !this.loras.familyCollapsed || !(familyKey in this.loras.familyCollapsed)) return;
  this.loras.familyCollapsed[familyKey] = !this.loras.familyCollapsed[familyKey];
},
 applyPromptMorphing() {
   if (!this.prompts.morphOn) return;
   const base = (this.prompts.pos || "").trim();
   const parts = base ? [base] : [];
   for (const slot of this.morphSlots) {
     if (!slot.on || !this.morphSlotInRange(slot)) continue;
     const phrase = morphSlotValue(
       { type: "prompt", valueA: slot.a, valueB: slot.b },
       this.morphBlendInSlotRange(slot)
     );
     if (!phrase) continue;
     const w = Math.max(0, Math.min(1, slot.weight != null ? slot.weight : 1));
     if (w >= 0.99) parts.push(phrase);
     else parts.push(`(${phrase}:${w.toFixed(2)})`);
   }
   const morphedPrompt = parts.join(", ").trim();
   if (!morphedPrompt) return;
   this.prompts.pos = morphedPrompt;
   this.sendControl("prompt", {
     positive: morphedPrompt,
     negative: this.prompts.neg,
     morphBlend: this.prompts.morphBlend,
   });
 },
 sendPrompts() {
   this.sendControl("prompt", { positive: this.prompts.pos, negative: this.prompts.neg });
   if (this.prompts.morphOn) {
     this.applyPromptMorphing();
   }
 },
 addMacro() {
   if (this.macrosRack.length >= 6) return;
   const id = `macro-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
   this.macrosRack.push({ id, on: true, target: "cfg", shape: "Sine", bpm: 120, depth: 0.5, offset: 0.0, show: false });
 },
 removeMacro(index) {
   if (this.macrosRack.length <= 1) return;
   this.macrosRack.splice(index, 1);
 },
 addAudioMapping() {
   this.audioMappings.push({ param: "", band: "mid", freq_min: 250, freq_max: 2000, out_min: 0, out_max: 1 });
   this.audioMappingLevels.push(0);
 },
 setAudioActiveBandTab(tabKey) {
   const allowed = this.audioBandTabDefs.map((tab) => tab.key);
   if (!allowed.includes(tabKey)) return;
   this.audioActiveBandTab = tabKey;
 },
 onAudioSpectrumSelectBand(index) {
   const tab = this.audioBandTabDefs[Number(index)];
   if (tab) this.setAudioActiveBandTab(tab.key);
 },
 updateAudioMappingBand({ index, freq_min, freq_max }) {
   const row = this.audioMappings[index];
   if (!row) return;
   row.freq_min = freq_min;
   row.freq_max = freq_max;
 },
 removeAudioMapping(index) {
   this.audioMappings.splice(index, 1);
   this.audioMappingLevels.splice(index, 1);
 },
 applyAudioBandPreset(mapIndex, bandKey) {
   const spec = this.audioBandPresets[bandKey];
   const row = this.audioMappings[mapIndex];
   if (!spec || !row) return;
   row.freq_min = spec.freq_min;
   row.freq_max = spec.freq_max;
 },
readImg2imgAsset(file, { mask = false } = {}) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (mask) {
      this.img2img.maskDataUrl = reader.result;
      this.img2img.status = "Mask loaded (inpaint)";
      return;
    }
    this.img2img.dataUrl = reader.result;
    this.img2img.status = "Input image loaded";
  };
  reader.onerror = () => {
    this.img2img.status = mask ? "Could not read mask file" : "Could not read input image";
  };
  reader.readAsDataURL(file);
},
handleImg2imgFile(evt) {
  const f = evt.target.files && evt.target.files[0];
  this.readImg2imgAsset(f);
},
handleImg2imgMask(evt) {
  const f = evt.target.files && evt.target.files[0];
  this.readImg2imgAsset(f, { mask: true });
},
handleImg2imgDrop(evt, kind = 'input') {
  const files = evt && evt.dataTransfer && evt.dataTransfer.files;
  const file = files && files[0];
  if (!file) return;
  this.readImg2imgAsset(file, { mask: kind === 'mask' });
},
clearImg2imgInput() {
  this.img2img.dataUrl = null;
  this.img2img.status = "Input image cleared";
},
 clearImg2imgMask() {
   this.img2img.maskDataUrl = null;
   this.img2img.status = "Mask cleared";
 },
 async refreshPlugins() {
   if (typeof fetch !== "function") return;
  this.pluginsLoading = true;
   try {
     const res = await fetch("/api/plugins");
     if (!res.ok) return;
     const j = await res.json();
     this.pluginsRegistry = Array.isArray(j.plugins) ? j.plugins : [];
   } catch (_) {
     this.pluginsRegistry = [];
  } finally {
    this.pluginsLoading = false;
   }
 },
 async submitImg2img() {
   if (!this.img2img.dataUrl) {
    this.img2img.status = "Choose an input image first";
     return;
   }
  this.img2img.loading = true;
   this.img2img.status = "Submitting…";
   try {
     const body = {
       init_image: this.img2img.dataUrl,
       prompt: this.prompts.pos,
       negative_prompt: this.prompts.neg,
       denoising_strength: this.img2img.denoisingStrength,
       width: this.img2img.width,
       height: this.img2img.height,
     };
     if (this.img2img.maskDataUrl) {
       body.mask_image = this.img2img.maskDataUrl;
       body.mask_blur = this.img2img.maskBlur;
       body.inpainting_fill = this.img2img.inpaintingFill;
       body.inpaint_full_res = this.img2img.inpaintFullRes;
     }
     const res = await fetch("/api/img2img", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(body),
     });
     const j = await res.json();
     if (!res.ok) throw new Error(j.error || j.detail || res.statusText);
     this.img2img.lastPath = j.path || null;
     this.img2img.status = j.path ? `OK → ${j.path}` : "OK";
   } catch (e) {
     this.img2img.status = String(e.message || e);
  } finally {
    this.img2img.loading = false;
   }
 },
runImg2img() {
  return this.submitImg2img();
},
 addLfo() {
   const nextId = this.lfos.length ? Math.max(...this.lfos.map((l) => l.id)) + 1 : 1;
   this.lfos.push({
     id: nextId,
     on: true,
     targets: [],
     shape: "Sine",
     bpm: this.lfoBpm || 120,
     speed: 1.0,
     depth: 0.2,
     base: null,
     phase: 0,
    renderPhase: 0,
   });
 },
 removeLfo(index) {
   if (this.lfos.length <= 1) return;
   this.lfos.splice(index, 1);
 },
 resetLfo(index) {
   const lfo = this.lfos[index];
   if (!lfo) return;
   lfo.targets = [];
   lfo.shape = "Sine";
   lfo.bpm = this.lfoBpm || 120;
   lfo.speed = 1.0;
   lfo.depth = 0.2;
   lfo.base = null;
   lfo.phase = 0;
  lfo.renderPhase = 0;
   lfo.on = false;
 },
resetLfos() {
  this.lfos.forEach((_, index) => this.resetLfo(index));
},
toggleLfoTarget(lfo, targetKey) {
  if (!lfo || !targetKey) return;
  const idx = lfo.targets.indexOf(targetKey);
  if (idx >= 0) {
    lfo.targets.splice(idx, 1);
  } else {
    lfo.targets.push(targetKey);
    if (lfo.base == null) {
      const target = this.modulationTargetByKey(targetKey);
      if (target) lfo.base = target.default ?? (target.min + target.max) / 2;
    }
  }
  this.modulationSelectedLfoId = lfo.id;
},
 addLfoTarget(lfoIdx) {
   const pick = this.lfoTargetPick[lfoIdx];
   if (!pick) return;
   const lfo = this.lfos[lfoIdx];
   if (!lfo || lfo.targets.includes(pick)) {
     this.$set ? this.$set(this.lfoTargetPick, lfoIdx, "") : (this.lfoTargetPick[lfoIdx] = "");
     return;
   }
   lfo.targets.push(pick);
   if (lfo.base === null) {
     const target = this.modulationTargetByKey(pick);
     if (target) lfo.base = target.default ?? (target.min + target.max) / 2;
   }
   this.lfoTargetPick[lfoIdx] = "";
 },
 removeLfoTarget(lfoIdx, targetIdx) {
   const lfo = this.lfos[lfoIdx];
   if (!lfo) return;
   lfo.targets.splice(targetIdx, 1);
 },
 saveCurrentMotionStyle() {
   const name = prompt("Enter style name:");
   if (!name || !name.trim()) return;
   const style = {
     translation_x: Number(this.motionPadValues.translation_x || 0),
     translation_y: Number(this.motionPadValues.translation_y || 0),
     translation_z: Number(this.motionPadValues.translation_z || 0),
     zoom_2d: Number(this.motionPadValues.zoom ?? 1),
     rotation_z: 0,
     rotation_y: 0,
   };
   const trimmed = name.trim();
   this.motionStylesSaved[trimmed] = style;
   this.motionSelectedPreset = trimmed;
   try {
     if (typeof window !== 'undefined' && window.localStorage) {
       window.localStorage.setItem('defora_motion_styles', JSON.stringify(this.motionStylesSaved));
     }
   } catch(_e) {}
 },
 loadMotionStyles() {
   try {
     if (typeof window !== 'undefined' && window.localStorage) {
       const saved = window.localStorage.getItem('defora_motion_styles');
       if (saved) {
         const parsed = JSON.parse(saved);
         if (parsed && typeof parsed === 'object') {
           this.motionStylesSaved = parsed;
         }
       }
     }
   } catch(_e) {}
 },
 deleteSavedMotionStyle(name) {
   if (!confirm(`Delete saved style "${name}"?`)) return;
   delete this.motionStylesSaved[name];
   try {
     if (typeof window !== 'undefined' && window.localStorage) {
       window.localStorage.setItem('defora_motion_styles', JSON.stringify(this.motionStylesSaved));
     }
   } catch(_e) {}
 },
 applySavedMotionStyle(name) {
   const style = this.motionStylesSaved[name];
   if (!style) return;
   this.motionSelectedPreset = name;
   this.sendControl("liveParam", style);
   this.syncMotionPadFromPayload(style);
 },
 applyMotionPreset(name) {
   const preset = this.motionPresets[name];
   if (!preset) return;
   this.sendControl("liveParam", preset);
  this.syncMotionPadFromPayload(preset);
 },
 queueLiveParam(key, val) {
   const now = this.getNow();
   const last = this.lastParamSent[key] || 0;
   this.liveParamPending[key] = val;
   if (now - last > this.controlDelayMs) {
     this.lastParamSent[key] = now;
     this.sendControl("liveParam", { [key]: val });
     return;
   }
   clearTimeout(this.liveParamTimers[key]);
   this.liveParamTimers[key] = setTimeout(() => {
     const v = this.liveParamPending[key];
     delete this.liveParamPending[key];
     this.lastParamSent[key] = this.getNow();
     this.sendControl("liveParam", { [key]: v });
   }, this.controlDelayMs);
 },
 async refreshFrames() {
   if (typeof fetch !== "function") return;
   try {
   const previousSelectedSrc = this.frameSrcKey(this.selectedFrameThumb ? (this.selectedFrameThumb.src || this.selectedFrameThumb.url || this.selectedFrameThumb.path || '') : '');
    const res = await fetch("/api/frames?limit=48", { cache: "no-store" });
     if (!res.ok) {
      this.framesRefreshBackoffMs = this.nextFramesPollDelay({ failed: true });
       return;
     }
     const json = await res.json();
     if (Array.isArray(json.items)) {
      const merged = this.mergeFrameThumbs(json.items, { keepCachedOnEmpty: true });
      this.thumbs = merged.length ? merged : this.thumbs;
      this.saveCachedFrameThumbs(this.thumbs);
      this.updateFrameSelection(previousSelectedSrc);
     }
    this.framesRefreshBackoffMs = this.nextFramesPollDelay();
   } catch (e) {
     console.warn("frames fetch failed", e);
    this.framesRefreshBackoffMs = this.nextFramesPollDelay({ failed: true });
   }
 },
 parseFrameNumber(name) {
   if (!name) return null;
   const match = String(name).match(/(\d{3,})/);
   return match ? parseInt(match.pop(), 10) : null;
 },
 async runAudioMod() {
   if (!this.audio.track) {
     this.audioStatus = "Set audio file first";
     return;
   }
   const mappings = this.audioMappings
     .filter((m) => m.param && !Number.isNaN(m.freq_min) && !Number.isNaN(m.freq_max))
     .map((m) => ({
       param: m.param,
       freq_min: m.freq_min,
       freq_max: m.freq_max,
       out_min: m.out_min ?? 0,
       out_max: m.out_max ?? 1,
     }));
   if (!mappings.length) {
     this.audioStatus = "Add at least one mapping";
     return;
   }
   try {
     const res = await fetch("/api/audio-map", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         audioPath: this.audio.track,
         fps: this.masterFps,
         mappings,
         live: true,
       }),
     });
     const json = await res.json();
     if (!res.ok || json.error) {
       this.audioStatus = json.error || "Audio processing failed";
     } else {
       this.audioStatus = json.ok ? "Audio sent to mediator" : "Audio processing finished with errors";
     }
   } catch (err) {
     this.audioStatus = String(err);
   }
 },
startAudioStream() {
  return this.runAudioMod();
},
 frameLabel(t) {
   if (!t) return "?";
   if (t.frame != null && !isNaN(t.frame)) return t.frame;
   if (t.name) return t.name.replace(/\.[^.]+$/, "");
   return t.src || "?";
 },
scrollSelectedFrameIntoView(index = this.selectedFrameIndex) {
  if (typeof window === "undefined") return;
  const rail = this.$refs && this.$refs.frameRail;
  if (!rail || typeof rail.querySelector !== "function") return;
  const item = rail.querySelector(`[data-frame-index="${index}"]`);
  if (item && typeof item.scrollIntoView === "function") {
    item.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }
},
selectFrame(index, { scroll = true } = {}) {
  if (!this.frameStripThumbs.length) {
    this.selectedFrameIndex = -1;
    return;
  }
  const clamped = Math.min(this.frameStripThumbs.length - 1, Math.max(0, Number(index) || 0));
  this.selectedFrameIndex = clamped;
  const thumb = this.frameStripThumbs[clamped];
  if (thumb) {
    const fps = Math.max(1, Number(this.deforumSettings.fps || this.sequencer?.fps || 24) || 24);
    const firstFrame = Number(this.frameStripThumbs[0] && this.frameStripThumbs[0].frame);
    const currentFrame = Number(thumb.frame);
    if (Number.isFinite(firstFrame) && Number.isFinite(currentFrame)) {
      this.timecode = this.formatPlaybackTime((currentFrame - firstFrame) / fps);
    }
  }
  if (scroll) this.$nextTick(() => this.scrollSelectedFrameIntoView(clamped));
},
stepFrameSelection(direction) {
  if (!this.frameStripThumbs.length) return;
  const current = Number.isFinite(Number(this.selectedFrameIndex))
    ? Number(this.selectedFrameIndex)
    : this.frameStripThumbs.length - 1;
  this.selectFrame(current + Number(direction || 0));
},
frameIndexForTime(seconds) {
  if (!this.frameStripThumbs.length) return -1;
  const fps = Math.max(1, Number(this.deforumSettings.fps || this.sequencer?.fps || 24) || 24);
  const baseFrame = Number(this.frameStripThumbs[0] && this.frameStripThumbs[0].frame);
  if (!Number.isFinite(baseFrame)) return -1;
  const targetFrame = baseFrame + Math.round(Math.max(0, Number(seconds) || 0) * fps);
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  this.frameStripThumbs.forEach((thumb, idx) => {
    const frame = Number(thumb && thumb.frame);
    if (!Number.isFinite(frame)) return;
    const distance = Math.abs(frame - targetFrame);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = idx;
    }
  });
  return bestIndex;
},
syncFrameSelectionFromPlayback(seconds) {
  const index = this.frameIndexForTime(seconds);
  if (index >= 0) this.selectFrame(index, { scroll: false });
},
updateFrameSelection(preferredSrc = '') {
  if (!this.frameStripThumbs.length) {
    this.selectedFrameIndex = -1;
    return;
  }
  if (preferredSrc) {
    const existingIndex = this.frameStripThumbs.findIndex((thumb) => this.frameSrcKey(thumb.src || thumb.url || thumb.path || '') === this.frameSrcKey(preferredSrc));
    if (existingIndex >= 0) {
      this.selectFrame(existingIndex, { scroll: false });
      return;
    }
  }
  if (this.deforumPlaying && this.playerEl && Number.isFinite(Number(this.playerEl.currentTime))) {
    const playbackIndex = this.frameIndexForTime(this.playerEl.currentTime);
    if (playbackIndex >= 0) {
      this.selectFrame(playbackIndex, { scroll: false });
      return;
    }
  }
  if (this.selectedFrameIndex >= 0 && this.selectedFrameIndex < this.frameStripThumbs.length) return;
  this.selectFrame(this.frameStripThumbs.length - 1, { scroll: false });
},
audioBandWindowStyle(mapping) {
  const minHz = 20;
  const maxHz = 16000;
  const toPct = (value) => {
    const clamped = Math.min(maxHz, Math.max(minHz, Number(value) || minHz));
    const ratio = (Math.log(clamped) - Math.log(minHz)) / (Math.log(maxHz) - Math.log(minHz));
    return Math.min(100, Math.max(0, ratio * 100));
  };
  const left = toPct(mapping && mapping.freq_min);
  const right = toPct(mapping && mapping.freq_max);
  return {
    left: `${Math.min(left, right)}%`,
    width: `${Math.max(1.5, Math.abs(right - left))}%`,
  };
},
 async scanMidi() {
   if (!navigator.requestMIDIAccess) {
     this.midi.supported = false;
     return;
   }
   try {
     const access = await navigator.requestMIDIAccess({ sysex: false });
     const devices = [];
     access.inputs.forEach((input) => {
       devices.push({ id: input.id, name: input.name });
       input.onmidimessage = (msg) => this.handleMidi(input, msg);
     });
     this.midi.devices = devices;
     if (!this.midi.selected && devices.length) this.midi.selected = devices[0].id;
     this.loadMidiMappings();
   } catch (e) {
     this.midiStatus = "MIDI not available";
   }
 },
 loadMidiMappings() {
   const storage = (typeof window !== 'undefined' && window.localStorage) || 
                  (typeof global !== 'undefined' && global.window && global.window.localStorage);
   if (!storage) return;
   try {
     const stored = storage.getItem("defora_midi_mappings");
     if (stored) {
       const mappings = JSON.parse(stored);
       if (Array.isArray(mappings) && mappings.length > 0) {
         this.midi.mappings = mappings;
         console.log("Loaded MIDI mappings from localStorage", mappings);
       }
     }
   } catch (e) {
     console.error("Failed to load MIDI mappings", e);
   }
 },
 saveMidiMappings() {
   const storage = (typeof window !== 'undefined' && window.localStorage) || 
                  (typeof global !== 'undefined' && global.window && global.window.localStorage);
   if (!storage) return false;
   try {
     storage.setItem("defora_midi_mappings", JSON.stringify(this.midi.mappings));
     console.log("Saved MIDI mappings to localStorage", this.midi.mappings);
     return true;
   } catch (e) {
     console.error("Failed to save MIDI mappings", e);
     return false;
   }
 },
 addMidiMapping() {
   this.midi.mappings.push({ control: "New Mapping", cc: 0, key: "" });
   this.saveMidiMappings();
 },
 deleteMidiMapping(index) {
   this.midi.mappings.splice(index, 1);
   this.saveMidiMappings();
 },
 updateMidiMapping(map) {
   this.saveMidiMappings();
   return map;
 },
 loadBindings() {
   try {
     const storage = (typeof window !== 'undefined' && window.localStorage) || null;
     if (!storage) return;
     const saved = storage.getItem("defora_key_bindings");
     if (saved) {
       const parsed = JSON.parse(saved);
       if (parsed && typeof parsed === "object") {
         this.keyBindings = { ...this.keyBindings, ...parsed };
       }
     }
   } catch(_e) {}
 },
 saveBindings() {
   try {
     const storage = (typeof window !== 'undefined' && window.localStorage) || null;
     if (!storage) return;
     storage.setItem("defora_key_bindings", JSON.stringify(this.keyBindings));
   } catch(_e) {}
 },
 toggleBindingLearn() {
   this.bindingLearnMode = !this.bindingLearnMode;
   this.bindingTargetKey = null;
   if (!this.bindingLearnMode) {
     this.status = "Learn mode disabled";
   } else {
     this.status = "Learn mode: press key or move MIDI CC, then click a parameter";
   }
 },
 resetBindings() {
   if (!confirm("Reset all bindings to defaults?")) return;
   this.keyBindings = {
     "translation_z": "w",
     "translation_x": "a",
     "translation_y": "s",
     "rotation_y": "d",
     "rotation_z": "q",
     "fov": "e",
     "cfg": "z",
     "strength": "x",
     "noise_multiplier": "c",
   };
   this.saveBindings();
   this.status = "Bindings reset to defaults";
 },
 getKeyBinding(key) {
   return this.keyBindings[key] || null;
 },
 clearKeyBinding(key) {
   delete this.keyBindings[key];
   this.saveBindings();
 },
 getMidiBinding(key) {
   const m = this.midi.mappings.find(m => m.key === key);
   return m ? m.cc : null;
 },
 clearMidiBinding(key) {
   const idx = this.midi.mappings.findIndex(m => m.key === key);
   if (idx >= 0) {
     this.midi.mappings.splice(idx, 1);
     this.saveMidiMappings();
   }
 },
 getParamValue(key) {
   const anim = this.animationTargets.find((t) => t.key === key);
   if (anim && anim.field && this.defaultAnimation) {
     const val = Number(this.defaultAnimation[anim.field]);
     return Number.isFinite(val) ? val : (anim.default ?? 0);
   }
   const all = [...this.liveVibe, ...this.liveCam];
   const p = all.find(p => p.key === key);
   return p ? p.val : 0;
 },
 queueLiveParam(key, val) {
   const anim = this.animationTargets.find((t) => t.key === key);
   if (anim) {
     this.applyAnimationModulation(anim.field, val);
     return;
   }
   const all = [...this.liveVibe, ...this.liveCam];
   const p = all.find(p => p.key === key);
   if (p) {
     p.val = val;
     this.sendControl("liveParam", { [key]: val });
   }
 },
 // Preset management methods
 async refreshPresets() {
  this.presetsLoading = true;
   try {
     const { data } = await apiFetch("/api/presets", {}, "presets list");
     this.availablePresets = data.presets || [];
  } catch (_) {
  } finally {
    this.presetsLoading = false;
  }
 },
 async loadPreset(name) {
   try {
     const res = await fetch(`/api/presets/${name}`);
     const data = await res.json();
     if (data.preset) {
       // Apply preset to current state
       if (data.preset.liveVibe) this.liveVibe = data.preset.liveVibe;
       if (data.preset.liveCam) this.liveCam = data.preset.liveCam;
       if (data.preset.audio) Object.assign(this.audio, data.preset.audio);
       if (data.preset.cn) Object.assign(this.cn, data.preset.cn);
       if (data.preset.lfos) this.lfos = data.preset.lfos;
       if (data.preset.macrosRack) this.macrosRack = data.preset.macrosRack;
       if (data.preset.loras) {
        this.loras.common = data.preset.loras.common || [];
         this.loras.groupA = data.preset.loras.groupA || [];
         this.loras.groupB = data.preset.loras.groupB || [];
         // Sync selection state without fetching (data already restored)
         await this.refreshLoras();
       }
       if (data.preset.prompts) {
         Object.assign(this.prompts, data.preset.prompts);
       }
       this.currentPreset = name;
       this.presetStatus = `Loaded preset: ${name}`;
       setTimeout(() => { this.presetStatus = ""; }, 3000);
     }
   } catch (err) {
     console.error("Failed to load preset", err);
     this.presetStatus = `Error loading preset: ${err.message}`;
   }
 },
 async saveCurrentPreset() {
   const name = this.newPresetName || "untitled";
   const preset = {
     liveVibe: this.liveVibe,
     liveCam: this.liveCam,
     audio: { bpm: this.audio.bpm, track: this.audio.track },
     cn: { slots: this.cn.slots, active: this.cn.active },
     loras: {
      common: this.loras.common,
       groupA: this.loras.groupA,
       groupB: this.loras.groupB,
     },
     prompts: {
       pos: this.prompts.pos,
       neg: this.prompts.neg,
       morphOn: this.prompts.morphOn,
       loraCrossfaderOn: this.prompts.loraCrossfaderOn,
       crossfaderValue: this.prompts.crossfaderValue,
       loraCrossfaderLfoLink: this.prompts.loraCrossfaderLfoLink,
       loraCrossfaderLfoBase: this.prompts.loraCrossfaderLfoBase,
       morphBlend: this.prompts.morphBlend,
       morphBlendLfoLink: this.prompts.morphBlendLfoLink,
       morphBlendLfoBase: this.prompts.morphBlendLfoBase,
     },
     lfos: this.lfos,
     macrosRack: this.macrosRack,
     paramSources: this.paramSources,
   };
   try {
     const res = await fetch(`/api/presets/${name}`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(preset),
     });
     const data = await res.json();
     if (data.ok) {
       this.currentPreset = name;
       this.presetStatus = `Saved preset: ${name}`;
       this.newPresetName = "";
       await this.refreshPresets();
       setTimeout(() => { this.presetStatus = ""; }, 3000);
     }
   } catch (err) {
     console.error("Failed to save preset", err);
     this.presetStatus = `Error saving preset: ${err.message}`;
   }
 },
 async deletePreset(name) {
   if (!confirm(`Delete preset "${name}"?`)) return;
   try {
     await fetch(`/api/presets/${name}`, { method: "DELETE" });
     this.currentPreset = null;
     this.presetStatus = `Deleted preset: ${name}`;
     await this.refreshPresets();
     setTimeout(() => { this.presetStatus = ""; }, 3000);
   } catch (err) {
     console.error("Failed to delete preset", err);
     this.presetStatus = `Error deleting preset: ${err.message}`;
   }
 },
 invalidateAudioSpectrogram() {
   this._spectrogramGen = (this._spectrogramGen || 0) + 1;
   this.audioSpectrogramDataUrl = null;
    this.audioSpectrogramStatus = "";
  },
  buildSpectrogramRgba(audioBuffer, opts) {
    const sampleRate = audioBuffer.sampleRate;
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const channelData = audioBuffer.getChannelData(0);
    
    // Adaptive FFT size based on audio length
    const fftSize = length >= 8192 ? 1024 : Math.max(256, Math.pow(2, Math.floor(Math.log2(length / 4))));
    const hopSize = fftSize / 2;
    const numFrames = Math.max(1, Math.floor((length - fftSize) / hopSize) + 1);
    const numBins = fftSize / 2;
    
    const width = Math.max(64, numFrames);
    const height = Math.max(32, Math.min(numBins, 128));
    const data = new Uint8ClampedArray(width * height * 4);
    
    // Step frame positions evenly across the audio
    const step = Math.max(1, numFrames / width);
    
    for (let x = 0; x < width; x++) {
      const frameStart = Math.floor(x * step);
      const offset = frameStart * hopSize;
      
      // Apply Hann window and compute DFT for each frequency bin
      for (let y = 0; y < height; y++) {
        let real = 0;
        let imag = 0;
        
        for (let n = 0; n < fftSize; n++) {
          const idx = offset + n;
          if (idx >= length) break;
          
          const window = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (fftSize - 1)));
          const sample = channelData[idx] * window;
          
          const angle = (2 * Math.PI * y * n) / fftSize;
          real += sample * Math.cos(angle);
          imag -= sample * Math.sin(angle);
        }
        
        const magnitude = Math.sqrt(real * real + imag * imag) / fftSize;
        const intensity = Math.min(1, magnitude * 10); // Scale up for visibility
        
        // Convert to color (blue -> cyan -> green -> yellow -> red)
        const idx4 = (y * width + x) * 4;
        if (intensity < 0.25) {
          data[idx4] = 0;
          data[idx4 + 1] = Math.floor(intensity * 4 * 255);
          data[idx4 + 2] = 255;
        } else if (intensity < 0.5) {
          data[idx4] = 0;
          data[idx4 + 1] = 255;
          data[idx4 + 2] = Math.floor((1 - (intensity - 0.25) * 4) * 255);
        } else if (intensity < 0.75) {
          data[idx4] = Math.floor((intensity - 0.5) * 4 * 255);
          data[idx4 + 1] = 255;
          data[idx4 + 2] = 0;
        } else {
          data[idx4] = 255;
          data[idx4 + 1] = Math.floor((1 - (intensity - 0.75) * 4) * 255);
          data[idx4 + 2] = 0;
        }
        data[idx4 + 3] = 255; // Alpha
      }
    }
    
    return { width, height, data };
  },
  spectrogramRgbaToDataUrl(rgba) {
    if (typeof OffscreenCanvas !== "undefined") {
      const canvas = new OffscreenCanvas(rgba.width, rgba.height);
      const ctx = canvas.getContext("2d");
      const imageData = ctx.createImageData(rgba.width, rgba.height);
      imageData.data.set(rgba.data);
      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL("image/png");
    }
    
    // Fallback for environments without OffscreenCanvas
    if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      canvas.width = rgba.width;
      canvas.height = rgba.height;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.createImageData(rgba.width, rgba.height);
      imageData.data.set(rgba.data);
      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL("image/png");
    }
    
    return null;
  },
  scheduleAudioSpectrogramDecode(expectedGen) {
   if (typeof setTimeout !== "function") return;
   setTimeout(() => {
     this.runAudioSpectrogramFromObjectUrl(expectedGen).catch(() => {});
   }, 0);
 },
 async runAudioSpectrogramFromObjectUrl(expectedGen) {
   const AC = typeof AudioContext !== "undefined" ? AudioContext : typeof webkitAudioContext !== "undefined" ? webkitAudioContext : null;
   if (!AC || !this.audio.objectUrl || typeof fetch !== "function") {
     if (expectedGen === this._spectrogramGen) this.audioSpectrogramStatus = "";
     return;
   }
   if (expectedGen !== this._spectrogramGen) return;
   let ctx = null;
   try {
     const res = await fetch(this.audio.objectUrl);
     const ab = await res.arrayBuffer();
     if (expectedGen !== this._spectrogramGen) return;
     ctx = new AC();
     const audioBuf = await ctx.decodeAudioData(ab.slice(0));
     if (expectedGen !== this._spectrogramGen) return;
      const rgba = this.buildSpectrogramRgba(audioBuf, {});
     if (!rgba) {
       this.audioSpectrogramStatus = "";
       return;
     }
      const dataUrl = this.spectrogramRgbaToDataUrl(rgba);
     if (expectedGen !== this._spectrogramGen) return;
     this.audioSpectrogramDataUrl = dataUrl;
     this.audioSpectrogramStatus = dataUrl ? "" : "";
   } catch (_e) {
     if (expectedGen === this._spectrogramGen) this.audioSpectrogramStatus = "";
   } finally {
     try {
       if (ctx && typeof ctx.close === "function") await ctx.close();
     } catch (_e2) {
       /* ignore */
     }
   }
 },
  spectrogramFromAudioBuffer(audioBuffer, opts) {
    return this.buildSpectrogramRgba(audioBuffer, opts || {});
  },
 disposeLiveAudioAnalyser() {
   if (this._liveSpecRaf != null && typeof cancelAnimationFrame === "function") {
     cancelAnimationFrame(this._liveSpecRaf);
   }
   this._liveSpecRaf = null;
   const el = this.$refs && this.$refs.avSyncAudio;
   if (el && this._liveSpecMediaHandlers) {
     const h = this._liveSpecMediaHandlers;
     if (h.play) el.removeEventListener("play", h.play);
     if (h.pause) el.removeEventListener("pause", h.pause);
     this._liveSpecMediaHandlers = null;
   }
   try {
     if (this._liveSpecSource && typeof this._liveSpecSource.disconnect === "function") this._liveSpecSource.disconnect();
   } catch (_e) {
     /* ignore */
   }
   try {
     if (this._liveSpecAnalyser && typeof this._liveSpecAnalyser.disconnect === "function") this._liveSpecAnalyser.disconnect();
   } catch (_e2) {
     /* ignore */
   }
   try {
     if (this._liveSpecGain && typeof this._liveSpecGain.disconnect === "function") this._liveSpecGain.disconnect();
   } catch (_e3) {
     /* ignore */
   }
   const ctx = this._liveSpecCtx;
   this._liveSpecCtx = null;
   this._liveSpecSource = null;
   this._liveSpecAnalyser = null;
   this._liveSpecGain = null;
   this._liveSpecFreqBuf = null;
   if (ctx && typeof ctx.close === "function") {
     try {
       void ctx.close();
     } catch (_e4) {
       /* ignore */
     }
   }
 },
 setupLiveAudioAnalyser() {
   const AC = typeof AudioContext !== "undefined" ? AudioContext : typeof webkitAudioContext !== "undefined" ? webkitAudioContext : null;
   if (!AC) return;
   this.disposeLiveAudioAnalyser();
   const el = this.$refs && this.$refs.avSyncAudio;
   if (!el || !this.audio.objectUrl) return;
   try {
     const ctx = new AC();
     const source = ctx.createMediaElementSource(el);
     const analyser = ctx.createAnalyser();
     analyser.fftSize = 1024;
     analyser.smoothingTimeConstant = 0.78;
     const gain = ctx.createGain();
     gain.gain.value = 1;
     source.connect(analyser);
     analyser.connect(gain);
     gain.connect(ctx.destination);
     this._liveSpecCtx = ctx;
     this._liveSpecSource = source;
     this._liveSpecAnalyser = analyser;
     this._liveSpecGain = gain;
     this._liveSpecFreqBuf = new Uint8Array(analyser.frequencyBinCount);
     const onPlay = () => this.onLiveAudioPlay();
     const onPause = () => this.onLiveAudioPause();
     el.addEventListener("play", onPlay);
     el.addEventListener("pause", onPause);
     this._liveSpecMediaHandlers = { play: onPlay, pause: onPause };
     if (!el.paused) this.onLiveAudioPlay();
   } catch (_e) {
     this.disposeLiveAudioAnalyser();
   }
 },
 onLiveAudioPlay() {
   try {
     if (this._liveSpecCtx && this._liveSpecCtx.state === "suspended" && typeof this._liveSpecCtx.resume === "function") {
       void this._liveSpecCtx.resume();
     }
   } catch (_e) {
     /* ignore */
   }
   this.scheduleLiveSpectrumFrame();
 },
 onLiveAudioPause() {
   if (this._liveSpecRaf != null && typeof cancelAnimationFrame === "function") {
     cancelAnimationFrame(this._liveSpecRaf);
   }
   this._liveSpecRaf = null;
   this.paintLiveSpectrumCanvases(null);
 },
 scheduleLiveSpectrumFrame() {
   if (this._liveSpecRaf != null) return;
   if (typeof requestAnimationFrame !== "function") return;
   this._liveSpecRaf = requestAnimationFrame(() => {
     this._liveSpecRaf = null;
     const el = this.$refs && this.$refs.avSyncAudio;
     const analyser = this._liveSpecAnalyser;
     const buf = this._liveSpecFreqBuf;
     if (!analyser || !buf) return;
     if (el && !el.paused && !el.ended) {
       analyser.getByteFrequencyData(buf);
       this.paintLiveSpectrumCanvases(buf);
       this.scheduleLiveSpectrumFrame();
     } else {
       this.paintLiveSpectrumCanvases(null);
     }
   });
 },
 paintLiveSpectrumCanvases(freqBytes) {
   const canvases = [this.$refs.liveSpectrumCanvas, this.$refs.liveSpectrumCanvasStrip].filter(Boolean);
   for (const c of canvases) {
     if (!c || !c.getContext) continue;
     const ctx2 = c.getContext("2d");
     if (!ctx2) continue;
     const w = c.width || 280;
     const h = c.height || 56;
     if (!freqBytes || !freqBytes.length) {
      ctx2.fillStyle = this.themeColor('--bg-0', 'rgb(8, 9, 13)');
       ctx2.fillRect(0, 0, w, h);
       continue;
     }
     paintSpectrumBars(ctx2, freqBytes, w, h, {
       bgColor: this.themeColor('--bg-0', 'rgb(8, 9, 13)'),
       barColor: 'rgba(80, 250, 123, 0.9)',
     });
   }
 },
 // Audio file upload methods
 async handleAudioUpload(evt) {
   const file = evt.target.files[0];
   if (!file) return;
   this.disposeLiveAudioAnalyser();
   this.invalidateAudioSpectrogram();
   const maxSizeBytes = 50 * 1024 * 1024; // 50MB
   if (file.size != null && file.size > maxSizeBytes) {
     this.audioStatus = "Audio file is too large. Maximum supported size is 50MB.";
     if (evt && evt.target) {
       evt.target.value = "";
     }
     return;
   }
   if (this.audio.objectUrl) {
     try {
       URL.revokeObjectURL(this.audio.objectUrl);
     } catch (_e) {}
     this.audio.objectUrl = null;
   }
   if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function" && typeof Blob !== "undefined" && file instanceof Blob) {
     try {
       this.audio.objectUrl = URL.createObjectURL(file);
      this.audioBeatMacrosCollapsed = true;
     } catch (_e) {
       this.audio.objectUrl = null;
     }
   }
   this.audioStatus = "Uploading audio…";
   try {
     const data = await new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.onload = () => resolve(reader.result);
       reader.onerror = () => reject(reader.error || new Error("Failed to read audio file. Ensure the file is under 50MB and try again."));
       reader.readAsDataURL(file);
     });
     const res = await fetch("/api/audio-upload", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ name: file.name, data }),
     });
     const json = await res.json();
     if (!res.ok || json.error) {
       throw new Error(json.error || "Upload failed");
     }
     this.audio.uploadedFile = file.name;
     this.audio.track = json.path || file.name;
     this.audioStatus = "Audio uploaded";
     const gen = this._spectrogramGen;
     if (this.audio.objectUrl) {
       this.audioSpectrogramStatus = "Analyzing…";
       this.scheduleAudioSpectrogramDecode(gen);
     }
     const scheduleSetup = () => {
       try {
         this.setupLiveAudioAnalyser();
       } catch (_e) {
         /* ignore */
       }
     };
     if (typeof this.$nextTick === "function") this.$nextTick(scheduleSetup);
     else setTimeout(scheduleSetup, 0);
   } catch (err) {
     if (this.audio.objectUrl) {
       try {
         URL.revokeObjectURL(this.audio.objectUrl);
       } catch (_e2) {}
       this.audio.objectUrl = null;
     }
     this.audioStatus = String(err && err.message ? err.message : err);
     console.error("Audio upload failed:", err);
     this.invalidateAudioSpectrogram();
     this.disposeLiveAudioAnalyser();
   }
 },
onAudioUpload(evt) {
  return this.handleAudioUpload(evt);
},
 clearAudioFile() {
   this.disposeLiveAudioAnalyser();
   this.invalidateAudioSpectrogram();
   this.audio.uploadedFile = null;
   this.audio.track = "";
   if (this.audio.objectUrl) {
     try {
       URL.revokeObjectURL(this.audio.objectUrl);
     } catch (_e) {}
     this.audio.objectUrl = null;
   }
  this.audioBeatMacrosCollapsed = true;
   this.avSyncEnabled = false;
   const a = this.$refs.avSyncAudio;
   if (a) {
     try {
       if (typeof a.pause === "function") a.pause();
     } catch (_e) {
       /* jsdom / headless may not implement media pause */
     }
   }
   this.audioStatus = "Idle";
   if (this.$refs.audioFileInput) {
     this.$refs.audioFileInput.value = "";
   }
 },
 // ControlNet methods
 async loadControlNetModels() {
   try {
     const { data } = await apiFetch("/api/controlnet/models", {}, "controlnet models");
     this.cn.availableModels = data.models || [];
     this.cn.source = data.source || "unknown";
   } catch (_) {}
 },
 updateControlNet(slot) {
   // Send ControlNet parameters to mediator
   const payload = {
     controlnet_slot: slot.id,
     controlnet_model: slot.model,
     controlnet_weight: slot.weight,
     controlnet_start: slot.start,
     controlnet_end: slot.end,
     controlnet_enabled: slot.enabled,
   };
   this.sendControl("controlNet", payload);
   console.log("Updated ControlNet slot:", slot.id, payload);
 },
 uploadControlNetImage(slot) {
   this.cn.active = slot.id;
   const input = this.$refs.cnImageInput;
   if (input) input.click();
 },
 onControlNetFileSelected(evt) {
   const file = evt.target.files && evt.target.files[0];
   if (!file) return;
   const formData = new FormData();
   formData.append("image", file);
   formData.append("slot", this.cn.active);
   fetch("/api/controlnet/upload-image", { method: "POST", body: formData })
     .then((r) => r.json())
     .then((data) => {
       if (data.error) console.error("ControlNet upload:", data.error);
     })
     .catch((err) => console.error("ControlNet upload failed", err));
   evt.target.value = "";
 },
 async toggleWebcam() {
   if (this.cn.webcamActive) this.stopWebcam();
   else await this.startWebcam();
 },
 async startWebcam() {
   try {
     const stream = await navigator.mediaDevices.getUserMedia({
       video: { width: 512, height: 512, facingMode: "user" },
     });
     this.cn.webcamStream = stream;
     this.cn.webcamActive = true;
     const videoEl = this.$refs.webcamVideo;
     if (videoEl) {
       videoEl.srcObject = stream;
       videoEl.style.display = "block";
       this.cn.webcamVideo = videoEl;
     }
     const canvasEl = this.$refs.webcamCanvas;
     if (canvasEl) {
       this.cn.webcamCanvas = canvasEl;
       canvasEl.width = 512;
       canvasEl.height = 512;
     }
     this.cn.webcamCaptureInterval = setInterval(() => this.captureWebcamFrame(), this.webcamCaptureRate);
   } catch (err) {
     console.error("Failed to start webcam:", err);
     alert("Could not access webcam. Check browser permissions.");
   }
 },
 stopWebcam() {
   if (this.cn.webcamCaptureInterval) {
     clearInterval(this.cn.webcamCaptureInterval);
     this.cn.webcamCaptureInterval = null;
   }
   if (this.cn.webcamStream) {
     this.cn.webcamStream.getTracks().forEach((t) => t.stop());
     this.cn.webcamStream = null;
   }
   const videoEl = this.$refs.webcamVideo;
   if (videoEl) {
     videoEl.style.display = "none";
     videoEl.srcObject = null;
   }
   this.cn.webcamActive = false;
 },
 captureWebcamFrame() {
   const video = this.cn.webcamVideo;
   const canvas = this.cn.webcamCanvas;
   if (!video || !canvas || video.readyState < 2) return;
   const ctx = canvas.getContext("2d");
   ctx.drawImage(video, 0, 0, 512, 512);
   canvas.toBlob(async (blob) => {
     if (!blob) return;
     const activeSlot = this.cn.slots.find((s) => s.id === this.cn.active);
     if (!activeSlot || activeSlot.imageSource !== "webcam") return;
     const formData = new FormData();
     formData.append("image", blob, "webcam_frame.png");
     formData.append("slot", this.cn.active);
     try {
       await fetch("/api/controlnet/upload-image", { method: "POST", body: formData });
     } catch (err) {
       console.error("Webcam frame upload failed:", err);
     }
   }, "image/png");
 },
 async startScreenCapture() {
   try {
     const stream = await navigator.mediaDevices.getDisplayMedia({ video: { width: 512, height: 512 } });
     const video = document.createElement("video");
     video.srcObject = stream;
     video.autoplay = true;
     video.playsInline = true;
     const canvas = document.createElement("canvas");
     canvas.width = 512;
     canvas.height = 512;
     const captureInterval = setInterval(() => {
       if (video.readyState < 2) return;
       canvas.getContext("2d").drawImage(video, 0, 0, 512, 512);
       canvas.toBlob(async (blob) => {
         if (!blob) return;
         const activeSlot = this.cn.slots.find((s) => s.id === this.cn.active);
         if (!activeSlot || activeSlot.imageSource !== "screen") return;
         const formData = new FormData();
         formData.append("image", blob, "screen_capture.png");
         formData.append("slot", this.cn.active);
         try {
           await fetch("/api/controlnet/upload-image", { method: "POST", body: formData });
         } catch (err) {
           console.error("Screen capture upload failed:", err);
         }
       }, "image/png");
     }, this.webcamCaptureRate);
     stream.getVideoTracks()[0].onended = () => clearInterval(captureInterval);
   } catch (err) {
     console.error("Failed to start screen capture:", err);
     alert("Could not start screen capture. Check browser permissions.");
   }
 },
 handleMidi(input, msg) {
   const [status, cc, value] = msg.data;
   const isCC = (status & 0xf0) === 0xb0;
   if (!isCC) return;
   const mapping = this.midi.mappings.find((m) => m.cc === cc);
   const norm = value / 127;
   if (mapping && mapping.key) {
     const k = String(mapping.key || "");
     const modSlot = k.match(/^mod_slot_(\d)$/);
     if (modSlot) {
       const idx = Math.max(1, Math.min(6, Number(modSlot[1]) || 1));
       const slots = Array.isArray(this.liveModulationSlots) ? this.liveModulationSlots : [];
       const slot = slots[idx - 1];
       if (slot) {
         if (slot.kind === 'xypad') {
           // For XY slots we drive X only (Y is mod_slot_(idx+1) or map separately)
           const px = this.modulationTargetByKey(slot.paramKeyX);
           if (px) {
             const scaled = px.min + norm * (px.max - px.min);
             const payload = {};
             const cnUpdates = {};
             this.routeModulationValue(px.key, scaled, payload, cnUpdates);
             if (Object.keys(payload).length) this.sendControl('liveParam', payload);
             Object.values(cnUpdates).forEach((slot) => this.updateControlNet(slot));
           }
         } else if (slot.paramKey) {
           const target = this.modulationTargetByKey(slot.paramKey);
           if (target) {
             const scaled = target.min + norm * (target.max - target.min);
             const payload = {};
             const cnUpdates = {};
             this.routeModulationValue(target.key, scaled, payload, cnUpdates);
             if (Object.keys(payload).length) this.sendControl('liveParam', payload);
             Object.values(cnUpdates).forEach((slot) => this.updateControlNet(slot));
           } else {
             this.sendControl("liveParam", { [slot.paramKey]: norm });
           }
         }
       }
       return;
     }

     const target = this.midiTarget(k);
     if (target) {
       const scaled = target.min + norm * (target.max - target.min);
       const payload = {};
       const cnUpdates = {};
       this.routeModulationValue(target.key, scaled, payload, cnUpdates);
       if (Object.keys(payload).length) this.sendControl('liveParam', payload);
       Object.values(cnUpdates).forEach((slot) => this.updateControlNet(slot));
     } else {
       this.sendControl("liveParam", { [k]: norm });
     }
   }
 },
 sortedKeyframes(tr) {
   return [...(tr.keyframes || [])].sort((a, b) => a.t - b.t);
 },
 setKeyframeEasing(kf, mode) {
   if (!kf) return;
   kf.easing = mode === "linear" ? undefined : mode;
 },
 sequencerEaseT(u, mode) {
   const uu = Math.min(1, Math.max(0, u));
   const m = mode || "linear";
   if (m === "easeIn") return uu * uu * uu;
   if (m === "easeOut") return 1 - (1 - uu) ** 3;
   if (m === "easeInOut") {
     if (uu < 0.5) return 4 * uu * uu * uu;
     return 1 - (-2 * uu + 2) ** 3 / 2;
   }
   return uu;
 },
 sequencerPayload() {
   const markers = Array.isArray(this.sequencer.markers)
     ? [...this.sequencer.markers]
         .map((m) => ({ t: Number(m.t), name: String(m.name || "").trim(), action: m.action || "jump", target: m.target || "" }))
         .filter((m) => m.name && Number.isFinite(m.t))
         .sort((a, b) => a.t - b.t)
     : [];
   return {
     version: 1,
     durationSec: Number(this.sequencer.durationSec),
     fps: Number(this.sequencer.fps),
     loop: !!this.sequencer.loop,
     markers,
     clips: this.normalizeSequencerClipsForSave(this.sequencer.clips),
     tracks: this.sequencer.tracks.map((tr) => ({
       id: tr.id,
       param: tr.param,
       keyframes: [...tr.keyframes].sort((a, b) => a.t - b.t),
     })),
   };
 },
 normalizeSequencerClipsForSave(clips) {
   const allowed = new Set(['prompt', 'lora', 'controlnet']);
   const d = Number(this.sequencer.durationSec) || 0;
   if (!Array.isArray(clips)) return [];
   return clips
     .filter((c) => c && allowed.has(c.type) && Number.isFinite(Number(c.t)))
     .map((c) => {
       const t = Math.min(Math.max(0, Number(c.t)), d);
       let endT = c.endT == null || c.endT === '' ? null : Number(c.endT);
       if (endT != null && Number.isFinite(endT)) {
         endT = Math.min(Math.max(t, endT), d);
       } else {
         endT = null;
       }
       return {
         id: String(c.id || `clip-${Date.now()}`),
         type: c.type,
         t,
         endT,
         label: String(c.label || c.type).slice(0, 48),
         payload: c.payload && typeof c.payload === 'object' ? c.payload : {},
       };
     })
     .sort((a, b) => a.t - b.t);
 },
 clampSequencerClips() {
   const d = Number(this.sequencer.durationSec) || 0;
   const arr = this.sequencer.clips;
   if (!Array.isArray(arr)) return;
   for (const c of arr) {
     if (!c || typeof c.t !== 'number') continue;
     if (c.t < 0) c.t = 0;
     if (c.t > d) c.t = d;
     if (c.endT != null && typeof c.endT === 'number') {
       if (c.endT < c.t) c.endT = c.t;
       if (c.endT > d) c.endT = d;
     }
   }
 },
 snapshotSequencerPromptPayload() {
   return {
     pos: String(this.prompts.pos || ''),
     neg: String(this.prompts.neg || ''),
   };
 },
 snapshotSequencerLoraPayload() {
   const pick = (list) => (list || []).map((l) => ({
     id: l.id,
     name: l.name,
     path: l.path,
     strength: Number(l.strength) || 0,
   }));
   return {
     common: pick(this.loras.common),
     groupA: pick(this.loras.groupA),
     groupB: pick(this.loras.groupB),
     crossfaderValue: Number(this.prompts.crossfaderValue) || 0,
     loraCrossfaderOn: !!this.prompts.loraCrossfaderOn,
   };
 },
 snapshotSequencerControlNetPayload() {
   return {
     slots: (this.cn.slots || []).map((s) => ({
       id: s.id,
       model: s.model,
       weight: Number(s.weight) || 0,
       start: Number(s.start) || 0,
       end: Number(s.end) ?? 1,
       enabled: !!s.enabled,
     })),
   };
 },
 addSequencerClip(type) {
   const allowed = new Set(['prompt', 'lora', 'controlnet']);
   if (!allowed.has(type)) return;
   this.clampSequencerPlayhead();
   const d = Math.max(0, Number(this.sequencer.durationSec) || 0);
   if (d < 0.1) {
     this.sequencerStatus = 'Set timeline duration above 0s first';
     return;
   }
   const existing = Array.isArray(this.sequencer.clips) ? this.sequencer.clips : [];
   if (existing.length >= 96) {
     this.sequencerStatus = 'Maximum 96 timeline clips';
     return;
   }
   const t = Math.min(Math.max(0, this.sequencerPlayhead), d);
   const span = Math.max(0.1, Number(this.sequencerClipDurationSec) || 2);
   const endT = Math.min(d, t + span);
   const count = existing.filter((c) => c.type === type).length + 1;
   const labels = { prompt: 'Prompt', lora: 'LoRA', controlnet: 'ControlNet' };
   let payload = {};
   if (type === 'prompt') payload = this.snapshotSequencerPromptPayload();
   else if (type === 'lora') payload = this.snapshotSequencerLoraPayload();
   else payload = this.snapshotSequencerControlNetPayload();
   const id = `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
   const clip = {
     id,
     type,
     t,
     endT: endT > t ? endT : null,
     label: `${labels[type]} ${count}`,
     payload,
   };
   this.sequencer.clips = [...existing, clip];
   this.sequencerSelectedClipId = id;
   this.sequencerStatus = `Added ${clip.label} at ${t.toFixed(2)}s`;
   this.saveSessionState();
   this.$nextTick(() => this.drawTimeline());
   try {
     this.applySequencerClip(clip);
   } catch (err) {
     console.warn('[sequencer] apply clip failed', err);
   }
 },
 removeSequencerClip(clipId) {
   if (!Array.isArray(this.sequencer.clips)) return;
   const ix = this.sequencer.clips.findIndex((c) => c.id === clipId);
   if (ix < 0) return;
   this.sequencer.clips.splice(ix, 1);
   if (this.sequencerSelectedClipId === clipId) this.sequencerSelectedClipId = null;
 },
 jumpToSequencerClip(clip) {
   if (!clip || typeof clip.t !== 'number') return;
   const d = Number(this.sequencer.durationSec) || 0;
   this.sequencerPlayhead = Math.min(Math.max(0, clip.t), d);
   this.sequencerSelectedClipId = clip.id;
   this.previewSequencerFrame();
 },
 selectSequencerClip(clipId) {
   this.sequencerSelectedClipId = clipId;
 },
 activeSequencerClipAt(tSec, type) {
   const t = Number(tSec) || 0;
   const matches = (this.sequencer.clips || [])
     .filter((c) => c && c.type === type && Number.isFinite(Number(c.t)) && t >= Number(c.t))
     .filter((c) => c.endT == null || t < Number(c.endT));
   if (!matches.length) return null;
   return matches.reduce((best, c) => (Number(c.t) >= Number(best.t) ? c : best), matches[0]);
 },
 applySequencerClip(clip) {
   if (!clip || !clip.payload) return;
   if (clip.type === 'prompt') {
     if (clip.payload.pos != null) this.prompts.pos = String(clip.payload.pos);
     if (clip.payload.neg != null) this.prompts.neg = String(clip.payload.neg);
     this.sendPrompts();
     return;
   }
   if (clip.type === 'lora') {
     const restore = (entries, groupKey) => {
       this.loras[groupKey] = (entries || []).map((e) => ({
         id: e.id || e.path,
         name: e.name || e.path,
         path: e.path,
         strength: Number(e.strength) || 1,
       }));
     };
     restore(clip.payload.common, 'common');
     restore(clip.payload.groupA, 'groupA');
     restore(clip.payload.groupB, 'groupB');
     if (clip.payload.crossfaderValue != null) {
       this.prompts.crossfaderValue = Number(clip.payload.crossfaderValue) || 0;
     }
     if (clip.payload.loraCrossfaderOn != null) {
       this.prompts.loraCrossfaderOn = !!clip.payload.loraCrossfaderOn;
     }
     this.applyLoras();
     return;
   }
   if (clip.type === 'controlnet' && Array.isArray(clip.payload.slots)) {
     for (const snap of clip.payload.slots) {
       const slot = this.cn.slots.find((s) => s.id === snap.id);
       if (!slot) continue;
       if (snap.model != null) slot.model = snap.model;
       if (snap.weight != null) slot.weight = snap.weight;
       if (snap.start != null) slot.start = snap.start;
       if (snap.end != null) slot.end = snap.end;
       if (snap.enabled != null) slot.enabled = snap.enabled;
       this.updateControlNet(slot);
     }
   }
 },
 applySequencerClipsAt(tSec) {
   for (const type of ['prompt', 'lora', 'controlnet']) {
     const clip = this.activeSequencerClipAt(tSec, type);
     if (clip) this.applySequencerClip(clip);
   }
 },
 clipTypeLabel(type) {
   if (type === 'prompt') return 'Prompt';
   if (type === 'lora') return 'LoRA';
   if (type === 'controlnet') return 'ControlNet';
   return type;
 },
 clipSummaryText(clip) {
   if (!clip) return '';
   if (clip.type === 'prompt') {
     const text = String(clip.payload?.pos || '').trim();
     return text.length > 48 ? `${text.slice(0, 48)}…` : text || 'Empty prompt';
   }
   if (clip.type === 'lora') {
     const n = (clip.payload?.common?.length || 0)
       + (clip.payload?.groupA?.length || 0)
       + (clip.payload?.groupB?.length || 0);
     return `${n} LoRA${n === 1 ? '' : 's'}`;
   }
   if (clip.type === 'controlnet') {
     const enabled = (clip.payload?.slots || []).filter((s) => s.enabled).length;
     return `${enabled} slot${enabled === 1 ? '' : 's'} on`;
   }
   return '';
 },
 clampSequencerMarkers() {
   const d = Number(this.sequencer.durationSec) || 0;
   const arr = this.sequencer.markers;
   if (!Array.isArray(arr)) return;
   for (const m of arr) {
     if (!m || typeof m.t !== "number") continue;
     if (m.t < 0) m.t = 0;
     if (m.t > d) m.t = d;
   }
   this.clampSequencerClips();
 },
 clampSequencerPlayhead() {
   const d = Number(this.sequencer.durationSec) || 0;
   if (this.sequencerPlayhead < 0) this.sequencerPlayhead = 0;
   if (this.sequencerPlayhead > d) this.sequencerPlayhead = d;
   this.clampSequencerMarkers();
 },
 addSequencerMarker() {
   this.clampSequencerPlayhead();
   const d = Number(this.sequencer.durationSec) || 0;
   let name = (this.sequencerMarkerName || "").trim() || "Scene";
   if (name.length > 48) name = name.slice(0, 48);
   if (!/^[a-zA-Z0-9_ \-.]+$/.test(name)) {
     this.sequencerStatus = "Marker label: letters, digits, space, underscore, hyphen, dot only";
     return;
   }
   if (!Array.isArray(this.sequencer.markers)) this.sequencer.markers = [];
   if (this.sequencer.markers.length >= 64) {
     this.sequencerStatus = "Maximum 64 markers";
     return;
   }
   const t = Math.min(Math.max(0, this.sequencerPlayhead), d);
   this.sequencer.markers.push({ t, name, action: "jump", target: "" });
   this.sequencerStatus = "";
 },
 removeSequencerMarker(sortedIdx) {
   const sorted = this.sortedSequencerMarkers;
   const victim = sorted[sortedIdx];
   if (!victim || !Array.isArray(this.sequencer.markers)) return;
   const ix = this.sequencer.markers.indexOf(victim);
   if (ix >= 0) this.sequencer.markers.splice(ix, 1);
 },
 jumpToSequencerMarker(m) {
   if (!m || typeof m.t !== "number") return;
   const d = Number(this.sequencer.durationSec) || 0;
   this.sequencerPlayhead = Math.min(Math.max(0, m.t), d);
   this.previewSequencerFrame();
 },
 setMarkerAction(m, action) {
   if (!m) return;
   m.action = action;
   if (action === "jump" || action === "generate" || action === "pause") {
     m.target = "";
   }
 },
 setMarkerTarget(m, target) {
   if (!m) return;
   m.target = target;
 },
 markerActionPlaceholder(action) {
   switch (action) {
     case "preset": return "Preset name";
     case "morph": return "Slot #";
     case "param": return '{"param": value}';
     default: return "";
   }
 },
 markerActionTitle(action) {
   switch (action) {
     case "preset": return "Name of a motion preset (e.g. Orbit, Zoom)";
     case "morph": return "Morph slot number to toggle (1, 2, 3...)";
     case "param": return 'JSON object of params to apply (e.g. {"zoom": 1.5})';
     default: return "";
   }
 },
 interpolateTrack(tr, tSec) {
   const dur = Number(this.sequencer.durationSec) || 0;
   const t = Math.min(Math.max(0, tSec), dur);
   const kf = this.sortedKeyframes(tr);
   if (!kf.length) return null;
   if (t <= kf[0].t) return kf[0].v;
   if (t >= kf[kf.length - 1].t) return kf[kf.length - 1].v;
   let i = 0;
   while (i < kf.length - 1 && kf[i + 1].t < t) i += 1;
   const a = kf[i];
   const b = kf[i + 1];
   if (!b) return a.v;
   const span = b.t - a.t;
   if (span <= 0) return a.v;
   const u = (t - a.t) / span;
   if (a.hIn !== undefined || a.hOut !== undefined || b.hIn !== undefined || b.hOut !== undefined) {
     const hOut = a.hOut != null ? a.hOut : 0.33;
     const hIn = b.hIn != null ? b.hIn : 0.67;
     const vOut = a.hOutV != null ? a.hOutV : a.v + (b.v - a.v) * 0.33;
     const vIn = b.hInV != null ? b.hInV : a.v + (b.v - a.v) * 0.67;
     return this.cubicBezier(u, a.v, vOut, vIn, b.v);
   }
   const ease = a.easing || "linear";
   const w = this.sequencerEaseT(u, ease);
   return a.v + w * (b.v - a.v);
 },
 cubicBezier(t, p0, p1, p2, p3) {
   const mt = 1 - t;
   return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
 },
 applySequencerAt(tSec) {
   const payload = {};
   const cnUpdates = {};
   for (const tr of this.sequencer.tracks) {
     const v = this.interpolateTrack(tr, tSec);
     if (v === null || !Number.isFinite(v)) continue;
     const meta = this.modulationTargetByKey(tr.param);
     let routed = v;
     if (meta) {
       routed = this.clampVal(v, meta.min, meta.max);
     } else if (tr.param.startsWith('cn_')) {
       if (tr.param.endsWith('_weight')) routed = Math.min(2, Math.max(0, v));
       else routed = Math.min(1, Math.max(0, v));
     }
     this.routeModulationValue(tr.param, routed, payload, cnUpdates);
   }
   if (Object.keys(payload).length) this.sendControl("liveParam", payload);
   Object.values(cnUpdates).forEach(slot => this.updateControlNet(slot));
   this.applySequencerClipsAt(tSec);
 },
 previewSequencerFrame() {
   this.clampSequencerPlayhead();
   this.jobPlaybackTimeSec = Number(this.sequencerPlayhead) || 0;
   if (!this.ws || this.ws.readyState !== 1) return;
   this.applySequencerAt(this.sequencerPlayhead);
 },
 tickSequencer() {
   const dur = Number(this.sequencer.durationSec) || 0;
   const dt = 1 / Math.max(1, Number(this.sequencer.fps) || 24);
   let next = this.sequencerPlayhead + dt;
   const prev = this.sequencerPlayhead;
   if (next >= dur - 1e-9) {
     if (this.sequencer.loop) next = 0;
     else {
       this.sequencerPlayhead = dur;
       this.applySequencerAt(this.sequencerPlayhead);
       this.stopSequencerPlayback();
       return;
     }
   }
   this.sequencerPlayhead = next;
   this.applySequencerAt(this.sequencerPlayhead);
   const markers = (this.sequencer.markers || []);
   for (const m of markers) {
     if (m.t > prev && m.t <= next) {
       this.triggerMarkerAction(m);
     }
   }
 },
 triggerMarkerAction(m) {
   if (!m || !m.action) return;
   switch (m.action) {
     case "jump":
       this.sequencerPlayhead = m.t;
       this.previewSequencerFrame();
       break;
     case "preset":
       if (m.target && this.motionPresets[m.target]) {
         this.sendPreset(m.target);
         this.sequencerStatus = `Marker: applied preset "${m.target}"`;
       }
       break;
     case "generate":
       this.generateStory();
       this.sequencerStatus = `Marker: triggered generation`;
       break;
     case "morph":
       if (m.target) {
         const slotIdx = parseInt(m.target) - 1;
         if (slotIdx >= 0 && slotIdx < this.morphSlots.length) {
           this.morphSlots[slotIdx].on = !this.morphSlots[slotIdx].on;
           this.applyPromptMorphing();
           this.sequencerStatus = `Marker: toggled morph slot ${m.target}`;
         }
       }
       break;
     case "param":
       try {
         const params = JSON.parse(m.target || "{}");
         this.sendControl("liveParam", params);
         this.sequencerStatus = `Marker: applied params`;
       } catch (_e) {
         this.sequencerStatus = `Marker: invalid param JSON`;
       }
       break;
     case "pause":
       this.stopSequencerPlayback();
       this.sequencerStatus = `Marker: paused at "${m.name}"`;
       break;
   }
 },
 toggleSequencerPlayback() {
   if (this.sequencerPlaying) {
     this.stopSequencerPlayback();
     return;
   }
   if (!this.ws || this.ws.readyState !== 1) {
     this.sequencerStatus = "WebSocket not connected";
     return;
   }
   if (!this.sequencer.tracks.length) {
     this.sequencerStatus = "Add at least one track with keyframes";
     return;
   }
   const hasKf = this.sequencer.tracks.some((tr) => tr.keyframes && tr.keyframes.length);
   if (!hasKf) {
     this.sequencerStatus = "Add keyframes to play";
     return;
   }
   this.sequencerPlaying = true;
   this.sequencerStatus = "";
   const ms = Math.max(16, Math.round(1000 / Math.max(1, Number(this.sequencer.fps) || 24)));
   this.sequencerTimer = setInterval(() => this.tickSequencer(), ms);
 },
 stopSequencerPlayback() {
   this.sequencerPlaying = false;
   if (this.sequencerTimer) {
     clearInterval(this.sequencerTimer);
     this.sequencerTimer = null;
   }
 },
 addSequencerTrack() {
   const param = this.sequencerNewParam;
   if (this.sequencer.tracks.some((x) => x.param === param)) {
     this.sequencerStatus = "Track already exists for " + param;
     return;
   }
   const id = "tr-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
   this.sequencer.tracks.push({ id, param, keyframes: [] });
   this.sequencerSelectedTrackId = id;
   this.sequencerStatus = "";
 },
 removeSequencerTrack(id) {
   this.sequencer.tracks = this.sequencer.tracks.filter((x) => x.id !== id);
   if (this.sequencerSelectedTrackId === id) this.sequencerSelectedTrackId = null;
 },
 addSequencerKeyframe() {
   const tid = this.sequencerSelectedTrackId || (this.sequencer.tracks[0] && this.sequencer.tracks[0].id);
   const tr = this.sequencer.tracks.find((x) => x.id === tid);
   if (!tr) {
     this.sequencerStatus = "Add a track first";
     return;
   }
   this.clampSequencerPlayhead();
   const t = Math.min(Math.max(0, this.sequencerPlayhead), Number(this.sequencer.durationSec) || 0);
   const v = Number(this.sequencerKeyframeVal);
   if (Number.isNaN(v)) {
     this.sequencerStatus = "Invalid keyframe value";
     return;
   }
   tr.keyframes.push({ t, v });
   this.sequencerStatus = "";
 },
 removeSequencerKeyframe(trackId, sortedIdx) {
   const tr = this.sequencer.tracks.find((x) => x.id === trackId);
   if (!tr) return;
   const sorted = this.sortedKeyframes(tr);
   const victim = sorted[sortedIdx];
   if (!victim) return;
   const ix = tr.keyframes.indexOf(victim);
   if (ix >= 0) tr.keyframes.splice(ix, 1);
 },
 async refreshSequencerList() {
   if (typeof fetch !== "function") return;
   try {
     const res = await fetch("/api/sequencer");
     const j = await res.json();
     if (Array.isArray(j.timelines)) this.sequencerList = j.timelines;
   } catch (_e) {}
 },
 async saveSequencerTimeline() {
   const raw = (this.sequencerSaveName || "timeline").trim();
   const name = raw.replace(/[^a-zA-Z0-9_-]/g, "");
   if (!name) {
     this.sequencerStatus = "Invalid save name";
     return;
   }
   try {
     const res = await fetch("/api/sequencer/" + encodeURIComponent(name), {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(this.sequencerPayload()),
     });
     const j = await res.json();
     if (!res.ok) throw new Error(j.error || res.statusText);
     this.sequencerStatus = "Saved " + name;
     await this.refreshSequencerList();
   } catch (e) {
     this.sequencerStatus = String(e.message || e);
   }
 },
 async loadSequencerTimeline() {
   const name = this.sequencerLoadPick;
   if (!name) return;
   try {
     const res = await fetch("/api/sequencer/" + encodeURIComponent(name));
     const j = await res.json();
     if (!res.ok || !j.timeline) throw new Error(j.error || "load failed");
     const tl = j.timeline;
     if (tl.durationSec != null) this.sequencer.durationSec = tl.durationSec;
     if (tl.fps != null) this.sequencer.fps = tl.fps;
     this.sequencer.loop = tl.loop !== false;
     this.sequencer.markers = Array.isArray(tl.markers)
       ? tl.markers
           .map((m) => ({ t: Number(m.t), name: String(m.name || "").trim(), action: m.action || "jump", target: m.target || "" }))
           .filter((m) => m.name && Number.isFinite(m.t))
       : [];
     this.sequencer.tracks = Array.isArray(tl.tracks)
       ? tl.tracks.map((tr) => ({
           id: tr.id || "tr-" + Math.random().toString(36).slice(2),
           param: tr.param,
           keyframes: Array.isArray(tr.keyframes) ? tr.keyframes.slice() : [],
         }))
       : [];
     this.sequencer.clips = this.normalizeSequencerClipsForSave(tl.clips || []);
     this.sequencerSelectedClipId = this.sequencer.clips[0] ? this.sequencer.clips[0].id : null;
     this.sequencerSaveName = name;
     this.sequencerSelectedTrackId = this.sequencer.tracks[0] ? this.sequencer.tracks[0].id : null;
     this.clampSequencerPlayhead();
     this.sequencerStatus = "Loaded " + name;
   } catch (e) {
     this.sequencerStatus = String(e.message || e);
   }
 },
 exportSequencerDownload() {
   const json = JSON.stringify(this.sequencerPayload(), null, 2);
   const blob = new Blob([json], { type: "application/json" });
   const base = (this.sequencerSaveName || "sequencer").replace(/[^a-zA-Z0-9_-]/g, "") || "sequencer";
   const a = document.createElement("a");
   a.href = URL.createObjectURL(blob);
   a.download = base + ".json";
   a.click();
   URL.revokeObjectURL(a.href);
 },
async applySequencerToDeforumSettings() {
  const fps = Math.max(1, Number(this.sequencer.fps) || 24);
  const durationSec = Math.max(0.1, Number(this.sequencer.durationSec) || 1);
  const totalFrames = Math.ceil(durationSec * fps);
  const scheduleUpdates = {};
  for (const tr of this.sequencer.tracks) {
    const meta = this.modulationTargets.find((m) => m.key === tr.param);
    const deforumKey = meta?.deforumKey || tr.param;
    if (!tr.keyframes.length) continue;
    const sorted = [...tr.keyframes].sort((a, b) => a.t - b.t);
    const parts = sorted.map((kf) => {
      const frame = Math.round(Math.min(totalFrames, Math.max(0, kf.t * fps)));
      const val = Number.isFinite(kf.v) ? kf.v : 0;
      return `${frame}:(${val.toFixed(4)})`;
    });
    scheduleUpdates[deforumKey] = parts.join(', ');
  }
  if (!Object.keys(scheduleUpdates).length) {
    this.sequencerStatus = 'No tracks with keyframes to export';
    return;
  }
  try {
    const currentSettings = this.deforumSettings || {};
    const merged = { ...currentSettings, ...scheduleUpdates };
    const res = await fetch('/api/deforum/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: merged }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    this.sequencerStatus = `Applied ${Object.keys(scheduleUpdates).length} schedule(s) to Deforum settings`;
    this.loadDeforumSettings({ syncServerModel: false });
  } catch (err) {
    this.sequencerStatus = 'Apply failed: ' + err.message;
  }
},
selectSequencerTrack(trackId) {
  this.sequencerSelectedTrackId = trackId;
},
 sequencerTimeFromJobFrame(frameNumber) {
   const fps = this.sequencerJobFps;
   const total = this.sequencerJobTotalFrames;
   const frame = Math.min(total, Math.max(1, Math.floor(Number(frameNumber) || 1)));
   return (frame - 1) / fps;
 },
 seekSequencerToJobFrame(frameNumber) {
   const dur = Number(this.sequencer.durationSec) || 0;
   const t = Math.min(dur, Math.max(0, this.sequencerTimeFromJobFrame(frameNumber)));
   this.seekSequencer(t);
 },
 seekSequencer(t) {
  this.sequencerPlayhead = Math.min(Math.max(0, Number(t) || 0), Math.max(0.01, Number(this.sequencer.durationSec) || 0.01));
  this.jobPlaybackTimeSec = this.sequencerPlayhead;
  this.previewSequencerFrame();
},
updateSequencerKeyframe({ trackId, keyframe, t, v }) {
  const track = this.sequencer.tracks.find((item) => item.id === trackId);
  if (!track || !keyframe) return;
  keyframe.t = Math.min(Math.max(0, Number(t) || 0), Math.max(0.01, Number(this.sequencer.durationSec) || 0.01));
  keyframe.v = Number(v);
},
 getTrackValueAt(tr, t) {
   const kfs = this.sortedKeyframes(tr);
   if (!kfs.length) return 0;
   if (t <= kfs[0].t) return kfs[0].v;
   if (t >= kfs[kfs.length - 1].t) return kfs[kfs.length - 1].v;
   for (let i = 0; i < kfs.length - 1; i++) {
     if (t >= kfs[i].t && t <= kfs[i + 1].t) {
       const dur = kfs[i + 1].t - kfs[i].t;
       const u = dur > 0 ? (t - kfs[i].t) / dur : 0;
       const a = kfs[i];
       const b = kfs[i + 1];
       if (a.hIn !== undefined || a.hOut !== undefined || b.hIn !== undefined || b.hOut !== undefined) {
         const hOut = a.hOut != null ? a.hOut : 0.33;
         const hIn = b.hIn != null ? b.hIn : 0.67;
         const vOut = a.hOutV != null ? a.hOutV : a.v + (b.v - a.v) * 0.33;
         const vIn = b.hInV != null ? b.hInV : a.v + (b.v - a.v) * 0.67;
         return this.cubicBezier(u, a.v, vOut, vIn, b.v);
       }
       const eased = this.sequencerEaseT(u, a.easing);
       return a.v + (b.v - a.v) * eased;
     }
   }
   return kfs[kfs.length - 1].v;
 },
 drawTimeline() {
   const canvas = this.$refs.timelineCanvas;
   if (!canvas || !this.sequencer.tracks.length) return;
   const ctx = canvas.getContext("2d");
   const dpr = window.devicePixelRatio || 1;
   const rect = canvas.getBoundingClientRect();
   canvas.width = rect.width * dpr;
   canvas.height = Math.max(120, this.sequencer.tracks.length * 40 + 20) * dpr;
   ctx.scale(dpr, dpr);
   const w = rect.width;
   const h = rect.height;
   const dur = Math.max(0.01, Number(this.sequencer.durationSec) || 8);
   const laneH = (h - 20) / Math.max(1, this.sequencer.tracks.length);
   const trackColors = TIMELINE_TRACK_COLORS;
   ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = this.themeColor('--bg-0', 'rgb(8, 9, 13)');
   ctx.fillRect(0, 0, w, h);
   this.sequencer.tracks.forEach((tr, idx) => {
     const y = 20 + idx * laneH;
     const kfs = this.sortedKeyframes(tr);
     if (!kfs.length) {
       ctx.strokeStyle = TIMELINE_GRID_EMPTY;
       ctx.lineWidth = 1;
       ctx.setLineDash([4, 4]);
       ctx.beginPath();
       ctx.moveTo(0, y + laneH / 2);
       ctx.lineTo(w, y + laneH / 2);
       ctx.stroke();
       ctx.setLineDash([]);
       ctx.fillStyle = TIMELINE_GRID_LABEL;
       ctx.font = "10px monospace";
       ctx.fillText(tr.param + " (no keyframes)", 6, y + laneH / 2 + 3);
       return;
     }
     let minV = Math.min(...kfs.map(k => k.v));
     let maxV = Math.max(...kfs.map(k => k.v));
     const range = maxV - minV || 1;
     minV -= range * 0.15;
     maxV += range * 0.15;
     const color = trackColors[idx % trackColors.length];
     ctx.strokeStyle = TIMELINE_GRID_BORDER;
     ctx.lineWidth = 1;
     ctx.strokeRect(0, y, w, laneH);
     ctx.fillStyle = color + "20";
     ctx.fillRect(0, y, w, laneH);
     ctx.strokeStyle = color;
     ctx.lineWidth = 2;
     ctx.beginPath();
     const steps = Math.max(w, 100);
     for (let i = 0; i <= steps; i++) {
       const t = (i / steps) * dur;
       const v = this.getTrackValueAt(tr, t);
       const px = (t / dur) * w;
       const py = y + laneH - ((v - minV) / (maxV - minV)) * laneH;
       if (i === 0) ctx.moveTo(px, py);
       else ctx.lineTo(px, py);
     }
     ctx.stroke();
     kfs.forEach((kf, ki) => {
       const px = (kf.t / dur) * w;
       const v = kf.v;
       const py = y + laneH - ((v - minV) / (maxV - minV)) * laneH;
       if (ki < kfs.length - 1) {
         const next = kfs[ki + 1];
         const hOut = kf.hOut != null ? kf.hOut : 0.33;
         const hIn = next.hIn != null ? next.hIn : 0.67;
         const vOut = kf.hOutV != null ? kf.hOutV : v + (next.v - v) * 0.33;
         const vIn = next.hInV != null ? next.hInV : v + (next.v - v) * 0.67;
         const hasHandles = kf.hIn !== undefined || kf.hOut !== undefined || next.hIn !== undefined || next.hOut !== undefined;
         if (hasHandles) {
           const hOutPx = (kf.t + hOut * (next.t - kf.t)) / dur * w;
           const hOutPy = y + laneH - ((vOut - minV) / (maxV - minV)) * laneH;
           const hInPx = (next.t - (1 - hIn) * (next.t - kf.t)) / dur * w;
           const hInPy = y + laneH - ((vIn - minV) / (maxV - minV)) * laneH;
           ctx.strokeStyle = color + "60";
           ctx.lineWidth = 1;
           ctx.setLineDash([2, 2]);
           ctx.beginPath();
           ctx.moveTo(px, py);
           ctx.lineTo(hOutPx, hOutPy);
           ctx.stroke();
           ctx.beginPath();
           ctx.moveTo((next.t / dur) * w, y + laneH - ((next.v - minV) / (maxV - minV)) * laneH);
           ctx.lineTo(hInPx, hInPy);
           ctx.stroke();
           ctx.setLineDash([]);
          ctx.fillStyle = this.themeColor('--media-text', 'rgb(255, 255, 255)');
           ctx.beginPath();
           ctx.arc(hOutPx, hOutPy, 3, 0, Math.PI * 2);
           ctx.fill();
           ctx.beginPath();
           ctx.arc(hInPx, hInPy, 3, 0, Math.PI * 2);
           ctx.fill();
         }
       }
       ctx.fillStyle = color;
       ctx.beginPath();
       ctx.arc(px, py, 4, 0, Math.PI * 2);
       ctx.fill();
      ctx.fillStyle = this.themeColor('--media-text', 'rgb(255, 255, 255)');
       ctx.beginPath();
       ctx.arc(px, py, 2, 0, Math.PI * 2);
       ctx.fill();
     });
     ctx.fillStyle = TIMELINE_GRID_TEXT;
     ctx.font = "9px monospace";
     ctx.fillText(tr.param, 4, y + 11);
   });
   const markers = (this.sequencer.markers || []);
   markers.forEach(m => {
     const px = (m.t / dur) * w;
    const markerColor = this.themeColor('--error', 'rgb(226, 75, 74)');
     ctx.strokeStyle = markerColor + '80';
     ctx.lineWidth = 1;
     ctx.setLineDash([2, 3]);
     ctx.beginPath();
     ctx.moveTo(px, 20);
     ctx.lineTo(px, h);
     ctx.stroke();
     ctx.setLineDash([]);
     ctx.fillStyle = markerColor;
     ctx.font = "8px monospace";
     ctx.fillText(m.name, px + 3, 14);
   });
   const playX = (this.sequencerPlayhead / dur) * w;
  ctx.strokeStyle = this.themeColor('--media-text', 'rgb(255, 255, 255)');
   ctx.lineWidth = 2;
   ctx.beginPath();
   ctx.moveTo(playX, 20);
   ctx.lineTo(playX, h);
   ctx.stroke();
  ctx.fillStyle = this.themeColor('--media-text', 'rgb(255, 255, 255)');
   ctx.beginPath();
   ctx.moveTo(playX - 5, 20);
   ctx.lineTo(playX + 5, 20);
   ctx.lineTo(playX, 26);
   ctx.closePath();
   ctx.fill();
   for (let i = 0; i <= 4; i++) {
     const t = (dur / 4) * i;
     const px = (t / dur) * w;
     ctx.fillStyle = TIMELINE_GRID_LABEL;
     ctx.font = "8px monospace";
     ctx.fillText(t.toFixed(1) + "s", px + 2, h - 2);
   }
 },
 seekTimeline(event) {
   const canvas = this.$refs.timelineCanvas;
   if (!canvas) return;
   const rect = canvas.getBoundingClientRect();
   const x = event.clientX - rect.left;
   const dur = Math.max(0.01, Number(this.sequencer.durationSec) || 8);
   this.sequencerPlayhead = Math.max(0, Math.min(dur, (x / rect.width) * dur));
   this.drawTimeline();
 },
 hoverTimeline(event) {
   const canvas = this.$refs.timelineCanvas;
   if (!canvas) return;
   const rect = canvas.getBoundingClientRect();
   const x = event.clientX - rect.left;
   const dur = Math.max(0.01, Number(this.sequencer.durationSec) || 8);
   this.timelineHoverTime = Math.max(0, Math.min(dur, (x / rect.width) * dur));
   this.timelineHoverPercent = (x / rect.width) * 100;
 },
 xyPadMouseDown(evt) {
   this.xyPad.dragging = true;
   this.updateXyPad(evt);
   evt.preventDefault();
 },
 xyPadMouseMove(evt) {
   if (!this.xyPad.dragging) return;
   this.updateXyPad(evt);
   evt.preventDefault();
 },
 xyPadMouseUp() {
   this.xyPad.dragging = false;
 },
 updateXyPad(evt) {
   const pad = evt.currentTarget;
   const rect = pad.getBoundingClientRect();
   let clientX, clientY;
   if (evt.touches && evt.touches.length > 0) {
     clientX = evt.touches[0].clientX;
     clientY = evt.touches[0].clientY;
   } else {
     clientX = evt.clientX;
     clientY = evt.clientY;
   }
  const width = rect.width || this.xyPad.padSize || 1;
  const height = rect.height || this.xyPad.padSize || 1;
  const x = Math.max(0, Math.min(width, clientX - rect.left));
  const y = Math.max(0, Math.min(height, clientY - rect.top));
   // Normalize pad coordinates to -1..1, then scale to translation range -10..10
  const normX = (x / width) * 2 - 1;
  const normY = 1 - (y / height) * 2;
   const TRANSLATION_RANGE = 10; // Max translation distance for camera movement
   const translation_x = normX * TRANSLATION_RANGE;
   const translation_y = normY * TRANSLATION_RANGE;
  this.motionPadValues.translation_x = translation_x;
  this.motionPadValues.translation_y = translation_y;
   this.emitMotionLiveParam("translation_x", translation_x);
   this.emitMotionLiveParam("translation_y", translation_y);
   if (!this.deforumPlaying) this.schedulePreviewFrame();
 },
 // LoRA management methods
 async refreshLoras() {
  this.lorasLoading = true;
   try {
     const { data } = await apiFetch("/api/loras", {}, "loras list");
     if (data.loras) {
       this.loras.available = data.loras.map((lora) => ({
         id: lora.id || lora.name,
         name: lora.name,
         path: lora.path || "",
         thumbnail: lora.thumbnail || null,
         metadata: lora.metadata || null,
         family: this.detectLoraFamily(lora),
         strength: lora.strength || 1.0,
         selected: false,
         group: null,
       }));
       this.loras.source = data.source || "unknown";
       // Restore selected loras from groups using Map for O(1) lookup
       const loraMap = new Map(this.loras.available.map(l => [l.id, l]));
      this.loras.common.forEach((savedLora) => {
        const found = loraMap.get(savedLora.id);
        if (found) {
          found.selected = true;
          found.group = "COMMON";
          found.strength = savedLora.strength;
        }
      });
      this.loras.groupA.forEach((savedLora) => {
         const found = loraMap.get(savedLora.id);
         if (found) {
           found.selected = true;
           found.group = "A";
           found.strength = savedLora.strength;
         }
       });
       this.loras.groupB.forEach((savedLora) => {
         const found = loraMap.get(savedLora.id);
         if (found) {
           found.selected = true;
           found.group = "B";
           found.strength = savedLora.strength;
         }
       });
     }
   } catch (err) {
     console.error("Failed to load LoRAs", err);
  } finally {
    this.lorasLoading = false;
   }
 },
 toggleLoraSelection(lora) {
   if (lora.selected) {
     this.removeLoraSelection(lora);
   } else {
     lora.selected = true;
    lora.group = "COMMON";
    this.assignLoraToGroup(lora, "COMMON");
   }
 },
 assignLoraToGroup(lora, group) {
  if (group !== "A" && group !== "B" && group !== "COMMON") return;
   
  // Keep each LoRA assigned to exactly one group.
  this.loras.common = this.loras.common.filter((l) => l.id !== lora.id);
   this.loras.groupA = this.loras.groupA.filter((l) => l.id !== lora.id);
   this.loras.groupB = this.loras.groupB.filter((l) => l.id !== lora.id);
   
   // Add to target group
   lora.group = group;
   lora.selected = true;
   const loraData = {
     id: lora.id,
     name: lora.name,
     path: lora.path,
     strength: lora.strength,
     thumbnail: lora.thumbnail,
   };
   
  if (group === "COMMON") {
    this.loras.common.push(loraData);
  } else if (group === "A") {
     this.loras.groupA.push(loraData);
   } else {
     this.loras.groupB.push(loraData);
   }
 },
 removeLoraSelection(lora) {
   lora.selected = false;
   lora.group = null;
  this.loras.common = this.loras.common.filter((l) => l.id !== lora.id);
   this.loras.groupA = this.loras.groupA.filter((l) => l.id !== lora.id);
   this.loras.groupB = this.loras.groupB.filter((l) => l.id !== lora.id);
 },
unassignLora(lora) {
  const available = this.loras.available.find((entry) => entry.id === lora.id);
  if (available) {
    available.selected = false;
    available.group = null;
  }
  this.loras.common = this.loras.common.filter((entry) => entry.id !== lora.id);
  this.loras.groupA = this.loras.groupA.filter((entry) => entry.id !== lora.id);
  this.loras.groupB = this.loras.groupB.filter((entry) => entry.id !== lora.id);
},
 updateLoraStrength(lora) {
   // Update strength in groups as well
  const commonLora = this.loras.common.find((entry) => entry.id === lora.id);
  if (commonLora) {
    commonLora.strength = lora.strength;
  }
   const groupALora = this.loras.groupA.find((l) => l.id === lora.id);
   if (groupALora) {
     groupALora.strength = lora.strength;
   }
   const groupBLora = this.loras.groupB.find((l) => l.id === lora.id);
   if (groupBLora) {
     groupBLora.strength = lora.strength;
   }
 },
updateGroupedLoraStrength(group, lora, value) {
  const next = parseFloat(value);
  if (!Number.isFinite(next)) return;
  const list = group === "COMMON"
    ? this.loras.common
    : group === "B"
      ? this.loras.groupB
      : this.loras.groupA;
  const target = list.find((entry) => entry.id === lora.id);
  if (target) target.strength = next;
  const available = this.loras.available.find((entry) => entry.id === lora.id);
  if (available) {
    available.strength = next;
    available.selected = true;
    available.group = group;
  }
},
 updateCrossfader() {
   const blend = this.loraCrossfaderBlending;
   const t = this.prompts.crossfaderValue;
   this.sendControl("crossfader", {
     value: t,
     loraCrossfaderOn: this.prompts.loraCrossfaderOn,
    common: this.loras.common.map((l) => ({
      ...l,
      effectiveStrength: l.strength,
    })),
     groupA: this.loras.groupA.map((l) => ({
       ...l,
       effectiveStrength: blend ? l.strength * (1 - t) : l.strength,
     })),
     groupB: this.loras.groupB.map((l) => ({
       ...l,
       effectiveStrength: blend ? l.strength * t : l.strength,
     })),
   });
 },
 applyLoras() {
   const blend = this.loraCrossfaderBlending;
   const t = this.prompts.crossfaderValue;
   const payload = {
    common: this.loras.common.map((l) => ({
      name: l.name,
      path: l.path,
      strength: l.strength,
    })),
     groupA: this.loras.groupA.map((l) => ({
       name: l.name,
       path: l.path,
       strength: blend ? l.strength * (1 - t) : l.strength,
     })),
     groupB: this.loras.groupB.map((l) => ({
       name: l.name,
       path: l.path,
       strength: blend ? l.strength * t : l.strength,
     })),
     crossfaderValue: t,
     loraCrossfaderOn: this.prompts.loraCrossfaderOn,
   };
   this.sendControl("loras", payload);
   console.log("Applied LoRAs with crossfader", payload);
 },
 clearAllLoras() {
   this.loras.available.forEach((lora) => {
     lora.selected = false;
     lora.group = null;
   });
  this.loras.common = [];
   this.loras.groupA = [];
   this.loras.groupB = [];
  this.sendControl("loras", { common: [], groupA: [], groupB: [], crossfaderValue: this.prompts.crossfaderValue });
 },

 // ─── Story Generator ─────────────────────────────────────────────────
 _genRnd(arr) {
   return arr[Math.floor(Math.random() * arr.length)];
 },
generatorRequestBody() {
  const style = this.generator.stylePreset === 'custom'
    ? (this.generator.customStyle.trim() || 'Masterpiece, Realistic')
    : this.generator.stylePreset;
  const width = Number(this.deforumSettings && this.deforumSettings.W) || Number((this.generator.resolution || '1024x576').split('x')[0]) || 1024;
  const height = Number(this.deforumSettings && this.deforumSettings.H) || Number((this.generator.resolution || '1024x576').split('x')[1]) || 576;
  const fps = Number(this.sequencer && this.sequencer.fps) || Number(this.framesync && this.framesync.fps) || Number(this.generator.fps) || 24;
  const totalFrames = Number(this.deforumSettings && this.deforumSettings.max_frames) || Number(this.framesync && this.framesync.frameCount) || Number(this.generator.totalFrames) || 96;
  const numScenes = Math.max(2, Number(this.generator.numScenes) || 4);
  return {
    theme: this.generator.theme.trim() || this._genRnd(this.genData.defaultThemes),
    style,
    width,
    height,
    fps,
    totalFrames,
    numScenes,
  };
},
 _buildScene(theme, style, idx, total) {
   const r = (a) => this._genRnd(a);
   const g = this.genData;
   const mood = idx === 0 ? 'opening' : idx >= total - 1 ? 'closing' : idx < Math.ceil(total / 2) ? 'buildup' : 'climax';
   const adj = r(g.sceneDescriptors[mood]);
   const envPool = g.environments[idx % g.environments.length];
   const env = r(envPool);
   const light = r(g.lighting);
   const qual = r(g.quality);
   const tech = r(g.techSpecs);
   const artistPool = g.artists[style] || g.artists.default;
   const a1 = r(artistPool);
   let a2 = r(artistPool);
   for (let i = 0; i < 5 && a2 === a1 && artistPool.length > 1; i++) a2 = r(artistPool);
   const neg = r(g.negatives);
   return `A ${adj} scene from ${theme} — ${env}, ${light}. ${qual}, ${tech}, inspired by ${a1} and ${a2} --neg ${neg}`;
 },
 _buildMotion(numScenes, framesPerScene, totalFrames) {
   const g = this.genData;
   const r = Math.random.bind(Math);
   const behaviors = g.cameraBehaviors;
   const assigned = [];
   let last = null;
   for (let i = 0; i < numScenes; i++) {
     let b;
     let tries = 0;
     do { b = behaviors[Math.floor(r() * behaviors.length)]; tries++; }
     while (b === last && behaviors.length > 1 && tries < 10);
     assigned.push(b);
     last = b;
   }
   const zParts = [], txParts = [], tyParts = [], tcxParts = [], tcyParts = [];
   let prevTx = null, prevTy = null, prevTcx = null, prevTcy = null;
   for (let i = 0; i < numScenes; i++) {
     const frame = i * framesPerScene;
     const b = assigned[i];
     const zVal = b.zoom === 'BREATHE'
       ? `1.0025+0.002*sin(1.25*3.14*t/${framesPerScene})`
       : b.zoom;
     zParts.push(`${frame}:(${zVal})`);
     if (b.tx !== prevTx) { txParts.push(`${frame}:(${b.tx})`); prevTx = b.tx; }
     if (b.ty !== prevTy) { tyParts.push(`${frame}:(${b.ty})`); prevTy = b.ty; }
     const tcx = Math.round((0.3 + r() * 0.4) * 10) / 10;
     const tcy = Math.round((0.3 + r() * 0.4) * 10) / 10;
     if (tcx !== prevTcx) { tcxParts.push(`${frame}:(${tcx})`); prevTcx = tcx; }
     if (tcy !== prevTcy) { tcyParts.push(`${frame}:(${tcy})`); prevTcy = tcy; }
   }
   zParts.push(`${totalFrames}:(1.0)`);
   if (prevTx !== 0) txParts.push(`${totalFrames}:(0)`);
   if (prevTy !== 0) tyParts.push(`${totalFrames}:(0)`);
   const motion = { Zoom: zParts.join(', ') };
   if (txParts.length) motion['Translation X'] = txParts.join(', ');
   if (tyParts.length) motion['Translation Y'] = tyParts.join(', ');
   if (tcxParts.length > 1) motion['Transform Center X'] = tcxParts.join(', ');
   if (tcyParts.length > 1) motion['Transform Center Y'] = tcyParts.join(', ');
   return motion;
 },
buildLocalStoryResult() {
  const payload = this.generatorRequestBody();
  const framesPerScene = Math.max(1, Math.floor(payload.totalFrames / payload.numScenes));
  const scenes = {};
  for (let i = 0; i < payload.numScenes; i++) {
    scenes[String(i * framesPerScene)] = this._buildScene(payload.theme, payload.style, i, payload.numScenes);
  }
  const motion = this._buildMotion(payload.numScenes, framesPerScene, payload.totalFrames);
  const lines = [
    `Theme: ${payload.theme}`,
    `Style: ${payload.style}`,
    `Resolution: ${payload.width}x${payload.height}`,
    `FPS: ${payload.fps}`,
    `Total frames: ${payload.totalFrames}`,
    '',
    JSON.stringify(scenes, null, 2),
    '',
    'Motion Settings:',
  ];
  for (const [key, value] of Object.entries(motion)) lines.push(`${key}: ${value}`);
  return {
    ...payload,
    scenes,
    motion,
    formatted: lines.join('\n'),
    source: { backend: 'local', model: '' },
  };
},
async generateStory() {
  const g = this.generator;
  g.isGenerating = true;
  g.status = 'Generating story…';
  g.result = null;
  try {
    const payload = this.generatorRequestBody();
    try {
      const { data } = await apiFetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }, 'generate story');
      g.result = data;
      const source = data && data.source && data.source.model ? ` via ${data.source.model}` : '';
      g.status = `Story ready${source} — review and apply below.`;
    } catch (err) {
      g.result = this.buildLocalStoryResult();
      g.status = `Story ready via local fallback (${err.message})`;
    }
  } catch (err) {
    g.status = `Error: ${err.message}`;
  } finally {
    g.isGenerating = false;
  }
 },
 approveStory() {
   if (!this.generator.result) return;
   const { scenes, motion } = this.generator.result;
   this.prompts.pos = JSON.stringify(scenes, null, 2);
   this.sendPrompts();
   this.sendControl('motionSettings', motion);
   this.generator.result = null;
   this.generator.status = 'Applied!';
   this.currentTab = 'PROMPTS';
   setTimeout(() => { this.generator.status = ''; }, 3000);
 },
 rejectStory() {
   this.generator.result = null;
   this.generator.status = 'Discarded.';
   setTimeout(() => { this.generator.status = ''; }, 2000);
 },
 async refreshGeneratorPresets() {
   try {
     const res = await fetch('/api/presets');
     const data = await res.json();
     this.generatorPresets = (data.presets || []).filter(p => p.startsWith('gen-'));
   } catch (err) {
     console.error('Failed to load generator presets', err);
   }
 },
 async loadGeneratorPreset(name) {
   try {
     const res = await fetch(`/api/presets/${name}`);
     const data = await res.json();
     if (data.preset && data.preset.generator) {
       Object.assign(this.generator, data.preset.generator);
       this.generator.result = null;
       this.currentGeneratorPreset = name;
       this.generatorPresetStatus = `Loaded: ${name}`;
       setTimeout(() => { this.generatorPresetStatus = ''; }, 3000);
     }
   } catch (err) {
     this.generatorPresetStatus = `Error: ${err.message}`;
   }
 },
 async saveGeneratorPreset() {
   const raw = (this.newGeneratorPresetName || 'default').replace(/[^a-zA-Z0-9_-]/g, '-');
   const name = `gen-${raw}`;
   const preset = {
     generator: {
       theme: this.generator.theme,
       stylePreset: this.generator.stylePreset,
       customStyle: this.generator.customStyle,
       fps: this.generator.fps,
       resolution: this.generator.resolution,
       totalFrames: this.generator.totalFrames,
       numScenes: this.generator.numScenes,
     },
   };
   try {
     const res = await fetch(`/api/presets/${name}`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(preset),
     });
     const data = await res.json();
     if (data.ok) {
       this.currentGeneratorPreset = name;
       this.newGeneratorPresetName = '';
       this.generatorPresetStatus = `Saved: ${name}`;
       await this.refreshGeneratorPresets();
       setTimeout(() => { this.generatorPresetStatus = ''; }, 3000);
     }
   } catch (err) {
     this.generatorPresetStatus = `Error: ${err.message}`;
   }
 },
 async deleteGeneratorPreset(name) {
   if (!confirm(`Delete preset "${name}"?`)) return;
   try {
     await fetch(`/api/presets/${name}`, { method: 'DELETE' });
     this.currentGeneratorPreset = null;
     this.generatorPresetStatus = `Deleted: ${name}`;
     await this.refreshGeneratorPresets();
     setTimeout(() => { this.generatorPresetStatus = ''; }, 3000);
   } catch (err) {
     this.generatorPresetStatus = `Error: ${err.message}`;
   }
 },

 // ─── Performance deck (crossfader, preview, session) ─────────────────
 sessionStorageKey() {
   return `defora_session_${this.session || 'default'}`;
 },
sessionStorageTouchedKey() {
  return `${this.sessionStorageKey()}__touchedAt`;
},
sessionRestoreDeclinedKey() {
  return `${this.sessionStorageKey()}__restoreDeclinedAt`;
},
hasSessionRestoreDeclined({ now = Date.now(), maxAgeMs = 24 * 60 * 60 * 1000 } = {}) {
  try {
    if (typeof window === 'undefined') return false;
    const storage = window.localStorage;
    if (!storage) return false;
    const raw = storage.getItem(this.sessionRestoreDeclinedKey());
    const declinedAt = raw != null ? Number(raw) : NaN;
    return Number.isFinite(declinedAt) && declinedAt > 0 && (now - declinedAt) <= maxAgeMs;
  } catch (_e) {
    return false;
  }
},
markSessionRestoreDeclined() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.sessionRestoreDeclinedKey(), String(Date.now()));
    }
  } catch (_e) {}
},
clearSessionRestoreDeclined() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.sessionRestoreDeclinedKey());
    }
  } catch (_e) {}
},
hasRecentSessionResumeToken({ now = Date.now(), maxAgeMs = 24 * 60 * 60 * 1000 } = {}) {
  try {
    if (typeof window === 'undefined') return false;
    const storage = window.localStorage;
    if (!storage) return false;
    const touchedRaw = storage.getItem(this.sessionStorageTouchedKey());
    const touchedAt = touchedRaw != null ? Number(touchedRaw) : NaN;
    const fresh = Number.isFinite(touchedAt) && touchedAt > 0 && (now - touchedAt) <= maxAgeMs;
    if (!fresh) return false;

    // "cookie or similar": accept either an actual cookie or our localStorage touch marker.
    // If a cookie exists, great; if not, the touch marker still counts as "similar".
    try {
      const cookie = (typeof document !== 'undefined' && document.cookie) ? String(document.cookie) : '';
      if (!cookie) return true;
      const sessionName = String(this.session || 'default');
      return cookie.includes('defora_session=') || cookie.includes(`defora_session_${sessionName}=`) || cookie.includes('defora=');
    } catch (_e) {
      return true;
    }
  } catch (_e) {
    return false;
  }
},
 loadSessionState() {
   try {
     const raw = window.localStorage && window.localStorage.getItem(this.sessionStorageKey());
    const sourceRaw = this.pendingSessionStateRaw || raw;
    if (!sourceRaw) return;
    const s = JSON.parse(sourceRaw);
    this.pendingSessionStateRaw = '';
    this.sessionDeforumSettingsLoaded = false;
     if (typeof s.crossfader === 'number') this.performance.crossfader = s.crossfader;
     if (typeof s.genericPrompt === 'string') this.performance.genericPrompt = s.genericPrompt;
     if (Array.isArray(s.slots)) this.performance.slots = s.slots;
     if (typeof s.showFrames === 'boolean') this.showFrames = s.showFrames;
     if (typeof s.liveBottomDrawerOpen === 'boolean') this.liveBottomDrawerOpen = s.liveBottomDrawerOpen;
     if (s.liveBottomDrawerTab === 'MODULATION' || s.liveBottomDrawerTab === 'CROSSFADER') this.liveBottomDrawerTab = s.liveBottomDrawerTab;
    if (s.currentSubTab && s.currentSubTab.LIVE) {
      this.currentSubTab.LIVE = this.normalizeLiveSubTab(s.currentSubTab.LIVE);
    }
    if (s.currentSubTab && s.currentSubTab.MOTION) {
      this.currentSubTab.MOTION = this.normalizeMotionSubTab(s.currentSubTab.MOTION);
    }
    if (Array.isArray(s.liveSources)) this.liveSources = s.liveSources;
    if (s.liveSourcePanel === 'library' || s.liveSourcePanel === 'cloud') this.liveSourcePanel = s.liveSourcePanel;
    if (typeof s.activeVideoLayerId === 'string') this.activeVideoLayerId = s.activeVideoLayerId;
    if (typeof s.videoLayerAddOpen === 'boolean') this.videoLayerAddOpen = s.videoLayerAddOpen;
    if (typeof s.inputLayerPlaybackUrl === 'string') this.inputLayerPlaybackUrl = s.inputLayerPlaybackUrl;
    if (typeof s.inputLayerLabel === 'string') this.inputLayerLabel = s.inputLayerLabel;
    if (s.videoStageSize === 'small' || s.videoStageSize === 'medium' || s.videoStageSize === 'full') {
      this.videoStageSize = s.videoStageSize;
    }
    if (typeof s.liveAnimationBoxOpen === 'boolean') this.liveAnimationBoxOpen = s.liveAnimationBoxOpen;
    if (s.cloudDriveDraft && typeof s.cloudDriveDraft === 'object') {
      this.cloudDriveDraft = {
        url: String(s.cloudDriveDraft.url || ''),
        provider: String(s.cloudDriveDraft.provider || 'google_drive'),
      };
    }
    if (s.systemFiles && typeof s.systemFiles === 'object') {
      this.systemFiles = {
        ...this.systemFiles,
        ...s.systemFiles,
        videos: [],
        loading: false,
        selectedPaths: Array.isArray(s.systemFiles.selectedPaths) ? s.systemFiles.selectedPaths : [],
        fullscreenIndex: -1,
      };
    }
    if (typeof s.libraryFullscreen === 'boolean') this.libraryFullscreen = s.libraryFullscreen;
    if (s.librarySubTab === 'RUNS' || s.librarySubTab === 'BROWSER') {
      this.librarySubTab = s.librarySubTab === 'RUNS' ? 'BROWSER' : s.librarySubTab;
    }
     if (typeof s.paramPanelOpen === 'boolean') this.paramPanelOpen = s.paramPanelOpen;
     if (typeof s.deforumPanelOpen === 'boolean') this.deforumPanelOpen = s.deforumPanelOpen;
    if (typeof s.deforumActiveTab === 'string') this.deforumActiveTab = s.deforumActiveTab;
     if (typeof s.generateDockExpanded === 'boolean') this.generateDockExpanded = s.generateDockExpanded;
    if (s.deforumFieldEnabled && typeof s.deforumFieldEnabled === 'object') {
      this.deforumFieldEnabled = createDeforumFieldEnabledMap(s.deforumFieldEnabled);
    } else {
      this.deforumFieldEnabled = createDeforumFieldEnabledMap();
    }
    if (typeof s.collabEnabled === 'boolean') {
      this.collabEnabled = s.collabEnabled;
      this.wsStatus = s.collabEnabled ? this.wsStatus : 'offline';
    }
    if (s.defaultAnimation && typeof s.defaultAnimation === 'object') {
      this.defaultAnimation = this.normalizeDefaultAnimationSettings(s.defaultAnimation);
    }
     if (s.deforumSettings && typeof s.deforumSettings === 'object') {
       this.deforumSettings = mergeDeforumSettings({ ...DEFORUM_DEFAULT_SETTINGS }, s.deforumSettings);
       this.syncResolutionAcrossControls(this.deforumSettings.W, this.deforumSettings.H, { syncGpuModal: false });
       this.syncStepsAcrossControls(this.deforumSettings.steps, { syncGpuModal: false });
       this.syncDeforumSettingsJson();
      this.sessionDeforumSettingsLoaded = true;
     }
     if (s.lastModel) {
       this.forge.lastModel = s.lastModel;
       this.forge.selectedModel = s.lastModel;
     }
     if (s.streaming && typeof s.streaming === 'object') {
       if (Array.isArray(s.streaming.destinations) && s.streaming.destinations.length) {
         this.streaming.destinations = s.streaming.destinations.map((dest, index) => ({
           id: dest && dest.id ? dest.id : `stream_saved_${index}`,
           name: String((dest && dest.name) || 'Custom Stream'),
           protocol: ['rtmp', 'srt', 'whip'].includes(dest && dest.protocol) ? dest.protocol : 'rtmp',
           target: String((dest && dest.target) || ''),
           fps: Number(dest && dest.fps) || 24,
           resolution: String((dest && dest.resolution) || '1024x576'),
           overlay: String((dest && dest.overlay) || ''),
           transition: String((dest && dest.transition) || ''),
         }));
       }
       if (typeof s.streaming.activeDestinationId === 'string' || s.streaming.activeDestinationId === null) {
         this.streaming.activeDestinationId = s.streaming.activeDestinationId;
       }
       if (typeof s.streaming.status === 'string') {
         this.streaming.status = s.streaming.status;
       }
     }
     if (s.prompts) Object.assign(this.prompts, s.prompts);
   } catch (_e) { /* ignore */ }
 },
 saveSessionState() {
   try {
     if (!window.localStorage) return;
     const blob = {
       crossfader: this.performance.crossfader,
       genericPrompt: this.performance.genericPrompt,
       slots: this.performance.slots,
      showFrames: this.showFrames,
      liveBottomDrawerOpen: this.liveBottomDrawerOpen,
      liveBottomDrawerTab: this.liveBottomDrawerTab,
      currentSubTab: { ...this.currentSubTab },
      liveSources: this.liveSources,
      liveSourcePanel: this.liveSourcePanel,
      activeVideoLayerId: this.activeVideoLayerId,
      videoLayerAddOpen: this.videoLayerAddOpen,
      inputLayerPlaybackUrl: this.inputLayerPlaybackUrl,
      inputLayerLabel: this.inputLayerLabel,
      videoStageSize: this.videoStageSize,
      liveAnimationBoxOpen: this.liveAnimationBoxOpen,
      cloudDriveDraft: { ...this.cloudDriveDraft },
      systemFiles: {
        rootId: this.systemFiles.rootId,
        recursive: this.systemFiles.recursive,
        showFilenames: this.systemFiles.showFilenames,
        sortKey: this.systemFiles.sortKey,
        zoomLevel: this.systemFiles.zoomLevel,
      },
      libraryFullscreen: this.libraryFullscreen,
      librarySubTab: this.librarySubTab,
       paramPanelOpen: this.paramPanelOpen,
       deforumPanelOpen: this.deforumPanelOpen,
      deforumActiveTab: this.deforumActiveTab,
      deforumFieldEnabled: createDeforumFieldEnabledMap(this.deforumFieldEnabled),
      generateDockExpanded: this.generateDockExpanded,
      collabEnabled: this.collabEnabled,
      streaming: {
        destinations: this.streaming.destinations,
        activeDestinationId: this.streaming.activeDestinationId,
        status: this.streaming.status,
      },
      defaultAnimation: this.normalizeDefaultAnimationSettings(this.defaultAnimation),
      deforumSettings: this.normalizedDeforumSettings(),
       lastModel: this.forge.lastModel || this.forge.currentModel || this.forge.selectedModel,
       prompts: { pos: this.prompts.pos, neg: this.prompts.neg },
     };
     window.localStorage.setItem(this.sessionStorageKey(), JSON.stringify(blob));
    window.localStorage.setItem(this.sessionStorageTouchedKey(), String(Date.now()));
   } catch (_e) { /* ignore */ }
 },
getCurrentSessionSnapshotRaw() {
  try {
    if (typeof window === 'undefined') return '';
    if (!window.localStorage) return '';
    // mirror saveSessionState payload
    const blob = {
      crossfader: this.performance.crossfader,
      genericPrompt: this.performance.genericPrompt,
      slots: this.performance.slots,
      showFrames: this.showFrames,
      liveBottomDrawerOpen: this.liveBottomDrawerOpen,
      liveBottomDrawerTab: this.liveBottomDrawerTab,
      currentSubTab: { ...this.currentSubTab },
      liveSources: this.liveSources,
      liveSourcePanel: this.liveSourcePanel,
      activeVideoLayerId: this.activeVideoLayerId,
      videoLayerAddOpen: this.videoLayerAddOpen,
      inputLayerPlaybackUrl: this.inputLayerPlaybackUrl,
      inputLayerLabel: this.inputLayerLabel,
      videoStageSize: this.videoStageSize,
      liveAnimationBoxOpen: this.liveAnimationBoxOpen,
      cloudDriveDraft: { ...this.cloudDriveDraft },
      systemFiles: {
        rootId: this.systemFiles.rootId,
        recursive: this.systemFiles.recursive,
        showFilenames: this.systemFiles.showFilenames,
        sortKey: this.systemFiles.sortKey,
        zoomLevel: this.systemFiles.zoomLevel,
      },
      libraryFullscreen: this.libraryFullscreen,
      librarySubTab: this.librarySubTab,
      paramPanelOpen: this.paramPanelOpen,
      deforumPanelOpen: this.deforumPanelOpen,
      deforumActiveTab: this.deforumActiveTab,
      deforumFieldEnabled: createDeforumFieldEnabledMap(this.deforumFieldEnabled),
      generateDockExpanded: this.generateDockExpanded,
      collabEnabled: this.collabEnabled,
      streaming: {
        destinations: this.streaming.destinations,
        activeDestinationId: this.streaming.activeDestinationId,
        status: this.streaming.status,
      },
      defaultAnimation: this.normalizeDefaultAnimationSettings(this.defaultAnimation),
      deforumSettings: this.normalizedDeforumSettings(),
      lastModel: this.forge.lastModel || this.forge.currentModel || this.forge.selectedModel,
      prompts: { pos: this.prompts.pos, neg: this.prompts.neg },
    };
    return JSON.stringify(blob);
  } catch (_e) {
    return '';
  }
},
checkAndPromptSessionRestore() {
  try {
    if (typeof window === 'undefined') return false;
    const storage = window.localStorage;
    if (!storage) return false;
    const savedRaw = storage.getItem(this.sessionStorageKey());
    if (!savedRaw) return false;

    // Only offer session continuation if we have a recent "resume token" (cookie or similar)
    // and the saved session is not older than 24h.
    if (!this.hasRecentSessionResumeToken()) {
      // Stale or no token: don't restore, don't prompt.
      try {
        storage.removeItem(this.sessionStorageKey());
        storage.removeItem(this.sessionStorageTouchedKey());
        storage.removeItem(this.sessionRestoreDeclinedKey());
      } catch (_e) {}
      return true;
    }

    if (this.hasSessionRestoreDeclined()) {
      return false;
    }

    const currentRaw = this.getCurrentSessionSnapshotRaw();
    if (!currentRaw) return false;
    // If it differs, prompt instead of auto-restoring.
    if (savedRaw !== currentRaw) {
      this.pendingSessionStateRaw = savedRaw;
      this.restoreSessionPromptOpen = true;
      return true;
    }
    return false;
  } catch (_e) {
    return false;
  }
},
dismissSessionRestore(shouldRestore) {
  try {
    this.restoreSessionPromptOpen = false;
    if (shouldRestore) {
      this.clearSessionRestoreDeclined();
      // Apply saved state
      this.loadSessionState();
    } else {
      // Remember decline so we don't prompt again for this session window.
      this.markSessionRestoreDeclined();
      // Overwrite saved state with current, so we won't prompt again.
      this.saveSessionState();
    }
  } catch (_e) {
    this.restoreSessionPromptOpen = false;
  }
},
normalizedDeforumSettings() {
  return mergeDeforumSettings({ ...DEFORUM_DEFAULT_SETTINGS }, this.deforumSettings || {});
},
currentResolution({ fallbackWidth = 1024, fallbackHeight = 576 } = {}) {
  const width = Number(this.deforumSettings && this.deforumSettings.W)
    || Number(this.forge && this.forge.options && this.forge.options.width)
    || Number(this.img2img && this.img2img.width)
    || Number((this.generator && this.generator.resolution ? this.generator.resolution : '').split('x')[0])
    || fallbackWidth;
  const height = Number(this.deforumSettings && this.deforumSettings.H)
    || Number(this.forge && this.forge.options && this.forge.options.height)
    || Number(this.img2img && this.img2img.height)
    || Number((this.generator && this.generator.resolution ? this.generator.resolution : '').split('x')[1])
    || fallbackHeight;
  return { width, height };
},
syncResolutionAcrossControls(rawWidth, rawHeight, {
  syncDeforum = true,
  syncForge = true,
  syncImg2img = true,
  syncGenerator = true,
  syncGpuModal = true,
} = {}) {
  const fallback = this.currentResolution();
  const width = Math.max(64, Math.round(Number(rawWidth) || fallback.width || 1024));
  const height = Math.max(64, Math.round(Number(rawHeight) || fallback.height || 576));
  if (syncDeforum) {
    this.deforumSettings = this.normalizedDeforumSettings();
    this.deforumSettings.W = width;
    this.deforumSettings.H = height;
  }
  if (syncForge) {
    this.forge.options.width = width;
    this.forge.options.height = height;
  }
  if (syncImg2img) {
    this.img2img.width = width;
    this.img2img.height = height;
  }
  if (syncGenerator) {
    this.generator.resolution = `${width}x${height}`;
  }
  if (syncGpuModal && this.gpuPool && this.gpuPool.forgeModal && this.gpuPool.forgeModal.options) {
    this.gpuPool.forgeModal.options.width = width;
    this.gpuPool.forgeModal.options.height = height;
  }
  return { width, height };
},
currentStepsValue(fallbackSteps = 6) {
  const direct = Number(this.deforumSettings && this.deforumSettings.steps);
  if (Number.isFinite(direct) && direct > 0) return Math.max(1, Math.round(direct));
  const scheduled = Math.round(this.readFirstNumericValue(
    (this.deforumSettings && this.deforumSettings.steps_schedule) || '',
    Number(this.forge && this.forge.options && this.forge.options.steps)
      || Number(this.gpuPool && this.gpuPool.forgeModal && this.gpuPool.forgeModal.options && this.gpuPool.forgeModal.options.steps)
      || fallbackSteps
  ));
  return Math.max(1, scheduled || fallbackSteps);
},
syncStepsAcrossControls(rawSteps, {
  syncDeforum = true,
  syncForge = true,
  syncGpuModal = true,
  syncSchedule = true,
} = {}) {
  const next = Math.max(1, Math.round(Number(rawSteps) || this.currentStepsValue()));
  if (syncDeforum) {
    this.deforumSettings = this.normalizedDeforumSettings();
    this.deforumSettings.steps = next;
    if (syncSchedule) {
      this.deforumSettings.steps_schedule = `0: (${next})`;
    }
  }
  if (syncForge) {
    this.forge.options.steps = next;
  }
  if (syncGpuModal && this.gpuPool && this.gpuPool.forgeModal && this.gpuPool.forgeModal.options) {
    this.gpuPool.forgeModal.options.steps = next;
  }
  return next;
},
syncFpsAcrossControls(rawFps, {
  syncDeforum = true,
  syncSequencer = true,
  syncGenerator = true,
  syncStreaming = true,
  syncFramesync = true,
} = {}) {
  const fallback =
    Number(this.deforumSettings && this.deforumSettings.fps)
    || Number(this.sequencer && this.sequencer.fps)
    || Number(this.generator && this.generator.fps)
    || Number(this.framesync && this.framesync.fps)
    || 24;
  const next = Math.max(1, Math.min(120, Math.round(Number(rawFps) || fallback || 24)));
  if (syncDeforum) {
    this.deforumSettings = this.normalizedDeforumSettings();
    this.deforumSettings.fps = next;
  }
  if (syncSequencer && this.sequencer) {
    this.sequencer.fps = next;
  }
  if (syncGenerator && this.generator) {
    this.generator.fps = next;
  }
  if (syncFramesync && this.framesync) {
    this.framesync.fps = next;
  }
  if (syncStreaming && this.streaming && Array.isArray(this.streaming.destinations)) {
    this.streaming.destinations = this.streaming.destinations.map((dest) => ({
      ...(dest || {}),
      fps: next,
    }));
  }
  return next;
},
setGlobalFps(rawFps, { source = 'ui' } = {}) {
  if (this._syncingGlobalFps) return;
  this._syncingGlobalFps = true;
  try {
    const next = this.syncFpsAcrossControls(rawFps);
    // Persist + push to live patch (Deforum)
    this.onDeforumFieldInput('fps', next, 'number');
    if (source !== 'deforum') {
      // onDeforumFieldInput already saved, but non-deforum sources might skip if the value was identical.
      this.saveSessionState();
    }
    return next;
  } finally {
    this._syncingGlobalFps = false;
  }
},
normalizeModelName(name) {
  const normalized = typeof name === 'string' ? name.trim() : '';
  if (!normalized || normalized.toLowerCase() === 'unknown') return '';
  return normalized;
},
detectModelFamilyFromText(rawValue) {
  const value = String(rawValue || '').toLowerCase();
  if (!value) return '';
  if (/\bz[-_. ]?image\b|zimage/.test(value)) return 'zimage';
  if (/\bflux\b|flux\.1/.test(value)) return 'flux';
  if (/(?:^|[^a-z0-9])svd(?:[^a-z0-9]|$)|stable video diffusion|\bvideo\b/.test(value)) return 'svd';
  if (/(?:^|[^a-z0-9])sdxl(?:[^a-z0-9]|$)|stable diffusion xl|\bpony\b|illustrious|\bxl\b/.test(value)) return 'sdxl';
  if (/\bsd(?:\s|[-_.])?1(?:\s|[-_.])?5\b|(?:^|[^a-z0-9])sd15(?:[^a-z0-9]|$)|stable diffusion 1\.5|\bv1[-_. ]?5\b|\b1\.5\b/.test(value)) return 'sd15';
  return '';
},
detectModelFamilyFromValue(metadata, fallbackText = '') {
  const values = [];
  if (metadata && typeof metadata === 'object') {
    values.push(
      metadata.base_model,
      metadata.architecture,
      metadata.model_type,
      metadata.type,
      metadata.pipeline,
      metadata.variant,
      metadata.name
    );
  }
  values.push(fallbackText);
  for (const value of values) {
    const family = this.detectModelFamilyFromText(value);
    if (family) return family;
  }
  return '';
},
detectLoraFamily(loraLike) {
  const family = this.detectModelFamilyFromValue(
    loraLike && loraLike.metadata,
    `${loraLike && loraLike.name ? loraLike.name : ''} ${loraLike && loraLike.path ? loraLike.path : ''}`
  );
  return family || 'sd15';
},
findForgeModelEntry(modelName) {
  const normalized = this.normalizeModelName(modelName);
  if (!normalized) return null;
  return (this.forge.models || []).find((model) => {
    const candidates = [model && model.model_name, model && model.title]
      .map((value) => this.normalizeModelName(value))
      .filter(Boolean);
    return candidates.includes(normalized);
  }) || null;
},
readFirstNumericValue(rawValue, fallback = 0) {
  const match = String(rawValue ?? '').match(/-?\d+(?:\.\d+)?/);
  if (!match) return fallback;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : fallback;
},
optimizedDefaultsForModel(modelLike) {
  const matched = typeof modelLike === 'string' ? this.findForgeModelEntry(modelLike) : modelLike;
  const modelName = this.normalizeModelName(
    (matched && (matched.model_name || matched.title || matched.name))
    || (typeof modelLike === 'string' ? modelLike : (modelLike && (modelLike.model_name || modelLike.title || modelLike.name)))
    || this.engineCurrentModelName
  );
  const metadata = (matched && matched.metadata) || (modelLike && modelLike.metadata) || this.forge.modelInfo || null;
  if (!metadata && !modelName) return null;
  const family = this.detectModelFamilyFromValue(metadata, modelName);
  const profileText = [
    metadata && metadata.variant,
    metadata && metadata.type,
    metadata && metadata.pipeline,
    metadata && metadata.architecture,
    metadata && metadata.base_model,
    metadata && metadata.name,
    modelName,
  ].filter(Boolean).join(' ').toLowerCase();
  const familyLabel = { sd15: 'SD1.5', sdxl: 'SDXL', flux: 'FLUX', zimage: 'Z-Image', svd: 'SVD' }[family] || 'Generic';
  const isTurboLike = /(turbo|lightning|lcm|hyper|distill|schnell)/.test(profileText);
  const isFluxDev = family === 'flux' && /\bdev\b/.test(profileText);
  const baseResolution = Number(metadata && metadata.base_resolution) || (family === 'sd15' ? 512 : 1024);
  const currentSampler = this.deforumSettings && this.deforumSettings.sampler
    ? this.deforumSettings.sampler
    : ((this.forge.options && this.forge.options.sampler_name) || 'Euler a');
  const currentScheduler = this.deforumSettings && this.deforumSettings.scheduler
    ? this.deforumSettings.scheduler
    : ((this.forge.options && this.forge.options.scheduler) || 'Normal');
  let profileLabel = familyLabel;
  let steps = Number(metadata && metadata.recommended_steps);
  let cfgScale = Number(metadata && metadata.recommended_cfg_scale);
  let strength = Number(metadata && metadata.recommended_strength);
  let sampler = (metadata && metadata.recommended_sampler) || currentSampler;
  const scheduler = (metadata && metadata.recommended_scheduler) || currentScheduler;
  if (!Number.isFinite(steps)) {
    if (isTurboLike) steps = family === 'flux' ? 4 : 4;
    else if (family === 'flux') steps = isFluxDev ? 20 : 8;
    else if (family === 'svd') steps = 25;
    else if (family === 'sdxl') steps = 30;
    else if (family === 'sd15') steps = 24;
    else steps = 24;
  }
  if (!Number.isFinite(cfgScale)) {
    if (isTurboLike) cfgScale = family === 'flux' ? 1.0 : 1.5;
    else if (family === 'flux') cfgScale = isFluxDev ? 3.5 : 1.0;
    else if (family === 'svd') cfgScale = 2.5;
    else if (family === 'sdxl') cfgScale = 6.5;
    else if (family === 'sd15') cfgScale = 7.0;
    else cfgScale = 6.0;
  }
  if (!Number.isFinite(strength)) {
    if (isTurboLike) strength = 0.4;
    else if (family === 'flux') strength = 0.5;
    else if (family === 'sdxl') strength = 0.55;
    else strength = 0.65;
  }
  if (isTurboLike) profileLabel = `${familyLabel} fast`;
  else if (family === 'flux' && isFluxDev) profileLabel = 'FLUX dev';
  else if (family === 'flux') profileLabel = 'FLUX schnell';
  return {
    width: baseResolution >= 1024 ? 1024 : 512,
    height: baseResolution >= 1024 ? 1024 : 512,
    steps,
    sampler,
    scheduler,
    cfgScale,
    strength,
    profileLabel,
  };
},
applyModelOptimizedDefaults(modelLike) {
  const defaults = this.optimizedDefaultsForModel(modelLike);
  if (!defaults) return false;
  this.deforumSettings = this.normalizedDeforumSettings();
  this.deforumSettings.W = defaults.width;
  this.deforumSettings.H = defaults.height;
  this.deforumSettings.sampler = defaults.sampler;
  this.deforumSettings.scheduler = defaults.scheduler;
  this.deforumSettings.cfg_scale_schedule = `0:(${defaults.cfgScale})`;
  this.deforumSettings.distilled_cfg_scale_schedule = `0: (${defaults.cfgScale})`;
  this.deforumSettings.strength_schedule = `0: (${defaults.strength})`;
  this.deforumSettings.keyframe_strength_schedule = `0: (${defaults.strength})`;
  this.forge.options.width = defaults.width;
  this.forge.options.height = defaults.height;
  this.forge.options.sampler_name = defaults.sampler;
  this.forge.options.scheduler = defaults.scheduler;
  this.forge.options.cfg_scale = defaults.cfgScale;
  this.syncStepsAcrossControls(defaults.steps, { syncGpuModal: true });
  const cfgParam = this.liveVibe.find((param) => param.key === 'cfgscale') || this.liveVibe.find((param) => param.key === 'cfg');
  if (cfgParam) cfgParam.val = defaults.cfgScale;
  const strengthParam = this.liveVibe.find((param) => param.key === 'strength');
  if (strengthParam) strengthParam.val = defaults.strength;
  this.syncDeforumSettingsJson();
  this.deforumSettingsStatus = `${this.normalizeModelName(this.forge.selectedModel || this.forge.currentModel)} optimized for ${defaults.profileLabel}`;
  return true;
},
applyLoadedModelSelection(modelName, { syncDeforumSettings = true, queueDeforumSave = false, saveSession = true } = {}) {
  const normalized = this.normalizeModelName(modelName);
  if (!normalized) return '';
  this.forge.currentModel = normalized;
  this.forge.selectedModel = normalized;
  this.forge.lastModel = normalized;
  const matchedModel = this.findForgeModelEntry(normalized);
  if (matchedModel && matchedModel.metadata) {
    this.forge.modelInfo = matchedModel.metadata;
  }
  if (syncDeforumSettings && this.deforumSettings && this.deforumSettings.sd_model_name !== normalized) {
    this.deforumSettings.sd_model_name = normalized;
    this.syncDeforumSettingsJson();
    if (queueDeforumSave) this.queueDeforumSettingsSave();
  }
  if (saveSession) this.saveSessionState();
  return normalized;
},
syncSelectedModelFromDeforumSettings() {
  const desired = this.normalizeModelName(this.deforumSettings && this.deforumSettings.sd_model_name);
  if (desired) this.forge.selectedModel = desired;
  return desired;
},
 restoreLastModel() {
  const name = this.syncSelectedModelFromDeforumSettings() || this.normalizeModelName(this.forge.lastModel) || this.normalizeModelName(this.forge.selectedModel);
  if (!name || this.forge.switching) return false;
  if (this.normalizeModelName(this.forge.currentModel) === name) {
    this.applyLoadedModelSelection(name, { queueDeforumSave: false });
    return true;
  }
   this.forge.selectedModel = name;
  return this.switchForgeModel(name, { persistDeforumSettings: false });
 },
async onModelSelectChange() {
  await this.switchForgeModel(this.forge.selectedModel, {
    persistDeforumSettings: true,
    applyOptimizedDefaults: true,
  });
   this.saveSessionState();
 },
openEngineModelPicker() {
  const family = this.engineCurrentModelFamily;
  const allowed = ['sd15', 'sdxl', 'flux', 'zimage', 'other'];
  this.engineModelPickerTab = allowed.includes(family) ? family : 'other';
  this.engineModelPickerOpen = true;
  if (!this.forge.models.length && !this.forge.loading) {
    this.refreshForgeModels();
  }
},
closeEngineModelPicker() {
  this.engineModelPickerOpen = false;
},
setEngineModelPickerTab(tab) {
  const allowed = ['sd15', 'sdxl', 'flux', 'zimage', 'other'];
  if (!allowed.includes(tab)) return;
  this.engineModelPickerTab = tab;
},
async selectEngineModel(model) {
  const name = this.normalizeModelName(model && (model.model_name || model.title));
  if (!name) return;
  await this.onDeforumModelCommit(name);
  this.closeEngineModelPicker();
},
async onDeforumModelCommit(rawValue) {
  const nextModel = this.normalizeModelName(rawValue != null ? rawValue : this.deforumSettings && this.deforumSettings.sd_model_name);
  if (!nextModel) return;
  if (this.deforumSettings && this.deforumSettings.sd_model_name !== nextModel) {
    this.deforumSettings.sd_model_name = nextModel;
    this.syncDeforumSettingsJson();
  }
  this.forge.selectedModel = nextModel;
  const switched = await this.switchForgeModel(nextModel, {
    persistDeforumSettings: true,
    applyOptimizedDefaults: true,
  });
  if (!switched && this.forge.currentModel) {
    this.applyLoadedModelSelection(this.forge.currentModel, { queueDeforumSave: true });
  }
},
onEngineSamplerChange(rawValue) {
  const next = String(rawValue || '').trim();
  if (!next) return;
  this.deforumSettings = this.normalizedDeforumSettings();
  this.deforumSettings.sampler = next;
  this.forge.options.sampler_name = next;
  this.syncDeforumSettingsJson();
  this.saveSessionState();
  this.pushDeforumLivePatch('sampler', next);
  this.queueDeforumSettingsSave();
  if (!this.deforumPlaying) this.scheduleDeforumPreview();
},
onEngineSchedulerChange(rawValue) {
  const next = String(rawValue || '').trim();
  if (!next) return;
  this.deforumSettings = this.normalizedDeforumSettings();
  this.deforumSettings.scheduler = next;
  this.forge.options.scheduler = next;
  this.syncDeforumSettingsJson();
  this.saveSessionState();
  this.pushDeforumLivePatch('scheduler', next);
  this.queueDeforumSettingsSave();
  if (!this.deforumPlaying) this.scheduleDeforumPreview();
},
onEngineStepsChange(rawValue) {
  const next = this.syncStepsAcrossControls(rawValue, { syncGpuModal: true });
  this.syncDeforumSettingsJson();
  this.saveSessionState();
  this.pushDeforumLivePatch('steps', next);
  this.pushDeforumLivePatch('steps_schedule', this.deforumSettings.steps_schedule);
  this.queueDeforumSettingsSave();
  if (!this.deforumPlaying) this.scheduleDeforumPreview();
},
onEngineCfgScaleChange(rawValue) {
  const next = Number(rawValue);
  if (!Number.isFinite(next) || next < 0) return;
  this.deforumSettings = this.normalizedDeforumSettings();
  this.deforumSettings.cfg_scale_schedule = `0:(${next})`;
  this.deforumSettings.distilled_cfg_scale_schedule = `0: (${next})`;
  this.forge.options.cfg_scale = next;
  const cfgParam = this.liveVibe.find((param) => param.key === 'cfgscale') || this.liveVibe.find((param) => param.key === 'cfg');
  if (cfgParam) cfgParam.val = next;
  this.syncDeforumSettingsJson();
  this.saveSessionState();
  this.pushDeforumLivePatch('cfg_scale_schedule', this.deforumSettings.cfg_scale_schedule);
  this.pushDeforumLivePatch('distilled_cfg_scale_schedule', this.deforumSettings.distilled_cfg_scale_schedule);
  this.queueDeforumSettingsSave();
  if (!this.deforumPlaying) this.scheduleDeforumPreview();
},
reapplyEngineModelDefaults() {
  const modelName = this.engineCurrentModelName;
  if (!modelName) return false;
  const applied = this.applyModelOptimizedDefaults(modelName);
  if (applied) {
    this.saveSessionState();
    this.queueDeforumSettingsSave();
    if (!this.deforumPlaying) this.scheduleDeforumPreview();
  }
  return applied;
},
 slotTypeLabel(type) {
   const t = this.crossfadeSlotTypes.find((x) => x.id === type);
   return t ? t.label : type;
 },
 newSlotId() {
   return `slot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
 },
 addCrossfadeSlot() {
   const type = this.performance.newSlotType || 'prompt';
   const slot = {
     id: this.newSlotId(),
     type,
     valueA: type === 'param' ? 0 : (type === 'prompt' ? '' : null),
     valueB: type === 'param' ? 0 : (type === 'prompt' ? '' : null),
     paramKey: 'cfg',
     loraStrengthA: 1,
     loraStrengthB: 1,
     cnSlotId: this.cn.active || 'CN1',
   };
   this.performance.slots.push(slot);
   this.applyCrossfadeMorph();
   this.saveSessionState();
 },
 removeCrossfadeSlot(id) {
   this.performance.slots = this.performance.slots.filter((s) => s.id !== id);
   this.applyCrossfadeMorph();
   this.saveSessionState();
 },
 slotMorphedPreview(slot) {
   return morphSlotValue(this.normalizeSlotForMorph(slot), this.performance.crossfader);
 },
 formatMorphedPreview(slot) {
   const v = this.slotMorphedPreview(slot);
   if (v == null) return '—';
   if (typeof v === 'object') return JSON.stringify(v);
   if (typeof v === 'number') return Number(v).toFixed(3);
   const s = String(v);
   return s.length > 48 ? s.slice(0, 48) + '…' : s;
 },
 normalizeSlotForMorph(slot) {
   if (slot.type === 'lora') {
     const pack = (name, str) => (name ? { name, strength: Number(str) || 1 } : null);
     return {
       ...slot,
       valueA: pack(slot.valueA, slot.loraStrengthA),
       valueB: pack(slot.valueB, slot.loraStrengthB),
     };
   }
   if (slot.type === 'controlnet') {
     const pack = (weight) => ({
       slotId: slot.cnSlotId,
       weight: Number(weight),
       start: 0,
       end: 0.9,
       enabled: true,
     });
     return {
       ...slot,
       valueA: slot.valueA != null && slot.valueA !== '' ? pack(slot.valueA) : null,
       valueB: slot.valueB != null && slot.valueB !== '' ? pack(slot.valueB) : null,
     };
   }
   if (slot.type === 'param') {
     return { ...slot, valueA: slot.valueA, valueB: slot.valueB };
   }
   return slot;
 },
 buildMorphedPrompt() {
   const parts = [];
   const base = (this.performance.genericPrompt || '').trim();
   if (base) parts.push(base);
   for (const slot of this.performance.slots) {
     if (slot.type !== 'prompt') continue;
     const m = morphSlotValue(this.normalizeSlotForMorph(slot), this.performance.crossfader);
     if (m) parts.push(String(m));
   }
   const merged = parts.join(', ').trim();
   if (merged) return merged;
   return (this.prompts.pos || '').trim();
 },
 applyCrossfadeMorph() {
   const t = this.performance.crossfader;
   const live = {};
   const loraA = [];
   const loraB = [];
   for (const slot of this.performance.slots) {
     const norm = this.normalizeSlotForMorph(slot);
     const v = morphSlotValue(norm, t);
     if (v == null) continue;
     if (slot.type === 'prompt') continue;
     if (slot.type === 'param' && slot.paramKey) {
       const anim = this.animationTargets.find((t) => t.key === slot.paramKey);
       if (anim) {
         this.applyAnimationModulation(anim.field, v);
       } else {
         live[slot.paramKey] = v;
         const p = this.liveVibe.find((x) => x.key === slot.paramKey) || this.liveCam.find((x) => x.key === slot.paramKey);
         if (p) p.val = v;
       }
     } else if (slot.type === 'lora' && v && v.name) {
       const entry = { name: v.name, path: v.name, strength: v.strength ?? 1 };
       if (smoothstep(t) < 0.5) loraA.push(entry);
       else loraB.push(entry);
     } else if (slot.type === 'controlnet' && v) {
       const cnSlot = this.cn.slots.find((s) => s.id === v.slotId);
       if (cnSlot) {
         cnSlot.weight = v.weight;
         cnSlot.start = v.start;
         cnSlot.end = v.end;
         cnSlot.enabled = v.enabled;
         this.updateControlNet(cnSlot);
       }
     }
   }
   const positive = this.buildMorphedPrompt();
   const negative = (this.prompts.neg || '').trim();
   this.prompts.pos = positive;
   this.sendControl('prompt', { positive, negative });
   if (Object.keys(live).length) this.sendControl('liveParam', live);
  if (this.loras.common.length || loraA.length || loraB.length) {
     this.sendControl('loras', {
      common: this.loras.common.map((lora) => ({
        name: lora.name,
        path: lora.path,
        strength: lora.strength,
      })),
       groupA: loraA,
       groupB: loraB,
       crossfaderValue: t,
     });
   }
   this.prompts.crossfaderValue = t;
 },
 onCrossfaderInput() {
   this.applyCrossfadeMorph();
   this.saveSessionState();
   if (!this.deforumPlaying) this.schedulePreviewFrame();
 },
 onPerformanceInput() {
   this.applyCrossfadeMorph();
   this.saveSessionState();
  this.queuePromptHistorySave(this.performance.genericPrompt);
   if (!this.deforumPlaying) this.schedulePreviewFrame();
 },
promptHistoryKey() {
  return `defora_prompt_history_${this.session || 'default'}`;
},
initPromptHistory() {
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.speechPromptSupported = !!SpeechRecognition;
  } catch (_e) {
    this.speechPromptSupported = false;
  }
  try {
    const raw = window.localStorage && window.localStorage.getItem(this.promptHistoryKey());
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      this.promptHistory = data.filter((x) => typeof x === 'string' && x.trim()).slice(0, 50);
    }
  } catch (_e) { /* ignore */ }
},
savePromptHistory() {
  try {
    if (!window.localStorage) return;
    window.localStorage.setItem(this.promptHistoryKey(), JSON.stringify(this.promptHistory.slice(0, 50)));
  } catch (_e) { /* ignore */ }
},
queuePromptHistorySave(rawPrompt) {
  const s = String(rawPrompt || '').trim();
  if (!s) return;
  clearTimeout(this.promptHistoryDebounceTimer);
  this.promptHistoryDebounceTimer = setTimeout(() => {
    this.addPromptToHistory(s);
  }, 650);
},
addPromptToHistory(prompt) {
  const s = String(prompt || '').trim();
  if (!s) return;
  const next = [s, ...this.promptHistory.filter((p) => p !== s)];
  this.promptHistory = next.slice(0, 50);
  this.savePromptHistory();
},
togglePromptHistory(force) {
  const next = typeof force === 'boolean' ? force : !this.promptHistoryOpen;
  this.promptHistoryOpen = next;
  if (next) {
    // refresh from storage in case multiple tabs
    this.initPromptHistory();
  }
},
restorePromptFromHistory(prompt) {
  const s = String(prompt || '').trim();
  if (!s) return;
  this.performance.genericPrompt = s;
  this.onPerformanceInput();
  this.promptHistoryOpen = false;
},
clearGenericPrompt() {
  this.performance.genericPrompt = '';
  this.speechPromptError = '';
  this.onPerformanceInput();
},
toggleSpeechPrompt() {
  if (this.speechPromptListening) {
    this.stopSpeechPrompt();
  } else {
    this.startSpeechPrompt();
  }
},
startSpeechPrompt() {
  this.speechPromptError = '';
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    this.speechPromptSupported = false;
    this.speechPromptError = 'Microphone input not supported in this browser.';
    return;
  }
  try {
    if (this._speechPromptRecognizer) {
      try { this._speechPromptRecognizer.abort(); } catch (_e) {}
    }
    const r = new SpeechRecognition();
    this._speechPromptRecognizer = r;
    r.lang = (navigator && navigator.language) ? navigator.language : 'en-US';
    r.interimResults = true;
    r.continuous = false;
    let finalText = '';
    r.onstart = () => {
      this.speechPromptListening = true;
    };
    r.onerror = (evt) => {
      const code = evt && evt.error ? String(evt.error) : 'error';
      this.speechPromptError = code === 'not-allowed'
        ? 'Microphone permission denied.'
        : `Speech error: ${code}`;
      this.speechPromptListening = false;
    };
    r.onend = () => {
      this.speechPromptListening = false;
      if (finalText.trim()) {
        const base = String(this.performance.genericPrompt || '').trim();
        const merged = base ? `${base}, ${finalText.trim()}` : finalText.trim();
        this.performance.genericPrompt = merged;
        this.onPerformanceInput();
        this.addPromptToHistory(merged);
      }
    };
    r.onresult = (evt) => {
      try {
        const res = evt && evt.results ? evt.results : [];
        let acc = '';
        for (let i = evt.resultIndex || 0; i < res.length; i++) {
          const item = res[i];
          const alt = item && item[0] ? item[0] : null;
          if (!alt) continue;
          acc += String(alt.transcript || '');
          if (item.isFinal) finalText += String(alt.transcript || '');
        }
        // Show interim in the input (without committing to history yet)
        const base = String(this.performance.genericPrompt || '').trim();
        const interim = acc.trim();
        if (interim) {
          this.performance.genericPrompt = base ? `${base}, ${interim}` : interim;
        }
      } catch (_e) {}
    };
    r.start();
  } catch (e) {
    this.speechPromptError = String(e.message || e);
    this.speechPromptListening = false;
  }
},
stopSpeechPrompt() {
  try {
    if (this._speechPromptRecognizer) {
      try { this._speechPromptRecognizer.stop(); } catch (_e) {}
    }
  } catch (_e) {}
  this.speechPromptListening = false;
},
queuePreviewRequest(kind, delay) {
  if (this.deforumPlaying) return;
  const nextKind = kind === 'deforum' ? 'deforum' : 'auto';
  this.previewQueuedKind = nextKind;
  clearTimeout(this.previewDebounceTimer);
  clearTimeout(this.deforumPreviewTimer);
  if (this.previewGenerating) return;
  const timerKey = nextKind === 'deforum' ? 'deforumPreviewTimer' : 'previewDebounceTimer';
  this[timerKey] = setTimeout(async () => {
    this[timerKey] = null;
    const queuedKind = this.previewQueuedKind;
    this.previewQueuedKind = null;
    if (queuedKind === 'deforum') {
      await this.generateDeforumPreviewFrame();
      this.flushQueuedPreview();
    } else {
      await this.generatePreviewFrame();
    }
  }, delay);
},
flushQueuedPreview() {
  if (this.deforumPlaying || this.previewGenerating || !this.previewQueuedKind) return;
  const queuedKind = this.previewQueuedKind;
  this.previewQueuedKind = null;
  clearTimeout(this.previewDebounceTimer);
  clearTimeout(this.deforumPreviewTimer);
  const timerKey = queuedKind === 'deforum' ? 'deforumPreviewTimer' : 'previewDebounceTimer';
  this[timerKey] = setTimeout(async () => {
    this[timerKey] = null;
    if (queuedKind === 'deforum') {
      await this.generateDeforumPreviewFrame();
      this.flushQueuedPreview();
    } else {
      await this.generatePreviewFrame();
    }
  }, 0);
},
 schedulePreviewFrame() {
  this.queuePreviewRequest('auto', 180);
 },
 scheduleDeforumPreview() {
  this.queuePreviewRequest('deforum', 300);
 },
 getDeforumField(keyPath) {
   return getNestedValue(this.deforumSettings, keyPath);
 },
formatDeforumFieldValue(field, rawValue) {
  if (!field) return String(rawValue ?? '');
  const value = rawValue == null ? '' : rawValue;
  if (field.type === 'slider' || field.type === 'number') {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '';
    const stepText = String(field.step ?? '');
    const decimals = stepText.includes('.') ? stepText.split('.')[1].length : 0;
    return numeric.toFixed(decimals);
  }
  return String(value);
},
deforumFieldOptions(field) {
  if (!field) return [];
  if (field.key === 'sampler') return this.engineSamplerOptions;
  if (field.key === 'scheduler') return this.engineSchedulerOptions;
  return Array.isArray(field.options) ? field.options : [];
},
isDeforumDynamicSelect(field) {
  return !!(field && (field.key === 'sampler' || field.key === 'scheduler'));
},
deforumToggleKeyForPath(keyPath) {
  return DEFORUM_DERIVED_TOGGLE_KEYS[keyPath] || keyPath;
},
isDeforumFieldToggleable(keyPath) {
  const toggleKey = this.deforumToggleKeyForPath(keyPath);
  return DEFORUM_FIELD_KEYS.includes(toggleKey);
},
isDeforumFieldEnabled(keyPath) {
  if (String(keyPath || '').startsWith('cn_')) return false;
  if (!this.isDeforumFieldToggleable(keyPath)) return true;
  const toggleKey = this.deforumToggleKeyForPath(keyPath);
  return this.deforumFieldEnabled[toggleKey] !== false;
},
setDeforumFieldEnabled(keyPath, enabled) {
  if (String(keyPath || '').startsWith('cn_')) return;
  const toggleKey = this.deforumToggleKeyForPath(keyPath);
  if (!this.isDeforumFieldToggleable(toggleKey)) return;
  this.deforumFieldEnabled = {
    ...createDeforumFieldEnabledMap(this.deforumFieldEnabled),
    [toggleKey]: enabled !== false,
  };
  this.syncDeforumSettingsJson();
  this.saveSessionState();
  this.queueDeforumSettingsSave();
  if (!this.deforumPlaying) this.scheduleDeforumPreview();
},
activeDeforumSettings() {
  const settings = this.normalizedDeforumSettings();
  DEFORUM_FIELD_KEYS.forEach((keyPath) => {
    if (!this.isDeforumFieldEnabled(keyPath)) removeNestedValue(settings, keyPath);
  });
  Object.entries(DEFORUM_DERIVED_TOGGLE_KEYS).forEach(([keyPath, toggleKey]) => {
    if (!this.isDeforumFieldEnabled(toggleKey)) removeNestedValue(settings, keyPath);
  });
  return settings;
},
 onDeforumSectionToggle(groupId, evt) {
   this.deforumSectionOpen[groupId] = evt.target.open;
 },
 onDeforumFieldInput(keyPath, raw, kind) {
  if (String(keyPath || '').startsWith('cn_')) return;
   let value = raw;
   if (kind === 'number') {
     const n = parseFloat(raw);
     value = Number.isFinite(n) ? n : 0;
   } else if (kind === 'bool') {
     value = !!raw;
   } else if (keyPath === 'init_image' && raw === '') {
     value = null;
   }
   setNestedValue(this.deforumSettings, keyPath, value);
   if (keyPath === 'prompts.0') {
     const p0 = String(value || '');
     const negSplit = p0.split(/\s+--neg\s+/i);
     if (negSplit.length > 1) {
       this.prompts.pos = negSplit[0].trim();
       this.prompts.neg = negSplit.slice(1).join(' --neg ').trim();
     } else {
       this.prompts.pos = p0.trim();
     }
   }
   if (keyPath === 'negative_prompts') {
     this.prompts.neg = String(value || '');
   }
   if (keyPath === 'seed' && Number.isFinite(value)) {
     this.hud.seed = value;
   }
  if (keyPath === 'steps' && Number.isFinite(value)) {
    this.syncStepsAcrossControls(value, { syncGpuModal: true });
  }
  if (keyPath === 'steps_schedule') {
    const scheduleValue = String(value || '');
    const scheduleScalar = (scheduleValue.match(/\(([^()]+)\)/) || [])[1] || scheduleValue;
    const parsedSteps = Math.max(1, Math.round(this.readFirstNumericValue(
      scheduleScalar,
      Number(this.forge.options && this.forge.options.steps)
        || Number(this.gpuPool && this.gpuPool.forgeModal && this.gpuPool.forgeModal.options && this.gpuPool.forgeModal.options.steps)
        || 6
    )));
    this.syncStepsAcrossControls(parsedSteps, { syncGpuModal: true, syncSchedule: false });
  }
  if (keyPath === 'sampler') {
    this.forge.options.sampler_name = String(value || '');
  }
  if (keyPath === 'scheduler') {
    this.forge.options.scheduler = String(value || '');
  }
  if (keyPath === 'W' && Number.isFinite(value)) {
    this.syncResolutionAcrossControls(value, this.deforumSettings && this.deforumSettings.H, { syncGpuModal: true });
  }
  if (keyPath === 'H' && Number.isFinite(value)) {
    this.syncResolutionAcrossControls(this.deforumSettings && this.deforumSettings.W, value, { syncGpuModal: true });
  }
  if (keyPath === 'fps' && Number.isFinite(value)) {
    if (!this._syncingGlobalFps) {
      this._syncingGlobalFps = true;
      try {
        this.syncFpsAcrossControls(value, { syncDeforum: true });
      } finally {
        this._syncingGlobalFps = false;
      }
    }
  }
  if (keyPath === 'sd_model_name') {
    this.forge.selectedModel = this.normalizeModelName(value);
  }
   this.syncDeforumSettingsJson();
  this.saveSessionState();
   this.pushDeforumLivePatch(keyPath, value);
  if (keyPath === 'steps') {
    this.pushDeforumLivePatch('steps_schedule', this.deforumSettings.steps_schedule);
  }
  if (keyPath === 'steps_schedule') {
    this.pushDeforumLivePatch('steps', this.deforumSettings.steps);
  }
   this.queueDeforumSettingsSave();
   if (!this.deforumPlaying) this.scheduleDeforumPreview();
 },
 onEngineResolutionChange(val) {
   const [w, h] = String(val).split('x').map(Number);
   if (w > 0 && h > 0) {
    this.syncResolutionAcrossControls(w, h, { syncGpuModal: true });
     this.onDeforumFieldInput('W', w, 'number');
     this.onDeforumFieldInput('H', h, 'number');
   }
 },
onImg2imgResolutionInput(axis, rawValue) {
  const fallback = {
    fallbackWidth: Number(this.img2img && this.img2img.width) || 1024,
    fallbackHeight: Number(this.img2img && this.img2img.height) || 576,
  };
  const current = this.currentResolution(fallback);
  const nextWidth = axis === 'width' ? rawValue : current.width;
  const nextHeight = axis === 'height' ? rawValue : current.height;
  const next = this.syncResolutionAcrossControls(nextWidth, nextHeight, { syncGpuModal: true });
  this.syncDeforumSettingsJson();
  this.saveSessionState();
  if (!this.deforumPlaying) this.scheduleDeforumPreview();
  return next;
},
onGpuForgeModalResolutionInput(axis, rawValue) {
  const modal = this.gpuPool && this.gpuPool.forgeModal;
  if (!modal || !modal.options) return null;
  const nextWidth = axis === 'width' ? rawValue : modal.options.width;
  const nextHeight = axis === 'height' ? rawValue : modal.options.height;
  const next = this.syncResolutionAcrossControls(nextWidth, nextHeight, { syncGpuModal: true });
  this.syncDeforumSettingsJson();
  this.saveSessionState();
  if (!this.deforumPlaying) this.scheduleDeforumPreview();
  return next;
},
 pushDeforumLivePatch(keyPath, value) {
  if (!this.isDeforumFieldEnabled(keyPath)) return;
   const patch = patchFromKeyPath(keyPath, value);
   this.sendControl('liveParam', patch);
 },
 syncDeforumSettingsJson() {
   try {
    this.deforumSettingsJson = JSON.stringify(this.activeDeforumSettings(), null, 2);
     this.deforumSettingsJsonError = '';
   } catch (e) {
     this.deforumSettingsJsonError = String(e.message || e);
   }
 },
 applyDeforumSettingsJson() {
   try {
     const parsed = JSON.parse(this.deforumSettingsJson);
     if (!parsed || typeof parsed !== 'object') throw new Error('JSON must be an object');
    this.deforumSettings = mergeDeforumSettings(this.normalizedDeforumSettings(), parsed);
    this.syncStepsAcrossControls(this.deforumSettings.steps, { syncGpuModal: false });
     this.deforumSettingsJsonError = '';
    const desiredModel = this.syncSelectedModelFromDeforumSettings();
    if (desiredModel) {
      void this.switchForgeModel(desiredModel, { persistDeforumSettings: true });
    } else {
      this.queueDeforumSettingsSave();
    }
     if (!this.deforumPlaying) this.scheduleDeforumPreview();
   } catch (e) {
     this.deforumSettingsJsonError = String(e.message || e);
   }
 },
async loadDeforumSettings({ syncServerModel = true } = {}) {
  this.deforumSettingsLoading = true;
   try {
     const res = await fetch('/api/deforum/settings');
     const data = await res.json();
    if (!this.sessionDeforumSettingsLoaded && data.settings && typeof data.settings === 'object') {
       this.deforumSettings = mergeDeforumSettings({ ...DEFORUM_DEFAULT_SETTINGS }, data.settings);
     }
    this.syncStepsAcrossControls(this.deforumSettings.steps, { syncGpuModal: false });
    this.syncSelectedModelFromDeforumSettings();
     this.syncDeforumSettingsJson();
    this.deforumSettingsStatus = this.sessionDeforumSettingsLoaded ? 'Loaded local session' : 'Loaded';
    if (syncServerModel) {
      await this.restoreLastModel();
    }
   } catch (e) {
     this.deforumSettingsStatus = 'Load failed';
     console.error('loadDeforumSettings', e);
  } finally {
    this.deforumSettingsLoading = false;
   }
 },
 queueDeforumSettingsSave() {
   clearTimeout(this.deforumSaveTimer);
   this.deforumSaveTimer = setTimeout(() => this.saveDeforumSettings(), 800);
 },
 async saveDeforumSettings() {
  this.deforumSettingsSaving = true;
   try {
    const settings = this.activeDeforumSettings();
     const res = await fetch('/api/deforum/settings', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ settings }),
     });
     const data = await res.json();
     if (!res.ok || data.error) {
       this.deforumSettingsStatus = data.error || 'Save failed';
       return;
     }
    if (data.modelSync && data.modelSync.success && data.modelSync.model) {
      const modelName = data.modelSync.model.model_name || data.modelSync.model.title || '';
      this.applyLoadedModelSelection(modelName, { queueDeforumSave: false });
    }
     this.deforumSettingsStatus = 'Saved';
   } catch (e) {
     this.deforumSettingsStatus = 'Save failed';
  } finally {
    this.deforumSettingsSaving = false;
   }
 },
 async generateDeforumPreviewFrame() {
   if (this.deforumPlaying) {
     this.performance.status = 'Stop animation to preview single frames';
     return false;
   }
   if (this.previewGenerating) return false;
   this.applyCrossfadeMorph();
   this.previewGenerating = true;
   this.performance.status = 'Rendering Deforum frame…';
   this.deforumSettingsStatus = 'Rendering…';
   try {
    const settings = this.activeDeforumSettings();
     const res = await fetch('/api/deforum/preview', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ settings }),
     });
     const data = await res.json();
     if (!res.ok || data.error) {
       this.performance.status = data.error || 'Deforum preview failed';
       this.deforumSettingsStatus = 'Preview failed';
       return false;
     }
     this.performance.lastPreviewPath = data.path;
     this.generator.lastPath = data.path;
     this.performance.status = 'Deforum frame ready';
     this.deforumSettingsStatus = 'Frame ready';
    this.scheduleFrameRefresh(40);
     return true;
   } catch (err) {
     this.performance.status = String(err.message || err);
     this.deforumSettingsStatus = 'Preview failed';
     return false;
   } finally {
     this.previewGenerating = false;
   }
 },
 async generatePreviewFrame() {
  if (this.previewGenerating) {
    this.previewQueuedKind = this.deforumPanelOpen ? 'deforum' : 'auto';
    return false;
  }
  try {
    if (this.deforumPanelOpen) {
      const ok = await this.generateDeforumPreviewFrame();
      if (!ok) await this.generateImage();
    } else {
      await this.generateImage();
    }
    return true;
  } finally {
    this.flushQueuedPreview();
  }
 },
 async generateImage() {
   if (this.deforumPlaying) {
     this.performance.status = 'Stop animation to preview single frames';
     return;
   }
   if (this.previewGenerating) return;
   this.applyCrossfadeMorph();
   this.previewGenerating = true;
   this.performance.status = 'Generating preview frame…';
   const cfg = this.liveVibe.find((p) => p.key === 'cfgscale') || this.liveVibe.find((p) => p.key === 'cfg');
   const strength = this.liveVibe.find((p) => p.key === 'strength');
   const w = this.deforumSettings.W || 1024;
   const h = this.deforumSettings.H || 576;
   const steps = this.deforumSettings.steps || 12;
   const seed = this.deforumSettings.seed != null ? this.deforumSettings.seed : this.hud.seed;
   const sampler = this.deforumSettings.sampler || 'Euler a';
   const neg = this.deforumSettings.negative_prompts || this.prompts.neg || '';
   const prompt =
     getNestedValue(this.deforumSettings, 'prompts.0') ||
     this.buildMorphedPrompt();
   try {
    this.deforumSettings = this.normalizedDeforumSettings();
     const res = await fetch('/api/txt2img', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         prompt,
         negative_prompt: neg,
         steps,
         cfg_scale: cfg ? cfg.val : 7,
         width: w,
         height: h,
         seed,
         sampler_name: sampler,
        settings: this.deforumSettings,
       }),
     });
     const data = await res.json();
     if (!res.ok || data.error) {
       this.performance.status = data.error || 'Preview failed';
       return;
     }
     this.performance.lastPreviewPath = data.path;
     this.generator.lastPath = data.path;
     this.performance.status = 'Preview frame ready';
    this.scheduleFrameRefresh(120);
   } catch (err) {
     this.performance.status = String(err.message || err);
   } finally {
     this.previewGenerating = false;
   }
 },

// Forge settings methods
 async refreshForgeStatus() {
   this.forge.loading = true;
   try {
     const res = await fetch('/api/status');
     const data = await res.json();
     if (data.sdForge) {
       this.forge.available = data.sdForge.available;
     } else {
       this.forge.available = false;
     }
   } catch (err) {
     this.forge.available = false;
   } finally {
     this.forge.loading = false;
   }
 },
 async saveForgeConnection() {
   try {
     const res = await fetch('/api/forge/options', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({}),
     });
     await res.json();
     await this.refreshForgeStatus();
   } catch (err) {
     console.error('Failed to save connection', err);
   }
 },
 async refreshForgeModels() {
   try {
     const { data } = await apiFetch('/api/sd-models', {}, 'sd-models list');
     this.forge.models = data.models || [];
     this.forge.modelsSource = data.source || '';
    const matched = this.findForgeModelEntry(this.forge.currentModel || this.forge.selectedModel);
    if (matched && matched.metadata) {
      this.forge.modelInfo = matched.metadata;
    }
   } catch (_) {
     this.forge.modelsSource = '';
   }
 },
async switchForgeModel(
  modelName = this.forge.selectedModel,
  { persistDeforumSettings = false, applyOptimizedDefaults = false } = {}
) {
  const requestedModel = this.normalizeModelName(modelName);
  if (!requestedModel) return false;
  this.forge.selectedModel = requestedModel;
  if (this.normalizeModelName(this.forge.currentModel) === requestedModel) {
    this.applyLoadedModelSelection(requestedModel, { queueDeforumSave: persistDeforumSettings });
    if (applyOptimizedDefaults) {
      const applied = this.applyModelOptimizedDefaults(requestedModel);
      if (applied && persistDeforumSettings) this.queueDeforumSettingsSave();
    }
    if (!this.deforumPlaying) this.schedulePreviewFrame();
    return true;
  }
   this.forge.switching = true;
   try {
     const res = await fetch('/api/sd-models/switch', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_name: requestedModel }),
     });
     const data = await res.json();
     if (data.success) {
      const resolvedModel = this.normalizeModelName((data.model && (data.model.model_name || data.model.title)) || requestedModel);
      this.applyLoadedModelSelection(resolvedModel, { queueDeforumSave: persistDeforumSettings });
       if (data.model && data.model.metadata) {
         this.forge.modelInfo = data.model.metadata;
       }
      if (applyOptimizedDefaults) {
        const applied = this.applyModelOptimizedDefaults(data.model || resolvedModel);
        if (applied && persistDeforumSettings) this.queueDeforumSettingsSave();
      }
       if (!this.deforumPlaying) this.schedulePreviewFrame();
      return true;
     }
    throw new Error(data.error || data.message || 'Failed to switch model');
   } catch (err) {
     console.error('Failed to switch model', err);
    this.deforumSettingsStatus = `Model sync failed: ${err.message || err}`;
    return false;
   } finally {
     this.forge.switching = false;
   }
 },
 async refreshForgeOptions() {
   try {
     const [optRes, sampRes, schedRes, vaeRes, curRes] = await Promise.all([
       fetch('/api/forge/options'),
       fetch('/api/forge/samplers'),
       fetch('/api/forge/schedulers'),
       fetch('/api/forge/vae'),
       fetch('/api/sd-models/current'),
     ]);
     const opt = await optRes.json();
     const samp = await sampRes.json();
     const sched = await schedRes.json();
     const vae = await vaeRes.json();
     const cur = await curRes.json();

     this.forge.available = opt.available;
     this.forge.samplers = samp.samplers || [];
     this.forge.schedulers = sched.schedulers || [];
     this.forge.vaeList = vae.vae || [];
     if (cur.model) {
      const currentModel = cur.model.model_name || cur.model.title || '';
      this.applyLoadedModelSelection(currentModel, { queueDeforumSave: false, saveSession: false });
      if (cur.model.metadata) {
        this.forge.modelInfo = cur.model.metadata;
      }
     }

     const o = opt.options || {};
     const keys = ['sampler_name', 'scheduler', 'steps', 'cfg_scale', 'width', 'height', 'batch_size', 'sd_vae', 'clip_skip', 'eta_ddim', 'eta_ancestral', 'sigma_churn', 'enable_emphasis', 'use_old_sampling', 'do_not_add_watermark'];
     for (const k of keys) {
       if (o[k] !== undefined) this.forge.options[k] = o[k];
     }
   } catch (err) {
     console.error('Failed to load forge options', err);
   }
 },
 async applyForgeOptions() {
   const keys = ['sampler_name', 'scheduler', 'steps', 'cfg_scale', 'width', 'height', 'batch_size', 'sd_vae', 'clip_skip', 'eta_ddim', 'eta_ancestral', 'sigma_churn', 'enable_emphasis', 'use_old_sampling', 'do_not_add_watermark'];
   const updates = {};
   for (const k of keys) {
     updates[k] = this.forge.options[k];
   }
   try {
     const res = await fetch('/api/forge/options', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(updates),
     });
     const data = await res.json();
     if (!data.success) {
       console.error('Failed to apply options', data);
     }
   } catch (err) {
     console.error('Failed to apply forge options', err);
   }
 },
 async refreshForgeAll() {
   await Promise.all([
     this.refreshForgeStatus(),
     this.refreshForgeModels(),
     this.refreshForgeOptions(),
   ]);
 },

  },
}
</script>
