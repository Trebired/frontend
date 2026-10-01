import { frontendClassName, frontendDataAttr, frontendDataSelector, frontendElementClass } from "#5vbaqj4pirp3";

type ContrastBinding = () => void;

const CONTRAST_ATTR = frontendDataAttr("contrast");
const CONTRAST_SELECTOR = frontendDataSelector("contrast");
const MIRROR_ATTR = frontendDataAttr("contrast-mirror");
const MIRROR_SELECTOR = frontendDataSelector("contrast-mirror");
const ON_DARK_ATTR = frontendDataAttr("on-dark");
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
  cls("popover"),
  `.${frontendElementClass("dropdown", "menu")}`,
  cls("site-footer"),
].join(",");

const DEFAULT_MIRRORS: Array<[string, string]> = [
  [`${headerPart("menu")} ${headerPart("link")}`, `${headerPart("bar")} ${headerPart("link")}`],
  [`${headerPart("menu-footer")} ${cls("locale-trigger")}`, `${headerPart("actions")} ${cls("locale-trigger")}`],
  [`${headerPart("menu-footer")} ${cls("btn")}`, `${headerPart("actions")} ${cls("btn")}`],
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

function isOpaque(value: string): boolean {
  if (!value || value === "transparent") return false;
  const alpha = value.match(/[/,]\s*([\d.]+)\s*\)$/u);
  return alpha ? parseFloat(alpha[1]!) > OPAQUE_ABOVE : true;
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

function contrastRoot(item: Element): Element | null {
  const named = item.getAttribute(CONTRAST_ATTR);
  if (!named) return item;
  return item.closest(named) || item;
}

function resolveItem(item: Element): boolean {
  const value = backdropLightness(item, contrastRoot(item));
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

function applyMirrors(root: ParentNode) {
  for (const [item, selector] of mirrorPairs(root)) {
    const source = selector ? document.querySelector(selector) : null;
    const dark = source?.getAttribute(ON_DARK_ATTR) === "true";
    item.setAttribute(ON_DARK_ATTR, dark ? "true" : "false");
  }
}

function applyContrast(root: ParentNode) {
  for (const item of root.querySelectorAll(`${DEFAULT_ITEMS},${CONTRAST_SELECTOR}`)) {
    item.setAttribute(ON_DARK_ATTR, resolveItem(item) ? "true" : "false");
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

export { applyContrast, bindContrast, CONTRAST_ATTR, MIRROR_ATTR, ON_DARK_ATTR };
export type { ContrastBinding };
