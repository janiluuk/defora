/**
 * Shared E2E server bootstrap: empty GPU pool, CI quiet mode, no external Forge/LLM probes.
 */
import fs from "fs";
import path from "path";
import { start } from "../server.js";

export function writeEmptyGpuPool(dir) {
  const gpuPoolPath = path.join(dir, "gpu-pool.json");
  fs.writeFileSync(
    gpuPoolPath,
    JSON.stringify(
      {
        enabled: false,
        strategy: "least_busy",
        defaultForgeModel: "",
        nodes: [],
      },
      null,
      2,
    ),
  );
  return gpuPoolPath;
}

function e2eEnv(extra = {}) {
  return {
    ...process.env,
    DEFORA_CI_OFFLINE: "1",
    GITHUB_ACTIONS: process.env.GITHUB_ACTIONS || "true",
    SD_FORGE_HOST: "127.0.0.1",
    SD_FORGE_PORT: "9",
    OLLAMA_BASE_URL: "http://127.0.0.1:9",
    ...extra,
  };
}

/** Start server.js for Playwright with CI-safe defaults (no outbound Forge/Ollama). */
export async function startE2eServer(opts = {}) {
  const root = opts.root || opts.tmpRoot;
  const gpuPoolPath =
    opts.gpuPoolPath || (root ? writeEmptyGpuPool(root) : path.join(process.cwd(), "gpu-pool-e2e.json"));
  const env = e2eEnv(opts.env);
  return start({
    enableMq: false,
    gpuPoolPath,
    ...opts,
    env,
  });
}
