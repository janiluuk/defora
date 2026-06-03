function parseScheduleConstant(raw) {
  if (raw == null) return undefined;
  if (typeof raw === 'number') return raw;
  const s = String(raw);
  const m = s.match(/\(([^)]+)\)/);
  if (m) {
    const n = parseFloat(m[1]);
    if (Number.isFinite(n)) return n;
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : s;
}

function firstPromptFromSettings(settings) {
  if (!settings || typeof settings !== 'object') return undefined;
  const prompts = settings.prompts;
  if (prompts && typeof prompts === 'object') {
    const key = Object.keys(prompts).sort((a, b) => Number(a) - Number(b))[0];
    if (key != null) return prompts[key];
  }
  return settings.animation_prompts_positive || settings.prompt;
}

export function buildRunDetailCurrentContext({ deforumSettings, forgeModel, promptStyles } = {}) {
  const settings = deforumSettings && typeof deforumSettings === 'object' ? deforumSettings : {};
  const byPath = new Map([
    ['model', settings.sd_model_name || settings.sd_model_checkpoint || forgeModel],
    ['seed', settings.seed],
    ['steps', settings.steps],
    ['frame_count', settings.max_frames],
    ['length_frames', settings.max_frames],
    ['max_frames', settings.max_frames],
    ['fps', settings.fps],
    ['tag', settings.batch_name],
    ['prompt_positive', firstPromptFromSettings(settings)],
    ['prompt_negative', settings.negative_prompts || settings.negative_prompt],
    ['cfg', parseScheduleConstant(settings.cfg_scale_schedule)],
    ['strength', parseScheduleConstant(settings.strength_schedule)],
  ]);
  if (promptStyles && typeof promptStyles === 'object') {
    byPath.set('style_id', promptStyles.activeStyleId || promptStyles.activeStyle?.id);
    byPath.set('style_name', promptStyles.activeStyle?.name);
    byPath.set('style_positive_append', promptStyles.morphedAppend?.positive || promptStyles.activeStyle?.positive);
    byPath.set('style_negative_append', promptStyles.morphedAppend?.negative || promptStyles.activeStyle?.negative);
  }
  return { settings, byPath, promptStyles: promptStyles || null };
}

export function valuesEqual(a, b) {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
  if (typeof a === 'string' && typeof b === 'number') return String(a) === String(b);
  if (typeof a === 'number' && typeof b === 'string') return String(a) === String(b);
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export function formatJsonCell(value) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') {
    return value.length > 160 ? `${value.slice(0, 160)}…` : value;
  }
  if (typeof value === 'object') {
    try {
      const text = JSON.stringify(value);
      return text.length > 160 ? `${text.slice(0, 160)}…` : text;
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function lookupCurrentValue(path, ctx) {
  if (!path || !ctx) return undefined;
  const settings = ctx.settings || {};
  const settingsPrefixes = ['job.snapshot.settings.', 'job.settings.', 'snapshot.settings.'];
  for (const prefix of settingsPrefixes) {
    if (path.startsWith(prefix)) {
      const key = path.slice(prefix.length);
      if (Object.prototype.hasOwnProperty.call(settings, key)) return settings[key];
      return undefined;
    }
  }
  const topKey = path.split(/[.[]/)[0];
  if (ctx.byPath && ctx.byPath.has(topKey)) return ctx.byPath.get(topKey);
  if (topKey === 'promptStyles' && ctx.promptStyles) {
    const sub = path.slice('promptStyles.'.length);
    if (!sub || sub === 'promptStyles') return ctx.promptStyles;
    const parts = sub.split('.');
    let cur = ctx.promptStyles;
    for (const part of parts) {
      if (cur == null) return undefined;
      cur = cur[part];
    }
    return cur;
  }
  if (Object.prototype.hasOwnProperty.call(settings, path)) return settings[path];
  if (Object.prototype.hasOwnProperty.call(settings, topKey)) return settings[topKey];
  if (topKey === '_batch' && path.includes('model')) {
    return ctx.byPath.get('model');
  }
  return undefined;
}

function shouldSummarizeArray(path, value) {
  return Array.isArray(value) && value.length > 16 && /(^|\.)frames$/.test(path);
}

export function flattenRunDetail(value, prefix = '') {
  const rows = [];
  if (value === null || value === undefined) {
    rows.push({ path: prefix || '(root)', value });
    return rows;
  }
  if (typeof value !== 'object') {
    rows.push({ path: prefix || '(root)', value });
    return rows;
  }
  if (Array.isArray(value)) {
    if (shouldSummarizeArray(prefix, value)) {
      rows.push({
        path: prefix,
        value,
        summary: `[${value.length} items] ${value[0] ?? ''}${value.length > 1 ? ` … ${value[value.length - 1]}` : ''}`,
      });
      return rows;
    }
    if (value.length === 0) {
      rows.push({ path: prefix, value: [] });
      return rows;
    }
    value.forEach((item, index) => {
      rows.push(...flattenRunDetail(item, `${prefix}[${index}]`));
    });
    return rows;
  }
  const keys = Object.keys(value).sort();
  if (!prefix) {
    keys.forEach((key) => rows.push(...flattenRunDetail(value[key], key)));
    return rows;
  }
  keys.forEach((key) => rows.push(...flattenRunDetail(value[key], `${prefix}.${key}`)));
  return rows;
}

export function buildRunDetailJsonRows(runDetail, currentContext, { diffOnly = false } = {}) {
  if (!runDetail || typeof runDetail !== 'object') return [];
  const flat = flattenRunDetail(runDetail);
  const rows = flat.map((entry) => {
    const current = lookupCurrentValue(entry.path, currentContext);
    const hasCurrent = current !== undefined;
    const differs = hasCurrent && !valuesEqual(entry.value, current);
    return {
      path: entry.path,
      value: entry.value,
      displayValue: entry.summary != null ? entry.summary : formatJsonCell(entry.value),
      current,
      displayCurrent: hasCurrent ? formatJsonCell(current) : '',
      hasCurrent,
      differs,
    };
  });
  if (diffOnly) return rows.filter((row) => row.differs);
  return rows;
}

export function runDetailJsonPretty(runDetail) {
  if (!runDetail) return '';
  try {
    return JSON.stringify(runDetail, null, 2);
  } catch {
    return String(runDetail);
  }
}
