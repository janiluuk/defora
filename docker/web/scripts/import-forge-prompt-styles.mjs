#!/usr/bin/env node
/**
 * Import Forge / A1111 prompt styles into data/prompt-styles-seed.json and prompt-styles.json.
 *
 * Usage:
 *   node scripts/import-forge-prompt-styles.mjs
 *   FORGE_URL=http://192.168.2.104:7860 node scripts/import-forge-prompt-styles.mjs --write
 */
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const { importFromForge, readStyles, writeStyles } = require("../modules/prompt-styles-store.js");

const forgeUrl = process.env.FORGE_URL || process.env.FORGE_BASE_URL || "http://192.168.2.104:7860";
const writeLive = process.argv.includes("--write");

async function main() {
  const result = await importFromForge(forgeUrl, webRoot, { merge: true });
  console.log(`Imported from ${forgeUrl}:`, result);
  if (writeLive) {
    const styles = await readStyles(webRoot);
    console.log(`Live store now has ${styles.length} styles`);
  } else {
    const styles = await readStyles(webRoot);
    const seedPath = join(webRoot, "data", "prompt-styles-seed.json");
    await writeStyles(webRoot, styles);
    const fs = await import("fs/promises");
    const seed = JSON.parse(await fs.readFile(seedPath, "utf8").catch(() => '{"styles":[]}'));
    seed.styles = styles;
    seed.importedFrom = `${forgeUrl}/sdapi/v1/prompt-styles`;
    seed.count = styles.length;
    seed.updatedAt = new Date().toISOString();
    await fs.writeFile(seedPath, JSON.stringify(seed, null, 2), "utf8");
    console.log(`Updated seed: ${seedPath} (${styles.length} styles)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
