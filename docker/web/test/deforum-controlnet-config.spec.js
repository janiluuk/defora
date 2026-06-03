const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm');

describe('deforum-controlnet-config', () => {
  it('maps CN slot ids to unit numbers', async () => {
    const { cnUnitFromSlotId } = await loadEsm('..', 'src', 'shared', 'deforum-controlnet-config.mjs');
    assert.equal(cnUnitFromSlotId('CN1'), 1);
    assert.equal(cnUnitFromSlotId('CN5'), 5);
    assert.equal(cnUnitFromSlotId('CN9'), null);
  });

  it('converts scalar schedules', async () => {
    const { scalarFromSchedule, scheduleFromScalar } = await loadEsm('..', 'src', 'shared', 'deforum-controlnet-config.mjs');
    assert.equal(scheduleFromScalar(0.75), '0:(0.75)');
    assert.equal(scalarFromSchedule('0:(1.25)'), 1.25);
  });

  it('applies module presets to deforum settings', async () => {
    const { applyModulePresetToSettings } = await loadEsm('..', 'src', 'shared', 'deforum-controlnet-config.mjs');
    const next = applyModulePresetToSettings({}, 2, 'canny');
    assert.equal(next.cn_2_module, 'canny');
    assert.equal(next.cn_2_enabled, true);
    assert.equal(next.cn_2_threshold_a, 100);
  });

  it('syncs mediator slots from deforum units', async () => {
    const { syncCnSlotFromDeforumUnit } = await loadEsm('..', 'src', 'shared', 'deforum-controlnet-config.mjs');
    const settings = {
      cn_1_enabled: true,
      cn_1_weight: '0:(0.5)',
      cn_1_guidance_start: '0:(0.1)',
      cn_1_guidance_end: '0:(0.9)',
      cn_1_model: 'control_canny',
      cn_1_module: 'canny',
    };
    const slot = syncCnSlotFromDeforumUnit(settings, 1, { id: 'CN1' });
    assert.equal(slot.enabled, true);
    assert.equal(slot.weight, 0.5);
    assert.equal(slot.start, 0.1);
    assert.equal(slot.end, 0.9);
    assert.equal(slot.model, 'control_canny');
  });

  it('syncs deforum units from mediator slots', async () => {
    const { syncDeforumUnitFromCnSlot } = await loadEsm('..', 'src', 'shared', 'deforum-controlnet-config.mjs');
    const next = syncDeforumUnitFromCnSlot({}, 3, {
      enabled: true,
      weight: 0.8,
      start: 0,
      end: 1,
      model: 'depth',
      modulePreset: 'depth',
    });
    assert.equal(next.cn_3_enabled, true);
    assert.equal(next.cn_3_weight, '0:(0.8)');
    assert.equal(next.cn_3_module, 'depth_midas');
  });

  it('infers preset from module name', async () => {
    const { inferModulePresetId } = await loadEsm('..', 'src', 'shared', 'deforum-controlnet-config.mjs');
    assert.equal(inferModulePresetId({ cn_4_module: 'openpose' }, 4), 'openpose');
  });

  it('filters models by module hints', async () => {
    const { filterModelsForModule } = await loadEsm('..', 'src', 'shared', 'deforum-controlnet-config.mjs');
    const models = [
      { name: 'control_canny [abc]' },
      { name: 'control_depth [def]' },
    ];
    const filtered = filterModelsForModule(models, 'canny');
    assert.ok(filtered.length >= 1);
    assert.ok(filtered.some((m) => /canny/.test(m.name)));
  });

  it('defines five CN slots', async () => {
    const { DEFORUM_CN_SLOT_COUNT, CN_MODULE_PRESETS } = await loadEsm('..', 'src', 'shared', 'deforum-controlnet-config.mjs');
    assert.equal(DEFORUM_CN_SLOT_COUNT, 5);
    assert.ok(CN_MODULE_PRESETS.length > 5);
  });
});
