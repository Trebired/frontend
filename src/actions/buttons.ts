import {
  queryAll,
  readDataJson,
  setControlDisabled,
  type BindRoot,
} from "#er0dlx1gtbzh";
import { flash as defaultFlash } from "#33o6e7mug9pg";
import { maybeFireActionSuccessConfetti } from "./confetti.js";
import { handleJson } from "./request.js";
import { actionResponseOk } from "./response.js";
import type { ActionJson, SubmitActionButtonOptions } from "./types.js";

const ACTION_BUTTON_SELECTOR =
  "[data-tbf-submit],[data-tbf-action-url]";
const boundButtons = new WeakMap<HTMLElement, EventListener>();

function buttonUrl(button: HTMLElement, options: SubmitActionButtonOptions) {
  return String(options.url || button.getAttribute("data-tbf-action-url") || "").trim();
}

function buttonMethod(button: HTMLElement, options: SubmitActionButtonOptions) {
  return String(options.method || button.getAttribute("data-tbf-action-method") || "post").toUpperCase();
}

function readButtonBody(button: HTMLElement, options: SubmitActionButtonOptions) {
  if (options.body !== undefined) return options.body;
  return readDataJson<Record<string, unknown>>(button, "data-tbf-action-body", {});
}

function dispatchActionButtonEvent(
  button: HTMLElement,
  name: string,
  detail: Record<string, unknown>,
  cancelable = false,
) {
  const event = new CustomEvent(name, {
    bubbles: true,
    cancelable,
    detail: { ...detail, button },
  });
  button.dispatchEvent(event);
  return event;
}

async function confirmActionButton(
  button: HTMLElement,
  options: SubmitActionButtonOptions,
) {
  const configured = options.confirm === true || button.hasAttribute("data-tbf-confirm");
  if (!configured && !button.hasAttribute("data-tbf-confirm-title")) return true;
  const detail: any = { button, confirm: null };
  const event = dispatchActionButtonEvent(button, "tbf:action-confirm", detail, true);
  if (event.defaultPrevented) return false;
  if (detail.confirm !== null && detail.confirm !== undefined) {
    const value = typeof detail.confirm === "function" ? detail.confirm() : detail.confirm;
    return Boolean(await value);
  }
  const flashApi = options.adapters?.flash || defaultFlash;
  return await flashApi.confirmElement?.(button, button);
}

async function resolveCustomActionButtonRequest(
  button: HTMLElement,
  options: SubmitActionButtonOptions,
) {
  if (typeof options.request === "function") {
    return { handled: true, json: await options.request() };
  }
  const detail: any = { button, handled: false, json: null, request: null };
  const event = dispatchActionButtonEvent(button, "tbf:action-request", detail, true);
  if (!event.defaultPrevented && !detail.handled && detail.request == null) {
    return { handled: false, json: null };
  }
  if (typeof detail.request === "function") {
    return { handled: true, json: await detail.request() };
  }
  if (detail.request && typeof detail.request.then === "function") {
    return { handled: true, json: await detail.request };
  }
  return { handled: true, json: detail.json as ActionJson };
}

async function submitActionButton(
  button: HTMLElement,
  event?: Event,
  options: SubmitActionButtonOptions = {},
) {
  event?.preventDefault();
  event?.stopImmediatePropagation();
  if (!(await confirmActionButton(button, options))) return null;
  const wasDisabled = button.hasAttribute("disabled") || (button as any).disabled === true;
  let json: ActionJson | null = null;
  setControlDisabled(button, true);
  try {
    dispatchActionButtonEvent(button, "tbf:action-submit", {});
    const custom = await resolveCustomActionButtonRequest(button, options);
    json = custom.handled
      ? custom.json
      : await handleJson(buttonUrl(button, options), {
          adapters: options.adapters,
          body: readButtonBody(button, options),
          method: buttonMethod(button, options),
          ui: options.ui,
        });
    const ok = actionResponseOk(json);
    if (ok) maybeFireActionSuccessConfetti(button, options.successConfetti === true);
    dispatchActionButtonEvent(button, "tbf:action-complete", { json, ok });
    return json;
  } catch (error) {
    dispatchActionButtonEvent(button, "tbf:action-complete", {
      error,
      json: null,
      ok: false,
    });
    throw error;
  } finally {
    if (!wasDisabled && options.keepDisabled?.(json) !== true) {
      setControlDisabled(button, false);
    }
  }
}

function bindActionButton(
  button: HTMLElement | null,
  options: SubmitActionButtonOptions = {},
) {
  if (!(button instanceof HTMLElement) || boundButtons.has(button)) return false;
  const handler = (event: Event) => {
    if (!event.defaultPrevented) void submitActionButton(button, event, options);
  };
  button.addEventListener("click", handler);
  boundButtons.set(button, handler);
  return true;
}

function bindActionButtons(root: BindRoot = document, options: SubmitActionButtonOptions = {}) {
  queryAll<HTMLElement>(root, ACTION_BUTTON_SELECTOR).forEach((button) => {
    bindActionButton(button, options);
  });
}

export {
  ACTION_BUTTON_SELECTOR,
  bindActionButton,
  bindActionButtons,
  submitActionButton,
};
