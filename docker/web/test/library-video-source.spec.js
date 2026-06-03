const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm');

test('projectDurationSec prefers sequencer duration', async () => {
  const { projectDurationSec } = await loadEsm('..', 'src', 'shared', 'library-video-source.mjs');
  assert.equal(
    projectDurationSec({ sequencer: { durationSec: 12 }, deforumSettings: { max_frames: 48, fps: 24 } }),
    12,
  );
});

test('projectDurationSec falls back to deforum frames', async () => {
  const { projectDurationSec } = await loadEsm('..', 'src', 'shared', 'library-video-source.mjs');
  assert.equal(
    projectDurationSec({ deforumSettings: { max_frames: 48, fps: 24 } }),
    2,
  );
});

test('shouldOfferProjectExtension when video exceeds project', async () => {
  const { shouldOfferProjectExtension } = await loadEsm('..', 'src', 'shared', 'library-video-source.mjs');
  assert.equal(shouldOfferProjectExtension(10, 8), true);
  assert.equal(shouldOfferProjectExtension(8.02, 8), false);
});

test('extendProjectDuration updates sequencer and deforum frames', async () => {
  const { extendProjectDuration } = await loadEsm('..', 'src', 'shared', 'library-video-source.mjs');
  const state = {
    sequencer: { durationSec: 8, fps: 24 },
    deforumSettings: { max_frames: 192, fps: 24 },
    generator: { totalFrames: 192, fps: 24 },
    framesync: { frameCount: 192, fps: 24 },
  };
  const result = extendProjectDuration(state, 10);
  assert.equal(result.durationSec, 10);
  assert.equal(result.frameCount, 240);
  assert.equal(state.sequencer.durationSec, 10);
  assert.equal(state.deforumSettings.max_frames, 240);
});

test('buildMotionSequencerVideoClip spans project when shorter than video', async () => {
  const { buildMotionSequencerVideoClip } = await loadEsm('..', 'src', 'shared', 'library-video-source.mjs');
  const clip = buildMotionSequencerVideoClip(
    { url: '/v.mp4', label: 'Clip', durationSec: 20 },
    8,
  );
  assert.equal(clip.type, 'video');
  assert.equal(clip.t, 0);
  assert.equal(clip.endT, 8);
});

test('normalizeLibraryVideoEntry resolves playback url', async () => {
  const { normalizeLibraryVideoEntry } = await loadEsm('..', 'src', 'shared', 'library-video-source.mjs');
  const entry = normalizeLibraryVideoEntry(
    { path: '/tmp/a.mp4', name: 'a.mp4', rootId: 'uploads' },
    ({ path, rootId }) => `/file?path=${path}&root=${rootId}`,
  );
  assert.equal(entry.videoPath, '/tmp/a.mp4');
  assert.equal(entry.videoUrl, '/file?path=/tmp/a.mp4&root=uploads');
});
