#!/usr/bin/env node
/**
 * Regenerate src/app-definition.js from src/App.vue for Node test harness parity (audit A-01).
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const appVuePath = join(root, 'src', 'App.vue');
const outPath = join(root, 'src', 'app-definition.js');

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
let morphRequire = '';
for (const mod of ['morph-utils.js', 'deforum-settings-schema.js']) {
  const re = new RegExp(
    `import\\s+\\{([\\s\\S]*?)\\}\\s+from\\s+['"]\\.\\/${mod.replace('.', '\\.')}['"];?`
  );
  const m = script.match(re);
  if (m) {
    const names = m[1].replace(/\s+/g, ' ').trim().replace(/,\s*$/, '');
    morphRequire += `const { ${names} } = require('./${mod}');\n`;
    script = script.replace(m[0], '');
  }
}
if (morphRequire) morphRequire += '\n';
script = script.replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*/gm, '');
script = script.replace(/export\s+default\s+/, '').trim();
const inner = script.startsWith('{') && script.endsWith('}')
  ? script.slice(1, -1).trim()
  : script;

const header = `// Auto-generated from App.vue — run: npm run sync-app-definition (audit A-01)\n\n`;
const body = `${header}${morphRequire}module.exports = {
  template: ${JSON.stringify(template)},
  ${inner}
};
`;
writeFileSync(outPath, body);
console.log('Wrote', outPath);
