/**
 * Story generator client payload + Ollama API body builders (shared by web UI and server).
 */

export function normalizeStoryClientRequest(body = {}) {
  const theme = String(body.theme || '').trim() || 'Cinematic visual journey';
  const style = String(body.style || '').trim() || 'Masterpiece, Realistic';
  const width = Math.max(64, parseInt(body.width, 10) || 1024);
  const height = Math.max(64, parseInt(body.height, 10) || 576);
  const fps = Math.max(1, parseInt(body.fps, 10) || 24);
  const totalFrames = Math.max(8, parseInt(body.totalFrames, 10) || 96);
  const numScenes = Math.max(2, parseInt(body.numScenes, 10) || 4);
  const out = { theme, style, width, height, fps, totalFrames, numScenes };
  if (body.model) out.model = String(body.model);
  return out;
}

export function storyFrameStarts(totalFrames, numScenes) {
  const framesPerScene = Math.max(1, Math.floor(totalFrames / numScenes));
  return Array.from({ length: numScenes }, (_, idx) => idx * framesPerScene);
}

export function buildStoryLlmPrompt(client) {
  const frameStarts = storyFrameStarts(client.totalFrames, client.numScenes);
  return [
    'Create a Deforum-ready story plan as JSON only.',
    `Theme: ${client.theme}`,
    `Style: ${client.style}`,
    `Canvas: ${client.width}x${client.height}`,
    `FPS: ${client.fps}`,
    `Total frames: ${client.totalFrames}`,
    `Scenes: ${client.numScenes}`,
    `Frame starts: ${frameStarts.join(', ')}`,
    'Return an object with keys: theme, style, summary, scenes, motion.',
    `The "scenes" object must contain exactly these frame keys: ${frameStarts.join(', ')}.`,
    'Each scene value should be a concise SD/Deforum prompt fragment with continuity across scenes.',
    'The "motion" object should include a few useful Deforum schedules like Zoom, Translation X, Translation Y, Rotation Z, or Transform Center X/Y when appropriate.',
    'Values in motion must be schedule strings such as 0:(1.0), 24:(1.02), 96:(1.0).',
    'Do not include markdown or code fences.',
  ].join('\n');
}

const STORY_LLM_SYSTEM_PROMPT =
  'You are a cinematic prompt planner for Deforum animations. Respond with valid JSON only and keep prompts production-ready.';

export function buildStoryOllamaApiBody(client, { model = '' } = {}) {
  const prompt = buildStoryLlmPrompt(client);
  return {
    model: String(model || client.model || '').trim(),
    stream: false,
    format: 'json',
    options: { temperature: 0.7 },
    prompt,
    system: STORY_LLM_SYSTEM_PROMPT,
  };
}

export function stableJsonStringify(value) {
  const seen = new WeakSet();
  const sortKeys = (input) => {
    if (input == null || typeof input !== 'object') return input;
    if (seen.has(input)) return null;
    seen.add(input);
    if (Array.isArray(input)) return input.map(sortKeys);
    return Object.keys(input).sort().reduce((acc, key) => {
      acc[key] = sortKeys(input[key]);
      return acc;
    }, {});
  };
  return JSON.stringify(sortKeys(value));
}

export function storyLlmRequestLogEntry(clientRequest, ollamaRequest, { id, ts } = {}) {
  return {
    id: id || `story-llm-${Date.now()}`,
    ts: ts || new Date().toISOString(),
    level: 'info',
    kind: 'story_llm_request',
    message: 'Story LLM request',
    clientRequest,
    ollamaRequest,
  };
}
