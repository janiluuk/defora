#!/usr/bin/env node

const { start } = require("../server");

let service = null;
let closing = false;

async function shutdown(code = 0) {
  if (closing) return;
  closing = true;
  try {
    if (service && typeof service.close === "function") {
      await service.close();
    }
  } catch (err) {
    console.error("[test-server] shutdown error", err);
    code = 1;
  } finally {
    process.exit(code);
  }
}

start()
  .then((svc) => {
    service = svc;
    console.log(`[test-server] listening on ${svc.port}`);
    ["SIGINT", "SIGTERM"].forEach((sig) => {
      process.on(sig, () => {
        void shutdown(0);
      });
    });
  })
  .catch((err) => {
    console.error("[test-server] startup error", err);
    process.exit(1);
  });
