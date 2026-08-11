import fs from "node:fs";

import {
  applySvgColor,
  applySvgRootAttrs,
  classNames,
  derivePrimarySvgColor,
  escapeHtml,
  normalizeHexColor,
  normalizeSvgMarkup,
  text,
} from "#bu1nq95e3k0f";
import type { ParsedIconSpec } from "#bu1nq95e3k0f";
import type { ServerIconCacheEntry } from "#6o6fqz7svsts";
import {
  buildPackIndex,
  listSvgFiles,
  shouldPreserveSourceColors,
  simpleIconColor,
} from "./packs.js";
import {
  allowedIconPacks,
  isIconPackAllowed,
  normalizeIconPackList,
  parseServerIconSpec,
  resolveIconPackRoot,
} from "./options.js";
import type {
  IconServerOptions,
  IconSvgFailure,
  IconSvgResult,
  IconSvgSuccess,
  RenderIconHtmlAttrs,
} from "./types.js";

export { withIconServerRenderer } from "#6o6fqz7svsts";
export { attachIconAliasLocals, attachIconServer } from "./attachment.js";
export type { AttachIconServerOptions, IconServerAttachment } from "./attachment.js";
export * from "./defaults.js";
export * from "./material.js";

const svgMarkupCache = new Map<string, IconSvgResult>();

function failure(
  parsed: ParsedIconSpec | null,
  statusCode: IconSvgFailure["statusCode"],
  status = 404,
): IconSvgFailure {
  return {
    icon: parsed?.icon,
    ok: false,
    pack: parsed?.pack,
    spec: parsed?.spec || "",
    status,
    statusCode,
  };
}

function resolveIconSvg(
  spec: unknown,
  options: IconServerOptions = {},
): IconSvgResult {
  const parsed = parseServerIconSpec(spec, options);
  if (!parsed) return failure(null, "invalid-spec", 400);
  const cacheKey = [
    parsed.spec,
    resolveIconPackRoot(parsed.pack, options),
    JSON.stringify(options.preserveSourceColors || null),
  ].join(":");
  const cached = svgMarkupCache.get(cacheKey);
  if (cached) return cached;
  const index = buildPackIndex(parsed.pack, options);
  if (!index) return failure(parsed, "pack-not-found");
  if (index.duplicates.has(parsed.icon)) {
    return failure(parsed, "duplicate-icon-name", 409);
  }
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

function resolveIconColor(
  spec: unknown,
  options: IconServerOptions = {},
): string {
  const parsed = parseServerIconSpec(spec, options);
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
  const rgb = [color.slice(1, 3), color.slice(3, 5), color.slice(5, 7)]
  .map((part) => parseInt(part, 16));
  const spread = Math.max(...rgb) - Math.min(...rgb);
  return spread <= 24 ? "monochrome" : "brand";
}

function buildRenderedIconCacheEntry(
  spec: unknown,
  options: IconServerOptions = {},
): (ServerIconCacheEntry & { normalizedSpec: string }) | null {
  const parsed = parseServerIconSpec(spec, options);
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

function createServerIconRenderer(
  cache: Record<string, ServerIconCacheEntry> = {},
  options: IconServerOptions = {},
) {
  return function renderServerIcon(spec: string) {
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

function renderIconHtml(
  spec: unknown,
  attrs: RenderIconHtmlAttrs = {},
  options: IconServerOptions = {},
): string {
  const parsed = parseServerIconSpec(spec, options);
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
  const colorMode = classifyIconColorMode(color);
  const svg = color ? applySvgColor(svgResult.svg, color) : svgResult.svg;
  return {
    body: applySvgRootAttrs(svg, {
        "data-tbf-icon-color-mode": colorMode || undefined,
        "data-tbf-icon-color-value": color || undefined,
    }),
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
    status: 200,
  };
}

export {
  allowedIconPacks,
  buildPackIndex,
  buildRenderedIconCacheEntry,
  classifyIconColorMode,
  createIconSvgResponse,
  createServerIconRenderer,
  isIconPackAllowed,
  listSvgFiles,
  normalizeIconPackList,
  parseServerIconSpec,
  renderIconHtml,
  resolveIconColor,
  resolveIconPackRoot,
  resolveIconSvg,
  shouldPreserveSourceColors,
  simpleIconColor,
};
export type {
  IconServerOptions,
  IconSvgFailure,
  IconSvgResult,
  IconSvgSuccess,
  MaterialFileIconOptions,
  RenderIconHtmlAttrs,
} from "./types.js";
