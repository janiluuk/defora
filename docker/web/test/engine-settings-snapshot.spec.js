import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ENGINE_SETTINGS_SLOT_COUNT,
  buildEngineSettingsSnapshot,
  engineSettingsSlotLabel,
  normalizeEngineSettingsSlot,
  normalizeEngineSettingsSlots,
} from '../src/shared/engine-settings-snapshot.mjs';

describe('engine-settings-snapshot', () => {
  it('builds snapshot with opacity, preset, and engine params', () => {
    const snap = buildEngineSettingsSnapshot({
      activeVideoLayerId: 'wan',
      videoLayerOpacity: { wan: 0.75, webgl: 1 },
      currentPreset: 'crew-a',
      wanEngine: { wan_speed_preset: 'Turbo' },
      defaultAnimation: { mode: 'instancing', forgeLayerOpacity: 0.5 },
    });
    assert.equal(snap.activeVideoLayerId, 'wan');
    assert.equal(snap.videoLayerOpacity.wan, 0.75);
    assert.equal(snap.currentPreset, 'crew-a');
    assert.equal(snap.wanEngine.wan_speed_preset, 'Turbo');
    assert.equal(typeof snap.savedAt, 'number');
  });

  it('normalizes slot array to fixed length', () => {
    const slots = normalizeEngineSettingsSlots([
      { activeVideoLayerId: 'webgl', defaultAnimation: { mode: 'ocean' } },
      null,
      'bad',
    ]);
    assert.equal(slots.length, ENGINE_SETTINGS_SLOT_COUNT);
    assert.equal(slots[0].activeVideoLayerId, 'webgl');
    assert.equal(slots[1], null);
    assert.equal(slots[2], null);
  });

  it('labels slots from layer, preset, or webgl mode', () => {
    assert.equal(engineSettingsSlotLabel(null), '');
    assert.match(
      engineSettingsSlotLabel(normalizeEngineSettingsSlot({
        activeVideoLayerId: 'wan',
        currentPreset: 'night',
      })),
      /WAN/,
    );
    assert.match(
      engineSettingsSlotLabel(normalizeEngineSettingsSlot({
        activeVideoLayerId: 'webgl',
        defaultAnimation: { mode: 'protoplanet' },
      })),
      /protoplan/,
    );
  });
});
