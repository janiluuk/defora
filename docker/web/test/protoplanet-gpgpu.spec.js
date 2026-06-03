import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeProtoplanetSettings,
  protoplanetStaticSignature,
  PROTOPLANET_SIM_WIDTH,
} from '../src/shared/protoplanet-gpgpu.mjs';

describe('protoplanet-gpgpu', () => {
  it('normalizeProtoplanetSettings clamps physics parameters', () => {
    const out = normalizeProtoplanetSettings({
      ppGravityConstant: 5000,
      ppDensity: -1,
      ppRadius: 5,
      ppMaxMass: 100,
      ppHue: 2,
    });
    assert.equal(out.ppGravityConstant, 1000);
    assert.equal(out.ppDensity, 0.001); // clamped from -1
    assert.equal(out.ppRadius, 10);
    assert.equal(out.ppMaxMass, 50);
    assert.equal(out.ppHue, 1);
  });

  it('protoplanetStaticSignature changes when disk layout changes', () => {
    const a = protoplanetStaticSignature({ ppRadius: 300, ppHeight: 8, ppExponent: 0.4, ppMaxMass: 15, ppVelocity: 70, ppVelocityExponent: 0.2, ppRandVelocity: 0.001 });
    const b = protoplanetStaticSignature({ ppRadius: 400, ppHeight: 8, ppExponent: 0.4, ppMaxMass: 15, ppVelocity: 70, ppVelocityExponent: 0.2, ppRandVelocity: 0.001 });
    assert.notEqual(a, b);
  });

  it('uses 64x64 simulation grid', () => {
    assert.equal(PROTOPLANET_SIM_WIDTH, 64);
    assert.equal(PROTOPLANET_SIM_WIDTH * PROTOPLANET_SIM_WIDTH, 4096);
  });
});
