/**
 * Lightweight perf regression guard — runs against a live test server when WEB_TEST_PORT is set.
 * CI sets SKIP_PERF_REGRESSION=1 by default; nightly or local runs can opt in.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const BUDGET_MS = Number(process.env.PERF_HEALTH_BUDGET_MS || 250);

function getJson(path, port) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const req = http.get(
      { hostname: '127.0.0.1', port, path, timeout: BUDGET_MS * 2 },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          resolve({ status: res.statusCode, body, elapsedMs: Date.now() - started });
        });
      },
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });
  });
}

describe('perf regression scaffolding', () => {
  it('health and status endpoints respond within budget when WEB_TEST_PORT is set', async (t) => {
    if (process.env.SKIP_PERF_REGRESSION === '1') {
      t.skip('SKIP_PERF_REGRESSION=1');
      return;
    }
    const port = Number(process.env.WEB_TEST_PORT || 0);
    if (!port) {
      t.skip('WEB_TEST_PORT not set');
      return;
    }
    for (const path of ['/api/health', '/api/status', '/api/frames?limit=4']) {
      const { status, elapsedMs } = await getJson(path, port);
      assert.equal(status, 200, `${path} status`);
      assert.ok(elapsedMs < BUDGET_MS, `${path} took ${elapsedMs}ms (budget ${BUDGET_MS}ms)`);
    }
  });
});
