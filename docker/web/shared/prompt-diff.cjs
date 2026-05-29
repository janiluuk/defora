/**
 * CJS entry for server/tests — keep in sync with src/shared/prompt-diff.mjs
 */

function splitLines(text) {
  const raw = String(text || "").replace(/\r\n/g, "\n");
  if (!raw.trim()) return [];
  return raw.split("\n");
}

/**
 * @returns {{ left: string, right: string, kind: 'same'|'changed'|'added'|'removed' }[]}
 */
function diffPromptLines(leftText, rightText) {
  const left = splitLines(leftText);
  const right = splitLines(rightText);
  const n = left.length;
  const m = right.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = left[i] === right[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const chunks = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (left[i] === right[j]) {
      chunks.push({ left: left[i], right: right[j], kind: "same" });
      i++;
      j++;
      continue;
    }
    if (dp[i + 1][j] >= dp[i][j + 1]) {
      chunks.push({ left: left[i], right: "", kind: "removed" });
      i++;
    } else {
      chunks.push({ left: "", right: right[j], kind: "added" });
      j++;
    }
  }
  while (i < n) {
    chunks.push({ left: left[i], right: "", kind: "removed" });
    i++;
  }
  while (j < m) {
    chunks.push({ left: "", right: right[j], kind: "added" });
    j++;
  }
  return chunks;
}

module.exports = { diffPromptLines, splitLines };
