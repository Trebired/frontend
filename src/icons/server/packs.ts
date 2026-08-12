import fs from "node:fs";
import path from "node:path";

import {
  normalizeHexColor,
  normalizeIconName,
} from "#bu1nq95e3k0f";
import type { IconPack } from "#bu1nq95e3k0f";
import { listSvgFiles } from "./files.js";
import { normalizeIconPackList, resolveIconPackRoot } from "./options.js";
import type { IconPackIndex, IconServerOptions } from "./types.js";

const SOURCE_COLOR_ICON_PACKS = ["material-icon-theme"];
const packIndexCache = new Map<string, IconPackIndex|null>();
const simpleIconColorCache = new Map<string, Map<string, string>>();

function buildPackIndex(
  pack: IconPack,
  options: IconServerOptions = {},
): IconPackIndex | null {
  const packRoot = resolveIconPackRoot(pack, options);
  const cacheKey = `${pack}:${packRoot}`;
  if (packIndexCache.has(cacheKey)) return packIndexCache.get(cacheKey) || null;
  if (!packRoot || !fs.existsSync(packRoot) || !fs.statSync(packRoot).isDirectory()) {
    packIndexCache.set(cacheKey, null);
    return null;
  }
  const byName = new Map<string, string>();
  const duplicates = new Map<string, string[]>();
  for (const filePath of listSvgFiles(packRoot)) {
    const icon = normalizeIconName(path.basename(filePath));
    if (!icon) continue;
    const existing = byName.get(icon);
    if (existing) {
      if (!duplicates.has(icon)) duplicates.set(icon, [existing]);
      duplicates.get(icon)!.push(filePath);
      continue;
    }
    byName.set(icon, filePath);
  }
  const index = { byName, duplicates, packRoot };
  packIndexCache.set(cacheKey, index);
  return index;
}

function shouldPreserveSourceColors(
  pack: IconPack,
  options: IconServerOptions = {},
): boolean {
  if (options.preserveSourceColors === true) return true;
  if (Array.isArray(options.preserveSourceColors)) {
    return normalizeIconPackList(options.preserveSourceColors).includes(pack);
  }
  return SOURCE_COLOR_ICON_PACKS.includes(pack);
}

function readSimpleIconColorMap(options: IconServerOptions = {}): Map<string, string> {
  const packRoot = resolveIconPackRoot("simple-icons", options);
  if (simpleIconColorCache.has(packRoot)) return simpleIconColorCache.get(packRoot)!;
  const colors = new Map<string, string>();
  const dataPath = path.join(packRoot, "data", "simple-icons.json");
  try {
    const parsed = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const entries = Array.isArray(parsed) ? parsed : [];
    for (const entry of entries) {
      const slug = normalizeIconName(entry?.slug);
      const color = normalizeHexColor(entry?.hex);
      if (slug && color && color.toLowerCase() !== "#000000") colors.set(slug, color);
    }
  } catch {}
  simpleIconColorCache.set(packRoot, colors);
  return colors;
}

function simpleIconColor(icon: unknown, options: IconServerOptions = {}): string {
  return readSimpleIconColorMap(options).get(normalizeIconName(icon)) || "";
}

export {
  buildPackIndex,
  listSvgFiles,
  shouldPreserveSourceColors,
  simpleIconColor,
};
