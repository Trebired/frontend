import { isInUnhydratedIsland, queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";
import { spaConfig } from "./config.js";
import { softRedirect } from "./navigate.js";

const SOFT_REDIRECT_ATTR = frontendDataAttr("soft-redirect");
const SOFT_REDIRECT_SELECTOR = frontendDataSelector("soft-redirect");
const SOFT_REDIRECT_BOUND_ATTR = frontendDataAttr("soft-redirect-bound");

function isModifiedClick(event: MouseEvent) {
  return Boolean(
    event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0,
  );
}

function softRedirectTarget(trigger: HTMLElement) {
  if (trigger.getAttribute("aria-disabled") === "true") return "";
  if (trigger.getAttribute(frontendDataAttr("disabled")) === "true") return "";
  if (trigger.closest(spaConfig().fullReloadSelector)) return "";

  if (trigger instanceof HTMLAnchorElement) {
    if (trigger.hasAttribute("download")) return "";
    if (trigger.target && trigger.target !== "_self") return "";
  }

  const href = String(
    trigger.getAttribute("href") ||
      trigger.getAttribute(frontendDataAttr("href")) ||
      "",
  ).trim();
  if (!href || href.startsWith("#")) return "";

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return "";
    if (
      url.hash &&
        url.pathname === window.location.pathname &&
        url.search === window.location.search
    ) {
      return "";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "";
  }
}

function ensureSoftRedirectA11y(trigger: HTMLElement) {
  if (trigger.matches("a,button,input,select,textarea")) return;
  if (!trigger.hasAttribute("role")) trigger.setAttribute("role", "link");
  if (!trigger.hasAttribute("tabindex")) trigger.tabIndex = 0;
}

function runSoftRedirect(event: Event, trigger: HTMLElement) {
  if (event.defaultPrevented) return;
  if (event instanceof MouseEvent && isModifiedClick(event)) {
    if (trigger instanceof HTMLAnchorElement) return;
  }
  const target = softRedirectTarget(trigger);
  if (!target) return;
  event.preventDefault();
  event.stopPropagation();
  void softRedirect(target);
}

function bindSoftRedirectLink(trigger: HTMLElement | null) {
  if (!(trigger instanceof HTMLElement) || trigger.hasAttribute(SOFT_REDIRECT_BOUND_ATTR)) {
    return false;
  }
  if (isInUnhydratedIsland(trigger)) return false;
  trigger.setAttribute(SOFT_REDIRECT_BOUND_ATTR, "true");
  ensureSoftRedirectA11y(trigger);
  trigger.addEventListener("click", (event) => runSoftRedirect(event, trigger));
  trigger.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      runSoftRedirect(event, trigger);
  });
  return true;
}

function bindSoftRedirectLinks(root: BindRoot = document) {
  queryAll<HTMLElement>(root, SOFT_REDIRECT_SELECTOR).forEach(bindSoftRedirectLink);
}

export {
  SOFT_REDIRECT_ATTR,
  SOFT_REDIRECT_BOUND_ATTR,
  SOFT_REDIRECT_SELECTOR,
  bindSoftRedirectLink,
  bindSoftRedirectLinks,
};
