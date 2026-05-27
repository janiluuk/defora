#!/usr/bin/env node
/**
 * Regenerate src/app-definition.js from src/App.vue for Node test harness parity (audit A-01).
 * Utility modules stay ESM for Vite; their bodies are inlined here as plain JS for require().
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const appVuePath = join(root, 'src', 'App.vue');
const outPath = join(root, 'src', 'app-definition.js');

const UTIL_MODULES = ['morph-utils.js', 'deforum-settings-schema.js', 'api-utils.js'];

function extractVueTemplate(src, label) {
  const templateOpen = src.indexOf('<template>');
  const scriptOpen = src.indexOf('<script>');
  if (templateOpen < 0 || scriptOpen < 0 || templateOpen > scriptOpen) {
    throw new Error(`Could not parse template for ${label}`);
  }
  return src
    .slice(templateOpen + '<template>'.length, src.lastIndexOf('</template>', scriptOpen))
    .trim();
}

function esmToInlineCjs(src) {
  return src
    .replace(/^export\s+(async\s+)?function\s+/gm, '$1function ')
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s+\{[^}]*\};?\s*$/gm, '')
    .replace(/^module\.exports\s*=[\s\S]*$/m, '')
    .trim();
}

function inlineUtilModule(mod) {
  const path = join(root, 'src', mod);
  const body = esmToInlineCjs(readFileSync(path, 'utf8'));
  return `// --- inlined from ${mod} (ESM source; do not edit) ---\n${body}\n`;
}

const vue = readFileSync(appVuePath, 'utf8');
const scriptOpen = vue.indexOf('<script>');
const scriptMatch = vue.match(/<script>([\s\S]*?)<\/script>/);
if (scriptOpen < 0 || !scriptMatch) {
  console.error('Could not parse App.vue script');
  process.exit(1);
}
const templateOpen = vue.indexOf('<template>');
if (templateOpen < 0 || templateOpen > scriptOpen) {
  console.error('Could not parse App.vue template');
  process.exit(1);
}
// Outermost SFC template only (inner <template v-if> must not end the match early).
const template = vue
  .slice(templateOpen + '<template>'.length, vue.lastIndexOf('</template>', scriptOpen))
  .trim();
let script = scriptMatch[1].trim();
script = script.replace(/import\s+['"]\.\/style\.css['"];?\s*/g, '');

let inlinedUtils = '';
for (const mod of UTIL_MODULES) {
  const re = new RegExp(
    `import\\s+\\{([\\s\\S]*?)\\}\\s+from\\s+['"]\\.\\/${mod.replace('.', '\\.')}['"];?`
  );
  const m = script.match(re);
  if (m) {
    inlinedUtils += inlineUtilModule(mod);
    script = script.replace(m[0], '');
  }
}
if (inlinedUtils) inlinedUtils += '\n';

