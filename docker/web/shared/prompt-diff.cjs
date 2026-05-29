/**
 * CJS entry for server/tests — keep in sync with src/shared/prompt-diff.mjs
 */
const { diffPromptLines, splitLines } = require('../src/shared/prompt-diff.mjs');

module.exports = { diffPromptLines, splitLines };
