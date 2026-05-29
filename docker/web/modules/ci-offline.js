/**
 * Guard external Forge / Ollama / GPU-pool probes in GitHub Actions and other CI.
 *
 * - skipBackgroundProbes / isQuietMode: startup probes + client quiet boot (GITHUB_ACTIONS or DEFORA_CI_OFFLINE)
 * - blockExternalFetches: block outbound Forge/LLM HTTP from the server (same condition)
 */

function truthyEnv(value) {
  return value === "1" || value === "true" || value === "yes";
}

function isCiOffline(env = process.env) {
  return truthyEnv(env.DEFORA_CI_OFFLINE);
}

function skipBackgroundProbes(env = process.env) {
  return isCiOffline(env) || env.GITHUB_ACTIONS === "true";
}

function isQuietMode(env = process.env) {
  return skipBackgroundProbes(env);
}

function blockExternalFetches(env = process.env) {
  return skipBackgroundProbes(env);
}

function isPrivateHost(host) {
  const h = String(host || "").toLowerCase();
  if (!h || h === "localhost" || h === "127.0.0.1" || h === "::1") return false;
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) return true;
  if (h.startsWith("vimage")) return true;
  return false;
}

function isBlockedExternalUrl(url) {
  try {
    const parsed = new URL(String(url));
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") return false;
    const path = parsed.pathname || "";
    if (
      path.startsWith("/sdapi/") ||
      path.startsWith("/deforum_api/") ||
      path.startsWith("/controlnet") ||
      path === "/api/tags" ||
      path === "/api/generate" ||
      path === "/system_stats"
    ) {
      return true;
    }
    return isPrivateHost(host);
  } catch (_e) {
    return true;
  }
}

function installCiFetchGuard(env = process.env) {
  if (!blockExternalFetches(env) || typeof global.fetch !== "function" || global.fetch.__deforaCiGuard) {
    return;
  }
  const nativeFetch = global.fetch.bind(global);
  const guarded = async function deforaCiGuardedFetch(input, init) {
    const url = typeof input === "string" ? input : input?.url || String(input);
    if (isBlockedExternalUrl(url)) {
      const err = new Error("External services disabled in CI");
      err.name = "CiOfflineError";
      err.ciOffline = true;
      throw err;
    }
    return nativeFetch(input, init);
  };
  guarded.__deforaCiGuard = true;
  global.fetch = guarded;
}

module.exports = {
  isCiOffline,
  skipBackgroundProbes,
  isQuietMode,
  blockExternalFetches,
  isBlockedExternalUrl,
  installCiFetchGuard,
};
