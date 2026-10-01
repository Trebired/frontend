import { frontendClassName, frontendDataAttr, frontendDataSelector, frontendElementClass } from "#5vbaqj4pirp3";

type ContrastBinding = () => void;

const CONTRAST_ATTR = frontendDataAttr("contrast");
const CONTRAST_SELECTOR = frontendDataSelector("contrast");
const MIRROR_ATTR = frontendDataAttr("contrast-mirror");
const MIRROR_SELECTOR = frontendDataSelector("contrast-mirror");
const ON_DARK_ATTR = frontendDataAttr("on-dark");
const SURFACE_ATTR = frontendDataAttr("contrast-surface");
const SURFACE_SELECTOR = frontendDataSelector("contrast-surface");
const DARK_BELOW = 0.5;

function headerPart(part: string): string {
  return `.${frontendElementClass("site-header", part)}`;
}

function cls(name: string): string {
  return `.${frontendClassName(name)}`;
}

const DEFAULT_ITEMS = [
  `${headerPart("bar")} ${headerPart("link")}`,
  `${headerPart("bar")} ${cls("site-header-brand-button")}`,
  `${headerPart("actions")} ${cls("locale-trigger")}`,
  `${headerPart("actions")} ${cls("btn")}`,
  headerPart("toggle"),
].join(",");

const DEFAULT_SURFACES = [
  cls("popover"),
  `.${frontendElementClass("dropdown", "menu")}`,
  cls("site-footer"),
].join(",");

const DEFAULT_MIRRORS: Array<[string, string]> = [
  [`${headerPart("menu")} ${headerPart("link")}`, `${headerPart("bar")} ${headerPart("link")},${headerPart("toggle")}`],
  [
    `${headerPart("menu-footer")} ${cls("locale-trigger")}`,
    `${headerPart("actions")} ${cls("locale-trigger")},${headerPart("toggle")}`,
  ],
  [`${headerPart("menu-footer")} ${cls("btn")}`, `${headerPart("actions")} ${cls("btn")},${headerPart("toggle")}`],
];
const OPAQUE_ABOVE = 0.5;

function lightness(value: string): number | null {
  let hit = value.match(/^oklch\(\s*([\d.]+)(%?)/iu);
  if (hit) return hit[2] ? parseFloat(hit[1]!) / 100 : parseFloat(hit[1]!);
  hit = value.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/iu);
  if (hit) return 0.2126 * +hit[1]!+0.7152 * +hit[2]!+0.0722 * +hit[3]!;
  hit = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/iu);
  if (hit) return (0.2126 * +hit[1]!+0.7152 * +hit[2]!+0.0722 * +hit[3]!) / 255;
  return null;
}

function alphaOf(value: string): number {
  const slashed = value.match(/\/\s*([\d.]+)(%?)\s*\)$/u);
  if (slashed) return slashed[2] ? parseFloat(slashed[1]!) / 100 : parseFloat(slashed[1]!);
  const call = value.match(/^[a-z]+\(([^)]*)\)$/iu);
  if (!call) return 1;
  const fields = call[1]!.split(",");
  return fields.length > 3 ? parseFloat(fields[3]!) : 1;
}

function isOpaque(value: string): boolean {
  if (!value || value === "transparent") return false;
  return alphaOf(value) > OPAQUE_ABOVE;
}

function isShown(item: Element): boolean {
  const box = item.getBoundingClientRect();
  return Boolean(box.width && box.height);
}

function backdropLightness(item: Element, ownRoot: Element | null): number | null {
  const box = item.getBoundingClientRect();
  if (!box.width || !box.height) return null;
  const centreX = box.left + box.width / 2;
  const centreY = box.top + box.height / 2;
  for (const node of document.elementsFromPoint(centreX, centreY)) {
    if (node === item || item.contains(node)) continue;
    if (ownRoot && ownRoot.contains(node)) continue;
    const background = getComputedStyle(node).backgroundColor;
    if (isOpaque(background)) return lightness(background);
  }
  return lightness(getComputedStyle(document.body).backgroundColor);
}

function ownLightness(item: Element): number | null {
  const background = getComputedStyle(item).backgroundColor;
  return isOpaque(background) ? lightness(background) : null;
}

function contrastRoot(item: Element): Element | null {
  const named = item.getAttribute(CONTRAST_ATTR);
  if (!named) return item;
  return item.closest(named) || item;
}

function resolveItem(item: Element, surface: boolean): boolean {
  const own = surface ? ownLightness(item) : null;
  const value = own === null ? backdropLightness(item, contrastRoot(item)) : own;
  return value === null ? false : value < DARK_BELOW;
}

function mirrorPairs(root: ParentNode): Array<[Element, string]> {
  const pairs: Array<[Element, string]> = [];
  for (const [target, source] of DEFAULT_MIRRORS) {
    for (const item of root.querySelectorAll(target)) pairs.push([item, source]);
  }
  for (const item of root.querySelectorAll(MIRROR_SELECTOR)) {
    pairs.push([item, item.getAttribute(MIRROR_ATTR) || ""]);
  }
  return pairs;
}

function shownSource(selector: string): Element | null {
  for (const node of document.querySelectorAll(selector)) {
    if (isShown(node)) return node;
  }
  return null;
}

function applyMirrors(root: ParentNode) {
  for (const [item, selector] of mirrorPairs(root)) {
    const source = selector ? shownSource(selector) : null;
    if (!source) continue;
    item.setAttribute(ON_DARK_ATTR, source.getAttribute(ON_DARK_ATTR) === "true" ? "true" : "false");
  }
}

function applyContrast(root: ParentNode) {
  for (const item of root.querySelectorAll(`${DEFAULT_ITEMS},${CONTRAST_SELECTOR}`)) {
    if (isShown(item)) item.setAttribute(ON_DARK_ATTR, resolveItem(item, item.matches(SURFACE_SELECTOR)) ? "true" : "false");
  }
  for (const item of root.querySelectorAll(`${DEFAULT_SURFACES},${SURFACE_SELECTOR}`)) {
    if (isShown(item)) item.setAttribute(ON_DARK_ATTR, resolveItem(item, true) ? "true" : "false");
  }
  applyMirrors(root);
}

function bindContrast(root: ParentNode = document): ContrastBinding {
  if (typeof document === "undefined" || typeof document.elementsFromPoint !== "function") {
    return () => undefined;
  }
  let frame = 0;
  const update = () => {
    frame = 0;
    applyContrast(root);
  };
  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };
  update();
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  return () => {
    if (frame) window.cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
  };
}

export { applyContrast, bindContrast, CONTRAST_ATTR, MIRROR_ATTR, ON_DARK_ATTR, SURFACE_ATTR };
export type { ContrastBinding };
