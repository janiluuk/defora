<template>
  <div class="preview-panel">
    <div class="preview">
      <div class="video-wrap">
        <video ref="videoElement" :src="videoSrc" controls></video>
        <div class="overlay" v-if="showOverlay">
          <div class="hud">
            <!-- HUD overlays will go here -->
          </div>
        </div>
      </div>
      <div class="preview-controls">
        <div class="thumbs" v-if="showThumbs">
          <div class="thumb-card" v-for="(thumb, index) in thumbnails" :key="index">
            <img :src="thumb.src" :alt="thumb.alt" class="thumb">
            <span class="thumb-label">{{ thumb.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PreviewPanel',
  props: {
    videoSrc: { type: String, default: '' },
    showOverlay: { type: Boolean, default: true },
    showThumbs: { type: Boolean, default: true },
    thumbnails: { type: Array, default: () => [] }
  }
}
</script>

<style scoped>
.preview-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.video-wrap {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  aspect-ratio: 16 / 9;
  width: 100%;
}

video {
  width: 100%;
  height: 100%;
  display: block;
  background: #000;
  object-fit: contain;
}

.overlay {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  background: linear-gradient(180deg, rgba(0,0,0,0.7), transparent);
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}
</style>