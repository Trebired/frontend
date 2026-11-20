import { queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { resolveFrontendLogger } from "#mhi409n0a05q";
import {
  iconSpec,
  normalizeIconName,
  normalizeIconPack,
  normalizeSpace,
  parseIconSpec,
  SUPPORTED_ICON_PACKS,
  text,
} from "./shared.js";
import {
  defaultIconAliases,
  mergeIconAliases,
  normalizeIconAliasKey,
  normalizeIconAliasMap,
  normalizeIconAliasSpec,
  resolveIconAlias,
} from "./catalog.js";
import type { ParsedIconSpec } from "./shared.js";
import type { IconAliasMap, IconAliasValue } from "./catalog.js";
import { frontendClassName, frontendCssVar, frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";

type IconCacheEntry = {
  colorMode?: string;
  colorValue?: string;
  svg?: string;
};

type RenderIconElementAttrs = Record<string, unknown>& {
  class?: string;
  className?: string;
  color?: string;
  tag?: string;
};

type StaticIconCacheEntry = string | IconCacheEntry | null | undefined;
type StaticIconCacheInput = Record<string, StaticIconCacheEntry>;
type StaticIconCacheRegistration = {
  registered: number;
};

const ICON_SELECTOR = `${frontendDataSelector("icon")},${frontendDataSelector("icon-spec")}`;
const CUSTOM_COLOR_VAR = frontendCssVar("icon-color");
const BRAND_COLOR_ATTR = frontendDataAttr("icon-brand-color");
const LEGACY_CUSTOM_COLOR_VAR = "--icon-custom-color";
const missingIconSpecs = new Set<string>();
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

function normalizeStaticIconCacheEntry(
  value: StaticIconCacheEntry,
): IconCacheEntry | null {
  if (typeof value === "string") return readSvgCacheEntry(value);
  if (!value || typeof value !== "object") return null;
  const svgEntry = readSvgCacheEntry(value.svg);
  if (!svgEntry) return null;
  return {
    ...svgEntry,
    colorMode: text(value.colorMode),
    colorValue: text(value.colorValue),
  };
}

function registerStaticIcons(
  input: StaticIconCacheInput,
): StaticIconCacheRegistration {
  let registered = 0;
  for (const [spec, value] of Object.entries(input || {})) {
    const parsed = parseIconSpec(spec);
    if (!parsed) continue;
    const entry = normalizeStaticIconCacheEntry(value);
    if (!entry) continue;
    storeIconCacheEntry(parsed.spec, entry);
    registered += 1;
  }
  return { registered };
}

function uniqueClassName(...values: string[]): string {
  return Array.from(
    new Set(values.join(" ").split(/\s+/u).filter(Boolean)),
  ).join(" ");
}

function applyElementAttrs(host: Element, attrs: RenderIconElementAttrs = {}): void {
  const requestedClassName = text(attrs.class ||attrs.className);
  const className = uniqueClassName(
    frontendClassName("icon"),
    "icon-glyph",
    requestedClassName || text(host.getAttribute("class")),
  );
  const customColor = text(attrs.color);
  for (const [keyRaw, value] of Object.entries(attrs)) {
    const key = text(keyRaw);
    if (!key || ["class", "className", "color", "tag"].includes(key) || value == null || value === false) {
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
  host.setAttribute(frontendDataAttr("icon"), spec);
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

function pageIconEntry(spec: string): IconCacheEntry | null {
  const cached = readIconCacheEntry(spec);
  if (cached || typeof document === "undefined") return cached;
  harvestInlineIcons(document);
  return readIconCacheEntry(spec);
}

function reportMissingIcon(spec: string): void {
  if (missingIconSpecs.has(spec)) return;
  missingIconSpecs.add(spec);
  try {
    resolveFrontendLogger().warn("icons", "icon-not-on-page", { hint: "render it on the server with Icon or IconRegistry", spec });
  } catch {}
}

function renderIconElement(
  host: Element | null | undefined,
  spec: unknown,
  attrs: RenderIconElementAttrs = {},
): Element | null {
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
  const svg = text(pageIconEntry(parsed.spec)?.svg);
  if (svg && renderSvgIntoHost(host, svg)) return host;
  reportMissingIcon(parsed.spec);
  return null;
}

function createIconElement(spec: unknown, attrs: RenderIconElementAttrs = {}, doc: Document | null = null): Element | null {
  const owner = doc || (typeof document !== "undefined" ? document : null);
  if (!owner || typeof owner.createElement !== "function") return null;
  const tag = text(attrs.tag) || "i";
  const host = owner.createElement(tag);
  renderIconElement(host, spec, attrs);
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
  return text(host.getAttribute(frontendDataAttr("icon")) || host.getAttribute(frontendDataAttr("icon-spec")));
}

function harvestedBrandColor(host: Element) {
  const value = text(host.getAttribute(BRAND_COLOR_ATTR));
  return value ? { colorMode: "brand", colorValue: value } : {};
}

function harvestInlineIcon(host: Element): boolean {
  const parsed = parseIconSpec(readHostSpec(host));
  if (!parsed || readIconCacheEntry(parsed.spec) || !hasInlineSvg(host)) return false;
  const svg = text(host.innerHTML);
  if (!/^<svg\b/iu.test(svg)) return false;
  storeIconCacheEntry(parsed.spec, { svg, ...harvestedBrandColor(host) });
  renderedIconSpecs.set(host, parsed.spec);
  return true;
}

function inlineIconHosts(root: BindRoot): Element[] {
  const scope = root && "querySelectorAll"in root ? root : document;
  const hosts = Array.from(scope.querySelectorAll(ICON_SELECTOR));
  return scope instanceof Element && scope.matches(ICON_SELECTOR) ? [scope, ...hosts] : hosts;
}

function harvestInlineIcons(root: BindRoot = document): number {
  return inlineIconHosts(root).filter(harvestInlineIcon).length;
}

function bindIcon(host: Element | null | undefined): boolean {
  if (!(host instanceof Element)) return false;
  const spec = readHostSpec(host);
  if (!spec) return false;
  renderIconElement(host, spec, { color: host.getAttribute(frontendDataAttr("icon-color")) || "" });
  return true;
}

function bindIcons(root: BindRoot = document): void {
  harvestInlineIcons(root);
  queryAll<Element>(root, ICON_SELECTOR).forEach((host) => bindIcon(host));
}

const icons = Object.freeze({
    append: appendIcon,
    bind: bindIcon,
    bindAll: bindIcons,
    createElement: createIconElement,
    harvestInline: harvestInlineIcons,
    mergeAliases: mergeIconAliases,
    normalizeAliasKey: normalizeIconAliasKey,
    normalizeAliases: normalizeIconAliasMap,
    parseSpec: parseIconSpec,
    readIconCacheEntry,
    readRenderedSpec,
    registerStatic: registerStaticIcons,
    renderElement: renderIconElement,
    resolveAlias: resolveIconAlias,
    storeIconCacheEntry,
});

export {
  BRAND_COLOR_ATTR,
  CUSTOM_COLOR_VAR,
  ICON_SELECTOR,
  appendIcon,
  bindIcon,
  bindIcons,
  createIconElement,
  defaultIconAliases,
  harvestInlineIcons,
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
  registerStaticIcons,
  renderIconElement,
  resolveIconAlias,
  SUPPORTED_ICON_PACKS,
  storeIconCacheEntry,
};
export type {
  IconAliasMap,
  IconAliasValue,
  IconCacheEntry,
  ParsedIconSpec,
  RenderIconElementAttrs,
  StaticIconCacheEntry,
  StaticIconCacheInput,
  StaticIconCacheRegistration,
};
export default icons;
