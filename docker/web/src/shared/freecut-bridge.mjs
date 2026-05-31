/** Helpers for embedding FreeCut and handing off Defora media URLs. */

export function freecutBasePath(basePath = '/freecut') {
  return String(basePath || '/freecut').replace(/\/+$/, '') || '/freecut';
}

export function freecutProjectsUrl(basePath = '/freecut') {
  return `${freecutBasePath(basePath)}/projects`;
}

export function freecutEditorUrl(projectId, basePath = '/freecut') {
  const base = freecutBasePath(basePath);
  const id = String(projectId || '').trim();
  if (!id) return freecutProjectsUrl(base);
  return `${base}/editor/${encodeURIComponent(id)}`;
}

export function deforaMediaFileUrl(origin, filePath, rootId) {
  const path = String(filePath || '').trim();
  if (!path) return '';
  const q = new URLSearchParams({ path });
  if (rootId) q.set('rootId', String(rootId));
  const root = String(origin || '').replace(/\/+$/, '');
  return `${root}/api/video-swarm/file?${q.toString()}`;
}

export function buildFreecutImportMessage(mediaUrl) {
  const url = String(mediaUrl || '').trim();
  if (!url) return null;
  return { type: 'defora:import-url', url };
}
