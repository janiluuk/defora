const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm');

describe('motion-axis-options', () => {
  it('returns 2D and 3D pad slot defaults', async () => {
    const { defaultMotionXYPadSlots } = await loadEsm('..', 'src', 'utils', 'motion-axis-options.js');
    assert.equal(defaultMotionXYPadSlots(true).length, 2);
    assert.equal(defaultMotionXYPadSlots(false).length, 1);
  });

  it('cycles axis keys without colliding with the paired axis', async () => {
    const { motionAxisOptionsForMode, nextMotionAxisKey } = await loadEsm(
      '..',
      'src',
      'utils',
      'motion-axis-options.js',
    );
    const options = motionAxisOptionsForMode(true);
    const next = nextMotionAxisKey('translation_x', 'translation_y', options);
    assert.notEqual(next, 'translation_y');
    assert.notEqual(next, 'translation_x');
  });
});
