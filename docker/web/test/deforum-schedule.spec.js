const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm');

describe('deforum-schedule', () => {
  it('parses keyframed schedule strings', async () => {
    const mod = await loadEsm('..', 'src', 'deforum-schedule.mjs');
    const kf = mod.parseDeforumSchedule('0: (0), 30: (10), 60: (0)');
    assert.deepEqual(kf, [
      { frame: 0, value: 0 },
      { frame: 30, value: 10 },
      { frame: 60, value: 0 },
    ]);
    assert.equal(mod.sampleSchedule(kf, 15), 5);
    assert.equal(mod.sampleSchedule(kf, 45), 5);
  });

  it('builds a non-empty camera path from live translation values', async () => {
    const mod = await loadEsm('..', 'src', 'deforum-schedule.mjs');
    const pathPoints = mod.buildCameraPath({
      settings: { max_frames: 48, fps: 24 },
      live: { translation_x: 2, translation_y: 0, translation_z: 1 },
      frameCount: 48,
    });
    assert.equal(pathPoints.length, 49);
    assert.ok(Math.abs(pathPoints[10].x) > 0.01 || Math.abs(pathPoints[10].z) > 0.01);
  });
});
