import { cssEscape } from "#er0dlx1gtbzh";
import { FRONTEND_PREFIX } from "#5vbaqj4pirp3";
import { spaConfig } from "./config.js";
import { overlayPortalRoots } from "./overlay-dom.js";

const SKIPPED_TAGS = new Set(["LINK", "SCRIPT", "STYLE"]);
const DATA_PREFIX = `data-${FRONTEND_PREFIX}-`;
let shellKeys = new Set<string>();

function shellKey(element: Element) {
  if (element.id) return `#${cssEscape(element.id)}`;
  const markers = Array.from(element.attributes)
  .map((attribute) => attribute.name)
  .filter((name) => name.startsWith(DATA_PREFIX))
  .sort();
  if (!markers.length) return "";
  return `${element.tagName.toLowerCase()}${markers.map((name) => `[${name}]`).join("")}`;
}

function isContentRegion(element: Element) {
  const selector = spaConfig().contentSelector;
  return element.matches(selector) || Boolean(element.querySelector(selector));
}

function isShellElement(element: Element | null): element is Element {
  if (!element || SKIPPED_TAGS.has(element.tagName)) return false;
  if (element.id.startsWith(`${FRONTEND_PREFIX}_`)) return false;
  return !isContentRegion(element);
}

function shellElements(doc: Document) {
  const found = new Map<string, Element>();
  const add = (element: Element | null) => {
    if (!isShellElement(element)) return;
    const key = shellKey(element);
    if (key && !found.has(key)) found.set(key, element);
  };
  Array.from(doc.body?.children || []).forEach(add);
  spaConfig().chromeIds.forEach((id) => add(doc.getElementById(id)));
  return found;
}

function isPortaled(element: Element) {
  return overlayPortalRoots().some((root) => root.contains(element));
}

function counterpart(element: Element | null) {
  if (!element) return null;
  if (element === element.ownerDocument.body) return document.body;
  const key = shellKey(element);
  return key ? document.querySelector(key) : null;
}

function placeLikeFetched(fresh: Element, next: Element) {
  const parent = counterpart(next.parentElement) || document.body;
  for (let sibling = next.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
    const anchor = counterpart(sibling);
    if (anchor?.parentElement === parent) return void anchor.after(fresh);
  }
  for (let sibling = next.nextElementSibling; sibling; sibling = sibling.nextElementSibling) {
    const anchor = counterpart(sibling);
    if (anchor?.parentElement === parent) return void anchor.before(fresh);
  }
  parent.appendChild(fresh);
}

function syncShellElement(key: string, next: Element) {
  const current = document.querySelector(key);
  const fresh = document.importNode(next, true);
  if (current && !isPortaled(current)) {
    current.replaceWith(fresh);
    return;
  }
  current?.remove();
  placeLikeFetched(fresh, next);
}

function removeDroppedShell(nextKeys: Set<string>) {
  shellKeys.forEach((key) => {
      if (nextKeys.has(key)) return;
      const current = document.querySelector(key);
      if (current && !isContentRegion(current)) current.remove();
  });
}

function syncShell(doc: Document) {
  const next = shellElements(doc);
  removeDroppedShell(new Set(next.keys()));
  next.forEach((element, key) => syncShellElement(key, element));
  shellKeys = new Set(next.keys());
}

function seedShell() {
  if (typeof document === "undefined" || !document.body) return;
  shellKeys = new Set(shellElements(document).keys());
}

export { seedShell, syncShell };
