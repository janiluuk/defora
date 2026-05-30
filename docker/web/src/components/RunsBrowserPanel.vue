<template>
  <div class="rack runs-browser" data-testid="runs-browser">
    <div class="framesync-panel runs-browser__panel">
      <div class="framesync-header">
        <div class="framesync-title">Runs <span class="framesync-accent">Monitor</span></div>
        <div class="runs-browser__meta">
          <span class="runs-browser__count">
            <template v-if="runsBrowserTab === 'active'">{{ runsActiveList.length }} active</template>
            <template v-else-if="runsBrowserTab === 'frames'">{{ frameStripThumbs.length }} frames</template>
            <template v-else>{{ runsFiltered.length }} / {{ runsPastCount }}</template>
          </span>
          <span v-if="runsLastRefreshedLabel" class="runs-monitor__refreshed">{{ runsLastRefreshedLabel }}</span>
          <button class="framesync-button" :disabled="runsLoading" @click="refreshRuns()">Refresh</button>
        </div>
      </div>

      <div class="runs-browser__main-tabs sub-pills" data-testid="runs-browser-main-tabs">
        <button
          type="button"
          class="sub-pill"
          :class="{ active: runsBrowserTab === 'active' }"
          data-testid="runs-browser-tab-active"
          @click="setRunsBrowserTab('active')"
        >
          Runs
          <span v-if="runsActiveList.length" class="runs-browser__tab-badge">{{ runsActiveList.length }}</span>
        </button>
        <button
          type="button"
          class="sub-pill"
          :class="{ active: runsBrowserTab === 'frames' }"
          data-testid="runs-browser-tab-frames"
          @click="setRunsBrowserTab('frames')"
        >
          Frames
          <span v-if="frameStripThumbs.length" class="runs-browser__tab-badge">{{ frameStripThumbs.length }}</span>
        </button>
        <button
          type="button"
          class="sub-pill"
          :class="{ active: runsBrowserTab === 'past' }"
          data-testid="runs-browser-tab-past"
          @click="setRunsBrowserTab('past')"
        >
          Past runs
          <span v-if="runsPastCount" class="runs-browser__tab-badge runs-browser__tab-badge--dim">{{ runsPastCount }}</span>
        </button>
      </div>

      <div v-if="runsBrowserTab === 'frames'" class="runs-browser__frames-pane" data-testid="runs-browser-frames-pane">
        <FrameRailPanel :app="app" />
      </div>

      <template v-else-if="runsBrowserTab === 'active'">
      <div class="runs-monitor-bar">
        <button
          type="button"
          class="framesync-button framesync-button--live"
          data-testid="runs-launch-test"
          :disabled="runsLaunching"
          @click="launchTestRun"
        >
          {{ runsLaunching ? 'Launching…' : 'Launch test job' }}
        </button>
        <label class="framesync-checkbox runs-monitor__auto">
          <input type="checkbox" v-model="runsAutoRefresh" @change="onRunsAutoRefreshChange">
          Auto-refresh ({{ runsPollIntervalSec }}s)
        </label>
        <button type="button" class="framesync-button framesync-button--compact" @click="clearRunsJobLog">Clear log</button>
      </div>

      <div class="runs-activity-summary" data-testid="runs-activity-summary">
        <span class="runs-activity-summary__label">{{ runsActiveSummaryLabel }}</span>
        <span v-if="deforumBatchesStatus" class="runs-active-jobs__warn">{{ deforumBatchesStatus }}</span>
        <span v-if="runsStatus" class="runs-active-jobs__status">{{ runsStatus }}</span>
      </div>

      <div class="runs-job-log" data-testid="runs-job-log">
        <div
          v-for="entry in runsJobLog"
          :key="entry.id"
          class="runs-job-log__line"
          :class="'runs-job-log__line--' + (entry.level || 'info')"
        >
          <time class="runs-job-log__time">{{ formatRunsLogTime(entry.ts) }}</time>
          <span class="runs-job-log__msg">{{ entry.message }}</span>
        </div>
        <p v-if="!runsJobLog.length" class="runs-job-log__empty">No log entries yet — launch a test job to see activity.</p>
      </div>

      <div class="runs-browser__table-wrap runs-browser__table-wrap--active" data-testid="runs-active-jobs">
        <table class="runs-browser__table runs-browser__table--compact">
          <thead>
            <tr>
              <th></th>
              <th>Job</th>
              <th>Status</th>
              <th>Worker</th>
              <th>Frames</th>
              <th>Progress</th>
              <th>ETA</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="run in runsActiveList"
              :key="run.run_id"
              :class="{ 'runs-row-active': runsDetailView && runsDetailView.run_id === run.run_id }"
              @click="onRunRowClick(run, $event)"
            >
              <td class="runs-browser__preview">
                <img
                  v-if="runListingThumbUrl(run)"
                  :src="runListingThumbUrl(run)"
                  class="runs-browser__thumb"
                  :alt="run.run_id"
                >
                <div v-else class="runs-browser__thumb runs-browser__thumb--empty">—</div>
              </td>
              <td class="runs-browser__run-id">{{ runListingId(run) }}</td>
              <td>
                <span class="runs-status-pill" :class="'runs-status-pill--' + run.status">{{ run.status }}</span>
              </td>
              <td class="runs-browser__worker">{{ runWorkerName(run) }}</td>
              <td class="runs-browser__live-frames">{{ runLiveFramesLabel(run) }}</td>
              <td class="runs-browser__progress">
                <div class="runs-browser__progress-label">{{ runFrameProgressLabel(run) }}</div>
                <div
                  v-if="runFrameProgressPct(run) != null"
                  class="runs-browser__progress-bar"
                  :title="runFrameProgressLabel(run)"
                >
                  <span class="runs-browser__progress-fill" :style="{ width: runFrameProgressPct(run) + '%' }"></span>
                </div>
              </td>
              <td class="runs-browser__eta">{{ runEtaLabel(run) }}</td>
              <td>
                <div class="runs-browser__actions">
                  <button
                    v-if="canKillQueuedRun(run)"
                    class="framesync-button framesync-button--danger framesync-button--compact runs-browser__action runs-browser__action--danger"
                    @click="killQueuedRun(run)"
                    title="Cancel queued batch"
                  >Kill</button>
                </div>
              </td>
            </tr>
            <tr v-if="runsActiveList.length === 0">
              <td colspan="8" class="runs-browser__empty">
                No active jobs. Launch a test job or start a Deforum batch.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </template>

      <template v-else>
      <div class="runs-browser__filters runs-browser__filters--compact">
        <input type="text" class="framesync-input" v-model.trim="runsFilter.search" placeholder="Search…" @input="applyRunsFilters">
        <select class="framesync-select" v-model="runsFilter.status" @change="applyRunsFilters">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="running">Running</option>
          <option value="queued">Queued</option>
        </select>
        <input type="text" class="framesync-input" v-model.trim="runsFilter.tag" placeholder="Tag" @input="applyRunsFilters">
        <input type="text" class="framesync-input" v-model.trim="runsFilter.model" placeholder="Model" @input="applyRunsFilters">
      </div>

      <div class="runs-browser__sortbar runs-browser__sortbar--compact">
        <span class="runs-browser__sort-label">Sort:</span>
        <select class="framesync-select runs-browser__sort-select" v-model="runsSort.field" @change="applyRunsFilters">
          <option value="started_at">Date</option>
          <option value="run_id">Run ID</option>
          <option value="model">Model</option>
          <option value="frame_count">Frames</option>
          <option value="status">Status</option>
        </select>
        <button class="framesync-button runs-browser__sort-order" @click="runsSort.order = runsSort.order === 'desc' ? 'asc' : 'desc'; applyRunsFilters();">
          {{ runsSort.order === 'desc' ? 'Desc' : 'Asc' }}
        </button>
        <span class="runs-browser__hint">Ctrl+click row to compare</span>
        <div class="runs-browser__spacer"></div>
        <button class="framesync-button runs-browser__export" @click="exportRuns('json')">JSON</button>
        <button class="framesync-button runs-browser__export" @click="exportRuns('csv')">CSV</button>
      </div>

      <div class="runs-browser__table-wrap">
        <table class="runs-browser__table runs-browser__table--compact">
          <thead>
            <tr>
              <th></th>
              <th>Run ID</th>
              <th>Status</th>
              <th>Model</th>
              <th>Progress</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="run in runsFiltered"
              :key="run.run_id"
              :class="{'runs-row-selected': runsSelected.includes(run.run_id), 'runs-row-active': runsDetailView && runsDetailView.run_id === run.run_id}"
              @click="onRunRowClick(run, $event)"
            >
              <td class="runs-browser__preview">
                <img
                  v-if="runListingThumbUrl(run)"
                  :src="runListingThumbUrl(run)"
                  class="runs-browser__thumb"
                  :alt="run.run_id"
                >
                <div v-else class="runs-browser__thumb runs-browser__thumb--empty">—</div>
              </td>
              <td class="runs-browser__run-id">{{ run.run_id }}</td>
              <td>
                <span class="runs-status-pill" :class="'runs-status-pill--' + run.status">{{ run.status }}</span>
              </td>
              <td class="runs-browser__model">{{ run.model || '-' }}</td>
              <td class="runs-browser__progress">
                <div class="runs-browser__progress-label">{{ runFrameProgressLabel(run) }}</div>
                <div
                  v-if="runFrameProgressPct(run) != null"
                  class="runs-browser__progress-bar"
                  :title="runFrameProgressLabel(run)"
                >
                  <span class="runs-browser__progress-fill" :style="{ width: runFrameProgressPct(run) + '%' }"></span>
                </div>
              </td>
              <td class="runs-browser__date">{{ formatDate(run.started_at) }}</td>
              <td>
                <div class="runs-browser__actions">
                  <button
                    v-if="canKillQueuedRun(run)"
                    class="framesync-button framesync-button--danger framesync-button--compact runs-browser__action runs-browser__action--danger"
                    @click="killQueuedRun(run)"
                    title="Cancel queued batch"
                  >Kill</button>
                  <button v-if="!run._isBatch" class="framesync-button runs-browser__action" @click="rerunRun(run)" title="Rerun">↻</button>
                  <button v-if="!run._isBatch" class="framesync-button framesync-button--danger framesync-button--compact runs-browser__action" @click="deleteRun(run)" title="Delete">✕</button>
                </div>
              </td>
            </tr>
            <tr v-if="runsFiltered.length === 0">
              <td colspan="7" class="runs-browser__empty">
                No past runs found. Adjust filters or complete a job.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </template>
    </div>

    <div v-if="runsDetailView" class="runs-detail-card" data-testid="runs-detail-card">
      <div class="runs-detail-card__header">
        <div class="framesync-title">Run <span class="runs-detail-card__id">{{ runsDetailView.run_id }}</span></div>
        <div class="runs-detail-card__header-actions">
          <button
            v-if="canKillQueuedRun(runsDetailView)"
            class="framesync-button framesync-button--danger framesync-button--compact"
            @click="killQueuedRun(runsDetailView)"
          >Kill</button>
          <button class="framesync-button framesync-button--compact" @click="closeRunsDetailView()">Close</button>
        </div>
      </div>

      <div class="runs-detail-card__tabs sub-pills">
        <button
          type="button"
          class="sub-pill"
          :class="{ active: runsDetailTab === 'summary' }"
          @click="runsDetailTab = 'summary'"
        >Summary</button>
        <button
          type="button"
          class="sub-pill"
          :class="{ active: runsDetailTab === 'json' }"
          data-testid="runs-detail-json-tab"
          @click="runsDetailTab = 'json'"
        >
          JSON
          <span v-if="runDetailJsonDiffCount(runsDetailView)" class="runs-detail-json__diff-badge">{{ runDetailJsonDiffCount(runsDetailView) }}</span>
        </button>
      </div>

      <template v-if="runsDetailTab === 'summary'">
      <div v-if="runHasOutputMaterial(runsDetailView)" class="runs-detail-card__outputs" data-testid="runs-detail-outputs">
        <div class="framesync-subtitle">Output</div>
        <div v-if="runPrimaryVideoUrl(runsDetailView)" class="runs-detail-card__video-wrap">
          <video
            class="runs-detail-card__video"
            controls
            playsinline
            preload="metadata"
            :src="runPrimaryVideoUrl(runsDetailView)"
          ></video>
        </div>
        <div class="runs-detail-card__output-links">
          <a
            v-if="runPrimaryVideoUrl(runsDetailView)"
            class="framesync-button framesync-button--compact"
            :href="runPrimaryVideoUrl(runsDetailView)"
            target="_blank"
            rel="noopener"
          >Open video</a>
          <button
            v-if="runPrimaryVideoUrl(runsDetailView)"
            type="button"
            class="framesync-button framesync-button--compact"
            @click="openRunVideoInEditor(runsDetailView)"
          >Open in editor</button>
          <button
            v-if="runsDetailView.frames_browse_url || (runsDetailView.frames && runsDetailView.frames.length)"
            type="button"
            class="framesync-button framesync-button--compact"
            @click="openRunMaterialInBrowser(runsDetailView)"
          >Browse frames{{ runsDetailView.frames && runsDetailView.frames.length ? ` (${runsDetailView.frames.length})` : '' }}</button>
          <a
            v-for="out in (runsDetailView.outputs || []).filter(o => o.kind === 'preview_frame' && o.url)"
            :key="out.url"
            class="framesync-button framesync-button--compact"
            :href="out.url"
            target="_blank"
            rel="noopener"
          >Preview frame</a>
        </div>
      </div>
      <div v-else class="runs-detail-card__outputs runs-detail-card__outputs--empty">
        <span class="framesync-subtitle">Output</span>
        <span class="runs-detail-card__no-output">No video or frames yet</span>
      </div>

      <div class="runs-detail-card__grid runs-detail-card__grid--compact">
        <div>
          <div class="framesync-subtitle">Status</div>
          <span class="runs-status-pill" :class="'runs-status-pill--' + runsDetailView.status">{{ runsDetailView.status }}</span>
        </div>
        <div>
          <div class="framesync-subtitle">Model</div>
          <div>{{ runsDetailView.model || '-' }}</div>
        </div>
        <div>
          <div class="framesync-subtitle">Frames</div>
          <div>{{ runFrameProgressLabel(runsDetailView) }}</div>
        </div>
        <div>
          <div class="framesync-subtitle">Seed</div>
          <div class="runs-browser__seed">{{ runsDetailView.seed || '-' }}</div>
        </div>
        <div>
          <div class="framesync-subtitle">Steps</div>
          <div>{{ runsDetailView.steps || '-' }}</div>
        </div>
        <div>
          <div class="framesync-subtitle">Strength</div>
          <div>{{ runsDetailView.strength || '-' }}</div>
        </div>
        <div>
          <div class="framesync-subtitle">CFG</div>
          <div>{{ runsDetailView.cfg || '-' }}</div>
        </div>
        <div>
          <div class="framesync-subtitle">Tag</div>
          <div>{{ runsDetailView.tag || '-' }}</div>
        </div>
        <div>
          <div class="framesync-subtitle">GPU</div>
          <div>{{ runsDetailView._gpu || (runsDetailView._batchNode && runsDetailView._batchNode.name) || '-' }}</div>
        </div>
        <div class="runs-detail-card__full">
          <div class="framesync-subtitle">Positive Prompt</div>
          <div class="runs-detail-card__prompt">{{ runsDetailView.prompt_positive || '-' }}</div>
        </div>
        <div class="runs-detail-card__full">
          <div class="framesync-subtitle">Negative Prompt</div>
          <div class="runs-detail-card__prompt">{{ runsDetailView.prompt_negative || '-' }}</div>
        </div>
        <div class="runs-detail-card__full">
          <div class="framesync-subtitle">Notes</div>
          <textarea class="framesync-input runs-detail-card__notes" v-model="runsDetailView.notes" placeholder="Add notes..."></textarea>
          <button class="framesync-button runs-detail-card__save" @click="saveRunNotes(runsDetailView)">Save notes</button>
        </div>
      </div>

      <div v-if="runsDetailView.frames && runsDetailView.frames.length" class="runs-detail-card__frames">
        <div class="framesync-subtitle">Frames ({{ runsDetailView.frames.length }})</div>
        <div class="runs-detail-card__frames-list">
          <a
            v-for="f in runsDetailView.frames.slice(0, 24)"
            :key="f"
            :href="`/api/runs/${runsDetailView.run_id}/frames/${f}`"
            target="_blank"
            rel="noopener"
            class="runs-detail-card__frame-link"
          >
            <img :src="`/api/runs/${runsDetailView.run_id}/frames/${f}`" class="runs-detail-card__frame" :alt="f">
          </a>
        </div>
      </div>
      </template>

      <div v-else class="runs-detail-json" data-testid="runs-detail-json">
        <div class="runs-detail-json__toolbar">
          <button type="button" class="framesync-button framesync-button--compact" @click="copyRunDetailJson(runsDetailView)">Copy JSON</button>
          <label class="framesync-checkbox runs-detail-json__filter">
            <input type="checkbox" v-model="runsDetailJsonShowDiffOnly">
            Show differences only
          </label>
          <span v-if="runDetailJsonDiffCount(runsDetailView)" class="runs-detail-json__diff-hint">
            {{ runDetailJsonDiffCount(runsDetailView) }} value(s) differ from current UI settings
          </span>
        </div>
        <div class="runs-detail-json__table-wrap">
          <table class="runs-detail-json__table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Run value</th>
                <th>Current</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in runDetailJsonRows(runsDetailView)"
                :key="row.path"
                :class="{ 'runs-detail-json__row--diff': row.differs }"
              >
                <td class="runs-detail-json__key">{{ row.path }}</td>
                <td class="runs-detail-json__value">{{ row.displayValue }}</td>
                <td class="runs-detail-json__current">
                  <span v-if="row.hasCurrent">{{ row.displayCurrent }}</span>
                  <span v-else class="runs-detail-json__na">—</span>
                  <span v-if="row.differs" class="runs-detail-json__changed" title="Differs from current UI value">≠</span>
                </td>
              </tr>
              <tr v-if="runDetailJsonRows(runsDetailView).length === 0">
                <td colspan="3" class="runs-detail-json__empty">
                  {{ runsDetailJsonShowDiffOnly ? 'No differences from current settings' : 'No values' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <details class="runs-detail-json__raw">
          <summary>Raw JSON</summary>
          <pre class="runs-detail-json__pre">{{ runDetailJsonPretty(runsDetailView) }}</pre>
        </details>
      </div>
    </div>

    <div v-if="runsSelected.length >= 2" class="runs-compare-card">
      <div class="runs-compare-card__header">
        <div class="framesync-title">Compare Runs ({{ runsSelected.length }})</div>
        <div class="runs-compare-card__actions">
          <button class="framesync-button runs-browser__export" @click="exportRunComparison('json')">JSON</button>
          <button class="framesync-button runs-browser__export" @click="exportRunComparison('csv')">CSV</button>
          <button class="framesync-button" @click="runsSelected = []">Clear</button>
        </div>
      </div>
      <div class="runs-compare-card__table-wrap">
        <table class="runs-compare-card__table">
          <thead>
            <tr>
              <th>Property</th>
              <th v-for="runId in runsSelected" :key="runId" class="runs-browser__seed">{{ runId }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prop in runsCompareFields" :key="prop">
              <td>{{ prop }}</td>
              <td v-for="runId in runsSelected" :key="runId" class="runs-browser__seed">
                {{ getRunProp(runId, prop) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="runsSelected.length === 2 && runsPromptDiff"
        class="runs-prompt-diff"
        data-testid="runs-prompt-diff"
      >
        <div class="framesync-subtitle">Prompt diff ({{ runsPromptDiff.runA }} vs {{ runsPromptDiff.runB }})</div>
        <div v-for="section in ['positive', 'negative']" :key="section" class="runs-prompt-diff__block">
          <div class="framesync-subtitle runs-prompt-diff__label">{{ section === 'positive' ? 'Positive' : 'Negative' }}</div>
          <div class="runs-prompt-diff__columns">
            <div class="runs-prompt-diff__col">
              <div
                v-for="(line, idx) in runsPromptDiff[section]"
                :key="section + '-l-' + idx"
                class="runs-prompt-diff__line"
                :class="'runs-prompt-diff__line--' + line.kind"
              >{{ line.left || ' ' }}</div>
            </div>
            <div class="runs-prompt-diff__col">
              <div
                v-for="(line, idx) in runsPromptDiff[section]"
                :key="section + '-r-' + idx"
                class="runs-prompt-diff__line"
                :class="'runs-prompt-diff__line--' + line.kind"
              >{{ line.right || ' ' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { proxyAppView } from './views/app-view-proxy.mjs'
import FrameRailPanel from './FrameRailPanel.vue'

export default {
  name: 'RunsBrowserPanel',
  props: {
    app: { type: Object, required: true },
  },
  components: { FrameRailPanel },
  setup(props) {
    return proxyAppView(props)
  },
}
</script>
