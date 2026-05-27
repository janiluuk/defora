<template>
  <div class="library-shell" :class="{ 'library-shell--fullscreen': libraryFullscreen }">
    <div class="sub-pills" style="margin-bottom:10px;">
      <button
        type="button"
        class="sub-pill"
        :class="{ active: librarySubTab === 'RUNS' }"
        @click="librarySubTab = 'RUNS'; saveSessionState()"
      >
        RUNS
      </button>
      <button
        type="button"
        class="sub-pill"
        :class="{ active: librarySubTab === 'BROWSER' }"
        @click="librarySubTab = 'BROWSER'; saveSessionState()"
      >
        BROWSER
      </button>
    </div>

    <div v-if="librarySubTab === 'RUNS'" class="library-browser">
      <div class="framesync-panel library-browser__folders">
        <div class="framesync-header">
          <div class="framesync-title">Library <span class="framesync-accent">Prefixes</span></div>
          <div style="display:flex; gap:8px; align-items:center;">
            <button class="framesync-button framesync-button--compact" @click="refreshRuns">Refresh</button>
            <button
              type="button"
              class="framesync-button framesync-button--compact"
              :class="{ active: libraryFullscreen }"
              @click="libraryFullscreen = !libraryFullscreen; saveSessionState()"
            >
              {{ libraryFullscreen ? 'Exit full' : 'Expand' }}
            </button>
          </div>
        </div>
        <div class="framesync-subtitle" style="margin-top:10px;">
          Prefix folders are grouped from Deforum batch names so related runs stay together.
        </div>
        <div v-if="runsLoading" class="library-browser__empty">Loading library…</div>
        <div v-else-if="!libraryPrefixGroups.length" class="library-browser__empty">No runs found yet.</div>
        <div v-else class="library-folder-list">
          <button
            v-for="group in libraryPrefixGroups"
            :key="group.key"
            type="button"
            class="library-folder-item"
            :class="{ 'library-folder-item--active': librarySelectedPrefixKey === group.key }"
            @click="openLibraryPrefix(group.key)"
          >
            <span class="library-folder-item__name">{{ group.label }}</span>
            <span class="library-folder-item__count">{{ group.runs.length }} runs</span>
          </button>
        </div>
      </div>

      <div class="framesync-panel library-browser__runs">
        <div class="framesync-header">
          <div class="framesync-title">Runs <span class="framesync-accent">{{ librarySelectedPrefixKey || '—' }}</span></div>
          <span class="framesync-subtitle" style="margin:0;">{{ libraryRunsForSelectedPrefix.length }} runs</span>
        </div>
        <div v-if="!libraryRunsForSelectedPrefix.length" class="library-browser__empty">
          Select a project below the preview to browse its runs.
        </div>
        <div v-else class="library-run-grid">
          <button
            v-for="run in libraryRunsForSelectedPrefix"
            :key="run.run_id"
            type="button"
            class="library-run-card"
            :class="{ 'library-run-card--active': librarySelectedRunSummary && librarySelectedRunSummary.run_id === run.run_id }"
            @click="openLibraryRun(run)"
          >
            <img
              v-if="run.has_thumbnail"
              class="library-run-card__thumb"
              :src="`/api/runs/${run.run_id}/thumb`"
              :alt="run.run_id"
            />
            <div v-else class="library-run-card__thumb library-run-card__thumb--empty">No img</div>
            <div class="library-run-card__meta">
              <span class="library-run-card__id">{{ run.run_id }}</span>
              <span class="library-run-card__date">{{ formatDate(run.started_at) }}</span>
              <span class="library-run-card__details">
                {{ run.model || 'Unknown model' }} · {{ run.frame_count || run.length_frames || 0 }} frames
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="framesync-panel library-inspector">
      <div class="framesync-header">
        <div class="framesync-title">Frame <span class="framesync-accent">Inspector</span></div>
        <span class="framesync-subtitle" style="margin:0;">
          {{ librarySelectedRunSummary ? librarySelectedRunSummary.run_id : 'Choose a run' }}
        </span>
      </div>

      <div v-if="library.status" class="library-inspector__status">{{ library.status }}</div>
      <div v-else-if="library.loading" class="library-browser__empty">Loading frames…</div>
      <div v-else-if="!librarySelectedRunSummary" class="library-browser__empty">
        Pick a project and run below the preview to inspect frames one by one.
      </div>
      <template v-else>
        <div class="library-inspector__summary">
          <div class="library-inspector__metric">
            <span class="framesync-subtitle">Run</span>
            <strong>{{ librarySelectedRunSummary.run_id }}</strong>
          </div>
          <div class="library-inspector__metric">
            <span class="framesync-subtitle">Frame</span>
            <strong>{{ librarySelectedFrameLabel }}</strong>
          </div>
          <div class="library-inspector__metric">
            <span class="framesync-subtitle">Position</span>
            <strong>{{ librarySelectedFrameIndex + 1 }} / {{ librarySelectedFrames.length || 0 }}</strong>
          </div>
        </div>

        <div class="library-inspector__preview">
          <img
            v-if="librarySelectedFrameSrc"
            class="library-inspector__image"
            :src="librarySelectedFrameSrc"
            :alt="librarySelectedFrameResolved"
          />
          <div v-else class="library-browser__empty">This run does not have exported frames.</div>
        </div>

        <div v-if="librarySelectedFrames.length" class="library-inspector__controls">
          <button
            type="button"
            class="framesync-button"
            @click="stepLibraryFrame(-1)"
            :disabled="librarySelectedFrameIndex <= 0"
          >
            Prev
          </button>
          <input
            class="framesync-input library-inspector__scrubber"
            type="range"
            min="0"
            :max="Math.max(0, librarySelectedFrames.length - 1)"
            :value="Math.max(0, librarySelectedFrameIndex)"
            @input="selectLibraryFrame(librarySelectedFrames[Number($event.target.value)] || '')"
          >
          <button
            type="button"
            class="framesync-button"
            @click="stepLibraryFrame(1)"
            :disabled="librarySelectedFrameIndex >= librarySelectedFrames.length - 1"
          >
            Next
          </button>
        </div>

        <div v-if="libraryVisibleFrames.length" class="library-filmstrip">
          <button
            v-for="frameName in libraryVisibleFrames"
            :key="frameName"
            type="button"
            class="library-filmstrip__item"
            :class="{ 'library-filmstrip__item--active': frameName === librarySelectedFrameResolved }"
            @click="selectLibraryFrame(frameName)"
          >
            <img
              class="library-filmstrip__thumb"
              :src="`/api/runs/${encodeURIComponent(librarySelectedRunSummary.run_id)}/frames/${encodeURIComponent(frameName)}`"
              :alt="frameName"
            />
            <span class="library-filmstrip__label">
              {{ Number.isFinite(parseFrameNumber(frameName)) && parseFrameNumber(frameName) >= 0 ? parseFrameNumber(frameName) : frameName }}
            </span>
          </button>
        </div>
      </template>
    </div>

    <div v-else class="framesync-panel">
      <div class="framesync-header">
        <div class="framesync-title">Storage <span class="framesync-accent">Browser</span></div>
        <span class="framesync-subtitle" style="margin:0;">Projects, runs, and mounted videos</span>
      </div>
      <VideoSwarmBrowser :app="app" />
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './app-view-proxy.js'
import VideoSwarmBrowser from '../VideoSwarmBrowser.vue'

