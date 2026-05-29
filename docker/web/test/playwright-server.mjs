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

/** Start server.js for Playwright with CI-safe defaults (no outbound Forge/Ollama). */
export async function startE2eServer(opts = {}) {
  const root = opts.root || opts.tmpRoot;
  const gpuPoolPath =
    opts.gpuPoolPath || (root ? writeEmptyGpuPool(root) : path.join(process.cwd(), "gpu-pool-e2e.json"));
  const prev = {
    DEFORA_CI_OFFLINE: process.env.DEFORA_CI_OFFLINE,
    GITHUB_ACTIONS: process.env.GITHUB_ACTIONS,
  };
  process.env.DEFORA_CI_OFFLINE = "1";
  if (!process.env.GITHUB_ACTIONS) process.env.GITHUB_ACTIONS = "true";
  try {
    return await start({
      enableMq: false,
      gpuPoolPath,
      ...opts,
    });
  } finally {
    if (prev.DEFORA_CI_OFFLINE === undefined) delete process.env.DEFORA_CI_OFFLINE;
    else process.env.DEFORA_CI_OFFLINE = prev.DEFORA_CI_OFFLINE;
    if (prev.GITHUB_ACTIONS === undefined) delete process.env.GITHUB_ACTIONS;
    else process.env.GITHUB_ACTIONS = prev.GITHUB_ACTIONS;
  }
}
