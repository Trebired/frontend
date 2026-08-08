import {
  formDataFlatRecord,
  formDataSearchParams,
  queryAll,
  readDataJson,
  readElementJson,
  setControlDisabled,
  type BindRoot,
} from "#er0dlx1gtbzh";
import { ensureFormCsrfToken } from "#v1p6uw62hhsf";
import { flash as defaultFlash } from "#33o6e7mug9pg";
import { maybeFireActionSuccessConfetti } from "./confetti.js";
import { handleJson } from "./request.js";
import { actionResponseOk, handleConfiguredSuccessAction } from "./response.js";
import type {
  ActionJson,
  SubmitActionFormOptions,
} from "./types.js";

const ACTION_FORM_SELECTOR = "form[data-tbf-action]";
const ACTION_CONFIG_SELECTOR =
  'script[type="application/json"][data-tbf-action-config]';
const boundForms = new WeakMap<HTMLFormElement, EventListener>();

function submitterFor(event?: SubmitEvent) {
  return event?.submitter instanceof HTMLElement ? event.submitter : null;
}

function submitterAttr(submitter: HTMLElement | null, attr: string) {
  return String(submitter?.getAttribute(attr) || "").trim();
}

function readActionFormConfig(form: HTMLFormElement) {
  return {
    ...readElementJson<Record<string, unknown>>(form, ACTION_CONFIG_SELECTOR, {}),
    ...readDataJson<Record<string, unknown>>(form, "data-tbf-action-config", {}),
  };
}

function truthyAttr(element: HTMLElement, attr: string) {
  if (!element.hasAttribute(attr)) return false;
  const value = String(element.getAttribute(attr) || "").trim();
  return value !== "false" && value !== "0";
}

function resolveSubmitAction(form: HTMLFormElement, submitter: HTMLElement | null) {
  return submitterAttr(submitter, "formaction") || form.action;
}

function resolveSubmitMethod(form: HTMLFormElement, submitter: HTMLElement | null) {
  return (
    submitterAttr(submitter, "formmethod") ||
    String(form.getAttribute("method") || form.method || "post")
  ).toUpperCase();
}

function resolveSubmitEnctype(form: HTMLFormElement, submitter: HTMLElement | null) {
  return (
    submitterAttr(submitter, "formenctype") ||
    String(form.getAttribute("enctype") || form.enctype || "")
  ).toLowerCase();
}

function formDataFromSubmit(form: HTMLFormElement, submitter: HTMLElement | null) {
  const data = new FormData(form);
  if (
    submitter instanceof HTMLButtonElement &&
    submitter.name &&
    submitter.value &&
    !data.has(submitter.name)
  ) {
    data.append(submitter.name, submitter.value);
  }
  return data;
}

function createSubmitBody(
  form: HTMLFormElement,
  submitter: HTMLElement | null,
  config: Record<string, unknown>,
) {
  const data = formDataFromSubmit(form, submitter);
  if (config.body === "json") return formDataFlatRecord(data);
  return resolveSubmitEnctype(form, submitter) === "multipart/form-data"
    ? data
    : formDataSearchParams(data);
}

function dispatchActionFormEvent(
  form: HTMLFormElement,
  name: string,
  detail: Record<string, unknown>,
  cancelable = false,
) {
  const event = new CustomEvent(name, {
    bubbles: true,
    cancelable,
    detail: { ...detail, form },
  });
  form.dispatchEvent(event);
  return event;
}

async function confirmActionForm(
  form: HTMLFormElement,
  submitter: HTMLElement | null,
  options: SubmitActionFormOptions,
) {
  const configured = options.confirm === true || truthyAttr(form, "data-tbf-confirm");
  if (options.confirm === false) return true;
  if (!configured && !form.hasAttribute("data-tbf-confirm-title")) return true;
  const detail: any = { confirm: null, form, submitter };
  const event = dispatchActionFormEvent(form, "tbf:action-confirm", detail, true);
  if (event.defaultPrevented) return false;
  if (detail.confirm !== null && detail.confirm !== undefined) {
    const value = typeof detail.confirm === "function" ? detail.confirm() : detail.confirm;
    return Boolean(await value);
  }
  const flashApi = options.adapters?.flash || defaultFlash;
  return await flashApi.confirmElement?.(submitter, form);
}

