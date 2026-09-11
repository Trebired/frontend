import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveLogger } from "@package/logger-adapter";

const log = resolveLogger({ source: "@trebired/frontend" });

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const { generateFaviconAssets, loadConfig } = await import(
  path.join(rootDir, "dist", "config", "index.js")
);

const LIGHT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#ffffff"/></svg>';
const DARK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#101010"/></svg>';

const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "tbf-favicon-"));

async function writeProject(favicon) {
  const brand = path.join(tempRoot, "brand");
  await fs.mkdir(brand, { recursive: true });
  await fs.writeFile(path.join(brand, "favicon.svg"), LIGHT_SVG);
  await fs.writeFile(path.join(brand, "favicon-dark.svg"), DARK_SVG);
  const dir = path.join(tempRoot, ".trebired", "frontend");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, "config.ts"),
    `export default ${JSON.stringify({ forVersion: packageVersion(), assets: { favicon } }, null, 2)};\n`,
  );
}

const packageJson = JSON.parse(
  await fs.readFile(path.join(rootDir, "package.json"), "utf8"),
);

function packageVersion() {
  return packageJson.version;
}

function byPath(files, name) {
  return files.find((file) => file.path === name);
}

function linkFor(links, predicate) {
  return links.find(predicate);
}

await writeProject({
    dark: "brand/favicon-dark.svg",
    default: "brand/favicon.svg",
});

const loaded = await loadConfig(tempRoot, { defaultIfMissing: true, searchFrom: tempRoot });
const generated = await generateFaviconAssets(loaded.config, { rootDir: tempRoot });

assert.ok(byPath(generated.files, "favicon.svg"), "emits favicon.svg");
assert.ok(byPath(generated.files, "favicon-dark.svg"), "emits favicon-dark.svg");

const svgLink = linkFor(generated.links, (link) => link.href === "/favicon.svg");
assert.equal(svgLink.type, "image/svg+xml");
assert.equal(svgLink.id, "app_favicon", "primary link keeps the id syncFavicon targets");

const darkLink = linkFor(generated.links, (link) => link.href === "/favicon-dark.svg");
assert.equal(darkLink.media, "(prefers-color-scheme: dark)");

assert.notDeepEqual(
  Array.from(byPath(generated.files, "favicon.svg").contents),
  Array.from(byPath(generated.files, "favicon-dark.svg").contents),
  "light and dark variants must come from separate sources",
);

if (generated.rasterized) {
  const ico = byPath(generated.files, "favicon.ico");
  assert.ok(ico, "emits favicon.ico");
  const view = new DataView(ico.contents.buffer, ico.contents.byteOffset, ico.contents.byteLength);
  assert.equal(view.getUint16(0, true), 0, "ico reserved field");
  assert.equal(view.getUint16(2, true), 1, "ico type is icon");
  assert.equal(view.getUint16(4, true), 3, "ico carries three frames");

  const apple = byPath(generated.files, "apple-touch-icon.png");
  assert.ok(apple, "emits apple-touch-icon.png");
  const png = apple.contents;
  assert.deepEqual(Array.from(png.slice(0, 4)), [0x89, 0x50, 0x4e, 0x47], "png magic");
  const width = new DataView(png.buffer, png.byteOffset).getUint32(16);
  const height = new DataView(png.buffer, png.byteOffset).getUint32(20);
  assert.equal(width, 180, "apple touch icon width");
  assert.equal(height, 180, "apple touch icon height");

  assert.ok(byPath(generated.files, "icon-192.png"), "emits icon-192.png");
  assert.ok(byPath(generated.files, "icon-512.png"), "emits icon-512.png");
  assert.ok(
    linkFor(generated.links, (link) => link.rel === "apple-touch-icon"),
    "emits apple-touch-icon link",
  );
  log.info("verify.favicon", "Favicon verification succeeded (raster path).");
} else {
  assert.equal(generated.files.length, 2, "without sharp only the svg sources are emitted");
  assert.ok(
    !linkFor(generated.links, (link) => link.href === "/favicon.ico"),
    "no ico link without a rasterizer",
  );
  log.info("verify.favicon", "Favicon verification succeeded (svg-only fallback, sharp absent).");
}

await writeProject(false);
const disabledLoaded = await loadConfig(tempRoot, { defaultIfMissing: true, searchFrom: tempRoot });
const disabled = await generateFaviconAssets(disabledLoaded.config, { rootDir: tempRoot });
assert.deepEqual(disabled.files, [], "disabled favicon emits nothing");
assert.deepEqual(disabled.links, [], "disabled favicon emits no links");

await fs.rm(tempRoot, { force: true, recursive: true });
