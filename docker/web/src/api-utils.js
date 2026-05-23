/**
 * Fetch helper with structured console errors (audit post-remediation polish).
 */
export async function apiFetch(url, options = {}, context = 'API') {
  const label = context || url;
  try {
    const res = await fetch(url, options);
    let data = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try {
        data = await res.json();
      } catch (_) {
        data = null;
      }
    } else {
      const text = await res.text();
      if (text) data = { _raw: text.slice(0, 200) };
    }
    if (!res.ok) {
      const detail = (data && (data.error || data.message)) || res.statusText || `HTTP ${res.status}`;
      console.error(`[Defora ${label}] ${res.status}: ${detail}`, data || '');
      const err = new Error(detail);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return { res, data };
  } catch (err) {
    if (err.status) throw err;
    console.error(`[Defora ${label}] Network error: ${err.message}`);
    throw err;
  }
}

export function modelSourceLabel(source) {
  if (source === 'sd-forge') return 'Forge';
  if (source === 'cache') return 'Cache';
  if (source === 'placeholder') return 'Placeholder';
  return source || 'Unknown';
}
