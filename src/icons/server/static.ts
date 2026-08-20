import fs from "node:fs/promises";
import path from "node:path";

import { buildRenderedIconCacheEntry } from "./index.js";
import type { IconServerOptions } from "./types.js";
import type { ServerIconCacheEntry } from "#6o6fqz7svsts";
import { parseIconSpec, text } from "#bu1nq95e3k0f";

type StaticIconCache = Record<string, ServerIconCacheEntry>;

type StaticIconCacheBuildOptions = IconServerOptions& {
  strict?: boolean;
};

type StaticIconCacheModuleOptions = {
  importPath?: string;
};

type WriteStaticIconCacheModuleOptions = StaticIconCacheBuildOptions&
StaticIconCacheModuleOptions& {
  outFile: string;
  specs: readonly string[];
};

type StaticIconCacheModuleResult = {
  cache: StaticIconCache;
  outFile: string;
  source: string;
};

function buildStaticIconCache(
  specs: readonly string[],
  options: StaticIconCacheBuildOptions = {},
): StaticIconCache {
  const cache: StaticIconCache = {};
  for (const spec of specs || []) {
    const entry = buildRenderedIconCacheEntry(spec, options);
    if (!entry) {
      if (options.strict) throw new Error(`frontend-static-icon-missing:${text(spec)}`);
      continue;
    }
    cache[entry.normalizedSpec] = {
      colorMode: entry.colorMode,
      colorValue: entry.colorValue,
      svg: entry.svg,
    };
  }
  return cache;
}

function renderStaticIconCacheModule(
  cache: StaticIconCache,
  options: StaticIconCacheModuleOptions = {},
): string {
  const importPath = text(options.importPath || "@trebired/frontend");
  return [
    `import { registerStaticIcons } from ${JSON.stringify(importPath)};`,
    "",
    `const staticIcons = ${staticIconCacheLiteral(cache)} as const;`,
    "",
    "function registerFrontendStaticIcons() {",
    "  return registerStaticIcons(staticIcons);",
    "}",
    "",
    "export { registerFrontendStaticIcons, staticIcons };",
    "export default staticIcons;",
    "",
  ].join("\n");
}

async function writeStaticIconCacheModule(
  options: WriteStaticIconCacheModuleOptions,
): Promise<StaticIconCacheModuleResult> {
  const outFile = path.resolve(options.rootDir || process.cwd(), options.outFile);
  const cache = buildStaticIconCache(options.specs, options);
  const source = renderStaticIconCacheModule(cache, options);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, source);
  return { cache, outFile, source };
}

function staticIconCacheLiteral(cache: StaticIconCache): string {
  return JSON.stringify(sortStaticIconCache(cache), null, 2).replace(/</gu, "\\u003c");
}

function sortStaticIconCache(cache: StaticIconCache): StaticIconCache {
  return Object.fromEntries(
    Object.entries(cache || {}).sort(([a], [b]) => a.localeCompare(b)),
  );
}

function normalizeStaticIconSpecs(specs: readonly string[]): string[] {
  return Array.from(
    new Set((specs || []).map((spec) => parseIconSpec(spec)?.spec || "").filter(Boolean)),
  ).sort();
}

export {
  buildStaticIconCache,
  normalizeStaticIconSpecs,
  renderStaticIconCacheModule,
  writeStaticIconCacheModule,
};
export type {
  StaticIconCache,
  StaticIconCacheBuildOptions,
  StaticIconCacheModuleOptions,
  StaticIconCacheModuleResult,
  WriteStaticIconCacheModuleOptions,
};
