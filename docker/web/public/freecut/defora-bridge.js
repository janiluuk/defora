/**
 * Defora ↔ FreeCut handoff: auto-import library videos via URL or postMessage.
 * Loaded on every FreeCut SPA page (see server.js inject + index.html).
 */
(function deforaFreecutBridge() {
  const IMPORT_PARAM = 'deforaImport';
  const MESSAGE_TYPE = 'defora:import-url';
  const MAX_ATTEMPTS = 80;
  const RETRY_MS = 400;

  let pendingUrl = '';
  let attemptTimer = null;
  let attempts = 0;

  function readPendingFromQuery() {
    try {
      const q = new URLSearchParams(window.location.search);
      const raw = q.get(IMPORT_PARAM);
      if (raw) return decodeURIComponent(raw);
    } catch (_e) { /* ignore */ }
    return '';
  }

  function normalizeUrl(url) {
    const u = String(url || '').trim();
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith('/')) return `${window.location.origin}${u}`;
    return u;
  }

  function textOf(el) {
    return (el && (el.textContent || el.innerText || '')).trim();
  }

  function clickEl(el) {
    if (!el) return false;
    try {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return true;
    } catch (_e) {
      return false;
    }
  }

  function findButtonByLabel(re) {
    const nodes = document.querySelectorAll('button, [role="button"], a');
    for (const el of nodes) {
      const label = textOf(el);
      if (re.test(label)) return el;
    }
    return null;
  }

  function findImportUrlTrigger() {
    const byAria = document.querySelector(
      'button[aria-label*="URL" i], button[title*="URL" i], [role="button"][aria-label*="URL" i]',
    );
    if (byAria) return byAria;
    const mediaPanel = [...document.querySelectorAll('aside, section, div')].find((el) => {
      const t = textOf(el);
      return t.includes('Media') && (t.includes('Import') || t.includes('Drop files'));
    });
    if (mediaPanel) {
      const buttons = mediaPanel.querySelectorAll('button, [role="button"]');
      for (const btn of buttons) {
        const label = textOf(btn);
        if (/^import$/i.test(label)) continue;
        if (/url|link/i.test(label) || btn.querySelector('svg')) {
          if (btn !== findButtonByLabel(/^import$/i)) return btn;
        }
      }
      const iconButtons = mediaPanel.querySelectorAll('button');
      if (iconButtons.length >= 2) return iconButtons[iconButtons.length - 1];
    }
    return document.querySelector('button[data-testid*="url" i], button[data-testid*="import-url" i]');
  }

  function findUrlDialog() {
    const dialogs = document.querySelectorAll('[role="dialog"], dialog');
    for (const dlg of dialogs) {
      const t = textOf(dlg);
      if (/import\s+from\s+url/i.test(t)) return dlg;
    }
    return null;
  }

  function submitUrlDialog(url) {
    const dlg = findUrlDialog();
    if (!dlg) return false;
    const input = dlg.querySelector(
      'input[type="url"], input[type="text"], input:not([type="hidden"]):not([type="checkbox"])',
    );
    if (!input) return false;
    input.focus();
    input.value = url;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    const confirm = [...dlg.querySelectorAll('button, [role="button"]')].find((btn) => {
      const label = textOf(btn);
      return /^import$/i.test(label) && !/cancel/i.test(label);
    });
    if (!confirm) return false;
    clickEl(confirm);
    return true;
  }

  function openImportUrlDialog() {
    if (findUrlDialog()) return true;
    const trigger = findImportUrlTrigger();
    if (trigger) clickEl(trigger);
    return !!findUrlDialog();
  }

  function submitNewProjectWizard() {
    const body = textOf(document.body);
    if (!/project name/i.test(body) && !/enter project name/i.test(body)) return false;
    const nameInput = document.querySelector(
      'input[placeholder*="project name" i], input[placeholder*="Enter project" i], input[type="text"]',
    );
    if (nameInput && !nameInput.value) {
      nameInput.value = 'Defora import';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const createBtn = findButtonByLabel(/create\s+project/i) || findButtonByLabel(/^create$/i);
    if (createBtn) clickEl(createBtn);
    return !!createBtn;
  }

  function ensureEditorSurface() {
    const path = window.location.pathname || '';
    const body = textOf(document.body);
    if (/\/editor\//i.test(path)) return true;
    if (body.includes('Media') && (body.includes('Import') || body.includes('Drop files'))) return true;
    if (/project name/i.test(body) || /enter project name/i.test(body)) {
      return submitNewProjectWizard();
    }
    if (!/\/projects\/?$/i.test(path) && !path.endsWith('/projects')) {
      return !!document.querySelector('.timeline-hero, [class*="timeline"]');
    }
    const newBtn =
      findButtonByLabel(/\+\s*new\s+project/i)
      || findButtonByLabel(/new\s+project/i);
    const cards = document.querySelectorAll(
      'a[href*="/editor/"], [data-testid*="project" i], button[class*="project" i], [class*="project-card" i]',
    );
    if (cards.length > 0) {
      clickEl(cards[0]);
      return true;
    }
    if (newBtn) {
      clickEl(newBtn);
      return submitNewProjectWizard() || true;
    }
    return false;
  }

  function mediaImported() {
    const body = textOf(document.body);
    if (/no media yet/i.test(body)) return false;
    const thumbs = document.querySelectorAll(
      '[class*="media" i] img, [class*="MediaCard" i], [data-testid*="media" i], video',
    );
    if (thumbs.length > 0) return true;
    return /timeline|V1|A1|Drop files here or click Import/i.test(body) && !/welcome to freecut/i.test(body);
  }

  function tryImportOnce(url) {
    if (mediaImported()) {
      window.dispatchEvent(new CustomEvent('defora:import-complete', { detail: { url } }));
      return true;
    }
    ensureEditorSurface();
    if (openImportUrlDialog() && submitUrlDialog(url)) {
      return false;
    }
    const importBtn = findButtonByLabel(/^import$/i);
    if (importBtn && !findUrlDialog()) clickEl(importBtn);
    return false;
  }

  function queueImport(url) {
    const normalized = normalizeUrl(url);
    if (!normalized) return;
    pendingUrl = normalized;
    attempts = 0;
    if (attemptTimer) clearInterval(attemptTimer);
    attemptTimer = setInterval(() => {
      attempts += 1;
      if (!pendingUrl || attempts > MAX_ATTEMPTS) {
        clearInterval(attemptTimer);
        attemptTimer = null;
        return;
      }
      if (tryImportOnce(pendingUrl) || mediaImported()) {
        pendingUrl = '';
        clearInterval(attemptTimer);
        attemptTimer = null;
      }
    }, RETRY_MS);
    tryImportOnce(normalized);
  }

  window.addEventListener('message', (event) => {
    if (!event || !event.data || event.data.type !== MESSAGE_TYPE) return;
    const originOk =
      event.origin === window.location.origin
      || event.origin === 'null'
      || !event.origin;
    if (!originOk) return;
    queueImport(event.data.url);
  });

  const initial = readPendingFromQuery();
  if (initial) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => queueImport(initial), { once: true });
    } else {
      queueImport(initial);
    }
  }

  window.__deforaFreecutBridge = { queueImport, normalizeUrl };
})();
