/** Default SD-Forge checkpoint and LCM engine defaults. */

export const DEFAULT_FORGE_MODEL = "SDXL/sd_xl_turbo_1.0_fp16.safetensors";

export const DEFAULT_LCM_LORA_TAG = "<lora:lcm-lora-ssd-1b:1>";

export const DEFAULT_LCM_ENGINE = {
  enabled: false,
  steps: 1,
  loraTag: DEFAULT_LCM_LORA_TAG,
};

export function modelKey(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const base = raw.split(/[/\\]/).pop() || raw;
  return base.replace(/\s+/g, "");
}

export function modelsMatch(a, b) {
  const left = modelKey(a);
  const right = modelKey(b);
  if (!left || !right) return false;
  if (left === right) return true;
  return left.includes(right) || right.includes(left);
}

export function mergeLoraIntoPrompt(positive, loraTag) {
  const base = String(positive ?? "").trim();
  const tag = String(loraTag ?? "").trim();
  if (!tag) return base;
  if (base.includes(tag)) return base;
  if (!base) return tag;
  return `${base}, ${tag}`;
}
