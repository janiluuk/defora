<template>
  <div class="library-browser" data-testid="library-browser">
    <div
      class="library-browser__tabs sub-pills"
      role="tablist"
      aria-label="Library collections"
      data-testid="library-browser-tabs"
    >
      <button
        type="button"
        role="tab"
        class="sub-pill library-browser__tab"
        :class="{ active: activeTab === 'projects' }"
        :aria-selected="activeTab === 'projects' ? 'true' : 'false'"
        data-testid="library-tab-projects"
        @click="setTab('projects')"
      >
        <UiIcon name="folder" />
        <span>Projects</span>
      </button>
      <button
        type="button"
        role="tab"
        class="sub-pill library-browser__tab"
        :class="{ active: activeTab === 'videos' }"
        :aria-selected="activeTab === 'videos' ? 'true' : 'false'"
        data-testid="library-tab-videos"
        @click="setTab('videos')"
      >
        <UiIcon name="film" />
        <span>Videos</span>
      </button>
      <button
        type="button"
        role="tab"
        class="sub-pill library-browser__tab"
        :class="{ active: activeTab === 'audio' }"
        :aria-selected="activeTab === 'audio' ? 'true' : 'false'"
        data-testid="library-tab-audio"
        @click="setTab('audio')"
      >
        <UiIcon name="mic" />
        <span>Audio</span>
      </button>
    </div>
    <ProjectsBrowser
      v-show="activeTab === 'projects'"
      class="library-browser__pane"
      :app="app"
      :active="activeTab === 'projects'"
    />
    <VideosBrowser
      v-show="activeTab === 'videos'"
      class="library-browser__pane"
      :app="app"
      :active="activeTab === 'videos'"
    />
    <AudioBrowser
      v-show="activeTab === 'audio'"
      class="library-browser__pane"
      :app="app"
      :active="activeTab === 'audio'"
    />
  </div>
</template>

<script>
import UiIcon from './UiIcon.vue'
import ProjectsBrowser from './ProjectsBrowser.vue'
import VideosBrowser from './VideosBrowser.vue'
import AudioBrowser from './AudioBrowser.vue'

export default {
  name: 'LibraryBrowserShell',
  components: { UiIcon, ProjectsBrowser, VideosBrowser, AudioBrowser },
  props: {
    app: { type: Object, required: true },
    initialTab: { type: String, default: 'projects' },
  },
  data() {
    const tab = ['projects', 'videos', 'audio'].includes(this.initialTab) ? this.initialTab : 'projects'
    return { activeTab: tab }
  },
  methods: {
    setTab(tab) {
      this.activeTab = ['projects', 'videos', 'audio'].includes(tab) ? tab : 'projects'
    },
  },
}
</script>
