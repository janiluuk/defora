const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { loadEsm } = require('./load-esm');

describe('freecut-bridge', () => {
  it('builds defora import postMessage', async () => {
    const { buildFreecutImportMessage } = await loadEsm('..', 'src', 'shared', 'freecut-bridge.mjs');
    const msg = buildFreecutImportMessage('http://localhost/api/video-swarm/file?path=a.mp4');
    assert.equal(msg.type, 'defora:import-url');
    assert.match(msg.url, /video-swarm\/file/);
  });

  it('appends deforaImport query param', async () => {
    const { appendDeforaImportParam } = await loadEsm('..', 'src', 'shared', 'freecut-bridge.mjs');
    const out = appendDeforaImportParam('/freecut/projects', 'http://x/v.mp4');
    assert.match(out, /deforaImport=/);
    assert.match(out, /freecut\/projects/);
  });

  it('deforaMediaFileUrl encodes path and rootId', async () => {
    const { deforaMediaFileUrl } = await loadEsm('..', 'src', 'shared', 'freecut-bridge.mjs');
    const url = deforaMediaFileUrl('http://localhost:8080', 'projects/demo/x.mp4', 'uploads');
    assert.match(url, /path=projects/);
    assert.match(url, /rootId=uploads/);
  });
});
