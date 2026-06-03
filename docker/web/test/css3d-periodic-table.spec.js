import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePeriodicTableSettings,
  PERIODIC_LAYOUTS,
} from '../src/shared/periodic-table-settings.mjs';
import {
  buildPeriodicLayoutTargets,
  PERIODIC_TABLE_DATA,
} from '../src/shared/css3d-periodic-table.mjs';

describe('css3d-periodic-table', () => {
  it('normalizePeriodicTableSettings clamps layout and timing', () => {
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

  it('buildPeriodicLayoutTargets returns four layouts for all elements', () => {
    const count = PERIODIC_TABLE_DATA.length / 5;
    const targets = buildPeriodicLayoutTargets(count, 1);
    assert.equal(targets.table.length, count);
    assert.equal(targets.sphere.length, count);
    assert.equal(targets.helix.length, count);
    assert.equal(targets.grid.length, count);
    assert.deepEqual(PERIODIC_LAYOUTS, ['table', 'sphere', 'helix', 'grid']);
  });
});