export default {
  name: 'LibraryView',
  components: { VideoSwarmBrowser },
  props: {
    app: { type: Object, required: true },
  },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>

<style scoped>
.library-shell {
  display: grid;
  gap: 12px;
}
.library-shell--fullscreen {
  position: fixed;
  inset: 8px;
  z-index: 999;
  padding: 12px;
  background: rgba(8, 9, 13, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  overflow: auto;
}

.library-browser {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
  gap: 12px;
}

.library-browser__folders,
.library-browser__runs,
.library-inspector {
  display: grid;
  gap: 12px;
}

.library-browser__empty {
  font-size: 11px;
  color: var(--text-dim);
  padding: 10px 0;
}

.library-folder-list {
  display: grid;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
}

.library-folder-item {
  width: 100%;
  display: grid;
  gap: 4px;
  text-align: left;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-1);
  color: var(--text-primary);
  cursor: pointer;
}

.library-folder-item--active {
  border-color: rgba(127, 119, 221, 0.5);
  box-shadow: inset 0 0 0 1px rgba(127, 119, 221, 0.14);
}

.library-folder-item__name {
  font-size: 12px;
  font-weight: 700;
}

.library-folder-item__count {
  font-size: 10px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.library-run-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  max-height: 420px;
  overflow-y: auto;
}

.library-run-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-1);
  padding: 8px;
  display: grid;
  gap: 8px;
  cursor: pointer;
  text-align: left;
  color: var(--text-primary);
}

.library-run-card--active {
  border-color: rgba(83, 216, 255, 0.5);
  box-shadow: inset 0 0 0 1px rgba(83, 216, 255, 0.14);
}

.library-run-card__thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-0);
}

.library-run-card__thumb--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--text-dim);
}

.library-run-card__meta {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.library-run-card__id {
  font-size: 11px;
  font-weight: 700;
  font-family: ui-monospace, "Cascadia Code", monospace;
}

.library-run-card__date,
.library-run-card__details {
  font-size: 10px;
  color: var(--text-dim);
}

.library-inspector__status {
  font-size: 11px;
  color: var(--warn);
}

.library-inspector__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.library-inspector__metric {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-1);
}

.library-inspector__metric strong {
  font-size: 13px;
  color: var(--text-primary);
}

.library-inspector__preview {
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  background: var(--bg-1);
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.library-inspector__image {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  display: block;
  background: var(--bg-0);
}

.library-inspector__controls {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.library-inspector__scrubber {
  width: 100%;
}

.library-filmstrip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(100px, 120px);
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.library-filmstrip__item {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-1);
  padding: 6px;
  display: grid;
  gap: 6px;
  color: var(--text-primary);
  cursor: pointer;
}

.library-filmstrip__item--active {
  border-color: rgba(255, 123, 141, 0.55);
  box-shadow: inset 0 0 0 1px rgba(255, 123, 141, 0.16);
}

.library-filmstrip__thumb {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-0);
}

.library-filmstrip__label {
  font-size: 10px;
  color: var(--text-secondary);
  text-align: center;
  font-family: ui-monospace, "Cascadia Code", monospace;
}

@media (max-width: 1100px) {
  .library-browser {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .library-inspector__summary,
  .library-inspector__controls {
    grid-template-columns: 1fr;
  }
}
</style>
