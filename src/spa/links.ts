import {
  bindRoot,
  closestElement,
  INTERACTIVE_TARGET_SELECTOR,
  type BindRoot,
  type Cleanup,
} from "#er0dlx1gtbzh";
import { frontendDataAttr } from "#5vbaqj4pirp3";
import { spaConfig } from "./config.js";
import { softRedirect } from "./navigate.js";

const NON_SOFT_HREF = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/iu;

type SoftLinkInput = {
  disabled?: boolean;
  download?: unknown;
  href?: unknown;
  target?: string;
};

type SoftRedirectLinkBinding = {
  disconnect: Cleanup;
};

const linkBindings = new WeakMap<EventTarget, { cleanup: Cleanup; refs: number }>();

function isSoftNavigableHref(link: SoftLinkInput): boolean {
  const href = typeof link.href === "string" ? link.href.trim() : "";
  if (!href || link.disabled) return false;
  if (link.download !== undefined) return false;
  if (link.target && link.target !== "_self") return false;
  return !NON_SOFT_HREF.test(href);
}

function isModifiedClick(event: MouseEvent) {
  return Boolean(
    event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0,
  );
}

function closestAnchor(target: EventTarget | null) {
  const element = closestElement(target, "a[href]");
  return element instanceof HTMLAnchorElement ? element : null;
}

function sameDocumentHashNavigation(url: URL) {
  return Boolean(
    url.hash &&
      url.pathname === window.location.pathname &&
      url.search === window.location.search,
  );
}

function softRedirectHref(link: HTMLAnchorElement) {
  if (link.hasAttribute("download")) return "";
  if (link.target && link.target !== "_self") return "";
  if (link.getAttribute("aria-disabled") === "true") return "";
  if (link.getAttribute(frontendDataAttr("disabled")) === "true") return "";
  if (link.closest(spaConfig().fullReloadSelector)) return "";

  const href = String(link.getAttribute("href") || "").trim();
  if (!href || href.startsWith("#")) return "";

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return "";
    if (sameDocumentHashNavigation(url)) return "";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "";
  }
}

function handleSoftRedirectLinkClick(event: Event) {
  if (!(event instanceof MouseEvent)) return;
  if (event.defaultPrevented || isModifiedClick(event)) return;
  const link = closestAnchor(event.target);
  if (!link) return;
  const interactiveTarget = closestElement(event.target, INTERACTIVE_TARGET_SELECTOR);
  if (
    interactiveTarget &&
    interactiveTarget !== link &&
    link.contains(interactiveTarget)
  ) {
    return;
  }
  const href = softRedirectHref(link);
  if (!href) return;
  event.preventDefault();
  void softRedirect(href);
}

function disconnectBinding(target: EventTarget) {
  const existing = linkBindings.get(target);
  if (!existing) return;
  existing.refs -= 1;
  if (existing.refs > 0) return;
  existing.cleanup();
  linkBindings.delete(target);
}

function bindSoftRedirectLinks(
  root: BindRoot = document,
): SoftRedirectLinkBinding {
  if (typeof document === "undefined") return { disconnect() {} };
  const target = bindRoot(root);
  const existing = linkBindings.get(target);
  if (existing) {
    existing.refs += 1;
    return { disconnect: () => disconnectBinding(target) };
  }
  const handler = (event: Event) => handleSoftRedirectLinkClick(event);
  target.addEventListener("click", handler);
  linkBindings.set(target, {
      cleanup: () => target.removeEventListener("click", handler),
      refs: 1,
  });
  return { disconnect: () => disconnectBinding(target) };
}

export { bindSoftRedirectLinks, isSoftNavigableHref };
export type { SoftLinkInput, SoftRedirectLinkBinding };
