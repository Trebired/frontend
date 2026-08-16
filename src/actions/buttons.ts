import {
  queryAll,
  readBooleanAttribute,
  readDataJson,
  readTextAttribute as readTextAttr,
  setControlDisabled,
  type BindRoot,
} from "#er0dlx1gtbzh";
import { flash as defaultFlash } from "#33o6e7mug9pg";
import { maybeFireActionSuccessConfetti } from "./confetti.js";
import { handleJson } from "./request.js";
import { actionResponseOk, handleConfiguredSuccessAction } from "./response.js";
import type { ActionJson, SubmitActionButtonOptions } from "./types.js";
import { frontendDataAttr, frontendDataSelector, frontendEventName } from "#5vbaqj4pirp3";

const ACTION_BUTTON_SELECTOR =
`${frontendDataSelector("submit")},${frontendDataSelector("action-url")}`;
const boundButtons = new WeakMap<HTMLElement, EventListener>();

function buttonUrl(button: HTMLElement, options: SubmitActionButtonOptions) {
  return String(options.url || button.getAttribute(frontendDataAttr("action-url")) || "").trim();
}

function buttonMethod(button: HTMLElement, options: SubmitActionButtonOptions) {
  return String(options.method || button.getAttribute(frontendDataAttr("action-method")) || "post").toUpperCase();
}

function readButtonBody(button: HTMLElement, options: SubmitActionButtonOptions) {
  if (options.body !== undefined) return options.body;
  return readDataJson<Record<string, unknown>>(button, frontendDataAttr("action-body"), {});
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
  if (options.confirm === false) return true;
  const configured = options.confirm === true || readBooleanAttribute(button, frontendDataAttr("confirm")) === true;
  if (!configured && !button.hasAttribute(frontendDataAttr("confirm-title"))) return true;
  const detail: any = { button, confirm: null };
  const event = dispatchActionButtonEvent(button, frontendEventName("action-confirm"), detail, true);
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
  const event = dispatchActionButtonEvent(button, frontendEventName("action-request"), detail, true);
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

function buttonUi(button: HTMLElement, options: SubmitActionButtonOptions) {
  const attrUi = readDataJson<Record<string, unknown>>(button, frontendDataAttr("action-ui"), {});
  const ignoreResponseAction =
  options.ignoreResponseAction === true ||
    options.ui?.ignoreResponseAction === true ||
    attrUi.ignoreResponseAction === true ||
    readBooleanAttribute(button, frontendDataAttr("ignore-response-action")) === true;
  return {
    ...attrUi,
    ...(options.ui || {}),
    ignoreResponseAction,
  };
}

function buttonSuccessConfig(button: HTMLElement, options: SubmitActionButtonOptions) {
  return {
    success:
    options.success ||
      (readTextAttr(button, frontendDataAttr("success")) === "soft-reload"
      ? "soft-reload"
      : undefined),
    successTab: options.successTab || readTextAttr(button, frontendDataAttr("success-tab")),
  };
}

function buttonSuccessConfetti(button: HTMLElement, options: SubmitActionButtonOptions) {
  return options.successConfetti === true || readBooleanAttribute(button, frontendDataAttr("confetti")) === true;
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
  const ui = buttonUi(button, options);
  setControlDisabled(button, true);
  try {
    dispatchActionButtonEvent(button, frontendEventName("action-submit"), {});
    const custom = await resolveCustomActionButtonRequest(button, options);
    json = custom.handled
    ? custom.json
    : await handleJson(buttonUrl(button, options), {
        adapters: options.adapters,
        body: readButtonBody(button, options),
        method: buttonMethod(button, options),
        ui,
    });
    const ok = actionResponseOk(json);
    if (ok) {
      maybeFireActionSuccessConfetti(button, buttonSuccessConfetti(button, options));
      handleConfiguredSuccessAction(
        buttonSuccessConfig(button, options),
        json,
        ui,
        options.adapters,
      );
    }
    dispatchActionButtonEvent(button, frontendEventName("action-complete"), { json, ok });
    return json;
  } catch (error) {
    dispatchActionButtonEvent(button, frontendEventName("action-complete"), {
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
