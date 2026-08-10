import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import {
  applySvgColor,
  classNames,
  derivePrimarySvgColor,
  escapeHtml,
  normalizeHexColor,
  normalizeIconName,
  normalizeIconPack,
  normalizeSvgMarkup,
  parseIconSpec,
  text,
} from "#bu1nq95e3k0f";
import type { IconPack, ParsedIconSpec } from "#bu1nq95e3k0f";
import type { ServerIconCacheEntry } from "#6o6fqz7svsts";

export { withIconServerRenderer } from "#6o6fqz7svsts";

type IconSvgSuccess = {
  file?: string;
  icon: string;
  ok: true;
  pack: IconPack;
  spec: string;
  statusCode: "success";
  svg: string;
};

type IconSvgFailure = {
  icon?: string;
  ok: false;
  pack?: string;
  spec: string;
  status: number;
  statusCode: "duplicate-icon-name" | "icon-not-found" | "invalid-spec" | "invalid-svg" | "pack-not-found";
};

type IconSvgResult = IconSvgSuccess | IconSvgFailure;

type IconServerOptions = {
  packageRoot?: string;
  preserveSourceColors?: boolean | readonly string[];
  rootDir?: string;
};

type RenderIconHtmlAttrs = Record<string, unknown> & {
  class?: string;
  className?: string;
  color?: string;
  label?: string;
  preserveSourceColors?: boolean;
  tag?: "i" | "span" | "div";
  title?: string;
};

type IconPackIndex = {
  byName: Map<string, string>;
  duplicates: Map<string, string[]>;
  packRoot: string;
};

const packIndexCache = new Map<string, IconPackIndex | null>();
const svgMarkupCache = new Map<string, IconSvgResult>();
let simpleIconColorCache: Map<string, string> | null = null;

