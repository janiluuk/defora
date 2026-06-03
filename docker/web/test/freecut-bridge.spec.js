import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  appendDeforaImportParam,
  buildFreecutImportMessage,
  deforaMediaFileUrl,
} from '../src/shared/freecut-bridge.mjs';

describe('freecut-bridge', () => {
  it('builds defora import postMessage', () => {
    const msg = buildFreecutImportMessage('http://localhost/api/video-swarm/file?path=a.mp4');
    assert.equal(msg.type, 'defora:import-url');
    assert.match(msg.url, /video-swarm\/file/);
  });

  it('appends deforaImport query param', () => {
    const out = appendDeforaImportParam('/freecut/projects', 'http://x/v.mp4');
    assert.match(out, /deforaImport=/);
    assert.match(out, /freecut\/projects/);
  });

  it('deforaMediaFileUrl encodes path and rootId', () => {
    const url = deforaMediaFileUrl('http://localhost:8080', 'projects/demo/x.mp4', 'uploads');
    assert.match(url, /path=projects/);
    assert.match(url, /rootId=uploads/);
  });
});
