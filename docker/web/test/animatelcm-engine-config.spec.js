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

  it('injects motion LoRA tags into prompt frames', async () => {
    const { mergeAnimateLcmIntoDeforumSettings } = await loadEsm(
      '..',
      'src',
      'animation-plugins',
      'animatelcm-engine-config.mjs',
    );
    const merged = mergeAnimateLcmIntoDeforumSettings(
      { prompts: { 0: 'fox', 30: 'wolf' } },
      { motion_loras: ['v2_lora_ZoomIn'], motion_lora_weight: 0.65 },
      { positivePrompt: 'fox' },
    );
    assert.match(merged.prompts['0'], /<lora:v2_lora_ZoomIn:0\.65>/);
    assert.match(merged.prompts['30'], /<lora:v2_lora_ZoomIn:0\.65>/);
  });
});