function listSvgFiles(rootDir: string): string[] {
  const out: string[] = [];
  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop()!;
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      entries = [];
    }
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(abs);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) out.push(abs);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function findPackageRootFromResolvedFile(filePath: string, pack: string): string | null {
  let current = path.dirname(filePath);
  for (;;) {
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

function resolveIconPackRoot(pack: unknown, options: IconServerOptions = {}): string {
  const normalizedPack = normalizeIconPack(pack);
  if (!normalizedPack) return "";
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

function buildPackIndex(pack: IconPack, options: IconServerOptions = {}): IconPackIndex | null {
  const cacheKey = `${pack}:${options.packageRoot || options.rootDir || ""}`;
  if (packIndexCache.has(cacheKey)) return packIndexCache.get(cacheKey) || null;
  const packRoot = resolveIconPackRoot(pack, options);
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

function shouldPreserveSourceColors(pack: IconPack, options: IconServerOptions = {}): boolean {
  if (options.preserveSourceColors === true) return true;
  if (Array.isArray(options.preserveSourceColors)) return options.preserveSourceColors.includes(pack);
  return false;
}

function failure(parsed: ParsedIconSpec | null, statusCode: IconSvgFailure["statusCode"], status = 404): IconSvgFailure {
  return {
    icon: parsed?.icon,
    ok: false,
    pack: parsed?.pack,
    spec: parsed?.spec || "",
    status,
    statusCode,
  };
}

function readSimpleIconColorMap(options: IconServerOptions = {}): Map<string, string> {
  if (simpleIconColorCache) return simpleIconColorCache;
  const colors = new Map<string, string>();
  const packRoot = resolveIconPackRoot("simple-icons", options);
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
  simpleIconColorCache = colors;
  return colors;
}

function simpleIconColor(icon: unknown, options: IconServerOptions = {}): string {
  return readSimpleIconColorMap(options).get(normalizeIconName(icon)) || "";
}

function resolveIconSvg(spec: unknown, options: IconServerOptions = {}): IconSvgResult {
  const parsed = parseIconSpec(spec);
  if (!parsed) return failure(null, "invalid-spec", 400);
  const cacheKey = `${parsed.spec}:${JSON.stringify(options.preserveSourceColors || false)}`;
  const cached = svgMarkupCache.get(cacheKey);
  if (cached) return cached;
  const index = buildPackIndex(parsed.pack, options);
  if (!index) return failure(parsed, "pack-not-found");
  if (index.duplicates.has(parsed.icon)) return failure(parsed, "duplicate-icon-name", 409);
  const file = index.byName.get(parsed.icon);
  if (!file) return failure(parsed, "icon-not-found");
  let source = "";
  try {
    source = fs.readFileSync(file, "utf8");
  } catch {
    return failure(parsed, "icon-not-found");
  }
  const svg = normalizeSvgMarkup(source, {
      preserveSourceColors: shouldPreserveSourceColors(parsed.pack, options),
  });
  if (!svg) return failure(parsed, "invalid-svg", 500);
  const result: IconSvgSuccess = {
    file,
    icon: parsed.icon,
    ok: true,
    pack: parsed.pack,
    spec: parsed.spec,
    statusCode: "success",
    svg,
  };
  svgMarkupCache.set(cacheKey, result);
  return result;
}

function resolveIconColor(spec: unknown, options: IconServerOptions = {}): string {
  const parsed = parseIconSpec(spec);
  if (!parsed) return "";
  if (parsed.pack === "simple-icons") return simpleIconColor(parsed.icon, options);
  const svg = resolveIconSvg(parsed.spec, options);
  if (!svg.ok || !svg.file) return "";
  try {
    return derivePrimarySvgColor(fs.readFileSync(svg.file, "utf8"));
  } catch {
    return "";
  }
}

function classifyIconColorMode(value: unknown): "" | "brand" | "monochrome" {
  const color = normalizeHexColor(value);
  if (!color) return "";
  const rgb = [color.slice(1, 3), color.slice(3, 5), color.slice(5, 7)].map((part) => parseInt(part, 16));
  const spread = Math.max(...rgb) - Math.min(...rgb);
  return spread <= 24 ? "monochrome" : "brand";
}

function buildRenderedIconCacheEntry(spec: unknown, options: IconServerOptions = {}): (ServerIconCacheEntry & { normalizedSpec: string }) | null {
  const parsed = parseIconSpec(spec);
  if (!parsed) return null;
  const svg = resolveIconSvg(parsed.spec, options);
  if (!svg.ok) return null;
  const colorValue = resolveIconColor(parsed.spec, options);
  return {
    colorMode: classifyIconColorMode(colorValue),
    colorValue,
    normalizedSpec: parsed.spec,
    svg: svg.svg,
  };
}

function createServerIconRenderer(cache: Record<string, ServerIconCacheEntry> = {}, options: IconServerOptions = {}) {
  return function renderServerIcon(spec: string): (ServerIconCacheEntry & { normalizedSpec: string }) | null {
    const entry = buildRenderedIconCacheEntry(spec, options);
    if (!entry) return null;
    cache[entry.normalizedSpec] = {
      colorMode: entry.colorMode,
      colorValue: entry.colorValue,
      svg: entry.svg,
    };
    return entry;
  };
}

function renderHostAttrs(attrs: RenderIconHtmlAttrs, parsed: ParsedIconSpec): string {
  const pairs = new Map<string, string | true>();
  const className = classNames("tbf-icon", "icon-glyph", text(attrs.class || attrs.className));
  pairs.set("class", className);
  pairs.set("data-tbf-icon", parsed.spec);
  const label = text(attrs.label || attrs["aria-label"]);
  if (label) pairs.set("aria-label", label);
  else pairs.set("aria-hidden", "true");
  for (const [keyRaw, value] of Object.entries(attrs)) {
    const key = text(keyRaw);
    if (!key || ["class", "className", "color", "label", "preserveSourceColors", "tag"].includes(key) || value == null || value === false) {
      continue;
    }
    if (key === "aria-label" && label) continue;
    pairs.set(key, value === true ? true : String(value));
  }
  const color = text(attrs.color);
  if (color) pairs.set("style", `--tbf-icon-color: ${color}; --icon-custom-color: ${color};`);
  return Array.from(pairs.entries())
  .map(([key, value]) => value === true ? key : `${key}="${escapeHtml(value)}"`)
  .join(" ");
}

function renderIconHtml(spec: unknown, attrs: RenderIconHtmlAttrs = {}, options: IconServerOptions = {}): string {
  const parsed = parseIconSpec(spec);
  const tag = text(attrs.tag) || "i";
  if (!parsed) return `<${tag} class="tbf-icon icon-glyph" aria-hidden="true"></${tag}>`;
  const svgResult = resolveIconSvg(parsed.spec, {
      ...options,
      preserveSourceColors: attrs.preserveSourceColors ?? options.preserveSourceColors,
  });
  const explicitColor = text(attrs.color);
  const brandColor = explicitColor ? "" : resolveIconColor(parsed.spec, options);
  const svg = svgResult.ok
  ? explicitColor
  ? applySvgColor(svgResult.svg, explicitColor)
  : brandColor
  ? applySvgColor(svgResult.svg, brandColor)
  : svgResult.svg
  : "";
  return `<${tag} ${renderHostAttrs(attrs, parsed)}>${svg}</${tag}>`;
}

function createIconSvgResponse(spec: unknown, options: IconServerOptions = {}) {
  const svgResult = resolveIconSvg(spec, options);
  if (svgResult.ok !== true) {
    return {
      body: svgResult.statusCode,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      status: svgResult.status,
    };
  }
  const color = resolveIconColor(svgResult.spec, options);
  return {
    body: color ? applySvgColor(svgResult.svg, color) : svgResult.svg,
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
    status: 200,
  };
}

export {
  buildPackIndex,
  buildRenderedIconCacheEntry,
  createIconSvgResponse,
  createServerIconRenderer,
  renderIconHtml,
  resolveIconColor,
  resolveIconPackRoot,
  resolveIconSvg,
  simpleIconColor,
};
export type {
  IconServerOptions,
  IconSvgFailure,
  IconSvgResult,
  IconSvgSuccess,
  RenderIconHtmlAttrs,
};
