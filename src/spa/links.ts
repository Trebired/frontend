import { isModifiedMouseClick, queryAll, type BindRoot } from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";
import { spaConfig } from "./config.js";
import { softRedirect } from "./navigate.js";
import { highlightTargetOf } from "#8xdkni5exuif";

const SOFT_REDIRECT_ATTR = frontendDataAttr("soft-redirect");
const SOFT_REDIRECT_SELECTOR = frontendDataSelector("soft-redirect");
const SOFT_REDIRECT_BOUND_ATTR = frontendDataAttr("soft-redirect-bound");
const boundTriggers = new WeakSet<HTMLElement>();

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
  if (event instanceof MouseEvent && isModifiedMouseClick(event)) {
    if (trigger instanceof HTMLAnchorElement) return;
  }
  const target = softRedirectTarget(trigger);
  if (!target) return;
  event.preventDefault();
  event.stopPropagation();
  void softRedirect(target, { highlight: highlightTargetOf(trigger) || undefined });
}

function bindSoftRedirectLink(trigger: HTMLElement | null) {
  if (!(trigger instanceof HTMLElement) || boundTriggers.has(trigger)) {
    return false;
  }
  boundTriggers.add(trigger);
  ensureSoftRedirectA11y(trigger);
  trigger.addEventListener("click", (event) => runSoftRedirect(event, trigger));
  trigger.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      runSoftRedirect(event, trigger);
  });
  return true;
}

const SUBMIT_ON_CHANGE_ATTR = frontendDataAttr("submit-on-change");
let formsBound = false;

function softRedirectForm(target: EventTarget | null) {
  if (!(target instanceof HTMLFormElement) || !target.hasAttribute(SOFT_REDIRECT_ATTR)) return null;
  if (String(target.getAttribute("method") || "get").toLowerCase() !== "get") return null;
  return target.closest(spaConfig().fullReloadSelector) ? null : target;
}

function softRedirectFormTarget(form: HTMLFormElement, submitter: HTMLElement | null) {
  const url = new URL(form.getAttribute("action") || window.location.pathname, window.location.href);
  if (url.origin !== window.location.origin) return "";
  url.search = "";
  new FormData(form, submitter instanceof HTMLButtonElement ? submitter : null).forEach((value, key) => {
      if (typeof value === "string" && value !== "") url.searchParams.append(key, value);
  });
  return `${url.pathname}${url.search}`;
}

function bindSoftRedirectForms() {
  if (formsBound || typeof document === "undefined") return;
  formsBound = true;
  document.addEventListener("submit", (event) => {
      const form = softRedirectForm(event.target);
      if (!form || event.defaultPrevented) return;
      const target = softRedirectFormTarget(form, (event as SubmitEvent).submitter as HTMLElement | null);
      if (!target) return;
      event.preventDefault();
      void softRedirect(target);
  });
  document.addEventListener("change", (event) => {
      const form = event.target instanceof Element ? event.target.closest(`form[${SUBMIT_ON_CHANGE_ATTR}]`) : null;
      if (form instanceof HTMLFormElement) form.requestSubmit();
  });
}

function bindSoftRedirectLinks(root: BindRoot = document) {
  bindSoftRedirectForms();
  queryAll<HTMLElement>(root, SOFT_REDIRECT_SELECTOR).forEach(bindSoftRedirectLink);
}

export {
  SOFT_REDIRECT_ATTR,
  SOFT_REDIRECT_BOUND_ATTR,
  SOFT_REDIRECT_SELECTOR,
  bindSoftRedirectLink,
  bindSoftRedirectLinks,
};
