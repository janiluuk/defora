const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm');

describe('motion smoothness schedule helpers', () => {
  it('buildLinearScheduleRamp spreads values across frame count', async () => {
    const {
      buildLinearScheduleRamp,
      parseScheduleKeyframes,
      readScheduleValueAtFrame,
    } = await loadEsm('..', 'src', 'deforum-settings-schema.mjs');

    const schedule = buildLinearScheduleRamp(0, 10, 0, 1, '0: (0)');
    const kfs = parseScheduleKeyframes(schedule);
    assert.equal(kfs.length, 10);
    assert.equal(kfs[0].frame, 0);
    assert.equal(kfs[0].value, 0);
    assert.equal(kfs[9].frame, 9);
    assert.ok(Math.abs(kfs[9].value - 1) < 1e-6);
    assert.ok(Math.abs(kfs[1].value - (1 / 9)) < 0.002);
    assert.equal(readScheduleValueAtFrame(schedule, 5), kfs[5].value);
  });

  it('merges ramp without clobbering keyframes outside the range', async () => {
    const { buildLinearScheduleRamp, parseScheduleKeyframes } = await loadEsm(
      '..',
      'src',
      'deforum-settings-schema.mjs'
    );
    const existing = '0: (0), 20: (5)';
    const schedule = buildLinearScheduleRamp(2, 3, 1, 2, existing);
    const kfs = parseScheduleKeyframes(schedule);
    assert.deepEqual(
      kfs.map((kf) => [kf.frame, kf.value]),
      [
        [0, 0],
        [2, 1],
        [3, 1.5],
        [4, 2],
        [20, 5],
      ]
    );
  });

  it('readScheduleValueAtFrame returns held value', async () => {
    const { readScheduleValueAtFrame } = await loadEsm('..', 'src', 'deforum-settings-schema.mjs');
    const raw = '0: (0), 5: (2), 10: (4)';
    assert.equal(readScheduleValueAtFrame(raw, 0), 0);
    assert.equal(readScheduleValueAtFrame(raw, 7), 2);
    assert.equal(readScheduleValueAtFrame(raw, 10), 4);
  });
});
