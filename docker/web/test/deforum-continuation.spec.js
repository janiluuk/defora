const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm');

describe('deforum-continuation', () => {
  const thumbs = [
    { name: '00000010.png', src: '/frames/00000010.png?v=1', frame: 10 },
    { name: '00000042.png', src: '/frames/00000042.png?v=99', frame: 42 },
  ];

  it('uses the last thumb for continuation start frame', async () => {
    const { deforumContinuationStartFrame, lastGeneratedThumb } = await loadEsm('..', 'src', 'shared', 'deforum-continuation.mjs');
    assert.equal(deforumContinuationStartFrame(thumbs), 42);
    assert.equal(lastGeneratedThumb(thumbs).name, '00000042.png');
  });

  it('falls back to init_image path when thumbs are empty', async () => {
    const { deforumContinuationStartFrame } = await loadEsm('..', 'src', 'shared', 'deforum-continuation.mjs');
    assert.equal(
      deforumContinuationStartFrame([], { initImage: '/frames/00000007.png' }),
      7,
    );
  });

  it('strips cache-busting query from init paths', async () => {
    const { framePathForDeforumInit, buildDeforumContinuationPatch } = await loadEsm('..', 'src', 'shared', 'deforum-continuation.mjs');
    assert.equal(
      framePathForDeforumInit('/frames/00000042.png?v=123'),
      '/frames/00000042.png',
    );
    const patch = buildDeforumContinuationPatch(thumbs[1]);
    assert.equal(patch.init_image, '/frames/00000042.png');
    assert.equal(patch.use_init, true);
  });

  it('parses frame numbers from thumb names', async () => {
    const { parseFrameNumberFromThumb } = await loadEsm('..', 'src', 'shared', 'deforum-continuation.mjs');
    assert.equal(parseFrameNumberFromThumb({ name: 'frame_00000123.png' }), 123);
  });

  it('supports undo via checkpoint stack', async () => {
    const {
      canUndoContinuation,
      popContinuationForUndo,
      pushContinuationCheckpoint,
      trimThumbsToContinuationFrame,
    } = await loadEsm('..', 'src', 'shared', 'deforum-continuation.mjs');
    let stack = pushContinuationCheckpoint([], {
      frame: 10,
      init_image: '/frames/00000010.png',
      use_init: true,
      thumbCount: 11,
    });
    stack = pushContinuationCheckpoint(stack, {
      frame: 25,
      init_image: '/frames/00000025.png',
      use_init: true,
      thumbCount: 26,
    });
    assert.equal(canUndoContinuation(stack), true);
    const { stack: afterUndo, restored } = popContinuationForUndo(stack);
    assert.equal(restored.frame, 10);
    assert.equal(restored.init_image, '/frames/00000010.png');
    assert.equal(canUndoContinuation(afterUndo), false);
    const trimmed = trimThumbsToContinuationFrame(thumbs, 10);
    assert.equal(trimmed.length, 1);
    assert.equal(trimmed[0].frame, 10);
  });
});
