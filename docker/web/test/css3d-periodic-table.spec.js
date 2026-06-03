const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm');

describe('css3d-periodic-table', () => {
  it('normalizePeriodicTableSettings clamps layout and timing', async () => {
    const { normalizePeriodicTableSettings } = await loadEsm('..', 'src', 'shared', 'periodic-table-settings.mjs');
    const out = normalizePeriodicTableSettings({
      ptLayout: 'invalid',
      ptTransitionMs: 50,
      ptSpacing: 3,
      ptAutoCycleSec: 1,
    });
    assert.equal(out.ptLayout, 'table');
    assert.equal(out.ptTransitionMs, 400);
    assert.equal(out.ptSpacing, 1.5);
    assert.equal(out.ptAutoCycleSec, 3);
  });

  it('buildPeriodicLayoutTargets returns four layouts for all elements', async () => {
    const { PERIODIC_LAYOUTS } = await loadEsm('..', 'src', 'shared', 'periodic-table-settings.mjs');
    const { buildPeriodicLayoutTargets, PERIODIC_TABLE_DATA } = await loadEsm('..', 'src', 'shared', 'css3d-periodic-table.mjs');
    const count = PERIODIC_TABLE_DATA.length / 5;
    const targets = buildPeriodicLayoutTargets(count, 1);
    assert.equal(targets.table.length, count);
    assert.equal(targets.sphere.length, count);
    assert.equal(targets.helix.length, count);
    assert.equal(targets.grid.length, count);
    assert.deepEqual(PERIODIC_LAYOUTS, ['table', 'sphere', 'helix', 'grid']);
  });
});
