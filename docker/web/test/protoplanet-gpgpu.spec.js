const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm');

describe('protoplanet-gpgpu', () => {
  it('normalizeProtoplanetSettings clamps physics parameters', async () => {
    const { normalizeProtoplanetSettings } = await loadEsm('..', 'src', 'shared', 'protoplanet-gpgpu.mjs');
    const out = normalizeProtoplanetSettings({
      ppGravityConstant: 5000,
      ppDensity: -1,
      ppRadius: 5,
      ppMaxMass: 100,
      ppHue: 2,
    });
    assert.equal(out.ppGravityConstant, 1000);
    assert.equal(out.ppDensity, 0.001);
    assert.equal(out.ppRadius, 10);
    assert.equal(out.ppMaxMass, 50);
    assert.equal(out.ppHue, 1);
  });

  it('protoplanetStaticSignature changes when disk layout changes', async () => {
    const { protoplanetStaticSignature } = await loadEsm('..', 'src', 'shared', 'protoplanet-gpgpu.mjs');
    const a = protoplanetStaticSignature({ ppRadius: 300, ppHeight: 8, ppExponent: 0.4, ppMaxMass: 15, ppVelocity: 70, ppVelocityExponent: 0.2, ppRandVelocity: 0.001 });
    const b = protoplanetStaticSignature({ ppRadius: 400, ppHeight: 8, ppExponent: 0.4, ppMaxMass: 15, ppVelocity: 70, ppVelocityExponent: 0.2, ppRandVelocity: 0.001 });
    assert.notEqual(a, b);
  });

  it('uses 64x64 simulation grid', async () => {
    const { PROTOPLANET_SIM_WIDTH } = await loadEsm('..', 'src', 'shared', 'protoplanet-gpgpu.mjs');
    assert.equal(PROTOPLANET_SIM_WIDTH, 64);
    assert.equal(PROTOPLANET_SIM_WIDTH * PROTOPLANET_SIM_WIDTH, 4096);
  });
});
