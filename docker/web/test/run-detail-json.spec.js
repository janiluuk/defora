const { describe, it } = require('node:test');
const { expect } = require('chai');
const {
  buildRunDetailCurrentContext,
  buildRunDetailJsonRows,
} = require('../src/lib/run-detail-json.mjs');

describe('run-detail-json', () => {
  it('flags rows that differ from current deforum settings', () => {
    const ctx = buildRunDetailCurrentContext({
      deforumSettings: { max_frames: 48, seed: 1, steps: 20, sd_model_name: 'xl-current' },
    });
    const rows = buildRunDetailJsonRows(
      {
        run_id: 'run-a',
        model: 'xl-a',
        seed: 1,
        steps: 20,
        job: { snapshot: { settings: { max_frames: 2, seed: 99 } } },
      },
      ctx,
    );
    const modelRow = rows.find((r) => r.path === 'model');
    const seedRow = rows.find((r) => r.path === 'job.snapshot.settings.seed');
    expect(modelRow.differs).to.equal(true);
    expect(seedRow.differs).to.equal(true);
    expect(buildRunDetailJsonRows({ seed: 1 }, ctx, { diffOnly: true })).to.have.lengthOf(0);
  });
});
