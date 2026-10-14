import { frontendClassName, frontendDataAttr } from "./../namespace/index.js";

const ANNOUNCER_ATTR = frontendDataAttr("a11y-announcer");

const CLEAR_AFTER_MS = 1200;

let clearTimer = 0;

function createAnnouncer(owner: Document): HTMLElement {
  const node = owner.createElement("p");
  node.className = frontendClassName("sr-only");
  node.setAttribute(ANNOUNCER_ATTR, "");
  node.setAttribute("aria-live", "polite");
  node.setAttribute("aria-atomic", "true");
  node.setAttribute("role", "status");
  owner.body.append(node);
  return node;
}

function announcerElement(owner?: Document | null): HTMLElement | null {
  const doc = owner || (typeof document === "undefined" ? null : document);
  if (!doc || !doc.body) return null;
  const existing = doc.querySelector<HTMLElement>(`[${ANNOUNCER_ATTR}]`);
  return existing || createAnnouncer(doc);
}

function announce(message: string, owner?: Document | null): boolean {
  const text = String(message || "").trim();
  const node = announcerElement(owner);
  if (!text || !node) return false;
  node.textContent = "";
  node.textContent = text;
  if (typeof window === "undefined") return true;
  window.clearTimeout(clearTimer);
  clearTimer = window.setTimeout(() => {
      node.textContent = "";
    }, CLEAR_AFTER_MS);
  return true;
}

export { ANNOUNCER_ATTR, announce, announcerElement };