async function resolveCustomActionFormRequest(
  form: HTMLFormElement,
  submitter: HTMLElement | null,
  options: SubmitActionFormOptions,
) {
  if (typeof options.request === "function") {
    return { handled: true, json: await options.request(form, submitter) };
  }
  const detail: any = { form, handled: false, json: null, request: null, submitter };
  const event = dispatchActionFormEvent(form, "tbf:action-request", detail, true);
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

function formUi(options: SubmitActionFormOptions, config: Record<string, unknown>) {
  return {
    ...(options.ui || {}),
    flashErrorOnly:
      options.ui?.flashErrorOnly === true ||
      options.ui?.flash_error_only === true ||
      config.flashErrorOnly === true ||
      config.flash_error_only === true,
    ignoreResponseAction:
      options.ui?.ignoreResponseAction === true ||
      options.ignoreResponseAction === true ||
      config.ignoreResponseAction === true,
    silent: options.ui?.silent === true || config.silent === true,
  };
}

function formSuccessConfig(options: SubmitActionFormOptions, config: Record<string, unknown>) {
  return {
    lifecycle: options.lifecycle === true || config.lifecycle === true,
    success: options.success || config.success,
    successTab: options.successTab || config.successTab,
  };
}

async function submitActionForm(
  form: HTMLFormElement,
  event?: SubmitEvent,
  options: SubmitActionFormOptions = {},
) {
  event?.preventDefault();
  event?.stopImmediatePropagation();
  const submitter = submitterFor(event);
  if (!(await confirmActionForm(form, submitter, options))) return null;
  const config = readActionFormConfig(form);
  const ui = formUi(options, config);
  setControlDisabled(submitter, true);
  try {
    ensureFormCsrfToken(form);
    options.beforeSubmit?.(form, submitter);
    dispatchActionFormEvent(form, "tbf:action-submit", { submitter });
    const custom = await resolveCustomActionFormRequest(form, submitter, options);
    const json = custom.handled
      ? custom.json
      : await handleJson(
          resolveSubmitAction(form, submitter),
          {
            adapters: options.adapters,
            body: createSubmitBody(form, submitter, config),
            method: resolveSubmitMethod(form, submitter),
            ui,
          },
          ui,
        );
    const ok = actionResponseOk(json);
    if (ok) {
      maybeFireActionSuccessConfetti(
        submitter || form,
        config.successConfetti === true,
      );
      handleConfiguredSuccessAction(
        formSuccessConfig(options, config),
        json,
        ui,
        options.adapters,
      );
    }
    options.onComplete?.(ok, json);
    dispatchActionFormEvent(form, "tbf:action-complete", { json, ok, submitter });
    return json;
  } catch (error) {
    options.onComplete?.(false, { ok: false });
    dispatchActionFormEvent(form, "tbf:action-complete", {
      error,
      json: null,
      ok: false,
      submitter,
    });
    throw error;
  } finally {
    setControlDisabled(submitter, false);
  }
}

function bindActionForm(
  form: HTMLFormElement | null,
  options: SubmitActionFormOptions = {},
) {
  if (!(form instanceof HTMLFormElement) || boundForms.has(form)) return false;
  const handler = ((event: SubmitEvent) => {
    void submitActionForm(form, event, options);
  }) as EventListener;
  form.addEventListener("submit", handler, true);
  boundForms.set(form, handler);
  return true;
}

function bindActionForms(root: BindRoot = document, options: SubmitActionFormOptions = {}) {
  queryAll<HTMLFormElement>(root, ACTION_FORM_SELECTOR).forEach((form) => {
    bindActionForm(form, options);
  });
}

export {
  ACTION_CONFIG_SELECTOR,
  ACTION_FORM_SELECTOR,
  bindActionForm,
  bindActionForms,
  readActionFormConfig,
  submitActionForm,
};
