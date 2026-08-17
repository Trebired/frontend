import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import {
  normalizeIconPack,
  parseIconSpec,
  SUPPORTED_ICON_PACKS,
} from "#bu1nq95e3k0f";
import type { IconPack, ParsedIconSpec } from "#bu1nq95e3k0f";
import type { IconServerOptions } from "./types.js";

function normalizeIconPackList(value: unknown): IconPack[] {
  const source = Array.isArray(value) ? value : [];
  const packs: IconPack[] = [];
  for (const item of source) {
    const pack = normalizeIconPack(item);
    if (pack && !packs.includes(pack)) packs.push(pack);
  }
  return packs;
}

function allowedIconPacks(options: IconServerOptions = {}): IconPack[] {
  const configured = normalizeIconPackList(options.packs);
  const roots = options.packageRoots && typeof options.packageRoots === "object"
  ? normalizeIconPackList(Object.keys(options.packageRoots))
  : [];
  const base = configured.length
  ? configured
  : normalizeIconPackList(SUPPORTED_ICON_PACKS);
  return Array.from(new Set([...base, ...roots]));
}

function isIconPackAllowed(pack: unknown, options: IconServerOptions = {}): boolean {
  const normalizedPack = normalizeIconPack(pack);
  return Boolean(
    normalizedPack && allowedIconPacks(options).includes(normalizedPack),
  );
}

function parseServerIconSpec(
  spec: unknown,
  options: IconServerOptions = {},
): ParsedIconSpec | null {
  const parsed = parseIconSpec(spec);
  if (!parsed) return null;
  return isIconPackAllowed(parsed.pack, options) ? parsed : null;
}

function findPackageRootFromResolvedFile(
  filePath: string,
  pack: string,
): string | null {
  let current = path.dirname(filePath);
  for (;; ) {
    const packageJsonPath = path.join(current, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        if (parsed?.name === pack) return current;
      } catch {}
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

const packRootCache = new Map<string, string>();

function resolveIconPackRootUncached(
  normalizedPack: IconPack,
  options: IconServerOptions,
  packageRoots: Record<string, string>,
): string {
  if (packageRoots[normalizedPack]) return path.resolve(packageRoots[normalizedPack]);
  if (options.packageRoot) return path.resolve(options.packageRoot);

  const roots = [options.rootDir, process.cwd()].filter(Boolean) as string[];
  for (const root of roots) {
    const requireFromRoot = createRequire(path.join(path.resolve(root), "package.json"));
    try {
      const packageJsonPath = requireFromRoot.resolve(`${normalizedPack}/package.json`);
      return path.dirname(packageJsonPath);
    } catch {}
    try {
      const resolved = requireFromRoot.resolve(normalizedPack);
      const packageRoot = findPackageRootFromResolvedFile(resolved, normalizedPack);
      if (packageRoot) return packageRoot;
    } catch {}
  }

  const requireFromPackage = createRequire(import.meta.url);
  try {
    return path.dirname(requireFromPackage.resolve(`${normalizedPack}/package.json`));
  } catch {}
  try {
    const resolved = requireFromPackage.resolve(normalizedPack);
    return findPackageRootFromResolvedFile(resolved, normalizedPack) || "";
  } catch {
    return "";
  }
}

function resolveIconPackRoot(
  pack: unknown,
  options: IconServerOptions = {},
): string {
  const normalizedPack = normalizeIconPack(pack);
  if (!normalizedPack) return "";
  const packageRoots = options.packageRoots && typeof options.packageRoots === "object"
  ? options.packageRoots
  : {};
  const cacheKey = `${normalizedPack}\u0000${packageRoots[normalizedPack] || ""}\u0000${options.packageRoot || ""}\u0000${options.rootDir || ""}`;
  const cached = packRootCache.get(cacheKey);
  if (cached !== undefined) return cached;
  const resolved = resolveIconPackRootUncached(
    normalizedPack,
    options,
    packageRoots as Record<string, string>,
  );
  packRootCache.set(cacheKey, resolved);
  return resolved;
}

export {
  allowedIconPacks,
  isIconPackAllowed,
  normalizeIconPackList,
  parseServerIconSpec,
  resolveIconPackRoot,
};
