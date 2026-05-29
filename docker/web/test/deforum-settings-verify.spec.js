const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm');

describe('deforum-settings-verify', () => {
  it('flags missing prompt as error', async () => {
    const { verifyDeforumSettings } = await loadEsm('..', 'src', 'deforum-settings-verify.mjs');
    const { DEFORUM_DEFAULT_SETTINGS } = await loadEsm('..', 'src', 'deforum-settings-schema.mjs');
    const settings = { ...DEFORUM_DEFAULT_SETTINGS, prompts: { '0': '' }, positive_prompts: '' };
    const result = verifyDeforumSettings(settings);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.field === 'prompts'));
  });

  it('warns when 2D mode has 3D rotation schedules', async () => {
    const { verifyDeforumSettings } = await loadEsm('..', 'src', 'deforum-settings-verify.mjs');
    const settings = {
      W: 768,
      H: 432,
      max_frames: 48,
      fps: 24,
      steps: 6,
      animation_mode: '2D',
      prompts: { '0': 'test prompt' },
      rotation_3d_y: '0: (2)',
      cfg_scale_schedule: '0:(7)',
      strength_schedule: '0:(0.6)',
    };
    const result = verifyDeforumSettings(settings);
    assert.ok(result.warnings.some((w) => w.field === 'rotation_3d_y'));
  });

  it('passes sensible defaults', async () => {
    const { verifyDeforumSettings } = await loadEsm('..', 'src', 'deforum-settings-verify.mjs');
    const { DEFORUM_DEFAULT_SETTINGS } = await loadEsm('..', 'src', 'deforum-settings-schema.mjs');
    const result = verifyDeforumSettings({ ...DEFORUM_DEFAULT_SETTINGS });
    assert.equal(result.errors.length, 0);
    assert.ok(!result.warnings.some((w) => w.field === 'cfg_scale_schedule'));
    assert.ok(!result.warnings.some((w) => w.field === 'max_frames'));
  });
});
