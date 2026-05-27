<template>
  <div class="library-shell" :class="{ 'library-shell--fullscreen': libraryFullscreen }">
    <div class="rack runs-browser">
      <div class="framesync-panel runs-browser__panel">
        <div class="framesync-header">
          <div class="framesync-title">Runs <span class="framesync-accent">Browser</span></div>
          <div class="runs-browser__meta">
            <span class="runs-browser__count">{{ runsFiltered.length }} / {{ runsAll.length }}</span>
            <button class="framesync-button" @click="refreshRuns">Refresh</button>
          </div>
        </div>

        <div v-if="runsGpuNodeSummaries.length || runsActiveGpuJobs.length" class="runs-active-jobs">
          <div class="runs-active-jobs__header">
            <div class="framesync-subtitle">Active GPU Jobs</div>
            <span v-if="deforumBatchesStatus" class="runs-active-jobs__warn">{{ deforumBatchesStatus }}</span>
            <span v-if="runsStatus" class="runs-active-jobs__status">{{ runsStatus }}</span>
          </div>
          <div class="runs-active-jobs__grid">
            <div v-for="node in runsGpuNodeSummaries" :key="node.id || node.url" class="runs-active-jobs__node">
              <div class="runs-active-jobs__node-head">
                <span class="runs-active-jobs__node-name">{{ node.name }}</span>
                <span class="runs-status-pill" :class="'runs-status-pill--' + (node.status === 'healthy' ? 'completed' : node.status === 'unhealthy' ? 'failed' : 'queued')">{{ node.status || 'unknown' }}</span>
                <span class="runs-active-jobs__meta">{{ node.activeJobs }} active · q {{ node.queueRunning != null ? node.queueRunning : '—' }}/{{ node.queuePending != null ? node.queuePending : '—' }}</span>
              </div>
              <ul v-if="node.jobs.length" class="runs-active-jobs__list">
                <li v-for="job in node.jobs" :key="job.runId" class="runs-active-jobs__item">
                  <span class="runs-browser__run-id">{{ job.batchId }}</span>
                  <span class="runs-status-pill" :class="'runs-status-pill--' + job.status">{{ job.status }}</span>
                  <span class="runs-active-jobs__detail">{{ job.model || '—' }} · {{ job.frames || '—' }}f</span>
                </li>
              </ul>
              <div v-else class="runs-active-jobs__empty">No queued or running Deforum batches</div>
            </div>
          </div>
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
                      @click.stop="killQueuedRun(run)"
                      title="Cancel queued batch"
                    >Kill</button>
                    <button v-if="!run._isBatch" class="framesync-button runs-browser__action" @click.stop="rerunRun(run)" title="Rerun">Rerun</button>
                    <button v-if="!run._isBatch" class="framesync-button framesync-button--danger framesync-button--compact runs-browser__action" @click.stop="deleteRun(run)" title="Delete">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="runsFiltered.length === 0">
                <td colspan="10" class="runs-browser__empty">
                  No runs found. Adjust filters or refresh.
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

    <div class="framesync-panel library-storage-browser">
      <div class="framesync-header">
        <div class="framesync-title">Storage <span class="framesync-accent">Browser</span></div>
        <span class="framesync-subtitle" style="margin:0;">Projects, runs, and mounted videos</span>
      </div>
      <VideoSwarmBrowser :app="$props.app" />
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

.library-storage-browser {
  display: grid;
  gap: 12px;
}
</style>
