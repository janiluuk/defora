const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm');

describe('animatelcm-engine-config', () => {
  it('merges AnimateLCM into deforum settings', async () => {
    const { mergeAnimateLcmIntoDeforumSettings, ANIMATELCM_ANIMATION_MODE } = await loadEsm(
      '..',
      'src',
      'animation-plugins',
      'animatelcm-engine-config.mjs',
    );
    const merged = mergeAnimateLcmIntoDeforumSettings(
      { animation_mode: '2D', W: 512, H: 512, prompts: { 0: 'a fox' } },
      { alcm_steps: 6, motion_type: 'orbit' },
      { positivePrompt: 'a fox' },
    );
    assert.equal(merged.animation_mode, ANIMATELCM_ANIMATION_MODE);
    assert.equal(merged.steps, 6);
    assert.equal(merged.motion_type, 'orbit');
    assert.equal(merged.prompts['0'], 'a fox');
  });
});