function normalizeRelPath(baseRelPath, importPath) {
  const baseDir = dirname(join(root, 'src', baseRelPath.replace(/^\.\//, '')));
  const resolved = join(baseDir, importPath).replace(/\\/g, '/');
  const srcRoot = join(root, 'src').replace(/\\/g, '/');
  return `./${resolved.slice(srcRoot.length + 1)}`;
}

const emittedComponentStubs = new Set();
const emittedComponentPaths = new Set();
let needsAppViewProxyStub = false;

function extractComponentDefinition(scriptBody) {
  const usesProxy = scriptBody.includes('proxyAppView');
  const propsMatch = scriptBody.match(/props:\s*\{([\s\S]*?)\n\s*\},/);
  let propsClause = "props: ['app']";
  if (propsMatch) {
    propsClause = `props: {${propsMatch[1]}\n  }`;
  }
  const setupClause = usesProxy ? ', setup(props) { return __proxyAppView(props); }' : '';
  return { propsClause, setupClause, usesProxy };
}

function ensureComponentStub(name, relPath, lines, seen = new Set()) {
  const relKey = relPath.replace(/^\.\//, '');
  if (seen.has(relKey) || emittedComponentPaths.has(relKey)) return;
  seen.add(relKey);
  emittedComponentPaths.add(relKey);

  const componentPath = join(root, 'src', relKey);
  const componentSrc = readFileSync(componentPath, 'utf8');
  const componentTemplate = extractVueTemplate(componentSrc, relPath);
  const scriptMatch = componentSrc.match(/<script>([\s\S]*?)<\/script>/);
  const { propsClause, setupClause, usesProxy } = scriptMatch
    ? extractComponentDefinition(scriptMatch[1])
    : { propsClause: "props: ['app']", setupClause: ', setup(props) { return __proxyAppView(props); }', usesProxy: true };
  if (usesProxy) {
    needsAppViewProxyStub = true;
  }

  const childComponents = [];
  if (scriptMatch) {
    const importRe = /import\s+([A-Za-z0-9_$]+)\s+from\s+['"](\.\.?\/[^'"]+\.vue)['"]/g;
    let m;
    while ((m = importRe.exec(scriptMatch[1])) !== null) {
      const [, importName, importRel] = m;
      const nestedRel = normalizeRelPath(relPath, importRel);
      if (nestedRel.includes('/views/') || nestedRel.endsWith('SequencerControlsPanel.vue') || nestedRel.endsWith('LoraCrossfaderPanel.vue')) {
        ensureComponentStub(importName, nestedRel, lines, seen);
      } else if (nestedRel.includes('/generate/')) {
        if (!emittedComponentStubs.has(importName)) {
          lines.push(`const ${importName} = { props: ['duration', 'playhead', 'markers', 'clips', 'selectedClipId', 'tracks', 'selectedTrackId', 'paramMeta', 'frames', 'fps', 'jobFrameNumber', 'jobTotalFrames', 'jobFrameLive', 'compact', 'expandable'], template: '<div class="timeline-stub"></div>' };`);
          emittedComponentStubs.add(importName);
        }
      } else if (!emittedComponentStubs.has(importName)) {
        lines.push(`const ${importName} = { props: ['app'], template: '<div></div>' };`);
        emittedComponentStubs.add(importName);
      }
      childComponents.push(`${importName}: ${importName}`);
    }
  }

  const componentsClause = childComponents.length
    ? `, components: { ${childComponents.join(', ')} }`
    : '';
  lines.push(
    `const ${name} = { ${propsClause}${setupClause}${componentsClause}, template: ${JSON.stringify(componentTemplate)} };`
  );
  emittedComponentStubs.add(name);
}

const componentStubs = [];
script = script.replace(
  /^import\s+([A-Za-z0-9_$]+)\s+from\s+['"](\.\/components\/[^'"]+\.vue)['"];?\s*$/gm,
  (_, name, relPath) => {
    if (relPath.includes('/views/') || relPath.endsWith('SequencerControlsPanel.vue') || relPath.endsWith('LoraCrossfaderPanel.vue')) {
      ensureComponentStub(name, relPath, componentStubs);
      return '';
    }
    if (!emittedComponentStubs.has(name)) {
      componentStubs.push(`const ${name} = { props: ['app'], template: '<div></div>' };`);
      emittedComponentStubs.add(name);
    }
    return '';
  }
);
const proxyStubBlock = needsAppViewProxyStub
  ? `function __proxyAppView(props) {
  return new Proxy({}, {
    get(_target, key) {
      return Reflect.get(props.app, key);
    },
    set(_target, key, value) {
      Reflect.set(props.app, key, value);
      return true;
    },
    has(_target, key) {
      return key in props.app;
    },
    getOwnPropertyDescriptor(_target, key) {
      return {
        configurable: true,
        enumerable: true,
        value: Reflect.get(props.app, key),
        writable: true,
      };
    },
  });
}

`
  : '';
const stubBlock = componentStubs.length
  ? `${proxyStubBlock}${componentStubs.join('\n')}\n\n`
  : '';

script = script.replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*/gm, '').trim();
const exportDefaultIndex = script.indexOf('export default');
if (exportDefaultIndex < 0) {
  console.error('Could not locate export default in App.vue script');
  process.exit(1);
}
const preamble = script.slice(0, exportDefaultIndex).trim();
const componentObject = script.slice(exportDefaultIndex).replace(/export\s+default\s+/, '').trim();
const inner = componentObject.startsWith('{') && componentObject.endsWith('}')
  ? componentObject.slice(1, -1).trim()
  : componentObject;
const preambleBlock = preamble ? `${preamble}\n\n` : '';

const header = `// Auto-generated from App.vue — run: npm run sync-app-definition (audit A-01)\n\n`;
const body = `${header}${inlinedUtils}${stubBlock}${preambleBlock}module.exports = {
  template: ${JSON.stringify(template)},
  ${inner}
};
`;
writeFileSync(outPath, body);
console.log('Wrote', outPath);
