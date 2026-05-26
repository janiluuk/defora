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

const componentStubs = [];
script = script.replace(
  /^import\s+([A-Za-z0-9_$]+)\s+from\s+['"](\.\/components\/[^'"]+\.vue)['"];?\s*$/gm,
  (_, name, relPath) => {
    if (relPath.includes('/views/')) {
      const componentPath = join(root, 'src', relPath.replace(/^\.\//, ''));
      const componentSrc = readFileSync(componentPath, 'utf8');
      const componentTemplate = extractVueTemplate(componentSrc, relPath);
      componentStubs.push(
        `const ${name} = { props: ['app'], setup(props) { return props.app; }, template: ${JSON.stringify(componentTemplate)} };`
      );
      return '';
    }
    componentStubs.push(`const ${name} = { template: '<div></div>' };`);
    return '';
  }
);
const stubBlock = componentStubs.length
  ? `${componentStubs.join('\n')}\n\n`
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
