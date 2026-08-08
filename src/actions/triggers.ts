import { isInteractiveTarget, queryAll, type BindRoot } from "#er0dlx1gtbzh";

const ACTION_TRIGGER_SELECTOR = "[data-tbf-action-trigger]";
const registry = new Map<string, Array<(payload: ActionPayload) => void>>();
const triggerBindings = new WeakMap<HTMLElement, () => void>();

type ActionPayload = {
  action: string;
  event: Event;
  kind: "click" | "keydown";
  trigger: HTMLElement;
  value: string;
};
type BindActionTriggerOptions = {
  action?: string;
  externalHref?: string;
  href?: string;
  navigation?: {
    navigate?: (url: string) => unknown;
  };
};

function parseAction(trigger: HTMLElement, options: BindActionTriggerOptions = {}) {
  const raw = String(options.action || trigger.getAttribute("data-tbf-action-trigger") || "").trim();
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
    handler({ action: parsed.action, event, kind, trigger, value: parsed.value });
  });
  return handlers.length > 0;
}

function navigateHref(trigger: HTMLElement, options: BindActionTriggerOptions) {
  const externalHref = String(
    options.externalHref || trigger.getAttribute("data-tbf-external-href") || "",
  ).trim();
  if (externalHref) {
    window.open(externalHref, "_blank", "noopener,noreferrer");
    return true;
  }
  const href = String(options.href || trigger.getAttribute("data-tbf-href") || "").trim();
  if (!href) return false;
  if (options.navigation?.navigate) void options.navigation.navigate(href);
  else window.location.assign(href);
  return true;
}

function ensureActionA11y(trigger: HTMLElement, options: BindActionTriggerOptions) {
  const hasHref = Boolean(
    options.href ||
    options.externalHref ||
    trigger.getAttribute("data-tbf-href") ||
    trigger.getAttribute("data-tbf-external-href"),
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
  if (isInteractiveTarget(event.target) && event.target !== trigger) return;
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
  ACTION_TRIGGER_SELECTOR,
  bindActionTrigger,
  bindActionTriggers,
  dispatchAction,
  on,
  unbindActionTrigger,
};
export type { ActionPayload, BindActionTriggerOptions };
