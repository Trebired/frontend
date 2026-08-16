import {
  INTERACTIVE_TARGET_SELECTOR,
  closestElement,
  queryAll,
  type BindRoot,
} from "#er0dlx1gtbzh";
import { frontendDataAttr, frontendDataSelector } from "#5vbaqj4pirp3";

const ACTION_TRIGGER_SELECTOR = [
  frontendDataSelector("action-trigger"),
  frontendDataSelector("href"),
  frontendDataSelector("external-href"),
].join(",");
const ACTION_FULL_RELOAD_SELECTOR = frontendDataSelector("full-reload");
const registry = new Map<string, Array<(payload: ActionPayload) => void>>();
const triggerBindings = new WeakMap<HTMLElement, () => void>();

type ActionPayload = {
  action: string;
  actionValue: string;
  event: Event;
  kind: "click" | "keydown";
  trigger: HTMLElement;
  value: string;
};
type BindActionTriggerOptions = {
  action?: string;
  externalHref?: string;
  fullReloadSelector?: string;
  href?: string;
  navigation?: {
    navigate?: (url: string) => unknown;
    shouldFullReload?: (trigger: HTMLElement, url: string) => boolean;
  };
};

function parseAction(trigger: HTMLElement, options: BindActionTriggerOptions = {}) {
  const raw = String(options.action || trigger.getAttribute(frontendDataAttr("action-trigger")) || "").trim();
  const match = raw.match(/^(\S+)(?:\s+([\s\S]*))?$/u);
  return {
    action: match ? String(match[1]) : "",
    value: match && typeof match[2] === "string" ? match[2] : "",
  };
}

function on(action: string, handler: (payload: ActionPayload) => void) {
  const key = String(action || "").trim();
  if (!key || typeof handler !== "function") return () => {};
  const bucket = registry.get(key) || [];
  bucket.push(handler);
  registry.set(key, bucket);
  return () => {
    const next = (registry.get(key) || []).filter((item) => item !== handler);
    if (next.length) registry.set(key, next);
    else registry.delete(key);
  };
}

function dispatchAction(
  kind: "click" | "keydown",
  event: Event,
  trigger: HTMLElement,
  options: BindActionTriggerOptions,
) {
  const parsed = parseAction(trigger, options);
  if (!parsed.action) return false;
  const handlers = registry.get(parsed.action) || [];
  handlers.forEach((handler) => {
      handler({
          action: parsed.action,
          actionValue: parsed.value,
          event,
          kind,
          trigger,
          value: parsed.value,
      });
  });
  return handlers.length > 0;
}

function encodeActionPayload(payload: unknown) {
  return encodeURIComponent(JSON.stringify(payload || {}));
}

function decodeActionPayload<T extends Record<string, any> = Record<string, any>>(
  value: unknown,
): T {
  try {
    const decoded = decodeURIComponent(String(value || ""));
    const parsed = decoded ? JSON.parse(decoded) : null;
    return (parsed && typeof parsed === "object" ? parsed : {}) as T;
  } catch {
    return {} as T;
  }
}

function shouldNavigateWithFullReload(
  trigger: HTMLElement,
  href: string,
  options: BindActionTriggerOptions,
) {
  if (options.navigation?.shouldFullReload?.(trigger, href) === true) {
    return true;
  }
  const selector = String(
    options.fullReloadSelector || ACTION_FULL_RELOAD_SELECTOR,
  ).trim();
  return Boolean(selector && trigger.closest(selector));
}

function navigateHref(trigger: HTMLElement, options: BindActionTriggerOptions) {
  const externalHref = String(
    options.externalHref || trigger.getAttribute(frontendDataAttr("external-href")) || "",
  ).trim();
  if (externalHref) {
    window.open(externalHref, "_blank", "noopener,noreferrer");
    return true;
  }
  const href = String(options.href || trigger.getAttribute(frontendDataAttr("href")) || "").trim();
  if (!href) return false;
  if (
    options.navigation?.navigate &&
      !shouldNavigateWithFullReload(trigger, href, options)
  ) {
    void options.navigation.navigate(href);
  } else {
    window.location.assign(href);
  }
  return true;
}

function ensureActionA11y(trigger: HTMLElement, options: BindActionTriggerOptions) {
  const hasHref = Boolean(
    options.href ||
      options.externalHref ||
      trigger.getAttribute(frontendDataAttr("href")) ||
      trigger.getAttribute(frontendDataAttr("external-href")),
  );
  if (!parseAction(trigger, options).action && !hasHref) return;
  if (trigger.matches("button,a,input,select,textarea")) return;
  if (!trigger.hasAttribute("role")) trigger.setAttribute("role", hasHref ? "link" : "button");
  if (!trigger.hasAttribute("tabindex")) trigger.tabIndex = 0;
}

function handleTrigger(
  kind: "click" | "keydown",
  event: Event,
  trigger: HTMLElement,
  options: BindActionTriggerOptions,
) {
  if (event.defaultPrevented) return;
  const interactiveTarget = closestElement<HTMLElement>(
    event.target,
    INTERACTIVE_TARGET_SELECTOR,
  );
  if (
    interactiveTarget &&
      interactiveTarget !== trigger &&
      trigger.contains(interactiveTarget)
  ) {
    return;
  }
  if (navigateHref(trigger, options)) {
    event.preventDefault();
    return;
  }
  if (dispatchAction(kind, event, trigger, options)) event.preventDefault();
}

function bindActionTrigger(
  trigger: HTMLElement | null,
  options: BindActionTriggerOptions = {},
) {
  if (!(trigger instanceof HTMLElement)) return false;
  const existing = triggerBindings.get(trigger);
  if (existing) existing();
  ensureActionA11y(trigger, options);
  const onClick = (event: MouseEvent) => handleTrigger("click", event, trigger, options);
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    handleTrigger("keydown", event, trigger, options);
  };
  trigger.addEventListener("click", onClick);
  trigger.addEventListener("keydown", onKey);
  triggerBindings.set(trigger, () => {
      trigger.removeEventListener("click", onClick);
      trigger.removeEventListener("keydown", onKey);
  });
  return true;
}

function unbindActionTrigger(trigger: HTMLElement | null) {
  if (!(trigger instanceof HTMLElement)) return false;
  const cleanup = triggerBindings.get(trigger);
  if (!cleanup) return false;
  cleanup();
  triggerBindings.delete(trigger);
  return true;
}

function bindActionTriggers(root: BindRoot = document, options: BindActionTriggerOptions = {}) {
  queryAll<HTMLElement>(root, ACTION_TRIGGER_SELECTOR).forEach((trigger) => {
      bindActionTrigger(trigger, options);
  });
}

export {
  ACTION_FULL_RELOAD_SELECTOR,
  ACTION_TRIGGER_SELECTOR,
  bindActionTrigger,
  bindActionTriggers,
  decodeActionPayload,
  dispatchAction,
  encodeActionPayload,
  on,
  parseAction,
  unbindActionTrigger,
};
export type { ActionPayload, BindActionTriggerOptions };
