import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import {
  buildIconUrl,
  iconSpec,
  normalizeIconName,
  normalizeIconPack,
  normalizeSpace,
  parseIconSpec,
  SUPPORTED_ICON_PACKS,
  text,
} from "./shared.js";
import {
  mergeIconAliases,
  normalizeIconAliasKey,
  normalizeIconAliasMap,
  normalizeIconAliasSpec,
  resolveIconAlias,
} from "./catalog.js";
import type { ParsedIconSpec } from "./shared.js";
import type { IconAliasMap, IconAliasValue } from "./catalog.js";

type IconCacheEntry = {
  colorMode?: string;
  colorValue?: string;
  svg?: string;
};

type IconRuntimeOptions = {
  endpoint?: string;
};

type RenderIconElementAttrs = Record<string, unknown> & {
  class?: string;
  className?: string;
  color?: string;
  endpoint?: string;
  tag?: string;
};

const ICON_SELECTOR = "[data-tbf-icon],[data-icon-spec]";
const CUSTOM_COLOR_VAR = "--tbf-icon-color";
const LEGACY_CUSTOM_COLOR_VAR = "--icon-custom-color";
const svgFetchCache = new Map<string, Promise<string>>();
const iconCacheEntries = new Map<string, IconCacheEntry>();
const renderedIconSpecs = new WeakMap<Element, string>();

function readIconCacheEntry(spec: unknown): IconCacheEntry | null {
  const parsed = parseIconSpec(spec);
  return parsed ? iconCacheEntries.get(parsed.spec) || null : null;
}

function storeIconCacheEntry(spec: unknown, entry: IconCacheEntry): void {
  const parsed = parseIconSpec(spec);
  if (parsed && entry && typeof entry === "object") iconCacheEntries.set(parsed.spec, entry);
}

function readRenderedSpec(host: Element | null | undefined): string {
  return host ? renderedIconSpecs.get(host) || "" : "";
}

function hasInlineSvg(host: Element): boolean {
  return Boolean(host.firstElementChild && host.firstElementChild.tagName.toLowerCase() === "svg");
}

function buildSvgNode(svgMarkup: string): SVGElement | null {
  const template = document.createElement("template");
  template.innerHTML = svgMarkup;
  const node = template.content.firstElementChild;
  return node && node.tagName.toLowerCase() === "svg" ? node as SVGElement : null;
}

function readSvgCacheEntry(svgMarkup: unknown): IconCacheEntry | null {
  const svg = String(svgMarkup || "").trim();
  return /^<svg\b/iu.test(svg) ? { svg } : null;
}

function storeFetchedSvg(spec: string, svgMarkup: unknown): void {
  const entry = readSvgCacheEntry(svgMarkup);
  if (entry) storeIconCacheEntry(spec, entry);
}

function uniqueClassName(...values: string[]): string {
  return Array.from(
    new Set(values.join(" ").split(/\s+/u).filter(Boolean)),
  ).join(" ");
}

function applyElementAttrs(host: Element, attrs: RenderIconElementAttrs = {}): void {
  const requestedClassName = text(attrs.class || attrs.className);
  const className = uniqueClassName(
    "tbf-icon",
    "icon-glyph",
    requestedClassName || text(host.getAttribute("class")),
  );
  const customColor = text(attrs.color);
  for (const [keyRaw, value] of Object.entries(attrs)) {
    const key = text(keyRaw);
    if (!key || ["class", "className", "color", "endpoint", "tag"].includes(key) || value == null || value === false) {
      continue;
    }
    if (key === "style" && value && typeof value === "object" && host instanceof HTMLElement) {
      Object.assign(host.style, value);
      continue;
    }
    host.setAttribute(key, value === true ? "" : String(value));
  }
  host.setAttribute("class", className);
  if (customColor && host instanceof HTMLElement) {
    host.style.setProperty(CUSTOM_COLOR_VAR, customColor);
    host.style.setProperty(LEGACY_CUSTOM_COLOR_VAR, customColor);
  }
  if (!host.hasAttribute("aria-hidden") && !host.hasAttribute("aria-label")) host.setAttribute("aria-hidden", "true");
}

function prepareIconHost(host: Element, spec: string, attrs: RenderIconElementAttrs = {}): void {
  applyElementAttrs(host, attrs);
  if (spec) renderedIconSpecs.set(host, spec);
  else renderedIconSpecs.delete(host);
  host.setAttribute("data-tbf-icon", spec);
}

function applyHostSvgColor(host: Element, svg: SVGElement): void {
  if (!(host instanceof HTMLElement)) return;
  const color = text(host.style.getPropertyValue(CUSTOM_COLOR_VAR) || host.style.getPropertyValue(LEGACY_CUSTOM_COLOR_VAR));
  if (color) svg.style.setProperty("color", color, "important");
}

function renderSvgIntoHost(host: Element, svgMarkup: string): SVGElement | null {
  const svg = buildSvgNode(svgMarkup);
  if (!svg) return null;
  applyHostSvgColor(host, svg);
  host.replaceChildren(svg);
  return svg;
}

