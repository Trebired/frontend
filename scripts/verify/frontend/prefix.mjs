import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const VENDOR_PREFIXES = ["cropper-", "monaco-"];
const SELECTOR_PATTERN = /(^|\})\s*([^{}@]+)\{/gu;
const CLASS_PATTERN = /\.(-?[A-Za-z_][A-Za-z0-9_-]*)/gu;

function isVendor(name) {
  return VENDOR_PREFIXES.some((prefix) => name.startsWith(prefix));
}

async function stylesheetsUnder(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await stylesheetsUnder(full));
    else if (entry.name.endsWith(".scss")) out.push(full);
  }
  return out;
}

async function verifyClassPrefix(context) {
  const prefix = (await context.importDist("config")).DEFAULT_FRONTEND_CONFIG.prefix;
  const containerPrefix = `${prefix}m`;
  const sheets = await stylesheetsUnder(path.join(context.rootDir, "src"));
  assert.ok(sheets.length > 10, "the package has stylesheets to check");

  const offenders = new Map();
  for (const sheet of sheets) {
    const css = await fs.readFile(sheet, "utf8");
    for (const match of css.matchAll(SELECTOR_PATTERN)) {
      for (const found of match[2].matchAll(CLASS_PATTERN)) {
        const name = found[1];
        if (name.startsWith(`${prefix}-`) || name.startsWith(`${containerPrefix}-`)) continue;
        if (isVendor(name)) continue;
        if (match[2].includes("ns.class") || match[2].includes("ns.element-class")) continue;
        if (match[2].includes("ns.modifier") || match[2].includes("#{")) continue;
        offenders.set(name, path.relative(context.rootDir, sheet));
      }
    }
  }

  assert.deepEqual(
    [...offenders.entries()],
    [],
    `every class the package writes is namespaced: ${[...offenders].map(([name, file]) => `${name} in ${file}`).join(", ")}`,
  );

  const markup = await fs.readFile(
    path.join(context.rootDir, "src", "surface", "components", "index.tsx"),
    "utf8",
  );
  assert.ok(
    !/className="[a-z]/u.test(markup),
    "a component names its classes through the namespace helpers, never as a literal",
  );
}

export { verifyClassPrefix };
