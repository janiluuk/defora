import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStoryOllamaApiBody,
  normalizeStoryClientRequest,
  stableJsonStringify,
  storyLlmRequestLogEntry,
} from '../src/shared/story-llm-request.mjs';

describe('story-llm-request', () => {
  const client = {
    theme: 'Sky temples',
    style: 'Cinematic',
    width: 1024,
    height: 576,
    fps: 24,
    totalFrames: 96,
    numScenes: 4,
  };

  it('normalizes client request fields', () => {
    const normalized = normalizeStoryClientRequest({ theme: '  Neon  ', totalFrames: '96' });
    assert.equal(normalized.theme, 'Neon');
    assert.equal(normalized.totalFrames, 96);
    assert.equal(normalized.numScenes, 4);
  });

  it('builds ollama api body with prompt and system', () => {
    const body = buildStoryOllamaApiBody(client, { model: 'llama3.1:8b' });
    assert.equal(body.model, 'llama3.1:8b');
    assert.equal(body.format, 'json');
    assert.match(body.prompt, /Sky temples/);
    assert.match(body.prompt, /Frame starts: 0, 24, 48, 72/);
    assert.ok(body.system);
  });

  it('stableJsonStringify is deterministic', () => {
    const a = stableJsonStringify({ b: 1, a: { z: 2, y: 3 } });
    const b = stableJsonStringify({ a: { y: 3, z: 2 }, b: 1 });
    assert.equal(a, b);
  });

  it('storyLlmRequestLogEntry carries client and ollama payloads', () => {
    const ollama = buildStoryOllamaApiBody(client, { model: 'test' });
    const entry = storyLlmRequestLogEntry(client, ollama);
    assert.equal(entry.kind, 'story_llm_request');
    assert.deepEqual(entry.clientRequest, client);
    assert.deepEqual(entry.ollamaRequest, ollama);
  });
});
