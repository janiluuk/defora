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

      <div v-if="runsJobLog.length" class="runs-job-log" data-testid="runs-job-log">
        <div
          v-for="entry in runsJobLog"
          :key="entry.id"
          class="runs-job-log__line"
          :class="'runs-job-log__line--' + (entry.level || 'info')"
        >
          <time class="runs-job-log__time">{{ formatRunsLogTime(entry.ts) }}</time>
          <span class="runs-job-log__msg">{{ entry.message }}</span>
        </div>
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

      <div class="runs-browser__filters">
        <input type="text" class="framesync-input" v-model.trim="runsFilter.search" placeholder="Search (id, tag, model, prompt, notes)" @input="applyRunsFilters">
        <select class="framesync-select" v-model="runsFilter.status" @change="applyRunsFilters">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="running">Running</option>
          <option value="queued">Queued</option>
        </select>
        <input type="text" class="framesync-input" v-model.trim="runsFilter.tag" placeholder="Filter by tag" @input="applyRunsFilters">
        <input type="text" class="framesync-input" v-model.trim="runsFilter.model" placeholder="Filter by model" @input="applyRunsFilters">
      </div>

      <div class="runs-browser__sortbar">
        <span class="runs-browser__sort-label">Sort:</span>
        <select class="framesync-select runs-browser__sort-select" v-model="runsSort.field" @change="applyRunsFilters">
          <option value="started_at">Date</option>
          <option value="run_id">Run ID</option>
          <option value="model">Model</option>
          <option value="frame_count">Frames</option>
          <option value="status">Status</option>
          <option value="tag">Tag</option>
        </select>
        <button class="framesync-button runs-browser__sort-order" @click="runsSort.order = runsSort.order === 'desc' ? 'asc' : 'desc'; applyRunsFilters();">
          {{ runsSort.order === 'desc' ? 'Desc' : 'Asc' }}
        </button>
        <div class="runs-browser__spacer"></div>
        <button class="framesync-button runs-browser__export" @click="exportRuns('json')">JSON</button>
        <button class="framesync-button runs-browser__export" @click="exportRuns('csv')">CSV</button>
      </div>

      <div class="runs-browser__table-wrap">
        <table class="runs-browser__table">
          <thead>
            <tr>
              <th>Thumb</th>
              <th>Run ID</th>
              <th>Status</th>
              <th>Model</th>
              <th>Frames</th>
              <th>Seed</th>
              <th>Tag</th>
              <th>GPU</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="run in runsFiltered" :key="run.run_id" :class="{'runs-row-selected': runsSelected.includes(run.run_id)}" @click="toggleRunSelect(run.run_id)">
              <td>
                <img v-if="run.has_thumbnail" :src="`/api/runs/${run.run_id}/thumb`" class="runs-browser__thumb" alt="">
                <div v-else class="runs-browser__thumb runs-browser__thumb--empty">No img</div>
              </td>
              <td class="runs-browser__run-id">{{ run.run_id }}</td>
              <td>
                <span class="runs-status-pill" :class="'runs-status-pill--' + run.status">{{ run.status }}</span>
              </td>
              <td>{{ run.model || '-' }}</td>
              <td>{{ run.frame_count || run.length_frames || '-' }}</td>
              <td class="runs-browser__seed">{{ run.seed || '-' }}</td>
              <td>{{ run.tag || '-' }}</td>
              <td>{{ run._gpu || '-' }}</td>
              <td class="runs-browser__date">{{ formatDate(run.started_at) }}</td>
              <td>
                <div class="runs-browser__actions">
                  <button class="framesync-button runs-browser__action" @click.stop="showRunDetails(run)" title="Details">Details</button>
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
              <td colspan="10" class="runs-browser__empty">
                No runs found. Launch a test job or adjust filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="runsDetailView" class="runs-detail-card">
      <div class="runs-detail-card__header">
        <div class="framesync-title">Run Details: <span class="runs-detail-card__id">{{ runsDetailView.run_id }}</span></div>
        <div class="runs-detail-card__header-actions">
          <button
            v-if="canKillQueuedRun(runsDetailView)"
            class="framesync-button framesync-button--danger"
            @click="killQueuedRun(runsDetailView)"
          >Kill queued batch</button>
          <button class="framesync-button" @click="runsDetailView = null">Close</button>
        </div>
      </div>
      <div class="runs-detail-card__grid">
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
          <div>{{ runsDetailView.frame_count || runsDetailView.length_frames || '-' }}</div>
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
          <img v-for="f in runsDetailView.frames.slice(0, 50)" :key="f" :src="`/api/runs/${runsDetailView.run_id}/frames/${f}`" class="runs-detail-card__frame" :alt="f">
        </div>
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