function fetchSvg(spec: string, endpoint = "/__icons/svg"): Promise<string> {
  const cacheKey = `${endpoint} ${spec}`;
  const cached = svgFetchCache.get(cacheKey);
  if (cached) return cached;
  const pending = fetch(buildIconUrl(spec, endpoint), {
      credentials: "same-origin",
      headers: { Accept: "image/svg+xml,text/plain;q=0.9,*/*;q=0.8" },
  }).then(async (response) => {
      if (!response.ok) throw new Error(`tbf-icon-http-${response.status}`);
      const svg = String(await response.text()).trim();
      if (!/^<svg\b/iu.test(svg)) throw new Error("tbf-icon-invalid-svg");
      storeFetchedSvg(spec, svg);
      return svg;
  });
  svgFetchCache.set(cacheKey, pending);
  return pending;
}

async function renderIconElement(
  host: Element | null | undefined,
  spec: unknown,
  attrs: RenderIconElementAttrs = {},
): Promise<Element | null> {
  if (!host || typeof host.getAttribute !== "function") return null;
  const parsed = parseIconSpec(spec);
  const normalizedSpec = parsed ? parsed.spec : normalizeSpace(spec);
  const alreadyRendered = parsed && readRenderedSpec(host) === parsed.spec;
  prepareIconHost(host, normalizedSpec, attrs);
  if (!parsed) return null;
  if (alreadyRendered && hasInlineSvg(host)) {
    applyHostSvgColor(host, host.firstElementChild as SVGElement);
    return host;
  }
  try {
    const cachedSvg = text(readIconCacheEntry(parsed.spec)?.svg);
    if (cachedSvg && renderSvgIntoHost(host, cachedSvg)) return host;
    const svgMarkup = await fetchSvg(parsed.spec, attrs.endpoint || "/__icons/svg");
    if (readRenderedSpec(host) !== parsed.spec) return null;
    if (renderSvgIntoHost(host, svgMarkup)) return host;
  } catch {}
  return null;
}

function createIconElement(spec: unknown, attrs: RenderIconElementAttrs = {}, doc: Document | null = null): Element | null {
  const owner = doc || (typeof document !== "undefined" ? document : null);
  if (!owner || typeof owner.createElement !== "function") return null;
  const tag = text(attrs.tag) || "i";
  const host = owner.createElement(tag);
  void renderIconElement(host, spec, attrs);
  return host;
}

function appendIcon(parent: Element | null | undefined, spec: unknown, attrs: RenderIconElementAttrs = {}): Element | null {
  if (!parent || typeof parent.appendChild !== "function") return null;
  const host = createIconElement(spec, attrs, parent.ownerDocument || document);
  if (!host) return null;
  parent.appendChild(host);
  return host;
}

function readHostSpec(host: Element): string {
  return text(host.getAttribute("data-tbf-icon") || host.getAttribute("data-icon-spec"));
}

function bindIcon(host: Element | null | undefined, options: IconRuntimeOptions = {}): boolean {
  if (!(host instanceof Element)) return false;
  const spec = readHostSpec(host);
  if (!spec) return false;
  void renderIconElement(host, spec, {
      color: host.getAttribute("data-tbf-icon-color") || "",
      endpoint: options.endpoint,
  });
  return true;
}

function bindIcons(root: BindRoot = document, options: IconRuntimeOptions = {}): void {
  queryAll<Element>(root, ICON_SELECTOR).forEach((host) => bindIcon(host, options));
}

const icons = Object.freeze({
    append: appendIcon,
    bind: bindIcon,
    bindAll: bindIcons,
    buildUrl: buildIconUrl,
    createElement: createIconElement,
    mergeAliases: mergeIconAliases,
    normalizeAliasKey: normalizeIconAliasKey,
    normalizeAliases: normalizeIconAliasMap,
    parseSpec: parseIconSpec,
    readIconCacheEntry,
    readRenderedSpec,
    renderElement: renderIconElement,
    resolveAlias: resolveIconAlias,
    storeIconCacheEntry,
});

export {
  CUSTOM_COLOR_VAR,
  ICON_SELECTOR,
  appendIcon,
  bindIcon,
  bindIcons,
  buildIconUrl,
  createIconElement,
  icons,
  iconSpec,
  mergeIconAliases,
  normalizeIconAliasKey,
  normalizeIconAliasMap,
  normalizeIconAliasSpec,
  normalizeIconName,
  normalizeIconPack,
  normalizeSpace,
  parseIconSpec,
  readIconCacheEntry,
  readRenderedSpec,
  renderIconElement,
  resolveIconAlias,
  SUPPORTED_ICON_PACKS,
  storeIconCacheEntry,
};
export type {
  IconAliasMap,
  IconAliasValue,
  IconCacheEntry,
  IconRuntimeOptions,
  ParsedIconSpec,
  RenderIconElementAttrs,
};
export default icons;
