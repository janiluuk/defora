const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm');

describe('svd-engine-config', () => {
  it('normalizes XT 1.1 defaults', async () => {
    const { normalizeSvdEngine, DEFAULT_SVD_ENGINE, isSvdXt11Engine } = await loadEsm(
      '..',
      'src',
      'shared',
      'svd-engine-config.mjs',
    );
    const svd = normalizeSvdEngine({});
    assert.equal(svd.width, 1024);
    assert.equal(svd.height, 576);
    assert.equal(svd.video_frames, DEFAULT_SVD_ENGINE.video_frames);
    assert.equal(svd.motion_bucket_id, 127);
    assert.equal(svd.fps, 6);
    assert.equal(isSvdXt11Engine(svd), true);
  });

  it('buildSvdGeneratePayload includes micro-conditioning fields', async () => {
    const { buildSvdGeneratePayload } = await loadEsm('..', 'src', 'shared', 'svd-engine-config.mjs');
    const payload = buildSvdGeneratePayload(
      { svd_checkpoint: 'svd_xt_1_1.safetensors', sampling_seed: 42 },
      { initImageBase64: 'data:image/png;base64,abc', preview: true },
    );
    assert.ok(payload.checkpoint.includes('svd_xt_1_1'));
    assert.equal(payload.motion_bucket_id, 127);
    assert.equal(payload.fps, 6);
    assert.ok(payload.init_image.includes('base64'));
    assert.ok(payload.video_frames <= 4);
  });

  it('apply XT 1.1 preset via getSvdPreset', async () => {
    const { getSvdPreset, normalizeSvdEngine } = await loadEsm('..', 'src', 'shared', 'svd-engine-config.mjs');
    const preset = getSvdPreset('XT 1.1');
    const merged = normalizeSvdEngine({ ...preset });
    assert.equal(merged.video_frames, 25);
    assert.equal(merged.augmentation_level, 0);
  });
});
